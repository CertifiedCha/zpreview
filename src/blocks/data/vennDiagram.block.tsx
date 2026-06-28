import { Blend } from "lucide-react";
import type { Block, BlockDefinition } from "../../types";
import { baseTypographyGroup, containerStyleGroup, iconSize, makeBlock } from "../shared";

function renderMiniVennDiagram(block: Block) {
  const three = block.settings.vennCircleCount === "three";
  const labels = (block.content.vennLabels ?? "Group A, Group B, Group C").split(",").map((label) => label.trim());

  return (
    <div className="relative h-28 overflow-hidden bg-transparent">
      <span className={three ? "absolute left-[12%] top-[8%] aspect-square w-[48%] rounded-full border-2 border-red-400 bg-red-100/50" : "absolute left-[8%] top-[14%] aspect-square w-[55%] rounded-full border-2 border-red-400 bg-red-100/50"} />
      <span className={three ? "absolute right-[12%] top-[8%] aspect-square w-[48%] rounded-full border-2 border-blue-400 bg-blue-100/50" : "absolute right-[8%] top-[14%] aspect-square w-[55%] rounded-full border-2 border-blue-400 bg-blue-100/50"} />
      {three && <span className="absolute bottom-[-16%] left-1/2 aspect-square w-[48%] -translate-x-1/2 rounded-full border-2 border-amber-400 bg-amber-100/50" />}
      <span className="absolute left-[28%] top-1 z-10 -translate-x-1/2 rounded-full bg-white/90 px-1.5 py-0.5 text-[8px] font-black text-red-600">{labels[0] || "Group A"}</span>
      <span className="absolute left-[72%] top-1 z-10 -translate-x-1/2 rounded-full bg-white/90 px-1.5 py-0.5 text-[8px] font-black text-blue-600">{labels[1] || "Group B"}</span>
      {three && <span className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-1.5 py-0.5 text-[8px] font-black text-amber-600">{labels[2] || "Group C"}</span>}
    </div>
  );
}

export const vennDiagramBlock: BlockDefinition = {
  type: "vennDiagram",
  label: "Venn diagram",
  category: "data",
  icon: <Blend size={iconSize} />,
  defaultBlock: () => makeBlock(
    "vennDiagram",
    { vennLabels: "Group A, Group B, Group C", vennItems: [] },
    { style: { hitboxInset: 0 }, settings: { vennCircleCount: "two", customHitboxInset: true } },
  ),
  preview: (block) => renderMiniVennDiagram(block),
  config: {
    content: [
      { section: "content", kind: "select", target: "settings", key: "vennCircleCount", label: "Circles", options: [{ label: "Two circles", value: "two" }, { label: "Three circles", value: "three" }] },
      { section: "content", kind: "text", key: "vennLabels", label: "Circle labels (comma-separated)" },
    ],
    styleGroups: [containerStyleGroup, baseTypographyGroup],
  },
};
