"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import people from "@/../data/people.json";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authLoaded, setAuthLoaded] = useState(false);

  // Set persistence ONCE on mount
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error("[setPersistence] error:", err);
    });
  }, []);

  // Listen for auth state changes, handle redirect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoaded(true);
      console.log("[onAuthStateChanged] user:", user);
      if (user) {
        try {
          const profileRef = doc(db, "users", user.uid);
          const profileSnap = await getDoc(profileRef);
          if (!profileSnap.exists()) {
            console.log(
              "[onAuthStateChanged] Profile not found, redirecting to user-details"
            );
            router.replace("/auth/signup/user-details");
          } else {
            console.log(
              "[onAuthStateChanged] Profile found, redirecting to dashboard"
            );
            router.replace("/dashboard");
          }
        } catch (e) {
          console.error("[onAuthStateChanged] Firestore error:", e);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Persistence is now set on mount, not here!
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("[handleSignin] userCredential:", userCredential);
      // Do NOT redirect here; let onAuthStateChanged handle it
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("[handleSignin] error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Wait for Firebase Auth to initialize before rendering
  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <div className="text-xl">Loading authentication...</div>
      </div>
    );
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
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your Tagzs account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSignin}>
          <div className="space-y-4">
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
                  autoComplete="email"
                  required
                  className="pl-3 w-full bg-input border border-border text-foreground"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-3 w-full pr-10 bg-input border border-border text-foreground"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Signing in..." : "Sign in"}
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
              Join with multiple users
            </span>
          </div>
        </div>

        {/* Social Login Users */}
        <div className="flex flex-row items-center justify-center w-full">
          <AnimatedTooltip items={people} />
        </div>

        {/* Sign Up Prompt */}
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a
            href="/auth/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
