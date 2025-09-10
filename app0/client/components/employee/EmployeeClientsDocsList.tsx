import {
  ArrowLeft,
  Calendar,
  Download,
  Eye,
  FileText,
  Image,
  Loader2,
  Paperclip,
} from "lucide-react";
import { Button } from "../ui/button";
import { Client, Document } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { handleDownloadDocument, handleViewDocument } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { extractOriginalFileName } from "@/utils";

export default function EmployeeClientsDocsList({
  client,
  clientDocs,
  onBack,
}: {
  client: Client;
  clientDocs: Document[];
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(""); // 'view', 'download', or null

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
        {/* <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-xl font-bold text-blue-600">
                  {clientDocs.length}
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
                  {clientDocs.length > 0
                    ? formatDistanceToNow(new Date(clientDocs[0].created_at), {
                        addSuffix: true,
                      })
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
                      clientDocs.map((f) =>
                        f.type.split(".").pop().toLowerCase()
                      )
                    ).size
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}
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
          {clientDocs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientDocs.map((document, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* {getFileIcon(document.type)} */}
                    <Paperclip className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">
                        {extractOriginalFileName(document.file_path)}
                      </p>
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
                      onClick={async () => {
                        setLoading("view");

                        try {
                          await handleViewDocument(document.file_path);
                        } finally {
                          setLoading("");
                        }
                      }}
                      disabled={loading === "view" || loading === "download"}
                    >
                      {loading === "view" ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4 mr-1" />
                      )}
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setLoading("download");

                        try {
                          await handleDownloadDocument(document.key); // your actual logic
                        } finally {
                          setLoading("");
                        }
                      }}
                      disabled={loading === "view" || loading === "download"}
                    >
                      {loading === "download" ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
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
