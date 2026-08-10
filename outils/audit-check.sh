#!/usr/bin/env bash
# Vérifications mécaniques rapides pour l'audit du Codex.
# Usage : ./audit-check.sh /chemin/vers/index.html
set -euo pipefail
F="${1:-index.html}"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

tr -d '\r' < "$F" > "$TMP/full.html"

echo "== 1. Syntaxe JS (chaque bloc <script>) =="
# Les <script src="..."></script> externes (modularisation, docs/MODULARISATION.md) tiennent sur
# une seule ligne et n'ont rien à vérifier ici (pas de JS inline) — on les VIDE (ligne blanche, pas
# supprimée, pour ne pas décaler la numérotation des lignes réelles) avant de chercher les blocs
# <script>...</script> à vérifier, sinon leur </script> se retrouve compté sans open correspondant
# (décale l'appariement de tous les blocs suivants), ou pire, une ligne comme ça tombant PILE entre
# un vrai open et un vrai close se retrouve incluse dans le bloc extrait (faux positif d'erreur).
sed -E 's#<script[^>]*>.*</script>##' "$TMP/full.html" > "$TMP/noext.html"
awk '/<script>/{print NR} /<\/script>/{print NR}' "$TMP/noext.html" | paste - - | while read -r start end; do
  sed -n "$((start+1)),$((end-1))p" "$TMP/full.html" > "$TMP/block_$start.js"
  if node --check "$TMP/block_$start.js" 2>"$TMP/err_$start.txt"; then
    echo "  bloc ligne $start-$end : OK"
  else
    echo "  bloc ligne $start-$end : ERREUR"
    cat "$TMP/err_$start.txt"
  fi
done

echo "== 2. Équilibre des accolades CSS (chaque bloc <style>) =="
python3 - "$TMP/full.html" <<'EOF'
import re, sys
txt = open(sys.argv[1], encoding='utf-8', errors='replace').read()
for i, m in enumerate(re.finditer(r'<style>(.*?)</style>', txt, re.S), 1):
    css = m.group(1)
    o, c = css.count('{'), css.count('}')
    status = "OK" if o == c else "DESEQUILIBRE"
    print(f"  bloc style #{i} : open={o} close={c} -> {status}")
EOF

echo "== 3. Déclarations dupliquées (function/const/let de premier niveau) =="
dup_f=$(grep -oP '^function \w+' "$TMP/full.html" | sort | uniq -c | sort -rn | awk '$1>1')
dup_c=$(grep -oP '^(const|let) \w+' "$TMP/full.html" | sort | uniq -c | sort -rn | awk '$1>1')
if [ -z "$dup_f$dup_c" ]; then echo "  aucune"; else echo "$dup_f"; echo "$dup_c"; fi

echo "== 4. Cohérence du ledger de collections =="
echo "  DB_COLS   : $(grep -oP 'const DB_COLS = \[[^]]+\]' "$TMP/full.html")"
echo "  TABS      : $(grep -oP 'const TABS = \[[^]]+\]' "$TMP/full.html")"
echo "  emptyDB() : $(grep -oP 'const emptyDB = \(\) => \(\{[^}]+\}\)' "$TMP/full.html")"
echo "  (vérifier à l'oeil que les 3 listes contiennent exactement les mêmes noms)"

echo "== 5. Restes de debug =="
n=$(grep -c "console\.\(log\|debug\)\|debugger;" "$TMP/full.html" || true)
echo "  occurrences console.log/debugger dans tout le fichier : $n"

echo "== Fait. =="
