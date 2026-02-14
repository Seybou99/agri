# Recommandations backend & modifications – SeneGundo

Ce document consolide les **spécifications backend recommandées**, un **avis synthétique** et une **liste de modifications** à intégrer pour faire évoluer l’application (scalabilité, UX inclusive, offline, paiements, agents terrain).

---

## 0. Phase 0 — Plus simple (sans backend)

À faire en premier, uniquement dans l’app :

- [x] **Bouton « Je suis ici »** sur l’écran carte diagnostic : un seul tap pour centrer la carte et placer le marqueur sur la position GPS (sans passer par l’onglet Position).
- [x] **Retour haptique** (vibration) sur les boutons principaux : lancement diagnostic, « Je suis ici », Continuer, ajout au panier, passer commande.
- [ ] **Tailles accessibilité** : s’assurer que les CTA principaux (tabs, bouton diagnostic, Continuer) ont une zone de touch ≥ 48 px et texte ≥ 18 pt où c’est critique.

Ensuite : Phase 1 (backend), Phase 2 (inclusion audio/offline), Phase 3 (monétisation).

---

## 1. Avis sur les spécifications initiales

### Points forts
- **Backend d’orchestration** : Centraliser les appels (Diagnostic, Météo, Marketplace, Paiements) dans une API Gateway + microservices est pertinent pour la scalabilité, la sécurité et la maintenance.
- **UX inclusive (analphabètes)** : Priorité audio, icônes, couleurs, boutons “Je suis ici”, surface en Petit/Moyen/Grand, score visuel 🔴🟡🟢 est très aligné avec un usage rural réel.
- **Mode offline** : Indispensable pour zones à faible couverture ; cache diagnostic/météo et contenu Académie téléchargeable sont les bons leviers.
- **Agents terrain** : App dédiée (création de comptes, diagnostics, encaissement) est un bon modèle pour déployer sans exiger smartphone + littératie pour tous.
- **Roadmap en 3 phases** : Renforcer l’existant → Inclusion → Monétisation est un ordre cohérent.
- **Multilingue vocal** (Bambara, Peul, Soninké, français) avec audio pré-enregistré plutôt que TTS en ligne est réaliste pour coût et offline.

### Points à nuancer ou renforcer
- **Microservices** : Pour une petite équipe, commencer par un **backend monolithique bien structuré** (modules Diagnostic / Météo / Marketplace / Users) est plus réaliste ; découper en microservices plus tard si besoin.
- **Data Lake** : Pour une première version, une **base relationnelle (PostgreSQL)** + éventuellement stockage fichiers (rapports, images) suffit ; “Data Lake” peut rester une évolution.
- **Cache Redis** : Utile pour météo et sessions ; à prévoir tôt dans l’architecture.
- **Paiement (mobile money, escrow)** : Très important pour la confiance ; à spécifier dès la Phase 2 (prototype) même si la monétisation complète vient en Phase 3.
- **Sécurité & confiance** : Badge “Acheteur vérifié”, photo vendeur, historique sont essentiels ; on peut ajouter **notation/avis** et **modération des annonces**.

---

## 2. Architecture cible (rappel)

```
Mobile App (Expo)
        ↓
API Gateway
        ↓
Backend (monolithique modulaire puis microservices si besoin)
 ├ Diagnostic Engine
 ├ Weather Service
 ├ Marketplace
 ├ Payments
 ├ User Profiles
        ↓
Redis (cache) + PostgreSQL + Stockage fichiers
```

---

## 3. Liste des modifications à rajouter

### 3.1 Backend & architecture
- [ ] **API Gateway** : Rate limiting, auth JWT, versioning (`/v1/`) dès le début.
- [ ] **Backend monolithique modulaire** en Phase 1 (Diagnostic, Météo, Marketplace, Users, Orders) avant microservices.
- [ ] **Queue (ex. Bull/Redis)** pour jobs longs : calcul diagnostic, génération rapport PDF, envoi alertes.
- [ ] **Webhooks ou polling** pour statut paiement mobile money (Orange Money, etc.).
- [ ] **Logs structurés + monitoring** (ex. erreurs API, temps de réponse) pour debug et scaling.

### 3.2 Base de données
- [ ] **Table `Products`** : `seller_id`, `category`, `price`, `unit`, `location`, `stock`, `photos`, `audio_url`.
- [ ] **Table `Alerts`** : `user_id`, `type` (pluie, sécheresse, marché), `channel` (push, SMS), `delivered_at`.
- [ ] **Table `AcademyContent`** : `id`, `title_audio_url`, `lang`, `duration`, `category`, `offline_available`.
- [ ] **Table `AgentActions`** : pour tracer création de comptes, diagnostics, encaissements par agent.
- [ ] **Index** sur `Fields(gps)` (ou zone géographique) et `Orders(created_at, status)` pour perfs.

**Tables principales (rappel)**  
- `Users` : id, téléphone, langue, rôle, localisation  
- `Fields` : id, user_id, gps, surface, sol_type  
- `Diagnostics` : field_id, score, cultures, recommandations  
- `Orders` : buyer_id, seller_id, statut, paiement  

### 3.3 Diagnostic
- [ ] **Versioning des modèles** (formule score, seuils) pour pouvoir corriger sans casser l’historique.
- [ ] **Export PDF du rapport** côté backend (template + données) pour partage et impression.
- [ ] **Historique des diagnostics par parcelle** (évolution du score dans le temps).
- [ ] **Recommandations “prochaine action”** (ex. “Semer dans 2 semaines”) en plus du score.

### 3.4 Météo
- [ ] **Alertes configurables** : seuils (pluie > X mm, vent fort) et choix de la langue/voix.
- [ ] **Prévisions “saison agricole”** (début/fin pluies) en plus du 7 jours.
- [ ] **Fallback SMS** : envoi d’un code court (ex. “SG METEO”) pour recevoir la météo du jour par SMS si pas d’app.

### 3.5 Marketplace
- [ ] **Recherche par zone** (rayon autour de la position ou choix de village/région).
- [ ] **Filtres visuels** : par icône (céréale, légume, intrant) plutôt que listes de texte.
- [ ] **Chat ou appel** intégré (ou lien “Appeler”) entre acheteur et vendeur.
- [ ] **Suivi de commande** : statuts simples (Reçue, En préparation, En livraison, Livrée) avec icônes.
- [ ] **Gestion stock vendeur** : mise à jour après vente, alerte “stock faible”.

### 3.6 Paiements
- [ ] **Support multi-opérateurs** : Orange Money, Moov, etc., via une couche d’abstraction.
- [ ] **Escrow** : déblocage après confirmation “livré” ou délai + litige.
- [ ] **Wallet interne** : solde affiché en gros chiffres + historique simple (entrée/sortie).
- [ ] **Reçus** : génération PDF ou image “Vous avez payé X à Y le …”.

### 3.7 UX inclusive (analphabètes)
- [ ] **Tutoriel initial** : 3–4 écrans avec uniquement icônes + audio (“Touche ici pour lancer un diagnostic”).
- [ ] **Retour haptique** (vibration) sur les boutons importants (validation, paiement).
- [ ] **Confirmation vocale** après action (ex. “Diagnostic enregistré”, “Produit ajouté au panier”).
- [ ] **Pas de dépendance à l’écriture** : pas de champs texte obligatoires pour les actions principales (sauf numéro de téléphone si nécessaire).
- [ ] **Thème “contraste élevé”** (option) pour malvoyants.

### 3.8 Académie
- [ ] **Catégories visuelles** : Semis, Fertilisation, Irrigation, Récolte, etc., avec icônes.
- [ ] **Durée affichée** sur chaque leçon (ex. “2 min”) pour connexion limitée.
- [ ] **Téléchargement par langue** (Bambara, Peul, Soninké, français) pour usage offline.
- [ ] **Quiz ou validation simple** (ex. 2 choix) à la fin pour renforcer l’apprentissage (optionnel, sans bloquer).

### 3.9 Mode offline
- [ ] **Stratégie de sync** : file d’attente des actions (diagnostics, commandes) avec retry et indicateur “En attente de connexion”.
- [ ] **Conflits** : règle simple (ex. “dernier enregistrement gagne” ou “demander à l’utilisateur”).
- [ ] **Quota stockage** : limite du cache (ex. 50 Mo) avec nettoyage des anciens rapports/météo.

**Rappel – Fonctions offline par module**  
| Module      | Offline ? |
|------------|-----------|
| Diagnostic | Oui (cache data sol) |
| Météo     | Partiel   |
| Marketplace | Consultation oui |
| Académie   | Audio téléchargé |

Sync auto dès réseau.

### 3.10 Agents terrain
- [ ] **Table `Agents`** : `user_id`, `zone`, `supervisor_id`, `stats` (diagnostics, encaissements).
- [ ] **Table `AgentSessions`** : encaissement cash lié à une commande ou un diagnostic (traçabilité).
- [ ] **Tableau de bord agent** : nombre de diagnostics, ventes, encaissements du jour/semaine.
- [ ] **Validation hiérarchique** optionnelle (superviseur valide les comptes créés).

### 3.11 Sécurité & confiance
- [ ] **Vérification téléphone** (SMS OTP) pour inscription et paiements sensibles.
- [ ] **Modération** : signalement d’annonces, désactivation de comptes frauduleux.
- [ ] **Avis/notes** sur vendeurs (étoiles ou 👍/👎) avec modération des commentaires texte.
- [ ] **Conditions d’utilisation et politique de confidentialité** en version courte + audio.

### 3.12 Technique & déploiement
- [ ] **Environnements** : dev / staging / prod avec variables d’environnement distinctes.
- [ ] **Backup DB** automatique (quotidien) et politique de rétention.
- [ ] **CDN** pour images marketplace et fichiers audio/vidéo Académie.
- [ ] **Analytics anonymisées** : écrans les plus utilisés, taux d’abandon panier, pour ajuster l’UX.

---

## 4. Roadmap technique recommandée

### Phase 1 — Renforcer l’existant
- [x] **Backend central** : API `/api/v1/` (health, weather, diagnostics, report-pdf) — voir `api/` et `docs/PHASE1_IMPLEMENTATION.md`.
- [x] **Schéma DB** : `docs/DB_SCHEMA.sql` + types `api/types/db.ts` ; persistance diagnostics en mémoire (PostgreSQL/Supabase à brancher).
- [x] **Cache météo** : proxy `/api/v1/weather` avec cache mémoire (TTL 10 min) ; Redis possible ensuite.
- [x] **Export PDF** : endpoint `/api/v1/report-pdf` génère un PDF (pdfkit) ; bouton « Exporter en PDF » sur l’écran Rapport de parcelle.

### Phase 2 — Inclusion
- [ ] Audio sur les écrans clés (accueil, diagnostic, météo, marketplace).
- [x] **Sélecteur visuel** cultures (icônes) + surface Petit / Moyen / Grand.
- [x] **Score visuel** 🔴🟡🟢 (onglet Analysis) ; recommandation vocale à venir.
- [ ] Mode offline (cache diagnostic + Académie téléchargeable).
- [x] Bouton « Je suis ici » et GPS par défaut sur la carte (Phase 0).

### Phase 3 — Monétisation & scale
- Mobile money + escrow + wallet interne.
- Alertes push/SMS météo.
- App agent terrain + encaissement.
- Multilingue vocal (Bambara, Peul, Soninké).

---

## 5. Navigation inclusive (rappel)

| Onglet     | Icône proposé        |
|-----------|------------------------|
| Accueil   | Maison                 |
| Diagnostic| Carte + plante         |
| Marché    | Panier                 |
| Académie  | Chapeau formation     |

- Boutons ≥ 48 px, texte ≥ 18 pt, icônes dominantes.

---

*Document de référence pour les évolutions du produit. À mettre à jour au fil des décisions et des livraisons.*
