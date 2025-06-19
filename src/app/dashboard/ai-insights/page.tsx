"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Brain, Copy, Bookmark } from "lucide-react";
import { auth } from "@/lib/firebaseClient"; // Make sure you have access to user
import { InsightsPanel } from "./components/InsightsPanel";
import { useEffect, useState } from "react";
import { cacheUserData } from "@/lib/cacheUserData";

const suggestedPrompts = [
  "Summarize my latest articles",
  "What should I review today?",
  "Show trends in my tagging",
  "Suggest study schedule",
  "Find related content",
  "Analyze my productivity patterns",
];

export default function Page() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);

    const user = auth.currentUser;
    const userId = user?.uid;

    const newUserMessage = {
      id: Date.now(),
      type: "user" as const,
      message,
      timestamp: "Just now",
    };
    setConversation((prev) => [...prev, newUserMessage]);
    setMessage("");

    // Call your API route
    const res = await fetch("/api/groq-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: [...conversation, newUserMessage],
        userId,
      }),
    });

    const data = await res.json();
    setConversation((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        type: "ai" as const,
        message: data.aiMessage,
        timestamp: "Just now",
      },
    ]);
    setLoading(false);
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) cacheUserData();
    });
    return () => unsub();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground">
            Chat with AI about your content and get personalized insights
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <div className="h-[600px] flex flex-col border rounded-lg bg-card">
            <div className="p-4 border-b">
              <span className="flex items-center gap-2 font-bold text-lg">
                <Brain className="h-5 w-5" />
                AI Assistant
              </span>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.type === "ai" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Brain className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] space-y-2 ${
                        msg.type === "user" ? "order-first" : ""
                      }`}
                    >
                      <div
                        className={`rounded-lg p-3 ${
                          msg.type === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">
                          {msg.message}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{msg.timestamp}</span>
                        {msg.type === "ai" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                            >
                              <Bookmark className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {msg.type === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Brain className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[80%] rounded-lg p-3 bg-muted animate-pulse">
                      <div className="whitespace-pre-wrap text-sm">
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t space-y-3">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about your content, study patterns, or get recommendations..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                  disabled={loading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || loading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromptClick(prompt)}
                    className="text-xs"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <InsightsPanel />
      </div>
    </div>
  );
}
