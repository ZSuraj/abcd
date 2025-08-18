"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { timeAgo } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  User as UserIcon,
  AlertCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Paperclip,
  CheckCircle,
  EyeIcon,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SERVER_URL } from "../page";
import { fetchDocument } from "@/lib/api";
import { toast } from "sonner";

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "pending":
      return "bg-gray-100 text-gray-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "in-review":
      return "bg-orange-100 text-orange-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: Task["priority"]) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function Tasks() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const tasks = JSON.parse(localStorage.getItem("tasks"));

  const router = useRouter();

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by priority first, then by due date
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tasks assigned
        </h3>
        <p className="text-gray-600">You don't have any tasks assigned yet.</p>
      </div>
    );
  }

  const handleViewDocument = async (key: string) => {
    const res = (await fetchDocument(key)) as Response;
    if (!res.ok) {
      console.error("Failed to fetch file for viewing");
      toast.error("Failed to fetch file for viewing");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleDownloadDocument = async (key: string) => {
    const res = (await fetchDocument(key)) as Response;
    if (!res.ok) {
      console.error("Failed to fetch file for downloading");
      toast.error("Failed to fetch file for downloading");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = key.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (!currentUser) {
    // return <RoleSwitcher users={mockUsers} onSelectUser={loginAs} />;
    return router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar />
      <main className="w-full">
        <Navbar user={currentUser.data.user} />
        <div className="p-6">
          {currentUser?.data.user.type === "client" && <div>client</div>}

          {currentUser?.data.user.type === "employee" && (
            <div className="space-y-4">
              {sortedTasks.map((task) => {
                const isOverdue =
                  task.dueDate &&
                  isAfter(new Date(), new Date(task.dueDate)) &&
                  task.status !== "completed";

                return (
                  <Card
                    key={task.id}
                    className={`transition-all duration-200 hover:shadow-md ${
                      isOverdue ? "border-red-200 bg-red-50/30" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {task.title}
                            {isOverdue && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* <Badge
                      variant="outline"
                      className={getPriorityColor(task.priority)}
                    >
                      {task.priority || "medium"}
                    </Badge> */}

                          {/* 🆕 Category Badge */}
                          {task.category && (
                            <Badge variant="secondary" className="text-xs">
                              {task.category}
                            </Badge>
                          )}

                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace("-", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <UserIcon className="h-4 w-4" />
                            <span>{task.client_name}</span>
                          </div>

                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" />
                              <span
                                className={
                                  isOverdue ? "text-red-600 font-medium" : ""
                                }
                              >
                                Due{" "}
                                {formatDistanceToNow(new Date(task.dueDate), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Updated {timeAgo(task.updated_at)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {task.priority === "high" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : task.priority === "medium" ? (
                              <ArrowRight className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )}
                            <span>
                              Priority{" "}
                              {task.priority === "high"
                                ? "High"
                                : task.priority === "medium"
                                ? "Medium"
                                : "Low"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select
                            value={task.status}
                            onValueChange={(value) => {
                              // TODO: Implement task status update
                              console.log(
                                "Update task status:",
                                task.id,
                                value
                              );
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="in-review">
                                In Review
                              </SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {task.docslist &&
                        JSON.parse(task.docslist).length > 0 && (
                          <div className="mt-4 space-y-1 text-sm text-gray-700">
                            <div className="font-semibold text-gray-800">
                              Attached Documents:
                            </div>
                            <ul className="-4 list-disc">
                              {JSON.parse(task.docslist).map(
                                (docKey: string, index: number) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <Paperclip className="h-4 w-4" />
                                    <span className="truncate max-w-xs">
                                      {docKey.key}
                                    </span>
                                    <div className="flex items-center justify-end">
                                      <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() =>
                                          handleViewDocument(docKey)
                                        }
                                        className="text-blue-600 hover:underline hover:text-blue-700 text-sm font-normal"
                                      >
                                        {/* <EyeIcon className="h-4 w-4 text-blue-600" /> */}
                                        View
                                      </Button>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() =>
                                          handleDownloadDocument(docKey)
                                        }
                                        className="text-blue-600 hover:underline hover:text-blue-700 text-sm font-normal"
                                      >
                                        {/* <Download className="h-4 w-4 text-blue-600" /> */}
                                        Download
                                      </Button>
                                    </div>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {currentUser?.data.user.type === "admin" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tasks Pending Review
                </h3>

                {tasks
                  .filter((t) => t.status === "in-review")
                  .map((task) => (
                    <Card
                      key={task.id}
                      className="border-l-4 border-l-orange-400"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {task.title}
                            </CardTitle>
                            <CardDescription>
                              {task.description}
                            </CardDescription>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                task.priority === "high"
                                  ? "border-red-200 bg-red-50 text-red-800"
                                  : task.priority === "medium"
                                  ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                                  : "border-green-200 bg-green-50 text-green-800"
                              }
                            >
                              {task.priority.toUpperCase()}
                            </Badge>
                            <Badge className="bg-orange-100 text-orange-800">
                              IN REVIEW
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              <span>{task.client_name}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {/* <span>In review for {task.updated_at}</span> */}
                              <span>{timeAgo(task.updated_at)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Implement reject functionality
                                console.log("Reject task:", task.id);
                              }}
                              className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                            >
                              Send Back
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                // TODO: Implement approve functionality
                                console.log("Approve task:", task.id);
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              {/* Task List */}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    All Tasks ({tasks.length})
                  </h3>
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No tasks match your filters.
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="transition-all duration-200 hover:shadow-md"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {task.title}
                            </CardTitle>
                            <CardDescription>
                              {task.description}
                            </CardDescription>
                          </div>

                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace("-", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              <span>{task.client_name}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <span>Assigned to: {task.employee_name}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {/* <span>Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}</span> */}
                              <span>{timeAgo(task.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
