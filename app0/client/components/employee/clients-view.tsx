"use client";

import { User, Client, Document } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, FileText, User as UserIcon, Mail } from "lucide-react";

interface ClientsViewProps {
  user: User;
  clients: Client[];
  documents: Document[];
  onSelectClient: (client: Client) => void;
}

export function ClientsView({
  clients,
  documents,
  onSelectClient,
}: ClientsViewProps) {
  const getClientDocuments = (clientId: string) => {
    return documents.filter((doc) => doc.clientId === clientId);
  };

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No clients assigned
        </h3>
        <p className="text-gray-600">
          You don't have any clients assigned yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Your Clients
        </h3>
        <p className="text-gray-600">
          Click on a client folder to view their documents
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => {
          const clientDocuments = getClientDocuments(client.id);

          return (
            <Card
              key={client.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-200"
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-2 p-3 bg-blue-100 rounded-full w-fit">
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{client.name}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{client.email}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>{clientDocuments.length} documents</span>
                  </div>

                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {client.no_of_tasks} tasks
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-3"
                  size="sm"
                  onClick={() => onSelectClient(client)}
                >
                  View Documents
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
