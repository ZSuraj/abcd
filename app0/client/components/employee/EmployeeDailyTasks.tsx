import { useEffect, useState } from "react";
import {
  fetchDailyTasks,
  updateDailyTaskStatus,
  updateTaskStatus,
} from "@/lib/api";
import { Client, TaskStatus } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export default function EmployeeDailyTasks() {
  const [dailyTasks, setDailyTasks] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const getTasks = async () => {
      try {
        const res = await fetchDailyTasks();
        if (res.ok) {
          const data = (await res.json()) as { data: Client[] };
          setDailyTasks(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching daily tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    getTasks();
  }, []);

  console.log(dailyTasks);

  const handleTaskToggle = async (
    taskId: string,
    currentStatus: TaskStatus,
  ) => {
    const newStatus: TaskStatus = currentStatus;

    // Add to updating set for loading indicator
    setUpdatingTasks((prev) => new Set(prev).add(taskId));

    try {
      const response = await updateDailyTaskStatus(taskId, newStatus);
      if (response && response.ok) {
        // Update local state optimistically
        setDailyTasks((prevTasks) =>
          prevTasks.map((client) => ({
            ...client,
            daily_tasks: client.daily_tasks?.map((task) =>
              task.id === taskId ? { ...task, status: newStatus } : task,
            ),
          })),
        );
      } else {
        console.error("Failed to update task status");
        // Could add toast notification here
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      // Could add toast notification here
    } finally {
      // Remove from updating set
      setUpdatingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  if (loading) {
    return <div>Loading daily tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Daily Tasks by Client</h2>
      {dailyTasks.length === 0 ? (
        <div>No daily tasks found.</div>
      ) : (
        dailyTasks.map((client) => (
          <div key={client.id} className="space-y-4">
            <h3 className="text-xl font-semibold">{client.name}</h3>
            <div className="grid gap-4">
              {(client?.daily_tasks ?? []).map((task) => (
                <Card
                  key={task.id}
                  className={task.status === "completed" ? "opacity-75" : ""}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={task.status === "completed"}
                          onCheckedChange={() =>
                            task.status === "pending" &&
                            handleTaskToggle(task.id, task.status)
                          }
                          disabled={
                            updatingTasks.has(task.id) ||
                            task.status === "completed"
                          }
                          aria-label={
                            task.status === "completed"
                              ? `Task "${task.title}" is completed`
                              : `Mark task "${task.title}" as complete`
                          }
                        />
                        <span
                          className={
                            task.status === "completed"
                              ? "line-through text-gray-500"
                              : ""
                          }
                        >
                          {task.title}
                        </span>
                        {updatingTasks.has(task.id) && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-3">
                      <div className="w-4 h-4"></div>
                      {task.description && (
                        <p
                          className={`text-sm ${
                            task.status === "completed"
                              ? "text-gray-500 line-through"
                              : "text-gray-600"
                          }`}
                        >
                          {task.description}
                        </p>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
