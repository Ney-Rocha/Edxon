import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User, Training, RecentActivity, SystemLog, Role, UserStatus, CourseType, Question } from "../src/types";
import { INITIAL_USERS, INITIAL_TRAININGS, INITIAL_ACTIVITIES, INITIAL_SYSTEM_LOGS, INITIAL_COURSE_TYPES, INITIAL_QUESTIONS } from "../src/data";

let supabaseInstance: SupabaseClient | null = null;
let isConfigured = false;

// Safe, persistent in-memory fallback store on the server if Supabase keys are not set
let localUsers: User[] = [...INITIAL_USERS];
let localTrainings: Training[] = [...INITIAL_TRAININGS];
let localActivities: RecentActivity[] = [...INITIAL_ACTIVITIES];
let localLogs: SystemLog[] = [...INITIAL_SYSTEM_LOGS];
let localCourseTypes: CourseType[] = [...INITIAL_COURSE_TYPES];
let localQuestions: Question[] = [...INITIAL_QUESTIONS];

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

export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code?.startsWith("PGRST")) return true;
  const msg = (error.message || "").toLowerCase();
  return msg.includes("could not find the table") || msg.includes("does not exist") || msg.includes("relation") || msg.includes("schema cache");
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
  let mappedRole: Role = "usuario";
  if (dbUser.role === "admin" || dbUser.role === "Admin" || dbUser.role === "Administrador") {
    mappedRole = "admin";
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
  // Map strictly using modern lowercase terms to fit the db constraint
  const dbRole = clientUser.role === "admin" ? "admin" : "usuario";
  
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

async function tryUpsertUserWithFallback(client: SupabaseClient, dbUser: any): Promise<{ error: any }> {
  let currentDbUser = { ...dbUser };
  
  // Attempt 1: Standard write using the mapped format
  let { error } = await client.from("users").upsert(currentDbUser);
  if (!error) return { error: null };

  const getErrorString = (err: any) => err.message || JSON.stringify(err) || "";

  // Attempt 2: If role check constraint fails, try alternative capitalized or translated check values
  if (getErrorString(error).includes("users_role_check") || getErrorString(error).includes("violates check constraint")) {
    const altRoles = dbUser.role === "admin" 
      ? ["Admin", "Administrador"] 
      : ["Usuário", "usuario", "Usuario"];

    for (const altRole of altRoles) {
      const testUser = { ...currentDbUser, role: altRole };
      const { error: altErr } = await client.from("users").upsert(testUser);
      if (!altErr) {
        console.log(`[Supabase] Success inserting user with fallback role: ${altRole}`);
        return { error: null };
      }
      error = altErr;
    }
  }

  // Attempt 3: If status check constraint fails, try status fallback values
  if (getErrorString(error).includes("users_status_check") || getErrorString(error).includes("violates check constraint")) {
    const altStatuses = dbUser.status === "Ativo" 
      ? ["Ativo", "ativo", "Active"] 
      : ["Suspenso", "Inativo", "inativo", "Suspended"];

    for (const altStatus of altStatuses) {
      const testUser = { ...currentDbUser, status: altStatus };
      const { error: altErr } = await client.from("users").upsert(testUser);
      if (!altErr) {
        console.log(`[Supabase] Success inserting user with fallback status: ${altStatus}`);
        return { error: null };
      }
      error = altErr;
    }
  }

  return { error };
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
      const { error: insertErr } = await tryUpsertUserWithFallback(client, mapClientUserToDb(u));
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
    const { error } = await tryUpsertUserWithFallback(client, mapClientUserToDb(user));
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
        description: d.description,
        pdfUrl: d.pdf_url || d.pdfUrl,
        courseTypeId: d.tipo_curso_id || d.course_type_id || d.courseTypeId
      })) as Training[];
    }
    // Seed trainings table if empty only if users table is also completely empty (suggests first-time boot)
    const { data: userData } = await client.from("users").select("id").limit(1);
    const hasUsers = userData && userData.length > 0;

    if (!hasUsers) {
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
          description: t.description,
          pdf_url: t.pdfUrl,
          tipo_curso_id: t.courseTypeId
        });
        if (insertErr) handleAndLogDbError("seed-training", insertErr);
      }
      return localTrainings;
    }
    return [];
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
    let payload: any = {
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
    };
    payload.pdf_url = training.pdfUrl;
    payload.tipo_curso_id = training.courseTypeId;

    const { error } = await client.from("trainings").upsert(payload);
    if (error && (error.message.includes("column") || error.code === "42703")) {
      console.warn("[Supabase] Columns 'pdf_url' or 'tipo_curso_id' do not exist in trainings table. Falling back locally.");
      delete payload.pdf_url;
      delete payload.tipo_curso_id;
      const { error: retryError } = await client.from("trainings").upsert(payload);
      if (retryError) throw retryError;
    } else if (error) {
      throw error;
    }
  } catch (err) {
    handleAndLogDbError("upsertTraining", err);
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

// ==========================================
// COURSE TYPES (TIPO DE CURSO) OPERATIONS
// ==========================================

export async function getCourseTypes(): Promise<CourseType[]> {
  const client = getSupabaseClient();
  if (!client) return localCourseTypes;

  try {
    const { data, error } = await client.from("tipos_curso").select("*");
    if (error) {
      // If table doesnt work/exist, fallback to types in local memory
      if (error.code === "42P01") {
        console.warn("[Supabase] Table 'tipos_curso' not found. Falling back to local course types.");
        return localCourseTypes;
      }
      throw error;
    }
    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        name: d.nome || d.name,
        description: d.descricao || d.description
      })) as CourseType[];
    }
    // Seed
    for (const ct of localCourseTypes) {
      const { error: seedErr } = await client.from("tipos_curso").insert({
        id: ct.id,
        nome: ct.name,
        descricao: ct.description
      });
      if (seedErr && isTableMissingError(seedErr)) {
        console.log("[Supabase] Table 'tipos_curso' does not exist in schema. Skipping seed.");
        return localCourseTypes;
      }
    }
    return localCourseTypes;
  } catch (err) {
    handleAndLogDbError("getCourseTypes", err);
    return localCourseTypes;
  }
}

export async function upsertCourseType(ct: CourseType): Promise<CourseType> {
  const idx = localCourseTypes.findIndex((c) => c.id === ct.id);
  if (idx > -1) {
    localCourseTypes[idx] = ct;
  } else {
    localCourseTypes.push(ct);
  }

  const client = getSupabaseClient();
  if (!client) return ct;

  try {
    const { error } = await client.from("tipos_curso").upsert({
      id: ct.id,
      nome: ct.name,
      descricao: ct.description
    });
    if (error) {
      if (isTableMissingError(error)) {
        console.log("[Supabase] Table 'tipos_curso' does not exist in schema. Skipping database save.");
        return ct;
      }
      throw error;
    }
  } catch (err) {
    handleAndLogDbError("upsertCourseType", err);
  }
  return ct;
}

// ==========================================
// COURSE EVALUATIONS (QUESTOES & ALTERNATIVAS) OPERATIONS
// ==========================================

export async function getQuestions(courseId?: string): Promise<Question[]> {
  const client = getSupabaseClient();
  if (!client) {
    return courseId ? localQuestions.filter(q => q.courseId === courseId) : localQuestions;
  }

  try {
    // 1. Fetch questions
    let qQuery = client.from("questoes").select("*");
    if (courseId) {
      qQuery = qQuery.eq("curso_id", courseId);
    }
    const { data: qData, error: qError } = await qQuery;
    if (qError) {
      if (isTableMissingError(qError)) {
        console.warn("[Supabase] Table 'questoes' not found. Falling back to memory questions.");
        return courseId ? localQuestions.filter(q => q.courseId === courseId) : localQuestions;
      }
      throw qError;
    }

    if (!qData || qData.length === 0) {
      // Seed if empty and courseId matches t1
      if (courseId === "t1" || !courseId) {
        // Seed default questions
        for (const q of localQuestions) {
          const { error: insQErr } = await client.from("questoes").upsert({
            id: q.id,
            curso_id: q.courseId,
            enunciado: q.text
          });
          if (insQErr && isTableMissingError(insQErr)) {
            console.log("[Supabase] Table 'questoes' does not exist in schema. Skipping seed.");
            return courseId ? localQuestions.filter(q => q.courseId === courseId) : localQuestions;
          }

          for (const alt of q.alternatives) {
            const { error: insAErr } = await client.from("alternativas").upsert({
              id: alt.id,
              questao_id: q.id,
              texto: alt.text,
              correta: alt.isCorrect
            });
            if (insAErr && isTableMissingError(insAErr)) {
              console.log("[Supabase] Table 'alternativas' does not exist in schema. Skipping seed.");
              return courseId ? localQuestions.filter(q => q.courseId === courseId) : localQuestions;
            }
          }
        }
        return courseId ? localQuestions.filter(q => q.courseId === courseId) : localQuestions;
      }
      return [];
    }

    // 2. Fetch alternatives for each question
    const questionsList: Question[] = [];
    for (const row of qData) {
      const qId = row.id;
      const { data: altData, error: altError } = await client
        .from("alternativas")
        .select("*")
        .eq("questao_id", qId);
      
      const alternativesList = (altData || []).map((alt: any) => ({
        id: alt.id,
        text: alt.texto || alt.text,
        isCorrect: alt.correta !== undefined ? alt.correta : !!alt.isCorrect
      }));

      questionsList.push({
        id: row.id,
        courseId: row.curso_id || row.courseId,
        text: row.enunciado || row.text,
        alternatives: alternativesList,
        explanation: row.explicacao || row.explanation
      });
    }

    return questionsList;
  } catch (err) {
    handleAndLogDbError("getQuestions", err);
    return courseId ? localQuestions.filter(q => q.courseId === courseId) : localQuestions;
  }
}

export async function saveCourseQuestions(courseId: string, questions: Question[]): Promise<boolean> {
  // Update in local memory
  localQuestions = localQuestions.filter(q => q.courseId !== courseId).concat(questions);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    // Check if the 'questoes' table exists first to avoid unnecessary failures/error logs
    const { error: testErr } = await client.from("questoes").select("id").limit(1);
    if (testErr && isTableMissingError(testErr)) {
      console.log("[Supabase] Table 'questoes' does not exist in schema. Skipping database save, keeping in-memory.");
      return true;
    }

    // 1. Delete existing options for these questions
    const existingQOfCourse = await client.from("questoes").select("id").eq("curso_id", courseId);
    if (existingQOfCourse.error) {
      const qErr = existingQOfCourse.error;
      if (isTableMissingError(qErr)) {
        console.log("[Supabase] Table 'questoes' does not exist in schema. Skipping database save, keeping in-memory.");
        return true;
      }
    }

    if (existingQOfCourse.data && existingQOfCourse.data.length > 0) {
      const oldIds = existingQOfCourse.data.map((r: any) => r.id);
      await client.from("alternativas").delete().in("questao_id", oldIds);
      await client.from("questoes").delete().eq("curso_id", courseId);
    }

    // 2. Insert new questions and alternatives
    for (const q of questions) {
      const { error: qErr } = await client.from("questoes").insert({
        id: q.id,
        curso_id: courseId,
        enunciado: q.text,
        explicacao: q.explanation
      });
      if (qErr) {
        if (isTableMissingError(qErr)) {
          console.log("[Supabase] Table 'questoes' does not exist in schema. Skipping database save, keeping in-memory.");
          return true;
        }
        console.warn("[Supabase] Failed inserting question, trying fallback:", qErr.message);
        continue;
      }

      for (const alt of q.alternatives) {
        const { error: altErr } = await client.from("alternativas").insert({
          id: alt.id,
          questao_id: q.id,
          texto: alt.text,
          correta: alt.isCorrect
        });
        if (altErr && isTableMissingError(altErr)) {
          console.log("[Supabase] Table 'alternativas' does not exist in schema. Skipping database save, keeping in-memory.");
          return true;
        }
      }
    }
    return true;
  } catch (err) {
    handleAndLogDbError("saveCourseQuestions", err);
    // Return true because local memory was successfully updated anyway
    return true;
  }
}

export async function resetDatabase(): Promise<{ success: boolean; message: string }> {
  // 1. Reset in-memory state to only have admin and single tutorial course
  localUsers = [...INITIAL_USERS];
  localTrainings = [...INITIAL_TRAININGS];
  localActivities = [];
  localLogs = [];
  localCourseTypes = [...INITIAL_COURSE_TYPES];
  localQuestions = [...INITIAL_QUESTIONS];

  // 2. Clean Supabase tables if connected
  const client = getSupabaseClient();
  if (client) {
    try {
      // Clear activities
      await client.from("activities").delete().neq("id", "none_to_match_all");
      // Clear logs
      await client.from("system_logs").delete().neq("id", "none_to_match_all");
      // Clear users except admin '8291'
      await client.from("users").delete().neq("id", "8291");
      // Clear questions & alternatives
      try {
        await client.from("alternativas").delete().neq("id", "none_to_match_all");
        await client.from("questoes").delete().neq("id", "none_to_match_all");
        await client.from("tipos_curso").delete().neq("id", "none_to_match_all");
      } catch (e) {
        console.log("No extra evaluation tables found on reset.");
      }
      // Clear trainings completely (deleting 't1' as well)
      await client.from("trainings").delete().neq("id", "none_to_match_all");
      return { success: true, message: "Banco de dados sincronizado e limpo com sucesso." };
    } catch (err: any) {
      handleAndLogDbError("resetDatabase", err);
      return { success: false, message: "Erro ao resetar Supabase, mas memória foi limpa: " + err.message };
    }
  }

  return { success: true, message: "Modo In-Memory limpo e restaurado; mantido apenas admin e 1 treinamento." };
}
