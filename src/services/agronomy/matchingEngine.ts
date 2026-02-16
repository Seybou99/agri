// Moteur de matching : Compare les données du terrain avec les besoins de la plante
// C'est le cœur de l'algorithme de calcul du score d'aptitude

import { PlantRequirements } from '@models/Plant';
import { SoilData } from './soilService';
import { ClimateData } from './climateService';
import { DiagnosticResults, SuitabilityLevel } from '@models/Diagnostic';

/** Heure et méthode d'arrosage recommandées par culture (pour les Notes). */
const IRRIGATION_ADVICE: Record<string, { time: string; method: string }> = {
  Oignon: { time: 'Tôt le matin (6h–9h) ou en fin de journée (17h–19h)', method: 'Goutte-à-goutte ou goutteurs au pied ; éviter de mouiller le feuillage pour limiter les maladies.' },
  Tomate: { time: 'Matin (6h–10h) ou soir (17h–19h)', method: 'Goutte-à-goutte de préférence ; aspersion légère possible en refroidissement, sans mouiller le feuillage.' },
  Maïs: { time: 'Tôt le matin (5h–9h) ; critique au stade floraison–grain laiteux', method: 'Goutte-à-goutte ou sillons ; éviter l\'aspersion en plein soleil.' },
  Riz: { time: 'Gestion du niveau d\'eau en continu ; renouvellement matin ou soir en cas de refroidissement', method: 'Inondation contrôlée ou bassin ; éviter les à-coups de niveau.' },
  Arachide: { time: 'Matin (6h–9h) ou fin d\'après-midi (16h–18h)', method: 'Goutte-à-goutte ou arrosage au pied ; sol bien drainant, pas d\'eau stagnante.' },
  Coton: { time: 'Tôt le matin (5h–9h) ou soir (17h–19h)', method: 'Goutte-à-goutte ou sillons ; irrigation régulière en floraison et ouverture des capsules.' },
  Gombo: { time: 'Matin (6h–9h) ou soir (17h–19h)', method: 'Goutte-à-goutte ou arrosage au pied ; sol maintenu frais sans excès.' },
  Poivron: { time: 'Matin (6h–10h) ou fin d\'après-midi (16h–18h)', method: 'Goutte-à-goutte recommandé ; éviter de mouiller les feuilles pour limiter mildiou.' },
};

function addIrrigationAdvice(plant: PlantRequirements, recommendations: string[]): void {
  const advice = IRRIGATION_ADVICE[plant.name];
  if (!advice) return;
  const line = `Pour ${plant.name} : ${advice.time}. ${advice.method}`;
  if (!recommendations.includes(line)) recommendations.push(line);
}

export interface MatchingResult {
  score: number; // Score de 0 à 10
  suitability: SuitabilityLevel;
  alerts: string[];
  recommendations: string[];
  details: {
    soilScore: number;
    climateScore: number;
    waterScore: number;
  };
}

/**
 * Calcule le score d'aptitude d'un terrain pour une culture donnée
 */
export function calculateSuitabilityScore(
  plantRequirements: PlantRequirements,
  soilData: SoilData,
  climateData: ClimateData
): MatchingResult {
  const alerts: string[] = [];
  const recommendations: string[] = [];
  
  // 1. Score du sol (40% du score total)
  const soilScore = calculateSoilScore(plantRequirements, soilData, alerts, recommendations);
  
  // 2. Score climatique (40% du score total)
  const climateScore = calculateClimateScore(plantRequirements, climateData, alerts, recommendations);
  
  // 3. Score hydrique (20% du score total)
  const waterScore = calculateWaterScore(plantRequirements, climateData, alerts, recommendations);
  
  // Score final pondéré
  const finalScore = (soilScore * 0.4) + (climateScore * 0.4) + (waterScore * 0.2);
  
  // Déterminer le niveau d'aptitude
  let suitability: SuitabilityLevel;
  if (finalScore >= 8) {
    suitability = 'Very High';
  } else if (finalScore >= 6.5) {
    suitability = 'High';
  } else if (finalScore >= 5) {
    suitability = 'Medium';
  } else {
    suitability = 'Low';
  }
  
  return {
    score: Math.round(finalScore * 10) / 10,
    suitability,
    alerts,
    recommendations,
    details: {
      soilScore: Math.round(soilScore * 10) / 10,
      climateScore: Math.round(climateScore * 10) / 10,
      waterScore: Math.round(waterScore * 10) / 10,
    },
  };
}

/**
 * Calcule le score du sol (0-10)
 */
function calculateSoilScore(
  plant: PlantRequirements,
  soil: SoilData,
  alerts: string[],
  recommendations: string[]
): number {
  let score = 10;
  
  // Vérifier le pH
  if (soil.ph < plant.soil.phMin || soil.ph > plant.soil.phMax) {
    const diff = Math.min(
      Math.abs(soil.ph - plant.soil.phMin),
      Math.abs(soil.ph - plant.soil.phMax)
    );
    score -= diff * 2; // Pénalité pour pH hors de la plage optimale
    alerts.push(`pH du sol (${soil.ph.toFixed(1)}) hors de la plage optimale pour ${plant.name}`);
    recommendations.push(`Amender le sol pour ajuster le pH entre ${plant.soil.phMin} et ${plant.soil.phMax}`);
  }
  
  // Vérifier la texture
  const preferredTextures = plant.soil.preferredTexture.split('-');
  const soilTextureMatches = preferredTextures.some(t => 
    soil.texture.toLowerCase().includes(t.toLowerCase())
  );
  
  if (!soilTextureMatches) {
    score -= 2;
    alerts.push(`Texture du sol (${soil.texture}) non optimale pour ${plant.name}`);
    recommendations.push(`Considérer un amendement du sol pour améliorer la texture`);
  }
  
  // Vérifier le drainage
  if (plant.soil.drainage === 'bon' && soil.texture.includes('argileux')) {
    score -= 1.5;
    alerts.push('Risque de mauvais drainage sur sol argileux');
    recommendations.push('Prévoir un système de drainage ou des buttes');
  }
  
  // Vérifier la matière organique
  if (soil.organicCarbon < 1.0) {
    score -= 1;
    recommendations.push('Apport de matière organique recommandé (fumier, compost)');
  }
  
  return Math.max(0, Math.min(10, score));
}

/**
 * Calcule le score climatique (0-10)
 */
function calculateClimateScore(
  plant: PlantRequirements,
  climate: ClimateData,
  alerts: string[],
  recommendations: string[]
): number {
  let score = 10;
  
  // Vérifier la température moyenne
  if (climate.averageTemperature < plant.climate.tempMin || 
      climate.averageTemperature > plant.climate.tempMax) {
    score -= 2;
    alerts.push(`Température moyenne (${climate.averageTemperature}°C) hors de la plage optimale`);
  }
  
  // Vérifier les températures extrêmes
  if (climate.temperatureRange.max > plant.climate.tempMax + 5) {
    score -= 1.5;
    alerts.push(`Risque de stress thermique (températures jusqu'à ${climate.temperatureRange.max}°C)`);
    recommendations.push('Prévoir une irrigation de refroidissement ou ombrage');
    addIrrigationAdvice(plant, recommendations);
  }
  
  // Vérifier la température nocturne (si spécifiée et donnée valide : pas de valeur manquante type -999)
  const nightTemp = climate.temperatureRange.min;
  const isNightTempValid = nightTemp > -100 && nightTemp < 60 && Number.isFinite(nightTemp);
  if (plant.climate.tempIdealNight && isNightTempValid) {
    if (nightTemp < plant.climate.tempIdealNight.min ||
        nightTemp > plant.climate.tempIdealNight.max) {
      score -= 1;
      alerts.push(`Température nocturne (${nightTemp}°C) non optimale pour la bulbaison/floraison`);
    }
  }
  
  // Vérifier les degrés-jours (si spécifié)
  if (plant.climate.degreeDays && climate.degreeDays < plant.climate.degreeDays * 0.8) {
    score -= 1;
    alerts.push('Somme de températures insuffisante pour un cycle complet');
  }
  
  return Math.max(0, Math.min(10, score));
}

/**
 * Calcule le score hydrique (0-10)
 */
function calculateWaterScore(
  plant: PlantRequirements,
  climate: ClimateData,
  alerts: string[],
  recommendations: string[]
): number {
  let score = 10;
  
  // Vérifier la pluviométrie annuelle
  if (climate.annualRainfall < plant.climate.rainfallMin) {
    const deficit = plant.climate.rainfallMin - climate.annualRainfall;
    score -= (deficit / plant.climate.rainfallMin) * 5;
    alerts.push(`Pluviométrie insuffisante (${climate.annualRainfall}mm/an, minimum requis: ${plant.climate.rainfallMin}mm)`);
    recommendations.push('Irrigation complémentaire obligatoire');
    addIrrigationAdvice(plant, recommendations);
  } else if (plant.climate.rainfallMax && climate.annualRainfall > plant.climate.rainfallMax) {
    score -= 1;
    alerts.push(`Pluviométrie élevée (${climate.annualRainfall}mm/an), risque d'excès d'eau`);
    recommendations.push('Prévoir un système de drainage');
  }
  
  // Vérifier les besoins en eau
  if (plant.waterNeeds === 'élevé' && climate.annualRainfall < plant.climate.rainfallMin * 1.2) {
    score -= 1;
    recommendations.push('Irrigation régulière nécessaire pendant la croissance');
    addIrrigationAdvice(plant, recommendations);
  }
  
  return Math.max(0, Math.min(10, score));
}
