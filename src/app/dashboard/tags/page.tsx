"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Tag,
  FileText,
  Video,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
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
} from "firebase/firestore";

const TAG_COLORS = ["blue", "purple", "pink", "yellow", "green", "orange"];

interface TagType {
  id: string;
  name: string;
  color: string;
  count: number;
  description?: string;
}

const mockContent = [
  {
    id: 1,
    title: "The Future of Digital Organization",
    type: "Article",
    thumbnail: "/placeholder.svg?height=120&width=200",
    date: "2 hours ago",
    source: "Medium",
  },
  {
    id: 2,
    title: "Building Better Habits",
    type: "Video",
    thumbnail: "/placeholder.svg?height=120&width=200",
    date: "1 day ago",
    source: "YouTube",
  },
  {
    id: 3,
    title: "Meeting Notes: Q1 Planning",
    type: "Note",
    thumbnail: "/placeholder.svg?height=120&width=200",
    date: "3 days ago",
    source: "Personal",
  },
];

export default function Page() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState({
    name: "",
    color: "blue",
    description: "",
  });
  const [editTag, setEditTag] = useState<TagType | null>(null);

  // Fetch tags in real time from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const tagsRef = collection(db, "users", user.uid, "tags");
    const q = query(tagsRef, orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTags(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TagType[]
      );
    });
    return () => unsubscribe();
  }, []);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTags = [...filteredTags].sort((a, b) => {
    switch (sortBy) {
      case "count":
        return (b.count ?? 0) - (a.count ?? 0);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Article":
        return <FileText className="h-4 w-4" />;
      case "Video":
        return <Video className="h-4 w-4" />;
      case "Note":
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

  // Create Tag
  // Calculate tag usage count on the client side
  const handleCreateTag = async () => {
    const user = auth.currentUser;
    if (!user || !newTag.name.trim()) return;
    await addDoc(collection(db, "users", user.uid, "tags"), {
      name: newTag.name.trim(),
      color: newTag.color,
      description: newTag.description.trim(),
      // Don't store count in Firestore, will calculate on client
    });
    setNewTag({ name: "", color: "blue", description: "" });
    setIsCreateDialogOpen(false);
  };

  // Example: Calculate tag count from your content (replace mockContent with your real data)
  const getTagCount = (tagName: string) => {
    // Replace mockContent with your actual content array
    // and adjust logic if tags are stored differently
    // Example: Count how many mockContent items have the tag in their title (replace with your real tag logic)
    return mockContent.filter((item) =>
      item.title?.toLowerCase().includes(tagName.toLowerCase())
    ).length;
  };

  // Edit Tag
  const handleEditTag = async () => {
    const user = auth.currentUser;
    if (!user || !editTag) return;
    await updateDoc(doc(db, "users", user.uid, "tags", editTag.id), {
      name: editTag.name,
      color: editTag.color,
      description: editTag.description,
    });
    setEditTag(null);
    setIsEditDialogOpen(false);
  };

  // Delete Tag
  const handleDeleteTag = async (tagId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "tags", tagId));
    setSelectedTag(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">
            Organize and manage your content tags
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
              <DialogDescription>
                Add a new tag to organize your content
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tagName">Tag Name</Label>
                <Input
                  id="tagName"
                  value={newTag.name}
                  onChange={(e) =>
                    setNewTag({ ...newTag, name: e.target.value })
                  }
                  placeholder="Enter tag name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagColor">Color</Label>
                <Select
                  value={newTag.color}
                  onValueChange={(value) =>
                    setNewTag({ ...newTag, color: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagDescription">Description</Label>
                <Input
                  id="tagDescription"
                  value={newTag.description}
                  onChange={(e) =>
                    setNewTag({ ...newTag, description: e.target.value })
                  }
                  placeholder="Optional description"
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
              <Button onClick={handleCreateTag}>Create Tag</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!selectedTag ? (
        <>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="count">Usage Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Tags Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedTags.map((tag) => {
              const tagCount = getTagCount(tag.name);
              return (
                <Card
                  key={tag.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTag(tag)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getColorClass(tag.color)}>
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTag(tag);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              handleDeleteTag(tag.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{tag.description}</CardDescription>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      Popular this week
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        /* Tag Detail View */
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedTag(null)}>
              ← Back to Tags
            </Button>
            <Badge className={getColorClass(selectedTag.color)}>
              <Tag className="h-3 w-3 mr-1" />
              {selectedTag.name}
            </Badge>
            <span className="text-muted-foreground">
              {selectedTag.count} items
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Content with &quot;{selectedTag.name}&quot; tag
              </CardTitle>
              <CardDescription>{selectedTag.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockContent.map((item) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <Image
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary">
                            {getTypeIcon(item.type)}
                            <span className="ml-1">{item.type}</span>
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.source}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {item.date}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Tag Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          {editTag && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTagName">Tag Name</Label>
                <Input
                  id="editTagName"
                  value={editTag.name}
                  onChange={(e) =>
                    setEditTag({ ...editTag, name: e.target.value })
                  }
                  placeholder="Enter tag name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTagColor">Color</Label>
                <Select
                  value={editTag.color}
                  onValueChange={(value) =>
                    setEditTag({ ...editTag, color: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTagDescription">Description</Label>
                <Input
                  id="editTagDescription"
                  value={editTag.description}
                  onChange={(e) =>
                    setEditTag({ ...editTag, description: e.target.value })
                  }
                  placeholder="Optional description"
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
            <Button onClick={handleEditTag}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
