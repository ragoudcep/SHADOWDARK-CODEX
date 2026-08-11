/* =========================================================================
   CARTES DE DONJON — brouillard de guerre en zones colorées activables
   Le MJ prépare plusieurs cartes (image), une seule à la fois est "active"
   (db.dungeonmaps[].active). Les joueurs ne voient jamais que la carte
   active — la policy RLS Supabase filtre déjà les cartes non actives côté
   serveur (voir outils/supabase_dungeonmaps_setup.sql), donc leur contenu
   ne transite même pas sur le réseau chez un joueur.
   Troisième mouture du brouillard (v1 : patchs rectangulaires à poignées,
   trop pénibles à manipuler finement ; v2 : calque peint au pinceau/gomme
   sur un <canvas>, correct mais toujours une manipulation fine à la souris).
   v3 (actuelle, demandée par Tristan) : chaque coup de pinceau devient une
   **entité indépendante** (`m.strokes[]`, un tracé libre + un rayon,
   coordonnées dans l'espace pixel NATUREL de l'image — pas en pourcentage,
   voir plus bas pourquoi), avec une couleur assignée automatiquement
   (`DMAP_STROKE_COLORS`, cycle par index) pour les distinguer côté MJ. Le
   flux visé : le MJ dessine ses zones à la souris en préparation (précis),
   puis en jeu — notamment au téléphone — il lui suffit de **tapoter** une
   zone pour basculer `hidden` (caché, opaque) / révélé (transparent),
   sans avoir à repeindre finement sur un petit écran.
   Rendu SVG, pas canvas : chaque zone est un <path> avec pointer-events
   natif — le navigateur fait le hit-test du tap tout seul, pas besoin de
   vérifier des pixels à la main comme il aurait fallu avec un canvas.
   viewBox = dimensions naturelles de l'image (`m.imgW`/`m.imgH`, mise en
   cache à l'upload) avec un scale UNIFORME (pas de preserveAspectRatio
   "none") : un viewBox 0-100 étiré différemment en x/y aurait rendu les
   ronds du pinceau elliptiques sur une image non carrée — en gardant le
   viewBox à l'aspect-ratio réel de l'image, un rayon reste un vrai cercle
   à l'écran quel que soit le format du plan.
   Rendu MJ : zones colorées semi-transparentes si cachées, très pâles si
   révélées (repère visuel de l'état courant), curseur "pointer".
   Rendu joueur : seules les zones encore cachées sont rendues, en noir
   opaque uni (jamais la couleur MJ), aucune interactivité dans le DOM.
   Synchro joueurs : polling léger (même modèle que l'Initiative, 4,5s).
   ========================================================================= */
let dungeonMapCurrentId = null;
let dmapTool = "toggle"; // "toggle" (bascule, défaut) | "add" (pinceau libre) | "polygon" (points cliqués) | "delete"
let dmapBrushSize = 2; // % du plus grand côté de l'image — sert uniquement à dessiner une NOUVELLE zone au pinceau
let dmapDraftStroke = null; // {points:[{x,y}]} en cours de tracé au pinceau (mode "add")
let dmapDraftPolygon = null; // {points:[{x,y}]} sommets déjà posés au clic (mode "polygon")
let dmapShowPlayerPreview = false; // affiche un second rendu en lecture seule (vue joueur) sous la vue MJ

const DMAP_STROKE_COLORS = ["#e05252","#e0a052","#d4c93f","#7fc24e","#3fc29e","#4ea3e0","#8a7ae0","#c76ee0","#e06ea8","#9aa0a6"];

let dungeonMapsPollTimer = null;
function stopDungeonMapsPolling(){ if(dungeonMapsPollTimer){ clearInterval(dungeonMapsPollTimer); dungeonMapsPollTimer=null; } }
/* Intervalle volontairement différent de celui de l'Initiative (4,5s) — ici, chaque tick
   retélécharge la ligne ENTIÈRE de la carte active (`select("data")` ramène tout le jsonb, donc
   l'image base64 du plan à chaque fois, pas seulement `strokes`/`active`), potentiellement
   plusieurs centaines de Ko, alors que l'Initiative ne transporte que du texte léger. Descendre
   trop bas ferait exploser la consommation de data mobile sur une session de plusieurs heures.
   2,5s reste un compromis raisonnable (Tristan trouvait 4,5s trop lent en jeu). Pour aller plus
   vite sans alourdir la bande passante, il faudrait séparer l'image (statique, à charger une
   fois) de l'état qui bouge vraiment (strokes/active/softness) — via une sélection PostgREST sur
   des sous-champs du jsonb plutôt que la ligne complète — non fait ici faute de pouvoir tester
   contre le vrai projet Supabase (un mauvais nom de colonne romprait silencieusement le
   rafraîchissement joueur, pire que la lenteur actuelle). */
function startDungeonMapsPolling(){
  if(dungeonMapsPollTimer) return;
  dungeonMapsPollTimer = setInterval(async ()=>{
    // effectiveRole()==="gm" en plus du changement d'onglet : filet de sécurité en doublon de la
    // même garde dans render() (voir son commentaire) — un MJ repassé en rôle effectif "gm" sans
    // que render() se soit exécuté entre-temps ne doit pas non plus laisser ce tick écraser
    // db.dungeonmaps et forcer un retour à la liste.
    if(view.tab!=="dungeonmaps" || effectiveRole()==="gm"){ stopDungeonMapsPolling(); return; }
    try{
      const { data, error } = await sb.from("dungeonmaps").select("data");
      if(error) return; // table pas encore créée côté Supabase, ou souci réseau — on retente au prochain tick
      db.dungeonmaps = (data||[]).map(r=>r.data);
      if(view.tab==="dungeonmaps") renderList();
    }catch(e){ /* silencieux, on retente au prochain tick */ }
  }, 2500);
}

function loadImageAsync(src){
  return new Promise((resolve,reject)=>{ const im=new Image(); im.onload=()=>resolve(im); im.onerror=reject; im.src=src; });
}

function viewDungeonMaps(){
  if(effectiveRole()!=="gm") return playerDungeonMapView();
  return listDungeonMaps();
}

function listDungeonMaps(){
  const itemsAll = db.dungeonmaps;
  const items = filterGmCreated(itemsAll);
  app.innerHTML = pageHead("Cartes de donjon", `${items.length} carte(s)`, "Nouvelle carte") +
    (items.length ? `<div class="grid">${items.map(m=>{
      const total = (m.strokes||[]).length, hidden = (m.strokes||[]).filter(s=>s.hidden).length;
      return `<div class="card" data-open="dungeonmap:${m.id}">
        ${m.image?`<img class="thumb" src="${m.image}" alt="">`:""}
        <h3>${esc(m.name||"Sans nom")}${m.active?' <span class="tag gold">Active</span>':""}</h3>
        <div class="meta"><span class="tag">${total} zone${total>1?"s":""}</span>${total?`<span class="tag gold">${hidden} cachée${hidden>1?"s":""}</span>`:""}</div>
      </div>`;
    }).join("")}</div>`
    : (gmCreatedOnly && itemsAll.length
        ? emptyState("🖋","Aucune création marquée « MJ » dans cet onglet.")
        : emptyState("🗺️","Aucune carte de donjon pour l'instant. Prépares-en une pour tes joueurs.")));
}

function playerDungeonMapView(){
  startDungeonMapsPolling();
  const m = db.dungeonmaps.find(x=>x.active);
  if(!m){ app.innerHTML = emptyState("🗺️","Ton MJ n'a pas encore affiché de carte."); return; }
  app.innerHTML = `<div class="detail"><h1>${esc(m.name||"Carte")}</h1>
    <div class="dmap-scroll">${dungeonMapFrame(m, false)}</div></div>`;
  fixDungeonMapViewBox(m);
}

function formDungeonMap(){
  const m = view.mode==="edit" ? getEntity("dungeonmap", view.id) : {name:""};
  formMapImage = m.image || "";
  app.innerHTML = `<div class="form">
    <button class="back" data-back="1">← Annuler</button>
    <h1>${view.mode==="edit"?"Modifier la":"Nouvelle"} carte de donjon</h1>
    <div class="field"><label>Nom</label><input type="text" id="f-mapname" value="${esc(m.name)}" placeholder="Le Donjon des Ombres"></div>
    <div class="field"><label>Image du plan</label>
      <div id="mapimg-wrap">${formMapImage?`<img class="thumb-lg" src="${formMapImage}" alt="">`:`<p class="faint" style="font-family:var(--ui);font-size:.85rem;margin:.2rem 0">Aucune image pour l'instant.</p>`}</div>
      <button type="button" class="btn ghost sm" id="mapimg-btn" data-add-mapimg="1">${formMapImage?"Remplacer l'image":"Choisir une image"}</button>
      ${view.mode==="edit"?`<p class="faint" style="font-family:var(--ui);font-size:.78rem;margin:.4rem 0 0">Remplacer l'image efface les zones dessinées (coordonnées liées à l'ancienne image).</p>`:""}
    </div>
    <div class="form-actions"><button class="btn" data-save="dungeonmap">✓ Enregistrer</button><button class="btn ghost" data-back="1">Annuler</button></div>
  </div>`;
}
function renderMapImagePreview(){
  const w = document.getElementById("mapimg-wrap"); if(!w) return;
  w.innerHTML = formMapImage ? `<img class="thumb-lg" src="${formMapImage}" alt="">` : `<p class="faint" style="font-family:var(--ui);font-size:.85rem;margin:.2rem 0">Aucune image pour l'instant.</p>`;
  const btn = document.getElementById("mapimg-btn");
  if(btn) btn.textContent = formMapImage ? "Remplacer l'image" : "Choisir une image";
}
async function saveDungeonMap(){
  const nameVal = $("#f-mapname").value.trim();
  if(!nameVal){ toast("Le nom est requis."); return; }
  if(!formMapImage){ toast("Une image est requise."); return; }
  const isNew = view.mode!=="edit";
  const o = isNew ? {id:uid(), active:false, strokes:[]} : getEntity("dungeonmap", view.id);
  const imageChanged = o.image !== formMapImage;
  o.name = nameVal;
  o.image = formMapImage;
  if(isNew || imageChanged){
    // Nouvelle carte (ou image remplacée) : on (re)calcule les dimensions naturelles pour le
    // viewBox SVG, et on vide les zones — leurs coordonnées étaient liées à l'ancienne image.
    const im = await loadImageAsync(formMapImage);
    o.imgW = im.naturalWidth; o.imgH = im.naturalHeight;
    o.strokes = [];
  }
  if(isNew) db.dungeonmaps.push(o);
  saveDB(); toast("Carte enregistrée."); view={tab:"dungeonmaps",mode:"detail",id:o.id}; render();
}

function activateDungeonMap(id){
  db.dungeonmaps.forEach(m=> m.active = (m.id===id));
  saveDB(); toast("Carte affichée aux joueurs.");
  const m = getEntity("dungeonmap", id); if(m) detailDungeonMap(m);
}
function setDungeonMapTool(tool){
  dmapTool = (dmapTool===tool) ? "toggle" : tool;
  dmapDraftPolygon = null; // change d'outil = abandonne un polygone en cours de pose
  const m = getEntity("dungeonmap", dungeonMapCurrentId); if(m) detailDungeonMap(m);
}
function toggleDungeonMapPlayerPreview(){
  dmapShowPlayerPreview = !dmapShowPlayerPreview;
  const m = getEntity("dungeonmap", dungeonMapCurrentId); if(m) detailDungeonMap(m);
}
function addDungeonMapPolygonVertex(m, pt){
  if(!dmapDraftPolygon) dmapDraftPolygon = { points:[] };
  // Clique près du premier sommet (à ≥3 sommets déjà posés) : ferme la forme au lieu d'ajouter
  // un sommet quasi dupliqué juste à côté — snap de fermeture au clic, en plus du bouton dédié.
  if(dmapDraftPolygon.points.length>=3){
    const first = dmapDraftPolygon.points[0];
    const snapRadius = Math.max(m.imgW||1000, m.imgH||1000) * 0.02;
    if(Math.hypot(pt.x-first.x, pt.y-first.y) <= snapRadius){ finishDungeonMapPolygon(m); return; }
  }
  dmapDraftPolygon.points.push(pt);
  detailDungeonMap(m);
}
function undoDungeonMapPolygonVertex(m){
  if(!dmapDraftPolygon) return;
  dmapDraftPolygon.points.pop();
  if(!dmapDraftPolygon.points.length) dmapDraftPolygon = null;
  detailDungeonMap(m);
}
function finishDungeonMapPolygon(m){
  if(!dmapDraftPolygon || dmapDraftPolygon.points.length<3) return;
  const color = DMAP_STROKE_COLORS[(m.strokes||[]).length % DMAP_STROKE_COLORS.length];
  m.strokes = m.strokes || [];
  m.strokes.push({ id:uid(), color, hidden:true, radius:0, shape:"polygon", points:dmapDraftPolygon.points });
  dmapDraftPolygon = null;
  saveDB();
  detailDungeonMap(m);
}
function setAllDungeonMapStrokes(hidden){
  const m = getEntity("dungeonmap", dungeonMapCurrentId); if(!m) return;
  (m.strokes||[]).forEach(s=> s.hidden = hidden);
  saveDB(); detailDungeonMap(m);
}
function toggleDungeonMapStroke(m, strokeId){
  const s = (m.strokes||[]).find(x=>x.id===strokeId); if(!s) return;
  s.hidden = !s.hidden;
  saveDB(); detailDungeonMap(m);
}
function deleteDungeonMapStroke(m, strokeId){
  m.strokes = (m.strokes||[]).filter(s=>s.id!==strokeId);
  saveDB(); detailDungeonMap(m);
}

/* Remplace l'image d'une carte existante (le MJ a retouché son fichier source) SANS repartir de
   zéro sur le travail de brouillard déjà fait — contrairement au remplacement via "✎ Modifier"
   (formDungeonMap/saveDungeonMap) qui vide volontairement m.strokes, pensé pour le cas où on
   réutilise un emplacement de carte pour un donjon totalement différent.
   Les zones sont stockées en pixels ABSOLUS de l'image (m.strokes[].points, .radius — pas en
   pourcentage : voir dungeonMapFrame(), le viewBox SVG est calé sur imgW/imgH pour éviter toute
   distorsion des ronds de pinceau sur une image non carrée). Un simple remplacement de m.image en
   gardant m.strokes intact casserait donc l'alignement dès que la nouvelle image n'a pas EXACTEMENT
   les mêmes dimensions en pixels que l'ancienne. Pour un remplacement "même cadrage, résolution
   différente" (le cas courant : réexport du fichier source retouché), on retrouve l'effet
   attendu en RÉÉCHELONNANT chaque point/rayon proportionnellement au ratio nouvelle/ancienne
   dimension — équivalent à un stockage en pourcentage, calculé au moment du remplacement plutôt
   que maintenu en continu. Si le cadrage a vraiment changé (recadrage, contenu différent), aucun
   calcul ne peut deviner la bonne position — d'où l'avertissement affiché à l'utilisateur. */
async function replaceDungeonMapImage(m, file){
  processMapImage(file, async dataUrl=>{
    const oldW = m.imgW, oldH = m.imgH;
    const im = await loadImageAsync(dataUrl);
    const newW = im.naturalWidth, newH = im.naturalHeight;
    if(oldW && oldH && (oldW!==newW || oldH!==newH)){
      const scaleX = newW/oldW, scaleY = newH/oldH;
      const scaleR = (scaleX+scaleY)/2;
      (m.strokes||[]).forEach(s=>{
        s.points = (s.points||[]).map(p=>({ x:p.x*scaleX, y:p.y*scaleY }));
        s.radius = (s.radius||0)*scaleR;
      });
    }
    m.image = dataUrl; m.imgW = newW; m.imgH = newH;
    saveDB();
    toast("Image remplacée — les zones ont été repositionnées proportionnellement.");
    detailDungeonMap(m);
  });
}

function detailDungeonMap(m){
  // Le brouillon de polygone doit survivre à un re-rendu complet (chaque sommet cliqué redessine
  // toute la vue pour afficher les boutons "Terminer"/"Annuler") — seul un vrai changement de
  // carte doit le vider, pas un re-rendu de la carte en cours.
  if(dungeonMapCurrentId !== m.id){ dmapDraftStroke = null; dmapDraftPolygon = null; dmapShowPlayerPreview = false; }
  dungeonMapCurrentId = m.id;
  const toolHelp = dmapTool==="add"
    ? "Clique-glisse (ou dessine au doigt) pour tracer une nouvelle zone au pinceau. Le mode reste actif : dessine autant de zones que nécessaire, puis re-clique le bouton pour arrêter."
    : dmapTool==="polygon"
      ? "Clique pour poser un sommet, encore et encore, puis « ✓ Terminer » pour fermer la forme (ou clique près du premier sommet). Le mode reste actif pour enchaîner plusieurs polygones."
      : dmapTool==="delete"
        ? "Tapote une zone pour la supprimer définitivement. Re-clique le bouton pour arrêter."
        : "Tapote une zone pour la cacher ou la révéler. C'est le mode par défaut, pensé pour être utilisable en jeu au téléphone.";
  const polygonActions = (dmapTool==="polygon" && dmapDraftPolygon && dmapDraftPolygon.points.length)
    ? `<button class="btn ghost sm" data-dmap-polygon-undo="1">↩ Annuler le dernier sommet</button>
       ${dmapDraftPolygon.points.length>=3?`<button class="btn sm" data-dmap-polygon-finish="1">✓ Terminer</button>`:""}`
    : "";
  app.innerHTML = `<div class="detail">
    <button class="back" data-back="1">← Cartes de donjon</button>
    <h1>${esc(m.name||"Sans nom")}</h1>
    ${detailActions("dungeonmap", m.id)}
    <div style="margin:.2rem 0 .8rem">
      <button class="btn ghost sm" data-dmap-replace-image="1">🖼 Remplacer l'image du plan</button>
      <p class="faint" style="font-family:var(--ui);font-size:.78rem;margin:.35rem 0 0">Les zones déjà dessinées sont conservées et repositionnées proportionnellement à la nouvelle image. Si le cadrage ou le format de l'image a changé (recadrage, contenu différent), elles risquent de ne plus tomber pile au bon endroit — il faudra alors les réajuster à la main.</p>
    </div>
    <div class="crawl-toolbar">
      ${m.active
        ? `<span class="tag gold">Carte actuellement affichée aux joueurs</span>`
        : `<button class="btn ghost sm" data-dmap-activate="${m.id}">👁 Définir comme carte active</button>`}
      <button class="btn ghost sm${dmapTool==="add"?' active-mode':''}" data-dmap-tool="add">➕ Pinceau</button>
      <button class="btn ghost sm${dmapTool==="polygon"?' active-mode':''}" data-dmap-tool="polygon">⬠ Polygone</button>
      <button class="btn ghost sm${dmapTool==="delete"?' active-mode':''}" data-dmap-tool="delete">🗑 Supprimer une zone</button>
      <label style="display:flex;align-items:center;gap:.4rem;font-family:var(--ui);font-size:.8rem;color:var(--muted)">
        Taille du pinceau <input type="range" id="dmap-brush-size" min="0.3" max="15" step="0.1" value="${dmapBrushSize}" style="width:110px">
      </label>
      <label style="display:flex;align-items:center;gap:.4rem;font-family:var(--ui);font-size:.8rem;color:var(--muted)">
        Adoucissement des bords <input type="range" id="dmap-softness" min="0" max="6" step="0.25" value="${m.softness||0}" style="width:110px">
      </label>
      <button class="btn ghost sm" data-dmap-reveal-all="1">👁 Tout révéler</button>
      <button class="btn ghost sm" data-dmap-hide-all="1">🌫 Tout masquer</button>
      <button class="btn ghost sm${dmapShowPlayerPreview?' active-mode':''}" data-dmap-preview-toggle="1">👁 Aperçu joueur</button>
      ${polygonActions}
    </div>
    <div class="crawl-help">${toolHelp}</div>
    <div class="dmap-scroll" id="dmap-scroll">${dungeonMapFrame(m, true, "dmap-svg")}</div>
    ${dmapShowPlayerPreview ? `
    <div class="dmap-preview-wrap">
      <h2 class="dmap-preview-title">👁 Aperçu joueur <span class="faint" style="font-weight:400">— lecture seule, aucune interaction possible</span></h2>
      <p class="crawl-help">${m.active
        ? "Exactement ce que voient les joueurs en ce moment sur cette carte."
        : "Cette carte n'est pas actuellement affichée aux joueurs — voici à quoi elle ressemblerait si tu l'activais."}</p>
      <div class="dmap-scroll dmap-preview-scroll" id="dmap-scroll-preview">${dungeonMapFrame(m, false, "dmap-svg-preview")}</div>
    </div>` : ""}
  </div>`;
  wireDungeonMapSVG(m);
  fixDungeonMapViewBox(m, "dmap-svg");
  if(dmapShowPlayerPreview) fixDungeonMapViewBox(m, "dmap-svg-preview");
}

/* viewBox aux dimensions naturelles de l'image (m.imgW/m.imgH, mises en cache à l'upload) —
   scale uniforme garanti puisque .dmap-frame est déjà à ce même ratio (dicté par <img>), donc
   pas de distorsion des ronds de pinceau.
   Brouillard "à l'envers" (demandé par Tristan) : la carte est noire PAR DÉFAUT, une zone ne
   fait qu'"éclairer" un trou dans ce noir quand elle est révélée (!s.hidden) — pas l'inverse
   (v3 précédente : tout visible par défaut, une zone cachée peignait du noir par-dessus). Plus
   sûr en pratique : une zone du plan que le MJ n'a jamais dessinée reste cachée par défaut,
   au lieu d'être visible par erreur faute d'y avoir pensé. Implémenté avec un <mask> SVG
   (technique standard, équivalent SVG du destination-out canvas de la v2) : un rectangle blanc
   plein (= le calque noir reste visible partout) percé de traits noirs à l'emplacement de
   chaque zone révélée (= trou = calque noir invisible = carte visible en dessous à cet endroit).
   Vue joueur : calque noir 100% opaque, aucun autre repère. Vue MJ : même calque mais
   semi-transparent (pour voir la carte en dessous en travaillant) + les zones colorées
   par-dessus (toutes, cachées ou révélées) pour rester tapotables quel que soit leur état. */
function dungeonMapFrame(m, isGM, svgId){
  if(!m.image) return `<p class="faint" style="font-family:var(--ui);padding:1rem">Pas d'image pour cette carte.</p>`;
  svgId = svgId || "dmap-svg";
  // id du mask/filter dérivés de svgId (pas juste "dmap-mask"/"dmap-soften" fixes) : l'aperçu
  // joueur affiche un second <svg> sur la même page à côté de la vue MJ — des id dupliqués
  // seraient invalides (HTML) et la résolution de `url(#id)` deviendrait imprévisible d'un
  // navigateur à l'autre entre les deux instances.
  const maskId = svgId+"-mask", filterId = svgId+"-soften";
  const w = m.imgW||1000, h = m.imgH||1000;
  // stroke-linecap/linejoin explicites : sans ça ce <path> retombe sur les défauts SVG (bouts
  // plats, jointures en angle vif) au lieu des bouts/jointures arrondis de .dmap-stroke — le trou
  // percé dans le brouillard avait alors des allures de rectangle anguleux au lieu de suivre la
  // forme ronde/organique réelle du tracé (signalé par Tristan, capture à l'appui : le MJ voyait
  // un tracé bien rond, les joueurs une fenêtre carrée).
  const revealHoles = (m.strokes||[]).filter(s=>!s.hidden).map(s=>{
    const { d, filled } = strokeGeometry(s);
    return `<path d="${d}" fill="${filled?'#000':'none'}" stroke="#000" stroke-width="${s.radius*2}" stroke-linecap="round" stroke-linejoin="round"></path>`;
  }).join("");
  // Adoucissement des bords (réglable par carte, m.softness — % du plus grand côté de l'image) :
  // flou gaussien appliqué au CONTENU du masque (fond blanc + trous), pas aux zones colorées MJ
  // ni au trait — celles-ci doivent rester nettes pour bien voir où tapoter. Le même m.softness
  // pilote systématiquement le rendu MJ (semi-transparent) ET joueur/aperçu (opaque), même s'il
  // s'agit de deux instances <mask>/<filter> distinctes (id namespacés par svgId) sur la page —
  // toutes deux dérivées du même réglage stocké sur la carte. stdDeviation à 0 = aucun flou.
  const softnessPx = ((m.softness||0)/100) * Math.max(w, h);
  const darkness = `<filter id="${filterId}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${softnessPx.toFixed(2)}"></feGaussianBlur>
    </filter>
    <mask id="${maskId}">
      <g filter="url(#${filterId})">
        <rect x="0" y="0" width="${w}" height="${h}" fill="#fff"></rect>
        ${revealHoles}
      </g>
    </mask>
    <rect x="0" y="0" width="${w}" height="${h}" fill="#000" mask="url(#${maskId})" class="dmap-darkness${isGM?' dmap-darkness-gm':''}"></rect>`;
  const strokes = isGM ? (m.strokes||[]).map(s=>{
    const { d, filled } = strokeGeometry(s);
    const cls = s.hidden ? "dmap-stroke dmap-stroke-hidden" : "dmap-stroke dmap-stroke-revealed";
    return `<g data-dmap-stroke="${s.id}">
      <path class="dmap-stroke dmap-stroke-hit" d="${d}" stroke-width="${Math.max(s.radius*2, 24)}"></path>
      <path class="${cls}" d="${d}" fill="${filled?s.color:'none'}" stroke="${s.color}" stroke-width="${s.radius*2}"></path>
    </g>`;
  }).join("") : "";
  let brushDraft = "";
  if(isGM && dmapDraftStroke){
    const closeLoop = isLoopStroke(dmapDraftStroke.points, dmapBrushRadiusPx(m));
    brushDraft = `<path class="dmap-stroke dmap-stroke-draft${closeLoop?'':' dmap-stroke-draft-open'}" d="${pathDFromPoints(dmapDraftStroke.points, closeLoop)}" stroke-width="${dmapBrushRadiusPx(m)*2}"></path>`;
  }
  const polygonDraft = (isGM && dmapDraftPolygon && dmapDraftPolygon.points.length) ? dungeonMapPolygonDraftSVG(dmapDraftPolygon.points, Math.max(w,h)) : "";
  return `<div class="dmap-frame">
    <img class="dmap-img" src="${m.image}" alt="">
    <svg class="dmap-overlay${isGM?` dmap-overlay-gm dmap-tool-${dmapTool}`:''}" id="${svgId}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">${darkness}${strokes}${brushDraft}${polygonDraft}</svg>
  </div>`;
}
/* Aperçu du polygone en cours de pose : segments droits entre sommets déjà cliqués (pas encore
   fermé sur lui-même — la fermeture n'apparaît qu'au clic sur "Terminer"), plus un petit disque à
   chaque sommet pour bien voir où ils sont posés. */
function dungeonMapPolygonDraftSVG(points, maxDim){
  const r = Math.max(2, maxDim*0.006); // rayon des sommets proportionnel à l'image, pas une taille fixe qui serait minuscule sur une grande carte
  const line = "M" + points.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L");
  const dots = points.map(p=>`<circle class="dmap-polygon-vertex" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}"></circle>`).join("");
  return `<path class="dmap-polygon-draft" d="${line}"></path>${dots}`;
}
/* Corrige le viewBox depuis les VRAIES dimensions de l'image une fois chargée (immédiat si déjà
   en cache navigateur, sinon au "load"), plutôt que de bloquer le rendu en attendant de connaître
   ces dimensions à l'avance. Remplace un précédent essai qui gardait la vue sur "Chargement…"
   tant que m.imgW/imgH manquaient : ça bouclait à l'infini côté joueur, puisque chaque tick de
   polling (4,5s) écrase db.dungeonmaps avec les données fraîches du serveur — sans droits
   d'écriture, la correction en mémoire du joueur ne survivait jamais jusqu'au tick suivant, donc
   la carte restait bloquée sur "Chargement…" en permanence (rapporté par Tristan comme "le
   rafraîchissement ne se fait plus"). Cette version-ci ne bloque jamais le rendu : la carte
   s'affiche tout de suite avec le meilleur viewBox connu, puis se corrige sans re-render bloquant
   dès que l'image est prête. Seul le MJ persiste la correction (RLS interdit l'écriture aux
   joueurs) — sans conséquence : à la prochaine ouverture par le MJ, la carte se répare pour de
   bon et n'a plus jamais besoin de ce correctif. */
function fixDungeonMapViewBox(m, svgId){
  const svg = document.getElementById(svgId || "dmap-svg");
  const img = svg ? svg.previousElementSibling : null;
  if(!svg || !img || !(img instanceof HTMLImageElement)) return;
  const apply = ()=>{
    if(!img.naturalWidth || !img.naturalHeight) return;
    if(m.imgW===img.naturalWidth && m.imgH===img.naturalHeight) return; // déjà juste, rien à faire
    svg.setAttribute("viewBox", `0 0 ${img.naturalWidth} ${img.naturalHeight}`);
    m.imgW = img.naturalWidth; m.imgH = img.naturalHeight;
    if(effectiveRole()==="gm") saveDB();
  };
  if(img.complete) apply(); else img.addEventListener("load", apply, { once:true });
}
/* Lisse le tracé par des courbes de Bézier quadratiques passant par le milieu de chaque paire
   de points consécutifs (technique standard pour du dessin à main levée) — une simple polyligne
   "L x,y L x,y…" produit des angles vifs à chaque point échantillonné, visibles comme des
   facettes/biseaux dès que le tracé n'est pas parfaitement rectiligne (signalé par Tristan après
   test réel : le pourtour du trou de brouillard avait un aspect "biseauté" au lieu d'être rond).
   Chemin fermé ("Z" final) UNIQUEMENT si `closeLoop` est vrai : fermer ET remplir (`fill`, en plus
   du `stroke`) comble bien l'intérieur d'une boucle — un pinceau qui fait le tour d'une pièce
   plus grande que lui ne peignait sinon qu'un anneau creux au centre (confirmé par Tristan,
   capture à l'appui). Mais fermer un tracé OUVERT (un arc, une ligne qui ne boucle pas) ajoute un
   segment droit du dernier point vers le premier, et le remplissage comble alors toute la zone
   entre l'arc et cette "corde" — un vrai polygone plein à la place d'un simple trait, très
   surprenant pour un geste qui n'était pas censé boucler (remonté par Tristan : "mon point de
   départ va rejoindre mon point d'arrivée avec un segment qui va tout remplir"). D'où
   `isLoopStroke()` ci-dessous : ne fermer/remplir que si le tracé revient effectivement près de
   son point de départ, sinon garder un vrai trait ouvert (fill:none côté appelant). */
function pathDFromPoints(points, closeLoop){
  if(!points || !points.length) return "";
  // Un seul point (tap sans glisser) : "M x,y" seul ne trace aucun segment, donc rien ne serait
  // rendu (ni visible, ni tapotable) malgré le stroke-linecap:round — on double le point en
  // "M x,y L x,y" pour forcer un segment de longueur nulle, qui lui affiche bien un point rond.
  // Toujours fermé quel que soit `closeLoop` : un point seul n'a pas de sens "ouvert".
  if(points.length===1){ const p=points[0]; return `M${p.x.toFixed(1)},${p.y.toFixed(1)} L${p.x.toFixed(1)},${p.y.toFixed(1)} Z`; }
  if(points.length===2){ const d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} L${points[1].x.toFixed(1)},${points[1].y.toFixed(1)}`; return closeLoop ? d+" Z" : d; }
  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for(let i=1;i<points.length-1;i++){
    const midX = (points[i].x+points[i+1].x)/2, midY = (points[i].y+points[i+1].y)/2;
    d += ` Q${points[i].x.toFixed(1)},${points[i].y.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)}`;
  }
  const last = points[points.length-1];
  d += ` L${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  if(closeLoop) d += " Z";
  return d;
}
/* Un tracé "boucle" si son point d'arrivée revient près de son point de départ (à 1,5 rayon de
   pinceau près) — sert à décider s'il faut fermer+remplir (vraie boucle, on comble l'intérieur)
   ou laisser un trait ouvert (arc/ligne, pas de "corde" surprenante entre le début et la fin). */
function isLoopStroke(points, radius){
  if(!points || points.length<3) return false;
  const first = points[0], last = points[points.length-1];
  return Math.hypot(last.x-first.x, last.y-first.y) <= radius*1.5;
}
/* Chemin polygone : sommets reliés par des lignes DROITES (pas de lissage — un polygone doit
   rester précis), toujours fermé et rempli par construction (un polygone n'a pas d'ambiguïté
   "boucle ou pas", contrairement à un tracé au pinceau). */
function polygonPathD(points){
  if(!points || points.length<2) return "";
  return "M" + points.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L") + " Z";
}
/* Chemin + décision de remplissage d'une zone, quel que soit son type (pinceau ou polygone) —
   point d'entrée unique utilisé par tous les rendus (trou de masque, zone colorée, aperçu). */
function strokeGeometry(s){
  if(s.shape==="polygon") return { d: polygonPathD(s.points), filled: true };
  const isDot = s.points && s.points.length===1;
  const closeLoop = isDot || isLoopStroke(s.points, s.radius);
  return { d: pathDFromPoints(s.points, closeLoop), filled: closeLoop };
}
function dmapBrushRadiusPx(m){ return (dmapBrushSize/100) * Math.max(m.imgW||1000, m.imgH||1000); }
/* Conversion écran → coordonnées SVG via la matrice de transformation native (getScreenCTM),
   PAS un calcul manuel à base de getBoundingClientRect()/viewBox — cette dernière approche
   est fragile dès qu'il y a le moindre écart d'arrondi entre la boîte CSS réelle et le ratio
   du viewBox (preserveAspectRatio="meet" centre alors le contenu avec une marge que
   getBoundingClientRect ne reflète pas), ce qui décalait le tracé par rapport au curseur.
   getScreenCTM().inverse() gère ça correctement quel que soit le viewBox/scale/transform. */
function svgPtFromEvent(svg, m, ev){
  const ctm = svg.getScreenCTM();
  if(!ctm) return { x:0, y:0 };
  const pt = svg.createSVGPoint();
  pt.x = ev.clientX; pt.y = ev.clientY;
  const svgPt = pt.matrixTransform(ctm.inverse());
  return { x: svgPt.x, y: svgPt.y };
}

function wireDungeonMapSVG(m){
  const svg = document.getElementById("dmap-svg"); if(!svg) return;
  const sizeInput = document.getElementById("dmap-brush-size");
  if(sizeInput) sizeInput.addEventListener("input", e=>{ dmapBrushSize = +e.target.value; });
  const softInput = document.getElementById("dmap-softness");
  if(softInput){
    // "input" (pendant le glissé du curseur) : retouche juste l'attribut du flou pour un aperçu
    // fluide, sans re-rendu complet — sur les DEUX <filter> si l'aperçu joueur est affiché à côté
    // (id namespacés par carte : dmap-svg-soften pour la vue MJ, dmap-svg-preview-soften pour
    // l'aperçu), pour que les deux calques réagissent ensemble au glissé. "change" (relâché) :
    // persiste, une seule fois.
    softInput.addEventListener("input", e=>{
      const std = (+e.target.value/100)*Math.max(m.imgW||1000, m.imgH||1000);
      ["dmap-svg-soften","dmap-svg-preview-soften"].forEach(id=>{
        const blur = document.querySelector(`#${id} feGaussianBlur`);
        if(blur) blur.setAttribute("stdDeviation", std);
      });
    });
    softInput.addEventListener("change", e=>{ m.softness = +e.target.value; saveDB(); });
  }

  svg.addEventListener("click", e=>{
    if(dmapTool==="add") return; // en mode "pinceau", géré par le drag pointerdown/up ci-dessous
    if(dmapTool==="polygon"){ addDungeonMapPolygonVertex(m, svgPtFromEvent(svg, m, e)); return; }
    const g = e.target.closest("[data-dmap-stroke]"); if(!g) return;
    const id = g.dataset.dmapStroke;
    if(dmapTool==="delete") deleteDungeonMapStroke(m, id);
    else toggleDungeonMapStroke(m, id);
  });

  svg.addEventListener("pointerdown", e=>{
    if(dmapTool!=="add") return;
    e.preventDefault();
    startDrawDungeonStroke(m, svg, e);
  });
}

function startDrawDungeonStroke(m, svg, e){
  const pt = svgPtFromEvent(svg, m, e);
  dmapDraftStroke = { points:[pt] };
  const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathEl.setAttribute("class", "dmap-stroke dmap-stroke-draft dmap-stroke-draft-open");
  pathEl.setAttribute("stroke-width", dmapBrushRadiusPx(m)*2);
  pathEl.setAttribute("d", pathDFromPoints(dmapDraftStroke.points, false));
  svg.appendChild(pathEl);
  // Indépendant du rayon du pinceau : un grand pinceau ne doit pas pour autant échantillonner
  // grossièrement (c'était le cas avec rayon/4, d'où les tracés peu fidèles/à facettes
  // remontés par Tristan). Un pas fixe, petit par rapport à l'image, suffit à rester fluide.
  const minStep = Math.max(3, Math.max(m.imgW||1000, m.imgH||1000) * 0.004);
  // L'aperçu en direct reflète déjà si le tracé va se refermer/remplir (boucle) ou rester un
  // simple trait ouvert (arc/ligne) — le MJ voit le résultat final avant même de relâcher.
  const repaint = ()=>{
    const closeLoop = isLoopStroke(dmapDraftStroke.points, dmapBrushRadiusPx(m));
    pathEl.setAttribute("d", pathDFromPoints(dmapDraftStroke.points, closeLoop));
    pathEl.classList.toggle("dmap-stroke-draft-open", !closeLoop);
  };
  const move = ev=>{
    const p = svgPtFromEvent(svg, m, ev);
    const last = dmapDraftStroke.points[dmapDraftStroke.points.length-1];
    if(Math.hypot(p.x-last.x, p.y-last.y) < minStep) return;
    dmapDraftStroke.points.push(p);
    repaint();
  };
  const up = ()=>{
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);
    pathEl.remove();
    const points = dmapDraftStroke.points; dmapDraftStroke = null;
    const color = DMAP_STROKE_COLORS[(m.strokes||[]).length % DMAP_STROKE_COLORS.length];
    m.strokes = m.strokes || [];
    m.strokes.push({ id:uid(), color, hidden:true, radius:dmapBrushRadiusPx(m), points });
    saveDB();
    detailDungeonMap(m);
  };
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up);
}
