"use client";

import { useAppState } from "@/hooks/use-app-state";
import { RoleSwitcher } from "@/components/role-switcher";
import { Navbar } from "@/components/layout/navbar";
import { ClientDashboard } from "@/components/client/client-dashboard";
import { EmployeeDashboard } from "@/components/employee/employee-dashboard";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { useRouter } from "next/navigation";

export const SERVER_URL = "http://localhost:8787";

export default function Home() {
  const {
    currentUser,
    clients,
    documents,
    tasks,
    notifications,
    mockUsers,
    isInitialized,
    loginAs,
    logout,
    addDocument,
    updateTaskStatus,
    reassignClient,
    markAllNotificationsRead,
    getUnreadNotifications,
  } = useAppState();

  const employees = mockUsers.filter((user) => user.type === "employee");
  const unreadNotifications = currentUser
    ? getUnreadNotifications(currentUser.id)
    : [];
  const router = useRouter();

  const handleUploadDocuments = (files: File[]) => {
    if (currentUser?.id) {
      files.forEach((file) => {
        addDocument(file, currentUser.id);
      });
    }
  };

  if (!isInitialized) {
    return <div>Loading app state...</div>;
  }

  if (!currentUser) {
    // return <RoleSwitcher users={mockUsers} onSelectUser={loginAs} />;
    return router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={currentUser?.data.user}
        unreadCount={unreadNotifications.length}
        onLogout={logout}
        onMarkAllRead={markAllNotificationsRead}
      />

      <main className="p-6">
        {currentUser?.data.user.type === "client" && (
          <ClientDashboard
            user={currentUser.data.user}
            documents={documents}
            onUploadDocuments={handleUploadDocuments}
          />
        )}

        {currentUser?.data.user.type === "employee" && (
          <EmployeeDashboard
            user={currentUser.data.user}
            tasks={tasks}
            clients={clients}
            documents={documents}
            onUpdateTaskStatus={updateTaskStatus}
          />
        )}

        {currentUser?.data.user.type === "admin" && (
          <AdminDashboard
            user={currentUser?.data.user}
            tasks={tasks}
            clients={clients}
            documents={documents}
            employees={employees}
            onUpdateTaskStatus={updateTaskStatus}
            onReassignClient={reassignClient}
          />
        )}
      </main>
    </div>
  );
}
