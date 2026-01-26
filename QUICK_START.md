# Guide de Démarrage Rapide - SeneGundo

## ✅ Installation terminée !

Les dépendances ont été installées avec succès. Voici les prochaines étapes pour démarrer l'application.

## 🚀 Démarrer l'application

### 1. Démarrer le serveur Expo
```bash
npm start
```

Cela ouvrira le serveur de développement Expo. Vous pouvez ensuite :
- Appuyer sur `i` pour ouvrir sur iOS Simulator (macOS uniquement)
- Appuyer sur `a` pour ouvrir sur Android Emulator
- Scanner le QR code avec l'app Expo Go sur votre téléphone

### 2. Tester sur votre téléphone
1. Installez **Expo Go** depuis l'App Store (iOS) ou Google Play (Android)
2. Scannez le QR code affiché dans le terminal
3. L'application se chargera sur votre téléphone

## ⚙️ Configuration requise

### Firebase (Optionnel pour l'instant)
Pour activer l'authentification et la base de données, vous devez :

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activer les services suivants :
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
3. Copier les clés dans le fichier `.env` :
   ```bash
   cp .env.example .env
   # Puis éditez .env avec vos clés Firebase
   ```

### Google Maps (Pour la carte interactive)
1. Obtenez une clé API sur [Google Cloud Console](https://console.cloud.google.com)
2. Activez les APIs suivantes :
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API
3. Ajoutez la clé dans `.env` :
   ```
   GOOGLE_MAPS_API_KEY=votre_cle_ici
   ```

## 📱 Fonctionnalités disponibles

### ✅ Actuellement fonctionnel
- ✅ Navigation par onglets (5 onglets)
- ✅ Écran d'accueil avec présentation des services
- ✅ Structure de base complète (modèles, services, hooks)
- ✅ Matching Engine (calcul des scores d'aptitude)
- ✅ Services agronomiques (SoilGrids, NASA POWER)

### 🚧 À venir
- 🚧 Écran de sélection de terrain (carte)
- 🚧 Écran de diagnostic complet
- 🚧 Système de paiement mobile
- 🚧 Marketplace
- 🚧 Académie
- 🚧 Diagnostic IA des maladies

## 🐛 Résolution de problèmes

### Erreur "Module not found"
Si vous voyez des erreurs d'import, vérifiez que tous les alias sont corrects dans :
- `tsconfig.json`
- `babel.config.js`

### Erreur Firebase
Si Firebase ne se connecte pas :
1. Vérifiez que les clés dans `.env` sont correctes
2. Vérifiez que le fichier `.env` existe (pas seulement `.env.example`)
3. Redémarrez le serveur Expo après modification de `.env`

### Erreur de navigation
Si les onglets ne s'affichent pas :
```bash
npm install @react-navigation/bottom-tabs
```

## 📚 Documentation

- [Plan d'implémentation](./IMPLEMENTATION_PLAN.md) : Roadmap complète
- [Architecture technique](./ARCHITECTURE.md) : Structure détaillée
- [README](./README.md) : Documentation principale

## 🎯 Prochaines étapes recommandées

1. **Tester l'application** : `npm start` et vérifier que tout fonctionne
2. **Configurer Firebase** : Pour activer l'authentification
3. **Créer l'écran de diagnostic** : Commencer par l'écran de sélection de terrain
4. **Intégrer les APIs** : Tester les appels aux APIs externes

## 💡 Astuce

Pour un développement plus fluide, utilisez :
- **Expo Dev Tools** : Ouvrez `http://localhost:19002` dans votre navigateur
- **React Native Debugger** : Pour déboguer l'application
- **Flipper** : Pour inspecter les requêtes réseau et l'état

---

**Bon développement ! 🌱**
