import { User } from "@/types";

export const SERVER_URL = "http://localhost:8787";

// Mock authentication - in a real app, this would connect to your auth provider
let currentUser: User | null = null;

export const mockUsers: User[] = [
  {
    id: "1",
    email: "client@example.com",
    name: "John Client",
    type: "client",
    assignedEmployeeId: "2",
  },
  {
    id: "2",
    email: "employee@example.com",
    name: "Jane Employee",
    type: "employee",
    managedClientIds: ["1", "3"],
  },
  {
    id: "3",
    email: "client2@example.com",
    name: "Bob Client",
    type: "client",
    assignedEmployeeId: "2",
  },
  {
    id: "4",
    email: "admin@example.com",
    name: "Admin User",
    type: "admin",
  },
];

export async function login(
  email: string,
  password: string
): Promise<User | null> {
  console.log(1);

  // Mock authentication logic
  const formData = new FormData();

  formData.append("email", email);
  formData.append("password", password);

  const response = await fetch(`${SERVER_URL}/login`, {
    method: "POST",
    body: formData,
  });

  const user = await response.json();

  // const user = mockUsers.find((u) => u.email === email);
  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(user));
  return user;
}

export function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  window.location.href = "/login";
}

export function getCurrentUser(): User | null {
  if (currentUser) return currentUser;

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
  }

  return null;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
