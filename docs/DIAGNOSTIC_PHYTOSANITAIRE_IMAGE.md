# Diagnostic phytosanitaire par image — Modèle custom

Ce document décrit les **étapes pour mettre en place** le module de diagnostic des maladies des plantes par photo (feuille / tige / fruit), avec un **modèle IA entraîné sur dataset type PlantVillage**, servi par une API backend et déclenché depuis l’app via le **bouton « + »** de la barre de navigation.

---

## 1. Point d’entrée utilisateur : le bouton « + »

- **Où** : `src/navigation/components/CustomTabBar.tsx`
- **Comportement actuel** : le FAB (bouton flottant « + ») appelle `handleNewDiagnostic` et navigue vers **DiagnosticMap** (diagnostic de parcelle par zone).
- **Objectif** : utiliser ce même bouton **« + »** pour lancer la **prise de photo** du diagnostic phytosanitaire (feuille / tige / fruit → détection maladie).
- **Options d’intégration** (à trancher en implémentation) :
  - **A** : le « + » ouvre un **choix** (ex. bottom sheet) : « Diagnostic parcelle » vs « Diagnostic par photo (maladie) ».
  - **B** : le « + » va **directement** vers l’écran de prise de photo (diagnostic phytosanitaire), et le diagnostic parcelle reste accessible depuis l’onglet Diagnostic / Accueil.

Toute la chaîne (capture photo → upload → API → résultat) partira donc de l’action sur ce bouton « + ».

---

## 2. Vue d’ensemble des étapes

| Phase | Contenu | Livrable |
|-------|--------|----------|
| **2.1** | Environnement et dataset | Dataset prêt (ex. PlantVillage), structure dossiers |
| **2.2** | Entraînement du modèle | Modèle exporté (PyTorch/TF + TFLite ou ONNX) |
| **2.3** | API backend | Endpoint `POST /plant-diagnosis` + inférence |
| **2.4** | App : écran photo + flux | Capture via « + », upload, affichage résultat |
| **2.5** | Intégration (optionnel) | Lien Diagnostic / Alertes / Marketplace |

---

## 3. Étapes détaillées

### 3.1 Dataset et environnement

**Objectif** : avoir un dataset de feuilles (saines / malades) et un env pour entraîner.

1. **Télécharger un dataset**
   - **PlantVillage** : [Kaggle PlantVillage](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset) ou [source officielle](https://plantvillage.psu.edu/) — images feuilles, 38 classes (maladies + sain), 14 cultures (tomate, maïs, pomme de terre, etc.).
   - Option : ajouter **Cassava**, **Rice**, **Mango** (Kaggle / CGIAR) pour cultures pertinentes Afrique.

2. **Structure des dossiers (suggestion)**
   ```
   plant-diagnosis-model/     # Repo ou dossier dédié (hors app si tu veux)
   ├── data/
   │   ├── raw/               # Téléchargement brut
   │   ├── processed/         # Images resize/normalisées, train/val/test
   │   └── labels.csv         # Chemin image → label (si besoin)
   ├── notebooks/             # Exploration, stats classes
   ├── training/              # Scripts d’entraînement
   ├── export/                # Modèle exporté (TFLite, ONNX, .pt)
   └── README.md
   ```

3. **Environnement**
   - Python 3.8+
   - PyTorch ou TensorFlow (selon stack choisie)
   - Libs : Pillow, pandas, numpy, scikit-learn (pour split), tqdm

4. **Prétraitement**
   - Redimensionnement (ex. 224×224 pour MobileNet/EfficientNet)
   - Split train / val / test (ex. 70 / 15 / 15)
   - Augmentation : rotation, flip, brightness/contrast (optionnel)
   - Définir le **mapping des classes** (nom de maladie ↔ index) et le conserver pour l’API et l’app

---

### 3.2 Entraînement du modèle

**Objectif** : obtenir un modèle qui, à partir d’une image, renvoie une classe (maladie ou sain) + probabilité.

1. **Architecture**
   - Recommandation : **MobileNetV2** ou **EfficientNet-B0** (backbone) + couche de classification (nombre de classes = nombre de maladies + sain).
   - Framework : PyTorch (torchvision) ou TensorFlow/Keras (applications).

2. **Pipeline**
   - Charger les images et labels (dossiers par classe ou CSV).
   - Entraîner (loss cross-entropy, optimizer Adam, métrique accuracy).
   - Sauvegarder le meilleur modèle (validation).
   - **Exporter** :
     - **Production serveur** : modèle PyTorch (`.pt`) ou TensorFlow SavedModel.
     - **Mobile / offline (optionnel)** : TensorFlow Lite (`.tflite`) ou ONNX pour inférence légère.

3. **Fichiers à produire**
   - Script d’entraînement : `training/train.py` (ou équivalent).
   - Fichier **mapping des classes** : `export/class_names.json` (liste des noms dans l’ordre des indices).
   - Modèle : `export/model.pt` (ou `saved_model/` / `model.tflite`).

4. **Métriques à noter**
   - Accuracy / F1 par classe (pour documenter les limites).
   - Taux d’erreur sur « sain » vs « malade » (important pour l’UX).

---

### 3.3 API backend (service Plant Diagnosis)

**Objectif** : exposer un endpoint qui reçoit une image et renvoie le diagnostic (santé, maladie, confiance, conseil).

1. **Stack suggérée**
   - **Framework** : FastAPI ou Flask.
   - **Inférence** : charger le modèle (PyTorch ou TF) au démarrage ; pour chaque requête : prétraitement image → prédiction → format de réponse unifié.

2. **Endpoint**
   - **Route** : `POST /api/plant-diagnosis` (ou `/plant-diagnosis` selon ton API actuelle).
   - **Entrée** :
     - `image` : fichier (multipart/form-data) ou base64.
     - `crop_type` (optionnel) : string pour filtrer/améliorer les conseils.
     - `location` (optionnel) : pour logs / futur multimodal.
   - **Sortie (exemple)** :
     ```json
     {
       "health_status": "Unhealthy",
       "disease": "Tomato_Leaf_Mold",
       "disease_label_fr": "Mildiou de la tomate",
       "confidence": 0.91,
       "treatment": "Appliquer fongicide à base de cuivre...",
       "urgency": "Medium"
     }
     ```

3. **Tâches backend**
   - Créer le service (ex. `plant-diagnosis/` dans ton backend ou repo séparé).
   - Charger le modèle et `class_names.json`.
   - Prétraitement identique à l’entraînement (resize, normalisation).
   - Gestion d’erreurs (image invalide, modèle non chargé).
   - (Optionnel) Log des diagnostics pour amélioration future.

4. **Hébergement**
   - Même backend que l’app (ex. Vercel serverless + route API) ou service dédié (FastAPI sur VM/container).
   - Si modèle lourd : prévoir GPU ou inférence CPU avec timeout acceptable.

---

### 3.4 App React Native : écran photo et flux « + »

**Objectif** : depuis le bouton « + », ouvrir la prise de photo, envoyer l’image à l’API, afficher le résultat.

1. **Navigation**
   - Ajouter une route dans `AppNavigator` (ex. `PlantDiagnosis` ou `DiagnosticPhoto`).
   - Dans `CustomTabBar.tsx`, modifier `handleNewDiagnostic` (ou ajouter une logique de choix) pour naviguer vers cet écran au lieu de (ou en plus de) `DiagnosticMap`.

2. **Écran « Diagnostic par photo »**
   - **Étape 1** : afficher un guide (ex. « Cadrez la feuille », « Prenez en bonne lumière »).
   - **Étape 2** : prise de photo (caméra) ou choix galerie (ex. `expo-camera` ou `expo-image-picker`).
   - **Étape 3** : (optionnel) recadrage / validation ; compression (ex. 1024 px max, qualité 0.8) pour réduire la taille.
   - **Étape 4** : envoi `POST` vers `API_URL/api/plant-diagnosis` avec l’image en multipart (ou base64 si ton API l’accepte).
   - **Étape 5** : affichage du résultat :
     - **Santé** : visuel (ex. feuille verte = sain, feuille rouge = malade).
     - **Maladie** : nom (FR si tu l’as dans l’API), confiance (%).
     - **Conseil** : texte `treatment`.
     - **Boutons** : « Traiter », « Voir produit » (Marketplace), « Appeler conseiller » (lien tel).

3. **Fichiers à créer côté app**
   - `src/screens/PlantDiagnosisScreen.tsx` (ou `DiagnosticPhotoScreen.tsx`) : écran complet (guide → capture → résultat).
   - `src/services/plantDiagnosisService.ts` : fonction `uploadImageForDiagnosis(fileUri | base64)` → appel API, retour typé.
   - Types : `PlantDiagnosisResult` (health_status, disease, confidence, treatment, urgency).
   - (Optionnel) Composant réutilisable `CameraCapture` ou usage direct de `expo-image-picker`.

4. **Intégration du bouton « + »**
   - Fichier à modifier : `src/navigation/components/CustomTabBar.tsx`.
   - Remplacer ou compléter `handleNewDiagnostic` pour qu’un appui sur « + » ouvre l’écran de diagnostic par photo (ou un modal de choix entre « Diagnostic parcelle » et « Diagnostic par photo »).

---

### 3.5 Intégration avec le reste de l’app (optionnel)

- **Diagnostic Service** : enregistrer chaque diagnostic par image (user, date, résultat) pour historique et cohérence avec les autres diagnostics.
- **Alertes** : si `urgency === "High"`, créer une alerte (notification ou liste) pour rappeler le traitement.
- **Marketplace** : le bouton « Voir produit » mène à une liste de produits (ex. fongicides) filtrée par maladie ou type de culture.

---

## 4. Ordre recommandé pour commencer

1. **Dataset** : télécharger PlantVillage (ou sous-ensemble), organiser `data/processed` et mapping des classes.
2. **Entraînement** : script train + export du modèle et `class_names.json`.
3. **API** : créer l’endpoint `POST /plant-diagnosis`, tester avec Postman/curl (image + réponse JSON).
4. **App** : écran de diagnostic par photo (sans encore brancher le « + »), test avec une URL de backend en dur.
5. **Bouton « + »** : brancher la navigation du FAB vers cet écran (ou vers le choix Diagnostic parcelle / Diagnostic photo).
6. **UX** : affinage visuel (feuille verte/rouge, boutons Traiter / Voir produit / Appeler).
7. **Optionnel** : liens Diagnostic / Alertes / Marketplace.

---

## 5. Fichiers et dossiers à créer (résumé)

| Où | Quoi |
|----|------|
| **Projet modèle (ex. `plant-diagnosis-model/`)** | `data/`, `training/train.py`, `export/` (modèle + `class_names.json`) |
| **Backend (ton API)** | Route `POST /api/plant-diagnosis`, chargement modèle + inférence |
| **App** | `src/screens/PlantDiagnosisScreen.tsx`, `src/services/plantDiagnosisService.ts`, types |
| **Navigation** | `AppNavigator` : nouvelle route ; `CustomTabBar.tsx` : action du bouton « + » |

---

## 6. Références rapides

- **PlantVillage** : [Kaggle](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset)
- **MobileNetV2 (PyTorch)** : `torchvision.models.mobilenet_v2`
- **Expo image/camera** : `expo-image-picker`, `expo-camera`
- **CustomTabBar (bouton « + »)** : `AgriMaliApp/src/navigation/components/CustomTabBar.tsx` — `handleNewDiagnostic` et `styles.fabButton` / `fabIcon`

Une fois ces étapes en place, le flux « appui sur + → photo → diagnostic maladie » sera opérationnel avec ton modèle custom.
