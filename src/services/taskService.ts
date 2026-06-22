import { createClient } from "@supabase/supabase-js";
import type { Task } from "@/types/Task";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "https://seu-projeto.supabase.co";
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || "anon";
const supabase = createClient(supabaseUrl, supabaseKey);

export const taskService = {
  async getActive(userId: string): Promise<Task[]> {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    return data || [];
  },

  async getDeleted(userId: string): Promise<Task[]> {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", true)
      .order("created_at", { ascending: false });
    return data || [];
  },

  async create(task: Omit<Task, "id" | "createdAt" | "updatedAt">, userId: string): Promise<Task> {
    const { data } = await supabase
      .from("tasks")
      .insert({
        ...task,
        user_id: userId,
        is_deleted: false,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();
    return data[0];
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const { data } = await supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();
    return data?.[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const { count } = await supabase
      .from("tasks")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    return count > 0;
  },

  async deletePermanently(id: string): Promise<boolean> {
    const { count } = await supabase.from("tasks").delete().eq("id", id);
    return count > 0;
  },

  async restore(id: string): Promise<boolean> {
    const { count } = await supabase
      .from("tasks")
      .update({ is_deleted: false, updated_at: new Date().toISOString() })
      .eq("id", id);
    return count > 0;
  },
};
</dyad-chat-summary>Instalado @supabase/supabase-js e corrigido import no taskService.ts
<dyad-chat-summary>Corrigido pacote Supabase e import do service</dyad-chat-summary><dyad-write path="src/services/taskService.ts" description="Fix import and ensure Supabase client">
import { createClient } from "@supabase/supabase-js";
import type { Task } from "@/types/Task";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "https://seu-projeto.supabase.co";
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || "anon";
const supabase = createClient(supabaseUrl, supabaseKey);

export const taskService = {
  async getActive(userId: string): Promise<Task[]> {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    return data || [];
  },

  async getDeleted(userId: string): Promise<Task[]> {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", true)
      .order("created_at", { ascending: false });
    return data || [];
  },

  async create(task: Omit<Task, "id" | "createdAt" | "updatedAt">, userId: string): Promise<Task> {
    const { data } = await supabase
      .from("tasks")
      .insert({
        ...task,
        user_id: userId,
        is_deleted: false,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();
    return data[0];
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const { data } = await supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();
    return data?.[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const { count } = await supabase
      .from("tasks")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    return count > 0;
  },

  async deletePermanently(id: string): Promise<boolean> {
    const { count } = await supabase.from("tasks").delete().eq("id", id);
    return count > 0;
  },

  async restore(id: string): Promise<boolean> {
    const { count } = await supabase
      .from("tasks")
      .update({ is_deleted: false, updated_at: new Date().toISOString() })
      .eq("id", id);
    return count > 0;
  },
};