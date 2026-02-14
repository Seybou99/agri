# Utiliser l’API Cultures dans le front

Une fois l’API déployée (Vercel) et `API_URL` configuré dans `.env`, l’app utilise automatiquement les routes **cultures**, **calendrier**, **recommandations**, **rentabilité** et **icônes**. Sans API, tout fonctionne en local (données `plants.ts`).

---

## 1. Activer l’API

Dans le fichier **`.env`** à la racine du projet :

```env
API_URL=https://ton-projet.vercel.app
```

Sans slash final. Redémarrer Expo après modification :

```bash
npx expo start --clear
```

---

## 2. Où l’API est utilisée dans l’app

| Écran / zone | Donnée API | Route | Affichage |
|--------------|------------|--------|-----------|
| **Configuration du diagnostic** | Liste des cultures + icônes | `GET /api/v1/cultures`, `GET /api/v1/icons` | Grille de sélection (🌽 Maïs, 🧅 Oignon, etc.) |
| **Rapport de parcelle – Overview** | Recommandations par sol/climat | `POST /api/v1/recommendations` | Carte « Cultures recommandées (selon sol et climat) » avec scores /100 |
| **Rapport de parcelle – Overview** | Rentabilité / ha (Mali) | `GET /api/v1/profitability` | Carte « Rentabilité indicative (€/ha, Mali) » pour les cultures choisies |
| **Rapport de parcelle – Schedule** | Calendrier (semis, récolte) | `GET /api/v1/calendar?culture=...` | Colonnes Semis / Récolte dans le calendrier cultural |

---

## 3. Hooks et service

- **`src/services/culturesApi.ts`**  
  - `getBaseUrl()`, `fetchCultures()`, `fetchCalendar()`, `fetchIcons()`, `fetchRecommendations()`, `fetchProfitability()`, `isCulturesApiAvailable()`.

- **`useCulturesFromApi()`**  
  - Liste + icônes pour l’écran de config diagnostic. Fallback sur `plants.ts` si pas d’API.

- **`useCalendarFromApi(cropKeys)`**  
  - Calendrier (semis / récolte) par culture pour l’onglet Schedule. Fallback sur calcul local si pas d’API.

- **`useRecommendationsFromApi({ pluviometrieMm, region, ... })`**  
  - Recommandations pour la carte « Cultures recommandées » sur le rapport.

- **`useProfitabilityFromApi(cropIds)`**  
  - Rentabilité par culture pour la carte « Rentabilité indicative » sur le rapport.

---

## 4. Récolte et calendrier

- **Onglet Schedule** : les dates de **semis** et **récolte** viennent de l’API quand elle est disponible (`/api/v1/calendar?culture=mais` etc.). Sinon, calcul local à partir de `plants.ts` (mois de semis + `cycleLengthMonths`).
- Les **recommandations** et la **rentabilité** (y compris contexte « récolte » / revenus) viennent de l’API sur l’onglet Overview dès que `API_URL` est défini et que l’API répond.

---

## 5. Vérifier que l’API est bien utilisée

- **Config diagnostic** : si les cultures s’affichent après un court « Chargement des cultures… », la liste (et les icônes) viennent de l’API.
- **Rapport – Overview** : si les cartes « Cultures recommandées » et « Rentabilité indicative (€/ha, Mali) » s’affichent, les routes recommandations et profitability sont bien appelées.
- **Rapport – Schedule** : les mois Semis / Récolte sont ceux renvoyés par l’API pour chaque culture (ex. Maïs : Semis Mai–Juin, Récolte Sept–Oct).

En résumé : avec **`API_URL`** correct dans `.env`, le front utilise déjà toutes ces infos (cultures, récolte/calendrier, recommandations, rentabilité) ; sans `API_URL` ou en cas d’erreur, l’app reste utilisable avec les données locales.
