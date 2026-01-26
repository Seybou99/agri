// Service pour récupérer les données climatiques via NASA POWER API
// Doc : https://power.larc.nasa.gov/docs/services/api/
// Daily API : https://power.larc.nasa.gov/docs/services/api/temporal/daily/
// Référence projet : docs/APIS_DONNEES.md
// Cette fonction sera appelée depuis une Cloud Function

export interface ClimateData {
  annualRainfall: number; // mm/an
  averageTemperature: number; // °C
  temperatureRange: {
    min: number;
    max: number;
  };
  monthlyRainfall: number[]; // mm par mois (12 valeurs)
  degreeDays: number; // Somme des températures
}

const DEFAULT_CLIMATE: ClimateData = {
  annualRainfall: 800,
  averageTemperature: 28,
  temperatureRange: { min: 20, max: 38 },
  monthlyRainfall: new Array(12).fill(67),
  degreeDays: 2000,
};

/**
 * Récupère les données climatiques pour une coordonnée donnée.
 * Utilise l'API NASA POWER Temporal Daily (community=AG).
 * En cas d'erreur (422, 429, 500, 503) ou d'exception : fallback sur valeurs par défaut (Mali).
 */
export async function fetchClimateData(lat: number, lng: number): Promise<ClimateData> {
  const baseUrl = 'https://power.larc.nasa.gov/api/temporal/daily/point';
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 5);
  const start = startDate.toISOString().slice(0, 10).replace(/-/g, '');
  const end = endDate.toISOString().slice(0, 10).replace(/-/g, '');

  const params = new URLSearchParams({
    parameters: 'PRECTOTCORR,T2M_MAX,T2M_MIN,T2M',
    community: 'AG',
    latitude: String(lat),
    longitude: String(lng),
    start,
    end,
    format: 'JSON',
  });
  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`NASA POWER API ${response.status}: ${response.statusText}`);
      return DEFAULT_CLIMATE;
    }
    const data = await response.json();
    const properties = data.properties?.parameter || {};
    const precipitation = properties.PRECTOTCORR || {};
    const tempMax = properties.T2M_MAX || {};
    const tempMin = properties.T2M_MIN || {};
    const tempAvg = properties.T2M || {};

    const precipValues = Object.values(precipitation) as number[];
    const tempMaxValues = Object.values(tempMax) as number[];
    const tempMinValues = Object.values(tempMin) as number[];
    const tempAvgValues = Object.values(tempAvg) as number[];

    const FILL = -999;
    const validPrecip = precipValues
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n) && n !== FILL && n >= 0);
    const totalPrecip = validPrecip.reduce((s, v) => s + v, 0);
    const years = Math.max(1, Math.floor(validPrecip.length / 365));
    const annualRainfall =
      validPrecip.length > 0 ? Math.round(totalPrecip / years) : DEFAULT_CLIMATE.annualRainfall;
    const avgTemp =
      tempAvgValues.length ?
        tempAvgValues.reduce((s, v) => s + (Number(v) || 0), 0) / tempAvgValues.length
      : DEFAULT_CLIMATE.averageTemperature;
    const validMin = tempMinValues.filter((v) => v != null && !Number.isNaN(Number(v)));
    const validMax = tempMaxValues.filter((v) => v != null && !Number.isNaN(Number(v)));
    const minTemp = validMin.length ? Math.min(...validMin.map(Number)) : DEFAULT_CLIMATE.temperatureRange.min;
    const maxTemp = validMax.length ? Math.max(...validMax.map(Number)) : DEFAULT_CLIMATE.temperatureRange.max;

    const precipNums = precipValues.map((v) => {
      const n = Number(v);
      if (Number.isNaN(n) || n === FILL || n < 0) return 0;
      return n;
    });
    const monthlyRainfall = precipNums.length ? calculateMonthlyAverage(precipNums) : DEFAULT_CLIMATE.monthlyRainfall;
    const degreeDays = tempAvgValues.length ? calculateDegreeDays(tempAvgValues.map((v) => Number(v) || 0), 10) : DEFAULT_CLIMATE.degreeDays;

    return {
      annualRainfall: Math.round(annualRainfall),
      averageTemperature: Math.round(avgTemp * 10) / 10,
      temperatureRange: {
        min: Math.round(minTemp * 10) / 10,
        max: Math.round(maxTemp * 10) / 10,
      },
      monthlyRainfall,
      degreeDays: Math.round(degreeDays),
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données climatiques:', error);
    return DEFAULT_CLIMATE;
  }
}

/**
 * Calcule la moyenne mensuelle de pluviométrie
 */
function calculateMonthlyAverage(dailyValues: number[]): number[] {
  const monthly: number[] = new Array(12).fill(0);
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  let dayIndex = 0;
  for (let month = 0; month < 12; month++) {
    let monthTotal = 0;
    const days = daysPerMonth[month];
    for (let day = 0; day < days && dayIndex < dailyValues.length; day++) {
      monthTotal += dailyValues[dayIndex] || 0;
      dayIndex++;
    }
    monthly[month] = Math.round(monthTotal / days);
  }
  
  return monthly;
}

/**
 * Calcule les degrés-jours (somme des températures au-dessus d'une base)
 */
function calculateDegreeDays(temperatures: number[], baseTemp: number): number {
  return temperatures.reduce((sum, temp) => {
    const diff = temp - baseTemp;
    return sum + (diff > 0 ? diff : 0);
  }, 0);
}
