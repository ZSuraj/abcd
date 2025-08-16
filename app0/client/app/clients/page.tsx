"use client";

import { ClientDocuments } from "@/components/employee/client-documents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Clock,
  User as UserIcon,
  AlertCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Paperclip,
  FileText,
  Mail,
  FolderOpen,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SERVER_URL } from "../page";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function Clients() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const router = useRouter();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  //   const clients = JSON.parse(localStorage.getItem("clients") || "[]");

  const [cdocuments, setCDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [reassigning, setReassigning] = useState<string | null>(null);
  const [viewingClientId, setViewingClientId] = useState<string | null>(null);
  const [allEmployees, setAllEmployees] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  async function getDocs(clientId: number) {
    const res = await fetch(`${SERVER_URL}/get-files`, {
      method: "POST",
      headers: {
        "X-Client-ID": clientId.toString(),
      },
    });
    const data = await res.json();
    console.log(data);
    setCDocuments(data.keys);
    localStorage.setItem("clientDocuments", JSON.stringify(data.keys));
  }

  useEffect(() => {
    const docs = JSON.parse(localStorage.getItem("clientDocuments") || "[]");
    setCDocuments(docs);

    // if (docs.length < 1) {
    //   getDocs();
    // }
  }, []);

  if (selectedClient) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <ClientDocuments
          client={selectedClient}
          documents={cdocuments}
          onBack={() => setSelectedClient(null)}
        />
      </div>
    );
  }

//   if (clients.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
//         <h3 className="text-lg font-medium text-gray-900 mb-2">
//           No clients assigned
//         </h3>
//         <p className="text-gray-600">
//           You don't have any clients assigned yet.
//         </p>
//       </div>
//     );
//   }

  if (!currentUser) {
    // return <RoleSwitcher users={mockUsers} onSelectUser={loginAs} />;
    return router.push("/login");
  }

  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(searchTerm.toLowerCase())
    // client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Employee stats
  const employeeStats = allEmployees.map((employee) => ({
    employee,
    clientCount: clients.filter((c) => c.assignedEmployeeId === employee.id)
      .length,
  }));

  const fetchAllEmployees = async () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
      const res = await fetch(`${SERVER_URL}/get-all-employees`, {
        method: "POST",
        headers: {
          Authorization: user.token,
        },
      });
      const data = await res.json();
      setAllEmployees(data.data);
      localStorage.setItem("allEmployees", JSON.stringify(data.data));
      // console.log(data.data);
    }
  };

  const fetchAllClients = async () => {
    console.log("fetchAllClients");

    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
      const res = await fetch(`${SERVER_URL}/get-all-clients`, {
        method: "POST",
        headers: {
          Authorization: user.token,
        },
      });
      const data = await res.json();
      setClients(data.data);
      console.log(data.data);
    }
  };

  useEffect(() => {
    fetchAllEmployees();
    fetchAllClients();
  }, []);

  const handleReassign = async (
    clientId: string,
    newEmployeeId: string,
    oldEmployeeId: string
  ) => {
    setReassigning(clientId);

    console.log(oldEmployeeId, clientId);
    const user = JSON.parse(localStorage.getItem("currentUser"));

    const res = await fetch(`${SERVER_URL}/reassign-employee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: user.token,
      },
      body: JSON.stringify({
        clientId,
        newEmployeeId,
        oldEmployeeId,
      }),
    });
    const data = await res.json();
    console.log(data);

    onReassignClient(clientId, newEmployeeId);
    setReassigning(null);
    fetchAllClients();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar />
      <main className="w-full">
        <Navbar user={currentUser.data.user} />
        <div className="p-6">
          {currentUser?.data.user.type === "client" && <div>client</div>}

          {currentUser?.data.user.type === "employee" && (
            <div>
              {/* <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your Clients
              </h3>
              <p className="text-gray-600">
                Click on a client folder to view their documents
              </p>
            </div> */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => {
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
                            <span>{cdocuments.length} documents</span>
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
                          className="w-full mt-3"
                          size="sm"
                          onClick={() => {
                            getDocs(client.id);
                            setSelectedClient(client.id);
                          }}
                        >
                          View Documents
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {currentUser?.data.user.type === "admin" && (
            <div>
              <div className="space-y-6">
                {/* Employee Workload Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Employee Workload</CardTitle>
                    <CardDescription>
                      Current client assignments per employee
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employeeStats.map(({ employee, clientCount }) => (
                        <div
                          key={employee.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-full">
                              <UserIcon className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-sm text-gray-600">
                                {employee.email}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700"
                          >
                            {clientCount} clients
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Client Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Client Assignments</CardTitle>
                    <CardDescription>
                      Manage which employee is assigned to each client
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Client List */}
                    <div className="space-y-3">
                      {filteredClients.map((client) => {
                        // const clientDocuments = getClientDocuments(client.id);
                        const isReassigning = reassigning === client.id;

                        return (
                          <div
                            key={client.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-blue-100 rounded-full">
                                <UserIcon className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{client.name}</p>
                                <p className="text-sm text-gray-600">
                                  {client.email}
                                </p>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {client.doculist?.length} documents
                                  </span>
                                  <span>•</span>
                                  <span>{client.no_of_tasks} tasks</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewingClientId(client.id)}
                                // className="mr-2"
                              >
                                {/* <Eye className="h-4 w-4 mr-1" /> */}
                                View Documents
                              </Button>

                              {/* <div className="text-right">
                      <p className="text-sm text-gray-600">Assigned to:</p>
                      <p className="font-medium">{getEmployeeName(client.assignedEmployeeId)}</p>
                    </div> */}

                              <Select
                                value={client.employee?.id}
                                onValueChange={(value) =>
                                  handleReassign(
                                    client.id,
                                    value,
                                    client.employee?.id
                                  )
                                }
                                disabled={isReassigning}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {allEmployees.map((employee) => (
                                    <SelectItem
                                      key={employee.id}
                                      value={employee.id}
                                    >
                                      {employee.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {isReassigning && (
                                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
