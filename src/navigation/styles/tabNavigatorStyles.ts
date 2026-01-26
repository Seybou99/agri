import { StyleSheet } from 'react-native';

/**
 * Couleurs de la barre de navigation flottante (style pilule).
 * Fond vert foncé, cercle actif vert clair, icônes inactives blanc cassé.
 */
export const tabBarColors = {
  /** Fond de la barre (vert très foncé) */
  background: '#0F3D2E',
  /** Cercle derrière l'icône active (vert clair vif) */
  activeCircle: '#B6F36B',
  /** Icône à l'intérieur du cercle actif (contraste sur vert clair) */
  activeIcon: '#0F3D2E',
  /** Icônes inactives (blanc cassé / vert très clair, sans fond) */
  inactiveIcon: 'rgba(232, 245, 233, 0.95)',
};

/** Taille du cercle actif (doit rester dans la barre, pas de débordement) */
export const ACTIVE_CIRCLE_SIZE = 48;

/** Rayon du cercle = demi-taille */
const ACTIVE_CIRCLE_RADIUS = ACTIVE_CIRCLE_SIZE / 2;

/** Hauteur de la barre */
const TAB_BAR_HEIGHT = 64;

/** Margin bottom pour l'effet flottant */
const TAB_BAR_MARGIN_BOTTOM = 16;

/** Marges horizontales (espace à gauche et à droite) */
const TAB_BAR_MARGIN_HORIZONTAL = 16;

/** BorderRadius pilule (très arrondi) */
const TAB_BAR_BORDER_RADIUS = 9999;

export const tabNavigatorStyles = StyleSheet.create({
  /** Conteneur externe : positionnement en bas avec marges (flottant) */
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: TAB_BAR_MARGIN_HORIZONTAL,
    paddingBottom: TAB_BAR_MARGIN_BOTTOM,
  },

  /** Barre pilule : fond vert foncé, forme très arrondie */
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 480,
    height: TAB_BAR_HEIGHT,
    backgroundColor: tabBarColors.background,
    borderRadius: TAB_BAR_BORDER_RADIUS,
    paddingHorizontal: 8,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  /** Zone cliquable de chaque onglet (flex égal) */
  tabZone: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /** Cercle vert clair derrière l'icône active (ne dépasse pas la barre) */
  activeCircle: {
    width: ACTIVE_CIRCLE_SIZE,
    height: ACTIVE_CIRCLE_SIZE,
    borderRadius: ACTIVE_CIRCLE_RADIUS,
    backgroundColor: tabBarColors.activeCircle,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { TAB_BAR_MARGIN_BOTTOM, TAB_BAR_MARGIN_HORIZONTAL, TAB_BAR_HEIGHT };
