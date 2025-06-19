import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

export function TestimonialCard({ quote, author, role }: TestimonialCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-1">
        <Quote className="h-6 w-6 text-primary/40 mb-2" />
        <p className="italic">{quote}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <div className="font-medium">{author}</div>
        <div className="text-sm text-muted-foreground">{role}</div>
      </CardFooter>
    </Card>
  );
}
