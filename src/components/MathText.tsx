"use client";
import katex from "katex";
import { Fragment, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "../theme";
import { applyMathShortcuts } from "../utils/mathShortcuts";
import { parseRichSegments, richTextToHtml } from "../utils/richText";

type MathTextProps = {
  text?: string;
  className?: string;
  style?: CSSProperties;
  block?: boolean;
};

type MathSegment =
  | { kind: "text"; value: string }
  | { kind: "image"; src: string; alt: string }
  | { kind: "math"; value: string; raw: string; display: boolean };

export function MathText({ text = "", className, style, block }: MathTextProps) {
  if (hasRichTextMarkup(text)) {
    const Element = block ? "div" : "span";
    return <Element className={cn("math-text", block && "block", className)} style={style} dangerouslySetInnerHTML={{ __html: richTextToHtml(text) }} />;
  }

  const segments = parseRichMathSegments(text);
  const Element = block ? "div" : "span";

  return (
    <Element className={cn("math-text", block && "block", className)} style={style}>
      {segments.map((segment, index) => {
        if (segment.kind === "text") return <Fragment key={index}>{renderTextWithBreaks(segment.value)}</Fragment>;
        if (segment.kind === "image") return <img key={index} className="inline-content-image" src={segment.src} alt={segment.alt} />;
        const html = renderKatex(segment.value, segment.display);
        if (!html) return <Fragment key={index}>{segment.raw}</Fragment>;
        return <span key={index} className={segment.display ? "my-3 block text-center" : "inline-block align-baseline"} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </Element>
  );
}

function hasRichTextMarkup(text: string) {
  return /<(span|b|strong|i|em|u|s|br|img)\b/i.test(text);
}

function renderTextWithBreaks(value: string) {
  return value.split("\n").map((part, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {part}
    </Fragment>
  ));
}

function parseRichMathSegments(text: string) {
  return parseRichSegments(text).flatMap((segment): MathSegment[] => {
    if (segment.kind === "image") return [segment];
    return parseMathSegments(segment.value);
  });
}

export function MathFormula({ value = "", display = true, className, style }: { value?: string; display?: boolean; className?: string; style?: CSSProperties }) {
  const html = renderKatex(value, display);
  const shouldFitMobile = className?.split(/\s+/).includes("equation-formula");
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const [fit, setFit] = useState<{ scale: number; height?: number }>({ scale: 1 });

  useLayoutEffect(() => {
    if (!shouldFitMobile) return undefined;

    const updateFit = () => {
      const wrapper = wrapperRef.current;
      const inner = innerRef.current;
      if (!wrapper || !inner || !window.matchMedia("(max-width: 820px)").matches) {
        setFit({ scale: 1 });
        return;
      }

      const formula = inner.querySelector<HTMLElement>(".katex-html, .katex");
      const availableWidth = Math.max(1, wrapper.clientWidth - 2);
      const naturalWidth = Math.max(formula?.scrollWidth ?? 0, inner.scrollWidth, formula?.getBoundingClientRect().width ?? 0);
      const naturalHeight = Math.max(formula?.scrollHeight ?? 0, inner.scrollHeight, formula?.getBoundingClientRect().height ?? 0);
      const scale = Math.min(1, availableWidth / Math.max(1, naturalWidth));
      setFit({ scale, height: Math.ceil(naturalHeight * scale) + 2 });
    };

    updateFit();
    const resizeObserver = new ResizeObserver(updateFit);
    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);
    if (innerRef.current) resizeObserver.observe(innerRef.current);
    document.fonts?.ready.then(updateFit).catch(() => undefined);
    window.addEventListener("resize", updateFit);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateFit);
    };
  }, [html, shouldFitMobile]);

  const fitStyle = shouldFitMobile ? ({ "--equation-fit-scale": fit.scale } as CSSProperties) : undefined;
  const wrapperStyle = shouldFitMobile && fit.height ? { ...style, height: `${fit.height}px` } : style;

  return (
    <span ref={wrapperRef} className={className} style={wrapperStyle}>
      <span ref={innerRef} className={shouldFitMobile ? "equation-formula-inner" : undefined} style={fitStyle} dangerouslySetInnerHTML={{ __html: html || value }} />
    </span>
  );
}

function parseMathSegments(text: string) {
  const segments: MathSegment[] = [];
  const pattern = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      segments.push({ kind: "text", value: applyMathShortcuts(text.slice(lastIndex, match.index)) });
    }

    const raw = match[0];
    const display = raw.startsWith("$$");
    segments.push({
      kind: "math",
      value: display ? raw.slice(2, -2) : raw.slice(1, -1),
      raw,
      display,
    });
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    segments.push({ kind: "text", value: applyMathShortcuts(text.slice(lastIndex)) });
  }

  return segments;
}

function renderKatex(value: string, displayMode: boolean) {
  try {
    return katex.renderToString(value, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
    });
  } catch {
    return "";
  }
}
