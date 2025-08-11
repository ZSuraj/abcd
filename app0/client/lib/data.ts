import { SERVER_URL } from "@/app/page";
import {
  Client,
  Document,
  Task,
  Notification,
  TaskStatus,
  User,
} from "@/types";

// Mock data - in a real app, this would come from your database
export const mockClients: Client[] = [
  {
    id: "1",
    name: "John Client",
    email: "client@example.com",
    assignedEmployeeId: "2",
    documentsCount: 3,
    tasksCount: 2,
  },
  {
    id: "3",
    name: "Bob Client",
    email: "client2@example.com",
    assignedEmployeeId: "2",
    documentsCount: 5,
    tasksCount: 4,
  },
  {
    id: "5",
    name: "Alice Client",
    email: "alice@example.com",
    assignedEmployeeId: "6",
    documentsCount: 2,
    tasksCount: 1,
  },
];

export const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Contract.pdf",
    type: "application/pdf",
    size: 1024000,
    uploadedAt: new Date("2024-01-15"),
    clientId: "1",
    employeeId: "2",
    url: "/documents/contract.pdf",
  },
  {
    id: "2",
    name: "Invoice.jpg",
    type: "image/jpeg",
    size: 512000,
    uploadedAt: new Date("2024-01-16"),
    clientId: "1",
    employeeId: "2",
    url: "/documents/invoice.jpg",
  },
];

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Review Contract Documents",
    description: "Review and process the uploaded contract documents",
    status: "in-progress",
    clientId: "1",
    employeeId: "2",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-16"),
    dueDate: new Date("2024-01-25"),
    priority: "high",
  },
  {
    id: "2",
    title: "Process Invoice",
    description: "Process the invoice submitted by the client",
    status: "in-review",
    clientId: "1",
    employeeId: "2",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-17"),
    dueDate: new Date("2024-01-20"),
    priority: "medium",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "1",
    message: 'Task "Process Invoice" is now in review',
    type: "info",
    isRead: false,
    createdAt: new Date("2024-01-17"),
    userId: "4", // Admin
  },
];

// API functions (mock implementations)
export const getClientsByEmployee = async (employeeId: string): Client[] => {
  // return mockClients.filter(client => client.assignedEmployeeId === employeeId);
  const response = await fetch(`${SERVER_URL}/get-clients`, {
    method: "POST",
    body: JSON.stringify({
      token: currentUser?.token,
    }),
  });
  const data = await response.json();
  return data.data;
};

export const getDocumentsByClient = (clientId: string): Document[] => {
  return mockDocuments.filter((doc) => doc.clientId === clientId);
};

// export const getTasksByEmployee = async (currentUser: User) => {
//   // return tasks.filter((task) => task.employeeId === employeeId);
//   const response = await fetch(`${SERVER_URL}/get-tasks`, {
//     method: "POST",
//     body: JSON.stringify({
//       token: currentUser?.token,
//     }),
//   });
//   const data = await response.json();
//   console.log(data);
//   localStorage.setItem("tasks", JSON.stringify(data.data));
//   // setTasks(data.data);
//   // return data.data;
// };

export const getAllTasks = (): Task[] => {
  return mockTasks;
};

export const getTasksInReview = (): Task[] => {
  return mockTasks.filter((task) => task.status === "in-review");
};

export const updateTaskStatus = (
  taskId: string,
  status: TaskStatus
): Task | null => {
  const task = mockTasks.find((t) => t.id === taskId);
  if (task) {
    task.status = status;
    task.updatedAt = new Date();

    // If task is marked as in-review, create notification for admin
    if (status === "in-review") {
      const notification: Notification = {
        id: Date.now().toString(),
        message: `Task "${task.title}" is now in review`,
        type: "info",
        isRead: false,
        createdAt: new Date(),
        userId: "4", // Admin user ID
      };
      mockNotifications.push(notification);
    }

    return task;
  }
  return null;
};

export const reassignClient = (
  clientId: string,
  newEmployeeId: string
): boolean => {
  const client = mockClients.find((c) => c.id === clientId);
  if (client) {
    client.assignedEmployeeId = newEmployeeId;

    // Update all tasks and documents for this client
    mockTasks.forEach((task) => {
      if (task.clientId === clientId) {
        task.employeeId = newEmployeeId;
      }
    });

    mockDocuments.forEach((doc) => {
      if (doc.clientId === clientId) {
        doc.employeeId = newEmployeeId;
      }
    });

    return true;
  }
  return false;
};

export const handleUploadDocuments = async (
  clientId: string,
  files: File[],
  selectedCategory: string,
  selectedClient: number
): Promise<Document | null> => {
  console.log(111);

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file); // "files" is the field name expected by the server
  });

  formData.append("category", selectedCategory);
  if (selectedClient) {
    formData.append("clientId", selectedClient.toString());
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  console.log(currentUser);

  const response = await fetch(`${SERVER_URL}/upload`, {
    method: "POST",
    body: formData,
    headers: {
      "X-Client-ID": clientId,
      Authorization: currentUser?.token,
    },
  });

  const data = await response.json();

  if (selectedClient) {
    await getTasksByEmployee(currentUser);
  }

  return data;
};
