"use client";

import AdminRelationship from "@/components/admin/AdminRelationship";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import ManagerRelationship from "@/components/manager/ManagerRelationship";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/types";
import { useEffect, useState } from "react";

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
          {user?.data.user.role === "admin" && <AdminRelationship />}
          {user?.data.user.role === "manager" && <ManagerRelationship />}
        </div>
      </div>
    </div>
  );
}
