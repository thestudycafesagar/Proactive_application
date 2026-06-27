"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { Search, List, Kanban, Filter, ArrowUpDown, Columns, Building2 } from "lucide-react";
import { type TaskStatus, type TaskPriority } from "@/lib/types";
import { useGetClientsQuery } from "@/lib/services/api";

export interface TaskToolbarProps {
  viewMode: "kanban" | "table";
  setViewMode: (mode: "kanban" | "table") => void;
  search: string;
  setSearch: (search: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  visibleColumns?: TaskStatus[];
  setVisibleColumns?: (cols: TaskStatus[]) => void;
  allColumns?: TaskStatus[];
  filterClient?: "all" | string;
  setFilterClient?: (clientId: "all" | string) => void;
}

export function TaskToolbar({
  viewMode,
  setViewMode,
  search,
  setSearch,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  visibleColumns,
  setVisibleColumns,
  allColumns,
  filterClient,
  setFilterClient
}: TaskToolbarProps) {
  // debounced search state
  const [localSearch, setLocalSearch] = useState(search);
  const [clientSearch, setClientSearch] = useState("");
  const [debouncedClientSearch, setDebouncedClientSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedClientSearch(clientSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [clientSearch]);

  const { data: clientsRes } = useGetClientsQuery({ limit: 5, search: debouncedClientSearch || undefined });
  const clients = clientsRes?.clients || [];

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch, setSearch]);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between border-b border-border/40 pb-4 mb-4">
      <div className="flex items-center gap-2 flex-1 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8 bg-card h-9"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 whitespace-nowrap bg-card">
              <Building2 className="mr-2 h-4 w-4" />
              Client Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-[350px] overflow-y-auto w-64">
            <div className="p-2 border-b mb-1">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>
            <DropdownMenuCheckboxItem
              checked={filterClient === "all"}
              onCheckedChange={() => setFilterClient?.("all")}
            >
              All Clients
            </DropdownMenuCheckboxItem>

            {clients.map((client: any) => (
              <DropdownMenuCheckboxItem 
                key={client._id}
                checked={filterClient === client._id} 
                onCheckedChange={() => setFilterClient?.(client._id)}
              >
                {client.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {viewMode === "kanban" && visibleColumns && setVisibleColumns && allColumns && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 whitespace-nowrap bg-card">
                <Columns className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={visibleColumns.length === allColumns.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setVisibleColumns([...allColumns]);
                  }
                }}
              >
                All Columns
              </DropdownMenuCheckboxItem>
              {allColumns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleColumns.includes(col)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setVisibleColumns([...visibleColumns, col]);
                    } else {
                      if (visibleColumns.length > 1) {
                        setVisibleColumns(visibleColumns.filter((c) => c !== col));
                      }
                    }
                  }}
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 whitespace-nowrap bg-card">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSortBy("dueDate"); setSortOrder("asc"); }}>
              Due Date (Earliest)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy("dueDate"); setSortOrder("desc"); }}>
              Due Date (Latest)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy("createdAt"); setSortOrder("desc"); }}>
              Recently Created
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy("title"); setSortOrder("asc"); }}>
              Title (A-Z)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center rounded-md border bg-card p-1">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2.5"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "kanban" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2.5"
            onClick={() => setViewMode("kanban")}
          >
            <Kanban className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}