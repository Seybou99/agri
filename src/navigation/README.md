# Structure de Navigation - SeneGundo

## 📁 Organisation des fichiers

La navigation est organisée avec une séparation claire entre le **code structurel** et les **styles** :

```
src/navigation/
├── TabNavigator.tsx              # Code structurel de la navigation
├── AppNavigator.tsx              # Navigation principale (Stack)
├── components/
│   ├── CustomTabBar.tsx         # Composant de barre personnalisée (code structurel)
│   └── TabIcons.tsx             # Composants d'icônes
└── styles/
    ├── tabNavigatorStyles.ts    # Styles de la barre de navigation
    └── index.ts                 # Export centralisé
```

## 🎨 Séparation Style / Code

### Code Structurel (`TabNavigator.tsx`, `CustomTabBar.tsx`)
- Logique de navigation
- Gestion des états (actif/inactif)
- Handlers d'événements (onPress, onLongPress)
- Structure des composants

### Styles (`tabNavigatorStyles.ts`)
- Couleurs de la barre de navigation
- Dimensions et espacements
- Bordures et ombres
- États visuels (actif/inactif)

## 🎯 Design selon la maquette

### Couleurs
- **Fond de la barre** : Vert foncé (`#1B5E20`)
- **État actif** : Vert clair (`#81C784`) en forme de pilule
- **Icône active** : Vert foncé (`#1B5E20`)
- **Icônes inactives** : Blanc (`#FFFFFF`)

### Forme
- Barre principale : Pilule arrondie avec `borderRadius: 35`
- État actif : Pilule verte claire avec cercle intérieur pour l'icône
- Marges : `marginHorizontal: 16`, `marginBottom: 20`

### Comportement
- 4 onglets : Accueil, Diagnostic, Marché, Académie
- Labels masqués par défaut (`tabBarShowLabel: false`)
- Animation au clic avec `activeOpacity: 0.7`

## 🔧 Modification des styles

Pour modifier l'apparence de la barre de navigation, éditez uniquement :
- `src/navigation/styles/tabNavigatorStyles.ts` : Couleurs, dimensions, espacements
- `src/navigation/components/TabIcons.tsx` : Remplacez les placeholders par de vraies icônes SVG

## 📝 Notes

- Les icônes actuelles sont des placeholders. Remplacez-les par des icônes SVG réelles.
- La barre est positionnée en `absolute` avec des marges pour créer l'effet "flottant".
- Les ombres donnent de la profondeur à la barre.
