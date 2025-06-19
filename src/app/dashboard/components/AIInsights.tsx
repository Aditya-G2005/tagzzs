import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Clock, Lightbulb } from "lucide-react";

export function AIInsights() {
  const insights = [
    {
      type: "trend",
      title: "Productivity Peak",
      description: "You're most productive between 9-11 AM",
      icon: <TrendingUp className="h-4 w-4" />,
      action: "Schedule important tasks",
    },
    {
      type: "goal",
      title: "Weekly Goal Progress",
      description: "You're 80% towards your weekly tagging goal",
      icon: <Target className="h-4 w-4" />,
      progress: 80,
    },
    {
      type: "reminder",
      title: "Overdue Review",
      description: "3 flashcards need review",
      icon: <Clock className="h-4 w-4" />,
      action: "Review now",
    },
    {
      type: "suggestion",
      title: "Tag Suggestion",
      description: "Consider creating a 'machine-learning' tag",
      icon: <Lightbulb className="h-4 w-4" />,
      action: "Create tag",
    },
  ];

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-primary">{insight.icon}</div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-medium">{insight.title}</h4>
              <p className="text-xs text-muted-foreground">
                {insight.description}
              </p>

              {insight.progress && (
                <div className="space-y-1">
                  <Progress value={insight.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {insight.progress}% complete
                  </p>
                </div>
              )}

              {insight.action && (
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  {insight.action}
                </Button>
              )}
            </div>
          </div>
          {index < insights.length - 1 && <div className="border-b" />}
        </div>
      ))}
    </div>
  );
}
