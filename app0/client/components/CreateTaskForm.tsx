"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createTask } from "@/lib/api";
import { AssignablePerson, Client, User } from "@/types";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateTaskFormProps {
  assignablePeople: AssignablePerson[];
  clients: Client[];
  onTaskCreated?: () => void;
  user?: User;
}

export default function CreateTaskForm({
  assignablePeople,
  clients,
  onTaskCreated,
  user,
}: CreateTaskFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assignToMe, setAssignToMe] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: null as Date | null,
    assignees: [] as string[],
    clientId: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (assignToMe && user) {
      setFormData((prev) => ({
        ...prev,
        assignees: [user.data.user.id],
      }));
    } else if (!assignToMe) {
      setFormData((prev) => ({
        ...prev,
        assignees: [],
      }));
    }
  }, [assignToMe, user]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.clientId) {
      newErrors.clientId = "Client is required";
    }

    if (formData.assignees.length === 0 && !assignToMe) {
      newErrors.assignees = "At least one assignee is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const finalAssignees =
        assignToMe && user ? [user.data.user.id] : formData.assignees;
      const response = await createTask(
        formData.title.trim(),
        formData.description.trim() || "",
        formData.dueDate ? formData.dueDate.toISOString().split("T")[0] : null,
        finalAssignees,
        formData.clientId,
        formData.priority
      );

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      toast.success("Task created successfully");
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        dueDate: null,
        assignees: [],
        clientId: "",
        priority: "medium",
      });
      setAssignToMe(false);
      setErrors({});

      // Call the callback to refresh the task list
      onTaskCreated?.();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssigneesChange = (assignees: string[]) => {
    setFormData((prev) => ({
      ...prev,
      assignees,
    }));
    // Clear error when user selects assignees
    if (errors.assignees) {
      setErrors((prev) => ({
        ...prev,
        assignees: "",
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Create a new task and assign it to employees and clients.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter task title"
                className={errors.title ? "border-red-500" : ""}
                required
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter task description (optional)"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Client *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, clientId: value }));
                  if (errors.clientId) {
                    setErrors((prev) => ({ ...prev, clientId: "" }));
                  }
                }}
              >
                <SelectTrigger
                  className={errors.clientId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-sm text-red-500">{errors.clientId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !formData.dueDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(formData.dueDate, "PPP")
                    ) : (
                      <span>Pick a date (optional)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate || undefined}
                    onSelect={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: date || null,
                      }))
                    }
                    disabled={{ before: new Date() }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assign to People *</Label>
              <MultiSelectCombobox
                options={assignablePeople}
                value={formData.assignees}
                onChange={handleAssigneesChange}
                placeholder={
                  assignToMe
                    ? "Assigned to yourself"
                    : "Select people to assign..."
                }
                error={errors.assignees}
                disabled={assignToMe}
              />
            </div>
            {user?.data.user.role === "employee" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="assignToMe"
                  checked={assignToMe}
                  onCheckedChange={(checked) =>
                    setAssignToMe(checked as boolean)
                  }
                />
                <Label htmlFor="assignToMe">Assign to me</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
