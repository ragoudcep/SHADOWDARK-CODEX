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

## Filtre "mes créations" (idée, pas encore demandée fermement)

Le marqueur "créé par le MJ" existe déjà par fiche (bouton dans les actions
de détail, voir `docs/AUDIT.md`, 2026-08-11). Tristan a évoqué vouloir,
plus tard, un bouton global (en-tête ?) pour filtrer les listes et
n'afficher que ce qu'il a lui-même marqué "créé par le MJ", en excluant
tout le reste (import en masse, génération aléatoire, contenu IA non
qualifié). Pas encore implémenté — présenté par lui comme une idée pour
plus tard, pas une demande immédiate. La donnée existe déjà, ce sera
uniquement un filtre à ajouter dans chaque `list*()` (ou une fonction
partagée) le moment venu.
