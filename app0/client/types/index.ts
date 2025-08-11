export type UserRole = "client" | "employee" | "admin";

export type TaskStatus = "pending" | "in-progress" | "in-review" | "completed";

export interface User {
  id: string;
  token: string;
  email: string;
  name: string;
  type: UserRole;
  assignedEmployeeId?: string; // For clients - which employee they're assigned to
  managedClientIds?: string[]; // For employees - which clients they manage
  data: {
    user: {
      id: number;
      email: string;
      name: string;
      type: UserRole;
    };
  };
}

export interface Client {
  id: string;
  name: string;
  email: string;
  assignedEmployeeId: string;
  documentsCount: number;
  tasksCount: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  clientId: string;
  employeeId: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  clientId: string;
  employeeId: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
}

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: Date;
  userId: string;
}
