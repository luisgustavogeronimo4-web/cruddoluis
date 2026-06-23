import { supabase } from "@/lib/supabase";
import type { Task } from "@/types/Task";

const TABLE_NAME = "tasks";

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
  async getActive(): Promise<Task[]> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getActive error:", error.message);
      return [];
    }
    
    return (data || []).filter((t) => t && !t.completed);
  },

  async getDeleted(): Promise<Task[]> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", userId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    if (error) {
      console.error("getDeleted error:", error.message);
      return [];
    }
    return data || [];
  },

  async create(
    task: Omit<Task, "id" | "created_at" | "updated_at" | "user_id" | "deleted_at">,
  ): Promise<Task> {
    const userId = await getCurrentUserId();

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

  async update(
    taskId: string,
    updates: Partial<Omit<Task, "id" | "created_at" | "updated_at" | "user_id">>,
  ): Promise<Task> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq("id", taskId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("update error:", error.message);
      throw error;
    }
    return data as Task;
  },

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