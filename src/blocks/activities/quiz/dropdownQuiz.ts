import type { DropdownQuizBlank, DropdownQuizItem, DropdownQuizOption } from "../../../types";
import { uid } from "../../../theme";

const DEFAULT_OPTIONS = ["Option 1", "Option 2", "Option 3"];

export function countDropdownMarkers(text: string) {
  return (text.match(/___/g) ?? []).length;
}

export function createDropdownQuizOption(text = "New option"): DropdownQuizOption {
  return { id: uid("dropdown-option"), text };
}

export function createDropdownQuizBlank(optionTexts: string[] = DEFAULT_OPTIONS, correctIndex = 0): DropdownQuizBlank {
  const options = ensureDropdownOptions(optionTexts.map((text) => createDropdownQuizOption(text)));
  return {
    id: uid("dropdown-blank"),
    options,
    correctOptionId: options[Math.min(Math.max(correctIndex, 0), options.length - 1)].id,
  };
}

export function cloneDropdownQuizBlank(template: DropdownQuizBlank): DropdownQuizBlank {
  const normalized = normalizeDropdownBlank(template);
  const correctIndex = Math.max(0, normalized.options.findIndex((option) => option.id === normalized.correctOptionId));
  return createDropdownQuizBlank(normalized.options.map((option) => option.text), correctIndex);
}

export function createDropdownQuizItem(text = "Choose the correct answer: ___.", blanks?: DropdownQuizBlank[]): DropdownQuizItem {
  const markerCount = countDropdownMarkers(text);
  return {
    id: uid("dropdown-item"),
    text,
    blanks: Array.from({ length: markerCount }, (_, index) => normalizeDropdownBlank(blanks?.[index], blanks?.[0]?.options)),
  };
}

export function createDefaultDropdownQuizItems(): DropdownQuizItem[] {
  return [
    createDropdownQuizItem("Students choose the correct option here: ___.", [createDropdownQuizBlank(DEFAULT_OPTIONS, 0)]),
    createDropdownQuizItem("Add another dropdown blank like ___.", [createDropdownQuizBlank(DEFAULT_OPTIONS, 1)]),
  ];
}

export function syncDropdownQuizItem(
  item: DropdownQuizItem,
  text: string,
  optionTemplate?: DropdownQuizOption[],
  insertAtBlankIndex = item.blanks.length,
  previousBlankTemplate?: DropdownQuizBlank,
): DropdownQuizItem {
  const markerCount = countDropdownMarkers(text);
  const blanks = item.blanks.map((blank) => normalizeDropdownBlank(blank));

  if (markerCount > blanks.length) {
    const insertionIndex = Math.max(0, Math.min(insertAtBlankIndex, blanks.length));
    const added: DropdownQuizBlank[] = [];
    for (let index = 0; index < markerCount - blanks.length; index += 1) {
      const template = added[added.length - 1] ?? blanks[insertionIndex - 1] ?? previousBlankTemplate;
      added.push(template ? cloneDropdownQuizBlank(template) : normalizeDropdownBlank(undefined, optionTemplate ?? item.blanks[0]?.options));
    }
    blanks.splice(insertionIndex, 0, ...added);
  }

  return {
    ...item,
    text,
    blanks: blanks.slice(0, markerCount),
  };
}

export function normalizeDropdownQuizItems(value: unknown, fallback = createDefaultDropdownQuizItems()): DropdownQuizItem[] {
  if (!Array.isArray(value)) return structuredClone(fallback);
  const items = value.flatMap((candidate): DropdownQuizItem[] => {
    if (!candidate || typeof candidate !== "object") return [];
    const raw = candidate as Partial<DropdownQuizItem>;
    const text = typeof raw.text === "string" ? raw.text : "";
    const rawBlanks = Array.isArray(raw.blanks) ? raw.blanks : [];
    return [{
      id: typeof raw.id === "string" && raw.id ? raw.id : uid("dropdown-item"),
      text,
      blanks: Array.from({ length: countDropdownMarkers(text) }, (_, index) => normalizeDropdownBlank(rawBlanks[index])),
    }];
  });
  return items.length ? items : structuredClone(fallback);
}

export function mergeDropdownQuizOptions(items: DropdownQuizItem[]): DropdownQuizItem[] {
  const merged = dedupeDropdownOptions(items.flatMap((item) => item.blanks.flatMap((blank) => blank.options)));
  const options = ensureDropdownOptions(merged);
  return applyDropdownOptionsToAll(items, options);
}

export function applyDropdownOptionsToAll(items: DropdownQuizItem[], options: DropdownQuizOption[]): DropdownQuizItem[] {
  const nextOptions = ensureDropdownOptions(options);
  return items.map((item) => ({
    ...item,
    blanks: item.blanks.map((blank) => {
      const previousCorrectText = blank.options.find((option) => option.id === blank.correctOptionId)?.text;
      const correctOption = previousCorrectText
        ? nextOptions.find((option) => normalizedOptionText(option.text) === normalizedOptionText(previousCorrectText))
        : undefined;
      return {
        ...blank,
        options: structuredClone(nextOptions),
        correctOptionId: correctOption?.id ?? nextOptions[0].id,
      };
    }),
  }));
}

export function removeDropdownOption(blank: DropdownQuizBlank, optionId: string): DropdownQuizBlank {
  if (blank.options.length <= 2) return blank;
  const options = blank.options.filter((option) => option.id !== optionId);
  return {
    ...blank,
    options,
    correctOptionId: blank.correctOptionId === optionId ? options[0].id : blank.correctOptionId,
  };
}

export function dropdownAnswersAreCorrect(items: DropdownQuizItem[], answers: Record<string, string>) {
  const blanks = items.flatMap((item) => item.blanks);
  return blanks.length > 0 && blanks.every((blank) => answers[blank.id] === blank.correctOptionId);
}

export function allDropdownsAnswered(items: DropdownQuizItem[], answers: Record<string, string>) {
  const blanks = items.flatMap((item) => item.blanks);
  return blanks.length > 0 && blanks.every((blank) => Boolean(answers[blank.id]));
}

function normalizeDropdownBlank(value?: unknown, fallbackOptions?: DropdownQuizOption[]): DropdownQuizBlank {
  const raw = value && typeof value === "object" ? value as Partial<DropdownQuizBlank> : {};
  const rawOptions = Array.isArray(raw.options) ? raw.options : fallbackOptions;
  const options = ensureDropdownOptions(normalizeDropdownOptions(rawOptions));
  const correctOptionId = typeof raw.correctOptionId === "string" && options.some((option) => option.id === raw.correctOptionId)
    ? raw.correctOptionId
    : options[0].id;
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : uid("dropdown-blank"),
    options,
    correctOptionId,
  };
}

function normalizeDropdownOptions(value?: unknown): DropdownQuizOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate): DropdownQuizOption[] => {
    if (!candidate || typeof candidate !== "object") return [];
    const raw = candidate as Partial<DropdownQuizOption>;
    if (typeof raw.text !== "string") return [];
    return [{ id: typeof raw.id === "string" && raw.id ? raw.id : uid("dropdown-option"), text: raw.text }];
  });
}

function dedupeDropdownOptions(options: DropdownQuizOption[]) {
  const seen = new Set<string>();
  return options.flatMap((option) => {
    const key = normalizedOptionText(option.text);
    if (!key || seen.has(key)) return [];
    seen.add(key);
    return [{ ...option, text: option.text.trim() }];
  });
}

function ensureDropdownOptions(options: DropdownQuizOption[]) {
  const deduped = dedupeDropdownOptions(options);
  const fallbackLabels = ["Option 1", "Option 2"];
  while (deduped.length < 2) {
    const label = fallbackLabels[deduped.length];
    deduped.push(createDropdownQuizOption(label));
  }
  return deduped;
}

function normalizedOptionText(value: string) {
  return value.trim().toLocaleLowerCase();
}
