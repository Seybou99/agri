import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

/** Taille max du data URI (Firestore ~1 Mo / document). */
const MAX_DATA_URI_LENGTH = 750_000;

/**
 * Ouvre la galerie, compresse l'image et retourne un data URI JPEG (base64).
 * Pas de Firebase Storage requis.
 */
export async function pickProductImageAsDataUri(): Promise<string> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Autorisez l’accès à la galerie pour ajouter une photo.');
  }

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (picked.canceled || !picked.assets[0]?.uri) {
    throw new Error('Sélection annulée.');
  }

  const compressed = await ImageManipulator.manipulateAsync(
    picked.assets[0].uri,
    [{ resize: { width: 720 } }],
    {
      compress: 0.6,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!compressed.base64) {
    throw new Error('Impossible de compresser l’image.');
  }

  const dataUri = `data:image/jpeg;base64,${compressed.base64}`;
  if (dataUri.length > MAX_DATA_URI_LENGTH) {
    throw new Error(
      'Photo trop lourde. Choisissez une image plus petite ou recadrez davantage.'
    );
  }

  return dataUri;
}
