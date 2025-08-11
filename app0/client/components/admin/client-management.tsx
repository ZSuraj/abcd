"use client";

import { useState } from "react";
import { Client, User, Document } from "@/types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  User as UserIcon,
  FileText,
  Search,
  RefreshCw,
  Eye,
} from "lucide-react";
import { ClientDocuments } from "@/components/employee/client-documents";

interface ClientManagementProps {
  clients: Client[];
  employees: User[];
  documents: Document[];
  onReassignClient: (clientId: string, newEmployeeId: string) => void;
}

export function ClientManagement({
  clients,
  employees,
  documents,
  onReassignClient,
}: ClientManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [reassigning, setReassigning] = useState<string | null>(null);
  const [viewingClientId, setViewingClientId] = useState<string | null>(null);

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || "Unassigned";
  };

  const getClientDocuments = (clientId: string) => {
    return documents.filter((doc) => doc.clientId === clientId);
  };

  const handleReassign = async (clientId: string, newEmployeeId: string) => {
    setReassigning(clientId);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onReassignClient(clientId, newEmployeeId);
    setReassigning(null);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Employee stats
  const employeeStats = employees.map((employee) => ({
    employee,
    clientCount: clients.filter((c) => c.assignedEmployeeId === employee.id)
      .length,
  }));

  // If viewing a client's documents, render the ClientDocuments component
  if (viewingClientId) {
    const client = clients.find((c) => c.id === viewingClientId);
    if (client) {
      return (
        <ClientDocuments
          client={client}
          documents={documents}
          onBack={() => setViewingClientId(null)}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Employee Workload Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Workload</CardTitle>
          <CardDescription>
            Current client assignments per employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employeeStats.map(({ employee, clientCount }) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <UserIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {clientCount} clients
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Management */}
      <Card>
        <CardHeader>
          <CardTitle>Client Assignments</CardTitle>
          <CardDescription>
            Manage which employee is assigned to each client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Client List */}
          <div className="space-y-3">
            {filteredClients.map((client) => {
              const clientDocuments = getClientDocuments(client.id);
              const isReassigning = reassigning === client.id;

              return (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.email}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {clientDocuments.length} documents
                        </span>
                        <span>•</span>
                        <span>{client.tasksCount} tasks</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingClientId(client.id)}
                      // className="mr-2"
                    >
                      {/* <Eye className="h-4 w-4 mr-1" /> */}
                      View Documents
                    </Button>

                    {/* <div className="text-right">
                      <p className="text-sm text-gray-600">Assigned to:</p>
                      <p className="font-medium">{getEmployeeName(client.assignedEmployeeId)}</p>
                    </div> */}

                    <Select
                      value={client.assignedEmployeeId}
                      onValueChange={(value) =>
                        handleReassign(client.id, value)
                      }
                      disabled={isReassigning}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {isReassigning && (
                      <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
