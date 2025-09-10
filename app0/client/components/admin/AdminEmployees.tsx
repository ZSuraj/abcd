"use client";

import { useEffect, useState } from "react";
import AddEmployeeButton from "./AddEmployeeButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fetchAllEmployees } from "@/lib/api";
import { Employee, Task } from "@/types";
import { Users, User, Search, CheckSquare } from "lucide-react";

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesWithTasks, setEmployeesWithTasks] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function getData() {
      try {
        // Fetch employees
        const employeesRes = await fetchAllEmployees();
        let employeesData: Employee[] = [];
        if (employeesRes.ok) {
          const data = await employeesRes.json();
          employeesData = data.data || [];
          setEmployees(employeesData);
        }

        // Fetch tasks
        // const tasksRes = await fetchTasks();
        // let tasksData: Task[] = [];
        // if (tasksRes.ok) {
        //   const data = await tasksRes.json();
        //   tasksData = data.data || [];
        //   setTasks(tasksData);
        // }

        // // Combine employees with task counts
        // const employeesWithTaskCounts = employeesData.map(employee => ({
        //   ...employee,
        //   taskCount: tasksData.filter(task => task.employee_name === employee.name).length
        // }));

        setEmployeesWithTasks(employeesData);
        setFilteredEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  useEffect(() => {
    const filtered = employeesWithTasks.filter((employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employeesWithTasks]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Employees</h2>
          <AddEmployeeButton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employees</h2>
        <AddEmployeeButton />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search employees by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? "No employees found" : "No employees"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by creating a new employee."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {employee.name}
                </CardTitle>
                <CardDescription>{employee.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckSquare className="h-4 w-4" />
                      <span>Tasks</span>
                    </div>
                    <Badge variant="secondary">
                      {(employee as any).taskCount || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Clients</span>
                    </div>
                    <Badge variant="outline">
                      {employee.assignedClientIds?.length || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
