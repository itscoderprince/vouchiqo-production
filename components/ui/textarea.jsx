import { cn } from "@/lib/utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-xl border border-slate-400 bg-white px-2.5 py-2 text-base transition-colors duration-150 outline-none placeholder:text-muted-foreground focus-visible:border-blue-600 focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:outline-none focus-visible:shadow-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
