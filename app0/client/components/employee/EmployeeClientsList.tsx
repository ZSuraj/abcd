import { getEmployeesClientDocs, getEmployeesClients } from "@/lib/api";
import { Client, Document, User } from "@/types";
import { FileText, FolderOpen, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import EmployeeClientsDocsList from "./EmployeeClientsDocsList";

export default function EmployeeClientList({ user }: { user: User }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientDocs, setClientDocs] = useState<Document[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    getClients();
  }, []);

  async function getClients() {
    const res = await getEmployeesClients();
    if (!res.ok) {
      console.log("Error fetching clients");
    }
    const data = (await res.json()) as { data: Client[] };
    if (data.data) {
      setClients(data.data);
    }
  }

  async function getDocs(clientId: string) {
    const res = await getEmployeesClientDocs(clientId, user?.data.user.id);
    if (!res.ok) {
      console.log("Error fetching documents");
    }
    const data = (await res.json()) as { documents: Document[] };
    if (data.documents) {
      setClientDocs(data.documents);
    }
  }

  return (
    <div>
      {selectedClient ? (
        <>
          <EmployeeClientsDocsList
            client={selectedClient}
            clientDocs={clientDocs}
            onBack={() => {
              setSelectedClient(null);
              setClientDocs([]);
            }}
          />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients?.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <FolderOpen className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-lg text-gray-500 font-medium mb-2">
                  No clients assigned
                </p>
                <p className="text-sm text-gray-400">
                  You currently have no clients assigned to you.
                </p>
              </div>
            ) : (
              clients?.map((client) => {
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
                      {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{client.email}</span>
                      </div> */}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 text-sm">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>{client.no_of_docs} documents</span>
                        </div>

                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700"
                        >
                          {client.no_of_tasks} tasks
                        </Badge>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full mt-3 cursor-pointer"
                        size="sm"
                        onClick={() => {
                          getDocs(client.id);
                          setSelectedClient(client);
                        }}
                      >
                        View Documents
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
