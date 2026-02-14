# 🌤️ Guide d'Installation et Utilisation - Écrans Météo Modernes

## 📋 Vue d'ensemble

Ce guide décrit l'installation et l'utilisation des 3 nouveaux écrans météo modernes basés sur la maquette Apple Weather :

1. **WeatherHomeScreen** - Écran principal "Today" avec carte météo principale
2. **Next7DaysScreen** - Écran prévisions sur 7 jours
3. **ForecastScreen** - Écran avec graphique de température et villes populaires

## 🛠️ Installation des dépendances

### Dépendances requises

Les dépendances suivantes doivent être installées :

```bash
# Gradients et effets visuels
npm install expo-linear-gradient
npm install expo-blur

# Graphiques (optionnel, si vous voulez utiliser une librairie externe)
# npm install react-native-chart-kit
# ou
# npm install victory-native
```

### Vérification des dépendances existantes

Vérifiez que ces packages sont déjà installés dans votre `package.json` :

- `expo-linear-gradient` (~15.0.8)
- `expo-blur` (~15.0.0)
- `react-native-svg` (15.12.1)
- `expo-location` (~19.0.8)

## 📁 Structure des fichiers créés

```
src/
├── types/
│   └── weather.ts                    # Types TypeScript pour les données météo
├── services/
│   └── weather/
│       └── weatherService.ts         # Service météo complet avec Air Quality
├── components/
│   └── weather/
│       ├── WeatherIcon.tsx           # Composant icône météo 3D
│       ├── AirQualityCard.tsx        # Carte qualité de l'air
│       ├── WeatherIndicators.tsx     # Indicateurs (Wind, Humidity, Visibility)
│       └── TemperatureChart.tsx      # Graphique de température
└── screens/
    ├── WeatherHomeScreen.tsx         # Écran Today
    ├── Next7DaysScreen.tsx           # Écran 7 jours
    └── ForecastScreen.tsx            # Écran Forecast
```

## 🚀 Configuration

### 1. Configuration de la navigation

Ajoutez les nouveaux écrans à votre navigation dans `AppNavigator.tsx` :

```typescript
import { WeatherHomeScreen } from './screens/WeatherHomeScreen';
import { Next7DaysScreen } from './screens/Next7DaysScreen';
import { ForecastScreen } from './screens/ForecastScreen';

// Dans votre Stack Navigator
<Stack.Screen name="WeatherHome" component={WeatherHomeScreen} />
<Stack.Screen name="Next7Days" component={Next7DaysScreen} />
<Stack.Screen name="Forecast" component={ForecastScreen} />
```

### 2. Configuration de la clé API OpenWeatherMap

Assurez-vous que votre fichier `.env` contient :

```env
OPENWEATHER_API_KEY=votre_cle_api_ici
```

**Note importante** : Pour utiliser l'API Air Quality, vous devez avoir un plan OpenWeatherMap qui inclut cette fonctionnalité (généralement le plan payant). Sinon, les données mock seront utilisées.

### 3. Configuration des types

Les types sont définis dans `src/types/weather.ts`. Assurez-vous que votre `tsconfig.json` inclut ce chemin :

```json
{
  "compilerOptions": {
    "paths": {
      "@types/*": ["./src/types/*"]
    }
  }
}
```

## 📱 Utilisation des écrans

### Écran 1 : WeatherHomeScreen (Today)

**Fonctionnalités :**
- Carte principale avec gradient bleu (#60A5FA → #3B82F6)
- Grande icône météo 3D au centre
- Température géante (96-120pt)
- Indicateurs : Wind, Humidity, Visibility
- Scroll horizontal avec prévisions horaires
- Section Air Quality avec score circulaire

**Navigation :**
```typescript
navigation.navigate('WeatherHome');
```

**Props :** Aucune (utilise la localisation de l'utilisateur ou la position GPS)

### Écran 2 : Next7DaysScreen

**Fonctionnalités :**
- Fond sombre (#1F1F1F)
- Carte bleue en haut pour demain avec grande icône
- Liste des 7 jours suivants avec icônes et températures

**Navigation :**
```typescript
navigation.navigate('Next7Days');
```

### Écran 3 : ForecastScreen

**Fonctionnalités :**
- Fond sombre (#1F1F1F)
- Header bleu avec ville et date
- Graphique en courbe de température
- Section "Popular Cities" avec cartes glassmorphism

**Navigation :**
```typescript
navigation.navigate('Forecast');
```

## 🎨 Personnalisation du design

### Couleurs

Les couleurs principales sont définies dans les styles de chaque écran :

- **Gradient bleu principal** : `['#60A5FA', '#3B82F6']`
- **Fond sombre** : `#1F1F1F`
- **Texte blanc** : `#FFFFFF` avec opacités variables

### Typographie

- **Température principale** : 120pt, font-weight 200
- **Titres de section** : 16-18pt, font-weight 600
- **Températures secondaires** : 18-24pt, font-weight 300-500
- **Labels** : 12-14pt, opacité 70%

### Border Radius

- **Cartes principales** : 24px
- **Petites cartes** : 16-20px
- **Boutons** : 16px

## 🔧 Composants réutilisables

### WeatherIcon

```typescript
import { WeatherIcon } from '@components/weather';

<WeatherIcon icon="02d" size={80} />
```

### WeatherIndicators

```typescript
import { WeatherIndicators } from '@components/weather';

<WeatherIndicators
  windSpeed={9}
  humidity={25}
  visibility={1.7}
/>
```

### AirQualityCard

```typescript
import { AirQualityCard } from '@components/weather';

<AirQualityCard airQuality={airQualityData} />
```

### TemperatureChart

```typescript
import { TemperatureChart } from '@components/weather';

<TemperatureChart data={temperatureDataPoints} />
```

## 📊 Service météo

Le service `weatherService.ts` fournit les fonctions suivantes :

```typescript
import {
  fetchCurrentWeather,
  fetchHourlyForecast,
  fetch7DayForecast,
  fetchAirQuality,
  fetchTemperatureChartData,
  fetchPopularCities,
} from '@services/weather/weatherService';

// Exemple d'utilisation
const weather = await fetchCurrentWeather(lat, lng);
const hourly = await fetchHourlyForecast(lat, lng);
const weekly = await fetch7DayForecast(lat, lng);
const airQuality = await fetchAirQuality(lat, lng);
const chartData = await fetchTemperatureChartData(lat, lng);
const cities = await fetchPopularCities();
```

## 🐛 Gestion des erreurs

Tous les services incluent une gestion d'erreur robuste :

- **Fallback automatique** vers des données mock en cas d'erreur API
- **Gestion des clés API manquantes**
- **Gestion des erreurs réseau**
- **Logs d'erreur détaillés en console**

## 📱 Responsive Design

Les écrans sont conçus pour être responsive :

- **Petits écrans** : Adaptation automatique des tailles de police
- **Grands écrans** : Utilisation optimale de l'espace disponible
- **Orientation** : Support portrait (landscape peut nécessiter des ajustements)

## 🎯 Fonctionnalités avancées

### Localisation automatique

Les écrans utilisent automatiquement :
1. La localisation du profil utilisateur (si disponible)
2. La position GPS actuelle (avec permission)
3. Une localisation par défaut (Sydney) en fallback

### Données mock

En cas d'erreur API ou de clé manquante, des données mock réalistes sont utilisées pour permettre le développement et les tests.

### Performance

- **Lazy loading** des données
- **Mise en cache** des prévisions (peut être ajouté)
- **Optimisation des re-renders** avec React.memo si nécessaire

## 🔍 Dépannage

### Problème : Les données ne se chargent pas

1. Vérifiez votre clé API dans `.env`
2. Vérifiez la connexion internet
3. Consultez les logs de la console pour les erreurs détaillées

### Problème : Le graphique ne s'affiche pas

1. Vérifiez que `react-native-svg` est installé
2. Vérifiez que les données sont au bon format
3. Vérifiez les dimensions de l'écran

### Problème : Les effets glassmorphism ne fonctionnent pas sur Android

C'est normal ! Un fallback avec fond semi-transparent est automatiquement utilisé sur Android.

## 📚 Ressources

- [Documentation OpenWeatherMap API](https://openweathermap.org/api)
- [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- [Expo Blur](https://docs.expo.dev/versions/latest/sdk/blur/)
- [React Native SVG](https://github.com/react-native-svg/react-native-svg)

## ✅ Checklist d'implémentation

- [x] Types TypeScript créés
- [x] Service météo complet avec Air Quality
- [x] Composants réutilisables créés
- [x] 3 écrans créés (Today, Next 7 Days, Forecast)
- [x] Graphique de température implémenté
- [x] Design glassmorphism appliqué
- [x] Gradients dynamiques selon météo
- [x] Gestion d'erreurs et fallback mock
- [x] Documentation complète

## 🎉 Prêt à l'emploi !

Tous les fichiers sont créés et prêts à être utilisés. Il ne reste plus qu'à :

1. Ajouter les écrans à votre navigation
2. Tester sur un appareil réel ou simulateur
3. Personnaliser les couleurs/styles si nécessaire

Bon développement ! 🚀
