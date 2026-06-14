"use client";

import type { Task } from "@/lib/types";

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TaskItem({ task, onToggle, onRemove }: Props) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2">
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
        className="accent-primary h-4 w-4 cursor-pointer"
      />
      <span className={task.done ? "flex-1 text-muted line-through" : "flex-1 text-fg text-sm"}>
        {task.title}
      </span>
      <button
        onClick={() => onRemove(task.id)}
        className="text-xs text-muted hover:text-orange-bright transition-colors"
      >
        remover
      </button>
    </li>
  );
}
