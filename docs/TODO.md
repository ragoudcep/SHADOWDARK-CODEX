# TODO — Backlog du Codex, par onglet

Mémoire partagée du backlog de chantiers futurs, dictée par Tristan le
2026-08-10. Ce fichier n'est pas un audit (voir `docs/AUDIT.md` pour la
méthode de vérification technique) — c'est la liste de ce qu'il reste à
faire, tab par tab, pour que n'importe quelle session Claude (moi, une
future session, ou « Dual ») reparte avec le même contexte sans que
Tristan ait à tout redicter.

Pas d'implémentation en cours sur ces points — c'est de la prise de notes.
À mettre à jour (cocher, préciser, retirer) au fur et à mesure que ces
chantiers avancent. Seuls les onglets avec un chantier réellement ouvert
figurent ici — les onglets « terminés »/« ne pas toucher » ont été retirés
à la demande de Tristan (2026-08-10) ; leur historique reste dans
`docs/AUDIT.md`.

## Tables aléatoires

**À réorganiser, contenu à revoir.** Certaines tables ont été conçues à
l'origine pour un enchaînement de plusieurs jets qui se combinent (ex :
un d12 puis un d4 dont les deux résultats se composent) — typiquement
toute la génération de PNJ (ascendance, alignement, âge, richesse,
qualités, métier, adjectif, noms par syllabes...), aujourd'hui éclatée en
tables indépendantes qu'il faut tirer une par une.

Envie exprimée : un bouton « Générer » qui lance d'un coup tous les jets
des tables liées à une génération donnée (ex : un PNJ complet) et affiche
un résultat composé final, plutôt que de tirer chaque table séparément.
Implique probablement une notion de « groupe de tables liées » ou de
« recette de génération » qui n'existe pas encore dans le modèle de
données actuel — à concevoir.

## Nuit du 2026-08-12 — classes de Cursed Scroll, à valider au réveil

Tristan a demandé d'implémenter en autonomie tout ce qui est faisable depuis les PDF
"Cursed Scroll" fournis, en mettant du hasard partout où un choix n'était pas clair plutôt
que de bloquer. Liste de ce qu'il faut relire/trancher (détail technique dans
`docs/AUDIT.md`, section « Session de nuit ») :

- **Tables de Mentor (Ensorceleur) pas dans l'onglet Tables aléatoires**, contrairement à
  l'idée que Tristan avait évoquée — le composant de table générique afficherait un badge
  « d5 » trompeur (tranches 2d6 irrégulières, pas un dé uniforme). Laissées uniquement dans
  la fiche du PJ concerné. À confirmer : ce choix convient, ou il faut un affichage dédié
  dans Tables aléatoires malgré tout ?
- **Catastrophes diaboliques**, **Origines diaboliques** et les **46 sorts de sorcière**
  (Cursed Scroll #1) sont documentés dans `docs/REGLES-CREATION-PERSONNAGE.md` mais **pas
  implémentés** cette nuit (hors scope initial : juste les 3 classes + mentors).
- (Cette section sera complétée au fil de la nuit avec ce qui est trouvé dans Cursed Scroll
  #2 à #6 — classes ajoutées, valeurs mises au hasard faute de certitude, etc.)
