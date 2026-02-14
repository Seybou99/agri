// Hook pour gérer les diagnostics
import { useState } from 'react';
import { Diagnostic, DiagnosticStatus, Coordinates } from '@models/Diagnostic';
import { PLANTS_REQUIREMENTS, getMoisRecolte } from '@constants/plants';
import { fetchSoilData, fetchClimateData } from '@services/agronomy';
import { calculateSuitabilityScore } from '@services/agronomy/matchingEngine';

interface CreateDiagnosticParams {
  culture: string;
  surface: number;
  coordinates: Coordinates;
  locationName: string;
}

export function useDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createDiagnostic = async (params: CreateDiagnosticParams): Promise<Diagnostic> => {
    setLoading(true);
    setError(null);

    try {
      // Vérifier que la culture existe
      const plantRequirements = PLANTS_REQUIREMENTS[params.culture];
      if (!plantRequirements) {
        throw new Error(`Culture "${params.culture}" non supportée`);
      }

      // Récupérer les données de sol et climat
      const [soilData, climateData] = await Promise.all([
        fetchSoilData(params.coordinates.lat, params.coordinates.lng),
        fetchClimateData(params.coordinates.lat, params.coordinates.lng),
      ]);

      // Calculer le score d'aptitude
      const matchingResult = calculateSuitabilityScore(
        plantRequirements,
        soilData,
        climateData
      );

      // Créer l'objet Diagnostic
      const diagnostic: Diagnostic = {
        id: `diag_${Date.now()}`,
        userId: '', // Sera rempli par le service Firebase
        culture: params.culture,
        surface: params.surface,
        coordinates: params.coordinates,
        locationName: params.locationName,
        status: 'pending' as DiagnosticStatus,
        results: {
          score: matchingResult.score,
          soilType: soilData.texture,
          ph: soilData.ph,
          suitability: matchingResult.suitability,
          alerts: matchingResult.alerts,
          recommendations: matchingResult.recommendations,
          generatedAt: new Date(),
          soilData: {
            texture: soilData.texture,
            organicCarbon: soilData.organicCarbon,
            nitrogen: soilData.nitrogen,
            phosphorus: soilData.phosphorus,
            potassium: soilData.potassium,
          },
          climateData: {
            annualRainfall: climateData.annualRainfall,
            averageTemperature: climateData.averageTemperature,
            temperatureRange: climateData.temperatureRange,
          },
          yieldEstimate: {
            min: plantRequirements.yieldRange.min,
            max: plantRequirements.yieldRange.max,
            average: (plantRequirements.yieldRange.min + plantRequirements.yieldRange.max) / 2,
          },
          calendar: {
            optimalPlantingStart: plantRequirements.growingSeason.start,
            optimalPlantingEnd:
              plantRequirements.growingSeason.cycleLengthMonths != null && plantRequirements.growingSeason.start
                ? getMoisRecolte(plantRequirements.growingSeason.start, plantRequirements.growingSeason.cycleLengthMonths)
                : plantRequirements.growingSeason.end ?? '–',
            harvestPeriod: 'À déterminer selon la variété',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setLoading(false);
      return diagnostic;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la création du diagnostic');
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  return {
    createDiagnostic,
    loading,
    error,
  };
}
