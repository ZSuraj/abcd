"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { RecurringTask, RecurrenceType, Client } from "@/types";
import { fetchAllClients } from "@/lib/api";
import { log } from "node:console";

interface RecurringTaskFormProps {
  onSubmit: (task: Omit<RecurringTask, "created_at" | "client_id">) => void;
}

export default function RecurringTaskForm({
  onSubmit,
}: RecurringTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recurrenceType, setRecurrenceType] =
    useState<RecurrenceType>("monthly");
  const [reminderDaysBefore, setReminderDaysBefore] = useState<number>(7);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  // Recurrence-specific fields
  const [monthlyDay, setMonthlyDay] = useState<number>(1);
  const [yearlyMonth, setYearlyMonth] = useState<number>(1);
  const [yearlyDay, setYearlyDay] = useState<number>(1);
  const [quarterlyMonth, setQuarterlyMonth] = useState<number>(1);
  const [quarterlyDay, setQuarterlyDay] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetchAllClients();
        if (response.ok) {
          const data = (await response.json()) as { data: Client[] };
          setClients(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!title.trim()) {
        newErrors.title = "Title is required";
      }
    } else if (step === 2) {
      if (reminderDaysBefore < 1 || reminderDaysBefore > 30) {
        newErrors.reminderDaysBefore = "Reminder days must be between 1 and 30";
      }
    } else if (step === 3) {
      if (selectedClients.length === 0) {
        newErrors.clients = "At least one client must be selected";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (reminderDaysBefore < 1 || reminderDaysBefore > 30) {
      newErrors.reminderDaysBefore = "Reminder days must be between 1 and 30";
    }

    if (selectedClients.length === 0) {
      newErrors.clients = "At least one client must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 3) {
      handleNext();
      return;
    }

    if (!validateForm()) {
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      recurrence_type: recurrenceType,
      remind_before_days: reminderDaysBefore,
      priority,
      clientIds: selectedClients,
      // Add recurrence-specific fields based on type
      ...(recurrenceType === "monthly" && { day_of_month: monthlyDay }),
      ...(recurrenceType === "yearly" && {
        day_of_month: yearlyDay,
        month_of_year: yearlyMonth,
      }),
      ...(recurrenceType === "quarterly" && {
        day_of_month: quarterlyDay,
        quarter_month_offset: quarterlyMonth,
      }),
    };

    // console.log(taskData);

    //@ts-ignore
    onSubmit(taskData);

    // Reset form
    setTitle("");
    setDescription("");
    setRecurrenceType("monthly");
    setReminderDaysBefore(7);
    setPriority("medium");
    setSelectedClients([]);
    setMonthlyDay(1);
    setYearlyMonth(1);
    setYearlyDay(1);
    setQuarterlyMonth(1);
    setQuarterlyDay(1);
    setCurrentStep(1);
    setErrors({});
  };

  const steps = [
    {
      number: 1,
      title: "Task Details",
      description: "Title, description & priority",
    },
    { number: 2, title: "Schedule", description: "Type, dates & recurrence" },
    { number: 3, title: "Clients", description: "Assign to clients" },
  ];

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      {/*<div className="space-y-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step.number
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {step.number}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className={`text-sm font-medium ${
                  currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {step.description}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.number ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>*/}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Task Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description (optional)"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setPriority(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recurrenceType">Recurrence Type *</Label>
              <Select
                value={recurrenceType}
                onValueChange={(value: RecurrenceType) =>
                  setRecurrenceType(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select recurrence type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recurrence-specific fields */}
            {recurrenceType === "monthly" && (
              <div className="space-y-2">
                <Label htmlFor="monthlyDay">Day of Month *</Label>
                <Select
                  value={monthlyDay.toString()}
                  onValueChange={(value) => setMonthlyDay(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select day of month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {recurrenceType === "yearly" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearlyMonth">Month *</Label>
                  <Select
                    value={yearlyMonth.toString()}
                    onValueChange={(value) => setYearlyMonth(parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {new Date(2000, month - 1, 1).toLocaleString(
                              "default",
                              { month: "long" },
                            )}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearlyDay">Day of Month *</Label>
                  <Select
                    value={yearlyDay.toString()}
                    onValueChange={(value) => setYearlyDay(parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {recurrenceType === "quarterly" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quarterlyMonth">Month of Quarter *</Label>
                  <Select
                    value={quarterlyMonth.toString()}
                    onValueChange={(value) =>
                      setQuarterlyMonth(parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select month of quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st month</SelectItem>
                      <SelectItem value="2">2nd month</SelectItem>
                      <SelectItem value="3">3rd month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quarterlyDay">Day of Month *</Label>
                  <Select
                    value={quarterlyDay.toString()}
                    onValueChange={(value) => setQuarterlyDay(parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reminderDaysBefore">
                Reminder (Days Before) *
              </Label>
              <Input
                id="reminderDaysBefore"
                type="number"
                min="1"
                max="30"
                value={reminderDaysBefore}
                onChange={(e) =>
                  setReminderDaysBefore(parseInt(e.target.value) || 1)
                }
                className={errors.reminderDaysBefore ? "border-red-500" : ""}
                placeholder="Enter days before (1-30)"
              />
              {errors.reminderDaysBefore && (
                <p className="text-sm text-red-500">
                  {errors.reminderDaysBefore}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Number of days before the recurrence date to send reminder (1-30
                days)
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Clients */}
        {currentStep === 3 && (
          <div className="space-y-2">
            <Label>Assign to Clients *</Label>
            {loadingClients ? (
              <p className="text-sm text-muted-foreground">
                Loading clients...
              </p>
            ) : clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No clients available
              </p>
            ) : (
              <div className="border rounded-md p-3 space-y-3">
                {/* Select All Checkbox */}
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <Checkbox
                    id="select-all-clients"
                    checked={
                      selectedClients.length === clients.length &&
                      clients.length > 0
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedClients(clients.map((client) => client.id));
                      } else {
                        setSelectedClients([]);
                      }
                    }}
                  />
                  <Label
                    htmlFor="select-all-clients"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Select All Clients ({clients.length})
                    {selectedClients.length > 0 &&
                      selectedClients.length < clients.length && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({selectedClients.length} selected)
                        </span>
                      )}
                  </Label>
                </div>

                {/* Individual Client Checkboxes */}
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`client-${client.id}`}
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedClients((prev) => [...prev, client.id]);
                          } else {
                            setSelectedClients((prev) =>
                              prev.filter((id) => id !== client.id),
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`client-${client.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {client.name} ({client.email})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errors.clients && (
              <p className="text-sm text-red-500">{errors.clients}</p>
            )}
            {selectedClients.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedClients.length} of {clients.length} client
                {clients.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <Button
            type="submit"
            disabled={currentStep === 3 && selectedClients.length === 0}
          >
            {currentStep === 3 ? "Create Recurring Task" : "Next"}
          </Button>
        </div>
      </form>
    </div>
  );
}
