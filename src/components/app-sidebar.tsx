"use client";

import * as React from "react";
import {
  Bell,
  Bookmark,
  BotIcon,
  Layers,
  Library,
  LucideHome,
  NotebookPen,
  Settings2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { usePathname } from "next/navigation";

// Navigation items
const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: LucideHome },
  { title: "Add Content", url: "/dashboard/add-content", icon: Bookmark },
  { title: "Tags", url: "/dashboard/tags", icon: Library },
  { title: "Flashcards", url: "/dashboard/flashcards", icon: Layers },
  { title: "Notes", url: "/dashboard/notes", icon: NotebookPen },
  { title: "Reminders", url: "/dashboard/reminders", icon: Bell },
  { title: "AI Insights", url: "/dashboard/ai-insights", icon: BotIcon },
  { title: "Account", url: "/dashboard/settings", icon: Settings2 },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [profile, setProfile] = React.useState<{
    fullname?: string;
    email?: string;
    bio?: string;
  }>({});

  React.useEffect(() => {
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

  // Active tab highlighting
  const pathname = usePathname();
  const navItems = navMain.map((item) => ({
    ...item,
    isActive: pathname === item.url,
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: profile.fullname || profile.email || "User",
            email: profile.email || "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
