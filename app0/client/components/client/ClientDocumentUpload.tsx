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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  getCategories,
  handleClientUploadDocuments,
  handleUploadDocuments,
} from "@/lib/api";
import { Category, Client, User } from "@/types";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

type DocumentCategory =
  | "Sales"
  | "Purchase"
  | "Expense"
  | "Bank Statement"
  | null;

const categories: DocumentCategory[] = [
  "Sales",
  "Purchase",
  "Expense",
  "Bank Statement",
];

export function ClientDocumentUpload({ user }: { user: User }) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

  const router = useRouter();

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
    setShowCategoryDialog(true);

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
    const res = (await handleClientUploadDocuments(
      selectedFiles,
      selectedCategory as string
    )) as Response;

    if (!res.ok) {
      const data = await res.json();
      if (data) {
        // @ts-ignore
        toast.error(data.error);
      }
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        const data = await res.json();
        if (data && data.data) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.data.user.name}!
        </h2>
        <p className="text-gray-600">
          Upload your documents and track your submissions.
        </p>
      </div>
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
                Documents uploaded successfully! They have been assigned to your
                employee for review.
              </AlertDescription>
            </Alert>
          )}

          {/* File Upload Area */}
          {selectedFiles.length < 1 && (
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
          )}

          {/* Selected Files */}
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
          {/* {user?.data.user.type === "client" && (
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
        )} */}
        </CardContent>

        {/* category dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent className="w-3/4">
            <DialogHeader>
              <DialogTitle>Select Document Category</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.name ? "default" : "outline"
                  }
                  className="w-full capitalize"
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setShowCategoryDialog(false);
                    fileInputRef.current?.click();
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
