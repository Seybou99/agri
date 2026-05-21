import type { UserRole } from '@models/User';

export const USER_ROLES: UserRole[] = ['utilisateur', 'agriculteur', 'administrateur'];

/** Rôles choisissables à l'inscription (admin réservé au back-office). */
export const SIGNUP_ROLES: UserRole[] = ['utilisateur', 'agriculteur'];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  utilisateur: 'Utilisateur',
  agriculteur: 'Agriculteur',
  administrateur: 'Administrateur',
};
