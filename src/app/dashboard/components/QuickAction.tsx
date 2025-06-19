"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Clock, BookOpen, FileText } from "lucide-react";

export function QuickActions() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-auto p-3"
          onClick={() => router.push("/dashboard/tags")}
        >
          <div className="p-2 rounded-md text-white bg-blue-500 hover:bg-blue-600">
            <Tag className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-medium">Add Tag</div>
            <div className="text-xs text-muted-foreground">
              Create a new tag
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-auto p-3"
          onClick={() => router.push("/dashboard/reminders")}
        >
          <div className="p-2 rounded-md text-white bg-orange-500 hover:bg-orange-600">
            <Clock className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-medium">Set Reminder</div>
            <div className="text-xs text-muted-foreground">
              Schedule a reminder
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-auto p-3"
          onClick={() => router.push("/dashboard/flashcards")}
        >
          <div className="p-2 rounded-md text-white bg-purple-500 hover:bg-purple-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-medium">Create Flashcard</div>
            <div className="text-xs text-muted-foreground">
              Add a new flashcard
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-auto p-3"
          onClick={() => router.push("/dashboard/content")}
        >
          <div className="p-2 rounded-md text-white bg-green-500 hover:bg-green-600">
            <FileText className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-medium">Add Content</div>
            <div className="text-xs text-muted-foreground">
              Save new content
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
