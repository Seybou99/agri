/** Hauteur icônes + libellés de la tab bar client (sans safe area). */
export const BUYER_TAB_BAR_CONTENT_HEIGHT = 52;

export function getBuyerTabBarTotalHeight(bottomInset: number): number {
  return BUYER_TAB_BAR_CONTENT_HEIGHT + Math.max(bottomInset, 0);
}
