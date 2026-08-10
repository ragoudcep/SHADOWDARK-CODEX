/* =========================================================================
   RECHERCHE GLOBALE
   ========================================================================= */
function levenshtein(a,b){
  const m=a.length,n=b.length;
  if(!m) return n; if(!n) return m;
  const dp = [];
  for(let i=0;i<=m;i++) dp.push(new Array(n+1).fill(0));
  for(let i=0;i<=m;i++) dp[i][0]=i;
  for(let j=0;j<=n;j++) dp[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){
    dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1]);
  }
  return dp[m][n];
}
function fuzzyFind(hay, q){
  if(q.length<3) return null;
  const words = hay.split(/\W+/).filter(Boolean);
  const threshold = q.length<=4?1:(q.length<=8?2:3);
  let best=null;
  for(const w of words){
    if(Math.abs(w.length-q.length) > threshold) continue;
    const d = levenshtein(w,q);
    if(d>0 && d<=threshold && (!best || d<best.d)) best = {d, word:w};
  }
  if(!best) return null;
  return {index: hay.indexOf(best.word)};
}
function runSearch(q){
  const box = $("#search-results");
  q = q.trim().toLowerCase();
  if(!q){ box.classList.remove("open"); box.innerHTML=""; return; }
  const results = [];
  const push = (type, o)=>{
    const hay = entityText(type,o).toLowerCase();
    let idx = hay.indexOf(q), fuzzy = false;
    if(idx<0 && !q.includes(" ")){
      const f = fuzzyFind(hay,q);
      if(f){ idx = f.index; fuzzy = true; }
    }
    if(idx>=0) results.push({type,id:o.id,title:entityTitle(type,o),snippet:snippet(entityText(type,o),q),fuzzy});
  };
  db.creatures.forEach(o=>push("creature",o));
  db.events.forEach(o=>push("event",o));
  db.tables.forEach(o=>push("table",o));
  db.sessions.forEach(o=>push("session",o));
  db.npcs.forEach(o=>push("npc",o));
  db.pointcrawls.forEach(o=>push("pointcrawl",o));
  db.pcs.forEach(o=>push("pc",o));
  db.treasures.forEach(o=>push("treasure",o));
  db.spells.forEach(o=>push("spell",o));
  results.sort((a,b)=>(a.fuzzy===b.fuzzy)?0:(a.fuzzy?1:-1));
  if(!results.length){ box.innerHTML = `<div class="sr-empty">Aucun résultat pour « ${esc(q)} »</div>`; box.classList.add("open"); return; }
  box.innerHTML = results.slice(0,25).map(r=>`
    <div class="sr-item" data-goto="${r.type}:${r.id}">
      <span class="tag ${r.type}">${TYPE_LABEL[r.type]}</span>
      <b style="margin-left:.4rem">${esc(r.title||"—")}</b>${r.fuzzy?' <span class="faint" style="font-size:.72rem">(≈ approximatif)</span>':''}
      <div class="faint" style="font-size:.78rem;margin-top:.15rem">${esc(r.snippet)}</div>
    </div>`).join("");
  box.classList.add("open");
}
function snippet(text,q){
  const t = String(text||"").replace(/\s+/g," ");
  const i = t.toLowerCase().indexOf(q);
  if(i<0) return t.slice(0,80);
  const start = Math.max(0,i-30);
  return (start>0?"…":"") + t.slice(start, i+q.length+40) + "…";
}
