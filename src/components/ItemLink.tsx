import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { ItemIcon } from "./ItemIcon";

type Props = {
  itemId: string;
  amount?: number;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
  showAmountInIcon?: boolean;
};

export function ItemLink({
  itemId,
  amount,
  className,
  iconSize = "sm",
  showAmountInIcon = false,
}: Props) {
  const { getItem, resolveName } = useAppData();
  const item = getItem(itemId);
  const name = item?.name ?? resolveName(itemId);

  return (
    <Link to={`/item/${encodeURIComponent(itemId)}`} className={className ?? "item-chip"}>
      <ItemIcon
        itemId={itemId}
        color={item?.color}
        name={name}
        size={iconSize}
        amount={showAmountInIcon ? amount : undefined}
      />
      <span className="item-chip-label">
        {name}
        {!showAmountInIcon && amount != null ? ` ×${amount}` : ""}
      </span>
    </Link>
  );
}
