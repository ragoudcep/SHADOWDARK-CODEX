# Règles de création de personnage — Shadowdark Codex

Référence pour le générateur aléatoire de PJ/PNJ de l'application (boutons « 🎲 Générer »
dans les onglets PJ et PNJ). Les règles ci-dessous viennent du **Quickstart Joueur
(p.12-31)** ; les éléments marqués **[maison]** sont des ajouts inventés pour combler ce
que le Quickstart ne détaille pas (l'équipement précis est p.32, non fourni).

Implémenté dans `index.html`, section `GÉNÉRATION ALÉATOIRE DE PJ` (constantes
`CLASSES_DATA`, `ASCENDANCES`, `TITRES`, `DIVINITES`, `ORIGINES_ROWS`, etc.).

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

## Ascendances (d6)

| Ascendance | Langues | Trait |
|---|---|---|
| Demi-Orque | commune, orque | **Puissance** — +1 aux jets d'attaque en corps à corps |
| Elfe | commune, elfique, sylvestre | **Yeux perçants** — +1 attaques à distance OU +1 tests d'incantation (l'appli choisit incantation si la classe lance des sorts) |
| Gobelin | commune, gobelin | **Sens aiguisés** — impossible à prendre par surprise |
| Halfelin | commune | **Discret** — invisible 3 rounds, 1×/jour |
| Humain | commune + 1 langue courante | **Ambitieux** — jet de talent de classe supplémentaire au 1er niveau |
| Nain | commune, naine | **Robuste** — +2 PV ; avantage sur le dé de PV gagné par niveau |

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

## Langues

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
- **Ascendances** (d6) — Quickstart p.16-17.
- **Langues courantes** (d9) — Quickstart p.29.
- **Langues rares** (d4) — Quickstart p.29.
- **Divinités** (d7) — Quickstart p.30-31.
- **Noms de personnages** — **[maison]**, non issue du livre.
- **Ambitions de PNJ** — **[maison]**, non issue du livre.
- **Armes de base** — **[maison]**, dégâts approximatifs (le Quickstart ne détaille pas
  l'équipement, cf. p.32 non fourni).

## Génération de PNJ (simplifiée)

Contrairement au PJ, le PNJ n'a pas de classe/ascendance/niveau. Le générateur tire
seulement :

- Les 6 caractéristiques (3d6, pas de règle de relance).
- PV = 1d6 + mod. CON (minimum 1). CA = 10 + mod. DEX.
- Un nom (table « Noms de personnages »).
- Une ambition (table « Ambitions de PNJ », stockée dans le champ Objectif).
- Une arme de base (table « Armes de base »).
- 1 chance sur 6 (1d6 = 1) d'être lanceur de sorts : classe tirée au hasard parmi
  Prêtre/Magicien/Sorcière, et 1d3 sorts de rang 1 piochés dans `db.spells`.

## Fiche PJ imprimable (PDF)

Une page A4 par PJ (bouton « 🖨 Imprimer » dans l'onglet PJ ou sur une fiche). Inspirée de
la fiche vierge fournie (`SHD_FichePersonnage.pdf`) sans reproduire la grille exacte
case par case (les textes générés sont plus longs qu'une fiche à main levée). L'inventaire
imprimé est une liste numérotée avec des lignes vides à compléter jusqu'au nombre
d'emplacements calculé.
