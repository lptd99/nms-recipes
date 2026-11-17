import { useState } from "react";
import { itemIconUrl } from "../lib/itemIcon";

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  itemId: string;
  color?: string;
  name?: string;
  amount?: number;
  size?: Size;
  priority?: boolean;
  className?: string;
};

const sizeClass: Record<Size, string> = {
  sm: "slot-sm",
  md: "slot-md",
  lg: "slot-lg",
  xl: "slot-xl",
};

export function ItemIcon({
  itemId,
  color,
  name,
  amount,
  size = "md",
  priority = false,
  className,
}: Props) {
  const [failed, setFailed] = useState(false);
  const classes = ["slot", sizeClass[size], className].filter(Boolean).join(" ");

  return (
    <span
      className={classes}
      style={{ ["--c" as string]: color ?? "#1b2533" }}
      aria-hidden={name ? undefined : true}
    >
      {!failed ? (
        <img
          src={itemIconUrl(itemId)}
          alt={name ?? ""}
          width={256}
          height={256}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : undefined}
          onError={() => setFailed(true)}
        />
      ) : null}
      {amount != null ? <span className="qty">{amount}</span> : null}
    </span>
  );
}
