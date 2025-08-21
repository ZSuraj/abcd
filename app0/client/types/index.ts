export type UserRole = "client" | "employee" | "admin";

export type TaskStatus = "pending" | "in-progress" | "in-review" | "completed";

export interface User {
  token: string;
  data: {
    user: {
      id: string;
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
  no_of_docs: number;
  no_of_tasks: number;
  employee: {
    id: string;
  };
}

export interface Document {
  id: string;
  name: string;
  category: string;
  type: string;
  size: number;
  created_at: string;
  clientId: string;
  employeeId: string;
  status: string;
  url: string;
  key: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  due_date: string;
  priority: "low" | "medium" | "high";
  category: string;
  client_name: string;
  docslist: string;
}

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: Date;
  userId: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  assignedClientIds: string[];
}
