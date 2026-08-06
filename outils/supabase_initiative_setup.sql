-- Table "initiative" — suivi de combat en direct (participants PJ / créature / libre)
-- À exécuter une seule fois dans l'éditeur SQL du dashboard Supabase du projet.
-- Reprend le même modèle de policies (MJ CRUD complet / joueur lecture seule) que
-- les tables "hexmaps" et "spells" déjà en place (voir docs/AUDIT.md, ledger Supabase).
-- id en uuid (et non text) : confirmé en testant en direct contre le projet Supabase
-- réel que les tables existantes (creatures, pcs...) rejettent les id non-UUID
-- (erreur Postgres 22P02) — la fonction uid() du code JS utilise crypto.randomUUID()
-- dans tous les navigateurs modernes, donc les id générés sont toujours des UUID valides.

create table if not exists public.initiative (
  id uuid primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.initiative enable row level security;

-- Le MJ (profiles.role = 'gm') a un accès complet : lecture, création, modification, suppression.
create policy "initiative_gm_all" on public.initiative
  for all
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'gm')
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'gm')
  );

-- Les comptes joueurs connectés ont un accès en lecture seule (timeline visible en direct).
create policy "initiative_player_read" on public.initiative
  for select
  using (auth.uid() is not null);
