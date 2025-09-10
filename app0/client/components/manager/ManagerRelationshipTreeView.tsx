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
import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  ChevronDown,
  Users,
  Plus,
  Minus,
  Edit,
} from "lucide-react";
import { Employee } from "@/types";
import {
  fetchEmployees,
  addEmployee,
  replaceEmployee,
  removeEmployee,
  getManagerRelationshipTree,
} from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

// Define the actual structure based on the API response
interface ManagerClientData {
  id: string;
  name: string;
  employees: Employee[];
}

interface TreeNodeProps {
  client: ManagerClientData;
  level: number;
  onToggle: (id: string, type: "client") => void;
  expandedClients: Set<string>;
  onAddEmployee: (clientId: string) => void;
  onReplaceEmployee: (clientId: string, employeeId: string) => void;
  onRemoveEmployee: (clientId: string, employeeId: string) => void;
}

function TreeNode({
  client,
  level,
  onToggle,
  expandedClients,
  onAddEmployee,
  onReplaceEmployee,
  onRemoveEmployee,
}: TreeNodeProps) {
  const indent = level * 20;
  const clientId = client.id; // Use id as identifier

  return (
    <div>
      {/* Client Node */}
      <div
        className="flex items-center py-2 hover:bg-gray-50 cursor-pointer"
        style={{ paddingLeft: `${indent}px` }}
        onClick={() => onToggle(clientId, "client")}
      >
        {expandedClients.has(clientId) ? (
          <ChevronDown className="w-4 h-4 mr-2" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2" />
        )}
        <Users className="w-4 h-4 mr-2 text-blue-600" />
        <div className="flex-1">
          <span className="font-medium">{client.name}</span>
        </div>
        <Badge variant="secondary" className="mr-2">
          {client.employees.length} Employee
          {client.employees.length !== 1 ? "s" : ""}
        </Badge>
        {!expandedClients.has(client.id) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();app
              onAddEmployee(client.id);
            }}
          >
            <Plus className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Employee Nodes */}
      {client.employees.length > 0 &&
        expandedClients.has(clientId) &&
        client.employees.map((employee) => (
          <div
            key={employee.id}
            className="flex items-center py-1 hover:bg-gray-50"
            style={{ paddingLeft: `${indent + 40}px` }}
          >
            <div className="w-4 mr-2" /> {/* Spacer */}
            <Users className="w-3 h-3 mr-2 text-gray-600" />
            <div className="flex-1">
              <span className="text-sm">{employee.name}</span>
              <span className="text-gray-500 text-xs ml-2">
                ({employee.email})
              </span>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReplaceEmployee(client.id, employee.id)}
              >
                <Edit className="w-2 h-2" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={() => onRemoveEmployee(client.id, employee.id)}
              >
                <Minus className="w-2 h-2" />
              </Button>
            </div>
          </div>
        ))}

      {/* Add Employee Button */}
      {expandedClients.has(clientId) && (
        <div
          className="flex items-center py-1"
          style={{ paddingLeft: `${indent + 40}px` }}
        >
          <div className="w-4 mr-2" />
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => onAddEmployee(client.id)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Employee
          </Button>
        </div>
      )}
    </div>
  );
}

interface ManagerRelationshipTreeViewProps {
  searchTerm: string;
}

export default function ManagerRelationshipTreeView({
  searchTerm,
}: ManagerRelationshipTreeViewProps) {
  const [clients, setClients] = useState<ManagerClientData[]>();
  const [filteredClients, setFilteredClients] = useState<ManagerClientData[]>();
  const [expandedClients, setExpandedClients] = useState<Set<string>>(
    new Set()
  );

  // Dialog states
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isReplaceEmployeeOpen, setIsReplaceEmployeeOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedEmployeeToReplace, setSelectedEmployeeToReplace] =
    useState<string>("");
  const [selectedReplacementEmployeeId, setSelectedReplacementEmployeeId] =
    useState<string>("");

  // Form states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [allEmployees, setAllEmployees] = useState<Employee[]>();
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isReplacingEmployee, setIsReplacingEmployee] = useState(false);

  // Handler functions
  const handleAddEmployee = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsAddEmployeeOpen(true);
  };

  const handleSaveEmployee = async () => {
    if (!selectedEmployeeId || !selectedClientId) {
      toast.error("Missing required information. Please try again.");
      return;
    }

    setIsAddingEmployee(true);

    try {
      // Get current manager ID from auth context
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast.error("User not authenticated");
        return;
      }

      const managerId = currentUser.data.user.id;

      // Call the actual API function
      const response = await addEmployee(
        selectedClientId,
        managerId,
        selectedEmployeeId
      );

      if (response.ok) {
        toast.success("Employee added successfully");
        setIsAddEmployeeOpen(false);
        setSelectedEmployeeId("");
        // Refresh the data to show the updated relationships
        fetchData();
      } else {
        const errorData = (await response.json().catch(() => ({}))) as any;
        toast.error(errorData.message || "Failed to add employee");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("An error occurred while adding the employee");
    } finally {
      setIsAddingEmployee(false);
    }
  };

  const handleReplaceEmployee = (clientId: string, employeeId: string) => {
    setSelectedClientId(clientId);
    setSelectedEmployeeToReplace(employeeId);
    setIsReplaceEmployeeOpen(true);
  };

  const handleSaveReplaceEmployee = async () => {
    if (!selectedReplacementEmployeeId || !selectedEmployeeToReplace) return;

    setIsReplacingEmployee(true);

    try {
      // Get current manager ID from auth context
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast.error("User not authenticated");
        return;
      }

      const managerId = currentUser.data.user.id;

      // Call the actual API function
      const response = await replaceEmployee(
        selectedClientId,
        managerId,
        selectedEmployeeToReplace,
        selectedReplacementEmployeeId
      );

      if (response.ok) {
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

  const handleRemoveEmployee = async (clientId: string, employeeId: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this employee from the relationship?"
      )
    ) {
      return;
    }

    try {
      // Get current manager ID from auth context
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast.error("User not authenticated");
        return;
      }

      const managerId = currentUser.data.user.id;

      // Call the actual API function
      const response = await removeEmployee(clientId, managerId, employeeId);

      if (response.ok) {
        toast.success("Employee removed successfully");
        fetchData();
      } else {
        toast.error("Failed to remove employee");
      }
    } catch (error) {
      console.error("Error removing employee:", error);
      toast.error("Failed to remove employee");
    }
  };

  const toggleNode = (id: string, type: "client") => {
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
    }
  };

  async function fetchData() {
    try {
      const response = await getManagerRelationshipTree();
      if (response.ok) {
        const data = (await response.json()) as any;
        // Transform the API response to match our ManagerClientData interface
        const transformedData: ManagerClientData[] = data.data || [];
        setClients(transformedData);
      } else {
        console.error("Failed to fetch relationship tree");
        toast.error("Failed to load client relationships");
      }
    } catch (error) {
      console.error("Error fetching relationship tree:", error);
      toast.error("An error occurred while loading relationships");
    }
  }

  useEffect(() => {
    fetchData();

    const fetchEmployeesData = async () => {
      const response = await fetchEmployees();
      if (response.ok) {
        const data = (await response.json()) as any;
        setAllEmployees(data.data);
      }
    };

    fetchEmployeesData();
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

    const filtered = clients.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Client-Employee Relationships</CardTitle>
            <p className="text-sm text-gray-600">
              Hierarchical tree structure showing clients and their employees
            </p>
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
                onAddEmployee={handleAddEmployee}
                onReplaceEmployee={handleReplaceEmployee}
                onRemoveEmployee={handleRemoveEmployee}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <p className="text-sm text-gray-600">
              Select an employee to add to this client's team.
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
                        !filteredClients?.some(
                          (client) =>
                            client.id === selectedClientId &&
                            client.employees?.some(
                              (emp) => emp.id === employee.id
                            )
                        )
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
