# EduCorporate - Instruções do Sistema e Contexto do Projeto

Este arquivo registra o contexto do sistema, suas decisões de design, regras de negócios e as últimas modificações realizadas. Ele é lido automaticamente pelas próximas sessões do agente de IA para manter a fidelidade e consistência técnica do projeto.

---

## 👥 Credenciais de Teste e Usuários Padrão

O sistema possui uma base de dados simulada com suporte a estados em memória persistentes em nível de sessão.

* **Administrador Padrão (Primeiro Administrador):**
  * **Nome:** Rocha Santos
  * **E-mail:** `rocha.santos@dxon.com.br`
  * **Senha pré-preenchida:** `123456`
  * **Função:** Administrador (Acesso completo e irrestrito ao Painel de Controle, Gerenciamento de Usuários e Edição de Conteúdos).

* **Alunos e Colaboradores Integrados:**
  * `bruno.santos@educorp.com` (Aluno)
  * `carla.dias@educorp.com` (Aluno)

---

## 🛠️ Regras de Negócio e Comportamento Automatizado

### 1. Determinação de Papel Automática no Login (Role Mapping)
O sistema **não possui botões ou seleções estáticas de "Visão Aluno" vs "Visão Administrador" na interface de autenticação**.
* O login determina de forma transparente o tipo do usuário de acordo com o e-mail inserido.
* **Hierarquia Dinâmica:** Se o e-mail não estiver cadastrado na base, o sistema verifica a presença de administradores. 
  * Se **não houver nenhum** administrador ativo, o primeiro usuário registrado assume a função de **Administrador**.
  * Todos os demais usuários criados subsequentemente (seja via cadastro manual, login por e-mail, ou conexão social) são criados com o perfil **Aluno (Usuário)** por padrão.
  * Promoções de perfil de Aluno para Administrador só podem ser executadas de forma explícita por outro Administrador dentro do módulo de **Gerenciamento de Usuários**.

### 2. Fluxo de Autenticação Social Corporativa (Apenas Microsoft SSO)
O sistema disponibiliza integração de Single Sign-On (SSO) moderna e exclusiva para a conta **Microsoft**:
* Não há suporte a conexões Google. Apenas o botão Microsoft SSO é disponibilizado.
* Quando clicado, exibe um modal dinâmico e seguro para coletar com precisão o **Nome Completo** e o **E-mail Corporativo** do colaborador diretamente do provedor de dados se ele não tiver uma conta corporativa existente.
* Caso o usuário não tenha uma conta cadastrada no banco de dados local, ele pode criar uma de forma opcional preenchendo o formulário de cadastro estruturado ou conectando sua conta Microsoft de maneira imediata com autopreenchimento transparente.

### 3. Gerenciamento de Conteúdo e Usuários (CRUD & Modais)
* **Editar Treinamentos:** O botão "Editar" no catálogo de treinamentos carrega o formulário correspondente de criação, permitindo a substituição ágil do título, capa, categoria, duração, descrição e carga horária de forma síncrona.
* **Editar Colaboradores:** Um overlay responsivo de alta definição permite alterar o nome completo, e-mail corporativo, classe/função (Aluno vs Administrador) e o status do usuário em tempo real.
* **Confirmação Não-Bloqueante (Excluir):** Todas as ações destrutivas (Excluir Treinamento/Excluir Colaborador) utilizam **modais de overlay customizados do Tailwind** em substituição ao clássico `window.confirm()`. Isso resolve problemas de engasgo em ambientes com iframe e confere sofisticação de produto real.

### 4. Integração Supabase (Persistência Síncrona)
O sistema conta com um canal de comunicação bidirecional com o Supabase através de um proxy seguro no backend (`/server/supabase.ts`), garantindo que chaves confidenciais nunca vazem no navegador do cliente:
* **Detecção Dinâmica de Chaves (Fallback Seguro):** Caso `SUPABASE_URL` e `SUPABASE_ANON_KEY` não estejam configurados no ambiente, o sistema roda transparentemente em modo in-memory (dados locais em memória no servidor inicializados a partir de `src/data.ts`). Isso previne interrupções ou lentidão no ambiente de desenvolvimento.
* **Status da Conexão:** Um badge visual no cabeçalho indica em tempo real se o Supabase está ativo como repositório de dados estruturados (**Supabase Conectado** vs **Modo In-Memory**).
* **Esquema de Tabelas DDL (Supabase SQL):**
  ```sql
  -- Tabela de Usuários/Colaboradores
  create table users (
    id text primary key,
    name text not null,
    email text unique not null,
    role text not null,
    status text not null,
    avatar text
  );

  -- Tabela de Trilhas / Treinamentos
  create table trainings (
    id text primary key,
    title text not null,
    category text not null,
    duration text,
    views_count integer default 0,
    type text not null,
    status text not null,
    cover_image text,
    updated_date text,
    description text
  );

  -- Tabela de Atividades de Aprendizado
  create table activities (
    id text primary key default gen_random_uuid()::text,
    user_name text not null,
    user_avatar text,
    action text not null,
    status text not null,
    time text not null,
    created_at timestamp with time zone default timezone('utc'::text, now())
  );

  -- Tabela de Logs de Auditoria Corporativos
  create table system_logs (
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
  ```

---

## 📈 Resumo das Últimas Alterações Realizadas

1. **Integração Completa Supabase Full-Stack:** Adicionado serviço utilitário `/server/supabase.ts` acoplado ao `server.ts` provendo endpoints em `/api/db/*` para sincronização transparente de Usuários, Treinamentos, Atividades Recentes e Logs do Sistema.
2. **Camada de Interceptação de Estado Síncrono (React):** Criação de wrappers imperativos no `App.tsx` que monitoram modificações aplicadas localmente nas telas do LMS e encaminham mutações diretamente ao banco de dados via chamadas assíncronas de background.
3. **Indicador Visual de Banco Ativo:** Inclusão de um badge de status de banco de dados interativo com animação de pulso no cabeçalho principal do painel, fornecendo feedback de sincronização robusto.
4. **Foco Exclusivo no Microsoft SSO:** Descontinuação da autenticação Google SSO. O login por Single Sign-On agora é focado exclusivamente no ecossistema da Microsoft.
5. **Registro Pragmático no Fluxo Microsoft:** Caso o usuário opte por acessar sem uma conta previamente registrada, o sistema permite a sua adesão rápida de forma síncrona, coletando as chaves cadastrais (Nome e E-mail) ou estabelecendo conexão Microsoft direta.
6. **Novo Admin Principal de Referência:** Mapeamento de `Rocha Santos` (`rocha.santos@dxon.com.br`) como o primeiro administrador padrão, pré-preenchendo a tela de autenticação para teste imediato.
7. **Remoção de Switcheurs de Perfil Estáticos:** Padronização do sistema para derivar as telas do usuário (`admin-dashboard` vs `student-dashboard`) estritamente através do mapeamento de e-mail e função direta no banco de dados local.
8. **Correção do Bug de Exclusão:** Substituição de `window.confirm` por diálogos de confirmação customizados integrados ao ecossistema do React para evitar que o navegador trave a renderização do iframe.
9. **Configurações Globais Integradas e Livres de Inconsistências:** Linter executando com zero infrações pendentes (`tsc --noEmit` bem-sucedido) e builds de produção rodando saudáveis.
