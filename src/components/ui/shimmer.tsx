import { cn } from "@/lib/utils";

/**
 * Heritage saffron shimmer skeleton.
 * Use as a placeholder while data loads.
 */
export function Shimmer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/40 border border-primary/10",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent",
        "before:animate-[shimmer_1.6s_infinite]",
        className,
      )}
      {...props}
    />
  );
}

/** Card-shaped shimmer block. */
export function ShimmerCard({ className }: { className?: string }) {
  return (
    <div className={cn("manuscript-card p-5 space-y-3", className)}>
      <Shimmer className="h-4 w-1/3" />
      <Shimmer className="h-8 w-2/3" />
      <Shimmer className="h-2 w-full" />
      <Shimmer className="h-3 w-1/2" />
    </div>
  );
}

/** Row-style shimmer (e.g. resume list row). */
export function ShimmerRow() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-muted/20">
      <div className="flex items-center gap-3 flex-1">
        <Shimmer className="h-9 w-9 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Shimmer className="h-3 w-2/3" />
          <Shimmer className="h-2 w-1/3" />
        </div>
      </div>
      <Shimmer className="h-6 w-16 rounded-full" />
    </div>
  );
}

/** Pill / badge-shaped shimmer for skill chips. */
export function ShimmerPill({ className }: { className?: string }) {
  return <Shimmer className={cn("h-6 w-20 rounded-full", className)} />;
}