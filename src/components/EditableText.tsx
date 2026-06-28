"use client";
import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { cn } from "../theme";
import { canStoreImageFile, showImageStorageLimitAlert } from "../utils/imageStorage";
import { applyMathShortcuts } from "../utils/mathShortcuts";
import { imageToken, richTextToHtml, serializeRichElement } from "../utils/richText";

type EditableTextProps = {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  style?: CSSProperties;
  multiline?: boolean;
  placeholder?: string;
  onBlur?: (value: string) => void;
};

export function EditableText({ value = "", onChange, className, style, multiline, placeholder, onBlur }: EditableTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const selectionSnapshot = useRef<TextSelectionSnapshot | null>(null);
  const commitValue = useCallback(function commitValue(element: HTMLElement) {
    onChange(serializeRichElement(element));
  }, [onChange]);

  useEffect(() => {
    if (ref.current && serializeRichElement(ref.current) !== value) {
      ref.current.innerHTML = richTextToHtml(value);
    }
  }, [value]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const editableElement = element;

    function commitFormattedEdit() {
      commitValue(editableElement);
    }

    function applyFormat(event: Event) {
      const detail = (event as CustomEvent<{ style?: Partial<CSSStyleDeclaration>; toggle?: TextStyleToggle }>).detail;
      if (!detail?.style && !detail?.toggle) return;
      restoreTextSelection(editableElement, selectionSnapshot.current);
      applyFormatToTextRuns(editableElement, detail.toggle ? { toggle: detail.toggle } : { style: detail.style ?? {} });
      selectionSnapshot.current = getTextSelectionSnapshot(editableElement);
      commitValue(editableElement);
    }

    editableElement.addEventListener("editable-text-commit", commitFormattedEdit);
    editableElement.addEventListener("editable-text-format", applyFormat);
    return () => {
      editableElement.removeEventListener("editable-text-commit", commitFormattedEdit);
      editableElement.removeEventListener("editable-text-format", applyFormat);
    };
  }, [commitValue]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline}
      data-placeholder={placeholder}
      className={cn("editable-text min-w-0 rounded-md outline-none focus:bg-blue-50/70 focus:ring-2 focus:ring-blue-200", className)}
      style={style}
      onBlur={(event) => {
        const next = serializeRichElement(event.currentTarget);
        onChange(next);
        onBlur?.(next);
      }}
      onFocus={(event) => {
        selectionSnapshot.current = getTextSelectionSnapshot(event.currentTarget);
        window.dispatchEvent(new CustomEvent("editable-text-focus", { detail: { element: event.currentTarget } }));
      }}
      onKeyUp={(event) => {
        selectionSnapshot.current = getTextSelectionSnapshot(event.currentTarget);
        window.dispatchEvent(new CustomEvent("editable-text-selection", { detail: { element: event.currentTarget } }));
      }}
      onMouseUp={(event) => {
        selectionSnapshot.current = getTextSelectionSnapshot(event.currentTarget);
        window.dispatchEvent(new CustomEvent("editable-text-selection", { detail: { element: event.currentTarget } }));
      }}
      onInput={(event) => {
        const next = applyMathShortcuts(serializeRichElement(event.currentTarget));
        if (next === serializeRichElement(event.currentTarget)) {
          commitValue(event.currentTarget);
          return;
        }
        event.currentTarget.innerHTML = richTextToHtml(next);
        placeCaretAtEnd(event.currentTarget);
        commitValue(event.currentTarget);
      }}
      onPaste={(event) => {
        const imageFile = getClipboardImageFile(event.clipboardData);
        if (!imageFile) return;
        event.preventDefault();
        insertImageFile(imageFile, event.currentTarget, onChange, getSelectionRangeIn(event.currentTarget));
      }}
      onDrop={(event) => {
        const imageFile = Array.from(event.dataTransfer.files).find((file) => file.type.startsWith("image/"));
        if (!imageFile) return;
        event.preventDefault();
        insertImageFile(imageFile, event.currentTarget, onChange, getSelectionRangeIn(event.currentTarget));
      }}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
          return;
        }

        if (multiline && event.key === "Enter") {
          event.preventDefault();
          insertTextAtRange(event.currentTarget, "\n", getSelectionRangeIn(event.currentTarget));
          commitValue(event.currentTarget);
        }
      }}
    />
  );
}

type TextSelectionSnapshot = {
  start: number;
  end: number;
};

type TextStyleToggle = "bold" | "italic" | "underline" | "strike";
type TextRunStyle = {
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecorationLine?: string;
};
type TextRun =
  | { kind: "text"; text: string; style: TextRunStyle }
  | { kind: "html"; html: string };

function toggledStyleForSelection(element: HTMLElement, toggle: TextStyleToggle): Partial<CSSStyleDeclaration> {
  const style = getSelectionComputedStyle(element);
  if (toggle === "bold") return { fontWeight: Number.parseInt(style.fontWeight, 10) >= 600 ? "400" : "700" };
  if (toggle === "italic") return { fontStyle: style.fontStyle === "italic" ? "normal" : "italic" };
  if (toggle === "underline") return { textDecorationLine: style.textDecorationLine.includes("underline") ? "none" : "underline" };
  return { textDecorationLine: style.textDecorationLine.includes("line-through") ? "none" : "line-through" };
}

function getSelectionComputedStyle(element: HTMLElement) {
  const selection = window.getSelection();
  const node = selection?.rangeCount ? selection.getRangeAt(0).startContainer : element;
  const target = node instanceof HTMLElement ? node : node?.parentElement;
  return window.getComputedStyle(target && element.contains(target) ? target : element);
}

function applyFormatToTextRuns(element: HTMLElement, format: { style?: Partial<CSSStyleDeclaration>; toggle?: TextStyleToggle }) {
  const snapshot = getTextSelectionSnapshot(element);
  const runs = mergeTextRuns(flattenTextRuns(Array.from(element.childNodes), {}));
  const totalLength = textRunLength(runs);
  const start = snapshot && snapshot.start !== snapshot.end ? Math.max(0, Math.min(snapshot.start, totalLength)) : 0;
  const end = snapshot && snapshot.start !== snapshot.end ? Math.max(start, Math.min(snapshot.end, totalLength)) : totalLength;
  let offset = 0;
  const nextRuns: TextRun[] = [];

  for (const run of runs) {
    if (run.kind === "html") {
      nextRuns.push(run);
      continue;
    }

    const runStart = offset;
    const runEnd = offset + run.text.length;
    const selectedStart = Math.max(start, runStart);
    const selectedEnd = Math.min(end, runEnd);

    if (selectedStart > runStart) {
      nextRuns.push({ kind: "text", text: run.text.slice(0, selectedStart - runStart), style: run.style });
    }

    if (selectedStart < selectedEnd) {
      const selectedText = run.text.slice(selectedStart - runStart, selectedEnd - runStart);
      const style = format.toggle ? applyToggleToRunStyle(element, run.style, format.toggle) : { ...run.style, ...cssDeclarationToRunStyle(format.style ?? {}) };
      nextRuns.push({ kind: "text", text: selectedText, style });
    }

    if (selectedEnd < runEnd) {
      nextRuns.push({ kind: "text", text: run.text.slice(selectedEnd - runStart), style: run.style });
    }

    offset = runEnd;
  }

  element.innerHTML = renderTextRuns(mergeTextRuns(nextRuns));
  restoreTextSelection(element, { start, end });
}

function flattenTextRuns(nodes: ChildNode[], inheritedStyle: TextRunStyle): TextRun[] {
  return nodes.flatMap((node): TextRun[] => {
    if (node.nodeType === Node.TEXT_NODE) return [{ kind: "text", text: node.textContent ?? "", style: inheritedStyle }];
    if (node instanceof HTMLBRElement) return [{ kind: "text", text: "\n", style: inheritedStyle }];
    if (node instanceof HTMLImageElement) return [{ kind: "html", html: imageToken(node.src, node.alt || "Embedded image") }];
    if (!(node instanceof HTMLElement)) return [];

    const style = mergeElementStyle(inheritedStyle, node);
    const childRuns = flattenTextRuns(Array.from(node.childNodes), style);
    if (node.tagName === "DIV" || node.tagName === "P") return [...childRuns, { kind: "text", text: "\n", style }];
    return childRuns;
  });
}

function mergeElementStyle(base: TextRunStyle, element: HTMLElement): TextRunStyle {
  const next = { ...base };
  if (element.tagName === "B" || element.tagName === "STRONG") next.fontWeight = "700";
  if (element.tagName === "I" || element.tagName === "EM") next.fontStyle = "italic";
  if (element.tagName === "U") next.textDecorationLine = addDecoration(next.textDecorationLine, "underline");
  if (element.tagName === "S" || element.tagName === "STRIKE") next.textDecorationLine = addDecoration(next.textDecorationLine, "line-through");

  return { ...next, ...cssDeclarationToRunStyle(element.style) };
}

function cssDeclarationToRunStyle(style: Partial<CSSStyleDeclaration>): TextRunStyle {
  const next: TextRunStyle = {};
  if (style.color) next.color = style.color;
  if (style.backgroundColor) next.backgroundColor = style.backgroundColor;
  if (style.fontSize) next.fontSize = style.fontSize;
  if (style.fontFamily) next.fontFamily = style.fontFamily;
  if (style.fontWeight) next.fontWeight = style.fontWeight;
  if (style.fontStyle) next.fontStyle = style.fontStyle;
  if (style.textDecorationLine) next.textDecorationLine = style.textDecorationLine;
  return next;
}

function applyToggleToRunStyle(element: HTMLElement, style: TextRunStyle, toggle: TextStyleToggle): TextRunStyle {
  const next = { ...style };
  const activeStyle = toggledStyleForSelection(element, toggle);
  if (toggle === "bold") next.fontWeight = activeStyle.fontWeight === "400" ? "400" : "700";
  if (toggle === "italic") next.fontStyle = activeStyle.fontStyle === "normal" ? "normal" : "italic";
  if (toggle === "underline") {
    next.textDecorationLine = activeStyle.textDecorationLine === "none" ? removeDecoration(next.textDecorationLine, "underline") : addDecoration(next.textDecorationLine, "underline");
  }
  if (toggle === "strike") {
    next.textDecorationLine = activeStyle.textDecorationLine === "none" ? removeDecoration(next.textDecorationLine, "line-through") : addDecoration(next.textDecorationLine, "line-through");
  }
  return next;
}

function addDecoration(value: string | undefined, decoration: "underline" | "line-through") {
  const parts = value && value !== "none" ? value.split(" ").filter(Boolean) : [];
  return Array.from(new Set([...parts, decoration])).join(" ");
}

function removeDecoration(value: string | undefined, decoration: "underline" | "line-through") {
  const next = (value ?? "").split(" ").filter((part) => part && part !== decoration).join(" ");
  return next || "none";
}

function renderTextRuns(runs: TextRun[]) {
  return runs.map((run) => {
    if (run.kind === "html") return run.html;
    const html = escapeHtml(run.text).replace(/\n/g, "<br>");
    const style = runStyleToCss(run.style);
    return style ? `<span style="${escapeHtml(style)}">${html}</span>` : html;
  }).join("");
}

function runStyleToCss(style: TextRunStyle) {
  const parts: string[] = [];
  if (style.color) parts.push(`color: ${style.color};`);
  if (style.backgroundColor) parts.push(`background-color: ${style.backgroundColor};`);
  if (style.fontSize) parts.push(`font-size: ${style.fontSize};`);
  if (style.fontFamily) parts.push(`font-family: ${style.fontFamily};`);
  if (style.fontWeight) parts.push(`font-weight: ${style.fontWeight};`);
  if (style.fontStyle) parts.push(`font-style: ${style.fontStyle};`);
  if (style.textDecorationLine) parts.push(`text-decoration-line: ${style.textDecorationLine};`);
  return parts.join(" ");
}

function mergeTextRuns(runs: TextRun[]) {
  const merged: TextRun[] = [];
  for (const run of runs) {
    if (!run.kind || (run.kind === "text" && !run.text)) continue;
    const previous = merged[merged.length - 1];
    if (run.kind === "text" && previous?.kind === "text" && sameRunStyle(previous.style, run.style)) {
      previous.text += run.text;
    } else {
      merged.push(run);
    }
  }
  return merged;
}

function sameRunStyle(a: TextRunStyle, b: TextRunStyle) {
  return runStyleToCss(a) === runStyleToCss(b);
}

function textRunLength(runs: TextRun[]) {
  return runs.reduce((length, run) => length + (run.kind === "text" ? run.text.length : 0), 0);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getTextSelectionSnapshot(element: HTMLElement): TextSelectionSnapshot | null {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!element.contains(range.commonAncestorContainer)) return null;

  const before = document.createRange();
  before.selectNodeContents(element);
  before.setEnd(range.startContainer, range.startOffset);
  const start = before.toString().length;
  return { start, end: start + range.toString().length };
}

function restoreTextSelection(element: HTMLElement, snapshot: TextSelectionSnapshot | null) {
  element.focus();
  if (!snapshot) return;
  const range = rangeFromTextSelectionSnapshot(element, snapshot);
  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

function rangeFromTextSelectionSnapshot(element: HTMLElement, snapshot: TextSelectionSnapshot) {
  const range = document.createRange();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let startSet = false;
  let current = walker.nextNode();

  while (current) {
    const length = current.textContent?.length ?? 0;
    const nextOffset = offset + length;
    if (!startSet && snapshot.start <= nextOffset) {
      range.setStart(current, Math.max(0, snapshot.start - offset));
      startSet = true;
    }
    if (startSet && snapshot.end <= nextOffset) {
      range.setEnd(current, Math.max(0, snapshot.end - offset));
      return range;
    }
    offset = nextOffset;
    current = walker.nextNode();
  }

  range.selectNodeContents(element);
  return range;
}

function getClipboardImageFile(data: DataTransfer) {
  const file = Array.from(data.files).find((item) => item.type.startsWith("image/"));
  if (file) return file;
  return Array.from(data.items)
    .find((item) => item.kind === "file" && item.type.startsWith("image/"))
    ?.getAsFile();
}

function insertImageFile(file: File, element: HTMLElement, onChange: (value: string) => void, range?: Range | null) {
  if (!canStoreImageFile(file)) {
    showImageStorageLimitAlert();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const token = imageToken(String(reader.result), file.name);
    element.focus();
    insertHtmlAtRange(element, richTextToHtml(token), range);
    onChange(serializeRichElement(element));
  };
  reader.readAsDataURL(file);
}

function getSelectionRangeIn(element: HTMLElement) {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!element.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
}

function insertHtmlAtRange(element: HTMLElement, html: string, savedRange?: Range | null) {
  const selection = window.getSelection();
  const range = savedRange ?? getSelectionRangeIn(element);
  if (!selection || !range) return;
  range.deleteContents();
  const fragment = range.createContextualFragment(html);
  const lastNode = fragment.lastChild;
  range.insertNode(fragment);
  if (!lastNode) return;
  range.setStartAfter(lastNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function insertTextAtRange(element: HTMLElement, text: string, savedRange?: Range | null) {
  const selection = window.getSelection();
  const range = savedRange ?? getSelectionRangeIn(element);
  if (!selection || !range) return;
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function placeCaretAtEnd(element: HTMLElement) {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
}
