import { ArrowRight } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { buttonAlignmentLayoutField, buttonTypographyFields, iconSize, makeBlock } from "../shared";

export const nextPageBlock: BlockDefinition = {
  type: "nextPage",
  label: "Next Page",
  category: "interaction",
  icon: <ArrowRight size={iconSize} />,
  defaultBlock: () => makeBlock("nextPage", { label: "Next Page" }, { style: { textAlign: "center" } }),
  preview: (block, theme) => (
    <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-white" style={{ background: theme.primary, boxShadow: `0 3px 0 ${theme.shadow}` }}>
      <span>{block.content.label}</span>
      <ArrowRight size={16} />
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "text", key: "label", label: "Label" }],
    layout: [buttonAlignmentLayoutField],
    feedback: [
      { section: "feedback", kind: "toggle", target: "settings", key: "continueDelayEnabled", label: "Enable activation delay" },
      { section: "feedback", kind: "number", target: "settings", key: "continueDelaySeconds", label: "Delay (seconds)", min: 1, max: 300, step: 1, defaultValue: 5, visibleWhen: (block) => !!block.settings.continueDelayEnabled },
    ],
    styleGroups: [
      {
        title: "Button",
        description: "Controls the Next Page button itself.",
        defaultOpen: true,
        fields: buttonTypographyFields,
      },
    ],
  },
};
