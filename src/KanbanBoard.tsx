import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "./types";
import "./Kanban.css";

interface KanbanCardProps {
  task: Task;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

function KanbanCard({ task, onComplete, onDelete }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card"
    >
      <div className="kanban-card-header">
        <h4>{task.title}</h4>
        <span className="kanban-priority">{task.priority}</span>
      </div>
      <p className="kanban-client">{task.clientName}</p>
      <p className="kanban-description">{task.description}</p>
      <div className="kanban-footer">
        <span className="kanban-hours">{task.estimatedHours}h</span>
        <div className="kanban-actions">
          {task.status !== "done" && (
            <button
              className="kanban-btn-small complete"
              onClick={() => onComplete(task.id)}
            >
              ✓
            </button>
          )}
          <button
            className="kanban-btn-small delete"
            onClick={() => onDelete(task.id)}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default KanbanCard;
