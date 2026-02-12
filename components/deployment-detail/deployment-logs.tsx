import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LogEvent {
  id: string;
  text?: string;
  type: string;
  date: number;
}

export function DeploymentLogs({ events }: { events: LogEvent[] }) {
  const logEvents = events.filter(
    (e) => e.text && e.type !== "delimiter" && e.type !== "deployment-state"
  );

  if (logEvents.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        No build logs available.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Build Logs</h2>
      <ScrollArea className="h-[500px] rounded-md border bg-muted/30 p-4">
        <pre className="font-mono text-xs leading-relaxed">
          {logEvents.map((event) => (
            <div
              key={event.id}
              className={cn(
                event.type === "stderr" && "text-destructive",
                event.type === "command" && "text-primary font-semibold",
              )}
            >
              {event.text}
            </div>
          ))}
        </pre>
      </ScrollArea>
    </div>
  );
}
