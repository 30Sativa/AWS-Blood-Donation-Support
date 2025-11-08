import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;   // default: "Yes"
  cancelText?: string;    // default: "Cancel"
  busy?: boolean;
  onConfirm: () => Promise<void> | void;
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirm",
  description = "Are you sure?",
  confirmText = "Yes",
  cancelText = "Cancel",
  busy,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={!!busy}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={!!busy}>
            {busy ? "Deleting…" : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
