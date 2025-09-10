"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createEmployee, createManager } from "@/lib/api";

interface AddEmployeeFormData {
  name: string;
  email: string;
  password: string;
}

export default function AddEmployeeButton() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AddEmployeeFormData>({
    name: "",
    email: "",
    password: "",
  });

  const handleInputChange = (
    field: keyof AddEmployeeFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
    //   const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

      const response = await createEmployee(formData);

      if (!response.ok) {
        throw new Error("Failed to create employee");
      }

      toast.success("Employee created successfully");
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
      });

      // Optionally refresh the employee list here
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error("Failed to create employee");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Employee</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a new employee account with their details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div
            className="grid gap-4
py-4"
          >
            <div
              className="grid
grid-cols-4 items-center gap-4"
            >
              <Label htmlFor="name" className="text-right">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div
              className="grid
grid-cols-4 items-center gap-4"
            >
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div
              className="grid
grid-cols-4 items-center gap-4"
            >
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
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
              {isLoading ? "Creating..." : "Create Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
