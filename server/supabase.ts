import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User, Training, RecentActivity, SystemLog, Role, UserStatus } from "../src/types";
import { INITIAL_USERS, INITIAL_TRAININGS, INITIAL_ACTIVITIES, INITIAL_SYSTEM_LOGS } from "../src/data";

let supabaseInstance: SupabaseClient | null = null;
let isConfigured = false;

// Safe, persistent in-memory fallback store on the server if Supabase keys are not set
let localUsers: User[] = [...INITIAL_USERS];
let localTrainings: Training[] = [...INITIAL_TRAININGS];
let localActivities: RecentActivity[] = [...INITIAL_ACTIVITIES];
let localLogs: SystemLog[] = [...INITIAL_SYSTEM_LOGS];

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (url && url !== "" && key && key !== "") {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: false,
        },
      });
      isConfigured = true;
      console.log("[Supabase] Client initialized successfully!");
    } catch (err) {
      console.error("[Supabase] Initialization failed:", err);
      supabaseInstance = null;
      isConfigured = false;
    }
  } else {
    if (!isConfigured) {
      console.warn(
        "[Supabase] Warning: SUPABASE_URL and/or SUPABASE_ANON_KEY are missing in .env. Falling back to in-memory server state."
      );
    }
    supabaseInstance = null;
    isConfigured = false;
  }

  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  getSupabaseClient();
  return isConfigured;
}

// ==========================================
// USER CRUD OPERATIONS
// ==========================================

// Diagnostic utility to provide detailed information on Database/Supabase errors
function handleAndLogDbError(context: string, err: any) {
  if (!err) return;
  
  let friendlyMessage = "";
  const code = err.code || (err as any).statusCode || (err as any).status;
  const details = err.details || "";
  const message = err.message || "";
  const hint = err.hint || "";
  
  if (code === "42P01") {
    friendlyMessage = "⚠️ [Tabela não encontrada] A tabela correspondente a esta operação não foi criada no seu banco de dados Supabase. Por favor, copie todo o conteúdo do arquivo 'supabase_migration.sql' e execute-o no 'SQL Editor' do seu painel do Supabase para criar as tabelas e dados iniciais!";
  } else if (code === "42501" || message.toLowerCase().includes("row-level security")) {
    friendlyMessage = "⚠️ [Restrição de Segurança / RLS] A segurança em nível de linha (RLS) está ativa nesta tabela no Supabase, impedindo a gravação de dados com a chave anônima. Por favor, desative o RLS (Disable RLS) para esta tabela no seu painel do Supabase, ou adicione uma política permissiva ('Enable read/write for all users').";
  } else if (code === "23514") {
    friendlyMessage = "⚠️ [Restrição de Valor / CHECK Constraint] O valor enviado para uma das colunas (por exemplo, status ou role) viola uma restrição de validação (CHECK) definida na tabela do banco de dados. Exemplo: se o banco de dados só aceita 'Administrador', tentar inserir 'Admin' causará este erro.";
  } else if (code === "23505") {
    friendlyMessage = "⚠️ [Duplicação de Chave / UNIQUE] Um registro com esta chave primária ou endereço de e-mail já existe no banco de dados, violando a regra de valor único.";
  } else if (code === "23502") {
    friendlyMessage = "⚠️ [Coluna Obrigatória / NOT NULL] Tentativa de inserir registro com valor nulo em uma coluna obrigatória. Verifique as propriedades enviadas.";
  }

  console.error("\n" + "=".repeat(80));
  console.error(`🚨 ERRO DA INTEGRAÇÃO SUPABASE NA OPERAÇÃO [${context}]`);
  console.error(`Mensagem: ${message}`);
  if (code) console.error(`Código do Erro DB: ${code}`);
  if (details) console.error(`Detalhes: ${details}`);
  if (hint) console.error(`Sugestão DB: ${hint}`);
  if (friendlyMessage) {
    console.error(`\n💡 RESOLUÇÃO RECOMENDADA:\n${friendlyMessage}`);
  }
  console.error("Objeto de erro completo:");
  console.error(JSON.stringify(err, null, 2));
  console.error("=".repeat(80) + "\n");
}

// Helper functions to map roles and statuses seamlessly between client types and DB constraints
function mapDbUserToClient(dbUser: any): User {
  let mappedRole: Role = "Usuário";
  if (dbUser.role === "Admin" || dbUser.role === "Administrador") {
    mappedRole = "Admin";
  }

  let mappedStatus: UserStatus = "Ativo";
  if (dbUser.status === "Suspenso" || dbUser.status === "Inativo") {
    mappedStatus = "Inativo";
  } else if (dbUser.status === "Pendente") {
    mappedStatus = "Pendente";
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: mappedRole,
    status: mappedStatus,
    avatar: dbUser.avatar
  };
}

function mapClientUserToDb(clientUser: User): any {
  // Map "Admin" to "Administrador" and anything else to "Usuário" to respect original check constraints on role
  const dbRole = clientUser.role === "Admin" ? "Administrador" : "Usuário";
  
  // Map non-Ativo states to "Suspenso" to respect original check constraints on status (Ativo / Suspenso)
  const dbStatus = clientUser.status === "Ativo" ? "Ativo" : "Suspenso";

  return {
    id: clientUser.id,
    name: clientUser.name,
    email: clientUser.email,
    role: dbRole,
    status: dbStatus,
    avatar: clientUser.avatar
  };
}

export async function getUsers(): Promise<User[]> {
  const client = getSupabaseClient();
  if (!client) return localUsers;

  try {
    const { data, error } = await client.from("users").select("*");
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(mapDbUserToClient);
    }
    // If Supabase table is empty, seed it with initial users
    for (const u of localUsers) {
      const { error: insertErr } = await client.from("users").upsert(mapClientUserToDb(u));
      if (insertErr) handleAndLogDbError("seed-user", insertErr);
    }
    return localUsers;
  } catch (err) {
    handleAndLogDbError("getUsers", err);
    return localUsers;
  }
}

export async function upsertUser(user: User): Promise<User> {
  // Update local memory
  const idx = localUsers.findIndex((u) => u.id === user.id);
  if (idx > -1) {
    localUsers[idx] = user;
  } else {
    localUsers.unshift(user);
  }

  const client = getSupabaseClient();
  if (!client) return user;

  try {
    const { error } = await client.from("users").upsert(mapClientUserToDb(user));
    if (error) throw error;
  } catch (err) {
    handleAndLogDbError("upsertUser", err);
    throw err;
  }
  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  localUsers = localUsers.filter((u) => u.id !== id);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client.from("users").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    handleAndLogDbError("deleteUser", err);
    throw err;
  }
}

// ==========================================
// TRAINING CRUD OPERATIONS
// ==========================================

export async function getTrainings(): Promise<Training[]> {
  const client = getSupabaseClient();
  if (!client) return localTrainings;

  try {
    const { data, error } = await client.from("trainings").select("*");
    if (error) throw error;
    if (data && data.length > 0) {
      // Map database camelCase columns if created without snake_case,
      // or map physical snake_case columns
      return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        duration: d.duration,
        viewsCount: d.views_count !== undefined ? d.views_count : (d.viewsCount || 0),
        type: d.type,
        status: d.status,
        coverImage: d.cover_image || d.coverImage,
        updatedDate: d.updated_date || d.updatedDate,
        description: d.description
      })) as Training[];
    }
    // Seed trainings table if empty
    for (const t of localTrainings) {
      const { error: insertErr } = await client.from("trainings").upsert({
        id: t.id,
        title: t.title,
        category: t.category,
        duration: t.duration,
        views_count: t.viewsCount,
        type: t.type,
        status: t.status,
        cover_image: t.coverImage,
        updated_date: t.updatedDate,
        description: t.description
      });
      if (insertErr) handleAndLogDbError("seed-training", insertErr);
    }
    return localTrainings;
  } catch (err) {
    handleAndLogDbError("getTrainings", err);
    return localTrainings;
  }
}

export async function upsertTraining(training: Training): Promise<Training> {
  const idx = localTrainings.findIndex((t) => t.id === training.id);
  if (idx > -1) {
    localTrainings[idx] = training;
  } else {
    localTrainings.unshift(training);
  }

  const client = getSupabaseClient();
  if (!client) return training;

  try {
    const { error } = await client.from("trainings").upsert({
      id: training.id,
      title: training.title,
      category: training.category,
      duration: training.duration,
      views_count: training.viewsCount,
      type: training.type,
      status: training.status,
      cover_image: training.coverImage,
      updated_date: training.updatedDate,
      description: training.description
    });
    if (error) throw error;
  } catch (err) {
    handleAndLogDbError("upsertTraining", err);
    throw err;
  }
  return training;
}

export async function deleteTraining(id: string): Promise<boolean> {
  localTrainings = localTrainings.filter((t) => t.id !== id);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client.from("trainings").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    handleAndLogDbError("deleteTraining", err);
    throw err;
  }
}

// ==========================================
// RECENT ACTIVITIES OPERATIONS
// ==========================================

export async function getActivities(): Promise<RecentActivity[]> {
  const client = getSupabaseClient();
  if (!client) return localActivities;

  try {
    const { data, error } = await client
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        user: {
          name: d.user_name || d.user?.name,
          avatar: d.user_avatar || d.user?.avatar,
        },
        action: d.action,
        status: d.status,
        time: d.time,
      })) as RecentActivity[];
    }
    // Seed empty table
    for (const act of localActivities) {
      const { error: insertErr } = await client.from("activities").insert({
        id: act.id,
        user_name: act.user.name,
        user_avatar: act.user.avatar,
        action: act.action,
        status: act.status,
        time: act.time,
      });
      if (insertErr) handleAndLogDbError("seed-activity", insertErr);
    }
    return localActivities;
  } catch (err) {
    handleAndLogDbError("getActivities", err);
    return localActivities;
  }
}

export async function addActivity(act: RecentActivity): Promise<RecentActivity> {
  localActivities.unshift(act);
  if (localActivities.length > 30) localActivities.pop();

  const client = getSupabaseClient();
  if (!client) return act;

  try {
    const { error } = await client.from("activities").insert({
      id: act.id,
      user_name: act.user.name,
      user_avatar: act.user.avatar,
      action: act.action,
      status: act.status,
      time: act.time,
    });
    if (error) throw error;
  } catch (err) {
    handleAndLogDbError("addActivity", err);
    throw err;
  }
  return act;
}

// ==========================================
// SYSTEM LOGS OPERATIONS
// ==========================================

export async function getLogs(): Promise<SystemLog[]> {
  const client = getSupabaseClient();
  if (!client) return localLogs;

  try {
    const { data, error } = await client
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        timestamp: d.timestamp,
        user: {
          name: d.user_name || d.user?.name,
          initials: d.user_initials || d.user?.initials,
          bgColor: d.user_bg_color || d.user?.bgColor,
          textColor: d.user_text_color || d.user?.textColor,
        },
        action: d.action,
        training: d.training,
        ip: d.ip,
        status: d.status,
      })) as SystemLog[];
    }
    // Seed empty table
    for (const log of localLogs) {
      const { error: insertErr } = await client.from("system_logs").insert({
        id: log.id,
        timestamp: log.timestamp,
        user_name: log.user.name,
        user_initials: log.user.initials,
        user_bg_color: log.user.bgColor,
        user_text_color: log.user.textColor,
        action: log.action,
        training: log.training,
        ip: log.ip,
        status: log.status,
      });
      if (insertErr) handleAndLogDbError("seed-log", insertErr);
    }
    return localLogs;
  } catch (err) {
    handleAndLogDbError("getLogs", err);
    return localLogs;
  }
}

export async function addLog(log: SystemLog): Promise<SystemLog> {
  localLogs.unshift(log);
  if (localLogs.length > 40) localLogs.pop();

  const client = getSupabaseClient();
  if (!client) return log;

  try {
    const { error } = await client.from("system_logs").insert({
      id: log.id,
      timestamp: log.timestamp,
      user_name: log.user.name,
      user_initials: log.user.initials,
      user_bg_color: log.user.bgColor,
      user_text_color: log.user.textColor,
      action: log.action,
      training: log.training,
      ip: log.ip,
      status: log.status,
    });
    if (error) throw error;
  } catch (err) {
    handleAndLogDbError("addLog", err);
    throw err;
  }
  return log;
}
