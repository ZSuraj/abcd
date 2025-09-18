"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  ChevronDown,
  Users,
  User,
  Plus,
  Minus,
  Edit,
} from "lucide-react";
import {
  ClientWithRelationships,
  Manager,
  Employee,
  Category,
  Client,
} from "@/types";
import {
  getRelationshipTree,
  fetchAllManagers,
  fetchAllEmployees,
  fetchAllClients,
  updateRelationshipTree,
  replaceManager,
  replaceEmployee,
  removeEmployee,
  addEmployee,
} from "@/lib/api";
import { toast } from "sonner";

interface TreeNodeProps {
  client: ClientWithRelationships;
  level: number;
  onToggle: (id: string, type: "client" | "manager") => void;
  expandedClients: Set<string>;
  expandedManagers: Set<string>;
  onAddManager: (clientId: string) => void;
  onAddEmployee: (clientId: string, managerId: string) => void;
  onReplaceManager: (clientId: string, managerId: string) => void;
  onReplaceEmployee: (
    clientId: string,
    managerId: string,
    employeeId: string,
  ) => void;
  onRemoveEmployee: (
    clientId: string,
    managerId: string,
    employeeId: string,
  ) => void;
  getCategoryColor: (category: string) => string;
}

function TreeNode({
  client,
  level,
  onToggle,
  expandedClients,
  expandedManagers,
  onAddManager,
  onAddEmployee,
  onReplaceManager,
  onReplaceEmployee,
  onRemoveEmployee,
  getCategoryColor,
}: TreeNodeProps) {
  const indent = level * 20;

  return (
    <div>
      {/* Client Node */}
      <div
        className="flex items-center py-2 hover:bg-gray-50 cursor-pointer"
        style={{ paddingLeft: `${indent}px` }}
        onClick={() => onToggle(client.client_id, "client")}
      >
        {expandedClients.has(client.client_id) ? (
          <ChevronDown className="w-4 h-4 mr-2" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2" />
        )}
        <Users className="w-4 h-4 mr-2 text-blue-600" />
        <div className="flex-1">
          <span className="font-medium">{client.client_name}</span>
          <span className="text-gray-500 text-sm ml-2">
            ({client.client_email})
          </span>
        </div>
        {client.managers.length < 1 && (
          <>
            <Badge variant="secondary" className="mr-2">
              {client.managers.length} Manager
              {client.managers.length !== 1 ? "s" : ""}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddManager(client.client_id);
              }}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>

      {/* Manager Nodes */}
      {client.managers.length > 0 &&
        expandedClients.has(client.client_id) &&
        client.managers.map((manager) => (
          <div key={manager.manager_id}>
            <div
              className="flex items-center py-2 hover:bg-gray-100 cursor-pointer"
              style={{ paddingLeft: `${indent + 40}px` }}
              onClick={() => onToggle(manager.manager_id as string, "manager")}
            >
              {expandedManagers.has(manager.manager_id as string) ? (
                <ChevronDown className="w-4 h-4 mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )}
              <User className="w-4 h-4 mr-2 text-green-600" />
              <div className="flex-1">
                <span className="font-medium">{manager.manager_name}</span>
                <span className="text-gray-500 text-sm ml-2">
                  ({manager?.manager_email})
                </span>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReplaceManager(
                      client.client_id,
                      manager.manager_id as string,
                    );
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Employee Nodes */}
            {manager?.employees?.length > 0 &&
              expandedManagers.has(manager.manager_id) &&
              manager?.employees?.map((employee) => (
                <div
                  key={employee.id || employee.employee_id}
                  className="flex items-center py-1 hover:bg-gray-50"
                  style={{ paddingLeft: `${indent + 80}px` }}
                >
                  <div className="w-4 mr-2" /> {/* Spacer */}
                  <Users className="w-3 h-3 mr-2 text-gray-600" />
                  <div className="flex-1">
                    <span className="text-sm">
                      {employee.name || employee.employee_name}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">
                      ({employee.email || employee.employee_email})
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onReplaceEmployee(
                          client.client_id,
                          manager.manager_id,
                          employee.id || employee.employee_id,
                        )
                      }
                    >
                      <Edit className="w-2 h-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={() =>
                        onRemoveEmployee(
                          client.client_id,
                          manager.manager_id,
                          employee.id || employee.employee_id,
                        )
                      }
                    >
                      <Minus className="w-2 h-2" />
                    </Button>
                  </div>
                </div>
              ))}

            {/* Add Employee Button */}
            {expandedManagers.has(manager.manager_id) && (
              <div
                className="flex items-center py-1"
                style={{ paddingLeft: `${indent + 80}px` }}
              >
                <div className="w-4 mr-2" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() =>
                    onAddEmployee(client.client_id, manager.manager_id)
                  }
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Employee
                </Button>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

interface RelationshipTreeViewProps {
  clients?: ClientWithRelationships[];
}

export default function RelationshipTreeView({
  searchTerm,
}: {
  searchTerm: string;
}) {
  const [clients, setClients] = useState<ClientWithRelationships[]>();
  const [filteredClients, setFilteredClients] =
    useState<ClientWithRelationships[]>();
  const [expandedClients, setExpandedClients] = useState<Set<string>>(
    new Set(),
  );
  const [expandedManagers, setExpandedManagers] = useState<Set<string>>(
    new Set(),
  );

  // Dialog states
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isReplaceManagerOpen, setIsReplaceManagerOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isReplaceEmployeeOpen, setIsReplaceEmployeeOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [selectedReplacementManagerId, setSelectedReplacementManagerId] =
    useState<string>("");
  const [selectedClientForRelationship, setSelectedClientForRelationship] =
    useState<string>("");
  const [selectedManagerForRelationship, setSelectedManagerForRelationship] =
    useState<string>("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedEmployeeToReplace, setSelectedEmployeeToReplace] =
    useState<string>("");
  const [selectedReplacementEmployeeId, setSelectedReplacementEmployeeId] =
    useState<string>("");

  // Form states
  const [newManager, setNewManager] = useState({
    managerId: "",
    category: "",
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [allManagers, setAllManagers] = useState<Manager[]>();
  const [allEmployees, setAllEmployees] = useState<Employee[]>();
  const [allClients, setAllClients] = useState<any[]>([]);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isReplacingManager, setIsReplacingManager] = useState(false);
  const [isReplacingEmployee, setIsReplacingEmployee] = useState(false);

  // Handler functions
  const handleAddManager = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsAddManagerOpen(true);
  };

  const handleAddEmployee = (clientId: string, managerId: string) => {
    setSelectedClientId(clientId);
    setSelectedManagerId(managerId);
    setIsAddEmployeeOpen(true);
  };

  const handleReplaceManager = (clientId: string, managerId: string) => {
    setSelectedClientId(clientId);
    setSelectedManagerId(managerId);
    setIsReplaceManagerOpen(true);
  };

  const handleSaveEmployee = async () => {
    if (!selectedEmployeeId || !selectedManagerId || !selectedClientId) {
      toast.error("Missing required information. Please try again.");
      return;
    }

    setIsAddingEmployee(true);

    try {
      const res = await addEmployee(
        selectedClientId,
        selectedManagerId,
        selectedEmployeeId,
      );

      if (res.ok) {
        toast.success("Employee added successfully");
        setIsAddEmployeeOpen(false);
        setSelectedEmployeeId("");
        // Refresh the data to show the updated relationships
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error("Failed to add employee");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("An error occurred while adding the employee");
    } finally {
      setIsAddingEmployee(false);
    }
  };

  const handleSaveReplacement = async () => {
    if (!selectedReplacementManagerId) return;

    setIsReplacingManager(true);

    try {
      const res = await replaceManager(
        selectedClientId,
        selectedReplacementManagerId,
      );

      if (res.ok) {
        toast.success("Manager replaced successfully");
        fetchData();
        setIsReplaceManagerOpen(false);
        setSelectedReplacementManagerId("");
      } else {
        toast.error("Failed to replace manager");
      }
    } catch (error) {
      console.error("Error replacing manager:", error);
      toast.error("An error occurred while replacing the manager");
    } finally {
      setIsReplacingManager(false);
    }
  };

  const handleAddClient = () => {
    setIsAddClientOpen(true);
  };

  const handleSaveClientRelationship = async () => {
    if (
      !selectedClientForRelationship ||
      !selectedManagerForRelationship ||
      selectedEmployeeIds.length === 0
    ) {
      toast.error("Please select a client, manager, and at least one employee");
      return;
    }

    try {
      // Add manager to client
      const res = await updateRelationshipTree(
        selectedClientForRelationship,
        selectedManagerForRelationship,
        selectedEmployeeIds,
      );

      toast.success("Client relationship created successfully");
      setIsAddClientOpen(false);
      setSelectedClientForRelationship("");
      setSelectedManagerForRelationship("");
      setSelectedEmployeeIds([]);
      fetchData();
    } catch (error) {
      console.error("Error creating relationship:", error);
      toast.error("Failed to create client relationship");
    }
  };

  // const handleReplaceManager = (clientId: string, managerId: string) => {

  // };

  const handleReplaceEmployee = (
    clientId: string,
    managerId: string,
    employeeId: string,
  ) => {
    setSelectedClientId(clientId);
    setSelectedManagerId(managerId);
    setSelectedEmployeeToReplace(employeeId);
    setIsReplaceEmployeeOpen(true);
  };

  const handleSaveReplaceEmployee = async () => {
    if (!selectedReplacementEmployeeId || !selectedEmployeeToReplace) return;

    setIsReplacingEmployee(true);

    try {
      const res = await replaceEmployee(
        selectedClientId,
        selectedManagerId,
        selectedEmployeeToReplace,
        selectedReplacementEmployeeId,
      );

      if (res.ok) {
        toast.success("Employee replaced successfully");
        setIsReplaceEmployeeOpen(false);
        setSelectedReplacementEmployeeId("");
        setSelectedEmployeeToReplace("");
        fetchData();
      } else {
        toast.error("Failed to replace employee");
      }
    } catch (error) {
      console.error("Error replacing employee:", error);
      toast.error("An error occurred while replacing the employee");
    } finally {
      setIsReplacingEmployee(false);
    }
  };

  const handleRemoveEmployee = async (
    clientId: string,
    managerId: string,
    employeeId: string,
  ) => {
    if (
      !confirm(
        "Are you sure you want to remove this employee from the relationship?",
      )
    ) {
      return;
    }

    const res = await removeEmployee(clientId, managerId, employeeId);

    if (res.ok) {
      toast.success("Employee removed successfully");
      fetchData();
    } else {
      toast.error("Failed to remove employee");
    }
  };

  const toggleNode = (id: string, type: "client" | "manager") => {
    console.log(id, type);

    if (type === "client") {
      setExpandedClients((prev) => {
        const newExpanded = new Set(prev);
        if (newExpanded.has(id)) {
          newExpanded.delete(id);
        } else {
          newExpanded.add(id);
        }
        return newExpanded;
      });
    } else {
      setExpandedManagers((prev) => {
        const newExpanded = new Set(prev);
        if (newExpanded.has(id)) {
          newExpanded.delete(id);
        } else {
          newExpanded.add(id);
        }
        return newExpanded;
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Marketing: "#3b82f6",
      "IT Support": "#10b981",
      Finance: "#f59e0b",
      Operations: "#ef4444",
    };
    return colors[category] || "#6b7280";
  };

  async function fetchData() {
    const response = await getRelationshipTree();
    if (!response.ok) {
      toast.error("Failed to fetch relationship tree");
      return;
    }
    const data = (await response.json()) as {
      data: ClientWithRelationships[];
    };
    console.log(data.data);
    setClients(data.data);
  }

  useEffect(() => {
    fetchData();

    const fetchManagers = async () => {
      const response = await fetchAllManagers();
      if (response.ok) {
        const data = (await response.json()) as { data: Manager[] };
        setAllManagers(data.data || []);
      } else {
        setAllManagers([]);
      }
    };

    const fetchEmployees = async () => {
      const response = await fetchAllEmployees();
      if (response.ok) {
        const data = (await response.json()) as { data: Employee[] };
        setAllEmployees(data.data);
      }
    };

    const fetchClients = async () => {
      const response = await fetchAllClients();
      if (response.ok) {
        const data = (await response.json()) as { data: Client[] };
        setAllClients(data.data || []);
      }
    };

    fetchManagers();
    fetchEmployees();
    fetchClients();
  }, []);

  // Filter clients based on search term
  useEffect(() => {
    if (!clients) {
      setFilteredClients(undefined);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(
      (client) =>
        client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.client_email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Relationship Tree View</CardTitle>
              <p className="text-sm text-gray-600">
                Hierarchical tree structure for deep navigation
              </p>
            </div>
            <Button
              onClick={handleAddClient}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {filteredClients?.map((client, index) => (
              <TreeNode
                key={index}
                client={client}
                level={0}
                onToggle={toggleNode}
                expandedClients={expandedClients}
                expandedManagers={expandedManagers}
                onAddManager={handleAddManager}
                onAddEmployee={handleAddEmployee}
                onReplaceManager={handleReplaceManager}
                //  onRemoveManager={handleRemoveManager}
                onReplaceEmployee={handleReplaceEmployee}
                onRemoveEmployee={handleRemoveEmployee}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Manager Dialog */}
      <Dialog open={isAddManagerOpen} onOpenChange={setIsAddManagerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Manager</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between space-x-4">
            <Select
              value={newManager.managerId}
              onValueChange={(value) =>
                setNewManager({ ...newManager, managerId: value })
              }
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent className="flex-1">
                {allManagers
                  ?.filter(
                    (manager) =>
                      !filteredClients?.some(
                        (client) =>
                          client.client_id === selectedClientId &&
                          client.managers?.some(
                            (m) => m.manager_id === manager.id,
                          ),
                      ),
                  )
                  .map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.email})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {/*<Button onClick={handleSaveManager}>Add Manager</Button>*/}
          </div>
        </DialogContent>
      </Dialog>

      {/* Replace Manager Dialog */}
      <Dialog
        open={isReplaceManagerOpen}
        onOpenChange={setIsReplaceManagerOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Manager</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="replacement-manager-select">
                Select Replacement Manager
              </Label>
              <Select
                value={selectedReplacementManagerId}
                onValueChange={setSelectedReplacementManagerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select replacement manager" />
                </SelectTrigger>
                <SelectContent>
                  {allManagers
                    ?.filter(
                      (manager) =>
                        !filteredClients?.some(
                          (client) =>
                            client.client_id === selectedClientId &&
                            client.managers?.some(
                              (m) => m.manager_id === manager.id,
                            ),
                        ),
                    )
                    .map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name} ({manager.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReplaceManagerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveReplacement}
              disabled={!selectedReplacementManagerId || isReplacingManager}
            >
              {isReplacingManager ? "Replacing..." : "Replace Manager"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <p className="text-sm text-gray-600">
              Select an employee to add to this manager&#39;s team.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee-select">Select Employee</Label>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees
                    ?.filter(
                      (employee) =>
                        !filteredClients?.some((client) =>
                          client.managers?.some(
                            (manager) =>
                              manager.manager_id === selectedManagerId &&
                              manager.employees?.some(
                                (emp) =>
                                  (emp.id || emp.employee_id) === employee.id,
                              ),
                          ),
                        ),
                    )
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddEmployeeOpen(false);
                setSelectedEmployeeId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEmployee}
              disabled={!selectedEmployeeId || isAddingEmployee}
            >
              {isAddingEmployee ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Client Relationship Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Client Relationship</DialogTitle>
            <p className="text-sm text-gray-600">
              Select a client, assign a manager, and add employees to create a
              relationship.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {/* Client Selection */}
            <div>
              <Label htmlFor="client-select">Select Client</Label>
              <Select
                value={selectedClientForRelationship}
                onValueChange={setSelectedClientForRelationship}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {allClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Manager Selection */}
            <div>
              <Label htmlFor="manager-select">Select Manager</Label>
              <Select
                value={selectedManagerForRelationship}
                onValueChange={setSelectedManagerForRelationship}
                disabled={!selectedClientForRelationship}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a manager" />
                </SelectTrigger>
                <SelectContent>
                  {allManagers
                    ?.filter(
                      (manager) =>
                        !filteredClients?.some(
                          (client) =>
                            client.client_id ===
                              selectedClientForRelationship &&
                            client.managers?.some(
                              (m) => m.manager_id === manager.id,
                            ),
                        ),
                    )
                    .map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name} ({manager.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Employee Selection */}
            <div>
              <Label htmlFor="employee-select">Select Employees</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                {allEmployees?.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={`employee-${employee.id}`}
                      checked={selectedEmployeeIds.includes(employee.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmployeeIds([
                            ...selectedEmployeeIds,
                            employee.id,
                          ]);
                        } else {
                          setSelectedEmployeeIds(
                            selectedEmployeeIds.filter(
                              (id) => id !== employee.id,
                            ),
                          );
                        }
                      }}
                      disabled={!selectedManagerForRelationship}
                    />
                    <label
                      htmlFor={`employee-${employee.id}`}
                      className="text-sm"
                    >
                      {employee.name} ({employee.email})
                    </label>
                  </div>
                ))}
              </div>
              {selectedEmployeeIds.length > 0 && (
                <p className="text-sm text-gray-600">
                  {selectedEmployeeIds.length} employee
                  {selectedEmployeeIds.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddClientOpen(false);
                setSelectedClientForRelationship("");
                setSelectedManagerForRelationship("");
                setSelectedEmployeeIds([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveClientRelationship}
              disabled={
                !selectedClientForRelationship ||
                !selectedManagerForRelationship ||
                selectedEmployeeIds.length === 0
              }
            >
              Create Relationship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replace Employee Dialog */}
      <Dialog
        open={isReplaceEmployeeOpen}
        onOpenChange={setIsReplaceEmployeeOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="replacement-employee-select">
                Select Replacement Employee
              </Label>
              <Select
                value={selectedReplacementEmployeeId}
                onValueChange={setSelectedReplacementEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select replacement employee" />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees
                    ?.filter((emp) => emp.id !== selectedEmployeeToReplace)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReplaceEmployeeOpen(false);
                setSelectedReplacementEmployeeId("");
                setSelectedEmployeeToReplace("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveReplaceEmployee}
              disabled={!selectedReplacementEmployeeId || isReplacingEmployee}
            >
              {isReplacingEmployee ? "Replacing..." : "Replace Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
