# Modularisation du Codex — analyse et plan de découpage

Document de préparation demandé par Tristan (2026-08-10, avant de partir) : réfléchir à la
méthode de découpage de `index.html` en plusieurs fichiers, **sans rien modifier sur le site**.
Question posée : vaut-il mieux écrire d'abord un fichier de structure complète, ou commencer
directement à découper ? Réponse et raisonnement ci-dessous, puis l'analyse complète du fichier
actuel pour que le découpage, une fois lancé, aille vite.

## La décision : ce document d'abord, puis un découpage incrémental — jamais un « big bang »

**Ce document EST la réponse à la question.** Deux raisons convergent, une contrainte et un
constat :

1. **Contrainte de la session** : consigne explicite de ne rien modifier aujourd'hui. La seule
   chose productive à produire est donc une analyse écrite — ça tombe bien, c'est aussi la bonne
   méthode dans l'absolu (voir point 2).
2. **Sur le fond** : découper à l'aveugle sans cartographier d'abord les dépendances est le
   meilleur moyen de découvrir une fonction partagée entre deux « modules » qu'on pensait
   indépendants *après* avoir déjà cassé le fichier. Un document de référence, même imparfait,
   coûte quasiment rien à écrire et à corriger ; un découpage refait après coup coûte un vrai
   temps de debug. Vu la taille du fichier (index.html ci-dessous), l'analyse s'est avérée
   nécessaire de toute façon pour découvrir un fait qui change complètement la priorité du
   chantier (section suivante).

**Mais** : ce document ne doit pas devenir un plan figé à suivre à la lettre avant de toucher au
code. Le vrai découpage doit être **incrémental** — une extraction à la fois, testée dans le
navigateur avant de passer à la suivante, commit par commit — jamais une seule énorme réécriture
d'un coup. Voir « Plan d'exécution recommandé » en bas de ce document.

## Constat chiffré — la vraie priorité n'est pas celle attendue

`index.html` pèse actuellement **1 044 541 octets (~1020 Ko)**. Répartition mesurée directement
(pas une estimation) :

| Contenu | Octets | % du fichier |
|---|---:|---:|
| 3 polices embarquées en base64 (`@font-face`, lignes 8-35) | 233 990 | 22,4 % |
| Librairie `@supabase/supabase-js` vendue en ligne (lignes 950-968) | 211 082 | 20,2 % |
| Bibliothèque d'icônes SVG (`<defs><symbol>`, lignes 791-882) | 183 061 | 17,5 % |
| **Sous-total : assets statiques / code tiers, zéro logique métier** | **628 133** | **60,1 %** |
| CSS réel de l'appli (lignes 39-788) | 54 240 | 5,2 % |
| JavaScript applicatif réel (lignes 969-6769, ~5800 lignes) | 351 380 | 33,6 % |
| **Sous-total : ce qui constitue vraiment « le Codex »** | **405 620** | **38,8 %** |

**Conclusion directe** : plus de 6 octets sur 10 du fichier ne sont ni du code de Tristan/Dual, ni
quelque chose qui nécessite la moindre réflexion architecturale — ce sont des polices, une
librairie tierce, et une planche d'icônes, collées telles quelles dans le HTML. Les extraire est
**mécanique, sans risque de casse logique** (ce sont des blobs inertes, pas du code qui appelle
d'autres fonctions), et fait chuter le fichier à lire/chercher/éditer de ~1020 Ko à ~415 Ko d'un
coup — soit littéralement l'objectif que Tristan visait ce matin (« est-ce que le fait que ce
soit un fichier de six mille lignes fait perdre des tokens »), avant même de toucher à la vraie
question de la modularisation du JS.

**C'est donc la Phase 0, à faire en premier, avant même d'envisager de découper le JavaScript
applicatif.**

## Phase 0 — extraction des trois blobs statiques (à faire en premier, ce soir)

### 0.1 — Polices (lignes 8-35, 234 Ko)

Trois `@font-face` avec `src:url("data:font/woff2;base64,...")`. À remplacer par de vrais
fichiers `.woff2` (décoder le base64, écrire les fichiers dans un dossier `fonts/`) référencés en
URL relative classique :
```css
@font-face{ font-family:'IM Fell English'; font-style:italic; font-weight:400; font-display:swap;
  src:url("fonts/im-fell-english-italic.woff2") format("woff2"); unicode-range:...; }
```
Trois polices identifiées : **IM Fell English** (italic + normal) et **IM Fell English SC**. Le
`unicode-range` de chaque `@font-face` est à conserver tel quel (copier-coller, ne rien
recalculer). Risque quasi nul — un mauvais chemin relatif fait juste retomber sur la police
système par défaut (dégradation visible, pas un crash).

### 0.2 — Librairie Supabase vendue (lignes 950-968, 211 Ko)

Actuellement un `<script>` inline contenant le bundle UMD minifié
`@supabase/supabase-js@2.112.0` (commentaire d'origine dans le fichier : *"Skipped minification
because the original files appears to be already minified. Original file:
/npm/@supabase/supabase-js@2.112.0/dist/umd/supabase.js"* — visiblement récupéré depuis jsDelivr
puis collé en dur). Deux options, à trancher avec Tristan avant d'exécuter :
- **Option A (recommandée)** : extraire le contenu tel quel dans `vendor/supabase.min.js`, puis
  `<script src="vendor/supabase.min.js"></script>`. Zéro dépendance réseau au runtime (fonctionne
  hors-ligne comme aujourd'hui), juste un fichier séparé.
- **Option B** : revenir à un `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js">`
  pointant vers le CDN d'origine — plus léger dans le dépôt, mais introduit une dépendance réseau
  au chargement (jamais eue jusqu'ici, à valider que c'est acceptable) et perd le figeage de
  version exact (`@2.112.0` → `@2`, qui peut évoluer).
Risque : nul sur la logique (bloc de code inerte tant qu'il n'est pas exécuté), à condition de
copier le contenu **caractère pour caractère** (un seul octet corrompu dans un bundle minifié peut
le casser silencieusement) — utiliser une copie de fichier, jamais une retranscription manuelle.

### 0.3 — Planche d'icônes SVG (lignes 791-882, 183 Ko)

Bibliothèque de `<symbol id="icon-xxx">` (icônes de points d'intérêt Hexcrawl : vagues, portail,
hautes herbes, phare, pin, etc.), référencée ailleurs dans le code via `<use href="#icon-xxx">`
(voir `poiIconPickerHTML()`, ligne ~4525, et le rendu des points sur la carte). Extraction possible
de deux façons :
- **Sprite externe + `<use>` cross-fichier** : déplacer tout le bloc `<svg><defs>...</defs></svg>`
  dans `icons.svg`, puis changer chaque `<use href="#icon-xxx">` en
  `<use href="icons.svg#icon-xxx">`. Zéro JS nécessaire, le navigateur charge et met en cache le
  fichier tout seul. **Point de vigilance non vérifié dans cette session** : le support de `<use>`
  vers un SVG externe a eu des soucis historiques sur Safari plus anciens — à tester réellement
  dans le navigateur cible avant de considérer cette option comme actée (pas seulement supposée
  fonctionner).
- **Repli si le point ci-dessus pose problème** : garder le sprite inline mais dans un fragment
  HTML séparé (`icons.html`), injecté au chargement via `fetch("icons.html").then(r=>r.text()).then(html=>...)`
  avant le premier rendu — un peu plus de JS de bootstrap, mais aucun risque de compatibilité
  navigateur.

### Gain attendu de la Phase 0

`index.html` passerait d'environ 1020 Ko à environ **415 Ko** (CSS réel + JS applicatif réel +
le peu de HTML de structure qui reste). Aucune fonction, aucun bouton, aucun comportement ne
change — uniquement l'endroit où vivent ces trois blobs. C'est la seule partie de ce chantier que
je qualifierais de « sans risque réel » plutôt que « risque maîtrisé ».

## Mécanique retenue pour le découpage du JS applicatif (Phase 2+)

Deux façons de découper du JavaScript en plusieurs fichiers sans outil de build :

- **Scripts classiques multiples** (`<script src="js/xxx.js"></script>`, sans `type="module"`) :
  tous les fichiers partagent la MÊME portée globale, exactement comme aujourd'hui où tout est
  concaténé dans un seul `<script>`. Une fonction déclarée dans `js/creatures.js` reste visible
  telle quelle depuis `js/pointcrawl.js`, sans `import`/`export`. Le découpage devient alors
  presque un simple copier-coller par section, sans réécrire une seule ligne de logique.
- **Modules ES** (`<script type="module" src="...">`) : chaque fichier a sa propre portée, il faut
  ajouter `export` sur chaque déclaration utilisée ailleurs et `import {...} from "./autre.js"` en
  haut de chaque fichier qui s'en sert — sur ~150 déclarations de premier niveau partagées entre
  quasiment tous les onglets (`db`, `view`, `myRole`, `esc()`, `getEntity()`, `renderText()`...),
  ça représente une réécriture bien plus large, donc bien plus risquée, pour un bénéfice
  (isolation stricte, tree-shaking) qui ne sert à rien ici puisqu'il n'y a pas de bundler pour en
  profiter.

**Recommandation : scripts classiques multiples.** Cohérent avec la philosophie actuelle du
projet (zéro dépendance, zéro build), migration mécanique donc plus sûre, et l'ordre de chargement
importe très peu dans la pratique : la quasi-totalité du code est dans des corps de fonction
(hoistés/différés), qui ne s'exécutent qu'après le chargement complet de tous les scripts (au
premier clic, ou dans `initApp()` appelé en tout dernier). Seules quelques lignes de tout premier
niveau doivent rester dans le bon ordre relatif (ex. `let db = emptyDB();` a besoin que
`emptyDB` soit déjà défini) — repérable au cas par cas, pas un vrai obstacle.

**Vérifié pour cette approche** : aucune collision de nom entre déclarations de premier niveau
(`function`/`const`/`let`) dans tout le fichier actuel — un script qui vérifie les doublons sur
l'ensemble du fichier ne remonte rien. Bon signe : le découpage ne fera pas apparaître de conflit
de nommage entre deux "futurs modules".

## Cartographie du JavaScript applicatif actuel (lignes 969-6769)

Point important découvert en cartographiant : le fichier n'est pas organisé de façon uniforme.
**Les fonctionnalités ajoutées récemment et de façon autonome (Initiative, Roue, Point Crawl,
Hexcrawl, Cartes de donjon, Recherche, Import/Export générique, Autocomplétion) sont déjà
regroupées en blocs contigus**, souvent sous un commentaire-bannière dédié — ce sont les
extractions les plus faciles, presque un copier-coller direct. **Les entités plus anciennes
(Événements, Tables, Créatures, PNJ, Sessions, PJ, Trésor, Sorts) sont éclatées en 3 zones du
fichier** : une zone "listes" groupée, une zone "détails" groupée, et une immense zone
"FORMULAIRES" qui contient TOUS les formulaires de TOUTES les entités à la suite — pour ces
entités-là, découper en un fichier par onglet demande de rassembler des morceaux dispersés, pas
juste de couper un bloc. Plus de travail, plus de risque d'oubli — à faire en second, une fois la
méthode validée sur les blocs faciles.

### Blocs déjà contigus (extraction facile, à faire en premier)

| Module cible | Contenu | Lignes approx. |
|---|---|---:|
| `js/autocomplete.js` | Autocomplétion des liens `[[...]]` dans les champs texte | 6147-6252 |
| `js/search.js` | Recherche globale (Levenshtein, résultats) | 5402-5467 |
| `js/importexport.js` | Export/import JSON global + système XML générique (`XML_TYPES`) | 5471-5811 |
| `js/wheel.js` | Onglet Roue (config, son Web Audio, SVG, tirage, easter egg) | 1524-2183 |
| `js/initiative.js` | Onglet Initiative (timeline de combat, polling) | 1316-1523 |
| `js/pointcrawl.js` | Onglet Point Crawl (liste/détail/form/canvas/liens/impression) | 3197-3835 |
| `js/hexcrawl.js` | Onglet Hexcrawl (grille, biomes, overlays, brouillard, import JSON) | 4436-4889 |
| `js/dungeonmaps.js` | Onglet Cartes de donjon (pinceau, polygone, masque SVG, aperçu joueur) | 4856-5399 |
| `js/modal.js` | `openModal`/`closeModal`/`confirmModal`/`promptModal` | 3463-3490 |

### Zones à rassembler (plus de travail, à faire en second)

Pour chacune de ces entités, les fonctions à regrouper dans un même futur fichier sont
dispersées entre la zone "listes" (~2185-2547), la zone "détails" (~2551-2755), la zone
"FORMULAIRES" (~2760-4256, share entre toutes), et parfois une zone d'impression/export dédiée
plus loin dans le fichier :

| Module cible | Fonctions clés (non exhaustif) | Zones concernées |
|---|---|---|
| `js/events.js` | `listEvents`, `detailEvent`, `formEvent`/`saveEvent`, `eventThemes` | listes, détails, formulaires |
| `js/tables.js` | `listTables`, `detailTable`, `formTable`/`saveTable`, `rollTable`, `printTableBlock` | listes, détails, formulaires, import/export |
| `js/creatures.js` | `listCreatures`, `detailCreature`, `formCreature`/`saveCreature`, `printCreatureBlock`, `creatureCardFrontHTML`/`BackHTML`, `printCreatureCards`, système XML historique (`importXML`/`parseCreatureNode`/`exportCreaturesXML`/`purgeCreatures`) | listes, détails, formulaires, XML dédié, print cartes |
| `js/npcs.js` | `listNPCs`, `detailNPC`, `formNPC`/`saveNPC`, `generateRandomNPC` + tables de génération, `npcCardFrontHTML`/`BackHTML`, `printNPCCards` | listes, détails, formulaires, génération, print cartes |
| `js/sessions.js` | `listSessions`, `detailSession`, `formSession`/`saveSession` | listes, détails, formulaires |
| `js/pcs.js` | `listPCs`, `detailPC`, `formPC`/`savePC`, `generateRandomPC` + toutes les tables de génération PJ (`ASCENDANCES`, `CLASSES_DATA`, etc.), `printPCSheet`/`printPCs`, `rollTalents` | listes, détails, formulaires, génération, print fiches |
| `js/treasures.js` | `listTreasures`, `detailTreasure`, `formTreasure`/`saveTreasure`, `printTreasureBlock` | listes, détails, formulaires |
| `js/spells.js` | `listSpells`, `detailSpell`, `formSpell`/`saveSpell` | listes, détails, formulaires |

### Le noyau partagé (`js/core.js`) — à extraire en dernier, tout dépend de lui

Fonctions/état utilisés par pratiquement tous les modules ci-dessus — doit être chargé en tout
premier parmi les scripts applicatifs (juste après le vendor Supabase) :
- Persistance : `sb`, `db`, `emptyDB`, `fetchRemoteDB`, `saveDB`, `saveInitiative`, `deleteRemote`,
  `wipeRemoteTable`, `loadLegacyLocalDB` (lignes 977-1063).
- État global partagé : `view`, `myRole`, `previewAsPlayer`, `effectiveRole`, `PLAYER_VISIBLE_TABS`,
  `TAB_OF`/`TYPE_OF_TAB`/`TABS`/`TYPE_LABEL`, `formImages`, `PORTRAITS_MANIFEST`, etc.
  (dispersé — `myRole`/`effectiveRole` sont tout en bas du fichier actuellement, ~6602-6621,
  malgré leur usage omniprésent partout ailleurs — à rapatrier logiquement dans le noyau lors du
  découpage, pas seulement copier-coller leur position actuelle).
- Rendu de texte/liens : `esc`, `renderText`, `renderBullets`, `bulletSection`, `findByName`,
  `extractLinks`, `findBrokenLinks`, `renderTextPrint`/`printSection` (partagés par tous les
  exports PDF/cartes).
- Accès générique aux entités : `collectionOf`, `getEntity`, `deleteEntity`, `duplicateEntity`,
  `backlinksTo`/`backlinksBlock`, `replaceLinksEverywhere`, `maybePropagate`.
- UI partagée : `pageHead`, `emptyState`, `detailActions`, `applyRoleUI`, `togglePlayerPreview`,
  `toast`, `$`.
- Routeur central : `render`, `renderList`, `renderDetail`, `renderForm` (dépend de connaître
  TOUS les modules de tabs — doit donc être chargé APRÈS eux, pas avant, malgré sa nature "cœur" —
  seule vraie contrainte d'ordre non triviale identifiée).

### Le fichier de démarrage (`js/app.js` ou `main.js`) — chargé en tout dernier

Tout ce qui exécute du code immédiatement au chargement plutôt que de juste déclarer des
fonctions : le gros dispatcher de clics (`app.addEventListener("click", ...)`, ~5864-6032, ~170
lignes qui référencent des dizaines de fonctions de tous les modules), le dispatcher de
changements, les écouteurs des boutons du header/formulaires de fichiers, l'auth
(`showAuthScreen`/`hideAuthScreen`/`fetchMyRole`/`startApp`/`initApp`), les données par défaut
(`seedIfEmpty`, `SHADOWDARK_DEFAULT_TABLES` — encore 15 Ko de données, candidat à son propre
fichier `data/default-tables.js` si on veut aller plus loin), l'animation du champ d'étoiles, et
l'appel final `initApp()`.

## Risques et précautions

- **Dual édite ce fichier en parallèle.** Un découpage massif est le pire moment possible pour
  un conflit de fusion — Dual ne pourra plus faire de petits patchs sur `index.html` pendant la
  transition sans risquer un conflit majeur. À faire dans une fenêtre resserrée (idéalement une
  seule session continue plutôt qu'étalée sur plusieurs jours), avec un message clair à Dual avant
  de commencer (peut passer par un commit ou une note dans ce fichier).
- **Incrémental, jamais tout d'un coup.** Une extraction = un commit = un test dans le navigateur
  avant de passer à la suivante. Si quelque chose casse, `git revert` d'un seul commit plutôt que
  de devoir déchiffrer une réécriture monolithique.
- **`outils/audit-check.sh` à adapter.** Il vérifie actuellement la syntaxe JS en extrayant les
  blocs `<script>` d'un seul fichier HTML — une fois le JS éclaté en plusieurs `.js`, le script
  devra plutôt faire `node --check` directement sur chaque fichier `.js` (plus simple, en fait).
- **Chemins relatifs des assets Hexcrawl (biomes)** : `docs/AUDIT.md` documente déjà que ces
  fichiers sont volontairement laissés à plat à la racine à cause d'un chantier de Dual en pause —
  aucun changement de chemin prévu par cette modularisation ne doit y toucher (le split concerne
  `index.html`, pas l'organisation des dossiers d'assets).
- **`.gitattributes`** : le dépôt a déjà eu un souci de fins de ligne CRLF/LF sur des scripts
  (voir journal d'audit du 2026-08-06) — penser à ajouter `*.js text eol=lf` en même temps que la
  création des nouveaux fichiers `.js`, pour ne pas répéter l'incident.
- **Ne pas mélanger avec le sujet CLAUDE.md déjà évoqué ce matin.** Cette modularisation physique
  du fichier est un chantier distinct du `CLAUDE.md`/carte de navigation proposé plus tôt dans la
  journée (qui reste utile même après un découpage, pour savoir dans QUEL fichier chercher).

## Plan d'exécution recommandé (pour ce soir, si on lance)

1. Phase 0 (assets statiques) — un commit par blob (polices, vendor Supabase, icônes), testé à
   chaque fois.
2. Extraction du CSS réel (`style.css`) — un commit, testé.
3. Extraction des modules déjà contigus, un par un, du plus petit/isolé au plus gros : `modal.js`
   → `autocomplete.js` → `search.js` → `importexport.js` → `wheel.js` → `initiative.js` →
   `pointcrawl.js` → `hexcrawl.js` → `dungeonmaps.js`. Chacun testé (ouvrir l'onglet correspondant,
   vérifier qu'il n'y a pas d'erreur console) avant de passer au suivant.
4. Extraction des entités éclatées (plus lent) : `events.js`, `tables.js`, `creatures.js`,
   `npcs.js`, `sessions.js`, `pcs.js`, `treasures.js`, `spells.js` — un par un, même méthode.
5. Extraction du noyau (`core.js`) et du fichier de démarrage (`app.js`) — en dernier, puisque tout
   le reste en dépend et que c'est là que se trouve la seule vraie contrainte d'ordre de
   chargement.
6. Mise à jour d'`outils/audit-check.sh` pour vérifier chaque `.js` séparément.
7. Audit final complet (`docs/AUDIT.md`) une fois la migration terminée, avant de reprendre le
   développement de fonctionnalités.

Rien de tout ça n'a été commencé — ce document est une carte, pas un chantier entamé.
