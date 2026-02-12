"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { redeployAction } from "@/lib/actions";

interface RedeployButtonProps {
  projectId: string;
  projectName: string;
  deploymentId: string;
}

export function RedeployButton({
  projectId,
  projectName,
  deploymentId,
}: RedeployButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleRedeploy() {
    startTransition(async () => {
      try {
        const result = await redeployAction(projectId, projectName, deploymentId);
        toast.success("Redeployment triggered", {
          description: `New deployment: ${result.id}`,
        });
        router.push(`/dashboard/projects/${projectId}`);
      } catch (error) {
        toast.error("Redeployment failed", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcwIcon className="mr-2 h-3.5 w-3.5" />
          Redeploy
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Redeployment</DialogTitle>
          <DialogDescription>
            This will create a new deployment for{" "}
            <span className="font-medium text-foreground">{projectName}</span>{" "}
            based on deployment <code className="text-xs">{deploymentId.slice(0, 12)}...</code>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleRedeploy} disabled={isPending}>
            {isPending ? "Deploying..." : "Redeploy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
