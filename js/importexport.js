/* =========================================================================
   IMPORT / EXPORT
   ========================================================================= */
function exportJSON(){
  const blob = new Blob([JSON.stringify(db,null,2)], {type:"application/json"});
  downloadBlob(blob, `grimoire-shadowdark-${new Date().toISOString().slice(0,10)}.json`);
  toast("Données exportées. Le fichier est téléchargé sur votre appareil, généralement dans votre dossier Téléchargements.");
}
const DB_COLS = ["sessions","events","creatures","tables","npcs","pointcrawls","pcs","treasures","hexmaps","spells","initiative","wheel","dungeonmaps","gmnotes"];
function countItems(d){ return DB_COLS.reduce((n,c)=>n+((d[c]||[]).length),0); }
function mergeDB(data){
  let added = 0;
  DB_COLS.forEach(col=>{
    if(!db[col]) db[col] = [];
    const seen = new Set(db[col].map(o=>o.id));
    (data[col]||[]).forEach(o=>{ if(o && o.id && !seen.has(o.id)){ db[col].push(o); seen.add(o.id); added++; } });
  });
  return added;
}
function importJSON(file){
  const r = new FileReader();
  r.onload = ()=>{
    let data;
    try{ data = JSON.parse(r.result); if(!data || typeof data!=="object") throw 0; }
    catch(e){ toast("Fichier JSON invalide."); return; }
    _importData = data;
    openModal(`<h2 style="margin:.1rem 0 .5rem;color:var(--gold2)">Importer des données</h2>
      <p style="font-family:var(--ui);font-size:.9rem;line-height:1.5;color:var(--muted);margin:0 0 1rem">
        Le fichier contient <b>${countItems(data)}</b> élément(s).<br>
        <b style="color:var(--green)">Fusionner</b> : ajoute uniquement les éléments absents (sans toucher aux tiens).<br>
        <b style="color:var(--blood2)">Remplacer tout</b> : efface la base actuelle et la remplace.</p>
      <div class="form-actions" style="margin-top:0">
        <button class="btn" data-import-merge="1">➕ Fusionner</button>
        <button class="btn danger" data-import-replace="1">⟳ Remplacer tout</button>
        <button class="btn ghost" data-modal-close="1">Annuler</button>
      </div>`);
  };
  r.onerror = ()=>toast("Lecture du fichier impossible.");
  r.readAsText(file);
}
function downloadBlob(blob, name){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
}

