export const REAL_LEAF_IMAGE_URL =
  "https://images.unsplash.com/photo-1625389866601-4882629a758a?auto=format&fit=max&w=200&q=85";

/** A tiny photographic leaf mark used in place of a generic leaf glyph. */
export function RealLeafMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={"inline-block shrink-0 bg-center bg-no-repeat " + className}
      style={{
        backgroundImage: `url("${REAL_LEAF_IMAGE_URL}")`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#E8EFE4",
      }}
    />
  );
}
