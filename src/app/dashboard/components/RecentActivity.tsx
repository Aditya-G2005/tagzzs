"use client";

import { JSX, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tag, Clock, FileText, BookOpen, CheckCircle } from "lucide-react";
import { auth, db } from "@/lib/firebaseClient";
import { collection, onSnapshot } from "firebase/firestore";

type Activity = {
  id: string;
  type: "tag" | "reminder" | "content" | "flashcard";
  action: string;
  target: string;
  time: string;
  icon: JSX.Element;
  refId?: string;
};

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} hour${diffH > 1 ? "s" : ""} ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} day${diffD > 1 ? "s" : ""} ago`;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Helper: add activity if in last hour
    const addIfRecent = (
      arr: Activity[],
      date: Date | null,
      activity: Omit<Activity, "id" | "time">
    ) => {
      if (date && date > oneHourAgo) {
        arr.push({
          ...activity,
          id: Math.random().toString(36).slice(2),
          time: timeAgo(date),
        });
      }
    };

    const unsubscribes: (() => void)[] = [];
    let all: Activity[] = [];

    // Tags
    unsubscribes.push(
      onSnapshot(collection(db, "users", user.uid, "tags"), (snap) => {
        const arr: Activity[] = [];
        snap.docs.forEach((doc) => {
          const d = doc.data();
          const created = d.created_at ? new Date(d.created_at) : null;
          addIfRecent(arr, created, {
            type: "tag",
            action: "Created tag",
            target: d.name || "Untitled",
            icon: <Tag className="h-4 w-4" />,
            refId: doc.id,
          });
        });
        all = [...all.filter((a) => a.type !== "tag"), ...arr];
        setActivities(
          all.sort((a, b) => (b.time > a.time ? 1 : -1)).filter((a) => !!a.time)
        );
      })
    );

    // Reminders
    unsubscribes.push(
      onSnapshot(collection(db, "users", user.uid, "reminders"), (snap) => {
        const arr: Activity[] = [];
        snap.docs.forEach((doc) => {
          const d = doc.data();
          const created = d.created_at ? new Date(d.created_at) : null;
          addIfRecent(arr, created, {
            type: "reminder",
            action:
              d.status === "completed" ? "Completed reminder" : "Set reminder",
            target: d.title || "Untitled",
            icon:
              d.status === "completed" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              ),
            refId: doc.id,
          });
        });
        all = [...all.filter((a) => a.type !== "reminder"), ...arr];
        setActivities(
          all.sort((a, b) => (b.time > a.time ? 1 : -1)).filter((a) => !!a.time)
        );
      })
    );

    // Content
    unsubscribes.push(
      onSnapshot(collection(db, "users", user.uid, "content"), (snap) => {
        const arr: Activity[] = [];
        snap.docs.forEach((doc) => {
          const d = doc.data();
          const created = d.created_at ? new Date(d.created_at) : null;
          addIfRecent(arr, created, {
            type: "content",
            action: "Saved content",
            target: d.title || "Untitled",
            icon: <FileText className="h-4 w-4" />,
            refId: doc.id,
          });
        });
        all = [...all.filter((a) => a.type !== "content"), ...arr];
        setActivities(
          all.sort((a, b) => (b.time > a.time ? 1 : -1)).filter((a) => !!a.time)
        );
      })
    );

    // Flashcards
    unsubscribes.push(
      onSnapshot(collection(db, "users", user.uid, "flashcards"), (snap) => {
        const arr: Activity[] = [];
        snap.docs.forEach((doc) => {
          const d = doc.data();
          const created = d.lastReviewed ? new Date(d.lastReviewed) : null;
          addIfRecent(arr, created, {
            type: "flashcard",
            action: "Created flashcard",
            target: d.front || "Untitled",
            icon: <BookOpen className="h-4 w-4" />,
            refId: doc.id,
          });
        });
        all = [...all.filter((a) => a.type !== "flashcard"), ...arr];
        setActivities(
          all.sort((a, b) => (b.time > a.time ? 1 : -1)).filter((a) => !!a.time)
        );
      })
    );

    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  const getActivityColor = (type: string) => {
    switch (type) {
      case "tag":
        return "text-blue-600 dark:text-blue-400";
      case "reminder":
        return "text-orange-600 dark:text-orange-400";
      case "content":
        return "text-green-600 dark:text-green-400";
      case "flashcard":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center text-muted-foreground py-6">
          No activity in the last hour!
        </div>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback
                className={`${getActivityColor(activity.type)} bg-transparent`}
              >
                {activity.icon}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {activity.action}{" "}
                  <span className="font-medium">
                    &quot;{activity.target}&quot;
                  </span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  // You can implement navigation to the relevant detail page here if desired
                  // e.g. router.push(`/dashboard/${activity.type}/${activity.refId}`)
                }}
              >
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  // You can implement edit logic here
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
