// Configuration Metro pour Expo
// https://docs.expo.dev/guides/customizing-metro/

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Assurer que Metro ignore correctement les fichiers d'images
// Les extensions sont case-insensitive par défaut, mais on les ajoute explicitement
const assetExts = config.resolver.assetExts || [];
if (!assetExts.includes('PNG')) assetExts.push('PNG');
if (!assetExts.includes('JPG')) assetExts.push('JPG');
if (!assetExts.includes('JPEG')) assetExts.push('JPEG');

config.resolver.assetExts = assetExts;

// S'assurer que les fichiers d'images ne sont pas traités comme du code source
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  ext => !['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'].includes(ext)
);

module.exports = config;
