"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  FileIcon,
  Download,
  Eye,
  Trash2,
  Calendar,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { isAuthenticated, logout } from "@/lib/auth";
import { SERVER_URL } from "../page";

type DocumentCategory = "Sales" | "Purchase" | "Expense" | "Bank Statement";

interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  size: number;
  uploadedAt: string;
  status: "processed" | "processing" | "failed";
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    DocumentCategory | "all"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  // Mock data for demonstration - replace with actual API call
  const mockDocuments: Document[] = [
    {
      id: "1",
      name: "Q4_Sales_Report_2024.pdf",
      category: "Sales",
      size: 2048576,
      type: "pdf",
      uploadedAt: "2024-01-15T10:30:00Z",
      status: "processed",
    },
    {
      id: "2",
      name: "Purchase_Invoice_001.docx",
      category: "Purchase",
      size: 512000,
      type: "docx",
      uploadedAt: "2024-01-14T14:20:00Z",
      status: "processed",
    },
    {
      id: "3",
      name: "Office_Expenses_Jan.jpg",
      category: "Expense",
      size: 1024000,
      type: "jpg",
      uploadedAt: "2024-01-13T09:15:00Z", 
      status: "processing",
    },
    {
      id: "4",
      name: "Bank_Statement_December.pdf",
      category: "Bank Statement",
      type: "pdf",
      size: 1536000,
      uploadedAt: "2024-01-12T16:45:00Z",
      status: "processed",
    },
    {
      id: "5",
      name: "Client_Contract_2024.pdf",
      category: "Sales",
      type: "pdf",
      size: 3072000,
      uploadedAt: "2024-01-11T11:20:00Z",
      status: "failed",
    },
  ];

  useEffect(() => {
    if (!isAuthenticated()) {
      return router.push("/login");
    }

    loadDocuments();
  }, [router]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Replace this with actual API call
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const response = await fetch(`${SERVER_URL}/get-files`, {
        method: "POST",
        headers: {
          Authorization: currentUser.token,
          "X-Client-ID": currentUser.data.user.id,
        },
      });
      const data = await response.json();
      // console.log(data);

      setDocuments(data.documents);

      // setDocuments(mockDocuments);
      // setFilteredDocuments(mockDocuments);
    } catch (err) {
      setError("Failed to load documents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterDocuments();
  }, [searchQuery, selectedCategory, documents]);

  const filterDocuments = () => {
    let filtered = documents;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((doc) => doc.category === selectedCategory);
    }

    setFilteredDocuments(filtered);
  };

  const getStatusBadge = (status: Document["status"]) => {
    const variants = {
      processed: "default",
      processing: "secondary",
      failed: "destructive",
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryBadge = (category: DocumentCategory) => {
    const colors = {
      sales: "bg-blue-100 text-blue-800",
      purchase: "bg-green-100 text-green-800",
      expense: "bg-yellow-100 text-yellow-800",
      "Bank Statement": "bg-purple-100 text-purple-800",
    };

    return (
      <Badge variant="secondary" className={colors[category]}>
        {category}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDocument = (document: Document) => {
    // Implement document viewing logic
    console.log("Viewing document:", document);
  };

  const handleDownloadDocument = (document: Document) => {
    // Implement document download logic
    console.log("Downloading document:", document);
  };

  const handleDeleteDocument = (document: Document) => {
    // Implement document deletion logic
    if (confirm(`Are you sure you want to delete "${document.name}"?`)) {
      console.log("Deleting document:", document);
      setDocuments((prev) => prev.filter((doc) => doc.id !== document.id));
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!currentUser) {
    return router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <main className="w-full">
          <Navbar user={currentUser.data.user} onLogout={handleLogout} />
          <div className="p-6">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground">Loading documents...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {currentUser.data.user.type !== "client" && <AppSidebar />}
      <main className="w-full">
        <Navbar user={currentUser.data.user} onLogout={handleLogout} />
        <div className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
                <p className="text-muted-foreground mt-1">
                  Manage and view all your uploaded documents
                </p>
              </div>
              <Button onClick={() => router.push("/")}>
                <FileIcon className="h-4 w-4 mr-2" />
                Upload New Document
              </Button>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="min-w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        {selectedCategory === "all"
                          ? "All Categories"
                          : selectedCategory}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => setSelectedCategory("all")}
                      >
                        All Categories
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSelectedCategory("Sales")}
                      >
                        Sales
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSelectedCategory("Purchase")}
                      >
                        Purchase
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSelectedCategory("Expense")}
                      >
                        Expense
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSelectedCategory("Bank Statement")}
                      >
                        Bank Statement
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>

            {/* Documents Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents ({filteredDocuments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="text-center py-8 text-red-600">{error}</div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || selectedCategory !== "all"
                      ? "No documents match your search criteria"
                      : "No documents found. Upload your first document to get started."}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Uploaded</TableHead>
                          {/* <TableHead>Status</TableHead> */}
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.map((document) => (
                          <TableRow key={document.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileIcon className="h-4 w-4 text-blue-500" />
                                {document.key}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getCategoryBadge(document.category)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatFileSize(document.size)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(document.created_at)}
                              </div>
                            </TableCell>
                            {/* <TableCell>
                              {getStatusBadge(document.status)}
                            </TableCell> */}
                            <TableCell>
                              {document.type}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDocument(document)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDownloadDocument(document)
                                  }
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDocument(document)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
