import React from "react";

type IconProps = { className?: string; style?: React.CSSProperties };

/**
 * Every icon below is a real SVG file in /public/icons/ui. They are painted with the
 * current text colour, so they follow hover and theme colours like any text.
 */
function make(file: string) {
  const Icon = ({ className = "", style }: IconProps) => (
    <span
      aria-hidden="true"
      className={`inline-block flex-shrink-0 bg-current ${className}`}
      style={{
        WebkitMaskImage: `url(/icons/ui/${file}.svg)`,
        maskImage: `url(/icons/ui/${file}.svg)`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        ...style,
      }}
    />
  );
  Icon.displayName = file;
  return Icon;
}

export const X = make("x");
export const ArrowRight = make("arrow-right");
export const ArrowDown = make("arrow-down");
export const ChevronUp = make("chevron-up");
export const ChevronDown = make("chevron-down");
export const ChevronLeft = make("chevron-left");
export const ChevronRight = make("chevron-right");
export const Check = make("check");
export const CheckCircle = make("circle-check");
export const Search = make("search");
export const Plus = make("plus");
export const Minus = make("minus");
export const Trash2 = make("trash-2");
export const Pencil = make("pencil");
export const Upload = make("upload");
export const Download = make("download");
export const Copy = make("copy");
export const ExternalLink = make("external-link");
export const Menu = make("menu");
export const Phone = make("phone");
export const Mail = make("mail");
export const MapPin = make("map-pin");
export const ShoppingCart = make("shopping-cart");
export const Star = make("star");
export const Package = make("package");
export const Truck = make("truck");
