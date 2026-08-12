# Règles de création de personnage — Shadowdark Codex

Référence pour le générateur aléatoire de PJ/PNJ de l'application (boutons « 🎲 Générer »
dans les onglets PJ et PNJ). Les règles ci-dessous viennent du **Quickstart Joueur
(p.12-31)** ; les éléments marqués **[maison]** sont des ajouts inventés pour combler ce
que le Quickstart ne détaille pas (l'équipement précis est p.32, non fourni).

Implémenté dans `index.html`, section `GÉNÉRATION ALÉATOIRE DE PJ` (constantes
`CLASSES_DATA`, `ASCENDANCES`, `TITRES`, `DIVINITES`, `ORIGINES_ROWS`, etc.).

**Refonte 2026-08-11 [maison]** : Ascendance et Classe sont des listes fermées (menus
déroulants) sur la fiche PJ — plus de texte libre — pour que les règles de classe/ascendance
ci-dessous se calculent **toujours en direct** depuis `p.cls`/`p.ancestry` sur la fiche
détail (armes, armures, capacités, sorts connus, DD d'incantation, table de talents 2d6),
y compris pour un PJ créé à la main. Changer la classe d'un PJ met tout à jour
instantanément — rien n'est plus figé en texte à la création. Les dénominations raciales
(Nain, Elfe, Gobelin…) ont été retirées à la demande de Tristan : l'identité d'un
personnage passe désormais uniquement par son portrait/illustration, pas par une race.

## Personnage de 1er niveau — ce qu'il faut déterminer

Une origine, des caractéristiques, une ascendance au choix, une classe au choix, un jet de
talent de classe, des PV (dé de vie de la classe + mod. CON, minimum 1), un titre, un
alignement au choix, et 2d6 × 5 pièces d'or pour l'équipement de départ.

## Caractéristiques

3d6 dans l'ordre : FOR, DEX, CON, INT, SAG, CHA. Si aucune n'est ≥ 14, on peut relancer
toute la série une fois (le générateur applique cette règle automatiquement).

Modificateur : 1-3 → −4 · 4-5 → −3 · 6-7 → −2 · 8-9 → −1 · 10-11 → 0 · 12-13 → +1 ·
14-15 → +2 · 16-17 → +3 · 18+ → +4.

**Classe d'armure** = 10 + mod. DEX (l'armure portée la modifie, non gérée par l'appli).

**Emplacements d'inventaire** = le plus élevé entre 10 et la valeur de Force (le score,
pas le modificateur), + mod. CON (s'il est positif) pour un Guerrier (talent *Bête de
somme*).

## Ascendances (d12) [maison, sans dénomination raciale depuis 2026-08-11]

Plus aucune race (Nain/Elfe/Gobelin...) : chaque ascendance n'est qu'un trait mécanique
générique, choisi librement ou tiré au hasard parmi 12. Les 6 premières reprennent
exactement les anciens traits raciaux (renommés) ; les 6 suivantes sont de nouveaux traits
fournis par Tristan. Les langues ne dépendent plus de l'ascendance (voir section Langues
ci-dessous).

| Ascendance | Trait |
|---|---|
| Puissance | +1 aux jets d'attaque en corps à corps |
| Yeux perçants | +1 attaques à distance OU +1 tests d'incantation (l'appli choisit incantation si la classe lance des sorts) |
| Sens aiguisés | impossible à prendre par surprise |
| Discret | invisible 3 rounds, 1×/jour |
| Ambitieux | jet de talent de classe supplémentaire au 1er niveau |
| Robuste | +2 PV ; avantage sur le dé de PV gagné par niveau |
| Rapide | utilise Dextérité au lieu de Force pour les attaques au corps à corps |
| Géant | avantage aux jets de Force, désavantage aux jets de Discrétion |
| Minuscule | désavantage aux jets de Force, avantage aux jets de Discrétion |
| Envoûtant | +1 aux jets d'interaction sociale |
| Prédestiné | peut relancer un jeton de chance dépensé, doit accepter le second résultat |
| Athlétique | avantage aux jets de course, de saut et d'escalade |

## Classes (4 de base)

### Guerrier — dé de vie 1d8
Armes : toutes. Armures : toutes + boucliers.
Capacités : *Maîtrise des armes* (+1 attaque/dégâts avec un type d'arme + moitié niveau),
*Cran* (avantage FOR/DEX contre une force opposée), *Bête de somme* (mod. CON en
emplacements d'inventaire).

Talents 2d6 : 2 → arme supplémentaire maîtrisée · 3-6 → +1 attaques dist./corps à corps ·
7-9 → +2 FOR/DEX/CON · 10-11 → +1 CA (type d'armure choisi) · 12 → talent ou +2 à
répartir.

### Prêtre — dé de vie 1d6
Armes : gourdin, arbalète, dague, masse d'armes, épée longue, bâton, marteau de guerre.
Armures : toutes + boucliers.
Capacités : *Divinité* (dieu correspondant à l'alignement + symbole sacré), *Incantation*
(2 sorts de rang 1 connus), + sort **Renvoi des morts-vivants** offert (ne compte pas dans
les sorts connus).

Talents 2d6 : 2 → avantage pour lancer un sort connu · 3-6 → +1 attaques dist./corps à
corps · 7-9 → +1 tests d'incantation · 10-11 → +2 FOR/SAG · 12 → talent ou +2 à répartir.

### Voleur — dé de vie 1d4
Armes : gourdin, arbalète, dague, arc court, épée courte. Armures : cuir, mithral.
Capacités : *Attaque sournoise* (dé d'arme supplémentaire + 1/2 niveau contre cible
surprise), *Compétences de voleur* (avantage : Grimper, Discrétion, Déguisement,
Pièges, tâches délicates/crochetage).

Talents 2d6 : 2 → avantage initiative (relance si déjà obtenu) · 3-5 → +1 dé de dégâts en
sournoise · 6-9 → +2 FOR/DEX/CHA · 10-11 → +1 attaque corps à corps/distance · 12 →
talent ou +2 à répartir.

### Magicien — dé de vie 1d4
Armes : dague, bâton. Armure : aucune.
Capacités : *Incantation* (3 sorts de rang 1 connus), *Apprentissage des sorts* (apprendre
un sort via parchemin, test INT ND 15). Langues : +2 courantes, +2 rares.

Talents 2d6 : 2 → objet magique aléatoire · 3-7 → +2 INT ou +1 incantation · 8-9 →
avantage pour lancer un sort connu · 10-11 → sort supplémentaire d'un rang maîtrisé ·
12 → talent ou +2 à répartir.

## Classes additionnelles — Cursed Scroll #1 (2026-08-12, implémentées)

Trouvées dans le supplément **Cursed Scroll #1** (thème « diablerie », VF) fourni par
Tristan. Les 3 classes ci-dessous sont maintenant dans `CLASSES_DATA`/`PC_CLASSES`/
`TITRES`, testées en bac à sable (classe assignable, section Classe calculée en direct,
génération aléatoire, fiche imprimable) — même mécanique que les 4 classes de base.

### Chevalier de Saint Ydris — dé de vie 1d6 (Cursed Scroll #1, p.10)
Armes : toutes les armes de corps à corps, arbalète. Armures : toutes + boucliers.
Langues : diabolique.
Capacités : *Possession démoniaque* (3/jour, +1 dégâts pendant 3 rounds + moitié niveau) ;
*Incantation* de sorts de sorcière (via Charisme, DD = 10 + rang×2 — même formule que
l'appli) qui s'ajoutent à mesure des niveaux ; un échec au test d'incantation bloque le
sort jusqu'au repos complet, un 1 naturel déclenche une Catastrophe diabolique (voir plus
bas).

Talents 2d6 : 2 → +1 au bonus de possession démoniaque · 3-6 → +1 attaques dist./corps à
corps · 7-9 → +2 FOR/DEX/CON · 10-11 → +2 CHA ou +1 incantation sorcière · 12 → talent ou
+2 à répartir.

### Ensorceleur — dé de vie 1d6 (Cursed Scroll #1, p.12)
Armes : gourdin, arbalète, dague, masse d'armes, épée longue. Armures : cuir, mithral +
boucliers. Langues : céleste, diabolique, draconique, originel ou sylvestre (au choix).
Capacités : *Mentor* — choisit un patron (voir section Mentors ci-dessous) qui est la
**seule** source de ses pouvoirs ; le mentor peut accorder ou retirer ses bienfaits à tout
moment (le personnage peut donc perdre des capacités en jeu, pas juste en gagner).

Talents 2d6 : 2 → tire un Bienfait de mentor d'un autre mentor que le sien · 3-6 → +1 à
deux caractéristiques différentes · 7-9 → +1 attaques dist./corps à corps · 10-11 → tire
deux Bienfaits de mentor et garde celui qu'il préfère · 12 → talent ou +2 à répartir.
**Contrairement aux 3 autres classes, la case « 1er niveau » de cette table n'est pas un
talent fixe : c'est directement un Bienfait de mentor** (voir plus bas). Le générateur
aléatoire ne peut pas demander au joueur, donc il **tire le mentor au hasard** parmi les 6
(`p.mentor`) ; modifiable ensuite via un menu déroulant sur la fiche. La section Classe de
la fiche affiche la table de Talents d'ensorceleur **et** la table de Bienfaits du mentor
choisi, l'une sous l'autre.

### Sorcière — dé de vie 1d4 (Cursed Scroll #1, p.14)
Armes : dague, bâton. Armure : cuir. Langues : diabolique, originel, sylvestre.
Capacités : *Familier* (petit animal parlant, source des sorts — la portée se calcule
depuis lui ; s'il meurt, on peut le ranimer en sacrifiant définitivement 1d4 PV) ;
*Incantation* (3 sorts de rang 1 connus, via Charisme, DD = 10 + rang×2, même mécanique
d'échec/Catastrophe diabolique que le Chevalier de Saint Ydris).

Talents 2d6 : 2 → téléportation 1/jour jusqu'au familier (à la place du déplacement) ·
3-7 → +2 CHA ou +1 incantation sorcière · 8-9 → avantage pour lancer un sort connu ·
10-11 → sort supplémentaire d'un rang maîtrisé · 12 → talent ou +2 à répartir.

### Titres (Cursed Scroll #1)

| Niveau | Chevalier de Saint Ydris (L / C / N) | Ensorceleur (L / C / N) | Sorcière (L / C / N) |
|---|---|---|---|
| 1-2 | Arbitre / Traître / Frère-Sœur | Favorisé / Marqué / Élu | Voyante / Chuchoteuse / Chamane |
| 3-4 | Exécuteur / Déchu / Exorciste | Héraut / Zélote / Incantateur | Augure / Malfaisante / Conjuratrice |
| 5-6 | Chevalier Maréchal / Parjure / Révérend Chevalier | Éminence / Occultiste / Annoncé | Prophète / Guenaude-Ancien / Devineresse |
| 7-8 | Juge / Garde Noir / Inquisiteur | Exalté / Champion / Transcendant | Sagace / Mégère-Oncle / Médiatrice |
| 9-10 | Pourvoyeur de justice / Seigneur démon / Grand Inquisiteur | Incarnation / Annonciateur / Avatar | Baba (identique aux 3 alignements) |

### Mentors (Cursed Scroll #1, p.17-19)

Système propre à l'Ensorceleur (obligatoire) — les autres classes n'y touchent pas dans
le texte lu. 6 mentors, chacun avec sa **propre** table de Bienfaits 2d6 (2 / 3-7 / 8-9 /
10-11 / 12, la case 12 étant toujours « choisissez une option ou +2 à répartir ») :

- **Almazzat** — archidémon à tête de loup. Thème corps-à-corps/Force.
- **Kytheros** — Seigneur du Temps. Thème prémonition/Sagesse (peut forcer une relance du MJ).
- **Mugdulblub** — « l'Antique Vase ». Thème transformation/résistance aux éléments.
- **Shune l'Infâme** — déesse des secrets (déjà une divinité connue de l'appli, alignement
  chaotique). Thème savoir/Intelligence, apprend un sort de magicien.
- **Titania** — reine des fées. Thème charme/Charisme, hypnose.
- **L'Homme-Saule** — être des forêts embrumées. Thème peur/téléportation courte.

Implémenté en constante `MENTORS` (nom, description, table de 5 lignes 2d6) dans
`index.html`, plus le champ `p.mentor` sur le PJ.

**Écart volontaire par rapport à l'idée initiale de Tristan** (« les tables de mentor
seront peut-être dans les tables aléatoires ») : ne PAS les seeder dans l'onglet Tables
aléatoires — ce modèle générique affiche un badge `d{nombre de lignes}` (donc « d5 » ici),
ce qui serait faux (les tranches sont 2d6 irrégulières : 2/3-7/8-9/10-11/12, pas un d5
uniforme) et pourrait induire en erreur en jeu. Les 6 tables restent donc uniquement dans
`MENTORS`, affichées sur la fiche du PJ concerné selon son `p.mentor` — **à confirmer avec
Tristan le matin : ça lui va, ou il veut quand même un accès depuis Tables aléatoires
(auquel cas il faudra un affichage dédié, pas le composant Table générique) ?**

### Catastrophes diaboliques (Cursed Scroll #1, p.22-23)

Déclenchées par un **1 naturel** au test d'incantation d'un sort de sorcière (Chevalier de
Saint Ydris, Ensorceleur via Bienfait, Sorcière). Deux tables **d12**, une par tranche de
rang :

- **Rangs 1-3** : effets mineurs (dégâts par rang de sort, transformation temporaire en
  salamandre, incapacité de relancer ce sort une semaine, perte d'un objet...).
- **Rangs 4-5** : effets sévères (dégâts plus lourds, invocation hostile de l'Homme-Saule,
  paralysie, catatonie 1h, ou un « ennemi juré » qui naît quelque part...).

Un résultat de 1 sur l'une ou l'autre table dit de tirer deux fois et de combiner les
effets. Table complète dans le PDF si besoin de la recopier mot à mot.

### Origines diaboliques (d20, Cursed Scroll #1, p.20)

Variante thématique de la table Origines existante (Ermite, Paria, Né dans les bois,
Amnésique, Hanté, Fugitif, Touché par les fées, Sang de sorcière, Cueilleur, Rédempteur,
Marqué, Sacrifice, Naufragé, Déchu, Attiré, Ascète, Enfant-loup, Guérisseur, Élu, Rejeton
de démon) — à ajouter comme table alternative, pas un remplacement de la table Origines
de base.

### Sorts de sorcière (liste seule lue, pas encore importés)

46 sorts (rang 1 : 10, rang 2 : 10, rang 3 : 10, rang 4 : 8, rang 5 : 8), texte complet
p.26+ du PDF. **Bonne nouvelle** : `SPELL_CLASSES` dans `index.html` a déjà une entrée
`witch` (libellée « Sorcier ») jamais utilisée — importer ces sorts avec `class:"witch"`
fonctionnerait sans aucune modification de code, exactement comme l'import des reliques
du Trésor cette session. Reste à faire : décider si on renomme le libellé en « Sorcière »
avant import, et faire la passe d'import (contenu de campagne, donc en Supabase via
Claude in Chrome, pas dans ce dépôt — même workflow que les reliques).

## Classes additionnelles — Cursed Scroll #2 à #6 (2026-08-12, implémentées)

Même nuit, même méthode (`pdftotext`, lecture intégrale avant implémentation) — Tristan a
demandé de vérifier les 5 autres numéros du zine pour d'éventuelles classes et de tout
intégrer d'un coup. Détail complet (armes/armures/capacités/talents 2d6) dans
`CLASSES_DATA`/`TITRES` (`index.html`) ; résumé ci-dessous. Les 3 derniers numéros (#4-6)
sont en anglais dans l'édition fournie — **noms de classe traduits par mes soins, pas de VF
officielle disponible pour ces suppléments tiers.**

| Classe | Source | Dé de vie | Spécificité principale |
|---|---|---|---|
| Cavalier du désert | CS#2 « Sables rouges » | 1d8 | Monture fidèle (chameau/cheval), talent Charge |
| Combattant de l'arène | CS#2 | 1d8 | Résistant (Implacable/Jusqu'au bout/Inébranlable) |
| Ras-Godai | CS#2 | 1d6 | Assassin + table « Lotus noir » (d12, **non modélisée**) |
| Loup des mers | CS#3 « Soleil de minuit » | 1d8 | Choix quotidien d'un Ancien dieu (Odin/Freya/Loki) |
| Augure | CS#3 | 1d6 | Incantation (`spellClass:"seer"`, déjà présent dans `SPELL_CLASSES`, jamais utilisé avant ce soir), 1 sort connu au 1er niveau |
| Guerrier basilic | CS#4 « River of Night » | 1d8 | Regard pétrifiant (ND CON 15) |
| Rôdeur | CS#4 | 1d8 | Herboristerie (table de remèdes ND11-15 repliée dans le texte de capacité) |
| Explorateur | CS#5 « Dwellers in the Deep » | 1d6 | Pilleur (récupère les consommables épuisés sur 5-6 au d6) |
| Corrompu | CS#5 | 1d6 | Pseudopode (arme naturelle) + table « Corruption » (d10, **non modélisée**) |
| Barde | CS#6 « City of Masks » | 1d6 | Fascination (hypnose de zone), Dilettante magique (active parchemins/baguettes au CHA) |
| Duelliste | CS#6 | 1d8 | Beau parleur, Parade, Provocation |

**Écarts/incertitudes à vérifier** (voir aussi `docs/TODO.md`) :
- **Talent 10-11 du Loup des mers** (CS#3 p.10) : le texte extrait du PDF pour cette tranche
  est illisible/manquant (`pdftotext` a fusionné deux blocs). Valeur provisoire mise en
  place (« +1 aux attaques à distance ou de corps à corps ») — **à vérifier dans le PDF
  original avant utilisation en jeu.**
- Tables « Lotus noir » (Ras-Godai) et « Corruption » (Corrompu) lues et documentées dans
  le PDF mais **pas implémentées** — même décision que les Catastrophes diaboliques de
  Cursed Scroll #1 (hors scope de cette nuit).
- Traductions de classe (Guerrier basilic, Rôdeur, Explorateur, Corrompu, Barde, Duelliste)
  et de titres sont des choix éditoriaux faits cette nuit, pas une VF officielle — à
  valider/ajuster si Tristan préfère d'autres noms. **Correction de Tristan (2026-08-12) :**
  « Fouilleur »/« Charognard » (Delver, CS#5) renommés en « Explorateur »/« Pilleur ».

## Sorts connus au 1er niveau

| Classe | Rang 1 connus |
|---|---|
| Prêtre | 2 (+ Renvoi des morts-vivants offert) |
| Magicien | 3 |

Le générateur pioche au hasard parmi les sorts déjà importés dans l'onglet Sorts
(`db.spells`, filtrés par classe = `priest`/`wizard` et rang = 1) et les relie en
`[[lien]]`.

## Titres (niveau 1-2)

| Classe | Loyal | Chaotique | Neutre |
|---|---|---|---|
| Guerrier | Écuyer | Canaille | Combattant |
| Prêtre | Acolyte | Initié | Cheminant |
| Voleur | Voleur de grand chemin | Malfrat | Cagoulard |
| Magicien | Apprenti | Adepte | Chaman |

(La table complète 1-2/3-4/5-6/7-8/9-10 par classe est dans `TITRES` du code.)

## Alignement

Loyal, Neutre ou Chaotique — au choix (le générateur tire au hasard).

## Langues [maison, revu 2026-08-11]

Plus liées à l'ascendance (supprimée avec les races). Le générateur donne à chaque PJ la
langue commune + 1 langue courante tirée au hasard ; les bonus de langues liés à la classe
(ex. Magicien : +2 courantes, +2 rares) s'ajoutent par-dessus, inchangés. Champ « Langues »
libre sur la fiche, modifiable à la main ensuite.

Courantes (d9, en plus de la langue commune) : Elfique, Géant, Gobelin, Langue naine,
Merran, Orque, Reptilien, Sylvestre, Thanien.
Rares (d4) : Céleste, Diabolique, Draconique, Originel.

## Divinités

| Nom | Alignement |
|---|---|
| Sainte Terragnis | Loyale |
| Madeera l'Alliance | Loyale |
| Gede | Neutre |
| Ord | Neutre |
| Memnon | Chaotique |
| Ramlaat | Chaotique |
| Shune l'Infâme | Chaotique |

Le générateur choisit une divinité dont l'alignement correspond à celui du PJ prêtre.

## Origines (d20)

Table complète des 20 origines (Gamin des rues, Recherché, Initié d'une secte, Guilde des
voleurs, Banni, Orphelin, Apprenti magicien, Joaillier, Herboriste, Barbare, Mercenaire,
Marin, Acolyte, Soldat, Forestier, Éclaireur, Ménestrel, Érudit, Noble, Chirurgien) — voir
`ORIGINES_ROWS` dans le code, et la table « Origines » créée dans l'onglet Tables
aléatoires.

## Tables créées automatiquement dans l'onglet « Tables aléatoires »

Le générateur les crée à la volée si elles n'existent pas encore (et les réutilise —
donc éditables — sinon) :

- **Origines** (d20) — Quickstart p.14.
- **Ascendances** (d12) — **[maison depuis 2026-08-11]**, traits génériques sans race, voir
  plus haut (inspiré des traits du Quickstart p.16-17, mais renommé/étendu).
- **Langues courantes** (d9) — Quickstart p.29.
- **Langues rares** (d4) — Quickstart p.29.
- **Divinités** (d7) — Quickstart p.30-31.
- **Noms de personnages** — **[maison]**, non issue du livre.
- **Ambitions de PNJ** — **[maison]**, 22 entrées génériques et courtes (attiré par l'or,
  envie d'aventure, soif de vengeance…), non issue du livre.
- **Moyens de PNJ** — **[maison]**, comment le PNJ compte parvenir à son ambition
  (négociation, violence, marchandage, diplomatie, patience, ruse…), non issue du livre.
- **Armes de base** — **[maison]**, dégâts approximatifs (le Quickstart ne détaille pas
  l'équipement, cf. p.32 non fourni).

## Génération de PNJ (simplifiée)

Contrairement au PJ, le PNJ n'a pas de classe/ascendance/niveau. Le générateur tire
seulement :

- Les 6 caractéristiques (3d6, pas de règle de relance).
- PV = 1d6 + mod. CON (minimum 1). CA = 10 + mod. DEX.
- Un nom (table « Noms de personnages »).
- Une ambition (table « Ambitions de PNJ », stockée dans le champ Objectif).
- Un moyen d'y parvenir (table « Moyens de PNJ », stocké dans le champ Moyens).
- Une arme de base (table « Armes de base »).
- 1 chance sur 6 (1d6 = 1) d'être lanceur de sorts : classe tirée au hasard parmi
  Prêtre/Magicien/Sorcière, et 1d3 sorts de rang 1 piochés dans `db.spells`.

## Fiche PJ imprimable (PDF)

Une page A4 par PJ (bouton « 🖨 Imprimer » dans l'onglet PJ ou sur une fiche). Inspirée de
la fiche vierge fournie (`SHD_FichePersonnage.pdf`) sans reproduire la grille exacte
case par case (les textes générés sont plus longs qu'une fiche à main levée). L'inventaire
imprimé est une liste numérotée avec des lignes vides à compléter jusqu'au nombre
d'emplacements calculé.
