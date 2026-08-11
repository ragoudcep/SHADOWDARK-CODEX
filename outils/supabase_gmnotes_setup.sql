-- Table "gmnotes" — to-do / pense-bête libre du MJ (onglet "To-do MJ")
-- À exécuter une seule fois dans l'éditeur SQL du dashboard Supabase du projet.
--
-- Contrairement à TOUTES les autres tables de l'appli (hexmaps, spells, initiative,
-- wheel, dungeonmaps...), celle-ci n'a AUCUNE policy de lecture joueur : c'est un
-- onglet strictement réservé au MJ (jamais dans PLAYER_VISIBLE_TABS côté JS), donc
-- même un compte joueur authentifié ne doit jamais pouvoir lire cette table.
-- id en uuid, comme les autres tables (uid() côté JS utilise crypto.randomUUID()).

create table if not exists public.gmnotes (
  id uuid primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.gmnotes enable row level security;

-- Le MJ (profiles.role = 'gm') a un accès complet : lecture, création, modification, suppression.
create policy "gmnotes_gm_all" on public.gmnotes
  for all
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'gm')
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'gm')
  );

-- Volontairement PAS de policy "gmnotes_player_read" : sans policy de lecture pour
-- les joueurs, RLS bloque par défaut tout accès en lecture à un compte non-MJ.
