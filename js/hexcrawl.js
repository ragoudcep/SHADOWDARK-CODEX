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
/* Tuiles hexcrawl (2026-08-17) : le pack "tuiles hexcrawl/{desert,forest,mountain,tundra}Pack" est
   nativement pointy-top (ratio largeur/hauteur ≈ 0.87, vérifié sur les PNG), donc pas de rotation
   au rendu — voir hexTileImageSVG. Une seule tuile par hexagone (h.tile), chaque tuile du pack
   étant déjà une scène complète.
   Fonds/Overlays (réintégrés le 2026-08-17, demande de Tristan après suppression puis nouvel
   upload des anciens fichiers, remis ici dans tuiles hexcrawl/) : SYSTÈME SÉPARÉ, en plus du
   système tuiles ci-dessus, pas un remplacement — un fond (5 images) et un overlay (27 images)
   optionnels et INDÉPENDANTS l'un de l'autre (un overlay se peint sur n'importe quel hexagone,
   avec ou sans fond dessous), empilés l'un sur l'autre. Ces images sont en orientation flat-top
   (ratio ≈1.15, à l'inverse des tuiles) donc tournées de 30° au rendu pour coller à la grille
   pointy-top — voir hexFondOverlayImageSVG. h.tile / (h.fond,h.overlay) sont mutuellement
   exclusifs sur un même hexagone (peindre l'un efface l'autre, voir setHexTile/setHexFond/
   setHexOverlay) : les mélanger visuellement n'aurait pas de sens net pour le MJ qui peint. */
const HEX_NEUTRAL_FILL = "#55524a";
const FOND_LIST = [
  {id:"deadlands", label:"Terres mortes", file:"tuiles hexcrawl/Fonds/1-deadlands_bg.png"},
  {id:"drylands", label:"Terres arides", file:"tuiles hexcrawl/Fonds/1-drylands_bg.png"},
  {id:"greenlands", label:"Terres vertes", file:"tuiles hexcrawl/Fonds/1-greenlands_bg.png"},
  {id:"icelands", label:"Terres glacées", file:"tuiles hexcrawl/Fonds/1-icelands_bg.png"},
  {id:"sandlands", label:"Terres sablonneuses", file:"tuiles hexcrawl/Fonds/1-sandlands_bg.png"}
];
function fondLabel(id){ const f=FOND_LIST.find(x=>x.id===id); return f?f.label:""; }
function fondPickerHTML(selected){
  const tiles = FOND_LIST.map(f=>
    `<button type="button" class="overlay-pick${selected===f.id?' active':''}" data-fond="${f.id}" title="${esc(f.label)}">
       <img src="${esc(f.file)}" alt="${esc(f.label)}">
     </button>`);
  return `<div class="overlay-picker biome-picker" id="hex-fond-picker">${tiles.join("")}</div>`;
}
const OVERLAY_LIST = [
  {file:"tuiles hexcrawl/Overlays/1-foundation_vulcano.png", label:"Volcan"},
  {file:"tuiles hexcrawl/Overlays/2-foundation_forest.png", label:"Forêt"},
  {file:"tuiles hexcrawl/Overlays/3-foundation_tundra.png", label:"Toundra / herbe légère"},
  {file:"tuiles hexcrawl/Overlays/4-foundation_trees.png", label:"Arbres épars"},
  {file:"tuiles hexcrawl/Overlays/5-foundation_water.png", label:"Eau"},
  {file:"tuiles hexcrawl/Overlays/6-foundation_hills.png", label:"Collines"},
  {file:"tuiles hexcrawl/Overlays/7-foundation_river.png", label:"Rivière"},
  {file:"tuiles hexcrawl/Overlays/8-foundation_portal.png", label:"Portail"},
  {file:"tuiles hexcrawl/Overlays/9-foundation_mountains.png", label:"Montagnes"},
  {file:"tuiles hexcrawl/Overlays/10-foundation_lake.png", label:"Lac"},
  {file:"tuiles hexcrawl/Overlays/11-foundation_village.png", label:"Village"},
  {file:"tuiles hexcrawl/Overlays/12-foundation_city.png", label:"Ville"},
  {file:"tuiles hexcrawl/Overlays/13-foundation_tower.png", label:"Tour"},
  {file:"tuiles hexcrawl/Overlays/14-foundation_community.png", label:"Communauté"},
  {file:"tuiles hexcrawl/Overlays/15-foundation_cave.png", label:"Grotte"},
  {file:"tuiles hexcrawl/Overlays/16-foundation_hole.png", label:"Trou / fondrière"},
  {file:"tuiles hexcrawl/Overlays/17-foundation_dead-Trees.png", label:"Arbres morts"},
  {file:"tuiles hexcrawl/Overlays/18-foundation_ruins.png", label:"Ruines"},
  {file:"tuiles hexcrawl/Overlays/19-foundation_graveyard.png", label:"Cimetière"},
  {file:"tuiles hexcrawl/Overlays/20-foundation_swamp.png", label:"Marécage"},
  {file:"tuiles hexcrawl/Overlays/21-foundation_floating-Island.png", label:"Île flottante"},
  {file:"tuiles hexcrawl/Overlays/22-foundation_keep.png", label:"Donjon / forteresse"},
  {file:"tuiles hexcrawl/Overlays/23-foundation_wonder.png", label:"Merveille"},
  {file:"tuiles hexcrawl/Overlays/24-foundation_cristals.png", label:"Cristaux"},
  {file:"tuiles hexcrawl/Overlays/25-foundation_stones.png", label:"Pierres dressées"},
  {file:"tuiles hexcrawl/Overlays/26-foundation_farms.png", label:"Fermes"},
  {file:"tuiles hexcrawl/Overlays/27-foundation_fog.png", label:"Brume"}
];
function overlayLabel(file){ const o=OVERLAY_LIST.find(x=>x.file===file); return o?o.label:file; }
function overlayPickerHTML(selected){
  const tiles = [`<button type="button" class="overlay-pick${!selected?' active':''}" data-overlay="" title="Aucun overlay">✕</button>`]
    .concat(OVERLAY_LIST.map(o=>
      `<button type="button" class="overlay-pick${selected===o.file?' active':''}" data-overlay="${esc(o.file)}" title="${esc(o.label)}">
         <img src="${esc(o.file)}" alt="${esc(o.label)}">
       </button>`));
  return `<div class="overlay-picker" id="hex-overlay-picker">${tiles.join("")}</div>`;
}
const TILE_PACKS = [
  {id:"desertPack", label:"Désert", tiles:[
    {file:"desert_01_full.png", label:"Désert (plein)"},
    {file:"desert_02_fewSand.png", label:"Un peu de sable"},
    {file:"desert_03_clearing.png", label:"Clairière"},
    {file:"desert_04_graveyard.png", label:"Cimetière"},
    {file:"desert_05_rift.png", label:"Faille"},
    {file:"desert_06_cactus.png", label:"Cactus"},
    {file:"desert_07_dry.png", label:"Terre sèche"},
    {file:"desert_08_barrier.png", label:"Barrière rocheuse"},
    {file:"desert_09_oasis.png", label:"Oasis"},
    {file:"desert_10_hole.png", label:"Trou / fondrière"},
    {file:"desert_11_cave.png", label:"Grotte"},
    {file:"desert_12_hillsAndTrees.png", label:"Collines et arbres"},
    {file:"desert_13_floatingIsland.png", label:"Île flottante"},
    {file:"desert_14_house.png", label:"Maison"},
    {file:"desert_15_village.png", label:"Village"},
    {file:"desert_16_watchTower.png", label:"Tour de guet"},
    {file:"desert_17_ruins.png", label:"Ruines"},
    {file:"desert_18_blast.png", label:"Cratère / explosion"},
    {file:"desert_19_road.png", label:"Route"},
    {file:"desert_20_temple.png", label:"Temple"}
  ]},
  {id:"forestPack", label:"Forêt", tiles:[
    {file:"forest_01_full.png", label:"Forêt (pleine)"},
    {file:"forest_02_fewTrees.png", label:"Quelques arbres"},
    {file:"forest_03_clearing.png", label:"Clairière"},
    {file:"forest_04_dead.png", label:"Arbres morts"},
    {file:"forest_05_rift.png", label:"Faille"},
    {file:"forest_06_wildBushes.png", label:"Buissons sauvages"},
    {file:"forest_07_spikes.png", label:"Pics / ronces"},
    {file:"forest_08_spider.png", label:"Araignée géante"},
    {file:"forest_09_tree.png", label:"Arbre isolé"},
    {file:"forest_10_mushroom.png", label:"Champignons"},
    {file:"forest_11_cave.png", label:"Grotte"},
    {file:"forest_12_hill.png", label:"Colline"},
    {file:"forest_13_stones.png", label:"Pierres dressées"},
    {file:"forest_14_house.png", label:"Maison"},
    {file:"forest_15_village.png", label:"Village"},
    {file:"forest_16_watchTower.png", label:"Tour de guet"},
    {file:"forest_17_ruins.png", label:"Ruines"},
    {file:"forest_18_blast.png", label:"Cratère / explosion"},
    {file:"forest_19_road.png", label:"Route"},
    {file:"forest_20_temple.png", label:"Temple"}
  ]},
  {id:"mountainPack", label:"Montagne", tiles:[
    {file:"mountain_01_full.png", label:"Montagne (pleine)"},
    {file:"mountain_02_fewMount.png", label:"Quelques sommets"},
    {file:"mountain_03_plateau.png", label:"Plateau"},
    {file:"mountain_04_vulcano.png", label:"Volcan"},
    {file:"mountain_05_rift.png", label:"Faille"},
    {file:"mountain_06_hills.png", label:"Collines"},
    {file:"mountain_07_spikes.png", label:"Pics rocheux"},
    {file:"mountain_08_gates.png", label:"Porte / défilé"},
    {file:"mountain_09_peak.png", label:"Pic"},
    {file:"mountain_10_bridge.png", label:"Pont"},
    {file:"mountain_11_cave.png", label:"Grotte"},
    {file:"mountain_12_forest.png", label:"Forêt de montagne"},
    {file:"mountain_13_obelisk.png", label:"Obélisque"},
    {file:"mountain_14_house.png", label:"Maison"},
    {file:"mountain_15_village.png", label:"Village"},
    {file:"mountain_16_watchTower.png", label:"Tour de guet"},
    {file:"mountain_17_ruins.png", label:"Ruines"},
    {file:"mountain_18_blast.png", label:"Cratère / explosion"},
    {file:"mountain_19_road.png", label:"Route"},
    {file:"mountain_20_temple.png", label:"Temple"}
  ]},
  /* Pseudo-pack (2026-08-17) : les nouveaux packs de tuiles n'ont pas d'équivalent à l'ancienne
     tuile "Eau" (Hextiles/5-foundation_water.png, supprimée avec le reste de l'ancien système —
     et de toute façon en orientation flat-top, incompatible avec le rendu sans rotation actuel).
     Demande de Tristan : à défaut de tuile récupérable, un remplissage de couleur unie suffit.
     Un seul "tile" à choix unique, identifié par le sentinel "water" (pas un chemin de fichier) —
     voir tilePath/tileSwatchHTML/hexTerrainLayerSVG pour les 3 endroits qui le traitent à part. */
  {id:"water", label:"Eau", color:"#2f6f9e", tiles:[{file:"", label:"Eau (couleur unie)"}]},
  {id:"tundraPack", label:"Toundra", tiles:[
    {file:"tundra_01_full.png", label:"Toundra (pleine)"},
    {file:"tundra_02_few.png", label:"Toundra clairsemée"},
    {file:"tundra_04_snowStorm.png", label:"Tempête de neige"},
    {file:"tundra_05_rift.png", label:"Faille"},
    {file:"tundra_06_forest.png", label:"Forêt gelée"},
    {file:"tundra_07_shatteredLand.png", label:"Terre brisée"},
    {file:"tundra_08_barrier.png", label:"Barrière de glace"},
    {file:"tundra_09_summit.png", label:"Sommet"},
    {file:"tundra_10_iceBridge.png", label:"Pont de glace"},
    {file:"tundra_11_cave.png", label:"Grotte"},
    {file:"tundra_12_shards.png", label:"Éclats de glace"},
    {file:"tundra_13_iceblock.png", label:"Bloc de glace"},
    {file:"tundra_14_house.png", label:"Maison"},
    {file:"tundra_15_village.png", label:"Village"},
    {file:"tundra_16_tower.png", label:"Tour de guet"},
    {file:"tundra_17_ruins.png", label:"Ruines"},
    {file:"tundra_18_blast.png", label:"Cratère / explosion"},
    {file:"tundra_19_road.png", label:"Route"},
    {file:"tundra_20_temple.png", label:"Temple"}
  ]}
];
function tilePath(packId, file){ return packId==="water" ? "water" : `tuiles hexcrawl/${packId}/${file}`; }
function tileLabel(path){
  if(path==="water") return "Eau — Eau (couleur unie)";
  for(const pack of TILE_PACKS){ const t = pack.tiles.find(x=>tilePath(pack.id,x.file)===path); if(t) return `${pack.label} — ${t.label}`; }
  return path;
}
/* Vignette d'un pack/tuile : une image pour les packs illustrés, un carré de couleur unie pour le
   pseudo-pack "Eau" (pas de fichier associé, voir TILE_PACKS). */
function tileSwatchHTML(color, imgPath, alt){
  return color ? `<div class="overlay-pick-swatch" style="background:${esc(color)}"></div>` : `<img src="${esc(imgPath)}" alt="${esc(alt)}">`;
}
/* Sélection en deux temps (2026-08-17), demandé par Tristan : d'abord le biome (vignette = 1re
   tuile "pleine" du pack), puis seulement les tuiles de ce biome — plutôt qu'un unique picker à
   plat avec les ~80 tuiles mélangées. */
function packPickerHTML(selectedPackId){
  const tiles = TILE_PACKS.map(pack=>{
    const swatch = tilePath(pack.id, pack.tiles[0].file);
    return `<button type="button" class="overlay-pick${selectedPackId===pack.id?' active':''}" data-tile-pack="${pack.id}" title="${esc(pack.label)}">
      ${tileSwatchHTML(pack.color, swatch, pack.label)}
    </button>`;
  }).join("");
  return `<div class="overlay-picker biome-picker" id="hex-pack-picker">${tiles}</div>`;
}
function tilePickerHTML(packId, selected){
  const pack = TILE_PACKS.find(p=>p.id===packId); if(!pack) return "";
  const buttons = pack.tiles.map(t=>{
    const path = tilePath(pack.id, t.file);
    return `<button type="button" class="overlay-pick${selected===path?' active':''}" data-tile="${esc(path)}" title="${esc(t.label)}">
      ${tileSwatchHTML(pack.color, path, t.label)}
    </button>`;
  }).join("");
  return `<div class="overlay-picker" id="hex-tile-picker">
    <button type="button" class="overlay-pick${!selected?' active':''}" data-tile="" title="Aucune tuile">✕</button>
    ${buttons}
  </div>`;
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
let hexPaintingTile = false;
let hexPaintPackId = "forestPack";
let hexPaintTileValue = tilePath("forestPack","forest_01_full.png");
let hexPaintingFond = false;
let hexPaintFondValue = "greenlands";
let hexPaintingOverlay = false;
let hexPaintOverlayValue = "";
/* Zoom/pan carte (2026-08-17), demandé par Tristan pour l'usage mobile : pincer/zoomer et faire
   glisser la carte, plus un vrai plein écran. Remplace le simple overflow:auto (scroll natif) qui
   ne permettait aucun zoom. État en dehors de detailHexmap() car la vue est entièrement
   reconstruite (innerHTML) à chaque interaction (révéler un hexagone, peindre...) — sans ça le
   zoom/pan sauterait à chaque clic. Réinitialisé uniquement quand on change de carte (voir
   detailHexmap, même endroit que le reset de hexPlacingPoint/hexPaintingTile). */
let hexMapZoom = { scale:1, tx:0, ty:0 };
/* Plein écran "CSS" (2026-08-17), PAS l'API Fullscreen native — testé et abandonné : l'app
   reconstruit tout .detail via innerHTML à chaque interaction (révéler un hexagone, peindre...),
   donc l'élément passé à requestFullscreen() est détaché du DOM à l'étape suivante ; par spec,
   un élément fullscreen retiré du document fait sortir du plein écran automatiquement — ça
   sortait donc du plein écran dès le premier clic sur la carte. Deuxième souci de l'API native :
   #modal/#toast vivent hors de l'élément fullscreen, donc invisibles tant qu'on ne le quitte pas
   (le popup d'un point d'intérêt n'apparaissait jamais). Un simple booléen + position:fixed
   couvrant tout le viewport (z-index sous celui de #modal, cf. style.css) évite les deux : l'état
   survit aux re-renders comme hexMapZoom, et #modal reste au-dessus normalement. */
let hexMapFullscreen = false;
function clampHexZoomScale(s){ return Math.min(4, Math.max(0.6, s)); }
function applyHexMapTransform(){
  const svg = document.getElementById("hex-svg");
  if(svg) svg.style.transform = `translate(${hexMapZoom.tx}px,${hexMapZoom.ty}px) scale(${hexMapZoom.scale})`;
  const label = document.getElementById("hex-zoom-label");
  if(label) label.textContent = Math.round(hexMapZoom.scale*100)+"%";
}
/* Zoom centré sur un point donné en coordonnées écran RELATIVES au conteneur (pas la page) — le
   point sous le doigt/curseur doit rester immobile pendant le zoom, d'où le recalcul de tx/ty
   proportionnel au facteur d'échelle plutôt qu'un simple remplacement de hexMapZoom.scale. */
function setHexZoom(scale, originX, originY){
  const prevScale = hexMapZoom.scale;
  const newScale = clampHexZoomScale(scale);
  if(newScale===prevScale) return;
  const factor = newScale/prevScale;
  hexMapZoom.tx = originX - (originX-hexMapZoom.tx)*factor;
  hexMapZoom.ty = originY - (originY-hexMapZoom.ty)*factor;
  hexMapZoom.scale = newScale;
  applyHexMapTransform();
}
function resetHexZoom(){ hexMapZoom = { scale:1, tx:0, ty:0 }; applyHexMapTransform(); }
/* Un tap simple (pointerdown+up quasi immobile) doit continuer à basculer le brouillard/peindre/
   ouvrir un point d'intérêt — seul un déplacement net doit être traité comme un pan et NE PAS
   déclencher le clic sur l'hexagone dessous. Le seuil (6px) tranche entre les deux sans bloquer
   les taps légèrement tremblants sur mobile.
   BUG corrigé (2026-08-17) : la 1re version posait un addEventListener("click", …, true) à usage
   unique après chaque drag, retiré seulement quand CE click arrivait. Or au tactile, un vrai drag
   (pointerdown → pointermove → pointerup) ne déclenche souvent AUCUN click de la part du
   navigateur — le listener restait donc accroché indéfiniment et avalait le clic du TAP SUIVANT
   (un point d'intérêt qui ne s'ouvrait qu'un coup sur deux, ou le brouillard qui ne basculait pas)
   au lieu du clic qu'il visait vraiment. Remplacé par un simple drapeau posé/consommé par un
   unique listener permanent, avec une purge de sécurité (setTimeout) si aucun clic n'arrive du
   tout. */
let _hexWindowGestureCleanup = null;
function initHexMapGestures(container){
  if(!container || container.dataset.gesturesBound) return;
  container.dataset.gesturesBound = "1";
  /* detailHexmap() reconstruit le conteneur à chaque interaction, donc cette fonction est
     rappelée sur un élément neuf à chaque fois. Les écouteurs posés sur `container` disparaissent
     avec lui, mais ceux posés sur `window` (voir plus bas) survivraient et s'empileraient à
     l'infini — d'où le retrait explicite du jeu précédent avant d'en poser un nouveau. */
  if(_hexWindowGestureCleanup) _hexWindowGestureCleanup();
  let dragging=false, lastX=0, lastY=0, moved=0;
  let pinch=null;
  let suppressNextClick=false;
  container.addEventListener("click", e=>{
    if(!suppressNextClick) return;
    suppressNextClick=false;
    e.stopPropagation(); e.preventDefault();
  }, true);
  container.addEventListener("wheel", e=>{
    e.preventDefault();
    const rect = container.getBoundingClientRect();
    setHexZoom(hexMapZoom.scale*(e.deltaY<0?1.12:1/1.12), e.clientX-rect.left, e.clientY-rect.top);
  }, {passive:false});
  /* PAS de setPointerCapture ici — testé et retiré (2026-08-17) : capturer le pointeur sur le
     conteneur fait que le navigateur RETARGETE le click qui suit vers l'élément capturant. Tous
     les clics de la carte arrivaient donc sur #hex-map-container au lieu de l'hexagone/point sous
     le doigt, et les `closest("[data-hexq]")` / `closest("[data-point-id]")` du routeur de clics
     ne matchaient plus jamais : plus rien ne fonctionnait (révéler un hexagone, ouvrir un point,
     peindre une tuile). Le suivi du drag passe donc par window, ce qui couvre aussi bien le cas
     "le doigt sort du conteneur en cours de glissement" sans toucher au ciblage des clics. */
  container.addEventListener("pointerdown", e=>{
    if(e.pointerType==="mouse" && e.button!==0) return;
    if(e.target.closest(".crawl-map-toolbar")) return; // les boutons de la barre ne déclenchent pas de pan
    dragging=true; moved=0; lastX=e.clientX; lastY=e.clientY;
  });
  const onMove = e=>{
    if(!dragging) return;
    const dx=e.clientX-lastX, dy=e.clientY-lastY;
    hexMapZoom.tx += dx; hexMapZoom.ty += dy; moved += Math.abs(dx)+Math.abs(dy);
    lastX=e.clientX; lastY=e.clientY;
    applyHexMapTransform();
  };
  const endDrag = ()=>{
    if(dragging && moved>6){ suppressNextClick=true; setTimeout(()=>{ suppressNextClick=false; }, 400); }
    dragging=false;
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
  _hexWindowGestureCleanup = ()=>{
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
  };
  container.addEventListener("touchstart", e=>{
    if(e.touches.length===2){
      const [a,b]=e.touches;
      pinch = { dist: Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY), scale: hexMapZoom.scale };
    }
  }, {passive:true});
  container.addEventListener("touchmove", e=>{
    if(e.touches.length===2 && pinch){
      e.preventDefault();
      const [a,b]=e.touches;
      const dist = Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY);
      const rect = container.getBoundingClientRect();
      setHexZoom(pinch.scale*(dist/pinch.dist), (a.clientX+b.clientX)/2-rect.left, (a.clientY+b.clientY)/2-rect.top);
    }
  }, {passive:false});
  container.addEventListener("touchend", e=>{ if(e.touches.length<2) pinch=null; });
}
function toggleHexMapFullscreen(){
  hexMapFullscreen = !hexMapFullscreen;
  document.body.classList.toggle("hex-fullscreen-lock", hexMapFullscreen);
  const m = getEntity("hexmap", hexmapCurrentId);
  if(m) detailHexmap(m);
}
/* Échappement clavier (2026-08-17) : équivalent de l'Escape natif de l'API Fullscreen, qu'on
   n'utilise plus (cf. commentaire sur hexMapFullscreen) — posé une seule fois au chargement du
   script, comme le point d'écoute qu'il remplace. */
document.addEventListener("keydown", e=>{
  if(e.key==="Escape" && hexMapFullscreen) toggleHexMapFullscreen();
});

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
    /* Icône (POI_ICON_LIST/"!") mise de côté pour l'instant (2026-08-17, demande de Tristan) :
       une zone d'intérêt se signale désormais par une pulsation lumineuse discrète plutôt qu'un
       glyphe posé au centre — le point.icon reste stocké (poiIconPickerHTML/modal inchangés) pour
       une réintroduction future, simplement pas dessiné ici. */
    return `<g class="hexpoint${hiddenFromPlayers?' hexpoint-dmonly':''}" data-point-id="${esc(p.id)}"><title>${esc(p.name||"")}${hiddenFromPlayers?" (MJ uniquement)":""}</title>
      <circle cx="${c.x}" cy="${c.y}" r="${r.toFixed(1)}" class="hexpoint-hit"></circle>
      <circle cx="${c.x}" cy="${c.y}" r="${(r*0.55).toFixed(1)}" class="hexpoint-pulse-ping"></circle>
      <circle cx="${c.x}" cy="${c.y}" r="${(r*0.4).toFixed(1)}" class="hexpoint-pulse-dot"></circle>
      ${hiddenFromPlayers?`<circle cx="${c.x}" cy="${c.y}" r="${(r*1.15).toFixed(1)}" class="hexpoint-ring"></circle>`:""}
    </g>`;
  }).join("");
}
/* Les tuiles du pack "tuiles hexcrawl/" sont nativement pointy-top (sommet en haut/bas), comme la
   grille de l'app — contrairement à l'ancien set Hextiles (flat-top, corrigé par une rotation de
   30°, cf. git blame). Boîte englobante pointy-top : size*racine(3) de large × size*2 de haut. */
function hexTileImageSVG(href, c, size){
  const w = size*Math.sqrt(3), h = size*2;
  const x = (c.x - w/2).toFixed(1), y = (c.y - h/2).toFixed(1);
  return `<image href="${esc(href)}" x="${x}" y="${y}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" class="hex-tile-img"></image>`;
}
/* Fond (5 images pleines) + overlay (27 images, contour dessiné, transparent autour) empilés sur
   la boîte englobante de l'hexagone — système réintégré (2026-08-17), voir le commentaire sur
   FOND_LIST/OVERLAY_LIST plus haut pour le pourquoi de la rotation (images flat-top, grille
   pointy-top). Repris tel quel de l'ancien hexBiomeImageSVG (git blame). */
function hexFondOverlayImageSVG(href, c, size, cls){
  const w = size*2, h = size*Math.sqrt(3);
  const x = (c.x - w/2).toFixed(1), y = (c.y - h/2).toFixed(1);
  const rot = `rotate(30 ${c.x.toFixed(1)} ${c.y.toFixed(1)})`;
  return `<image href="${esc(href)}" x="${x}" y="${y}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" transform="${rot}" class="${cls}"></image>`;
}
function hexTerrainLayerSVG(h, c, size){
  const pts = hexCorners(c.x, c.y, size-1);
  if(h.tile){
    if(h.tile==="water") return `<polygon points="${pts}" fill="${TILE_PACKS.find(p=>p.id==="water").color}"></polygon>`;
    return `<polygon points="${pts}" fill="${HEX_NEUTRAL_FILL}"></polygon>${hexTileImageSVG(h.tile, c, size)}`;
  }
  if(h.fond || h.overlay){
    let out = `<polygon points="${pts}" fill="${HEX_NEUTRAL_FILL}"></polygon>`;
    if(h.fond){ const f=FOND_LIST.find(x=>x.id===h.fond); if(f) out += hexFondOverlayImageSVG(f.file, c, size, "hex-fond-img"); }
    if(h.overlay) out += hexFondOverlayImageSVG(h.overlay, c, size, "hex-overlay-img");
    return out;
  }
  const info = terrainInfo(h.hexType);
  return `<polygon points="${pts}" fill="${info.color}"></polygon><text x="${c.x.toFixed(1)}" y="${(c.y+5).toFixed(1)}" text-anchor="middle" class="hex-icon">${info.icon}</text>`;
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
  if(hexmapCurrentId !== m.id){ _hexClearPaintModes(); hexMapZoom = { scale:1, tx:0, ty:0 }; hexMapFullscreen = false; document.body.classList.remove("hex-fullscreen-lock"); }
  hexmapCurrentId = m.id;
  const total = (m.hexes||[]).length;
  const revealed = (m.hexes||[]).filter(h=>h.fogState!=="hidden").length;
  const paintPack = TILE_PACKS.find(p=>p.id===hexPaintPackId);
  const modeHelp = hexPlacingPoint
    ? "Clique l'hexagone où placer le nouveau point d'intérêt (ou re-clique le bouton pour annuler)."
    : hexPaintingTile
      ? `Choisis un biome puis une tuile, ensuite clique un hexagone pour l'appliquer (tuile actuelle : « ${hexPaintTileValue?tileLabel(hexPaintTileValue):"Aucune"} »).`
      : hexPaintingFond
        ? `Clique un hexagone pour lui donner le fond « ${fondLabel(hexPaintFondValue)} » (ou re-clique le bouton pour annuler).`
        : hexPaintingOverlay
          ? `Clique un hexagone pour lui appliquer l'overlay « ${hexPaintOverlayValue?overlayLabel(hexPaintOverlayValue):"Aucun"} » (ou re-clique le bouton pour annuler).`
          : `Clique un hexagone pour le révéler ou le recacher aux joueurs · ${revealed}/${total} révélé(s).`;
  app.innerHTML = `<div class="detail">
    <button class="back" data-back="1">← Hexcrawl</button>
    <h1>${esc(m.title||"Sans titre")}</h1>
    ${m.description?`<p class="muted" style="font-family:var(--ui)">${renderText(m.description)}</p>`:""}
    ${detailActions("hexmap",m.id,{hideReading:true})}
    ${effectiveRole()==="gm" ? `<div class="crawl-toolbar">
      <button class="btn ghost sm" data-hex-reveal-all="1">👁 Tout révéler</button>
      <button class="btn ghost sm" data-hex-hide-all="1">🌫 Tout masquer</button>
      <button class="btn ghost sm${hexPlacingPoint?' active-mode':''}" data-hex-add-point="1">📍 ${hexPlacingPoint?"Clique un hexagone…":"Ajouter un point"}</button>
      <button class="btn ghost sm${hexPaintingTile?' active-mode':''}" data-hex-paint-tile="1">🖌 ${hexPaintingTile?"Clique un hexagone…":"Peindre une tuile"}</button>
      <button class="btn ghost sm${hexPaintingFond?' active-mode':''}" data-hex-paint-fond="1">🎨 ${hexPaintingFond?"Clique un hexagone…":"Peindre un fond"}</button>
      <button class="btn ghost sm${hexPaintingOverlay?' active-mode':''}" data-hex-paint-overlay="1">🖼 ${hexPaintingOverlay?"Clique un hexagone…":"Peindre un overlay"}</button>
      <button class="btn ghost sm" data-hex-import="1">⭱ Importer / remplacer le JSON</button>
    </div>
    ${hexPaintingTile ? packPickerHTML(hexPaintPackId) : ""}
    ${hexPaintingTile && paintPack ? tilePickerHTML(paintPack.id, hexPaintTileValue) : ""}
    ${hexPaintingFond ? fondPickerHTML(hexPaintFondValue) : ""}
    ${hexPaintingOverlay ? overlayPickerHTML(hexPaintOverlayValue) : ""}
    <div class="crawl-help">${modeHelp}</div>` : ""}
    ${total && (m.points||[]).length ? `<label style="display:flex;align-items:center;gap:.4rem;font-family:var(--ui);font-size:.85rem;color:var(--muted);margin:.5rem 0 0;cursor:pointer">
      <input type="checkbox" id="hex-points-toggle" ${hexPointsVisible?"checked":""} style="width:auto"> Afficher les points d'intérêt
    </label>` : ""}
    <div class="crawl-map-scroll${hexPlacingPoint?' hex-placing':''}${(hexPaintingTile||hexPaintingFond||hexPaintingOverlay)?' hex-painting-biome':''}${hexMapFullscreen?' hex-map-fullscreen':''}" id="hex-map-container">
      ${total ? `<div class="crawl-map-toolbar">
        <button class="btn ghost sm" data-hex-zoom-out="1">➖</button>
        <button class="btn ghost sm" data-hex-zoom-reset="1" id="hex-zoom-label">${Math.round(hexMapZoom.scale*100)}%</button>
        <button class="btn ghost sm" data-hex-zoom-in="1">➕</button>
        <button class="btn ghost sm" data-hex-fullscreen="1">${hexMapFullscreen?"⛶ Quitter le plein écran":"⛶ Plein écran"}</button>
      </div>` : ""}
      ${total ? buildHexSVG(m) : `<p class="faint" style="font-family:var(--ui);padding:1rem">Aucune donnée de terrain pour l'instant.${effectiveRole()==="gm"?" Importe un fichier JSON pour commencer.":""}</p>`}
    </div>
  </div>`;
  const hpt = document.getElementById("hex-points-toggle");
  if(hpt) hpt.addEventListener("change", e=>{
    hexPointsVisible = e.target.checked;
    const layer = document.getElementById("hex-points-layer");
    if(layer) layer.style.display = hexPointsVisible ? "" : "none";
  });
  const packPicker = document.getElementById("hex-pack-picker");
  if(packPicker) packPicker.querySelectorAll(".overlay-pick").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      hexPaintPackId = btn.dataset.tilePack;
      const pack = TILE_PACKS.find(p=>p.id===hexPaintPackId);
      hexPaintTileValue = pack ? tilePath(pack.id, pack.tiles[0].file) : "";
      const mm = getEntity("hexmap", hexmapCurrentId);
      if(mm) detailHexmap(mm);
    });
  });
  const tilePicker = document.getElementById("hex-tile-picker");
  if(tilePicker) tilePicker.querySelectorAll(".overlay-pick").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      hexPaintTileValue = btn.dataset.tile;
      tilePicker.querySelectorAll(".overlay-pick").forEach(b=>b.classList.toggle("active", b===btn));
      const help = document.querySelector(".crawl-help");
      if(help) help.textContent = `Choisis un biome puis une tuile, ensuite clique un hexagone pour l'appliquer (tuile actuelle : « ${hexPaintTileValue?tileLabel(hexPaintTileValue):"Aucune"} »).`;
    });
  });
  const fondPicker = document.getElementById("hex-fond-picker");
  if(fondPicker) fondPicker.querySelectorAll(".overlay-pick").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      hexPaintFondValue = btn.dataset.fond;
      fondPicker.querySelectorAll(".overlay-pick").forEach(b=>b.classList.toggle("active", b===btn));
      const help = document.querySelector(".crawl-help");
      if(help) help.textContent = `Clique un hexagone pour lui donner le fond « ${fondLabel(hexPaintFondValue)} » (ou re-clique le bouton pour annuler).`;
    });
  });
  const overlayPicker = document.getElementById("hex-overlay-picker");
  if(overlayPicker) overlayPicker.querySelectorAll(".overlay-pick").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      hexPaintOverlayValue = btn.dataset.overlay;
      overlayPicker.querySelectorAll(".overlay-pick").forEach(b=>b.classList.toggle("active", b===btn));
      const help = document.querySelector(".crawl-help");
      if(help) help.textContent = `Clique un hexagone pour lui appliquer l'overlay « ${hexPaintOverlayValue?overlayLabel(hexPaintOverlayValue):"Aucun"} » (ou re-clique le bouton pour annuler).`;
    });
  });
  const mapContainer = document.getElementById("hex-map-container");
  if(mapContainer){
    initHexMapGestures(mapContainer);
    applyHexMapTransform();
    const zOut = document.querySelector("[data-hex-zoom-out]"), zIn = document.querySelector("[data-hex-zoom-in]"), zReset = document.querySelector("[data-hex-zoom-reset]"), fsBtn = document.querySelector("[data-hex-fullscreen]");
    const rect = ()=>mapContainer.getBoundingClientRect();
    if(zOut) zOut.addEventListener("click", ()=>{ const r=rect(); setHexZoom(hexMapZoom.scale/1.3, r.width/2, r.height/2); });
    if(zIn) zIn.addEventListener("click", ()=>{ const r=rect(); setHexZoom(hexMapZoom.scale*1.3, r.width/2, r.height/2); });
    if(zReset) zReset.addEventListener("click", resetHexZoom);
    if(fsBtn) fsBtn.addEventListener("click", toggleHexMapFullscreen);
  }
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
/* Ouvre en LECTURE par défaut, y compris pour le MJ (2026-08-17, demande de Tristan : en jeu on
   consulte un point bien plus souvent qu'on ne l'édite — tomber sur le formulaire à chaque tap
   était pénible). Le MJ a un bouton « Modifier » pour basculer sur le formulaire ; `mode:"edit"`
   permet d'y aller directement, ce dont se sert createHexPointAt() pour un point tout neuf. */
function openHexPointModal(pointId, mode){
  const m = getEntity("hexmap", hexmapCurrentId); if(!m) return;
  const p = (m.points||[]).find(x=>x.id===pointId); if(!p) return;
  const isGM = effectiveRole()==="gm";
  if(!isGM || mode!=="edit"){
    openModal(`<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem">
        <h2 style="margin:0;color:var(--gold2)">${esc(p.name||"Point d'intérêt")}</h2>
        <button class="icon-btn" data-modal-close="1">✕</button></div>
      ${p.type?`<p class="faint" style="font-family:var(--ui);margin:.3rem 0 0">${esc(p.type)}</p>`:""}
      ${isGM && p.dmOnly?`<p class="faint" style="font-family:var(--ui);margin:.3rem 0 0">🚫 Masqué aux joueurs</p>`:""}
      ${(p.description&&p.description.trim())?`<div style="margin-top:.7rem">${renderBullets(p.description)}</div>`:`<p class="faint" style="font-family:var(--ui);margin-top:.7rem">Pas de description.</p>`}
      <div class="form-actions">${isGM?`<button class="btn ghost" id="hp-edit">✎ Modifier</button>`:""}<button class="btn ghost" data-modal-close="1">Fermer</button></div>`);
    const btnEdit = document.getElementById("hp-edit");
    if(btnEdit) btnEdit.addEventListener("click", ()=>openHexPointModal(pointId, "edit"));
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
/* Les 4 modes (placer un point, peindre une tuile, un fond, un overlay) sont mutuellement
   exclusifs — un seul actif à la fois, comme avant l'ajout de fond/overlay (2026-08-17). */
function _hexClearPaintModes(){ hexPlacingPoint=false; hexPaintingTile=false; hexPaintingFond=false; hexPaintingOverlay=false; }
function toggleHexPlacingPoint(){
  const next = !hexPlacingPoint; _hexClearPaintModes(); hexPlacingPoint = next;
  const m = getEntity("hexmap", hexmapCurrentId);
  if(m) detailHexmap(m);
}
function toggleHexPaintingTile(){
  const next = !hexPaintingTile; _hexClearPaintModes(); hexPaintingTile = next;
  const m = getEntity("hexmap", hexmapCurrentId);
  if(m) detailHexmap(m);
}
function toggleHexPaintingFond(){
  const next = !hexPaintingFond; _hexClearPaintModes(); hexPaintingFond = next;
  const m = getEntity("hexmap", hexmapCurrentId);
  if(m) detailHexmap(m);
}
function toggleHexPaintingOverlay(){
  const next = !hexPaintingOverlay; _hexClearPaintModes(); hexPaintingOverlay = next;
  const m = getEntity("hexmap", hexmapCurrentId);
  if(m) detailHexmap(m);
}
/* h.tile (nouveau système, une seule image) et h.fond/h.overlay (système fond+overlay réintégré)
   sont mutuellement exclusifs SUR UN MÊME HEXAGONE : peindre l'un efface l'autre, pour ne jamais
   superposer deux systèmes d'illustration différents sur la même case (rendu ambigu sinon). */
function setHexTile(q,r,tile){
  const m = getEntity("hexmap", hexmapCurrentId); if(!m) return;
  const h = (m.hexes||[]).find(x=>x.q===q && x.r===r); if(!h) return;
  h.tile = tile; h.fond = ""; h.overlay = "";
  saveDB();
  detailHexmap(m);
}
function setHexFond(q,r,fond){
  const m = getEntity("hexmap", hexmapCurrentId); if(!m) return;
  const h = (m.hexes||[]).find(x=>x.q===q && x.r===r); if(!h) return;
  h.fond = fond; h.tile = "";
  saveDB();
  detailHexmap(m);
}
function setHexOverlay(q,r,overlay){
  const m = getEntity("hexmap", hexmapCurrentId); if(!m) return;
  const h = (m.hexes||[]).find(x=>x.q===q && x.r===r); if(!h) return;
  h.overlay = overlay; h.tile = "";
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
  openHexPointModal(p.id, "edit"); // point tout neuf : rien à consulter, on va droit au formulaire
}
let _hexImportTarget = null; // null = nouvelle carte, sinon id de la carte à remplacer
function importHexmapJSON(file){
  const r = new FileReader();
  r.onload = ()=>{
    try{
      const data = JSON.parse(r.result);
      const hexesObj = data.hexes || {};
      const hexes = Object.values(hexesObj).filter(h=>!h.layer||h.layer==="surface")
        .map(h=>({ q:h.q, r:h.r, hexType:h.hexType||"", fogState:h.fogState||"hidden", tile:h.tile||"", fond:h.biome||"", overlay:h.overlay||"" }));
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
