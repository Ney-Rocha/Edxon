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
    role text not null check (role in ('Admin', 'Administrador', 'Usuário')),
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
  ('usr-00', 'Rocha Santos', 'rocha.santos@dxon.com.br', 'Administrador', 'Ativo', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
  ('usr-01', 'Bruno Santos', 'bruno.santos@educorp.com', 'Usuário', 'Ativo', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
  ('usr-02', 'Carla Dias', 'carla.dias@educorp.com', 'Usuário', 'Ativo', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  avatar = excluded.avatar;

-- --------------------------------------------------
-- 7. SEED DATA: CORP TRAINING CATALOG
-- --------------------------------------------------
insert into trainings (id, title, category, duration, views_count, type, status, cover_image, updated_date, description)
values 
  (
    'tr-01', 
    'Segurança da Informação e LGPD', 
    'Compliance', 
    '4h', 
    142, 
    'Obrigatório', 
    'Ativo', 
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500', 
    '23 Mai 2026', 
    'Instruções cruciais sobre o tratamento de dados pessoais sensíveis e segurança cibernética corporativa alinhada com os preceitos da LGPD.'
  ),
  (
    'tr-02', 
    'Comunicação Assertiva e Liderança', 
    'Desenvolvimento Pessoal', 
    '6h', 
    89, 
    'Recomendado', 
    'Ativo', 
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500', 
    '18 Mai 2026', 
    'Conceitos modernos para aprimorar o trabalho em equipes de alta performance, feedback empático e alinhamento tático corporativo.'
  ),
  (
    'tr-03', 
    'Código de Ética e Integridade', 
    'Compliance', 
    '2h', 
    210, 
    'Obrigatório', 
    'Ativo', 
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500', 
    '15 Abr 2026', 
    'Diretrizes norteadoras e valores corporativos DXON voltados à prevenção de corrupção, conflitos de interesse e integridade nas negociações.'
  ),
  (
    'tr-04', 
    'Princípios de Clean Code em TS', 
    'Tecnologia', 
    '8h', 
    54, 
    'Livre', 
    'Ativo', 
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500', 
    '10 Mai 2026', 
    'Capacitação técnica voltada à legibilidade de software, refabricações síncronas estruturadas, arquitetura limpa e testes unitários de integração.'
  )
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  duration = excluded.duration,
  views_count = excluded.views_count,
  type = excluded.type,
  status = excluded.status,
  cover_image = excluded.cover_image,
  updated_date = excluded.updated_date,
  description = excluded.description;

-- --------------------------------------------------
-- 8. SEED DATA: SYSTEM LOGS AUDIT
-- --------------------------------------------------
insert into system_logs (id, timestamp, user_name, user_initials, user_bg_color, user_text_color, action, training, ip, status)
values
  ('log-01', '25/05/2026 19:42', 'Rocha Santos', 'RS', 'bg-indigo-500', 'text-white', 'Excluiu Treinamento corporativo legível', 'Trilha Antiga de Integração', '192.168.1.144', 'Sucesso'),
  ('log-02', '25/05/2026 18:12', 'Rocha Santos', 'RS', 'bg-indigo-500', 'text-white', 'Edição de Dados cadastrais', 'Bruno Santos (Colaborador)', '192.168.1.144', 'Sucesso')
on conflict (id) do update set
  timestamp = excluded.timestamp,
  user_name = excluded.user_name,
  action = excluded.action,
  ip = excluded.ip,
  status = excluded.status;

-- --------------------------------------------------
-- 9. SEED DATA: USER RECENT ACTIVITIES
-- --------------------------------------------------
insert into activities (id, user_name, user_avatar, action, status, time)
values
  ('act-01', 'Bruno Santos', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'Iniciou o curso de Segurança da Informação e LGPD', 'Aprovado', 'Há 12 minutos'),
  ('act-02', 'Carla Dias', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Concluiu o exame de Código de Ética e Integridade', 'Sucesso', 'Há 25 minutos'),
  ('act-03', 'Rocha Santos', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Atualizou as configurações de Compliance do sistema', 'Sucesso', 'Há 1 hora')
on conflict (id) do update set
  user_name = excluded.user_name,
  action = excluded.action,
  status = excluded.status,
  time = excluded.time;

-- --------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES & ACCESSIBILITY
-- --------------------------------------------------
-- If RLS is enabled on Supabase, queries with the standard anonymous key (SUPABASE_ANON_KEY)
-- require explicit policies or disabling RLS altogether. Run the following to allow full sync:

-- Option A: Purely Permissive Policies (Keeps RLS enabled but authorizes all public operations)
alter table users enable row level security;
alter table trainings enable row level security;
alter table activities enable row level security;
alter table system_logs enable row level security;

drop policy if exists "Enable read access for all users" on users;
drop policy if exists "Enable insert access for all users" on users;
drop policy if exists "Enable update access for all users" on users;
drop policy if exists "Enable delete access for all users" on users;

create policy "Enable read access for all users" on users for select using (true);
create policy "Enable insert access for all users" on users for insert with check (true);
create policy "Enable update access for all users" on users for update using (true) with check (true);
create policy "Enable delete access for all users" on users for delete using (true);

drop policy if exists "Enable read access for all users" on trainings;
drop policy if exists "Enable insert access for all users" on trainings;
drop policy if exists "Enable update access for all users" on trainings;
drop policy if exists "Enable delete access for all users" on trainings;

create policy "Enable read access for all users" on trainings for select using (true);
create policy "Enable insert access for all users" on trainings for insert with check (true);
create policy "Enable update access for all users" on trainings for update using (true) with check (true);
create policy "Enable delete access for all users" on trainings for delete using (true);

drop policy if exists "Enable read access for all users" on activities;
drop policy if exists "Enable insert access for all users" on activities;

create policy "Enable read access for all users" on activities for select using (true);
create policy "Enable insert access for all users" on activities for insert with check (true);

drop policy if exists "Enable read access for all users" on system_logs;
drop policy if exists "Enable insert access for all users" on system_logs;

create policy "Enable read access for all users" on system_logs for select using (true);
create policy "Enable insert access for all users" on system_logs for insert with check (true);


-- Option B: Disable RLS completely (Alternative approach - uncomment to use)
-- alter table users disable row level security;
-- alter table trainings disable row level security;
-- alter table activities disable row level security;
-- alter table system_logs disable row level security;

