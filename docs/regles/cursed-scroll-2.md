# Cursed Scroll #2 — Sables rouges (VF)

Référence compacte extraite du PDF `1020701537-shd04-cursedscroll2.pdf` (72 pages, Rabbit
Hole / Arkhane Asylum). Ne contient que le contenu utile à la création de personnage et aux
objets/trésors. Cartes, scénario du Djurum et bestiaire volontairement exclus.

Ces 3 classes sont déjà implémentées dans `index.html` (`CLASSES_DATA`, `PC_CLASSES`, table
`TITRES`) — vérifié cohérent avec le PDF ci-dessous (aucun écart trouvé). La table « Lotus
noir » et la table « Montures » n'étaient pas encore extraites intégralement ailleurs.

## Classes

Trois classes de PJ dans ce numéro : Cavalier du désert, Combattant de l'arène, Ras-Godai.
Aucune n'est incantatrice ; aucune origine ni liste de sorts thématique dans ce livret.

### Cavalier du désert

- **Points de vie** : 1d8 par niveau.
- **Armes** : gourdin, dague, javelot, épée longue, pique (cf. Nouvelles armes), arc court,
  cimeterre, lance, fouet.
- **Armure** : armure de cuir, boucliers.
- **Capacités** :
  - *Charge*. 3/jour, en chargeant sur au moins une distance intermédiaire avant d'attaquer,
    les attaques de corps à corps infligent le double de dégâts ce round.
  - *Monture*. Chameau ou cheval ordinaire fiable ou adorable (cf. [[Montures]]) qui répond à
    l'appel et ne panique jamais ; une seule monture de ce genre à la fois. En chevauchant,
    cavalier et monture reçoivent tous deux un bonus de CA égal à la moitié du niveau du
    cavalier (arrondi à l'inférieur) ; la monture gagne un nombre de niveaux égal à la moitié
    de ceux du cavalier (arrondi à l'inférieur). Sauter de selle ou en selle est gratuit une
    fois par round. En cas de perte de la monture : test de CHA ND 15 pendant le répit entre
    deux aventures pour en dresser une nouvelle (ND -1 à chaque nouvelle tentative).

**Talents de cavalier du désert (2d6, un double relance) :**

| 2d6 | Effet |
|---|---|
| 2 | Vous pouvez utiliser n'importe quelle créature susceptible d'être chevauchée comme monture. |
| 3-6 | Bonus de +1 à l'attaque ou aux dégâts. |
| 7-9 | +2 en Force ou en Dextérité, ou +1 aux attaques de corps à corps. |
| 10-11 | Une utilisation supplémentaire du talent Charge chaque jour. |
| 12 | Choisissez un talent ou +2 points à répartir parmi vos caractéristiques. |

**Titres de cavalier du désert :**

| Niveau | Loyal | Chaotique | Neutre |
|---|---|---|---|
| 1-2 | Éclaireur | Bandit | Rat |
| 3-4 | Coureur des sables | Détrousseurs | Renard |
| 5-6 | Pionnier | Pillard | Loup |
| 7-8 | Bourrasque | Fléau | Tigre |
| 9-10 | Coureur d'orage | Roi/Reine des bandits | Dragon |

### Combattant de l'arène

- **Points de vie** : 1d8 par niveau.
- **Armes** : toutes.
- **Armure** : armure de cuir, boucliers.
- **Capacités** :
  - *Coup spectaculaire*. 3/jour, regagnez 1d6 PV en touchant un ennemi au corps à corps.
  - *Implacable*. Avantage aux tests de Constitution pour résister aux blessures et au poison,
    ainsi que pour endurer les effets des environnements extrêmes.
  - *Jusqu'au bout*. Quand vous êtes mourant, vous vous relevez avec 1 PV sur un 18-20 naturel
    au d20.
  - *Inébranlable*. 3/jour, quand vous tombez à 0 PV, test de CON ND 18 (Implacable s'y
    applique) — en cas de réussite, vous ne tombez qu'à 1 PV.

**Talents du combattant de l'arène (2d6, un double = utilisation quotidienne
supplémentaire) :**

| 2d6 | Effet |
|---|---|
| 2 | 1/jour, ignorez tous les dégâts et effets d'une attaque. |
| 3-6 | Bonus de +1 aux dégâts des armes de corps à corps. |
| 7-9 | +2 en Force ou en Dextérité, ou +1 aux attaques de corps à corps. |
| 10-11 | Le nombre de PV que rapporte Coup spectaculaire augmente de 1d6. |
| 12 | Choisissez un talent ou +2 points à répartir parmi vos caractéristiques. |

**Titres du combattant de l'arène :**

| Niveau | Loyal | Chaotique | Neutre |
|---|---|---|---|
| 1-2 | Novice | Voyou | Tocard |
| 3-4 | Gladiateur | Lutteur | Outsider |
| 5-6 | Héros | Crapule | Risque-tout |
| 7-8 | Champion | Affreux | Triomphateur |
| 9-10 | Légende | Légende | Légende |

Citation de saveur (p. 12) : *« Ce sera terminé quand je DIRAI que c'est terminé ! »* —
Markesh, combattant de l'arène humain.

### Ras-Godai

- **Points de vie** : 1d6 par niveau.
- **Armes** : sarbacane (cf. Nouvelles armes), bolas, dague, chaîne-rasoir, cimeterre,
  shuriken, lance.
- **Armure** : armure de cuir.
- **Langues** : vous parlez le diabolique (en plus des langues habituelles).
- **Capacités** :
  - *Assassin*. Avantage aux tests pour vous cacher et vous déplacer discrètement. Vos
    attaques infligent le double de dégâts aux cibles qui n'ont pas conscience de votre
    présence.
  - *Marche de fumée*. 3/jour, téléportation vers un point vu à portée intermédiaire, sans
    dépenser d'action.
  - *Lotus noir*. Vous avez gagné le droit de manger un pétale du légendaire lotus noir et
    avez survécu à la sorcellerie qui l'imprégnait. Tirez 1 talent sur la table
    [[Lotus noir]].

**Talents de Ras-Godai (2d6, un double relance) :**

| 2d6 | Effet |
|---|---|
| 2 | Vous êtes formé à l'usage des poisons. |
| 3-6 | Tirez un autre talent sur la table de talents de lotus noir. |
| 7-9 | +2 en Force ou en Dextérité, ou +1 aux attaques de corps à corps. |
| 10-11 | Une utilisation supplémentaire pour le talent Marche de fumée. |
| 12 | Choisissez un talent ou +2 points à répartir parmi vos caractéristiques. |

**Titres de Ras-Godai** (le PDF ne détaille les titres qu'à 5 paliers, pas 5 lignes de 2
niveaux chacune comme les deux autres classes — colonnes reconstituées en cohérence avec
`index.html`, qui applique déjà ce même regroupement) :

| Niveau | Loyal | Chaotique | Neutre |
|---|---|---|---|
| 1-2 | Acolyte | Acolyte | Acolyte |
| 3-4 | Sentier du miroir | Sentier de l'ombre | Sentier du feu |
| 5-6 | Moine | Moine | Moine |
| 7-8 | Maître | Assassin | Lame-démon |
| 9-10 | Lotus blanc | Lotus noir | Lotus rouge |

## Lotus noir

Table de talents du Ras-Godai (p. 15), déclenchée par la capacité *Lotus noir* et par le
résultat 3-6 de la table de talents de Ras-Godai. **d12, les doubles peuvent être conservés ou
relancés au choix du joueur.**

| d12 | Détail |
|---|---|
| 1 | Obtenez deux talents de lotus noir (si vous obtenez un autre 1, relancez celui-ci). |
| 2 | 1/jour, paralysez une cible de NV 9 ou moins pendant 1d4 rounds lorsque vous lui infligez des dégâts avec une arme. |
| 3 | Avantage aux tests de DEX visant à éviter d'être piégé ou blessé. |
| 4 | Bonus de +1 à la CA lorsque vous maniez une arme de corps à corps dans chaque main. |
| 5 | Vous gagnez un dé de vie supplémentaire. |
| 6 | Vous infligez des dégâts triplés (au lieu de doublés) avec votre talent Assassin. |
| 7 | Quand des ennemis qui vous voient effectuent un test de moral, le ND est de 18 au lieu de 15. |
| 8 | 1/jour, vous pouvez marcher sur l'eau comme sur un sol solide pendant 1d4 rounds. |
| 9 | 1/jour, choisissez une créature vivante de NV 5 ou moins que vous voyez à portée intermédiaire : elle doit réussir un test de CON ND 15 pour éviter de s'endormir. |
| 10 | 1/jour, vous pouvez marcher sur les surfaces abruptes (comme les murs) pendant 1d4 rounds. |
| 11 | Bonus de +1 aux dégâts infligés avec des armes de corps à corps. |
| 12 | 1/jour, choisissez une créature de NV 9 ou moins que vous voyez. Elle doit réussir un test de SAG ND 15, sinon elle ne peut ni vous voir ni vous entendre pendant 1d4 rounds. |

## Nouvelles armes (p. 17)

Table utilisée par les listes d'armes des 3 classes ci-dessus (pique, fouet, cimeterre,
sarbacane, bolas, chaîne-rasoir, shuriken). Fronde et Morningstar figurent aussi dans le
livret sans être listées dans les armes de départ d'une classe précise.

| Arme | Coût | Type | Portée | Dégâts | Propriétés |
|---|---|---|---|---|---|
| Bolas | 2 po | D | I | – (cf. description) | Cf. description |
| Chaîne-rasoir | 12 po | D/CàC | C/I | 1d6 | Finesse (F), Fouet (Fo) |
| Cimeterre | 8 po | CàC | C | 1d6 | Finesse (F) |
| Fouet | 10 po | D/CàC | C/I | 1d4 | Finesse (F), Fouet (Fo) |
| Fronde | 5 pa | D | L | 1d4 | – |
| Morningstar | 5 po | CàC | C | 1d6/1d8 | Polyvalente (P) |
| Pique | 10 po | CàC | 2×C | 1d10 | Deux mains (2M), 2 emplacements |
| Sarbacane | 5 po | D | I | 1 | Cf. description |
| Shuriken | 1 po | D | I | 1d4 | Cf. description |

Propriétés :
- **Finesse (F)** : vous pouvez utiliser soit votre FOR soit votre DEX pour attaquer avec
  cette arme.
- **Fouet (Fo)** : en attaque à distance avec cette arme, vous ne la lâchez pas.
- **Deux mains (2M)** : vous devez manier cette arme à deux mains.
- **Polyvalente (P)** : vous pouvez l'utiliser à une ou deux mains ; utilisez le meilleur dé
  de dégâts dans le second cas.
- **Sarbacane** : tirer depuis une cachette ne révèle pas votre position.
- **Bolas** : sur une cible touchée pourvue de pattes, de taille ≤ cheval, sa vitesse est
  réduite à portée courte jusqu'à ce qu'elle se libère (test de FOR ou de DEX ND 15).
- **Shuriken** : peut être lancé au sol ; les créatures vivantes qui marchent dessus subissent
  1 dégât et sont réduites à la moitié de leur vitesse pendant 10 rounds.

*Note d'extraction* : le PDF présente ce tableau en colonnes qui se chevauchent après export
texte ; les valeurs ci-dessus ont été reconstituées en croisant deux passes d'extraction
(colonne par colonne, puis ligne par ligne) — cohérentes entre elles sur tous les champs.
Cimeterre/Fouet/Morningstar/Pique en particulier concordaient sur les deux passes. À vérifier
visuellement sur le PDF (p. 17) si un doute subsiste sur Chaîne-rasoir ou Sarbacane.

## Montures (p. 28-29)

Directement lié à la capacité *Monture* du Cavalier du désert.

**Emplacements d'inventaire** : une monture dispose d'un nombre d'emplacements égal à 5 × son
bonus de FOR. Le cavalier et son propre équipement (sac à dos, objets portés) occupent 10 de
ces emplacements.

**Déplacement** : on utilise la vitesse de la monture en la chevauchant.
- *Pointe de vitesse* : en voyage, un cavalier peut pousser sa monture à parcourir chaque jour
  un nombre de cases hexagonales de 10 km égal au bonus de CON de la monture. Celle-ci doit
  réussir un test de CON ND 12 (échec : ne peut voyager le jour suivant) ; le ND augmente de 1
  par jour consécutif à cette allure.

**Combat** : la plupart des montures ne peuvent pas attaquer en combat ; une monture de NV 7+
peut effectuer une attaque lors du tour de son cavalier. Descendre de/monter sur la monture
dépense le déplacement du cavalier. Une monture non habituée au combat doit effectuer un test
de moral la première fois qu'elle (ou son cavalier) est blessée.

**Nourriture et eau** : les montures à sang chaud consomment un nombre de rations égal à leur
niveau de base (hors niveaux bonus) chaque jour ; chameaux et montures à sang froid, une fois
par semaine seulement. Elles tiennent 3 jours sans eau et 3 semaines sans nourriture au-delà
de leur limite avant de subir 1d8 dégâts par jour (non régénérables tant qu'elles n'ont pas
mangé/bu à satiété).

**Table des montures :**

| Nom | Coût | Panique ? | Rareté | Propriété |
|---|---|---|---|---|
| Âne | 40 po | Oui | Courant | – |
| Chameau | 50 po | Oui | Courant | – |
| Chameau argenté | 200 po | Non | Rare | – |
| Cheval | 50 po | Oui | Courant | Avantage au test de moral |
| Destrier de guerre | 100 po | Non | Peu courant | Peut porter une armure |
| Éléphant | 400 po | Non | Rare | – |
| Scrag | 150 po | Oui | Peu courant | – |
| Scrag de guerre | 250 po | Non | Rare | Peut porter une armure |

*Les scrags nécessitent un entraînement spécifique (cf. bestiaire, hors périmètre de ce
document).*

**Personnalité de la monture (2d6 + mod de CHA du cavalier) :**

| 2d6 + mod CHA | Attitude | Comportement |
|---|---|---|
| 0-4 | Infecte | Rebelle, obstinée, malveillante |
| 5-7 | Mauvaise | N'aime que son propriétaire, insolente, malpolie |
| 8-9 | Fiable | Loyale, obéissante, protectrice |
| 10+ | Adorable | Loyale, douce, affectueuse |

**Équipement pour monture :**

| Nom | Coût | Propriété |
|---|---|---|
| Armure de cuir | 30 po | CA 11 + mod de DEX |
| Cotte de mailles | 80 po | CA 13 + mod de DEX ; désavantage pour nager et se déplacer discrètement ; 2 emplacements |
| Armure de plates | 150 po | CA 15 ; impossible de nager ou de se déplacer discrètement ; 3 emplacements |
| Armure en mithral | × 5 (du prix de l'armure équivalente) | Métal uniquement ; -1 emplacement ; peut nager et se déplacer discrètement sans malus |
| Selle | 30 po | Cavalier avantagé aux tests pour rester sur sa monture ; peut être portée par la monture sans occuper d'emplacement d'inventaire |
| Chariot | 120 po | Pas de cavalier sur la monture ; se déplace à moitié moins vite ; +15 emplacements d'inventaire ; limité à 1 par monture |

## Objets magiques / trésors

Ce numéro ne contient pas de table générique d'objets magiques séparée des trésors. La seule
table de loot générique du livret est celle en dernière page, déjà reprise telle quelle dans
`js/cursedscroll.js` (`CS2_TREASURES`) et vérifiée identique au PDF — voir
[[Dans la main d'un bandit mort]].

**Table « Dans la main d'un bandit mort, vous trouvez… » (d20, p. 72) :**

| d20 | Objet |
|---|---|
| 1 | Fétiche au mauvais œil : désavantage au prochain test ou jet d'attaque. |
| 2 | Sac en toile attaché et contenant un cobra furieux. |
| 3 | Moitié d'une carte au trésor ; l'autre obtenue au prochain résultat. |
| 4 | Bocal en terre cuite scellé contenant, 1d4 : 1-2. 20 po, 3-4. Hordes de scarabées. |
| 5 | Coupe de vin en laiton avec réservoir secret diffusant du poison. |
| 6 | Trois dés pipés pour obtenir des résultats, 1d4 : 1-2. Élevés, 3-4. Bas. |
| 7 | Invitation à un combat d'arène privé dans le palais d'un puissant noble. |
| 8 | Peigne en jade qui, selon la loi, absout son porteur d'un crime. |
| 9 | Fiole en verre bouchée contenant un minuscule scorpion vivant. |
| 10 | Bouteille fermée d'un vin de Murgazi particulièrement fort. |
| 11 | Pion en forme de scarabée, avantage au prochain test ou jet d'attaque. |
| 12 | Anneau sigillaire en or appartenant à une noble famille d'Alkesh. |
| 13 | Sac de 1d4 dattes sucrées guérissant chacune 1 PV quand on les consomme. |
| 14 | Huile de ver, à verser sur le sable pour attirer un ver pourpre en 1d4 rounds. |
| 15 | Fiole de poison, 1d4 : 1-2. Courant, 3. Peu courant, 4. Rare. |
| 16 | Tube contenant 1d4 plumes de phénix qui tiennent lieu d'allumettes étanches. |
| 17 | Acte de propriété d'un destrier de guerre coûteux logé dans une écurie d'Alkesh. |
| 18 | Fragment de verre bleu qui reflète parfois de brefs présages. |
| 19 | Sac de grains de sésame magiques à répandre sur une porte pour la déverrouiller. |
| 20 | Lampe à huile en bronze terni avec une inscription gravée et presque effacée. |

Un objet magique unique est mentionné en tant que trésor de site du Djurum (« Ruines de la
Forteresse », site 106) : une **chaîne-rasoir +2 baptisée Écorcheuse**, qui immunise son
porteur contre le poison, considérée comme sainte relique par les Ras-Godai. C'est du contenu
de scénario (loot d'un lieu précis de l'aventure), pas une table générique — mentionné ici
pour mémoire mais volontairement non repris en table, conformément au périmètre demandé
(pas de scénario/aventure).

## À confirmer avec Tristan

- **Table « Nouvelles armes » (p. 17)** : le tableau se scinde en colonnes qui se recouvrent
  dans l'export texte du PDF. Les valeurs de la section « Nouvelles armes » ci-dessus ont été
  reconstituées en croisant deux méthodes d'extraction indépendantes qui concordaient sur
  l'ensemble des champs — mais une vérification visuelle rapide de la page 17 est recommandée
  avant de les considérer comme définitives, en particulier Chaîne-rasoir (Type/Portée) et
  Sarbacane (Type).
- **Titres de Ras-Godai** : le PDF imprime la colonne « Niveau » de cette table sans faire
  correspondre visuellement chaque intitulé à sa tranche 1-2/3-4/etc. (rendu en 5 blocs de
  texte alignés différemment des deux autres tables de titres). Le regroupement retenu
  ci-dessus reproduit exactement celui déjà codé dans `index.html`
  (`TITRES["Ras-Godai"]`), qui semble correct au vu de l'ordre logique
  Acolyte → Sentier → Moine → Maître/Assassin/Lame-démon → Lotus — mais ce n'est pas une
  lecture 100% univoque du PDF brut, à confirmer si un doute survient en jeu.
