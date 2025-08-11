"use client";

import { Task, Client } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import { SERVER_URL } from "@/app/page";

interface ReviewQueueProps {
  tasks: Task[];
  clients: Client[];
  onUpdateTaskStatus: (taskId: string, status: Task["status"]) => void;
}

export function ReviewQueue({
  tasks,
  clients,
  onUpdateTaskStatus,
}: ReviewQueueProps) {
  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const handleApprove = (taskId: string) => {
    onUpdateTaskStatus(taskId, "completed");
  };

  const handleReject = (taskId: string) => {
    onUpdateTaskStatus(taskId, "in-progress");
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tasks in review
        </h3>
        <p className="text-gray-600">
          All tasks have been processed. Great job!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Awaiting Review</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tasks.length}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {tasks.filter((t) => t.priority === "high").length}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Review Time</p>
                <p className="text-2xl font-bold text-blue-600">2h</p>
              </div>
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Tasks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Tasks Pending Review
        </h3>

        {sortedTasks.map((task) => (
          <Card key={task.id} className="border-l-4 border-l-orange-400">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <CardDescription>{task.description}</CardDescription>
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
                    <span>{getClientName(task.clientId)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {/* <span>In review for {formatDistanceToNow(new Date(task.updatedAt))}</span> */}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(task.id)}
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                  >
                    Send Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(task.id)}
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
    </div>
  );
}
