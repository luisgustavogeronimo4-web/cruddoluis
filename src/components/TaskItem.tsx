import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Edit, Trash2, RotateCcw, Trash } from "lucide-react";
import type { Task } from "@/types/Task";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onRestore?: (task: Task) => void;
  onDeletePermanently?: (task: Task) => void;
  isDeleted?: boolean;
}

export const TaskItem = ({
  task,
  onEdit,
  onDelete,
  onRestore,
  onDeletePermanently,
  isDeleted = false,
}: TaskItemProps) => {
  return (
    <Card className="p-4 mb-3">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.deleted}
          className="mt-1"
        />
        <div className="flex-1">
          <h3 className={task.deleted ? "line-through text-gray-500" : "font-medium"}>
            {task.title}
          </h3>
          {task.description && (
            <p className={task.deleted ? "line-through text-gray-400 text-sm" : "text-sm text-gray-600"}>
              {task.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Created: {new Date(task.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-1">
          {isDeleted ? (
            <>
              {onRestore && (
                <Button variant="ghost" size="sm" onClick={() => onRestore(task)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              {onDeletePermanently && (
                <Button variant="ghost" size="sm" onClick={() => onDeletePermanently(task)}>
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(task)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};