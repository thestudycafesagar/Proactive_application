"use client";

import Link from "next/link";

import { useMemo, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { mockClients, type Client, type EntityType } from "@/lib/mock-data";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const entityTypes: EntityType[] = [
  "Individual",
  "Sole Proprietor",
  "Partnership",
  "Private Limited",
  "Trust",
  "LLP",
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesQ =
        !q ||
        [c.name, c.fileNo, c.email, c.phone].some((v) =>
          v.toLowerCase().includes(q.toLowerCase()),
        );
      const matchesType = typeFilter === "all" || c.entityType === typeFilter;
      return matchesQ && matchesType;
    });
  }, [clients, q, typeFilter]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            {clients.length} total · {filtered.length} shown
          </p>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Client
            </Button>
          </SheetTrigger>
          <NewClientSheet
            onCreate={(c) => {
              setClients((prev) => [c, ...prev]);
              setOpen(false);
            }}
          />
        </Sheet>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, file no, email, phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All entity types</SelectItem>
            {entityTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>File No.</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/clients/${c.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {c.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {c.email}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {c.fileNo}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{c.entityType}</span>
                  </TableCell>
                  <TableCell className="text-sm">{c.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        c.status === "Active"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Search className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-medium">No clients found</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Try adjusting your search or filters, or add a new client to get
        started.
      </p>
    </div>
  );
}

function NewClientSheet({ onCreate }: { onCreate: (c: Client) => void }) {
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("Individual");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pan, setPan] = useState("");
  const [gstin, setGstin] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr("Name is required");
      return;
    }
    onCreate({
      id: `c${Date.now()}`,
      name: name.trim(),
      fileNo: `NEW-${Math.floor(Math.random() * 1000)}`,
      entityType,
      email,
      phone,
      pan: pan || undefined,
      gstin: gstin || undefined,
      status: "Active",
    });
  };

  return (
    <SheetContent className="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>New Client</SheetTitle>
        <SheetDescription>Add a new client to your workspace.</SheetDescription>
      </SheetHeader>
      <form onSubmit={submit} className="mt-6 space-y-4 px-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Entity Type *</Label>
          <Select
            value={entityType}
            onValueChange={(v) => setEntityType(v as EntityType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entityTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pan">PAN</Label>
            <Input
              id="pan"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input
              id="gstin"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
            />
          </div>
        </div>
        {err && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {err}
          </div>
        )}
        <SheetFooter>
          <Button type="submit" className="w-full">
            Create Client
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}
