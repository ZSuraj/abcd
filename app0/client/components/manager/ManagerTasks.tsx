"use client";

import { useEffect, useState } from "react";
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
import {
  fetchAllTasks,
  fetchDocument,
  fetchTasks,
  updateTaskStatus,
} from "@/lib/api";
import { Task } from "@/types";
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
import { extractOriginalFileName, formatFileSize } from "@/utils";

export default function ManagerTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    async function getTasks() {
      try {
        const res = await fetchTasks();
        if (res.ok) {
          const data = await res.json();
          setTasks(data.data || []);
          setFilteredTasks(data.data || []);
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
    let filtered = tasks.filter((task) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      // Category filter
      const matchesCategory =
        categoryFilter === "all" || task.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort by due date
    filtered.sort((a, b) => {
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredTasks(filtered);
  }, [searchTerm, tasks, statusFilter, categoryFilter, sortOrder]);

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

        // Also update filtered tasks
        setFilteredTasks((prevFiltered) =>
          prevFiltered.map((task) =>
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

  const toggleRowExpansion = (taskId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(taskId)) {
      newExpandedRows.delete(taskId);
    } else {
      newExpandedRows.add(taskId);
    }
    setExpandedRows(newExpandedRows);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Tasks</h2>
        </div>
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
            aria-label={`Sort by ${
              sortOrder === "newest" ? "oldest" : "newest"
            }`}
            onClick={() =>
              setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
            }
          >
            {sortOrder === "newest" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </Button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
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
            <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
            <CardDescription>
              Manage and monitor all tasks across the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    {/* <TableHead>Due Date</TableHead> */}
                    <TableHead>Documents</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <>
                      <TableRow key={task.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(task.id)}
                            className="h-6 w-6 p-0"
                          >
                            {expandedRows.has(task.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {task.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm truncate max-w-[120px]">
                              {task.client.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {task.assigned_employees.map((employee) => (
                              <Badge
                                key={employee.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {employee.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            <Badge variant="outline" className="capitalize">
                              {task.status.replace("-", " ")}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {task.category}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getPriorityColor(task.priority) as any}
                          >
                            {task.priority}
                          </Badge>
                        </TableCell>
                        {/* <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        </TableCell> */}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(task.id)}
                            className="h-8 px-2"
                          >
                            <FileText className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm">
                              {task.documents.length}
                            </span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* <DropdownMenuItem
                                onClick={() => handleReassign(task.id)}
                              >
                                Reassign
                              </DropdownMenuItem> */}
                              <DropdownMenuItem
                                onClick={() => handleRaiseQuery(task.id)}
                              >
                                Raise Query
                              </DropdownMenuItem>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger
                                  disabled={updatingStatus === task.id}
                                >
                                  {updatingStatus === task.id
                                    ? "Updating..."
                                    : "Update Status"}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(task.id, "pending")
                                    }
                                    disabled={updatingStatus === task.id}
                                  >
                                    Pending
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(task.id, "in-progress")
                                    }
                                    disabled={updatingStatus === task.id}
                                  >
                                    In Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(task.id, "in-review")
                                    }
                                    disabled={updatingStatus === task.id}
                                  >
                                    In Review
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(task.id, "completed")
                                    }
                                    disabled={updatingStatus === task.id}
                                  >
                                    Completed
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(task.id) &&
                        task.documents.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-gray-50">
                              <div className="p-4">
                                <h4 className="font-medium mb-3">
                                  Documents ({task.documents.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {task.documents.map((doc) => (
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
                                        <div className="text-xs text-gray-400">
                                          {new Date(
                                            doc.created_at
                                          ).toLocaleDateString()}
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleViewDocument(doc.key)
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
                                              handleDownloadDocument(doc.key)
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
