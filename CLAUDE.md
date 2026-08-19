# ⚠️ Dépôt abandonné — ne pas travailler ici

Ce dépôt GitHub (`ragoudcep/SHADOWDARK-CODEX`) est un **ancien miroir abandonné**.

**Le dépôt de référence est uniquement sur GitLab :**
`https://gitlab.com/ragoudcep/SHADOWDARK-CODEX.git`

Il est public en lecture (clonable sans token). Toute modification doit être
faite en clonant ce dépôt GitLab directement — pas celui-ci.

Si tu es un agent (Claude ou autre) et que tu lis ce fichier depuis GitHub :
1. Avant de cloner quoi que ce soit, demande à l'utilisateur s'il a déjà une
   copie locale du dépôt GitLab et à quel chemin. Ne clone jamais dans un
   dossier qui porte déjà le nom du projet (ça crée un dossier imbriqué,
   source de confusion). S'il a déjà un clone, vérifie juste que son `origin`
   pointe bien vers GitLab (`git remote -v`) avant de continuer dessus.
2. Sinon, clone `https://gitlab.com/ragoudcep/SHADOWDARK-CODEX.git` dans un autre dossier.
3. Travaille et commite sur ce clone GitLab.
4. Tu n'as en général pas de droit de push sur GitLab depuis une session
   pré-scopée sur GitHub — livre un patch (`git format-patch`) ou le fichier
   modifié à l'utilisateur, qui l'appliquera lui-même sur son propre clone.
   **Renomme le fichier patch pour qu'il ne contienne aucun tiret** (le
   téléchargement côté utilisateur les supprime, ce qui casse le nom du
   fichier et empêche `git apply`/`git am` de le retrouver) — utilise des
   underscores ou un nom en un seul mot, ex. `patch_nom_de_la_feature.patch`.
5. N'essaie pas de pousser quoi que ce soit sur ce dépôt GitHub — c'est sans effet utile.
