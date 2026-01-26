# Configuration Firebase pour déployer les Cloud Functions

## 1. Se connecter à Firebase CLI

```bash
firebase login --reauth
```

Cela ouvrira ton navigateur pour t'authentifier avec ton compte Google.

## 2. Vérifier / Créer le projet Firebase

### Option A : Le projet `gestion-94304` existe déjà

Si tu as déjà créé ce projet sur [Firebase Console](https://console.firebase.google.com) :

```bash
firebase use gestion-94304
```

### Option B : Créer un nouveau projet

1. Va sur [Firebase Console](https://console.firebase.google.com)
2. Clique sur **"Ajouter un projet"** ou **"Add project"**
3. Suis les étapes (nom, Google Analytics si besoin)
4. Note l'**ID du projet** (ex. `mon-projet-agricol-12345`)

Ensuite, mets à jour `.firebaserc` avec le bon ID :

```json
{
  "projects": {
    "default": "ton-projet-id-ici"
  }
}
```

Et dans `.env`, mets à jour `FIREBASE_PROJECT_ID` si nécessaire.

## 3. Activer les Cloud Functions

Dans Firebase Console → ton projet → **Functions** :
- Si c'est la première fois, clique sur **"Get started"** ou **"Commencer"**
- Cela active l'API Cloud Functions pour ton projet

## 4. Vérifier la configuration

```bash
firebase projects:list
```

Tu devrais voir ton projet dans la liste.

```bash
firebase use
```

Affiche le projet actif.

## 5. Configurer la clé GEE pour les Cloud Functions

La fonction `getSoilFromGEE` a besoin de la clé JSON du compte de service GEE.

**Option A : Copier la clé dans `functions/keys/`**
```bash
cp ../keys/gee-sa.json functions/keys/gee-sa.json
```

**Option B : Utiliser une variable d'environnement**
Dans Firebase Console → Functions → Configuration, ajoute :
- `GOOGLE_APPLICATION_CREDENTIALS` = chemin vers la clé (dans Cloud Storage ou Secret Manager)
- `GEE_PROJECT_ID` = `my-project-agricol`

Pour le développement local, crée un `.env` dans `functions/` :
```bash
GOOGLE_APPLICATION_CREDENTIALS=../keys/gee-sa.json
GEE_PROJECT_ID=my-project-agricol
```

## 6. Vérifier les permissions GEE

Le compte de service (celui de `gee-sa.json`) doit avoir le rôle **Earth Engine Resource Viewer** dans Google Earth Engine :

1. Va sur [Earth Engine](https://earthengine.google.com)
2. Settings → User management (ou via [GEE Registry](https://signup.earthengine.google.com/))
3. Ajoute l'email du compte de service (ex. `agri-73@my-project-agricol.iam.gserviceaccount.com`)
4. Donne-lui le rôle **Earth Engine Resource Viewer**

## 7. Déployer les Functions

Une fois tout configuré :

```bash
cd functions
npm install  # si pas déjà fait
npm run build
cd ..
firebase deploy --only functions
```

Après le déploiement, tu obtiendras une URL comme :
```
https://us-central1-gestion-94304.cloudfunctions.net/getSoilFromGEE
```

Teste avec :
```bash
curl "https://us-central1-gestion-94304.cloudfunctions.net/getSoilFromGEE?lat=12.63&lng=-7.92"
```

---

**Note** : Si tu utilises un projet Google Cloud différent pour GEE (`my-project-agricol`), c'est normal. Firebase et GEE peuvent utiliser des projets différents. Assure-toi juste que le compte de service GEE a les droits nécessaires.
