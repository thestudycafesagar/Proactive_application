import Link from "next/link";

import {
  Users,
  CheckSquare,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import {
  mockClients,
  mockTasks,
  mockInvoices,
  recentActivity,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const activeClients = mockClients.filter((c) => c.status === "Active").length;
  const pendingTasks = mockTasks.filter((t) => t.status !== "Completed").length;
  const unpaidInvoices = mockInvoices.filter(
    (i) => i.status === "Pending" || i.status === "Overdue",
  ).length;
  const revenue = mockInvoices
    .filter((i) => i.status === "Paid")
    .reduce((s, i) => s + i.amount, 0);

  const upcoming = [...mockTasks]
    .filter((t) => t.status !== "Completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const cards = [
    {
      label: "Active Clients",
      value: activeClients.toString(),
      icon: Users,
      delta: "+2 this week",
      tone: "text-primary",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks.toString(),
      icon: CheckSquare,
      delta: `${pendingTasks} in queue`,
      tone: "text-warning",
    },
    {
      label: "Unpaid Invoices",
      value: unpaidInvoices.toString(),
      icon: Receipt,
      delta: "1 overdue",
      tone: "text-destructive",
    },
    {
      label: "Total Revenue",
      value: `₹${revenue.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      delta: "+12% MoM",
      tone: "text-success",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Here's what's happening in your practice today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {c.label}
                </span>
                <Icon className={`h-4 w-4 ${c.tone}`} />
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">
                {c.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {c.delta}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-sm font-semibold">Upcoming Tasks</h2>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {upcoming.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.clientName} · Due {t.dueDate}
                  </div>
                </div>
                <PriorityBadge priority={t.priority} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {a.who[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
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
