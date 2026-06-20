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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { TaskList } from "@/components/TaskList";
import { TrashView } from "@/components/TrashView";
import { TaskModal } from "@/components/TaskModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { taskService } from "@/services/taskService";
import type { Task } from "@/types/Task";
import { toast } from "sonner";

export const Tasks = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "edit" | "delete" | "delete-permanently" | "restore";
    task: Task;
    onConfirm: () => void;
  } | null>(null);

  const loadTasks = () => {
    if (user?.id) {
      setActiveTasks(taskService.getActive(user.id));
      setDeletedTasks(taskService.getDeleted(user.id));
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user?.id]);

  const handleCreate = (task: { title: string; description?: string }) => {
    if (!user?.id) return;
    taskService.create(task, user.id);
    toast.success("Task created successfully");
    loadTasks();
    setIsModalOpen(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleUpdate = (task: { title: string; description?: string }) => {
    if (!editingTask) return;
    taskService.update(editingTask.id, task);
    toast.success("Task updated successfully");
    loadTasks();
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDelete = (task: Task) => {
    setConfirmAction({
      type: "delete",
      task,
      onConfirm: () => {
        taskService.delete(task.id);
        toast.success("Task moved to trash");
        loadTasks();
      },
    });
  };

  const handleRestore = (task: Task) => {
    setConfirmAction({
      type: "restore",
      task,
      onConfirm: () => {
        taskService.restore(task.id);
        toast.success("Task restored successfully");
        loadTasks();
      },
    });
  };

  const handleDeletePermanently = (task: Task) => {
    setConfirmAction({
      type: "delete-permanently",
      task,
      onConfirm: () => {
        taskService.deletePermanently(task.id);
        toast.success("Task permanently deleted");
        loadTasks();
      },
    });
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
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">Active Tasks</TabsTrigger>
                <TabsTrigger value="trash">Trash ({deletedTasks.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="mt-4">
                <div className="mb-4">
                  <Button onClick={() => setIsModalOpen(true)} className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                </div>
                <TaskList tasks={activeTasks} onEdit={handleEdit} onDelete={handleDelete} />
              </TabsContent>
              
              <TabsContent value="trash" className="mt-4">
                <TrashView
                  tasks={deletedTasks}
                  onRestore={handleRestore}
                  onDeletePermanently={handleDeletePermanently}
                />
              </TabsContent>
            </Tabs>
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

      <TaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={editingTask ? handleUpdate : handleCreate}
        initialData={editingTask ? { title: editingTask.title, description: editingTask.description } : undefined}
      />

      <ConfirmModal
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={
          confirmAction?.type === "delete"
            ? "Move to Trash"
            : confirmAction?.type === "restore"
            ? "Restore Task"
            : "Delete Permanently"
        }
        description={
          confirmAction?.type === "delete"
            ? "Are you sure you want to move this task to the trash?"
            : confirmAction?.type === "restore"
            ? "Are you sure you want to restore this task?"
            : "Are you sure you want to permanently delete this task? This action cannot be undone."
        }
        onConfirm={confirmAction?.onConfirm || (() => {})}
        confirmText={
          confirmAction?.type === "delete"
            ? "Move to Trash"
            : confirmAction?.type === "restore"
            ? "Restore"
            : "Delete Permanently"
        }
        variant={confirmAction?.type === "delete-permanently" ? "destructive" : "default"}
      />
    </main>
  );
};

export default Tasks;