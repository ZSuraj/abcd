"use client";

import { useState } from "react";
import { User, Task, Client, Document } from "@/types";
import { AllTasksView } from "./all-tasks-view";
import { ClientManagement } from "./client-management";
import { ReviewQueue } from "./review-queue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  AlertCircle, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle, 
  TrendingUp,
  User as UserIcon,
  Calendar,
  Target,
  BarChart3,
  Zap
} from "lucide-react";
import { formatFileSize } from "@/lib/utils";

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

  // Enhanced stats calculations
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    inReview: tasks.filter((t) => t.status === "in-review").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    highPriority: tasks.filter((t) => t.priority === "high").length,
    overdue: tasks.filter((t) => {
      if (!t.dueDate || t.status === "completed") return false;
      return new Date() > new Date(t.dueDate);
    }).length,
  };

  // Employee workload stats
  const employeeWorkload = employees.map((employee) => ({
    employee,
    clientCount: clients.filter((c) => c.assignedEmployeeId === employee.id).length,
    taskCount: tasks.filter((t) => t.employeeId === employee.id).length,
    activeTaskCount: tasks.filter((t) => 
      t.employeeId === employee.id && 
      ["pending", "in-progress"].includes(t.status)
    ).length,
  }));

  // Client distribution stats
  const clientStats = {
    total: clients.length,
    withDocuments: clients.filter((c) => c.documentsCount > 0).length,
    withActiveTasks: clients.filter((c) => c.tasksCount > 0).length,
    unassigned: clients.filter((c) => !c.assignedEmployeeId).length,
  };

  // Document stats
  const documentStats = {
    total: documents.length,
    uploadedToday: documents.filter((d) => {
      const today = new Date();
      const uploadDate = new Date(d.uploadedAt);
      return uploadDate.toDateString() === today.toDateString();
    }).length,
    totalSize: documents.reduce((acc, doc) => acc + doc.size, 0),
  };

  // Additional performance metrics
  const performanceMetrics = {
    completionRate: taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0,
    averageTasksPerEmployee: employees.length > 0 ? Math.round(taskStats.total / employees.length) : 0,
    averageClientsPerEmployee: employees.length > 0 ? Math.round(clientStats.total / employees.length) : 0,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Enhanced Stats Overview */}
      <div className="space-y-6">
        {/* Task Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{taskStats.total}</p>
              <p className="text-xs text-gray-600">Total Tasks</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-600">{taskStats.pending}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
              <p className="text-xs text-gray-600">In Progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{taskStats.inReview}</p>
              <p className="text-xs text-gray-600">In Review</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{taskStats.highPriority}</p>
              <p className="text-xs text-gray-600">High Priority</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
              <p className="text-xs text-gray-600">Overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Client and Document Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-blue-600">{clientStats.total}</p>
                  <p className="text-xs text-gray-500">
                    {clientStats.withActiveTasks} with active tasks
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-green-600">{documentStats.total}</p>
                  <p className="text-xs text-gray-500">
                    {documentStats.uploadedToday} uploaded today
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(documentStats.totalSize)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unassigned Clients</p>
                  <p className="text-2xl font-bold text-orange-600">{clientStats.unassigned}</p>
                  <p className="text-xs text-gray-500">
                    Need employee assignment
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{performanceMetrics.completionRate}%</p>
              <p className="text-xs text-gray-600">Completion Rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-indigo-600">{performanceMetrics.averageTasksPerEmployee}</p>
              <p className="text-xs text-gray-600">Avg Tasks/Employee</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{performanceMetrics.averageClientsPerEmployee}</p>
              <p className="text-xs text-gray-600">Avg Clients/Employee</p>
            </CardContent>
          </Card>
        </div>

        {/* Employee Workload Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Workload Overview
            </CardTitle>
            <CardDescription>
              Current client assignments and task distribution per employee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {employeeWorkload.map(({ employee, clientCount, taskCount, activeTaskCount }) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {clientCount} clients
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {activeTaskCount} active
                      </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {taskCount} total tasks
                    </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & System Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-800">Review Pending Tasks</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  {taskStats.pending}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-orange-800">Tasks in Review</span>
                <Badge variant="outline" className="bg-orange-100 text-orange-700">
                  {taskStats.inReview}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-800">Overdue Tasks</span>
                <Badge variant="outline" className="bg-red-100 text-red-700">
                  {taskStats.overdue}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-800">Unassigned Clients</span>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  {clientStats.unassigned}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>
                Current system status and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Task Completion Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${performanceMetrics.completionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{performanceMetrics.completionRate}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Employee Utilization</span>
                <span className="text-sm font-medium">
                  {employees.length > 0 ? Math.round((clients.filter(c => c.assignedEmployeeId).length / employees.length) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Document Activity</span>
                <span className="text-sm font-medium">
                  {documentStats.uploadedToday} today
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">High Priority Tasks</span>
                <span className="text-sm font-medium text-red-600">
                  {taskStats.highPriority}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary & Alerts */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Summary & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {taskStats.overdue > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">{taskStats.overdue} Overdue Tasks</p>
                  <p className="text-xs text-red-600">Requires immediate attention</p>
                </div>
              </div>
            )}
            
            {taskStats.inReview > 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">{taskStats.inReview} Tasks in Review</p>
                  <p className="text-xs text-orange-600">Awaiting admin approval</p>
                </div>
              </div>
            )}
            
            {clientStats.unassigned > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Users className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">{clientStats.unassigned} Unassigned Clients</p>
                  <p className="text-xs text-yellow-600">Need employee assignment</p>
                </div>
              </div>
            )}
            
            {taskStats.highPriority > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">{taskStats.highPriority} High Priority Tasks</p>
                  <p className="text-xs text-red-600">Urgent attention required</p>
                </div>
              </div>
            )}
          </div>
          
          {taskStats.overdue === 0 && taskStats.inReview === 0 && clientStats.unassigned === 0 && taskStats.highPriority === 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">All Systems Operational</p>
                <p className="text-xs text-green-600">No urgent issues detected</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest updates and changes in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Recent task updates */}
            {tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Task "{task.title}" updated to {task.status.replace("-", " ")}
                  </p>
                  <p className="text-xs text-gray-500">
                    Client: {clients.find(c => c.id === task.clientId)?.name || 'Unknown'}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(task.updatedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            
            {/* Recent document uploads */}
            {documents.slice(0, 2).map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Document "{doc.name}" uploaded
                  </p>
                  <p className="text-xs text-gray-500">
                    Client: {clients.find(c => c.id === doc.clientId)?.name || 'Unknown'}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            
            {/* Recent client assignments */}
            {clients.filter(c => c.assignedEmployeeId).slice(0, 2).map((client) => (
              <div key={client.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Client "{client.name}" assigned to employee
                  </p>
                  <p className="text-xs text-gray-500">
                    Employee: {employees.find(e => e.id === client.assignedEmployeeId)?.name || 'Unknown'}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  Recently
                </span>
              </div>
            ))}
            
            {tasks.length === 0 && documents.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Priority Cards
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Awaiting Review</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reviewTasks.length}
                </p>
                <p className="text-xs text-orange-600">
                  {taskStats.highPriority > 0 && `${taskStats.highPriority} high priority`}
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
                  {taskStats.highPriority}
                </p>
                <p className="text-xs text-red-600">
                  {taskStats.overdue > 0 && `${taskStats.overdue} overdue`}
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
                <p className="text-sm text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-blue-600">
                  {performanceMetrics.completionRate}%
                </p>
                <p className="text-xs text-blue-600">
                  Task completion rate
                </p>
              </div>
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
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
      </Tabs> */}
    </div>
  );
}
