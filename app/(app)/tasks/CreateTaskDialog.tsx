"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  useGetClientsQuery,
  useGetServicesQuery,
  useGetUsersQuery,
  useCreateTaskMutation,
} from "@/lib/services/api";
import { type TaskPriority } from "@/lib/types";

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("none");
  const [assignedUserId, setAssignedUserId] = useState("none");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [dueDate, setDueDate] = useState("");

  const { data: clientsRes, isLoading: clientsLoading } = useGetClientsQuery(undefined);
  const { data: servicesRes, isLoading: servicesLoading } = useGetServicesQuery(undefined);
  const { data: usersRes, isLoading: usersLoading } = useGetUsersQuery(undefined);
  
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();

  const clients = clientsRes?.data || [];
  const services = servicesRes?.data || [];
  const users = usersRes?.data || [];

  const handleCreate = async () => {
    if (!clientId || !title) return;

    try {
      await createTask({
        clientId,
        serviceId: serviceId === "none" ? undefined : serviceId,
        assignedUserId: assignedUserId === "none" ? undefined : assignedUserId,
        title,
        description,
        priority,
        dueDate: dueDate || undefined,
      }).unwrap();
      
      setOpen(false);
      
      // Reset form
      setClientId("");
      setServiceId("none");
      setAssignedUserId("none");
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Task Title <span className="text-red-500">*</span></Label>
            <Input 
              placeholder="E.g., Complete GST Return" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Client <span className="text-red-500">*</span></Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder={clientsLoading ? "Loading..." : "Select Client"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client: any) => (
                    <SelectItem key={client._id} value={client._id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Service (Optional)</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder={servicesLoading ? "Loading..." : "Select Service"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Service</SelectItem>
                  {services.map((service: any) => (
                    <SelectItem key={service._id} value={service._id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Assignee (Optional)</Label>
              <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder={usersLoading ? "Loading..." : "Select Assignee"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {users.map((user: any) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2 col-span-2">
              <Label>Due Date (Optional)</Label>
              <Input 
                type="date" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description (Optional)</Label>
            <Textarea 
              placeholder="Add any extra notes..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={isCreating || !title || !clientId}
          >
            {isCreating ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
