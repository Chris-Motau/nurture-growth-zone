import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-3 text-sm leading-7 text-foreground">
      {content.split("\n").map((line, index) => {
        const text = line.replace(/^#{1,3}\s+/, "");
        if (line.startsWith("### "))
          return (
            <h3 key={index} className="pt-2 font-display text-xl font-semibold">
              {text}
            </h3>
          );
        if (line.startsWith("## "))
          return (
            <h2 key={index} className="pt-2 font-display text-2xl font-bold">
              {text}
            </h2>
          );
        if (line.startsWith("- "))
          return (
            <p key={index} className="pl-5 before:mr-2 before:content-['•']">
              {text}
            </p>
          );
        if (line.startsWith("```")) return null;
        if (!line.trim()) return <div key={index} className="h-1" />;
        return <p key={index}>{text}</p>;
      })}
    </div>
  );
}

export function CompletionBar({ completed, total }: { completed: number; total: number }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <Progress value={percent} />
      <p className="text-sm text-muted-foreground">
        {completed} of {total} modules complete ({percent}%)
      </p>
    </div>
  );
}

