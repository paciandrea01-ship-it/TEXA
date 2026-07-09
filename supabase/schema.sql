-- TEXA — schema tabella fornitori per Supabase.
-- Esegui questo SQL in: Supabase → SQL Editor → New query → Run.

create table if not exists companies (
  id             text primary key,
  name           text not null,
  category       text,
  speciality     text,
  description    text,
  tags           jsonb default '[]'::jsonb,
  certifications jsonb default '[]'::jsonb,
  vat            text,
  ateco          text,
  country        text default 'ITALIA',
  city           text,
  province       text,
  address        text,
  contact_person text,
  website        text,
  emails         jsonb default '[]'::jsonb,
  pec            text,
  phone          text,
  lat            double precision,
  lng            double precision,
  created_at     timestamptz default now()
);

-- Ricerche più veloci per categoria/città
create index if not exists companies_category_idx on companies (category);
create index if not exists companies_city_idx on companies (city);

-- RLS: lettura pubblica (serve alla chiave ANON del frontend),
-- scrittura solo con service key / dall'editor Supabase.
alter table companies enable row level security;

drop policy if exists "public read companies" on companies;
create policy "public read companies"
  on companies for select
  using (true);
