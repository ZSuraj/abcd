import { TaskStatus, User } from "@/types";

export const SERVER_URL = "http://localhost:8787";

export const fetchDocument = async (docKey: string) => {
  console.log(docKey);

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  console.log(user);

  const response = await fetch(`${SERVER_URL}/get-file`, {
    method: "POST",
    headers: {
      Authorization: user.token,
    },
    body: JSON.stringify({ key: docKey }),
  });

  return response;

  if (!response.ok) {
    console.error("Failed to fetch file for viewing");
    return;
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank");

  // Optionally revoke the object URL after some delay
  // setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60); // 1 min later
};

export async function fetchDocuments(clientId: number) {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const response = await fetch(`${SERVER_URL}/get-files`, {
    method: "POST",
    headers: {
      "X-Client-ID": clientId.toString(),
      Authorization: user.token,
    },
  });

  return response;
}

export async function fetchClients() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const response = await fetch(`${SERVER_URL}/get-clients`, {
    method: "POST",
    headers: {
      Authorization: user.token,
    },
  });

  return response;
}

export async function fetchTasks() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const response = await fetch(`${SERVER_URL}/get-tasks`, {
    method: "POST",
    headers: {
      Authorization: user.token,
    },
  });

  return response;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  // const task = tasks.find((t) => t.id === taskId);
  if (!taskId) return;

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const response = await fetch(`${SERVER_URL}/update-task`, {
    method: "POST",
    headers: {
      Authorization: user?.token as string,
    },
    body: JSON.stringify({
      taskId,
      status,
    }),
  });

  //   if (response.ok) {
  //     const data = await response.json();
  //     await getTasksByEmployee(currentUser);
  //   }

  return response;
}

export async function fetchAllEmployees() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  if (user) {
    const res = await fetch(`${SERVER_URL}/get-all-employees`, {
      method: "POST",
      headers: {
        Authorization: user.token,
      },
    });

    return res;
  }
}

export async function fetchAllClients() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  if (user) {
    const res = await fetch(`${SERVER_URL}/get-all-clients`, {
      method: "POST",
      headers: {
        Authorization: user.token,
      },
    });
    return res;
  }
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
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const response = await fetch(`${SERVER_URL}/get-clients`, {
    method: "POST",
    headers: {
      Authorization: user?.token,
    },
  });

  return response;
}

export async function getEmployeesClientDocs(clientId: string, userId: string) {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const response = await fetch(`${SERVER_URL}/get-files`, {
    method: "POST",
    headers: {
      "X-Client-ID": clientId.toString(),
      Authorization: user.token,
    },
  });

  return response;
}

export const handleEmployeeUploadDocuments = async (
  userId: User["data"]["user"]["id"],
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
