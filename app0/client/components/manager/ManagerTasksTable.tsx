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

export default function ManagerTasksTable({
  tasks,
  toggleRowExpansion,
  expandedRows,
  updatingStatus,
  handleUpdateStatus,
  handleRaiseQuery,
  getStatusIcon,
  getPriorityColor,
}: {
  tasks: Task[];
  toggleRowExpansion: (taskId: string) => void;
  expandedRows: Set<string>;
  updatingStatus: string;
  handleUpdateStatus: (taskId: string, newStatus: string) => void;
  handleRaiseQuery: (taskId: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
}) {
  return (
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
        {tasks.map((task) => (
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
              <TableCell className="capitalize">{task.category}</TableCell>
              <TableCell>
                <Badge variant={getPriorityColor(task.priority) as any}>
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
                  <span className="text-sm">{task.documents.length}</span>
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
                    <DropdownMenuItem onClick={() => handleRaiseQuery(task.id)}>
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
                          onClick={() => handleUpdateStatus(task.id, "pending")}
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
            {expandedRows.has(task.id) && task.documents.length > 0 && (
              <TableRow>
                <TableCell colSpan={9} className="bg-gray-50">
                  <div className="p-4">
                    {task.documents && task.documents.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Documents ({task.documents.length}):
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {task.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 bg-card rounded-lg border"
                            >
                              <div className="flex items-center">
                                {/* {getFileIcon(doc.type)} */}
                                <div className="ml-2">
                                  <p className="text-sm font-medium text-gray-900">
                                    {extractOriginalFileName(doc.file_path)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(doc.size)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    handleViewDocument(doc.file_path)
                                  }
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="View Document"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDownloadDocument(doc.file_path)
                                  }
                                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="Download Document"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {task.remarks && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-1">
                          Remarks:
                        </h4>
                        <p className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200 whitespace-pre-line">
                          {task.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  );
}
