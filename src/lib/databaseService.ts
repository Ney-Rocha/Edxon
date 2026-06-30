import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User, Training, RecentActivity, SystemLog, CourseType, Question, Role, UserStatus } from "../types";
import { INITIAL_USERS, INITIAL_TRAININGS, INITIAL_ACTIVITIES, INITIAL_SYSTEM_LOGS, INITIAL_COURSE_TYPES, INITIAL_QUESTIONS } from "../data";

// Fallback values from env example or runtime values
const URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://doaqyvaaqlrjxqtsvtqy.supabase.co";
const KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_UM0T0-kFoVMQviFI-nn0Qw_JUKQ1OUc";

let supabaseDirect: SupabaseClient | null = null;
let mode: 'proxy' | 'direct' | 'memory' = 'memory';

// Safe, persistent in-memory fallbacks inside client memory
const isBrowser = typeof window !== 'undefined';

function getStoredOrDefault<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredValue<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("[DatabaseService] localStorage error:", e);
  }
}

let localUsers: User[] = getStoredOrDefault("edxon_local_users", [...INITIAL_USERS]);
let localTrainings: Training[] = getStoredOrDefault("edxon_local_trainings", [...INITIAL_TRAININGS]);
let localActivities: RecentActivity[] = getStoredOrDefault("edxon_local_activities", [...INITIAL_ACTIVITIES]);
let localLogs: SystemLog[] = getStoredOrDefault("edxon_local_logs", [...INITIAL_SYSTEM_LOGS]);
let localCourseTypes: CourseType[] = getStoredOrDefault("edxon_local_course_types", [...INITIAL_COURSE_TYPES]);
let localQuestions: Question[] = getStoredOrDefault("edxon_local_questions", [...INITIAL_QUESTIONS]);

if (URL && KEY && URL !== "" && KEY !== "") {
  try {
    supabaseDirect = createClient(URL, KEY, {
      auth: { persistSession: false }
    });
  } catch (e) {
    console.error("[DatabaseService] Failed to initialize direct client-side Supabase:", e);
  }
}

export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code?.startsWith("PGRST")) return true;
  const msg = (error.message || "").toLowerCase();
  return msg.includes("could not find the table") || msg.includes("does not exist") || msg.includes("relation") || msg.includes("schema cache");
}

// Map functions to translate DB constraints securely
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
  const dbRole = clientUser.role === "admin" ? "admin" : "usuario";
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

// Fallback user insertion matching check constraints
async function tryUpsertUserWithFallback(client: SupabaseClient, dbUser: any): Promise<{ error: any }> {
  let currentDbUser = { ...dbUser };
  let { error } = await client.from("users").upsert(currentDbUser);
  if (!error) return { error: null };

  const errMsg = error.message || JSON.stringify(error) || "";
  if (errMsg.includes("users_role_check") || errMsg.includes("violates check constraint")) {
    const altRoles = dbUser.role === "admin" ? ["Admin", "Administrador"] : ["Usuário", "usuario", "Usuario"];
    for (const altRole of altRoles) {
      const { error: altErr } = await client.from("users").upsert({ ...currentDbUser, role: altRole });
      if (!altErr) return { error: null };
      error = altErr;
    }
  }

  if (errMsg.includes("users_status_check") || errMsg.includes("violates check constraint")) {
    const altStatuses = dbUser.status === "Ativo" ? ["Ativo", "ativo"] : ["Suspenso", "Inativo"];
    for (const altStatus of altStatuses) {
      const { error: altErr } = await client.from("users").upsert({ ...currentDbUser, status: altStatus });
      if (!altErr) return { error: null };
      error = altErr;
    }
  }
  return { error };
}

// Connection initialization sequence
export async function initConnection(): Promise<{ mode: 'proxy' | 'direct' | 'memory', configured: boolean }> {
  // 1. Check if server-side proxy is running and responding
  try {
    const res = await fetch("/api/db/status");
    if (res.ok) {
      const data = await res.json();
      if (data && data.configured) {
        mode = 'proxy';
        console.log("[DatabaseService] Connected successfully via Server-Side Proxy.");
        return { mode: 'proxy', configured: true };
      }
    }
  } catch (e) {
    console.warn("[DatabaseService] Proxy connection failed or unreachable. Testing direct client-side Supabase...");
  }

  // 2. Fallback to direct client-side Supabase connection if keys exist
  if (supabaseDirect) {
    try {
      const { error } = await supabaseDirect.from("users").select("id").limit(1);
      if (!error) {
        mode = 'direct';
        console.log("[DatabaseService] Connected successfully DIRECTLY via browser client.");
        return { mode: 'direct', configured: true };
      } else {
        console.warn("[DatabaseService] Direct connection allowed but table error received:", error.message);
        // If it's a structural error (tables not created yet), we are still configured!
        if (error.code === "42P01" || error.code === "PGRST111" || error.message.includes("does not exist")) {
          mode = 'direct';
          return { mode: 'direct', configured: true };
        }
      }
    } catch (e) {
      console.error("[DatabaseService] Direct connection test failed:", e);
    }
  }

  // 3. Fallback to local memory model
  mode = 'memory';
  console.log("[DatabaseService] Working in sandbox local in-memory mode.");
  return { mode: 'memory', configured: false };
}

export function getDatabaseMode(): 'proxy' | 'direct' | 'memory' {
  return mode;
}

// ==========================================
// USER CRUD OPERATIONS
// ==========================================

export async function getUsers(): Promise<User[]> {
  if (mode === 'proxy') {
    return fetch("/api/db/users").then(r => r.json());
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      const { data, error } = await supabaseDirect.from("users").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        localUsers = data.map(mapDbUserToClient);
        setStoredValue("edxon_local_users", localUsers);
        return localUsers;
      }
      // Seed table
      for (const u of localUsers) {
        await tryUpsertUserWithFallback(supabaseDirect, mapClientUserToDb(u));
      }
      setStoredValue("edxon_local_users", localUsers);
      return localUsers;
    } catch (e) {
      console.error("[DatabaseService] Direct getUsers error:", e);
      return localUsers;
    }
  } else {
    return localUsers;
  }
}

export async function upsertUser(user: User): Promise<User> {
  const idx = localUsers.findIndex(u => u.id === user.id);
  if (idx > -1) localUsers[idx] = user;
  else localUsers.unshift(user);
  setStoredValue("edxon_local_users", localUsers);

  if (mode === 'proxy') {
    return fetch("/api/db/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    }).then(r => r.json());
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      const { error } = await tryUpsertUserWithFallback(supabaseDirect, mapClientUserToDb(user));
      if (error) throw error;
    } catch (e) {
      console.error("[DatabaseService] Direct upsertUser error:", e);
      throw e;
    }
  }
  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  localUsers = localUsers.filter(u => u.id !== id);
  setStoredValue("edxon_local_users", localUsers);

  if (mode === 'proxy') {
    return fetch(`/api/db/users/${id}`, { method: "DELETE" }).then(r => r.json().then(d => !!d.success));
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      const { error } = await supabaseDirect.from("users").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("[DatabaseService] Direct deleteUser error:", e);
      throw e;
    }
  }
  return true;
}

// ==========================================
// TRAINING CRUD OPERATIONS
// ==========================================

export async function getTrainings(): Promise<Training[]> {
  if (mode === 'proxy') {
    return fetch("/api/db/trainings").then(r => r.json());
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      const { data, error } = await supabaseDirect.from("trainings").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        localTrainings = data.map((d: any) => ({
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
        setStoredValue("edxon_local_trainings", localTrainings);
        return localTrainings;
      }
      
      // Prevent blind re-seeding if the database was intentionally emptied: 
      // Only seed courses automatically if the users table is also completely empty.
      const { data: userData } = await supabaseDirect.from("users").select("id").limit(1);
      const hasUserData = userData && userData.length > 0;
      
      if (!hasUserData) {
        // Seed table
        for (const t of localTrainings) {
          await supabaseDirect.from("trainings").upsert({
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
        }
        setStoredValue("edxon_local_trainings", localTrainings);
        return localTrainings;
      }
      return [];
    } catch (e) {
      console.error("[DatabaseService] Direct getTrainings failed:", e);
      return localTrainings;
    }
  } else {
    return localTrainings;
  }
}

export async function upsertTraining(training: Training): Promise<Training> {
  const idx = localTrainings.findIndex(t => t.id === training.id);
  if (idx > -1) localTrainings[idx] = training;
  else localTrainings.unshift(training);
  setStoredValue("edxon_local_trainings", localTrainings);

  if (mode === 'proxy') {
    return fetch("/api/db/trainings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(training)
    }).then(r => r.json());
  } else if (mode === 'direct' && supabaseDirect) {
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
        description: training.description,
        pdf_url: training.pdfUrl,
        tipo_curso_id: training.courseTypeId
      };
      const { error } = await supabaseDirect.from("trainings").upsert(payload);
      if (error && (error.message.includes("column") || error.code === "42703")) {
        delete payload.pdf_url;
        delete payload.tipo_curso_id;
        const { error: retryError } = await supabaseDirect.from("trainings").upsert(payload);
        if (retryError) throw retryError;
      } else if (error) {
        throw error;
      }
    } catch (e) {
      console.error("[DatabaseService] Direct upsertTraining failed:", e);
      throw e;
    }
  }
  return training;
}

export async function deleteTraining(id: string): Promise<boolean> {
  localTrainings = localTrainings.filter(t => t.id !== id);
  setStoredValue("edxon_local_trainings", localTrainings);

  if (mode === 'proxy') {
    return fetch(`/api/db/trainings/${id}`, { method: "DELETE" }).then(r => r.json().then(d => !!d.success));
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      const { error } = await supabaseDirect.from("trainings").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("[DatabaseService] Direct deleteTraining failed:", e);
      throw e;
    }
  }
  return true;
}

// ==========================================
// RECENT ACTIVITIES OPERATIONS
// ==========================================

export async function getActivities(): Promise<RecentActivity[]> {
  if (mode === 'proxy') {
    return fetch("/api/db/activities").then(r => r.json());
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      const { data, error } = await supabaseDirect
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        localActivities = data.map((d: any) => ({
          id: d.id,
          user: {
            name: d.user_name || d.user?.name,
            avatar: d.user_avatar || d.user?.avatar,
          },
          action: d.action,
          status: d.status,
          time: d.time,
        })) as RecentActivity[];
        setStoredValue("edxon_local_activities", localActivities);
        return localActivities;
      }
      for (const act of localActivities) {
        await supabaseDirect.from("activities").insert({
          id: act.id,
          user_name: act.user.name,
          user_avatar: act.user.avatar,
          action: act.action,
          status: act.status,
          time: act.time,
        });
      }
      setStoredValue("edxon_local_activities", localActivities);
      return localActivities;
    } catch (e) {
      console.error("[DatabaseService] Direct getActivities failed:", e);
      return localActivities;
    }
  } else {
    return localActivities;
  }
}

export async function addActivity(act: RecentActivity): Promise<RecentActivity> {
  localActivities.unshift(act);
  if (localActivities.length > 30) localActivities.pop();
  setStoredValue("edxon_local_activities", localActivities);

  if (mode === 'proxy') {
    return fetch("/api/db/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(act)
    }).then(r => r.json());
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      await supabaseDirect.from("activities").insert({
        id: act.id,
        user_name: act.user.name,
        user_avatar: act.user.avatar,
        action: act.action,
        status: act.status,
        time: act.time,
      });
    } catch (e) {
      console.error("[DatabaseService] Direct addActivity failed:", e);
    }
  }
  return act;
}

// ==========================================
// SYSTEM LOGS OPERATIONS
// ==========================================

export async function getLogs(): Promise<SystemLog[]> {
  if (mode === 'proxy') {
    return fetch("/api/db/logs").then(r => r.json());
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      const { data, error } = await supabaseDirect
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        localLogs = data.map((d: any) => ({
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
        setStoredValue("edxon_local_logs", localLogs);
        return localLogs;
      }
      for (const log of localLogs) {
        await supabaseDirect.from("system_logs").insert({
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
      }
      setStoredValue("edxon_local_logs", localLogs);
      return localLogs;
    } catch (e) {
      console.error("[DatabaseService] Direct getLogs failed:", e);
      return localLogs;
    }
  } else {
    return localLogs;
  }
}

export async function addLog(log: SystemLog): Promise<SystemLog> {
  localLogs.unshift(log);
  if (localLogs.length > 40) localLogs.pop();
  setStoredValue("edxon_local_logs", localLogs);

  if (mode === 'proxy') {
    return fetch("/api/db/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log)
    }).then(r => r.json());
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      await supabaseDirect.from("system_logs").insert({
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
    } catch (e) {
      console.error("[DatabaseService] Direct addLog failed:", e);
    }
  }
  return log;
}

// ==========================================
// COURSE TYPES OPERATIONS
// ==========================================

export async function getCourseTypes(): Promise<CourseType[]> {
  if (mode === 'proxy') {
    return fetch("/api/db/course-types").then(r => r.json());
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      const { data, error } = await supabaseDirect.from("tipos_curso").select("*");
      if (error) {
        if (isTableMissingError(error)) return localCourseTypes;
        throw error;
      }
      if (data && data.length > 0) {
        localCourseTypes = data.map((d: any) => ({
          id: d.id,
          name: d.nome || d.name,
          description: d.descricao || d.description
        })) as CourseType[];
        return localCourseTypes;
      }
      for (const ct of localCourseTypes) {
        const { error: seedErr } = await supabaseDirect.from("tipos_curso").insert({
          id: ct.id,
          nome: ct.name,
          descricao: ct.description
        });
        if (seedErr && isTableMissingError(seedErr)) {
          return localCourseTypes;
        }
      }
      return localCourseTypes;
    } catch (e) {
      console.error("[DatabaseService] Direct getCourseTypes failed:", e);
      return localCourseTypes;
    }
  } else {
    return localCourseTypes;
  }
}

export async function upsertCourseType(ct: CourseType): Promise<CourseType> {
  const idx = localCourseTypes.findIndex(c => c.id === ct.id);
  if (idx > -1) localCourseTypes[idx] = ct;
  else localCourseTypes.push(ct);

  if (mode === 'proxy') {
    return fetch("/api/db/course-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ct)
    }).then(r => r.json());
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      const { error } = await supabaseDirect.from("tipos_curso").upsert({
        id: ct.id,
        nome: ct.name,
        descricao: ct.description
      });
      if (error && isTableMissingError(error)) {
        console.log("[DatabaseService] Table 'tipos_curso' does not exist in schema. Skipping direct database save.");
      }
    } catch (e) {
      console.error("[DatabaseService] Direct upsertCourseType failed:", e);
    }
  }
  return ct;
}

// ==========================================
// EVALUATION / QUESTIONS OPERATIONS
// ==========================================

export async function getQuestions(courseId?: string): Promise<Question[]> {
  if (mode === 'proxy') {
    const qUrl = courseId ? `/api/db/questions?courseId=${courseId}` : "/api/db/questions";
    return fetch(qUrl).then(r => r.json());
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      let qQuery = supabaseDirect.from("questoes").select("*");
      if (courseId) {
        qQuery = qQuery.eq("curso_id", courseId);
      }
      const { data: qData, error: qError } = await qQuery;
      if (qError) {
        if (isTableMissingError(qError)) {
          return courseId ? localQuestions.filter(q => q.courseId === courseId) : localQuestions;
        }
        throw qError;
      }

      if (!qData || qData.length === 0) {
        if (courseId === "t1" || !courseId) {
          for (const q of localQuestions) {
            const { error: insQErr } = await supabaseDirect.from("questoes").upsert({
              id: q.id,
              curso_id: q.courseId,
              enunciado: q.text
            });
            if (insQErr && isTableMissingError(insQErr)) {
              return courseId ? localQuestions.filter(q => q.courseId === courseId) : localQuestions;
            }

            for (const alt of q.alternatives) {
              const { error: insAErr } = await supabaseDirect.from("alternativas").upsert({
                id: alt.id,
                questao_id: q.id,
                texto: alt.text,
                correta: alt.isCorrect
              });
              if (insAErr && isTableMissingError(insAErr)) {
                return courseId ? localQuestions.filter(q => q.courseId === courseId) : localQuestions;
              }
            }
          }
          return courseId ? localQuestions.filter(q => q.courseId === courseId) : localQuestions;
        }
        return [];
      }

      const questionsList: Question[] = [];
      for (const row of qData) {
        const qId = row.id;
        const { data: altData } = await supabaseDirect
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
    } catch (e) {
      console.error("[DatabaseService] Direct getQuestions failed:", e);
      return courseId ? localQuestions.filter(q => q.courseId === courseId) : localQuestions;
    }
  } else {
    return courseId ? localQuestions.filter(q => q.courseId === courseId) : localQuestions;
  }
}

export async function saveCourseQuestions(courseId: string, questionsList: Question[]): Promise<boolean> {
  localQuestions = localQuestions.filter(q => q.courseId !== courseId).concat(questionsList);

  if (mode === 'proxy') {
    return fetch(`/api/db/questions/${courseId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionsList)
    }).then(r => r.json().then(d => !!d.success));
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      // Check if table exists
      const { error: testErr } = await supabaseDirect.from("questoes").select("id").limit(1);
      if (testErr && isTableMissingError(testErr)) {
        console.log("[DatabaseService] Table 'questoes' does not exist in schema. Skipping direct database save, keeping in-memory.");
        return true;
      }

      const existingQOfCourse = await supabaseDirect.from("questoes").select("id").eq("curso_id", courseId);
      if (existingQOfCourse.error) {
        const qErr = existingQOfCourse.error;
        if (isTableMissingError(qErr)) {
          console.log("[DatabaseService] Table 'questoes' does not exist in schema. Skipping direct database save, keeping in-memory.");
          return true;
        }
      }

      if (existingQOfCourse.data && existingQOfCourse.data.length > 0) {
        const oldIds = existingQOfCourse.data.map((r: any) => r.id);
        await supabaseDirect.from("alternativas").delete().in("questao_id", oldIds);
        await supabaseDirect.from("questoes").delete().eq("curso_id", courseId);
      }

      for (const q of questionsList) {
        const { error: qErr } = await supabaseDirect.from("questoes").insert({
          id: q.id,
          curso_id: courseId,
          enunciado: q.text,
          explicacao: q.explanation
        });
        if (qErr) {
          if (isTableMissingError(qErr)) {
            console.log("[DatabaseService] Table 'questoes' does not exist in schema. Skipping direct database save, keeping in-memory.");
            return true;
          }
          console.warn("[DatabaseService] Failed inserting question:", qErr.message);
          continue;
        }

        for (const alt of q.alternatives) {
          const { error: altErr } = await supabaseDirect.from("alternativas").insert({
            id: alt.id,
            questao_id: q.id,
            texto: alt.text,
            correta: alt.isCorrect
          });
          if (altErr && isTableMissingError(altErr)) {
            console.log("[DatabaseService] Table 'alternativas' does not exist in schema. Skipping direct database save, keeping in-memory.");
            return true;
          }
        }
      }
      return true;
    } catch (e) {
      console.error("[DatabaseService] Direct saveCourseQuestions failed:", e);
      return true;
    }
  }
  return true;
}

// ==========================================
// FILE UPLOAD OPERATION
// ==========================================

export async function uploadFile(fileBase64: string, fileName: string, fileType?: string): Promise<{ publicUrl: string }> {
  if (mode === 'proxy') {
    return fetch("/api/db/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileBase64, fileName, fileType })
    }).then(r => r.json()).then(data => ({
      publicUrl: data?.publicUrl || data?.url || ""
    }));
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      const byteCharacters = atob(fileBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: fileType || "application/pdf" });
      
      const fileExt = fileName.split('.').pop() || 'pdf';
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now() + "." + fileExt;
      
      const { error } = await supabaseDirect.storage
        .from("training-materials")
        .upload(cleanFileName, blob, {
          contentType: fileType || "application/pdf",
          upsert: true
        });

      if (error) throw error;

      const { data: urlData } = supabaseDirect.storage
        .from("training-materials")
        .getPublicUrl(cleanFileName);

      return { publicUrl: urlData.publicUrl };
    } catch (e) {
      console.error("[DatabaseService] Storage upload failed, fallback to base64 URI:", e);
    }
  }
  
  // Local/fallback data URI
  const dataUri = `data:${fileType || "application/pdf"};base64,${fileBase64}`;
  return { publicUrl: dataUri };
}

// ==========================================
// RESET DATABASE OPERATION
// ==========================================

export async function resetDatabase(): Promise<{ success: boolean; message: string }> {
  localUsers = [...INITIAL_USERS];
  localTrainings = [...INITIAL_TRAININGS];
  localActivities = [];
  localLogs = [];
  localCourseTypes = [...INITIAL_COURSE_TYPES];
  localQuestions = [...INITIAL_QUESTIONS];

  if (isBrowser) {
    localStorage.removeItem("edxon_local_users");
    localStorage.removeItem("edxon_local_trainings");
    localStorage.removeItem("edxon_local_activities");
    localStorage.removeItem("edxon_local_logs");
    localStorage.removeItem("edxon_local_course_types");
    localStorage.removeItem("edxon_local_questions");
  }

  if (mode === 'proxy') {
    return fetch("/api/db/reset", { method: "POST" }).then(r => r.json());
  } else if (mode === 'direct' && supabaseDirect) {
    try {
      await supabaseDirect.from("activities").delete().neq("id", "none_to_match_all");
      await supabaseDirect.from("system_logs").delete().neq("id", "none_to_match_all");
      await supabaseDirect.from("users").delete().neq("id", "8291");
      try {
        await supabaseDirect.from("alternativas").delete().neq("id", "none_to_match_all");
        await supabaseDirect.from("questoes").delete().neq("id", "none_to_match_all");
        await supabaseDirect.from("tipos_curso").delete().neq("id", "none_to_match_all");
      } catch (e) {
        console.log("No extra evaluation tables found on direct reset.");
      }
      await supabaseDirect.from("trainings").delete().neq("id", "none_to_match_all");
      return { success: true, message: "Banco de dados sincronizado e limpo com sucesso." };
    } catch (e: any) {
      return { success: false, message: "Erro ao resetar Supabase, mas memória foi limpa: " + e.message };
    }
  }
  return { success: true, message: "Modo In-Memory limpo e restaurado com sucesso." };
}
