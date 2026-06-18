/**
 * Config Expo dynamique : APP_VARIANT du shell (npm run start:client) ou du .env.
 * react-native-dotenv seul ne voit pas APP_VARIANT=acheteur dans la commande npm.
 */
const appJson = require('./app.json');

function normalizeVariant(raw) {
  const v = String(raw ?? 'agriculteur')
    .trim()
    .toLowerCase();
  if (v === 'acheteur' || v === 'client' || v === 'buyer') return 'acheteur';
  return 'agriculteur';
}

module.exports = () => {
  const fromShell = process.env.APP_VARIANT;
  const appVariant = normalizeVariant(fromShell);
  const isBuyer = appVariant === 'acheteur';

  return {
    expo: {
      ...appJson.expo,
      name: isBuyer ? 'SeneGundo Marché' : appJson.expo.name,
      extra: {
        ...(appJson.expo.extra ?? {}),
        appVariant,
      },
    },
  };
};
