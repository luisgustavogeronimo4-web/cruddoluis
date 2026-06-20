import { TaskItem } from "./TaskItem";
import type { Task } from "@/types/Task";

interface TrashViewProps {
  tasks: Task[];
  onRestore: (task: Task) => void;
  onDeletePermanently: (task: Task) => void;
}

export const TrashView = ({ tasks, onRestore, onDeletePermanently }: TrashViewProps) => {
  if (tasks.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Trash is empty.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onRestore={onRestore}
          onDeletePermanently={onDeletePermanently}
          isDeleted
        />
      ))}
    </div>
  );
};