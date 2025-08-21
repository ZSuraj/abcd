import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { fetchDocument } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleViewDocument = async (key: string) => {
  const res = (await fetchDocument(key)) as Response;
  if (!res.ok) {
    console.error("Failed to fetch file for viewing");
    toast.error("Failed to fetch file for viewing");
    return;
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank");
};

export const handleDownloadDocument = async (key: string) => {
  const res = (await fetchDocument(key)) as Response;
  if (!res.ok) {
    console.error("Failed to fetch file for downloading");
    toast.error("Failed to fetch file for downloading");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = key.split("/").pop() || "download";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
