"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Video,
  BookOpen,
  ExternalLink,
  Clock,
  StickyNote,
  Brain,
  Search,
  Filter,
  Bookmark,
} from "lucide-react";
import Image from "next/image";

interface Content {
  id: string;
  title: string;
  type: string;
  source_url?: string;
  description?: string;
  created_at: string;
  tags?: string[];
  thumbnail?: string;
}

export function ContentFeed() {
  const [content, setContent] = useState<Content[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = query(
      collection(db, "users", user.uid, "content"),
      orderBy("created_at", "desc"),
      limit(12)
    );

    const unsub = onSnapshot(ref, (snap) => {
      setContent(
        snap.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Content)
        )
      );
    });

    return () => unsub();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "article":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "note":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "article":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "note":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesType =
      filterType === "all" ||
      item.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const handleAction = (
    e: React.MouseEvent,
    path: string,
    contentId?: string
  ) => {
    e.stopPropagation();
    router.push(path + (contentId ? `?contentId=${contentId}` : ""));
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContent.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No content found</p>
            <p className="text-muted-foreground">
              Start by adding some content to your collection
            </p>
          </div>
        ) : (
          filteredContent.map((item) => (
            <Card
              key={item.id}
              className="group hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/content/${item.id}`)}
            >
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <Image
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.title || "Content thumbnail"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={getTypeBadgeColor(item.type)}>
                      {getTypeIcon(item.type)}
                      <span className="ml-1 capitalize">{item.type}</span>
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.source_url || "No source available"}
                    </p>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) =>
                          handleAction(e, "/dashboard/notes/new", item.id)
                        }
                      >
                        <StickyNote className="h-4 w-4" />
                        <span className="sr-only">Add Note</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) =>
                          handleAction(e, "/dashboard/flashcards/new", item.id)
                        }
                      >
                        <Brain className="h-4 w-4" />
                        <span className="sr-only">Create Flashcard</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) =>
                          handleAction(e, "/dashboard/reminders/new", item.id)
                        }
                      >
                        <Clock className="h-4 w-4" />
                        <span className="sr-only">Set Reminder</span>
                      </Button> */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.source_url) {
                            window.open(item.source_url, "_blank");
                          }
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Open</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
