# Configuration Firebase avec React Native Firebase

## 📋 Vue d'ensemble

Vous avez choisi d'utiliser **React Native Firebase** au lieu du SDK web Firebase. C'est une excellente décision pour les applications React Native car cela offre de meilleures performances et fonctionnalités natives.

## 🔧 Configuration requise

### 1. Installer le module Auth (si pas déjà fait)

```bash
npx expo install @react-native-firebase/auth
```

### 2. Configuration native

React Native Firebase nécessite des fichiers de configuration natifs :

#### Pour Android : `google-services.json`
1. Téléchargez le fichier depuis [Firebase Console](https://console.firebase.google.com)
2. Placez-le dans `android/app/google-services.json`

#### Pour iOS : `GoogleService-Info.plist`
1. Téléchargez le fichier depuis Firebase Console
2. Placez-le dans `ios/GoogleService-Info.plist`

### 3. Générer les dossiers natifs

Expo utilise un système de "prebuild" pour générer les dossiers natifs :

```bash
npx expo prebuild
```

Cela créera les dossiers `android/` et `ios/` avec la configuration nécessaire.

### 4. Configuration dans app.json

Le plugin est déjà configuré dans votre `app.json` :

```json
{
  "plugins": [
    "@react-native-firebase/app"
  ]
}
```

## 📝 Différences avec le SDK web

### API différente

React Native Firebase utilise une API différente :

**SDK Web (ancien)** :
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
await signInWithEmailAndPassword(auth, email, password);
```

**React Native Firebase (nouveau)** :
```typescript
import auth from '@react-native-firebase/auth';
await auth().signInWithEmailAndPassword(email, password);
```

### Firestore différente

**SDK Web** :
```typescript
import { doc, getDoc } from 'firebase/firestore';
const docRef = doc(db, 'users', uid);
const docSnap = await getDoc(docRef);
```

**React Native Firebase** :
```typescript
import firestore from '@react-native-firebase/firestore';
const docSnap = await firestore().collection('users').doc(uid).get();
```

## ✅ Avantages de React Native Firebase

1. **Performance native** : Meilleures performances que le SDK web
2. **Fonctionnalités natives** : Accès aux fonctionnalités natives de Firebase
3. **Offline-first** : Meilleure gestion du mode hors-ligne
4. **Notifications push** : Intégration native avec FCM

## ⚠️ Notes importantes

1. **Expo Go** : React Native Firebase ne fonctionne **PAS** avec Expo Go. Vous devez créer un build de développement :
   ```bash
   npx expo run:android
   # ou
   npx expo run:ios
   ```

2. **Prebuild requis** : Vous devez exécuter `npx expo prebuild` avant de pouvoir utiliser React Native Firebase.

3. **Build natif** : Pour tester, vous devez créer un build natif, pas utiliser Expo Go.

## 🚀 Prochaines étapes

1. Installer le module auth :
   ```bash
   npx expo install @react-native-firebase/auth
   ```

2. Télécharger les fichiers de configuration depuis Firebase Console

3. Exécuter prebuild :
   ```bash
   npx expo prebuild
   ```

4. Copier les fichiers de configuration dans les dossiers natifs

5. Créer un build de développement :
   ```bash
   npx expo run:android
   # ou
   npx expo run:ios
   ```

## 📚 Documentation

- [React Native Firebase Docs](https://rnfirebase.io/)
- [Expo + React Native Firebase](https://docs.expo.dev/guides/using-firebase/)
