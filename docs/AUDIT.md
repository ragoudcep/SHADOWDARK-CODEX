# Audit du Codex — méthode et journal

Ce fichier définit une méthode légère pour vérifier régulièrement que `index.html`
reste propre, cohérent et stable, et garde la trace de chaque passage. L'idée
n'est pas de tout re-analyser à chaque fois (le fichier fait ~900 Ko et évolue
en continu, notamment via Dual), mais de repasser un même petit protocole
rapide à intervalles réguliers ou après une grosse série de changements.

## Quand auditer

- Après une session de travail importante (plusieurs fonctionnalités, ou
  changement de schéma de données).
- Avant de partir sur une nouvelle grosse fonctionnalité, pour repartir sur
  une base saine.
- À défaut, une fois toutes les 1-2 semaines d'utilisation active.

Pas besoin d'un audit après chaque petite modif — ce serait disproportionné.

## Ce qui est vérifié (par ordre de rapidité)

### 1. Vérifications mécaniques (2 min, script fourni)

`outils/audit-check.sh` automatise :

1. **Syntaxe JS** — extrait chaque bloc `<script>` et lui passe `node --check`.
2. **Équilibre CSS** — compte les `{`/`}` dans chaque bloc `<style>`.
3. **Déclarations dupliquées** — `function`/`const`/`let` de premier niveau
   déclarés deux fois (signe fréquent d'un conflit de fusion avec Dual).
4. **Ledger de collections** — affiche côte à côte `DB_COLS`, `TABS` et
   `emptyDB()` pour vérifier à l'oeil qu'ils listent exactement les mêmes
   entités (voir « Points d'attention structurels » ci-dessous).
5. **Restes de debug** — recherche `console.log`/`debugger` oubliés (en
   ignorant la librairie Supabase vendée, lignes ~673-691).

Usage (depuis la racine du dépôt) :
```bash
./outils/audit-check.sh index.html
```

### 2. Vérifications manuelles côté données (5 min)

- Le ledger de collections a *cinq* endroits qui doivent rester synchronisés :
  `DB_COLS`, `TABS`, `TAB_OF`, `TYPE_OF_TAB`, `collectionOf()`, `emptyDB()`.
  Si une entité est ajoutée quelque part et oubliée ailleurs, ça casse
  silencieusement l'import/export ou la sauvegarde. Le script vérifie les 3
  premiers automatiquement ; un coup d'oeil aux 3 autres (`grep -n "TAB_OF\|TYPE_OF_TAB\|function collectionOf"`)
  suffit.
- **Ledger Supabase (RLS)** : tenir à jour, dans ce fichier (section
  ci-dessous), la liste des tables Supabase créées et de leurs policies.
  Contrairement au reste, ça ne se vérifie pas depuis le code — seulement en
  se souvenant des scripts SQL exécutés.
- **`PLAYER_VISIBLE_TABS`** : vérifier que les onglets qui y figurent
  correspondent bien à des tables où la lecture joueur est activée côté
  Supabase (sinon un joueur voit un onglet vide/en erreur).

### 3. Vérification visuelle (à faire par toi, je n'ai pas d'outil de rendu)

Je n'ai pas de navigateur headless disponible dans ce sandbox (essayé,
bloqué par l'absence de réseau vers les CDN de Chromium). Toute vérification
d'affichage (CSS, responsive, mise en page) doit être confirmée par toi après
un `git pull` + rechargement de la page. Je te le rappellerai explicitement
à chaque fois qu'un changement touche le CSS/layout.

### 4. Hygiène Git (1 min)

- `git log --oneline -10` sur `/tmp/sdc-work` (ou équivalent) pour vérifier
  que les derniers commits correspondent bien à ce qui a été convenu.
- Vérifier qu'aucun fichier sensible (clé API, mot de passe) n'a été commité
  par erreur.
- Vérifier que `.gitignore` est à jour et **commité** (voir constat plus bas).

### 5. Fonctionnel (à la demande, pas systématique)

- Le Codex a déjà un vérificateur de liens brisés `[[...]]` intégré à
  l'appli — l'utiliser directement dans le navigateur de temps en temps
  plutôt que de le ré-implémenter ici.
- Tester une génération de PJ et de PNJ aléatoires de temps en temps pour
  confirmer que rien n'a cassé les générateurs suite à un changement du
  schéma de données.

## Points d'attention structurels (contexte pour les audits futurs)

- **Structure du dépôt (depuis le 6/08/2026)** : `index.html`, `README.md`,
  `.gitignore` et `portraits/` restent à la racine (chemins référencés en dur
  dans le code ou convention GitHub). `docs/` (documentation interne),
  `outils/` (scripts) et `sources/` (PDF/XML/JSON déjà intégrés à l'appli,
  brouillons non nécessaires en prod) regroupent le reste. Les assets du
  Hexcrawl (`*-foundation_*.png`, `deadlands/`, `drylands/`, `greenlands/`,
  `icelands/`, `sandlands/`, `Neutre/` et leurs PNG de prévisualisation à la
  racine) sont **volontairement laissés à plat** : ils sont référencés par
  chemin relatif littéral dans le code (pas de dossier `assets/`), et cette
  zone appartient au chantier « peinture de biomes » actuellement en pause
  côté Dual — les déplacer casserait ses chemins et risquerait un conflit
  avec son travail en cours.
- **Onglet « Initiative » (implémenté le 6/08/2026)** : timeline de combat
  (`db.initiative`), désormais présent dans les 6 emplacements du ledger de
  collections (`TABS`, `DB_COLS`, `TAB_OF`, `TYPE_OF_TAB`, `collectionOf`,
  `emptyDB`). Chaque participant référence en direct un PJ (`db.pcs`) ou une
  créature (`db.creatures`) existants — jamais de duplication de données — ou
  porte un nom libre (`kind:"custom"`). Jet d'initiative : `1d20 + mod. DEX`
  pour un PJ, `1d20` simple pour une créature/entrée libre (pas de scores
  structurés côté créatures). **Synchronisation MJ→joueurs par polling léger**
  (re-fetch de la table `initiative` toutes les 4,5s tant que l'onglet est
  ouvert, `startInitiativePolling()`/`stopInitiativePolling()`) — c'est la
  première fonctionnalité réellement temps réel de l'appli ; aucun autre
  onglet visible aux joueurs (Carnet de route, Hexcrawl, Sorts) n'a de
  mécanisme de rafraîchissement automatique, ils se rechargent uniquement à la
  connexion (`fetchRemoteDB()` appelé une seule fois dans `startApp()`). Pas
  de Supabase Realtime pour cette v1 — décision volontaire de Tristan (combat
  au tour par tour, pas besoin d'une latence sub-seconde).
  **Table Supabase à créer** : script fourni dans
  `outils/supabase_initiative_setup.sql` (même modèle GM CRUD / joueur
  lecture seule que `hexmaps`/`spells`) — à exécuter par Tristan dans
  l'éditeur SQL Supabase, à confirmer et à reporter dans le ledger ci-dessous
  une fois fait.
- **Onglet « Roue » (implémenté le 6/08/2026)** : roue de la fortune (bonus à
  gagner), présente dans les 6 emplacements du ledger de collections (`TABS`,
  `DB_COLS`, `TAB_OF`, `TYPE_OF_TAB`, `collectionOf`, `emptyDB`) sous la clé
  `wheel`. Contrairement aux autres collections, `db.wheel` ne contient en
  pratique **qu'un seul enregistrement** (la liste des bonus texte définie par
  le MJ, éditée via une modale — pas de page detail/edit générique). **Aucun
  état de tirage partagé** : chaque client tire localement
  (`Math.random()`, uniforme) au clic sur « Tourner la roue » — décision
  volontaire pour rester simple (pas de synchro temps réel à gérer, pas de
  conflit si plusieurs joueurs tournent en même temps). Roue en SVG généré en
  JS (camembert calculé par trigonométrie, pas de dépendance), rotation
  CSS (`transition` sur `.wheel-rotor`, durée `WHEEL_SPIN_MS` = 5400ms côté
  JS — les deux doivent rester synchronisées si l'une des deux change). Son de
  tension pendant le tirage en **Web Audio API pure** (bruit blanc filtré +
  cliquets à intervalle géométrique croissant, aucun fichier audio externe),
  démarré/arrêté par `startWheelTensionSound()`/`stopWheelTensionSound()` —
  coupé proprement à la fin du tirage, en cas de changement d'onglet
  (nettoyage dans `render()`, même schéma que `stopInitiativePolling()`), ou
  si le joueur relance un tirage. Easter egg à la révélation : boîte cadeau
  animée + confettis + bannière « Joyeux anniversaire », en pur CSS/JS
  (`showWheelReward()`), overlay `#wheel-reward` indépendant de `#modal`.
  **Table Supabase à créer** : script fourni dans
  `outils/supabase_wheel_setup.sql` (même modèle GM CRUD / joueur lecture
  seule que `hexmaps`/`spells`/`initiative`) — à exécuter par Tristan dans
  l'éditeur SQL Supabase, à confirmer et à reporter dans le ledger ci-dessous
  une fois fait. **Non vérifié visuellement/à l'oreille** : le rendu de la
  roue, le calage de l'animation et le son n'ont pas pu être confirmés en
  direct dans un navigateur pendant l'implémentation (pas de panneau
  navigateur composé de frames disponible dans cette session) — à confirmer
  par toi après déploiement.
- **Deux systèmes d'import XML coexistent** : les créatures utilisent un
  import dédié historique (`importXML`, déclenché via
  `_xmlImportTarget==="creature"`), toutes les autres entités importables
  (PNJ, Trésor, Tables, Point Crawl, Sorts) utilisent le système générique
  `XML_TYPES`/`importXMLGeneric`. C'est voulu, pas un bug — mais à garder en
  tête pour ne pas chercher un `XML_TYPES.creature` qui n'existe pas.
- **Sessions, Événements, PJ, Carnet de route et Hexcrawl n'ont pas
  d'import XML** — normal, ce ne sont pas des contenus qu'on importe en
  masse depuis un livre de règles (le Hexcrawl s'importe en JSON dédié).
- **Les changements de schéma « objet magique »/« PNJ » n'ont pas nécessité
  de SQL** : chaque table Supabase stocke son contenu dans une seule colonne
  `data jsonb`, donc ajouter un champ (ex. `bonus`, `moyens`) est un
  changement 100% côté app. Seule l'ajout d'une **nouvelle table** (ex.
  `spells`, `hexmaps`) nécessite un script SQL.

## Ledger Supabase (tables + RLS)

À tenir à jour manuellement — c'est la seule source de vérité côté audit
pour ce qui a réellement été exécuté en base (le code JS suppose que ces
tables existent, mais ne peut pas le garantir).

| Table | Créée | Policy GM (CRUD) | Policy lecture joueur | Statut |
|---|---|---|---|---|
| sessions | ✅ | ✅ | — | confirmé (setup initial) |
| events | ✅ | ✅ | — | confirmé (setup initial) |
| creatures | ✅ | ✅ | — | confirmé (setup initial) |
| tables | ✅ | ✅ | — | confirmé (setup initial) |
| npcs | ✅ | ✅ | — | confirmé (setup initial) |
| pointcrawls | ✅ | ✅ | — | confirmé (setup initial) |
| pcs | ✅ | ✅ | ⏳ | policy de lecture joueur écrite (`supabase_pcs_lecture_joueurs.sql`), **script à exécuter par toi** |
| treasures | ✅ | ✅ | — | confirmé (setup initial) |
| hexmaps | ✅ | ✅ | ✅ | confirmé |
| spells | ✅ | ✅ | ✅ | confirmé (corrigé après une 1ère erreur `42P01`) |
| roadbook | ⚠️ | ⚠️ | ⚠️ | **à confirmer** — voir Constats ci-dessous |
| initiative | ⏳ | ⏳ | ⏳ | script fourni (`outils/supabase_initiative_setup.sql`), **à exécuter par toi** |
| wheel | ⏳ | ⏳ | ⏳ | script fourni (`outils/supabase_wheel_setup.sql`), **à exécuter par toi** |

## Journal des audits

### Audit #1 — 2026-08-06

**Portée** : premier passage, mise en place de la méthode + vérifications
mécaniques + relecture du ledger de collections + hygiène Git + relecture du
README.

**Résultats des vérifications mécaniques** (`audit-check.sh`) :
- Syntaxe JS : OK sur les deux blocs `<script>`.
- Équilibre CSS : OK sur les deux blocs `<style>` (3/3 et 305/305).
- Déclarations dupliquées : aucune trouvée.
- Ledger `DB_COLS`/`TABS`/`emptyDB()` : les 3 listes contiennent bien les
  mêmes 11 entités (`sessions, events, creatures, tables, npcs, pointcrawls,
  pcs, treasures, roadbook, hexmaps, spells`) — juste dans un ordre différent,
  sans incidence. `TAB_OF`, `TYPE_OF_TAB` et `collectionOf()` vérifiés
  manuellement, également cohérents (11/11).
- Restes de debug : 4 occurrences de `console.log`, toutes dans la librairie
  Supabase vendée (lignes 673-691) — aucune dans le code de l'appli.
- Site live (`ragoudcep.github.io/SHADOWDARK-CODEX`) : répond correctement,
  affiche l'écran de connexion attendu.
- Dépôt local (`/tmp/sdc-work`) synchronisé avec `origin/main`
  (`4d951da`) — aucun décalage.

**Constats (rien d'urgent, mais à traiter/confirmer)** :

1. **⚠️ `roadbook` — statut Supabase incertain.** La todo-list interne a
   deux tâches encore en attente : « Exécuter le script SQL rôles + carnet
   de route » et « Créer le compte de l'ami et le déclarer 'player' ». Le
   code JS traite `roadbook` comme une table à part entière et l'expose aux
   joueuses (`PLAYER_VISIBLE_TABS`), mais je n'ai aucun moyen de vérifier
   depuis le code si la table existe réellement côté Supabase avec les
   bonnes policies. **À confirmer par toi** : la table `roadbook` (et les
   rôles `profiles.role`) sont-ils bien en place ? Si le script n'a jamais
   été lancé, l'onglet Carnet de route plantera silencieusement pour tout le
   monde tant que `saveDB()` boucle sur `DB_COLS`.
2. **README obsolète.** `README.md` décrit encore une version bien plus
   ancienne de l'appli (persistance `localStorage` uniquement, pas de
   Supabase, pas de comptes/rôles, liste de fonctionnalités sans Hexcrawl/
   Sorts/PJ-PNJ générateurs). Pas bloquant, mais trompeur pour quiconque
   (Dual y compris) ouvre le dépôt pour la première fois. Je ne l'ai pas
   corrigé moi-même pour ne pas empiéter sur du contenu que Dual édite
   peut-être aussi — à faire ensemble si tu veux.
3. **`.gitignore` n'est pas commité.** Il existe seulement en local
   (`.vscode/` dedans) et n'est pas suivi par Git — donc sans effet pour
   quiconque clone le dépôt ailleurs (dont Dual). Je recommande de le
   committer, et d'y ajouter `.claude/` (config locale d'outil, actuellement
   non trackée mais non ignorée non plus — présente un risque de commit
   accidentel).
4. **Fichiers source non commités (probablement volontaire).** Les 4 PDF
   sources, les 2 XML d'import (sorts/objets magiques) et
   `Hexcrawl/Campagne_SD__carte___.json` existent seulement en local, pas
   sur GitHub. C'est cohérent avec le fait que leur contenu est déjà
   intégré dans l'appli — je ne les ai pas ajoutés au dépôt de moi-même
   (fichiers volumineux, pas de raison évidente de les versionner). Dis-moi
   si tu préfères les garder comme archive dans le dépôt.

**Points forts confirmés** : aucune duplication de code détectée malgré les
éditions concurrentes de Dual ; schéma de collections toujours cohérent sur
les 6 emplacements qui doivent l'être ; aucun résidu de debug dans le code
applicatif ; le pipeline de push (`/tmp/sdc-work` → GitHub → Pages) fonctionne
et est à jour.

**Non vérifié ce passage** (à faire visuellement par toi) : rendu de la
sidebar verticale sur grand écran (correctif du bug `backdrop-filter`
poussé en `4d951da`, jamais reconfirmé visuellement).

### Rangement — 2026-08-06 (suite de l'audit #1)

Réorganisation du dossier projet suite aux constats 2 et 3 ci-dessus :

- `.gitignore` commité (constat #3 résolu), complété avec `.claude/` et les
  sous-dossiers de `sources/` qui ne doivent pas finir sur GitHub (voir
  point d'attention structurel plus haut).
- Racine allégée : documentation → `docs/`, scripts → `outils/`, matériel
  source (PDF, XML déjà importés, JSON Hexcrawl, portraits bruts, police
  d'origine) → `sources/`. Les assets biomes du Hexcrawl restent à plat à la
  racine (voir point d'attention structurel — ne pas les déplacer tant que
  Dual n'a pas terminé ce chantier).
- README rafraîchi (constat #2 résolu) pour refléter l'état réel de l'appli
  (Supabase, rôles, Hexcrawl, Sorts, générateurs PJ/PNJ, portraits) et la
  nouvelle structure du dépôt.
- Constat #1 (statut Supabase de `roadbook`) reste ouvert — rien dans ce
  passage ne permettait de le vérifier, toujours à confirmer par toi.
- Constat #4 : les PDF/XML/JSON sources restent volontairement hors dépôt
  (maintenant rangés dans `sources/`, gitignorés) — sauf avis contraire.
