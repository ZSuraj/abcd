"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { Document, Task, User } from "@/types";
import { useEffect, useState } from "react";
import EmployeeTasksList from "@/components/employee/EmployeeTasksList";
import AdminTasks from "@/components/admin/AdminTasks";
import ManagerTasks from "@/components/manager/ManagerTasks";

export default function Tasks() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          {user?.data.user.role === "client" && <div>client</div>}

          {user?.data.user.role === "employee" && <EmployeeTasksList />}

          {user?.data.user.role === "manager" && <ManagerTasks />}

          {user?.data.user.role === "admin" && <AdminTasks />}
        </div>
      </div>
    </div>
  );
}
