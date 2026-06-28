import { PanelsTopLeft } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { iconSize, makeBlock } from "../shared";

export const whiteboardBlock: BlockDefinition = {
  type: "whiteboard",
  label: "Whiteboard",
  category: "tools",
  icon: <PanelsTopLeft size={iconSize} />,
  defaultBlock: () => makeBlock("whiteboard", {}, { settings: { whiteboardVariant: "fixed", whiteboardPopupMode: "modal", whiteboardPreset: "whiteboard", whiteboardHeight: "medium", whiteboardAllowEraser: true, whiteboardAllowColors: true, whiteboardAllowSizes: true, whiteboardAllowUndoRedo: true, whiteboardAllowClear: true, whiteboardUnlimitedArea: false } }),
  preview: (block) => {
    const preset = block.settings.whiteboardPreset ?? "whiteboard";
    return <div className={`whiteboard-miniature whiteboard-surface--${preset}`} aria-hidden="true"><span /><i /></div>;
  },
  config: {
    content: [
      { section: "content", kind: "toggle", key: "whiteboardAllowEraser", label: "Allow eraser", defaultChecked: true },
      { section: "content", kind: "toggle", key: "whiteboardAllowColors", label: "Allow color choices", defaultChecked: true },
      { section: "content", kind: "toggle", key: "whiteboardAllowSizes", label: "Allow stroke sizes", defaultChecked: true },
      { section: "content", kind: "toggle", key: "whiteboardAllowUndoRedo", label: "Allow undo and redo", defaultChecked: true },
      { section: "content", kind: "toggle", key: "whiteboardAllowClear", label: "Allow clear board", defaultChecked: true },
      { section: "content", kind: "toggle", key: "whiteboardUnlimitedArea", label: "Allow unlimited area", defaultChecked: false },
    ],
    layout: [
      { section: "layout", kind: "select", target: "settings", key: "whiteboardVariant", label: "Display", options: [{ label: "Fixed board", value: "fixed" }, { label: "Popup button", value: "popup" }] },
      { section: "layout", kind: "select", target: "settings", key: "whiteboardPopupMode", label: "Popup presentation", options: [{ label: "Large modal", value: "modal" }, { label: "Fullscreen workspace", value: "fullscreen" }], visibleWhen: (block) => block.settings.whiteboardVariant === "popup" },
      { section: "layout", kind: "select", target: "settings", key: "whiteboardHeight", label: "Fixed board height", options: [{ label: "Small", value: "small" }, { label: "Medium", value: "medium" }, { label: "Large", value: "large" }], visibleWhen: (block) => block.settings.whiteboardVariant !== "popup" },
    ],
    styling: [{ section: "styling", kind: "select", target: "settings", key: "whiteboardPreset", label: "Board preset", options: [{ label: "Whiteboard · markers", value: "whiteboard" }, { label: "Blackboard · chalk", value: "blackboard" }, { label: "Greenboard · chalk", value: "greenboard" }, { label: "Paper · pencil", value: "paperPencil" }, { label: "Paper · pen", value: "paperPen" }] }],
  },
};
