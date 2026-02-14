/**
 * Retour haptique simple pour les boutons principaux (Phase 0 - UX inclusive).
 * Utilise l'API native Vibration (Android) ; sur iOS peut être silencieux selon l'appareil.
 */

import { Platform, Vibration } from 'react-native';

const FEEDBACK_DURATION_MS = 50;

export function triggerHaptic(): void {
  if (Platform.OS === 'android') {
    Vibration.vibrate(FEEDBACK_DURATION_MS);
  }
  // iOS : Vibration n'est pas garanti ; on pourrait ajouter expo-haptics plus tard pour ImpactFeedbackStyle.Light
}
