"use client";

import { useMemo, useState } from "react";
import { Plus, Clock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/lib/services/api";
import { type Task, type TaskStatus, type TaskPriority } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const COLUMNS: TaskStatus[] = [
  "Pending",
  "In Progress",
  "Under Review",
  "Completed",
];

export default function TasksPage() {
  const { data: tasksRes, isLoading } = useGetTasksQuery(undefined);
  const [updateStatus] = useUpdateTaskStatusMutation();
  
  const [detail, setDetail] = useState<Task | null>(null);

  const tasks: Task[] = tasksRes?.data || [];

  const grouped = useMemo(() => {
    return COLUMNS.reduce(
      (acc, col) => {
        acc[col] = tasks.filter((t) => t.status === col);
        return acc;
      },
      {} as Record<TaskStatus, Task[]>,
    );
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    
    // Optionally update local cache optimistically, but RTK Query will refetch if invalidated
    try {
      await updateStatus({ id: taskId, status: newStatus }).unwrap();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Drag and drop tasks between columns.
          </p>
        </div>
        <CreateTaskDialog />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => (
          <div 
            key={col} 
            className="rounded-xl border bg-muted/40 p-3 flex flex-col min-h-[500px]"
            onDrop={(e) => handleDrop(e, col)}
            onDragOver={handleDragOver}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold">{col}</h3>
              <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">
                {grouped[col].length}
              </span>
            </div>
            <div className="space-y-2 flex-1">
              {grouped[col].length === 0 ? (
                <div className="rounded-md border border-dashed bg-card/50 px-3 py-8 text-center text-xs text-muted-foreground">
                  No tasks
                </div>
              ) : (
                grouped[col].map((t) => (
                  <div
                    key={t._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t._id)}
                    onClick={() => setDetail(t)}
                    className="w-full cursor-pointer rounded-lg border bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="font-medium text-sm leading-tight">
                        {t.title}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      {t.clientId?.name || "No Client"}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <StatusBadge status={t.priority} />
                        {t.dueDate && (
                          <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
                            Due {formatDate(t.dueDate)}
                          </Badge>
                        )}
                      </div>
                      {/* Avatar placeholder for assignee */}
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium border border-background">
                        {t.assignedUserId?.name?.charAt(0) || "?"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        {detail && (
          <TaskDetailDialog task={detail} onClose={() => setDetail(null)} />
        )}
      </Dialog>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const map: Record<TaskPriority, string> = {
    Urgent: "bg-destructive/10 text-destructive border-destructive/20",
    High: "bg-warning/15 text-warning-foreground border-warning/30",
    Medium: "bg-primary/10 text-primary border-primary/20",
    Low: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={`${map[priority]} text-[10px]`}>
      {priority}
    </Badge>
  );
}


function TaskDetailDialog({
  task,
  onClose: _onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{task.title}</DialogTitle>
        <DialogDescription>
          {task.clientId?.name || "No Client"} 
          {task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ""}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{task.status}</Badge>
          <StatusBadge status={task.priority} />
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Description
          </h4>
          <p className="text-sm text-muted-foreground">
            {task.description || "No description provided."}
          </p>
        </div>
      </div>
    </DialogContent>
  );
}
