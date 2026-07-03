-- ====================================================================
-- EDUCORPORATE - DEPLOYMENT MIGRATION & SCHEMAS
-- Copy and execute this script directly in your Supabase SQL Editor.
-- ====================================================================

-- --------------------------------------------------
-- 1. CLEANUP (Optional - Use with caution)
-- --------------------------------------------------
-- DROP TABLE IF EXISTS system_logs;
-- DROP TABLE IF EXISTS activities;
-- DROP TABLE IF EXISTS trainings;
-- DROP TABLE IF EXISTS users;

-- --------------------------------------------------
-- 2. CREATE TABLE: USERS (Colaboradores & Admins)
-- --------------------------------------------------
create table if not exists users (
    id text primary key,
    name text not null,
    email text unique not null,
    role text not null default 'usuario' check (role in ('admin', 'usuario')),
    status text not null check (status in ('Ativo', 'Pendente', 'Inativo', 'Suspenso')),
    avatar text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes for users
create index if not exists idx_users_email on users(email);

-- --------------------------------------------------
-- 3. CREATE TABLE: TRAININGS (Trilhas & Treinamentos)
-- --------------------------------------------------
create table if not exists trainings (
    id text primary key,
    title text not null,
    category text not null,
    duration text,
    views_count integer default 0,
    type text not null,
    status text not null,
    cover_image text,
    updated_date text,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes for trainings
create index if not exists idx_trainings_category on trainings(category);

-- --------------------------------------------------
-- 4. CREATE TABLE: ACTIVITIES (Atividades de Aprendizado)
-- --------------------------------------------------
create table if not exists activities (
    id text primary key default gen_random_uuid()::text,
    user_name text not null,
    user_avatar text,
    action text not null,
    status text not null,
    time text not null,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes for activities
create index if not exists idx_activities_created_at on activities(created_at desc);

-- --------------------------------------------------
-- 5. CREATE TABLE: SYSTEM_LOGS (Logs Corporativos de Auditoria)
-- --------------------------------------------------
create table if not exists system_logs (
    id text primary key default gen_random_uuid()::text,
    timestamp text not null,
    user_name text not null,
    user_initials text not null,
    user_bg_color text not null,
    user_text_color text not null,
    action text not null,
    training text not null,
    ip text not null,
    status text not null,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes for system_logs
create index if not exists idx_system_logs_created_at on system_logs(created_at desc);

-- --------------------------------------------------
-- 6. SEED DATA: INITIAL USERS & COLLABORATORS
-- --------------------------------------------------
insert into users (id, name, email, role, status, avatar)
values 
  ('admin-1', 'Administrador', 'admin@admin.com', 'admin', 'Ativo', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  avatar = excluded.avatar;

-- --------------------------------------------------
-- 7. SEED DATA: CORP TRAINING CATALOG (Clean in production)
-- --------------------------------------------------

-- --------------------------------------------------
-- 8. SEED DATA: SYSTEM LOGS AUDIT (Clean in production)
-- --------------------------------------------------

-- --------------------------------------------------
-- 9. SEED DATA: USER RECENT ACTIVITIES (Clean in production)
-- --------------------------------------------------

-- --------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES & ACCESSIBILITY
-- --------------------------------------------------
-- Enable Row Level Security (RLS) on all core tables
alter table users enable row level security;
alter table trainings enable row level security;
alter table activities enable row level security;
alter table system_logs enable row level security;

-- USERS Table Policies
drop policy if exists "Enable read access for all users" on users;
drop policy if exists "Enable insert access for all users" on users;
drop policy if exists "Enable update access for all users" on users;
drop policy if exists "Enable delete access for all users" on users;

create policy "Allow read access for anyone" on users
  for select using (true);

create policy "Allow insert access for anyone" on users
  for insert with check (true);

create policy "Allow update access only for admins" on users
  for update using (exists (select 1 from users where role = 'admin'))
  with check (exists (select 1 from users where role = 'admin'));

create policy "Allow delete access only for admins" on users
  for delete using (exists (select 1 from users where role = 'admin'));

-- TRAININGS Table Policies
drop policy if exists "Enable read access for all users" on trainings;
drop policy if exists "Enable insert access for all users" on trainings;
drop policy if exists "Enable update access for all users" on trainings;
drop policy if exists "Enable delete access for all users" on trainings;

create policy "Allow read of trainings for everyone" on trainings
  for select using (true);

create policy "Allow write of trainings for admins only" on trainings
  for all using (exists (select 1 from users where role = 'admin'))
  with check (exists (select 1 from users where role = 'admin'));

-- ACTIVITIES Table Policies
drop policy if exists "Enable read access for all users" on activities;
drop policy if exists "Enable insert access for all users" on activities;
drop policy if exists "Allow delete of activities for everyone" on activities;

create policy "Allow read of activities for everyone" on activities
  for select using (true);

create policy "Allow creation of activities for registered accounts" on activities
  for insert with check (true);

create policy "Allow delete of activities for everyone" on activities
  for delete using (true);

-- SYSTEM_LOGS Table Policies
drop policy if exists "Enable read access for all users" on system_logs;
drop policy if exists "Enable insert access for all users" on system_logs;
drop policy if exists "Allow delete of system_logs for everyone" on system_logs;

create policy "Allow read of audit logs only for admins" on system_logs
  for select using (exists (select 1 from users where role = 'admin'));

create policy "Allow background registration of system logs" on system_logs
  for insert with check (true);

create policy "Allow delete of system_logs for everyone" on system_logs
  for delete using (true);


-- --------------------------------------------------
-- 11. CREATE TABLES FOR COURSES TYPES & EVALUATIONS
-- --------------------------------------------------

-- Tabela de Tipos de Curso
create table if not exists tipos_curso (
    id text primary key,
    nome text not null,
    descricao text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Questões
create table if not exists questoes (
    id text primary key,
    curso_id text not null references trainings(id) on delete cascade,
    enunciado text not null,
    explicacao text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Alternativas das Questões
create table if not exists alternativas (
    id text primary key,
    questao_id text not null references questoes(id) on delete cascade,
    texto text not null,
    correta boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- --------------------------------------------------
-- 12. INDEXES FOR EVALUATION TABLES
-- --------------------------------------------------
create index if not exists idx_questoes_curso_id on questoes(curso_id);
create index if not exists idx_alternativas_questao_id on alternativas(questao_id);

-- --------------------------------------------------
-- 13. SEED DATA: COURSE TYPES & QUESTIONS
-- --------------------------------------------------
insert into tipos_curso (id, nome, descricao)
values
  ('ct-01', 'Obrigatório', 'Treinamento regulamentar ou exigência legal interna'),
  ('ct-02', 'Recomendado', 'Treinamento importante para o desenvolvimento profissional'),
  ('ct-03', 'Livre', 'Capacitação complementar optativa para equipes')
on conflict (id) do update set
  nome = excluded.nome,
  descricao = excluded.descricao;

-- --------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) & POLICIES
-- --------------------------------------------------
alter table tipos_curso enable row level security;
alter table questoes enable row level security;
alter table alternativas enable row level security;

-- TIPOS_CURSO Table Policies
drop policy if exists "Allow read of tipos_curso for everyone" on tipos_curso;
drop policy if exists "Allow write of tipos_curso for admins only" on tipos_curso;

create policy "Allow read of tipos_curso for everyone" on tipos_curso
  for select using (true);

create policy "Allow write of tipos_curso for admins only" on tipos_curso
  for all using (exists (select 1 from users where role = 'admin'))
  with check (exists (select 1 from users where role = 'admin'));

-- QUESTOES Table Policies
drop policy if exists "Allow read of questoes for everyone" on questoes;
drop policy if exists "Allow write of questoes for admins only" on questoes;

create policy "Allow read of questoes for everyone" on questoes
  for select using (true);

create policy "Allow write of questoes for admins only" on questoes
  for all using (exists (select 1 from users where role = 'admin'))
  with check (exists (select 1 from users where role = 'admin'));

-- ALTERNATIVAS Table Policies
drop policy if exists "Allow read of alternativas for everyone" on alternativas;
drop policy if exists "Allow write of alternativas for admins only" on alternativas;

create policy "Allow read of alternativas for everyone" on alternativas
  for select using (true);

create policy "Allow write of alternativas for admins only" on alternativas
  for all using (exists (select 1 from users where role = 'admin'))
  with check (exists (select 1 from users where role = 'admin'));


