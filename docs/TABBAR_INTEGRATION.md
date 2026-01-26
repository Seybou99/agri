# Intégration de la barre de navigation flottante

## Vue d’ensemble

Barre de navigation inférieure type **pilule flottante** :

- **Flottante** : `marginBottom` + `marginHorizontal`, espace en bas, à gauche et à droite.
- **Pilule** : `borderRadius` élevé, forme très arrondie.
- **Fond** : vert foncé `#0F3D2E`.
- **Onglet actif** : icône dans un **cercle** vert clair `#B6F36B`, légèrement plus grande.
- **Onglets inactifs** : icônes blanc cassé, sans fond.
- **Animation** : transition douce au changement d’onglet (spring + `LayoutAnimation`).
- Le cercle actif reste **à l’intérieur** de la barre (`overflow: 'hidden'`).

## Fichiers concernés

| Fichier | Rôle |
|--------|------|
| `src/navigation/styles/tabNavigatorStyles.ts` | Couleurs, dimensions, styles (StyleSheet) |
| `src/navigation/components/CustomTabBar.tsx` | TabBar personnalisée + `TabBarItem` avec animation |
| `src/navigation/components/TabIcons.tsx` | Icônes SVG (Home, Diagnostic, Marketplace, Academy) |
| `src/navigation/TabNavigator.tsx` | `createBottomTabNavigator` + `tabBar={(p) => <CustomTabBar {...p} />}` |

## Intégration dans l’app

1. **`App.tsx`** : envelopper l’app avec `SafeAreaProvider` (pour `useSafeAreaInsets` dans la TabBar).

2. **`AppNavigator`** : Stack dont un écran est `TabNavigator`.

3. **`TabNavigator`** :  
   - `Tab.Navigator` avec `tabBar={(props) => <CustomTabBar {...props} />}`  
   - Chaque `Tab.Screen` avec `tabBarIcon: ({ color, size }) => <XxxIcon color={color} size={size} />`.

4. **Écrans avec scroll** : ajouter un `paddingBottom` au `contentContainerStyle` (ex. `100`) pour éviter que le contenu passe sous la barre flottante.

## Constantes exportées

Depuis `tabNavigatorStyles` :

- `tabBarColors` : `background`, `activeCircle`, `activeIcon`, `inactiveIcon`
- `TAB_BAR_HEIGHT`, `TAB_BAR_MARGIN_BOTTOM`, `TAB_BAR_MARGIN_HORIZONTAL`
- `ACTIVE_CIRCLE_SIZE`

Utile pour calculer le `paddingBottom` des écrans si besoin.

## Gestion du focus

- `CustomTabBar` utilise `state.index` et `descriptors` pour savoir quel onglet est actif.
- Chaque `TabBarItem` reçoit `isFocused` et affiche soit le cercle + icône (actif), soit l’icône seule (inactif).

## Dépendances

- `react-navigation/bottom-tabs`
- `react-native-safe-area-context` (`useSafeAreaInsets`)
- `react-native-svg` (icônes personnalisées)

Aucun style inline : tout est dans des `StyleSheet`.
