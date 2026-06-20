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
import { taskService } from "@/services/taskService";
import type { Task } from "@/types/Task";
import { toast } from "sonner";

export const Tasks = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const loadTasks = () => {
    if (user?.id) {
      setTasks(taskService.getActive(user.id));
    } else {
      setTasks([]);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user?.id]);

  const handleCreate = (task: Omit<Task, "id" | "createdAt">) => {
    setIsCreating(true);
    try {
      if (user?.id) {
        taskService.create(task, user.id);
        toast.success("Task created successfully");
        loadTasks();
      }
    } catch {
      toast.error("Failed to create task");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = (updatedTask: Task) => {
    try {
      taskService.update(updatedTask.id, updatedTask);
      toast.success("Task updated successfully");
      loadTasks();
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = (id: string) => {
    try {
      taskService.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted successfully");
    } catch {
      toast.error("Failed to delete task");
    }
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
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tasks yet. Create your first task above!</p>
              ) : (
                tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))
              )}
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
    </main>
  );
};

export default Tasks;