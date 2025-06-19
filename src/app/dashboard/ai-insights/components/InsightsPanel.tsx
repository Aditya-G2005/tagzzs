"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Layers, Bell, Tag, TrendingUp } from "lucide-react";

export function InsightsPanel() {
  const [stats, setStats] = useState({
    notes: 0,
    flashcards: 0,
    reminders: 0,
    tags: 0,
    topTags: [] as string[],
    recentNote: "",
    recentFlashcard: "",
    recentReminder: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Fetch counts
      const notesSnap = await getDocs(
        collection(db, "users", user.uid, "notes")
      );
      const flashcardsSnap = await getDocs(
        collection(db, "users", user.uid, "flashcards")
      );
      const remindersSnap = await getDocs(
        collection(db, "users", user.uid, "reminders")
      );
      const tagsSnap = await getDocs(collection(db, "users", user.uid, "tags"));

      // Top tags by usage (by counting tag occurrences in notes)
      const tagUsage: Record<string, number> = {};
      notesSnap.docs.forEach((doc) => {
        const tags = doc.data().tags || [];
        tags.forEach((tag: string) => {
          tagUsage[tag] = (tagUsage[tag] || 0) + 1;
        });
      });
      const topTags = Object.entries(tagUsage)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag)
        .slice(0, 5);

      // Recent note/flashcard/reminder
      const recentNote =
        notesSnap.docs
          .sort((a, b) =>
            (b.data().lastEdited || "").localeCompare(a.data().lastEdited || "")
          )
          .at(0)
          ?.data().title || "";
      const recentFlashcard =
        flashcardsSnap.docs
          .sort((a, b) =>
            (b.data().lastReviewed || "").localeCompare(
              a.data().lastReviewed || ""
            )
          )
          .at(0)
          ?.data().front || "";
      const recentReminder =
        remindersSnap.docs
          .sort(
            (a, b) =>
              (b.data().dueDate?.toDate?.() || 0) -
              (a.data().dueDate?.toDate?.() || 0)
          )
          .at(0)
          ?.data().title || "";

      setStats({
        notes: notesSnap.size,
        flashcards: flashcardsSnap.size,
        reminders: remindersSnap.size,
        tags: tagsSnap.size,
        topTags,
        recentNote,
        recentFlashcard,
        recentReminder,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{stats.notes}</span>
            <span className="text-muted-foreground">Notes</span>
          </div>
          <div className="flex items-center gap-3">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{stats.flashcards}</span>
            <span className="text-muted-foreground">Flashcards</span>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{stats.reminders}</span>
            <span className="text-muted-foreground">Reminders</span>
          </div>
          <div className="flex items-center gap-3">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{stats.tags}</span>
            <span className="text-muted-foreground">Tags</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top Tags</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {stats.topTags.length === 0 ? (
            <span className="text-muted-foreground text-sm">No tags yet</span>
          ) : (
            stats.topTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Last Note:</span>{" "}
            <span className="text-muted-foreground">
              {stats.recentNote || "No notes yet"}
            </span>
          </div>
          <div>
            <span className="font-medium">Last Flashcard:</span>{" "}
            <span className="text-muted-foreground">
              {stats.recentFlashcard || "No flashcards yet"}
            </span>
          </div>
          <div>
            <span className="font-medium">Last Reminder:</span>{" "}
            <span className="text-muted-foreground">
              {stats.recentReminder || "No reminders yet"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
