-- Table "wheel" — configuration de la roue de la fortune (bonus à gagner, onglet "Roue")
-- À exécuter une seule fois dans l'éditeur SQL du dashboard Supabase du projet.
-- Reprend le même modèle de policies (MJ CRUD complet / joueur lecture seule) que
-- "hexmaps", "spells" et "initiative" déjà en place (voir docs/AUDIT.md, ledger Supabase).
-- Un seul enregistrement en pratique (la liste des bonus définis par le MJ) : le tirage
-- lui-même reste 100% local à chaque client, aucune table d'état de tirage partagé.
-- id en uuid, comme les autres tables (uid() côté JS utilise crypto.randomUUID()).

create table if not exists public.wheel (
  id uuid primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.wheel enable row level security;

-- Le MJ (profiles.role = 'gm') a un accès complet : lecture, création, modification, suppression.
create policy "wheel_gm_all" on public.wheel
  for all
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'gm')
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'gm')
  );

-- Les comptes joueurs connectés ont un accès en lecture seule (ils font tourner la roue
-- côté client, mais ne peuvent pas modifier la liste des bonus).
create policy "wheel_player_read" on public.wheel
  for select
  using (auth.uid() is not null);
