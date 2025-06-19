"use client";

import { Tag } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export function LoadingSpinner({
  message = "Organizing your workspace...",
  showProgress = false,
  progress = 0,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      {/* Animated Logo */}
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary">
          <div className="absolute inset-0 flex items-center justify-center">
            <Tag className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Loading Message */}
      <div className="text-center space-y-2">
        <p className="text-sm font-medium">{message}</p>
        {showProgress && (
          <div className="w-48 space-y-1">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {progress}% complete
            </p>
          </div>
        )}
      </div>

      {/* Floating Dots Animation */}
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
}
