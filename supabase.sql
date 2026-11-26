-- ondepagarcomcripto: tabela de lugares enviados pela comunidade.
-- Rode este arquivo uma vez no Supabase: SQL Editor > New query > colar > Run.
--
-- Como funciona:
--  * qualquer visitante pode ENVIAR um cadastro (entra como "pending");
--  * o site só LÊ os cadastros com status "approved";
--  * você aprova no painel: Table Editor > places > mudar status para "approved"
--    (e, se quiser, marcar verified = true e corrigir lat/lng).

create table if not exists public.places (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  verified    boolean not null default false,
  country     text not null default 'py' check (country in ('py', 'br')),
  name        text not null check (char_length(name) between 2 and 120),
  cat         text not null check (char_length(cat) <= 40),
  city        text not null check (char_length(city) <= 80),
  addr        text check (char_length(addr) <= 200),
  coins       text[] not null default '{}' check (cardinality(coins) <= 8),
  nets        text[] not null default '{}' check (cardinality(nets) <= 8),
  wa          text check (char_length(wa) <= 30),
  web         text check (char_length(web) <= 200),
  lat         double precision check (lat between -40 and 8),
  lng         double precision check (lng between -78 and -30),
  note        text check (char_length(note) <= 400)
);

alter table public.places enable row level security;

-- visitantes só enxergam o que foi aprovado
drop policy if exists "ler aprovados" on public.places;
create policy "ler aprovados" on public.places
  for select to anon, authenticated
  using (status = 'approved');

-- visitantes só podem inserir como pendente e não verificado
drop policy if exists "enviar cadastro" on public.places;
create policy "enviar cadastro" on public.places
  for insert to anon, authenticated
  with check (status = 'pending' and verified = false);
