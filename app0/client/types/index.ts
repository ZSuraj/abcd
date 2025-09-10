export type UserRole = "client" | "employee" | "admin" | "manager";

export type TaskStatus = "pending" | "in-progress" | "in-review" | "completed";

export interface User {
  access_token: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
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
  categories?: Category[];
}

export interface Document {
  id: string;
  category: string;
  type: string;
  size: number;
  created_at: string;
  client: {
    name: string;
  };
  uploader: {
    name: string;
  };
  employeeId: string;
  status: string;
  file_path: string;
  key: string;
  uploaded_by: string;
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
  client: Client;
  documents: Document[];
  assigned_employees: Employee[];
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

export interface Manager {
  id: string;
  name: string;
  email: string;
  category: string; // Domain/category for the manager
}

export interface Category {
  id: string;
  name: string;
  color?: string; // Optional color for UI
}

// Relationship interfaces
export interface ClientManager {
  clientId: string;
  managerId: string;
  category: string;
}

export interface ManagerEmployee {
  managerId: string;
  employeeId: string;
  clientId: string; // Since employees can work under different managers for different clients
}

// Extended Client interface for relationships
// export interface ClientWithRelationships extends Client {
//   managers: Array<{
//     manager: Manager;
//     category: string;
//     employees: Employee[];
//   }>;
// }

export interface ClientWithRelationships {
  client_id: string;
  client_name: string;
  managers: Manager[];
}

// Extended Employee interface for relationships
export interface EmployeeWithRelationships extends Employee {
  assignments: Array<{
    clientId: string;
    clientName: string;
    managerId: string;
    managerName: string;
    category: string;
  }>;
}
