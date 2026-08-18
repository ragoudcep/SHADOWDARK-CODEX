# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Codex — gestionnaire de campagne pour le jeu de rôle **Shadowdark**. Application web
une-page (HTML/CSS/JS vanilla, aucun build, aucun framework), persistée sur **Supabase**
(Postgres + Auth + RLS), avec deux rôles (MJ / joueuse) et synchronisation quasi temps réel.
Voir `README.md` pour la liste complète des fonctionnalités (sessions, tables aléatoires,
événements, point crawl, créatures, sorts, PJ, PNJ, portraits, hexcrawl, cartes de donjon,
trésor, carnet de route, liens croisés `[[Nom]]`, recherche globale, import/export XML/JSON).

Live : https://ragoudcep.github.io/SHADOWDARK-CODEX/ (ancien déploiement GitHub Pages —
le dépôt de référence est maintenant sur GitLab, voir « Dépôt et workflow git » plus bas).

## Commandes

Aucun build, aucun test automatisé, aucun linter configuré — c'est un site statique pur.

- **Développer/tester en local** : ouvrir `index.html` directement dans un navigateur (pas
  de serveur nécessaire). Toute vérification visuelle (CSS, mise en page, responsive) doit
  être faite dans un vrai navigateur — pas d'outil de rendu headless disponible en session.
- **Vérifications mécaniques rapides** avant de considérer une modif terminée :
  ```bash
  ./outils/audit-check.sh index.html
  ```
  Vérifie la syntaxe JS de chaque bloc `<script>` (`node --check`), l'équilibre des
  accolades CSS, les déclarations dupliquées (`function`/`const`/`let` de premier niveau —
  piège fréquent après un merge), la cohérence du « ledger de collections » (voir
  ci-dessous), et les restes de `console.log`/`debugger`.
- **Méthode d'audit complète** (quand faire quoi, checklist manuelle) : `docs/AUDIT.md`.
- **Déploiement** : automatique via GitLab Pages (`.gitlab-ci.yml`) à chaque push sur `main`
  — aucune commande à lancer manuellement.

## Dépôt et workflow git

Le dépôt de référence est sur **GitLab** (`https://gitlab.com/ragoudcep/SHADOWDARK-CODEX.git`),
migré depuis GitHub. Il est **public en lecture** (clone anonyme possible, aucun token requis
pour lire/cloner) mais une session Claude Code n'a en général **pas d'accès en écriture**
(pas de credentials GitLab configurés par défaut). Si le push échoue ou qu'aucun accès n'est
configuré :
1. Committer localement comme d'habitude.
2. Donner à Tristan soit un patch (`git format-patch`), soit directement le fichier modifié,
   pour qu'il l'applique et pousse depuis sa machine (`git am le-patch.patch && git push`, ou
   remplacement manuel du fichier + `git add`/`commit`/`push`).
3. Ne pas supposer qu'un token va être fourni — proposer d'abord le clone en lecture seule et
   le flux « patch/fichier à appliquer », qui ne nécessite aucun secret partagé.

**Un autre agent (« Dual ») édite potentiellement ce dépôt en parallèle** (mentionné dans
`docs/MODULARISATION.md`). Toujours `git pull`/`git fetch` avant de commencer une session de
modifications pour éviter de travailler sur une base obsolète, et privilégier des commits
petits et fréquents plutôt qu'une grosse réécriture d'un coup (réduit le risque et la taille
d'un éventuel conflit de fusion).

## Architecture

### Fichier principal et modules déjà extraits

`index.html` (~350 Ko, ~5400 lignes) contient encore la majorité de la logique applicative
dans un unique `<script>` inline. Une modularisation est en cours, documentée avec un état
d'avancement précis dans **`docs/MODULARISATION.md`** — à lire avant tout gros chantier de
découpage, elle contient déjà la cartographie complète (quelles fonctions vont dans quel
futur fichier, quelles lignes) et le raisonnement sur le choix technique (scripts classiques
multiples, pas de modules ES, pour rester zéro-build).

Déjà extrait vers des fichiers séparés (chargés en `<script src="js/...">`, portée globale
partagée — pas de `import`/`export`) :

| Fichier | Contenu |
|---|---|
| `style.css` | CSS réel de l'appli |
| `fonts/*.woff2`, `vendor/supabase.min.js`, `icons.svg` | assets statiques (polices, lib Supabase, planche d'icônes SVG) |
| `js/modal.js` | `openModal`/`closeModal`/`confirmModal`/`promptModal` |
| `js/autocomplete.js` | autocomplétion des liens `[[...]]` dans les champs texte |
| `js/search.js` | recherche globale (Levenshtein) |
| `js/importexport.js` + `js/xml-generic.js` | export/import JSON global, système XML générique |
| `js/wheel.js` | onglet Roue |
| `js/initiative.js` | onglet Initiative (timeline de combat) |
| `js/pointcrawl.js` | onglet Point Crawl (liste/détail/formulaire/canevas/impression) |
| `js/hexcrawl.js` | onglet Hexcrawl (grille, biomes, brouillard, import JSON) |
| `js/dungeonmaps.js` | onglet Cartes de donjon (pinceau, masque SVG, aperçu joueur) |
| `js/gmnotes.js` | notes MJ privées |
| `js/cursedscroll.js` | fonctionnalité « parchemin maudit » |

**Encore inline dans `index.html`**, éclaté en 3 zones (liste des fonctions par entité, zones
approximatives — se référer à `docs/MODULARISATION.md` pour le détail à jour) :
- zone **listes** (`list*()`) et zone **détails** (`detail*()`), groupées chacune ;
- zone **FORMULAIRES** (`form*()`/`save*()` de TOUTES les entités à la suite) ;
- le **routeur central** (`render`, `renderList`, `renderDetail`, `renderForm`, `goto`) et le
  **noyau partagé** (persistance, état global, rendu de texte/liens, accès générique aux
  entités — voir « Noyau partagé » ci-dessous).

Concerne : événements, tables, créatures, PNJ, **sessions** (carnet de route), PJ, trésor,
sorts. Quand on cherche une fonction pour une de ces entités, chercher son nom directement
(`grep -n "function formSession"` etc.) plutôt que de parcourir le fichier linéairement — ou
consulter `docs/MODULARISATION.md` qui donne déjà les plages de lignes.

### Modèle de données et persistance

`db` est un objet unique en mémoire avec 15 collections (`db.sessions`, `db.events`,
`db.creatures`, `db.tables`, `db.npcs`, `db.pointcrawls`, `db.pcs`, `db.treasures`,
`db.hexmaps`, `db.spells`, `db.initiative`, `db.wheel`, `db.dungeonmaps`, `db.gmnotes`,
`db.cursedscrolledits`), défini par `emptyDB()`. Chaque collection correspond à une table
Supabase (une ligne par entité, colonne `data` en `jsonb`, upsert par `id`) :
- `fetchRemoteDB()` charge tout au démarrage (requêtes parallèles).
- `saveDB()` pousse tout le contenu de `db` (upsert, ne supprime jamais) ; les suppressions
  passent par `deleteRemote(col, id)`/`wipeRemoteTable(col)` explicitement.
- `initiative` a sa propre fonction de sauvegarde (`saveInitiative()`), volontairement séparée
  de `saveDB()` pour qu'une collection en erreur ne bloque pas silencieusement les autres
  (voir le commentaire au-dessus de la fonction dans le code pour l'incident qui a motivé ça).

**Ledger de collections — piège classique** : une entité (nom de collection) doit rester
listée à l'identique à **cinq endroits** : `DB_COLS` (dans `js/importexport.js`), `TABS`,
`TAB_OF`, `TYPE_OF_TAB`, `collectionOf()`, `emptyDB()`. En oublier un casse silencieusement
l'import/export ou la sauvegarde d'une collection. `outils/audit-check.sh` vérifie les trois
premiers automatiquement.

### Navigation et rendu

État de navigation global : `let view = { tab, mode, id }` (`mode`: `list`/`detail`/`edit`/
`new`). `render()` dispatche vers `renderList()`/`renderDetail()`/`renderForm()` selon `view`,
qui dispatchent eux-mêmes vers la fonction `list<Entity>()`/`detail<Entity>()`/`form<Entity>()`
correspondant à `view.tab`. Navigation programmatique via `goto(type, id)`. Un seul gros
dispatcher de clics délégué sur `app` (`app.addEventListener("click", ...)`) route les actions
selon des attributs `data-*` (`data-open="type:id"`, `data-save="type"`, `data-back`, etc.) —
en ajouter une nouvelle, c'est ajouter un `data-xxx` dans le HTML généré + un cas dans ce
dispatcher, pas un nouvel `addEventListener` isolé.

Convention par entité (créer/lire une nouvelle entité = suivre ce même quatuor) :
`list<Entity>()` (grille de cartes), `detail<Entity>(o)` (fiche complète), `form<Entity>()`
(création/édition), `save<Entity>()` (lit le DOM du formulaire, écrit dans `db.<collection>`,
appelle `saveDB()`).

### Noyau partagé (utilisé par presque tous les modules)

- Rendu de texte/liens : `esc()`, `renderText()`, `renderBullets()`, `findByName()`,
  `extractLinks()`, `findBrokenLinks()` (vérificateur de liens `[[Nom]]` brisés, accessible
  dans l'UI), `renderTextPrint()`/`printSection()` (partagés par tous les exports PDF).
- Accès générique aux entités : `collectionOf(type)`, `getEntity()`, `deleteEntity()`,
  `duplicateEntity()`, `backlinksTo()`/`backlinksBlock()` (rétroliens automatiques),
  `replaceLinksEverywhere()`, `maybePropagate()` (renomme les liens `[[...]]` partout quand une
  entité est renommée).
- Rôles : `myRole` (MJ/joueuse), `effectiveRole()`, `previewAsPlayer` (mode aperçu joueur côté
  MJ), `PLAYER_VISIBLE_TABS` (onglets visibles côté joueuse — à tenir cohérent avec les
  policies RLS Supabase, voir `docs/AUDIT.md`).
- UI partagée : `pageHead()`, `emptyState()`, `detailActions()`, `applyRoleUI()`, `toast()`.

### Filtres et marqueurs transverses (pattern répété sur plusieurs onglets)

Plusieurs onglets (PJ, PNJ, créatures, trésor, sorts, point crawl) partagent le même genre de
marqueur booléen sur l'entité + variable d'état d'affichage + bouton de filtre, **jamais
appliqué à `db` lui-même** (uniquement à l'affichage, pour ne jamais risquer de perdre des
données non filtrées au prochain `saveDB()`) : favoris (`o.favorite`/`*FavOnly`), « mes
créations » (`o.gmCreated`/`gmCreatedOnly`, un seul bouton global partagé par tous les
onglets), WIP côté trésor (`t.wip`/`treasureWipOnly`, cas inverse : masqué par défaut),
visibilité joueur (`o.visible`/icône œil). Ajouter un nouveau filtre du même genre = suivre ce
pattern (variable d'état + fonction `filter*()` appliquée uniquement dans les `list*()`).

## Documentation interne (`docs/`)

- `AUDIT.md` — méthode de vérification régulière du code + journal des passages + les points
  d'attention structurels accumulés au fil du temps (dont le ledger de collections détaillé
  ci-dessus).
- `MODULARISATION.md` — analyse et plan de découpage de `index.html`, avec cartographie précise
  (fichier → fonctions → lignes). À consulter avant tout chantier touchant à l'organisation des
  fichiers.
- `TODO.md` — backlog de chantiers non commencés, par onglet.
- `REGLES-CREATION-PERSONNAGE.md` — référence des règles Shadowdark utilisées par les
  générateurs aléatoires de PJ/PNJ (à consulter avant de toucher `generateRandomNPC`, la
  génération de PJ, ou les tables `ASCENDANCES`/`CLASSES_DATA`).
