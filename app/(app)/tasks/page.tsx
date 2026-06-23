"use client";

import { useMemo, useState } from "react";
import { Plus, Clock, CheckCircle2, Circle } from "lucide-react";
import {
  mockTasks,
  mockClients,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const COLUMNS: TaskStatus[] = [
  "Pending",
  "In Progress",
  "Under Review",
  "Completed",
];
const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<Task | null>(null);

  const grouped = useMemo(() => {
    return COLUMNS.reduce(
      (acc, col) => {
        acc[col] = tasks.filter((t) => t.status === col);
        return acc;
      },
      {} as Record<TaskStatus, Task[]>,
    );
  }, [tasks]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Drag-free Kanban — click a card for details.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </DialogTrigger>
          <CreateTaskDialog
            onCreate={(t) => {
              setTasks((p) => [t, ...p]);
              setCreateOpen(false);
            }}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => (
          <div key={col} className="rounded-xl border bg-muted/40 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold">{col}</h3>
              <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">
                {grouped[col].length}
              </span>
            </div>
            <div className="space-y-2">
              {grouped[col].length === 0 ? (
                <div className="rounded-md border border-dashed bg-card/50 px-3 py-8 text-center text-xs text-muted-foreground">
                  No tasks
                </div>
              ) : (
                grouped[col].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDetail(t)}
                    className="w-full rounded-lg border bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="text-sm font-medium leading-snug">
                      {t.title}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t.clientName}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <PriorityBadge priority={t.priority} />
                      <span className="text-[11px] text-muted-foreground">
                        Due {t.dueDate.slice(5)}
                      </span>
                    </div>
                  </button>
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

function CreateTaskDialog({ onCreate }: { onCreate: (t: Task) => void }) {
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState(mockClients[0]?.id ?? "");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [dueDate, setDueDate] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = mockClients.find((c) => c.id === clientId);
    if (!title || !client || !dueDate) return;
    onCreate({
      id: `t${Date.now()}`,
      title,
      clientId,
      clientName: client.name,
      priority,
      status: "Pending",
      dueDate,
      assignee: "Me",
      checklist: [],
      timeLoggedMinutes: 0,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Task</DialogTitle>
        <DialogDescription>Assign work to a client.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Client</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockClients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as TaskPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due">Due Date</Label>
            <Input
              id="due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create</Button>
        </DialogFooter>
      </form>
    </DialogContent>
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
          {task.clientName} · Due {task.dueDate}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{task.status}</Badge>
          <PriorityBadge priority={task.priority} />
          <Badge variant="outline" className="border-border bg-muted">
            <Clock className="mr-1 h-3 w-3" />{" "}
            {Math.floor(task.timeLoggedMinutes / 60)}h{" "}
            {task.timeLoggedMinutes % 60}m
          </Badge>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Checklist
          </h4>
          {task.checklist.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subtasks.</p>
          ) : (
            <ul className="space-y-1.5">
              {task.checklist.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  {c.done ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      c.done ? "text-muted-foreground line-through" : ""
                    }
                  >
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DialogContent>
  );
}
