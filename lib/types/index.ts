export type TaskStatus = "Pending" | "In Progress" | "Under Review" | "On Hold" | "Completed" | "Cancelled";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface User {
  _id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export interface Client {
  _id: string;
  name: string;
  fileNo?: string;
  email?: string;
  photoUrl?: string;
}

export interface Service {
  _id: string;
  name: string;
}

export interface TaskPeriod {
  month?: number;
  year?: number;
  label?: string;
}

export interface Task {
  _id: string;
  clientId: Client;
  serviceId?: Service;
  assignedUserId?: User;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  period?: TaskPeriod;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  clientId: string;
  serviceId?: string;
  assignedUserId?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  period?: TaskPeriod;
  dueDate?: string;
}
