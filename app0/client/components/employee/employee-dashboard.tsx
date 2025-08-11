"use client";

import { useState } from "react";
import { User, Task, Client, Document } from "@/types";
import { TasksView } from "./tasks-view";
import { ClientsView } from "./clients-view";
import { ClientDocuments } from "./client-documents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface EmployeeDashboardProps {
  user: User;
  tasks: Task[];
  clients: Client[];
  documents: Document[];
  onUpdateTaskStatus: (taskId: string, status: Task["status"]) => void;
}

export function EmployeeDashboard({
  user,
  tasks,
  clients,
  documents,
  onUpdateTaskStatus,
}: EmployeeDashboardProps) {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);

  const userTasks = tasks;
  const userClients = clients;

  const pendingTasks = userTasks.filter(
    (task) => task.status === "pending"
  ).length;
  const inProgressTasks = userTasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  if (selectedClient) {
    return (
      <div className="max-w-6xl mx-auto">
        <ClientDocuments
          client={selectedClient}
          documents={documents}
          onBack={() => setSelectedClient(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user.name}!
        </h2>
        <p className="text-gray-600">
          Manage your assigned tasks and client documents.
        </p>
      </div>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            Tasks
            {(pendingTasks > 0 || inProgressTasks > 0) && (
              <Badge variant="secondary" className="ml-1">
                {pendingTasks + inProgressTasks}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            Clients
            <Badge variant="secondary" className="ml-1">
              {userClients.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <TasksView
            user={user}
            tasks={userTasks}
            clients={clients}
            onUpdateTaskStatus={onUpdateTaskStatus}
          />
        </TabsContent>

        <TabsContent value="clients">
          <ClientsView
            user={user}
            clients={userClients}
            documents={documents}
            onSelectClient={setSelectedClient}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
