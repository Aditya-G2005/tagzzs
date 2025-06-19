"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { doc, setDoc } from "firebase/firestore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import people from "@/../data/people.json";

export default function UserDetailsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [fullname, setFullname] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/auth/signin");
      } else {
        setUser(user);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!user) throw new Error("No authenticated user");
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        fullname,
        bio,
        createdAt: new Date(),
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-10">You must be logged in.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-xl py-5 px-10 rounded-lg bg-card text-card-foreground shadow-lg space-y-8 border border-border">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">T</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Complete your profile
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us a bit more about yourself
          </p>
        </div>

        {/* User Details Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email (read-only) */}
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email address
              </Label>
              <div className="relative mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={user.email}
                  readOnly
                  disabled
                  className="pl-3 w-full bg-input border border-border text-foreground opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <Label
                htmlFor="fullname"
                className="block text-sm font-medium text-foreground"
              >
                Full Name
              </Label>
              <div className="relative mt-1">
                <Input
                  id="fullname"
                  name="fullname"
                  type="text"
                  required
                  className="pl-3 w-full bg-input border border-border text-foreground"
                  placeholder="Your full name"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label
                htmlFor="bio"
                className="block text-sm font-medium text-foreground"
              >
                Bio
              </Label>
              <div className="relative mt-1">
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  className="pl-3 w-full bg-input border border-border text-foreground rounded-md"
                  placeholder="Tell us something about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium transition-colors hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save details"}
            </button>
          </div>
        </form>

        {/* Social Login Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">
              Meet other Tagzs users
            </span>
          </div>
        </div>

        {/* Social Login Users */}
        <div className="flex flex-row items-center justify-center w-full">
          <AnimatedTooltip items={people} />
        </div>
      </div>
    </div>
  );
}
