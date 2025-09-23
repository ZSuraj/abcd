import { RecurringTask, TaskStatus, User } from "@/types";
import { getCurrentUser } from "./auth";

export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const fetchDocument = async (docKey: string) => {
  console.log(docKey);

  const user = getCurrentUser();
  console.log(user);

  const response = await fetch(`${SERVER_URL}/get-file`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({ key: docKey }),
  });

  return response;
};

export async function fetchDocuments() {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/get-docs`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return response;
}

export async function fetchClients() {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/get-clients`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return response;
}

export async function fetchTasks() {
  const user = getCurrentUser();

  const response = await fetch(`${SERVER_URL}/get-tasks`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return response;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, remarks?: string) {
  // const task = tasks.find((t) => t.id === taskId);
  if (!taskId) return;

  const user = getCurrentUser();

  const response = await fetch(`${SERVER_URL}/update-task`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      taskId,
      status,
      remarks,
    }),
  });

  //   if (response.ok) {
  //     const data = await response.json();
  //     await getTasksByEmployee(currentUser);
  //   }

  return response;
}

export async function fetchAllEmployees() {
  const user = getCurrentUser();

  const res = await fetch(`${SERVER_URL}/get-all-employees`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return res;
}

export async function fetchAllClients() {
  const user = getCurrentUser();

  const res = await fetch(`${SERVER_URL}/get-all-clients`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return res;
}

export async function handleReassignEmployee(
  clientId: string,
  newEmployeeId: string,
  oldEmployeeId: string
) {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const res = await fetch(`${SERVER_URL}/reassign-employee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: user.token,
    },
    body: JSON.stringify({
      clientId,
      newEmployeeId,
      oldEmployeeId,
    }),
  });

  return res;
}

export const handleUploadDocuments = async (
  clientId: string,
  files: File[],
  selectedCategory: string,
  selectedClient: number
) => {
  console.log(111);

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file); // "files" is the field name expected by the server
  });

  formData.append("category", selectedCategory);
  if (selectedClient) {
    formData.append("clientId", selectedClient.toString());
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  console.log(currentUser);

  const response = await fetch(`${SERVER_URL}/upload`, {
    method: "POST",
    body: formData,
    headers: {
      "X-Client-ID": clientId,
      Authorization: currentUser?.token,
    },
  });

  return response;
};

export async function getEmployeesClients() {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/get-clients`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return response;
}

export async function getEmployeesClientDocs(clientId: string) {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/get-client-documents`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      clientId: clientId,
    }),
  });

  return response;
}

export const handleEmployeeUploadDocuments = async (
  files: File[],
  selectedCategory: string,
  selectedClientId: string
) => {
  console.log(111);

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file); // "files" is the field name expected by the server
  });

  formData.append("category", selectedCategory);
  formData.append("clientId", selectedClientId);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  console.log(currentUser);

  const response = await fetch(`${SERVER_URL}/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: currentUser?.token,
    },
  });

  return response;
};

export const handleClientUploadDocuments = async (
  files: File[],
  selectedCategory: string
) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file); // "files" is the field name expected by the server
  });

  formData.append("category", selectedCategory);

  const user = getCurrentUser();

  const response = await fetch(`${SERVER_URL}/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return response;
};

// new

export async function createClient(formData: any) {
  const user = await getCurrentUser();

  console.log(formData);

  console.log(user?.access_token);

  const response = await fetch(`${SERVER_URL}/create-client`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify(formData),
  });

  return response;
}

export async function createManager(formData: any) {
  const user = await getCurrentUser();

  const response = await fetch(`${SERVER_URL}/create-manager`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify(formData),
  });

  return response;
}

export async function createEmployee(formData: any) {
  const user = await getCurrentUser();

  const response = await fetch(`${SERVER_URL}/create-employee`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify(formData),
  });

  return response;
}

export async function fetchAllManagers() {
  const user = await getCurrentUser();
  const response = await fetch(`${SERVER_URL}/get-all-managers`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return response;
}

export async function getRelationshipTree() {
  const user = await getCurrentUser();
  const response = await fetch(`${SERVER_URL}/get-cmeh`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return response;
}

export async function updateRelationshipTree(
  clientId: string,
  managerId: string,
  employeeIds: string[]
) {
  const user = await getCurrentUser();
  const response = await fetch(`${SERVER_URL}/create-client-relationship`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({ employeeIds, managerId, clientId }),
  });

  return response;
}

export async function replaceManager(clientId: string, managerId: string) {
  const user = await getCurrentUser();
  const response = await fetch(`${SERVER_URL}/replace-manager`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({ managerId, clientId }),
  });

  return response;
}

export async function replaceEmployee(
  clientId: string,
  managerId: string,
  oldEmployeeId: string,
  newEmployeeId: string
) {
  const user = await getCurrentUser();
  const response = await fetch(`${SERVER_URL}/replace-employee`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      clientId,
      managerId,
      oldEmployeeId,
      newEmployeeId,
    }),
  });

  return response;
}

export async function removeEmployee(
  clientId: string,
  managerId: string,
  employeeId: string
) {
  console.log(clientId, managerId, employeeId);

  const user = await getCurrentUser();
  const response = await fetch(`${SERVER_URL}/remove-employee`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      clientId,
      managerId,
      employeeId,
    }),
  });

  return response;
}

export async function addEmployee(
  clientId: string,
  managerId: string,
  employeeId: string
) {
  const user = await getCurrentUser();
  const response = await fetch(`${SERVER_URL}/add-employee`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      clientId,
      managerId,
      employeeId,
    }),
  });

  return response;
}

export async function fetchAllTasks() {
  const user = getCurrentUser();

  const response = await fetch(`${SERVER_URL}/get-all-tasks`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return response;
}

export async function fetchAllDocuments() {
  const user = getCurrentUser();

  const response = await fetch(`${SERVER_URL}/get-all-documents`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return response;
}

export async function fetchEmployees() {
  const user = getCurrentUser();

  const res = await fetch(`${SERVER_URL}/get-employees`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return res;
}

export async function getManagerRelationshipTree() {
  const user = await getCurrentUser();
  const response = await fetch(`${SERVER_URL}/get-relationship`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return response;
}

export async function getCategories() {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/get-categories`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      clientId: null,
    }),
  });
  return response;
}

export async function getAllCategories() {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/get-all-categories`, {
    headers: {
      Authorization: user?.access_token as string,
    },
  });
  return response;
}
export async function saveCategories(clientId: string, categoryIds: string[]) {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/save-categories`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      clientId,
      categoryIds,
    }),
  });
  return response;
}

export async function createCategory(name: string, clientIds: string[]) {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/create-category`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      name,
      clientIds,
    }),
  });
  return response;
}

export async function getClientCategories(clientId: string) {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/get-categories`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      clientId,
    }),
  });
  return response;
}

export async function getClientTasks(clientId: string) {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/get-client-tasks`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      clientId,
    }),
  });
  return response;
}

export async function createClientTask(clientId: string, title: string) {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/create-client-task`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      clientId,
      title,
    }),
  });
  return response;
}

export async function deleteClientTask(taskId: string) {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/delete-client-task`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      taskId,
    }),
  });
  return response;
}

export async function createRecurringTask(taskData: RecurringTask) {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/create-recurring-task`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      taskData: taskData,
    }),
  });
  return response;
}

export async function fetchRecurringTasks() {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/get-recurring-tasks`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });
  return response;
}

export async function deleteRecurringTask(taskId: string) {
  const user = getCurrentUser();
  const response = await fetch(`${SERVER_URL}/delete-recurring-task`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      taskId,
    }),
  });
  return response;
}

export async function fetchDailyTasks() {
  const user = getCurrentUser();

  const response = await fetch(`${SERVER_URL}/get-daily-tasks`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
  });

  return response;
}

export async function updateDailyTaskStatus(
  taskId: string,
  status: TaskStatus
) {
  // const task = tasks.find((t) => t.id === taskId);
  if (!taskId) return;

  const user = getCurrentUser();

  const response = await fetch(`${SERVER_URL}/update-daily-task`, {
    method: "POST",
    headers: {
      Authorization: user?.access_token as string,
    },
    body: JSON.stringify({
      taskId,
      status,
    }),
  });

  return response;
}
