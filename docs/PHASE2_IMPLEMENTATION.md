# Phase 2 — Inclusion (SeneGundo)

Plan d’implémentation pour la Phase 2 du document RECOMMANDATIONS_ET_MODIFICATIONS.md.

## Objectifs Phase 2

- **Audio** sur les écrans clés (accueil, diagnostic, météo, marketplace).
- **Sélecteur visuel** : cultures (icônes) + surface Petit / Moyen / Grand.
- **Score visuel** 🔴🟡🟢 + recommandation vocale.
- **Mode offline** : cache diagnostic + Académie téléchargeable.
- *(Bouton « Je suis ici » et GPS par défaut : déjà fait en Phase 0.)*

---

## 1. Sélecteur visuel cultures + surface P/M/G

**Fichier** : `src/screens/DiagnosticConfigScreen.tsx`

- [x] **Surface** : 3 boutons visuels **Petit** (≈ 0,5 ha), **Moyen** (≈ 2 ha), **Grand** (≈ 5 ha) avec zone de touch ≥ 48 px. Option « Autre » pour saisie manuelle en ha.
- [x] **Cultures** : sélection par **icônes + nom** (ex. 🌽 Maïs, 🍚 Riz), zones de touch ≥ 48 px, multi-sélection conservée.

**Constantes** : `src/constants/plants.ts` ou `DiagnosticConfigScreen` — mapping culture → emoji / libellé court.

---

## 2. Score visuel 🔴🟡🟢 + recommandation vocale

**Fichiers** : `src/components/fieldReport/AnalysisSection.tsx`, résumé score sur `FieldReportScreen` (Overview).

- [x] **Indicateur couleur** : score &lt; 5 → 🔴 Faible, 5–6,5 → 🟡 Moyen, ≥ 6,5 → 🟢 Élevé / Très élevé (aligné sur `matchingEngine`) — dans `AnalysisSection`.
- [ ] **Recommandation vocale** (optionnel Phase 2) : lecture à voix haute de la phrase d’aptitude via TTS ou audio pré-enregistré (prévu avec expo-av).

---

## 3. Audio sur les écrans clés

**Dépendance** : `expo-av` (Audio.Sound) pour courtes confirmations.

- [ ] **Accueil** : court message vocal au premier lancement ou sur CTA diagnostic (optionnel).
- [ ] **Diagnostic** : confirmation vocale après « Lancer le diagnostic » et/ou à l’arrivée sur le rapport (« Diagnostic prêt »).
- [ ] **Météo / Marketplace** : confirmation courte sur action principale (ex. « Météo chargée », « Produit ajouté au panier »).
- [ ] **Retour haptique** : déjà en place (Phase 0) ; conserver sur tous les CTA principaux.

---

## 4. Mode offline

- [ ] **Cache diagnostic** : stocker en local (AsyncStorage ou SQLite) le dernier diagnostic par parcelle (coords + résultats) ; afficher en lecture seule si pas de réseau au chargement.
- [ ] **Académie** : structure pour contenus téléchargeables (audio par langue) ; écran liste + téléchargement « pour usage hors ligne » (fichiers en `expo-file-system`).
- [ ] **Indicateur** « En attente de connexion » si action nécessitant le réseau (sync, météo, etc.).

---

## Ordre recommandé

1. Sélecteur visuel (surface P/M/G + cultures icônes) — **fait**
2. Score 🔴🟡🟢 sur rapport
3. Audio (expo-av + 1–2 confirmations pilotes)
4. Cache diagnostic + structure Académie offline

---

*Document à mettre à jour au fil des livraisons Phase 2.*
