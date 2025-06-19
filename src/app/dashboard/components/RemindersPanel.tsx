"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Edit, MoreHorizontal } from "lucide-react";

type Reminder = {
  id: string;
  title: string;
  dueDate: Date;
  priority: string;
  status?: string;
};

export function RemindersPanel() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = collection(db, "users", user.uid, "reminders");
    const unsub = onSnapshot(ref, (snap) => {
      setReminders(
        snap.docs
          .map((doc) => {
            const d = doc.data();
            const due = d.dueDate?.toDate
              ? d.dueDate.toDate()
              : d.dueDate
              ? new Date(d.dueDate)
              : null;
            return {
              id: doc.id,
              title: d.title || "Untitled",
              dueDate: due,
              priority: d.priority || "medium",
              status: d.status || "upcoming",
            };
          })
          .filter((reminder) => reminder.status !== "completed")
          .sort((a, b) =>
            a.dueDate && b.dueDate
              ? a.dueDate.getTime() - b.dueDate.getTime()
              : 0
          )
      );
    });
    return () => unsub();
  }, []);

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

  const handleDone = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "reminders", id), {
      status: "completed",
    });
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/reminders/edit/${id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No upcoming reminders!
          </div>
        ) : (
          reminders.slice(0, 4).map((reminder) => (
            <div key={reminder.id} className="space-y-2 p-3 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium truncate">
                    {reminder.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reminder.dueDate
                      ? reminder.dueDate.toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : ""}
                  </p>
                </div>
                <Badge
                  className={getPriorityColor(reminder.priority)}
                  variant="secondary"
                >
                  {reminder.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => handleDone(reminder.id)}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Done
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => handleEdit(reminder.id)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() =>
                    router.push(`/dashboard/reminders/${reminder.id}`)
                  }
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={() => router.push("/dashboard/reminders")}
        >
          View All Reminders
        </Button>
      </CardContent>
    </Card>
  );
}
