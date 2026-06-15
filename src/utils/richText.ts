import { applyMathShortcuts } from "./mathShortcuts";

export type RichSegment =
  | { kind: "text"; value: string }
  | { kind: "image"; src: string; alt: string };

const imageTokenPattern = /<img\s+[^>]*src=(["'])(.*?)\1[^>]*>/gi;
const richMarkupPattern = /<(span|b|strong|i|em|u|s|br|img)\b/i;

export function parseRichSegments(value: string): RichSegment[] {
  const segments: RichSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imageTokenPattern.exec(value))) {
    if (match.index > lastIndex) {
      segments.push({ kind: "text", value: value.slice(lastIndex, match.index) });
    }

    const token = match[0];
    segments.push({
      kind: "image",
      src: decodeAttribute(match[2]),
      alt: decodeAttribute(readAttribute(token, "alt") ?? "Embedded image"),
    });
    lastIndex = match.index + token.length;
  }

  if (lastIndex < value.length) segments.push({ kind: "text", value: value.slice(lastIndex) });
  return segments.length ? segments : [{ kind: "text", value }];
}

export function richTextToHtml(value: string) {
  if (richMarkupPattern.test(value)) return sanitizeRichHtml(value);

  return parseRichSegments(value)
    .map((segment) => {
      if (segment.kind === "image") {
        return `<img class="inline-content-image" src="${encodeAttribute(segment.src)}" alt="${encodeAttribute(segment.alt)}">`;
      }
      return escapeHtml(segment.value).replace(/\n/g, "<br>");
    })
    .join("");
}

export function serializeRichElement(element: HTMLElement) {
  return Array.from(element.childNodes)
    .map(serializeNode)
    .join("")
    .replace(/\u00a0/g, " ");
}

export function imageToken(src: string, alt = "Embedded image") {
  return `<img src="${encodeAttribute(src)}" alt="${encodeAttribute(alt)}">`;
}

function serializeNode(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) return applyMathShortcuts(node.textContent ?? "");
  if (node instanceof HTMLImageElement) return imageToken(node.src, node.alt || "Embedded image");
  if (node instanceof HTMLBRElement) return "\n";
  if (node instanceof HTMLElement) {
    const inner = Array.from(node.childNodes).map(serializeNode).join("");
    if (node.tagName === "DIV" || node.tagName === "P") return `${inner}\n`;
    if (node.tagName === "SPAN") return spanToken(node, inner);
    if (node.tagName === "B" || node.tagName === "STRONG") return `<span style="font-weight: 700;">${inner}</span>`;
    if (node.tagName === "I" || node.tagName === "EM") return `<span style="font-style: italic;">${inner}</span>`;
    if (node.tagName === "U") return `<span style="text-decoration-line: underline;">${inner}</span>`;
    if (node.tagName === "S" || node.tagName === "STRIKE") return `<span style="text-decoration-line: line-through;">${inner}</span>`;
    return inner;
  }
  return "";
}

function spanToken(element: HTMLElement, inner: string) {
  const style = safeStyleFromElement(element);
  if (!style || !inner) return inner;
  return `<span style="${encodeAttribute(style)}">${inner}</span>`;
}

function sanitizeRichHtml(value: string) {
  const template = document.createElement("template");
  template.innerHTML = value;
  return Array.from(template.content.childNodes).map(sanitizeNode).join("");
}

function sanitizeNode(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) return escapeHtml(applyMathShortcuts(node.textContent ?? ""));
  if (node instanceof HTMLImageElement) return imageToken(node.src, node.alt || "Embedded image");
  if (node instanceof HTMLBRElement) return "<br>";
  if (!(node instanceof HTMLElement)) return "";

  const inner = Array.from(node.childNodes).map(sanitizeNode).join("");
  if (node.tagName === "DIV" || node.tagName === "P") return `${inner}<br>`;
  if (node.tagName === "B" || node.tagName === "STRONG") return `<span style="font-weight: 700;">${inner}</span>`;
  if (node.tagName === "I" || node.tagName === "EM") return `<span style="font-style: italic;">${inner}</span>`;
  if (node.tagName === "U") return `<span style="text-decoration-line: underline;">${inner}</span>`;
  if (node.tagName === "S" || node.tagName === "STRIKE") return `<span style="text-decoration-line: line-through;">${inner}</span>`;
  if (node.tagName === "SPAN") {
    const style = safeStyleFromElement(node);
    return style ? `<span style="${encodeAttribute(style)}">${inner}</span>` : inner;
  }
  return inner;
}

function safeStyleFromElement(element: HTMLElement) {
  const styles: string[] = [];
  const color = normalizeCssColor(element.style.color);
  const backgroundColor = normalizeCssColor(element.style.backgroundColor);
  const fontSize = normalizeCssLength(element.style.fontSize);
  const fontFamily = normalizeFontFamily(element.style.fontFamily);
  const fontWeight = normalizeFontWeight(element.style.fontWeight);
  const fontStyle = element.style.fontStyle === "italic" || element.style.fontStyle === "normal" ? element.style.fontStyle : "";
  const textDecoration = normalizeTextDecoration(element.style.textDecorationLine || element.style.textDecoration);

  if (color) styles.push(`color: ${color};`);
  if (backgroundColor) styles.push(`background-color: ${backgroundColor};`);
  if (fontSize) styles.push(`font-size: ${fontSize};`);
  if (fontFamily) styles.push(`font-family: ${fontFamily};`);
  if (fontWeight) styles.push(`font-weight: ${fontWeight};`);
  if (fontStyle) styles.push(`font-style: ${fontStyle};`);
  if (textDecoration) styles.push(`text-decoration-line: ${textDecoration};`);
  return styles.join(" ");
}

function normalizeCssColor(value: string) {
  return /^(#[0-9a-f]{3,8}|rgb[a]?\([0-9.,%\s]+\)|[a-z]+)$/i.test(value) ? value : "";
}

function normalizeCssLength(value: string) {
  return /^([1-9][0-9]?|1[0-9]{2})px$/.test(value) ? value : "";
}

function normalizeFontFamily(value: string) {
  if (!value || /[;{}<>]/.test(value)) return "";
  return value.split(",").slice(0, 3).map((item) => item.trim()).filter(Boolean).join(", ");
}

function normalizeFontWeight(value: string) {
  if (value === "bold") return "700";
  return /^(400|500|600|700|800|900)$/.test(value) ? value : "";
}

function normalizeTextDecoration(value: string) {
  if (value === "none") return "none";
  const parts = value.split(" ").filter((part) => part === "underline" || part === "line-through");
  return parts.length ? Array.from(new Set(parts)).join(" ") : "";
}

function readAttribute(token: string, attribute: string) {
  const match = token.match(new RegExp(`${attribute}=(["'])(.*?)\\1`, "i"));
  return match?.[2];
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function encodeAttribute(value: string) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function decodeAttribute(value: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}
