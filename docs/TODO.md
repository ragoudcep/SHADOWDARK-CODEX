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

## PJ — édition de classe a posteriori

**Note de backlog, pas encore un chantier lancé.** Tristan a créé des PJ
avant que les catégories de classe (magicien, voleur, guerrier, prêtre)
n'existent dans l'appli. Ces PJ n'ont donc pas de classe associée, ce qui
laisse des cases vides dans leur table de talents à certains niveaux
(évolutions de talents qui dépendent de la classe, jamais renseignées
puisque la classe n'était pas connue au moment de la création).

Envie exprimée : pouvoir revenir sur un PJ existant et lui (ré)assigner
une classe après coup (ex : un guerrier requalifié en magicien, ou
l'inverse), et que ce changement mette à jour automatiquement sa table de
talents selon les règles de la classe choisie, telles que décrites dans
[`docs/REGLES-CREATION-PERSONNAGE.md`](REGLES-CREATION-PERSONNAGE.md)
(section « Classes », jets de talents 2d6 par classe).

À concevoir : l'édition de classe d'un PJ déjà créé (aujourd'hui la classe
n'est probablement fixée qu'à la création), et la logique de
recalcul/complétion de la table de talents quand la classe change.
