/* =========================================================================
   TO-DO MJ — pense-bête libre, réservé au MJ (jamais dans PLAYER_VISIBLE_TABS,
   aucune policy de lecture joueur côté Supabase). Liste plate de notes texte
   + case à cocher fait/pas fait, sans catégories ni priorités ni dates (v1
   volontairement minimale, demandée par Tristan) — pas de page détail/edit
   dédiée, tout se fait en place dans la liste, comme Initiative/Roue.
   ========================================================================= */
function addGmNote(text){
  const t = (text||"").trim();
  if(!t) return;
  db.gmnotes.unshift({ id:uid(), text:t, done:false });
  saveDB(); renderList();
}
function toggleGmNote(id){
  const n = db.gmnotes.find(x=>x.id===id); if(!n) return;
  n.done = !n.done;
  saveDB(); renderList();
}
function editGmNote(id){
  const n = db.gmnotes.find(x=>x.id===id); if(!n) return;
  promptModal("Modifier la note :", n.text, text=>{
    const t = (text||"").trim();
    if(!t) return;
    n.text = t;
    saveDB(); renderList();
  });
}
function removeGmNote(id){ deleteEntity("gmnote", id); renderList(); }

function listGmNotes(){
  const items = db.gmnotes;
  const pending = items.filter(n=>!n.done);
  const done = items.filter(n=>n.done);

  const head = `<div class="page-head">
    <div><h1>To-do MJ</h1><div class="sub">${items.length} note(s)${done.length ? `, ${done.length} faite(s)` : ""}</div></div>
    <div class="hbtns"><button class="btn" data-gmnote-add="1">✦ Nouvelle note</button></div>
  </div>`;

  if(!items.length){
    app.innerHTML = head + emptyState("📝", "Aucune note pour l'instant — notez ici ce que vous voulez préparer ou ne pas oublier.");
    return;
  }

  const rowHTML = n => `<div class="gmnote-row${n.done ? " gmnote-row-done" : ""}">
    <input type="checkbox" class="gmnote-check" data-gmnote-toggle="${n.id}" ${n.done ? "checked" : ""}>
    <div class="gmnote-text" data-gmnote-edit="${n.id}" title="Cliquer pour modifier">${esc(n.text)}</div>
    <div class="gmnote-controls">
      <button class="btn ghost sm" data-gmnote-edit="${n.id}" title="Modifier">✎</button>
      <button class="btn danger sm" data-gmnote-del="${n.id}" title="Supprimer">🗑</button>
    </div>
  </div>`;

  const body = `<div class="gmnote-list">
    ${pending.map(rowHTML).join("")}
    ${done.length ? `<div class="init-group-label">Faites</div>${done.map(rowHTML).join("")}` : ""}
  </div>`;

  app.innerHTML = head + body;
}
