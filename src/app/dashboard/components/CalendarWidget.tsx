"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Tag,
  FileText,
} from "lucide-react";
import { auth, db } from "@/lib/firebaseClient";
import { collection, onSnapshot } from "firebase/firestore";

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Real data: { [dateKey]: { tags: number, reminders: number, content: number, hasDue: boolean } }
  const [events, setEvents] = useState<
    Record<
      string,
      { tags: number; reminders: number; content: number; hasDue: boolean }
    >
  >({});

  // Fetch and aggregate Firestore data
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const tagsRef = collection(db, "users", user.uid, "tags");
    const remindersRef = collection(db, "users", user.uid, "reminders");
    const contentRef = collection(db, "users", user.uid, "content");

    // Helper to format date as YYYY-MM-DD
    const formatDateKey = (date: Date) => date.toISOString().split("T")[0];
 
    // Aggregate events per date
    const eventMap: Record<
      string,
      { tags: number; reminders: number; content: number; hasDue: boolean }
    > = {};

    // Tags: count by created_at date
    const unsubTags = onSnapshot(tagsRef, (snap) => {
      snap.docs.forEach((doc) => {
        const d = doc.data().created_at
          ? new Date(doc.data().created_at)
          : null;
        if (d) {
          const key = formatDateKey(d);
          eventMap[key] = eventMap[key] || {
            tags: 0,
            reminders: 0,
            content: 0,
            hasDue: false,
          };
          eventMap[key].tags += 1;
        }
      });
      setEvents({ ...eventMap });
    });

    // Reminders: count by dueDate, mark hasDue if status is 'due' or not completed
    const unsubReminders = onSnapshot(remindersRef, (snap) => {
      snap.docs.forEach((doc) => {
        const data = doc.data();
        let d: Date | null = null;
        if (data.dueDate?.toDate) d = data.dueDate.toDate();
        else if (data.dueDate) d = new Date(data.dueDate);
        if (d) {
          const key = formatDateKey(d);
          eventMap[key] = eventMap[key] || {
            tags: 0,
            reminders: 0,
            content: 0,
            hasDue: false,
          };
          eventMap[key].reminders += 1;
          if (
            !data.status ||
            data.status === "due" ||
            data.status === "upcoming"
          ) {
            eventMap[key].hasDue = true;
          }
        }
      });
      setEvents({ ...eventMap });
    });

    // Content: count by created_at date
    const unsubContent = onSnapshot(contentRef, (snap) => {
      snap.docs.forEach((doc) => {
        const d = doc.data().created_at
          ? new Date(doc.data().created_at)
          : null;
        if (d) {
          const key = formatDateKey(d);
          eventMap[key] = eventMap[key] || {
            tags: 0,
            reminders: 0,
            content: 0,
            hasDue: false,
          };
          eventMap[key].content += 1;
        }
      });
      setEvents({ ...eventMap });
    });

    return () => {
      unsubTags();
      unsubReminders();
      unsubContent();
    };
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++)
      days.push(new Date(year, month, day));
    return days;
  };

  const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

  const getEventData = (date: Date) => events[formatDateKey(date)] || null;

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") newDate.setMonth(prev.getMonth() - 1);
      else newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-1">
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("month")}
          >
            Month
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Button
            variant={view === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("day")}
          >
            Day
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {/* Calendar days */}
        {days.map((day, index) => {
          if (!day) return <div key={index} className="p-2 h-20"></div>;
          const isToday = day.toDateString() === today.toDateString();
          const isSelected =
            selectedDate?.toDateString() === day.toDateString();
          const eventData = getEventData(day);

          // Dots: blue (tags), orange (reminders), green (content)
          const dots = [];
          if (eventData?.tags)
            dots.push(
              <Circle
                key="tags"
                className="h-2 w-2 fill-blue-500 text-blue-500"
              />
            );
          if (eventData?.reminders)
            dots.push(
              <Circle
                key="reminders"
                className="h-2 w-2 fill-orange-500 text-orange-500"
              />
            );
          if (eventData?.content)
            dots.push(
              <Circle
                key="content"
                className="h-2 w-2 fill-green-500 text-green-500"
              />
            );

          // If any due reminder, mark border as red
          const dueClass = eventData?.hasDue ? "border-red-500" : "";

          return (
            <div
              key={day.toISOString()}
              className={`
                p-2 h-20 border rounded-lg cursor-pointer transition-colors flex flex-col items-center
                ${
                  isSelected
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted/50"
                }
                ${isToday ? "bg-primary/5 border-primary/30" : ""}
                ${dueClass}
              `}
              onClick={() => setSelectedDate(day)}
            >
              <div
                className={`text-sm font-medium ${
                  isToday ? "text-primary" : ""
                }`}
              >
                {day.getDate()}
              </div>
              <div className="flex gap-1 mt-1">{dots}</div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
          <span>Tags</span>
        </div>
        <div className="flex items-center gap-1">
          <Circle className="h-3 w-3 fill-orange-500 text-orange-500" />
          <span>Reminders</span>
        </div>
        <div className="flex items-center gap-1">
          <Circle className="h-3 w-3 fill-green-500 text-green-500" />
          <span>Content</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 border-2 border-red-500 rounded"></span>
          <span>Due</span>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h4>
          {(() => {
            const data = getEventData(selectedDate);
            if (!data)
              return (
                <p className="text-sm text-muted-foreground">
                  No activity on this date
                </p>
              );
            return (
              <div className="flex gap-4">
                {data.tags > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{data.tags} tags saved</span>
                  </div>
                )}
                {data.reminders > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">{data.reminders} reminders</span>
                  </div>
                )}
                {data.content > 0 && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {data.content} content items
                    </span>
                  </div>
                )}
                {data.hasDue && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Due work!
                  </Badge>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
