# Modularisation du Codex — état et suite

`index.html` contenait à l'origine tout le projet (~1 Mo). Le découpage l'a ramené à ~370 Ko.
Ce fichier dit où en est le chantier et comment continuer sans casser l'existant.

## Déjà extrait

| Cible | Contenu |
|---|---|
| `fonts/*.woff2` | polices (étaient en base64 inline) |
| `vendor/supabase.min.js` | librairie Supabase |
| `icons.svg` | planche d'icônes, référencée en `<use>` cross-fichier |
| `style.css` | tout le CSS |
| `js/` | `modal`, `autocomplete`, `search`, `importexport`, `xml-generic`, `initiative`, `wheel`, `pointcrawl`, `hexcrawl`, `dungeonmaps`, `gmnotes`, `cursedscroll` |

## Ce qui reste inline dans `index.html`

- Les entités **éclatées en plusieurs zones** du fichier (Événements, Tables, Créatures, PNJ,
  Sessions, PJ, Trésor, Sorts). Chacune demande de **rassembler** des fonctions dispersées, pas
  de couper un bloc contigu — d'où le report.
- L'import XML historique des créatures (le générique est déjà dans `js/xml-generic.js`).
- Les fonctions d'impression PDF partagées.
- Le noyau partagé et le démarrage (`startApp`), **à extraire en dernier** : tout en dépend.

## Règles à respecter pour continuer

- **Pas de modules ES**, pas de bundler : les fichiers sont chargés par des `<script src>`
  successifs et partagent une seule portée globale. Une fonction de `js/hexcrawl.js` est visible
  depuis `index.html` sans import.
- **L'ordre de chargement compte** pour les instructions exécutées au chargement (`let db =
  emptyDB();` a besoin de `emptyDB`), pas pour les `function` (remontées). En pratique : les
  modules d'abord, le démarrage en dernier.
- **Une étape = un commit testé.** Le découpage se fait par extractions successives vérifiées
  dans le navigateur, jamais en une réécriture globale.
- Après extraction, `./outils/audit-check.sh index.html` détecte les déclarations restées en
  double des deux côtés.
