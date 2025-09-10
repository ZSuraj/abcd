"use client";

import AdminDocuments from "@/components/admin/AdminDocuments";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import ManagerDocuments from "@/components/manager/ManagerDocuments";
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
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          {user?.data.user.role === "admin" && <AdminDocuments />}
          {user?.data.user.role === "manager" && <ManagerDocuments />}
        </div>
      </div>
    </div>
  );
}
