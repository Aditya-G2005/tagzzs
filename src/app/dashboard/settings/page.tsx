"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import AccountSettingsForm from "./components/AccountSettingsForm";

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ fullname?: string; bio?: string }>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile({});
        setLoading(false);
        return;
      }
      setUser(firebaseUser);
      try {
        const profileRef = doc(db, "users", firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile({
            fullname: profileSnap.data().fullname || "",
            bio: profileSnap.data().bio || "",
          });
        } else {
          setProfile({});
        }
      } catch (err) {
        setProfile({});
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center mt-10">You must be logged in.</div>;
  }

  return (
    <div className="flex w-full bg-background">
      <div className="w-full p-8 rounded-lg bg-card text-card-foreground shadow-lg border border-border">
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          Account Settings
        </h2>
        <AccountSettingsForm
          email={user.email}
          initialFullname={profile.fullname || ""}
          initialBio={profile.bio || ""}
        />
      </div>
    </div>
  );
}
