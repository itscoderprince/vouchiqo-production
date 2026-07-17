"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  isPending = false,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border border-brand-border rounded-2xl p-5 shadow-lg max-w-sm text-left">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-brand-subtext font-semibold leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="text-xs font-bold h-9 px-4 border-brand-border hover:bg-brand-surface rounded-lg cursor-pointer shadow-none"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="bg-brand-error hover:bg-brand-error/90 text-white text-xs font-bold h-9 px-4 rounded-lg cursor-pointer border-0 flex items-center justify-center shadow-none"
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
