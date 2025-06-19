"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Plus,
  Search,
  Edit,
  Trash2,
  Pin,
  FileText,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RichTextEditor } from "@/components/rich-text-editor";
import { TagSelector } from "@/components/tag-selector";
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

type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lastEdited: string;
  isPinned: boolean;
  wordCount: number;
};

export default function Page() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("lastEdited");
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: [] as string[],
  });

  // Real-time fetch for notes
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const notesRef = collection(db, "users", user.uid, "notes");
    const q = query(notesRef, orderBy("lastEdited", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Note)
        )
      );
    });
    return () => unsubscribe();
  }, []);

  // Create note
  const handleCreateNote = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    await addDoc(collection(db, "users", user.uid, "notes"), {
      title: newNote.title.trim(),
      content: newNote.content,
      tags: newNote.tags,
      lastEdited: new Date().toISOString(),
      isPinned: false,
      wordCount: newNote.content.split(/\s+/).length,
    });
    setIsCreateDialogOpen(false);
    setNewNote({ title: "", content: "", tags: [] });
  };

  // Edit note
  const handleEditNote = async () => {
    const user = auth.currentUser;
    if (!user || !editNote) return;
    await updateDoc(doc(db, "users", user.uid, "notes", editNote.id), {
      title: editNote.title,
      content: editNote.content,
      tags: editNote.tags,
      lastEdited: new Date().toISOString(),
      wordCount: editNote.content.split(/\s+/).length,
    });
    setIsEditDialogOpen(false);
    setEditNote(null);
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "notes", noteId));
    setSelectedNote(null);
  };

  // Pin/Unpin note
  const handlePinNote = async (note: Note) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "notes", note.id), {
      isPinned: !note.isPinned,
      lastEdited: new Date().toISOString(),
    });
  };

  // Filtering and sorting
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Pinned notes always come first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "lastEdited":
        return (
          new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()
        );
      default:
        return 0;
    }
  });

  // Note Detail View
  if (selectedNote) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedNote(null)}>
            ← Back to Notes
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePinNote(selectedNote)}
            >
              <Pin className="h-4 w-4 mr-2" />
              {selectedNote.isPinned ? "Unpin" : "Pin"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditNote(selectedNote);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteNote(selectedNote.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{selectedNote.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Last edited:{" "}
                    {new Date(selectedNote.lastEdited).toLocaleString()}
                  </span>
                  <span>{selectedNote.wordCount} words</span>
                </div>
              </div>
              {selectedNote.isPinned && (
                <Pin className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedNote.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p>{selectedNote.content}</p>
            </div>
          </CardContent>
        </Card>
        {/* Edit Note Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>Update your note and tags</DialogDescription>
            </DialogHeader>
            {editNote && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="editNoteTitle"
                    className="text-sm font-medium"
                  >
                    Title
                  </label>
                  <Input
                    id="editNoteTitle"
                    value={editNote.title}
                    onChange={(e) =>
                      setEditNote({ ...editNote, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <RichTextEditor
                    content={editNote.content}
                    onChange={(content) =>
                      setEditNote({ ...editNote, content })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <TagSelector
                    selectedTags={editNote.tags}
                    onTagsChange={(tags) => setEditNote({ ...editNote, tags })}
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
              <Button onClick={handleEditNote}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main Notes Grid UI
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            Create and organize your personal notes
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
              <DialogDescription>
                Write and organize your thoughts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="noteTitle" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="noteTitle"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  placeholder="Enter note title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <RichTextEditor
                  content={newNote.content}
                  onChange={(content) => setNewNote({ ...newNote, content })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <TagSelector
                  selectedTags={newNote.tags}
                  onTagsChange={(tags) => setNewNote({ ...newNote, tags })}
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
              <Button onClick={handleCreateNote}>Create Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
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
            <SelectItem value="lastEdited">Last Edited</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Notes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedNotes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No notes found</p>
            <p className="text-muted-foreground">
              Start by creating a note to organize your thoughts!
            </p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <Card
              key={note.id}
              className="cursor-pointer hover:shadow-md transition-shadow min-h-[220px] flex flex-col"
              onClick={() => setSelectedNote(note)}
            >
              <CardHeader className="pb-2 flex-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {note.isPinned && <Pin className="h-4 w-4 text-primary" />}
                  </div>
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
                          handlePinNote(note);
                        }}
                      >
                        <Pin className="h-4 w-4 mr-2" />
                        {note.isPinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditNote(note);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {note.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-[80px]">
                <div className="text-sm text-muted-foreground line-clamp-4 flex-1 break-words">
                  {/* If you use plain text notes: */}
                  {note.content?.replace(/<[^>]+>/g, "") || (
                    <span className="italic text-xs">No content</span>
                  )}
                  {/* If you use rich text and want to render HTML, use: */}
                  {/* <div dangerouslySetInnerHTML={{ __html: note.content || "<i>No content</i>" }} /> */}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{note.tags.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(note.lastEdited).toLocaleString()}
                  </div>
                  <span>{note.wordCount} words</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Note Dialog (for grid) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Update your note and tags</DialogDescription>
          </DialogHeader>
          {editNote && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="editNoteTitle" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="editNoteTitle"
                  value={editNote.title}
                  onChange={(e) =>
                    setEditNote({ ...editNote, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <RichTextEditor
                  content={editNote.content}
                  onChange={(content) => setEditNote({ ...editNote, content })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <TagSelector
                  selectedTags={editNote.tags}
                  onTagsChange={(tags) => setEditNote({ ...editNote, tags })}
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
            <Button onClick={handleEditNote}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
