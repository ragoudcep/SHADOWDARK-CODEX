/* =========================================================================
   HEXCRAWL — carte hexagonale importée (terrain + brouillard de guerre)
   Format source : export JSON d'un éditeur hexcrawl externe (coordonnées
   axiales q,r). Le MJ voit tout ; les joueurs ne voient que les hexagones
   dont fogState !== "hidden".
   ========================================================================= */
const HEX_TERRAIN = {
  plains:{color:"#c9b56a",icon:"🌾"}, grassland:{color:"#8fb35a",icon:"🌿"},
  forest:{color:"#3f7a3f",icon:"🌲"}, "dense-forest":{color:"#2a5c2a",icon:"🌳"},
  "mushroom-forest":{color:"#c9a3e0",icon:"🍄"},
  hill:{color:"#a8895a",icon:"⛰"}, mountain:{color:"#8a8a8a",icon:"🏔"}, "mountain-peak":{color:"#e8e8e8",icon:"🗻"},
  ocean:{color:"#2a5a8a",icon:"🌊"}, sea:{color:"#3a6a9a",icon:"🌊"}, lake:{color:"#4a8ab8",icon:"💧"},
  marsh:{color:"#5a7a5a",icon:"🪷"}, bog:{color:"#4a5a3a",icon:"🪵"}, swamp:{color:"#465a3f",icon:"🐊"},
  canyon:{color:"#b0693f",icon:"🪨"}
};
function terrainInfo(t){ return HEX_TERRAIN[t] || {color:"#6b6455", icon:"?"}; }
const BIOME_LIST = [
  {id:"deadlands", label:"Terres mortes"},
  {id:"drylands", label:"Terres arides"},
  {id:"greenlands", label:"Terres vertes"},
  {id:"icelands", label:"Terres glacées"},
  {id:"sandlands", label:"Terres sablonneuses"}
];
function biomeLabel(id){ const b=BIOME_LIST.find(x=>x.id===id); return b?b.label:""; }
function biomePickerHTML(selected){
  const tiles = BIOME_LIST.map(b=>
    `<button type="button" class="overlay-pick${selected===b.id?' active':''}" data-biome="${b.id}" title="${esc(b.label)}">
       <img src="Hextiles/${b.id}.png" alt="${esc(b.label)}">
     </button>`);
  return `<div class="overlay-picker biome-picker" id="hex-biome-picker">${tiles.join("")}</div>`;
}
/* Fond (biome) et overlay (foundation_*.png) sont des choix 100% manuels, indépendants l'un de l'autre et du
   type de terrain — même principe que le picker d'icônes POI. Couleur de secours neutre (HEX_NEUTRAL_FILL)
   quand un overlay est choisi sans fond biome. */
const HEX_NEUTRAL_FILL = "#55524a";
const OVERLAY_LIST = [
  {file:"1-foundation_vulcano.png", label:"Volcan"},
  {file:"2-foundation_forest.png", label:"Forêt"},
  {file:"3-foundation_tundra.png", label:"Toundra / herbe légère"},
  {file:"4-foundation_trees.png", label:"Arbres épars"},
  {file:"5-foundation_water.png", label:"Eau"},
  {file:"6-foundation_hills.png", label:"Collines"},
  {file:"7-foundation_river.png", label:"Rivière"},
  {file:"8-foundation_portal.png", label:"Portail"},
  {file:"9-foundation_mountains.png", label:"Montagnes"},
  {file:"10-foundation_lake.png", label:"Lac"},
  {file:"11-foundation_village.png", label:"Village"},
  {file:"12-foundation_city.png", label:"Ville"},
  {file:"13-foundation_tower.png", label:"Tour"},
  {file:"14-foundation_community.png", label:"Communauté"},
  {file:"15-foundation_cave.png", label:"Grotte"},
  {file:"16-foundation_hole.png", label:"Trou / fondrière"},
  {file:"17-foundation_dead-Trees.png", label:"Arbres morts"},
  {file:"18-foundation_ruins.png", label:"Ruines"},
  {file:"19-foundation_graveyard.png", label:"Cimetière"},
  {file:"20-foundation_swamp.png", label:"Marécage"},
  {file:"21-foundation_floating-Island.png", label:"Île flottante"},
  {file:"22-foundation_keep.png", label:"Donjon / forteresse"},
  {file:"23-foundation_wonder.png", label:"Merveille"},
  {file:"24-foundation_cristals.png", label:"Cristaux"},
  {file:"25-foundation_stones.png", label:"Pierres dressées"},
  {file:"26-foundation_farms.png", label:"Fermes"},
  {file:"27-foundation_fog.png", label:"Brume"}
];
function overlayLabel(file){ const o=OVERLAY_LIST.find(x=>x.file===file); return o?o.label:file; }
function overlayPickerHTML(selected){
  const tiles = [`<button type="button" class="overlay-pick${!selected?' active':''}" data-overlay="" title="Aucun overlay">✕</button>`]
    .concat(OVERLAY_LIST.map(o=>
      `<button type="button" class="overlay-pick${selected===o.file?' active':''}" data-overlay="${esc(o.file)}" title="${esc(o.label)}">
         <img src="Hextiles/${esc(o.file)}" alt="${esc(o.label)}">
       </button>`));
  return `<div class="overlay-picker" id="hex-overlay-picker">${tiles.join("")}</div>`;
}
const POI_ICON_LIST = ["icon-waves","icon-temple-gate","icon-high-grass","icon-lighthouse","icon-pine-tree",
  "icon-grass","icon-anchor","icon-peaks","icon-custom-hills","icon-forest","icon-house","icon-summits",
  "icon-stone-tower","icon-menhir","icon-windmill","icon-ancient-columns","icon-reed","icon-spill",
  "icon-cliff-crossing","icon-swamp","icon-mushroom-house","icon-medieval-gate",
  "icon-goblin-head","icon-orc-head","icon-troll","icon-ogre","icon-minotaur","icon-dragon-head",
  "icon-wyvern","icon-griffin-symbol","icon-kraken-tentacle","icon-mimic-chest","icon-golem-head","icon-gargoyle",
  "icon-ghost","icon-vampire-dracula","icon-werewolf","icon-centaur","icon-unicorn","icon-harpy",
  "icon-hydra","icon-giant","icon-lizardman","icon-mummy-head","icon-sasquatch","icon-medusa-head",
  "icon-cyclops","icon-barbarian","icon-wizard-face","icon-warlock-hood","icon-cultist","icon-dwarf-king",
  "icon-elf-helmet","icon-female-elf-face","icon-executioner-hood","icon-overlord-helm","icon-monk-face","icon-watchtower",
  "icon-guarded-tower","icon-siege-tower","icon-obelisk","icon-dungeon-gate","icon-crypt-entrance","icon-hobbit-door",
  "icon-locked-door","icon-magic-portal","icon-magic-gate","icon-secret-door","icon-cave-entrance","icon-spiky-pit",
  "icon-falling-rocks","icon-spiked-wall","icon-caltrops","icon-tripwire","icon-quicksand","icon-wolf-trap",
  "icon-cage","icon-mantrap","icon-boulder-dash","icon-fire-ring","icon-spider-web","icon-manacles",
  "icon-open-treasure-chest","icon-locked-chest","icon-gold-nuggets","icon-coins-pile","icon-spell-book","icon-scroll-unfurled",
  "icon-treasure-map","icon-evil-book"];
function poiIconPickerHTML(selected){
  const tiles = [`<button type="button" class="icon-pick${!selected?' active':''}" data-icon="" title="Aucune (! par défaut)">!</button>`]
    .concat(POI_ICON_LIST.map(id=>
      `<button type="button" class="icon-pick${selected===id?' active':''}" data-icon="${id}" title="${id}">
         <svg viewBox="0 0 32 32"><use href="icons.svg#${id}"></use></svg>
       </button>`));
  return `<div class="icon-picker" id="hp-icon-picker">${tiles.join("")}</div>`;
}
/* Coordonnées "offset" (colonne q, ligne r) — grille rectangulaire, lignes impaires décalées d'un demi-hexagone */
function hexCenter(q,r,size){ return { x: size*Math.sqrt(3)*(q+0.5*(r&1)), y: size*1.5*r }; }
function hexCorners(cx,cy,size){
  const pts=[];
  for(let i=0;i<6;i++){ const a=Math.PI/180*(60*i-30); pts.push((cx+size*Math.cos(a)).toFixed(1)+","+(cy+size*Math.sin(a)).toFixed(1)); }
  return pts.join(" ");
}
let hexmapCurrentId = null;
let hexPointsVisible = true;
let hexPlacingPoint = false;
let hexPaintingBiome = false;
let hexPaintBiomeValue = "greenlands";
let hexPaintingOverlay = false;
let hexPaintOverlayValue = "";

function listHexmaps(){
  const itemsAll = db.hexmaps;
  const items = effectiveRole()==="gm" ? filterGmCreated(itemsAll) : itemsAll;
  const extra = effectiveRole()==="gm" ? `<button class="btn ghost sm" data-hex-import-new="1">⭱ Importer JSON</button>` : "";
  app.innerHTML = pageHead("Hexcrawl", `${items.length} carte(s)`, "Nouvelle carte", extra) +
    (items.length ? `<div class="grid">${items.map(m=>{
      const total=(m.hexes||[]).length, revealed=(m.hexes||[]).filter(h=>h.fogState!=="hidden").length;
      return `<div class="card" data-open="hexmap:${m.id}">
        <h3>${esc(m.title||"Sans titre")}</h3>
        <p>${esc(m.description||"Pas de description")}</p>
        <div class="meta"><span class="tag">${total} hexagone(s)</span>${effectiveRole()==="gm"&&total?`<span class="tag gold">${revealed} révélé(s)</span>`:""}</div>
      </div>`;
    }).join("")}</div>`
    : (effectiveRole()==="gm" && gmCreatedOnly && itemsAll.length
        ? emptyState("🖋","Aucune création marquée « MJ » dans cet onglet.")
        : emptyState("🗺","Aucune carte. Importe un fichier JSON exporté depuis ton outil hexcrawl.")));
}

function formHexmap(){
  const m = view.mode==="edit" ? getEntity("hexmap",view.id) : {title:"",description:""};
  app.innerHTML = `<div class="form">
    <button class="back" data-back="1">← Annuler</button>
    <h1>${view.mode==="edit"?"Modifier la":"Nouvelle"} carte</h1>
    <div class="field"><label>Titre</label><input type="text" id="f-title" value="${esc(m.title)}" placeholder="Les Terres du Nord"></div>
    <div class="field"><label>Description</label><textarea id="f-description" placeholder="Contexte, notes générales…">${esc(m.description||"")}</textarea></div>
    <div class="form-actions"><button class="btn" data-save="hexmap">✓ Enregistrer</button><button class="btn ghost" data-back="1">Annuler</button></div>
  </div>`;
}
function saveHexmap(){
  const o = view.mode==="edit" ? getEntity("hexmap",view.id) : {id:uid(), settings:{}, hexes:[], points:[]};
  o.title = $("#f-title").value.trim();
  o.description = $("#f-description").value;
  if(!o.title){ toast("Le titre est requis."); return; }
  if(view.mode==="new") db.hexmaps.push(o);
  saveDB(); toast("Carte enregistrée."); view={tab:"hexmaps",mode:"detail",id:o.id}; render();
}

function buildHexPoints(m, isGM){
  const size = (m.settings&&m.settings.hexSize)||30;
  const pts = m.points||[];
  const byQR = {}; (m.hexes||[]).forEach(h=>{ byQR[h.q+","+h.r]=h; });
  return pts.filter(p=>{
    if(!p.hex) return false;
    if(p.dmOnly && !isGM) return false;
    if(!isGM){ const h=byQR[p.hex.q+","+p.hex.r]; if(!h || h.fogState==="hidden") return false; }
    return true;
  }).map(p=>{
    const c = hexCenter(p.hex.q, p.hex.r, size);
    const r = Math.max(14, size*0.38);
    const hiddenFromPlayers = isGM && p.dmOnly;
    const iconEl = p.icon
      ? `<use href="icons.svg#${esc(p.icon)}" x="${(c.x-r).toFixed(1)}" y="${(c.y-r).toFixed(1)}" width="${(r*2).toFixed(1)}" height="${(r*2).toFixed(1)}" class="hexpoint-icon-svg"></use>`
      : `<text x="${c.x.toFixed(1)}" y="${(c.y+r*0.35).toFixed(1)}" text-anchor="middle" class="hexpoint-icon" style="font-size:${(r*1.7).toFixed(1)}px">!</text>`;
    return `<g class="hexpoint${hiddenFromPlayers?' hexpoint-dmonly':''}" data-point-id="${esc(p.id)}"><title>${esc(p.name||"")}${hiddenFromPlayers?" (MJ uniquement)":""}</title>
      ${iconEl}
      ${hiddenFromPlayers?`<circle cx="${c.x}" cy="${c.y}" r="${(r*1.15).toFixed(1)}" class="hexpoint-ring"></circle>`:""}
    </g>`;
  }).join("");
}
/* Fond biome (5 tuiles pleines) + overlay foundation_*.png (contour dessiné, transparent autour) empilés sur
   la boîte englobante de l'hexagone. Les deux images sont en orientation "flat-top" (plus larges que hautes,
   boîte naturelle size*2 × size*racine(3)) alors que la grille de l'app est "pointy-top" (sommet en haut/bas).
   Un hexagone a une symétrie à 60° (6 côtés) : flat-top et pointy-top ne diffèrent que d'un quart de tour de
   cette symétrie, soit 30° — n'importe quel angle ≡ 30° (mod 60°) réaligne donc le CONTOUR de l'image sur la
   cellule pointy-top, exactement. 30° et 90°(=30+60) sont tous les deux valides à ce titre, mais 90° fait
   paraître le contenu de l'image (arbres, chemins…) complètement sur le côté, alors que 30° ne le tourne que
   d'un tiers de moins — demande de Tristan (2026-08-10) après un premier essai en jeu : tourner d'un cran
   hexagonal (60°, l'unité de symétrie naturelle de la forme — à ne pas confondre avec le "cran" de 30° évoqué
   dans docs/TODO.md, qui parlait lui de réorienter toute la grille, un chantier différent et plus lourd, pas
   fait ici) vers la gauche par rapport à l'ancien 90°. Le contour reste donc parfaitement calé sur la cellule
   (aucun débordement/décalage introduit), seul le rendu de la scène à l'intérieur devient moins vertical. */
function hexBiomeImageSVG(href, c, size){
  const w = size*2, h = size*Math.sqrt(3);
  const x = (c.x - w/2).toFixed(1), y = (c.y - h/2).toFixed(1);
  const rot = `rotate(30 ${c.x.toFixed(1)} ${c.y.toFixed(1)})`;
  return { x, y, w:w.toFixed(1), h:h.toFixed(1), rot,
    tag:(cls)=>`<image href="${esc(href)}" x="${x}" y="${y}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" transform="${rot}" class="${cls}"></image>` };
}
function hexTerrainLayerSVG(h, c, size){
  const pts = hexCorners(c.x, c.y, size-1);
  if(!h.biome && !h.overlay){
    const info = terrainInfo(h.hexType);
    return `<polygon points="${pts}" fill="${info.color}"></polygon><text x="${c.x.toFixed(1)}" y="${(c.y+5).toFixed(1)}" text-anchor="middle" class="hex-icon">${info.icon}</text>`;
  }
  let out = `<polygon points="${pts}" fill="${HEX_NEUTRAL_FILL}"></polygon>`;
  if(h.biome) out += hexBiomeImageSVG("Hextiles/"+h.biome+".png", c, size).tag("hex-biome-img");
  if(h.overlay) out += hexBiomeImageSVG("Hextiles/"+h.overlay, c, size).tag("hex-overlay-img");
  return out;
}
function buildHexSVG(m){
  const size = (m.settings&&m.settings.hexSize)||30;
  const hexes = (m.hexes||[]);
  const isGM = effectiveRole()==="gm";
  const centers = hexes.map(h=>({h, c:hexCenter(h.q,h.r,size)}));
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  centers.forEach(({c})=>{ minX=Math.min(minX,c.x-size); maxX=Math.max(maxX,c.x+size); minY=Math.min(minY,c.y-size); maxY=Math.max(maxY,c.y+size); });
  const pad=12, vbx=(minX-pad).toFixed(1), vby=(minY-pad).toFixed(1), vbw=((maxX-minX)+pad*2).toFixed(1), vbh=((maxY-minY)+pad*2).toFixed(1);
  const cells = centers.map(({h,c})=>{
    const pts = hexCorners(c.x,c.y,size-1);
    const revealed = h.fogState!=="hidden";
    const showTerrain = isGM || revealed;
    const terrainLayer = showTerrain ? hexTerrainLayerSVG(h,c,size) : `<polygon points="${pts}" fill="#15130f"></polygon>`;
    return `<g class="hexcell${isGM?' hex-editable':''}" data-hexq="${h.q}" data-hexr="${h.r}">
      ${terrainLayer}
      ${!revealed?`<polygon points="${pts}" class="${isGM?'hex-fog-gm':'hex-fog'}"></polygon>`:""}
    </g>`;
  }).join("");
  return `<svg viewBox="${vbx} ${vby} ${vbw} ${vbh}" id="hex-svg" xmlns="http://www.w3.org/2000/svg">${cells}<g id="hex-points-layer"${hexPointsVisible?"":' style="display:none"'}>${buildHexPoints(m,isGM)}</g></svg>`;
}
function detailHexmap(m){
  if(hexmapCurrentId !== m.id){ hexPlacingPoint = false; hexPaintingBiome = false; hexPaintingOverlay = false; }
  hexmapCurrentId = m.id;
  const total = (m.hexes||[]).length;
  const revealed = (m.hexes||[]).filter(h=>h.fogState!=="hidden").length;
  const modeHelp = hexPlacingPoint
    ? "Clique l'hexagone où placer le nouveau point d'intérêt (ou re-clique le bouton pour annuler)."
    : hexPaintingBiome
      ? `Clique un hexagone pour lui donner le fond « ${biomeLabel(hexPaintBiomeValue)} » (ou re-clique le bouton pour annuler).`
      : hexPaintingOverlay
        ? `Clique un hexagone pour lui appliquer l'overlay « ${hexPaintOverlayValue?overlayLabel(hexPaintOverlayValue):"Aucun"} » (ou re-clique le bouton pour annuler).`
        : `Clique un hexagone pour le révéler ou le recacher aux joueurs · ${revealed}/${total} révélé(s).`;
  app.innerHTML = `<div class="detail">
    <button class="back" data-back="1">← Hexcrawl</button>
    <h1>${esc(m.title||"Sans titre")}</h1>
    ${m.description?`<p class="muted" style="font-family:var(--ui)">${renderText(m.description)}</p>`:""}
    ${detailActions("hexmap",m.id)}
    ${effectiveRole()==="gm" ? `<div class="crawl-toolbar">
      <button class="btn ghost sm" data-hex-reveal-all="1">👁 Tout révéler</button>
      <button class="btn ghost sm" data-hex-hide-all="1">🌫 Tout masquer</button>
      <button class="btn ghost sm${hexPlacingPoint?' active-mode':''}" data-hex-add-point="1">📍 ${hexPlacingPoint?"Clique un hexagone…":"Ajouter un point"}</button>
      <button class="btn ghost sm${hexPaintingBiome?' active-mode':''}" data-hex-paint-biome="1">🖌 ${hexPaintingBiome?"Clique un hexagone…":"Peindre un fond"}</button>
      <button class="btn ghost sm${hexPaintingOverlay?' active-mode':''}" data-hex-paint-overlay="1">🖼 ${hexPaintingOverlay?"Clique un hexagone…":"Peindre un overlay"}</button>
      <button class="btn ghost sm" data-hex-import="1">⭱ Importer / remplacer le JSON</button>
    </div>
    ${hexPaintingBiome ? biomePickerHTML(hexPaintBiomeValue) : ""}
    ${hexPaintingOverlay ? overlayPickerHTML(hexPaintOverlayValue) : ""}
    <div class="crawl-help">${modeHelp}</div>` : ""}
    ${total && (m.points||[]).length ? `<label style="display:flex;align-items:center;gap:.4rem;font-family:var(--ui);font-size:.85rem;color:var(--muted);margin:.5rem 0 0;cursor:pointer">
      <input type="checkbox" id="hex-points-toggle" ${hexPointsVisible?"checked":""} style="width:auto"> Afficher les points d'intérêt
    </label>` : ""}
    <div class="crawl-map-scroll${hexPlacingPoint?' hex-placing':''}${hexPaintingBiome?' hex-painting-biome':''}${hexPaintingOverlay?' hex-painting-overlay':''}">${total ? buildHexSVG(m) : `<p class="faint" style="font-family:var(--ui);padding:1rem">Aucune donnée de terrain pour l'instant.${effectiveRole()==="gm"?" Importe un fichier JSON pour commencer.":""}</p>`}</div>
  </div>`;
  const hpt = document.getElementById("hex-points-toggle");
  if(hpt) hpt.addEventListener("change", e=>{
    hexPointsVisible = e.target.checked;
    const layer = document.getElementById("hex-points-layer");
    if(layer) layer.style.display = hexPointsVisible ? "" : "none";
  });
  const biomePicker = document.getElementById("hex-biome-picker");
  if(biomePicker) biomePicker.querySelectorAll(".overlay-pick").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      hexPaintBiomeValue = btn.dataset.biome;
      biomePicker.querySelectorAll(".overlay-pick").forEach(b=>b.classList.toggle("active", b===btn));
    });
  });
  const overlayPicker = document.getElementById("hex-overlay-picker");
  if(overlayPicker) overlayPicker.querySelectorAll(".overlay-pick").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      hexPaintOverlayValue = btn.dataset.overlay;
      overlayPicker.querySelectorAll(".overlay-pick").forEach(b=>b.classList.toggle("active", b===btn));
    });
  });
}
function toggleHexFog(q,r){
  const m = getEntity("hexmap", hexmapCurrentId); if(!m) return;
  const h = (m.hexes||[]).find(x=>x.q===q && x.r===r); if(!h) return;
  h.fogState = h.fogState==="hidden" ? "visible" : "hidden";
  saveDB(); detailHexmap(m);
}
function revealAllHexes(reveal){
  const m = getEntity("hexmap", hexmapCurrentId); if(!m) return;
  (m.hexes||[]).forEach(h=> h.fogState = reveal ? "visible" : "hidden");
  saveDB(); detailHexmap(m);
}
function openHexPointModal(pointId){
  const m = getEntity("hexmap", hexmapCurrentId); if(!m) return;
  const p = (m.points||[]).find(x=>x.id===pointId); if(!p) return;
  if(effectiveRole()!=="gm"){
    openModal(`<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem">
        <h2 style="margin:0;color:var(--gold2)">${esc(p.name||"Point d'intérêt")}</h2>
        <button class="icon-btn" data-modal-close="1">✕</button></div>
      ${p.type?`<p class="faint" style="font-family:var(--ui);margin:.3rem 0 0">${esc(p.type)}</p>`:""}
      ${(p.description&&p.description.trim())?`<div style="margin-top:.7rem">${renderBullets(p.description)}</div>`:`<p class="faint" style="font-family:var(--ui);margin-top:.7rem">Pas de description.</p>`}
      <div class="form-actions"><button class="btn ghost" data-modal-close="1">Fermer</button></div>`);
    return;
  }
  openModal(`<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem">
      <h2 style="margin:0;color:var(--gold2)">Point d'intérêt</h2>
      <button class="icon-btn" data-modal-close="1">✕</button></div>
    <div class="field"><label>Nom</label><input type="text" id="hp-name" value="${esc(p.name||"")}" placeholder="La tour effondrée"></div>
    <div class="field"><label>Type <span class="hint">(facultatif)</span></label><input type="text" id="hp-type" value="${esc(p.type||"")}" placeholder="Ville, ruine, danger…"></div>
    <div class="field"><label>Icône <span class="hint">(facultatif)</span></label>${poiIconPickerHTML(p.icon||"")}</div>
    <div class="field"><label>Description</label><textarea id="hp-description" rows="5" placeholder="Ce que le MJ (et éventuellement les joueurs) doivent savoir…">${esc(p.description||"")}</textarea></div>
    <label style="display:flex;align-items:center;gap:.5rem;font-family:var(--ui);font-size:.85rem;color:var(--muted);margin-top:.3rem;cursor:pointer">
      <input type="checkbox" id="hp-visible" ${p.dmOnly?"":"checked"} style="width:auto"> Visible aux joueurs
    </label>
    <div class="form-actions" style="justify-content:space-between">
      <button class="btn danger sm" id="hp-delete">🗑 Supprimer</button>
      <div style="display:flex;gap:.5rem">
        <button class="btn ghost" data-modal-close="1">Annuler</button>
        <button class="btn" id="hp-save">✓ Enregistrer</button>
      </div>
    </div>`);
  let selectedIcon = p.icon || "";
  const iconPicker = document.getElementById("hp-icon-picker");
  if(iconPicker) iconPicker.querySelectorAll(".icon-pick").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      selectedIcon = btn.dataset.icon;
      iconPicker.querySelectorAll(".icon-pick").forEach(b=>b.classList.toggle("active", b===btn));
    });
  });
  const btnSave = document.getElementById("hp-save");
  if(btnSave) btnSave.addEventListener("click", ()=>{
    p.name = document.getElementById("hp-name").value.trim() || "Point d'intérêt";
    p.type = document.getElementById("hp-type").value.trim();
    p.icon = selectedIcon;
    p.description = document.getElementById("hp-description").value;
    p.dmOnly = !document.getElementById("hp-visible").checked;
    saveDB();
    closeModal();
    toast("Point enregistré.");
    const mm = getEntity("hexmap", hexmapCurrentId);
    if(mm) detailHexmap(mm);
  });
  const btnDel = document.getElementById("hp-delete");
  if(btnDel) btnDel.addEventListener("click", ()=>{
    if(!confirm(`Supprimer le point « ${p.name||"sans nom"} » ?`)) return;
    m.points = (m.points||[]).filter(x=>x.id!==p.id);
    saveDB();
    closeModal();
    toast("Point supprimé.");
    detailHexmap(m);
  });
}
function toggleHexPlacingPoint(){
  hexPlacingPoint = !hexPlacingPoint;
  if(hexPlacingPoint){ hexPaintingBiome = false; hexPaintingOverlay = false; }
  const m = getEntity("hexmap", hexmapCurrentId);
  if(m) detailHexmap(m);
}
function toggleHexPaintingBiome(){
  hexPaintingBiome = !hexPaintingBiome;
  if(hexPaintingBiome){ hexPlacingPoint = false; hexPaintingOverlay = false; }
  const m = getEntity("hexmap", hexmapCurrentId);
  if(m) detailHexmap(m);
}
function toggleHexPaintingOverlay(){
  hexPaintingOverlay = !hexPaintingOverlay;
  if(hexPaintingOverlay){ hexPlacingPoint = false; hexPaintingBiome = false; }
  const m = getEntity("hexmap", hexmapCurrentId);
  if(m) detailHexmap(m);
}
function setHexBiome(q,r,biome){
  const m = getEntity("hexmap", hexmapCurrentId); if(!m) return;
  const h = (m.hexes||[]).find(x=>x.q===q && x.r===r); if(!h) return;
  h.biome = biome;
  saveDB();
  detailHexmap(m);
}
function setHexOverlay(q,r,overlay){
  const m = getEntity("hexmap", hexmapCurrentId); if(!m) return;
  const h = (m.hexes||[]).find(x=>x.q===q && x.r===r); if(!h) return;
  h.overlay = overlay;
  saveDB();
  detailHexmap(m);
}
function createHexPointAt(q,r){
  const m = getEntity("hexmap", hexmapCurrentId); if(!m) return;
  if(!m.points) m.points=[];
  const p = { id:uid(), name:"Nouveau point", description:"", type:"", icon:"", hex:{q,r}, color:"", size:"medium", dmOnly:false };
  m.points.push(p);
  hexPlacingPoint = false;
  saveDB();
  detailHexmap(m);
  openHexPointModal(p.id);
}
let _hexImportTarget = null; // null = nouvelle carte, sinon id de la carte à remplacer
function importHexmapJSON(file){
  const r = new FileReader();
  r.onload = ()=>{
    try{
      const data = JSON.parse(r.result);
      const hexesObj = data.hexes || {};
      const hexes = Object.values(hexesObj).filter(h=>!h.layer||h.layer==="surface")
        .map(h=>({ q:h.q, r:h.r, hexType:h.hexType||"", fogState:h.fogState||"hidden", biome:h.biome||"", overlay:h.overlay||"" }));
      const points = ((data.pointCrawl&&data.pointCrawl.nodes)||[]).map(p=>({
        id:p.id||uid(), name:p.name||"", description:p.description||"", type:p.type||"", icon:p.icon||"",
        hex:p.hex||{q:0,r:0}, color:p.color||"", size:p.size||"medium", dmOnly:!!p.dmOnly
      }));
      const settings = {
        width:(data.settings&&data.settings.width)||0, height:(data.settings&&data.settings.height)||0,
        hexSize:(data.settings&&data.settings.hexSize)||30, orientation:(data.settings&&data.settings.orientation)||"pointy"
      };
      let targetId = _hexImportTarget;
      if(targetId){
        const m = getEntity("hexmap", targetId);
        if(!m){ toast("Carte introuvable."); return; }
        m.settings=settings; m.hexes=hexes; m.points=points;
        if(!m.title) m.title = data.name || "Carte importée";
      } else {
        const m = { id:uid(), title: data.name||"Carte importée", description: data.description||"", settings, hexes, points };
        db.hexmaps.push(m); targetId = m.id;
      }
      _hexImportTarget = null;
      saveDB(); view={tab:"hexmaps", mode:"detail", id:targetId}; render();
      toast(`Import : ${hexes.length} hexagone(s), ${points.length} point(s) d'intérêt.`);
    }catch(e){ toast("Import JSON échoué : "+e.message); }
  };
  r.readAsText(file);
}
