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

- **Structure du dépôt (depuis le 6/08/2026, réorganisé le 11/08/2026)** :
  `index.html`, `README.md`, `.gitignore` et `portraits/` restent à la
  racine (chemins référencés en dur dans le code ou convention GitHub).
  `docs/` (documentation interne), `outils/` (scripts) et `sources/`
  (PDF/XML/JSON déjà intégrés à l'appli, brouillons non nécessaires en prod)
  regroupent le reste.
  **Assets Hexcrawl → `Hextiles/` (2026-08-11)** : Tristan a rangé en local
  tous les PNG du Hexcrawl (jusque-là éparpillés à la racine) dans un seul
  dossier `Hextiles/`, en conservant leur arborescence interne à l'identique
  (déplacement pur, aucun fichier renommé ni modifié — vérifié par hash).
  Contenu de `Hextiles/` : les 27 `N-foundation_*.png` (overlays de terrain,
  indépendants du biome), les 5 PNG agrégats `deadlands.png`/`drylands.png`/
  `greenlands.png`/`icelands.png`/`sandlands.png` (vignettes + fond de tuile
  réellement utilisés par le code), et trois chantiers non utilisés par le
  code actuel mais conservés tels quels : `drylands/`, `greenlands/`,
  `icelands/` (variantes teintées par biome de l'ancien overlay, abandonnées
  au profit du set neutre `foundation_*` — voir commentaire au-dessus de
  `hexBiomeImageSVG` dans `js/hexcrawl.js`) et `Neutre/` (idem). Code mis à
  jour en conséquence dans `js/hexcrawl.js` : les deux endroits qui
  construisent un chemin d'image (`biomePickerHTML`/`overlayPickerHTML` pour
  les `<img src>` des pickers, `hexTerrainLayerSVG` pour le rendu réel des
  tuiles) préfixent désormais `Hextiles/`. **Les valeurs stockées en base
  (`h.biome`, `h.overlay`, `OVERLAY_LIST[].file`) restent des noms de
  fichier nus, sans le préfixe** — seul le point de rendu ajoute
  `Hextiles/`, pour ne pas invalider les cartes hexcrawl déjà enregistrées
  dans Supabase avant ce changement. Prochaine session qui range de
  nouvelles images du même type : les mettre dans `Hextiles/` (racine du
  dossier pour les fichiers réellement utilisés, cf. liste ci-dessus).
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
- **Cartes de donjon — mode "Aperçu joueur" côté MJ, demandé par Tristan
  après retour positif sur l'ensemble de la fonctionnalité (même soirée)** :
  bouton toggle `👁 Aperçu joueur` dans la barre d'outils MJ, affiche/masque
  un second rendu de la carte, sous la vue d'édition normale — exactement
  `dungeonMapFrame(m, false, ...)`, le même rendu que la vraie vue joueur
  (patchs 100% opaques, zéro élément interactif dans le DOM), pas une
  approximation. La vue d'édition MJ au-dessus reste inchangée
  (semi-transparente, interactive). Sous-titre adapté selon l'état de la
  carte : « exactement ce que voient les joueurs en ce moment » si `m.active`
  est vrai, sinon « à quoi ressemblerait cette carte si elle était activée »
  (une carte non active n'est par définition montrée à personne — le
  toggle reste utilisable pour prévisualiser avant d'activer, mais le texte
  ne doit pas prétendre à tort refléter l'instant présent). État
  `dmapShowPlayerPreview`, local au client (pas persisté), réinitialisé au
  changement de carte comme les autres brouillons transitoires de cet
  onglet.
  **Point technique découvert en implémentant** : `dungeonMapFrame()`
  fixait en dur `id="dmap-svg"` sur le `<svg>` qu'elle génère, ainsi que
  `id="dmap-mask"`/`id="dmap-soften"` sur le masque et le filtre de flou à
  l'intérieur — sans conséquence tant qu'une seule instance existait sur la
  page à la fois, mais l'aperçu en ajoute une seconde simultanément, ce qui
  aurait produit des `id` HTML dupliqués (invalides, résolution de
  `url(#id)` non garantie d'un navigateur à l'autre). Fix : `svgId` passé en
  paramètre (`"dmap-svg"` par défaut pour ne rien casser côté vue joueur
  réelle et détail MJ existant, `"dmap-svg-preview"` pour le second rendu),
  `id` du mask/filter dérivés (`${svgId}-mask`, `${svgId}-soften`) —
  `fixDungeonMapViewBox()` prend aussi `svgId` en paramètre et est appelée
  une fois par instance affichée. Le curseur d'adoucissement des bords met
  à jour en direct (`input`) les DEUX filtres par leur id namespacé quand
  l'aperçu est affiché, pour que le calque MJ et l'aperçu réagissent
  ensemble pendant le glissé, pas seulement après relâchement.
  Testé (sans viewport réel disponible cette fois, mais sans besoin de
  coordonnées de pointeur pour cette fonctionnalité — vérifié par
  inspection directe du DOM) : les deux `<svg>` coexistent avec des `id`
  distincts et des `<mask>`/`<filter>` distincts, l'aperçu ne contient
  aucun `[data-dmap-stroke]` (zéro interactivité), le nombre de trous du
  masque de l'aperçu suit bien les bascules caché/révélé faites côté vue
  MJ (0 puis 1 puis 2 trous testés), le toggle masque/affiche bien le bloc,
  l'état se réinitialise au changement de carte, et le sous-titre change
  bien selon `m.active`.
- **Cartes de donjon — intervalle de polling joueur descendu de 4,5s à
  2,5s, à la demande de Tristan (même soirée)** : latence perçue jugée trop
  grande entre un tap MJ et sa répercussion côté joueur. Ce n'était pas une
  limite technique dure — juste la même valeur que l'Initiative, reprise
  par convention. **Point d'attention laissé en commentaire dans le code**,
  à ne pas perdre de vue si on veut descendre encore : contrairement à
  l'Initiative (données texte légères), chaque tick de polling des cartes
  de donjon retélécharge la ligne Supabase **entière** de la carte active —
  `select("data")` ramène tout le jsonb, donc l'image base64 du plan à
  chaque fois, pas seulement `strokes`/`active`/`softness`. Potentiellement
  plusieurs centaines de Ko par tick ; sur une session de plusieurs heures
  au téléphone, la consommation de data mobile cumulée est réelle et croît
  linéairement avec la fréquence de polling. 2,5s est un compromis
  raisonnable non testé en usage réel (pas de mesure de consommation data
  disponible dans cette session) — à confirmer par toi que la sensation de
  latence s'est bien améliorée sans que la conso data devienne gênante en
  jeu. **Optimisation plus poussée identifiée mais volontairement pas
  tentée** : séparer l'image (statique, à charger une fois par session) de
  l'état qui bouge vraiment (`strokes`/`active`/`softness`), via une
  sélection PostgREST sur des sous-champs du jsonb (`select=data->active,
  data->strokes,...`) plutôt que la ligne complète — permettrait de
  descendre bien plus bas (1-1,5s) sans alourdir la bande passante. Pas
  implémenté ici : je n'ai pas d'accès direct au vrai projet Supabase pour
  vérifier le nom exact des colonnes résultantes de cette syntaxe contre le
  schéma réel, et une erreur de sélection silencieuse casserait le
  rafraîchissement joueur sans message d'erreur visible (pire que la
  lenteur actuelle) — à faire dans une session où ce point peut être
  vérifié en direct contre la vraie base, ou par Tristan lui-même.
- **Cartes de donjon — remplacement de l'image d'une carte existante en
  conservant les zones déjà dessinées, demandé par Tristan (même soirée)** :
  bouton dédié « 🖼 Remplacer l'image du plan » sur la vue détail MJ (sous
  le titre, à côté des actions génériques), distinct du remplacement
  d'image existant via « ✎ Modifier » (`formDungeonMap`/`saveDungeonMap`)
  qui, lui, vide volontairement `m.strokes` — pensé pour réutiliser un
  emplacement de carte pour un donjon totalement différent, comportement
  inchangé et toujours d'actualité pour ce cas-là.
  **Prémisse initiale de la demande à corriger** : Tristan pensait que les
  patchs étaient stockés en pourcentage (x/y/w/h relatifs à l'image), ce
  qui aurait rendu un simple remplacement de `m.image` sans risque — c'était
  vrai pour la v1 (patchs rectangulaires, abandonnée), mais plus depuis la
  v3 (`m.strokes[].points`/`.radius` stockés en **pixels absolus** de
  l'image, justement pour que le viewBox SVG reste calé sans distorsion des
  ronds de pinceau — voir les points précédents de ce journal). Un simple
  remplacement de `m.image` en gardant `m.strokes` intact aurait donc
  décalé toutes les zones dès que la nouvelle image n'a pas exactement les
  mêmes dimensions en pixels que l'ancienne.
  **Fix implémenté** (`replaceDungeonMapImage()`) : retrouve l'effet
  attendu par Tristan en **rééchelonnant** chaque point et chaque rayon de
  `m.strokes` proportionnellement au ratio nouvelle/ancienne dimension
  (`scaleX = newW/oldW`, `scaleY = newH/oldH`, rayon mis à l'échelle par la
  moyenne des deux) — équivalent à un stockage en pourcentage, mais calculé
  une seule fois au moment du remplacement plutôt que maintenu en continu.
  Pour un remplacement "même cadrage, résolution différente" (le cas visé :
  réexport du fichier source retouché), l'alignement reste parfait. Si le
  cadrage a vraiment changé (recadrage, contenu différent), aucun calcul ne
  peut deviner la bonne position — d'où l'avertissement affiché sous le
  bouton, texte explicite plutôt que silence. Même plafond de résolution
  (`processMapImage()`, 1800px) que pour l'upload initial.
  Fichier d'upload séparé (`#file-mapimg-replace`) de celui du formulaire
  de création/renommage (`#file-mapimg`) — flux indépendants, pas de
  réutilisation d'état partagé entre les deux.
  Vérifié : doublement exact de résolution (800×500→1600×1000, même ratio)
  — chaque point et chaque rayon exactement doublés, positions relatives
  identiques ; puis un second remplacement avec un ratio différent
  (1600×1000→1800×1200, plafond de résolution appliqué) — mise à l'échelle
  non uniforme cohérente sur x et y, aucune valeur aberrante. `id`/`color`/
  `hidden`/`shape` de chaque zone inchangés dans les deux cas.
- **Mode « Aperçu Joueur » global, demandé par Tristan (2026-08-10)** : remplace/généralise
  l'ancien mode aperçu spécifique aux Cartes de donjon par un bouton `👁 Aperçu joueur` dans le
  header (visible uniquement pour le vrai MJ, à côté de Crédits/Export/Import/Déconnexion), qui
  bascule TOUTE l'appli en simulation d'affichage joueur, sans changer de compte ni de session
  Supabase. But explicite de Tristan : vérifier ce que voient réellement les PJ sans avoir à ouvrir
  une deuxième session avec un compte joueur.
  **Implémentation** : `myRole` (le vrai rôle authentifié) reste inchangé — un nouveau flag
  client-side `previewAsPlayer` (jamais persisté) et une fonction `effectiveRole()` (`previewAsPlayer
  ? "player" : myRole`) s'intercalent. Tous les endroits du code qui décidaient déjà quoi afficher
  via une comparaison `myRole==="gm"`/`myRole!=="gm"` (déclarations/affectations de `myRole`
  exceptées) ont été basculés sur `effectiveRole()` — une seule bascule mécanique
  (`sed`/replace_all sur les deux formes de comparaison) a suffi à couvrir d'un coup : le masquage
  des onglets (`PLAYER_VISIBLE_TABS` dans `applyRoleUI()`), les boutons créer/éditer/dupliquer/
  supprimer (`pageHead()`/`detailActions()`), ET les filtres de contenu déjà existants par onglet
  (carte de donjon **active** uniquement dans `viewDungeonMaps()`/`playerDungeonMapView()`, entrées
  de carnet de route marquées `visible` dans `listSessions()`/`detailSession()`, fog state des
  hexagones, etc.) — puisque ces filtres étaient déjà écrits comme des branches `isGM = myRole===
  "gm"` locales à chaque fonction de rendu, aucune logique de filtrage n'a eu besoin d'être
  dupliquée ou réécrite à la main : le mode aperçu en hérite automatiquement partout où le rôle
  était déjà correctement testé.
  **Bouton d'activation** : seul élément qui teste explicitement le vrai `myRole` (jamais
  `effectiveRole()`) — sinon il disparaîtrait dès l'activation et rendrait le mode impossible à
  quitter.
  **Correctif (même jour, retour de Tristan après premier essai)** : la toute première version de
  `togglePlayerPreview()` changeait d'onglet à l'activation dès que l'onglet courant n'était pas
  dans `PLAYER_VISIBLE_TABS` (retombait sur « Carnet de route »), ce que Tristan a signalé comme
  pénible — un aller-retour manuel était nécessaire pour revenir à l'onglet de travail après un
  simple coup d'œil. **`togglePlayerPreview()` ne change désormais plus jamais d'onglet, dans
  aucun des deux sens** (seule exception : un formulaire de création/édition en cours retombe sur
  la liste du MÊME onglet, dans les deux sens — des données non enregistrées seraient de toute
  façon perdues au premier re-rendu, donc rien à préserver ni à restaurer). Pour un onglet réservé
  au MJ (hors `PLAYER_VISIBLE_TABS`, ex. Créatures, Trésor — sans aucune branche de rendu « joueur »
  puisqu'un vrai compte joueur n'y accède jamais), `render()` affiche désormais un état dédié « Cet
  onglet n'est pas visible aux joueurs » **à la place** du contenu réel, toujours sur le même
  onglet, plutôt que de rediriger vers un autre onglet. Bascule ON/OFF donc strictement
  symétrique et sans navigation implicite : l'onglet/mode/id affiché avant l'activation est
  exactement celui qui reste affiché après la désactivation, puisqu'il n'a jamais changé entre
  les deux.
  **Effet de bord découvert et corrigé au passage** : `renderDetail()` routait le type
  `dungeonmap` directement vers `detailDungeonMap()` (la vue d'édition MJ complète), sans aucun
  test de rôle — sans conséquence tant que l'onglet changeait forcément à l'activation (un vrai
  joueur n'atteint jamais cette route), mais devenu un vrai risque de fuite une fois l'onglet
  préservé : un MJ resté sur le détail d'une carte au moment de basculer l'aperçu aurait vu
  l'interface d'édition complète (zones colorées, outils) au lieu du rendu joueur. **Fix** :
  `renderDetail()` route maintenant ce cas vers `effectiveRole()==="gm" ? detailDungeonMap(o) :
  playerDungeonMapView()` — qui affiche la carte **active** en lecture seule (pas nécessairement
  celle que le MJ avait ouverte), exactement comme un vrai joueur. Les deux corrections vérifiées
  en direct dans le navigateur (données de test injectées en console) : onglet réservé au MJ en
  mode liste ET en mode détail restent sur le même onglet pendant l'aperçu (état « non visible »
  affiché) et reviennent inchangés à la sortie ; formulaire d'édition en cours retombe sur la
  liste du même onglet dans les deux sens ; détail d'une carte de donjon inactive ouverte côté MJ
  bascule sur le rendu joueur de la carte **active** (pas de fuite de l'UI d'édition), et revient
  exactement au détail MJ d'origine à la sortie.
  **Bandeau d'indication** : `#preview-banner`, fixe en haut d'écran, avec un bouton « ↩ Revenir en
  mode MJ » redondant avec le bouton du header (toujours accessible même après avoir scrollé). Le
  header (sticky) est décalé de la hauteur réelle du bandeau via une variable CSS
  (`--preview-banner-h`, posée en JS par `syncPreviewBannerHeight()`, recalculée au
  redimensionnement/rotation) plutôt qu'une constante en dur — un texte qui passe sur deux lignes
  sur mobile ne laisse donc jamais un chevauchement de quelques pixels entre bandeau et header (bug
  constaté puis corrigé pendant le développement avec une constante fixe `2.5rem`, qui ne
  correspondait pas exactement à la hauteur réelle rendue).
  **Ancien mode aperçu spécifique aux Cartes de donjon (`dmapShowPlayerPreview`, bouton `👁 Aperçu
  joueur` dans la vue détail MJ d'une carte)** : **conservé tel quel**, pas absorbé/supprimé. Décision
  prise en connaissance du fait que Tristan a explicitement demandé l'absorption « à ma discrétion »
  — choix motivé par deux points : (1) il couvre un cas que le mode global ne peut pas reproduire
  (prévisualiser une carte **avant** de l'activer, ou comparer côte à côte le rendu MJ et joueur
  **en même temps** en dessinant des zones — le mode global, lui, quitte entièrement l'UI d'édition
  puisqu'il simule un vrai joueur qui n'a jamais accès à cette UI) ; (2) `docs/TODO.md` marque
  « Cartes de donjon : Terminé […] Rien à faire tant qu'il ne signale rien de nouveau », donc
  toucher à ce mécanisme spécifique (au-delà du strict nécessaire) semblait aller à l'encontre de
  cette instruction. Les deux mécanismes ne se recouvrent pas en pratique : ils ne partagent aucun
  état (`previewAsPlayer` vs `dmapShowPlayerPreview`), et le mode global, une fois actif, empêche de
  toute façon d'atteindre la vue détail MJ d'une carte (routé vers `playerDungeonMapView()` comme un
  vrai joueur) — donc aucun conflit visuel ou fonctionnel possible entre les deux.
  **Testé** : voir `duringPreview`/comparaison ci-dessous — le rendu HTML produit par le mode aperçu
  (compte MJ réel + `previewAsPlayer=true`) a été comparé **caractère pour caractère** à celui
  produit par un vrai compte joueur (`myRole="player"`) sur les mêmes données de test (une session
  avec une entrée visible et une masquée, une carte de donjon active et une inactive) : identique
  sur les deux onglets testés (Carnet de route, Cartes de donjon), ainsi que sur l'ensemble des
  onglets visibles dans la nav. Bouton créer masqué, sortie du mode restaure exactement l'onglet/
  mode MJ d'origine. **Non testé en conditions réelles** : contre un vrai compte joueur connecté en
  parallèle (aucun accès à un second compte dans cette session) — la comparaison ci-dessus contre un
  rendu simulé `myRole="player"` sur les mêmes fonctions de rendu est cependant une preuve plus
  forte qu'une simple relecture de code, puisque c'est exactement le même chemin de code qui produit
  le rendu joueur réel. Non testé non plus : le rendu visuel du bandeau à l'œil (seules les
  dimensions DOM ont été vérifiées par assertion, pas de capture d'écran disponible dans cette
  session) — à confirmer par toi après déploiement.
- **Hexcrawl — rotation des images de biome/overlay corrigée (2026-08-10)**, suite au point ouvert
  dans `docs/TODO.md` (« icônes à 90°, débordent de la cellule »). La cible réelle du problème
  n'était pas les icônes de point d'intérêt (`buildHexPoints()`, non concernées, aucune rotation)
  mais les images de fond de cellule (`hexBiomeImageSVG()`, biome + overlay `foundation_*.png`),
  tournées de 90° pour passer de leur orientation naturelle « flat-top » (plus large que haute) à la
  cellule « pointy-top » de la grille — ce qui faisait paraître leur contenu (arbres, chemins…)
  complètement sur le côté, plutôt qu'un débordement au sens propre. **Fix** : un hexagone régulier a
  une symétrie de rotation à 60° (6 côtés) ; flat-top et pointy-top ne diffèrent que d'un quart de
  cette symétrie, soit 30° — n'importe quel angle ≡ 30° (mod 60°) réaligne donc exactement le
  *contour* de l'image sur la cellule, sans débordement ni décalage. 30° et 90° (=30+60) sont tous
  les deux valides à ce titre, mais 90° tourne le *contenu* de l'image bien plus loin de son
  orientation d'origine que 30°. Changé `hexBiomeImageSVG()` pour tourner de 30° au lieu de 90° —
  demande explicite de Tristan (« un cran vers la gauche, sens antihoraire »), qui correspond
  exactement à un cran de la symétrie naturelle de l'hexagone (60°, donc 90-60=30), pas au « cran de
  30° » évoqué dans `docs/TODO.md` pour une réorientation complète de la grille (`hexCorners`/
  `hexCenter`) — chantier plus lourd, explicitement pas engagé ici. Aucune solution parfaitement
  horizontale n'est possible (contrainte géométrique reconnue par Tristan), mais le rendu est
  nettement moins vertical qu'avant. Nouvelle géométrie de `hexBiomeImageSVG()` : l'image est
  dessinée à sa taille naturelle flat-top (largeur `2×size`, hauteur `size×√3`), centrée sur le
  centre de la cellule, puis tournée de 30° autour de ce même centre — remplace l'ancien calcul qui
  dessinait un rectangle aux dimensions pré-échangées (largeur/hauteur inversées) puis le tournait de
  90°, un raccourci qui ne fonctionne géométriquement que pour une rotation de 90° exactement.
  **Vérifié** : calcul analytique (les 6 sommets de l'hexagone flat-top, tournés de 30°, tombent
  exactement sur les 6 sommets `hexCorners()` de la cellule cible, aux arrondis près) puis
  confirmation visuelle dans un navigateur avec une vraie image (`1-foundation_vulcano.png` sur fond
  `greenlands`) — comparaison directe 30° vs 90° sur la même cellule : le contour hexagonal reste
  identique dans les deux cas (aucun débordement introduit), seul le contenu tourne visiblement (~60°
  d'écart entre les deux rendus, repères — bouche du volcan, sommet, marque du bas — clairement
  déplacés). **Non vérifié en jeu réel sur de vraies cartes de campagne** — à confirmer par toi.
- **Point Crawl — statut d'avancement ajouté (2026-08-10)**, demande de Tristan pour s'y retrouver
  entre plusieurs point crawls préparés en parallèle. Nouveau champ `c.status` (jsonb, aucune
  migration — absent/`""` = non catégorisé), 4 valeurs `CRAWL_STATUSES` (`creation`→« En création »,
  `avisiter`→« À visiter », `encours`→« En cours », `visite`→« Déjà visité » — le 2ᵉ ajouté après
  coup, à la demande de Tristan, pour distinguer un point crawl prêt mais pas encore joué d'un point
  crawl encore en rédaction), chacune avec sa propre classe `.tag.status-*` (nouvelles couleurs CSS,
  même style que les tags existants). Badge affiché sur chaque carte de `listCrawls()` et dans
  l'en-tête de `detailCrawl()` ; filtre déroulant dans la liste (même schéma que
  `creatureCatFilter`/`tableCatFilter` : variable globale `crawlStatusFilter`, câblé dans le handler
  `change` partagé). Réglable via un `<select>` dans `formCrawl()`/`saveCrawl()`. `duplicateEntity()`
  remet systématiquement le statut à vide sur une copie (même logique que `dungeonmap.active=false`
  sur copie).
  **Filtre "par défaut" intelligent, pas "tous" (même jour, second retour de Tristan)** : au premier
  affichage de l'onglet (`crawlStatusFilter===""`), la liste ne montre PAS tous les point crawls —
  elle montre ceux "en cours" (`encours`) en priorité, et à défaut (aucun "en cours") ceux "à
  visiter" (`avisiter`), jamais "en création" ni "déjà visité" par défaut (`crawlFocusItems()`). Si
  aucun des deux n'existe, état vide dédié avec un bouton "Afficher tous les point crawls"
  (`data-crawl-status-show-all`) plutôt que de laisser un vide silencieux. Comme `""` a changé de
  sens (focus intelligent plutôt que "tous"), "Tous" est devenu une option de filtre explicite et
  séparée (`__all__`) dans le menu déroulant — sans quoi il aurait été impossible de distinguer
  "l'utilisateur vient d'ouvrir l'onglet" de "l'utilisateur a choisi Tous", les deux ayant utilisé la
  même valeur `""`. Vérifié en direct dans le navigateur : un seul "en cours" présent → lui seul
  affiché ; on le repasse à un autre statut → repli automatique sur "à visiter" ; plus aucun des deux
  → bouton de secours affiché, clic dessus → bascule bien sur `__all__` et montre les 4 point crawls
  de test.
- **Créatures — export en cartes à jouer 63×88mm (2026-08-10)**, demande de Tristan (format standard
  type Magic). Nouveau bouton `🖨 Exporter en cartes` dans la liste Créatures, ouvre une modale de
  sélection (cases à cocher, décochées par défaut — potentiellement beaucoup de créatures, pas
  d'intérêt à tout exporter d'un coup contrairement aux PJ) calquée sur `openPrintPCsModal()`, puis
  réutilise le mécanisme d'impression existant du point crawl/PJ (`#print-area` + `window.print()`,
  pas de vraie génération PDF côté serveur — le navigateur/l'utilisateur imprime ou "imprime en PDF").
  **Mise en page** : grille CSS 3×3 (9 cartes/page A4, `@page cards{margin:8mm}` — la marge par
  défaut de 14mm était trop large pour loger la grille 189×264mm), **sans `gap`** entre les cartes
  (délibéré, demande explicite de Tristan : "collées entre elles, sinon il faut faire plus de traits
  de découpe") — la bordure de chaque carte (`.pp-card{border:.4pt solid}`) forme ainsi une ligne de
  découpe continue sur toute la largeur/hauteur de la page, coupable au massicot en quelques passes
  droites plutôt que carte par carte. Cases vides du dernier feuillet remplies par des cellules
  fantômes à bordure pointillée pour garder une grille 3×3 complète et des lignes de coupe régulières
  même si le nombre de créatures sélectionnées n'est pas un multiple de 9.
  **Recto** (`creatureCardFrontHTML`) : illustration en plein cadre (`object-fit:cover`, seulement
  `c.images[0]`, ignorées si plusieurs) si disponible, sinon un fond dégradé avec l'initiale du nom en
  lettrine — nom + catégorie en pied de carte. **Verso** (`creatureCardBackHTML`) : nom, ligne
  CA/PV/Niveau/Alignement, ligne de caractéristiques (FOR/DEX/CON/INT/SAG/CHA via `fmtMod()`, même
  formatage que la fiche détail), attaques, capacités (`renderTextPrint()`, même traitement des liens
  `[[...]]` que les autres exports). Polices réduites (6,3–9,5pt) pour tenir sur une carte aussi
  petite — **limite connue et acceptée** : une créature avec un texte de capacités très long peut
  être tronquée visuellement (`.pp-card{overflow:hidden}`, coupe silencieusement plutôt que de
  déborder sur la carte voisine — comportement délibéré, un débordement visible aurait cassé la
  grille de découpe) ; pas de solution générale possible sur un format aussi contraint, à l'usage de
  Tristan de garder les capacités concises s'il veut qu'une carte donnée tienne entièrement.
  **Recto/verso volontairement NON dupliqués sur la même feuille en duplex** : générés comme deux
  groupes de pages séparés (tout le recto d'abord, puis tout le verso), dans le même ordre/même
  position de grille plutôt que retournés en miroir pour un duplex automatique — la convention de
  retournement (bord long/bord court) dépend du pilote d'imprimante de chacun et n'a pas pu être
  vérifiée dans cette session ; imprimer les deux feuillets séparément et associer chaque recto à son
  verso par position (repère « Recto/Verso — page N/T » sur chaque page) est le choix le plus robuste
  ici, quitte à ce que Tristan colle/laminae lui-même dos à dos. Non tenté : miroir automatique du
  verso pour un vrai duplex — faute de pouvoir tester contre un vrai pilote d'imprimante, un mauvais
  sens de miroir aurait été pire qu'aucune tentative (cartes visiblement désalignées après découpe).
  **Vérifié dans le navigateur** (aperçu écran temporaire des styles d'impression, `window.print`
  neutralisé pour ne pas bloquer sur la vraie boîte de dialogue native) : 11 créatures de test → 2
  pages de recto + 2 pages de verso, la 2ᵉ page de chaque groupe avec 2 cartes réelles + 7 cellules
  fantômes ; rendu correct de l'illustration de test, du fond de repli sans illustration, des lignes
  de statistiques et de la section capacités. **Non vérifié** : rendu physique réel via une vraie
  impression/un vrai massicot (aucune imprimante disponible dans cette session) — à confirmer par
  Tristan, notamment que les 8mm de marge de page suffisent bien sur son imprimante réelle.
- **PNJ — même export en cartes 63×88mm (même jour, demande immédiate de Tristan : "exactement
  pareil")**. Réutilise entièrement le mécanisme des Créatures ci-dessus — la fonction de pagination
  en grille 3×3 (`creatureCardGridPages`, sans logique propre aux créatures) a été renommée
  `cardGridPages()` et partagée entre les deux, et les classes CSS `.pp-card*` (déjà génériques,
  aucun nom lié aux créatures) sont réutilisées telles quelles sans nouvelle règle. Nouveau bouton
  `🖨 Exporter en cartes` dans la liste PNJ (à côté de « Générer un PNJ aléatoire »).
  **Recto** (`npcCardFrontHTML`) : image en plein cadre — priorité au portrait choisi dans la
  bibliothèque (`n.portrait`, chemin `portraits/...`, avec le même filtre `.portrait-gray` que
  partout ailleurs dans l'appli) sinon la 1ère image uploadée (`n.images[0]`), même ordre de priorité
  que `detailNPC()`/la carte de liste — sinon repli sur l'initiale du nom comme pour les créatures.
  **Verso** (`npcCardBackHTML`) : contrairement aux créatures, un PNJ n'a pas systématiquement de
  bloc de combat (beaucoup sont purement sociaux) — la ligne CA/PV/Arme et la ligne de
  caractéristiques ne s'affichent que si `hasCombat` (même test que `detailNPC()`). Le reste de la
  carte est dédié à Objectif (🎯) et Comportement (🎭) — les deux accroches de jeu de rôle les plus
  utiles à avoir sous les yeux en cours de partie ; Apparence physique/Possessions/Moyens/Sortilèges
  volontairement exclus faute de place sur un format aussi petit (consultables dans la fiche complète
  au besoin). Vérifié en direct : un PNJ avec bloc de combat affiche bien les deux lignes de stats
  avant Objectif/Comportement, un PNJ purement social (sans CA/PV/arme/caractéristiques) les omet
  proprement sans laisser de lignes vides visibles. Mêmes limites/réserves que les Créatures (recto/
  verso non dupliqués en miroir pour un duplex automatique, non vérifié en impression physique réelle).
- **Roue — refonte du coffre + préréglages personnalisés multiples (2026-08-11)**, deux retours de
  Tristan après usage réel.
  **Coffre** : deuxième passe sur le mode « chest » (`style.css`), la première (même journal,
  section Roue plus haut) restait trop proche géométriquement du cadeau. Cette fois : lattes de
  bois visibles (`repeating-linear-gradient`) sur le corps ET le couvercle, couvercle en vrai
  dôme (`border-radius` elliptique prononcé plutôt que des coins arrondis), deux cerclages dorés
  qui s'alignent à la jointure une fois fermé, fermoir central. Animation d'ouverture dédiée
  (`wheel-chest-lid-open`, propre au coffre — la règle partagée `.reveal-box.open .reveal-lid` a
  été scindée en `.gift.open`/`.chest.open`) : le couvercle pivote depuis sa base
  (`transform-origin:50% 100%`) vers l'arrière, pas le « pop » en diagonale du ruban de cadeau qui
  ne convenait pas à un coffre. Réglage de l'angle (`-70deg`) et du décalage (`translateY(-18px)`)
  ajustés après plusieurs essais visuels dans le navigateur — un angle trop grand (`-112deg`,
  premier essai) faisait ressortir un éclat du couvercle sous la caisse, geste peu naturel.
  **Préréglages personnalisés** : le bouton « Enregistrer la liste actuelle comme préréglage »
  ouvrait un `promptModal()` séparé qui remplaçait temporairement tout le contenu de la modale
  d'édition de la roue (même conteneur `#modal` réutilisé) — Tristan a compris ce va-et-vient comme
  "ça ne fait pas ce que j'attends" plutôt que comme un simple ajout à la liste. Remplacé par un
  champ de nom + bouton **inline**, directement dans la section « Mes préréglages » — enregistrer
  ajoute désormais visiblement un nouveau chip à la liste juste au-dessus, sans faire disparaître le
  reste de l'éditeur. Raccourci Entrée ajouté sur le champ (même schéma que l'ancien
  `promptModal()`). **Le mécanisme de sauvegarde lui-même n'avait pas de bug** : `w.presets` était
  déjà un tableau qui accumule (jamais un remplacement) — vérifié en enregistrant coup sur coup
  plusieurs préréglages différents avant même de toucher au code, les deux apparaissaient
  correctement. Le problème était uniquement la clarté du geste, pas la donnée.
  **Aléa de test rencontré** : le navigateur de cette session met en cache `style.css` et les
  fichiers `js/*.js` chargés en `<link>`/`<script src>` de façon plus agressive que prévu — un
  `navigate` avec `force:true` sur `index.html`, même avec une chaîne de requête différente, ne
  rechargeait pas ces sous-ressources. Contournement utilisé pour vérifier réellement chaque
  changement : retirer puis recréer dynamiquement la balise `<link>`/`<script>` concernée avec un
  paramètre `?bust=` unique (fonctionne pour le CSS ; pour un fichier JS avec des `let`/`const` de
  premier niveau, réexécuter tout le fichier une seconde fois provoque un `SyntaxError` de
  redéclaration — contourné en extrayant et ré-évaluant uniquement la fonction modifiée). Aucun
  rapport avec un vrai comportement utilisateur : un vrai rechargement de page (F5) n'exécute
  chaque script qu'une fois, ce problème n'existe que dans ce sandbox de test.
  **Correction (2026-08-11, plus tard le même jour)** : un premier retour de Tristan avait semblé
  confirmer ce design ; un second retour, plus tardif, l'a en fait rejeté (« celle-là ne me plaît
  pas ») — voir l'entrée de revert ci-dessous. La ligne précédente laissée pour la trace, mais elle
  ne reflète plus l'état actuel du coffre.
- **Roue — revert du redesign visuel du coffre, préréglages conservés (2026-08-11)** : Tristan n'a
  pas aimé la deuxième passe du coffre décrite juste au-dessus (lattes de bois, dôme prononcé,
  double cerclage, animation dédiée `wheel-chest-lid-open`) et a demandé de revenir à l'apparence
  précédente. Diff de `101ee04` examiné en détail : le redesign visuel (`style.css`, règles
  `.reveal-box.chest*`) et la clarification des préréglages personnalisés (`index.html` +
  `js/wheel.js`, champ de nom inline au lieu d'un `promptModal()`) touchaient des fichiers/blocs
  disjoints — séparables proprement, pas de revert du commit entier. Seul `style.css` a été
  restauré à l'état d'avant `101ee04` (celui introduit par `a244ef9`, la toute première refonte
  « vraie malle, pas un cadeau recoloré ») : coffre 148×92, dégradés unis (pas de lattes), simple
  cerclage, couvercle qui rouvre avec l'animation partagée `wheel-lid-pop` (le « pop » diagonal du
  cadeau) plutôt qu'une animation dédiée. La clarification des préréglages personnalisés n'a pas
  été critiquée et reste en place telle quelle. Vérifié : `node --check` sur `js/wheel.js`,
  équilibre des accolades CSS, aucune référence résiduelle à `chest.open`/`wheel-chest-lid-open`
  dans le code, et rendu comparé via une page de test isolée chargeant le vrai `style.css`
  (`getComputedStyle` : dimensions 148×92 et `animation-name:wheel-lid-pop` confirmés sur le
  couvercle une fois `.open` appliqué) — page de test jetable, non commitée.
- **Marqueur "créé par le MJ" (2026-08-11)**, demandé par Tristan en ajoutant du contenu à la main
  (objets magiques) : besoin de distinguer, sur la durée, ce qu'il a écrit lui-même de ce qui vient
  d'un import en masse, d'une génération aléatoire (`generateRandomNPC`/`generateRandomPC`) ou d'un
  contenu produit par une IA en test. Nouveau champ jsonb `o.gmCreated` (booléen, absent par défaut
  — aucune migration), une seule bascule manuelle ajoutée à `detailActions()` (donc universelle à
  TOUS les types d'entités qui passent par cette fonction partagée — créatures, PNJ, PJ, trésors,
  sorts, événements, tables, sessions, point crawls, cartes — sans avoir eu à toucher aux 8+
  formulaires individuels) : bouton `🎲 Import / génération` / `🖋 Créé par le MJ` juste à côté du
  bouton "mode table de jeu", jamais rendu quand `effectiveRole()!=="gm"` (donc invisible à un vrai
  joueur ET en mode aperçu joueur — vérifié dans le navigateur sur Trésor, Créatures et PJ).
  **Volontairement jamais positionné automatiquement** : ni à la création manuelle via formulaire
  (une saisie manuelle peut très bien recopier du contenu IA), ni par les générateurs aléatoires —
  seul un geste explicite du MJ le fait basculer, pour ne jamais lui faire dire quelque chose de
  faux sur du contenu déjà existant. Handler générique `data-toggle-gm-created="type:id"` dans le
  dispatcher de clics partagé, lit/écrit via `getEntity()` + `saveDB()` comme le reste de l'appli.
  **Pas fait, explicitement différé** (Tristan l'a lui-même présenté comme une idée pour plus tard,
  pas une demande immédiate) : un filtre/bouton global "n'afficher que mes créations" qui utiliserait
  ce marqueur pour filtrer les listes — voir `docs/TODO.md`. Le marqueur seul suffit pour l'instant à
  ce que Tristan puisse commencer à qualifier son contenu existant et nouveau au fil de l'eau ; le
  filtre pourra être ajouté a posteriori sans migration puisque la donnée sera déjà là.
- **Filtre "mes créations" (2026-08-11, même soirée que le marqueur `gmCreated`)** : Tristan a
  précisé juste après avoir demandé le marqueur qu'il voulait bien l'appliquer tout de suite, pas
  seulement le préparer pour plus tard. Bouton `🖋 Mes créations` dans l'en-tête (à côté du bouton
  d'aperçu joueur), GM-only, masqué en mode aperçu joueur (outil de curation MJ, contrairement au
  bouton d'aperçu lui-même qui doit rester accessible pendant l'aperçu). Variable globale
  `gmCreatedOnly` + fonction partagée `filterGmCreated(list)` appliquée explicitement dans les 11
  `list*()` qui portent le marqueur (mêmes onglets que `detailActions()` : événements, tables,
  créatures, sessions, PNJ, PJ, trésors, sorts, point crawls, cartes hexcrawl, cartes de donjon —
  initiative et roue exclus, ce ne sont pas des "créations" individuelles au même sens).
  **Décision de conception importante** : filtrage appliqué au niveau de l'affichage dans chaque
  fonction de liste (comme tous les filtres par onglet déjà existants — `creatureCatFilter`,
  `crawlStatusFilter`, etc.), PAS via un Proxy global sur `db` qui aurait intercepté tous les accès
  aux collections d'un coup. `db` sert aussi à l'écriture (`saveDB()` doit toujours voir la
  collection complète) — un Proxy qui filtre les lectures aurait été plus élégant/central mais
  risquait de faire fuiter le filtrage jusqu'au chemin de sauvegarde et supprimer silencieusement du
  contenu non marqué au prochain enregistrement. Le choix mécanique (répéter `filterGmCreated()`
  dans chaque liste) est plus verbeux mais élimine ce risque par construction — cohérent avec la
  façon dont tous les autres filtres du fichier fonctionnent déjà.
  Message d'état vide dédié (« Aucune création marquée « MJ » dans cet onglet. ») distinct du
  message "aucun contenu du tout", pour ne jamais laisser croire à tort que l'onglet est
  vide alors que c'est juste le filtre qui ne trouve rien.
  Vérifié dans le navigateur : activer le filtre sur Créatures/Trésors ne garde que les entrées
  marquées, le désactiver restaure la liste complète ; combiné avec le filtre de statut du Point
  Crawl (les deux se cumulent correctement) ; message d'état vide dédié affiché sur Sorts avec le
  filtre actif et aucune création marquée ; bouton absent pour un vrai compte joueur et pendant le
  mode aperçu joueur. Aucune erreur console (hors artefacts de test habituels de cette session —
  écritures RLS refusées faute de vraie authentification, IDs de test non-UUID).
- **Favoris (2026-08-11, même soirée que `gmCreated`/`gmCreatedOnly`)** : Tristan a demandé de
  pouvoir marquer PJ / PNJ / Créatures / Trésor / Sorts d'une petite étoile, avec un filtre "favoris
  uniquement" **par onglet** (contrairement au filtre `gmCreatedOnly`, unique et global dans
  l'en-tête — ici Tristan a explicitement décrit "quand je viens dans un onglet, je peux décider de
  n'afficher que mes favoris", un sous-ensemble indépendant par liste). Nouveau champ jsonb
  `o.favorite` (booléen, pas de migration), cinq variables globales indépendantes (`pcFavOnly`,
  `npcFavOnly`, `creatureFavOnly`, `treasureFavOnly`, `spellFavOnly` — même principe que
  `creatureCatFilter`/`tableCatFilter`), fonction partagée `filterFavorites(list, only)` appliquée
  après `filterGmCreated()` dans les 5 `list*()` concernées.
  Étoile directement sur la carte (`favStarHTML()`, coin haut-droit, `position:absolute` sur `.card`
  qui a déjà `position:relative`) — pas seulement en fiche détail, pour un bascule rapide en
  parcourant la liste, conformément à "les cocher [avec] une petite étoile". Bouton de filtre par
  onglet (`favFilterBtnHTML()`) placé dans la barre d'outils de chaque liste, à côté du tri/de la
  catégorie pour Créatures, à côté de "Tout ouvrir/fermer" pour Trésor/Sorts, à côté du bouton
  générateur pour PJ/PNJ.
  **Réservé au MJ** comme `gmCreated` : `favStarHTML()` retourne une chaîne vide si
  `effectiveRole()!=="gm"`, et les boutons de filtre ne sont insérés que côté MJ — pas de notion
  d'utilisateur/préférence individuelle dans le modèle de données actuel, un favori est un marqueur
  partagé sur la fiche, donc masqué en aperçu joueur et pour un vrai compte joueur (y compris sur PJ
  et Sorts, qui sont pourtant des onglets visibles aux joueurs) pour éviter toute confusion sur ce
  qu'un joueur voit.
  **Point d'attention ordre du dispatcher de clics** : l'étoile est imbriquée dans une carte qui
  porte elle-même `data-open` (ouvrir la fiche) — `data-toggle-fav` est donc vérifié AVANT
  `data-open` dans `app.addEventListener("click", ...)`, exactement comme `data-toggle-gm-created`
  avait déjà établi ce principe (ordre des tests plutôt que `stopPropagation()`).
  Vérifié dans le navigateur (état de test injecté en console, pas de vraie authentification
  Supabase disponible en sandbox) sur les 5 onglets : étoile pleine/vide selon `o.favorite`, clic sur
  l'étoile bascule l'état SANS ouvrir la fiche (confirme l'ordre du dispatcher), le filtre par onglet
  cache/affiche correctement et le compteur d'en-tête suit, étoile absente en mode aperçu joueur.
  `outils/audit-check.sh` : syntaxe JS OK sur les 8 blocs `<script>`.
- **Retrait du champ icône sur les Trésors (2026-08-11)** : une autre session avait ajouté un champ
  `o.icon` sur les objets du Trésor (commit `965a5d3`), réutilisant le picker POI de l'Hexcrawl
  (`POI_ICON_LIST`/`icons.svg`) pour afficher un petit badge SVG à côté du nom sur la carte et en
  fiche détail. Tristan pensait que la bibliothèque d'icônes était beaucoup plus large et variée
  (« des centaines et des centaines d'images », de quoi illustrer précisément chaque objet en
  portrait) — en réalité c'est le même petit set de pictogrammes de terrain/PDI utilisé pour
  l'Hexcrawl (déjà signalé plus tôt cette session comme mal adapté à de l'équipement, voir plus haut
  dans ce journal). Une fois vu en usage réel (petite icône collée à côté du nom, pas une
  illustration), jugé sans intérêt : retiré intégralement.
  **Retiré** : `treasureIconHTML()`, `treasureIconPickerHTML()`, `formTreasureIcon`, le champ
  `Icône` du formulaire, `o.icon` dans `saveTreasure()`, l'affichage du badge dans `treasureCard()`
  et `detailTreasure()`, le handler `data-treasure-icon` du dispatcher de clics, et les règles CSS
  `.treasure-icon`/`.treasure-icon svg`.
  **Conservé** : les classes CSS `.icon-picker`/`.icon-pick` sont partagées avec le picker de POI de
  l'Hexcrawl (`js/hexcrawl.js`, `POI_ICON_LIST`) — vérifié qu'aucune règle propre au Trésor n'a été
  supprimée par erreur de ce côté-là (`POI_ICON_LIST.length` toujours 90 après coup).
  Purge des données : 11 trésors homebrew avaient déjà une icône assignée en base (Potion de
  Reniflage, Dictionnaire des Vérités, Écu Chelou, Surin Spectral, Pelardon Ostensible, Œil de Verre
  ambré, Un roi des rats, L'Anneau d'Immolation Partagée, Tibia Aller-Retour, La Masse de
  Compassion, Parchemin de Rentabilité) — champ `icon` supprimé de ces 11 objets directement en
  Supabase (`db`/`saveDB()` sur le site live), vérifié par un `fetchRemoteDB()` derrière (0 trésor
  avec `icon` restant).
  Vérifié dans le navigateur (bac à sable) : formulaire Trésor (Description → Bonus directement,
  plus de champ Icône), carte de liste et fiche détail sans badge résiduel. `outils/audit-check.sh` :
  syntaxe JS OK.
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

### Contenu ajouté — 2026-08-10 : Point Crawl « Le Château des Rats »

Demande ad hoc de Tristan (PDF de scénario Shadowdark fourni, déjà lu/extrait
côté session — pas dans ce dépôt), pas liée à `docs/TODO.md`. Contenu de
campagne créé directement en base Supabase via Claude in Chrome
(`db`/`saveDB()` en console sur le site live), conformément au workflow déjà
en mémoire — **aucune donnée de campagne n'est dans ce dépôt**, seul le
correctif de code ci-dessous l'est.

**Contenu créé** : point crawl 23 nœuds / 27 connexions (21 salles + 2
entrées), 5 créatures (Armure pleine de rats, Rat guerrier, Rats mutants,
Horde de rat, Chien (Molosse)), 9 PNJ (Fael N'adal le Rat-Sorcier, Mage Royal
Nath'ri, Merrick l'Apprenti, Bauduin le Majordome, Ratier Églantin, Kam le
Rouge, Dusol, Lakass et Keth, Jdedan), 2 tables aléatoires (Rumeurs, Noms de
rats D20). Réutilisé un point crawl existant vide (« Le chateau de Fael
N'Adal », créé au préalable par Tristan/Dual comme jalon, 0 nœud) plutôt que
d'en créer un doublon — renommé en « Le Château des Rats » et rempli.

**Bug de code trouvé et corrigé en cours de vérification** : `renderText()`
(ligne ~1054) appelait `esc(text)` sur le texte entier *avant* d'extraire les
liens `[[Nom]]`, donc tout nom contenant une apostrophe (ex. « Fael N'adal »,
« Nath'ri ») produisait un lien cassé (`class="wl bad"`, non résolu) affichant
en plus l'entité `&#39;` en clair (double échappement : l'apostrophe déjà
transformée en `&#39;` par le premier passage se faisait rééchapper une
seconde fois par le `esc(name)` du label du lien). Repéré en testant
l'affichage du nouveau point crawl : les liens vers les deux PNJ principaux
du scénario étaient cassés. **Fix** : `renderText()` traite maintenant le
texte brut en une seule passe (regex `[[...]]` sur la chaîne non échappée,
segments de texte libre échappés au fur et à mesure, nom du lien échappé une
seule fois) — corrige la classe entière de bug pour tout caractère spécial
HTML dans un nom lié (apostrophe, esperluette, chevrons), pas seulement le
cas observé. Vérifié en direct dans le navigateur (Claude in Chrome, patch
temporaire de la fonction en mémoire avant de l'appliquer au fichier) : les
liens vers « Fael N'adal, le Rat-Sorcier » et « Mage Royal Nath'ri »
passent de `wl bad` à `wl npc` correctement résolu, apostrophe affichée
normalement. `outils/audit-check.sh` relancé après coup (syntaxe JS OK).

### Fonctionnalité ajoutée — 2026-08-11 : icône pour les objets du Trésor

Demande de Tristan : illustrer 9 objets magiques homebrew avec une icône du
set game-icons.net déjà intégré au site (les 90 icônes `icons.svg` utilisées
pour les marqueurs POI de l'Hexcrawl, `POI_ICON_LIST` dans `js/hexcrawl.js`).
Le Trésor n'avait pas de champ icône — mécanisme ajouté par analogie avec le
picker POI existant (`poiIconPickerHTML`) plutôt que d'en inventer un
nouveau :

- Nouveau champ `icon` sur l'entité trésor (id d'`icons.svg`, ex.
  `icon-ghost`), facultatif.
- `treasureIconPickerHTML()` (index.html, juste avant `formTreasure()`) :
  même grille `.icon-picker`/`.icon-pick` que le picker POI, réutilise
  `POI_ICON_LIST` et `icons.svg`, mais attribut `data-treasure-icon` (pas
  `data-icon`) pour ne pas entrer en collision avec le handler dédié du
  picker POI (câblé à la main dans `openHexPointModal`, hors délégation
  globale) — géré ici via la délégation de clic globale existante
  (`data-save`, `data-remove-img`, etc.), avec un état temporaire
  `formTreasureIcon` sur le même modèle que `formPortrait`/`formImages`.
- Icône affichée en petit badge (`treasureIconHTML()`, classe `.treasure-icon`
  ajoutée à `style.css`) à côté du tag de catégorie, sur la fiche détail et
  sur la carte liste.
- Vérifié en local (serveur statique `outils/launch.json`, fonctions
  appelées directement en console faute de session Supabase locale) :
  rendu du picker, sélection, sauvegarde, affichage carte + détail — voir
  captures de la session. `outils/audit-check.sh` relancé après coup
  (syntaxe JS OK sur les 8 blocs `<script>`, accolades CSS équilibrées).

Le champ « créé par le MJ » (`gmCreated`, ajouté le 2026-08-11 — voir plus
haut) existait déjà et n'a pas eu besoin de changement de code : coché
manuellement sur chacun des 9 objets lors de leur création en base (contenu
de campagne, donc en Supabase — voir entrée « Contenu ajouté » suivante).

## Bug — Cartes de donjon : la fiche détail se refermait toute seule (2026-08-11)

Signalé par Tristan (bloquant) : cliquer sur une carte dans « Cartes de
donjon » ouvrait bien la fiche détail, mais elle se refermait toute seule
peu après, retombant sur la liste — impossible d'éditer une carte.

**Cause racine** : collision entre deux mécanismes qui existaient déjà
séparément, exactement le risque identifié en introduisant le mode « Aperçu
joueur » global le même jour (voir l'entrée plus haut, « Effet de bord
découvert et corrigé au passage ») — mais un second effet de bord, distinct
du premier, n'avait pas été repéré à l'époque :

- Le poll des Cartes de donjon (`startDungeonMapsPolling()`/
  `stopDungeonMapsPolling()`, 2,5s, dans `js/dungeonmaps.js`) n'est démarré
  QUE côté rendu joueur (`playerDungeonMapView()`), contrairement à celui de
  l'Initiative qui tourne pour les deux rôles (donc insensible à un
  changement de rôle en cours de route).
- `render()` n'arrêtait ce timer que sur un changement d'**onglet**
  (`view.tab!=="dungeonmaps"`) — jamais sur un changement de **rôle effectif**
  sur le même onglet.
- Or c'est exactement ce que permet le nouveau mode « Aperçu joueur »
  global : un MJ qui bascule l'aperçu ON puis OFF **sans changer d'onglet**
  pendant qu'il est sur « Cartes de donjon » démarre ce timer (ON, rendu via
  `playerDungeonMapView()`) sans jamais le stopper (OFF, retour à
  `effectiveRole()==="gm"`, mais toujours sur l'onglet "dungeonmaps" donc la
  garde de `render()` ne se déclenchait pas).
- Le timer restait alors actif en tâche de fond indéfiniment. Chaque tick
  suivant écrasait `db.dungeonmaps` avec les données rafraîchies depuis
  Supabase et appelait **`renderList()` directement** (pas `render()`) —
  qui ignore totalement `view.mode` et réaffiche donc la liste même si le
  MJ était en train de consulter/éditer le détail d'une carte. D'où la
  fermeture intempestive, à un moment déconnecté du clic lui-même (calé sur
  la phase du timer, pas sur l'action de l'utilisateur — d'où l'impression
  d'un délai fixe « d'une demi-seconde »).
- Repro confirmée en console (`myRole="gm"`, `togglePlayerPreview()` deux
  fois de suite sur l'onglet "dungeonmaps" sans changer d'onglet, puis
  ouverture d'une fiche) : le timer restait vivant (`dungeonMapsPollTimer`
  non nul) après le second bascule, et le tick suivant écrasait bien la vue
  détail par la liste — y compris avec de vraies requêtes réseau contre le
  Supabase de prod, observées pendant le diagnostic.

**Fix** (`index.html` et `js/dungeonmaps.js`) : la garde d'arrêt du timer
teste maintenant aussi le rôle effectif, pas seulement l'onglet —
`view.tab!=="dungeonmaps" || effectiveRole()==="gm"` — à deux endroits en
défense en profondeur : dans `render()` (arrêt immédiat dès que
`togglePlayerPreview()` repasse en MJ) et dans le tick du timer lui-même
(filet de sécurité si `render()` n'a pas encore tourné entre-temps).

**Vérifié** en local (serveur statique, fonctions appelées en console faute
de session Supabase locale) : (1) bascule aperçu ON/OFF sur l'onglet
"dungeonmaps" sans changer d'onglet → timer bien arrêté (`null`) après le
retour en MJ, ouverture d'une fiche détail reste stable au moins 3s après
(un tick complet) ; (2) flux joueur normal non cassé : le timer démarre
toujours à l'entrée sur l'onglet, s'arrête en le quittant, redémarre en y
revenant ; (3) l'ancien mode aperçu spécifique aux cartes de donjon
(`dmapShowPlayerPreview`, bouton « 👁 Aperçu joueur » dans la vue détail
MJ) reste inchangé et fonctionnel — il ne touche jamais au poll timer, donc
aucun recouvrement avec ce correctif.

### Onglet ajouté — 2026-08-11 : « To-do MJ »

Demande de Tristan : un endroit dans la partie MJ pour noter une liste de
choses à faire (pense-bête de préparation, pas le `docs/TODO.md` du dépôt qui
est le backlog de dev). Nouvel onglet **strictement réservé au MJ**, présent
dans les 6 emplacements du ledger de collections (`TABS`, `DB_COLS` — dans
`js/importexport.js` —, `TAB_OF`, `TYPE_OF_TAB`, `collectionOf()`,
`emptyDB()`) sous la clé `gmnotes`/type `gmnote`, **volontairement absent de
`PLAYER_VISIBLE_TABS`** — le seul filtre qui compte, `applyRoleUI()` (masque
le bouton d'onglet) et le garde-fou dans `render()` (affiche « Cet onglet
n'est pas visible aux joueurs » si on force la navigation dessus) en héritent
automatiquement.

**Modèle de données volontairement minimal** (demande explicite de Tristan,
pas de catégories/priorités/dates) : `db.gmnotes[]`, chaque entrée
`{id, text, done}`. Pas de page liste/détail/formulaire dédiée — tout se
passe en place dans un seul écran, sur le modèle d'Initiative/Roue (aucune de
ces deux entités n'a de mode `edit`/`new` séparé non plus) : nouveau fichier
`js/gmnotes.js` (`listGmNotes()`, `addGmNote()`/`toggleGmNote()`/
`editGmNote()`/`removeGmNote()`), câblé dans le dispatcher `renderList()`
(`index.html`) et dans les délégations de clic/change existantes
(`data-gmnote-add` ouvre `promptModal()` pour la saisie du texte,
`data-gmnote-toggle` sur la case à cocher passe par le handler `change`
comme `data-init-manual-input`, `data-gmnote-edit`/`data-gmnote-del`
réutilisent `promptModal()`/`deleteEntity("gmnote", id)`). Suppression sans
confirmation, comme `removeInitiativeEntry()` — cohérent avec l'esprit
« pense-bête à usage rapide », pas un gestionnaire de projet. Notes non
faites affichées en premier (insertion en tête de liste, note la plus
récente en haut), notes faites regroupées sous un label « Faites » en bas de
la même liste (texte barré) plutôt que masquées, pour rester consultables.
CSS ajouté à `style.css` (`.gmnote-row`/`.gmnote-check`/`.gmnote-text`/
`.gmnote-controls`) sur le même gabarit que `.init-card`.

**Table Supabase à créer** : script fourni dans
`outils/supabase_gmnotes_setup.sql` — **différent de toutes les autres
tables de l'appli** : policy MJ CRUD standard, mais **aucune policy de
lecture joueur** (contrairement à `hexmaps`/`spells`/`initiative`/`wheel`/
`dungeonmaps` qui ont toutes une `_player_read`), puisque cet onglet ne doit
jamais être lisible par un compte joueur, même par erreur de RLS côté
client — à exécuter par Tristan dans l'éditeur SQL Supabase, à confirmer et
à reporter dans le ledger Supabase une fois fait.

**Vérifié dans le navigateur** (fichier ouvert directement, `myRole="gm"`
et `saveDB()` stubbé en mémoire pour ce test à cause de l'absence de session
Supabase réelle dans cette session — mêmes fonctions que la production,
appelées via les vrais gestionnaires d'événements, pas des appels directs
maquillés) : l'onglet apparaît dans la nav et s'ouvre pour le MJ, état vide
correct, création de 3 notes (la plus récente bien en tête), case à cocher
réelle cliquée → note déplacée sous « Faites » + compteur mis à jour,
modale d'édition pré-remplie avec le texte actuel → « Valider » persiste le
changement, suppression réelle enlève l'entrée. **Mode aperçu joueur**
(`togglePlayerPreview()`) activé : bouton d'onglet masqué dans la nav,
contenu remplacé par l'état « non visible aux joueurs » sans changer
d'onglet ; désactivé : onglet et notes réapparaissent à l'identique, aucune
perte d'état. `outils/audit-check.sh` relancé après coup (syntaxe JS OK sur
tous les blocs, accolades CSS équilibrées — vérifié à la main, l'étape
Python du script n'est pas disponible dans cet environnement).

### Favoris (étoile) PJ/PNJ/Trésor — complété le 2026-08-11

Tristan a redemandé cette fonctionnalité en pensant qu'elle n'avait jamais
été faite (session précédente sans accès à l'historique). En réalité elle
existait déjà, commitée localement mais **jamais poussée sur `origin/main`**
(`26b27c6 Ajout des favoris (étoile) pour PJ/PNJ/Créatures/Trésor/Sorts`,
13:33) : marqueur `o.favorite`, étoile cliquable + filtre « Favoris
uniquement » par onglet, déjà présents pour les **5** entités PJ/PNJ/
Créatures/Trésor/Sorts (plus large que les 3 demandées cette fois-ci) — mais
**seulement en vue liste**, jamais en vue détail malgré la demande initiale.

**Complété ici** : étoile ajoutée en vue détail pour PJ/PNJ/Trésor
(`detailPC`/`detailNPC`/`detailTreasure`, `index.html`) — placée à côté du
`<h1>` dans un conteneur flex, via `favStarHTML(type,id,fav,true)` (nouveau
4e paramètre `inline`) + classe CSS `.fav-star-inline` (`style.css`,
`position:static` au lieu de l'ancrage `position:absolute` sur `.card` utilisé
en liste, qui n'a pas de sens sans carte autour). Créatures/Sorts non
touchés (hors du périmètre demandé cette fois, restent liste-seule comme
avant).

**Décision GM-only maintenue, pas artificielle** : Tristan a explicitement
demandé de vérifier les permissions existantes avant de décider si les
joueurs devraient voir l'étoile sur leurs propres PJ. Vérifié : `npcs` et
`treasures` ne sont même pas dans `PLAYER_VISIBLE_TABS` (un vrai compte
joueur n'atteint jamais ces onglets, question sans objet) ; `pcs` a une
policy MJ CRUD + une policy de lecture joueur (encore ⏳, voir ledger
Supabase plus haut) mais **aucune policy d'écriture joueur nulle part** —
un joueur ne peut donc persister aucun changement sur sa propre fiche PJ
via Supabase RLS, étoile ou non. Ouvrir le bouton aux joueurs afficherait
donc une étoile cliquable qui échoue silencieusement à chaque clic (RLS
refuse l'écriture) — pire qu'une absence de bouton. GM-only reste donc le
seul choix cohérent avec le modèle de permissions réel, pas une restriction
arbitraire copiée de `gmCreated`.

**Testé** (pas de session Supabase disponible ici, donc pas de vérification
de la persistance serveur réelle — voir remarque plus bas) : serveur
statique local (`python -m http.server`), `myRole`/`view`/`db` manipulés en
console comme pour les autres entrées de ce journal, `saveDB()` stubbé en
mémoire le temps du test. Vérifié pour PJ/PNJ/Trésor : l'étoile apparaît en
liste ET en détail, reflète correctement `o.favorite` (☆/★), le clic bascule
la valeur sur le bon objet et déclenche `saveDB()` (donc persisterait en
conditions réelles), le filtre « Favoris uniquement » masque bien les
non-favoris (0 résultat sur une liste d'1 élément non favori après filtre),
et repasse **`myRole="player"`** : zéro étoile, zéro bouton de filtre, en
liste comme en détail, sur les trois entités — confirmé qu'aucune fuite ne
dépend d'un oubli de test par ailleurs. Positionnement de l'étoile en vue
détail vérifié par mesure DOM (`getBoundingClientRect`) : alignée sur la
même ligne que le titre, pas de chevauchement horizontal. **Non testé** :
persistance réelle côté Supabase (nécessite une session MJ authentifiée,
indisponible dans ce bac à sable — le compte GM de Tristan est déjà connecté
sur le site déployé via Chrome, à confirmer par lui après déploiement en
cochant une étoile puis en rechargeant la page).

### Bug — ledger `emptyDB()`/`TABS`/`TYPE_OF_TAB` désynchronisé de la
fonctionnalité To-do MJ (2026-08-11)

Introduit par moi en committant le champ icône du Trésor (entrée plus haut,
« Fonctionnalité ajoutée — icône pour les objets du Trésor ») **pendant que**
Tristan/Dual développait en parallèle, dans le même dépôt de travail, la
fonctionnalité To-do MJ (`gmnotes`, commit `96da256`). Un `git add` lancé
au milieu de leur édition en cours a capturé un état intermédiaire de
`index.html` — trois déclarations (`emptyDB()`, `TABS`, `TYPE_OF_TAB`)
avaient déjà `gmnotes` au moment du `git add`, mais je ne les avais pas
identifiées comme faisant partie de mon changement. En croyant « nettoyer »
une pollution accidentelle avant de push, je les ai reverties par erreur —
alors que le reste de la fonctionnalité (bouton de nav, `TAB_OF`,
`collectionOf`, dispatch de `renderList()`, `<script src="js/gmnotes.js">`,
`DB_COLS` dans `js/importexport.js`, gestionnaires d'événements) avait déjà
été committé complet par Tristan/Dual juste après. Résultat : l'onglet
« To-do MJ » plantait (`db.gmnotes` undefined) pour toute session partant
d'un DB vide, publié en production le temps d'un aller-retour de déploiement.

**Fix** (commit `305d1d0`, isolé avec `git hash-object`/`update-index` pour
ne toucher que ces 3 lignes sans interférer avec le travail en cours de
Tristan/Dual sur d'autres fichiers) : réintégré `gmnotes:[]` dans
`emptyDB()`, `"gmnotes"` dans `TABS`, `gmnotes:"gmnote"` dans `TYPE_OF_TAB`.
Vérifié après coup : `outils/audit-check.sh` (syntaxe JS OK), grep de toutes
les occurrences `gmnote(s)` dans `index.html` pour confirmer la cohérence du
ledger, et rechargement du site déployé (`db.gmnotes` bien initialisé).

**Leçon retenue** : dans ce dépôt, `index.html` peut être modifié en direct
par un autre agent (Dual) pendant qu'une session Claude Code y travaille —
toujours `git diff` ligne par ligne avant de committer plutôt que de faire
confiance à un `git add` global, et en cas de doute sur une ligne inattendue,
vérifier si une fonctionnalité en cours l'utilise déjà ailleurs dans le
fichier avant de la retirer.

## Feature — Couleur par nœud dans le Point Crawl (2026-08-11)

Demande de Tristan : pouvoir colorer un nœud de point crawl pour
visualiser en un coup d'œil ce qu'un groupe a déjà visité (ou tout autre
repère perso), directement sur le schéma.

Aucun champ de statut/couleur par nœud n'existait déjà (`crawlFocusItems`
et `CRAWL_STATUSES`/`c.status` portent sur le point crawl entier, pas sur
ses nœuds individuels) — nouveau champ `n.color` ajouté plutôt qu'une
extension d'un mécanisme existant.

- `NODE_COLORS` (palette fixe de 6 couleurs + « Aucune », réutilise les
  teintes déjà utilisées ailleurs dans l'appli pour rester cohérent) et
  `nodeColorMeta()` dans `index.html`, près de `CRAWL_STATUSES`.
- `js/pointcrawl.js` : `drawCrawl()` applique la couleur du nœud en style
  inline (bordure + liseré intérieur) sur `.crawl-node` ; `openNodeInfo()`
  (modale ouverte au clic sur un nœud) affiche la palette de pastilles ;
  `setNodeColor()` persiste (`saveDB()`) et redessine.
- Handler délégué `data-set-node-color` ajouté dans `index.html` (même
  pattern que `data-remove-node`).
- CSS `.node-color-picker`/`.node-color-swatch` dans `style.css`.

Vérifié sans connexion (les identifiants Supabase de Tristan ne sont pas
accessibles à cette session — copier son jeton de session depuis Chrome
aurait été un contournement d'auth, refusé) : `node --check` sur les JS
modifiés, puis rendu isolé (page statique locale chargeant `style.css` en
vrai) des nœuds colorés et de la palette de pastilles, styles calculés
vérifiés via `getComputedStyle` — bordures/liserés et couleurs de pastille
conformes à `NODE_COLORS`. Pas de test end-to-end via l'appli réelle (login
requis) ; à confirmer par Tristan sur un point crawl existant.

## Refonte — Création de PJ : classe fiable + ascendances génériques (2026-08-11)

Demande de Tristan, plan validé avant implémentation (voir
`C:\Users\Tristan\.claude\plans\functional-inventing-pascal.md`) : la fiche PJ ne reflétait
pas fiablement les règles de classe. `generateRandomPC()` calculait bien tout (armes, sorts,
talents...) mais figeait le résultat en texte brut dans `info` au moment de la génération —
rien ne se recalculait si la classe changeait ensuite. Les PJ créés à la main n'avaient
jamais ce traitement du tout (`cls`/`ancestry` étaient du texte libre non relié à
`CLASSES_DATA`/`ASCENDANCES`). Deuxième demande dans le même chantier : supprimer les
dénominations raciales (Nain/Elfe/Gobelin...) — l'identité d'un PJ doit passer par son
portrait, pas par une race.

**Classe et Ascendance deviennent des `<select>` fermés** (`formPC()`, comme l'alignement
déjà) — condition nécessaire pour que `CLASSES_DATA[p.cls]`/`ASCENDANCES[p.ancestry]`
matchent toujours, texte libre banni.

**`ASCENDANCES` réécrite (12 entrées génériques, d12)** : les 6 anciennes (Demi-Orque→
Puissance, Elfe→Yeux perçants, Gobelin→Sens aiguisés, Halfelin→Discret, Humain→Ambitieux,
Nain→Robuste) renommées sans référence raciale, + 6 nouvelles fournies par Tristan (Rapide,
Géant, Minuscule, Envoûtant, Prédestiné, Athlétique). Langues retirées de la définition de
l'ascendance (`languages`/`extraLanguage` supprimés) — remplacées par un tirage
indépendant : chaque PJ généré reçoit la langue commune + 1 langue courante (d9) au hasard,
les bonus de classe (Magicien +2/+2) s'ajoutant par-dessus comme avant. `ASCENDANCE_ROWS`
(table « Ascendances » dans Tables aléatoires) mise à jour en conséquence (d6→d12).

**Nouvelle section « Classe » calculée en direct** (`pcClassSectionHTML()` dans
`detailPC()`, pendant `printClassBlock()` pour le PDF) : dé de vie, armes/armures
autorisées, capacités de classe, sorts connus + DD d'incantation (réutilise
`spellCastDC()`), et la table de talents 2d6 — plus jamais stockée sur le PJ
(`p.talents` supprimé), toujours lue depuis `CLASSES_DATA[p.cls].talents`. Changer la
classe d'un PJ met instantanément à jour toute cette section, y compris pour un PJ créé à
la main. Ajout d'un champ `masteredWeapon` (texte libre, surtout pour un Guerrier) affichant
le bonus concret calculé (`+1 + moitié du niveau`). Le titre (`Titre :`) n'est plus stocké
non plus, toujours recalculé via `titleFor(p.cls, p.alignment, p.level)` (fonction déjà
existante, inchangée). Nouveaux champs `languages`/`deity`, remplissables à la main,
affichés sous le nom du PJ.

**`generateRandomPC()` allégée** : ne bake plus Titre/Langues/Divinité/Trait
d'ascendance/Armes/Armures/Capacités/Talents dans `info` (tout est dérivé à l'affichage) ;
`info` ne garde que le jet de talent initial (2d6), un événement ponctuel propre à ce
personnage, pas une règle de classe. `pickRandomPortrait()` appelé sans argument de race
(le filtrage `p.race` du manifeste de portraits devient inutilisé côté PJ — conforme à la
volonté que l'identité passe par le portrait, pas par une race ; aucune casse, juste un
retour au pool complet).

**Formulaire simplifié** : bloc d'édition manuelle des talents 2d6 retiré (`talents-wrap`,
`data-add-talent`/`data-remove-talent`, `talentInput()`, `DEFAULT_TALENTS()`) — les talents
n'ont plus de raison d'être éditables à la main puisqu'ils sont 100% dérivés de la classe.

Vérifié dans le navigateur (bac à sable) : PJ sans classe → aucune section Classe ; assigné
Guerrier + arme maîtrisée + niveau 3 → section Classe correcte (bonus d'arme +2 calculé) ;
changé en Magicien → talents/armes/DD se mettent à jour instantanément, bonus d'arme
maîtrisée résiduel toléré (champ indépendant, pas de garde-fou par classe — accepté comme
limite mineure). PJ généré aléatoirement → ascendance générique, 6 langues cohérentes
(commune + 1 tirage + 2+2 bonus Magicien), `info` ne contient plus que le jet de talent
initial. Formulaire d'édition : select Ascendance/Classe pré-sélectionnent bien la valeur
existante, plus de bloc Talents. `printPCSheet()` généré sans erreur, bloc Classe présent.
`outils/audit-check.sh` : syntaxe JS OK sur les 8 blocs `<script>`.

**Reste à faire (hors code)** : passe de nettoyage des PJ déjà en base sur le site live
(remapper les anciennes ascendances raciales vers les nouvelles, extraire
Titre/Langues/Divinité de `info` vers les nouveaux champs, retirer les lignes figées
résiduelles) + mise à jour de la table « Ascendances » déjà seedée en Supabase (le `ensure()`
de `seedCharGenTables()` ne réécrit pas une table existante) — prévu juste après ce commit,
via Claude in Chrome sur le site déployé, même méthode que les autres passes de données de
cette session.

- **Audit de cohérence après la soirée multi-sessions (2026-08-11)** : ~9 sessions cloud en
  parallèle (Point Crawl château des rats, aperçu joueur global, audit refactor, trésors
  homebrew, onglet notes MJ, fix cartes de donjon, favoris étoile, couleur nœuds Point Crawl,
  récupération post-plantage) + la modularisation locale de Tristan ("Dual") en même temps.
  Vérification demandée par Tristan ("attention aux conflits de commit") : `git log` sur les 40
  derniers commits d'`origin/main` (aucun merge commit, aucun écrasement visible, historique
  strictement linéaire), `git status` (2 commits locaux pas encore poussés, aucun conflit),
  recherche de marqueurs `<<<<<<<`/`=======`/`>>>>>>>` sur tout le repo (aucun), `node --check`
  sur les 11 fichiers `js/*.js` et sur les 8 blocs `<script>` d'`index.html` (tous propres).
  **Tout confirmé présent et cohérent** : onglet `gmnotes` bien exclu de
  `PLAYER_VISIBLE_TABS`, garde `effectiveRole()` dans `render()`/`js/dungeonmaps.js` (fix
  fermeture intempestive), couleur par nœud du Point Crawl (`n.color` + swatches), retrait du
  champ icône des Trésors (commit `7225677`, revert volontaire et documenté de Tristan — pas un
  accident de merge, cf. entrée plus haut), marqueur "créé par le MJ" (`o.gmCreated`) partout,
  aucune référence orpheline à un ancien système de rôle.
  **Bug réel trouvé et corrigé** : l'étoile de favori en vue détail (commit `06ee1e2`,
  intitulé "PJ/PNJ/Trésor") ne couvrait que 3 des 5 types annoncés par le commit d'origine
  (`26b27c6`, "PJ/PNJ/Créatures/Trésor/Sorts") — `detailCreature()` et `detailSpell()`
  n'avaient pas l'étoile inline malgré le filtre "favoris uniquement" déjà actif sur ces deux
  onglets en liste. Ajouté `favStarHTML("creature",c.id,c.favorite,true)` et
  `favStarHTML("spell",s.id,s.favorite,true)`, mêmes wrapper flex que Trésor/PNJ/PJ. Vérifié :
  `node --check` OK sur les 8 blocs `<script>`, page de connexion s'affiche sans erreur console
  (pas de compte de test disponible dans ce contexte pour aller plus loin dans le bac à sable).

### Tâche planifiée nocturne — 2026-08-11 : plan pour « Tables aléatoires » (log rétroactif)

Passage automatisé (backlog `docs/TODO.md`). Chantier choisi : « Tables
aléatoires » (premier point non commencé de la liste). Le point est noté
dans `docs/TODO.md` comme nécessitant une conception de modèle de données
(« à concevoir ») — donc pas d'implémentation à l'aveugle ce soir-là :
lecture du code existant (modèle `db.tables`, tables statiques vs
`kind:"dynamic"`, et surtout les deux générateurs codés en dur
`generateRandomNPC()`/`generateRandomPC()` qui font déjà à la main ce que
Tristan veut pouvoir définir soi-même), puis rédaction d'un plan détaillé
dans `docs/TODO.md` sous le point concerné : un 3ᵉ type de table
`kind:"recipe"` (étapes ordonnées référençant d'autres tables + gabarit
de texte composé), conçu pour rester dans la collection `tables`
existante (aucun nouvel emplacement du ledger à toucher, aucune nouvelle
table Supabase, donc aucun script SQL à faire exécuter par Tristan pour
ce chantier). Rien d'autre modifié dans `index.html`.

**Blocage rencontré ce soir-là** : sandbox sans identifiants Git
configurés pour `github.com` (ni token HTTPS, ni clé SSH utilisable —
seule la résolution DNS HTTPS via proxy est autorisée, pas de connexion
SSH brute). Commit local propre créé mais **jamais poussé** — ce
log lui-même, ainsi que le plan dans `docs/TODO.md`, sont restés
uniquement dans un conteneur sandbox éphémère et ont été perdus jusqu'à
ce qu'une session suivante (voir entrée du 2026-08-12 ci-dessous) les
retrouve et les repousse.

### Tâche planifiée nocturne — 2026-08-12

Contexte au démarrage : lecture de `docs/TODO.md` (2 chantiers ouverts :
« Tables aléatoires », noté « à concevoir » ; « PJ — édition de classe a
posteriori », note de backlog pas encore lancée) et de `docs/AUDIT.md`.
Constat en explorant l'environnement sandbox : un clone Git orphelin
d'une session précédente (2026-08-11, ~03h) traînait encore dans le
conteneur, avec **un commit local jamais poussé** contenant exactement
le plan « Tables aléatoires » décrit ci-dessus + une entrée d'audit
jamais livrée. Vérifié via `git fetch`/`git log` que ce commit n'existe
bien nulle part sur `origin/main` (HEAD réel : `25c4e12`, aucun commit
touchant `docs/TODO.md` depuis `21a2ed1`) — travail confirmé perdu, pas
juste en attente de merge.

Décision : plutôt que de repartir de zéro sur ce chantier (qui aurait
demandé de refaire la même exploration pour arriver au même plan),
**récupération du plan perdu** : contenu réintégré à l'identique dans
`docs/TODO.md` (avec une note de livraison précisant qu'il a été rédigé
le 11 et livré le 12), et les deux entrées d'audit (celle du 11,
rétroactive, et celle-ci) ajoutées à `docs/AUDIT.md`. Aucun changement
dans `index.html` — ce chantier reste au stade « plan en attente de
validation par Tristan », comme prévu, aucune implémentation à l'aveugle.

**Blocage confirmé toujours présent ce soir** : re-testé les mêmes
pistes que la session du 11 plus quelques autres — `git push` HTTPS
échoue (« could not read Username », aucun identifiant/credential
helper configuré) ; tentative SSH (`git@github.com`) échoue dès la
résolution DNS (bloquée par la politique réseau du sandbox, seul HTTPS
vers les hôtes autorisés passe) ; aucun jeton ni fichier d'identifiants
trouvé dans le dossier de la tâche planifiée. Impossible donc de pousser
directement depuis ce sandbox. Ce commit-ci est donc, comme le 11,
resté local — fourni à Tristan sous forme de patch (voir message de fin
de tâche et fichier joint) à appliquer manuellement, ou à faire pousser
par une session qui a un accès Git fonctionnel (ex. "Dual", en local
avec les identifiants déjà configurés). Recommandation pour éviter que
ça se reproduise une 3ᵉ fois : configurer un accès Git (token HTTPS a
minima) pour ce canal de tâche planifiée, ou pointer la tâche vers le
dossier réel du repo sur le PC de Tristan une fois que le mode Cowork
permet de connecter un dossier à une tâche planifiée sans validation
manuelle à chaque nuit.

## Session de nuit (2026-08-12) — Classes de Cursed Scroll #1, en autonomie

Tristan a fourni plusieurs PDF "Cursed Scroll" (suppléments Shadowdark tiers) contenant des
classes de PJ absentes de l'appli, et est allé se coucher avec une consigne claire :
implémenter tout ce qui est faisable, mettre les valeurs ambiguës au hasard plutôt que de
bloquer, et laisser une liste de points à trancher au réveil (voir `docs/TODO.md`).

**Chevalier de Saint Ydris / Ensorceleur / Sorcière** (Cursed Scroll #1, thème diablerie,
VF) ajoutées à `CLASSES_DATA`/`PC_CLASSES`/`TITRES`, même format que les 4 classes de base
— extraction du PDF via `pdftotext -enc UTF-8` (même méthode que les reliques du Trésor
cette session), contenu lu intégralement avant implémentation, détail dans
`docs/REGLES-CREATION-PERSONNAGE.md`.

- Sorcière et Chevalier de Saint Ydris utilisent `spellClass:"witch"`, qui réutilisait déjà
  une entrée de `SPELL_CLASSES` (onglet Sorts) jamais exploitée jusqu'ici.
- Chevalier de Saint Ydris a `spellsKnownLvl1:0` + nouveau champ `spellsFromLevel:3` (aucun
  sort avant le niveau 3) — a nécessité de garder `pcClassSectionHTML()`/`printClassBlock()`
  de afficher un "0 sorts connus" trompeur : nouvelle branche qui affiche plutôt "aucun sort
  connu au 1er niveau, incantation à partir du niveau N".
- **Système de Mentors** (nouvelle constante `MENTORS`, 6 patrons avec leur propre table de
  Bienfaits 2d6) pour l'Ensorceleur, dont c'est l'unique source de pouvoir. Nouveau champ
  `p.mentor` : tiré au hasard à la génération (`generateRandomPC`, le générateur ne peut pas
  demander au joueur), modifiable ensuite via un `<select>` sur la fiche (`formPC`). La
  section Classe (`pcClassSectionHTML`) affiche la table de Talents d'ensorceleur **et** la
  table de Bienfaits du mentor choisi l'une sous l'autre, calculées en direct comme le reste
  du système de classes (aucune donnée de mentor figée sur le PJ à part le nom choisi).
  **Écart volontaire par rapport à la suggestion initiale de Tristan** (mettre les tables de
  mentor dans l'onglet Tables aléatoires) : le composant de table générique affiche un badge
  `d{nombre de lignes}`, qui serait faux ici (tranches 2d6 irrégulières, pas un dé uniforme)
  — laissé uniquement dans `MENTORS`/la fiche PJ. Noté dans `docs/TODO.md` pour confirmation
  le lendemain.
- Catastrophes diaboliques, Origines diaboliques et la liste de 46 sorts de sorcière (lus
  dans le PDF, documentés dans `docs/REGLES-CREATION-PERSONNAGE.md`) **pas implémentés** —
  hors scope de cette nuit, laissés en note pour plus tard.

Vérifié en bac à sable avant commit : les 3 classes assignables et affichent la bonne
section Classe (armes/armures/capacités/talents, DD d'incantation le cas échéant) ; titre
calculé correctement pour les 3 nouvelles classes à tous les paliers d'alignement testés ;
12 générations aléatoires successives couvrant les 7 classes désormais possibles, mentor
assigné uniquement pour les Ensorceleur générés ; fiche imprimable (`printPCSheet`) génère
sans erreur pour un Ensorceleur avec mentor. `outils/audit-check.sh` : syntaxe JS OK sur
les 8 blocs `<script>`.

### Suite de la nuit — 11 classes de Cursed Scroll #2 à #6

Après les 3 classes de Cursed Scroll #1, Tristan a demandé de vérifier les 5 autres numéros
du zine pour d'éventuelles classes de PJ et de tout intégrer avant le matin, en mettant du
hasard là où le PDF est ambigu et en laissant une liste pour validation au réveil.

**11 classes trouvées et ajoutées** à `CLASSES_DATA`/`PC_CLASSES`/`TITRES`, même format que
les classes déjà en place : Cavalier du désert, Combattant de l'arène, Ras-Godai (Cursed
Scroll #2 « Sables rouges », VF) ; Loup des mers, Augure (Cursed Scroll #3 « Soleil de
minuit », VF) ; Guerrier basilic, Rôdeur (Cursed Scroll #4 « River of Night », VO) ;
Fouilleur, Corrompu (Cursed Scroll #5 « Dwellers in the Deep », VO) ; Barde, Duelliste
(Cursed Scroll #6 « City of Masks », VO). Détail dans
`docs/REGLES-CREATION-PERSONNAGE.md`.

- Même méthode d'extraction (`pdftotext -enc UTF-8`, sans `-layout` — lecture linéaire par
  fiche, comme pour les reliques et Cursed Scroll #1) sur les 5 PDF (2 en VF avec le même
  nommage `shd0X-cursedscrollY` que Cursed Scroll #1, 3 en VO anglaise). **Piège évité** :
  un premier grep ciblé sur "classe d'" (apostrophe droite) a raté « Classe d'augure » dans
  Cursed Scroll #3, qui utilise une apostrophe typographique (’) — confirmé en relisant le
  texte en continu plutôt qu'en se fiant au seul grep. Les PDF "Limpo...Mapas-Sem-Marcacoes"
  (PT-BR) fournis en parallèle sont des versions cartes-seules sans texte de règles — pas
  pertinents pour ce chantier, non ouverts.
- **Augure** réutilise `spellClass:"seer"`, une autre entrée de `SPELL_CLASSES` déjà
  présente mais jamais utilisée jusqu'ici (même trouvaille que `witch` pour la Sorcière) —
  aucune modification de code nécessaire pour que l'onglet Sorts la gère.
- **Traductions françaises non officielles** pour les classes venant des 3 numéros anglais
  (Basilisk Warrior→Guerrier basilic, Ranger→Rôdeur, Delver→Fouilleur, Wyrdling→Corrompu,
  Bard→Barde, Duelist→Duelliste) et pour tous les titres associés — choix éditoriaux de
  cette session, à confirmer/ajuster par Tristan.
- **Deux mini-tables lues mais non implémentées** (comme les Catastrophes diaboliques de
  Cursed Scroll #1) : « Lotus noir » (Ras-Godai, d12) et « Corruption » (Corrompu, d10) —
  juste référencées dans le texte de capacité de classe.
- **Un talent illisible à l'extraction** : Loup des mers, tranche 10-11 (Cursed Scroll #3
  p.10) — le texte du PDF pour cette case précise s'est retrouvé fusionné avec une case
  voisine lors de l'extraction. Valeur provisoire posée (« +1 aux attaques à distance ou de
  corps à corps », cohérente avec le reste de la table) plutôt que de bloquer, comme demandé
  — marqué explicitement dans le code et dans `docs/TODO.md` pour vérification manuelle du
  PDF source.

Vérifié en bac à sable avant commit : les 18 classes désormais dans `CLASSES_DATA`
s'affichent sans erreur en détail (`pcClassSectionHTML`) et à l'impression (`printPCSheet`)
pour un PJ de test de niveau 5 par classe (boucle sur `Object.keys(CLASSES_DATA)`, aucune
exception levée) ; `titleFor()` renvoie un titre cohérent pour chacune ; 80 générations
aléatoires successives ont fait apparaître 17 des 18 classes sans erreur (la 18e n'étant
qu'une question de probabilité sur l'échantillon, testée séparément avec succès).
`outils/audit-check.sh` : syntaxe JS OK sur les 8 blocs `<script>`.

### Retouches PJ (2026-08-12, retours de Tristan sur la refonte)

Deux petits ajustements demandés après relecture des nouvelles fiches PJ :
- **Retrait de la ligne « PJ généré automatiquement (règles de création, Quickstart
  p.12-31). »** dans `generateRandomPC()` — Tristan : inutile (le but est justement de ne
  plus dépendre de notes figées) et ça se retrouvait imprimée sur la fiche PDF. `info` ne
  contient désormais que le(s) jet(s) de talent initial.
- **Aide contextuelle sur le champ Ascendance** (`formPC`) : petit bouton « ? » à côté du
  label, ouvre une modale (`openAscendancesModal()`, réutilise `openModal()` comme
  `openCreditsModal()`/`openBrokenLinksModal()`) listant les 12 ascendances et leur trait —
  répond au besoin concret rencontré en éditant la fiche de Nem (choisir une ascendance dans
  le menu déroulant sans savoir ce qu'elle fait).

Vérifié en bac à sable : PJ généré aléatoirement → `info` ne contient plus que le jet de
talent ; clic sur le bouton « ? » du formulaire → modale affichant les 12 ascendances avec
leur texte complet. `outils/audit-check.sh` : syntaxe JS OK.

**Suite immédiate (même soirée)** : Tristan a signalé que le champ Mentor restait visible
pour toutes les classes alors qu'il n'a de sens que pour l'Ensorceleur. Champ désormais
masqué par défaut (`#mentor-field.hidden`, condition sur `CLASSES_DATA[p.cls].usesMentor`
à l'ouverture du formulaire) et basculé en direct via un listener `change` sur `#f-cls` —
pas besoin de rouvrir la fiche en changeant de classe dans le formulaire. En quittant une
classe à mentor, la valeur du `<select>` Mentor est aussi réinitialisée (évite qu'un mentor
choisi puis abandonné reste enregistré silencieusement sur un PJ qui n'en a plus l'usage).
Vérifié en bac à sable : champ masqué à l'ouverture pour un Guerrier, apparaît en changeant
la classe vers Ensorceleur (sans re-render de la page), redisparaît et se vide en repassant
sur Guerrier. `outils/audit-check.sh` : syntaxe JS OK.
