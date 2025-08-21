"use client";

import { Task } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "timeago.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(timestamp: string) {
  const utcDate = new Date(timestamp.replace(" ", "T") + "Z"); // Adds the Z for UTC
  const now = new Date(); // Local time (IST in your case)

  const seconds = Math.floor((now.getTime() - utcDate.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count > 0) {
      if (unit === "day" && count === 1) return "yesterday";
      return count === 1 ? `1 ${unit} ago` : `${count} ${unit}s ago`;
    }
  }

  return "just now";
}

export function formatISTTimeAgo(date: string) {
  const inputDate = new Date(date);

  // Convert UTC date to IST by adding +5:30 offset
  const ISTOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
  const istDate = new Date(inputDate.getTime() + ISTOffset);

  return format(istDate);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getStatusColor(status: Task["status"]) {
  switch (status) {
    case "pending":
      return "bg-gray-100 text-gray-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "in-review":
      return "bg-orange-100 text-orange-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
