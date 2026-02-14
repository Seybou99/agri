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
| POST | `/api/v1/report-pdf` | Export PDF rapport (body: rapport JSON) — à compléter |

## Variables d’environnement (Vercel)
- `OPENWEATHER_API_KEY` : clé OpenWeather (pour `/api/v1/weather`)

## App mobile
Dans `.env` : `API_URL=https://<ton-projet>.vercel.app` pour appeler ces routes depuis l’app.
