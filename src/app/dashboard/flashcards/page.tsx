"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  RotateCcw,
  Check,
  X,
  Edit,
  Trash2,
  Play,
} from "lucide-react";
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

type Flashcard = {
  id: string;
  front: string;
  back: string;
  tags: string[];
  status: "due" | "learned";
  lastReviewed: string;
  difficulty: "easy" | "medium" | "hard";
};

export default function Page() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editCard, setEditCard] = useState<Flashcard | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [newCard, setNewCard] = useState({
    front: "",
    back: "",
    tags: [] as string[],
    difficulty: "medium" as "easy" | "medium" | "hard",
  });

  // Real-time fetch for flashcards
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const cardsRef = collection(db, "users", user.uid, "flashcards");
    const q = query(cardsRef, orderBy("lastReviewed", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFlashcards(
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              status: "due",
              difficulty: "medium",
              ...doc.data(),
            } as Flashcard)
        )
      );
    });
    return () => unsubscribe();
  }, []);

  // Filtering logic
  const filteredCards = flashcards.filter((card) => {
    const matchesSearch =
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || card.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const dueCards = flashcards.filter((card) => card.status === "due");
  const currentCard = dueCards[currentCardIndex];

  // Create flashcard
  const handleCreateFlashcard = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!newCard.front.trim() || !newCard.back.trim()) return;
    await addDoc(collection(db, "users", user.uid, "flashcards"), {
      front: newCard.front.trim(),
      back: newCard.back.trim(),
      tags: newCard.tags,
      status: "due",
      lastReviewed: new Date().toISOString(),
      difficulty: newCard.difficulty,
    });
    setIsCreateDialogOpen(false);
    setNewCard({ front: "", back: "", tags: [], difficulty: "medium" });
  };

  // Edit flashcard
  const handleEditFlashcard = async () => {
    const user = auth.currentUser;
    if (!user || !editCard) return;
    await updateDoc(doc(db, "users", user.uid, "flashcards", editCard.id), {
      front: editCard.front,
      back: editCard.back,
      tags: editCard.tags,
      difficulty: editCard.difficulty,
    });
    setIsEditDialogOpen(false);
    setEditCard(null);
  };

  // Delete flashcard
  const handleDeleteFlashcard = async (cardId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "flashcards", cardId));
  };

  // Review logic
  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) =>
      dueCards.length > 0 ? (prev + 1) % dueCards.length : 0
    );
  };

  const handleCardResponse = async (known: boolean) => {
    // Simple spaced repetition logic: mark as learned if known, else keep as due
    const user = auth.currentUser;
    if (!user || !currentCard) return;
    await updateDoc(doc(db, "users", user.uid, "flashcards", currentCard.id), {
      status: known ? "learned" : "due",
      lastReviewed: new Date().toISOString(),
    });
    handleNextCard();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "due":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "learned":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Review mode UI
  if (isReviewMode && dueCards.length > 0 && currentCard) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setIsReviewMode(false)}>
            ← Exit Review
          </Button>
          <div className="text-sm text-muted-foreground">
            {currentCardIndex + 1} of {dueCards.length}
          </div>
        </div>

        <Progress
          value={((currentCardIndex + 1) / dueCards.length) * 100}
          className="w-full"
        />

        <Card className="min-h-[400px]">
          <CardContent className="p-8">
            <div
              className="cursor-pointer h-full flex items-center justify-center text-center"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {!isFlipped ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-medium">{currentCard.front}</h2>
                  <p className="text-muted-foreground">
                    Click to reveal answer
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg text-muted-foreground">
                    {currentCard.front}
                  </h3>
                  <div className="border-t pt-4">
                    <p className="text-xl">{currentCard.back}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isFlipped && (
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleCardResponse(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Don&apos;t Know
            </Button>
            <Button size="lg" onClick={() => handleCardResponse(true)}>
              <Check className="h-4 w-4 mr-2" />
              Know It
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          {currentCard.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  // Empty state for review mode
  if (isReviewMode && dueCards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        <Button variant="outline" onClick={() => setIsReviewMode(false)}>
          ← Exit Review
        </Button>
        <div className="text-lg text-muted-foreground py-10">
          No cards are due for review.
        </div>
      </div>
    );
  }

  // Main Flashcards Grid UI
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
          <p className="text-muted-foreground">
            Create and review flashcards for spaced repetition learning
          </p>
        </div>
        <div className="flex gap-2">
          {dueCards.length > 0 && (
            <Button variant="outline" onClick={() => setIsReviewMode(true)}>
              <Play className="h-4 w-4 mr-2" />
              Review ({dueCards.length})
            </Button>
          )}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Flashcard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Flashcard</DialogTitle>
                <DialogDescription>
                  Add a new flashcard for spaced repetition learning
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="front">Front (Question/Prompt)</Label>
                  <Textarea
                    id="front"
                    value={newCard.front}
                    onChange={(e) =>
                      setNewCard({ ...newCard, front: e.target.value })
                    }
                    placeholder="Enter the question or prompt"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="back">Back (Answer)</Label>
                  <Textarea
                    id="back"
                    value={newCard.back}
                    onChange={(e) =>
                      setNewCard({ ...newCard, back: e.target.value })
                    }
                    placeholder="Enter the answer or explanation"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <TagSelector
                    selectedTags={newCard.tags}
                    onTagsChange={(tags) => setNewCard({ ...newCard, tags })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={newCard.difficulty}
                    onValueChange={(value) =>
                      setNewCard({
                        ...newCard,
                        difficulty: value as "easy" | "medium" | "hard",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateFlashcard}>
                  Create Flashcard
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flashcards.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dueCards.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Learned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {flashcards.filter((c) => c.status === "learned").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 Days</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search flashcards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cards</SelectItem>
            <SelectItem value="due">Due for Review</SelectItem>
            <SelectItem value="learned">Learned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Flashcards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCards.map((card) => (
          <Card key={card.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(card.status)}>
                  {card.status}
                </Badge>
                <Badge
                  className={getDifficultyColor(card.difficulty)}
                  variant="outline"
                >
                  {card.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-medium line-clamp-2">{card.front}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Last reviewed:{" "}
                  {card.lastReviewed
                    ? new Date(card.lastReviewed).toLocaleDateString()
                    : "Never"}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {card.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditCard(card);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCurrentCardIndex(
                      dueCards.findIndex((c) => c.id === card.id)
                    );
                    setIsReviewMode(true);
                  }}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteFlashcard(card.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Flashcard Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
            <DialogDescription>
              Update the question, answer, tags, or difficulty
            </DialogDescription>
          </DialogHeader>
          {editCard && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-front">Front (Question/Prompt)</Label>
                <Textarea
                  id="edit-front"
                  value={editCard.front}
                  onChange={(e) =>
                    setEditCard({ ...editCard, front: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-back">Back (Answer)</Label>
                <Textarea
                  id="edit-back"
                  value={editCard.back}
                  onChange={(e) =>
                    setEditCard({ ...editCard, back: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Edit Tags</Label>
                <TagSelector
                  selectedTags={editCard.tags}
                  onTagsChange={(tags) => setEditCard({ ...editCard, tags })}
                />
              </div>
              <div className="space-y-2">
                <Label>Edit Difficulty</Label>
                <Select
                  value={editCard.difficulty}
                  onValueChange={(value) =>
                    setEditCard({
                      ...editCard,
                      difficulty: value as "easy" | "medium" | "hard",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
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
            <Button onClick={handleEditFlashcard}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
