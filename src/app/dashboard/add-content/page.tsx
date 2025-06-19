"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  FileText,
  Video,
  Link,
  Upload,
  BookOpen,
  MoreHorizontal,
  Bookmark,
  Brain,
  Bell,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { TagSelector } from "@/components/tag-selector";
import { auth, db, storage } from "@/lib/firebaseClient";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "@/hooks/use-toast";

type Content = {
  id: string;
  title: string;
  type: string;
  source_url?: string;
  description?: string;
  created_at: string;
  tags: { name: string; color: string }[];
  thumbnail?: string;
};

export default function Page() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [filterType, setFilterType] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [contentData, setContentData] = useState({
    title: "",
    type: "article",
    source_url: "",
    description: "",
    tags: [] as string[],
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContentId, setEditContentId] = useState<string | null>(null);
  const [editContentData, setEditContentData] = useState({
    title: "",
    type: "article",
    source_url: "",
    description: "",
    tags: [] as string[],
    thumbnail: "",
  });
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<
    string | null
  >(null);

  async function updateContent() {
    try {
      const user = auth.currentUser;
      if (!user || !editContentId) return;

      // Handle tags: get tag IDs as in createContent
      const tagIds: string[] = [];
      for (const tagName of editContentData.tags) {
        const tagQuery = query(
          collection(db, "users", user.uid, "tags"),
          where("name", "==", tagName)
        );
        const tagSnap = await getDocs(tagQuery);
        let tagId = "";
        if (tagSnap.empty) {
          const newTagRef = await addDoc(
            collection(db, "users", user.uid, "tags"),
            {
              name: tagName,
              color: "blue",
            }
          );
          tagId = newTagRef.id;
        } else {
          tagId = tagSnap.docs[0].id;
        }
        tagIds.push(tagId);
      }

      // Handle thumbnail upload if changed
      let thumbnailUrl = editContentData.thumbnail || "/placeholder.svg";
      if (editThumbnailFile) {
        const storageRef = ref(
          storage,
          `users/${user.uid}/thumbnails/${Date.now()}_${editThumbnailFile.name}`
        );
        await uploadBytes(storageRef, editThumbnailFile);
        thumbnailUrl = await getDownloadURL(storageRef);
      }

      const docRef = doc(db, "users", user.uid, "content", editContentId);

      await updateDoc(docRef, {
        title: editContentData.title.trim(),
        type: editContentData.type,
        source_url: editContentData.source_url.trim() || null,
        description: editContentData.description.trim() || null,
        tagIds,
        thumbnail: thumbnailUrl,
      });

      setIsEditDialogOpen(false);
      setEditContentId(null);
      setEditContentData({
        title: "",
        type: "article",
        source_url: "",
        description: "",
        tags: [],
        thumbnail: "",
      });
      setEditThumbnailFile(null);
      setEditThumbnailPreview(null);
      toast({
        title: "Content updated successfully",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update content",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  // Fetch content with tags for the current user
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    setLoading(true);
    const fetchAndListen = async () => {
      const user = auth.currentUser;
      if (!user) {
        setContent([]);
        setLoading(false);
        return;
      }
      // Listen for real-time updates
      const contentRef = collection(db, "users", user.uid, "content");
      const q = query(contentRef, orderBy("created_at", "desc"));
      unsubscribe = onSnapshot(q, async (snapshot) => {
        const items: Content[] = [];
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          // Fetch tags for this content
          let tags: { name: string; color: string }[] = [];
          if (data.tagIds && Array.isArray(data.tagIds)) {
            tags = [];
            for (const tagId of data.tagIds) {
              const tagSnap = await getDocs(
                query(
                  collection(db, "users", user.uid, "tags"),
                  where("__name__", "==", tagId)
                )
              );
              tagSnap.forEach((tagDoc) => {
                tags.push({
                  name: tagDoc.data().name,
                  color: tagDoc.data().color,
                });
              });
            }
          }
          items.push({
            id: docSnap.id,
            title: data.title,
            type: data.type,
            source_url: data.source_url,
            description: data.description,
            created_at: data.created_at,
            tags,
            thumbnail: data.thumbnail,
          });
        }
        setContent(items);
        setLoading(false);
      });
    };
    fetchAndListen();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Handle thumbnail file selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Create new content
  const createContent = async () => {
    try {
      if (!contentData.title.trim()) {
        toast({
          variant: "destructive",
          title: "Title is required",
        });
        return;
      }
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You are not authenticated. Please sign in again.",
          variant: "destructive",
        });
        return;
      }
      // Handle tags: create new tags if necessary and get their IDs
      const tagIds: string[] = [];
      for (const tagName of contentData.tags) {
        // Check if tag exists
        const tagQuery = query(
          collection(db, "users", user.uid, "tags"),
          where("name", "==", tagName)
        );
        const tagSnap = await getDocs(tagQuery);
        let tagId = "";
        if (tagSnap.empty) {
          // Create new tag
          const newTagRef = await addDoc(
            collection(db, "users", user.uid, "tags"),
            {
              name: tagName,
              color: "blue", // Or let user pick color
            }
          );
          tagId = newTagRef.id;
        } else {
          tagId = tagSnap.docs[0].id;
        }
        tagIds.push(tagId);
      }

      // Handle thumbnail upload
      let thumbnailUrl = "/placeholder.svg";
      if (thumbnailFile) {
        const storageRef = ref(
          storage,
          `users/${user.uid}/thumbnails/${Date.now()}_${thumbnailFile.name}`
        );
        await uploadBytes(storageRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(storageRef);
      }

      // Add content document
      await addDoc(collection(db, "users", user.uid, "content"), {
        title: contentData.title.trim(),
        type: contentData.type,
        source_url: contentData.source_url.trim() || null,
        description: contentData.description.trim() || null,
        created_at: new Date().toISOString(),
        tagIds,
        thumbnail: thumbnailUrl,
      });
      toast({
        title: "Content added successfully",
        variant: "default",
      });
      setIsCreateDialogOpen(false);
      setContentData({
        title: "",
        type: "article",
        source_url: "",
        description: "",
        tags: [],
      });
      setThumbnailFile(null);
      setThumbnailPreview(null);
    } catch (error: any) {
      console.error("Error creating content:", error);
      toast({
        variant: "destructive",
        title: "Failed to add content",
        description: error.message,
      });
    }
  };

  // Delete content
  const deleteContent = async (contentId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You are not authenticated. Please sign in again.",
          variant: "destructive",
        });
        return;
      }
      await deleteDoc(doc(db, "users", user.uid, "content", contentId));
      toast({
        title: "Content deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  // Filtering and sorting
  const filteredContent = content.filter((item) => {
    const matchesSearch = (item?.title ?? "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const sortedContent = [...filteredContent].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return (a?.title ?? "").localeCompare(b?.title ?? "");
      case "type":
        return (a?.type ?? "").localeCompare(b?.type ?? "");
      case "created_at":
      default:
        return (
          new Date(b?.created_at ?? "").getTime() -
          new Date(a?.created_at ?? "").getTime()
        );
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "webpage":
        return <Link className="h-4 w-4" />;
      case "pdf":
        return <Upload className="h-4 w-4" />;
      case "note":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getColorClass = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      purple:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      yellow:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      green:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      orange:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      const weeks = Math.floor(diffInHours / 168);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    }
  };

  const getSourceName = (url: string) => {
    if (!url) return "Unknown";
    try {
      const domain = new URL(url).hostname;
      if (domain.includes("youtube.com") || domain.includes("youtu.be"))
        return "YouTube";
      if (domain.includes("medium.com")) return "Medium";
      if (domain.includes("github.com")) return "GitHub";
      if (domain.includes("stackoverflow.com")) return "Stack Overflow";
      return domain.replace("www.", "");
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recent Content</h1>
          <p className="text-muted-foreground">
            Manage and organize your saved content
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Content</DialogTitle>
              <DialogDescription>
                Save articles, videos, and other content for later reference
              </DialogDescription>
            </DialogHeader>
            {/* SCROLLABLE AREA START */}
            <div className="overflow-y-auto max-h-[70vh] space-y-4 px-5">
              {/* ...all your form fields... */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={contentData.title}
                  onChange={(e) =>
                    setContentData({ ...contentData, title: e.target.value })
                  }
                  placeholder="Enter content title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Content Type</Label>
                <Select
                  value={contentData.type}
                  onValueChange={(value) =>
                    setContentData({ ...contentData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Article
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video
                      </div>
                    </SelectItem>
                    <SelectItem value="webpage">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        Webpage
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        PDF
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Other
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source_url">Source URL</Label>
                <Input
                  id="source_url"
                  type="url"
                  value={contentData.source_url}
                  onChange={(e) =>
                    setContentData({
                      ...contentData,
                      source_url: e.target.value,
                    })
                  }
                  placeholder="https://example.com/article"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={contentData.description}
                  onChange={(e) =>
                    setContentData({
                      ...contentData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description or notes"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <TagSelector
                  selectedTags={contentData.tags}
                  onTagsChange={(tags) =>
                    setContentData({ ...contentData, tags })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
                {thumbnailPreview && (
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-32 object-cover rounded-md mt-2"
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  Upload, drop, or paste an image for the content thumbnail. If
                  not provided, a placeholder will be used.
                </p>
              </div>
            </div>
            {/* SCROLLABLE AREA END */}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createContent}
                disabled={!contentData.title.trim()}
              >
                Add Content
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Content</DialogTitle>
              <DialogDescription>
                Update your saved content details
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[70vh] space-y-4 pr-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editContentData.title}
                  onChange={(e) =>
                    setEditContentData({
                      ...editContentData,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter content title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Content Type</Label>
                <Select
                  value={editContentData.type}
                  onValueChange={(value) =>
                    setEditContentData({ ...editContentData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="webpage">Webpage</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-source_url">Source URL</Label>
                <Input
                  id="edit-source_url"
                  type="url"
                  value={editContentData.source_url}
                  onChange={(e) =>
                    setEditContentData({
                      ...editContentData,
                      source_url: e.target.value,
                    })
                  }
                  placeholder="https://example.com/article"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editContentData.description}
                  onChange={(e) =>
                    setEditContentData({
                      ...editContentData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description or notes"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <TagSelector
                  selectedTags={editContentData.tags}
                  onTagsChange={(tags) =>
                    setEditContentData({ ...editContentData, tags })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-thumbnail">Thumbnail</Label>
                <Input
                  id="edit-thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditThumbnailFile(file);
                      setEditThumbnailPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {editThumbnailPreview && (
                  <Image
                    src={editThumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-32 object-cover rounded-md mt-2"
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  Upload, drop, or paste an image for the content thumbnail. If
                  not provided, a placeholder will be used.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await updateContent();
                }}
                disabled={!editContentData.title.trim()}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
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
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="webpage">Webpages</SelectItem>
            <SelectItem value="pdf">PDFs</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Recent</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="type">Type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))
        ) : sortedContent.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No content found</p>
            <p className="text-muted-foreground">
              Start by adding some content to your collection
            </p>
          </div>
        ) : (
          sortedContent.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={item.thumbnail || "/placeholder.svg"}
                  alt={item.title ?? ""}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-black/80 text-white">
                    {getTypeIcon(item.type ?? "")}
                    <span className="ml-1 capitalize">{item.type}</span>
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-black/80 text-white"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditContentId(item.id);
                          setEditContentData({
                            title: item.title,
                            type: item.type,
                            source_url: item.source_url || "",
                            description: item.description || "",
                            tags: item.tags.map((tag) => tag.name),
                            thumbnail: item.thumbnail || "",
                          });
                          setEditThumbnailPreview(item.thumbnail || "");
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteContent(item.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Saved {formatTimeAgo(item.created_at ?? "")}</span>
                    <span>•</span>
                    <span>{getSourceName(item.source_url ?? "")}</span>
                  </div>
                </div>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={`text-xs ${getColorClass(tag.color)}`}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Note
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      Flashcard
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                    >
                      <Bell className="h-4 w-4 mr-1" />
                      Remind
                    </Button>
                    {item.source_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        title="Open source link"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.source_url, "_blank");
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
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
