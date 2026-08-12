/* =========================================================================
   CURSED SCROLL — doc de référence MJ (création de personnage uniquement) pour
   les suppléments tiers Cursed Scroll #1 à #6. Contenu STATIQUE (pas de
   collection Supabase, pas de CRUD) : ce n'est pas du contenu de campagne
   éditable, juste une doc que je compile une fois depuis les PDF fournis par
   Tristan — classes, mentors, tables et sorts liés à la création de PJ
   uniquement (pas les scénarios/donjons/hexcrawl de chaque numéro).
   2026-08-12 : #1 compilé en pilote, #2 à #6 en attente de validation.
   ========================================================================= */
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
const CURSED_SCROLL_DOCS = {
  1: {
    label: "Cursed Scroll #1 — Diablerie",
    classNames: ["Chevalier de Saint Ydris","Ensorceleur","Sorcière"],
    mentors: true,
    origines: CS1_ORIGINES,
    catastrophes: [
      {label:"Catastrophes diaboliques — sorts de rang 1 à 3 (d12)", rows:CS1_CATASTROPHES_13},
      {label:"Catastrophes diaboliques — sorts de rang 4 à 5 (d12)", rows:CS1_CATASTROPHES_45}
    ],
    spells: CS1_SPELLS,
    note: "Les objets magiques de ce numéro sont sur la 4e de couverture du livret (cartes imprimées) — pas de texte à extraire de ce côté."
  },
  2: null, 3: null, 4: null, 5: null, 6: null
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
  return `<div class="section"><h2>🕯 Mentors (Ensorceleur)</h2>
    ${Object.entries(MENTORS).map(([name,men])=>`<div style="margin-bottom:1.2rem">
      <h3 style="color:var(--gold2);margin:.2rem 0 .3rem">${esc(name)}</h3>
      <p class="faint" style="font-family:var(--ui);font-size:.85rem;margin:.2rem 0 .5rem">${esc(men.desc)}</p>
      <table class="tbl"><thead><tr><th style="width:4.5rem">2d6</th><th>Bienfait</th></tr></thead>
        <tbody>${men.benefits.map(b=>`<tr><td class="idx" style="text-align:center">${esc(b.roll)}</td><td>${renderText(b.text)}</td></tr>`).join("")}</tbody></table>
    </div>`).join("")}
  </div>`;
}
function cursedScrollDocHTML(n){
  const doc = CURSED_SCROLL_DOCS[n];
  if(!doc) return emptyState("📜", `Cursed Scroll #${n} pas encore compilé — dis-moi si le format du #1 te convient.`);
  const classesHTML = doc.classNames && doc.classNames.length
    ? `<div class="section"><h2>⚔ Classes</h2>${doc.classNames.map(classDocHTML).join("")}</div>` : "";
  const mentorsHTML = doc.mentors ? mentorsDocHTML() : "";
  const originesHTML = doc.origines
    ? `<div class="section"><h2>📖 Origines diaboliques (d20)</h2>
        <table class="tbl"><tbody>${doc.origines.map((o,i)=>`<tr><td class="idx" style="text-align:center">${i+1}</td><td>${renderText(o)}</td></tr>`).join("")}</tbody></table></div>` : "";
  const catastrophesHTML = doc.catastrophes
    ? `<div class="section"><h2>💀 Catastrophes diaboliques</h2>
        ${doc.catastrophes.map(c=>`<h3 style="color:var(--gold2);margin:.6rem 0 .3rem">${esc(c.label)}</h3>
          <table class="tbl"><tbody>${c.rows.map((r,i)=>`<tr><td class="idx" style="text-align:center">${i+1}</td><td>${renderText(r)}</td></tr>`).join("")}</tbody></table>`).join("")}
      </div>` : "";
  const spellsHTML = doc.spells && doc.spells.length
    ? `<div class="section"><h2>✨ Sorts de sorcière (${doc.spells.length})</h2>
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
  const noteHTML = doc.note ? `<p class="faint" style="font-family:var(--ui);font-size:.85rem;margin:.3rem 0 1rem">${esc(doc.note)}</p>` : "";
  return `<h1 style="margin-top:0">${esc(doc.label)}</h1>${noteHTML}${classesHTML}${mentorsHTML}${originesHTML}${catastrophesHTML}${spellsHTML}`;
}
function viewCursedScroll(){
  const subNav = [1,2,3,4,5,6].map(n=>`<button class="btn ghost sm${cursedScrollSub===n?' active-mode':''}" data-cs-sub="${n}">#${n}</button>`).join("");
  app.innerHTML = `<div class="detail">
    <h1 style="margin-bottom:.3rem">📜 Cursed Scroll</h1>
    <p class="faint" style="font-family:var(--ui);font-size:.85rem;margin:0 0 1rem">Doc de référence MJ, création de personnage uniquement (pas les scénarios) — suppléments tiers.</p>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1.2rem">${subNav}</div>
    ${cursedScrollDocHTML(cursedScrollSub)}
  </div>`;
}
