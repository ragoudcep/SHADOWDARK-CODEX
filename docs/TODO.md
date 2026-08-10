# TODO — Backlog du Codex, par onglet

Mémoire partagée du backlog de chantiers futurs, dictée par Tristan le
2026-08-10. Ce fichier n'est pas un audit (voir `docs/AUDIT.md` pour la
méthode de vérification technique) — c'est la liste de ce qu'il reste à
faire, tab par tab, pour que n'importe quelle session Claude (moi, une
future session, ou « Dual ») reparte avec le même contexte sans que
Tristan ait à tout redicter.

Pas d'implémentation en cours sur ces points — c'est de la prise de notes.
À mettre à jour (cocher, préciser, retirer) au fur et à mesure que ces
chantiers avancent.

## Carnet de route + Sessions

**À fusionner.** Tristan ne voit pas de raison d'avoir des notes de
session et un carnet de route séparés — ce sont globalement la même
chose. À terme, une seule fonctionnalité unifiée à la place des deux
onglets actuels. Réflexion à avoir sur laquelle des deux structures de
données garder (ou une troisième, fusionnée) avant de coder quoi que ce
soit.

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

## Événements

**Ne pas toucher pour l'instant.** Note perso de Tristan : il n'utilise
quasiment jamais cet onglet. Fusion ou suppression possible dans le futur,
mais pas une priorité actuelle — ne rien entreprendre dessus sans qu'il le
redemande explicitement.

## Point Crawl

**Jugé parfait tel quel.** Seul ajout souhaité : pouvoir catégoriser/
donner un statut à chaque point crawl (ex : *en cours* / *en création* /
*déjà créé*) pour s'y retrouver dans l'avancement de plusieurs point
crawls en parallèle. Probablement un simple champ `status` (ou équivalent)
sur l'entité point crawl, avec un badge/filtre dans la liste.

## Créatures

**Ne pas toucher le fonctionnement actuel.** Ajout souhaité : sélectionner
plusieurs créatures et les exporter en PDF sous forme de cartes au format
63×88mm (format carte à jouer) — recto : nom + illustration si disponible
(la plupart des créatures n'en ont pas), verso : toutes les infos
textuelles (stats, capacités, etc.). Probablement réutilisable/à
rapprocher du système d'export PDF des PJ déjà existant (une page A4 par
personnage) — voir comment il gère la mise en page recto/verso avant de
partir de zéro.

## Sorts, PJ, PNJ

**Rien à changer pour l'instant.** Des chantiers PDF/impression côté PNJ
existent déjà ailleurs dans le backlog personnel de Tristan (hors de ce
fichier) — pas la peine de dupliquer/anticiper ici, ils seront dictés en
temps voulu.

## Trésor

**Contenu à compléter par Tristan lui-même** — pas une tâche de
développement. Rien à faire côté code.

## Hexcrawl

**Rotation des images de biome/overlay corrigée (2026-08-10), reste à confirmer à l'écran.**
Les images de fond (biome + overlay `foundation_*.png`) posées sur les hexagones étaient tournées de
90° pour passer de leur orientation naturelle « flat-top » à la cellule « pointy-top » de la grille,
ce qui faisait paraître leur contenu (arbres, chemins…) complètement sur le côté. Changé pour une
rotation de 30° à la place (`hexBiomeImageSVG()`) — un hexagone a une symétrie à 60°, donc 30° comme
90° alignent tous les deux le contour de l'image sur la cellule sans débordement, mais 30° tourne le
contenu bien moins loin de son orientation d'origine. Pas de solution parfaitement horizontale
possible (contrainte géométrique de la forme hexagonale, reconnue par Tristan), mais nettement moins
vertical qu'avant. La grille elle-même (`hexCorners`, `hexCenter`, orientation flat-top vs
pointy-top) n'a pas été touchée — seul l'angle de rotation des images l'a été, un changement bien plus
contenu que la piste de réorientation complète de la grille envisagée initialement ci-dessus.
**Non vérifié en jeu réel** : comparé visuellement dans un navigateur avec une image de test
(volcano/greenlands) pendant le développement, mais à confirmer par toi sur de vraies cartes.
Les icônes de point d'intérêt (`buildHexPoints()`, marqueurs `!`/icônes SVG posés par-dessus la
grille) ne sont, elles, pas concernées : elles ne portent aucune rotation, seules les images de fond
de cellule l'étaient.

## Cartes de donjon

**Terminé.** Tristan est très satisfait du résultat actuel (pinceau,
polygone, aperçu joueur, brouillard inversé, remplacement d'image). Rien
à faire tant qu'il ne signale rien de nouveau.

## Initiative

**Ne pas toucher.**

## Roue

L'animation du coffre (mode « coffre » de la révélation de bonus) ne
ressemble pas encore assez à un vrai coffre visuellement — apparence à
retravailler à l'occasion (pas urgent). Le mécanisme fonctionnel (tirage,
easter egg) n'est pas en cause, seulement le rendu visuel de l'animation.
