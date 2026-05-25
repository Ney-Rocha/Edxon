import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User, Training, RecentActivity, SystemLog } from "../src/types";
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

export async function getUsers(): Promise<User[]> {
  const client = getSupabaseClient();
  if (!client) return localUsers;

  try {
    const { data, error } = await client.from("users").select("*");
    if (error) throw error;
    if (data && data.length > 0) {
      return data as User[];
    }
    // If Supabase table is empty, seed it with initial users
    for (const u of localUsers) {
      await client.from("users").upsert({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        avatar: u.avatar
      });
    }
    return localUsers;
  } catch (err) {
    console.error("[Supabase] getUsers error, using local fallback:", err);
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
    const { error } = await client.from("users").upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar
    });
    if (error) throw error;
  } catch (err) {
    console.error("[Supabase] upsertUser error:", err);
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
    console.error(`[Supabase] deleteUser error for id ${id}:`, err);
    return false;
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
      await client.from("trainings").upsert({
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
    }
    return localTrainings;
  } catch (err) {
    console.error("[Supabase] getTrainings error, using local fallback:", err);
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
    console.error("[Supabase] upsertTraining error:", err);
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
    console.error(`[Supabase] deleteTraining error for id ${id}:`, err);
    return false;
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
      await client.from("activities").insert({
        id: act.id,
        user_name: act.user.name,
        user_avatar: act.user.avatar,
        action: act.action,
        status: act.status,
        time: act.time,
      });
    }
    return localActivities;
  } catch (err) {
    console.error("[Supabase] getActivities error:", err);
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
    console.error("[Supabase] addActivity error:", err);
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
      await client.from("system_logs").insert({
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
    return localLogs;
  } catch (err) {
    console.error("[Supabase] getLogs error:", err);
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
    console.error("[Supabase] addLog error:", err);
  }
  return log;
}
