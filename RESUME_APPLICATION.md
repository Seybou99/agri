# Résumé du fonctionnement – SeneGundo (Agri Mali App)

## Vue d’ensemble

**SeneGundo** est une application mobile (React Native + Expo) pour l’agriculture au Mali. Elle utilise des données (satellites, sols, climat) pour fournir des diagnostics de terrain, une marketplace et des prévisions météo, le tout en français.

---

## 1. Architecture de l’application

### Point d’entrée
- **`index.ts`** : Démarre l’app, filtre les `console.error` de dev (ex. `disableEventLoopOnBridgeless`).
- **`App.tsx`** : Enveloppe l’app avec `SafeAreaProvider`, `CartProvider`, `AppNavigator` et `LogBox.ignoreLogs` pour certains warnings.

### Navigation
- **Stack principal** (`AppNavigator`) : gère tous les écrans en pile (tabs + écrans modaux/détails).
- **Onglets** (`TabNavigator`) : 4 onglets avec une barre personnalisée (`CustomTabBar`) :
  - **Accueil** → `HomeScreen`
  - **Diagnostic** → `DiagnosticMapScreen` (carte pour choisir un terrain)
  - **Marketplace** → `MarketplaceScreen`
  - **Académie** → écran placeholder

Les écrans météo, rapport de parcelle, détail produit, panier, checkout et profil sont ouverts par-dessus les onglets (stack).

---

## 2. Parcours utilisateur principaux

### Accueil (Home)
- **Header** : logo SeneGundo, slogan, icône profil (vers `ProfileScreen`).
- **Résumé d’activité** (carousel) : dernier diagnostic, **météo du jour** (clic → `WeatherHome` avec lat/lng/nom du lieu).
- **Grille de services** : accès rapide Diagnostic, Boutique, Élevage, Académie.
- **Slider « À la une »** : contenu mis en avant.
- **Bouton central** : « Lancer une analyse de terrain » → `DiagnosticMap`.
- **Message de crédibilité** : données IER, ESA.

### Diagnostic agricole
1. **Carte** (`DiagnosticMapScreen`) : l’utilisateur choisit un point sur la carte (ou GPS, ou coordonnées X/Y). Envoi de la position vers l’écran suivant.
2. **Configuration** (`DiagnosticConfigScreen`) : choix des cultures, surface, etc. Puis lancement du calcul et navigation vers le rapport.
3. **Rapport de parcelle** (`FieldReportScreen`) : affichage des indicateurs (sol, climat, aptitudes), estimations de rendement, graphique pluviométrie, onglets Analyse / Notes / Calendrier. Données issues des services (APIs / mock).

### Météo
- Depuis l’accueil (carte météo) → **Météo aujourd’hui** (`WeatherHomeScreen`) avec données OpenWeather (ou mock).
- **Aujourd’hui** : grande carte bleue (ville, condition, température, icône, Vent / Humidité / Visibilité), scroll horizontal des créneaux horaires, bloc Qualité de l’air.
- **Lien « 7 prochains jours »** → `Next7DaysScreen` : carte « Demain » + liste des jours suivants avec icônes et températures.
- **Prévisions** (`ForecastScreen`) : carte header (date, ville, bouton Carte), **graphique de température** (courbe SVG sur les jours), section **Villes populaires** (ex. Bamako, Dakar). Accessible depuis le menu de l’écran 7 jours.

Tous les textes météo (labels, jours, descriptions) sont en français ; les données proviennent de `weatherService.ts` (OpenWeather + fallback mock).

### Marketplace
- **MarketplaceScreen** : 3 rayons (Intrants & Équipements, Produits de la ferme, Élevage), liste de produits avec filtre par catégorie.
- Clic produit → **Détail produit** (`ProductDetailScreen`) : infos, bouton panier, possibilité d’aller au rapport de parcelle si lié à un diagnostic.
- **Panier** (`CartScreen`) : liste des articles, total, bouton « Passer commande » → **Checkout** (`CheckoutScreen`). Après validation, retour vers l’accueil (ou la marketplace selon le flux).

Le **panier** est géré globalement par `CartContext` (ajout, suppression, total), avec badge sur l’icône Marketplace.

### Profil
- **ProfileScreen** : accessible depuis l’accueil (icône profil) ou depuis l’écran météo. Affiche les infos utilisateur (profil auth si connecté).

---

## 3. Données et services

- **Météo** : `weatherService.ts` (OpenWeather : météo actuelle, horaire, 7 jours, qualité de l’air, graphique, villes populaires). Clé API dans `.env` (`OPENWEATHER_API_KEY`). Descriptions et jours traduits en français.
- **Diagnostic / Rapport** : utilisation de services (APIs sol/climat, ex. SoilGrids, NASA POWER) et/ou backend (ex. Vercel/GEE) selon la config ; données agrégées pour le rapport de parcelle.
- **Auth** : hook `useAuth` pour le profil utilisateur (affiché sur l’accueil et le profil).
- **Thème** : `@theme` (couleurs, espacements, typo) pour garder un design cohérent.

---

## 4. Résumé des écrans (stack)

| Écran | Rôle |
|-------|------|
| **MainTabs** | Accueil, Diagnostic, Marketplace, Académie |
| **DiagnosticMap** | Choix du lieu (carte/GPS/XY) pour le diagnostic |
| **DiagnosticConfig** | Cultures, surface → lance le diagnostic |
| **FieldReport** | Rapport de parcelle (KPIs, graphiques, onglets) |
| **ProductDetail** | Fiche produit, panier, lien rapport |
| **Cart** | Panier d’achat |
| **Checkout** | Validation de commande |
| **Profile** | Profil utilisateur |
| **WeatherHome** | Météo « Aujourd’hui » |
| **Next7Days** | Prévisions 7 jours |
| **Forecast** | Graphique température + villes populaires |

---

## 5. En résumé

L’utilisateur peut :
1. **Consulter l’accueil** (résumé d’activité, météo, services, à la une) et accéder au **profil**.
2. **Lancer un diagnostic** : carte → config (cultures, surface) → **rapport de parcelle**.
3. **Voir la météo** : aujourd’hui, 7 jours, prévisions avec graphique et villes populaires, tout en français.
4. **Parcourir la marketplace**, ajouter au panier, passer commande (panier → checkout).
5. **Accéder à l’Académie** (écran placeholder pour l’instant).

L’app repose sur **React Navigation** (stack + tabs), **Context** pour le panier, **services** pour météo et diagnostic, et un **thème centralisé** pour l’interface.
