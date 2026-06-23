"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";

import { ArrowLeft, Mail, Phone, FileText, Building2 } from "lucide-react";
import { mockClients, mockTasks, mockInvoices } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params?.clientId as string;
  const client = mockClients.find((c) => c.id === clientId);
  if (!client) throw notFound();

  const clientTasks = mockTasks.filter((t) => t.clientId === client.id);
  const clientInvoices = mockInvoices.filter((i) => i.clientId === client.id);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Clients
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
            {client.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {client.name}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono">{client.fileNo}</span>
              <span>·</span>
              <span>{client.entityType}</span>
              <Badge
                variant="outline"
                className={
                  client.status === "Active"
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-border bg-muted text-muted-foreground"
                }
              >
                {client.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({clientTasks.length})</TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices ({clientInvoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="profile"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <InfoCard label="Email" value={client.email} icon={Mail} />
          <InfoCard label="Phone" value={client.phone} icon={Phone} />
          <InfoCard label="PAN" value={client.pan ?? "—"} icon={FileText} />
          <InfoCard
            label="GSTIN"
            value={client.gstin ?? "—"}
            icon={Building2}
          />
        </TabsContent>

        <TabsContent
          value="tasks"
          className="rounded-xl border bg-card shadow-sm"
        >
          {clientTasks.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No tasks yet.
            </div>
          ) : (
            <ul className="divide-y">
              {clientTasks.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <div className="text-sm font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Due {t.dueDate} · {t.assignee}
                    </div>
                  </div>
                  <Badge variant="outline">{t.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent
          value="invoices"
          className="rounded-xl border bg-card shadow-sm"
        >
          {clientInvoices.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No invoices yet.
            </div>
          ) : (
            <ul className="divide-y">
              {clientInvoices.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <div className="text-sm font-medium">{i.number}</div>
                    <div className="text-xs text-muted-foreground">
                      {i.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{i.status}</Badge>
                    <span className="text-sm font-semibold">
                      ₹{i.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Mail;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1.5 text-sm">{value}</div>
    </div>
  );
}
