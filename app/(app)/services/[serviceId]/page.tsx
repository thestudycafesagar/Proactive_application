"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Info,
  Plus,
  Trash2,
  Upload,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import {
  useGetServiceByIdQuery,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from "@/lib/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// DB types mapping
const FREQUENCIES = [
  "monthly",
  "quarterly",
  "half_yearly",
  "yearly",
  "one_time",
];
const GST_OPTIONS = ["0", "5", "12", "18", "28"];
const FIELD_TYPES = ["text", "number", "select", "date"];

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.serviceId as string;

  const {
    data: response,
    isLoading,
    error,
  } = useGetServiceByIdQuery(serviceId);
  const svc = response; // Response returns the object directly

  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();

  const [formData, setFormData] = useState<any>(null);

  // Initialize form data when API data arrives
  useEffect(() => {
    if (svc && !formData) {
      setFormData(JSON.parse(JSON.stringify(svc))); // Deep copy
    }
  }, [svc, formData]);

  const update = (patch: any) => {
    setFormData((prev: any) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    try {
      // Ensure frequency object exists if recurring
      const payload = { ...formData };

      if (payload.isRecurring && !payload.frequency?.type) {
        payload.frequency = {
          ...payload.frequency,
          type: "monthly",
          periodLogic: "recently_completed",
          creationDay: 1,
          dueDay: 10,
        };
      }

      await updateService({ id: serviceId, ...payload }).unwrap();
      toast.success("Service saved successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save service");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteService(serviceId).unwrap();
      toast.success("Service deleted");
      router.push("/services");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete service");
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !svc) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center mt-6">
        <h2 className="text-lg font-semibold">Service not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The service you're looking for doesn't exist or was deleted.
        </p>
        <Button asChild className="mt-4">
          <Link href="/services">Back to Services</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/services")}
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Link
            href="/services"
            className="text-base font-medium text-primary hover:underline"
          >
            Services
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-base font-semibold">{formData.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive"
              >
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete service?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove "{formData.name}" from your workspace.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-b bg-transparent p-0">
          {[
            { v: "settings", l: "Settings" },
            { v: "checklist", l: "Checklist" },
            { v: "subtasks", l: "Subtasks" },
            { v: "fields", l: "Custom Fields" },
          ].map((t) => (
            <TabsTrigger
              key={t.v}
              value={t.v}
              className="relative rounded-none border-b-2 border-transparent bg-transparent px-3 pb-2 pt-1 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              {t.l}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name">
                    Service Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => update({ name: e.target.value })}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <ToggleField
                    label="Is Enabled?"
                    checked={formData.isEnabled ?? true}
                    onChange={(v) => update({ isEnabled: v })}
                  />
                  <ToggleField
                    label="Checklist Required?"
                    checked={formData.isChecklistRequired ?? false}
                    onChange={(v) => update({ isChecklistRequired: v })}
                    info="If enabled, tasks for this service cannot be marked complete until every checklist item is done."
                  />
                </div>
                <ToggleField
                  label="Is Recurring?"
                  checked={formData.isRecurring ?? false}
                  onChange={(v) => update({ isRecurring: v })}
                />
                {formData.isRecurring && (
                  <div className="space-y-1.5">
                    <Label>
                      Auto Task Creation Frequency{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.frequency?.type || "monthly"}
                      onValueChange={(v) =>
                        update({
                          frequency: { ...formData.frequency, type: v },
                        })
                      }
                    >
                      <SelectTrigger className="capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((f) => (
                          <SelectItem key={f} value={f} className="capitalize">
                            {f.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="created">Creation Date</Label>
                  <Input
                    id="created"
                    type="date"
                    value={
                      formData.createdAt
                        ? new Date(formData.createdAt)
                            .toISOString()
                            .slice(0, 10)
                        : ""
                    }
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sac">SAC Code</Label>
                    <Input
                      id="sac"
                      value={formData.sacCode || ""}
                      onChange={(e) => update({ sacCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      GST % <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={String(formData.gstPercentage || "18")}
                      onValueChange={(v) =>
                        update({ gstPercentage: Number(v) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GST_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rate">
                    Default Billing Rate (Excl. of Tax)
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      id="rate"
                      type="number"
                      className="pl-7"
                      value={formData.defaultBillingRate || ""}
                      onChange={(e) =>
                        update({
                          defaultBillingRate: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <ToggleField
                  label="Mark its tasks billable by default"
                  checked={formData.isBillable ?? true}
                  onChange={(v) => update({ isBillable: v })}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Checklist */}
        <TabsContent value="checklist">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Default Checklist</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  update({
                    checklist: [
                      ...(formData.checklist || []),
                      {
                        _id: `temp_${Date.now()}`,
                        stepName: "New item",
                        orderIndex: (formData.checklist?.length || 0) + 1,
                      },
                    ],
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Add item
              </Button>
            </CardHeader>
            <CardContent>
              {!formData.checklist || formData.checklist.length === 0 ? (
                <Empty
                  title="No checklist items"
                  description="Add reusable steps that should appear on every task created for this service."
                />
              ) : (
                <ul className="space-y-2">
                  {formData.checklist.map((item: any, i: number) => (
                    <li
                      key={item._id}
                      className="flex items-center gap-3 rounded-md border bg-card p-2"
                    >
                      <span className="w-6 text-xs text-muted-foreground">
                        {i + 1}.
                      </span>
                      <Input
                        value={item.stepName || ""}
                        onChange={(e) =>
                          update({
                            checklist: formData.checklist.map((c: any) =>
                              c._id === item._id
                                ? { ...c, stepName: e.target.value }
                                : c,
                            ),
                          })
                        }
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          update({
                            checklist: formData.checklist.filter(
                              (c: any) => c._id !== item._id,
                            ),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subtasks */}
        <TabsContent value="subtasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Default Subtasks</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  update({
                    subtasks: [
                      ...(formData.subtasks || []),
                      { _id: `temp_${Date.now()}`, title: "New subtask" },
                    ],
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Add subtask
              </Button>
            </CardHeader>
            <CardContent>
              {!formData.subtasks || formData.subtasks.length === 0 ? (
                <Empty
                  title="No subtasks"
                  description="Auto-add subtasks to every task created for this service."
                />
              ) : (
                <ul className="space-y-2">
                  {formData.subtasks.map((st: any) => (
                    <li
                      key={st._id}
                      className="grid grid-cols-12 items-center gap-2 rounded-md border bg-card p-2"
                    >
                      <Input
                        className="col-span-11"
                        value={st.title || ""}
                        placeholder="Subtask title"
                        onChange={(e) =>
                          update({
                            subtasks: formData.subtasks.map((x: any) =>
                              x._id === st._id
                                ? { ...x, title: e.target.value }
                                : x,
                            ),
                          })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="col-span-1"
                        onClick={() =>
                          update({
                            subtasks: formData.subtasks.filter(
                              (x: any) => x._id !== st._id,
                            ),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Fields */}
        <TabsContent value="fields">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Custom Fields</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  update({
                    customFieldsDef: [
                      ...(formData.customFieldsDef || []),
                      {
                        _id: `temp_${Date.now()}`,
                        label: "New field",
                        fieldType: "text",
                      },
                    ],
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Add field
              </Button>
            </CardHeader>
            <CardContent>
              {!formData.customFieldsDef ||
              formData.customFieldsDef.length === 0 ? (
                <Empty
                  title="No custom fields"
                  description="Capture extra information on each task — e.g. assessment year, period, reference number."
                />
              ) : (
                <ul className="space-y-2">
                  {formData.customFieldsDef.map((f: any) => (
                    <li
                      key={f._id}
                      className="grid grid-cols-12 items-center gap-2 rounded-md border bg-card p-2"
                    >
                      <Input
                        className="col-span-7"
                        value={f.label || ""}
                        onChange={(e) =>
                          update({
                            customFieldsDef: formData.customFieldsDef.map(
                              (x: any) =>
                                x._id === f._id
                                  ? { ...x, label: e.target.value }
                                  : x,
                            ),
                          })
                        }
                      />
                      <Select
                        value={f.fieldType || "text"}
                        onValueChange={(v) =>
                          update({
                            customFieldsDef: formData.customFieldsDef.map(
                              (x: any) =>
                                x._id === f._id ? { ...x, fieldType: v } : x,
                            ),
                          })
                        }
                      >
                        <SelectTrigger className="col-span-4 capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map((t) => (
                            <SelectItem
                              key={t}
                              value={t}
                              className="capitalize"
                            >
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="col-span-1"
                        onClick={() =>
                          update({
                            customFieldsDef: formData.customFieldsDef.filter(
                              (x: any) => x._id !== f._id,
                            ),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
  info,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  info?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={onChange} />
      <span className="text-sm">{label}</span>
      {info && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{info}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

function Empty({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-6 py-10 text-center">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
