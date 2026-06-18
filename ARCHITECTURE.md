# Architecture Technique - SeneGundo

## 🏗️ Vue d'ensemble

SeneGundo est une application React Native construite avec Expo, utilisant Firebase comme backend et intégrant plusieurs APIs externes pour fournir des diagnostics agricoles précis.

## 📐 Architecture MVC

### Modèle (Models)
Les modèles définissent la structure des données :
- **User** : Profil utilisateur (`agriculteur`, `utilisateur` / acheteur, `administrateur` ; `investisseur` / partenaire B2B prévu). Voir [README.md](./README.md) — stratégie une base, plusieurs variantes d’app.
- **Diagnostic** : Rapport d'analyse d'un terrain pour une culture
- **Product** : Produit de la marketplace (récolte ou intrant)
- **Order** : Commande dans la marketplace
- **Formation** : Contenu éducatif
- **Plant** : Besoins agronomiques d'une plante

### Vue (Views/Screens)
Les écrans affichent les données et capturent les interactions :
- **HomeScreen** : Page d'accueil avec présentation des services
- **DiagnosticScreen** : Sélection du terrain (à créer)
- **MarketplaceScreen** : Liste des produits (à créer)
- **AcademyScreen** : Bibliothèque de formations (à créer)
- **ProfileScreen** : Profil utilisateur (à créer)

### Contrôleur (Services & Hooks)
La logique métier est dans les services et hooks :
- **authService** : Authentification Firebase
- **soilService** : Récupération des données de sol (ISRIC SoilGrids)
- **climateService** : Récupération des données climatiques (NASA POWER)
- **matchingEngine** : Calcul des scores d'aptitude
- **useAuth** : Hook pour gérer l'état d'authentification
- **useDiagnostic** : Hook pour créer et gérer les diagnostics

## 🔄 Flux de données

### Création d'un Diagnostic

```
1. Utilisateur sélectionne un terrain sur la carte
   ↓
2. Utilisateur choisit culture + surface
   ↓
3. Hook useDiagnostic appelle les services
   ↓
4. Services appellent les APIs (SoilGrids + NASA POWER)
   ↓
5. Matching Engine calcule le score
   ↓
6. Résultats affichés à l'utilisateur
   ↓
7. Paiement requis pour accéder au PDF complet
   ↓
8. Cloud Function génère le PDF
   ↓
9. PDF stocké dans Firebase Storage
   ↓
10. URL du PDF enregistrée dans Firestore
```

## 🔌 Intégrations API

### APIs Externes (appelées depuis Cloud Functions)

1. **ISRIC SoilGrids API**
   - Endpoint : `https://rest.isric.org/soilgrids/v2.0/properties/query`
   - Données : pH, texture, carbone organique, azote, phosphore, potassium
   - Coût : Gratuit

2. **NASA POWER API**
   - Endpoint : `https://power.larc.nasa.gov/api/temporal/daily/point`
   - Données : Précipitations, températures, rayonnement solaire
   - Coût : Gratuit

3. **Google Maps API** (optionnel)
   - Geocoding : Conversion coordonnées → nom de localité
   - Maps SDK : Affichage de la carte interactive
   - Coût : Payant (mais généreux free tier)

### Firebase Services

- **Authentication** : Gestion des comptes utilisateurs
- **Firestore** : Base de données NoSQL en temps réel
- **Storage** : Stockage des rapports PDF et images
- **Cloud Functions** : Logique serveur (calculs, génération PDF)

## 🧮 Algorithme de Matching

Le Matching Engine compare les données du terrain avec les besoins de la plante :

1. **Score du sol (40%)**
   - pH : Comparaison avec la plage optimale
   - Texture : Correspondance avec la texture préférée
   - Drainage : Évaluation du drainage
   - Matière organique : Niveau de carbone organique

2. **Score climatique (40%)**
   - Température moyenne : Vérification de la plage optimale
   - Températures extrêmes : Détection du stress thermique
   - Température nocturne : Pour certaines cultures (ex: oignon)
   - Degrés-jours : Somme de températures nécessaire

3. **Score hydrique (20%)**
   - Pluviométrie annuelle : Comparaison avec les besoins
   - Besoins en eau : Évaluation selon la culture

**Score final** = (Score sol × 0.4) + (Score climat × 0.4) + (Score eau × 0.2)

## 📊 Structure Firestore

### Collection `users`
```typescript
{
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  role: 'investor' | 'farmer' | 'buyer';
  location?: { lat: number; lng: number };
  createdAt: Date;
  isPremium: boolean;
}
```

### Collection `diagnostics`
```typescript
{
  id: string;
  userId: string;
  culture: string;
  surface: number;
  coordinates: { lat: number; lng: number };
  locationName: string;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'failed';
  paymentRef?: string;
  results?: DiagnosticResults;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Collection `marketplace_products`
```typescript
{
  id: string;
  farmerId: string;
  productName: string;
  category: 'Légumes' | 'Fruits' | 'Céréales' | 'Intrants';
  price: number;
  unit: string;
  stockQuantity: number;
  location: { geopoint: GeoPoint; name: string };
  images: string[];
  isCertified: boolean;
  diagnosticId?: string;
  createdAt: Date;
}
```

## 🔐 Sécurité

### Firestore Rules (à configurer)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users : lecture/écriture uniquement pour le propriétaire
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Diagnostics : lecture uniquement pour le propriétaire
    match /diagnostics/{diagnosticId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Marketplace : lecture publique, écriture authentifiée
    match /marketplace_products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Cloud Functions
- Validation des données d'entrée
- Rate limiting pour éviter les abus
- Caching des résultats API pour réduire les coûts

## 🚀 Performance

### Optimisations
1. **Caching** : Les données de sol changent peu → cache 6 mois
2. **Lazy Loading** : Chargement des images à la demande
3. **Pagination** : Liste des produits paginée
4. **Offline** : Firestore cache les données localement

### Limitations
- Les APIs externes peuvent être lentes (2-5 secondes)
- La génération de PDF peut prendre 3-10 secondes
- Les images de la marketplace doivent être optimisées

## 📱 Plateformes supportées

- **iOS** : Via Expo
- **Android** : Via Expo
- **Web** : Via Expo (limité, pas recommandé pour la production)

## 🔄 Mises à jour futures

1. **TensorFlow Lite** : Diagnostic IA des maladies (hors-ligne)
2. **Notifications Push** : Alertes saisonnières et nouvelles formations
3. **Géolocalisation avancée** : Polygones de terrain précis
4. **Mode hors-ligne complet** : Consultation des rapports sans internet
