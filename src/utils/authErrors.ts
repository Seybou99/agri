/** Messages d'erreur Firebase Auth en français. */
export function mapFirebaseAuthError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Cette adresse e-mail est déjà utilisée.';
    case 'auth/invalid-email':
      return 'Adresse e-mail invalide.';
    case 'auth/operation-not-allowed':
      return 'Cette méthode de connexion n\'est pas activée.';
    case 'auth/weak-password':
      return 'Mot de passe trop faible (6 caractères minimum).';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez plus tard.';
    case 'auth/network-request-failed':
      return 'Problème réseau. Vérifiez votre connexion.';
    case 'permission-denied':
      return 'Accès Firestore refusé. Déployez les règles firestore.rules dans Firebase Console.';
    case 'auth/popup-closed-by-user':
      return 'Connexion Google annulée.';
    default:
      return 'Une erreur est survenue. Réessayez.';
  }
}

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code) return mapFirebaseAuthError(code);
  if (error instanceof Error && error.message) return error.message;
  return 'Une erreur est survenue.';
}
