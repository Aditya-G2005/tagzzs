import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface HowItWorksStepProps {
  number: number;
  title: string;
  description: string;
}

export function HowItWorksStep({
  number,
  title,
  description,
}: HowItWorksStepProps) {
  return (
    <Card className="relative border-0 shadow-none">
      <CardHeader className="pb-2 pt-0">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold mb-4">
          {number}
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      {number < 4 && (
        <div className="hidden md:block absolute top-10 left-full w-8 h-[2px] bg-border -ml-4 -mr-4 transform -translate-x-1/2">
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-border rotate-45"></div>
        </div>
      )}
    </Card>
  );
}
