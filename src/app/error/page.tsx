import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Home, Search, HelpCircle, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <div className="text-4xl font-bold text-muted-foreground">404</div>
          </div>
          <CardTitle className="text-3xl">
            Oops! This page slipped into the void.
          </CardTitle>
          <CardDescription className="text-lg">
            Even the best-organized systems hiccup sometimes! The page you&apos;re
            looking for seems to have wandered off.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Search for what you need:
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search content, tags, notes..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Navigation Options */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild className="h-auto p-4 justify-start">
              <Link href="/dashboard">
                <Home className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Return to Dashboard</div>
                  <div className="text-xs opacity-80">
                    Go back to your workspace
                  </div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto p-4 justify-start"
            >
              <Link href="/app">
                <ArrowLeft className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Explore Features</div>
                  <div className="text-xs opacity-80">
                    Discover what Tagzs can do
                  </div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto p-4 justify-start"
            >
              <Link href="/help">
                <HelpCircle className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Help Center</div>
                  <div className="text-xs opacity-80">
                    Find answers and guides
                  </div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto p-4 justify-start"
            >
              <Link href="/contact">
                <Mail className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Contact Support</div>
                  <div className="text-xs opacity-80">
                    Get help from our team
                  </div>
                </div>
              </Link>
            </Button>
          </div>

          {/* Floating Animation */}
          <div className="flex justify-center pt-4">
            <div className="animate-bounce">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
