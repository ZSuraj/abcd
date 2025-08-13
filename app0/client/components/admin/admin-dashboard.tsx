"use client";

import { useState } from "react";
import { User, Task, Client, Document } from "@/types";
import { AllTasksView } from "./all-tasks-view";
import { ClientManagement } from "./client-management";
import { ReviewQueue } from "./review-queue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface AdminDashboardProps {
  user: User;
  tasks: Task[];
  clients: Client[];
  documents: Document[];
  employees: User[];
  onUpdateTaskStatus: (taskId: string, status: Task["status"]) => void;
  onReassignClient: (clientId: string, newEmployeeId: string) => void;
}

export function AdminDashboard({
  user,
  tasks,
  clients,
  documents,
  employees,
  onUpdateTaskStatus,
  onReassignClient,
}: AdminDashboardProps) {
  const reviewTasks = tasks.filter((task) => task.status === "in-review");
  const activeTasks = tasks.filter((task) =>
    ["pending", "in-progress", "in-review"].includes(task.status)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h2>
        <p className="text-gray-600">
          Oversee all tasks, manage client assignments, and handle reviews.
        </p>
      </div>

      <Tabs defaultValue="review-queue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="review-queue" className="flex items-center gap-2">
            Review Queue
            {reviewTasks.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {reviewTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all-tasks" className="flex items-center gap-2">
            All Tasks
            <Badge variant="secondary" className="ml-1">
              {tasks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="client-management"
            className="flex items-center gap-2"
          >
            Client Management
            <Badge variant="secondary" className="ml-1">
              {clients.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review-queue">
          <ReviewQueue
            tasks={reviewTasks}
            clients={clients}
            onUpdateTaskStatus={onUpdateTaskStatus}
          />
        </TabsContent>

        <TabsContent value="all-tasks">
          <AllTasksView
            tasks={tasks}
            clients={clients}
            employees={employees}
            onUpdateTaskStatus={onUpdateTaskStatus}
          />
        </TabsContent>

        <TabsContent value="client-management">
          <ClientManagement
            clients={clients}
            employees={employees}
            documents={documents}
            onReassignClient={onReassignClient}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
