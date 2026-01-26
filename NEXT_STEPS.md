# Prochaines étapes - Configuration React Native Firebase

## ✅ Ce qui a été fait

1. ✅ Configuration Firebase mise à jour pour React Native Firebase
2. ✅ Service d'authentification adapté à l'API React Native Firebase
3. ✅ Hook `useAuth` mis à jour avec les bons types
4. ✅ Plugin configuré dans `app.json`

## 🔧 Actions requises

### 1. Installer le module Auth

```bash
npx expo install @react-native-firebase/auth
```

### 2. Télécharger les fichiers de configuration Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet (ou créez-en un)
3. Téléchargez les fichiers de configuration :
   - **Android** : `google-services.json`
   - **iOS** : `GoogleService-Info.plist`

### 3. Générer les dossiers natifs

```bash
npx expo prebuild
```

Cela créera les dossiers `android/` et `ios/` nécessaires.

### 4. Copier les fichiers de configuration

**Pour Android** :
```bash
cp google-services.json android/app/google-services.json
```

**Pour iOS** :
```bash
cp GoogleService-Info.plist ios/GoogleService-Info.plist
```

### 5. Créer un build de développement

⚠️ **IMPORTANT** : React Native Firebase ne fonctionne **PAS** avec Expo Go. Vous devez créer un build natif.

**Pour Android** :
```bash
npx expo run:android
```

**Pour iOS** (macOS uniquement) :
```bash
npx expo run:ios
```

## 📝 Notes importantes

1. **Expo Go** : Ne fonctionne pas avec React Native Firebase. Utilisez un build de développement.

2. **Premier build** : Le premier build peut prendre 10-15 minutes car il compile tout le code natif.

3. **Simulateur/Émulateur** : Assurez-vous d'avoir un simulateur iOS ou un émulateur Android lancé avant d'exécuter `expo run`.

4. **Fichiers de configuration** : Les fichiers `google-services.json` et `GoogleService-Info.plist` contiennent des informations sensibles. Ne les commitez **JAMAIS** dans Git si vous utilisez un dépôt public. Ajoutez-les au `.gitignore`.

## 🐛 Résolution de problèmes

### Erreur "FirebaseApp not initialized"
- Vérifiez que les fichiers de configuration sont bien placés dans les bons dossiers
- Vérifiez que `npx expo prebuild` a été exécuté

### Erreur "Module not found"
- Vérifiez que tous les modules sont installés : `npm install`
- Vérifiez que le plugin est dans `app.json`

### Build échoue
- Nettoyez le cache : `npx expo start --clear`
- Supprimez les dossiers `android/` et `ios/` et relancez `npx expo prebuild`

## 📚 Documentation

- [React Native Firebase](https://rnfirebase.io/)
- [Expo + Firebase](https://docs.expo.dev/guides/using-firebase/)
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) : Guide détaillé
