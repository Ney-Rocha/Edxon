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
  ('usr-00', 'Rocha Santos', 'rocha.santos@dxon.com.br', 'admin', 'Ativo', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
  ('usr-01', 'Bruno Santos', 'bruno.santos@educorp.com', 'usuario', 'Ativo', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
  ('usr-02', 'Carla Dias', 'carla.dias@educorp.com', 'usuario', 'Ativo', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150')
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

create policy "Allow read of activities for everyone" on activities
  for select using (true);

create policy "Allow creation of activities for registered accounts" on activities
  for insert with check (true);

-- SYSTEM_LOGS Table Policies
drop policy if exists "Enable read access for all users" on system_logs;
drop policy if exists "Enable insert access for all users" on system_logs;

create policy "Allow read of audit logs only for admins" on system_logs
  for select using (exists (select 1 from users where role = 'admin'));

create policy "Allow background registration of system logs" on system_logs
  for insert with check (true);


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

insert into questoes (id, curso_id, enunciado, explicacao)
values
  ('q1', 'tr-01', 'Qual das alternativas abaixo melhor descreve o principal objetivo da LGPD (Lei Geral de Proteção de Dados)?', 'A escuta empática ativa e o foco em ganha-ganha restabelecem a harmonia sem causar atrito ou ressentimentos futuros na equipe.'),
  ('q2', 'tr-01', 'O que caracteriza um "dado pessoal sensível" segundo os preceitos da LGPD?', 'Dados sobre origem racial, convicção religiosa, opinião política, saúde ou vida sexual necessitam de proteção acrescida por envolverem foro íntimo sensível.')
on conflict (id) do update set
  curso_id = excluded.curso_id,
  enunciado = excluded.enunciado,
  explicacao = excluded.explicacao;

insert into alternativas (id, questao_id, texto, correta)
values
  ('alt1_1', 'q1', 'Proibir a circulação e processamento de informações digitais.', false),
  ('alt1_2', 'q1', 'Assegurar a privacidade e proteger dados pessoais de cidadãos regulando o seu tratamento.', true),
  ('alt1_3', 'q1', 'Facilitar a comercialização irrestrita de dados cadastrais de clientes.', false),
  ('alt1_4', 'q1', 'Garantir que todas as empresas tenham acesso livre a dados governamentais.', false),
  ('alt2_1', 'q2', 'Informações públicas de contato como e-mails de canais de atendimento.', false),
  ('alt2_2', 'q2', 'Dados relativos a faturamento corporativo e registros de receita da empresa.', false),
  ('alt2_3', 'q2', 'Dados sobre origem racial, convicção religiosa, opinião política, saúde ou vida sexual.', true),
  ('alt2_4', 'q2', 'Apenas informações financeiras como extrato bancário ou histórico de cartões.', false)
on conflict (id) do update set
  questao_id = excluded.questao_id,
  texto = excluded.texto,
  correta = excluded.correta;

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


