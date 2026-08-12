-- Table "cursedscrolledits" — corrections manuelles du MJ sur le contenu de l'onglet
-- "Cursed Scroll" (js/cursedscroll.js). À exécuter une seule fois dans l'éditeur SQL
-- du dashboard Supabase du projet.
--
-- Contenu : un seul enregistrement (même modèle que "wheel"), qui stocke des
-- surcharges texte/suppressions par numéro (origines, catastrophes, sorts, trésors,
-- bienfaits de mentor) — jamais le contenu de base lui-même, qui reste dans le JS.
-- N'a AUCUNE policy de lecture joueur, comme "gmnotes" : l'onglet Cursed Scroll est
-- strictement réservé au MJ (jamais dans PLAYER_VISIBLE_TABS côté JS), donc même un
-- compte joueur authentifié ne doit jamais pouvoir lire cette table.
-- id en uuid, comme les autres tables (uid() côté JS utilise crypto.randomUUID()).

create table if not exists public.cursedscrolledits (
  id uuid primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.cursedscrolledits enable row level security;

-- Le MJ (profiles.role = 'gm') a un accès complet : lecture, création, modification, suppression.
create policy "cursedscrolledits_gm_all" on public.cursedscrolledits
  for all
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'gm')
  )
  with check (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'gm')
  );

-- Volontairement PAS de policy "cursedscrolledits_player_read" : sans policy de lecture
-- pour les joueurs, RLS bloque par défaut tout accès en lecture à un compte non-MJ.
