"use client";

import { useEffect, useState } from "react";
import AddClientButton from "./AddClientButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchAllClients,
  createCategory,
  getAllCategories,
  getClientCategories,
  saveCategories,
  getClientTasks,
  createClientTask,
  deleteClientTask,
} from "@/lib/api";
import { Client, Category, Task } from "@/types";
import {
  FileText,
  CheckSquare,
  User,
  Search,
  Plus,
  Loader2,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientCategories, setClientCategories] = useState<Category[]>([]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [clientTasks, setClientTasks] = useState<Task[]>([]);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  useEffect(() => {
    async function getClients() {
      try {
        const res = await fetchAllClients();
        if (res.ok) {
          const data = await res.json();
          setClients(data.data || []);
          setFilteredClients(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    }
    getClients();
  }, []);

  useEffect(() => {
    async function getCategories() {
      try {
        const res = await getAllCategories();
        if (res.ok) {
          const data = await res.json();
          setAllCategories(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    getCategories();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) return;
    setIsCreatingCategory(true);
    try {
      const res = await createCategory(categoryName);
      if (res.ok) {
        toast.success("Category created successfully!");
        setCategoryName("");
        setIsDialogOpen(false);
        // Refresh categories
        const categoriesRes = await getAllCategories();
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setAllCategories(data.data || []);
        }
      } else {
        toast.error("Failed to create category.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while creating the category.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleOpenCategoryDialog = async (client: Client) => {
    setSelectedClient(client);
    setIsLoadingCategories(true);
    setIsCategoryDialogOpen(true);

    try {
      const res = await getClientCategories(client.id);
      if (res.ok) {
        const data = await res.json();
        setClientCategories(data.data || []);
      } else {
        setClientCategories([]);
      }
    } catch (error) {
      console.error("Error fetching client categories:", error);
      setClientCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleSaveCategories = async (categoryIds: string[]) => {
    if (!selectedClient) return;

    try {
      const res = await saveCategories(selectedClient.id, categoryIds);
      if (res.ok) {
        toast.success("Categories updated successfully!");
        setIsCategoryDialogOpen(false);
        // Refresh clients to show updated categories
        const clientsRes = await fetchAllClients();
        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.data || []);
          setFilteredClients(data.data || []);
        }
      } else {
        toast.error("Failed to update categories.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating categories.");
    }
  };

  const handleOpenTaskDialog = async (client: Client) => {
    setSelectedClient(client);
    setIsLoadingTasks(true);
    setIsTaskDialogOpen(true);

    try {
      const res = await getClientTasks(client.id);
      if (res.ok) {
        const data = await res.json();
        setClientTasks(data.data || []);
      } else {
        setClientTasks([]);
      }
    } catch (error) {
      console.error("Error fetching client tasks:", error);
      setClientTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleCreateTask = async () => {
    if (!selectedClient || !newTaskTitle.trim()) return;
    setIsCreatingTask(true);
    try {
      const res = await createClientTask(selectedClient.id, newTaskTitle);
      if (res.ok) {
        toast.success("Task created successfully!");
        setNewTaskTitle("");
        // Refresh tasks
        const tasksRes = await getClientTasks(selectedClient.id);
        if (tasksRes.ok) {
          const data = await tasksRes.json();
          setClientTasks(data.data || []);
        }
        // Refresh clients to update task count
        const clientsRes = await fetchAllClients();
        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.data || []);
          setFilteredClients(data.data || []);
        }
      } else {
        toast.error("Failed to create task.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while creating the task.");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await deleteClientTask(taskId);
      if (res.ok) {
        toast.success("Task deleted successfully!");
        // Remove from local state
        setClientTasks(clientTasks.filter((task) => task.id !== taskId));
        // Refresh clients to update task count
        const clientsRes = await fetchAllClients();
        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.data || []);
          setFilteredClients(data.data || []);
        }
      } else {
        toast.error("Failed to delete task.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the task.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Clients</h2>
          <AddClientButton />
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
        <h2 className="text-2xl font-bold">Clients</h2>
        <div className="flex gap-2">
          <AddClientButton />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Enter the name for the new category.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateCategory}
                  disabled={isCreatingCategory}
                >
                  {isCreatingCategory ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Category Management Dialog */}
          <Dialog
            open={isCategoryDialogOpen}
            onOpenChange={setIsCategoryDialogOpen}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Categories</DialogTitle>
                <DialogDescription>
                  {selectedClient &&
                    `Assign categories to ${selectedClient.name}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {isLoadingCategories ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {clientCategories.map((category) => (
                        <Badge
                          key={category.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {category.name}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
                            onClick={() => {
                              const newCategories = clientCategories.filter(
                                (c) => c.id !== category.id,
                              );
                              setClientCategories(newCategories);
                            }}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={(value) => {
                        const category = allCategories.find(
                          (c) => c.id === value,
                        );
                        if (
                          category &&
                          !clientCategories.find((c) => c.id === category.id)
                        ) {
                          setClientCategories([...clientCategories, category]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add a category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories
                          .filter(
                            (category) =>
                              !clientCategories.find(
                                (c) => c.id === category.id,
                              ),
                          )
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCategoryDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleSaveCategories(clientCategories.map((c) => c.id))
                  }
                  disabled={isLoadingCategories}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Task Management Dialog */}
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage Tasks</DialogTitle>
                <DialogDescription>
                  {selectedClient &&
                    `Manage daily tasks for ${selectedClient.name}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Quick Add Task */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCreateTask}
                    disabled={isCreatingTask || !newTaskTitle.trim()}
                    size="sm"
                  >
                    {isCreatingTask ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Existing Tasks */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">
                      Tasks ({clientTasks.length})
                    </h4>
                    {clientTasks.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setClientTasks([])}
                        className="text-xs text-gray-500"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  {isLoadingTasks ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : clientTasks.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No tasks found for this client.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {clientTasks.map((task) => (
                        <Card key={task.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium">{task.title}</h5>
                              {task.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {task.status}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    task.created_at,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              ×
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsTaskDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search clients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {filteredClients.length === 0 ? (
        <div className="text-center py-8">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? "No clients found" : "No clients"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by creating a new client."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {client.name}
                </CardTitle>
                <CardDescription>{client.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>Documents</span>
                    </div>
                    <Badge variant="secondary">{client.no_of_docs}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckSquare className="h-4 w-4" />
                      <span>Tasks</span>
                    </div>
                    <Badge variant="secondary">{client.no_of_tasks}</Badge>
                  </div>
                  {client.employee && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">Assigned Employee</p>
                      <p className="text-sm font-medium">
                        ID: {client.employee.id}
                      </p>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Categories</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenCategoryDialog(client)}
                        className="h-6 px-2 text-xs"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Tasks</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenTaskDialog(client)}
                        className="h-6 px-2 text-xs"
                      >
                        <CheckSquare className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                    {/* <div className="flex flex-wrap gap-1 mt-1">
                       {client.categories && client.categories.length > 0 ? (
                         client.categories.map((category) => (
                           <Badge key={category.id} variant="outline" className="text-xs">
                             {category.name}
                           </Badge>
                         ))
                       ) : (
                         <p className="text-xs text-gray-400">No categories assigned</p>
                       )}
                     </div> */}
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
