"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
}

export function MetricCard({ title, icon }: MetricCardProps) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    let collectionName = "";
    switch (title.toLowerCase()) {
      case "total tags":
        collectionName = "tags";
        break;
      case "flashcards":
        collectionName = "flashcards";
        break;
      case "notes":
        collectionName = "notes";
        break;
      case "reminders":
        collectionName = "reminders";
        break;
      default:
        collectionName = "";
    }

    if (!collectionName) return;

    const colRef = collection(db, "users", user.uid, collectionName);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      setCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [title]);

  const getTrendIcon = () => {
    // For simplicity, no trend calculation, show neutral icon
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {getTrendIcon()}
          {/* No trend text for now */}
        </div>
      </CardContent>
    </Card>
  );
}
