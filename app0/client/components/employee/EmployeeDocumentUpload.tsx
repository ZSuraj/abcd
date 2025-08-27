"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Image,
  X,
  CheckCircle,
  FileIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  getEmployeesClients,
  handleEmployeeUploadDocuments,
  handleUploadDocuments,
} from "@/lib/api";
import { Client, User } from "@/types";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DrawerClose } from "@/components/ui/drawer";

type DocumentCategory =
  | "Sales"
  | "Purchase"
  | "Expense"
  | "Bank Statement"
  | "Cash"
  | "Others"
  | null;

const categories: DocumentCategory[] = [
  "Sales",
  "Purchase",
  "Expense",
  "Bank Statement",
  "Cash",
  "Others",
];

export function EmployeeDocumentUpload({ user }: { user: User }) {
  const router = useRouter();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<DocumentCategory>(null);

  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  useEffect(() => {
    getEmployeesClients().then((data) => {
      data.json().then((data: any) => {
        setClients(data.data as Client[]);
      });
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles([...selectedFiles, ...Array.from(files)]);
      setUploadSuccess(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files) {
      setSelectedFiles(Array.from(files));
      setUploadSuccess(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedClientId === "") {
      toast.error("Please select a client");
      return;
    }
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Mock upload process
    // setTimeout(() => {
    clearInterval(progressInterval);
    setUploadProgress(100);

    // Call the upload handler
    const res = (await handleEmployeeUploadDocuments(
      user.data.user.id,
      selectedFiles,
      selectedCategory as string,
      selectedClientId as string
    )) as Response;

    if (!res.ok) {
      toast.error("Failed to upload documents");
      setIsUploading(false);
      return;
    }

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setSelectedFiles([]);
      setUploadProgress(0);

      // Reset form
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Hide success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 500);
    // }, 2000);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image className="h-4 w-4 text-blue-600" />;
    }
    return <FileText className="h-4 w-4 text-blue-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full mx-auto max-w-sm overflow-y-scroll space-y-4 py-4">
      <div className="">
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
              setSelectedClientId(value);
            }}
            // value={selectedClient.name}
          >
            <SelectTrigger id="client-select" className="w-full">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client: any) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {selectedFiles.length < 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Documents
            </CardTitle>
            <CardDescription>
              Upload your documents and they will be automatically assigned to
              your designated employee.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {uploadSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Documents uploaded successfully! They have been assigned to
                  your employee for review.
                </AlertDescription>
              </Alert>
            )}

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop files here, or click to select
              </p>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={isUploading}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                asChild
              >
                <span
                  className="cursor-pointer"
                  onClick={() => setShowCategoryDialog(true)}
                >
                  Select Files
                </span>
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Supported: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>

            {/* Selected Files */}
          </CardContent>

          {/* category dialog */}
          <Dialog
            open={showCategoryDialog}
            onOpenChange={setShowCategoryDialog}
          >
            <DialogContent className="w-3/4">
              <DialogHeader>
                <DialogTitle>Select Document Category</DialogTitle>
                <DialogDescription>
                  Please select the category for the uploaded documents.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 py-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    className="w-full"
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryDialog(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      )}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Selected Files:</Label>
            {selectedCategory && (
              <Badge variant="secondary" className="text-xs">
                {selectedCategory}
              </Badge>
            )}
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <div className="flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="h-6 w-6 p-0 hover:bg-red-100"
                >
                  <X className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <Label>Upload Progress:</Label>
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-gray-600 text-center">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
      {user?.data.user.type === "client" && (
        <div className="w-full flex items-center justify-center">
          <Button
            variant="link"
            onClick={() => router.push("/documents")}
            className="flex justify-center"
          >
            <FileIcon className="h-4 w-4 mr-2" />
            View Documents
          </Button>
        </div>
      )}
      <Button
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || isUploading}
        className="w-full"
      >
        {isUploading
          ? "Uploading..."
          : `Upload ${selectedFiles.length} Document${
              selectedFiles.length !== 1 ? "s" : ""
            }`}
      </Button>
      <DrawerClose className="w-full" asChild>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </div>
  );
}
