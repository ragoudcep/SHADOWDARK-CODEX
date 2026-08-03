# Grimoire — Gestionnaire de campagne Shadowdark

Application web autonome (une seule page HTML) permettant de gérer une campagne de jeu de rôle **Shadowdark** : sessions, événements, tables aléatoires, point crawls, créatures, PJ, PNJ et trésors.

## Aperçu

Le Grimoire est un carnet de campagne numérique, pensé pour un MJ qui veut centraliser tout son contenu de campagne sans dépendre d'un service en ligne. Tout tourne dans le navigateur, sans backend ni compte à créer.

## Fonctionnalités

- **Sessions** : journal de séances, avec entrées datées et notes.
- **Tables aléatoires** : tables à jets de dés (rencontres, événements, butin…) avec tirage intégré.
- **Événements** : modules de scènes réutilisables (description, pièges, secrets, informations accessibles), regroupables par thème.
- **Point Crawl** : éditeur de carte de voyage par points reliés (nœuds déplaçables, liens entre lieux), avec export PDF imprimable.
- **Créatures** : blocs de statistiques complets (caractéristiques, CA, PV, attaques, capacités), triables et filtrables par catégorie.
- **PJ** : fiches des personnages joueurs (ascendance, classe, compétences, sorts, inventaire, talents).
- **PNJ** : fiches de personnages non-joueurs (apparence, objectifs, moyens, comportement).
- **Trésor** : trouvailles, reliques et régalias.
- **Liens croisés `[[Nom]]`** : toute entité peut être référencée dans un texte via `[[Nom de l'entité]]`, générant un lien cliquable et un système de rétroliens (backlinks) automatique.
- **Recherche globale** dans toutes les entités.
- **Images** : ajout d'illustrations sur les créatures et PNJ, avec galerie et visionneuse.
- **Export / Import JSON** : sauvegarde et restauration complètes des données de campagne.

## Utilisation

L'application ne nécessite aucune installation ni build : ouvrez simplement `index.html` dans un navigateur.

```bash
open index.html      # macOS
xdg-open index.html  # Linux
```

Les données sont conservées automatiquement dans le `localStorage` du navigateur. Pensez à utiliser le bouton **Export** régulièrement pour sauvegarder votre campagne dans un fichier JSON (utile avant de vider le cache du navigateur ou pour transférer les données vers un autre appareil).

## Stack technique

- HTML/CSS/JavaScript vanilla, sans dépendance ni framework.
- Persistance via `localStorage` (aucune donnée envoyée à un serveur).
- Rendu entièrement côté client, en une seule page.

## Structure du dépôt

```
index.html   # application complète (structure, style et logique)
README.md    # ce fichier
```
