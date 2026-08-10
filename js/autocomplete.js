/* =========================================================================
   AUTOCOMPLÉTION DES LIENS [[…]]
   Déclencheurs : taper "[[" (mode brackets) ou Ctrl+Espace sur un mot (mode word).
   ========================================================================= */
let ac = { open:false, field:null, mode:null, from:0, to:0, items:[], sel:0 };
const AC_EXCLUDE = new Set(["search","pick-search"]);

function acEntities(){
  const out = [];
  const add = (type,list)=> (list||[]).forEach(o=>{ const nm=entityTitle(type,o); if(nm) out.push({type, name:nm}); });
  add("creature",db.creatures); add("event",db.events); add("table",db.tables);
  add("session",db.sessions); add("pc",db.pcs); add("npc",db.npcs); add("pointcrawl",db.pointcrawls);
  return out;
}

function isLinkField(f){ return f && f.matches && f.matches("textarea, input[type=text]") && !AC_EXCLUDE.has(f.id); }

function openAC(field, query, from, to, mode){
  const q = query.toLowerCase();
  const items = acEntities().filter(it=>it.name.toLowerCase().includes(q))
    .sort((a,b)=>{ const as=a.name.toLowerCase().startsWith(q)?0:1, bs=b.name.toLowerCase().startsWith(q)?0:1; return as-bs || a.name.localeCompare(b.name); });
  if(mode==="word" && !items.length){ closeAC(); toast("Aucune entité ne correspond à ce mot."); return; }
  ac = { open:true, field, mode, from, to, query, items:items.slice(0,8), sel:0 };
  renderAC(); positionAC(field, to);
}
function renderAC(){
  const pop = $("#ac-pop");
  const title = `<div class="ac-title">🔗 Lier une entité</div>`;
  if(!ac.items.length){ pop.innerHTML = title + `<div class="ac-empty">Aucune entité — continuez à taper</div>`; }
  else pop.innerHTML = title + ac.items.map((it,i)=>
      `<div class="aci ${i===ac.sel?"sel":""}" data-ac="${i}"><span class="tag ${it.type}">${TYPE_LABEL[it.type]}</span><span class="nm">${esc(it.name)}</span></div>`
    ).join("") + `<div class="ac-hint">↑↓ naviguer · ⏎/Tab insérer · Échap fermer</div>`;
  pop.classList.add("open");
}
function positionAC(field, caretPos){
  const c = getCaretCoordinates(field, caretPos);
  const r = field.getBoundingClientRect();
  const pop = $("#ac-pop");
  let left = r.left + c.left - field.scrollLeft;
  let top = r.top + c.top - field.scrollTop + c.height + 3;
  left = Math.max(6, Math.min(left, window.innerWidth - 340));
  if(top > window.innerHeight - 150) top = Math.max(6, top - c.height - pop.offsetHeight - 8);
  pop.style.left = left + "px"; pop.style.top = top + "px";
}
function moveAC(delta){ if(!ac.items.length) return; ac.sel = (ac.sel + delta + ac.items.length) % ac.items.length; renderAC(); }
function acceptAC(){
  if(!ac.open || !ac.items.length){ closeAC(); return; }
  const it = ac.items[ac.sel], f = ac.field, v = f.value, insert = `[[${it.name}]]`;
  f.value = v.slice(0, ac.from) + insert + v.slice(ac.to);
  const caret = ac.from + insert.length;
  f.focus(); f.setSelectionRange(caret, caret);
  closeAC();
}
function closeAC(){ ac.open = false; $("#ac-pop").classList.remove("open"); }

function onFieldInput(e){
  const f = e.target;
  if(!isLinkField(f)) return;
  const pos = f.selectionStart;
  const before = f.value.slice(0, pos);
  const m = before.match(/\[\[([^\[\]\n]*)$/);   // "[[" non fermé avant le curseur
  if(m) openAC(f, m[1], m.index, pos, "brackets");
  else if(ac.open && ac.mode==="brackets") closeAC();
}
function acWordTrigger(f){
  const pos = f.selectionStart;
  const before = f.value.slice(0, pos);
  const m = before.match(/([\wÀ-ÿ'’\-]+)$/);
  openAC(f, m ? m[1] : "", m ? pos - m[1].length : pos, pos, "word");
}
function onFieldKeydown(e){
  const f = e.target;
  if(isLinkField(f) && e.ctrlKey && (e.code==="Space" || e.key===" ")){ e.preventDefault(); acWordTrigger(f); return; }
  if(!ac.open) return;
  if(e.key==="ArrowDown"){ e.preventDefault(); moveAC(1); }
  else if(e.key==="ArrowUp"){ e.preventDefault(); moveAC(-1); }
  else if(e.key==="Enter" || e.key==="Tab"){ e.preventDefault(); acceptAC(); }
  else if(e.key==="Escape"){ e.preventDefault(); closeAC(); }
}

document.addEventListener("input", onFieldInput);
document.addEventListener("keydown", onFieldKeydown, true);
document.addEventListener("scroll", ()=>{ if(ac.open) closeAC(); }, true);
document.addEventListener("mousedown", e=>{ if(ac.open && !e.target.closest("#ac-pop") && e.target!==ac.field) closeAC(); });
$("#ac-pop").addEventListener("mousedown", e=>{ const it=e.target.closest("[data-ac]"); if(it){ e.preventDefault(); ac.sel=+it.dataset.ac; acceptAC(); } });

/* Coordonnées du curseur dans un textarea/input (technique du "miroir") */
function getCaretCoordinates(element, position){
  const isInput = element.nodeName === "INPUT";
  const div = document.createElement("div");
  const computed = getComputedStyle(element);
  const s = div.style;
  s.position = "absolute"; s.visibility = "hidden"; s.whiteSpace = "pre-wrap";
  if(!isInput) s.wordWrap = "break-word"; else { s.whiteSpace = "pre"; s.overflow = "hidden"; }
  ["boxSizing","width","height","overflowX","overflowY","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth",
   "paddingTop","paddingRight","paddingBottom","paddingLeft","fontStyle","fontVariant","fontWeight","fontStretch","fontSize",
   "lineHeight","fontFamily","textAlign","textTransform","textIndent","letterSpacing","wordSpacing","tabSize"]
    .forEach(p=>{ s[p] = computed[p]; });
  document.body.appendChild(div);
  div.textContent = element.value.substring(0, position);
  if(isInput) div.textContent = div.textContent.replace(/\s/g, " ");
  const span = document.createElement("span");
  span.textContent = element.value.substring(position) || ".";
  div.appendChild(span);
  const coords = { top: span.offsetTop + parseInt(computed.borderTopWidth), left: span.offsetLeft + parseInt(computed.borderLeftWidth), height: parseInt(computed.lineHeight) || parseInt(computed.fontSize) };
  document.body.removeChild(div);
  return coords;
}
