import { PanelsTopLeft } from "lucide-react";
import type { Block, BlockDefinition } from "../../types";
import { buttonAlignmentLayoutField, buttonTypographyFields, commonVisualStyleFields, iconSize, makeBlock } from "../shared";

function createStarterParagraph(): Block {
  return makeBlock("paragraph", { text: "Add blocks to this popup board." });
}

export const popupBlock: BlockDefinition = {
  type: "popup",
  label: "Popup",
  category: "layout",
  icon: <PanelsTopLeft size={iconSize} />,
  defaultBlock: () => makeBlock("popup", { label: "Open popup" }, {
    settings: { popupDisplay: "floating" },
    style: { popupWidth: 640, popupHeight: 480, radius: 20, textAlign: "center" },
    children: { content: [createStarterParagraph()] },
  }),
  preview: (block, theme) => (
    <div className="grid min-h-28 place-items-center rounded-2xl border border-dashed p-3" style={{ borderColor: theme.borderLight, background: theme.bgLight }}>
      <span className="inline-flex items-center gap-2 rounded-xl border-2 bg-white px-2.5 py-2 text-xs font-bold" style={{ borderColor: theme.borderLight, color: theme.primary, boxShadow: `0 3px 0 ${theme.borderLight}` }}>
        <span className="grid h-7 w-7 place-items-center rounded-lg text-white" style={{ background: theme.primary }}><PanelsTopLeft size={14} /></span>
        <span>{block.content.label}</span>
        <span className="border-l pl-2 text-[8px] font-black uppercase tracking-widest opacity-60">Open</span>
      </span>
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "text", key: "label", label: "Button label" }],
    layout: [
      buttonAlignmentLayoutField,
      {
        section: "layout",
        kind: "select",
        target: "settings",
        key: "popupDisplay",
        label: "Presentation",
        options: [
          { label: "Floating panel", value: "floating" },
          { label: "Centered modal", value: "modal" },
          { label: "Inline expansion", value: "inline" },
        ],
      },
      { section: "layout", kind: "number", target: "style", key: "popupWidth", label: "Popup width", min: 280, max: 1200, step: 10, defaultValue: 640 },
      { section: "layout", kind: "number", target: "style", key: "popupHeight", label: "Popup height", min: 220, max: 900, step: 10, defaultValue: 480 },
    ],
    styleGroups: [
      { title: "Button", description: "Controls the popup trigger.", defaultOpen: true, fields: buttonTypographyFields },
      { title: "Popup panel", description: "Controls the popup board surface.", fields: commonVisualStyleFields.filter((field) => ["fillColor", "borderColor", "shadowColor", "borderWidth", "radius"].includes(String(field.key))) },
    ],
  },
};
