// Configuration Google Earth Engine – SeneGundo
// L'app mobile n'appelle pas GEE directement. Usage prévu : Cloud Functions (backend).
// Credentials (JSON) et GOOGLE_APPLICATION_CREDENTIALS : côté backend uniquement.
// Voir docs/EARTH_ENGINE_SETUP.md

const GEE_PROJECT_ID = typeof process !== 'undefined' && process.env?.GEE_PROJECT_ID
  ? process.env.GEE_PROJECT_ID
  : '';

/** True si un projet GEE est configuré (backend). */
export const geeConfigured = Boolean(GEE_PROJECT_ID);

/** ID du projet Google Cloud utilisé pour Earth Engine. */
export const geeProjectId = GEE_PROJECT_ID;
