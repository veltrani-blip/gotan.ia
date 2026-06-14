"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { TaskItem } from "./TaskItem";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  function add() {
    const t = title.trim();
    if (!t) return;
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), title: t, done: false }]);
    setTitle("");
  }

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-fg">Minhas Tarefas</h2>
        <p className="text-sm text-muted">
          {done}/{tasks.length} concluídas
        </p>
      </div>

      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Nova tarefa..."
          className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-primary/50 focus:outline-none"
        />
        <button
          onClick={add}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-bright transition-colors"
        >
          Adicionar
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">Nenhuma tarefa ainda.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <TaskItem key={t.id} task={t} onToggle={toggle} onRemove={remove} />
          ))}
        </ul>
      )}
    </div>
  );
}
