/* Fenêtres modales génériques */
function openModal(html){ const m=$("#modal"); m.querySelector(".modal-box").innerHTML = html; m.classList.remove("hidden"); }
function closeModal(){ _modalCb = null; $("#modal").classList.add("hidden"); $("#modal").querySelector(".modal-box").innerHTML=""; }

/* Confirmation / saisie internes (remplacent confirm()/prompt(), bloqués dans le sandbox des artefacts) */
let _modalCb = null;
function confirmModal(message, onYes){
  _modalCb = onYes;
  openModal(`<p style="font-family:var(--ui);font-size:.95rem;margin:.2rem 0 1.1rem;line-height:1.5">${esc(message)}</p>
    <div class="form-actions" style="margin-top:0">
      <button class="btn danger" data-modal-yes="1">Confirmer</button>
      <button class="btn ghost" data-modal-close="1">Annuler</button>
    </div>`);
}
function promptModal(message, defVal, onOk){
  _modalCb = onOk;
  openModal(`<p style="font-family:var(--ui);font-size:.95rem;margin:.2rem 0 .6rem;line-height:1.5">${esc(message)}</p>
    <input type="text" id="modal-prompt-input" value="${esc(defVal||"")}" autocomplete="off">
    <div class="form-actions">
      <button class="btn" data-modal-ok="1">Valider</button>
      <button class="btn ghost" data-modal-close="1">Annuler</button>
    </div>`);
  setTimeout(()=>{ const i=$("#modal-prompt-input"); if(i){ i.focus(); i.select();
    i.addEventListener("keydown", ev=>{ if(ev.key==="Enter"){ ev.preventDefault(); const cb=_modalCb; const v=i.value; closeModal(); if(cb) cb(v); } });
  } }, 30);
}
