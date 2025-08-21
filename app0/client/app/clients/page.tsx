"use client";

import EmployeeClientList from "@/components/employee/EmployeeClientsList";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/types";
import { useEffect, useState } from "react";

export default function Clients() {
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
          {user?.data.user.type === "client" && <div>client</div>}

          {user?.data.user.type === "employee" && (
            <EmployeeClientList user={user} />
          )}
        </div>
      </main>
    </div>
  );
}
