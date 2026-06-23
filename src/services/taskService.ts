import { supabase } from "@/lib/supabase";
import type { Task } from "@/types/Task";

const TABLE_NAME = "tasks";

/**
 * Helper to obtain the current logged‑in user id from Supabase.
 * Throws if no user is authenticated so that RLS policies receive a valid session.
 */
async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Supabase auth error:", error.message);
    throw new Error("Usuário não autenticado. Faça login novamente.");
  }
  if (!data?.user?.id) {
    throw new Error("Usuário não autenticado. Faça login novamente.");
  }
  return data.user.id;
}

export const taskService = {
  /** Fetch tasks that are not soft‑deleted */
  async getActive(): Promise<Task[]> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null) // apenas não‑deletadas
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getActive error:", error.message);
      return [];
    }
    
    // CORRIGIDO: alterado de is_completed para completed de acordo com o banco de dados
    return (data || []).filter((t) => t && !t.completed);
  },

  /** Fetch tasks that are in the trash (soft‑deleted) */
  async getDeleted(): Promise<Task[]> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", userId)
      .not("deleted_at", "is", null) // deleted_at NÃO é nulo
      .order("deleted_at", { ascending: false });

    if (error) {
      console.error("getDeleted error:", error.message);
      return [];
    }
    return data || [];
  },

  /** Create a new task, attaching the logged‑in user id */
  async create(
    task: Omit<Task, "id" | "created_at" | "updated_at" | "user_id" | "deleted_at">,
  ): Promise<Task> {
    const userId = await getCurrentUserId();

    // CORRIGIDO: Adicionado .select().single() para que o Supabase retorne os dados salvos ao React
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({ ...task, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error("create error:", error.message);
      throw error;
    }
    return data as Task;
  },

  /** Update a task by its id – also enforce user ownership */
  async update(
    taskId: string,
    updates: Partial<Omit<Task, "id" | "created_at" | "updated_at" | "user_id">>,
  ): Promise<Task> {
    const userId = await getCurrentUserId();

    // CORRIGIDO: Adicionado .select().single() para atualizar o estado local instantaneamente sem refresh
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq("id", taskId)
      .eq("user_id", userId) // Segurança do RLS
      .select()
      .single();

    if (error) {
      console.error("update error:", error.message);
      throw error;
    }
    return data as Task;
  },

  /** Soft‑delete: set `deleted_at` to current timestamp – enforce ownership */
  async softDelete(taskId: string): Promise<boolean> {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) {
      console.error("softDelete error:", error.message);
      return false;
    }
    return true;
  },

  /** Restore a soft‑deleted task – enforce ownership */
  async restore(taskId: string): Promise<boolean> {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ deleted_at: null })
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) {
      console.error("restore error:", error.message);
      return false;
    }
    return true;
  },

  /** Permanently delete a row – enforce ownership */
  async deletePermanently(taskId: string): Promise<boolean> {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) {
      console.error("deletePermanently error:", error.message);
      return false;
    }
    return true;
  },
};