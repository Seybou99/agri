# Résoudre le problème GitHub - Secret détecté

GitHub a détecté une clé secrète dans `keys/gee-sa.json` et bloque le push. C'est une **bonne chose** - GitHub protège contre les fuites de secrets.

## Solution

### 1. Retirer le fichier de Git (sans le supprimer localement)

```bash
cd "/Users/doumbia/Desktop/Agri mali/AgriMaliApp"
git rm --cached keys/gee-sa.json
```

### 2. Vérifier que le fichier est bien ignoré

```bash
git status
```

Tu ne devrais **pas** voir `keys/gee-sa.json` dans la liste.

### 3. Ajouter le changement au commit

```bash
git add .gitignore
git commit --amend -m "Initial commit - Remove secrets"
```

Ou créer un nouveau commit :
```bash
git add .gitignore
git commit -m "Remove secret keys from repository"
```

### 4. Pousser à nouveau

```bash
git push -u origin main
```

---

## Si le problème persiste

Si GitHub bloque encore, c'est que le secret est dans l'historique Git. Tu dois :

### Option A : Révoquer la clé (recommandé)

1. Va sur [Google Cloud Console](https://console.cloud.google.com)
2. **IAM & Admin** → **Service Accounts**
3. Sélectionne le compte de service
4. **Keys** → Supprime l'ancienne clé
5. Crée une **nouvelle clé** et télécharge-la
6. Remplace `keys/gee-sa.json` localement

### Option B : Autoriser le push (non recommandé)

Si tu es sûr que la clé est déjà compromise, tu peux autoriser le push via le lien fourni par GitHub :
```
https://github.com/Seybou99/agri/security/secret-scanning/unblock-secret/38nNdxpe9hatcEHLQ9ODfIOmwJ7
```

**⚠️ ATTENTION** : Ne fais cela que si tu as déjà révoqué la clé et créé une nouvelle.

---

## Prévention

Pour éviter ce problème à l'avenir :

1. **Toujours** vérifier `.gitignore` avant le premier commit
2. **Ne jamais** commiter :
   - Clés API
   - Fichiers `.env` avec secrets
   - Certificats / clés privées
   - Tokens d'accès

3. Utiliser des **variables d'environnement** ou des **secrets managers** (Vercel Secrets, GitHub Secrets, etc.)

---

## Fichiers à ne jamais commiter

- `keys/*.json` (clés GEE, Firebase, etc.)
- `.env` (variables d'environnement avec secrets)
- `*.pem`, `*.key` (clés privées)
- `*-credentials.json` (credentials Google Cloud)

Tous ces fichiers sont déjà dans `.gitignore`.
