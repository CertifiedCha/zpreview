import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "../theme";
import {
  FORMULA_SELECTION_EVENT,
  FORMULA_SET_SELECTION_EVENT,
  formulaPreviewSource,
  normalizeFormulaSource,
  type FormulaInputSelectionDetail,
} from "../utils/formulaInput";
import { MathFormula } from "./MathText";

type FormulaInputProps = {
  blockId: string;
  value?: string;
  onChange: (value: string) => void;
  display?: boolean;
  className?: string;
  previewClassName?: string;
  sourceClassName?: string;
  previewStyle?: CSSProperties;
  placeholder?: string;
};

export function FormulaInput({
  blockId,
  value = "",
  onChange,
  display = true,
  className,
  previewClassName,
  sourceClassName,
  previewStyle,
  placeholder = "Type a formula",
}: FormulaInputProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [draft, setDraft] = useState(value);
  const previewSource = formulaPreviewSource(draft);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    function applySelection(event: Event) {
      const detail = (event as CustomEvent<FormulaInputSelectionDetail>).detail;
      const input = inputRef.current;
      if (!input || detail?.blockId !== blockId) return;
      window.requestAnimationFrame(() => {
        input.focus();
        const start = Math.max(0, Math.min(input.value.length, detail.start));
        const end = Math.max(start, Math.min(input.value.length, detail.end));
        input.setSelectionRange(start, end);
        emitSelection(input);
      });
    }

    window.addEventListener(FORMULA_SET_SELECTION_EVENT, applySelection);
    return () => window.removeEventListener(FORMULA_SET_SELECTION_EVENT, applySelection);
  }, [blockId]);

  function emitSelection(input: HTMLTextAreaElement) {
    window.dispatchEvent(new CustomEvent<FormulaInputSelectionDetail>(FORMULA_SELECTION_EVENT, {
      detail: {
        blockId,
        start: input.selectionStart,
        end: input.selectionEnd,
      },
    }));
  }

  function commit(rawValue = draft) {
    const normalized = normalizeFormulaSource(rawValue);
    setDraft(normalized);
    if (normalized !== value) onChange(normalized);
    return normalized;
  }

  function update(nextValue: string, input: HTMLTextAreaElement) {
    setDraft(nextValue);
    if (nextValue !== value) onChange(nextValue);
    window.requestAnimationFrame(() => emitSelection(input));
  }

  return (
    <div className={cn("formula-input", className)}>
      <div className={cn("formula-input-preview", previewClassName)} style={previewStyle} aria-hidden={!draft.trim()}>
        {draft.trim() ? (
          <MathFormula value={previewSource} display={display} className="formula-input-preview-render" />
        ) : (
          <span className="formula-input-placeholder">f(x)</span>
        )}
      </div>
      <textarea
        ref={inputRef}
        className={cn("formula-input-source", sourceClassName)}
        data-formula-input="true"
        data-formula-block-id={blockId}
        spellCheck={false}
        value={draft}
        placeholder={placeholder}
        rows={2}
        onBlur={() => commit()}
        onChange={(event) => update(event.currentTarget.value, event.currentTarget)}
        onClick={(event) => emitSelection(event.currentTarget)}
        onFocus={(event) => emitSelection(event.currentTarget)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey) return;
          event.preventDefault();
          const normalized = commit(event.currentTarget.value);
          window.requestAnimationFrame(() => {
            event.currentTarget.setSelectionRange(normalized.length, normalized.length);
            emitSelection(event.currentTarget);
          });
        }}
        onKeyUp={(event) => {
          if (event.key === " ") {
            const normalized = commit(event.currentTarget.value);
            window.requestAnimationFrame(() => {
              event.currentTarget.setSelectionRange(normalized.length, normalized.length);
              emitSelection(event.currentTarget);
            });
            return;
          }
          emitSelection(event.currentTarget);
        }}
        onSelect={(event) => emitSelection(event.currentTarget)}
      />
    </div>
  );
}
