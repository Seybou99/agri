import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import type { DiseaseImagePayload } from '@services/plantnetDiseasesApi';

const MAX_IMAGES = 3;

export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

export interface PlantPhotoCapture {
  payload: DiseaseImagePayload;
  previewUri: string;
}

export async function capturePlantPhoto(): Promise<PlantPhotoCapture | null> {
  const granted = await requestCameraPermission();
  if (!granted) {
    throw new Error('Autorisez l’accès à la caméra pour photographier la plante.');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return compressForPlantNet(result.assets[0].uri);
}

export async function pickPlantPhotoFromGallery(): Promise<PlantPhotoCapture | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Autorisez l’accès à la galerie.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return compressForPlantNet(result.assets[0].uri);
}

async function compressForPlantNet(uri: string): Promise<PlantPhotoCapture> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1280 } }],
    {
      compress: 0.75,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!manipulated.base64) {
    throw new Error('Impossible de préparer l’image.');
  }

  return {
    previewUri: manipulated.uri,
    payload: {
      base64: `data:image/jpeg;base64,${manipulated.base64}`,
      mimeType: 'image/jpeg',
    },
  };
}

export const MAX_PLANT_DISEASE_IMAGES = MAX_IMAGES;
