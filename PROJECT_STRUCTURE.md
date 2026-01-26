# Structure du Projet Agri Mali App

## 📋 Vue d'ensemble

Ce document décrit la structure complète du projet React Native Agri Mali App, organisée selon les meilleures pratiques de 2026.

## 🗂️ Structure des dossiers

```
AgriMaliApp/
│
├── src/                          # Code source principal
│   ├── assets/                   # Ressources statiques
│   │   ├── images/              # Images de l'application
│   │   └── fonts/               # Polices personnalisées
│   │
│   ├── components/              # Composants réutilisables
│   │   ├── common/              # Composants communs (Button, Card, etc.)
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   ├── forms/               # Composants de formulaire
│   │   └── index.ts
│   │
│   ├── screens/                 # Écrans de l'application
│   │   ├── HomeScreen.tsx
│   │   └── index.ts
│   │
│   ├── navigation/              # Configuration de navigation
│   │   └── AppNavigator.tsx
│   │
│   ├── services/                # Services API et logique métier
│   │   ├── api.ts              # Service API de base
│   │   └── index.ts
│   │
│   ├── hooks/                   # Hooks React personnalisés
│   │   ├── useApi.ts           # Hook pour les appels API
│   │   └── index.ts
│   │
│   ├── utils/                   # Fonctions utilitaires
│   │   ├── constants.ts        # Constantes de l'application
│   │   └── index.ts
│   │
│   ├── theme/                   # Thème et styles
│   │   ├── colors.ts           # Palette de couleurs
│   │   ├── spacing.ts          # Espacements
│   │   ├── typography.ts       # Typographie
│   │   └── index.ts
│   │
│   └── types/                   # Types TypeScript
│       ├── index.ts            # Types globaux
│       └── env.d.ts            # Types pour variables d'environnement
│
├── assets/                       # Assets Expo (icônes, splash)
│
├── App.tsx                       # Point d'entrée de l'application
├── index.ts                      # Fichier d'entrée Expo
│
├── Configuration Files
│   ├── babel.config.js          # Configuration Babel (path aliases)
│   ├── tsconfig.json            # Configuration TypeScript
│   ├── jest.config.js           # Configuration Jest
│   ├── jest.setup.js            # Setup Jest
│   ├── .eslintrc.js             # Configuration ESLint
│   ├── .prettierrc.js           # Configuration Prettier
│   ├── .prettierignore          # Fichiers ignorés par Prettier
│   ├── .env.example             # Exemple de variables d'environnement
│   └── .gitignore               # Fichiers ignorés par Git
│
└── Documentation
    ├── README.md                # Documentation principale
    └── PROJECT_STRUCTURE.md     # Ce fichier
```

## 🎯 Principes d'organisation

### Architecture Feature-Based (Recommandée pour les grandes applications)

Bien que la structure actuelle soit organisée par couches techniques (components, screens, services), elle peut facilement évoluer vers une architecture feature-based si nécessaire :

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   └── hooks/
│   ├── products/
│   │   └── ...
│   └── ...
```

### Path Aliases

Tous les imports utilisent des alias pour éviter les chemins relatifs complexes :

```typescript
// ❌ Mauvais
import { Button } from '../../../components/common/Button';

// ✅ Bon
import { Button } from '@components/common';
```

## 📦 Dépendances principales

### Runtime
- `expo` - Framework React Native
- `react` & `react-native` - Bibliothèques de base
- `@react-navigation/native` - Navigation
- `react-native-dotenv` - Variables d'environnement

### Développement
- `typescript` - Typage statique
- `eslint` - Linting
- `prettier` - Formatage
- `jest` - Tests
- `babel-plugin-module-resolver` - Path aliases

## 🔧 Configuration

### TypeScript (`tsconfig.json`)
- Extend `expo/tsconfig.base`
- Path aliases configurés
- Mode strict activé

### Babel (`babel.config.js`)
- Preset Expo
- Module resolver pour path aliases
- Plugin react-native-dotenv pour variables d'environnement

### ESLint (`.eslintrc.js`)
- Règles TypeScript
- Règles React et React Hooks
- Règles React Native
- Intégration Prettier

### Jest (`jest.config.js`)
- Preset jest-expo
- Path aliases mappés
- Coverage configuré

## 🚀 Prochaines étapes recommandées

1. **Ajouter des écrans** dans `src/screens/`
2. **Créer des composants réutilisables** dans `src/components/`
3. **Implémenter les services API** dans `src/services/`
4. **Ajouter des hooks personnalisés** dans `src/hooks/`
5. **Configurer le state management** (Redux, Zustand, ou Context API)
6. **Ajouter la gestion d'erreurs globale**
7. **Implémenter l'authentification**
8. **Ajouter des tests unitaires**

## 📝 Conventions de nommage

- **Composants** : PascalCase (`Button.tsx`, `HomeScreen.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useApi.ts`)
- **Services** : camelCase (`api.ts`)
- **Types** : PascalCase (`ApiResponse`, `User`)
- **Constantes** : UPPER_SNAKE_CASE (`API_URL`, `STORAGE_KEYS`)
- **Fichiers** : camelCase pour utilitaires, PascalCase pour composants

## 🔍 Points d'attention

1. **Ne pas hardcoder les valeurs** - Utiliser le thème centralisé
2. **Éviter les imports relatifs** - Utiliser les path aliases
3. **Séparer la logique métier** - Services dans `src/services/`
4. **Composants réutilisables** - Dans `src/components/common/`
5. **Tests** - À côté des fichiers avec extension `.test.ts` ou `.test.tsx`
