"use client";

import { User, Task, Client } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Clock,
  User as UserIcon,
  AlertCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Paperclip,
} from "lucide-react";
import { format, formatDistanceToNow, isAfter, parse } from "date-fns";
import { SERVER_URL } from "@/app/page";

interface TasksViewProps {
  user: User;
  tasks: Task[];
  clients: Client[];
  onUpdateTaskStatus: (taskId: string, status: Task["status"]) => void;
}

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

export function TasksView({
  tasks,
  clients,
  onUpdateTaskStatus,
}: TasksViewProps) {
  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

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

  function timeAgo(timestamp) {
    const utcDate = new Date(timestamp.replace(" ", "T") + "Z"); // Adds the Z for UTC
    const now = new Date(); // Local time (IST in your case)

    const seconds = Math.floor((now - utcDate) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [unit, value] of Object.entries(intervals)) {
      const count = Math.floor(seconds / value);
      if (count > 0) {
        if (unit === "day" && count === 1) return "yesterday";
        return count === 1 ? `1 ${unit} ago` : `${count} ${unit}s ago`;
      }
    }

    return "just now";
  }

  const handleViewDocument = (docKey: string) => {
    // Option 1: If you have a signed URL endpoint
    fetch(`/api/docs/view?key=${encodeURIComponent(docKey)}`)
      .then((res) => res.json())
      .then((data) => window.open(data.url, "_blank"));
  };

  const handleDownloadDocument = async (docKey: string) => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const response = await fetch(`${SERVER_URL}/get-file`, {
      method: "POST",
      headers: {
        // "Content-Type": "application/json",
        Authorization: user.token,
      },
      body: JSON.stringify({ key: docKey }),
    });

    if (!response.ok) {
      console.error("Failed to download file");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = docKey.key.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">
                  {tasks.filter((t) => t.status === "pending").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.filter((t) => t.status === "in-progress").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tasks.filter((t) => t.status === "in-review").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter((t) => t.status === "completed").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Task List */}
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
                      onValueChange={(value) =>
                        onUpdateTaskStatus(task.id, value as Task["status"])
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="in-review">In Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {task.docslist && JSON.parse(task.docslist).length > 0 && (
                  <div className="mt-4 space-y-1 text-sm text-gray-700">
                    <div className="font-semibold text-gray-800">
                      Attached Documents:
                    </div>
                    <ul className="-4 list-disc">
                      {JSON.parse(task.docslist).map(
                        (docKey: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <span className="truncate max-w-xs">
                              {docKey.key}
                            </span>
                            {/* <button
                              onClick={() => handleViewDocument(docKey)}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View
                            </button> */}
                            <button
                              onClick={() => handleDownloadDocument(docKey)}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Download
                            </button>
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
    </div>
  );
}
