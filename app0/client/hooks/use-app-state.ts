"use client";

import { useState, useEffect } from "react";
import {
  User,
  Client,
  Document,
  Task,
  Notification,
  TaskStatus,
} from "@/types";
import {
  mockUsers,
  initialClients,
  initialDocuments,
  initialTasks,
  initialNotifications,
  generateId,
} from "@/lib/mock-data";
import { SERVER_URL } from "@/app/page";

export function useAppState() {
  // Current user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data states
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const savedClients = localStorage.getItem("clients");
    const savedDocuments = localStorage.getItem("documents");
    const savedTasks = localStorage.getItem("tasks");
    const savedNotifications = localStorage.getItem("notifications");

    // console.log(savedUser);

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      savedClients
        ? setClients(JSON.parse(savedClients))
        : getClientsByEmployee(JSON.parse(savedUser));
      if (savedDocuments) setDocuments(JSON.parse(savedDocuments));
      savedTasks
        ? setTasks(JSON.parse(savedTasks))
        : getTasksByEmployee(JSON.parse(savedUser));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    }
    setIsInitialized(true);
  }, []);

  // Authentication functions
  const loginAs = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  // Document functions
  const addDocument = (file: File, clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    const newDocument: Document = {
      id: generateId(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      clientId,
      employeeId: client.assignedEmployeeId,
      url: URL.createObjectURL(file), // For demo purposes
    };

    setDocuments((prev) => [...prev, newDocument]);

    // Update client document count
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, documentsCount: c.documentsCount + 1 } : c
      )
    );

    // Create notification for admin
    const notification: Notification = {
      id: generateId(),
      message: `New document "${file.name}" uploaded by ${client.name}`,
      type: "info",
      isRead: false,
      createdAt: new Date(),
      userId: "4", // Admin ID
    };
    setNotifications((prev) => [...prev, notification]);
  };

  // Task functions
  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    // const task = tasks.find((t) => t.id === taskId);
    if (!taskId) return;

    const response = await fetch(`${SERVER_URL}/update-task`, {
      method: "POST",
      headers: {
        Authorization: currentUser?.token as string,
      },
      body: JSON.stringify({
        taskId,
        status,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      await getTasksByEmployee(currentUser);
    }
  };

  const createTask = (
    title: string,
    description: string,
    clientId: string,
    employeeId: string,
    priority: "low" | "medium" | "high"
  ) => {
    const newTask: Task = {
      id: generateId(),
      title,
      description,
      status: "pending",
      clientId,
      employeeId,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority,
    };

    // setTasks((prev) => [...prev, newTask]);

    // Update client task count
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, tasksCount: c.tasksCount + 1 } : c
      )
    );
  };

  // Client functions
  const reassignClient = (clientId: string, newEmployeeId: string) => {
    const oldClient = clients.find((c) => c.id === clientId);
    if (!oldClient) return;

    // Update client assignment
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, assignedEmployeeId: newEmployeeId } : c
      )
    );

    // Update user's assigned employee
    const userToUpdate = mockUsers.find((u) => u.id === clientId);
    if (userToUpdate) {
      userToUpdate.assignedEmployeeId = newEmployeeId;
    }

    // Update all tasks for this client
    // setTasks((prev) =>
    //   prev.map((t) =>
    //     t.clientId === clientId ? { ...t, employeeId: newEmployeeId } : t
    //   )
    // );

    // Update all documents for this client
    setDocuments((prev) =>
      prev.map((d) =>
        d.clientId === clientId ? { ...d, employeeId: newEmployeeId } : d
      )
    );

    // Update employee managed clients
    const oldEmployee = mockUsers.find(
      (u) => u.id === oldClient.assignedEmployeeId
    );
    const newEmployee = mockUsers.find((u) => u.id === newEmployeeId);

    if (oldEmployee && oldEmployee.managedClientIds) {
      oldEmployee.managedClientIds = oldEmployee.managedClientIds.filter(
        (id) => id !== clientId
      );
    }

    if (newEmployee) {
      if (!newEmployee.managedClientIds) {
        newEmployee.managedClientIds = [];
      }
      if (!newEmployee.managedClientIds.includes(clientId)) {
        newEmployee.managedClientIds.push(clientId);
      }
    }
  };

  // Notification functions
  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Getters
  const getClientsByEmployee = async (currentUser: User) => {
    const response = await fetch(`${SERVER_URL}/get-clients`, {
      method: "POST",
      body: JSON.stringify({
        token: currentUser?.token,
      }),
    });
    const data = await response.json();
    setClients(data.data);
    localStorage.setItem("clients", JSON.stringify(data.data));
  };

  const getDocumentsByClient = (clientId: string) => {
    return documents.filter((doc) => doc.clientId === clientId);
  };

  const getTasksByEmployee = async (currentUser: User) => {
    // return tasks.filter((task) => task.employeeId === employeeId);
    const response = await fetch(`${SERVER_URL}/get-tasks`, {
      method: "POST",
      body: JSON.stringify({
        token: currentUser?.token,
      }),
    });
    const data = await response.json();
    localStorage.setItem("tasks", JSON.stringify(data.data));
    setTasks(data.data);
    // return data.data;
  };

  const getTasksByClient = (clientId: string) => {
    return tasks.filter((task) => task.clientId === clientId);
  };

  const getTasksInReview = () => {
    return tasks.filter((task) => task.status === "in-review");
  };

  const getUnreadNotifications = (userId: string) => {
    return notifications.filter((n) => n.userId === userId && !n.isRead);
  };

  return {
    // State
    currentUser,
    clients,
    documents,
    tasks,
    notifications,
    mockUsers,
    isInitialized,

    // Auth functions
    loginAs,
    logout,

    // Data functions
    addDocument,
    updateTaskStatus,
    createTask,
    reassignClient,
    markNotificationRead,
    markAllNotificationsRead,

    // Getters
    getClientsByEmployee,
    getDocumentsByClient,
    getTasksByEmployee,
    getTasksByClient,
    getTasksInReview,
    getUnreadNotifications,
  };
}
