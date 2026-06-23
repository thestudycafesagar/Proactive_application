"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, FilePlus2 } from "lucide-react";
import {
  mockInvoices,
  mockClients,
  type Invoice,
  type InvoiceStatus,
  type InvoiceLineItem,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusStyle: Record<InvoiceStatus, string> = {
  Paid: "border-success/30 bg-success/10 text-success",
  Pending: "border-warning/30 bg-warning/15 text-warning-foreground",
  Overdue: "border-destructive/30 bg-destructive/10 text-destructive",
  Draft: "border-border bg-muted text-muted-foreground",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Manage billing across clients.
        </p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">All Invoices</TabsTrigger>
          <TabsTrigger value="new">
            <FilePlus2 className="mr-1.5 h-3.5 w-3.5" /> New Invoice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {i.number}
                    </TableCell>
                    <TableCell>{i.clientName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {i.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyle[i.status]}
                      >
                        {i.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{i.amount.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="new">
          <InvoiceGenerator onSave={(inv) => setInvoices((p) => [inv, ...p])} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InvoiceGenerator({ onSave }: { onSave: (i: Invoice) => void }) {
  const [clientId, setClientId] = useState(mockClients[0]?.id ?? "");
  const [items, setItems] = useState<InvoiceLineItem[]>([
    {
      id: "1",
      particulars: "Professional Fees",
      quantity: 1,
      rate: 10000,
      taxPercent: 18,
    },
  ]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    items.forEach((it) => {
      const line = it.quantity * it.rate;
      subtotal += line;
      tax += (line * it.taxPercent) / 100;
    });
    return { subtotal, tax, grand: subtotal + tax };
  }, [items]);

  const updateItem = (id: string, patch: Partial<InvoiceLineItem>) => {
    setItems((p) => p.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const addItem = () => {
    setItems((p) => [
      ...p,
      {
        id: `${Date.now()}`,
        particulars: "",
        quantity: 1,
        rate: 0,
        taxPercent: 18,
      },
    ]);
  };

  const removeItem = (id: string) =>
    setItems((p) => p.filter((it) => it.id !== id));

  const save = () => {
    const client = mockClients.find((c) => c.id === clientId);
    if (!client) return;
    onSave({
      id: `i${Date.now()}`,
      number: `INV-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      clientId,
      clientName: client.name,
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: "Draft",
      amount: Math.round(totals.grand),
      items,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <div className="grid max-w-md grid-cols-1 gap-3">
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
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Particulars</TableHead>
              <TableHead className="w-24">Qty</TableHead>
              <TableHead className="w-32">Rate</TableHead>
              <TableHead className="w-24">Tax %</TableHead>
              <TableHead className="w-32 text-right">Line Total</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((it) => {
              const lineSub = it.quantity * it.rate;
              const lineTotal = lineSub + (lineSub * it.taxPercent) / 100;
              return (
                <TableRow key={it.id}>
                  <TableCell>
                    <Input
                      value={it.particulars}
                      onChange={(e) =>
                        updateItem(it.id, { particulars: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={it.quantity}
                      onChange={(e) =>
                        updateItem(it.id, {
                          quantity: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={it.rate}
                      onChange={(e) =>
                        updateItem(it.id, { rate: Number(e.target.value) || 0 })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={it.taxPercent}
                      onChange={(e) =>
                        updateItem(it.id, {
                          taxPercent: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    ₹
                    {lineTotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(it.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-start justify-between gap-4">
        <Button variant="outline" onClick={addItem}>
          <Plus className="mr-2 h-4 w-4" /> Add Line
        </Button>
        <div className="w-72 space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
          <Row label="Subtotal" value={totals.subtotal} />
          <Row label="Tax" value={totals.tax} />
          <div className="border-t pt-2">
            <Row label="Grand Total" value={totals.grand} bold />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save}>Save Invoice</Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-semibold" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={`tabular-nums ${bold ? "font-semibold" : ""}`}>
        ₹{value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}
