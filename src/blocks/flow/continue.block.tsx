import { MousePointerClick } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { buttonAlignmentLayoutField, buttonTypographyFields, iconSize, makeBlock } from "../shared";

export const continueBlock: BlockDefinition = {
  type: "continue",
  label: "Continue",
  category: "interaction",
  icon: <MousePointerClick size={iconSize} />,
  defaultBlock: () => makeBlock("continue", { label: "Continue" }, { style: { textAlign: "center" } }),
  preview: (block, theme) => (
    <div className="text-center">
      <button className="rounded-full px-4 py-2 text-xs font-bold text-white" style={{ background: theme.primary, boxShadow: `0 3px 0 ${theme.shadow}` }}>
        {block.content.label}
      </button>
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
        description: "Controls the Continue button itself.",
        defaultOpen: true,
        fields: buttonTypographyFields,
      },
    ],
  },
};
