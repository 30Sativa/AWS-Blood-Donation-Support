// src/components/admin/ConfirmDialog.tsx
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Please confirm",
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-neutral-700">{message}</div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="secondary"
            className="rounded-lg"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button className="rounded-lg" onClick={onConfirm} disabled={loading}>
            {loading ? "Working..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
