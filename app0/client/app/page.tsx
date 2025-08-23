"use client";

import { Navbar } from "@/components/layout/Navbar";
import { EmployeeDashboard } from "@/components/employee/EmployeeDashboard";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useEffect, useState } from "react";
import { getCurrentUser, isAuthenticated } from "@/lib/auth";
import { User } from "@/types";
import ClientDashboard from "@/components/client/ClientDashboard";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    if (!isAuthenticated()) {
      // return <RoleSwitcher users={mockUsers} onSelectUser={loginAs} />;
      return router.push("/login");
    }
    const user = getCurrentUser();
    setUser(user);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {user?.data.user.type !== "client" && <AppSidebar />}
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          {user?.data.user.type === "employee" && <EmployeeDashboard />}
          {user?.data.user.type === "client" && <ClientDashboard user={user}/>}
        </div>
      </div>
    </div>
  );
}
