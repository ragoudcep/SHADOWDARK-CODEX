# Codex — Gestionnaire de campagne Shadowdark

Application web (une seule page HTML) permettant de gérer une campagne de jeu de rôle **Shadowdark** : sessions, événements, tables aléatoires, point crawls, créatures, PJ, PNJ, trésors, sorts et hexcrawl.

Live : https://ragoudcep.github.io/SHADOWDARK-CODEX/ 

## Aperçu

Le Codex est un carnet de campagne numérique partagé entre le MJ et les joueuses, avec des comptes séparés (MJ / joueuse) et une synchronisation en temps réel via Supabase. Le MJ a accès à tous les modules ; les joueuses voient uniquement le Carnet de route, le Hexcrawl et les Sorts.

## Fonctionnalités

- **Sessions** : journal de séances, avec entrées datées et notes.
- **Tables aléatoires** : tables à jets de dés (rencontres, événements, butin…) avec tirage intégré, y compris les tables générées automatiquement pour la création de personnage.
- **Événements** : modules de scènes réutilisables (description, pièges, secrets, informations accessibles), regroupables par thème.
- **Point Crawl** : éditeur de carte de voyage par points reliés (nœuds déplaçables, liens entre lieux), avec export PDF imprimable.
- **Créatures** : blocs de statistiques complets (caractéristiques, CA, PV, attaques, capacités), triables et filtrables par catégorie.
- **Sorts** : bibliothèque de sorts filtrable par classe (Prêtre, Magicien, Augure, Sorcier) et par rang, visible des joueuses.
- **PJ** : fiches des personnages joueurs (ascendance, classe, compétences, sorts, inventaire, talents, portrait), avec un générateur aléatoire complet (règles Quickstart p.12-31) et un export PDF imprimable (une page A4 par personnage).
- **PNJ** : fiches de personnages non-joueurs (apparence, objectifs, moyens, comportement, statistiques de combat, portrait), avec un générateur aléatoire simplifié (1 chance sur 6 d'être lanceur de sorts).
- **Portraits** : bibliothèque partagée de petites illustrations (format carte) assignables aux PJ/PNJ, manuellement ou par pioche aléatoire — une même image ne peut jamais être utilisée par deux fiches à la fois.
- **Hexcrawl** : carte hexagonale avec brouillard de guerre, biomes peints, points d'intérêt (visibilité MJ/joueuses configurable).
- **Cartes de donjon** : plans de donjon (image) avec brouillard de guerre par patchs rectangulaires que le MJ pose/déplace/retire ; plusieurs cartes préparables à l'avance, une seule affichée aux joueuses à la fois.
- **Trésor** : trouvailles, reliques et régalias, avec bonus/atout/malédiction/personnalité pour les objets magiques.
- **Carnet de route** : journal partagé visible des joueuses.
- **Liens croisés `[[Nom]]`** : toute entité peut être référencée dans un texte via `[[Nom de l'entité]]`, générant un lien cliquable et un système de rétroliens (backlinks) automatique, avec un vérificateur de liens brisés.
- **Recherche globale** dans toutes les entités (MJ uniquement).
- **Images** : illustrations libres sur les créatures, PJ et PNJ, en plus des portraits de la bibliothèque partagée.
- **Import/Export XML** par module (sorts, objets magiques, PNJ, tables, point crawls) et **Export/Import JSON** complet de la campagne.

## Utilisation

L'application ne nécessite aucune installation ni build côté lecture : ouvrez `index.html` dans un navigateur, ou visitez la version en ligne ci-dessus. Les données sont stockées côté Supabase (compte requis, inscriptions publiques désactivées) et synchronisées entre le MJ et les joueuses.

## Stack technique

- HTML/CSS/JavaScript vanilla, sans build ni framework.
- Persistance et authentification via Supabase (Postgres + Auth + Row Level Security), un compte par joueuse/MJ, rôle stocké dans `profiles.role`.
- Rendu entièrement côté client, en une seule page.

## Structure du dépôt

```
index.html            # application complète (structure, style et logique)
README.md             # ce fichier
portraits/             # bibliothèque de portraits compressés (webp) + manifest.json — référencée par l'appli
1-foundation_*.png…    # tuiles de base du Hexcrawl (à la racine, chemins en dur dans le code — ne pas déplacer)
deadlands/, drylands/,
greenlands/, icelands/,
sandlands/, Neutre/     # variantes de biomes du Hexcrawl (idem, chemins en dur)

docs/                   # documentation interne
  AUDIT.md                — méthode d'audit du code + journal des passages
  REGLES-CREATION-PERSONNAGE.md — référence des règles utilisées par les générateurs PJ/PNJ

outils/                 # scripts utilitaires
  audit-check.sh           — vérifications mécaniques rapides (voir docs/AUDIT.md)
  compress-portraits.py    — compression en ligne de commande d'un lot de portraits (nécessite Python + Pillow)
  portraits-compresseur.html — même chose, 100% dans le navigateur, sans installation

sources/                # matériel source déjà intégré à l'appli (non nécessaire en production, non commité pour la plupart)
  regles/                  — PDF du Quickstart et des cartes de sorts/objets magiques
  imports-deja-integres/   — XML générés à partir des PDF, déjà importés dans Supabase
  hexcrawl/                — JSON source de la carte hexagonale
  portraits-brutes/        — images originales avant compression (les .webp compressés sont dans portraits/)
  police-jsl-blackletter/  — police du titre (déjà intégrée en base64 dans index.html)
```
