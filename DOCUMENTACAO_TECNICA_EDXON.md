# 📘 Documentação Técnica e Apresentação do Sistema EDXON

Este documento apresenta a arquitetura, tecnologias, regras de negócio e infraestrutura de dados que compõem o **EDXON**, um sistema corporativo completo de Gestão de Aprendizagem (LMS - *Learning Management System*).

---

## 🚀 1. Visão Geral da Arquitetura

O EDXON é construído sobre uma **arquitetura Full-Stack moderna (Client-Side + Express Proxy Server)**, projetada para alta performance, segurança corporativa e escalabilidade em nuvem.

### Arquitetura em Camadas:
1. **Front-End (Interface do Usuário):** Single Page Application (SPA) responsiva em React 19 com TypeScript e Tailwind CSS.
2. **Back-End (Servidor Proxy & API):** Servidor customizado Node.js Express rodando na porta `3000` (compatível com containers Cloud Run/Docker).
3. **Camada de Persistência (Banco de Dados & Storage):** Integração bidirecional com **Supabase (PostgreSQL)** acoplada a um mecanismo resiliente de *In-Memory Fallback*.
4. **Inteligência Artificial:** Chamadas server-side protegidas para a API **Google Gemini** para auxílio no planejamento de treinamentos.

---

## 🛠️ 2. Tecnologias, Frameworks e Bibliotecas (Tech Stack)

### 🎨 Front-End (Cliente)
* **React 19 (`react`, `react-dom`):** Biblioteca principal para renderização declarativa e reativa da interface.
* **TypeScript:** Garante tipagem estática rigorosa para usuários, treinamentos, logs e relatórios (`/src/types.ts`).
* **Vite 6:** Bundler ultra-rápido para compilação do código front-end.
* **Tailwind CSS v4 (`@tailwindcss/vite`):** Estilização utilitária de alto desempenho, com foco na padronização visual clara (Light Mode) e responsividade.
* **Lucide React (`lucide-react`):** Coleção unificada de ícones vetoriais em alta definição.
* **Motion (`motion`):** Biblioteca de animações suaves para transição de modais e trocas de telas.
* **Recharts:** Renderização de gráficos dinâmicos de progresso e engajamento no painel administrativo.

### ⚙️ Back-End (Servidor)
* **Node.js & Express (`express`):** Servidor web responsável por entregar a aplicação, fornecer endpoints de API protegidos (`/api/*`) e intermediar conexões.
* **TSX (`tsx`):** Executor de TypeScript em tempo real para ambiente de desenvolvimento.
* **esbuild:** Compilador de produção que empacota o servidor TypeScript em um único arquivo CommonJS CJS (`dist/server.cjs`) otimizado para nuvem.
* **Dotenv (`dotenv`):** Gerenciamento seguro de variáveis de ambiente (`.env`).

### 🤖 Inteligência Artificial
* **Google GenAI SDK (`@google/genai`):** Utilizado server-side para gerar ementas, estruturas de tópicos e módulos pedagógicos automaticamente.

---

## 🗄️ 3. Onde e Como os Dados são Armazenados

### 🟢 Banco de Dados Estruturado (Supabase - PostgreSQL)
O sistema armazena todos os seus dados estruturados em uma instância cloud do **Supabase**. A comunicação é intermediada pelo servidor Express (`/server/supabase.ts`), garantindo que chaves confidenciais nunca sejam expostas ao navegador do cliente.

#### Tabelas do Banco de Dados:
1. **`users` (Tabela de Colaboradores/Usuários):**
   * Armazena `id`, `name`, `email`, `role` (admin | aluno), `status` (Ativo | Inativo) e `avatar`.
2. **`trainings` (Tabela de Treinamentos e Cursos):**
   * Armazena `id`, `title`, `category`, `duration`, `views_count`, `type`, `status`, `cover_image`, `updated_date`, `description`, `pdf_url` e `course_type_id`.
3. **`activities` (Tabela de Atividades Recentes):**
   * Registra `id`, `user_name`, `user_avatar`, `action`, `status`, `time` e `created_at`.
4. **`system_logs` (Tabela de Auditoria Corporativa):**
   * Registra histórico de auditoria de segurança (`id`, `timestamp`, `user_name`, `user_initials`, `action`, `training`, `ip`, `status`).

---

### 🛡️ Mecanismo de Segurança e Resiliência (*In-Memory Fallback*)
* Se as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` não estiverem configuradas no ambiente, o sistema **não trava nem falha**. Ele ativa automaticamente o modo **In-Memory**, armazenando e servindo as alterações na memória do servidor a partir das estruturas base de `/src/data.ts`.
* **Indicador Visual:** O cabeçalho do sistema possui um badge dinâmico que exibe o status da conexão em tempo real (**"Supabase Conectado"** ou **"Modo In-Memory"**).

---

## 📁 4. Onde são Salvos PDFs, Imagens, Capas e Links

### 📄 PDFs e Materiais de Apoio (`pdf_url` / `pdfUrl`):
1. **Supabase Storage (Nuvem):** Arquivos PDF enviados via upload pelo formulário de cadastro de treinamentos são gravados diretamente no bucket seguro do Supabase chamado **`training-materials`**. O sistema obtém a URL pública do arquivo armazenado para disponibilização aos alunos.
2. **Links Diretos (HTTPS):** O campo também aceita links diretos externos de arquivos armazenados em serviços como Google Drive, AWS S3 ou servidores da empresa.

### 🖼️ Capas dos Cursos (`cover_image` / `coverImage`):
1. **URLs Públicas HTTPS:** Endereços de imagens hospedadas em servidores web ou CDN.
2. **Imagens Base64:** Suporte para codificação direta de imagens dentro do registro do curso.
3. **Supabase Storage:** Armazenamento em bucket para imagens personalizadas enviadas pelos administradores.

### 👤 Avatares dos Usuários:
* Gerados dinamicamente via serviço vetorial SVG **DiceBear** com base no nome do usuário:
  `https://api.dicebear.com/7.x/initials/svg?seed=NOME_DO_USUARIO`

### 🔗 Links e Metadados do Sistema:
* Gravados como colunas do tipo texto (`text`) diretamente nas tabelas `trainings` e `users` no PostgreSQL do Supabase.

---

## 🔐 5. Regras de Negócio e Autenticação

### 1. Determinação Automática de Papel (*Role Mapping*)
* O login determina o tipo de acesso do colaborador de forma transparente pelo e-mail inserido.
* **Administrador Principal Padrão:** `rocha.santos@dxon.com.br` (Senha: `123456`).
* **Administrador de Backup:** `admin@admin.com` (Senha: `Admin@123`).
* **Lógica Dinâmica:** Se a base estiver vazia, o primeiro usuário registrado assume a função de **Administrador**. Todos os demais cadastros entram como **Aluno** por padrão. Alterações de função só podem ser feitas por outro Administrador no painel de Gerenciamento de Usuários.

### 2. Single Sign-On (SSO) Corporativo
* Modal de login com opções integradas de acesso simplificado via **Google SSO** e **Office 365 (Microsoft)**.

### 3. Modais de Confirmação Não-Bloqueantes
* Modais de exclusão (treinamentos ou colaboradores) utilizam overlays responsivos estilizados com Tailwind CSS em vez do `window.confirm()` nativo, evitando bloqueios ou travamentos em ambientes iFrame e garantindo uma experiência fluida.

### 4. Padrão Visual Permanente (Light Mode)
* A interface do sistema é fixada no tema claro (*Light Mode*), garantindo alto contraste, legibilidade técnica e uma estética corporativa limpa.

---

## 📂 6. Estrutura Diretorias do Projeto

```
/
├── .env.example              # Declarador de variáveis de ambiente do projeto
├── AGENTS.md                 # Histórico de contexto e decisões do sistema
├── package.json              # Dependências npm e scripts de build/dev
├── server.ts                 # Servidor de entrada Express + Vite Middleware + Gemini API
├── supabase_migration.sql    # Script SQL DDL de criação das tabelas no Supabase
├── server/
│   └── supabase.ts           # Cliente Supabase server-side e manipuladores de API (/api/db/*)
└── src/
    ├── App.tsx               # Componente raiz do React, gerenciamento de estado e rotas
    ├── main.tsx              # Ponto de entrada de renderização do React DOM
    ├── types.ts              # Definição das interfaces TypeScript do sistema
    ├── data.ts               # Base de dados em memória inicial (fallback)
    ├── components/           # Módulos e telas do sistema (Dashboard, Login, Treinamentos, etc.)
    └── lib/
        └── databaseService.ts # Serviços de sincronização e cliente da camada de dados
```

---

## 📊 7. Como o Sistema Funciona no Ciclo de Vida do Deploy

1. **Desenvolvimento (`npm run dev`):**
   * Executa `tsx server.ts`. O servidor Express inicia, acopla o Vite em modo middleware e escuta na porta `3000`.

2. **Compilação de Produção (`npm run build`):**
   * O Vite gera os arquivos estáticos otimizados do front-end na pasta `dist/`.
   * O `esbuild` empacota o servidor TypeScript (`server.ts`) em um arquivo CommonJS independente: `dist/server.cjs`.

3. **Execução de Produção (`npm start`):**
   * Roda `node dist/server.cjs`. O servidor Express serve a pasta `dist/` estaticamente para o navegador e fornece todas as APIs ativas na porta `3000`.
