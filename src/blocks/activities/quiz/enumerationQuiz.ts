import type { EnumerationQuizItem } from "../../../types";
import { uid } from "../../../theme";

export function createEnumerationQuizItem(accepted: string[] = ["New answer"]): EnumerationQuizItem {
  return {
    id: uid("enum"),
    accepted: normalizeAcceptedAnswers(accepted),
  };
}

export function createDefaultEnumerationQuizItems(): EnumerationQuizItem[] {
  return [
    createEnumerationQuizItem(["First expected answer", "Accepted alternate for first answer"]),
    createEnumerationQuizItem(["Second expected answer", "Accepted alternate for second answer"]),
  ];
}

export function normalizeEnumerationQuizItems(value: unknown, fallback?: EnumerationQuizItem[]): EnumerationQuizItem[] {
  const fallbackItems = fallback?.length ? fallback : createDefaultEnumerationQuizItems();
  if (!Array.isArray(value)) return structuredClone(fallbackItems);
  const items = value.flatMap((candidate): EnumerationQuizItem[] => {
    if (!candidate || typeof candidate !== "object") return [];
    const raw = candidate as Partial<EnumerationQuizItem>;
    return [{
      id: typeof raw.id === "string" && raw.id ? raw.id : uid("enum"),
      accepted: normalizeAcceptedAnswers(raw.accepted),
    }];
  });
  return items.length ? items : structuredClone(fallbackItems);
}

export function enumerationAnswersAreCorrect(items: EnumerationQuizItem[], answers: string[], options: { caseSensitive?: boolean; spaceSensitive?: boolean } = {}) {
  if (!items.length) return false;
  return items.every((item, index) => {
    const answer = normalizeEnumerationAnswer(answers[index], options);
    return !!answer && item.accepted.some((accepted) => normalizeEnumerationAnswer(accepted, options) === answer);
  });
}

export function allEnumerationAnswersFilled(items: EnumerationQuizItem[], answers: string[]) {
  return items.length > 0 && items.every((_item, index) => answers[index]?.trim());
}

export function normalizeAcceptedAnswers(value: unknown): string[] {
  const source = Array.isArray(value) ? value : [];
  const answers = source.map((item) => String(item ?? "").trim()).filter(Boolean);
  return answers.length ? answers : ["New answer"];
}

function normalizeEnumerationAnswer(value: string | undefined, options: { caseSensitive?: boolean; spaceSensitive?: boolean }) {
  const trimmed = (value ?? "").trim();
  const spaced = options.spaceSensitive ? trimmed : trimmed.replace(/\s+/g, "");
  return options.caseSensitive ? spaced : spaced.toLowerCase();
}
