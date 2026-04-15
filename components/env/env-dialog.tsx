"use client";

import { useState, useTransition } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createEnvVarAction, updateEnvVarAction } from "@/lib/actions";
import { toast } from "sonner";

const TARGETS = [
  { id: "production", label: "Production" },
  { id: "preview", label: "Preview" },
  { id: "development", label: "Development" },
];

const TYPES = [
  { value: "plain", label: "Plain text" },
  { value: "encrypted", label: "Encrypted" },
  { value: "sensitive", label: "Sensitive" },
  { value: "secret", label: "Secret" },
];

export interface EnvDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog is in edit mode */
  existing?: {
    id: string;
    key: string;
    value: string;
    type: string;
    target: string[];
  };
}

export function EnvDialog({ projectId, open, onOpenChange, existing }: EnvDialogProps) {
  const isEdit = !!existing;

  const [key, setKey] = useState(existing?.key ?? "");
  const [value, setValue] = useState(existing?.value ?? "");
  const [type, setType] = useState(existing?.type ?? "plain");
  const [target, setTarget] = useState<Set<string>>(
    new Set(existing?.target ?? ["production", "preview", "development"])
  );
  const [showValue, setShowValue] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleTarget(id: string) {
    setTarget((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    if (!key.trim()) {
      toast.error("Key is required");
      return;
    }
    if (target.size === 0) {
      toast.error("Select at least one environment");
      return;
    }

    const data = { key: key.trim(), value, type, target: Array.from(target) };

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateEnvVarAction(projectId, existing.id, data);
          toast.success("Variable updated");
        } else {
          await createEnvVarAction(projectId, data);
          toast.success("Variable created");
        }
        onOpenChange(false);
      } catch (err) {
        toast.error(isEdit ? "Failed to update variable" : "Failed to create variable", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Variable" : "Add Variable"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Key</label>
            <Input
              placeholder="VARIABLE_NAME"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().replace(/\s/g, "_"))}
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Value</label>
            <div className="relative">
              <Input
                type={showValue ? "text" : "password"}
                placeholder={isEdit ? "Enter new value to change" : "Value"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="font-mono pr-9"
              />
              <button
                type="button"
                onClick={() => setShowValue((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showValue ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Environments</label>
            <div className="flex flex-col gap-2">
              {TARGETS.map((t) => (
                <label key={t.id} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={target.has(t.id)}
                    onChange={() => toggleTarget(t.id)}
                    className="h-4 w-4 rounded border-border accent-foreground"
                  />
                  <span className="text-sm">{t.label}</span>
                </label>
              ))}
            </div>
          </div>
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
