"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function AccountSettingsForm({
  email = "",
  initialFullname = "",
  initialBio = "",
}: {
  email?: string;
  initialFullname?: string;
  initialBio?: string;
}) {
  const [fullname, setFullname] = useState(initialFullname);
  const [bio, setBio] = useState(initialBio);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  // Fetch current user and profile if not provided
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        toast({
          title: "Authentication Error",
          description: "You are not authenticated. Please sign in again.",
          variant: "destructive",
        });
        setUser(null);
        return;
      }
      setUser(firebaseUser);

      // Fetch profile data if not provided as props
      if (!initialFullname || !initialBio) {
        try {
          const profileRef = doc(db, "users", firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            setFullname(data.fullname || "");
            setBio(data.bio || "");
          }
        } catch (err: any) {
          toast({
            title: "Error fetching profile",
            description: err.message,
            variant: "destructive",
          });
        }
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You are not authenticated. Please sign in again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const profileRef = doc(db, "users", user.uid);
      await updateDoc(profileRef, { fullname, bio });
      toast({
        title: "Profile Updated",
        description: "Your account details have been saved.",
        variant: "default",
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-background text-foreground p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground mt-2">
          Update your account settings. You can change your name and bio.
        </p>
        <hr className="my-6 border-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* Avatar and Email */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-16 w-16 rounded-lg">
              <AvatarFallback className="rounded-lg">U</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <Label htmlFor="email" className="block text-base font-medium mb-1">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={user?.email || email}
              readOnly
              disabled
              className="w-full opacity-60 cursor-not-allowed"
            />
            <p className="text-muted-foreground text-sm mt-1">
              Your email address cannot be changed.
            </p>
          </div>
        </div>
        {/* Name */}
        <div>
          <Label
            htmlFor="fullname"
            className="block text-base font-medium mb-1"
          >
            Name
          </Label>
          <Input
            id="fullname"
            name="fullname"
            type="text"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Your name"
            className="w-full"
          />
          <p className="text-muted-foreground text-sm mt-1">
            This is the name that will be displayed on your profile and in
            emails.
          </p>
        </div>
        {/* Bio */}
        <div>
          <Label htmlFor="bio" className="block text-base font-medium mb-1">
            Bio
          </Label>
          <Textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full"
            placeholder="Tell us something about yourself"
          />
        </div>
        {/* Update Button */}
        <Button type="submit" className="mt-4" disabled={loading}>
          {loading ? "Updating..." : "Update account"}
        </Button>
      </form>
    </main>
  );
}
