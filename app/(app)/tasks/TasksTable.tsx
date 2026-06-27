"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Task, type TaskPriority, type TaskStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Clock, Circle } from "lucide-react";

export interface TasksTableProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const getPriorityBadge = (priority: TaskPriority) => {
  switch (priority) {
    case "Urgent": return "bg-red-50 text-red-700 border-red-200";
    case "High": return "bg-orange-50 text-orange-700 border-orange-200";
    case "Medium": return "bg-blue-50 text-blue-700 border-blue-200";
    case "Low": return "bg-slate-50 text-slate-700 border-slate-200";
    default: return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const getStatusBadge = (status: TaskStatus) => {
  switch (status) {
    case "Pending": return "bg-slate-100 text-slate-700 border-slate-200";
    case "In Progress": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Under Review": return "bg-purple-100 text-purple-700 border-purple-200";
    case "On Hold": return "bg-amber-100 text-amber-700 border-amber-200";
    case "Completed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export function TasksTable({ tasks, onTaskClick }: TasksTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/50 text-sm text-slate-400">
        No tasks found matching your criteria.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="w-[300px]">Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Assignee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task._id} 
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => onTaskClick?.(task)}
            >
              <TableCell className="font-medium max-w-[300px] truncate">
                {task.serviceId?.name || "Unnamed Task"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Circle className="h-3 w-3" />
                  <span className="truncate">{task.clientId?.name || "No Client"}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`font-medium text-[10px] uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`font-medium text-[10px] tracking-wider ${getStatusBadge(task.status)}`}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>
                {task.dueDate ? (
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <Clock className="h-3 w-3" />
                    {formatDate(task.dueDate)}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">No date</span>
                )}
              </TableCell>
              <TableCell>
                {task.assigneeIds && task.assigneeIds.length > 0 ? (
                  <div className="flex items-center gap-1">
                    {task.assigneeIds.map((assignee, idx) => (
                      <div 
                        key={assignee._id}
                        className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-medium text-white shadow-sm"
                        title={assignee.name}
                        style={{ marginLeft: idx > 0 ? '-0.5rem' : '0' }}
                      >
                        {assignee.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">Unassigned</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
