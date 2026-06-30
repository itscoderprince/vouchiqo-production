import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyState({
  icon: Icon = Info,
  title = "No items found",
  description = "There is nothing to display here right now.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="bg-brand-bg border border-brand-border rounded-lg p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto shadow-sm my-6">
      <div className="p-3 bg-brand-surface rounded-full text-brand-navy border border-brand-border mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-heading text-base font-bold text-brand-text mb-1">
        {title}
      </h3>
      <p className="text-xs text-brand-subtext mb-5 max-w-xs leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="btn-primary text-xs font-bold px-4 py-2 border-0 h-auto cursor-pointer shadow-none"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
