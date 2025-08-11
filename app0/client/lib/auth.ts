import { SERVER_URL } from "@/app/page";
import { User } from "@/types";

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

export const login = async (
  email: string,
  password: string
): Promise<User | null> => {
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
};

export const logout = () => {
  currentUser = null;
  localStorage.removeItem("currentUser");
};

export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
  }

  return null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
