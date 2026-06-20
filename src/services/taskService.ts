import type { Task } from "@/types/Task";

const TASKS_STORAGE_KEY = "tasks";

export const taskService = {
  getAll: (userId?: string): Task[] => {
    const stored = window.localStorage.getItem(TASKS_STORAGE_KEY);
    const allTasks = stored ? JSON.parse(stored) as Task[] : [];
    if (userId) {
      return allTasks.filter((t) => t.userId === userId);
    }
    return allTasks;
  },

  getById: (id: string): Task | undefined => {
    const tasks = taskService.getAll();
    return tasks.find((t) => t.id === id);
  },

  create: (task: Omit<Task, "id" | "createdAt" | "deleted">, userId: string): Task => {
    const tasks = taskService.getAll();
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      deleted: false,
      ...task,
      userId,
    };
    const updated = [...tasks, newTask];
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    return newTask;
  },

  update: (id: string, updates: Partial<Task>): Task | null => {
    const tasks = taskService.getAll();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    tasks[index] = { 
      ...tasks[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    return tasks[index];
  },

  delete: (id: string): boolean => {
    return !!taskService.update(id, { deleted: true });
  },

  restore: (id: string): Task | null => {
    return taskService.update(id, { deleted: false });
  },

  deletePermanently: (id: string): boolean => {
    const tasks = taskService.getAll();
    const filtered = tasks.filter((t) => t.id !== id);
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  getActive: (userId?: string): Task[] => {
    return taskService.getAll(userId).filter((t) => !t.deleted);
  },

  getDeleted: (userId?: string): Task[] => {
    return taskService.getAll(userId).filter((t) => t.deleted);
  },
};