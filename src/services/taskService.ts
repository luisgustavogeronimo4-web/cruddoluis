import { supabase } from "@/lib/supabase";
import type { Task } from "@/types/Task";

const TABLE_NAME = "tasks";

/**
 * Helper to obtain the current logged‑in user id from Supabase.
 */
async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Supabase auth error:", error.message);
    return null;
  }
  return data?.user?.id ?? null;
}

export const taskService = {
  /** Fetch tasks that are not soft‑deleted */
  async getActive(): Promise<Task[]> {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null) // only not‑deleted
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getActive error:", error.message);
      return [];
    }
    return data || [];
  },

  /** Fetch tasks that are in the trash (soft‑deleted) */
  async getDeleted(): Promise<Task[]> {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", userId)
      .not("deleted_at", "is", null) // deleted_at NOT NULL
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
  ): Promise<Task | null> {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error("Cannot create task: no authenticated user");
      return null;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({ ...task, user_id: userId })
      .single();

    if (error) {
      console.error("create error:", error.message);
      return null;
    }
    return data;
  },

  /** Update a task by its id */
  async update(
    taskId: string,
    updates: Partial<Omit<Task, "id" | "created_at" | "updated_at" | "user_id">>,
  ): Promise<Task | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq("id", taskId)
      .single();

    if (error) {
      console.error("update error:", error.message);
      return null;
    }
    return data;
  },

  /** Soft‑delete: set `deleted_at` to current timestamp */
  async softDelete(taskId: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", taskId);

    if (error) {
      console.error("softDelete error:", error.message);
      return false;
    }
    return true;
  },

  /** Restore a soft‑deleted task (set `deleted_at` back to null) */
  async restore(taskId: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ deleted_at: null })
      .eq("id", taskId);

    if (error) {
      console.error("restore error:", error.message);
      return false;
    }
    return true;
  },

  /** Permanently delete a row (hard delete) */
  async deletePermanently(taskId: string): Promise<boolean> {
    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", taskId);
    if (error) {
      console.error("deletePermanently error:", error.message);
      return false;
    }
    return true;
  },
};