import { ArrowLeft } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { buttonAlignmentLayoutField, buttonTypographyFields, iconSize, makeBlock } from "../shared";

export const previousPageBlock: BlockDefinition = {
  type: "previousPage",
  label: "Previous Page",
  category: "interaction",
  icon: <ArrowLeft size={iconSize} />,
  defaultBlock: () => makeBlock("previousPage", { label: "Previous Page" }, { style: { textAlign: "center" } }),
  preview: (block, theme) => (
    <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-white" style={{ background: theme.primary, boxShadow: `0 3px 0 ${theme.shadow}` }}>
      <ArrowLeft size={16} />
      <span>{block.content.label}</span>
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "text", key: "label", label: "Label" }],
    layout: [buttonAlignmentLayoutField],
    feedback: [
      { section: "feedback", kind: "toggle", target: "settings", key: "continueDelayEnabled", label: "Enable activation delay" },
      { section: "feedback", kind: "number", target: "settings", key: "continueDelaySeconds", label: "Delay (seconds)", min: 1, max: 300, step: 1, defaultValue: 5, visibleWhen: (block) => !!block.settings.continueDelayEnabled },
    ],
    styleGroups: [{ title: "Button", description: "Controls the Previous Page button itself.", defaultOpen: true, fields: buttonTypographyFields }],
  },
};
