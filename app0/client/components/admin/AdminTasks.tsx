"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { fetchAllTasks, updateTaskStatus } from "@/lib/api";
import { AssignablePerson, Task } from "@/types";
import CreateTaskForm from "@/components/CreateTaskForm";
import {
  Search,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Eye,
  Download,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { handleDownloadDocument, handleViewDocument } from "@/lib/utils";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { extractOriginalFileName, formatFileSize } from "@/utils";
import {
  fetchAllEmployees,
  fetchAllClients,
  fetchAllManagers,
} from "@/lib/api";
import { Employee, Client, Manager } from "@/types";

export default function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Assignable people for create task form
  const [assignablePeople, setAssignablePeople] = useState<AssignablePerson[]>(
    []
  );
  const [clients, setClients] = useState<Client[]>([]);

  const columnHelper = createColumnHelper<Task>();

  const toggleRowExpansion = useCallback(
    (taskId: string) => {
      const newExpandedRows = new Set(expandedRows);
      if (newExpandedRows.has(taskId)) {
        newExpandedRows.delete(taskId);
      } else {
        newExpandedRows.add(taskId);
      }
      setExpandedRows(newExpandedRows);
    },
    [expandedRows]
  );

  useEffect(() => {
    async function getTasks() {
      try {
        const res = await fetchAllTasks();
        if (res.ok) {
          const data = (await res.json()) as { data?: Task[] };
          setTasks(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    getTasks();
  }, []);

  useEffect(() => {
    const fetchAssignablePeople = async () => {
      try {
        const [employeesRes, clientsRes, managersRes] = await Promise.all([
          fetchAllEmployees(),
          fetchAllClients(),
          fetchAllManagers(),
        ]);

        const allPeople: AssignablePerson[] = [];

        if (employeesRes.ok) {
          const employeesData = (await employeesRes.json()) as {
            data: Employee[];
          };
          const employees = employeesData.data || [];
          allPeople.push(
            ...employees.map((emp) => ({
              id: emp.id,
              name: emp.name,
              email: emp.email,
              role: "employee" as const,
            }))
          );
        }

        if (clientsRes.ok) {
          const clientsData = (await clientsRes.json()) as { data: Client[] };
          const clients = clientsData.data || [];
          setClients(clients);
          allPeople.push(
            ...clients.map((client) => ({
              id: client.id,
              name: client.name,
              email: client.email,
              role: "client" as const,
            }))
          );
        }

        if (managersRes.ok) {
          const managersData = (await managersRes.json()) as {
            data: Manager[];
          };
          const managers = managersData.data || [];
          allPeople.push(
            ...managers.map((manager) => ({
              id: manager.id,
              name: manager.name,
              email: manager.email,
              role: "manager" as const,
            }))
          );
        }

        setAssignablePeople(allPeople);
      } catch (error) {
        console.error("Error fetching assignable people:", error);
      }
    };
    fetchAssignablePeople();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "in-review":
        return <RotateCcw className="h-4 w-4 text-yellow-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const handleReassign = (taskId: string) => {
    // TODO: Implement reassign functionality
    console.log("Reassign task:", taskId);
  };

  const handleRaiseQuery = (taskId: string) => {
    // TODO: Implement raise query functionality
    console.log("Raise query for task:", taskId);
  };

  const handleTaskCreated = () => {
    // Refresh the tasks list
    async function refreshTasks() {
      try {
        const res = await fetchAllTasks();
        if (res.ok) {
          const data = (await res.json()) as { data?: Task[] };
          setTasks(data.data || []);
        }
      } catch (error) {
        console.error("Error refreshing tasks:", error);
      }
    }
    refreshTasks();
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    setUpdatingStatus(taskId);

    try {
      const response = await updateTaskStatus(taskId, newStatus as any);

      if (response && response.ok) {
        // Update the local state to reflect the change
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus as any } : task
          )
        );

        console.log(`Task ${taskId} status updated to ${newStatus}`);
        // You could add a toast notification here
        // toast.success(`Task status updated to ${newStatus}`);
      } else {
        console.error("Failed to update task status");
        // You could add an error toast here
        // toast.error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      // You could add an error toast here
      // toast.error("Error updating task status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const columns = useMemo<ColumnDef<Task, any>[]>(
    () => [
      columnHelper.display({
        id: "expand",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRowExpansion(row.original.id)}
            className="h-6 w-6 p-0"
          >
            {expandedRows.has(row.original.id) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ),
        size: 10,
      }),
      columnHelper.accessor("title", {
        header: "Task",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="text-sm text-gray-500 truncate">
              {row.original.description}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("client.name", {
        header: "Client",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm truncate max-w-[120px]">
              {row.original.client?.name || "N/A"}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("assigned_employees", {
        header: "Assigned to",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.assigned_employees.map((employee) => (
              <Badge key={employee.id} variant="secondary" className="text-xs">
                {employee.name}
              </Badge>
            ))}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {getStatusIcon(row.original.status)}
            <Badge variant="outline" className="capitalize">
              {row.original.status.replace("-", " ")}
            </Badge>
          </div>
        ),
        filterFn: (row, id, value) => {
          return value === "all" || row.getValue(id) === value;
        },
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: ({ getValue }) => (
          <span className="capitalize">{getValue() as string}</span>
        ),
        filterFn: (row, id, value) => {
          return value === "all" || row.getValue(id) === value;
        },
      }),
      // columnHelper.accessor("priority", {
      //   header: "Priority",
      //   cell: ({ getValue }) => (
      //     <Badge variant={getPriorityColor(getValue() as string) as any}>
      //       {getValue() as string}
      //     </Badge>
      //   ),
      // }),
      columnHelper.accessor("created_at", {
        header: "Created At",
        cell: ({ getValue }) => (
          <span>
            {new Date(getValue()).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      }),
      columnHelper.display({
        id: "documents",
        header: "Documents",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRowExpansion(row.original.id)}
            className="h-8 px-2"
          >
            <FileText className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm">{row.original.documents.length}</span>
          </Button>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem onClick={() => handleReassign(row.original.id)}>
                Reassign
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem
                onClick={() => handleRaiseQuery(row.original.id)}
              >
                Raise Query
              </DropdownMenuItem> */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  disabled={updatingStatus === row.original.id}
                >
                  {updatingStatus === row.original.id
                    ? "Updating..."
                    : "Update Status"}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdateStatus(row.original.id, "pending")
                    }
                    disabled={updatingStatus === row.original.id}
                  >
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdateStatus(row.original.id, "in-progress")
                    }
                    disabled={updatingStatus === row.original.id}
                  >
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdateStatus(row.original.id, "in-review")
                    }
                    disabled={updatingStatus === row.original.id}
                  >
                    In Review
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdateStatus(row.original.id, "completed")
                    }
                    disabled={updatingStatus === row.original.id}
                  >
                    Completed
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        // size: 48,
      }),
    ],
    [expandedRows, updatingStatus, columnHelper, toggleRowExpansion]
  );

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchTerm,
    },
    onGlobalFilterChange: setSearchTerm,
    globalFilterFn: (row, _, filterValue) => {
      const search = filterValue.toLowerCase();
      return (
        row.original.title.toLowerCase().includes(search) ||
        row.original.description.toLowerCase().includes(search) ||
        row.original.client?.name.toLowerCase().includes(search) ||
        row.original.category.toLowerCase().includes(search)
      );
    },
  });

  // Apply additional filters
  useEffect(() => {
    table.getColumn("status")?.setFilterValue(statusFilter);
    table.getColumn("category")?.setFilterValue(categoryFilter);
  }, [statusFilter, categoryFilter, table]);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Tasks</h2>
        </div> */}
        <div className="grid grid-cols-1 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <CreateTaskForm
          assignablePeople={assignablePeople}
          clients={clients}
          onTaskCreated={handleTaskCreated}
        />
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tasks by title, description, client, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Status</span>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as Task["status"] | "all")
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Category</span>
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as string)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="bank statement">Bank Statement</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Sort</span>
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => {
              const currentSort = table.getState().sorting[0];
              if (!currentSort || currentSort.id !== "created_at") {
                table.setSorting([{ id: "created_at", desc: true }]);
              } else {
                table.setSorting([
                  { id: "created_at", desc: !currentSort.desc },
                ]);
              }
            }}
          >
            {table.getState().sorting[0]?.desc ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            {table.getState().sorting[0]?.desc ? "Newest" : "Oldest"}
          </Button>
        </div>
      </div>

      {table.getFilteredRowModel().rows.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? "No tasks found" : "No tasks"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Tasks will appear here when they are created."}
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              All Tasks ({table.getFilteredRowModel().rows.length})
            </CardTitle>
            <CardDescription>
              Manage and monitor all tasks across the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={
                            header.column.getSize()
                              ? `w-${header.column.getSize()}`
                              : ""
                          }
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <>
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      {expandedRows.has(row.original.id) &&
                        row.original.documents.length > 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={table.getAllColumns().length}
                              className="bg-gray-50"
                            >
                              <div className="p-4">
                                <h4 className="font-medium mb-3">
                                  Documents ({row.original.documents.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {row.original.documents.map((doc: any) => (
                                    <Card key={doc.id} className="p-3">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-gray-400" />
                                          <span className="text-sm font-medium truncate">
                                            {extractOriginalFileName(
                                              doc.file_path
                                            )}
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {doc.category} •{" "}
                                          {formatFileSize(doc.size)}
                                        </div>
                                        {/* <div className="text-xs text-gray-400">
                                          {new Date(
                                            doc.created_at
                                          ).toLocaleDateString()}
                                        </div> */}
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleViewDocument(doc.file_path)
                                            }
                                            className="flex-1"
                                          >
                                            <Eye className="h-3 w-3 mr-1" />
                                            View
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleDownloadDocument(
                                                doc.file_path
                                              )
                                            }
                                            className="flex-1"
                                          >
                                            <Download className="h-3 w-3 mr-1" />
                                            Download
                                          </Button>
                                        </div>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
