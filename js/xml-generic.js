/* ---- Import / export XML génériques (PNJ, Trésor, Tables, Point Crawl) ----
   Chaque type ne gère que ses champs texte simples ; les images (PNJ/Trésor) et
   les nœuds/liens du point crawl (liés à des événements existants) ne sont pas
   couverts par ce format — ils restent à gérer depuis les fiches elles-mêmes. */
const XML_TYPES = {
  npc: { tag:"npc", tagAlt:/npc|pnj/i, label:"PNJ", col:"npcs", nameField:"name",
    fields:["name","description","physique","age","possessions","objectif","moyens","comportement","ac","hp","str","dex","con","int","wis","cha","weapon","spells"] },
  treasure: { tag:"treasure", tagAlt:/treasure|tresor|objet/i, label:"objet", col:"treasures", nameField:"name",
    fields:["name","category","description","bonus","boon","curse","personality"] },
  table: { tag:"table", tagAlt:/table/i, label:"table", col:"tables", nameField:"title",
    fields:["title","context"], rowsField:"rows" },
  pointcrawl: { tag:"pointcrawl", tagAlt:/pointcrawl|crawl/i, label:"point crawl", col:"pointcrawls", nameField:"title",
    fields:["title","description"] },
  spell: { tag:"spell", tagAlt:/spell|sort/i, label:"sort", col:"spells", nameField:"name",
    fields:["name","class","tier","range","duration","effect"] }
};
let _xmlImportTarget = "creature";
let _xmlPendingGeneric = null;

function xmlToolbarHTML(typeKey){
  return `<button class="btn ghost sm" data-import-xml-type="${typeKey}">⭱ Import XML</button>
    <button class="btn ghost sm" data-export-xml-type="${typeKey}">⭳ Export XML</button>
    <button class="btn ghost sm" data-xml-sample-type="${typeKey}">📄 Modèle XML</button>`;
}

function parseGenericNode(node, cfg){
  const get = sel => {
    const el = node.querySelector(sel);
    if(el) return el.textContent.trim();
    const a = node.getAttribute(sel);
    return a!=null ? a.trim() : "";
  };
  const o = {};
  cfg.fields.forEach(f=> o[f]=get(f));
  if(cfg.rowsField){
    o[cfg.rowsField] = [...node.querySelectorAll("row")].map(r=>r.textContent.trim()).filter(Boolean);
  }
  return o;
}

function importXMLGeneric(typeKey, file){
  const cfg = XML_TYPES[typeKey];
  const r = new FileReader();
  r.onload = ()=>{
    try{
      const doc = new DOMParser().parseFromString(r.result, "application/xml");
      if(doc.querySelector("parsererror")) throw new Error("XML mal formé");
      const nodes = doc.getElementsByTagName(cfg.tag).length ? [...doc.getElementsByTagName(cfg.tag)]
        : [...doc.documentElement.children].filter(n=>cfg.tagAlt.test(n.tagName));
      if(!nodes.length) throw new Error(`Aucune balise <${cfg.tag}> trouvée`);
      const items = nodes.map(n=>parseGenericNode(n,cfg)).filter(o=>o[cfg.nameField]);
      const existing = new Set(db[cfg.col].map(o=>(o[cfg.nameField]||"").toLowerCase()));
      const dupes = items.filter(o=>existing.has((o[cfg.nameField]||"").toLowerCase())).length;
      _xmlPendingGeneric = { typeKey, items };
      openModal(`<h2 style="margin:.1rem 0 .5rem;color:var(--gold2)">Importer ${items.length} ${esc(cfg.label)}(s)</h2>
        <p style="font-family:var(--ui);font-size:.9rem;line-height:1.55;color:var(--muted);margin:0 0 1rem">
          ${dupes>0 ? `<b style="color:var(--gold2)">${dupes}</b> portent un nom déjà présent (doublons potentiels).<br>` : `Aucun doublon détecté.<br>`}
          <b style="color:var(--green)">Ignorer les doublons</b> : n'ajoute que les nouveaux.<br>
          <b style="color:var(--gold2)">Remplacer les doublons</b> : met à jour les fiches existantes, ajoute les nouveaux.<br>
          <b>Tout ajouter</b> : ajoute tout, même en double.</p>
        <div class="form-actions" style="margin-top:0;flex-wrap:wrap">
          <button class="btn" data-xmlg-skip="1">⏭ Ignorer les doublons</button>
          <button class="btn ghost" data-xmlg-replace="1">♻ Remplacer les doublons</button>
          <button class="btn ghost" data-xmlg-all="1">➕ Tout ajouter</button>
          <button class="btn ghost" data-modal-close="1">Annuler</button>
        </div>`);
    }catch(e){ toast("Import XML échoué : "+e.message); }
  };
  r.readAsText(file);
}

function applyXMLImportGeneric(mode){
  if(!_xmlPendingGeneric) return;
  const { typeKey, items } = _xmlPendingGeneric;
  const cfg = XML_TYPES[typeKey];
  let added=0, replaced=0, skipped=0;
  const byKey = {}; db[cfg.col].forEach(o=>{ byKey[(o[cfg.nameField]||"").toLowerCase()] = o; });
  items.forEach(o=>{
    const key = (o[cfg.nameField]||"").toLowerCase();
    const exist = byKey[key];
    if(exist && mode!=="all"){
      if(mode==="replace"){ const id=exist.id; Object.assign(exist, o); exist.id=id; replaced++; }
      else skipped++;
    } else {
      o.id = uid(); db[cfg.col].push(o); byKey[key]=o; added++;
    }
  });
  _xmlPendingGeneric = null; saveDB(); view={tab:cfg.col, mode:"list", id:null}; render();
  toast(`Import : ${added} ajouté(s), ${replaced} remplacé(s), ${skipped} ignoré(s).`);
}

function exportEntityXMLGeneric(typeKey){
  const cfg = XML_TYPES[typeKey];
  const items = db[cfg.col];
  if(!items.length){ toast("Rien à exporter pour l'instant."); return; }
  const body = items.map(o=>{
    const inner = cfg.fields.map(f=>`    <${f}>${esc(o[f]||"")}</${f}>`).join("\n");
    const rows = cfg.rowsField ? `\n    <rows>\n${(o[cfg.rowsField]||[]).map(row=>`      <row>${esc(row)}</row>`).join("\n")}\n    </rows>` : "";
    return `  <${cfg.tag}>\n${inner}${rows}\n  </${cfg.tag}>`;
  }).join("\n\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${cfg.col}>\n${body}\n</${cfg.col}>`;
  downloadBlob(new Blob([xml],{type:"application/xml"}), `export-${cfg.col}-shadowdark.xml`);
  toast(`Export XML : ${items.length} ${cfg.label}(s).`);
}

function xmlSampleGeneric(typeKey){
  const cfg = XML_TYPES[typeKey];
  const sampleFields = cfg.fields.map(f=>`    <${f}>Exemple</${f}>`).join("\n");
  const sampleRows = cfg.rowsField ? `\n    <rows>\n      <row>Résultat 1</row>\n      <row>Résultat 2</row>\n    </rows>` : "";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Modèle d'import ${cfg.label} — Codex Shadowdark. -->\n<${cfg.col}>\n  <${cfg.tag}>\n${sampleFields}${sampleRows}\n  </${cfg.tag}>\n</${cfg.col}>`;
  downloadBlob(new Blob([xml],{type:"application/xml"}), `modele-${cfg.col}-shadowdark.xml`);
  toast("Modèle XML téléchargé.");
}
