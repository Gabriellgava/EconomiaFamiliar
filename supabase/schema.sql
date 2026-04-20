create extension if not exists pgcrypto;

create table if not exists public.familias (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rendimentos_fixos (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  descricao text not null,
  valor numeric(12,2) not null check (valor > 0),
  responsavel text not null,
  dia_recebimento integer check (dia_recebimento between 1 and 31),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rendimentos_variaveis (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  mes_ref text not null,
  valor numeric(12,2) not null check (valor >= 0),
  responsavel text not null default 'meiry',
  descricao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (familia_id, mes_ref, responsavel)
);

create table if not exists public.despesas (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  descricao text not null,
  valor numeric(12,2) not null check (valor > 0),
  categoria text not null,
  data date not null,
  mes_ref text not null,
  responsavel text not null default 'gabriel',
  fixa boolean not null default false,
  recorrencia_ate date,
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cartoes (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  nome text not null,
  empresa text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.compras_cartao (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  cartao_id uuid not null references public.cartoes(id) on delete cascade,
  descricao text not null,
  valor_total numeric(12,2) not null check (valor_total > 0),
  parcelas integer not null default 1 check (parcelas between 1 and 72),
  categoria text not null,
  data_compra date not null,
  mes_ref text not null,
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rendimentos_fixos_familia on public.rendimentos_fixos(familia_id);
create index if not exists idx_rendimentos_variaveis_familia_mes on public.rendimentos_variaveis(familia_id, mes_ref);
create index if not exists idx_despesas_familia_mes on public.despesas(familia_id, mes_ref);
create index if not exists idx_cartoes_familia on public.cartoes(familia_id);
create index if not exists idx_compras_cartao_familia_mes on public.compras_cartao(familia_id, mes_ref);

alter table public.rendimentos_variaveis alter column responsavel set default 'meiry';
alter table public.despesas alter column responsavel set default 'gabriel';
alter table public.despesas add column if not exists recorrencia_ate date;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_familias on public.familias;
create trigger set_updated_at_familias
before update on public.familias
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_rendimentos_fixos on public.rendimentos_fixos;
create trigger set_updated_at_rendimentos_fixos
before update on public.rendimentos_fixos
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_rendimentos_variaveis on public.rendimentos_variaveis;
create trigger set_updated_at_rendimentos_variaveis
before update on public.rendimentos_variaveis
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_despesas on public.despesas;
create trigger set_updated_at_despesas
before update on public.despesas
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_cartoes on public.cartoes;
create trigger set_updated_at_cartoes
before update on public.cartoes
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_compras_cartao on public.compras_cartao;
create trigger set_updated_at_compras_cartao
before update on public.compras_cartao
for each row execute function public.set_updated_at();

alter table public.familias enable row level security;
alter table public.rendimentos_fixos enable row level security;
alter table public.rendimentos_variaveis enable row level security;
alter table public.despesas enable row level security;
alter table public.cartoes enable row level security;
alter table public.compras_cartao enable row level security;

drop policy if exists "anon full access familias" on public.familias;
create policy "anon full access familias"
on public.familias
for all
to anon
using (true)
with check (true);

drop policy if exists "anon full access rendimentos_fixos" on public.rendimentos_fixos;
create policy "anon full access rendimentos_fixos"
on public.rendimentos_fixos
for all
to anon
using (true)
with check (true);

drop policy if exists "anon full access rendimentos_variaveis" on public.rendimentos_variaveis;
create policy "anon full access rendimentos_variaveis"
on public.rendimentos_variaveis
for all
to anon
using (true)
with check (true);

drop policy if exists "anon full access despesas" on public.despesas;
create policy "anon full access despesas"
on public.despesas
for all
to anon
using (true)
with check (true);

drop policy if exists "anon full access cartoes" on public.cartoes;
create policy "anon full access cartoes"
on public.cartoes
for all
to anon
using (true)
with check (true);

drop policy if exists "anon full access compras_cartao" on public.compras_cartao;
create policy "anon full access compras_cartao"
on public.compras_cartao
for all
to anon
using (true)
with check (true);
