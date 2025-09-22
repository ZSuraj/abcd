"use client";

import { Navbar } from "@/components/layout/Navbar";
import { EmployeeDashboard } from "@/components/employee/EmployeeDashboard";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useEffect, useState } from "react";
import { getCurrentUser, isAuthenticated } from "@/lib/auth";
import { User } from "@/types";
import ClientDashboard from "@/components/client/ClientDashboard";
import ManagerDashboard from "@/components/manager/ManagerDashboard";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { createClient } from "@supabase/supabase-js";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    if (!isAuthenticated()) {
      // return <RoleSwitcher users={mockUsers} onSelectUser={loginAs} />;
      return router.push("/login");
    }
    const user = getCurrentUser();
    console.log(user);
    setUser(user);
  }, [router]);

  return (
    <div className="min-h-screen flex">
      {user?.data.user.role !== "client" && <AppSidebar />}
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          {user?.data.user.role === "employee" && <EmployeeDashboard />}
          {user?.data.user.role === "client" && <ClientDashboard user={user} />}
          {user?.data.user.role === "manager" && (
            <ManagerDashboard user={user} />
          )}
          {user?.data.user.role === "admin" && <AdminDashboard user={user} />}
        </div>
      </div>
    </div>
  );
}
