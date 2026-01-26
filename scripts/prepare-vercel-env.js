#!/usr/bin/env node

/**
 * Script pour préparer la variable d'environnement GEE_SERVICE_ACCOUNT_JSON pour Vercel
 * Usage: node scripts/prepare-vercel-env.js
 */

const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, '..', 'keys', 'gee-sa.json');

if (!fs.existsSync(keyPath)) {
  console.error(`❌ Fichier non trouvé: ${keyPath}`);
  console.error('Assure-toi que keys/gee-sa.json existe.');
  process.exit(1);
}

try {
  const keyContent = fs.readFileSync(keyPath, 'utf8');
  const key = JSON.parse(keyContent);
  
  console.log('\n✅ Clé GEE chargée avec succès\n');
  console.log('=== Variable: GEE_SERVICE_ACCOUNT_JSON ===');
  console.log(JSON.stringify(key));
  console.log('\n=== Instructions ===');
  console.log('1. Copie la ligne JSON ci-dessus');
  console.log('2. Va sur Vercel Dashboard → Settings → Environment Variables');
  console.log('3. Ajoute GEE_SERVICE_ACCOUNT_JSON avec la valeur copiée');
  console.log('4. Coche Production, Preview, Development');
  console.log('5. Redéploie: vercel --prod\n');
} catch (e) {
  console.error('❌ Erreur:', e.message);
  process.exit(1);
}
