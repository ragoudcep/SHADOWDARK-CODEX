# Cursed Scroll #6 — City of Masks (VO) — Référence compacte

Source : `975179835-Cursed-Scroll-6-City-of-Masks-V1-1.pdf` (68 pages, supplément tiers pour
Shadowdark RPG, The Arcane Library, en anglais).

Ce fichier extrait **uniquement** le contenu utile à la création de personnage (classes,
titres, sorts optionnels de sorcier·ère loyal) et aux objets magiques. Tout le lore de ville
(districts, factions, PNJ, rumeurs, tables de bringue narratives, encounters, hameçons
d'aventure) est **volontairement omis** — hors périmètre.

Les classes Barde et Duelliste sont déjà intégrées dans `index.html` (`CLASSES_DATA`,
`PC_CLASSES`, `TITRES`) avec une traduction française non officielle (voir
`docs/AUDIT.md` et `docs/REGLES-CREATION-PERSONNAGE.md`). Le texte ci-dessous reprend le VO
et sa traduction, pour référence complète sans avoir à rouvrir le PDF.

## Classes

### Barde (VO : Bard)

> Les bardes sont des vagabonds bienvenus et de sages conseillers ; leur tâche est de
> protéger et de transmettre le savoir légué par les âges.

- **Armes** : arbalète, dague, masse d'armes, arc court, épée courte, lance, bâton.
- **Armure** : armure de cuir, cotte de mailles, boucliers.
- **Dé de vie** : 1d6 par niveau.
- **Langues** : 4 langues courantes supplémentaires + 1 langue rare.

**Capacités de classe :**

- **Arts du barde (Bardic Arts).** Formé en art oratoire, arts de la scène, érudition et
  diplomatie. Avantage sur les tests liés à ces domaines.
- **Fascination (Fascinate) [Attention/Focus].** Test de CHA ND 12. En cas de réussite, vous
  hypnotisez (« transfix ») toutes les cibles à portée proche dont le niveau est ≤ 1 + la
  moitié de votre niveau (arrondi à l'inférieur). En cas d'échec, vous ne pouvez pas
  réutiliser cette capacité avant un repos — sauf en dépensant votre Attention (Focus).
- **Inspiration (Inspire).** Chaque jour, vous pouvez distribuer un nombre de jetons de
  chance égal à votre modificateur de Charisme (minimum 1).
- **Dilettante magique (Magical Dabbler).** Vous pouvez activer des parchemins de sorts et
  des baguettes en utilisant votre modificateur de Charisme. En cas d'échec critique, vous
  subissez une mésaventure de magicien (roll a wizard mishap).
- **Substitut de talent.** Au lieu de faire un jet de talent, vous pouvez choisir de trouver
  une baguette aléatoire de prêtre ou de magicien (vous choisissez le type).

**Table des talents du Barde (2d6, doublon = relancer) :**

| 2d6 | Effet |
|---|---|
| 2 | Avantage aux tests de temps mort (hors bringue/carousing) |
| 3-6 | +1 aux attaques de corps à corps et à distance, OU +1 aux jets de Fascination |
| 7-9 | +2 points à répartir entre vos caractéristiques |
| 10-11 | +2 aux jets d'événement de bringue (carousing) de votre groupe |
| 12 | Choisissez un talent |

**Titres du Barde (par alignement / palier de niveau) :**

| Niveau | Loyal | Chaotique | Neutre |
|---|---|---|---|
| 1-2 | Conteur (Storyteller) | — | Chercheur (Seeker) |
| 3-4 | Ménestrel (Balladeer) | Vaurien (Guttersnipe) | Témoin (Witness) |
| 5-6 | Philosophe (Philosopher) | Charlatan | Porte-parole (Speaker) |
| 7-8 | Poète (Poet) | Satiriste (Satirist) | Voix (Voice) |
| 9-10 | Maître Poète (Master Poet) | Langue d'Argent (Silvertongue) | Porteur de vérité (Truthbearer) |
| 9-10 (variante chaotique) | — | Oiseau de mauvais augure (Doomspeaker) | — |

*(Le PDF liste deux titres chaotiques de palier 9-10 : Silvertongue et Doomspeaker — les deux
sont valides, choix libre. `index.html` a retenu Langue d'Argent et Oiseau de mauvais augure.)*

---

### Duelliste (VO : Duelist)

> Escrimeurs virevoltants et beaux parleurs en quête de gloire. Les duellistes distribuent
> insultes et blessures avec panache pour vaincre leurs ennemis.

- **Armes** : dague, toutes les épées.
- **Armure** : armure de cuir, cotte de mailles en mithral.
- **Dé de vie** : 1d8 par niveau.

**Capacités de classe :**

- **Beau parleur (Tale Spinner).** Test de CHA ND 15. En cas de réussite, les inconnus autour
  de vous vous croient célèbre et important pour le reste de l'interaction. Un même individu
  ne peut pas être dupé deux fois par cette capacité.
- **Parade (Parry).** Une fois par jour, une attaque de votre choix qui vous aurait touché
  rate au lieu de toucher.
- **Provocation (Taunt).** Quand un ennemi vous rate avec une attaque, vous avez l'avantage
  sur vos attaques contre cet ennemi au round suivant.

**Table des talents du Duelliste (2d6, doublon = +1 utilisation par jour) :**

| 2d6 | Effet |
|---|---|
| 2 | 1×/jour, toutes les attaques qui vous toucheraient ce round ratent à la place |
| 3-6 | +1 aux attaques de corps à corps et aux dégâts, OU +1 utilisation de Parade par jour |
| 7-9 | +2 en Force, Dextérité ou Charisme |
| 10-11 | Infligez +1d6 dégâts quand vous touchez avec une attaque de Provocation |
| 12 | Choisissez un talent, OU +2 points à répartir entre vos caractéristiques |

**Titres du Duelliste (par alignement / palier de niveau) :**

| Niveau | Loyal | Chaotique | Neutre |
|---|---|---|---|
| 1-2 | — | — | Étudiant (Student) |
| 3-4 | Escrimeur (Fencer) | Voyou (Ruffian) | Challenger |
| 5-6 | — | — | Chat de gouttière (Mouser) |
| 7-8 | Défenseur (Defender) | Provocateur (Heckler) | Panthère (Panther) |
| 9-10 | Mangouste (Mongoose) *ou* Loup (Wolf) *ou* Maître d'armes (Swordmaster) | Vipère (Viper) *ou* Cobra *ou* Maître d'armes (Swordmaster) | Maître d'armes (Swordmaster) |

*(Le tableau VO du PDF liste, pour le palier 9-10, trois titres possibles par camp loyal et
chaotique — Mongoose/Wolf/Swordmaster et Viper/Cobra/Swordmaster respectivement — en plus de
Swordmaster côté neutre. `index.html` n'en retient qu'un par camp : Mangouste (loyal), Vipère
(chaos), Maître d'armes (neutre) — simplification déjà faite en session précédente, cohérente
avec le reste de la structure `TITRES`.)*

---

## Sorts optionnels de magicien loyal (Mage Spells)

Le PDF ajoute une liste de sorts que **les magiciens loyaux** peuvent choisir, en plus des
sorts standards de magicien. Utile en création/montée de niveau si un joueur crée un
magicien loyal avec ce supplément activé.

| Tier | Sorts |
|---|---|
| 1 | Cleanse (Purge), Flare (Éblouissement), Reveal (Révélation), Ward (Charme protecteur) |
| 2 | Absorb (Absorption), Meld (Fusion éthérée), Pacify (Apaisement), Push/Pull (Pousser/Tirer) |
| 3 | Banish (Bannissement), Forbid (Interdiction), Identify (Identification), Speak With Object (Parler à un objet) |
| 4 | Glyph (Glyphe), Stasis |
| 5 | Abjure (Abjuration), Permanence |

**Détail des sorts :**

- **Cleanse** — Tier 1, magicien (L). Durée : instantanée. Portée : proche. Vous purgez les
  toxines naturelles d'une créature touchée : met fin à un poison affectant actuellement la
  cible.
- **Flare** — Tier 1, magicien (L). Durée : 1 round. Portée : à distance (near). Un éclair de
  lumière blanche aveuglante jaillit de vous ; tous les ennemis à portée qui le voient sont
  aveuglés pour la durée du sort.
- **Reveal** — Tier 1, magicien (L). Durée : instantanée. Portée : à distance (near). Met fin
  à tous les effets d'invisibilité jusqu'à portée « near » de vous. Vous devenez également
  conscient de la position de toute créature cachée dans cette portée.
- **Ward** — Tier 1, magicien (L). Durée : 10 rounds. Portée : soi-même. Vous vous protégez
  d'un charme magique contre les embuscades : pour la durée, vous ne pouvez pas être
  surpris (vous jouez l'initiative lors des rounds de surprise et êtes considéré conscient
  de tous les ennemis).
- **Absorb** — Tier 2, magicien (L). Durée : 5 rounds. Portée : soi-même. Vous créez une
  barrière de force absorbante autour de vous : divisez par deux (arrondi à l'inférieur)
  tous les dégâts subis pour la durée du sort.
- **Meld** — Tier 2, magicien (L). Durée : 5 rounds. Portée : soi-même. Vous fusionnez
  légèrement avec le plan éthéré, vous libérant des entraves physiques : vous pouvez ignorer
  tout effet qui affecterait votre mouvement pour la durée du sort.
- **Pacify** — Tier 2, magicien (L). Durée : instantanée. Portée : à distance (near). Ciblez
  une créature de niveau ≤ 3 dans la portée ; elle doit faire un test de moral (les
  créatures immunisées au moral ne sont pas affectées).
- **Push/Pull** — Tier 2, magicien (L). Durée : instantanée. Portée : à distance (near). Vous
  déplacez un objet de taille humaine ou une créature de niveau ≤ 4 d'une distance « near ».
  Si la cible est ancrée de façon à empêcher tout mouvement libre, le ND pour lancer ce sort
  passe à 18.
- **Banish** — Tier 3, magicien (L). Durée : instantanée. Portée : proche (near). D'un mot de
  pouvoir, vous renvoyez dans son plan d'origine une créature extraplanaire de niveau ≤ 6 qui
  vous entend.
- **Forbid** — Tier 3, magicien (L). Durée : 10 rounds. Portée : soi-même. Les créatures ne
  peuvent pas se téléporter à l'intérieur, à l'extérieur ou au sein d'une zone d'effet
  s'étendant jusqu'à deux fois la portée « near » depuis vous. Cette zone se déplace avec
  vous.
- **Identify** — Tier 3, magicien (L). Durée : instantanée. Portée : toucher. Vous apprenez
  toutes les propriétés magiques d'un objet touché. Vous ne pouvez pas relancer ce sort avant
  d'avoir terminé un repos.
- **Speak With Object** — Tier 3, magicien (L). Durée : instantanée. Portée : proche. Un objet
  touché répond mentalement à vos questions. L'esprit de l'objet correspond à la rareté de
  ses matériaux principaux (un diamant est plus vif qu'une pierre). Vous pouvez poser jusqu'à
  trois questions par oui/non (une à la fois) ; le MJ répond honnêtement. Si vous lancez ce
  sort plus d'une fois en 24 heures, un échec au test d'incantation devient un échec
  critique.
- **Glyph** — Tier 4, magicien (L). Durée : 1 semaine. Portée : au contact (close). Vous
  dessinez un symbole arcanique sur un objet, lui conférant l'un des effets suivants :
  - *Bind (Lier)* : un lecteur de niveau ≤ 6 est paralysé pendant 1 heure.
  - *Harm (Blesser)* : le lecteur subit 3d6 dégâts.
  - *Message* : le lecteur entend un bref message mental.
  - *Teleportation Sigil (Sceau de téléportation)* : traitez l'objet comme un sceau de
    téléportation selon le sort teleport.
  Le glyphe disparaît une fois activé.
- **Stasis** — Tier 4, magicien (L). Durée : indéfinie. Portée : au contact (close). Une
  créature consentante que vous touchez entre en stase temporelle (si non consentante, elle
  doit être de niveau ≤ 5). La cible devient inconsciente, ne vieillit plus, et ses fonctions
  corporelles cessent bien qu'elle reste en vie. Vous pouvez mettre fin au sort à tout moment,
  ou à une condition prédéfinie choisie au moment du lancement.
- **Abjure** — Tier 5, magicien (L). Durée : instantanée. Portée : proche. Vous et une
  créature que vous touchez mourez tous les deux.
- **Permanence** — Tier 5, magicien (L). Durée : 1 an. Portée : proche. Nécessite de saupoudrer
  un diamant en poudre sur la cible. Choisissez un objet dans la portée actuellement sous
  l'effet d'un sort que vous avez lancé ; la durée de ce sort devient 1 an. Vous ne pouvez
  plus modifier les effets originaux du sort après avoir lancé permanence (par exemple, vous
  ne pouvez plus déplacer un objet sous l'effet de télékinésie).

## Renommée (Renown)

Système optionnel de réputation urbaine, utilisable à la création (le score de départ dépend
du modificateur de CHA) et évolutif en jeu.

- **Score de départ** : égal au modificateur de CHA du PJ (peut être négatif).
- **3 ou moins** : quasi invisible, même pour les gens ordinaires ; pas bienvenu dans les
  lieux huppés.
- **4-7** : +1 aux jets d'événement de bringue liés à la renommée ; les gens ordinaires vous
  voient favorablement ; les personnes de haut statut vous ignorent, surtout dans les lieux
  huppés.
- **8-11** : +2 aux jets d'événement de bringue liés à la renommée ; vous êtes un nom connu ;
  les personnes de haut statut vous traitent en pair.
- **12+** : +3 aux jets d'événement de bringue liés à la renommée ; vous êtes une célébrité,
  bienvenu dans les lieux les plus luxueux ; les personnes de haut statut s'inclinent devant
  vous.

**Gain de renommée** : monter de niveau ; être honoré publiquement ; dépense publique
extravagante ; un triomphe ou succès majeur.

**Perte de renommée** : humiliation publique ; démêlé négatif avec la loi ; faute de
goût/mode ; faire faillite ou être trop économe ; offenser une personne de renommée ou statut
social supérieur.

**Réactions** : les PJ peuvent ajouter leur bonus de renommée à leurs jets de réaction
lorsqu'ils sont dans un lieu où ils sont susceptibles d'être reconnus. Un double 1 aboutit
toujours à une réaction hostile.

## Objets magiques / reliques

**Aucun objet magique, relique ou artefact avec règles mécaniques propres n'est défini dans
ce supplément.** Le PDF ne fait que renvoyer aux tables de trésor standard de Shadowdark
RPG (« Treasure Table » selon le niveau/palier) dans ses tables de bringue (carousing) et
d'événements de temps mort — aucun nouvel objet magique nommé n'y est statué. Une boutique
de ville (« Tough Nut », district The Rooks) mentionne vaguement qu'elle a 1 chance sur 6
par semaine de proposer « a rare consumable magic item (spell scroll or potion) » à 50 po,
mais sans préciser lequel — pure couleur locale, pas une table exploitable.

Rien d'autre n'a été extrait sur ce point.

## À confirmer avec Tristan

- **Titres du Barde, palier 9-10, camp chaotique** : le PDF liste deux titres possibles
  (Silvertongue et Doomspeaker) pour le même palier/camp, sans préciser lequel prime.
  `index.html` a retenu les deux comme "Langue d'Argent" et "Oiseau de mauvais augure" mais
  la table `TITRES` ne semble en garder qu'une valeur par case — à vérifier si un choix ou un
  tirage est prévu, ou si c'est un doublon volontaire du PDF (deux options équivalentes).
- **Titres du Duelliste, palier 9-10** : le PDF propose trois titres par camp (loyal :
  Mongoose/Wolf/Swordmaster ; chaotique : Viper/Cobra/Swordmaster), la mise en page du PDF
  extrait en `-layout` étant ambiguë sur l'association exacte ligne/colonne. `index.html` n'en
  garde qu'un seul par camp (Mangouste / Vipère / Maître d'armes) — simplification déjà
  actée en session antérieure (voir `docs/AUDIT.md`), mais pas explicitement confirmée par
  Tristan comme volontaire vs. juste un choix par défaut.
- **Traductions non officielles** déjà en place dans `index.html` (Bard→Barde, Duelist→
  Duelliste, et tous les noms de capacités/titres) : reprises telles quelles ici pour
  cohérence, mais restent des choix éditoriaux de session précédente, pas une traduction
  officielle de l'éditeur — à valider si besoin.
- Aucun objet magique n'a été trouvé dans ce PDF malgré la consigne de la tâche à l'origine ;
  confirmer que c'est bien attendu (le supplément #6 est un supplément "ville", pas un
  supplément "trésor").
