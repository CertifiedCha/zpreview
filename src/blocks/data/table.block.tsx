import { Table2 } from "lucide-react";
import type { Block, BlockDefinition } from "../../types";
import { baseTypographyGroup, containerStyleGroup, fontColorField, fontSizeField, iconSize, makeBlock } from "../shared";

function renderMiniTable(block: Block) {
  const rows = block.content.rows ?? [];
  const columnCount = Math.max(1, rows[0]?.length ?? 1);
  const minimal = block.style.tableBorderMode === "rows";
  return (
    <div className={minimal ? "text-[11px]" : "overflow-hidden rounded-xl border border-zinc-200 text-[11px]"} style={{ borderColor: block.style.tableGridColor }}>
      {block.content.title && <div className="mb-2 text-[12px] font-black text-zinc-950">{block.content.title}</div>}
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={rowIndex === 0 ? "grid font-bold text-zinc-700" : "grid text-zinc-600"}
          style={{
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            background: rowIndex === 0 ? block.style.tableHeaderFillColor ?? (minimal ? "transparent" : "#fafafa") : block.style.tableRowFillColor,
            color: rowIndex === 0 ? block.style.tableHeaderFontColor : undefined,
          }}
        >
          {Array.from({ length: columnCount }, (_, cellIndex) => row[cellIndex] ?? "").map((cell, cellIndex) => (
            <div key={cellIndex} className={minimal ? "border-t px-2 py-2" : "border-r border-t px-2 py-1.5 last:border-r-0"} style={{ borderColor: block.style.tableGridColor }}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export const tableBlock: BlockDefinition = {
  type: "table",
  label: "Table",
  category: "data",
  icon: <Table2 size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "table",
      {
        title: "Table title",
        rows: [
          ["Variable", "Value", "Result"],
          ["Input", "12", "Higher"],
          ["Output", "8", "Lower"],
        ],
      },
      { style: { tableBorderMode: "grid", tableHeaderFillColor: "#f4f4f5", tableHeaderFontColor: "#18181b", tableGridColor: "#e4e4e7", tableCellPadding: 12 } },
    ),
  preview: (block) => renderMiniTable(block),
  config: {
    content: [{ section: "content", kind: "text", key: "title", label: "Table title" }],
    contentControls: () => ["table"],
    stylePresets: [
      {
        id: "minimalist-table",
        label: "Minimalist",
        style: {
          shell: "plain",
          fillColor: undefined,
          borderColor: undefined,
          shadowColor: undefined,
          borderWidth: undefined,
          radius: undefined,
          fontColor: "#18181b",
          titleFontColor: "#09090b",
          titleFontSize: 18,
          tableBorderMode: "rows",
          tableHeaderFillColor: "transparent",
          tableHeaderFontColor: "#2563eb",
          tableRowFillColor: "transparent",
          tableGridColor: "#e5e7eb",
          tableCellPadding: 17,
        },
      },
      {
        id: "classic-grid",
        label: "Classic Grid",
        style: {
          shell: "plain",
          fillColor: undefined,
          borderColor: undefined,
          shadowColor: undefined,
          borderWidth: undefined,
          radius: 16,
          fontColor: "#3f3f46",
          titleFontColor: "#09090b",
          titleFontSize: 18,
          tableBorderMode: "grid",
          tableHeaderFillColor: "#f4f4f5",
          tableHeaderFontColor: "#18181b",
          tableRowFillColor: "#ffffff",
          tableGridColor: "#e4e4e7",
          tableCellPadding: 12,
        },
      },
      {
        id: "soft-card-table",
        label: "Soft Card",
        style: {
          shell: "card",
          fillColor: "#ffffff",
          borderColor: "#dedede",
          shadowColor: "#d4d4d8",
          borderWidth: 2,
          radius: 20,
          fontColor: "#334155",
          titleFontColor: "#0f172a",
          titleFontSize: 18,
          tableBorderMode: "grid",
          tableHeaderFillColor: "#eff6ff",
          tableHeaderFontColor: "#1d4ed8",
          tableRowFillColor: "#ffffff",
          tableGridColor: "#bfdbfe",
          tableCellPadding: 14,
        },
      },
    ],
    styleGroups: [
      containerStyleGroup,
      {
        title: "Table Look",
        description: "Controls header, dividers, and cell spacing.",
        defaultOpen: true,
        fields: [
          {
            section: "styling",
            kind: "select",
            target: "style",
            key: "tableBorderMode",
            label: "Table lines",
            options: [
              { label: "Full grid", value: "grid" },
              { label: "Rows only", value: "rows" },
              { label: "No lines", value: "none" },
            ],
          },
          fontColorField("tableHeaderFontColor", "Header text color", "#2563eb"),
          fontColorField("tableHeaderFillColor", "Header fill color", "#f4f4f5"),
          fontColorField("tableRowFillColor", "Row fill color", "#ffffff"),
          fontColorField("tableGridColor", "Divider color", "#e5e7eb"),
          fontSizeField("tableCellPadding", "Cell padding", 12, 4, 40),
        ],
      },
      {
        title: "Text",
        description: "Controls table title and cell text.",
        fields: [
          fontSizeField("titleFontSize", "Title font size", 18, 10, 48),
          fontColorField("titleFontColor", "Title color", "#09090b"),
          ...baseTypographyGroup.fields,
        ],
      },
    ],
  },
};
