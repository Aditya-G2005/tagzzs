"use client";

import {
  CalendarDays,
  Search,
  Bell,
  Settings,
  BookOpen,
  Tag,
  Clock,
  Brain,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { MetricCard } from "./components/MetricCard";
import { CalendarWidget } from "./components/CalendarWidget";
import { ContentFeed } from "./components/ContentFeed";
import { AIInsights } from "./components/AIInsights";
import { RecentActivity } from "./components/RecentActivity";
import { QuickActions } from "./components/QuickAction";
import { RemindersPanel } from "./components/RemindersPanel";
import { TagsPanel } from "./components/TagsPanel";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";

export default function Page() {
  const [profile, setProfile] = useState<{
    fullname?: string;
    email?: string;
    bio?: string;
  }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        setProfile({});
        return;
      }
      const userId = user.uid;
      try {
        const profileRef = doc(db, "users", userId);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(
            profileSnap.data() as {
              fullname?: string;
              email?: string;
              bio?: string;
            }
          );
        } else {
          setProfile({});
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfile({});
      }
    };

    // Listen for auth state changes and fetch profile
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchProfile();
    });

    // Fetch on mount
    fetchProfile();

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex md:hidden   items-center gap-2">
              <Tag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Tagzs</span>
            </div>
            <div className="hidden md:block text-sm text-muted-foreground">
              {(() => {
                const hour = new Date().getHours();
                if (hour >= 5 && hour < 12) return `Good morning, ${profile.fullname || profile.email || "User"}`;
                if (hour >= 12 && hour < 16) return `Good afternoon, ${profile.fullname || profile.email || "User"}`;
                return `Good evening, ${profile.fullname || profile.email || "User"}`;
              })()}
            </div>
          </div>

          {/* Global Search */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tags, notes, reminders..."
                className="pl-10 pr-4"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <ModeToggle />
            <Link href={"/auth/settings"} className="block md:hidden">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile.fullname || profile.email || "User"}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s what&apos;s happening with your digital organization
            today.
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard title="Total Tags" icon={<Tag className="h-4 w-4" />} />
          <MetricCard
            title="Flashcards"
            icon={<BookOpen className="h-4 w-4" />}
          />
          <MetricCard title="Notes" icon={<Activity className="h-4 w-4" />} />
          <MetricCard title="Reminders" icon={<Clock className="h-4 w-4" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Calendar Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Activity Calendar
                </CardTitle>
                <CardDescription>
                  Track your daily progress and upcoming reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarWidget />
              </CardContent>
            </Card>

            {/* Recent Content Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Content</CardTitle>
                <CardDescription>
                  Your latest saved articles, videos, and notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentFeed />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <QuickActions />

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AIInsights />
              </CardContent>
            </Card>

            {/* Upcoming Reminders */}
            <RemindersPanel />

            {/* Recent Tags */}
            <TagsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
