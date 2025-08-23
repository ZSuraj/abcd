"use client";

import { useEffect, useState } from "react";

// import { ClientDocuments } from "@/components/employee/ClientDocuments";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CalendarDays, Clock, UserIcon } from "lucide-react";
import { formatISTTimeAgo, timeAgo } from "@/utils";
import { Client, Task } from "@/types";
import { fetchTasks } from "@/lib/api";

export function EmployeeDashboard() {
  console.log("EmployeeDashboard");

  const [tasks, setTasks] = useState<Task[]>([]);

  const pendingTasks = tasks?.filter(
    (task) => task.status === "pending"
  ).length;
  const inProgressTasks = tasks?.filter(
    (task) => task.status === "in-progress"
  ).length;

  const totalTasks = tasks?.length;
  const completed = tasks?.filter((t) => t.status === "completed")?.length;
  const progressPercent = Math?.round((completed / totalTasks) * 100);

  useEffect(() => {
    async function getTasks() {
      const res = await fetchTasks();
      const data = (await res.json()) as { data: Task[] };
      setTasks(data.data as Task[]);
    }
    getTasks();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">
                  {tasks?.filter((t) => t?.status === "pending").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.filter((t) => t?.status === "in-progress").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tasks.filter((t) => t?.status === "in-review").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter((t) => t?.status === "completed").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-stretch justify-between gap-4">
        {/* Recent Tasks */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
              .slice(0, 3)
              .map((task) => (
                <div
                  key={task?.id}
                  className="flex items-start justify-between rounded-md border p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">{task?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Updated: {formatISTTimeAgo(task?.updated_at)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`
                      capitalize
                      ${
                        task?.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : task.status === "in-progress"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : task.status === "in-review"
                          ? "bg-orange-100 text-orange-800 border-orange-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      }
                    `}
                  >
                    {task?.status}
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks
              .filter((t) => t?.due_date)
              .sort(
                (a, b) =>
                  new Date(a?.due_date).getTime() -
                  new Date(b?.due_date).getTime()
              )
              .slice(0, 3)
              .map((task) => (
                <div
                  key={task?.id}
                  className="flex items-center justify-between rounded-md border p-4 shadow-sm transition-all bg-white"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {task?.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Due in {formatISTTimeAgo(task?.due_date)}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(task?.due_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
