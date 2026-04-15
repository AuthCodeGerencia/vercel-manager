"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MemberAccessDialog } from "./member-access-dialog";

interface Project {
  id: string;
  name: string;
}

interface Member {
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface MemberListProps {
  members: Member[];
  allProjects: Project[];
  initialAccess: Record<string, string[]>;
}

export function MemberList({ members, allProjects, initialAccess }: MemberListProps) {
  // null = all projects, string[] = scoped list
  const [access, setAccess] = useState<Record<string, string[] | null>>(() => {
    const map: Record<string, string[] | null> = {};
    for (const m of members) {
      const val = initialAccess[m.userId];
      // "*" sentinel means all projects
      map[m.userId] = val?.includes("*") ? null : (val ?? []);
    }
    return map;
  });

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    userId: string;
    memberName: string;
  } | null>(null);

  function openDialog(member: Member) {
    setDialogState({ open: true, userId: member.userId, memberName: member.name || member.email });
  }

  function handleSaved(userId: string, projectIds: string[] | null) {
    setAccess((prev) => ({ ...prev, [userId]: projectIds }));
  }

  const dialogMember = dialogState
    ? members.find((m) => m.userId === dialogState.userId)
    : null;

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const memberAccess = access[member.userId];
        const isAdmin = member.role === "org:admin";

        return (
          <div
            key={member.userId}
            className="flex items-center justify-between rounded-lg border px-4 py-3"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{member.name || member.email}</span>
                {isAdmin && (
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin ? (
                <span className="text-xs text-muted-foreground">All projects</span>
              ) : memberAccess === null ? (
                <span className="text-xs text-muted-foreground">All projects</span>
              ) : memberAccess.length === 0 ? (
                <span className="text-xs text-muted-foreground">No projects</span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {memberAccess.length} project{memberAccess.length !== 1 ? "s" : ""}
                </span>
              )}

              {!isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDialog(member)}
                >
                  Manage
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {dialogState && dialogMember && (
        <MemberAccessDialog
          userId={dialogState.userId}
          memberName={dialogState.memberName}
          allProjects={allProjects}
          currentProjectIds={access[dialogState.userId] ?? null}
          open={dialogState.open}
          onOpenChange={(open) =>
            setDialogState((prev) => prev ? { ...prev, open } : null)
          }
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
