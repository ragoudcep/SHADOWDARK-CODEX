# TODO — chantiers ouverts

Ce qui reste à faire, pour repartir avec le même contexte d'une session à l'autre.
Un chantier terminé sort de ce fichier (son historique est dans `git log`).

## Tables aléatoires — recettes de génération

Aujourd'hui, générer un PNJ complet demande de tirer chaque table une par une. Les
générateurs `generateRandomNPC()` et `generateRandomPC()` font déjà exactement ça, mais
**codé en dur** en JS : une série de `rollOnAppTable("…")` assemblée à la main.

Objectif : un bouton « Générer » qui enchaîne les jets de plusieurs tables liées et affiche
un résultat composé, sans passer par du code sur mesure à chaque fois.

Le modèle de données ne sait pas lier des tables entre elles. Les tables multi-colonnes
(`columns` + tirage colonne par colonne) couvrent le cas « plusieurs jets dans **une** table » ;
il manque le cas « plusieurs **tables** enchaînées ».

Piste : un `kind:"recipe"` avec des `steps` (tables référencées) et un `template` de mise en
forme du résultat.

- [ ] Modèle : `kind:"recipe"`, `steps`, `template`
- [ ] Fonction de tirage composé + branchement dans la fiche détail
- [ ] UI de création/édition d'une recette
- [ ] Étendre le vérificateur de liens brisés aux étapes de recette

## Créatures — tag de source

Chaque Cursed Scroll a son bestiaire. Ajouter un champ **`source`** par créature (Livre de
base, Cursed Scroll #1 à #6, futurs suppléments) en plus du flag `manual`/`imported`, qui
distingue homebrew et tiers mais pas *de quel* tiers.

Valeur libre et extensible, pas une liste figée — d'autres bestiaires viendront.

Bloqué tant que le contenu source n'est pas compilé.

## Tables aléatoires — doublons entre sessions concurrentes

`ensure()` (dans `seedCharGenTables()`, `seedShadowdarkDefaultTables()`,
`seedCursedScrollTables()`) déduplique par titre en lisant `db.tables` **en mémoire côté
client**, sans contrainte d'unicité côté serveur. Deux sessions qui démarrent à quelques
secondes d'écart peuvent chacune conclure qu'une table manque et la créer : doublons.

Un nettoyage a déjà été fait une fois, mais la cause demeure.

Options : contrainte SQL `UNIQUE` sur `(data->>'title')` avec `on conflict do nothing` ; ou
un bouton MJ « Vérifier les doublons » dans l'appli, plus simple et cohérent avec le
vérificateur de liens brisés existant.

- [ ] Trancher entre correctif de fond et nettoyage occasionnel

## PJ — caractéristiques structurées (optionnel)

Migrer les caractéristiques vers des scores numériques structurés plutôt que du texte libre.
Améliorerait les calculs automatiques de la fiche, mais demande une migration des données
existantes.
