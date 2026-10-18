import { AppleLoader } from "@/components/ui/apple-loader";

/** Small loading mark for buttons and inline waits: the same apple used everywhere else. */
export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <AppleLoader className={className} />;
}
