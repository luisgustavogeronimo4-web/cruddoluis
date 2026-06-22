import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskForm } from "@/components/TaskForm";
import { TaskItem } from "@/components/TaskItem";
import { ConfirmModal } from "@/components/ConfirmModal";
import { taskService } from "@/services/taskService";
import type { Task } from "@/types/Task";
import { toast } from "sonner";

export const Tasks = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [trashTasks, setTrashTasks] = useState<Task[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isPermanentlyDeleting, setIsPermanentlyDeleting] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");

  const loadTasks = async () => {
    if (!user?.id) {
      setActiveTasks([]);
      setTrashTasks([]);
      return;
    }
    try {
      const [active, deleted] = await Promise.all([
        taskService.getActive(user.id),
        taskService.getDeleted(user.id),
      ]);
      setActiveTasks(active);
      setTrashTasks(deleted);
    } catch (error: any) {
      console.error("loadTasks error:", error.message);
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user?.id]);

  const handleCreate = async (task: Omit<Task, "id" | "created_at" | "updated_at">) => {
    setIsCreating(true);
    try {
      await taskService.create(task, user?.id || "");
      toast.success("Task created successfully");
      await loadTasks();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await taskService.update(task.id, { is_completed: !task.is_completed });
      toast.success("Task status updated");
      await loadTasks();
    } catch {
      toast.error("Failed to update task status");
    }
  };

  const openConfirm = (title: string, description: string, action: () => void) => {
    setConfirmTitle(title);
    setConfirmDescription(description);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const handleUpdate = (task: Task) => {
    openConfirm(
      "Confirmar edição",
      "Deseja realmente alterar esta tarefa?",
      async () => {
        setIsUpdating(task.id);
        try {
          await taskService.update(task.id, {
            title: task.title,
            description: task.description,
            updated_at: new Date().toISOString(),
          });
          toast.success("Task updated successfully");
          await loadTasks();
        } catch {
          toast.error("Failed to update task");
        } finally {
          setIsUpdating(null);
        }
      },
    );
  };

  const handleDelete = (id: string) => {
    openConfirm(
      "Mover para lixeira",
      "Tem certeza que deseja mover esta tarefa para a lixeira?",
      async () => {
        setIsDeleting(id);
        try {
          await taskService.delete(id);
          toast.success("Task moved to trash");
          await loadTasks();
        } catch {
          toast.error("Failed to move to trash");
        } finally {
          setIsDeleting(null);
        }
      },
    );
  };

  const handleRestore = (id: string) => {
    openConfirm(
      "Restaurar tarefa",
      "Deseja realmente restaurar esta tarefa?",
      async () => {
        setIsRestoring(id);
        try {
          await taskService.restore(id);
          toast.success("Task restored successfully");
          await loadTasks();
        } catch {
          toast.error("Failed to restore task");
        } finally {
          setIsRestoring(null);
        }
      },
    );
  };

  const handlePermanentDelete = (id: string) => {
    openConfirm(
      "Excluir permanentemente",
      "Tem certeza que deseja excluir permanentemente esta tarefa?",
      async () => {
        setIsPermanentlyDeleting(id);
        try {
          await taskService.deletePermanently(id);
          toast.success("Task permanently deleted");
          await loadTasks();
        } catch {
          toast.error("Failed to permanently delete task");
        } finally {
          setIsPermanentlyDeleting(null);
        }
      },
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Task Manager</CardTitle>
            <CardDescription>
              Manage your tasks with create, read, update, and delete operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <TaskForm onSubmit={handleCreate} isSubmitting={isCreating} />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Active tasks */}
              <section className="md:w-1/2">
                <h2 className="text-lg font-medium mb-4">Active Tasks</h2>
                {activeTasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No tasks yet. Create your first task above!
                  </p>
                ) : (
                  activeTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onEdit={handleUpdate}
                      onDelete={() => handleDelete(task.id)}
                      onToggleComplete={handleToggleComplete}
                    />
                  ))
                )}
              </section>

              {/* Trash */}
              <section className="md:w-1/2">
                <h2 className="text-lg font-medium mb-4">Trash</h2>
                {trashTasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Trash is empty.</p>
                ) : (
                  trashTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onRestore={() => handleRestore(task.id)}
                      onDeletePermanently={() => handlePermanentDelete(task.id)}
                      onToggleComplete={handleToggleComplete}
                    />
                  ))
                )}
              </section>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Confirmation modal */}
      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        description={confirmDescription}
        onConfirm={confirmAction}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="default"
      />
    </main>
  );
};

export default Tasks;