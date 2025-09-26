import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  fetchTasks,
  updateTaskStatus,
  fetchAllEmployees,
  fetchClientsAndManagers,
  createTask,
  fetchClients,
} from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { handleDownloadDocument, handleViewDocument, cn } from "@/lib/utils";
import { Client, Document, Task, User } from "@/types";
import {
  extractOriginalFileName,
  formatFileSize,
  getStatusColor,
  timeAgo,
} from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, formatDistanceToNow, isAfter } from "date-fns";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Download,
  Eye,
  File,
  FileText,
  Flag,
  FolderOpen,
  Image,
  MessageCircle,
  MessageSquare,
  Paperclip,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import CreateTaskForm from "../CreateTaskForm";

interface ClientOrManager {
  id: string;
  name: string;
}

export default function EmployeeTasksList() {
  const [user, setUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<Task["status"] | "all">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [clientFilter, setClientFilter] = useState<string | "all">("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedTaskForQuery, setSelectedTaskForQuery] = useState<Task | null>(
    null
  );
  const [querySubject, setQuerySubject] = useState("");
  const [queryMessage, setQueryMessage] = useState("");
  const [isQueryDialogOpen, setIsQueryDialogOpen] = useState(false);
  const [isRemarksDialogOpen, setIsRemarksDialogOpen] = useState(false);
  const [selectedTaskForRemarks, setSelectedTaskForRemarks] =
    useState<Task | null>(null);
  const [remarks, setRemarks] = useState("");
  const [newStatus, setNewStatus] = useState<Task["status"] | null>(null);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [clientsAndManagers, setClientsAndManagers] = useState<
    ClientOrManager[]
  >([]);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);

  const [assignToMyself, setAssignToMyself] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    getTasks();
    getClientsAndManagers();
    getClients();
  }, []);

  const getClientsAndManagers = async () => {
    const res = await fetchClientsAndManagers();
    if (res.ok) {
      const data = (await res.json()) as {
        data: ClientOrManager[];
      };
      setClientsAndManagers(data.data);
    }
  };

  const getClients = async () => {
    const res = await fetchClients();
    if (res.ok) {
      const data = (await res.json()) as {
        data: Client[];
      };
      setClients(data.data);
    }
  };

  const getTasks = async () => {
    const res = (await fetchTasks()) as Response;
    if (!res.ok) {
      console.log("Error fetching tasks");
      return;
    }
    const data = (await res.json()) as { data: Task[] };
    setTasks(data.data);
    setFilteredTasks(data.data);
  };

  useEffect(() => {
    const sortedTasks = tasks
      .filter((task) => {
        // console.log("status", task.status);

        return statusFilter === "all" || task.status === statusFilter;
      })
      .filter((task) => {
        // console.log("category", task.category);
        return (
          categoryFilter === "all" ||
          String(task.category).toLowerCase() === categoryFilter
        );
      })
      .filter((task) => {
        return clientFilter === "all" || task.client.id === clientFilter;
      })
      .sort((a, b) => {
        const diff =
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return sortOrder === "newest" ? diff : -diff;
      });

    //   .sort((a, b) => {
    //     if (a.status === "completed" && b.status !== "completed") return 1;
    //     if (a.status !== "completed" && b.status === "completed") return -1;
    //     return 0;
    //   });

    setFilteredTasks(sortedTasks);
    // setTasks(sortedTasks);
  }, [statusFilter, categoryFilter, clientFilter, sortOrder, tasks]);

  //   console.log("selectedCategory", categoryFilter);
  // console.log("selctedStatus", statusFilter);
  //   console.log(tasks);

  async function handleUpdateTask(
    taskId: string,
    status: Task["status"],
    remarks?: string
  ) {
    const updateResponse = (await updateTaskStatus(
      taskId,
      status,
      remarks
    )) as Response;
    if (!updateResponse.ok) {
      console.log("Error updating task");
      return;
    }
    const fetchTasksResponse = await fetchTasks();
    const data = (await fetchTasksResponse.json()) as { data: Task[] };

    setTasks(data.data);
    setFilteredTasks(data.data);
  }

  const handleRaiseQuery = async () => {
    if (!selectedTaskForQuery || !querySubject.trim() || !queryMessage.trim()) {
      return;
    }

    // TODO: Implement API call to raise query
    console.log("Raising query for task:", selectedTaskForQuery.id);
    console.log("Subject:", querySubject);
    console.log("Message:", queryMessage);

    // Reset form and close dialog
    setQuerySubject("");
    setQueryMessage("");
    setSelectedTaskForQuery(null);
    setIsQueryDialogOpen(false);

    // You can add a toast notification here if needed
    alert("Query raised successfully!");
  };

  const handleSubmitRemarks = async () => {
    if (!selectedTaskForRemarks || !newStatus || !remarks.trim()) return;

    await handleUpdateTask(
      selectedTaskForRemarks.id,
      newStatus,
      remarks.replace(/\n/g, "\n")
    );

    setIsRemarksDialogOpen(false);
    setSelectedTaskForRemarks(null);
    setNewStatus(null);
    setRemarks("");
  };

  const openQueryDialog = (task: Task) => {
    setSelectedTaskForQuery(task);
    setIsQueryDialogOpen(true);
  };

  const handleCreateTask = async () => {
    if (
      !newTaskTitle.trim() ||
      !newTaskDescription.trim() ||
      (!assignTo && !assignToMyself) ||
      !selectedClientId.trim()
    ) {
      return;
    }

    const finalAssignTo = assignToMyself ? user?.data.user.id : assignTo;

    // TODO: Implement API call to create task
    console.log(
      "Creating task:",
      newTaskTitle,
      newTaskDescription,
      dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      finalAssignTo ? [finalAssignTo] : [],
      selectedClientId
    );

    const res = await createTask(
      newTaskTitle,
      newTaskDescription,
      dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      finalAssignTo ? [finalAssignTo] : [],
      selectedClientId,
      "medium"
    );

    if (!res.ok) {
      console.log("Error creating task");
      return;
    }

    // Reset form and close dialog
    setNewTaskTitle("");
    setNewTaskDescription("");
    setAssignTo("");
    setDueDate(undefined);
    setAssignToMyself(false);
    setSelectedClientId("");
    setIsCreateTaskDialogOpen(false);

    // Refresh tasks
    getTasks();

    alert("Task created successfully!");
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />;
      case "image":
        return <Image className="w-4 h-4 text-blue-500" />;
      case "design":
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <CreateTaskForm
          assignablePeople={clientsAndManagers as any}
          clients={clients}
          onTaskCreated={handleCreateTask}
          user={user || undefined}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Status</span>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as Task["status"] | "all")
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Category</span>
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as string)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="bank statement">Bank Statement</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Sort</span>
          <Button
            variant="outline"
            className="gap-1"
            aria-label={`Sort by ${
              sortOrder === "newest" ? "oldest" : "newest"
            }`}
            onClick={() =>
              setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
            }
          >
            {sortOrder === "newest" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </Button>
        </div>
      </div>
      <Dialog
        open={isCreateTaskDialogOpen}
        onOpenChange={setIsCreateTaskDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Enter the details for the new task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="col-span-3"
                placeholder="Task title"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <textarea
                id="description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="col-span-3 min-h-[80px] p-2 border rounded-md resize-none"
                placeholder="Task description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!dueDate}
                    className={cn(
                      "data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal col-span-3",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Client</Label>
              <Select
                value={selectedClientId}
                onValueChange={setSelectedClientId}
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignTo" className="text-right">
                Assign To
              </Label>
              <Select
                value={assignTo}
                onValueChange={setAssignTo}
                disabled={assignToMyself}
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue
                    placeholder={
                      assignToMyself
                        ? "Assigned to yourself"
                        : "Select client or manager"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {clientsAndManagers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4 flex items-center space-x-2">
                <Checkbox
                  id="assignToMyself"
                  checked={assignToMyself}
                  onCheckedChange={(checked) =>
                    setAssignToMyself(checked as boolean)
                  }
                />
                <Label htmlFor="assignToMyself">Assign to myself</Label>
              </div>
            </div> */}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateTask}>
              Assign to me
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {filteredTasks?.map((task) => {
        const isOverdue =
          task?.due_date &&
          isAfter(new Date(), new Date(task?.due_date)) &&
          task?.status !== "completed";

        return (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {task.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                  {task.priority && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border`}
                    >
                      <Flag className="w-3 h-3 inline mr-1" />
                      {task.priority}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <UserIcon className="w-4 h-4 mr-2" />
                  <span className="font-medium">Client:</span>
                  <span className="ml-1">{task.client.name}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  <span className="font-medium">Category:</span>
                  <span className="ml-1">{task.category}</span>
                </div>

                <div
                  className={`flex items-center text-sm ${
                    isOverdue ? "text-red-700 font-semibold" : "text-gray-600"
                  }`}
                >
                  <CalendarIcon
                    className={`w-4 h-4 mr-2 ${
                      isOverdue ? "text-red-600" : ""
                    }`}
                  />
                  <span className="font-medium">Due:</span>
                  <span className="ml-1">{task.due_date}</span>
                </div>
              </div>

              {task.documents && task.documents.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Documents ({task.documents.length}):
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {task.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center">
                          {/* {getFileIcon(doc.type)} */}
                          <div className="ml-2">
                            <p className="text-sm font-medium text-gray-900">
                              {extractOriginalFileName(doc.file_path)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(doc.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleViewDocument(doc.file_path)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadDocument(doc.file_path)
                            }
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.remarks && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-1">Remarks:</h4>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200 whitespace-pre-line">
                    {task.remarks}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Dialog
                  open={
                    isQueryDialogOpen && selectedTaskForQuery?.id === task?.id
                  }
                  onOpenChange={setIsQueryDialogOpen}
                >
                  <DialogTrigger asChild>
                    {/* <Button
                      variant="ghost"
                      onClick={() => openQueryDialog(task)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Raise Query
                    </Button> */}
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Raise Query for Task</DialogTitle>
                      <DialogDescription>
                        Raise a query regarding &#34;
                        {selectedTaskForQuery?.title}&#34;.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subject" className="text-right">
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          value={querySubject}
                          onChange={(e) => setQuerySubject(e.target.value)}
                          className="col-span-3"
                          placeholder="Brief subject of your query"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="message" className="text-right pt-2">
                          Message
                        </Label>
                        <textarea
                          id="message"
                          value={queryMessage}
                          onChange={(e) => setQueryMessage(e.target.value)}
                          className="col-span-3 min-h-[80px] p-2 border rounded-md resize-none"
                          placeholder="Describe your query in detail..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleRaiseQuery}>
                        Raise Query
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={
                    isRemarksDialogOpen &&
                    selectedTaskForRemarks?.id === task?.id
                  }
                  onOpenChange={setIsRemarksDialogOpen}
                >
                  <DialogContent className="max-w-[425px] lg:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add Remarks</DialogTitle>
                      <DialogDescription>
                        Please provide remarks for changing the status of &#34;
                        {selectedTaskForRemarks?.title}&#34; to{" "}
                        {newStatus?.replace("-", " ")}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="">
                        {/* <Label htmlFor="remarks" className="text-right pt-2">
                          Remarks
                        </Label> */}
                        <textarea
                          id="remarks"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          className="w-full min-h-[150px] p-2 border rounded-md resize-none"
                          placeholder="Enter your remarks..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={handleSubmitRemarks}
                        disabled={!remarks}
                      >
                        Submit
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Select
                  value={task.status}
                  onValueChange={(value) => {
                    const newStatus = value as Task["status"];
                    if (
                      newStatus === "partially-completed" ||
                      newStatus === "in-review"
                    ) {
                      setSelectedTaskForRemarks(task);
                      setNewStatus(newStatus);
                      setRemarks("");
                      setIsRemarksDialogOpen(true);
                    } else {
                      handleUpdateTask(task.id, newStatus);
                    }
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="partially-completed">
                      Partially Completed
                    </SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
