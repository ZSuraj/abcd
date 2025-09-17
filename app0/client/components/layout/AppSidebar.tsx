"use client";

import {
  Circle,
  Home,
  SquareCheck,
  Users,
  FolderOpen,
  MessagesSquare,
  MessageCircle,
  Workflow,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Noise } from "../ui/noise";

export function AppSidebar() {
  const [userRole, setUserRole] = useState<
    "client" | "employee" | "admin" | "manager" | ""
  >("");

  useEffect(() => {
    const user = getCurrentUser();
    setUserRole(user?.data.user.role ?? "");
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
            ...(userRole === "employee" && {
              items: [
                {
                  title: "Daily",
                  url: "/tasks/daily",
                },
                {
                  title: "Assigned",
                  url: "/tasks",
                },
              ],
            }),
            ...(userRole === "admin" && {
              items: [
                {
                  title: "Assigned",
                  url: "/tasks",
                },
                // {
                //   title: "Recurring",
                //   url: "/tasks/recurring",
                // },
              ],
            }),
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
    ...(userRole === "admin"
      ? [
          {
            title: "Managers",
            url: "/managers",
            icon: Users,
          },
        ]
      : []),
    ...(userRole !== "employee"
      ? [
          {
            title: "Employees",
            url: "/employees",
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
    // {
    //   title: "Chat",
    //   url: "/chat",
    //   icon: MessageCircle,
    // },
    ...(userRole !== "employee"
      ? [
          {
            title: "Relationships",
            url: "/relationships",
            icon: Workflow,
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
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
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
