/* =========================================================================
   INITIATIVE — timeline de combat en direct (MJ + joueurs)
   Une seule table de combat active à la fois. Chaque participant référence un
   PJ ou une créature existants (nom/portrait/PV/CA résolus en direct depuis
   db.pcs/db.creatures, jamais dupliqués) ou porte un nom libre ("custom").
   Synchro joueurs : polling léger (pas de Supabase Realtime pour cette v1 —
   un combat n'a pas besoin d'une latence inférieure à quelques secondes).
   ========================================================================= */
let initiativePollTimer = null;
function stopInitiativePolling(){ if(initiativePollTimer){ clearInterval(initiativePollTimer); initiativePollTimer=null; } }
function startInitiativePolling(){
  if(initiativePollTimer) return;
  initiativePollTimer = setInterval(async ()=>{
    if(view.tab!=="initiative"){ stopInitiativePolling(); return; }
    if(document.activeElement && document.activeElement.matches && document.activeElement.matches("[data-init-manual-input]")) return; // ne pas écraser une saisie manuelle en cours
    try{
      const { data, error } = await sb.from("initiative").select("data");
      if(error) return; // table pas encore créée côté Supabase, ou souci réseau — on retente au prochain tick
      db.initiative = (data||[]).map(r=>r.data);
      if(view.tab==="initiative") renderList();
    }catch(e){ /* silencieux, on retente au prochain tick */ }
  }, 4500);
}

/* Nom/visuel figés au moment de l'ajout au combat — jamais un lookup live pour l'identité.
   Nécessaire car les joueurs n'ont pas de lecture RLS sur "creatures" (pour ne pas leur
   spoiler les stats des monstres) : un lookup live échouerait silencieusement côté joueur
   et affichait à tort "Créature supprimée". Les stats (CA/PV/sous-titre) restent en direct
   dans initiativeEntryInfo() et n'apparaissent donc que pour un rôle qui peut les lire. */
function initiativeSnapshot(kind, entity){
  if(kind==="pc"){
    return {
      name: entity.name || "Sans nom",
      image: entity.portrait ? `portraits/${entity.portrait}` : ((entity.images&&entity.images[0]) ? entity.images[0].data : ""),
      grayscale: !!entity.portrait
    };
  }
  return {
    name: entity.name || "Sans nom",
    image: (entity.images&&entity.images[0]) ? entity.images[0].data : "",
    grayscale: false
  };
}

function initiativeEntryInfo(entry){
  if(entry.kind==="custom") return { name: entry.name || "Sans nom", sub:"", image:"", grayscale:false, icon:"⚔", ac:"", hp:"" };
  const icon = entry.kind==="pc" ? "🛡" : "🐲";
  const live = entry.kind==="pc" ? db.pcs.find(p=>p.id===entry.refId) : db.creatures.find(c=>c.id===entry.refId);
  // Migration silencieuse des entrées créées avant l'introduction du snapshot (le MJ a toujours
  // la lecture complète, donc c'est le rôle le plus sûr pour combler rétroactivement le snapshot manquant).
  if(effectiveRole()==="gm" && !entry.name && live){ Object.assign(entry, initiativeSnapshot(entry.kind, live)); saveInitiative(); }
  const name = entry.name || (live && live.name) || (entry.kind==="pc" ? "PJ supprimé" : "Créature supprimée");
  const image = entry.image || "";
  const grayscale = !!entry.grayscale;
  if(!live) return { name, sub:"", image, grayscale, icon, ac:"", hp:"" };
  const sub = entry.kind==="pc" ? [live.ancestry, live.cls].filter(Boolean).join(" · ") : (live.category || "");
  const ac = live.ac, hp = entry.kind==="pc" ? (live.hpCurrent||live.hp) : live.hp;
  return { name, sub, image, grayscale, icon, ac, hp };
}

function addInitiativeEntry(entry){
  db.initiative.push(Object.assign({ id:uid(), initiative:null, manual:false }, entry));
  saveInitiative(); renderList();
}
function addInitiativeFromPC(pcId){
  const pc = db.pcs.find(p=>p.id===pcId); if(!pc) return;
  addInitiativeEntry(Object.assign({ kind:"pc", refId:pcId }, initiativeSnapshot("pc", pc)));
}
function addInitiativeFromCreature(creatureId){
  const c = db.creatures.find(cr=>cr.id===creatureId); if(!c) return;
  addInitiativeEntry(Object.assign({ kind:"creature", refId:creatureId }, initiativeSnapshot("creature", c)));
}
function addInitiativeCustom(name){
  const n = (name||"").trim();
  if(!n) return;
  addInitiativeEntry({ kind:"custom", name:n });
}
function computeInitiativeRoll(e){
  let value = rollDice(1,20);
  if(e.kind==="pc"){ const pc = db.pcs.find(p=>p.id===e.refId); if(pc) value += ABILITY_MOD(pc.dex); }
  return value;
}
function rollInitiativeFor(id){
  const e = db.initiative.find(x=>x.id===id); if(!e) return;
  e.initiative = computeInitiativeRoll(e); e.manual = false;
  saveInitiative(); renderList();
}
function rollInitiativeAll(){
  let n = 0;
  db.initiative.forEach(e=>{ if(!e.manual){ e.initiative = computeInitiativeRoll(e); n++; } });
  saveInitiative(); renderList();
  toast(n ? `Initiative lancée pour ${n} participant(s).` : "Rien à lancer — toutes les valeurs sont figées manuellement.");
}
function setInitiativeManual(id, raw){
  const e = db.initiative.find(x=>x.id===id); if(!e) return;
  const v = raw==="" ? null : parseInt(raw,10);
  e.initiative = (v==null || isNaN(v)) ? null : v;
  e.manual = e.initiative!=null;
  saveInitiative();
}
function removeInitiativeEntry(id){ deleteEntity("initiative", id); renderList(); }
function clearInitiative(){
  confirmModal("Vider entièrement le suivi d'initiative ?", ()=>{
    db.initiative.slice().forEach(e=>deleteEntity("initiative", e.id));
    renderList(); toast("Combat vidé.");
  });
}

function openInitiativeAddPCModal(){
  const alreadyIds = new Set(db.initiative.filter(e=>e.kind==="pc").map(e=>e.refId));
  const buildList = (filter="")=>{
    const f = filter.toLowerCase();
    const list = db.pcs.filter(p=>!alreadyIds.has(p.id) && (p.name||"").toLowerCase().includes(f));
    return list.length
      ? list.map(p=>`<div class="mli" data-pick-init-pc="${p.id}"><b>${esc(p.name||"Sans nom")}</b><div class="faint" style="font-size:.78rem">${esc([p.ancestry,p.cls].filter(Boolean).join(" · ")||"—")}</div></div>`).join("")
      : `<p class="faint" style="font-family:var(--ui)">${db.pcs.length ? "Tous les PJ sont déjà dans le combat." : "Aucun PJ créé pour l'instant."}</p>`;
  };
  openModal(`<div style="display:flex;justify-content:space-between;align-items:center">
      <h2 style="margin:0;color:var(--gold2)">Ajouter un PJ</h2>
      <button class="icon-btn" data-modal-close="1">✕</button></div>
    <input type="text" id="pick-search" placeholder="Rechercher un PJ…" style="margin-top:.7rem" autocomplete="off">
    <div class="modal-list" id="pick-list">${buildList()}</div>`);
  const inp = $("#pick-search"), listEl = $("#pick-list");
  inp.addEventListener("input", ()=>{ listEl.innerHTML = buildList(inp.value); });
  inp.focus();
}
function openInitiativeAddCreatureModal(){
  const buildList = (filter="")=>{
    const f = filter.toLowerCase();
    const list = db.creatures.filter(c=>(c.name||"").toLowerCase().includes(f));
    return list.length
      ? list.map(c=>`<div class="mli" data-pick-init-creature="${c.id}"><b>${esc(c.name||"Sans nom")}</b><div class="faint" style="font-size:.78rem">${esc(c.category||"—")}</div></div>`).join("")
      : `<p class="faint" style="font-family:var(--ui)">${db.creatures.length ? "Aucune créature trouvée." : "Aucune créature créée pour l'instant."}</p>`;
  };
  openModal(`<div style="display:flex;justify-content:space-between;align-items:center">
      <h2 style="margin:0;color:var(--gold2)">Ajouter une créature</h2>
      <button class="icon-btn" data-modal-close="1">✕</button></div>
    <input type="text" id="pick-search" placeholder="Rechercher une créature…" style="margin-top:.7rem" autocomplete="off">
    <div class="modal-list" id="pick-list">${buildList()}</div>
    <p class="faint" style="font-family:var(--ui);font-size:.76rem;margin-top:.6rem">Astuce : réouvrez ce panneau pour ajouter plusieurs exemplaires (ex. 3 gobelins).</p>`);
  const inp = $("#pick-search"), listEl = $("#pick-list");
  inp.addEventListener("input", ()=>{ listEl.innerHTML = buildList(inp.value); });
  inp.focus();
}

function listInitiative(){
  startInitiativePolling();
  const items = db.initiative;
  const pending = items.filter(e=>e.initiative==null);
  const ranked = items.filter(e=>e.initiative!=null).sort((a,b)=>b.initiative-a.initiative);

  const addBtns = effectiveRole()==="gm" ? `<button class="btn ghost sm" data-init-add-pc="1">+ PJ</button>
    <button class="btn ghost sm" data-init-add-creature="1">+ Créature</button>
    <button class="btn ghost sm" data-init-add-custom="1">+ Libre</button>
    <button class="btn ghost sm" data-init-roll-all="1">🎲 Lancer l'initiative</button>
    ${items.length ? `<button class="btn danger sm" data-init-clear="1">🗑 Vider le combat</button>` : ""}` : "";

  const head = `<div class="page-head">
    <div><h1>Initiative</h1><div class="sub">${items.length} participant(s)</div></div>
    ${addBtns ? `<div class="hbtns">${addBtns}</div>` : ""}
  </div>`;

  if(!items.length){
    app.innerHTML = head + emptyState("⚔", effectiveRole()==="gm" ? "Aucun combat en cours. Ajoutez des participants pour démarrer." : "Aucun combat en cours pour l'instant.");
    return;
  }

  // Compte les occurrences dupliquées (ex. plusieurs gobelins) pour les distinguer à l'affichage.
  const seen = new Map();
  const suffixFor = (e)=>{
    if(e.kind==="custom") return "";
    const key = e.kind+":"+e.refId;
    const total = items.filter(x=>x.kind===e.kind && x.refId===e.refId).length;
    if(total<=1) return "";
    const n = (seen.get(key)||0) + 1; seen.set(key, n);
    return ` (${n})`;
  };

  const cardHTML = (e, rank)=>{
    const info = initiativeEntryInfo(e);
    const suffix = suffixFor(e);
    const visual = info.image
      ? `<img class="init-portrait${info.grayscale?' portrait-gray':''}" src="${esc(info.image)}" alt="">`
      : `<div class="init-portrait init-portrait-fallback">${info.icon}</div>`;
    const stats = [info.ac?`CA ${esc(info.ac)}`:"", info.hp?`PV ${esc(info.hp)}`:""].filter(Boolean).join(" · ");
    const gmControls = effectiveRole()==="gm" ? `<button class="btn ghost sm" data-init-roll="${e.id}" title="Lancer 1d20${e.kind==='pc'?' + mod. DEX':''}">🎲</button>
      <input type="number" class="init-manual-input" data-init-manual-input="${e.id}" value="${e.initiative==null?'':e.initiative}" placeholder="—" title="Valeur manuelle">
      <button class="btn danger sm" data-init-remove="${e.id}" title="Retirer du combat">✕</button>` : "";
    return `<div class="init-card">
      <div class="init-rank">${rank!=null?rank:"—"}</div>
      ${visual}
      <div class="init-body">
        <div class="init-name">${esc(info.name)}${suffix}</div>
        ${(info.sub||stats) ? `<div class="init-sub">${[esc(info.sub),stats].filter(Boolean).join(" · ")}</div>` : ""}
      </div>
      <div class="init-value${e.initiative==null?' empty':''}">${e.initiative==null?"—":e.initiative}</div>
      ${gmControls ? `<div class="init-controls">${gmControls}</div>` : ""}
    </div>`;
  };

  const pendingHTML = pending.length ? `<div class="init-group-label">En attente de jet</div>
    <div class="init-track">${pending.map(e=>cardHTML(e,null)).join("")}</div>` : "";
  const rankedHTML = ranked.length ? `<div class="init-group-label">Ordre de passage</div>
    <div class="init-track">${ranked.map((e,i)=>cardHTML(e,i+1)).join("")}</div>` : "";

  app.innerHTML = head + pendingHTML + rankedHTML;
}
