export const SERVER_URL = "http://localhost:8787";

export const fetchDocument = async (docKey: string) => {
  console.log(docKey);

  const user = JSON.parse(localStorage.getItem("currentUser"));
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

export async function fetchDocuments(clientId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
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
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${SERVER_URL}/get-clients`, {
    method: "POST",
    headers: {
      Authorization: user.token,
    },
  });

  return response;
}

export async function fetchTasks() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${SERVER_URL}/get-tasks`, {
    method: "POST",
    headers: {
      Authorization: user.token,
    },
  });

  return response;
}
