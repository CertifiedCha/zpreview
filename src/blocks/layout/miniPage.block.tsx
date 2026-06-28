import { PanelTop, Plus } from "lucide-react";
import type { Block, BlockDefinition } from "../../types";
import { commonVisualStyleFields, iconSize, makeBlock } from "../shared";
import { uid } from "../../theme";

function createMiniPageStarter(): Block[] {
  return [];
}

export function createMiniPageData() {
  return { id: uid("mini-page"), blocks: createMiniPageStarter() };
}

export const miniPageBlock: BlockDefinition = {
  type: "miniPage",
  label: "Mini Page",
  category: "layout",
  icon: <PanelTop size={iconSize} />,
  defaultBlock: () => {
    const firstPage = createMiniPageData();
    return makeBlock(
      "miniPage",
      {},
      {
        settings: { miniPageFixedHeight: false },
        style: { minHeight: 320, borderWidth: 0, radius: 0 },
        miniPages: [firstPage],
        activeMiniPageId: firstPage.id,
      },
    );
  },
  preview: (_block, theme) => (
    <div className="relative min-h-32 rounded-xl border border-dashed bg-white p-3" style={{ borderColor: theme.borderLight }}>
      <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full" style={{ background: theme.bgLight, color: theme.primary }}><Plus size={13} /></span>
      <div className="grid h-24 place-items-center rounded-lg border border-dashed border-zinc-200 text-[11px] font-bold text-zinc-400">
        Add blocks here
      </div>
    </div>
  ),
  config: {
    layout: [
      { section: "layout", kind: "toggle", target: "settings", key: "miniPageFixedHeight", label: "Fixed height" },
    ],
    stylePresets: [
      {
        id: "plain",
        label: "Plain",
        style: { fillColor: undefined, borderColor: undefined, shadowColor: undefined, borderWidth: 0, radius: 0 },
      },
      {
        id: "quiet-page",
        label: "Quiet page",
        style: { fillColor: "#ffffff", borderColor: "#e4e4e7", shadowColor: undefined, borderWidth: 1, radius: 16 },
      },
      {
        id: "focus-outline",
        label: "Focus outline",
        style: { fillColor: "#ffffff", borderColor: "#2563eb", shadowColor: "#bfdbfe", borderWidth: 2, radius: 18 },
      },
      {
        id: "soft-experience",
        label: "Soft experience",
        style: { fillColor: "#f0fdf4", borderColor: "#86efac", shadowColor: "#bbf7d0", borderWidth: 2, radius: 20 },
      },
      {
        id: "notebook",
        label: "Notebook",
        style: { fillColor: "#fff7ed", borderColor: "#fdba74", shadowColor: "#fed7aa", borderWidth: 2, radius: 10 },
      },
    ],
    styleGroups: [
      {
        title: "Mini page",
        description: "Controls the inline mini page surface.",
        defaultOpen: true,
        fields: commonVisualStyleFields.filter((field) => ["fillColor", "borderColor", "shadowColor", "borderWidth", "radius"].includes(String(field.key))),
      },
    ],
  },
};
