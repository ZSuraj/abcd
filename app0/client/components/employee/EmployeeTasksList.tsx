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
import { fetchTasks, updateTaskStatus } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { handleDownloadDocument, handleViewDocument } from "@/lib/utils";
import { Document, Task, User } from "@/types";
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
import { formatDistanceToNow, isAfter } from "date-fns";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Calendar,
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

export default function EmployeeTasksList() {
  const [user, setUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<Task["status"] | "all">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
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

  useEffect(() => {
    setUser(getCurrentUser());
    getTasks();
  }, []);

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
  }, [statusFilter, categoryFilter, sortOrder, tasks]);

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
      {filteredTasks?.map((task) => {
        const isOverdue =
          task?.due_date &&
          isAfter(new Date(), new Date(task?.due_date)) &&
          task?.status !== "completed";

        return (
          // <Card
          //   key={task?.id}
          //   className={`transition-all duration-200 gap-0 hover:shadow-md ${
          //     isOverdue ? "border-red-200 bg-red-50/30" : ""
          //   }`}
          // >
          //   <CardHeader className="pb-3">
          //     <div className="flex items-start justify-between">
          //       <div className="space-y-1">
          //         <CardTitle className="text-lg flex items-center gap-2">
          //           {task?.title}
          //           {isOverdue && (
          //             <AlertCircle className="h-4 w-4 text-red-500" />
          //           )}
          //         </CardTitle>
          //         <CardDescription>{task?.description}</CardDescription>
          //       </div>

          //       <div className="flex items-center gap-2">
          //         {/* <Badge
          //             variant="outline"
          //             className={getPriorityColor(task?.priority)}
          //           >
          //             {task?.priority || "medium"}
          //           </Badge> */}

          //         {/* 🆕 Category Badge */}
          //         {task?.category && (
          //           <Badge variant="secondary" className="text-xs">
          //             {task?.category}
          //           </Badge>
          //         )}

          //         <Badge className={getStatusColor(task?.status)}>
          //           {task?.status.replace("-", " ").toUpperCase()}
          //         </Badge>
          //       </div>
          //     </div>
          //   </CardHeader>

          //   <CardContent>
          //     <div className="flex items-center justify-between">
          //       <div className="flex items-center gap-4 text-sm text-gray-600">
          //         <div className="flex items-center gap-1">
          //           <UserIcon className="h-4 w-4" />
          //           <span>{task?.client.name}</span>
          //         </div>

          //         {task?.due_date && (
          //           <div className="flex items-center gap-1">
          //             <CalendarDays className="h-4 w-4" />
          //             <span
          //               className={isOverdue ? "text-red-600 font-medium" : ""}
          //             >
          //               Due{" "}
          //               {formatDistanceToNow(new Date(task?.due_date), {
          //                 addSuffix: true,
          //               })}
          //             </span>
          //           </div>
          //         )}

          //         {task?.updated_at && (
          //           <div className="flex items-center gap-1">
          //             <Clock className="h-4 w-4" />
          //             <span>Updated {timeAgo(task?.updated_at)}</span>
          //           </div>
          //         )}

          //         <div className="flex items-center gap-1">
          //           {task?.priority === "high" ? (
          //             <ArrowUp className="h-4 w-4" />
          //           ) : task?.priority === "medium" ? (
          //             <ArrowRight className="h-4 w-4" />
          //           ) : (
          //             <ArrowDown className="h-4 w-4" />
          //           )}
          //           <span>
          //             Priority{" "}
          //             {task?.priority === "high"
          //               ? "High"
          //               : task?.priority === "medium"
          //               ? "Medium"
          //               : "Low"}
          //           </span>
          //         </div>
          //       </div>

          //       <div className="flex items-center gap-2">
          //         <Select
          //           value={task?.status}
          //           onValueChange={(value) => {
          //             const newStatus = value as Task["status"];
          //             if (
          //               newStatus === "partially-completed" ||
          //               newStatus === "in-review"
          //             ) {
          //               setSelectedTaskForRemarks(task);
          //               setNewStatus(newStatus);
          //               setRemarks("");
          //               setIsRemarksDialogOpen(true);
          //             } else {
          //               handleUpdateTask(task?.id, newStatus);
          //             }
          //           }}
          //         >
          //           <SelectTrigger className="w-32">
          //             <SelectValue />
          //           </SelectTrigger>
          //           <SelectContent>
          //             <SelectItem value="pending">Pending</SelectItem>
          //             <SelectItem value="in-progress">In Progress</SelectItem>
          //             <SelectItem value="partially-completed">
          //               Partially Completed
          //             </SelectItem>
          //             <SelectItem value="in-review">In Review</SelectItem>
          //             <SelectItem value="completed">Completed</SelectItem>
          //           </SelectContent>
          //         </Select>
          //       </div>
          //     </div>
          //     {task?.remarks && (
          //       <div className="mt-4 space-y-1 text-sm text-gray-700">
          //         <div className="font-semibold text-gray-800">Remarks:</div>
          //         <div
          //           className="text-gray-700"
          //           dangerouslySetInnerHTML={{
          //             __html: task?.remarks.replace(/\n/g, "<br>\n"),
          //           }}
          //         />
          //       </div>
          //     )}
          //     <div className="flex justify-between items-end">
          //       {task?.documents && task?.documents.length > 0 && (
          //         <div className="mt-4 space-y-1 text-sm text-gray-700">
          //           <div className="font-semibold text-gray-800">
          //             Attached Documents:
          //           </div>
          //           <ul className="-4 list-disc">
          //             {task?.documents.map(
          //               (docKey: Document, index: number) => (
          //                 <li key={index} className="flex items-center gap-2">
          //                   <Paperclip className="h-4 w-4" />
          //                   <span className="truncate max-w-xs">
          //                     {extractOriginalFileName(docKey.file_path)}
          //                   </span>
          //                   <div className="flex items-center justify-end">
          //                     <Button
          //                       variant="link"
          //                       size="sm"
          //                       onClick={() =>
          //                         handleViewDocument(docKey.file_path)
          //                       }
          //                       className="text-blue-600 hover:underline hover:text-blue-700 text-sm font-normal"
          //                     >
          //                       {/* <EyeIcon className="h-4 w-4 text-blue-600" /> */}
          //                       View
          //                     </Button>
          //                     <Button
          //                       variant="link"
          //                       size="sm"
          //                       onClick={() =>
          //                         handleDownloadDocument(docKey.key)
          //                       }
          //                       className="text-blue-600 hover:underline hover:text-blue-700 text-sm font-normal"
          //                     >
          //                       {/* <Download className="h-4 w-4 text-blue-600" /> */}
          //                       Download
          //                     </Button>
          //                   </div>
          //                 </li>
          //               )
          //             )}
          //           </ul>
          //         </div>
          //       )}
          //       <Dialog
          //         open={
          //           isQueryDialogOpen && selectedTaskForQuery?.id === task?.id
          //         }
          //         onOpenChange={setIsQueryDialogOpen}
          //       >
          //         {/* <DialogTrigger asChild>
          //           <Button
          //             variant="ghost"
          //             size="sm"
          //             onClick={() => openQueryDialog(task)}
          //             className="gap-1"
          //           >
          //             <MessageSquare className="h-4 w-4" />
          //             Raise Query
          //           </Button>
          //         </DialogTrigger> */}
          //         <DialogContent className="sm:max-w-[425px]">
          //           <DialogHeader>
          //             <DialogTitle>Raise Query for Task</DialogTitle>
          //             <DialogDescription>
          //               Raise a query regarding &#34;
          //               {selectedTaskForQuery?.title}&#34;.
          //             </DialogDescription>
          //           </DialogHeader>
          //           <div className="grid gap-4 py-4">
          //             <div className="grid grid-cols-4 items-center gap-4">
          //               <Label htmlFor="subject" className="text-right">
          //                 Subject
          //               </Label>
          //               <Input
          //                 id="subject"
          //                 value={querySubject}
          //                 onChange={(e) => setQuerySubject(e.target.value)}
          //                 className="col-span-3"
          //                 placeholder="Brief subject of your query"
          //               />
          //             </div>
          //             <div className="grid grid-cols-4 items-start gap-4">
          //               <Label htmlFor="message" className="text-right pt-2">
          //                 Message
          //               </Label>
          //               <textarea
          //                 id="message"
          //                 value={queryMessage}
          //                 onChange={(e) => setQueryMessage(e.target.value)}
          //                 className="col-span-3 min-h-[80px] p-2 border rounded-md resize-none"
          //                 placeholder="Describe your query in detail..."
          //               />
          //             </div>
          //           </div>
          //           <DialogFooter>
          //             <Button type="submit" onClick={handleRaiseQuery}>
          //               Raise Query
          //             </Button>
          //           </DialogFooter>
          //         </DialogContent>
          //       </Dialog>
          //       <Dialog
          //         open={
          //           isRemarksDialogOpen &&
          //           selectedTaskForRemarks?.id === task?.id
          //         }
          //         onOpenChange={setIsRemarksDialogOpen}
          //       >
          //         <DialogContent className="max-w-[425px] lg:max-w-[600px]">
          //           <DialogHeader>
          //             <DialogTitle>Add Remarks</DialogTitle>
          //             <DialogDescription>
          //               Please provide remarks for changing the status of &#34;
          //               {selectedTaskForRemarks?.title}&#34; to{" "}
          //               {newStatus?.replace("-", " ")}.
          //             </DialogDescription>
          //           </DialogHeader>
          //           <div className="grid gap-4 py-4">
          //             <div className="">
          //               {/* <Label htmlFor="remarks" className="text-right pt-2">
          //                 Remarks
          //               </Label> */}
          //               <textarea
          //                 id="remarks"
          //                 value={remarks}
          //                 onChange={(e) => setRemarks(e.target.value)}
          //                 className="w-full min-h-[150px] p-2 border rounded-md resize-none"
          //                 placeholder="Enter your remarks..."
          //               />
          //             </div>
          //           </div>
          //           <DialogFooter>
          //             <Button
          //               type="submit"
          //               onClick={handleSubmitRemarks}
          //               disabled={!remarks}
          //             >
          //               Submit
          //             </Button>
          //           </DialogFooter>
          //         </DialogContent>
          //       </Dialog>
          //     </div>
          //   </CardContent>
          // </Card>
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
                  <Calendar
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
