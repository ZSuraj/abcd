"use client";

import { useEffect, useState } from "react";
import RecurringTaskForm from "./RecurringTaskForm";
import RecurringTaskList from "./RecurringTaskList";
import { RecurringTask } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import {
  createRecurringTask,
  deleteRecurringTask,
  fetchRecurringTasks,
} from "@/lib/api";
import { toast } from "sonner";
import { get } from "node:https";

export default function AdminRecurringTasks() {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateTask = async (
    taskData: Omit<RecurringTask, "id" | "createdAt" | "updatedAt" | "status">,
  ) => {
    const res = await createRecurringTask(taskData as RecurringTask);

    setIsDialogOpen(false);
    toast.success("Created Successfully");
  };

  const handleEditTask = (task: RecurringTask) => {
    // For now, just log the task. In a real app, you might open an edit modal
    console.log("Edit task:", task);
  };

  const handleDeleteTask = async (taskId: string) => {
    // setRecurringTasks((prev) => prev.filter((task) => task.id !== taskId));
    const res = await deleteRecurringTask(taskId);
    if (res.ok) {
      toast.success("Task deleted successfully");
      getTasks();
    }
  };

  async function getTasks() {
    const res = await fetchRecurringTasks();
    if (res.ok) {
      const data = (await res.json()) as { data: RecurringTask[] };
      console.log(data);
      setRecurringTasks(data.data);
    }
  }

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recurring Tasks</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Create Recurring Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Recurring Task</DialogTitle>
            </DialogHeader>
            {/*@ts-ignore*/}
            <RecurringTaskForm onSubmit={handleCreateTask} />
          </DialogContent>
        </Dialog>
      </div>

      <RecurringTaskList
        recurringTasks={recurringTasks}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
