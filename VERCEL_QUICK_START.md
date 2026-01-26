# Déploiement Vercel - Guide Rapide

## ✅ Étape 1 : Configurer les variables d'environnement

Tu as déjà un projet Vercel lié (`diokolo`). Maintenant, configure les variables d'environnement.

### Option A : Via Dashboard (recommandé)

1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionne le projet **diokolo**
3. **Settings** → **Environment Variables**
4. Ajoute ces deux variables :

   **Variable 1 :**
   - Name: `GEE_SERVICE_ACCOUNT_JSON`
   - Value: Copie le JSON complet affiché par `node scripts/prepare-vercel-env.js`
     (c'est une seule ligne très longue)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2 :**
   - Name: `GEE_PROJECT_ID`
   - Value: `my-project-agricol`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. Clique sur **Save**

### Option B : Via CLI

```bash
# 1. Préparer la clé JSON (une ligne)
node scripts/prepare-vercel-env.js

# 2. Ajouter GEE_SERVICE_ACCOUNT_JSON
vercel env add GEE_SERVICE_ACCOUNT_JSON
# Colle le JSON complet (une ligne très longue)
# Sélectionne: Production, Preview, Development

# 3. Ajouter GEE_PROJECT_ID
vercel env add GEE_PROJECT_ID
# my-project-agricol
# Sélectionne: Production, Preview, Development
```

---

## ✅ Étape 2 : Déployer

```bash
vercel --prod
```

Ou simplement :
```bash
vercel
```

---

## ✅ Étape 3 : Tester

Après le déploiement, Vercel te donnera une URL comme :
```
https://diokolo.vercel.app/api/getSoilFromGEE?lat=12.63&lng=-7.92
```

Teste dans le navigateur ou avec curl :
```bash
curl "https://diokolo.vercel.app/api/getSoilFromGEE?lat=12.63&lng=-7.92"
```

Réponse attendue :
```json
{
  "ph": 6.5,
  "clay": 20,
  "sand": 40,
  "silt": 40,
  "organicCarbon": 1.0,
  "nitrogen": 0.5,
  "phosphorus": 10,
  "potassium": 0.2,
  "texture": "limoneux"
}
```

---

## 🔧 Si tu as encore l'erreur "Secret does not exist"

J'ai corrigé `vercel.json` pour retirer la référence au secret. Si l'erreur persiste :

1. Supprime le fichier `.vercel` et relance :
   ```bash
   rm -rf .vercel
   vercel
   ```

2. Ou configure les variables d'environnement d'abord (étape 1), puis déploie.

---

## 📝 Note importante

Le JSON de la clé GEE est très long (une seule ligne). Assure-toi de copier **tout** le JSON, du `{` au `}`, sans retours à la ligne.

Pour obtenir le JSON formaté sur une ligne :
```bash
node scripts/prepare-vercel-env.js
```
