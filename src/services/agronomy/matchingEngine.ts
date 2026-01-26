// Moteur de matching : Compare les données du terrain avec les besoins de la plante
// C'est le cœur de l'algorithme de calcul du score d'aptitude

import { PlantRequirements } from '@models/Plant';
import { SoilData } from './soilService';
import { ClimateData } from './climateService';
import { DiagnosticResults, SuitabilityLevel } from '@models/Diagnostic';

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
  }
  
  // Vérifier la température nocturne (si spécifiée)
  if (plant.climate.tempIdealNight) {
    const nightTemp = climate.temperatureRange.min;
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
  } else if (plant.climate.rainfallMax && climate.annualRainfall > plant.climate.rainfallMax) {
    score -= 1;
    alerts.push(`Pluviométrie élevée (${climate.annualRainfall}mm/an), risque d'excès d'eau`);
    recommendations.push('Prévoir un système de drainage');
  }
  
  // Vérifier les besoins en eau
  if (plant.waterNeeds === 'élevé' && climate.annualRainfall < plant.climate.rainfallMin * 1.2) {
    score -= 1;
    recommendations.push('Irrigation régulière nécessaire pendant la croissance');
  }
  
  return Math.max(0, Math.min(10, score));
}
