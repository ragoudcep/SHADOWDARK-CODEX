# TODO — Backlog du Codex, par onglet

Mémoire partagée du backlog de chantiers futurs, dictée par Tristan le
2026-08-10. Ce fichier n'est pas un audit (voir `docs/AUDIT.md` pour la
méthode de vérification technique) — c'est la liste de ce qu'il reste à
faire, tab par tab, pour que n'importe quelle session Claude (moi, une
future session, ou « Dual ») reparte avec le même contexte sans que
Tristan ait à tout redicter.

Pas d'implémentation en cours sur ces points — c'est de la prise de notes.
À mettre à jour (cocher, préciser, retirer) au fur et à mesure que ces
chantiers avancent. Seuls les onglets avec un chantier réellement ouvert
figurent ici — les onglets « terminés »/« ne pas toucher » ont été retirés
à la demande de Tristan (2026-08-10) ; leur historique reste dans
`docs/AUDIT.md`.

## Tables aléatoires

**À réorganiser, contenu à revoir.** Certaines tables ont été conçues à
l'origine pour un enchaînement de plusieurs jets qui se combinent (ex :
un d12 puis un d4 dont les deux résultats se composent) — typiquement
toute la génération de PNJ (ascendance, alignement, âge, richesse,
qualités, métier, adjectif, noms par syllabes...), aujourd'hui éclatée en
tables indépendantes qu'il faut tirer une par une.

Envie exprimée : un bouton « Générer » qui lance d'un coup tous les jets
des tables liées à une génération donnée (ex : un PNJ complet) et affiche
un résultat composé final, plutôt que de tirer chaque table séparément.
Implique probablement une notion de « groupe de tables liées » ou de
« recette de génération » qui n'existe pas encore dans le modèle de
données actuel — à concevoir.

### Plan proposé (session automatisée, 2026-08-11) — en attente de validation

Chantier structurant (nouveau concept de modèle de données) : pas
d'implémentation à l'aveugle ce soir, seulement exploration du code
existant + proposition de plan ci-dessous. À valider ou corriger par
Tristan avant implémentation.

**Existant repéré dans `index.html` :**
- Une table (`db.tables`) a aujourd'hui deux formes : « statique »
  (`rows`, un tableau de chaînes, une par face de dé) et « dynamique »
  (`kind:"dynamic"`, tire dans une autre collection de l'appli —
  créatures/PNJ/trésors/sorts — via `dynamicSourceItems()`). Rien ne
  permet de lier plusieurs tables entre elles.
- Le besoin exprimé existe déjà, mais **codé en dur** deux fois :
  `generateRandomNPC()` (ligne ~774) et `generateRandomPC()` (ligne
  ~1987) tirent chacune une série de tables fixes (`rollOnAppTable("Nom
  de la table")`) et assemblent le résultat à la main en JS pour créer
  une fiche PNJ/PJ complète. C'est exactement le mécanisme que Tristan
  veut pouvoir définir soi-même, sans toucher au code, pour n'importe
  quelle combinaison de tables (pas seulement PNJ/PJ).
- Les tables à colonnes multiples par ligne (ex. Noms par syllabes,
  Périls, Qualités des PNJ) sont un mécanisme *différent et
  complémentaire* : plusieurs résultats combinés **au sein d'une même
  table/ligne**. Le chantier ci-dessous porte sur la combinaison **entre
  plusieurs tables distinctes** — les deux mécanismes coexistent, l'un
  ne remplace pas l'autre.

**Proposition : un 3ᵉ type de table, « recette ».**

Plutôt que d'ajouter une nouvelle collection top-niveau (ce qui
impliquerait de toucher aux 6 emplacements du ledger — `TABS`, `DB_COLS`,
`TAB_OF`, `TYPE_OF_TAB`, `collectionOf()`, `emptyDB()` — et une nouvelle
table Supabase), l'idée est de rester dans `db.tables` avec un 3ᵉ
`kind` en plus de statique et `"dynamic"` : `kind:"recipe"`.

- `t.steps` : liste ordonnée d'étapes `{label, tableId}` — chaque étape
  référence une table existante (statique ou dynamique, **pas une autre
  recette**, pour écarter simplement tout risque de boucle) et porte un
  libellé (par défaut le titre de la table référencée, modifiable).
- `t.template` (texte libre, optionnel) : gabarit du résultat composé
  avec des espaces réservés `{{Libellé}}`, ex. `"{{Nom}}, {{Ascendance}},
  {{Alignement}}. Ambition : {{Ambition}} (par {{Moyen}})."`. Si vide,
  gabarit par défaut = chaque étape listée sur sa propre ligne
  (`Libellé : résultat`), pour ne pas obliger à écrire un gabarit dans
  le cas simple.
- Tirer une recette = tirer une fois sur chaque table référencée (en
  réutilisant `rollTable`/`dynamicSourceItems` existants) puis appliquer
  le gabarit. Le résultat composé alimente `lastTableRoll` normalement,
  donc « Ajouter aux notes de session » fonctionne sans changement.
- Aucune nouvelle table Supabase requise (les recettes vivent dans la
  collection `tables` déjà synchronisée) — **pas de script SQL à
  exécuter par Tristan pour ce chantier.**
- Onglet « Tables aléatoires » : nouveau choix dans le formulaire de
  création (Statique / Dynamique / Recette), éditeur d'étapes (ajouter/
  retirer/réordonner, choix de la table par liste déroulante), carte de
  liste avec un badge distinct (ex. 🧩 Recette) au lieu du dé.
- Garde-fous : si une table référencée par une étape est supprimée
  ensuite, l'étape doit afficher/tirer « (table supprimée) » proprement
  au lieu de planter — et étendre le vérificateur de liens brisés déjà
  présent (`btn-broken-links`) pour repérer aussi les étapes de recette
  pointant vers une table qui n'existe plus.

**Hors scope pour cette 1ʳᵉ version (à rediscuter séparément si voulu) :**
- Faire produire à une recette une fiche complète (PNJ/PJ créé dans la
  bonne collection), comme le font aujourd'hui `generateRandomNPC`/`PC`
  en dur — une recette v1 ne fait que composer un **texte** de résultat,
  elle ne crée pas d'entité. Migrer les deux générateurs actuels vers ce
  système serait une v2 plus ambitieuse (mapping champ par champ vers
  une fiche), pas nécessaire pour répondre au besoin initial (« un
  bouton qui tire tout d'un coup et affiche un résultat composé »).
- Recette référençant une autre recette (imbrication) — écarté pour
  éviter la gestion de cycles, pas de besoin exprimé pour l'instant.

**Prochaine étape suggérée :** si ce plan convient, l'implémentation
(modèle de données + UI) tient dans un seul chantier mécanique
raisonnable pour une prochaine session (pas besoin d'un nouveau tour de
conception) : cases à cocher ci-dessous à transformer en travail réel.

- [ ] Modèle de données : `kind:"recipe"`, `steps`, `template` sur
      l'entité table.
- [ ] Fonction de tirage composé (`rollRecipe`) + branchement dans
      `rollTable()`.
- [ ] UI de création/édition d'une recette (choix des étapes, gabarit).
- [ ] Affichage carte/liste + tirage depuis la fiche détail.
- [ ] Extension du vérificateur de liens brisés aux étapes de recette.
- [ ] `outils/audit-check.sh` + test fonctionnel réel (créer une recette
      de test, tirer, vérifier le texte composé et l'ajout aux notes de
      session).

**Note de livraison (2026-08-12) :** ce plan a été rédigé dès le
2026-08-11 mais n'avait jamais atteint `origin/main` — la session de
cette nuit-là avait buté sur l'absence d'identifiants Git pour pousser
(voir `docs/AUDIT.md`). Récupéré et poussé ce soir, sans changement de
fond. **Ce plan reste en attente de validation par Tristan avant
implémentation** — rien ci-dessous n'a été codé.


## Nuit du 2026-08-12 — classes de Cursed Scroll, à valider au réveil

Tristan a demandé d'implémenter en autonomie tout ce qui est faisable depuis les PDF
"Cursed Scroll" fournis, en mettant du hasard partout où un choix n'était pas clair plutôt
que de bloquer. Liste de ce qu'il faut relire/trancher (détail technique dans
`docs/AUDIT.md`, section « Session de nuit ») :

- **Tables de Mentor (Ensorceleur) pas dans l'onglet Tables aléatoires**, contrairement à
  l'idée que Tristan avait évoquée — le composant de table générique afficherait un badge
  « d5 » trompeur (tranches 2d6 irrégulières, pas un dé uniforme). Laissées uniquement dans
  la fiche du PJ concerné. À confirmer : ce choix convient, ou il faut un affichage dédié
  dans Tables aléatoires malgré tout ?
- **Catastrophes diaboliques**, **Origines diaboliques** et les **46 sorts de sorcière**
  (Cursed Scroll #1) sont documentés dans `docs/REGLES-CREATION-PERSONNAGE.md` mais **pas
  implémentés** cette nuit (hors scope initial : juste les 3 classes + mentors).
- **11 classes de plus trouvées dans Cursed Scroll #2 à #6** et implémentées (Cavalier du
  désert, Combattant de l'arène, Ras-Godai, Loup des mers, Augure, Guerrier basilic, Rôdeur,
  Fouilleur, Corrompu, Barde, Duelliste — 18 classes au total dans l'appli désormais). Points
  à trancher :
  - **Talent 10-11 du Loup des mers illisible à l'extraction** (Cursed Scroll #3 p.10) —
    valeur provisoire posée dans le code, marquée explicitement ; **à vérifier dans le PDF
    original avant utilisation en jeu.**
  - Deux mini-tables lues mais pas implémentées, comme les Catastrophes diaboliques :
    « Lotus noir » (Ras-Godai, d12, Cursed Scroll #2 p.15) et « Corruption » (Corrompu, d10,
    Cursed Scroll #5 p.12).
  - **Traductions françaises non officielles** pour les 6 classes venant des numéros anglais
    (Cursed Scroll #4-6) et leurs titres — noms choisis cette nuit sans référence VF
    existante pour ces suppléments tiers, à valider ou changer.
  - 18 classes dans un seul menu déroulant sur la fiche PJ (`formPC`) — pas encore
    réorganisé par source/thème ; à voir si ça reste lisible une fois toutes les campagnes
    de Tristan dessus, ou si un regroupement (classes de base / Cursed Scroll #1 / #2-3 /
    #4-6) vaudrait le coup visuellement.

## Créatures — tag de source/extension

Demande de Tristan (2026-08-12) : chaque Cursed Scroll a aussi son propre bestiaire, et il
veut que ces créatures soient ajoutées à la collection Créatures — mais taguées pour
pouvoir retrouver de quelle extension elles viennent.

Concrètement, un champ **« source »** par créature, en plus du flag existant `manual`/
`imported` (qui distingue déjà homebrew vs tiers, mais pas *de quel* tiers) :
- Livre de base Shadowdark
- Cursed Scroll #1 à #6 (six numéros identifiés, cf. section « Nuit du 2026-08-12 »
  ci-dessus pour le détail des PDF déjà fournis)
- Au moins un futur PDF de bestiaire supplémentaire, encore à fournir par Tristan plus
  tard — le champ doit donc rester une valeur libre/extensible, pas une liste figée à 7
  entrées

**Pas prêt à implémenter :** dépend du chantier Cursed Scroll en cours (compilation des 6
numéros, cf. section précédente) — le contenu source (créatures des bestiaires) n'est pas
encore entièrement compilé, et un PDF supplémentaire reste à venir. Une fois ce contenu
disponible, les créatures qu'il contient devront être ajoutées à la collection Créatures
avec le bon tag de source. Note de backlog seulement, rien à coder pour l'instant.

## PJ — création de personnage scriptée (assistant pas-à-pas) — implémenté le 2026-08-12

**Demande de Tristan (2026-08-12).** Aujourd'hui, la création d'un PJ est soit entièrement
manuelle (`formPC()`, un seul long formulaire, tout est retapé à la main, aucun jet de dé),
soit entièrement automatique (`generateRandomPC()`, un bouton qui tire tout d'un coup et crée
la fiche complète). Tristan veut un entre-deux : un **assistant pas-à-pas** qui pose les
questions dans l'ordre (ascendance, puis classe, puis les étapes suivantes) et fait les jets
« au fur et à mesure » plutôt que tout d'un bloc — et, séparément, que la fiche déjà créée
garde la possibilité de **retaper à la main OU relancer un jet au hasard, champ par champ**
(nom, PV, etc.), le tout branché sur la collection Tables aléatoires déjà en place.

**Implémenté (2026-08-12), validé par Tristan avant construction.** Voir `docs/AUDIT.md`,
section « PJ — assistant de création pas-à-pas », pour le détail complet (moteur de tirage
par champ, assistant pas-à-pas, boutons de relance, tests). Cases à cocher ci-dessous mises à
jour en conséquence.

### Existant repéré dans `index.html`

- **`formPC()`** (~l.2588-2653) : formulaire unique, tous les champs en saisie libre ou menu
  déroulant fermé (Ascendance/Classe via `ASCENDANCES`/`PC_CLASSES`, obligatoire pour que les
  règles de classe s'affichent correctement ensuite). **Aucun bouton de jet de dé nulle part
  dans ce formulaire** — PV, CA, caractéristiques, tout est tapé à la main. Un seul
  comportement dynamique existant : le champ Mentor apparaît/disparaît en direct selon la
  classe choisie (l.2645-2652) — c'est le seul embryon de logique « pas-à-pas » déjà présent.
- **`generateRandomPC()`** (~l.2475-2570) : à l'inverse, fait TOUT d'un coup, dans cet ordre :
  classe → alignement → ascendance → caractéristiques (3d6×6, relance si aucune ≥14, règle
  p.15) → PV → talent (2d6) → langues → origine → nom → divinité (si Prêtre) → mentor (si
  Ensorceleur) → sorts connus (si caster) → or → CA → emplacements d'inventaire — puis crée
  directement la fiche `db.pcs`, sans jamais rien montrer à l'utilisateur avant la fin.
  **C'est déjà, presque au mot près, la séquence que Tristan décrit** — mais comme une boîte
  noire plutôt qu'un flux visible et interruptible. Note : l'ordre actuel commence par la
  **classe**, pas l'ascendance — Tristan a dit vouloir l'ascendance en premier ; à confirmer
  quel ordre garder (la règle Shadowdark p.15-16 officielle est plutôt Ascendance → Classe →
  Caractéristiques → Historique/talent → Équipement).
- **Constat important, à corriger avant toute autre chose** : Tristan veut que tout soit
  « connecté à toutes les tables aléatoires qu'on a déjà créées, générées, qui sont stockées
  sur le site ». **Ce n'est aujourd'hui vrai qu'à moitié.** `seedCharGenTables()` (~l.2455)
  copie bien les listes Ascendances/Divinités/Langues courantes/Langues rares dans la
  collection `db.tables` (onglet Tables aléatoires) au premier chargement — mais
  `generateRandomPC()` ne relit **jamais** ces tables une fois seedées : il continue de piocher
  directement dans les constantes JS d'origine (`Object.keys(ASCENDANCES)`, `DIVINITES.filter(...)`,
  `pick(LANGUES_COURANTES)`). Seules **Origines** et **Noms de personnages** passent réellement
  par la table live, via `rollOnAppTable(titre)`. Résultat concret : si le MJ ajoute, modifie ou
  supprime une entrée dans la table « Ascendances » via l'onglet Tables aléatoires, ce
  changement **n'a aucun effet** sur ce que génère le bouton — les deux sources ne restent
  synchronisées que parce qu'elles partent identiques au premier seed, pas parce qu'elles sont
  réellement reliées.
- **`rollOnAppTable(titre)`** (~l.2470) : l'unique pont existant entre générateur et table live.
  Limité : ne gère que les tables `kind:"static"` (lit `t.rows`), pas les tables `kind:"dynamic"`
  (créatures/PNJ/trésors/sorts piochés ailleurs) — pas un problème pour la génération de PJ en
  l'état, mais à garder en tête si un futur champ doit un jour piocher dans une table dynamique.
- **Aucun bouton « relancer ce champ »** n'existe dans `formPC`/le détail d'un PJ. Le seul
  précédent dans toute l'appli est côté `initiative.js` : un petit bouton dé par ligne
  (`data-init-roll`) qui relance UN SEUL champ (`e.initiative`) et enregistre immédiatement —
  bon gabarit à réutiliser. `rollTalents()` (détail PJ, ~l.2778) relance aussi 2d6 en direct
  pour surligner la ligne de talent correspondante, mais **n'enregistre rien** (affichage
  seulement) — à distinguer du comportement voulu ici (relancer et persister).
- **Caractéristiques stockées en texte libre**, pas en nombre : `p.str` vaut par exemple
  `"14 (+2)"`, parfois juste `"+2"` — `parseAbilityMod()` fait de l'interprétation heuristique
  à l'affichage. Un bouton « relancer les PV » est simple (PV est déjà quasi numérique) ; un
  bouton « relancer telle caractéristique » l'est moins tant que le score n'est pas stocké
  proprement en nombre à côté du modificateur affiché.
- **18 classes** dans un seul menu déroulant plat (`PC_CLASSES`), sans lien formel vers des
  tables d'origine/mentor sauf deux cas codés en dur (Prêtre → filtre `DIVINITES` par
  alignement ; Ensorceleur → tirage `MENTORS`) — pas une relation générique classe→table,
  chaque cas particulier est un `if` séparé dans `generateRandomPC()`.
- **Chantier voisin mais distinct** : la « recette » de tables (section « Tables aléatoires »
  plus haut dans ce fichier, toujours en attente de validation) compose plusieurs tirages de
  tables en un **texte** affiché, sans créer d'entité. L'assistant PJ décrit ici doit au
  contraire **remplir une vraie fiche `db.pcs` champ par champ, avec confirmation/retouche à
  chaque étape** — objectif différent, mais le moteur de tirage (points ci-dessous) peut être
  partagé entre les deux si Tristan le souhaite.

### Ce qu'il faudrait construire (proposition, à valider)

1. **Faire de la collection Tables aléatoires la vraie source unique**, avant toute autre
   chose — sinon l'assistant ne ferait que déplacer le problème actuel dans une interface plus
   jolie. Concrètement : router `generateRandomPC()` (et par cohérence `generateRandomNPC()`,
   qui a le même défaut) sur `rollOnAppTable()`/un équivalent pour Ascendances/Divinités/
   Langues courantes/Langues rares, au lieu des constantes JS directes. Les constantes JS
   restent la source du **contenu par défaut au premier seed**, mais cessent d'être relues
   ensuite.
2. **Un moteur de tirage réutilisable par champ** (`rollField(kind, ...)` ou similaire) qui
   sait : tirer une caractéristique (3d6, avec la règle de relance globale), tirer les PV,
   tirer un talent (2d6 contre la table de la classe), tirer sur une table Tables aléatoires
   par titre (ascendance, origine, nom, divinité, langue), tirer un mentor, tirer les sorts de
   niveau 1 d'une classe. Essentiellement, découper les morceaux déjà écrits dans
   `generateRandomPC()` en fonctions indépendantes rappelables une par une — c'est le
   changement structurant qui permet ensuite à la fois l'assistant pas-à-pas ET les boutons de
   relance individuels de la fiche existante.
3. **Assistant de création pas-à-pas** (nouveau mode, en plus du formulaire manuel actuel, pas
   à sa place — un MJ pressé doit pouvoir garder la saisie directe pour une PNJ minute) :
   étapes successives (ordre à confirmer avec Tristan, cf. remarque plus haut sur Shadowdark
   p.15-16 vs l'ordre actuel du générateur), chaque étape affiche le résultat du tirage avec
   trois choix — Garder / Relancer / Saisir moi-même — avant de passer à la suivante. Étapes
   conditionnelles déjà identifiées dans le code actuel : Mentor seulement si la classe a
   `usesMentor`, Divinité seulement si Prêtre, Sorts seulement si `spellClass` défini.
4. **Boutons de relance champ par champ sur une fiche PJ existante** (détail ou édition) :
   nom (retire sur la table Noms de personnages), PV (relance le dé de vie + mod CON), origine,
   talent — réutilisant le moteur du point 2, sur le même gabarit que le bouton dé
   d'`initiative.js`. Décision d'UX à trancher : sauvegarde immédiate à chaque clic (comme le
   mode édition Cursed Scroll ajouté ce soir) ou geste groupé avec un seul « Enregistrer » final
   (comme le formulaire PJ actuel) — les deux se défendent, mais mélanger les deux logiques
   dans le même formulaire serait déroutant, donc un seul choix cohérent pour tout le
   formulaire PJ.
5. **(Optionnel, plus structurant)** Migrer les caractéristiques d'un texte libre
   (`"14 (+2)"`) vers un score numérique stocké proprement, pour permettre un vrai bouton
   « relancer cette caractéristique » sans réanalyser du texte — nécessite une migration douce
   des PJ déjà créés (garder `parseAbilityMod()` en compatibilité descendante). Peut être fait
   après coup si Tristan préfère avancer sans ce chantier-là dans un premier temps ; sans lui,
   la relance reste possible mais un peu plus fragile (regénère la chaîne texte en entier).

### Décisions à prendre par Tristan avant implémentation

- **Ordre des étapes de l'assistant** : celui que tu as décrit (Ascendance → Classe → …) ou
  l'ordre officiel Shadowdark (Ascendance → Classe → Caractéristiques → Historique/talent →
  Équipement) ou l'ordre actuel du code (Classe → Alignement → Ascendance → …) ? Les trois sont
  différents.
- **L'assistant remplace-t-il le bouton « Générer un PJ aléatoire » actuel**, ou coexiste avec
  lui (génération instantanée pour un PNJ minute vs assistant pour un vrai PJ de joueur) ?
- **Le formulaire manuel `formPC()` reste-t-il tel quel en parallèle**, avec juste des boutons
  de relance ajoutés dessus, ou l'assistant le remplace-t-il complètement pour la création ?
- **Sauvegarde immédiate vs groupée** pour les boutons de relance sur une fiche existante (voir
  point 4 ci-dessus).
- **Portée** : uniquement les PJ (comme demandé), ou le même moteur doit-il aussi moderniser
  `generateRandomNPC()` (structurellement identique, même défauts) ? Pas nécessaire pour
  répondre à la demande initiale, mais partagerait le travail du point 2.

### Hors scope pour ce chantier (déjà backlog ailleurs)

- Le regroupement des 18 classes par source dans le menu déroulant (section « Nuit du
  2026-08-12 » plus haut) — indépendant, peut être fait avant, après ou en même temps.
- Le tag de source des créatures — sans rapport direct.
- La « recette » de tables (composition en texte, sans créer d'entité) — chantier voisin déjà
  décrit plus haut, pas un prérequis strict pour celui-ci mais pourrait partager le moteur de
  tirage du point 2 si les deux sont faits dans la foulée.

- [x] Valider l'ordre des étapes et les autres décisions listées ci-dessus avec Tristan
      (2026-08-12) : ordre officiel Shadowdark (Ascendance → Classe → Caractéristiques →
      Historique/Talent → Équipement) ; coexistence des 3 boutons de création (assistant,
      génération instantanée, formulaire manuel) ; sauvegarde différée partout (un seul
      bouton Enregistrer, jamais de sauvegarde au clic sur un bouton de relance). Détail
      complet et points laissés à discrétion dans `docs/AUDIT.md`, section « PJ — assistant
      de création pas-à-pas ».
- [x] Router `generateRandomPC()` sur les tables live plutôt que les constantes JS
      (Ascendances, Divinités, Langues courantes, Langues rares) — déjà fait avant cette
      session (`6678621`/`08a8de9`), reconfirmé avant de construire dessus.
      `generateRandomNPC()` volontairement laissé de côté (hors scope, décision de Tristan).
- [x] Extraire un moteur de tirage par champ réutilisable depuis `generateRandomPC()`
      (2026-08-12) — voir `docs/AUDIT.md`.
- [x] Construire l'assistant de création pas-à-pas (nouveau mode UI) (2026-08-12) — bouton
      « 🧭 Créer un personnage » dans l'onglet PJ, voir `docs/AUDIT.md`.
- [x] Ajouter les boutons de relance champ par champ sur la fiche PJ existante (2026-08-12) —
      dans `formPC()`, voir `docs/AUDIT.md`.
- [ ] (Optionnel) Migrer les caractéristiques vers un score numérique structuré — pas fait,
      pas nécessaire : les boutons de relance fonctionnent très bien sur le format texte
      actuel (`"14 (+2)"`). Reste une amélioration possible si un besoin plus précis émerge
      plus tard (ex. calculs mécaniques directs sur le score).
- [x] Test fonctionnel réel une fois implémenté (2026-08-12) — bac à sable local (serveur
      statique + session MJ simulée), voir le détail dans `docs/AUDIT.md`. `outils/
      audit-check.sh` bloqué sur l'étape Python (non installée dans ce shell) mais l'étape 1
      (syntaxe JS de chaque bloc `<script>`) confirmée OK par un vérificateur équivalent.

## Tables aléatoires — risque de doublons par course entre sessions concurrentes

**Constat (2026-08-13)**, suite à un nettoyage de 13 tables dupliquées dans `db.tables`
(détail dans `docs/AUDIT.md`) : `ensure()` (utilisé par `seedCharGenTables()`,
`seedShadowdarkDefaultTables()`, `seedCursedScrollTables()`) déduplique par titre en lisant
`db.tables` **en mémoire côté client**, sans contrainte d'unicité côté serveur. Si deux
sessions démarrent l'appli à quelques secondes d'écart (deux onglets, deux appareils, MJ +
un joueur), chacune peut décider indépendamment qu'une table "manque" avant de voir la
sauvegarde de l'autre — les deux créent alors leur propre copie. Le nettoyage fait ce soir
règle les doublons existants, mais **pas la cause** : rien n'empêche que ça se reproduise.

**Pas fait ce soir** (pas demandé, chantier à part) — pistes possibles à discuter avec
Tristan si ça redevient gênant :
- Contrainte SQL `UNIQUE` sur `(data->>'title')` côté table Supabase `tables`, avec gestion
  du conflit (upsert `on conflict do nothing` plutôt qu'un insert simple).
- Verrou applicatif côté client (peu fiable sans coordination serveur).
- Accepter le risque et proposer un bouton MJ "Vérifier les doublons" dans l'appli plutôt
  qu'une prévention automatique (plus simple, cohérent avec le vérificateur de liens brisés
  déjà existant).

- [ ] Décider avec Tristan si ce risque mérite un correctif de fond, ou si un nettoyage
      manuel occasionnel (comme celui fait ce soir) suffit.
