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
import { DocumentUpload } from "../client/document-upload";
import { useState } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { logout } from "@/lib/auth";

interface NavbarProps {
  user: User;
  unreadCount?: number;
  onLogout: () => void;
  onMarkAllRead?: () => void;
}

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

export function Navbar({ user, unreadCount = 0, onMarkAllRead }: NavbarProps) {
  const clients = JSON.parse(localStorage.getItem("clients") || "[]");
  const [selectedClient, setSelectedClient] = useState<number>(0);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <SidebarTrigger className="w-4 h-4" />

        {/* <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">App0</h1>
          <Badge className={getRoleColor(user.type)}>
            {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
          </Badge>
        </div> */}

        <div className="flex items-center space-x-4">
          {(user.type === "admin" || user.type === "employee") && (
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
                      onClick={onMarkAllRead}
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
          )}

          {user.type === "employee" && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <Upload className="h-4 w-4 mr-1" />
                  <span className="font-normal">Upload</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  {/* <DrawerHeader>
                    <DrawerTitle>Upload Files</DrawerTitle>
                    <DrawerDescription>
                      Choose files to upload from your device.
                    </DrawerDescription>
                  </DrawerHeader> */}
                  <div className="py-4 space-y-4">
                    {/* Client Dropdown */}
                    <div>
                      <label
                        htmlFor="client-select"
                        className="block mb-1 text-sm font-medium"
                      >
                        Select Client
                      </label>
                      <Select
                        onValueChange={(value) => {
                          setSelectedClient(value);
                        }}
                        // value={selectedClient.name}
                      >
                        <SelectTrigger id="client-select" className="w-full">
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-1">
                    <DocumentUpload
                      userId={user.id}
                      selectedClient={selectedClient}
                    />
                  </div>

                  {/* <div className="p-4"> */}
                  {/* Add your file upload component or logic here */}
                  {/* <div className="border border-dashed border-muted rounded-md p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Drag & drop files here or click to browse
                      </p>
                    </div> */}
                  {/* </div> */}
                  <DrawerFooter>
                    {/* <Button
                      onClick={() => handleUpload()}
                      disabled={!selectedClient}
                    >
                      Upload
                    </Button> */}
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 px-2 text-sm text-gray-700 cursor-pointer"
              >
                <UserIcon className="h-4 w-4" />
                <span className="font-normal capitalize">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuItem onClick={() => logout()}>
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
