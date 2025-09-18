"use client";

import AdminClients from "@/components/admin/AdminClients";
import EmployeeClientList from "@/components/employee/EmployeeClientsList";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import ManagerClients from "@/components/manager/ManagerClients";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/types";
import { useEffect, useState } from "react";

export default function Clients() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className="w-full">
        <Navbar />
        <div className="p-6">
          {user?.data.user.role === "admin" && <AdminClients />}
          {user?.data.user.role === "manager" && <ManagerClients />}
          {user?.data.user.role === "employee" && <EmployeeClientList />}
        </div>
      </main>
    </div>
  );
}
