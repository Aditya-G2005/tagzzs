"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, Plus, X } from "lucide-react";
import { auth, db } from "@/lib/firebaseClient";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const TAG_COLORS = ["blue", "green", "red", "yellow", "purple", "orange"];

interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface TagSelectorProps {
  selectedTags: string[]; // array of tag IDs
  onTagsChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState({
    name: "",
    color: "blue",
    description: "",
  });

  // Fetch user's tags in real time
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
        })) as Tag[]
      );
    });
    return () => unsubscribe();
  }, []);

  const handleTagSelect = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      onTagsChange([...selectedTags, tagId]);
    }
    setOpen(false);
  };

  const handleTagRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tagId));
  };

  const handleCreateTag = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (
      !newTag.name.trim() ||
      tags.some(
        (tag) => tag.name.toLowerCase() === newTag.name.trim().toLowerCase()
      )
    )
      return;

    const docRef = await addDoc(collection(db, "users", user.uid, "tags"), {
      name: newTag.name.trim(),
      color: newTag.color,
      description: newTag.description.trim(),
    });
    setNewTag({ name: "", color: "blue", description: "" });
    onTagsChange([...selectedTags, docRef.id]);
    setOpen(false);
  };

  const filteredTags = tags.filter((tag) => !selectedTags.includes(tag.id));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTags
          .map((tagId) => tags.find((t) => t.id === tagId))
          .filter(Boolean)
          .map((tag) => (
            <Badge
              key={tag!.id}
              variant="secondary"
              className="gap-1"
              style={{ backgroundColor: tag!.color, color: "#fff" }}
            >
              {tag!.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleTagRemove(tag!.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>
                  <div className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      No tags found.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Input
                        placeholder="Tag name"
                        value={newTag.name}
                        onChange={(e) =>
                          setNewTag((t) => ({ ...t, name: e.target.value }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleCreateTag()
                        }
                      />
                      <div className="flex gap-2">
                        <select
                          value={newTag.color}
                          onChange={(e) =>
                            setNewTag((t) => ({
                              ...t,
                              color: e.target.value,
                            }))
                          }
                          className="border rounded px-2 py-1"
                        >
                          {TAG_COLORS.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                        <Input
                          placeholder="Description (optional)"
                          value={newTag.description}
                          onChange={(e) =>
                            setNewTag((t) => ({
                              ...t,
                              description: e.target.value,
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          onClick={handleCreateTag}
                          disabled={!newTag.name.trim()}
                        >
                          Create
                        </Button>
                      </div>
                    </div>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {filteredTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleTagSelect(tag.id)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          selectedTags.includes(tag.id)
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
