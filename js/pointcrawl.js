/* =========================================================================
   POINT CRAWL — carte de points (= événements) reliés par des segments
   ========================================================================= */
/* Filtre "par défaut" (crawlStatusFilter==="") : pas "tous", mais un focus intelligent — les point
   crawls "en cours" en priorité, sinon "à visiter" à défaut (jamais "en création"/"déjà visité" par
   défaut, sans quoi la liste se remplirait de chantiers pas prêts ou déjà réglés). Demande de
   Tristan (2026-08-10) : voir d'un coup d'œil ce qui est pertinent MAINTENANT en ouvrant l'onglet,
   sans avoir à filtrer à la main à chaque fois. "Tous" devient un choix explicite séparé
   (`__all__`), distinct de "" pour ne pas se confondre avec l'état par défaut au premier chargement. */
function crawlFocusItems(all){
  const enCours = all.filter(c=>c.status==="encours");
  if(enCours.length) return enCours;
  return all.filter(c=>c.status==="avisiter");
}
function listCrawls(){
  const all = db.pointcrawls;
  const bar = pageHead("Point Crawl", `${all.length} plan(s) de points d'intérêt`, "Nouveau point crawl", xmlToolbarHTML("pointcrawl"));
  if(!all.length){ app.innerHTML = bar + emptyState("🗺","Aucun point crawl. Créez une carte de lieux/événements reliés (donjon, zone…)."); return; }
  const statusSel = `<label style="font-family:var(--ui);font-size:.8rem;color:var(--muted);margin-right:.4rem">Statut :</label>
    <select data-crawl-status-filter style="width:auto;display:inline-block;min-width:220px">
      <option value="" ${!crawlStatusFilter?"selected":""}>🎯 En cours (sinon à visiter)</option>
      <option value="__all__" ${crawlStatusFilter==="__all__"?"selected":""}>Tous</option>
      ${CRAWL_STATUSES.map(s=>`<option value="${s.value}" ${crawlStatusFilter===s.value?"selected":""}>${esc(s.label)}</option>`).join("")}
      <option value="__none__" ${crawlStatusFilter==="__none__"?"selected":""}>(Sans statut)</option>
    </select>`;
  const toolbar = `<div style="margin-bottom:1.1rem;display:flex;align-items:center;flex-wrap:wrap;gap:.3rem">${statusSel}</div>`;
  const items = crawlStatusFilter==="__all__" ? all
    : crawlStatusFilter==="__none__" ? all.filter(c=>!c.status)
    : !crawlStatusFilter ? crawlFocusItems(all)
    : all.filter(c=>c.status===crawlStatusFilter);
  const body = items.length ? `<div class="grid">${items.map(c=>{
      const nodes = c.nodes||[];
      const noDesc = nodes.filter(n=>{ const ev=getEntity("event",n.eventId); return !ev || !(ev.description&&ev.description.trim()); }).length;
      const statusMeta = crawlStatusMeta(c.status);
      return `<div class="card" data-open="pointcrawl:${c.id}">
        <h3>${esc(c.title||"Sans titre")}</h3>
        <p>${esc(c.description||"Pas de description")}</p>
        <div class="meta">
          ${statusMeta?`<span class="tag ${statusMeta.cls}">${esc(statusMeta.label)}</span>`:""}
          ${noDesc?`<span class="tag">${noDesc} nœud(s) sans description</span>`:""}
        </div>
      </div>`;
    }).join("")}</div>`
    : (!crawlStatusFilter
        ? `<div class="empty"><span class="big">🎯</span>Rien « en cours » ni « à visiter » pour l'instant.<br><button class="btn ghost sm" style="margin-top:.8rem" data-crawl-status-show-all="1">Afficher tous les point crawls</button></div>`
        : emptyState("🗺","Aucun point crawl avec ce statut."));
  app.innerHTML = bar + toolbar + body;
}

function formCrawl(){
  const c = view.mode==="edit" ? getEntity("pointcrawl",view.id) : {title:"",description:"",status:""};
  app.innerHTML = `<div class="form">
    <button class="back" data-back="1">← Annuler</button>
    <h1>${view.mode==="edit"?"Modifier le":"Nouveau"} point crawl</h1>
    <div class="field"><label>Titre</label><input type="text" id="f-title" value="${esc(c.title)}" placeholder="Les Catacombes de Vol"></div>
    <div class="field"><label>Description / contexte</label><textarea id="f-description" placeholder="Un réseau de galeries sous la cité…">${esc(c.description)}</textarea></div>
    <div class="field"><label>Statut</label>
      <select id="f-status">
        <option value="" ${!c.status?"selected":""}>(Aucun statut)</option>
        ${CRAWL_STATUSES.map(s=>`<option value="${s.value}" ${c.status===s.value?"selected":""}>${esc(s.label)}</option>`).join("")}
      </select>
    </div>
    ${LINK_HELP}
    <div class="form-actions"><button class="btn" data-save="pointcrawl">✓ Enregistrer</button><button class="btn ghost" data-back="1">Annuler</button></div>
  </div>`;
}
function saveCrawl(){
  const isEdit = view.mode==="edit";
  const o = isEdit ? getEntity("pointcrawl",view.id) : {id:uid(),nodes:[],edges:[]};
  const oldTitle = o.title || "";
  const newTitle = $("#f-title").value.trim();
  if(!newTitle){ toast("Le titre est requis."); return; }
  // Si le plan est renommé, renommer la catégorie sur ses événements classés sous l'ancien titre
  if(isEdit && oldTitle && oldTitle!==newTitle){
    (o.nodes||[]).forEach(n=>{ const ev=getEntity("event",n.eventId); if(ev && (ev.theme||"")===oldTitle) ev.theme=newTitle; });
  }
  o.title = newTitle;
  o.description = $("#f-description").value;
  o.status = $("#f-status").value;
  if(!isEdit) db.pointcrawls.push(o);
  const _n = isEdit ? maybePropagate(oldTitle, newTitle) : 0;
  saveDB(); toast("Point crawl enregistré."+(_n?` · ${_n} lien(s) mis à jour`:"")); view={tab:"pointcrawls",mode:"detail",id:o.id}; render();
}

function detailCrawl(c){
  crawlState = { id:c.id, linkMode:false, linkFrom:null };
  const statusMeta = crawlStatusMeta(c.status);
  app.innerHTML = `<div class="detail">
    <button class="back" data-back="1">← Point Crawl</button>
    <span class="tag pointcrawl">Point Crawl</span>${statusMeta?` <span class="tag ${statusMeta.cls}">${esc(statusMeta.label)}</span>`:""}
    <h1>${esc(c.title||"Sans titre")}</h1>
    ${c.description?`<p class="muted" style="font-family:var(--ui)">${renderText(c.description)}</p>`:""}
    ${detailActions("pointcrawl",c.id)}
    <div class="crawl-toolbar">
      <button class="btn ghost sm" data-crawl-add="1">➕ Point existant</button>
      <button class="btn ghost sm" data-crawl-new="1">✨ Nouveau point</button>
      <button class="btn ghost sm" id="link-toggle" data-crawl-link="1">🔗 Mode liaison</button>
      <button class="btn ghost sm" data-crawl-print="1">🖨 Imprimer / PDF</button>
    </div>
    <div class="crawl-help" id="crawl-help"></div>
    <div class="crawl-map-scroll"><div class="crawl-canvas" id="crawl-canvas"></div></div>
    ${backlinksBlock("pointcrawl",c.id)}
  </div>`;
  setCrawlHelp();
  drawCrawl(c);
  const canvas = $("#crawl-canvas");
  canvas.addEventListener("pointerdown", e=>{ const n=e.target.closest(".crawl-node"); if(n) startNodeInteraction(e, c, n.dataset.node); });
  canvas.addEventListener("click", e=>{ const l=e.target.closest("line[data-edge]"); if(l) onEdgeClick(c, l.dataset.edge); });
}

function setCrawlHelp(){
  const h = $("#crawl-help"); if(!h) return;
  h.innerHTML = crawlState.linkMode
    ? `<b style="color:var(--gold2)">Mode liaison actif :</b> cliquez un premier point puis un second pour les relier • cliquez un segment pour le supprimer • re-cliquez le bouton pour terminer.`
    : `Glissez les points pour les déplacer • cliquez un point pour <b>consulter son événement</b> en pleine partie • activez le <b>Mode liaison</b> pour relier deux points par un segment.`;
}

function drawCrawl(c){
  const canvas = document.getElementById("crawl-canvas"); if(!canvas) return;
  const nodesHtml = (c.nodes||[]).map((n,i)=>{
    const ev = getEntity("event", n.eventId);
    const title = ev ? ev.title : "(événement supprimé)";
    const cls = `crawl-node ${ev?"":"missing"} ${crawlState.linkMode?"linkmode":""} ${crawlState.linkFrom===n.id?"linkfrom":""}`;
    return `<div class="${cls}" data-node="${n.id}" style="left:${n.x||0}px;top:${n.y||0}px"><span class="nt">${i+1}</span>${esc(truncate(title,40))}</div>`;
  }).join("");
  const edgesHtml = (c.edges||[]).map(e=>
    `<line data-edge="${e.id}" x1="0" y1="0" x2="0" y2="0"></line>${e.label?`<text data-edgelabel="${e.id}">${esc(e.label)}</text>`:""}`
  ).join("");
  canvas.innerHTML = `<svg>${edgesHtml}</svg>${nodesHtml}`;
  updateAllEdges(c);
}

function updateAllEdges(c){
  const canvas = document.getElementById("crawl-canvas"); if(!canvas) return;
  const center = id=>{ const el = canvas.querySelector(`.crawl-node[data-node="${id}"]`); return el ? {x:el.offsetLeft+el.offsetWidth/2, y:el.offsetTop+el.offsetHeight/2} : null; };
  (c.edges||[]).forEach(e=>{
    const a = center(e.from), b = center(e.to);
    const line = canvas.querySelector(`line[data-edge="${e.id}"]`);
    if(line && a && b){ line.setAttribute("x1",a.x); line.setAttribute("y1",a.y); line.setAttribute("x2",b.x); line.setAttribute("y2",b.y); }
    const t = canvas.querySelector(`text[data-edgelabel="${e.id}"]`);
    if(t && a && b){ t.setAttribute("x",(a.x+b.x)/2); t.setAttribute("y",(a.y+b.y)/2 - 6); t.setAttribute("text-anchor","middle"); }
  });
}

function startNodeInteraction(e, c, nodeId){
  e.preventDefault();
  if(crawlState.linkMode){ handleLinkClick(c, nodeId); return; }
  const node = (c.nodes||[]).find(n=>n.id===nodeId); if(!node) return;
  const nodeEl = document.querySelector(`.crawl-node[data-node="${nodeId}"]`);
  const startX = e.clientX, startY = e.clientY, ox = node.x||0, oy = node.y||0; let moved = false;
  const move = ev=>{
    const dx = ev.clientX-startX, dy = ev.clientY-startY;
    if(Math.abs(dx)>3 || Math.abs(dy)>3) moved = true;
    node.x = Math.max(0, ox+dx); node.y = Math.max(0, oy+dy);
    if(nodeEl){ nodeEl.style.left = node.x+"px"; nodeEl.style.top = node.y+"px"; }
    updateAllEdges(c);
  };
  const up = ()=>{
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);
    if(moved) saveDB(); else openNodeInfo(c, node);
  };
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up);
}

function handleLinkClick(c, nodeId){
  if(!crawlState.linkFrom){ crawlState.linkFrom = nodeId; drawCrawl(c); return; }
  if(crawlState.linkFrom === nodeId){ crawlState.linkFrom = null; drawCrawl(c); return; }
  const exists = (c.edges||[]).some(e=>(e.from===crawlState.linkFrom&&e.to===nodeId)||(e.from===nodeId&&e.to===crawlState.linkFrom));
  if(!exists){ (c.edges||(c.edges=[])).push({id:uid(), from:crawlState.linkFrom, to:nodeId, label:""}); saveDB(); }
  crawlState.linkFrom = null; drawCrawl(c);
}

function onEdgeClick(c, edgeId){
  const e = (c.edges||[]).find(x=>x.id===edgeId); if(!e) return;
  if(crawlState.linkMode){
    confirmModal("Supprimer ce segment ?", ()=>{ c.edges = c.edges.filter(x=>x.id!==edgeId); saveDB(); drawCrawl(c); });
    return;
  }
  promptModal("Étiquette du segment (ex : « porte verrouillée », « escalier nord ») :", e.label||"", (label)=>{
    e.label = (label||"").trim(); saveDB(); drawCrawl(c);
  });
}

function toggleLinkMode(){
  crawlState.linkMode = !crawlState.linkMode; crawlState.linkFrom = null;
  const c = getEntity("pointcrawl", crawlState.id); if(!c) return;
  const btn = $("#link-toggle");
  if(btn){ btn.classList.toggle("active-mode", crawlState.linkMode); btn.textContent = crawlState.linkMode ? "✓ Liaison active" : "🔗 Mode liaison"; }
  setCrawlHelp(); drawCrawl(c);
}

function openNodeInfo(c, node){
  const ev = getEntity("event", node.eventId);
  if(!ev){
    confirmModal("Cet événement n'existe plus. Retirer ce point du plan ?", ()=>removeNode(c, node.id));
    return;
  }
  openModal(`<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem">
      <h2 style="margin:0;color:var(--gold2)">${esc(ev.title)}</h2>
      <button class="icon-btn" data-modal-close="1">✕</button></div>
    ${eventSectionsHTML(ev, {short:true})}
    <div class="form-actions">
      <button class="btn" data-goto-event="${ev.id}">📖 Ouvrir la fiche complète</button>
      <button class="btn ghost" data-edit-event="${ev.id}">✎ Modifier</button>
      <button class="btn danger" data-remove-node="${node.id}">Retirer du plan</button>
      <button class="btn ghost" data-modal-close="1">Fermer</button>
    </div>`);
}

function removeNode(c, nodeId){
  c.nodes = (c.nodes||[]).filter(n=>n.id!==nodeId);
  c.edges = (c.edges||[]).filter(e=>e.from!==nodeId && e.to!==nodeId);
  saveDB(); drawCrawl(c);
}

function addNodeForEvent(c, eventId, silent){
  const i = (c.nodes||[]).length;
  const x = 40 + (i%5)*190, y = 40 + Math.floor(i/5)*140;
  (c.nodes||(c.nodes=[])).push({id:uid(), eventId, x, y});
  const ev = getEntity("event", eventId);          // classer automatiquement sous le thème du plan
  if(ev && c.title) ev.theme = c.title;
  saveDB(); drawCrawl(c);
  if(!silent) toast(c.title ? `Point ajouté et classé sous « ${c.title} ».` : "Point ajouté au plan.");
}

function openPickEventModal(c){
  const buildList = (filter="")=>{
    const f = filter.toLowerCase();
    const list = db.events.filter(ev=>(ev.title||"").toLowerCase().includes(f));
    return list.length
      ? list.map(ev=>`<div class="mli" data-pick-event="${ev.id}"><b>${esc(ev.title||"Sans titre")}</b><div class="faint" style="font-size:.78rem">${esc(truncate(firstLine(ev.description),70))||"—"}</div></div>`).join("")
      : `<p class="faint" style="font-family:var(--ui)">Aucun événement trouvé. Utilisez « Nouveau point » pour en créer un.</p>`;
  };
  openModal(`<div style="display:flex;justify-content:space-between;align-items:center">
      <h2 style="margin:0;color:var(--gold2)">Ajouter un point existant</h2>
      <button class="icon-btn" data-modal-close="1">✕</button></div>
    <input type="text" id="pick-search" placeholder="Rechercher un événement…" style="margin-top:.7rem" autocomplete="off">
    <div class="modal-list" id="pick-list">${buildList()}</div>`);
  const inp = $("#pick-search"), listEl = $("#pick-list");
  inp.addEventListener("input", ()=>{ listEl.innerHTML = buildList(inp.value); });
  inp.focus();
}

function openNewEventModal(){
  openModal(`<div style="display:flex;justify-content:space-between;align-items:center">
      <h2 style="margin:0;color:var(--gold2)">Créer un point (nouvel événement)</h2>
      <button class="icon-btn" data-modal-close="1">✕</button></div>
    <div class="field" style="margin-top:.6rem"><label>Titre</label><input type="text" id="m-title" placeholder="Salle du trône"></div>
    <div class="field"><label>① Description & ambiance</label><textarea id="m-desc"></textarea></div>
    <div class="field"><label>② Pièges</label><textarea id="m-traps"></textarea></div>
    <div class="field"><label>③ Secrets</label><textarea id="m-secrets"></textarea></div>
    <div class="form-actions"><button class="btn" data-create-event-save="1">✓ Créer & placer</button><button class="btn ghost" data-modal-close="1">Annuler</button></div>`);
  $("#m-title").focus();
}
function createEventFromModal(c){
  const title = $("#m-title").value.trim();
  if(!title){ toast("Le titre est requis."); return; }
  const ev = { id:uid(), title, theme:c.title||"", description:$("#m-desc").value, traps:$("#m-traps").value, secrets:$("#m-secrets").value };
  db.events.push(ev);
  addNodeForEvent(c, ev.id, true);
  closeModal(); toast(c.title ? `Événement créé et classé sous « ${c.title} ».` : "Événement créé et placé sur le plan.");
}
