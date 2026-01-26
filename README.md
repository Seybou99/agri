# SeneGundo 🌱

**L'intelligence des données pour la réussite de vos récoltes**

Application mobile React Native pour l'agriculture au Mali, développée avec Expo et TypeScript. SeneGundo transforme les données scientifiques (satellites, sols, climat) en conseils agricoles pratiques et accessibles.

## 🚀 Démarrage rapide

### Prérequis

- Node.js (version 20.19.4 ou supérieure)
- npm ou yarn
- Expo CLI (installé globalement ou via npx)
- Pour iOS : Xcode (macOS uniquement)
- Pour Android : Android Studio

### Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   Puis éditez le fichier `.env` avec vos configurations :
   - **Firebase** : Créez un projet sur [Firebase Console](https://console.firebase.google.com) et copiez les clés
   - **Google Maps** : Obtenez une clé API sur [Google Cloud Console](https://console.cloud.google.com)
   - Les APIs SoilGrids et NASA POWER sont gratuites et ne nécessitent pas de clé

3. **Installer les dépendances natives** (si nécessaire)
   ```bash
   npx expo install expo-location react-native-maps
   ```

3. **Démarrer l'application**
   ```bash
   # Démarrer le serveur de développement
   npm start

   # Lancer sur iOS (macOS uniquement)
   npm run ios

   # Lancer sur Android
   npm run android

   # Lancer sur le web
   npm run web
   ```

## 🎯 Fonctionnalités principales

### 1. Diagnostic Agricole 🔍
- Analyse de terrain basée sur des données satellites (ISRIC SoilGrids)
- Analyse climatique avec historique sur 5 ans (NASA POWER)
- Calcul automatique du score d'aptitude (0-10)
- Recommandations personnalisées par culture
- Rapport PDF professionnel téléchargeable

### 2. Marketplace 🛒
- Vente de récoltes certifiées
- Achat d'intrants adaptés au diagnostic
- Click & Collect avec points de retrait
- Géolocalisation des produits

### 3. Académie 📚
- Formations sur les techniques agricoles
- Guides pratiques (PDF, vidéos, audio)
- Études de cas locales
- Alertes saisonnières

### 4. Docteur SeneGundo 🤖 (À venir)
- Diagnostic de maladies par photo (IA)
- Identification des ravageurs
- Recommandations de traitements

## 📁 Structure du projet

```
AgriMaliApp/
├── src/
│   ├── models/          # Modèles TypeScript (User, Diagnostic, Product, etc.)
│   ├── constants/       # Constantes (besoins des plantes)
│   ├── config/         # Configuration (Firebase)
│   ├── components/      # Composants réutilisables
│   ├── hooks/           # Hooks React (useAuth, useDiagnostic)
│   ├── navigation/      # Navigation (Tabs, Stack)
│   ├── screens/         # Écrans de l'application
│   ├── services/        # Services (API, Firebase, Agronomie)
│   ├── theme/           # Thème (couleurs, espacements, typographie)
│   ├── types/           # Types TypeScript globaux
│   └── utils/           # Fonctions utilitaires
├── App.tsx              # Point d'entrée
├── IMPLEMENTATION_PLAN.md  # Plan d'implémentation détaillé
├── ARCHITECTURE.md      # Documentation technique
└── package.json
```

## 🛠️ Scripts disponibles

- `npm start` - Démarrer le serveur Expo
- `npm run ios` - Lancer sur iOS
- `npm run android` - Lancer sur Android
- `npm run web` - Lancer sur le web
- `npm test` - Lancer les tests
- `npm run test:watch` - Lancer les tests en mode watch
- `npm run test:coverage` - Générer un rapport de couverture
- `npm run lint` - Vérifier le code avec ESLint
- `npm run lint:fix` - Corriger automatiquement les erreurs ESLint
- `npm run format` - Formater le code avec Prettier
- `npm run format:check` - Vérifier le formatage du code

## 📦 Path Aliases

Le projet utilise des alias de chemins pour simplifier les imports :

```typescript
// Au lieu de
import { Button } from '../../../components/common/Button';

// Vous pouvez utiliser
import { Button } from '@components/common';
```

Aliases disponibles :
- `@` → `src/`
- `@components` → `src/components`
- `@screens` → `src/screens`
- `@services` → `src/services`
- `@hooks` → `src/hooks`
- `@utils` → `src/utils`
- `@navigation` → `src/navigation`
- `@theme` → `src/theme`
- `@assets` → `src/assets`
- `@types` → `src/types`

## 🎨 Thème

Le thème de l'application est centralisé dans `src/theme/` :

```typescript
import { colors, spacing, typography } from '@theme';

// Utilisation
<View style={{ padding: spacing.md, backgroundColor: colors.primary }}>
  <Text style={typography.h1}>Titre</Text>
</View>
```

## 🧪 Tests

Les tests sont configurés avec Jest. Les fichiers de test doivent être placés à côté des fichiers qu'ils testent avec l'extension `.test.ts` ou `.test.tsx`.

Exemple :
```typescript
// Button.test.tsx
import { render } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Test" onPress={() => {}} />);
    expect(getByText('Test')).toBeTruthy();
  });
});
```

## 📝 Bonnes pratiques

1. **TypeScript** : Utilisez TypeScript pour tous les nouveaux fichiers
2. **Composants** : Créez des composants réutilisables dans `src/components`
3. **Styles** : Utilisez le thème centralisé plutôt que les valeurs hardcodées
4. **Imports** : Utilisez les path aliases pour les imports
5. **Tests** : Écrivez des tests pour les composants et services critiques
6. **Linting** : Exécutez `npm run lint` avant de commiter
7. **Formatage** : Utilisez `npm run format` pour formater votre code

## 🔧 Configuration

### ESLint
La configuration ESLint se trouve dans `.eslintrc.js`. Elle inclut :
- Règles TypeScript
- Règles React et React Hooks
- Règles React Native
- Intégration Prettier

### Prettier
La configuration Prettier se trouve dans `.prettierrc.js`.

### Babel
La configuration Babel se trouve dans `babel.config.js` et inclut le plugin `module-resolver` pour les path aliases.

## 📱 Plateformes supportées

- iOS
- Android
- Web (via Expo)

## 🤝 Contribution

1. Créez une branche pour votre fonctionnalité
2. Committez vos changements
3. Poussez vers la branche
4. Ouvrez une Pull Request

## 🧪 Tests

```bash
npm test              # Lancer les tests
npm run test:watch    # Mode watch
npm run test:coverage # Rapport de couverture
```

## 📚 Documentation

- [Plan d'implémentation](./IMPLEMENTATION_PLAN.md) : Roadmap détaillée
- [Architecture technique](./ARCHITECTURE.md) : Structure et flux de données

## 🔗 APIs utilisées

- **ISRIC SoilGrids** : Données pédologiques (gratuit)
- **NASA POWER** : Données climatiques (gratuit)
- **Google Maps** : Cartographie (payant, free tier généreux)
- **Firebase** : Backend complet (payant selon usage)

## 💡 Modèle économique

- **Diagnostic** : 5 000 FCFA par rapport
- **Marketplace** : Commission sur les ventes
- **Formations Premium** : Abonnement mensuel

## 📄 Licence

Ce projet est privé.

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur le dépôt du projet.

---

**SeneGundo** - *"La donnée avant la charrue."*
