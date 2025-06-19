"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { collection, onSnapshot } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, TrendingUp } from "lucide-react";

type TagType = {
  id: string;
  name: string;
  count: number;
};

export function TagsPanel() {
  const [tags, setTags] = useState<TagType[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const tagsRef = collection(db, "users", user.uid, "tags");
    // Listen for tag docs
    const unsub = onSnapshot(tagsRef, (snap) => {
      const tagArr: TagType[] = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "untitled",
        count: 0, // We'll count usage below
      }));
      // Now count tag usage in content and notes
      const contentRef = collection(db, "users", user.uid, "content");
      const notesRef = collection(db, "users", user.uid, "notes");
      const tagCounts: Record<string, number> = {};
      // Listen for content and notes to count tag usage
      const unsubContent = onSnapshot(contentRef, (contentSnap) => {
        contentSnap.docs.forEach((doc) => {
          const tags = doc.data().tags || [];
          tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
        // Also count tags in notes
        onSnapshot(notesRef, (notesSnap) => {
          notesSnap.docs.forEach((doc) => {
            const tags = doc.data().tags || [];
            tags.forEach((tag: string) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          });
          // Merge counts into tagArr
          setTags(
            tagArr
              .map((t) => ({
                ...t,
                count: tagCounts[t.name] || 0,
              }))
              .sort((a, b) => b.count - a.count)
          );
        });
      });
      // Cleanup
      return () => {
        unsubContent();
      };
    });
    return () => unsub();
  }, []);

  const getTrendIcon = (count: number, max: number) => {
    if (count === max && max > 0) {
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    }
    return null;
  };

  const maxCount = tags.length > 0 ? tags[0].count : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Recent Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 6).map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="cursor-pointer hover:bg-primary/10 transition-colors"
            >
              <span>{tag.name}</span>
              {/* <span className="ml-1 text-xs opacity-70">({tag.count})</span> */}
              {getTrendIcon(tag.count, maxCount)}
            </Badge>
          ))}
        </div>

        {/* <div className="space-y-2">
          <h4 className="text-sm font-medium">Trending Tags</h4>
          {tags
            .filter((tag) => tag.count === maxCount && maxCount > 0)
            .slice(0, 3)
            .map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">#{tag.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs">{tag.count}</span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
              </div>
            ))}
        </div> */}

        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={() => router.push("/dashboard/tags")}
        >
          Manage Tags
        </Button>
      </CardContent>
    </Card>
  );
}
