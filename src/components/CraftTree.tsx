import type { CraftNode } from "../lib/craftTree";
import { ItemLink } from "./ItemLink";

type Props = {
  node: CraftNode;
};

function NodeList({ node }: Props) {
  return (
    <li>
      <ItemLink itemId={node.itemId} amount={node.amount} />
      {node.children.length ? (
        <ul className="craft-tree">
          {node.children.map((child) => (
            <NodeList key={`${child.itemId}-${child.amount}`} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CraftTree({ node }: Props) {
  return (
    <ul className="craft-tree" style={{ borderLeft: "none", paddingLeft: 0 }}>
      <NodeList node={node} />
    </ul>
  );
}
