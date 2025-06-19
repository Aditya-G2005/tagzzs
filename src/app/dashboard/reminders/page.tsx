"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Search,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  CalendarIcon,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { TagSelector } from "../../../components/tag-selector";
import { format } from "date-fns";
import { auth, db } from "@/lib/firebaseClient";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  where,
  Timestamp,
} from "firebase/firestore";

export default function Page() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [reminders, setReminders] = useState<any[]>([]);
  const [newReminder, setNewReminder] = useState({
    title: "",
    dueDate: new Date(),
    priority: "medium",
    tags: [] as string[],
    repeat: "none",
  });
  const [editReminder, setEditReminder] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [dateReminders, setDateReminders] = useState<any[]>([]);
  const [dateContents, setDateContents] = useState<any[]>([]);

  // Real-time fetch for reminders
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const remindersRef = collection(db, "users", user.uid, "reminders");
    const q = query(remindersRef, orderBy("dueDate", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReminders(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate
            ? doc.data().dueDate.toDate()
            : new Date(doc.data().dueDate),
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  // Filtering logic
  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch = reminder.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || reminder.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const upcomingReminders = filteredReminders.filter(
    (r) => r.status !== "completed" && r.dueDate >= new Date()
  );
  const completedReminders = filteredReminders.filter(
    (r) => r.status === "completed"
  );

  // Handle create reminder
  const handleCreateReminder = async () => {
    const user = auth.currentUser;
    if (!user || !newReminder.title.trim()) return;
    await addDoc(collection(db, "users", user.uid, "reminders"), {
      title: newReminder.title.trim(),
      dueDate: Timestamp.fromDate(newReminder.dueDate),
      status: "upcoming",
      priority: newReminder.priority,
      tags: newReminder.tags,
      repeat: newReminder.repeat,
      created_at: new Date().toISOString(),
    });
    setIsCreateDialogOpen(false);
    setNewReminder({
      title: "",
      dueDate: new Date(),
      priority: "medium",
      tags: [],
      repeat: "none",
    });
  };

  // Handle edit reminder
  const handleEditReminder = async () => {
    const user = auth.currentUser;
    if (!user || !editReminder) return;
    await updateDoc(doc(db, "users", user.uid, "reminders", editReminder.id), {
      title: editReminder.title,
      dueDate: Timestamp.fromDate(editReminder.dueDate),
      priority: editReminder.priority,
      tags: editReminder.tags,
      repeat: editReminder.repeat,
    });
    setIsEditDialogOpen(false);
    setEditReminder(null);
  };

  // Handle delete reminder
  const handleDeleteReminder = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "reminders", id));
  };

  // Mark as done
  const handleDoneReminder = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "reminders", id), {
      status: "completed",
    });
  };

  // Undo completed
  const handleUndoReminder = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "reminders", id), {
      status: "upcoming",
    });
  };

  // Calendar date click: fetch reminders and content for that date
  useEffect(() => {
    if (!selectedDate) {
      setDateReminders([]);
      setDateContents([]);
      return;
    }
    const user = auth.currentUser;
    if (!user) return;

    // Start and end of day
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    // Reminders for that date
    const remindersRef = collection(db, "users", user.uid, "reminders");
    const q1 = query(
      remindersRef,
      where("dueDate", ">=", Timestamp.fromDate(start)),
      where("dueDate", "<=", Timestamp.fromDate(end))
    );
    const unsub1 = onSnapshot(q1, (snapshot) => {
      setDateReminders(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate
            ? doc.data().dueDate.toDate()
            : new Date(doc.data().dueDate),
        }))
      );
    });

    // Content for that date (if you want to show content added on that date)
    const contentRef = collection(db, "users", user.uid, "content");
    const q2 = query(
      contentRef,
      where("created_at", ">=", start.toISOString()),
      where("created_at", "<=", end.toISOString())
    );
    const unsub2 = onSnapshot(q2, (snapshot) => {
      setDateContents(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [selectedDate]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDateTime = (date: Date) => {
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">
            Manage your upcoming and completed reminders
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              Calendar
            </Button>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Reminder</DialogTitle>
                <DialogDescription>
                  Create a reminder for important tasks and events
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reminderTitle">Title</Label>
                  <Input
                    id="reminderTitle"
                    value={newReminder.title}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, title: e.target.value })
                    }
                    placeholder="Enter reminder title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(newReminder.dueDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newReminder.dueDate}
                          onSelect={(date) =>
                            date &&
                            setNewReminder({ ...newReminder, dueDate: date })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminderTime">Time</Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={format(newReminder.dueDate, "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":");
                        const newDate = new Date(newReminder.dueDate);
                        newDate.setHours(
                          Number.parseInt(hours),
                          Number.parseInt(minutes)
                        );
                        setNewReminder({ ...newReminder, dueDate: newDate });
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderPriority">Priority</Label>
                  <Select
                    value={newReminder.priority}
                    onValueChange={(value) =>
                      setNewReminder({ ...newReminder, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderRepeat">Repeat</Label>
                  <Select
                    value={newReminder.repeat}
                    onValueChange={(value) =>
                      setNewReminder({ ...newReminder, repeat: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Repeat</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <TagSelector
                    selectedTags={newReminder.tags}
                    onTagsChange={(tags) =>
                      setNewReminder({ ...newReminder, tags })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateReminder}>Create Reminder</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ... stats and filters ... */}

      {viewMode === "list" ? (
        <div className="space-y-6">
          {/* Upcoming Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingReminders.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                  No upcoming reminders!
                </div>
              ) : (
                upcomingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{reminder.title}</h3>
                        <Badge className={getPriorityColor(reminder.priority)}>
                          {reminder.priority}
                        </Badge>
                        {reminder.repeat !== "none" && (
                          <Badge variant="outline">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            {reminder.repeat}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDateTime(reminder.dueDate)}</span>
                        {reminder.linkedContent && (
                          <span>Linked: {reminder.linkedContent}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {reminder.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDoneReminder(reminder.id);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Done
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditReminder(reminder);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReminder(reminder.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          {/* Completed Reminders */}
          <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Completed Reminders ({completedReminders.length})
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        showCompleted ? "rotate-180" : ""
                      }`}
                    />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {completedReminders.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6">
                      No completed reminders!
                    </div>
                  ) : (
                    completedReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between p-4 border rounded-lg opacity-75"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium line-through">
                              {reminder.title}
                            </h3>
                            <Badge className={getStatusColor(reminder.status)}>
                              completed
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatDateTime(reminder.dueDate)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {reminder.tags.map((tag: string) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUndoReminder(reminder.id);
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Undo
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReminder(reminder.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>
              View your reminders in calendar format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Calendar grid */}
              <div className="md:w-2/3 w-full">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  // You can add custom day render logic here if you want to show dots for days with reminders
                />
              </div>
              {/* Agenda/list for selected date */}
              <div className="md:w-1/3 w-full">
                <div className="bg-muted rounded-lg p-4 min-h-[300px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {selectedDate
                        ? format(selectedDate, "MMMM d, yyyy")
                        : "Select a date"}
                    </h3>
                  </div>
                  {selectedDate ? (
                    <>
                      {dateReminders.length === 0 &&
                      dateContents.length === 0 ? (
                        <div className="text-center text-muted-foreground py-6">
                          No reminders or content for this date.
                        </div>
                      ) : (
                        <>
                          {dateReminders.length > 0 && (
                            <>
                              <h4 className="font-medium mb-2">Reminders</h4>
                              <ul className="space-y-2 mb-4">
                                {dateReminders.map((reminder) => (
                                  <li
                                    key={reminder.id}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                                  >
                                    <div>
                                      <span className="font-medium">
                                        {reminder.title}
                                      </span>
                                      <Badge
                                        className={`ml-2 ${getPriorityColor(
                                          reminder.priority
                                        )}`}
                                      >
                                        {reminder.priority}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDoneReminder(reminder.id);
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditReminder(reminder);
                                          setIsEditDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteReminder(reminder.id);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          {dateContents.length > 0 && (
                            <>
                              <h4 className="font-medium mb-2">
                                Content Added
                              </h4>
                              <ul className="space-y-2">
                                {dateContents.map((content) => (
                                  <li
                                    key={content.id}
                                    className="p-3 border rounded-lg bg-card"
                                  >
                                    <span className="font-medium">
                                      {content.title || "Untitled"}
                                    </span>
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      {content.type || ""}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-6">
                      Select a date to see reminders and content.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Reminder Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
          </DialogHeader>
          {editReminder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editReminderTitle">Title</Label>
                <Input
                  id="editReminderTitle"
                  value={editReminder.title}
                  onChange={(e) =>
                    setEditReminder({ ...editReminder, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(editReminder.dueDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editReminder.dueDate}
                      onSelect={(date) =>
                        date &&
                        setEditReminder({
                          ...editReminder,
                          dueDate: date,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editReminderPriority">Priority</Label>
                <Select
                  value={editReminder.priority}
                  onValueChange={(value) =>
                    setEditReminder({ ...editReminder, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editReminderRepeat">Repeat</Label>
                <Select
                  value={editReminder.repeat}
                  onValueChange={(value) =>
                    setEditReminder({ ...editReminder, repeat: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <TagSelector
                  selectedTags={editReminder.tags}
                  onTagsChange={(tags) =>
                    setEditReminder({ ...editReminder, tags })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditReminder}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
