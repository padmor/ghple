import { PageLoader } from "@/components/ui/apple-loader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-forest">
      <PageLoader dark />
    </div>
  );
}
