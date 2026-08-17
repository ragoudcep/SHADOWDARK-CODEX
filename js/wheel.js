/* =========================================================================
   ROUE — roue de la fortune (bonus à gagner)
   Config MJ (liste de bonus texte) stockée comme une collection classique
   (db.wheel), MJ CRUD / joueur lecture — même modèle que hexmaps/spells.
   Le tirage est purement local à chaque client (pas d'état de tirage
   partagé, pas de synchro temps réel) : chaque joueur fait tourner la roue
   pour lui-même, tirage uniforme (Math.random) parmi les bonus définis par
   le MJ. Décision volontaire pour rester simple — voir docs/AUDIT.md.
   ========================================================================= */
function wheelConfig(){ return db.wheel[0] || null; }
function ensureWheelConfig(){
  let w = db.wheel[0];
  if(!w){ w = { id:uid(), segments:[], revealMode:"gift" }; db.wheel.push(w); }
  return w;
}
/* Un segment stocké peut être soit une chaîne brute (ancien format, sans lien), soit un objet
   {text, ref:{type,id}|null} (nouveau format — ref pointe vers l'entité d'origine quand le
   segment vient d'un préréglage, pour le bouton "Voir" sur l'écran de révélation). Les deux
   formats coexistent en base sans migration : on normalise à la lecture. */
function wheelNormSeg(s){
  if(s && typeof s === "object") return { text:(s.text||"").trim(), ref:s.ref||null };
  return { text:(s||"").trim(), ref:null };
}
function wheelSegments(){
  const w = wheelConfig();
  return (w && w.segments || []).map(wheelNormSeg).filter(s=>s.text);
}
/* Le bouton "Voir" (fiche de l'entité gagnée) ne doit jamais faire planter l'appli si l'entité a
   été supprimée depuis, et ne doit jamais donner à un joueur accès à un type d'entité qu'il ne
   verrait pas autrement dans l'appli (ex. Trésor, qui porte des champs MJ comme boon/curse) —
   on réutilise donc PLAYER_VISIBLE_TABS, la même règle qui cache déjà les onglets, plutôt que
   d'inventer un second système de permissions. */
function wheelRefViewable(ref){
  if(!ref || !ref.type || !ref.id) return false;
  if(!getEntity(ref.type, ref.id)) return false;
  if(effectiveRole()==="gm") return true;
  const tab = TAB_OF[ref.type];
  return !!tab && PLAYER_VISIBLE_TABS.includes(tab);
}
/* Choix MJ entre deux habillages de révélation, éditable via openWheelEditModal() :
   "gift" = paquet cadeau, "Joyeux anniversaire", fanfare musicale ;
   "chest" = coffre mystérieux, "Vous avez trouvé…", grincement de charnière. */
function wheelRevealMode(){
  const w = wheelConfig();
  return (w && w.revealMode) || "gift";
}

const WHEEL_PALETTE = ["var(--gold)","var(--blood)","var(--violet)","var(--gold2)","var(--blood2)","var(--violet2)"];
const WHEEL_SPIN_MS = 5400; // durée du tirage — au moins 5s de suspense demandées, source de vérité partagée avec le son
let wheelRotation = 0;   // rotation cumulée en degrés du <svg> roue — remise à 0 à chaque (re)rendu de l'onglet
let wheelSpinning = false;

/* Avec un préréglage (ex. tous les parchemins de sort), la liste de bonus peut compter des
   dizaines d'entrées — un camembert avec autant de quartiers textuels devient illisible ("un
   milliard de camemberts" — retour de Tristan) ; et reconstruire la roue à chaud juste avant de la
   faire tourner (pour piocher un sous-ensemble différent à chaque tirage) provoquait un blocage
   (transition CSS jamais déclenchée sur un <svg> tout juste recréé — retour de Tristan également).
   Au-delà de WHEEL_MAX_VISIBLE, la roue affiche donc TOUS les quartiers (tirage réellement
   équitable sur la liste complète, roue jamais reconstruite pendant un tirage — voir
   buildWheelSVG(..., blank) et spinWheel()) mais sans texte dessus, avec un effet de flou de
   mouvement pendant qu'elle tourne plus vite ; le nom gagné n'apparaît que sur l'écran de
   révélation. En dessous du seuil, les quartiers restent lisibles comme avant. */
const WHEEL_MAX_VISIBLE = 10;
/* Mode mystère (case à cocher côté MJ) : la roue affiche "?" à la place des noms tant qu'elle n'a
   pas tourné — seul l'écran de révélation montre le vrai texte gagné. Ne change que l'affichage,
   jamais le tirage (toujours équitable sur la liste réelle). */
function wheelMysteryMode(){ const w = wheelConfig(); return !!(w && w.mystery); }
function wheelDisplayTexts(segs, mystery){ return mystery ? segs.map(()=>"?") : segs.map(s=>s.text); }

/* --------- Son de tension (Web Audio API pure, aucun fichier externe) ---------
   Bruit blanc filtré ("brrrr" continu qui s'essouffle) + cliquets discrets qui
   ralentissent progressivement (roue à cliquet), tous deux calés sur WHEEL_SPIN_MS.
   Créé au clic sur "Tourner la roue" (geste utilisateur = pas de souci de politique
   autoplay), coupé proprement à la fin du tirage ou si on change d'onglet en route. */
let wheelAudioCtx = null;
let wheelAudioActive = null; // { noise, noiseGain, ticks, stopAt } de la session de son en cours, ou null
function ensureWheelAudioCtx(){
  if(!wheelAudioCtx) wheelAudioCtx = new (window.AudioContext||window.webkitAudioContext)();
  if(wheelAudioCtx.state==="suspended") wheelAudioCtx.resume();
  return wheelAudioCtx;
}
function startWheelTensionSound(durationMs){
  stopWheelTensionSound();
  let ctx;
  try{ ctx = ensureWheelAudioCtx(); }catch(e){ return; } // Web Audio indisponible : le tirage continue sans son
  const dur = durationMs/1000;
  const now = ctx.currentTime;
  const stopAt = now + dur;

  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++) data[i] = Math.random()*2-1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer; noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass"; filter.Q.value = 5;
  filter.frequency.setValueAtTime(950, now);
  filter.frequency.exponentialRampToValueAtTime(220, stopAt);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.linearRampToValueAtTime(0.1, now+0.25);
  noiseGain.gain.setValueAtTime(0.1, Math.max(now+0.26, stopAt-0.4));
  noiseGain.gain.linearRampToValueAtTime(0.0001, stopAt);
  noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(ctx.destination);
  noise.start(now); noise.stop(stopAt+0.1);

  // cliquets discrets, intervalle géométrique croissant = ralentissement type roue à cliquet
  const ticks = [];
  let t = 0.05, interval = 0.085;
  while(t < dur - 0.12){
    const at = now + t;
    const osc = ctx.createOscillator();
    osc.type = "square"; osc.frequency.setValueAtTime(680, at);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.22, at+0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, at+0.045);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(at); osc.stop(at+0.06);
    ticks.push(osc);
    t += interval;
    interval *= 1.085;
  }

  wheelAudioActive = { noise, noiseGain, ticks, stopAt };
  setTimeout(()=>{ if(wheelAudioActive && wheelAudioActive.stopAt===stopAt) wheelAudioActive=null; }, durationMs+200);
}
function stopWheelTensionSound(){
  if(!wheelAudioActive || !wheelAudioCtx){ wheelAudioActive = null; return; }
  const ctx = wheelAudioCtx;
  const { noise, noiseGain, ticks } = wheelAudioActive;
  const now = ctx.currentTime;
  try{
    noiseGain.gain.cancelScheduledValues(now);
    noiseGain.gain.setValueAtTime(noiseGain.gain.value, now);
    noiseGain.gain.linearRampToValueAtTime(0.0001, now+0.06);
    noise.stop(now+0.08);
  }catch(e){ /* déjà arrêté */ }
  ticks.forEach(osc=>{ try{ osc.stop(now); }catch(e){} });
  wheelAudioActive = null;
}

/* Petite fanfare "tadaaa" (arpège montant + accord tenu) jouée à l'ouverture du cadeau,
   en plus du son de tension pendant la rotation — toujours en Web Audio pure, aucun fichier.
   Réutilise le même AudioContext que le son de tension (déjà débloqué par le clic initial). */
function playWheelFanfare(){
  let ctx;
  try{ ctx = ensureWheelAudioCtx(); }catch(e){ return; }
  const now = ctx.currentTime;
  const notes = [
    { freq:523.25, at:0,    dur:0.11 },  // do5  — "ta"
    { freq:659.25, at:0.11, dur:0.11 },  // mi5  — "da"
    { freq:783.99, at:0.22, dur:0.11 },  // sol5 — "da"
  ];
  notes.forEach(nt=>{
    const at = now+nt.at;
    const osc = ctx.createOscillator();
    osc.type = "triangle"; osc.frequency.setValueAtTime(nt.freq, at);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(0.24, at+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at+nt.dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(at); osc.stop(at+nt.dur+0.02);
  });
  // accord final tenu (do6 + sol5 + mi5) — le "DAAA" qui conclut la fanfare
  const chordAt = now+0.33;
  [ {freq:1046.5, type:"sawtooth", gain:0.26}, {freq:783.99, type:"triangle", gain:0.16}, {freq:659.25, type:"triangle", gain:0.16} ]
    .forEach(({freq,type,gain})=>{
      const osc = ctx.createOscillator();
      osc.type = type; osc.frequency.setValueAtTime(freq, chordAt);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, chordAt);
      g.gain.linearRampToValueAtTime(gain, chordAt+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, chordAt+0.9);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(chordAt); osc.stop(chordAt+0.95);
    });
}

/* Ouverture du coffre mystérieux (mode "chest") : un instant de grincement (juste un indice
   physique, très bref, jamais dominant) suivi d'un arpège ascendant scintillant + accord tenu
   avec vibrato — révélation triomphale façon "objet trouvé" (Zelda), jamais lugubre. Toujours en
   Web Audio pure. Génère une variante différente à chaque ouverture (racine/gamme/tempo/timbre/
   registre tirés au sort parmi des choix qui restent tous "brillants") plutôt qu'un unique son
   figé — beaucoup plus de variété réelle qu'une poignée de sons pré-enregistrés, et ça reste
   toujours dans la même famille sonore (jamais dissonant, jamais aussi sombre qu'avant). */
function wheelNoteFreq(semitoneFromA4){ return 440 * Math.pow(2, semitoneFromA4/12); }
const WHEEL_CHEST_ROOTS = [-9,-7,-5,-2,0,2]; // quelques toniques (do,ré,mi,sol,la,si) — choix lumineux
const WHEEL_CHEST_SCALES = [
  [0,4,7,12],    // triade majeure + octave
  [0,2,4,7,9],   // pentatonique majeure
  [0,4,7,11,12], // majeure 7 scintillante
  [0,3,7,10,12], // relative mineure, mais reste héroïque joué vite et en aigu
];
function playWheelChestOpen(){
  let ctx;
  try{ ctx = ensureWheelAudioCtx(); }catch(e){ return; }
  const now = ctx.currentTime;

  const root = WHEEL_CHEST_ROOTS[Math.floor(Math.random()*WHEEL_CHEST_ROOTS.length)];
  const scale = WHEEL_CHEST_SCALES[Math.floor(Math.random()*WHEEL_CHEST_SCALES.length)];
  const runLen = 3 + Math.floor(Math.random()*3); // 3 à 5 notes dans la montée
  const noteGap = 0.07 + Math.random()*0.03;
  const runWave = ["triangle","square","sine"][Math.floor(Math.random()*3)];
  const octaveShift = Math.random()<0.3 ? 12 : 0; // parfois un registre plus haut, pour varier

  // couvercle qui se soulève — un tout petit indice physique, très court
  const creak = ctx.createOscillator();
  creak.type = "triangle";
  const creakFilter = ctx.createBiquadFilter();
  creakFilter.type = "lowpass"; creakFilter.frequency.value = 800;
  const creakGain = ctx.createGain();
  creak.connect(creakFilter); creakFilter.connect(creakGain); creakGain.connect(ctx.destination);
  const creakBase = wheelNoteFreq(root-24+octaveShift);
  [[creakBase,0],[creakBase*1.4,0.06]].forEach(([freq,t])=>{
    const at = now+t;
    creak.frequency.setValueAtTime(freq, at);
    creakGain.gain.setValueAtTime(0.0001, at);
    creakGain.gain.linearRampToValueAtTime(0.1, at+0.015);
    creakGain.gain.exponentialRampToValueAtTime(0.02, at+0.08);
  });
  creak.start(now); creak.stop(now+0.18);

  // arpège ascendant — motif/gamme/tempo/timbre différents à chaque tirage
  const fanfareStart = now + 0.14;
  for(let i=0;i<runLen;i++){
    const deg = scale[Math.min(i, scale.length-2)]; // reste dans le corps de la gamme
    const freq = wheelNoteFreq(root + deg + octaveShift);
    const at = fanfareStart + i*noteGap;
    const osc = ctx.createOscillator();
    osc.type = runWave; osc.frequency.setValueAtTime(freq, at);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(0.26, at+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at+noteGap+0.05);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(at); osc.stop(at+noteGap+0.08);
  }

  // accord final tenu, brillant, léger vibrato — l'étincelle de la trouvaille
  const chordAt = fanfareStart + runLen*noteGap;
  const topDeg = scale[scale.length-1];
  const chordDegs = [topDeg, scale[Math.max(0,scale.length-3)], topDeg+7];
  chordDegs.forEach((deg,i)=>{
    const freq = wheelNoteFreq(root + deg + octaveShift);
    const osc = ctx.createOscillator();
    osc.type = i===chordDegs.length-1 ? "sine" : "triangle";
    osc.frequency.setValueAtTime(freq, chordAt);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 5.5 + Math.random()*2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = freq*0.01;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, chordAt);
    g.gain.linearRampToValueAtTime(i===0?0.24:0.14, chordAt+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, chordAt+1.0);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(chordAt); lfo.start(chordAt);
    osc.stop(chordAt+1.05); lfo.stop(chordAt+1.05);
  });
}

/* Habillage du texte des secteurs : les bonus formulés en plusieurs mots (fréquent en
   Shadowdark — "Un droit de plume au sceau sacré", "104 points d'expérience"…) débordaient
   largement d'un simple texte radial sur une ligne, en particulier avec beaucoup de secteurs.
   On enveloppe donc le texte sur plusieurs lignes tangentielles, chacune contrainte à la corde
   réellement disponible à son rayon (2·r·sin(angle/2)) — la corde s'élargit avec le rayon, donc
   les lignes extérieures ont naturellement plus de place que les lignes proches du centre. Une
   seule taille de police est choisie pour l'ensemble de la roue (le pire des secteurs doit tenir),
   pour un rendu homogène. */
const WHEEL_CHAR_W = 0.6;     // largeur moyenne d'un caractère, en fraction de la taille de police (police --ui, semi-gras)
const WHEEL_MAX_LINES = 4;
const WHEEL_LABEL_BASE_R = 0.52; // fraction du rayon où démarre la 1ère ligne — plus haut/loin du centre que l'ancien 0.40
function wheelLineRadius(lineIdx, fontSize, r){ return r*WHEEL_LABEL_BASE_R + lineIdx*fontSize*1.15; }
function wheelLineBudget(lineIdx, fontSize, anglePerRad, r){
  const rr = wheelLineRadius(lineIdx, fontSize, r);
  const chord = 2*rr*Math.sin(anglePerRad/2);
  return Math.max(chord*0.8, fontSize*1.4);
}
function wheelTextWidth(text, fontSize){ return text.length*WHEEL_CHAR_W*fontSize; }
function truncateWheelText(text, budget, fontSize){
  const maxChars = Math.max(1, Math.floor(budget/(WHEEL_CHAR_W*fontSize)));
  return text.length<=maxChars ? text : text.slice(0, Math.max(1,maxChars-1))+"…";
}
/* Répartition gloutonne des mots sur des lignes de largeur croissante (une par rayon, li=0 = la
   plus proche du centre). Construite à partir de la FIN du texte : la ligne 0 (centre) reçoit les
   derniers mots, la dernière ligne (bord) reçoit les premiers — pour qu'une lecture du bord vers
   le centre restitue l'ordre naturel du texte (ex. "1d4 point d'XP" et non "d'XP point 1d4").
   Retourne overflow:true si le texte ne tient pas dans WHEEL_MAX_LINES à cette taille de police,
   auquel cas on tronque la ligne la plus externe plutôt que de laisser déborder sur le secteur voisin. */
function wrapWheelLabel(text, fontSize, anglePerRad, r){
  const words = text.split(/\s+/).filter(Boolean);
  const revWords = [...words].reverse();
  const chunkWords = []; // chunkWords[0] = mots de fin de texte (ligne la plus proche du centre)
  let cur = [];
  let li = 0;
  for(const word of revWords){
    const test = [word, ...cur]; // remet l'ordre normal des mots à l'intérieur de la ligne
    if(!cur.length || wheelTextWidth(test.join(" "), fontSize) <= wheelLineBudget(li, fontSize, anglePerRad, r)){
      cur = test;
    } else {
      chunkWords.push(cur);
      li++;
      if(li >= WHEEL_MAX_LINES){
        const budget = wheelLineBudget(li-1, fontSize, anglePerRad, r);
        const combined = [...chunkWords[chunkWords.length-1], word].join(" ");
        chunkWords[chunkWords.length-1] = [truncateWheelText(combined, budget, fontSize)];
        return { lines: chunkWords.map(c=>c.join(" ")), overflow:true };
      }
      cur = [word];
    }
  }
  if(cur.length) chunkWords.push(cur);
  const lines = chunkWords.map(c=>c.join(" "));
  return { lines, overflow:false };
}
function fitWheelFontSize(segments, anglePerRad, r){
  const candidates = [16,15,14,13,12,11,10,9,8,7];
  for(const fs of candidates){
    const fits = segments.every(seg => !wrapWheelLabel(seg, fs, anglePerRad, r).overflow);
    if(fits) return fs;
  }
  return 7; // dernier recours : la plus petite taille, quitte à tronquer la dernière ligne de certains secteurs
}

/* Secteurs = camembert SVG généré en JS (pas de dépendance). Convention d'angle :
   0° = est (droite), sens horaire — le secteur 0 démarre à -90° (haut du cadre),
   là où se trouve le pointeur fixe. */
function buildWheelSVG(segments, blank){
  const n = segments.length;
  const cx=150, cy=150, r=140;
  const anglePer = 360/n;
  const anglePerRad = anglePer*Math.PI/180;
  const pt = (angleDeg, radius)=>{ const a=angleDeg*Math.PI/180; return { x: cx+radius*Math.cos(a), y: cy+radius*Math.sin(a) }; };
  const fontSize = blank ? 0 : fitWheelFontSize(segments, anglePerRad, r);
  const parts = segments.map((seg,i)=>{
    const start = -90 + i*anglePer, end = start + anglePer, mid = start + anglePer/2;
    const p1 = pt(start,r), p2 = pt(end,r);
    const largeArc = anglePer>180 ? 1 : 0;
    const color = WHEEL_PALETTE[i % WHEEL_PALETTE.length];
    const pathEl = `<path d="M ${cx} ${cy} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z" style="fill:${color}"></path>`;
    if(blank) return pathEl; // trop de quartiers pour du texte lisible — voir commentaire plus haut
    const { lines } = wrapWheelLabel(seg, fontSize, anglePerRad, r);
    // Texte tangentiel fixe (aligné sur la tangente au rayon, mid+90°) — comme peint sur une
    // vraie roue de fête foraine : orientation propre à chaque secteur, ne se réajuste jamais
    // pour "rester lisible" une fois la roue tournée. Si un secteur atterrit en bas après un
    // tirage, son texte est à l'envers à ce moment-là, et c'est normal — voulu par Tristan.
    const textRot = mid + 90;
    const textParts = lines.map((line,li)=>{
      const tp = pt(mid, wheelLineRadius(li, fontSize, r));
      return `<text x="${tp.x.toFixed(2)}" y="${tp.y.toFixed(2)}" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${textRot.toFixed(2)} ${tp.x.toFixed(2)} ${tp.y.toFixed(2)})">${esc(line)}</text>`;
    }).join("");
    return pathEl + textParts;
  }).join("");
  return `<svg class="wheel-rotor${blank?' wheel-rotor-blank':''}" id="wheel-rotor" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">${parts}</svg>`;
}

// Segments actuellement affichés sur la roue — toujours la liste COMPLÈTE (au-delà de
// WHEEL_MAX_VISIBLE, juste sans texte, voir buildWheelSVG). Fixé au rendu de l'onglet et JAMAIS
// modifié pendant un tirage : le <svg> n'est plus jamais recréé au clic sur "Tourner", ce qui
// élimine la classe de bug liée au timing de la transition CSS sur un élément tout juste (re)créé
// (retour de Tristan : la roue restait bloquée "en train de tourner" sans jamais conclure).
let wheelDisplayedSegs = [];

function viewWheel(){
  wheelRotation = 0; wheelSpinning = false; // le SVG est reconstruit à chaque appel, sa rotation visuelle repart de 0
  const segments = wheelSegments();
  const mystery = wheelMysteryMode();
  const editBtn = effectiveRole()==="gm" ? `<button class="btn ghost sm" data-wheel-edit="1">✎ Modifier les bonus</button>` : "";
  const blank = segments.length > WHEEL_MAX_VISIBLE;
  const capNote = blank ? " — trop nombreux pour être affichés lisiblement, la roue tourne « à l'aveugle » (flou, plus rapide)" : "";
  const mysteryNote = mystery ? " · 🎭 mode mystère" : "";
  const head = `<div class="page-head">
    <div><h1>Roue des bonus</h1><div class="sub">${segments.length} bonus configuré(s)${capNote}${mysteryNote}</div></div>
    ${editBtn ? `<div class="hbtns">${editBtn}</div>` : ""}
  </div>`;

  if(segments.length < 2){
    app.innerHTML = head + emptyState("🎡", effectiveRole()==="gm"
      ? "Ajoute au moins deux bonus pour activer la roue."
      : "Ton MJ n'a pas encore configuré la roue.");
    return;
  }

  wheelDisplayedSegs = segments; // toujours tout le monde pour le TIRAGE — voir plus haut
  // En mode "à l'aveugle", aucun texte n'est lisible de toute façon : le nombre de quartiers
  // dessinés n'a donc plus besoin de correspondre au nombre réel de bonus. On se limite à
  // WHEEL_MAX_VISIBLE quartiers décoratifs (sinon des dizaines de micro-parts fines à l'écran)
  // — le tirage réel reste équitable sur toute la liste, juste totalement découplé de l'affichage
  // (voir spinWheel()).
  const svgHTML = blank ? buildWheelSVG(Array(WHEEL_MAX_VISIBLE).fill(""), true) : buildWheelSVG(wheelDisplayTexts(segments, mystery));
  app.innerHTML = `${head}
    <div class="wheel-stage">
      <div class="wheel-frame">
        <div class="wheel-pointer"></div>
        ${svgHTML}
        <div class="wheel-hub"></div>
      </div>
      <button class="btn wheel-spin-btn" data-wheel-spin="1">🎡 Tourner la roue</button>
    </div>`;
}

function spinWheel(){
  if(wheelSpinning) return;
  stopWheelTensionSound(); // garde-fou : coupe un éventuel reliquat sonore avant de relancer
  const displayed = wheelDisplayedSegs;
  if(displayed.length < 2) return;
  const rotor = document.getElementById("wheel-rotor");
  const btn = document.querySelector("[data-wheel-spin]");
  if(!rotor) return;
  wheelSpinning = true;
  if(btn) btn.disabled = true;
  const blank = rotor.classList.contains("wheel-rotor-blank");

  // Tirage uniformément sur toute la liste (voir wheelDisplayedSegs) — le <svg> n'est jamais
  // touché avant d'être une seule fois animé via son transform ci-dessous.
  const idx = Math.floor(Math.random()*displayed.length);
  const winnerSeg = displayed[idx];

  let delta;
  if(blank){
    // Les quartiers dessinés sont purement décoratifs en mode "à l'aveugle" (voir viewWheel()) et
    // ne correspondent plus au gagnant réel tiré ci-dessus — la position d'arrêt est donc un angle
    // au hasard, indépendant de idx/displayed.length.
    delta = Math.random()*360;
  } else {
    const n = displayed.length;
    const anglePer = 360/n;
    const segMidAngle = -90 + idx*anglePer + anglePer/2;
    delta = (-90 - segMidAngle) % 360;
    if(delta < 0) delta += 360;
  }
  // Beaucoup plus de tours en mode "à l'aveugle" (flou) pour renforcer l'effet "trop rapide pour
  // lire" — toujours dans la même durée totale (WHEEL_SPIN_MS), donc toujours au moins 5s.
  const turns = blank ? (14 + Math.floor(Math.random()*5)) : (7 + Math.floor(Math.random()*4));
  const currentMod = ((wheelRotation % 360) + 360) % 360;
  let add = delta - currentMod;
  if(add <= 0) add += 360;
  wheelRotation += add + turns*360;

  if(blank) rotor.classList.add("spinning-blur");
  rotor.style.transform = `rotate(${wheelRotation}deg)`; // la transition (durée = WHEEL_SPIN_MS) vient de la classe .wheel-rotor
  startWheelTensionSound(WHEEL_SPIN_MS);
  // Garde-fou (défense en profondeur, gardé même si la cause principale du blocage est éliminée
  // ci-dessus) : si transitionend ne se déclenche jamais pour une autre raison (onglet en
  // arrière-plan qui suspend les transitions…), l'appli ne doit jamais rester bloquée indéfiniment.
  let wheelSpinSettled = false;
  const finishWheelSpin = ()=>{
    if(wheelSpinSettled) return;
    wheelSpinSettled = true;
    wheelSpinning = false;
    if(btn) btn.disabled = false;
    rotor.classList.remove("spinning-blur"); // pour que la prochaine animation puisse rejouer depuis le début
    stopWheelTensionSound();
    showWheelReward(winnerSeg);
  };
  rotor.addEventListener("transitionend", finishWheelSpin, { once:true });
  setTimeout(finishWheelSpin, WHEEL_SPIN_MS + 600);
}

/* Révélation : boîte (cadeau ou coffre, selon wheelRevealMode()) qui s'ouvre + confettis +
   grand texte d'accroche + bonus tiré — easter egg demandé explicitement, à chaque tirage.
   "gift" : paquet cadeau, "Joyeux anniversaire", fanfare musicale.
   "chest" : coffre mystérieux, "Vous avez trouvé…", grincement de charnière rouillée. */
const WHEEL_REVEAL_TEXT = { gift:"Joyeux anniversaire", chest:"Vous avez trouvé…" };
function showWheelReward(seg){
  // Tolère un appel avec du texte brut (compat) en plus de l'objet {text,ref} normal.
  const s = seg && typeof seg === "object" ? seg : { text:seg, ref:null };
  const mode = wheelRevealMode();
  const overlay = document.getElementById("wheel-reward");
  const inner = overlay.querySelector(".wheel-reward-inner");
  const viewBtn = wheelRefViewable(s.ref)
    ? `<button type="button" class="btn ghost" data-wheel-view-ref="${esc(s.ref.type)}:${esc(s.ref.id)}">👁 Voir la fiche</button>` : "";
  inner.innerHTML = `<div class="reveal-box ${mode}" id="wheel-gift"><div class="reveal-lid"></div><div class="reveal-base"></div></div>
    <div class="wheel-reward-banner" id="wheel-banner">
      <div class="wheel-reward-happy">${esc(WHEEL_REVEAL_TEXT[mode] || WHEEL_REVEAL_TEXT.gift)}</div>
      <div class="wheel-reward-prize">${esc(s.text)}</div>
      <div class="hbtns" style="justify-content:center">
        ${viewBtn}
        <button type="button" class="btn" data-wheel-reward-close="1">✦ Fermer</button>
      </div>
    </div>
    <div class="confetti-layer" id="wheel-confetti"></div>`;
  overlay.classList.remove("hidden");
  const gift = document.getElementById("wheel-gift"), banner = document.getElementById("wheel-banner");
  setTimeout(()=>{ gift.classList.add("shake"); }, 150);
  setTimeout(()=>{
    gift.classList.remove("shake"); gift.classList.add("open");
    spawnWheelConfetti();
    banner.classList.add("show");
    if(mode==="chest") playWheelChestOpen(); else playWheelFanfare();
  }, 750);
}
function hideWheelReward(){
  const overlay = document.getElementById("wheel-reward");
  overlay.classList.add("hidden");
  overlay.querySelector(".wheel-reward-inner").innerHTML = "";
}
function spawnWheelConfetti(){
  const layer = document.getElementById("wheel-confetti");
  if(!layer) return;
  const colors = ["var(--gold)","var(--gold2)","var(--blood)","var(--blood2)","var(--violet)","var(--violet2)"];
  let html = "";
  for(let i=0;i<50;i++){
    const left = (Math.random()*100).toFixed(1);
    const delay = (Math.random()*0.5).toFixed(2);
    const dur = (2.2 + Math.random()*1.2).toFixed(2);
    const color = colors[Math.floor(Math.random()*colors.length)];
    const rot = Math.floor(Math.random()*360);
    html += `<div class="confetti-piece" style="left:${left}%; background:${color}; animation-delay:${delay}s; animation-duration:${dur}s; transform:rotate(${rot}deg)"></div>`;
  }
  layer.innerHTML = html;
}

/* --------- Édition MJ des bonus (modale, liste simple ajout/suppr) --------- */
function wheelRowHTML(seg,i){
  const s = wheelNormSeg(seg);
  const refAttr = s.ref ? `${s.ref.type}:${s.ref.id}` : "";
  return `<div class="repeat-item wheel-seg-item" data-wheelrowitem data-seg-ref="${esc(refAttr)}" data-seg-orig-text="${esc(s.text)}">
    <div class="rrow">
      <div class="field" style="flex:0 0 2.5rem"><label>#${i+1}</label></div>
      <div class="field" style="flex:1 1 200px"><input type="text" class="wheel-seg-input" value="${esc(s.text)}" placeholder="Ex. Potion de soin gratuite"></div>
      ${s.ref ? `<span class="tag gold" style="flex:0 0 auto" title="Lié à une fiche existante — se délie si tu modifies le texte">🔗</span>` : ""}
      <button class="btn danger sm" data-wheel-remove-seg>✕</button>
    </div></div>`;
}
function reindexWheelSegRows(){
  document.querySelectorAll("#wheel-seg-wrap .wheel-seg-item").forEach((el,i)=>{ el.querySelector("label").textContent = "#"+(i+1); });
}
function openWheelEditModal(){
  const w = ensureWheelConfig();
  const segs = w.segments.length ? w.segments : ["",""];
  const mode = w.revealMode || "gift";
  openModal(`<div style="position:sticky; top:-1.3rem; margin:-1.3rem -1.3rem 0; padding:1.3rem 1.3rem .8rem;
        background:var(--panel2); z-index:5; border-bottom:1px solid var(--border);
        display:flex; justify-content:space-between; align-items:center; gap:.6rem">
      <h2 style="margin:0;color:var(--gold2)">Bonus de la roue</h2>
      <div style="display:flex; gap:.4rem; align-items:center; flex:0 0 auto">
        <button type="button" class="btn sm" data-wheel-save-segments="1">✓ Enregistrer</button>
        <button class="icon-btn" data-modal-close="1">✕</button>
      </div>
    </div>
    <div class="field" style="margin:.7rem 0 1rem">
      <label>Ambiance de révélation</label>
      <select id="f-wheel-mode">
        <option value="gift" ${mode==="gift"?"selected":""}>🎁 Paquet cadeau — « Joyeux anniversaire »</option>
        <option value="chest" ${mode==="chest"?"selected":""}>🗝️ Coffre mystérieux — « Vous avez trouvé… »</option>
      </select>
    </div>
    <div class="field" style="margin-bottom:.9rem">
      <label style="display:flex; align-items:center; gap:.5rem; cursor:pointer">
        <input type="checkbox" id="f-wheel-mystery" style="width:auto" ${w.mystery?"checked":""}>
        🎭 Mode mystère — la roue affiche « ? » à la place des noms, révélés seulement au tirage
      </label>
    </div>
    <div class="field" style="margin-bottom:.9rem">
      <label>Préréglages <span class="hint">(remplace la liste ci-dessous par le contenu d'une collection existante — modifiable avant d'enregistrer, et garde un lien vers la fiche d'origine pour le bouton « Voir » à la révélation)</span></label>
      <div style="display:flex; flex-wrap:wrap; gap:.4rem">
        <button type="button" class="btn ghost sm" data-wheel-preset="spell">📜 Parchemins de sort</button>
        <button type="button" class="btn ghost sm" data-wheel-preset="trouvaille">🔍 Trouvaille</button>
        <button type="button" class="btn ghost sm" data-wheel-preset="relique">💠 Relique</button>
        <button type="button" class="btn ghost sm" data-wheel-preset="regalia">👑 Régalia</button>
      </div>
    </div>
    <div class="field" style="margin-bottom:.9rem">
      <label>Depuis une table aléatoire <span class="hint">(remplace la liste ci-dessous par le contenu actuel d'une table de l'onglet Aléatoire — statique ou dynamique ; seules les tables cochées « Proposer dans le menu de la roue » apparaissent ici)</span></label>
      <div style="display:flex; gap:.4rem; flex-wrap:wrap">
        ${(()=>{ const wheelTables = db.tables.filter(t=>t.wheelInclude); return wheelTables.length
            ? `<select id="wheel-table-select" style="flex:1 1 220px; min-width:0">${[...wheelTables].sort((a,b)=>(a.title||"").localeCompare(b.title||"")).map(t=>`<option value="${esc(t.id)}">${esc(t.title||"Sans titre")} (${tableSize(t)})</option>`).join("")}</select>
               <button type="button" class="btn ghost sm" data-wheel-preset-table="1" style="flex:0 0 auto">🎲 Appliquer cette table</button>`
            : `<span class="faint" style="font-family:var(--ui);font-size:.82rem">Aucune table cochée pour la roue — coche « Proposer dans le menu de la roue » sur une table depuis l'onglet Aléatoire.</span>`; })()}
      </div>
    </div>
    <div class="field" style="margin-bottom:.9rem">
      <label>Mes préréglages <span class="hint">(tes propres listes sauvegardées — chaque enregistrement AJOUTE un nouveau préréglage à la liste ci-dessous, il n'en remplace jamais un existant ; donne des noms différents pour en garder plusieurs)</span></label>
      <div style="display:flex; flex-wrap:wrap; gap:.4rem; margin-bottom:.5rem">
        ${(w.presets||[]).length ? (w.presets||[]).map(p=>`<span style="display:inline-flex; align-items:stretch; border:1px solid var(--border); border-radius:8px; overflow:hidden">
            <button type="button" class="btn ghost sm" style="border:none; border-radius:0" data-wheel-custom-preset="${esc(p.id)}">${esc(p.name)}</button>
            <button type="button" class="icon-btn" style="border-left:1px solid var(--border); border-radius:0" data-wheel-delete-preset="${esc(p.id)}" title="Supprimer ce préréglage">✕</button>
          </span>`).join("") : `<span class="faint" style="font-family:var(--ui);font-size:.82rem">Aucun pour l'instant.</span>`}
      </div>
      <div style="display:flex; gap:.4rem; flex-wrap:wrap">
        <input type="text" id="wheel-preset-name" placeholder="Nom du nouveau préréglage" autocomplete="off" style="flex:1 1 220px; min-width:0">
        <button type="button" class="btn ghost sm" data-wheel-save-preset="1" style="flex:0 0 auto">💾 Enregistrer comme nouveau préréglage</button>
      </div>
    </div>
    <p class="wheel-seg-hint">Un bonus par ligne, texte court conseillé. Tirage à chances égales entre toutes les lignes non vides.</p>
    <div id="wheel-seg-wrap">${segs.map(wheelRowHTML).join("")}</div>
    <button class="btn ghost sm" data-wheel-add-seg="1">+ Ajouter un bonus</button>
    <div class="form-actions" style="margin-top:1rem"><button class="btn" data-wheel-save-segments="1">✓ Enregistrer</button><button class="btn ghost" data-modal-close="1">Annuler</button></div>`);
  const presetNameInput = document.getElementById("wheel-preset-name");
  if(presetNameInput) presetNameInput.addEventListener("keydown", ev=>{
    if(ev.key==="Enter"){ ev.preventDefault(); document.querySelector("[data-wheel-save-preset]").click(); }
  });
}
/* Lit l'état actuel des lignes de l'éditeur en {text,ref}[] — partagé entre saveWheelSegments()
   et l'enregistrement d'un préréglage personnalisé, pour ne pas dupliquer la logique de rupture
   de lien (ref conservée seulement si le texte de la ligne n'a pas été modifié à la main). */
function wheelReadRows(){
  return [...document.querySelectorAll("#wheel-seg-wrap .wheel-seg-item")].map(row=>{
    const text = row.querySelector(".wheel-seg-input").value.trim();
    if(!text) return null;
    let ref = null;
    const refAttr = row.dataset.segRef;
    if(refAttr && text===row.dataset.segOrigText){
      const sep = refAttr.indexOf(":");
      if(sep>0) ref = { type:refAttr.slice(0,sep), id:refAttr.slice(sep+1) };
    }
    return { text, ref };
  }).filter(Boolean);
}
/* Préréglages : remplacent la liste de segments par le contenu actuel d'une collection existante
   (sorts, ou trésors filtrés par catégorie) — un simple "remplissage rapide" modifiable ensuite,
   pas un lien permanent. Chaque ligne garde une référence {type,id} vers l'entité d'origine (pour
   le bouton "Voir" à la révélation), perdue si le texte de la ligne est modifié à la main. Pas de
   préréglage "Potion" pour l'instant : les tables aléatoires de potions sont encore à retravailler
   (demande explicite de Tristan, chantier séparé). */
function applyWheelPreset(kind){
  let segs;
  if(kind==="spell") segs = db.spells.map(s=>({ text:`Parchemin de ${s.name||"sort inconnu"}`, ref:{type:"spell",id:s.id} }));
  else segs = db.treasures.filter(t=>(t.category||"trouvaille")===kind).map(t=>({ text:t.name||"Objet sans nom", ref:{type:"treasure",id:t.id} }));
  segs = segs.filter(s=>s.text);
  if(!segs.length){ toast("Aucune donnée trouvée pour ce préréglage — remplis d'abord la collection correspondante."); return; }
  const wrap = $("#wheel-seg-wrap");
  wrap.innerHTML = segs.map(wheelRowHTML).join("");
  reindexWheelSegRows();
}
/* Préréglage depuis une table aléatoire quelconque de l'onglet Aléatoire (2026-08-17, demande de
   Tristan) — généralise applyWheelPreset() (limité aux 4 boutons figés sort/trouvaille/relique/
   regalia) à N'IMPORTE QUELLE table, statique ou dynamique. Une table dynamique se résout via
   dynamicSourceItems() (déjà utilisé par detailTable()) et garde un ref vers l'entité d'origine
   (bouton "Voir" à la révélation, comme les préréglages existants) ; une table statique n'a que
   du texte brut par ligne, donc ref:null. */
function applyWheelPresetFromTable(tableId){
  const t = db.tables.find(x=>x.id===tableId);
  if(!t){ toast("Table introuvable."); return; }
  let segs;
  if(t.kind==="dynamic"){
    segs = dynamicSourceItems(t).map(x=>({ text:x.name||x.title||"Sans nom", ref:{type:t.source,id:x.id} }));
  } else {
    segs = (t.rows||[]).map(r=>({ text:r||"", ref:null }));
  }
  segs = segs.filter(s=>s.text && s.text.trim());
  if(!segs.length){ toast("Cette table est vide — remplis-la d'abord."); return; }
  const wrap = $("#wheel-seg-wrap");
  wrap.innerHTML = segs.map(wheelRowHTML).join("");
  reindexWheelSegRows();
}
function saveWheelSegments(){
  const vals = wheelReadRows();
  if(vals.length < 2){ toast("Il faut au moins deux bonus non vides."); return; }
  const w = ensureWheelConfig();
  w.segments = vals;
  const modeEl = $("#f-wheel-mode");
  w.revealMode = modeEl && modeEl.value==="chest" ? "chest" : "gift";
  const mysteryEl = $("#f-wheel-mystery");
  w.mystery = !!(mysteryEl && mysteryEl.checked);
  saveDB();
  closeModal();
  toast("Roue mise à jour.");
  if(view.tab==="wheel") viewWheel();
}

/* Préréglages personnalisés (distincts des 4 préréglages de collection ci-dessus) : le MJ
   sauvegarde la liste de segments actuellement dans l'éditeur, sous un nom choisi, pour la
   réappliquer plus tard — stockés directement sur l'enregistrement wheel (w.presets), pas besoin
   d'une table Supabase dédiée. */
function wheelSaveCurrentAsPreset(name){
  const n = (name||"").trim();
  if(!n) return;
  const vals = wheelReadRows();
  if(vals.length < 2){ toast("Remplis au moins deux bonus avant d'enregistrer un préréglage."); return; }
  const w = ensureWheelConfig();
  if(!w.presets) w.presets = [];
  w.presets.push({ id:uid(), name:n, segments:vals });
  saveDB();
  toast(`Préréglage « ${n} » enregistré.`);
  openWheelEditModal();
}
function wheelApplyCustomPreset(id){
  const w = wheelConfig();
  const preset = w && (w.presets||[]).find(p=>p.id===id);
  if(!preset){ toast("Préréglage introuvable."); return; }
  const wrap = $("#wheel-seg-wrap");
  wrap.innerHTML = preset.segments.map(wheelRowHTML).join("");
  reindexWheelSegRows();
}
function wheelDeleteCustomPreset(id){
  const w = ensureWheelConfig();
  w.presets = (w.presets||[]).filter(p=>p.id!==id);
  saveDB();
  toast("Préréglage supprimé.");
  openWheelEditModal();
}
