"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RocketIcon } from "lucide-react";
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
import { deployLatestAction } from "@/lib/actions";

interface DeployButtonProps {
  projectId: string;
  projectName: string;
  latestDeploymentId: string;
}

export function DeployButton({
  projectId,
  projectName,
  latestDeploymentId,
}: DeployButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDeploy() {
    startTransition(async () => {
      try {
        const result = await deployLatestAction(
          projectId,
          projectName,
          latestDeploymentId
        );
        toast.success("Deployment triggered", {
          description: `New deployment: ${result.id}`,
        });
        router.refresh();
      } catch (error) {
        toast.error("Deployment failed", {
          description:
            error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <RocketIcon className="mr-2 h-3.5 w-3.5" />
          Deploy
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deploy Latest Commit</DialogTitle>
          <DialogDescription>
            This will create a new production deployment for{" "}
            <span className="font-medium text-foreground">{projectName}</span>{" "}
            using the latest commit.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleDeploy} disabled={isPending}>
            {isPending ? "Deploying..." : "Deploy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
