"use client";

import AdminEmployees from "@/components/admin/AdminEmployees";
import EmployeeClientList from "@/components/employee/EmployeeClientsList";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import ManagerEmployees from "@/components/manager/ManagerEmployees";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/types";
import { useEffect, useState } from "react";

export default function Page() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar />
      <main className="w-full">
        <Navbar />
        <div className="p-6">
          {user?.data.user.role === "admin" && <AdminEmployees />}
          {user?.data.user.role === "manager" && <ManagerEmployees />}
        </div>
      </main>
    </div>
  );
}
