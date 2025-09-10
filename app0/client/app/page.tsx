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

const SUPABASE_URL = "https://qinrqkocqfuhmefzlfva.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbnJxa29jcWZ1aG1lZnpsZnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjAxNzEsImV4cCI6MjA3MjAzNjE3MX0.LqxjYgns8nq-s4mJj8W-CiFN16m09lhi5y3QWP7GExc";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
