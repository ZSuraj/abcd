import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "timeago.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(timestamp) {
  const utcDate = new Date(timestamp.replace(" ", "T") + "Z"); // Adds the Z for UTC
  const now = new Date(); // Local time (IST in your case)

  const seconds = Math.floor((now - utcDate) / 1000);

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

export function formatISTTimeAgo(date) {
  const inputDate = new Date(date);

  // Convert UTC date to IST by adding +5:30 offset
  const ISTOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
  const istDate = new Date(inputDate.getTime() + ISTOffset);

  return format(istDate);
}
