"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SearchIcon } from "lucide-react";
import { setProjectAccessAction } from "@/lib/actions";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface MemberAccessDialogProps {
  userId: string;
  memberName: string;
  allProjects: Project[];
  currentProjectIds: string[] | null; // null = all projects
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (userId: string, projectIds: string[] | null) => void;
}

export function MemberAccessDialog({
  userId,
  memberName,
  allProjects,
  currentProjectIds,
  open,
  onOpenChange,
  onSaved,
}: MemberAccessDialogProps) {
  const [grantAll, setGrantAll] = useState(currentProjectIds === null);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(currentProjectIds ?? [])
  );
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleGrantAllChange(checked: boolean) {
    setGrantAll(checked);
    if (checked) setSelected(new Set());
  }

  function handleProjectToggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSave() {
    const projectIds = grantAll ? null : Array.from(selected);
    startTransition(async () => {
      try {
        await setProjectAccessAction(userId, projectIds);
        onSaved(userId, projectIds);
        onOpenChange(false);
        toast.success("Access updated");
      } catch {
        toast.error("Failed to update access");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage access for {memberName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={grantAll}
              onChange={(e) => handleGrantAllChange(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-foreground"
            />
            <span className="text-sm font-medium">Grant access to all projects</span>
          </label>

          {!grantAll && (
            <div className="space-y-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="space-y-1 max-h-56 overflow-y-auto rounded-md border p-3">
                {allProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects available.</p>
                ) : (() => {
                  const filtered = allProjects.filter((p) =>
                    p.name.toLowerCase().includes(search.toLowerCase())
                  );
                  return filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No projects match &ldquo;{search}&rdquo;.</p>
                  ) : (
                    filtered.map((project) => (
                      <label
                        key={project.id}
                        className="flex items-center gap-3 cursor-pointer rounded px-1 py-1.5 hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(project.id)}
                          onChange={() => handleProjectToggle(project.id)}
                          className="h-4 w-4 rounded border-border accent-foreground"
                        />
                        <span className="text-sm">{project.name}</span>
                      </label>
                    ))
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
