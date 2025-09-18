"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/types";
import { useEffect, useState } from "react";
import AdminRecurringTasks from "@/components/admin/AdminRecurringTasks";

export default function Page() {
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
          {user?.data.user.role === "admin" && <AdminRecurringTasks />}
        </div>
      </div>
    </div>
  );
}
