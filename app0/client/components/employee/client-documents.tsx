"use client";

import { Client, Document } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Image,
  Download,
  Calendar,
  Paperclip,
  Eye,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { SERVER_URL } from "@/app/page";
import { handleDownloadDocument, handleViewDocument } from "@/lib/utils";

interface ClientDocumentsProps {
  client: Client;
  documents: Document[];
  onBack: () => void;
}

export function ClientDocuments({
  client,
  documents,
  onBack,
}: ClientDocumentsProps) {
  console.log("ccc");
  console.log("ccc");
  console.log("ccc");
  console.log("ccc");
  console.log(client);
  console.log(documents);

  const clientDocuments = documents
    .filter((doc) => doc.client_id === client.id)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image className="h-5 w-5 text-blue-600" />;
    }
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = (document: Document) => {
    // In a real app, this would download the actual file
    console.log("Downloading:", document.name);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {client.name}'s Documents
          </h2>
          <p className="text-gray-600">{client.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-xl font-bold text-blue-600">
                  {documents.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Latest Upload</p>
                <p className="text-xl font-bold text-green-600">
                  {clientDocuments.length > 0
                    ? formatDistanceToNow(
                        new Date(clientDocuments[0].created_at),
                        { addSuffix: true }
                      )
                    : "None"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">File Types</p>
                <p className="text-xl font-bold text-purple-600">
                  {
                    new Set(
                      documents.map((f) =>
                        f.type.split(".").pop().toLowerCase()
                      )
                    ).size
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            All documents uploaded by {client.name}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* {getFileIcon(document.type)} */}
                    <Paperclip className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{document.key}</p>
                      {/* <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{formatFileSize(document.size)}</span>
                        <span>•</span>
                        <span>
                          {format(
                            new Date(document.uploadedAt),
                            "MMM dd, yyyy"
                          )}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(document.uploadedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div> */}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Received
                    </Badge> */}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(document.key)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDocument(document.key)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
