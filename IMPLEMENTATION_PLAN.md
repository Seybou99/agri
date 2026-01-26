# Plan d'Implémentation - SeneGundo

## 📋 Vue d'ensemble

Ce document décrit le plan d'implémentation pour transformer l'application Agri Mali en **SeneGundo**, une plateforme complète d'aide à la décision agricole pour le Mali.

---

## 📍 Ce qui a été mis en place (état actuel)

### Par rapport au plan

| Élément du plan | Statut | Détail |
|-----------------|--------|--------|
| **Phase 1 – Fondations** | | |
| Configuration Firebase | ⚠️ Stub | Fichiers `config/firebase.ts`, `services/firebase/auth.ts` présents mais **stub** (Firebase non installé). |
| Modèles TypeScript | ✅ | `User`, `Diagnostic`, `Product`, `Formation`, `Plant`. Pas de modèle `Order`. |
| Navigation par onglets | ✅ | **Home**, Diagnostic, Marketplace, Académie (pas de Profil). Barre custom (pilule, icônes SVG). |
| Service d’authentification | ⚠️ Stub | Interface + implémentation stub qui lève des erreurs si appelé. |
| Matching Engine | ✅ | `matchingEngine.ts` + `calculateSuitabilityScore`. |
| Services agronomiques | ✅ | `soilService` (SoilGrids), `climateService` (NASA POWER). |
| Base plantes (5 cultures) | ✅ | `constants/plants.ts` : oignon, tomate, maïs, riz, arachide. |
| **Phase 2 – Core** | | |
| Carte interactive | ✅ | **DiagnosticMapScreen** : carte centrée sur le Mali, tap pour marqueur, « Ma position » (expo-location), « Continuer » → Config. |
| Config diagnostic (culture, surface) | ✅ | **DiagnosticConfigScreen** : choix culture (oignon, tomate, maïs, riz, arachide), surface en ha, « Lancer le diagnostic » → FieldReport. |
| Cloud Functions | ❌ | Non fait. |
| Paiement mobile | ❌ | Non fait. |
| Génération PDF | ❌ | Non fait. |
| Visualisation résultats | ✅ Partiel | **FieldReportScreen** : parcelle, KPIs, rendement, graphique croissance (données mock). Flux : Carte → Config → FieldReport. |

### En plus du plan (hors doc)

- **Écran Field Report** : `FieldReportScreen` + composants `ParcelCard`, `ReportTabs`, `KPICard`, `YieldCard`, `GrowthChart`.
- **Carte + Config diagnostic** : `DiagnosticMapScreen` (react-native-maps, expo-location), `DiagnosticConfigScreen` (culture, surface).
- **Stack navigation** : `AppNavigator` avec `MainTabs` + `DiagnosticMap` + `DiagnosticConfig` + `FieldReport`. Accueil « Nouveau Diagnostic » → Carte → Config → FieldReport. Onglet Diagnostic = Carte.
- **Tab bar personnalisée** : `CustomTabBar`, `TabIcons` (SVG), styles pilule/flottant.
- **Design** : `primaryDark`, `primaryLight`, thème cohérent.
- **Hooks** : `useAuth`, `useDiagnostic`, `useApi` (présents ; `useApi` / `api` ont des soucis TypeScript).

### Récapitulatif fichiers concernés

```
src/
├── models/           ✅ User, Diagnostic, Product, Formation, Plant
├── constants/        ✅ plants.ts
├── config/           ⚠️ firebase.ts (stub), earthEngine.ts (GEE project id / config)
├── services/
│   ├── firebase/     ⚠️ auth.ts (stub)
│   └── agronomy/     ✅ soilService, climateService, matchingEngine
├── hooks/            ✅ useAuth, useDiagnostic, useApi
├── navigation/       ✅ TabNavigator, CustomTabBar, TabIcons, AppNavigator (+ FieldReport)
├── screens/          ✅ HomeScreen, PlaceholderScreen, FieldReportScreen, DiagnosticMapScreen, DiagnosticConfigScreen
├── components/
│   ├── common/       ✅ Button
│   └── fieldReport/  ✅ ParcelCard, ReportTabs, KPICard, YieldCard, GrowthChart
└── theme/            ✅ colors, spacing, typography
```

---

## ✅ État d'avancement (plan initial)

### Phase 1 : Fondations (PARTIELLEMENT TERMINÉE)
- [x] Structure Firebase (fichiers présents ; stub si non installé)
- [x] Modèles TypeScript (User, Diagnostic, Product, Formation, Plant)
- [x] Navigation par onglets (Home, Diagnostic, Marketplace, Académie)
- [x] Service d'authentification (interface + stub)
- [x] Matching Engine (calcul des scores d'aptitude)
- [x] Services agronomiques (SoilGrids, NASA POWER)
- [x] Base de données des besoins des plantes (5 cultures : oignon, tomate, maïs, riz, arachide)

### Phase 2 : Fonctionnalités Core (EN COURS)
- [x] Écran de sélection de terrain avec carte interactive (**DiagnosticMapScreen**)
- [x] Écran de configuration du diagnostic (culture, surface) (**DiagnosticConfigScreen**)
- [ ] Intégration Cloud Functions pour sécuriser les appels API
- [ ] Système de paiement mobile (Orange Money, Moov, Wave)
- [ ] Génération de rapports PDF
- [x] ~~Visualisation des résultats de diagnostic~~ → **FieldReportScreen** (mock ; à brancher sur vrai diagnostic)

### Phase 3 : Marketplace (À VENIR)
- [ ] Écran de liste des produits
- [ ] Écran de détail produit
- [ ] Système de commande (Click & Collect)
- [ ] Gestion du stock en temps réel
- [ ] Géolocalisation des points de retrait

### Phase 4 : Académie (À VENIR)
- [ ] Bibliothèque de formations
- [ ] Lecteur PDF/Vidéo
- [ ] Système de favoris
- [ ] Notifications d'alertes saisonnières

### Phase 5 : IA Diagnostic (À VENIR)
- [ ] Intégration TensorFlow Lite
- [ ] Module de capture photo
- [ ] Base de données des maladies
- [ ] Recommandations de traitements

## 🛠️ Prochaines étapes immédiates

### 1. Installation des dépendances
```bash
npm install
npm install @react-navigation/bottom-tabs firebase expo-location react-native-maps
```

### 2. Configuration Firebase
1. Créer un projet Firebase sur https://console.firebase.google.com
2. Activer Authentication (Email/Password)
3. Créer une base Firestore
4. Activer Storage
5. Copier les clés dans `.env`

### 3. Configuration des APIs externes

**Référence détaillée** : `docs/APIS_DONNEES.md`

| API | Clé | Usage actuel |
|-----|-----|--------------|
| **ISRIC SoilGrids** | Non (open data, respecter limites) | `soilService` |
| **NASA POWER** | Non (gratuit) | `climateService` |
| **Google Earth Engine** | Compte de service + JSON | Config : **`docs/EARTH_ENGINE_SETUP.md`** ; `.env` : `GOOGLE_APPLICATION_CREDENTIALS`, `GEE_PROJECT_ID`. |
| **OpenWeatherMap** | Oui (freemium) | ✅ `openWeatherService` (météo actuelle, si `OPENWEATHER_API_KEY` dans .env) |
| **Frogcast** | Oui (freemium) | Optionnel, agri‑météo |
| **Google Maps** | Oui | Carte (react-native-maps) |

### 4. Cloud Functions

Le dossier **`functions/`** est en place avec :
- **`getSoilFromGEE`** (HTTP) : interroge **SoilGrids via GEE** pour un point `(lat, lng)` → pH, clay, sand, silt, etc. Voir `functions/src/geeSoil.ts`, `functions/README.md`.
- À venir : `calculateDiagnostic`, `generatePDF`, `paymentWebhook`.

**GEE** : `GOOGLE_APPLICATION_CREDENTIALS`, `GEE_PROJECT_ID`, compte de service avec **Earth Engine Resource Viewer**. Voir **`docs/EARTH_ENGINE_SETUP.md`**.

## 📁 Structure des fichiers créés

```
src/
├── models/              # Modèles TypeScript
│   ├── User.ts
│   ├── Diagnostic.ts
│   ├── Product.ts
│   ├── Formation.ts
│   └── Plant.ts
├── constants/
│   └── plants.ts        # Base de données des besoins des plantes
├── config/
│   ├── firebase.ts      # Configuration Firebase
│   └── earthEngine.ts   # Configuration Earth Engine (GEE_PROJECT_ID, etc.)
├── services/
│   ├── firebase/
│   │   └── auth.ts      # Service d'authentification
│   └── agronomy/
│       ├── soilService.ts      # ISRIC SoilGrids
│       ├── climateService.ts   # NASA POWER
│       └── matchingEngine.ts  # Calcul des scores
├── hooks/
│   ├── useAuth.ts
│   └── useDiagnostic.ts
└── navigation/
    └── TabNavigator.tsx  # Navigation par onglets
```

## 🔐 Sécurité

**IMPORTANT** : Les appels aux APIs externes (SoilGrids, NASA POWER) doivent être faits depuis des Cloud Functions, pas directement depuis l'application mobile. Cela permet de :
- Protéger les clés API
- Réduire la consommation de données mobiles
- Centraliser la logique métier
- Mettre en cache les résultats

## 📱 Écrans à créer / existants

| Écran | Statut | Fichier / remarque |
|-------|--------|--------------------|
| **HomeScreen** | ✅ | Accueil, services, CTA « Nouveau Diagnostic » → FieldReport |
| **FieldReportScreen** | ✅ | Rapport parcelle (KPIs, rendement, croissance). Données mock. |
| **DiagnosticMapScreen** | ✅ | Sélection du terrain sur carte (carte interactive, marqueur, « Ma position ») |
| **DiagnosticConfigScreen** | ✅ | Choix de la culture et de la surface (ha) |
| **DiagnosticResultsScreen** | → FieldReport | Affichage des résultats (déjà couvert en partie par FieldReport) |
| **PaymentScreen** | ❌ | Paiement mobile (à créer) |
| **MarketplaceScreen** | ❌ | Liste des produits (placeholder pour l’instant) |
| **ProductDetailScreen** | ❌ | Détail d’un produit (à créer) |
| **AcademyScreen** | ❌ | Liste des formations (placeholder pour l’instant) |
| **FormationDetailScreen** | ❌ | Lecture d’une formation (à créer) |
| **ProfileScreen** | ❌ | Profil utilisateur (à créer) |
| **PlaceholderScreen** | ✅ | Écran générique pour Diagnostic / Marketplace / Academy en attente |

## 🎨 Design System

Le thème est déjà configuré avec :
- Couleurs : Vert agricole (#2E7D32) comme couleur primaire
- Typographie : Hiérarchie H1-H4, Body, Caption
- Espacements : xs, sm, md, lg, xl, xxl

## 📊 Base de données Firestore

Collections :
- `users` : Profils utilisateurs
- `diagnostics` : Rapports de diagnostic
- `marketplace_products` : Produits en vente
- `orders` : Commandes
- `formations` : Contenu de formation

## 🚀 Déploiement

1. **Firebase** : `firebase deploy --only functions`
2. **Expo** : `expo build:android` ou `expo build:ios`
3. **Store** : Soumettre sur Google Play et App Store

## 📝 Notes importantes

- Le Matching Engine est fonctionnel mais doit être testé avec de vraies données
- Les services API sont configurés mais nécessitent une connexion internet stable
- Le système de paiement nécessite l'intégration d'un SDK (CinetPay ou FedaPay)
- L'IA de diagnostic nécessite l'intégration de TensorFlow Lite (phase 5)
