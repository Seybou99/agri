# API SeneGundo (Vercel Serverless)

## Base URL
En production : `https://<ton-projet>.vercel.app/api`  
En local : `vercel dev` puis `http://localhost:3000/api`

## Routes v1

| Méthode | Route | Description |
|---------|--------|-------------|
| GET | `/api/v1/health` | Santé de l’API |
| GET | `/api/v1/weather?lat=12.63&lng=-7.92` | Météo (proxy OpenWeather + cache 10 min) |
| POST | `/api/v1/diagnostics` | Créer un diagnostic (body: lat, lng, crops, surface_ha, …) |
| GET | `/api/v1/diagnostics?id=xxx` | Récupérer un diagnostic par id |
| POST | `/api/v1/report-pdf` | Export PDF rapport (body: rapport JSON) |
| GET | `/api/v1/cultures` | Liste cultures (`?categorie=`, `?rentable=true`, `?irrigue=true`) |
| GET | `/api/v1/cultures/:id` | Détail culture (ex. `/api/v1/cultures/oignon`) |
| GET | `/api/v1/calendar?culture=mais` | Calendrier cultural (semis, récolte) |
| GET | `/api/v1/profitability` | Rentabilité / ha (Mali, EUR) |
| GET | `/api/v1/icons` | Mapping culture → emoji + couleur (UX) |
| POST | `/api/v1/recommendations` | Reco par sol/climat (body: sol_type, pluviometrie_mm, irrigation?, region?) |

*Cultures, calendar, profitability, icons et recommendations sont servis par un seul handler `api/v1/[...slug].ts` pour rester sous la limite de 12 fonctions (plan Hobby Vercel).*

## Variables d’environnement (Vercel)
- `OPENWEATHER_API_KEY` : clé OpenWeather (pour `/api/v1/weather`)

## App mobile
Dans `.env` : `API_URL=https://<ton-projet>.vercel.app` pour appeler ces routes depuis l’app.
