import type { UserRole } from '@models/User';

/** Rôles autorisés à publier des produits sur le marché. */
export const MARKETPLACE_SELLER_ROLES: UserRole[] = ['agriculteur', 'administrateur'];

export function canSellOnMarketplace(role: UserRole | undefined): boolean {
  return role != null && MARKETPLACE_SELLER_ROLES.includes(role);
}
