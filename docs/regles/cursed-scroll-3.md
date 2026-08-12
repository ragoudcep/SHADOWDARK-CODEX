# Cursed Scroll #3 — « Soleil de minuit » (VF Arkhane Asylum)

Fiche de référence compacte extraite du PDF `1020701740-shd05-cursedscroll3.pdf` (68 pages).
Ne contient que le contenu utile à la création de personnage. Cartes, scénario ("Le Trésor
du roi des mers"), bestiaire et lore non mécanique ont été délibérément omis.

**Deux classes de PJ dans ce numéro : Loup des mers (p.10) et Augure (p.12).** Aucune autre
classe jouable n'est présente dans ce supplément.

---

## ⚠️ Correction — talent 10-11 du Loup des mers (p.10)

Le texte du PDF pour la table de talents du Loup des mers **a été extrait et vérifié avec
succès** (voir méthode plus bas). Il s'avère que ce n'est pas seulement la case 10-11 qui
était mal transcrite dans `index.html`, mais **toute la table qui était décalée d'une ligne**
par rapport au texte réel du PDF. Le vrai texte, ligne par ligne, est :

| 2d6 | Effet |
|---|---|
| 2 | 1/jour, la furie guerrière vous prend : immunisé aux dégâts pendant 3 rounds. |
| 3-6 | Vos attaques infligent +1 dégât. |
| 7-9 | +2 en Force ou en Constitution, ou +1 aux attaques. |
| **10-11** | **Dualité ; choisissez deux effets d'anciens dieux différents chaque jour.** |
| 12 | Choisissez un talent ou +2 points à répartir parmi vos caractéristiques. |

Note en tête de table (règle des doublons) : *« 2 en double = +1 utilisation/jour, 10-11 en
double = relancez »* — sous-entendu : quand un double naturel donne 2 (double 1), vous
gagnez une utilisation supplémentaire par jour de l'effet obtenu à 2 (la furie guerrière) ;
quand un double naturel donne 10-11 (double 5), vous relancez au lieu de cumuler l'effet.

**Donc le talent 10-11 réel est « Dualité ; choisissez deux effets d'anciens dieux différents
chaque jour »**, PAS « +2 en Force ou en Constitution, ou +1 aux attaques » (qui est en fait
le texte de la case **7-9**), et encore moins la valeur provisoire actuellement codée en dur
dans `index.html` (« +1 aux attaques à distance ou de corps à corps », qui n'apparaît nulle
part dans le PDF).

### Comment la vérification a été faite

`pdftotext -layout` mélangeait les colonnes de la table (le texte de chaque ligne semblait
décalé par rapport à son numéro 2d6, d'où l'« illisibilité » relevée précédemment). En
extrayant la même page **sans** `-layout` (flux de texte brut dans l'ordre d'impression du
PDF), le motif devient clair : toutes les étiquettes 2d6 (`2`, `3-6`, `7-9`, `10-11`, `12`)
sortent d'abord groupées, suivies de tous les textes des cases dans le même ordre, avec en
tête le mot d'en-tête de colonne « Effet (...) » à retirer. Il suffit alors de ré-apparier
étiquette *n* ↔ texte *n* dans l'ordre. Le même motif, appliqué à la table des talents
d'Augure (p.12), redonne **exactement** les 5 lignes déjà présentes dans `index.html` pour
cette classe — ce qui confirme que la méthode est fiable et que la table Augure actuelle est
correcte (elle n'a pas besoin d'être corrigée).

**Action recommandée pour `index.html`** : remplacer la table de talents du Loup des mers par
la version ci-dessus (colonne "## Classes > Loup des mers" plus bas dans ce fichier) — les
textes des cases 2, 3-6, 7-9 et 12 changent aussi, pas seulement 10-11.

---

## Classes

### Loup des mers (p.10)

Maraudeurs des mers qui s'en prennent aux îles et les pillent à bord de leurs bateaux à tête
de dragon. Lorsque sonne le cor de guerre, ils se transforment en féroces berserkers et
porteuses de bouclier dans l'espoir d'offrir une mort courageuse à leurs dieux.

- **Armes** : dague, hache à deux mains, hache à une main (cf. "Nouvel équipement"), arc long,
  épée longue, lance.
- **Armure** : armure de cuir, cotte de mailles, boucliers.
- **Points de vie** : 1d8 par niveau.

**Capacités de classe**

- **Marin.** Vous êtes avantagé lors des tests liés à la navigation et au maniement des
  bateaux.
- **Anciens dieux.** Chaque jour, vous vous harmonisez avec l'un des anciens dieux (voir plus
  bas). Choisissez l'une des options ci-dessous après avoir bénéficié d'un repos : vous
  recevez les atouts qu'elle octroie jusqu'à votre prochain repos.
  - **Odin.** Vous regagnez 1d4 PV chaque fois que vous tuez un ennemi.
  - **Freya.** 1/jour, recevez un jeton de chance si vous n'en avez pas. Chaque fois que vous
    utilisez un jeton de chance, ajoutez 1d6 à votre jet de dé.
  - **Loki.** Vous êtes avantagé aux tests visant à mentir, à vous déplacer discrètement et à
    vous cacher.
- **Mur de boucliers.** Si vous maniez un bouclier, vous pouvez utiliser votre action pour
  adopter une posture défensive. Votre CA passe à 20 pendant que vous le faites.

**Talents du Loup des mers (2d6)** — *(2 en double = +1 utilisation/jour, 10-11 en double =
relancez)*

| 2d6 | Effet |
|---|---|
| 2 | 1/jour, la furie guerrière vous prend : immunisé aux dégâts pendant 3 rounds. |
| 3-6 | Vos attaques infligent +1 dégât. |
| 7-9 | +2 en Force ou en Constitution, ou +1 aux attaques. |
| 10-11 | Dualité ; choisissez deux effets d'anciens dieux différents chaque jour. |
| 12 | Choisissez un talent ou +2 points à répartir parmi vos caractéristiques. |

**Titres de Loup des mers**

| Niveau | Loyal | Chaotique | Neutre |
|---|---|---|---|
| 1-2 | Homme/Femme libre | Agitateur | Vagabond |
| 3-4 | Porte-bouclier | Pillard | Explorateur |
| 5-6 | Thane | Maraudeur | Aventurier |
| 7-8 | Jarl | Conquérant | Renommé |
| 9-10 | Roi/Reine | Usurpateur | Légendaire |

---

### Augure (p.12)

Funestes devins qui empestent la fumée et le sang. Ils déchiffrent les murmures des dieux en
lisant les runes, les os et les étoiles. Leur connaissance du destin leur permet de l'altérer.

- **Armes** : dague, canne, lance.
- **Armure** : armure de cuir.
- **Points de vie** : 1d6 par niveau.

**Capacités de classe**

- **Destin.** Chaque fois que vous utilisez un jeton de chance, ajoutez 1d6 au jet de dé.
- **Présage.** 3/jour, vous pouvez effectuer un test de SAG ND 9. En cas de réussite, recevez
  un jeton de chance (vous ne pouvez pas en avoir plus d'un à la fois).
- **Incantation.** Vous pouvez lancer les sorts d'augure que vous connaissez. Vous connaissez
  un sort de rang 1 de votre choix, à choisir dans la liste de sorts d'augure. Chaque fois que
  vous gagnez un sort, vous choisissez un nouveau sort d'augure conformément à la table des
  sorts d'augure connus. Vous utilisez votre Sagesse pour lancer les sorts d'augure. Le ND est
  égal à 10 + le rang du sort. Si vous ratez le test d'incantation, vous ne pouvez plus lancer
  le sort à moins d'avoir bénéficié d'un repos complet. Si vous obtenez un 1 naturel au test
  d'incantation, vous ne pouvez plus le lancer avant d'avoir accompli une pénitence d'augure
  (voir table plus bas).

**Talents d'Augure (2d6)**

| 2d6 | Effet |
|---|---|
| 2 | Apprenez un nouveau sort d'augure d'un rang qui vous est accessible. |
| 3-6 | Recevez une utilisation supplémentaire de Présage par jour. |
| 7-9 | +2 en SAG ou en CHA, ou +1 à vos tests d'incantation. |
| 10-11 | Votre dé de Destin augmente d'un cran (d6→d8, d8→d10...). |
| 12 | Choisissez un talent ou +2 points à répartir parmi vos caractéristiques. |

*(Cette table est identique à celle déjà présente dans `index.html` — confirmée correcte par
la vérification décrite plus haut, aucune correction nécessaire.)*

**Sorts d'augure connus par rang de sort (selon le niveau)**

| Niveau | Rang 1 | Rang 2 | Rang 3 | Rang 4 | Rang 5 |
|---|---|---|---|---|---|
| 1 | 1 | - | - | - | - |
| 2 | 2 | - | - | - | - |
| 3 | 2 | 1 | - | - | - |
| 4 | 2 | 2 | - | - | - |
| 5 | 2 | 2 | 1 | - | - |
| 6 | 2 | 2 | 2 | - | - |
| 7 | 2 | 2 | 2 | 1 | - |
| 8 | 2 | 2 | 2 | 2 | - |
| 9 | 2 | 2 | 2 | 2 | 1 |
| 10 | 2 | 2 | 2 | 2 | 2 |

**Pénitence d'augure** (sacrifice imposé après un 1 naturel raté à un test d'incantation, tant
que non accomplie le sort concerné reste bloqué) :

| Rang de sort | Sacrifice requis |
|---|---|
| 1 | Renoncez temporairement à 1d4 PV (vous descendez au minimum à 1 PV), récupérés après une semaine. |
| 2 | Votre SAG diminue temporairement de 2 points, récupérés après deux semaines. |
| 3 | Sacrifiez 1 point de Charisme que vous ne récupérerez jamais. |
| 4 | Faites couler rituellement un bateau long en feu dans la mer. |
| 5 | Sacrifiez rituellement 9 humanoïdes. |

**Titres d'Augure**

| Niveau | Loyal | Chaotique | Neutre |
|---|---|---|---|
| 1-2 | Guide | Sorcière des bois | Diseuse de bonne aventure |
| 3-4 | Chantre | Chuchoteuse | Chanteuse |
| 5-6 | Lectrice des runes | Lectrice des os | Lectrice des astres |
| 7-8 | Sagace | Redoutable | Bénie |
| 9-10 | Augure d'Odin | Augure de Loki | Augure de Freya |

---

## Origines nordiques (d20) — table de contexte pour la création de PJ

| d20 | Origine |
|---|---|
| 1 | Affranchi. Vous étiez esclave, mais vous vous êtes évadé ou vous avez gagné votre liberté. |
| 2 | Réfugié. Vous avez fui lorsqu'un jarl rival a attaqué votre village. |
| 3 | Criminel. On vous a exilé de votre village pour un crime. |
| 4 | Vagabond. Vous n'avez pas encore trouvé de jarl digne de votre loyauté. |
| 5 | Fermier. Vous cultivez la terre et connaissez toutes les plantes. |
| 6 | Éleveur. Vous avez des intuitions à propos de tous les animaux. |
| 7 | Chasseur. Vous savez vous déplacer sans bruit dans la nature. |
| 8 | Pêcheur. Vous connaissez toutes les créatures et toutes les légendes des mers. |
| 9 | Homme de main. Vous faites appliquer la loi du jarl dans votre village. |
| 10 | Commerçant. Vous avez des contacts mercantiles dans tous les villages. |
| 11 | Artisan. Vous savez fabriquer et réparer tous les objets du quotidien. |
| 12 | Fabricant d'arcs. Vous savez fabriquer et réparer tous les arcs et flèches. |
| 13 | Apprenti augure. Vous connaissez un peu les arts mystiques. |
| 14 | Fabricant de bateaux. Vous savez fabriquer et réparer des bateaux longs. |
| 15 | Forgeron. Armes, armures, fers à cheval : tous font partie de votre domaine. |
| 16 | Voyageur au long cours. Vous connaissez bien des peuples et coutumes de contrées lointaines. |
| 17 | Scalde. Vous êtes un poète et connaissez les ballades de jadis. |
| 18 | Descendant de héros. Vous êtes le descendant d'un célèbre guerrier. |
| 19 | Noble. Vous êtes fils de... 1d6 : 1-5. Jarl, 6. Roi. |
| 20 | Sang de dieu. Vous descendez d'un dieu, dont vous portez la marque. |

## Noms nordiques (d20) — table de génération de nom

| d20 | Masculin | Féminin | Nom de famille | Titre |
|---|---|---|---|---|
| 1 | Asger | Alva | Aberg | Yeux de feu |
| 2 | Audun | Astrid | Brand | Fils/Fille d'orage |
| 3 | Balder | Aslaug | Carlson | L'Aigle |
| 4 | Bjorn | Bodil | Edman | Os-de-fer |
| 5 | Canute | Brenna | Erling | Fils/Fille du soleil |
| 6 | Eirik | Brunhilde | Friberg | Le/La Féroce |
| 7 | Elof | Dagny | Helvig | Cœur de loup |
| 8 | Frey | Eira | Holmen | Bras de roc |
| 9 | Gulbrand | Embla | Junge | Premier/Première né(e) |
| 10 | Hagen | Freja | Kron | Le Marteau |
| 11 | Haldor | Gunhilde | Lund | Longue Course |
| 12 | Hjalmar | Helka | Nyland | Diable(sse) des mers |
| 13 | Ingolf | Inge | Olander | La Chance |
| 14 | Ivar | Jorunn | Risberg | Fils/Fille d'Odin |
| 15 | Jerrik | Ranga | Sigmond | Brise-écu |
| 16 | Oluf | Runa | Toft | Cœur d'ours |
| 17 | Rangvald | Sigrid | Trygg | Le Serpent |
| 18 | Sigurd | Thyra | Vang | Fils/Fille de la nuit |
| 19 | Torvald | Toril | Westberg | Le Tueur/La Tueuse |
| 20 | Ulf | Ylva | Westergard | L'Élu(e) |

## Les Anciens dieux (lore, référencé par la capacité "Anciens dieux" du Loup des mers)

- **Odin (Loyal).** Le Père de Tout. Odin le Borgne apprécie la force et l'astuce. Ses corbeaux
  jumeaux sillonnent la nuit pour épier les songes et les souvenirs. Les guerriers qui s'en
  montrent dignes sont conduits au Grand Hall du Valhalla à leur mort afin de festoyer et de
  combattre éternellement à ses côtés.
- **Freya (Neutre).** Déesse de l'amour et de la haine. La Reine des Porteuses de Bouclier,
  dont les valkyries conduisent les âmes des guerriers et guerrières dignes jusqu'au Grand
  Festin. La Première Augure qui dépose ses présages dans les os, le sang et les entrailles.
  Freya inspire les poètes, mais leur inflige aussi les manques et les tourments.
- **Loki (Chaotique).** Le Menteur qui l'emporte par la ruse et l'esprit. Le loup qui se fait
  passer pour un agneau. Loki est aussi désinvolte qu'exaspérant, ses mots tranchent comme
  l'acier et son rire retentit comme un ouragan. Ses disciples n'aspirent pas au Valhalla, car
  ils savent qu'il s'écroulera à l'heure du Ragnarok.

## Nouvel équipement (armes/armure référencées par la classe Loup des mers)

**Armes**

| Arme | Coût | Type | Portée | Dégâts | Propriétés |
|---|---|---|---|---|---|
| Canne | 2 po | C-C | Courte | 1d6 | Deux mains (2M), Rupture (Ru), Finesse (F) |
| Hache à une main | 2 po | C-C/Distance | Courte/Intermédiaire | 1d6 | Jet (J) |

**Armure**

| Objet | Coût | Emp. d'inventaire | CA | Propriété |
|---|---|---|---|---|
| Bouclier rond | 15 po | 1 | +2 | Occupe une main, Rupture (Ru) |

**Propriétés**

- **Finesse (F).** Vous pouvez utiliser soit votre FOR soit votre DEX pour attaquer avec cette
  arme.
- **Rupture (Ru).** Quand vous êtes touché par une attaque de corps à corps, vous pouvez
  choisir de détruire cette arme ou cette armure pour annuler tous les dégâts de l'attaque.
- **Jet (J).** Vous pouvez lancer cette arme pour effectuer une attaque à distance au moyen de
  FOR ou de DEX.
- **Deux mains (2M).** Vous devez manier cette arme à deux mains.

## Sorts d'augure — texte complet

**Liste par rang**

- Rang 1 : Chant, Invocation de rage, Potion, Transe
- Rang 2 : Âme scellée, Destinée, Lecture des runes, Sacrifice
- Rang 3 : Bannissement, Corbeau, Forme de loup, Hallucination
- Rang 4 : Présage de Freya, Sagesse d'Odin, Tonnerre de Thor, Tromperie de Loki
- Rang 5 : Arbre du monde, Ragnarok, Serpent du monde, Valkyrie

**Âme scellée** — Rang 2, augure. Durée : concentration. Portée : courte. Vous scellez l'âme
d'une créature vivante, ce qui empêche toute magie de pomper son énergie. Une créature que
vous touchez devient presque invulnérable à toute magie. Pendant la durée du sort, le ND du
test d'incantation des autres sorts qui la prennent pour cible (bénéfiques ou néfastes) passe
à 18. Ce sort s'achève dès que la cible est affectée par un autre sort.

**Arbre du monde** — Rang 5, augure. Durée : concentration. Portée : courte. Les racines de
l'arbre du monde, source de vie, s'enroulent autour de l'âme d'une créature que vous touchez.
Pendant la durée du sort, la cible ne peut pas tomber en dessous de 1 PV.

**Bannissement** — Rang 3, augure. Durée : concentration. Portée : longue. Vous renvoyez une
créature et la projetez loin de vous. Choisissez une créature que vous voyez. Pendant la durée
du sort, elle ne peut pas venir à portée intermédiaire de vous (ou plus près). Elle peut
toujours vous attaquer au-delà de cette portée.

**Chant** — Rang 1, augure. Durée : concentration. Portée : personnelle. Vous entonnez un
chant d'un autre monde qui lève les limites ordinaires de votre vision. Pendant la durée du
sort, vous voyez toutes les choses invisibles ou cachées comme si elles étaient tout à fait
visibles. Ce sort ne vous permet toutefois pas de voir de manière impossible pour vous, comme
dans l'obscurité absolue ou à travers les murs.

**Corbeau** — Rang 3, augure. Durée : instantanée. Portée : illimitée. Vous chuchotez un
message aux corbeaux d'Odin lui-même, et ils le portent au destinataire, même s'il se trouve à
l'autre bout du monde. Prononcez une courte phrase ainsi que le nom du destinataire, mort ou
vivant. La créature l'entend comme un chuchotement dans sa tête.

**Destinée** — Rang 2, augure. Durée : instantanée. Portée : intermédiaire. Vous tordez
douloureusement les fils dorés de la destinée d'une créature. Une créature que vous prenez
pour cible et située à portée subit 1d10 dégâts et perd tout jeton de chance qu'elle possède.

**Forme de loup** — Rang 3, augure. Durée : concentration. Portée : personnelle. Vous vous
transformez en loup avec votre équipement pendant la durée du sort. Vous adoptez FOR, DEX,
CON, PV, CA, vitesse, attaques et caractéristiques de la bête tout en conservant votre INT,
SAG et CHA. Vous pouvez lancer des sorts sous cette forme. Si vous tombez à 0 PV, vous
reprenez votre forme d'origine à 0 PV. Si vous êtes de niveau 5+, vous pouvez vous transformer
en loup sanguinaire ou hivernal à la place.

**Hallucination** — Rang 3, augure. Durée : concentration. Portée : intermédiaire. Une
créature que vous prenez pour cible à portée intermédiaire, et dont le niveau est inférieur ou
égal au vôtre, subit des visions de ce qui risque de se produire. Pendant la durée du sort, la
cible ne peut pas agir à son tour à moins de réussir un test de SAG ND égal à votre test
d'incantation.

**Invocation de rage** — Rang 1, augure. Durée : 1d4 rounds. Portée : courte. Vous invoquez la
rage de berserker qui habite autrui. Un humanoïde consentant que vous touchez est pris de
folie guerrière. La cible est immunisée contre les tests de moral, dispose de l'avantage aux
tests de FOR et aux jets d'attaque de corps à corps, et inflige +1d4 dégâts pendant la durée
du sort. Si la cible n'attaque pas une autre créature à son tour, le sort s'achève.

**Lecture des runes** — Rang 2, augure. Durée : instantanée. Portée : personnelle. Vous posez
aux dieux une question et vous lancez les runes avant d'en interpréter le résultat. Posez au
meneur de jeu une question. Il doit répondre sincèrement par oui ou par non.

**Potion** — Rang 1, augure. Durée : instantanée. Portée : courte. Dans le cadre de ce sort,
vous devez bénir une boisson ou un liquide. Le liquide reçoit des propriétés curatives pendant
1 journée. Une créature qui l'avale peut mettre un terme aux effets d'un poison ou
immédiatement cesser de mourir (elle demeure à 0 PV).

**Présage de Freya** — Rang 4, augure. Durée : 1d6 rounds. Portée : personnelle. Pendant la
durée du sort, vous ne perdez pas le pouvoir de lancer un sort si vous ratez un test
d'incantation. Si vous subissez un échec critique à un test d'incantation, vous pouvez le
refaire, mais vous devez conserver le nouveau résultat.

**Ragnarok** — Rang 5, augure. Durée : instantanée. Portée : longue. Vous examinez en
profondeur les fils de la destinée pour y déceler le sort d'une âme après la bataille de
Ragnarok. Survivra-t-elle ou mourra-t-elle ? Choisissez une créature à portée. Vous ne pouvez
prendre une créature pour cible avec ce sort qu'une seule fois. Cette créature doit réussir un
test de CON contre le résultat de votre test d'incantation pour éviter de mourir sur-le-champ.

**Sagesse d'Odin** — Rang 4, augure. Durée : 1d6 rounds. Portée : personnelle. Pendant la
durée du sort, ajoutez à vos tests de Sagesse et d'incantation un bonus égal à votre niveau.

**Sacrifice** — Rang 2, augure. Durée : instantanée. Portée : courte. Dans le cadre de
l'incantation de ce sort, vous devez procéder au sacrifice rituel d'une créature de NV 2 ou
supérieur. La cible que vous touchez gagne à son prochain test ou jet d'attaque un bonus égal
au niveau de la créature sacrifiée.

**Serpent du monde** — Rang 5, augure. Durée : concentration. Portée : courte. Le douloureux
venin du serpent du monde coule des armes d'une créature que vous touchez. La cible inflige le
double de dégâts à chaque attaque (le quadruple en cas de coup critique) pendant la durée du
sort.

**Tonnerre de Thor** — Rang 4, augure. Durée : instantanée. Portée : longue. Thor lance un
éclair qui frappe une cible. Celle-ci subit 3d6 dégâts.

**Transe** — Rang 1, augure. Durée : instantanée. Portée : courte. Vous entrez en transe et
apercevez des bribes du destin d'une créature. Une créature humanoïde que vous touchez (vous
ne pouvez pas vous prendre vous-même pour cible) reçoit un jeton de chance. Elle ne peut pas
en avoir plus d'un à la fois.

**Tromperie de Loki** — Rang 4, augure. Durée : instantanée. Portée : intermédiaire. Vous êtes
investi de la malice fascinante de Loki. Les convictions et les souvenirs des créatures qui
vous entendent parler se modifieront pour coller à votre suggestion. Prenez pour cible une
créature capable de vous entendre et de vous comprendre, et située à portée. Vous exprimez une
affirmation plausible, qu'elle soit vraie ou non. La cible doit effectuer un test de Sagesse
contre le résultat de votre test d'incantation. Si elle échoue, elle croit désormais ce que
vous avez annoncé comme s'il s'agissait d'un fait avéré, quoi qu'elle sache de son côté.

**Valkyrie** — Rang 5, augure. Durée : 10 rounds. Portée : intermédiaire. Vous appelez une
valkyrie à l'aide. Elle apparaît à un endroit situé à portée intermédiaire et agit de son
propre chef pour vous aider. Elle retourne au Valhalla une fois que le sort s'achève. Vous ne
pouvez plus lancer ce sort avant d'avoir fait pénitence.

---

## Objets magiques / reliques

**Aucun objet magique ni relique avec propriétés mécaniques n'est décrit dans ce PDF.** Le
seul tableau de trésor présent, « Butin des loups des mers dans les contrées lointaines »
(p.68, d20), liste des objets de valeur purement mondains (symboles sacrés, calices,
statuettes, etc., avec un prix en po croissant de 10 à 200) — aucun n'a d'effet magique ou de
propriété jouable ; ils appartiennent au module d'aventure « Le Trésor du roi des mers » et
n'ont pas été extraits ici conformément au périmètre demandé (pas de scénario/aventure).

---

## À confirmer avec Tristan

- **Priorité : corriger la table de talents du Loup des mers dans `index.html`** (lignes
  ~2265-2271 de `CLASSES_DATA`). Ce n'est pas qu'une correction de la case 10-11 : les 4
  premières cases (2, 3-6, 7-9, 12) doivent aussi être réécrites avec les textes ci-dessus —
  la version actuellement en place mélangeait deux effets à la case "2" et plaçait "Dualité"
  en case 7-9 au lieu de 10-11.
- La note de doublons *(« 2 en double = +1 utilisation/jour, 10-11 en double = relancez »)*
  n'est actuellement pas du tout implémentée dans `index.html` (aucune mention des doubles).
  À voir si l'appli gère déjà une mécanique de "double naturel" pour les tables de talents
  d'autres classes, ou si c'est à ajouter/ignorer pour cette classe en particulier.
- Sections volontairement exclues de cette fiche (hors périmètre "création de PJ") :
  Serments (p.22, mécanique de vœux avec gains/pertes de PV permanents — pourrait intéresser
  la progression de PJ si souhaité plus tard), Bateaux (p.21, stats de véhicules), Rencontres
  et tables hexagonales des îles d'Andrik (p.2-6, exploration), le module d'aventure complet
  "Le Trésor du roi des mers" (p.49-68) et le bestiaire (p.43-47). Dire si l'une de ces
  sections doit finalement être ajoutée à une fiche séparée.
