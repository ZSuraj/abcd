"use client";

import { RecurringTask } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit } from "lucide-react";

interface RecurringTaskListProps {
  recurringTasks: RecurringTask[];
  onEdit?: (task: RecurringTask) => void;
  onDelete?: (taskId: string) => void;
}

export default function RecurringTaskList({
  recurringTasks,
  onEdit,
  onDelete,
}: RecurringTaskListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
        return "secondary";
      case "pending":
        return "outline";
      case "in-review":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (recurringTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recurring Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No recurring tasks found. Create your first task above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Tasks ({recurringTasks.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Recurrence</TableHead>
              <TableHead>Reminder</TableHead>
              <TableHead>Priority</TableHead>
              {/*<TableHead>Clients</TableHead>*/}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurringTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {task.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="outline" className="capitalize">
                      {task.recurrence_type}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {task.recurrence_type === "monthly" &&
                        task.day_of_month && <>Day {task.day_of_month}</>}
                      {task.recurrence_type === "yearly" &&
                        task.month_of_year &&
                        task.day_of_month && (
                          <>
                            {new Date(
                              2000,
                              task.month_of_year - 1,
                              1,
                            ).toLocaleString("default", {
                              month: "short",
                            })}{" "}
                            {task.day_of_month}
                          </>
                        )}
                      {task.recurrence_type === "quarterly" &&
                        task.quarter_month_offset &&
                        task.day_of_month && (
                          <>
                            Q{task.quarter_month_offset} - Day{" "}
                            {task.day_of_month}
                          </>
                        )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{task.remind_before_days} days before</TableCell>
                <TableCell>
                  <Badge
                    variant={getPriorityColor(task.priority)}
                    className="capitalize"
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                {/*<TableCell>
                  <div className="text-sm">
                    {task.assignedClients && task.assignedClients.length > 0 ? (
                      <span className="text-muted-foreground">
                        {task.assignedClients.length} client
                        {task.assignedClients.length !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </div>
                </TableCell>*/}
                <TableCell>
                  <div className="flex gap-2">
                    {/*{onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(task)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}*/}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(task.id as string)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
