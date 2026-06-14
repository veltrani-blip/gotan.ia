"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface Props {
  chatContent: ReactNode;
  tasksContent: ReactNode;
}

export function AppTabs({ chatContent, tasksContent }: Props) {
  const [tab, setTab] = useState<"chat" | "tasks">("chat");

  return (
    <div className="mx-auto max-w-container px-6">
      <div className="flex gap-1 border-b border-border py-3">
        <button
          onClick={() => setTab("chat")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "chat"
              ? "bg-surface text-fg"
              : "text-muted hover:text-fg"
          }`}
        >
          Chat IA
        </button>
        <button
          onClick={() => setTab("tasks")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "tasks"
              ? "bg-surface text-fg"
              : "text-muted hover:text-fg"
          }`}
        >
          Tarefas
        </button>
      </div>

      <div className="py-6">
        {tab === "chat" ? chatContent : tasksContent}
      </div>
    </div>
  );
}
