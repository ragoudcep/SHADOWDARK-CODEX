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
- **Onglet « Cartes de donjon » (implémenté le 6/08/2026, deux refontes le
  soir même à la demande de Tristan après essais réels)** : brouillard de
  guerre sur une image de plan, présent dans les 6 emplacements du ledger de
  collections (`TABS`, `DB_COLS`, `TAB_OF`, `TYPE_OF_TAB`, `collectionOf`,
  `emptyDB`) sous la clé `dungeonmaps`. Le MJ prépare plusieurs cartes à
  l'avance (nom + image, `formDungeonMap()`/`saveDungeonMap()`), une seule
  est **active** à la fois (`m.active`, basculée par `activateDungeonMap()`
  qui désactive les autres) — c'est elle, et elle seule, qui est montrée aux
  joueurs.
  **Historique des trois moutures** : v1, patchs rectangulaires à poignées
  (déplacer/redimensionner/supprimer un par un) — trop pénible à manipuler
  finement. v2, calque peint à main levée au pinceau/gomme sur un
  `<canvas>` (peindre en noir opaque / effacer en `destination-out`) — geste
  correct à la souris mais toujours une manipulation fine, pas adaptée à
  jouer au téléphone. **v3 (actuelle)** : chaque coup de pinceau devient une
  **entité indépendante et colorée** qu'on **tapote pour basculer**
  caché/révélé — le vrai besoin exprimé par Tristan était de dessiner les
  zones en amont (souris, précis) puis de juste les activer/désactiver en
  jeu (au doigt, sur petit écran, imprécision tolérée).
  **Modèle de données v3** : `m.strokes[]`, chaque zone = `{id, color,
  hidden, radius, points:[{x,y},...]}` — coordonnées et rayon en **pixels
  naturels de l'image** (pas en pourcentage comme les moutures précédentes :
  voir plus bas pourquoi), `hidden:true` par défaut à la création (une zone
  qu'on vient de dessiner commence cachée, cohérent avec le fait qu'on
  dessine par-dessus ce qu'on veut masquer). `m.imgW`/`m.imgH` (dimensions
  naturelles de l'image, mises en cache dans `saveDungeonMap()` à l'upload)
  pilotent le `viewBox` du SVG de rendu. **Une carte neuve démarre avec
  `strokes:[]` (entièrement révélée)** — modèle additif contrairement à la
  v2 qui démarrait entièrement cachée : ici on ajoute des zones à cacher,
  on ne retire pas d'un calque plein.
  **Rendu SVG, pas canvas** : chaque zone est un `<path>` (tracé
  `M x,y L x,y…`, `stroke-linecap:round`) — le navigateur fait le hit-test
  du tap tout seul via `pointer-events:stroke`, pas de vérification de
  pixels à la main comme il aurait fallu avec un canvas. **Point technique
  important** : le `viewBox` est calé sur les dimensions **naturelles** de
  l'image (`0 0 imgW imgH`) avec un scale **uniforme**
  (`preserveAspectRatio="xMidYMid meet"`, pas `"none"` comme dans les
  moutures précédentes) — un viewBox carré 0-100 étiré différemment en x/y
  aurait rendu les ronds de pinceau elliptiques sur une image non carrée
  (la plupart des plans de donjon ne sont pas carrés). Vérifié : une image
  1200×1800 (portrait) donne un rendu SVG exactement à la même échelle et au
  même ratio que l'`<img>`, donc un rayon de pinceau reste un vrai cercle à
  l'écran quel que soit le format du plan.
  **Zone de tap élargie** : chaque zone porte en fait deux `<path>`
  superposés — le tracé visible coloré, et un tracé invisible
  (`stroke:transparent`) de largeur `max(rayon×2, 24)` par-dessus, pour
  qu'une zone dessinée fine reste facile à toucher au doigt (le but même de
  cette refonte). Vérifié en testant un tap à 8px de l'axe d'un trait de
  rayon 3 (donc hors du tracé visuel de 3px) : résolu correctement sur le
  `<path>` de zone de tap élargie.
  **Trois outils, un seul actif à la fois** (`dmapTool`, boutons toggle
  comme les modes du Hexcrawl) : **« Basculer »** (implicite, mode par
  défaut) — tap sur une zone = inverse `hidden`, pensé pour être utilisable
  en jeu au téléphone. **« ➕ Ajouter une zone »** — glisser dessine un
  nouveau tracé (couleur assignée automatiquement par cycle sur
  `DMAP_STROKE_COLORS`, 10 teintes), le mode **reste actif** après chaque
  tracé pour enchaîner la préparation de plusieurs zones sans re-cliquer à
  chaque fois. **« 🗑 Supprimer une zone »** — tap sur une zone = suppression
  définitive, mode également persistant. Boutons rapides « Tout
  révéler »/« Tout masquer » pour basculer `hidden` sur toutes les zones
  d'un coup (ne supprime rien, juste un reset d'état).
  **Rendu MJ** : zones colorées, semi-transparentes si cachées
  (`.dmap-stroke-hidden`, `opacity:.6`) ou très pâles en pointillé si
  révélées (`.dmap-stroke-revealed`, `opacity:.16`) — repère visuel de
  l'état courant en un coup d'œil, curseur `pointer` sur les zones.
  **Rendu joueur** : seules les zones encore `hidden` sont même présentes
  dans le DOM, en noir opaque uni sans aucun attribut `stroke` de couleur
  (`.dmap-stroke-player`, la couleur ne sert qu'au repérage MJ et ne doit
  jamais leur être montrée), `pointer-events:none`, aucun `<canvas>` ni
  contrôle. Vérifié que le SVG joueur ne porte pas la classe
  `dmap-overlay-gm` et qu'aucun path ne porte l'attribut `stroke` (la
  couleur ne peut donc pas fuiter, même en cas de bug CSS).
  **Image stockée en base64 dans le jsonb** comme le reste de l'appli,
  plafond de résolution à **1800px** de côté long (`processMapImage()`,
  copie de `processImage()` avec un plafond différent des 1000px habituels).
  Remplacer l'image d'une carte existante réinitialise ses zones (leurs
  coordonnées étaient liées à l'ancienne image).
  **Synchronisation MJ→joueurs par polling léger**, copie conforme du modèle
  Initiative (`startDungeonMapsPolling()`/`stopDungeonMapsPolling()`, 4,5s,
  actif seulement tant que l'onglet est ouvert).
  **Point d'architecture important, inchangé depuis la v1, indépendant de la
  représentation du brouillard** : la policy Supabase de lecture joueur
  n'est pas un simple « select si connecté » — elle filtre directement sur
  le contenu du jsonb (`dungeonmaps_player_read_active`,
  `(data->>'active')::boolean is true`), donc une carte non active n'est
  **jamais transmise sur le réseau** à un compte joueur, garantie serveur et
  pas seulement une précaution côté client.
  **Testé fonctionnellement dans un navigateur** : cette fois avec un vrai
  viewport (le panneau a fini par correctement composer la page en cours de
  session, après avoir dû contourner un viewport 0×0 en début de test) —
  tracé d'une zone au pointeur réel avec plusieurs points intermédiaires,
  cycle de couleurs sur deux zones consécutives, mode « Ajouter » qui reste
  actif après un tracé, bascule caché/révélé via un vrai hit-test
  géométrique du navigateur (`document.elementFromPoint` pour trouver le
  vrai élément sous le pointeur avant de simuler le clic dessus — un clic
  simulé directement sur le conteneur SVG ne passe pas par la résolution
  géométrique du navigateur et aurait donné un faux négatif), zone de tap
  élargie sur un trait fin, mode suppression, Tout révéler/Tout masquer,
  rendu joueur (une seule zone visible sur deux, aucune couleur, aucun
  contrôle), création d'une carte au format portrait (1200×1800) avec
  `imgW`/`imgH` corrects et rendu sans distorsion. **Non testé** : le geste
  réel au doigt sur un vrai téléphone (c'est pourtant l'objectif premier de
  cette refonte) — à confirmer par toi, idéalement en conditions réelles de
  jeu.
  **Table Supabase à créer** : script fourni dans
  `outils/supabase_dungeonmaps_setup.sql` (policy MJ CRUD standard + policy
  de lecture joueur filtrée sur `active`), inchangé depuis la v1 — à
  exécuter par Tristan dans l'éditeur SQL Supabase, à confirmer et à
  reporter dans le ledger ci-dessous une fois fait.
- **Cartes de donjon — deux corrections après premier essai réel de
  Tristan (v3, même soirée)** :
  1. **Décalage entre le clic et l'endroit où le tracé apparaissait.**
     `svgPtFromEvent()` convertissait `clientX/Y` en coordonnées SVG à la
     main (`(clientX-rect.left)/rect.width*imgW`), en se basant sur
     `getBoundingClientRect()` du `<svg>`. Ce calcul suppose implicitement
     que la boîte CSS de l'élément a exactement le même ratio que le
     `viewBox` — dès qu'il y a le moindre écart (arrondi de layout, ou tout
     cas où `preserveAspectRatio="xMidYMid meet"` doit réellement composer
     avec un ratio différent), le rendu ajoute une marge de letterboxing
     centrée que `getBoundingClientRect()` ne reflète pas, et le calcul
     devient faux de façon visible. Reproduit et confirmé en forçant
     volontairement un écart de ratio (`imgW/imgH` déclarés différents du
     ratio réel affiché) : l'ancien calcul donnait un point à `y=450`, le
     bon point (confirmé par le rendu réel) est `y=500`. **Fix** : remplacé
     par l'API SVG native faite pour ça —
     `svg.createSVGPoint()` + `point.matrixTransform(svg.getScreenCTM().inverse())`
     — qui tient compte automatiquement du `viewBox`, du
     `preserveAspectRatio` et de toute transformation CSS, sans recalcul
     manuel. Élimine toute la classe de bug, pas seulement le cas précis
     observé.
  2. **Brouillard inversé, à la demande de Tristan.** Jusque-là : tout le
     plan visible par défaut, une zone cachée peignait du noir par-dessus
     (modèle additif "on cache ce qu'on a pensé à cacher"). Nouveau modèle,
     plus sûr en pratique (une zone jamais dessinée reste cachée par défaut
     au lieu d'être visible par oubli) : le plan est **noir partout par
     défaut**, une zone **révélée** (`!s.hidden`) perce un trou de
     visibilité à son emplacement — l'inverse exact. Implémenté avec un
     `<mask>` SVG (équivalent du `destination-out` canvas de la v2, mais en
     SVG) : un rectangle blanc plein (= le calque noir reste visible
     partout) percé de tracés noirs uniquement aux zones révélées (= trou
     dans le masque = calque noir invisible = carte visible à cet endroit).
     Vue joueur : calque 100% opaque, aucune zone rendue individuellement.
     Vue MJ : même calque en semi-transparent (`opacity:.55`) pour garder
     la carte visible en travaillant, plus les zones colorées par-dessus
     (toutes, cachées ou révélées) pour rester tapotables. Effet de bord
     découvert en testant : une zone créée par un simple tap sans glisser
     (un seul point, ex. pour marquer un petit élément ponctuel) générait
     un chemin SVG `"M x,y"` sans segment — ne s'affichait pas du tout et
     n'était donc plus jamais tapotable/supprimable (chemin fantôme,
     silencieusement invisible). Fix dans `pathDFromPoints()` : un point
     unique est dédoublé en `"M x,y L x,y"` pour forcer un segment de
     longueur nulle, qui affiche bien un point rond grâce à
     `stroke-linecap:round`.
  Les deux fixes testés dans un navigateur avec un vrai viewport (clics
  simulés avec résolution géométrique réelle via
  `document.elementFromPoint`, et un écart de ratio `imgW`/`imgH` forcé
  exprès pour vérifier le fix #1) — non testé au doigt sur un vrai
  téléphone, cette confirmation reste à faire par Tristan.
- **Cartes de donjon — trois nouveaux correctifs après un vrai test sur une
  carte réelle (même soirée, captures d'écran fournies par Tristan)** :
  1. **L'obscurité ne couvrait pas tout le plan** (bandes visibles en haut
     et en bas de l'image sur la vue joueur). Cause : la carte testée avait
     été créée *avant* l'introduction d'`imgW`/`imgH` (juste au-dessus dans
     ce même journal) ou n'avait jamais été rouverte côté MJ pour se
     corriger — le viewBox retombait donc sur le repli `1000×1000` (carré),
     alors que l'image réelle ne l'est pas. Un viewBox carré dans une boîte
     non carrée + `preserveAspectRatio="meet"` laisse nécessairement des
     bandes hors du contenu réel. **Fix — auto-réparation, v2 après
     régression (voir point 4 ci-dessous)** : `fixDungeonMapViewBox()`
     corrige le `viewBox` depuis les vraies dimensions de l'`<img>` une fois
     chargée (immédiat si déjà en cache navigateur, sinon au `load`), sans
     jamais bloquer le rendu en attendant — la carte s'affiche tout de
     suite avec le meilleur viewBox connu, puis se corrige à la volée. Le MJ
     persiste la correction (`saveDB()`, a les droits d'écriture) ; côté
     joueur elle ne reste qu'en mémoire pour cette session (RLS interdit
     l'écriture aux joueurs) et se réappliquera au prochain rendu si besoin
     — sans conséquence, puisque `fixDungeonMapViewBox()` ne dépend jamais
     d'une donnée persistée pour fonctionner. Vérifié : une carte factice
     sans `imgW`/`imgH` de ratio non carré (632×789) se répare bien à sa
     vraie taille, boîte du SVG exactement égale à celle de l'image.
  2. **Tracés peu fidèles au geste réel** ("les tracés ne sont pas fidèles
     précisément au coup de brush"). Cause : le pas d'échantillonnage des
     points pendant le glissé (`minStep`) était calculé comme
     `rayonDuPinceau / 4` — avec un pinceau large (comme ceux visibles sur
     la capture d'écran de Tristan), ce pas devenait grand, donc peu de
     points étaient réellement enregistrés le long du geste de souris.
     **Fix** : pas fixe et petit indépendant du rayon
     (`max(3px, 0.4% de la plus grande dimension de l'image)`) — un
     pinceau large n'a plus d'excuse pour échantillonner grossièrement.
     Vérifié : un glissé lent simulé en pas de 4px (image) capture
     désormais 41 points sur un test où l'ancien seuil n'en aurait capté
     qu'une quinzaine.
  3. **Découpage "biseauté"/à facettes au lieu d'un contour rond.** Cause :
     `pathDFromPoints()` reliait les points échantillonnés par de simples
     segments droits (`"M x,y L x,y L x,y…"`) — une polyligne, quel que
     soit le nombre de points, a toujours des angles vifs à chaque sommet,
     visibles comme des facettes dès que le geste n'est pas parfaitement
     rectiligne (c'est ce qui donne aussi, en cumulé avec le fix #2 non
     encore posé, l'aspect "chelou" remarqué par Tristan pendant le tracé
     lui-même). **Fix** : lissage par courbes de Bézier quadratiques
     passant par le milieu de chaque paire de points consécutifs (technique
     standard de dessin à main levée) au lieu de segments droits — la même
     fonction sert au tracé final ET à l'aperçu en direct pendant le
     glissé, donc les deux profitent du lissage. Vérifié : le `d` généré
     pour un tracé à 5 points contient bien des commandes `Q` (courbe) et
     non plus uniquement des `L` (droite).
  Les trois fixes testés dans un navigateur avec un vrai viewport. **Non
  vérifié** : le rendu visuel réel de la douceur du tracé lissé à l'œil
  (seule la structure du chemin SVG généré a été vérifiée par assertion,
  pas une capture d'écran) — à confirmer par toi que "biseauté" a bien
  disparu en pratique, idéalement avec le même donjon que sur tes captures.
  4. **Régression introduite par le point 1 ci-dessus, trouvée par Tristan
     ("le rafraîchissement ne se fait plus côté joueur")** : la première
     version du fix #1 affichait un état "Chargement…" bloquant tant que
     `m.imgW`/`m.imgH` n'étaient pas connus, le temps de charger l'image en
     arrière-plan. Correct pour le MJ (qui persiste immédiatement la
     correction), mais **boucle infinie côté joueur** : `startDungeonMapsPolling()`
     écrase entièrement `db.dungeonmaps` avec les données fraîches du
     serveur toutes les 4,5s ; si la carte active n'a jamais été réparée
     côté MJ (donc toujours sans `imgW`/`imgH` sur le serveur), la
     correction en mémoire du joueur se faisait immédiatement écraser par
     le tick de polling suivant, qui relançait l'état "Chargement…" — vu
     par le joueur comme un écran bloqué en permanence, facile à confondre
     avec "le polling ne tourne plus". **Fix** : plus aucun état bloquant —
     `fixDungeonMapViewBox()` (point 1) corrige le rendu déjà affiché sans
     jamais gater le rendu initial sur la disponibilité des dimensions.
     Reproduit et vérifié le scénario exact : rendu immédiat (pas de
     "Chargement…"), correction du viewBox après chargement de l'image,
     PUIS simulation d'un tick de polling qui réinjecte la même carte sans
     `imgW`/`imgH` (comme le ferait le vrai serveur tant que le MJ n'a pas
     rouvert la carte) — le rendu reste stable et se recorrige à chaque
     fois, sans jamais re-bloquer sur un écran de chargement.
- **Cartes de donjon — "cœur noir" au centre d'une zone en boucle, trouvé
  par Tristan avec une capture zoomée (même soirée)** : dessiner une zone en
  formant une boucle (geste naturel pour couvrir toute une pièce — suivre
  son contour) laissait un trou non peint en plein centre. Cause : un
  `<path>` en simple `stroke` (sans `fill`) ne peint que la *bande* qui
  suit le tracé, pas l'intérieur qu'elle délimite — un pinceau qui fait le
  tour d'une pièce plus grande que lui ne peint donc qu'un anneau, jamais
  le disque entier (comportement correct pour un pinceau au sens strict,
  mais pas pour l'usage réel : marquer une pièce entière d'un coup de
  contour, comme un lasso). **Fix** : `pathDFromPoints()` ferme désormais
  toujours le chemin (`Z` final), et les trois rendus concernés (trou du
  masque de brouillard, zone colorée MJ, zone de tap invisible) appliquent
  un `fill` en plus du `stroke` — une boucle remplit alors tout son
  intérieur, avec le `stroke` qui ajoute simplement la marge du rayon du
  pinceau tout autour du contour. `pointer-events` passé de `stroke` à
  `all` sur la zone de tap et les zones colorées pour que l'intérieur
  nouvellement rempli reste lui aussi tapotable (pas seulement l'anneau).
  Un tracé qui ne boucle pas (ligne ouverte) n'est pas affecté visuellement
  de façon notable : fermer ajoute juste un segment droit discret entre la
  fin et le début, absorbé par l'épaisseur du trait. Aucune migration de
  données nécessaire — `pathDFromPoints()` est une fonction de rendu pure,
  le fix s'applique automatiquement à toutes les zones déjà dessinées dès
  le prochain rendu. Vérifié : une boucle de rayon 150px dessinée avec un
  pinceau de rayon 48px (donc un anneau bien plus petit que la boucle, cas
  qui aurait clairement laissé un trou avant le fix) — le centre de la
  boucle est maintenant bien identifié comme faisant partie de la zone
  (`elementFromPoint` en plein centre résout sur le bon `data-dmap-stroke`)
  et un tap en plein centre bascule effectivement `hidden` sur toute la
  zone, pas seulement sur l'anneau.
- **Cartes de donjon — fenêtre carrée côté joueur alors que le tracé est
  rond côté MJ, trouvé par Tristan (captures comparatives à l'appui, même
  soirée)** : le `<path>` du trou percé dans le masque de brouillard
  (`revealHoles`, dans `dungeonMapFrame()`) était créé sans aucune classe
  CSS, contrairement au tracé visible MJ (`class="dmap-stroke ..."`, qui
  porte `stroke-linecap:round; stroke-linejoin:round`). Sans ces
  propriétés, un `<path>` SVG retombe sur les valeurs par défaut — bouts
  plats (`butt`) et jointures en angle vif (`miter`) — au lieu de bouts et
  jointures arrondis. Un tracé épais avec bouts plats/jointures vives a
  des allures de rectangle/polygone anguleux, très différent du blob
  organique que le MJ voit et a dessiné. **Fix** : `stroke-linecap="round"
  stroke-linejoin="round"` ajoutés explicitement sur le `<path>` du trou de
  masque (au lieu d'une classe, pour ne pas dépendre d'un futur changement
  CSS sur `.dmap-stroke` qui ne conviendrait pas forcément à un enfant de
  `<mask>`). Corrigé au passage le même oubli, moins visible mais réel, sur
  le `<path>` de zone de tap invisible (`dmap-stroke-hit`) qui n'avait pas
  non plus la classe `dmap-stroke` — sans conséquence visuelle (invisible)
  mais avec un impact réel sur la précision du tap près des extrémités
  d'une zone. Fonction de rendu pure comme les fixes précédents sur ce
  fichier, aucune migration nécessaire. Vérifié : le `<path>` du trou de
  masque porte maintenant `stroke-linecap="round"` et
  `stroke-linejoin="round"`, et son `d`/`stroke-width` sont strictement
  identiques à ceux du tracé visible MJ correspondant (donc géométriquement
  la même forme, pas seulement visuellement proche).
- **Cartes de donjon — quatre ajouts demandés par Tristan après usage réel
  (même soirée)** :
  1. **Pinceau toujours au minimum, jamais utilisé en grand** : la plage du
     curseur `dmap-brush-size` passe de `2-25` à `0.3-15` (% du plus grand
     côté de l'image), pas fixe à `0.1`, défaut `2` au lieu de `6` — de la
     place pour des tracés bien plus fins, sans perdre la possibilité de
     couvrir vite une grande zone.
  2. **Adoucissement des bords réglable** ("les bords sont trop bruts") :
     nouveau champ `m.softness` par carte (0 par défaut, valeur inchangée
     pour toute carte existante — pas de migration), curseur dédié à côté de
     la taille du pinceau. Implémenté par un flou gaussien SVG
     (`<feGaussianBlur>`) appliqué au *contenu* du masque de brouillard
     (fond blanc + trous), pas aux zones colorées MJ ni au tracé — celles-ci
     doivent rester nettes pour bien voir où tapoter. Comme la même
     `<mask>` sert au calque MJ (semi-transparent) et joueur (opaque), les
     deux profitent automatiquement du même adoucissement. Curseur en deux
     temps : `input` (pendant le glissé) retouche juste l'attribut
     `stdDeviation` du filtre pour un aperçu fluide sans re-rendu, `change`
     (relâché) persiste une seule fois — évite de spammer Supabase à
     chaque micro-mouvement du curseur.
  3. **Effet "polygone" involontaire sur un arc/une ligne ouverte** — la
     fermeture automatique posée pour combler l'intérieur d'une boucle
     (point précédent de ce journal) fermait aussi les tracés qui
     n'étaient PAS censés boucler (un arc, une ligne), remplissant la zone
     entre le tracé et la "corde" reliant son début à sa fin — exactement
     ce que Tristan a décrit ("mon point de départ va rejoindre mon point
     d'arrivée avec un segment qui va tout remplir"). **Fix** :
     `isLoopStroke()` ne ferme/remplit désormais que si le tracé revient
     effectivement près de son point de départ (≤ 1,5 rayon de pinceau) ;
     sinon le tracé reste un trait ouvert (`fill:none`, pas de `Z`), sans
     la "corde" surprenante. L'aperçu en direct pendant le glissé applique
     déjà la même règle, donc le MJ voit le résultat final avant même de
     relâcher. Vérifié : un arc large (points de départ/arrivée séparés de
     600px) reste ouvert (`fill:none`, pas de `Z`) ; une boucle (rayon de
     boucle 60px, pinceau 60px) reste fermée/remplie comme avant.
  4. **Nouvel outil "Polygone"**, suggéré par Tristan en cours de session
     comme alternative plus précise au pinceau libre pour des murs droits.
     Clic = pose un sommet ; les sommets sont reliés par des **lignes
     droites** (pas de lissage en courbes — un polygone doit rester précis,
     contrairement au pinceau où le lissage sert justement à éviter les
     angles vifs indésirables) ; « ✓ Terminer » (ou un clic à proximité du
     premier sommet, snap à 2% de la plus grande dimension de l'image)
     ferme la forme ; « ↩ Annuler le dernier sommet » pour corriger un
     mis-clic sans tout recommencer. Comme au pinceau, le mode reste actif
     après chaque polygone terminé pour en enchaîner plusieurs. Stocké
     comme les zones au pinceau (`m.strokes[]`) mais avec `shape:"polygon"`
     et `radius:0` (une zone polygonale n'a pas de marge de pinceau autour
     de son contour — ses sommets sont la forme exacte voulue) ; le rendu
     (`strokeGeometry()`) dispatche sur `s.shape` et reste toujours
     fermé/rempli pour un polygone (pas d'ambiguïté boucle/pas-boucle
     contrairement au pinceau). Le brouillon de polygone
     (`dmapDraftPolygon`) doit survivre à un re-rendu complet — contrairement
     au brouillon de pinceau qui se met à jour en place pendant un glissé
     continu, chaque sommet posé au clic redessine toute la vue pour
     afficher les boutons Terminer/Annuler ; seul un changement de carte ou
     d'outil vide le brouillon, pas un re-rendu de la carte en cours.
     Vérifié : pose de 4 sommets (rectangle), annulation du dernier sommet,
     nouvelle pose, fermeture — le tracé final est un chemin `M…L…L…L…Z`
     sans aucune courbe, rempli de la couleur assignée, avec la même
     mécanique de trou de masque/bulk-actions que les zones au pinceau.
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
| dungeonmaps | ⏳ | ⏳ | ⏳ | script fourni (`outils/supabase_dungeonmaps_setup.sql`, policy lecture joueur **filtrée sur `active`**, pas le modèle standard), **à exécuter par toi** |

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

### Vérification de synchro — 2026-08-06 (fin de journée)

Suite à une demande de vérifier que tout était bien à jour. Résultat :
dossier local (Desktop), `/tmp/sdc-work` et `origin/main` bien alignés sur
le même commit après un `git pull` — aucune perte de travail, tout ce qui a
été poussé aujourd'hui (mes changements et ceux de Dual) est bien en ligne.
Site live vérifié (répond, affiche les nouveaux onglets Initiative/Roue).

Au passage, Dual a livré aujourd'hui pendant que je travaillais sur d'autres
parties : l'implémentation réelle de l'onglet **Initiative** (timeline de
combat en direct, polling léger) et un nouvel onglet **Roue** (bonus à
tirer, easter egg anniversaire), plus une migration du déploiement GitHub
Pages vers un workflow GitHub Actions explicite (l'ancien mode « Deploy from
a branch » restait bloqué en boucle sur des timeouts). Tout est documenté
dans les points d'attention structurels ci-dessus et dans le ledger Supabase
— rien à corriger de mon côté, la coordination via ce fichier a bien
fonctionné.

**Bug trouvé et corrigé** : `outils/audit-check.sh` et
`outils/compress-portraits.py` s'étaient retrouvés avec des fins de ligne
CRLF (probablement une conversion automatique côté Windows), ce qui cassait
leur exécution sous Linux/macOS (`/usr/bin/env: 'bash\r': No such file or
directory`, puis une erreur sur `set -euo pipefail` même en forçant
`bash script.sh`). Reconverti en LF et ajouté un `.gitattributes`
(`*.sh text eol=lf`, `*.py text eol=lf`) pour empêcher que ça se reproduise,
quelle que soit la plateforme utilisée pour éditer/commiter. À surveiller
lors des prochains audits : relancer `outils/audit-check.sh` fait partie du
protocole justement pour attraper ce genre de régression tôt.

**Bug signalé par Tristan (capture d'écran) et corrigé dans la foulée** :
sur l'onglet Roue, le texte des secteurs de la moitié basse de la roue
s'affichait à l'envers. Cause : `buildWheelSVG()` fait pivoter chaque ligne
de texte de `mid+90°` pour l'aligner tangentiellement au rayon (`mid` =
angle du secteur) — correct sur la moitié haute, mais ça retourne le texte
de 180° sur la moitié basse. Fix : si l'angle de rotation normalisé tombe
entre 90° et 270°, on ajoute 180° pour repasser le texte à l'endroit (même
ligne, sens de lecture inversé) — technique standard pour les labels
radiaux de camembert. Vérifié par un test angle-par-angle sur tout le
cercle (script Node, hors app) avant de pousser.

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
