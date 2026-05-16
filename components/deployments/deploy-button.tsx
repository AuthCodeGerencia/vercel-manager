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
import { triggerGitHubDeployAction } from "@/lib/actions";

interface DeployButtonProps {
  projectName: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
}

export function DeployButton({
  projectName,
  githubOwner,
  githubRepo,
  githubBranch,
}: DeployButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDeploy() {
    startTransition(async () => {
      try {
        const result = await triggerGitHubDeployAction(githubOwner, githubRepo, githubBranch);
        toast.success("Deploy triggered", {
          description: `Empty commit pushed: ${result.sha.slice(0, 7)}`,
        });
        router.refresh();
      } catch (error) {
        toast.error("Deploy failed", {
          description: error instanceof Error ? error.message : "Unknown error",
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
          <DialogTitle>Trigger Deployment</DialogTitle>
          <DialogDescription>
            This will push an empty commit to{" "}
            <code className="text-xs font-medium text-foreground">
              {githubOwner}/{githubRepo}:{githubBranch}
            </code>{" "}
            to trigger Vercel autodeploy for{" "}
            <span className="font-medium text-foreground">{projectName}</span>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleDeploy} disabled={isPending}>
            {isPending ? "Pushing..." : "Deploy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
