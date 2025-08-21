"use client";

import {
  Circle,
  Home,
  SquareCheck,
  Users,
  FolderOpen,
  MessagesSquare,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { useEffect, useState } from "react";

export function AppSidebar() {
  const [userRole, setUserRole] = useState<
    "client" | "employee" | "admin" | null
  >(null);

  useEffect(() => {
    const user = getCurrentUser();
    setUserRole(user?.data.user.type ?? null);
  }, []);

  const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    ...(userRole !== "client"
      ? [
          {
            title: "Tasks",
            url: "/tasks",
            icon: SquareCheck,
          },
        ]
      : []),
    ...(userRole !== "client"
      ? [
          {
            title: "Clients",
            url: "/clients",
            icon: Users,
          },
        ]
      : []),
    // Conditionally add "Documents" if user is admin
    ...(userRole !== "employee"
      ? [
          {
            title: "Documents",
            url: "/documents",
            icon: FolderOpen,
          },
        ]
      : []),
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="h-[48px]">
                <Circle className="h-4 w-4" />
                <span>App0</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="https://insigh.to/b/app0" target="_blank">
                <MessagesSquare className="h-4 w-4" />
                <span>Feedback</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
