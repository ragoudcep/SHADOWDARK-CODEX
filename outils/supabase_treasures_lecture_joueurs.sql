-- Table "treasures" — policy de LECTURE JOUEUR à ajouter (l'onglet Armurerie est devenu
-- visible aux joueurs, cf. PLAYER_VISIBLE_TABS dans index.html).
-- À exécuter une seule fois dans l'éditeur SQL du dashboard Supabase du projet.
--
-- La table et sa policy MJ existent déjà (setup initial) : ce script n'ajoute QUE la lecture
-- joueur. Sans lui, un compte joueur ouvre l'Armurerie et n'y voit rien — RLS bloque le select
-- avant même que le filtre applicatif ne s'applique.
--
-- Le filtrage « quels objets un joueur voit » reste applicatif (t.playerVisible, plus la
-- Malédiction masquée en toutes circonstances) : cette policy donne accès à la table, pas un
-- droit de tout afficher. Un joueur curieux qui interrogerait l'API directement verrait donc
-- les objets non partagés — si ce niveau d'étanchéité devient nécessaire, il faudra remonter
-- le filtre dans la policy elle-même (par exemple : using (data->>'playerVisible' = 'true')).

create policy "treasures_player_read" on public.treasures
  for select
  using (auth.uid() is not null);
