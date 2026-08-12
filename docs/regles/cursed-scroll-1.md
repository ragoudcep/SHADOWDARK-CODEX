# Cursed Scroll #1 — Diablerie (VF)

Référence compacte MJ pour la création de personnage, extraite du PDF
`1046376657-Shadowdark-VF-Cursed-Scroll-1.pdf` (74 p., supplément tiers thème
diablerie). Remplace la relecture du PDF pour tout ce qui touche aux 3
classes, aux mentors, aux sorts de sorcière et aux tables aléatoires liées à
la création de PJ. Contenu déjà implémenté dans l'appli : `CLASSES_DATA` /
`TITRES` / `MENTORS` dans `index.html`, et `CS1_*` dans `js/cursedscroll.js`
(onglet MJ « Cursed Scroll »).

## Classes

### Chevalier de Saint Ydris
- **Dé de vie** : 1d6/niveau.
- **Armes** : toutes les armes de corps à corps, arbalète.
- **Armures** : toutes les armures, tous les boucliers.
- **Langues** : diabolique.
- **Possession démoniaque** : 3/jour, bonus de +1 aux dégâts pendant 3 rounds ; ajoutez la moitié du niveau (arrondie à l'inférieur) à ce bonus.
- **Incantation** : sorts de sorcière (liste commune, voir plus bas), lancés au Charisme, DD = 10 + rang du sort. Aucun sort connu avant le niveau 3. Échec au test d'incantation → sort bloqué jusqu'au prochain repos complet. 1 naturel → jet en plus sur la table Catastrophes diaboliques correspondant au rang du sort.

Sorts connus par rang (Chevalier) :

| Niveau | Rang 1 | Rang 2 | Rang 3 |
|---|---|---|---|
| 1-2 | - | - | - |
| 3 | 1 | - | - |
| 4 | 2 | - | - |
| 5 | 3 | - | - |
| 6 | 3 | 1 | - |
| 7 | 3 | 2 | - |
| 8 | 3 | 3 | - |
| 9 | 3 | 3 | 1 |
| 10 | 3 | 3 | 2 |

Talents (2d6) :

| Jet | Effet |
|---|---|
| 2 | Votre bonus de possession démoniaque augmente de 1. |
| 3-6 | +1 aux attaques à distance et de corps à corps. |
| 7-9 | +2 à votre valeur de Force, Dextérité ou de Constitution. |
| 10-11 | +2 à votre valeur de Charisme ou +1 aux tests d'incantation des sorts de sorcière. |
| 12 | Choisissez un talent ou +2 points à répartir parmi vos caractéristiques. |

Titres :

| Niveau | Loyal | Chaotique | Neutre |
|---|---|---|---|
| 1-2 | Arbitre | Traître | Frère/Sœur |
| 3-4 | Exécuteur | Déchu | Exorciste |
| 5-6 | Chevalier Maréchal | Parjure | Révérend Chevalier |
| 7-8 | Juge | Garde Noir | Inquisiteur |
| 9-10 | Pourvoyeur de justice | Seigneur démon | Grand Inquisiteur |

### Ensorceleur
- **Dé de vie** : 1d6/niveau.
- **Armes** : gourdin, arbalète, dague, masse d'armes, épée longue.
- **Armures** : armure de cuir, cotte de mailles en mithral, boucliers.
- **Langues** : céleste, diabolique, draconique, originel ou sylvestre (au choix).
- **Mentor** : choisit un patron occulte (voir section Mentors) — unique source de ses pouvoirs surnaturels ; le mentor peut accorder ou retirer ses bienfaits à tout moment.
- **Bienfait de mentor** : au niveau 1, un Bienfait tiré sur la table du mentor choisi. À chaque jet de talent ultérieur, choix entre la table de Talents d'ensorceleur ci-dessous ou la table de Bienfaits du mentor.
- Ne lance pas de sorts par lui-même (pas de liste de sorts propre).

Talents (2d6) :

| Jet | Effet |
|---|---|
| 2 | Tirez un Bienfait de mentor de n'importe quel autre mentor que le vôtre, qui vous en fait inexplicablement don. |
| 3-6 | Ajoutez 1 point à deux valeurs de caractéristiques différentes. |
| 7-9 | +1 aux attaques à distance ou de corps à corps. |
| 10-11 | Tirez deux Bienfaits de mentor et choisissez celui que vous gardez. |
| 12 | Choisissez un talent ou +2 points à répartir parmi vos caractéristiques. |

Titres :

| Niveau | Loyal | Chaotique | Neutre |
|---|---|---|---|
| 1-2 | Favorisé | Marqué | Élu |
| 3-4 | Héraut | Zélote | Incantateur |
| 5-6 | Éminence | Occultiste | Annoncé |
| 7-8 | Exalté | Champion | Transcendant |
| 9-10 | Incarnation | Annonciateur | Avatar |

### Sorcière
- **Dé de vie** : 1d4/niveau.
- **Armes** : dague, bâton.
- **Armures** : armure de cuir.
- **Langues** : diabolique, originel, sylvestre.
- **Familier** : petit animal parlant (corbeau, rat, grenouille…) qui parle commun ; sert de source aux sorts (la portée se calcule depuis lui). S'il meurt, on peut le ramener à la vie en sacrifiant définitivement 1d4 PV.
- **Incantation** : connaît 3 sorts de rang 1 au choix au niveau 1 (liste ci-dessous). Sorts lancés au Charisme, DD = 10 + rang du sort. Échec → sort bloqué jusqu'au prochain repos complet. 1 naturel → jet en plus sur la table Catastrophes diaboliques correspondant au rang du sort.

Sorts connus par rang (Sorcière) :

| Niveau | Rang 1 | Rang 2 | Rang 3 | Rang 4 | Rang 5 |
|---|---|---|---|---|---|
| 1 | 3 | - | - | - | - |
| 2 | 4 | - | - | - | - |
| 3 | 4 | 1 | - | - | - |
| 4 | 4 | 2 | - | - | - |
| 5 | 4 | 2 | 1 | - | - |
| 6 | 4 | 3 | 2 | - | - |
| 7 | 4 | 3 | 2 | 1 | - |
| 8 | 4 | 4 | 2 | 2 | - |
| 9 | 4 | 4 | 3 | 2 | 1 |
| 10 | 4 | 4 | 4 | 2 | 2 |

Talents (2d6) :

| Jet | Effet |
|---|---|
| 2 | Une fois par jour, téléportez-vous à l'endroit où se trouve votre familier, à la place de votre déplacement. |
| 3-7 | +2 à votre valeur de Charisme, ou +1 aux tests d'incantation des sorts de sorcière. |
| 8-9 | Vous êtes avantagé pour lancer un sort que vous connaissez. |
| 10-11 | Vous apprenez un sortilège de sorcière supplémentaire parmi les rangs que vous pouvez lancer. |
| 12 | Choisissez un talent ou +2 points à répartir parmi vos caractéristiques. |

Titres :

| Niveau | Loyal | Chaotique | Neutre |
|---|---|---|---|
| 1-2 | Voyante | Chuchoteuse | Chamane |
| 3-4 | Augure | Malfaisante | Conjuratrice / Devineresse |
| 5-6 | Prophète | Guenaude/Ancien | Médiatrice |
| 7-8 | Sagace | Mégère/Oncle | Baba |
| 9-10 | Baba | Baba | Baba |

*(Le PDF met en page les titres de Sorcière avec un léger décalage de colonnes p.15 ; la lecture ci-dessus — Chamane en 1-2, Conjuratrice/Devineresse en 3-4, Médiatrice en 5-6, Baba en 7-8 pour Neutre — correspond à celle déjà retenue dans `TITRES` de `index.html`, gardée par cohérence.)*

## Mentors (Cursed Scroll #1 p.17-19)

Système propre à l'Ensorceleur : chaque mentor a sa table de Bienfaits 2d6
(tranches irrégulières 2 / 3-7 / 8-9 / 10-11 / 12). Sauf indication contraire,
un double au jet donne +1 utilisation par jour du bienfait obtenu (à la case
concernée).

### Almazzat
Archidémon à tête de loup doté de six yeux et de six cornes. Cherche à
arracher les Sables du Temps à son père Kytheros.

| Jet | Bienfait |
|---|---|
| 2 | 1/jour, avantage aux attaques de corps à corps pendant 3 rounds. |
| 3-7 | Apprenez à manier 1 arme de corps à corps supplémentaire, ou obtenez +1 aux attaques de corps à corps. |
| 8-9 | +2 à votre valeur de Force ou de Constitution, ou +1 aux dégâts de corps à corps. |
| 10-11 | Avantage aux jets d'initiative (relancez si vous obtenez ce bienfait deux fois). |
| 12 | Choisissez une option ci-dessus ou 2 points à répartir parmi vos caractéristiques. |

### Kytheros
Seigneur du Temps qui voit tous les futurs possibles. Cherche à réaliser tous
les destins tels qu'ils ont été prévus.

| Jet | Bienfait |
|---|---|
| 2 | 1/jour, forcez le MJ à relancer les dés après un jet. |
| 3-7 | Bonus de +1 à la CA grâce à vos prémonitions surnaturelles. |
| 8-9 | +2 à votre valeur de Force, de Dextérité ou de Sagesse. |
| 10-11 | 3/jour, ajoutez votre bonus de Sagesse à n'importe quel jet de dés (relancez si vous obtenez ce bienfait deux fois). |
| 12 | Choisissez une option ci-dessus ou 2 points à répartir parmi vos caractéristiques. |

### Mugdulblub
L'Antique Vase qui suinte entre les brèches du souvenir et de l'obscurité
séparant les étoiles. Cherche à dissoudre toute forme physique.

| Jet | Bienfait |
|---|---|
| 2 | 1/jour, transformez-vous en flaque de vase ambulante pendant 3 rounds. |
| 3-7 | Obtenez le maximum à deux jets de dés de vie (déjà lancés ou à venir). |
| 8-9 | +2 à votre valeur de Dextérité ou de Constitution. |
| 10-11 | Devenez immunisé contre 1 élément au choix (acide, froid ou poison — relancez si vous êtes à court d'options). |
| 12 | Choisissez une option ci-dessus ou 2 points à répartir parmi vos caractéristiques. |

### Shune l'Infâme
Déesse, Mère Sorcière qui parle à ses enfants à la lumière vacillante des
bougies, au son des os qui s'entrechoquent. Recherche les secrets cachés et
le savoir perdu.

| Jet | Bienfait |
|---|---|
| 2 | 1/jour, lisez l'esprit d'une créature que vous touchez, pendant 3 rounds. |
| 3-7 | Apprenez un sort de magicien dont le rang est égal à la moitié de votre niveau (arrondi à l'entier inférieur). Vous le lancez avec Intelligence. |
| 8-9 | +2 à votre valeur de Dextérité ou d'Intelligence. |
| 10-11 | +1 PX chaque fois que vous apprenez un secret précieux ou important. |
| 12 | Choisissez une option ci-dessus ou 2 points à répartir parmi vos caractéristiques. |

### Titania
La capricieuse reine des fées, qui considère l'existence comme un songe
fantasque. Recherche la facétie, la beauté et le talent artistique.

| Jet | Bienfait |
|---|---|
| 2 | 1/jour, hypnotisez une créature de niveau 5 ou moins pendant 3 rounds. |
| 3-7 | Apprenez à manier un arc long, ou obtenez un bonus de +1 aux attaques à distance. |
| 8-9 | +2 à votre valeur de Dextérité ou de Charisme. |
| 10-11 | Les sorts hostiles qui vous prennent pour cible sont toujours difficiles à lancer. |
| 12 | Choisissez une option ci-dessus ou 2 points à répartir parmi vos caractéristiques. |

### L'Homme-Saule
Un grand être aux membres allongés qui rôde parmi les forêts embrumées, à
l'orée des cauchemars. Recherche la peur.

| Jet | Bienfait |
|---|---|
| 2 | 1/jour, à la place de votre déplacement, téléportez-vous jusqu'à un point à portée longue que vous voyez. |
| 3-7 | +1 aux attaques de corps à corps ou à distance. |
| 8-9 | +2 à votre valeur de Force ou de Dextérité. |
| 10-11 | 1/jour, forcez un être à portée courte à effectuer un test de moral même s'il y est immunisé. |
| 12 | Choisissez une option ci-dessus ou 2 points à répartir parmi vos caractéristiques. |

## Sorts de sorcière (liste commune Chevalier de Saint Ydris / Sorcière)

46 sorts, p.24-38 du PDF. Utilisables par la Sorcière dès le niveau 1 et par
le Chevalier de Saint Ydris à partir du niveau 3 (mêmes DD/Charisme).

### Rang 1
| Sort | Durée | Portée | Effet |
|---|---|---|---|
| Brouillard | Concentration | Courte | Un épais nuage de brouillard se lève jusqu'à portée courte autour de vous et empêche de vous voir facilement. Il se déplace avec vous. Les attaques portées contre les créatures situées dans le nuage sont désavantagées. |
| Charme-personne | 1d8 jours | Intermédiaire | Vous séduisez par magie un humanoïde de niveau 2 ou moins, situé à portée intermédiaire, et qui vous considère comme un ami pendant la durée du sort. Le sort s'achève si vous ou vos alliés faites quoi que ce soit pour lui nuire et qu'il le remarque. Quand l'effet du sort s'achève, la cible sait que vous l'avez ensorcelée. |
| Chaudron | 1 round | Courte | Vous faites apparaître un chaudron bouillonnant près de vous. Il produit l'un des effets suivants : tout objet ordinaire brisé qu'on y plonge en ressort réparé ; un crapaud obèse en bondit en coassant et suit vos instructions pendant les 3 prochains rounds ; vous pouvez placer l'équivalent de 3 emplacements d'inventaire dans le chaudron — il recrache les objets la prochaine fois que vous lancez le sort. |
| Chêne, frêne et roncier | Concentration | Personnelle | Pendant la durée du sort, les êtres féeriques, les démons et les diables ne peuvent pas vous attaquer. Il leur est également impossible de vous posséder, de vous contraindre à leur obéir ou de vous charmer. |
| Danse de l'ombre | 3 rounds | Intermédiaire | Vous matérialisez la substance de l'ombre pour créer une illusion visible et audible à portée intermédiaire. L'illusion peut être aussi grande qu'une personne et peut se déplacer à portée intermédiaire de son point d'apparition. Elle ne peut pas affecter les objets physiques. Toucher l'illusion révèle son caractère factice. |
| Homme-saule | Instantanée | Intermédiaire | Vous invoquez l'Homme-saule pour qu'il apparaisse dans l'esprit d'une créature, qu'il remplit d'un effroi surnaturel. Choisissez une créature de NV 2 ou inférieur à portée. Elle doit effectuer un test de moral. Même les créatures qui ne sont pas sujettes aux tests de moral (comme les morts-vivants) doivent s'y plier. |
| Hypnose | Concentration | Intermédiaire | Une créature de NV 3 ou moins et que vous pouvez voir est abasourdie. Si quelque chose interrompt la ligne de vue qui vous relie à votre cible, elle a droit à un test de CHA ND 15. En cas de réussite, le sort s'interrompt. |
| Marionnette | Concentration | Courte | Une créature humanoïde de NV 2 ou moins que vous touchez devient soumise à vos propres gestes. À votre tour, les mouvements de la créature imitent tous les vôtres. Si cette gestuelle pousse la cible à se blesser, elle ou un allié, elle peut effectuer un test de CHA ND 15 pour résister. |
| Œil meurtri | Instantanée | Intermédiaire | Une créature que vous prenez pour cible subit 1d4 dégâts et ne peut plus vous voir jusqu'à la fin de son prochain tour. |
| Sorceflamme | Concentration | Intermédiaire | Vous faites apparaître un feu follet des marais en suspension dans l'air, qui éclaire jusqu'à portée courte autour de vous. La lumière change de couleur et adopte des formes vagues. Elle peut flotter jusqu'à distance intermédiaire lors de votre tour. |

### Rang 2
| Sort | Durée | Portée | Effet |
|---|---|---|---|
| Altération physique | 5 rounds | Personnelle | Vous modifiez votre forme physique par magie et recevez un trait qui change votre anatomie (branchies, griffes...). Ce sort ne permet pas de faire pousser d'ailes ni de membres. |
| Augure noir | Instantanée | Personnelle | Vous interprétez le sens de présages et autres signes surnaturels. Posez une question au MJ au sujet d'une action spécifique que vous souhaitez entreprendre. Il vous dira s'il en résultera « félicité » ou « calamité ». |
| Champignon vénéneux | Instantanée | Personnelle | Vous faites apparaître un gros champignon moucheté dans votre main. Il disparaît à la fin de votre prochain tour. Une créature qui le mange regagne 1d6 points de vie. |
| Enlisement | 5 rounds | Longue | Vous transformez un cube de terrain de taille intermédiaire en sables mouvants bouillonnants. Une créature prise dans la zone ne peut plus se déplacer et doit réussir un test de Dextérité contre votre test d'incantation pour se libérer. Si lancé plus d'1x/24h, un échec devient critique. |
| Infects ricanements | Concentration | Courte | Vous touchez une cible de NV 4 ou moins et elle s'effondre, impuissante, en proie à un rire troublant et douloureux pendant la durée du sort. |
| Invisibilité | 10 rounds | Courte | Une créature que vous touchez devient invisible pendant la durée du sort. Le sort s'achève si la cible attaque ou lance un sort. |
| Œil de chat | Concentration | Personnelle | Vos pupilles se transforment en fentes noires verticales. Pendant la durée du sort, vous voyez les créatures invisibles et les portes secrètes. |
| Pattes d'araignée | Concentration | Personnelle | De la soie d'araignée gluante vous couvre les mains et les pieds. Pendant la durée du sort, vous pouvez marcher sur les surfaces verticales aussi aisément que sur un sol plat. |
| Pluie de grenouilles | Instantanée | Longue | Une pluie de grenouilles s'abat dans un cube de taille intermédiaire, autour d'un point que vous pouvez voir à portée. Toutes les créatures dans la zone subissent 1d6 dégâts. |
| Poison | 5 rounds | Courte | Un objet porté ou manié que vous touchez devient toxique pendant la durée du sort. Toute créature en contact avec l'objet au début de son tour subit 1d6 dégâts. |

### Rang 3
| Sort | Durée | Portée | Effet |
|---|---|---|---|
| Balai | Concentration | Personnelle | Vous faites apparaître un balai volant dans votre main. La personne qui le chevauche peut voler à distance intermédiaire chaque round ou rester en lévitation sur place. |
| Communication avec les morts | Instantanée | Courte | Un cadavre que vous touchez répond à vos questions d'une voix distante et sifflante — jusqu'à trois questions (oui/non). Si lancé plus d'une fois en 24h, un échec devient critique. |
| Convent | Instantanée | Personnelle | Vous invoquez la magie que vous partagez avec vos homologues sorcières. Vous regagnez l'usage d'un sort de rang 3 ou moins déjà dépensé ce jour. Une seule fois avant le prochain repos complet. |
| Divination | Instantanée | Personnelle | Vous lancez les osselets de divination ou scrutez l'obscurité entre les étoiles pour y chercher un signe. Vous posez une question au MJ, qui vous répond sincèrement par « oui » ou « non ». |
| Gui | 1d8 jours | Intermédiaire | Deux créatures que vous pouvez voir se retrouvent sous le charme l'une de l'autre pendant 1d8 jours. Chaque fois que l'une subit des dégâts, elle peut effectuer un test de CHA ND 15 pour mettre fin au sort. |
| Horde animale | Concentration | Longue | Une horde de chauves-souris, de rats ou de sauterelles affamés apparaît dans un cube de taille intermédiaire. Toutes les créatures qui débutent leur tour dans la horde subissent 2d6 dégâts et sont aveuglées. |
| Hurlement | Instantanée | Intermédiaire | Tous les ennemis à portée intermédiaire de vous doivent immédiatement effectuer un test de moral (sauf immunité). |
| Murmure | Instantanée | Courte | Vous chuchotez à l'oreille d'une autre créature pour introduire un faux souvenir dans sa mémoire. Si vous ratez le test d'incantation, le MJ vous implante un faux souvenir à la place. |
| Poupée ensorcelée | Concentration | Sur le même plan | Vous épinglez une mèche de cheveux ou un morceau de peau d'une créature à une poupée de toile. En vous concentrant, chaque épingle enfoncée inflige 2d6 dégâts à la créature. |
| Regard du néant | Concentration | Longue | Vos yeux virent au noir. Une créature de NV 6 ou moins que vous pouvez voir tombe sous votre contrôle ; vous décidez de ses actions pendant son tour. |

### Rang 4
| Sort | Durée | Portée | Effet |
|---|---|---|---|
| Cauchemar | Concentration | Sur le même plan | Vous infligez des cauchemars à glacer le sang à une créature endormie de niveau ≤ la moitié du vôtre (arrondi à l'inférieur, min. 1) que vous avez déjà vue. 3 rounds de concentration d'affilée : elle meurt d'effroi. |
| Malédiction | Permanente | Courte | Une créature que vous touchez subit l'une des malédictions suivantes : bubons et verrues hideux ; nourriture au goût de cendre ; voix stridente ; cauchemars troublants ; perd toujours aux jeux de hasard ; un allié devient un ennemi ; peur de quelque chose d'ordinaire. |
| Manteau de nuit | 8 rounds | Personnelle | Vous vous enveloppez d'un manteau d'ombres tourbillonnantes. Votre CA devient 17 (20 sur réussite critique). Avantage aux tests de Dextérité pour vous déplacer discrètement ou vous cacher. |
| Os de verre | Concentration | Courte | Une créature que vous touchez devient fragile : les dégâts qu'elle subit sont doublés pendant la durée du sort. |
| Porte dimensionnelle | Instantanée | Personnelle | Vous vous téléportez, vous et jusqu'à une autre créature consentante, à portée courte de n'importe quel point que vous pouvez voir. |
| Rayon de lune | Instantanée | Longue | Un rayon de lune argenté frappe une créature à longue portée. Elle subit 3d6 dégâts. |
| Subterfuge | Concentration | Intermédiaire | Vous conjurez une illusion visible et audible convaincante. Les créatures qui la perçoivent réagissent comme si elle était vraie. Vous pouvez forcer une créature qui interagit avec elle à un test de SAG ND 15, sinon elle tombe sous son charme. |
| Transformation | 10 rounds | Courte | Vous transformez une créature touchée en une autre créature naturelle de taille inférieure ou égale, de votre choix. Elle reçoit ses caractéristiques physiques mais garde le reste. À 0 PV, elle reprend sa forme d'origine avec la moitié de ses PV. |

### Rang 5
| Sort | Durée | Portée | Effet |
|---|---|---|---|
| Anathème | Instantanée | Courte | Tous les alliés de la créature touchée l'injurient et l'abandonnent pendant 1 journée. Chaque fois qu'elle subit des dégâts de votre fait, ses anciens alliés peuvent tenter un test de Sagesse ND 15 pour lever le sort. |
| Âme en conserve | Permanente | Courte | Vous transférez l'âme d'une créature de NV 9 ou moins que vous touchez dans un récipient. Son corps tombe dans le coma sans mourir. Vous pouvez posséder ce corps inhabité ; si le récipient se brise, l'âme regagne son corps. |
| Doigt de mort | Instantanée | Courte | Une créature de NV 9 ou moins que vous touchez meurt instantanément. Un échec à ce test est traité comme critique, et vous êtes désavantagé sur le jet de Catastrophe diabolique qui s'ensuit. |
| Étiolement | Instantanée | Courte | Une créature touchée voit une caractéristique tirée au hasard (d6) tomber à 3 (-4) pendant une semaine. En cas d'échec au test d'incantation, c'est une des vôtres qui tombe à 3 à la place. |
| Marche des songes | Instantanée | Courte | Vous et des créatures consentantes à portée courte entrez dans les songes d'une créature endormie sur le même plan. Vous pouvez ressortir des rêves en apparaissant à côté d'elle, comme téléportés. |
| Métamorphose | Concentration | Personnelle | Vous vous transformez, vous et votre équipement, en une créature naturelle déjà vue de niveau 10 ou moins — ses capacités physiques, mais votre INT/SAG/CHA. À 0 PV sous cette forme, vous reprenez votre forme d'origine avec 1 PV. |
| Mère de la nuit | Instantanée | Personnelle | Vous implorez la Mère de la nuit et exprimez un souhait unique, réalisé par le MJ. En cas d'échec au test d'incantation, elle vous juge et bloque ce sort tant que vous ne l'avez pas apaisée. |
| Scrutation | Concentration | Personnelle | Vous invoquez les images d'un lieu éloigné dans une boule de cristal ou un bassin. ND 18 si la cible ne vous est pas familière. Chaque round, les créatures observées peuvent tenter un test de Sagesse pour sentir qu'on les observe. |

**Total : 46 sorts** (10 rang 1, 10 rang 2, 10 rang 3, 8 rang 4, 8 rang 5).

## Catastrophes diaboliques

Déclenchées par un 1 naturel au test d'incantation d'un sort de sorcière ou
de Chevalier de Saint Ydris (Cursed Scroll #1 p.22-23). Deux tables selon le
rang du sort raté.

### Rang de sort 1 à 3 (d12)
| d12 | Effet |
|---|---|
| 1 | Diablerie ! Tirez deux fois et combinez les deux effets (relancez d'autres 1 éventuels). |
| 2 | Flétrissure ! Vous subissez 1d6 dégâts par rang de sort. |
| 3 | Salamandre ! Vous vous transformez en minuscule salamandre à 1 point de vie pendant 3 rounds. Vous ne pouvez pas lancer de sorts sous cette forme. |
| 4 | Regard malveillant de Shune ! Vous ne pouvez plus lancer ce sort ni un autre (tiré au hasard) pendant une semaine. |
| 5 | Fées chapardeuses ! Vous perdez un élément d'équipement au hasard. |
| 6 | Toiles d'araignée ! Des toiles d'araignées mentales vous encombrent l'esprit ; vous ne pouvez plus lancer ce sort pendant une semaine. |
| 7 | Ricanements ! Vous vous effondrez en proie à l'hilarité, incapable de faire autre chose que de rire aux éclats pendant les 3 prochains rounds. |
| 8 | Double effet néfaste ! Vous perdez la capacité de lancer un sort tiré au hasard jusqu'à votre prochain repos. |
| 9 | Gaz des marais ! L'air se remplit de gaz sulfureux dans un cube de taille intermédiaire autour de vous. Toutes les créatures qui terminent leur tour à l'intérieur sont aveuglées et subissent 1d6 dégâts. L'effet dure 3 rounds. |
| 10 | Chauve-souris ! Une chauve-souris furieuse apparaît sur votre tête, battant des ailes et s'accrochant à votre peau. Vous restez aveuglé pendant 3 rounds ou jusqu'à ce que vous parveniez à repousser cette bestiole. |
| 11 | Sel ! Vous êtes entouré d'un cercle de sel que vous ne pouvez ni toucher ni traverser tant que personne ne l'a rompu. |
| 12 | Siphon ! Vous êtes désavantagé lors de l'incantation des sorts de rang inférieur ou égal pendant les 10 prochains rounds. |

### Rang de sort 4 à 5 (d12)
| d12 | Effet |
|---|---|
| 1 | Maelström ! Tirez deux fois et combinez les deux effets (relancez d'autres 1 éventuels). |
| 2 | Ruine ! Vous subissez 1d8 dégâts par rang de sort. |
| 3 | Gangrène mentale ! Vous oubliez définitivement un sort tiré au hasard. |
| 4 | L'Homme-saule ! Vous invoquez l'Homme-saule (qui vous en veut) dans une case proche de vous. Il reste 1d6 rounds avant de retourner là d'où il est venu. |
| 5 | Fichus diablotins ! Des diablotins surgissent en ricanant des Enfers pour vous submerger, vous voler trois éléments aléatoires d'équipement et disparaître en battant des ailes. |
| 6 | Foudre ! Vous vous infligez 3d6 dégâts, à vous et à toutes les créatures proches. |
| 7 | Fer froid ! Des clous de fer froid jaillissent de l'éther pour vous transpercer. Vous subissez 2d6 dégâts et vous êtes paralysé pendant 2 rounds. |
| 8 | Mère de la nuit ! Vous avez déplu à la Mère Obscure et perdez le pouvoir de lancer ce sort tant que vous ne vous êtes pas racheté à ses yeux. |
| 9 | Catatonie ! Vous regardez dans le vide et ne pouvez plus agir pendant l'heure qui suit. |
| 10 | Langue de chien ! Votre langue se déroule et pend chaque fois que vous tentez de lancer un sort d'un rang aléatoire, ce qui ruine vos chances de l'utiliser. L'effet persiste jusqu'à ce que vous ayez bénéficié d'un repos. |
| 11 | Carabistouille ! Vous êtes désavantagé pour l'incantation de tous les sorts pendant les 10 prochains rounds. |
| 12 | Ennemi juré ! Quelque part, un enfant est né, qui deviendra votre redoutable ennemi juré un jour. |

## Origines diaboliques (d20)

| d20 | Origine |
|---|---|
| 1 | Ermite. La nature et ses créatures sont votre famille. |
| 2 | Paria. On vous a banni pour des crimes réels ou supposés. |
| 3 | Né dans les bois. On vous a trouvé au creux d'un chêne. |
| 4 | Amnésique. Votre passé est brumeux, mais des souvenirs vous reviennent. |
| 5 | Hanté. Un esprit sans repos veut quelque chose de votre part. |
| 6 | Fugitif. Un sauveur anonyme vous a aidé à disparaître. |
| 7 | Touché par les fées. Une fée s'est liée d'amitié avec vous pendant votre enfance. |
| 8 | Sang de sorcière. Ils ont brûlé votre mère mais vous ont épargné. |
| 9 | Cueilleur. Vous savez où trouver les plantes comestibles ou mortelles. |
| 10 | Rédempteur. Vous devez racheter le nom des vôtres. |
| 11 | Marqué. Vous portez une marque occulte. Malédiction ou don ? |
| 12 | Sacrifice. Promis à un sacrifice rituel, vous vous êtes échappé. |
| 13 | Naufragé. Ils vous ont abandonné, mais vous avez refusé de mourir. |
| 14 | Déchu. Vous êtes tombé en disgrâce. Ferez-vous pénitence ou épouserez-vous votre déchéance ? |
| 15 | Attiré. Vous entendez un murmure qui vous appelle et vous le suivez. |
| 16 | Ascète. La population vous craint, mais recherche vos conseils. |
| 17 | Enfant-loup. Il y a bien longtemps, vous êtes arrivé en ville couvert de fourrures. |
| 18 | Guérisseur. Vous comprenez le ballet de la vie et de la mort. |
| 19 | Élu. Un être occulte vous destine à un but bien précis. |
| 20 | Rejeton de démon. Un de vos ancêtres était un puissant démon. |

## Objets magiques — Trésors diaboliques (d20)

Table p.76 (4e de couverture). Contrairement à ce qui est noté dans
`js/cursedscroll.js` (« objets magiques sur cartes imprimées, pas de texte à
extraire »), cette table est bien du texte lisible dans le PDF — à ajouter à
`js/cursedscroll.js` (elle n'existe pas encore dans l'appli).

| d20 | Objet | Pouvoir |
|---|---|---|
| 1 | Os sculpté | Prend feu 1/jour pendant 1d4 rounds. |
| 2 | Globe oculaire | Repousse les insectes et les araignées à bout de bras. |
| 3 | Idole de loup | Flotte dans l'air là où on la place. |
| 4 | Rose séchée | Se tourne vers le nord quand on ne la touche pas. |
| 5 | Diablotin en bocal | Attire les créatures démoniaques vers sa position. |
| 6 | Bouquet de sauge | Une créature qui le tient ne peut pas mentir délibérément. |
| 7 | Clou de fer froid | Vous sentez si quelque chose est toxique. |
| 8 | Crâne difforme | Suinte du sang en présence de morts-vivants. |
| 9 | Miroir fêlé | Chante une obsédante berceuse quand on l'agite. |
| 10 | Doigt coupé | Appartient à une sorcière qui veut le récupérer. |
| 11 | Bougie noire | Cause douleur et dégoût chez les créatures féeriques. |
| 12 | Tête réduite | Peut ouvrir une seule fois un portail en sens unique vers l'enfer. |
| 13 | Bracelet de fleurs | Vous permet de retenir votre souffle pendant une heure. |
| 14 | Symbole impie | Un démon doit une faveur à son propriétaire. |
| 15 | Clef rouillée | 1/jour, immunité au feu pendant 1d4 rounds. |
| 16 | Fiole de sang | Roule lentement au loin si on la lâche. |
| 17 | Médaillon terni | 1/jour, lisez brièvement les pensées d'une créature. |
| 18 | Sac de dents | Rien ne peut écraser cet objet. |
| 19 | Flûte de pan | Lourde comme une enclume quand on ne la transporte pas. |
| 20 | Cerveau en bocal | Provoque le doute et l'hésitation chez les démons. |

## À confirmer avec Tristan

- **Table « Trésors diaboliques » (d20, p.76) manquante dans l'app** : elle est
  bien présente et lisible dans le PDF (voir section ci-dessus), contrairement
  à la note actuelle dans `js/cursedscroll.js` (« pas de texte à extraire »).
  À ajouter à `CURSED_SCROLL_DOCS[1]` si Tristan veut que l'onglet Cursed
  Scroll #1 l'affiche.
- **Titres de Sorcière, colonne Neutre** : la mise en page du PDF p.15 est
  ambiguë sur l'alignement exact des paliers 1-2/3-4/5-6/7-8 pour cette
  colonne (Chamane / Conjuratrice / Devineresse / Médiatrice / Baba semblent
  décalés d'une ligne par rapport aux autres colonnes à l'extraction). La
  lecture retenue ici suit celle déjà en place dans `TITRES` (`index.html`
  ligne 2394) plutôt que de re-trancher — à vérifier visuellement sur le PDF
  si un doute survient en jeu.
