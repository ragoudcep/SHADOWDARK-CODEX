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
