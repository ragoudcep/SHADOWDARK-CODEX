/* =========================================================================
   CURSED SCROLL — doc de référence MJ (création de personnage uniquement) pour
   les suppléments tiers Cursed Scroll #1 à #6. Contenu STATIQUE (pas de
   collection Supabase, pas de CRUD) : ce n'est pas du contenu de campagne
   éditable, juste une doc que je compile une fois depuis les PDF fournis par
   Tristan — classes, mentors, tables et sorts liés à la création de PJ
   uniquement (pas les scénarios/donjons/hexcrawl de chaque numéro).
   2026-08-12 : #1 à #6 compilés. Toute mention textuelle d'une table aléatoire (hors tables de
   talents, gardées en texte à la demande de Tristan) est un vrai lien [[Nom]] vers la collection
   Tables aléatoires — voir seedCursedScrollTables() pour les tables ainsi créées (Bienfaits de
   mentor, Catastrophes diaboliques). Les tables d'objets/trésors de chaque numéro restent ici en
   contenu statique (spoiler MJ, pas encore attribué à un PJ) plutôt que dans la collection Trésor
   Supabase — voir docs/AUDIT.md pour le détail du choix. */
let cursedScrollSub = 1;

const CS1_ORIGINES = [
  "Ermite. La nature et ses créatures sont votre famille.",
  "Paria. On vous a banni pour des crimes réels ou supposés.",
  "Né dans les bois. On vous a trouvé au creux d'un chêne.",
  "Amnésique. Votre passé est brumeux, mais des souvenirs vous reviennent.",
  "Hanté. Un esprit sans repos veut quelque chose de votre part.",
  "Fugitif. Un sauveur anonyme vous a aidé à disparaître.",
  "Touché par les fées. Une fée s'est liée d'amitié avec vous pendant votre enfance.",
  "Sang de sorcière. Ils ont brûlé votre mère mais vous ont épargné.",
  "Cueilleur. Vous savez où trouver les plantes comestibles ou mortelles.",
  "Rédempteur. Vous devez racheter le nom des vôtres.",
  "Marqué. Vous portez une marque occulte. Malédiction ou don ?",
  "Sacrifice. Promis à un sacrifice rituel, vous vous êtes échappé.",
  "Naufragé. Ils vous ont abandonné, mais vous avez refusé de mourir.",
  "Déchu. Vous êtes tombé en disgrâce. Ferez-vous pénitence ou épouserez-vous votre déchéance ?",
  "Attiré. Vous entendez un murmure qui vous appelle et vous le suivez.",
  "Ascète. La population vous craint, mais recherche vos conseils.",
  "Enfant-loup. Il y a bien longtemps, vous êtes arrivé en ville couvert de fourrures.",
  "Guérisseur. Vous comprenez le ballet de la vie et de la mort.",
  "Élu. Un être occulte vous destine à un but bien précis.",
  "Rejeton de démon. Un de vos ancêtres était un puissant démon."
];
const CS1_CATASTROPHES_13 = [
  "Diablerie ! Tirez deux fois et combinez les deux effets (relancez d'autres 1 éventuels).",
  "Flétrissure ! Vous subissez 1d6 dégâts par rang de sort.",
  "Salamandre ! Vous vous transformez en minuscule salamandre à 1 point de vie pendant 3 rounds. Vous ne pouvez pas lancer de sorts sous cette forme.",
  "Regard malveillant de Shune ! Vous ne pouvez plus lancer ce sort ni un autre (tiré au hasard) pendant une semaine.",
  "Fées chapardeuses ! Vous perdez un élément d'équipement au hasard.",
  "Toiles d'araignée ! Des toiles d'araignées mentales vous encombrent l'esprit ; vous ne pouvez plus lancer ce sort pendant une semaine.",
  "Ricanements ! Vous vous effondrez en proie à l'hilarité, incapable de faire autre chose que de rire aux éclats pendant les 3 prochains rounds.",
  "Double effet néfaste ! Vous perdez la capacité de lancer un sort tiré au hasard jusqu'à votre prochain repos.",
  "Gaz des marais ! L'air se remplit de gaz sulfureux dans un cube de taille intermédiaire autour de vous. Toutes les créatures qui terminent leur tour à l'intérieur sont aveuglées et subissent 1d6 dégâts. L'effet dure 3 rounds.",
  "Chauve-souris ! Une chauve-souris furieuse apparaît sur votre tête, battant des ailes et s'accrochant à votre peau. Vous restez aveuglé pendant 3 rounds ou jusqu'à ce que vous parveniez à repousser cette bestiole.",
  "Sel ! Vous êtes entouré d'un cercle de sel que vous ne pouvez ni toucher ni traverser tant que personne ne l'a rompu.",
  "Siphon ! Vous êtes désavantagé lors de l'incantation des sorts de rang inférieur ou égal pendant les 10 prochains rounds."
];
const CS1_CATASTROPHES_45 = [
  "Maelström ! Tirez deux fois et combinez les deux effets (relancez d'autres 1 éventuels).",
  "Ruine ! Vous subissez 1d8 dégâts par rang de sort.",
  "Gangrène mentale ! Vous oubliez définitivement un sort tiré au hasard.",
  "L'Homme-saule ! Vous invoquez l'Homme-saule (qui vous en veut) dans une case proche de vous. Il reste 1d6 rounds avant de retourner là d'où il est venu.",
  "Fichus diablotins ! Des diablotins surgissent en ricanant des Enfers pour vous submerger, vous voler trois éléments aléatoires d'équipement et disparaître en battant des ailes.",
  "Foudre ! Vous vous infligez 3d6 dégâts, à vous et à toutes les créatures proches.",
  "Fer froid ! Des clous de fer froid jaillissent de l'éther pour vous transpercer. Vous subissez 2d6 dégâts et vous êtes paralysé pendant 2 rounds.",
  "Mère de la nuit ! Vous avez déplu à la Mère Obscure et perdez le pouvoir de lancer ce sort tant que vous ne vous êtes pas racheté à ses yeux.",
  "Catatonie ! Vous regardez dans le vide et ne pouvez plus agir pendant l'heure qui suit.",
  "Langue de chien ! Votre langue se déroule et pend chaque fois que vous tentez de lancer un sort d'un rang aléatoire, ce qui ruine vos chances de l'utiliser. L'effet persiste jusqu'à ce que vous ayez bénéficié d'un repos.",
  "Carabistouille ! Vous êtes désavantagé pour l'incantation de tous les sorts pendant les 10 prochains rounds.",
  "Ennemi juré ! Quelque part, un enfant est né, qui deviendra votre redoutable ennemi juré un jour."
];
const CS1_SPELLS = [
  {name:"Brouillard", tier:1, duration:"Concentration", range:"Courte", text:"Un épais nuage de brouillard se lève jusqu'à portée courte autour de vous et empêche de vous voir facilement. Il se déplace avec vous. Les attaques portées contre les créatures situées dans le nuage sont désavantagées."},
  {name:"Charme-personne", tier:1, duration:"1d8 jours", range:"Intermédiaire", text:"Vous séduisez par magie un humanoïde de niveau 2 ou moins, situé à portée intermédiaire, et qui vous considère comme un ami pendant la durée du sort. Le sort s'achève si vous ou vos alliés faites quoi que ce soit pour lui nuire et qu'il le remarque. Quand l'effet du sort s'achève, la cible sait que vous l'avez ensorcelée."},
  {name:"Chaudron", tier:1, duration:"1 round", range:"Courte", text:"Vous faites apparaître un chaudron bouillonnant près de vous. Il produit l'un des effets suivants : tout objet ordinaire brisé qu'on y plonge en ressort réparé ; un crapaud obèse en bondit en coassant et suit vos instructions pendant les 3 prochains rounds ; vous pouvez placer l'équivalent de 3 emplacements d'inventaire dans le chaudron — il recrache les objets la prochaine fois que vous lancez le sort."},
  {name:"Chêne, frêne et roncier", tier:1, duration:"Concentration", range:"Personnelle", text:"Pendant la durée du sort, les êtres féeriques, les démons et les diables ne peuvent pas vous attaquer. Il leur est également impossible de vous posséder, de vous contraindre à leur obéir ou de vous charmer."},
  {name:"Danse de l'ombre", tier:1, duration:"3 rounds", range:"Intermédiaire", text:"Vous matérialisez la substance de l'ombre pour créer une illusion visible et audible à portée intermédiaire. L'illusion peut être aussi grande qu'une personne et peut se déplacer à portée intermédiaire de son point d'apparition. Elle ne peut pas affecter les objets physiques. Toucher l'illusion révèle son caractère factice."},
  {name:"Homme-saule", tier:1, duration:"Instantanée", range:"Intermédiaire", text:"Vous invoquez l'Homme-saule pour qu'il apparaisse dans l'esprit d'une créature, qu'il remplit d'un effroi surnaturel. Choisissez une créature de NV 2 ou inférieur à portée. Elle doit effectuer un test de moral. Même les créatures qui ne sont pas sujettes aux tests de moral (comme les morts-vivants) doivent s'y plier."},
  {name:"Hypnose", tier:1, duration:"Concentration", range:"Intermédiaire", text:"Une créature de NV 3 ou moins et que vous pouvez voir est abasourdie. Si quelque chose interrompt la ligne de vue qui vous relie à votre cible, elle a droit à un test de CHA ND 15. En cas de réussite, le sort s'interrompt."},
  {name:"Marionnette", tier:1, duration:"Concentration", range:"Courte", text:"Une créature humanoïde de NV 2 ou moins que vous touchez devient soumise à vos propres gestes. À votre tour, les mouvements de la créature imitent tous les vôtres. Si cette gestuelle pousse la cible à se blesser, elle ou un allié, elle peut effectuer un test de CHA ND 15 pour résister."},
  {name:"Œil meurtri", tier:1, duration:"Instantanée", range:"Intermédiaire", text:"Une créature que vous prenez pour cible subit 1d4 dégâts et ne peut plus vous voir jusqu'à la fin de son prochain tour."},
  {name:"Sorceflamme", tier:1, duration:"Concentration", range:"Intermédiaire", text:"Vous faites apparaître un feu follet des marais en suspension dans l'air, qui éclaire jusqu'à portée courte autour de vous. La lumière change de couleur et adopte des formes vagues. Elle peut flotter jusqu'à distance intermédiaire lors de votre tour."},
  {name:"Altération physique", tier:2, duration:"5 rounds", range:"Personnelle", text:"Vous modifiez votre forme physique par magie et recevez un trait qui change votre anatomie (branchies, griffes...). Ce sort ne permet pas de faire pousser d'ailes ni de membres."},
  {name:"Augure noir", tier:2, duration:"Instantanée", range:"Personnelle", text:"Vous interprétez le sens de présages et autres signes surnaturels. Posez une question au MJ au sujet d'une action spécifique que vous souhaitez entreprendre. Il vous dira s'il en résultera « félicité » ou « calamité »."},
  {name:"Champignon vénéneux", tier:2, duration:"Instantanée", range:"Personnelle", text:"Vous faites apparaître un gros champignon moucheté dans votre main. Il disparaît à la fin de votre prochain tour. Une créature qui le mange regagne 1d6 points de vie."},
  {name:"Enlisement", tier:2, duration:"5 rounds", range:"Longue", text:"Vous transformez un cube de terrain de taille intermédiaire en sables mouvants bouillonnants. Une créature prise dans la zone ne peut plus se déplacer et doit réussir un test de Dextérité contre votre test d'incantation pour se libérer. Si lancé plus d'1x/24h, un échec devient critique."},
  {name:"Infects ricanements", tier:2, duration:"Concentration", range:"Courte", text:"Vous touchez une cible de NV 4 ou moins et elle s'effondre, impuissante, en proie à un rire troublant et douloureux pendant la durée du sort."},
  {name:"Invisibilité", tier:2, duration:"10 rounds", range:"Courte", text:"Une créature que vous touchez devient invisible pendant la durée du sort. Le sort s'achève si la cible attaque ou lance un sort."},
  {name:"Œil de chat", tier:2, duration:"Concentration", range:"Personnelle", text:"Vos pupilles se transforment en fentes noires verticales. Pendant la durée du sort, vous voyez les créatures invisibles et les portes secrètes."},
  {name:"Pattes d'araignée", tier:2, duration:"Concentration", range:"Personnelle", text:"De la soie d'araignée gluante vous couvre les mains et les pieds. Pendant la durée du sort, vous pouvez marcher sur les surfaces verticales aussi aisément que sur un sol plat."},
  {name:"Pluie de grenouilles", tier:2, duration:"Instantanée", range:"Longue", text:"Une pluie de grenouilles s'abat dans un cube de taille intermédiaire, autour d'un point que vous pouvez voir à portée. Toutes les créatures dans la zone subissent 1d6 dégâts."},
  {name:"Poison", tier:2, duration:"5 rounds", range:"Courte", text:"Un objet porté ou manié que vous touchez devient toxique pendant la durée du sort. Toute créature en contact avec l'objet au début de son tour subit 1d6 dégâts."},
  {name:"Balai", tier:3, duration:"Concentration", range:"Personnelle", text:"Vous faites apparaître un balai volant dans votre main. La personne qui le chevauche peut voler à distance intermédiaire chaque round ou rester en lévitation sur place."},
  {name:"Communication avec les morts", tier:3, duration:"Instantanée", range:"Courte", text:"Un cadavre que vous touchez répond à vos questions d'une voix distante et sifflante — jusqu'à trois questions (oui/non). Si lancé plus d'une fois en 24h, un échec devient critique."},
  {name:"Convent", tier:3, duration:"Instantanée", range:"Personnelle", text:"Vous invoquez la magie que vous partagez avec vos homologues sorcières. Vous regagnez l'usage d'un sort de rang 3 ou moins déjà dépensé ce jour. Une seule fois avant le prochain repos complet."},
  {name:"Divination", tier:3, duration:"Instantanée", range:"Personnelle", text:"Vous lancez les osselets de divination ou scrutez l'obscurité entre les étoiles pour y chercher un signe. Vous posez une question au MJ, qui vous répond sincèrement par « oui » ou « non »."},
  {name:"Gui", tier:3, duration:"1d8 jours", range:"Intermédiaire", text:"Deux créatures que vous pouvez voir se retrouvent sous le charme l'une de l'autre pendant 1d8 jours. Chaque fois que l'une subit des dégâts, elle peut effectuer un test de CHA ND 15 pour mettre fin au sort."},
  {name:"Horde animale", tier:3, duration:"Concentration", range:"Longue", text:"Une horde de chauves-souris, de rats ou de sauterelles affamés apparaît dans un cube de taille intermédiaire. Toutes les créatures qui débutent leur tour dans la horde subissent 2d6 dégâts et sont aveuglées."},
  {name:"Hurlement", tier:3, duration:"Instantanée", range:"Intermédiaire", text:"Tous les ennemis à portée intermédiaire de vous doivent immédiatement effectuer un test de moral (sauf immunité)."},
  {name:"Murmure", tier:3, duration:"Instantanée", range:"Courte", text:"Vous chuchotez à l'oreille d'une autre créature pour introduire un faux souvenir dans sa mémoire. Si vous ratez le test d'incantation, le MJ vous implante un faux souvenir à la place."},
  {name:"Poupée ensorcelée", tier:3, duration:"Concentration", range:"Sur le même plan", text:"Vous épinglez une mèche de cheveux ou un morceau de peau d'une créature à une poupée de toile. En vous concentrant, chaque épingle enfoncée inflige 2d6 dégâts à la créature."},
  {name:"Regard du néant", tier:3, duration:"Concentration", range:"Longue", text:"Vos yeux virent au noir. Une créature de NV 6 ou moins que vous pouvez voir tombe sous votre contrôle ; vous décidez de ses actions pendant son tour."},
  {name:"Cauchemar", tier:4, duration:"Concentration", range:"Sur le même plan", text:"Vous infligez des cauchemars à glacer le sang à une créature endormie de niveau ≤ la moitié du vôtre (arrondi à l'inférieur, min. 1) que vous avez déjà vue. 3 rounds de concentration d'affilée : elle meurt d'effroi."},
  {name:"Malédiction", tier:4, duration:"Permanente", range:"Courte", text:"Une créature que vous touchez subit l'une des malédictions suivantes : bubons et verrues hideux ; nourriture au goût de cendre ; voix stridente ; cauchemars troublants ; perd toujours aux jeux de hasard ; un allié devient un ennemi ; peur de quelque chose d'ordinaire."},
  {name:"Manteau de nuit", tier:4, duration:"8 rounds", range:"Personnelle", text:"Vous vous enveloppez d'un manteau d'ombres tourbillonnantes. Votre CA devient 17 (20 sur réussite critique). Avantage aux tests de Dextérité pour vous déplacer discrètement ou vous cacher."},
  {name:"Os de verre", tier:4, duration:"Concentration", range:"Courte", text:"Une créature que vous touchez devient fragile : les dégâts qu'elle subit sont doublés pendant la durée du sort."},
  {name:"Porte dimensionnelle", tier:4, duration:"Instantanée", range:"Personnelle", text:"Vous vous téléportez, vous et jusqu'à une autre créature consentante, à portée courte de n'importe quel point que vous pouvez voir."},
  {name:"Rayon de lune", tier:4, duration:"Instantanée", range:"Longue", text:"Un rayon de lune argenté frappe une créature à longue portée. Elle subit 3d6 dégâts."},
  {name:"Subterfuge", tier:4, duration:"Concentration", range:"Intermédiaire", text:"Vous conjurez une illusion visible et audible convaincante. Les créatures qui la perçoivent réagissent comme si elle était vraie. Vous pouvez forcer une créature qui interagit avec elle à un test de SAG ND 15, sinon elle tombe sous son charme."},
  {name:"Transformation", tier:4, duration:"10 rounds", range:"Courte", text:"Vous transformez une créature touchée en une autre créature naturelle de taille inférieure ou égale, de votre choix. Elle reçoit ses caractéristiques physiques mais garde le reste. À 0 PV, elle reprend sa forme d'origine avec la moitié de ses PV."},
  {name:"Anathème", tier:5, duration:"Instantanée", range:"Courte", text:"Tous les alliés de la créature touchée l'injurient et l'abandonnent pendant 1 journée. Chaque fois qu'elle subit des dégâts de votre fait, ses anciens alliés peuvent tenter un test de Sagesse ND 15 pour lever le sort."},
  {name:"Âme en conserve", tier:5, duration:"Permanente", range:"Courte", text:"Vous transférez l'âme d'une créature de NV 9 ou moins que vous touchez dans un récipient. Son corps tombe dans le coma sans mourir. Vous pouvez posséder ce corps inhabité ; si le récipient se brise, l'âme regagne son corps."},
  {name:"Doigt de mort", tier:5, duration:"Instantanée", range:"Courte", text:"Une créature de NV 9 ou moins que vous touchez meurt instantanément. Un échec à ce test est traité comme critique, et vous êtes désavantagé sur le jet de Catastrophe diabolique qui s'ensuit."},
  {name:"Étiolement", tier:5, duration:"Instantanée", range:"Courte", text:"Une créature touchée voit une caractéristique tirée au hasard (d6) tomber à 3 (-4) pendant une semaine. En cas d'échec au test d'incantation, c'est une des vôtres qui tombe à 3 à la place."},
  {name:"Marche des songes", tier:5, duration:"Instantanée", range:"Courte", text:"Vous et des créatures consentantes à portée courte entrez dans les songes d'une créature endormie sur le même plan. Vous pouvez ressortir des rêves en apparaissant à côté d'elle, comme téléportés."},
  {name:"Métamorphose", tier:5, duration:"Concentration", range:"Personnelle", text:"Vous vous transformez, vous et votre équipement, en une créature naturelle déjà vue de niveau 10 ou moins — ses capacités physiques, mais votre INT/SAG/CHA. À 0 PV sous cette forme, vous reprenez votre forme d'origine avec 1 PV."},
  {name:"Mère de la nuit", tier:5, duration:"Instantanée", range:"Personnelle", text:"Vous implorez la Mère de la nuit et exprimez un souhait unique, réalisé par le MJ. En cas d'échec au test d'incantation, elle vous juge et bloque ce sort tant que vous ne l'avez pas apaisée."},
  {name:"Scrutation", tier:5, duration:"Concentration", range:"Personnelle", text:"Vous invoquez les images d'un lieu éloigné dans une boule de cristal ou un bassin. ND 18 si la cible ne vous est pas familière. Chaque round, les créatures observées peuvent tenter un test de Sagesse pour sentir qu'on les observe."}
];
/* Cursed Scroll #2 — Sables rouges (VF). Aucune classe caster dans ce numéro (Cavalier du
   désert / Combattant de l'arène / Ras-Godai) : pas d'origines ni de sorts thématiques dans le
   livret pour ce numéro-ci. La table « Lotus noir » (talents de Ras-Godai, p.15) reste écrite en
   texte dans le talent de la classe (CLASSES_DATA), pas ici : c'est une table de talents, exclue
   du lien hypertexte à la demande de Tristan (2026-08-12). */
const CS2_TREASURES = [
  "Fétiche au mauvais œil : désavantage au prochain test ou jet d'attaque.",
  "Sac en toile attaché et contenant un cobra furieux.",
  "Moitié d'une carte au trésor ; l'autre obtenue au prochain résultat.",
  "Bocal en terre cuite scellé contenant, 1d4 : 1-2. 20 po, 3-4. Hordes de scarabées.",
  "Coupe de vin en laiton avec réservoir secret diffusant du poison.",
  "Trois dés pipés pour obtenir des résultats, 1d4 : 1-2. Élevés, 3-4. Bas.",
  "Invitation à un combat d'arène privé dans le palais d'un puissant noble.",
  "Peigne en jade qui, selon la loi, absout son porteur d'un crime.",
  "Fiole en verre bouchée contenant un minuscule scorpion vivant.",
  "Bouteille fermée d'un vin de Murgazi particulièrement fort.",
  "Pion en forme de scarabée, avantage au prochain test ou jet d'attaque.",
  "Anneau sigillaire en or appartenant à une noble famille d'Alkesh.",
  "Sac de 1d4 dattes sucrées guérissant chacune 1 PV quand on les consomme.",
  "Huile de ver, à verser sur le sable pour attirer un ver pourpre en 1d4 rounds.",
  "Fiole de poison, 1d4 : 1-2. Courant, 3. Peu courant, 4. Rare.",
  "Tube contenant 1d4 plumes de phénix qui tiennent lieu d'allumettes étanches.",
  "Acte de propriété d'un destrier de guerre coûteux logé dans une écurie d'Alkesh.",
  "Fragment de verre bleu qui reflète parfois de brefs présages.",
  "Sac de grains de sésame magiques à répandre sur une porte pour la déverrouiller.",
  "Lampe à huile en bronze terni avec une inscription gravée et presque effacée."
];

/* Cursed Scroll #3 — Soleil de minuit / Îles d'Andrik (VF). Loup des mers (non-caster) +
   Augure (spellClass "seer" côté CLASSES_DATA) — d'où la liste de sorts d'augure ci-dessous,
   seule vraie liste de sorts jouable pour cette classe dans toute l'appli pour l'instant. */
const CS3_ORIGINES = [
  "Affranchi. Vous étiez esclave, mais vous vous êtes évadé ou vous avez gagné votre liberté.",
  "Réfugié. Vous avez fui lorsqu'un jarl rival a attaqué votre village.",
  "Criminel. On vous a exilé de votre village pour un crime.",
  "Vagabond. Vous n'avez pas encore trouvé de jarl digne de votre loyauté.",
  "Fermier. Vous cultivez la terre et connaissez toutes les plantes.",
  "Éleveur. Vous avez des intuitions à propos de tous les animaux.",
  "Chasseur. Vous savez vous déplacer sans bruit dans la nature.",
  "Pêcheur. Vous connaissez toutes les créatures et toutes les légendes des mers.",
  "Homme de main. Vous faites appliquer la loi du jarl dans votre village.",
  "Commerçant. Vous avez des contacts mercantiles dans tous les villages.",
  "Artisan. Vous savez fabriquer et réparer tous les objets du quotidien.",
  "Fabricant d'arcs. Vous savez fabriquer et réparer tous les arcs et flèches.",
  "Apprenti augure. Vous connaissez un peu les arts mystiques.",
  "Fabricant de bateaux. Vous savez fabriquer et réparer des bateaux longs.",
  "Forgeron. Armes, armures, fers à cheval : tous font partie de votre domaine.",
  "Voyageur au long cours. Vous connaissez bien des peuples et coutumes de contrées lointaines.",
  "Scalde. Vous êtes un poète et connaissez les ballades de jadis.",
  "Descendant de héros. Vous êtes le descendant d'un célèbre guerrier.",
  "Noble. Vous êtes fils de… 1d6 : 1-5. Jarl, 6. Roi.",
  "Sang de dieu. Vous descendez d'un dieu, dont vous portez la marque."
];
const CS3_SPELLS = [
  {name:"Chant", tier:1, duration:"Concentration", range:"Personnelle", text:"Vous entonnez un chant d'un autre monde qui lève les limites ordinaires de votre vision. Pendant la durée du sort, vous voyez toutes les choses invisibles ou cachées comme si elles étaient tout à fait visibles. Ce sort ne vous permet toutefois pas de voir de manière impossible pour vous, comme dans l'obscurité absolue ou à travers les murs."},
  {name:"Invocation de rage", tier:1, duration:"1d4 rounds", range:"Courte", text:"Vous invoquez la rage de berserker qui habite autrui. Un humanoïde consentant que vous touchez est pris de folie guerrière. La cible est immunisée contre les tests de moral, dispose de l'avantage aux tests de FOR et aux jets d'attaque de corps à corps, et inflige +1d4 dégâts pendant la durée du sort. Si la cible n'attaque pas une autre créature à son tour, le sort s'achève."},
  {name:"Potion", tier:1, duration:"Instantanée", range:"Courte", text:"Dans le cadre de ce sort, vous devez bénir une boisson ou un liquide. Le liquide reçoit des propriétés curatives pendant 1 journée. Une créature qui l'avale peut mettre un terme aux effets d'un poison ou immédiatement cesser de mourir (elle demeure à 0 PV)."},
  {name:"Transe", tier:1, duration:"Instantanée", range:"Courte", text:"Vous entrez en transe et apercevez des bribes du destin d'une créature. Une créature humanoïde que vous touchez (vous ne pouvez pas vous prendre vous-même pour cible) reçoit un jeton de chance. Elle ne peut pas en avoir plus d'un à la fois."},
  {name:"Âme scellée", tier:2, duration:"Concentration", range:"Courte", text:"Vous scellez l'âme d'une créature vivante, ce qui empêche toute magie de pomper son énergie. Une créature que vous touchez devient presque invulnérable à toute magie. Pendant la durée du sort, le ND du test d'incantation des autres sorts qui la prennent pour cible (bénéfiques ou néfastes) passe à 18. Ce sort s'achève dès que la cible est affectée par un autre sort."},
  {name:"Destinée", tier:2, duration:"Instantanée", range:"Intermédiaire", text:"Vous tordez douloureusement les fils dorés de la destinée d'une créature. Une créature que vous prenez pour cible et située à portée subit 1d10 dégâts et perd tout jeton de chance qu'elle possède."},
  {name:"Lecture des runes", tier:2, duration:"Instantanée", range:"Personnelle", text:"Vous posez aux dieux une question et vous lancez les runes avant d'en interpréter le résultat. Posez au meneur de jeu une question. Il doit répondre sincèrement par oui ou par non."},
  {name:"Sacrifice", tier:2, duration:"Instantanée", range:"Courte", text:"Dans le cadre de l'incantation de ce sort, vous devez procéder au sacrifice rituel d'une créature de NV 2 ou supérieur. La cible que vous touchez gagne à son prochain test ou jet d'attaque un bonus égal au niveau de la créature sacrifiée."},
  {name:"Bannissement", tier:3, duration:"Concentration", range:"Longue", text:"Vous renvoyez une créature et la projetez loin de vous. Choisissez une créature que vous voyez. Pendant la durée du sort, elle ne peut pas venir à portée intermédiaire de vous (ou plus près). Elle peut toujours vous attaquer au-delà de cette portée."},
  {name:"Corbeau", tier:3, duration:"Instantanée", range:"Illimitée", text:"Vous chuchotez un message aux corbeaux d'Odin lui-même, et ils le portent au destinataire, même s'il se trouve à l'autre bout du monde. Prononcez une courte phrase ainsi que le nom du destinataire, mort ou vivant. La créature l'entend comme un chuchotement dans sa tête."},
  {name:"Forme de loup", tier:3, duration:"Concentration", range:"Personnelle", text:"Vous vous transformez en loup avec votre équipement pendant la durée du sort. Vous adoptez FOR, DEX, CON, PV, CA, vitesse, attaques et caractéristiques de la bête tout en conservant votre INT, SAG et CHA. Vous pouvez lancer des sorts sous cette forme. Si vous tombez à 0 PV, vous reprenez votre forme d'origine à 0 PV. Si vous êtes de niveau 5+, vous pouvez vous transformer en loup sanguinaire ou hivernal à la place."},
  {name:"Hallucination", tier:3, duration:"Concentration", range:"Intermédiaire", text:"Une créature que vous prenez pour cible à portée intermédiaire, et dont le niveau est inférieur ou égal au vôtre, subit des visions de ce qui risque de se produire. Pendant la durée du sort, la cible ne peut pas agir à son tour à moins de réussir un test de SAG ND égal à votre test d'incantation."},
  {name:"Présage de Freya", tier:4, duration:"1d6 rounds", range:"Personnelle", text:"Pendant la durée du sort, vous ne perdez pas le pouvoir de lancer un sort si vous ratez un test d'incantation. Si vous subissez un échec critique à un test d'incantation, vous pouvez le refaire, mais vous devez conserver le nouveau résultat."},
  {name:"Sagesse d'Odin", tier:4, duration:"1d6 rounds", range:"Personnelle", text:"Pendant la durée du sort, ajoutez à vos tests de Sagesse et d'incantation un bonus égal à votre niveau."},
  {name:"Tonnerre de Thor", tier:4, duration:"Instantanée", range:"Longue", text:"Thor lance un éclair qui frappe une cible. Celle-ci subit 3d6 dégâts."},
  {name:"Tromperie de Loki", tier:4, duration:"Instantanée", range:"Intermédiaire", text:"Vous êtes investi de la malice fascinante de Loki. Les convictions et les souvenirs des créatures qui vous entendent parler se modifieront pour coller à votre suggestion. Prenez pour cible une créature capable de vous entendre et de vous comprendre, et située à portée. Vous exprimez une affirmation plausible, qu'elle soit vraie ou non. La cible doit effectuer un test de Sagesse contre le résultat de votre test d'incantation. Si elle échoue, elle croit désormais ce que vous avez annoncé comme s'il s'agissait d'un fait avéré, quoi qu'elle sache de son côté."},
  {name:"Arbre du monde", tier:5, duration:"Concentration", range:"Courte", text:"Les racines de l'arbre du monde, source de vie, s'enroulent autour de l'âme d'une créature que vous touchez. Pendant la durée du sort, la cible ne peut pas tomber en dessous de 1 PV."},
  {name:"Ragnarok", tier:5, duration:"Instantanée", range:"Longue", text:"Vous examinez en profondeur les fils de la destinée pour y déceler le sort d'une âme après la bataille de Ragnarok. Survivra-t-elle ou mourra-t-elle ? Choisissez une créature à portée. Vous ne pouvez prendre une créature pour cible avec ce sort qu'une seule fois. Cette créature doit réussir un test de CON contre le résultat de votre test d'incantation pour éviter de mourir sur-le-champ."},
  {name:"Serpent du monde", tier:5, duration:"Concentration", range:"Courte", text:"Le douloureux venin du serpent du monde coule des armes d'une créature que vous touchez. La cible inflige le double de dégâts à chaque attaque (le quadruple en cas de coup critique) pendant la durée du sort."},
  {name:"Valkyrie", tier:5, duration:"10 rounds", range:"Intermédiaire", text:"Vous appelez une valkyrie à l'aide. Elle apparaît à un endroit situé à portée intermédiaire et agit de son propre chef pour vous aider. Elle retourne au Valhalla une fois que le sort s'achève. Vous ne pouvez plus lancer ce sort avant d'avoir fait pénitence."}
];
const CS3_TREASURES = [
  "Symbole sacré d'un lion en argent sur une fine chaîne tressée (10 po).",
  "Encensoir en argent plein de fragments de myrrhe odorants (20 po).",
  "Rouleau de prière à l'encre colorée dans un lourd tube d'argent (30 po).",
  "Robes de soie blanches brodées de fils d'or (40 po).",
  "Dague en argent ondulée au pommeau en croissant de lune (50 po).",
  "Bol en cuivre martelé à filigrane d'argent (60 po).",
  "Statuette en or et en marbre d'une femme à l'attitude solennelle (70 po).",
  "Calice en argent incrusté d'un rubis en forme de diamant (80 po).",
  "Coffre de pièces d'or à l'effigie d'un empereur mort (90 po).",
  "Six lourds chandeliers en or bruni (100 po).",
  "Antique tabernacle d'argent incrusté d'émeraudes ovales (110 po).",
  "Épais anneau en or pourvu d'un sceau en saphir taillé (120 po).",
  "Assiette en or représentant un soleil radieux et argenté (130 po).",
  "Gantelet à filigrane d'or incrusté de dizaines de perles (140 po).",
  "Lourde statue d'ange coulée en or pur (150 po).",
  "Crâne en or incrusté de petits saphirs (160 po).",
  "Lourd reliquaire en or contenant des ossements sacrés (170 po).",
  "Symbole sacré d'une enclume en mithral au bout d'une lourde chaîne (180 po).",
  "Rose en or de Ste Terragnis piquetée de rubis (190 po).",
  "Orbe et crosse dorés bordés de minuscules diamants (200 po)."
];

/* Cursed Scroll #4 — River of Night (VO anglaise). Guerrier basilic / Rôdeur : non-casters — les
   « Druid Spells » du livret (p.16-21) ne sont PAS liés à ces classes, ce sont des sorts de
   Magicien réservés aux magiciens d'alignement Neutre ("Neutral wizards can choose from the
   below spells in addition to standard wizard spells."), donc rattachés ici comme extension de
   sorts de Magicien plutôt que comme sorts de classe. VO gardée entre parenthèses après chaque
   nom, traduction non-officielle (pas de VF existante pour ce supplément). */
const CS4_SPELLS = [
  {name:"Souffle (Breath)", tier:1, duration:"10 rounds", range:"Personnelle", text:"Vous pouvez retenir votre souffle pendant la durée du sort."},
  {name:"Insuffler (Instill)", tier:1, duration:"5 rounds", range:"Personnelle", text:"Une arme que vous maniez est imprégnée de force vitale. Elle devient une arme +1 pour la durée du sort. Si l'arme est un bâton, elle inflige d6 dégâts au lieu de d4."},
  {name:"Oxyder (Oxidize)", tier:1, duration:"Instantanée", range:"Proche", text:"Un objet inanimé que vous touchez, de la taille d'une porte ou moins, vieillit de d100 ans."},
  {name:"Vent chuchoteur (Whisperwind)", tier:1, duration:"Instantanée", range:"Loin", text:"Vous envoyez un bref message chuchoté qui atteint n'importe quelle créature à portée."},
  {name:"Écorce (Barkskin)", tier:2, duration:"1 jour", range:"Personnelle", text:"Votre peau durcit et se transforme en une écorce d'arbre robuste. Votre CA devient 15 (18 en cas de réussite critique du jet d'incantation) pour la durée du sort. Vous subissez le double des dégâts de feu tant que vous êtes sous l'effet du sort."},
  {name:"Amadouer (Befriend)", tier:2, duration:"5 rounds", range:"Proche", text:"Une minuscule créature naturelle que vous touchez (comme une souris ou une mite) vous considère comme un ami pendant la durée du sort. Vous pouvez donner un ordre à la créature, qu'elle essaie d'accomplir du mieux qu'elle peut selon son intelligence, même après la fin du sort. Si l'ordre devait directement blesser la créature, elle abandonne la tâche."},
  {name:"Magnétiser (Magnetize)", tier:2, duration:"5 rounds", range:"Proche", text:"Un objet que vous touchez, jusqu'à la taille d'un cheval, devient puissamment magnétisé. Il attire tous les objets magnétiques plus petits situés à portée proche. S'il peut se déplacer, il est attiré vers les objets magnétiques plus grands situés à portée proche. Une créature métallique doit réussir un jet de FOR égal à votre jet d'incantation pour résister."},
  {name:"Vraie-Parole (Truespeech)", tier:2, duration:"Instantanée", range:"Proche", text:"Une créature naturelle que vous touchez comprend et peut communiquer avec vous dans la langue véritable de tous les animaux. Vous pouvez poser à la créature une question fermée (oui ou non). Le MJ répond honnêtement « oui » ou « non ». Si vous lancez ce sort plus d'une fois sur la même créature en 24 heures, traitez un échec au jet d'incantation comme un échec critique."},
  {name:"Alchimie (Alchemy)", tier:3, duration:"Instantanée", range:"Proche", text:"Un objet inanimé de taille humaine ou moins que vous touchez se transforme en une autre matière de valeur égale ou inférieure."},
  {name:"Anima (Anima)", tier:3, duration:"Concentration", range:"Proche", text:"Vous animez la force vitale d'un objet naturel que vous touchez, de la taille d'un cheval ou moins. L'objet devient une créature loyale pour la durée du sort, avec les caractéristiques ci-dessous. Son niveau est égal au vôtre. La créature agit à votre tour. Vous pouvez utiliser votre action pour lui donner un ordre, qu'elle obéit. Sinon, elle n'agit pas. CA 10 + NIV, PV 4,5 × NIV, ATQ 2 coups +7 (1d12), DÉP proche, FOR +4, DEX +0, CON +0, INT -4, SAG +0, CHA +0, AL N, NIV *."},
  {name:"Sauterelles (Locusts)", tier:3, duration:"Concentration", range:"Proche", text:"Un nuage désorientant de sauterelles agressives et mordantes envahit une zone autour de vous jusqu'à proche. Le nuage se déplace avec vous quand vous bougez. Vous n'êtes pas affecté par lui. Les créatures dans la zone d'effet subissent 1d10 dégâts par round au début de leur tour. Elles doivent réussir un jet de CON égal à votre dernier jet d'incantation, sous peine de ne pas pouvoir se déplacer pendant leur tour."},
  {name:"Forme d'arbre (Treeshape)", tier:3, duration:"10 rounds", range:"Personnelle", text:"Vous et votre équipement vous transformez en un tréant possédant les caractéristiques ci-dessous pour la durée du sort. Vous ne possédez pas le talent Animer un arbre du tréant. Vous ne pouvez pas lancer de sorts tant que vous êtes sous l'effet de ce sort. Vous conservez vos caractéristiques d'INT, de SAG et de CHA. CA 14, PV 38, ATQ 2 gifles +8 (1d12) ou 1 roche (loin) +8 (2d6), DÉP proche, FOR +4, DEX -1, CON +2, INT *, SAG *, CHA *, AL N, NIV 8."},
  {name:"Mycélium (Mycelium)", tier:4, duration:"Instantanée", range:"Personnelle", text:"Vous connectez votre esprit au vaste réseau fongique de la terre. Posez au MJ une question de 15 mots maximum. Le MJ répond honnêtement en 15 mots maximum. Si vous lancez ce sort plus d'une fois en 24 heures, traitez un échec au jet d'incantation comme un échec critique."},
  {name:"Invoquer la tempête (Summon Storm)", tier:4, duration:"10 rounds", range:"1 mile", text:"Vous invoquez une violente tempête qui affecte une zone autour de vous s'étendant jusqu'à un mile pour la durée du sort. La tempête apporte des cieux assombris, un vent violent et une pluie battante. Pour la durée du sort, vous pouvez lancer contrôle de l'eau, même si vous ne connaissez pas ce sort. Pour la durée du sort, vous pouvez lancer éclair, même si vous ne connaissez pas ce sort."},
  {name:"Séisme (Earthquake)", tier:5, duration:"Instantanée", range:"Double proche", text:"La terre tremble violemment et s'ouvre, engloutissant les créatures vers leur perte. Toutes les créatures se trouvant au sol dans un rayon de double proche autour de vous subissent 4d6 dégâts. Chaque créature affectée de NIV 9 ou moins doit réussir un jet de DEX égal aux dégâts subis, sous peine d'être engloutie par la terre, pour ne plus jamais être revue."},
  {name:"Nommer (Naming)", tier:5, duration:"Instantanée", range:"Proche", text:"Vous apprenez le Vrai Nom d'une créature que vous touchez. Si la créature est consentante, vous pouvez lui donner un nouveau Vrai Nom. Une créature ne peut changer son Vrai Nom qu'une seule fois dans sa vie. Si elle le fait, son alignement devient le vôtre."}
];
const CS4_TREASURES = [
  "La Porte de la Perdition Bouillonnante ! C'était un piège, bien sûr…",
  "Une cache de 1d4 œufs de basilic de pierre ; ils éclosent s'ils sont couvés.",
  "Un piège à hommes élaboré, fabriqué par des vipériens.",
  "Un coffre au trésor enterré, laissé par la reine pirate Maria la Rouge.",
  "Un temple moussu et abandonné, occupé par des singes en colère.",
  "Le navire pirate, le Dauphin, qui a coulé sur les rives du fleuve.",
  "La cache de butin du célèbre explorateur disparu, Lord Hedron.",
  "La grotte remplie de trésors d'un crabe géant mutant.",
  "Un naufragé nommé Bort qui ne veut pas être secouru.",
  "Les ossements d'une baleine morte, transformés en sanctuaire gobelin.",
  "Des pots en terre cuite remplis de pièces tachées de sang, frappées d'un scorpion.",
  "Une pyramide basse à degrés abritant une momie couverte de bijoux.",
  "Une opale de feu géante ; plantée en terre, elle fait naître un nouveau volcan.",
  "Un arbre massif abritant un portail vers un autre royaume.",
  "Une jambe de bois enfermée dans du verre, hantée par son ancien propriétaire.",
  "Un réseau de grottes infesté de cobras, riche en cristaux précieux.",
  "Un vol de perroquets parlants ; l'un d'eux était l'animal de compagnie d'un célèbre pirate.",
  "Une soucoupe écrasée en métal noir et lisse (un vaisseau d'être du Vide).",
  "Un arbre qui fait pousser des rubis ; un druide accompagné de T-Rex apprivoisés le garde.",
  "La légendaire faucille d'obsidienne qui met fin à une vie ou en restaure une."
];

/* Cursed Scroll #5 — Dwellers in the Deep (VO anglaise). Fouilleur / Corrompu : non-casters — les
   « Sorcerer Spells » (p.15-20) sont des sorts de Magicien réservés aux magiciens d'alignement
   Chaotique, extension au même titre que les Druid Spells du #4. VO gardée entre parenthèses,
   traduction non-officielle. */
const CS5_SPELLS = [
  {name:"Fléau (Blight)", tier:1, duration:"5 rounds", range:"Personnelle", text:"Lorsque vous lancez ce sort, une zone de terre de taille courte autour de vous se désagrège en cendres sans vie. Vous gagnez +1 à vos tests d'incantation pendant la durée du sort."},
  {name:"Morsure de l'œil (Eyebite)", tier:1, duration:"Instantanée", range:"Intermédiaire", text:"Une créature que vous prenez pour cible subit 1d4 dégâts et ne peut plus vous voir jusqu'à la fin de son prochain tour."},
  {name:"Malice (Mischief)", tier:1, duration:"5 rounds", range:"Intermédiaire", text:"Vous charmez par magie un humanoïde de niveau 2 ou moins à portée intermédiaire. La cible est saisie d'une compulsion à commettre des méfaits nuisibles pendant la durée du sort. Chaque round, elle tente de commettre un acte sournois et cruel qui gênerait ou nuirait à son allié le plus proche. Le sort prend fin si vous ou vos alliés faites quoi que ce soit pour blesser la cible et qu'elle le remarque."},
  {name:"Protection contre le Bien (Protection From Good)", tier:1, duration:"Concentration", range:"Courte", text:"Pendant la durée du sort, les êtres loyaux ont un désavantage aux jets d'attaque et aux tests d'incantation hostiles dirigés contre la cible. Ces êtres ne peuvent pas non plus la posséder, la contraindre ou la charmer. Si le sort est lancé sur une cible déjà possédée, l'entité possédante effectue un test de CHA contre le dernier test d'incantation. En cas d'échec, l'entité est expulsée."},
  {name:"Envenimement (Envenom)", tier:2, duration:"Instantanée", range:"Courte", text:"Vous transformez une coupe ou une fiole de liquide potable en poison toxique. Il conserve en tout point l'apparence du liquide d'origine. Une créature vivante de NV 10 ou moins qui boit ce liquide doit réussir un test de CON ND 15, sous peine de tomber à 0 PV."},
  {name:"Fantômes (Phantoms)", tier:2, duration:"Instantanée", range:"Intermédiaire", text:"Vous invoquez une illusion terrifiante qui apparaît dans l'esprit d'une cible de NV 3 ou moins à portée. La cible doit immédiatement effectuer un test de moral."},
  {name:"Flétrissure (Wither)", tier:2, duration:"Instantanée", range:"Courte", text:"Votre contact draine l'énergie vitale d'une cible à portée, lui infligeant 1d6 dégâts. La cible subit des dégâts doublés lors de la prochaine attaque ou du prochain sort infligeant des dégâts qui la touche."},
  {name:"Torture (Wrack)", tier:2, duration:"Concentration", range:"Longue", text:"Une créature que vous pouvez voir à portée, de NV 5 ou moins, est submergée par une douleur atroce. La cible doit réussir, à son tour, un test de CON contre votre dernier test d'incantation, sinon elle ne peut ni se déplacer ni agir."},
  {name:"Trahison (Betrayal)", tier:3, duration:"Concentration", range:"Intermédiaire", text:"Une créature de NV 7 ou moins que vous pouvez voir à portée se retourne contre ses alliés, les considérant comme des ennemis hostiles pendant la durée du sort."},
  {name:"Profanation (Defile)", tier:3, duration:"5 rounds", range:"Personnelle", text:"Lorsque vous lancez ce sort, un cercle de terre de taille intermédiaire autour de vous se désintègre en cendres stériles. Pendant la durée du sort, tous les sorts de rang 1 à 3 que vous lancez avec succès sont considérés comme des réussites critiques. Vous ne pouvez pas lancer ce sort tant que vous êtes sous ses effets."},
  {name:"Mesmérisme de Mazzim (Mazzim's Mesmerism)", tier:3, duration:"Concentration", range:"Intermédiaire", text:"Vous tissez autour de vos cibles un miasme de magie noire qui engourdit l'esprit. Au début de leur tour, toutes les créatures humanoïdes de NV 5 ou moins à portée doivent réussir un test de CHA contre votre dernier test d'incantation. Les créatures qui échouent restent immobiles, bouche bée, fixant des images invisibles."},
  {name:"Non-vie (Unlife)", tier:3, duration:"1 jour", range:"Courte", text:"Un crâne humanoïde que vous touchez retrouve un semblant de vie, ses orbites s'animant d'une lueur rouge et sorcière. Le crâne peut converser en Commun. Il conserve sa personnalité et ses souvenirs de son vivant, mais sa mémoire peut être lacunaire s'il est mort depuis longtemps. Quand le sort prend fin, le crâne s'effrite en poussière de tombe."},
  {name:"Démembrement (Dismember)", tier:4, duration:"Concentration", range:"Intermédiaire", text:"Une créature à portée de NV 9 ou moins perd un bras ou une jambe (déterminez lequel au hasard). Elle subit 1d8 dégâts à chaque fois que cela se produit. La cible perd un nouveau membre à chaque round de la durée du sort. Si elle n'a plus de membre à perdre, elle est décapitée à la place et meurt."},
  {name:"Domination (Dominate)", tier:4, duration:"Concentration", range:"Intermédiaire", text:"Vous asservissez la volonté d'une créature de NV 9 ou moins que vous pouvez voir à portée. La créature ne peut agir que pour suivre vos ordres pendant la durée du sort. À votre tour, vous pouvez lui ordonner d'accomplir des actions et de se déplacer. La créature agit et se déplace à son tour, en suivant les instructions que vous lui avez données."},
  {name:"Débilité mentale (Feeblemind)", tier:5, duration:"1d8 jours", range:"Intermédiaire", text:"Une créature de NV 10 ou moins à portée voit son INT et son CHA réduits à 1 pendant la durée du sort. Elle ne peut plus lancer de sorts."},
  {name:"Subjugation (Subjugate)", tier:5, duration:"1 an", range:"Courte", text:"Pour lancer ce sort, vous devez saupoudrer la cible de diamant en poudre. Choisissez une créature à portée actuellement sous l'effet d'un sort de domination, de débilité mentale ou de métamorphose que vous avez lancé. La durée de ce sort devient alors 1 an."}
];
const CS5_TREASURES = [
  "Des poèmes délirants qui commencent à prendre sens ; subissez 1d4 dégâts de CHA.",
  "Des dessins détaillés de mites morzo et de leurs repaires.",
  "Une prophétie gravée au fer dans les pages par l'Oracle aux Dix Yeux.",
  "Un rituel permettant d'invoquer un démon dans un miroir pour l'interroger.",
  "Un journal qui consigne automatiquement les pensées et activités de son propriétaire.",
  "Le récit d'un visiteur de la cité de Grizzenghast ; s'interrompt brusquement.",
  "Un journal intime qui révèle qu'un PNJ de confiance est en réalité un doppelganger.",
  "De rares recettes de cuisine elfique qui impressionneraient n'importe qui.",
  "Les détails de quatre fausses identités élaborées avec expertise, prêtes à endosser.",
  "Un guide de langue ; apprenez une langue commune (1 usage).",
  "Une antique carte stellaire qui prédit une apocalypse dans 3 semaines.",
  "Des pages en feuille d'or et des ornements sertis de joyaux ; le livre vaut 200 po.",
  "L'unique registre existant de la lignée d'un roi ou d'une reine actuellement au pouvoir.",
  "Une découpe contenant la clé de la porte de la « Tour Margol, Grizzenghast ».",
  "Deux parchemins de sorts aléatoires tirés de la liste des sorts de magicien chaotique.",
  "Des leçons de philosophie ; vous pouvez relancer un jet de talent (1 usage).",
  "Des techniques d'assassin ; infligez +1 dé de dégâts à une créature prise au dépourvu (1 usage).",
  "Des exercices de concentration visuelle ; gagnez +1 aux attaques à distance (1 usage).",
  "Des parchemins secrets d'arts martiaux ; gagnez +1 aux attaques au corps à corps (1 usage).",
  "Un traité de magie ; gagnez +1 aux tests d'incantation (1 usage)."
];

/* Cursed Scroll #6 — City of Masks (VO anglaise). Barde / Duelliste : non-casters (le "Dilettante
   magique" du Barde active des parchemins/baguettes, ce n'est pas une vraie incantation) — les
   « Mage Spells » (p.19-23) sont des sorts de Magicien réservés aux magiciens d'alignement Loyal,
   même schéma que les #4/#5. VO gardée entre parenthèses, traduction non-officielle. */
const CS6_SPELLS = [
  {name:"Purifier (Cleanse)", tier:1, duration:"Instantané", range:"Toucher", text:"Vous purgez les toxines naturelles d'une créature que vous touchez. Mettez fin aux effets d'un poison affectant actuellement la cible."},
  {name:"Éclat (Flare)", tier:1, duration:"1 round", range:"Proche", text:"Un éclair de lumière blanche aveuglante jaillit de vous. Tous les ennemis à portée qui le voient sont aveuglés pendant la durée du sort."},
  {name:"Révéler (Reveal)", tier:1, duration:"Instantané", range:"Proche", text:"Mettez fin à tous les effets d'invisibilité jusqu'à une distance proche autour de vous. Vous prenez également conscience de l'emplacement de toute créature cachée à portée."},
  {name:"Protection (Ward)", tier:1, duration:"10 rounds", range:"Personnelle", text:"Vous vous protégez d'un charme magique contre les embuscades. Pendant la durée du sort, vous ne pouvez pas être surpris (vous lancez l'initiative pendant les rounds de surprise et êtes considéré comme conscient de tous les ennemis)."},
  {name:"Absorber (Absorb)", tier:2, duration:"5 rounds", range:"Personnelle", text:"Vous créez autour de vous une barrière de force absorbante. Réduisez de moitié (arrondi à l'inférieur) tous les dégâts que vous subissez pendant la durée du sort."},
  {name:"Fusion (Meld)", tier:2, duration:"5 rounds", range:"Personnelle", text:"Vous fusionnez légèrement avec le plan éthéré, vous libérant des entraves physiques. Vous pouvez ignorer tout effet qui affecterait votre mouvement pendant la durée du sort."},
  {name:"Apaiser (Pacify)", tier:2, duration:"Instantané", range:"Proche", text:"Choisissez une créature à portée, de NV 3 ou moins. Elle doit effectuer un jet de moral (les créatures immunisées aux jets de moral ne sont pas affectées par ce sort)."},
  {name:"Pousser/Tirer (Push/Pull)", tier:2, duration:"Instantané", range:"Proche", text:"Vous déplacez sur une distance proche un objet de taille humaine ou une créature de NV 4 ou moins. Si la cible est ancrée d'une manière qui l'empêche de se déplacer librement, le DD pour lancer ce sort est 18."},
  {name:"Bannir (Banish)", tier:3, duration:"Instantané", range:"Proche", text:"D'un mot de pouvoir, vous renvoyez dans sa dimension d'origine une créature extraplanaire de NV 6 ou moins qui vous entend."},
  {name:"Interdire (Forbid)", tier:3, duration:"10 rounds", range:"Personnelle", text:"Les créatures ne peuvent pas se téléporter à l'intérieur, à l'extérieur, ni au sein d'une zone d'effet s'étendant jusqu'à deux fois la distance proche autour de vous. Cette zone d'effet se déplace avec vous."},
  {name:"Identifier (Identify)", tier:3, duration:"Instantané", range:"Toucher", text:"Vous apprenez toutes les propriétés magiques d'un objet que vous touchez. Vous ne pouvez pas relancer ce sort avant d'avoir terminé un repos."},
  {name:"Parler à un objet (Speak With Object)", tier:3, duration:"Instantané", range:"Contact", text:"Un objet que vous touchez répond mentalement à vos questions. L'esprit de l'objet correspond à la rareté de ses matériaux principaux : un diamant est plus vif d'esprit qu'une simple pierre. Vous pouvez poser à l'objet jusqu'à trois questions par oui ou par non (une à la fois). Le MJ répond honnêtement « oui » ou « non » à chacune. Si vous lancez ce sort plus d'une fois en 24 heures, traitez un échec au jet d'incantation comme un échec critique."},
  {name:"Glyphe (Glyph)", tier:4, duration:"1 semaine", range:"Contact", text:"Vous dessinez un symbole arcanique sur un objet, lui conférant l'un des effets magiques suivants : Lier (quiconque le lit, de NV 6 ou moins, est paralysé pendant 1 heure) ; Blesser (le lecteur subit 3d6 dégâts) ; Message (le lecteur entend un bref message mental) ; Sceau de téléportation (traitez l'objet comme un sceau de téléportation, selon le sort téléportation). Le glyphe disparaît une fois activé."},
  {name:"Stase (Stasis)", tier:4, duration:"Indéfinie", range:"Contact", text:"Une créature consentante que vous touchez se retrouve suspendue dans le temps. Si la cible n'est pas consentante, elle doit être de NV 5 ou moins. La cible devient inconsciente et cesse de vieillir. Ses fonctions corporelles s'arrêtent, bien qu'elle reste en vie. Vous pouvez mettre fin au sort à tout moment, ou lorsqu'une condition prédéfinie que vous avez choisie au moment de lancer le sort est remplie."},
  {name:"Abjurer (Abjure)", tier:5, duration:"Instantané", range:"Contact", text:"Vous et une créature que vous touchez mourez tous les deux."},
  {name:"Permanence (Permanence)", tier:5, duration:"1 an", range:"Contact", text:"Pour lancer ce sort, vous devez saupoudrer la cible de diamant en poudre. Choisissez un objet à portée actuellement sous l'effet d'un sort que vous avez lancé. La durée de ce sort devient 1 an. Vous ne pouvez plus modifier les effets du sort original après avoir lancé permanence. Par exemple, vous ne pouvez plus déplacer un objet sous l'effet de télékinésie."}
];
const CS6_TREASURES = [
  "Poupée d'enfant qui se tourne d'elle-même vers l'emplacement de son véritable propriétaire.",
  "Dents humaines dans une bourse de velours ornée d'un monogramme doré « J ».",
  "Vieille paire de dés en ivoire jauni, affichant un 6 sur chaque face.",
  "Moitié d'un billet : « ...à minuit, au quai est de Gutterwash ! »",
  "Pièce d'or ancienne ; le visage gravé change sans cesse pour représenter de nouvelles personnes.",
  "Broche tordue et ternie, portée par la Garde de la Cité.",
  "Rat pâle qui guide les gens jusqu'à une porte verrouillée dans les égouts.",
  "Chapeau de magicien prétentieux contenant trois pierres étranges.",
  "Rose qui se fane chaque jour et repousse à minuit.",
  "Parchemin mis en bouteille : « Si vous lisez ceci, je suis déjà mort... »",
  "Masque de porcelaine ébréché, au visage souriant mystérieusement.",
  "Sifflet en laiton utilisé par la Garde de la Cité pour appeler à l'aide.",
  "Crapaud mort et boursouflé, une chevalière en or dans la gueule.",
  "Tonnelet de vin d'été parfaitement bon, juste un peu sale.",
  "Carte de visite gaufrée d'or, portant une adresse à Rilken Row.",
  "Civil récemment assassiné, enveloppé dans une cape de qualité.",
  "Loupe de joaillier qui détecte les fausses gemmes avec une précision de 5 sur 6.",
  "Carte indiquant comment infiltrer le collège des bardes par les égouts.",
  "Croquis froissé du célèbre artiste Arnor von Lewin.",
  "Gigue envoûtante jouée sur un pipeau lointain, qui se rapproche…"
];

const CURSED_SCROLL_DOCS = {
  1: {
    label: "Cursed Scroll #1 — Diablerie",
    classNames: ["Chevalier de Saint Ydris","Ensorceleur","Sorcière"],
    mentors: true,
    origines: CS1_ORIGINES, originesLabel: "Origines diaboliques",
    catastrophes: [
      {label:"Catastrophes diaboliques — sorts de rang 1 à 3 (d12)", rows:CS1_CATASTROPHES_13},
      {label:"Catastrophes diaboliques — sorts de rang 4 à 5 (d12)", rows:CS1_CATASTROPHES_45}
    ],
    spells: CS1_SPELLS, spellsLabel: "Sorts de sorcière",
    note: "Les objets magiques de ce numéro sont sur la 4e de couverture du livret (cartes imprimées) — pas de texte à extraire de ce côté."
  },
  2: {
    label: "Cursed Scroll #2 — Sables rouges",
    classNames: ["Cavalier du désert","Combattant de l'arène","Ras-Godai"],
    treasures: {label:"Dans la main d'un bandit mort, vous trouvez…", rows:CS2_TREASURES},
    note: "Aucune classe de ce numéro ne lance de sorts : pas d'origines ni de sorts thématiques dans ce livret. La table de talents « Lotus noir » (Ras-Godai) reste décrite en texte dans son talent de classe, pas reprise ici."
  },
  3: {
    label: "Cursed Scroll #3 — Soleil de minuit",
    classNames: ["Loup des mers","Augure"],
    origines: CS3_ORIGINES, originesLabel: "Origines nordiques",
    spells: CS3_SPELLS, spellsLabel: "Sorts d'augure",
    treasures: {label:"Butin des loups des mers dans les contrées lointaines", rows:CS3_TREASURES},
    note: "Sorts d'augure : seule liste de sorts jouable de la classe Augure disponible dans l'appli pour l'instant (rien dans l'onglet Sorts)."
  },
  4: {
    label: "Cursed Scroll #4 — River of Night",
    classNames: ["Guerrier basilic","Rôdeur"],
    spells: CS4_SPELLS, spellsLabel: "Sorts de druide (variante Magicien neutre)",
    spellsIntro: "Les magiciens Neutres peuvent choisir parmi les sorts ci-dessous, en plus des sorts de magicien standards — sorts propres à ce numéro, pas liés aux nouvelles classes.",
    treasures: {label:"La carte au trésor mène à…", rows:CS4_TREASURES},
    note: "VO anglaise, traduction non officielle (pas de VF existante pour ce supplément tiers) — comme pour les classes de ce numéro."
  },
  5: {
    label: "Cursed Scroll #5 — Dwellers in the Deep",
    classNames: ["Fouilleur","Corrompu"],
    spells: CS5_SPELLS, spellsLabel: "Sorts de sorcier (variante Magicien chaotique)",
    spellsIntro: "Les magiciens Chaotiques peuvent choisir parmi les sorts ci-dessous, en plus des sorts de magicien standards — sorts propres à ce numéro, pas liés aux nouvelles classes.",
    treasures: {label:"Vous trouvez un livre perdu contenant…", rows:CS5_TREASURES},
    note: "VO anglaise, traduction non officielle (pas de VF existante pour ce supplément tiers) — comme pour les classes de ce numéro. La table de talents « Corruption » (Corrompu) reste décrite en texte dans son talent de classe, pas reprise ici."
  },
  6: {
    label: "Cursed Scroll #6 — City of Masks",
    classNames: ["Barde","Duelliste"],
    spells: CS6_SPELLS, spellsLabel: "Sorts de magicien (variante Magicien loyal)",
    spellsIntro: "Les magiciens Loyaux peuvent choisir parmi les sorts ci-dessous, en plus des sorts de magicien standards — sorts propres à ce numéro, pas liés aux nouvelles classes.",
    treasures: {label:"Dans une grille d'égout, vous trouvez…", rows:CS6_TREASURES},
    note: "VO anglaise, traduction non officielle (pas de VF existante pour ce supplément tiers) — comme pour les classes de ce numéro. Le Dilettante magique du Barde (activer parchemins/baguettes) n'est pas une vraie incantation, pas de sorts de classe pour ce numéro."
  }
};

/* Fiche de classe « de référence » (sans PJ concret) — même contenu que pcClassSectionHTML()
   côté fiche PJ, réutilise CLASSES_DATA directement plutôt que de dupliquer le texte. */
function classDocHTML(clsName){
  const cd = CLASSES_DATA[clsName];
  if(!cd) return "";
  const featureList = `<ul class="bullets">${cd.feature.map(f=>`<li>${f.name?`<b>${esc(f.name)}</b> — `:""}${renderText(f.text)}</li>`).join("")}</ul>`;
  let spellInfo = "";
  if(cd.spellClass){
    spellInfo = cd.spellsKnownLvl1>0
      ? `<p style="font-family:var(--ui);font-size:.85rem;margin:.3rem 0">Sorts connus (rang 1) : ${cd.spellsKnownLvl1}${clsName==="Prêtre"?" (+ Renvoi des morts-vivants, offert)":""} · DD = 10 + rang × 2</p>`
      : (cd.spellsFromLevel ? `<p style="font-family:var(--ui);font-size:.85rem;margin:.3rem 0">Incantation à partir du niveau ${cd.spellsFromLevel}.</p>` : "");
  }
  return `<div style="margin-bottom:1.4rem">
    <h3 style="color:var(--gold2);margin:.2rem 0 .4rem">${esc(clsName)}</h3>
    <p style="font-family:var(--ui);font-size:.85rem;margin:.2rem 0"><b>Dé de vie</b> d${cd.hitDie} &nbsp;·&nbsp; <b>Armes</b> ${esc(cd.weapons)} &nbsp;·&nbsp; <b>Armures</b> ${esc(cd.armor)}</p>
    ${featureList}
    ${spellInfo}
    <table class="tbl"><thead><tr><th style="width:4.5rem">2d6</th><th>Talent / évolution</th></tr></thead>
      <tbody>${cd.talents.map(t=>`<tr><td class="idx" style="text-align:center">${esc(t.roll)}</td><td>${renderText(t.text)}</td></tr>`).join("")}</tbody></table>
  </div>`;
}
function mentorsDocHTML(){
  return `<div class="section"><h2>Mentors (Ensorceleur)</h2>
    ${Object.entries(MENTORS).map(([name,men])=>`<div style="margin-bottom:1.2rem">
      <h3 style="color:var(--gold2);margin:.2rem 0 .3rem">${esc(name)}</h3>
      <p class="faint" style="font-family:var(--ui);font-size:.85rem;margin:.2rem 0 .5rem">${esc(men.desc)}</p>
      <table class="tbl"><thead><tr><th style="width:4.5rem">2d6</th><th>Bienfait</th></tr></thead>
        <tbody>${men.benefits.map(b=>`<tr><td class="idx" style="text-align:center">${esc(b.roll)}</td><td>${renderText(b.text)}</td></tr>`).join("")}</tbody></table>
    </div>`).join("")}
  </div>`;
}
/* Petit résumé du contenu d'un numéro, affiché en haut de page — pour savoir d'un coup d'œil
   ce qu'il y a dedans sans devoir tout parcourir. Généré depuis les champs déjà renseignés du
   doc plutôt que rédigé à la main, pour ne jamais désynchroniser du contenu réel. */
function cursedScrollSommaireHTML(doc){
  const items = [];
  if(doc.classNames && doc.classNames.length) items.push(`Classes (${doc.classNames.length}) — ${doc.classNames.join(", ")}`);
  if(doc.mentors) items.push(`Mentors (Ensorceleur)`);
  if(doc.origines && doc.origines.length) items.push(`${doc.originesLabel || "Origines"} (${doc.origines.length})`);
  if(doc.catastrophes) items.push(`Catastrophes diaboliques`);
  if(doc.spells && doc.spells.length) items.push(`${doc.spellsLabel || "Sorts"} (${doc.spells.length})`);
  if(doc.treasures && doc.treasures.rows && doc.treasures.rows.length) items.push(`${doc.treasures.label} (${doc.treasures.rows.length})`);
  if(!items.length) return "";
  return `<div class="section" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:.5rem;padding:.6rem 1rem;margin-bottom:1.2rem">
    <div style="font-family:var(--ui);font-size:.8rem;font-weight:700;color:var(--gold2);letter-spacing:.02em;text-transform:uppercase;margin-bottom:.35rem">Au sommaire</div>
    <ul class="bullets" style="margin:0">${items.map(i=>`<li style="font-family:var(--ui);font-size:.85rem">${i}</li>`).join("")}</ul>
  </div>`;
}
function cursedScrollDocHTML(n){
  const doc = CURSED_SCROLL_DOCS[n];
  if(!doc) return emptyState("", `Cursed Scroll #${n} pas encore compilé — dis-moi si le format du #1 te convient.`);
  const sommaireHTML = cursedScrollSommaireHTML(doc);
  const classesHTML = doc.classNames && doc.classNames.length
    ? `<div class="section"><h2>Classes</h2>${doc.classNames.map(classDocHTML).join("")}</div>` : "";
  const mentorsHTML = doc.mentors ? mentorsDocHTML() : "";
  const originesHTML = doc.origines
    ? `<div class="section"><h2>${esc(doc.originesLabel || "Origines")} (d${doc.origines.length})</h2>
        <table class="tbl"><tbody>${doc.origines.map((o,i)=>`<tr><td class="idx" style="text-align:center">${i+1}</td><td>${renderText(o)}</td></tr>`).join("")}</tbody></table></div>` : "";
  const catastrophesHTML = doc.catastrophes
    ? `<div class="section"><h2>Catastrophes diaboliques</h2>
        ${doc.catastrophes.map(c=>`<h3 style="color:var(--gold2);margin:.6rem 0 .3rem">${esc(c.label)}</h3>
          <table class="tbl"><tbody>${c.rows.map((r,i)=>`<tr><td class="idx" style="text-align:center">${i+1}</td><td>${renderText(r)}</td></tr>`).join("")}</tbody></table>`).join("")}
      </div>` : "";
  const spellsHTML = doc.spells && doc.spells.length
    ? `<div class="section"><h2>${esc(doc.spellsLabel || "Sorts")} (${doc.spells.length})</h2>
        ${doc.spellsIntro ? `<p class="faint" style="font-family:var(--ui);font-size:.85rem;margin:.2rem 0 .8rem">${esc(doc.spellsIntro)}</p>` : ""}
        ${[1,2,3,4,5].map(r=>{
          const list = doc.spells.filter(s=>s.tier===r);
          if(!list.length) return "";
          return `<h3 style="color:var(--gold2);margin:.6rem 0 .3rem">Rang ${r}</h3>
            <div class="grid" style="margin-bottom:1rem">${list.map(s=>`<div class="card" style="cursor:default">
              <h3 style="margin-top:0">${esc(s.name)}</h3>
              <div class="meta"><span class="tag">Durée ${esc(s.duration)}</span><span class="tag">Portée ${esc(s.range)}</span></div>
              <p>${esc(s.text)}</p>
            </div>`).join("")}</div>`;
        }).join("")}
      </div>` : "";
  const treasuresHTML = doc.treasures && doc.treasures.rows && doc.treasures.rows.length
    ? `<div class="section"><h2>${esc(doc.treasures.label)} (d${doc.treasures.rows.length})</h2>
        <p class="faint" style="font-family:var(--ui);font-size:.85rem;margin:.2rem 0 .8rem">Objets/trésors de ce numéro — contenu de référence uniquement (spoiler MJ), pas encore attribués à un PJ. Une fois un objet remis en jeu, crée-le normalement dans l'onglet Trésor.</p>
        <table class="tbl"><tbody>${doc.treasures.rows.map((r,i)=>`<tr><td class="idx" style="text-align:center">${i+1}</td><td>${renderText(r)}</td></tr>`).join("")}</tbody></table></div>` : "";
  const noteHTML = doc.note ? `<p class="faint" style="font-family:var(--ui);font-size:.85rem;margin:.3rem 0 1rem">${esc(doc.note)}</p>` : "";
  return `<h1 style="margin-top:0">${esc(doc.label)}</h1>${noteHTML}${sommaireHTML}${classesHTML}${mentorsHTML}${originesHTML}${catastrophesHTML}${spellsHTML}${treasuresHTML}`;
}
/* Crée dans la collection Supabase "Tables aléatoires" les tables explicitement référencées en
   [[...]] depuis le texte des classes (Bienfaits de mentor, Catastrophes diaboliques) — sans quoi
   ces liens pointeraient vers des fiches inexistantes. Idempotent (comme seedCharGenTables) :
   ne recrée pas une table dont le titre existe déjà. Appelé à l'ouverture de l'onglet ; la
   sauvegarde Supabase se fait via le saveDB() déclenché par la prochaine action du MJ, comme pour
   les autres tables "ensure()" de l'appli — mais on force un saveDB() ici si on a ajouté du contenu,
   pour que les liens fonctionnent dès le premier chargement d'un autre MJ. */
function seedCursedScrollTables(){
  let added = 0;
  const ensure = (title, context, rows)=>{
    if(db.tables.some(t=>(t.title||"").trim()===title)) return;
    db.tables.push({id:uid(), title, category:"Cursed Scroll", context, rows});
    added++;
  };
  Object.entries(MENTORS).forEach(([name, men])=>{
    ensure(name, `${men.desc} Bienfait de mentor (2d6) — Ensorceleur, Cursed Scroll #1.`,
      men.benefits.map(b=>`${b.roll} : ${b.text}`));
  });
  ensure("Catastrophes diaboliques",
    "Sorts de sorcière ou de Chevalier de Saint Ydris : un 1 naturel au test d'incantation déclenche un jet sur cette table (d12, deux paliers selon le rang du sort lancé) — Cursed Scroll #1 p.22-23.",
    [
      ...CS1_CATASTROPHES_13.map((r,i)=>`Rang de sort 1-3, ${i+1} : ${r}`),
      ...CS1_CATASTROPHES_45.map((r,i)=>`Rang de sort 4-5, ${i+1} : ${r}`)
    ]);
  if(added) saveDB();
}
function viewCursedScroll(){
  seedCursedScrollTables();
  const subNav = [1,2,3,4,5,6].map(n=>`<button class="btn ghost sm${cursedScrollSub===n?' active-mode':''}" data-cs-sub="${n}">#${n}</button>`).join("");
  app.innerHTML = `<div class="detail">
    <h1 style="margin-bottom:.3rem">Cursed Scroll</h1>
    <p class="faint" style="font-family:var(--ui);font-size:.85rem;margin:0 0 1rem">Doc de référence MJ, création de personnage uniquement (pas les scénarios) — suppléments tiers.</p>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1.2rem">${subNav}</div>
    ${cursedScrollDocHTML(cursedScrollSub)}
  </div>`;
}
