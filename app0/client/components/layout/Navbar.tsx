"use client";

import { Client, User, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, Upload, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getEmployeesClients } from "@/lib/api";
import { EmployeeDocumentUpload } from "../employee/EmployeeDocumentUpload";
import { Noise } from "../ui/noise";

const getRoleColor = (role: UserRole) => {
  switch (role) {
    case "client":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "employee":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "admin":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export function Navbar() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<number>(0);
  const [user, setUser] = useState<User | null>();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // getEmployeesClients().then((data) => {
    //   data.json().then((data: any) => {
    //     setClients(data.data as Client[]);
    //   });
    // });
    setUser(getCurrentUser());
  }, []);

  return (
    <nav className="border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <SidebarTrigger className="w-4 h-4" />

        <div className="flex items-center">
          {/* {(user?.data.user.role === "admin" ||
            user?.data.user.role === "employee") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative px-2">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {unreadCount > 0 ? (
                  <>
                    <DropdownMenuItem
                      // onClick={onMarkAllRead}
                      className="text-blue-600"
                    >
                      Mark all as read ({unreadCount})
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem disabled>
                    No new notifications
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )} */}

          {user?.data.user.role === "employee" && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  // variant="ghost"
                  // size="sm"
                  className="mr-2 px-2 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  <span className="font-normal">Upload</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <EmployeeDocumentUpload user={user} />
              </DrawerContent>
            </Drawer>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2 cursor-pointer">
                <UserIcon className="h-4 w-4 mr-1" />
                <span className="font-normal capitalize">
                  {user?.data.user.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  logout(), router.push("/login");
                }}
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Switch Role
          </Button> */}
        </div>
      </div>
    </nav>
  );
}
