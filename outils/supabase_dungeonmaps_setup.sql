-- Table "dungeonmaps" — cartes de donjon avec brouillard de guerre (onglet "Cartes de donjon")
-- À exécuter une seule fois dans l'éditeur SQL du dashboard Supabase du projet.
-- Reprend le même modèle de base (MJ CRUD complet / joueur lecture seule) que "hexmaps",
-- "spells", "initiative" et "wheel" déjà en place (voir docs/AUDIT.md, ledger Supabase),
-- id en uuid (uid() côté JS utilise crypto.randomUUID()).
--
-- DIFFÉRENCE IMPORTANTE avec les autres tables : le MJ peut préparer plusieurs cartes à
-- l'avance (une par ligne), mais une seule doit jamais être vue par les joueurs (la carte
-- "active", data->>'active' = 'true'). Une policy de lecture joueur classique ("select si
-- connecté") donnerait accès à TOUTES les lignes, y compris les cartes pas encore montrées —
-- un joueur ouvrant les devtools verrait alors dans la réponse réseau des plans de donjon
-- que le MJ n'a pas encore révélés, ce qui casse l'intérêt même du brouillard de guerre.
-- La policy ci-dessous filtre donc directement sur le contenu du jsonb : une carte non
-- active n'est jamais renvoyée à un compte joueur, quel que soit ce que fait le client JS.

create table if not exists public.dungeonmaps (
  id uuid primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.dungeonmaps enable row level security;

-- Le MJ (profiles.role = 'gm') a un accès complet à toutes les cartes, actives ou non.
create policy "dungeonmaps_gm_all" on public.dungeonmaps
  for all
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'gm')
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'gm')
  );

-- Les comptes joueurs connectés ne voient QUE la carte actuellement active.
create policy "dungeonmaps_player_read_active" on public.dungeonmaps
  for select
  using (
    auth.uid() is not null
    and (data->>'active')::boolean is true
  );
