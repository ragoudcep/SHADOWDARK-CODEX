# Audit du Codex — méthode et invariants

Protocole court pour vérifier que le code reste cohérent après une série de
changements. L'historique détaillé des sessions passées est dans `git log` —
ce fichier ne garde que ce qui sert **à la prochaine modification**.

## Quand auditer

Après une session importante (plusieurs fonctionnalités, ou un changement de
schéma de données), ou avant d'attaquer un gros chantier. Pas après chaque
petite modif.

## 1. Vérifications mécaniques

```bash
./outils/audit-check.sh index.html
```

Le script couvre : syntaxe JS de chaque bloc `<script>` (`node --check`),
équilibre des accolades CSS, déclarations de premier niveau dupliquées (signe
d'un conflit de fusion), ledger de collections, restes de `console.log`.

## 2. Vérifications côté données

- **Ledger de collections** — six endroits doivent lister exactement les mêmes
  entités : `DB_COLS`, `TABS`, `TAB_OF`, `TYPE_OF_TAB`, `collectionOf()`,
  `emptyDB()`. Un oubli casse silencieusement l'import/export ou la sauvegarde.
  Le script en vérifie trois ; contrôler les autres avec
  `grep -n "TAB_OF\|TYPE_OF_TAB\|function collectionOf" index.html`.
- **`PLAYER_VISIBLE_TABS` ⇄ policies Supabase** — tout onglet ajouté à cette
  liste doit avoir une policy de **lecture joueur** sur sa table, sinon un
  compte joueur ouvre un onglet vide (RLS bloque le `select` avant tout filtre
  applicatif). Vérifier dans le ledger plus bas.
- **Filtrage joueur par entité** — un onglet visible ne rend pas toutes ses
  entités visibles : `playerCanViewEntity()` filtre par objet (ex. Armurerie,
  où seuls les objets marqués `playerVisible` sont montrés). Toute nouvelle
  règle de visibilité passe par cette fonction, jamais par un test de rôle
  dispersé dans une vue.

## 3. Vérification visuelle

Chromium est disponible dans l'environnement (Playwright préconfiguré), mais
l'appli a besoin d'une session Supabase authentifiée pour afficher des données
réelles : le rendu final se confirme dans le navigateur de Tristan après
déploiement. Le signaler quand un changement touche au CSS ou à la mise en page.

## 4. Hygiène git

`git log --oneline -10`, aucun secret commité, `.gitignore` à jour.

## Invariants et pièges connus

- **Deux systèmes d'import XML coexistent** : les créatures ont un import
  dédié historique (`importXML`, via `_xmlImportTarget==="creature"`), toutes
  les autres entités importables passent par `XML_TYPES`/`importXMLGeneric`.
  Ne pas chercher un `XML_TYPES.creature`, il n'existe pas.
- **Ajouter un champ ne demande aucun SQL** : chaque table Supabase stocke tout
  dans une colonne `data jsonb`. Seule la création d'une **nouvelle table**
  nécessite un script (`outils/supabase_*.sql`).
- **Lignes de tables multi-colonnes** : une ligne est un **tableau de cellules**
  (`["Ambition","Moyens"]`), pas une chaîne découpée sur « / » — un `/` dans une
  cellule (« le/la ») cassait le découpage. Lire une ligne via `tableRowCells()`,
  jamais en la refendant ; `tableRowText()` donne la forme texte à plat (export
  XML, roue, impression, recherche). `normalizeTableRows()` convertit l'ancien
  format au chargement.
- **Le polling est l'exception, pas la règle** : seuls l'Initiative et les Cartes
  de donjon se rafraîchissent automatiquement. Un timer de polling doit être
  arrêté quand on quitte l'onglet **et** quand le rôle effectif change (un MJ qui
  sort de l'aperçu joueur) — sinon il continue d'écraser les données et de forcer
  un rendu de liste par-dessus la fiche ouverte (bug vécu sur les cartes de
  donjon, voir le commentaire dans `render()`).
- **Rôle effectif** : toujours tester `effectiveRole()`, jamais `myRole`, sauf
  pour le bouton d'aperçu lui-même — sinon l'aperçu joueur ment.

## Ledger Supabase (tables + RLS)

Seule source de vérité sur ce qui a réellement été exécuté en base : le code
suppose que ces tables existent, il ne peut pas le garantir. À tenir à jour à
la main.

| Table | Créée | Policy GM (CRUD) | Lecture joueur | Statut |
|---|---|---|---|---|
| sessions | ✅ | ✅ | — | confirmé (setup initial) |
| events | ✅ | ✅ | — | confirmé (setup initial) |
| creatures | ✅ | ✅ | — | confirmé (setup initial) |
| tables | ✅ | ✅ | — | confirmé (setup initial) |
| npcs | ✅ | ✅ | — | confirmé (setup initial) |
| pointcrawls | ✅ | ✅ | — | confirmé (setup initial) |
| pcs | ✅ | ✅ | ⏳ | script `supabase_pcs_lecture_joueurs.sql` à exécuter |
| treasures | ✅ | ✅ | ⏳ | **requis** depuis que l'Armurerie est dans `PLAYER_VISIBLE_TABS` — script `outils/supabase_treasures_lecture_joueurs.sql` à exécuter |
| hexmaps | ✅ | ✅ | ✅ | confirmé |
| spells | ✅ | ✅ | ✅ | confirmé |
| roadbook | ⚠️ | ⚠️ | ⚠️ | à confirmer |
| initiative | ✅ | ✅ | ✅ | script `outils/supabase_initiative_setup.sql` |
| wheel | ✅ | ✅ | ✅ | script `outils/supabase_wheel_setup.sql` |
| dungeonmaps | ✅ | ✅ | ✅ | script `outils/supabase_dungeonmaps_setup.sql` (lecture joueur filtrée sur `active`) |
| gmnotes | ✅ | ✅ | — | script `outils/supabase_gmnotes_setup.sql` |
| cursedscrolledits | ✅ | ✅ | — | script `outils/supabase_cursedscrolledits_setup.sql` |
