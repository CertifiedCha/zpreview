import { parse } from "mathjs";

export const FORMULA_SELECTION_EVENT = "formula-input-selection";
export const FORMULA_SET_SELECTION_EVENT = "formula-input-set-selection";

export type FormulaSelection = {
  start: number;
  end: number;
};

export type FormulaInputSelectionDetail = FormulaSelection & {
  blockId: string;
};

export type FormulaInsertTemplate = {
  id: string;
  label: string;
  latex?: string;
  caretOffset?: number;
  wrap?: {
    before: string;
    after: string;
    caretAfterSelected?: number;
  };
};

export type FormulaInsertGroup = {
  id: string;
  label: string;
  items: FormulaInsertTemplate[];
};

const BARE_COMMAND_TEMPLATES: Record<string, string> = {
  frac: "\\frac{}{}",
  sqrt: "\\sqrt{}",
  sum: "\\sum_{}^{}",
  int: "\\int_{}^{}",
  lim: "\\lim_{}",
};

const SYMBOL_WORDS: Record<string, string> = {
  pi: "\\pi",
  theta: "\\theta",
  alpha: "\\alpha",
  beta: "\\beta",
  gamma: "\\gamma",
  delta: "\\delta",
  lambda: "\\lambda",
  mu: "\\mu",
  omega: "\\omega",
  infinity: "\\infty",
  inf: "\\infty",
};

const FUNCTION_NAMES = ["sqrt", "sin", "cos", "tan", "asin", "acos", "atan", "ln", "log", "abs"];

export const FORMULA_CORE_INSERTS: FormulaInsertTemplate[] = [
  { id: "fraction", label: "Fraction", latex: "\\frac{}{}", caretOffset: "\\frac{".length, wrap: { before: "\\frac{", after: "}{}", caretAfterSelected: "}{".length } },
  { id: "superscript", label: "Exponent", latex: "^{}", caretOffset: "^{".length, wrap: { before: "", after: "^{}", caretAfterSelected: "^{".length } },
  { id: "subscript", label: "Subscript", latex: "_{}", caretOffset: "_{".length, wrap: { before: "", after: "_{}", caretAfterSelected: "_{".length } },
  { id: "sqrt", label: "Square root", latex: "\\sqrt{}", caretOffset: "\\sqrt{".length, wrap: { before: "\\sqrt{", after: "}" } },
  { id: "pi", label: "Pi", latex: "\\pi", caretOffset: "\\pi".length },
  { id: "euler", label: "Euler e", latex: "e", caretOffset: 1 },
  { id: "equals", label: "Equals", latex: "=", caretOffset: 1 },
  { id: "plusminus", label: "Plus or minus", latex: "\\pm", caretOffset: "\\pm".length },
  { id: "infinity", label: "Infinity", latex: "\\infty", caretOffset: "\\infty".length },
];

export const FORMULA_INSERT_GROUPS: FormulaInsertGroup[] = [
  {
    id: "structures",
    label: "Structures",
    items: [
      ...FORMULA_CORE_INSERTS.slice(0, 4),
      { id: "parentheses", label: "Parentheses", latex: "\\left(\\right)", caretOffset: "\\left(".length, wrap: { before: "\\left(", after: "\\right)" } },
      { id: "brackets", label: "Brackets", latex: "\\left[\\right]", caretOffset: "\\left[".length, wrap: { before: "\\left[", after: "\\right]" } },
      { id: "absolute", label: "Absolute value", latex: "\\left|\\right|", caretOffset: "\\left|".length, wrap: { before: "\\left|", after: "\\right|" } },
      { id: "matrix2", label: "2 by 2 matrix", latex: "\\begin{bmatrix}a & b \\\\ c & d\\end{bmatrix}", caretOffset: "\\begin{bmatrix}".length },
    ],
  },
  {
    id: "greek",
    label: "Greek",
    items: [
      { id: "alpha", label: "alpha", latex: "\\alpha", caretOffset: "\\alpha".length },
      { id: "beta", label: "beta", latex: "\\beta", caretOffset: "\\beta".length },
      { id: "gamma", label: "gamma", latex: "\\gamma", caretOffset: "\\gamma".length },
      { id: "delta", label: "delta", latex: "\\delta", caretOffset: "\\delta".length },
      { id: "theta", label: "theta", latex: "\\theta", caretOffset: "\\theta".length },
      { id: "lambda", label: "lambda", latex: "\\lambda", caretOffset: "\\lambda".length },
      { id: "mu", label: "mu", latex: "\\mu", caretOffset: "\\mu".length },
      { id: "pi", label: "pi", latex: "\\pi", caretOffset: "\\pi".length },
      { id: "omega", label: "omega", latex: "\\omega", caretOffset: "\\omega".length },
    ],
  },
  {
    id: "relations",
    label: "Relations",
    items: [
      { id: "leq", label: "less than or equal", latex: "\\leq", caretOffset: "\\leq".length },
      { id: "geq", label: "greater than or equal", latex: "\\geq", caretOffset: "\\geq".length },
      { id: "neq", label: "not equal", latex: "\\neq", caretOffset: "\\neq".length },
      { id: "approx", label: "approximately equal", latex: "\\approx", caretOffset: "\\approx".length },
      { id: "to", label: "right arrow", latex: "\\to", caretOffset: "\\to".length },
      { id: "leftarrow", label: "left arrow", latex: "\\leftarrow", caretOffset: "\\leftarrow".length },
      { id: "leftrightarrow", label: "left right arrow", latex: "\\leftrightarrow", caretOffset: "\\leftrightarrow".length },
      { id: "implies", label: "implies", latex: "\\Rightarrow", caretOffset: "\\Rightarrow".length },
    ],
  },
  {
    id: "functions",
    label: "Functions",
    items: [
      { id: "sin", label: "sine", latex: "\\sin\\left(\\right)", caretOffset: "\\sin\\left(".length },
      { id: "cos", label: "cosine", latex: "\\cos\\left(\\right)", caretOffset: "\\cos\\left(".length },
      { id: "tan", label: "tangent", latex: "\\tan\\left(\\right)", caretOffset: "\\tan\\left(".length },
      { id: "log", label: "log", latex: "\\log\\left(\\right)", caretOffset: "\\log\\left(".length },
      { id: "ln", label: "natural log", latex: "\\ln\\left(\\right)", caretOffset: "\\ln\\left(".length },
      { id: "eulerPower", label: "e to a power", latex: "e^{}", caretOffset: "e^{".length },
    ],
  },
  {
    id: "calculus",
    label: "Calculus",
    items: [
      { id: "sum", label: "summation", latex: "\\sum_{}^{}", caretOffset: "\\sum_{".length },
      { id: "integral", label: "integral", latex: "\\int_{}^{}", caretOffset: "\\int_{".length },
      { id: "limit", label: "limit", latex: "\\lim_{x\\to }", caretOffset: "\\lim_{x\\to ".length },
      { id: "derivative", label: "derivative", latex: "\\frac{d}{dx}", caretOffset: "\\frac{d}{dx}".length },
      { id: "partial", label: "partial derivative", latex: "\\frac{\\partial}{\\partial x}", caretOffset: "\\frac{\\partial}{\\partial x}".length },
    ],
  },
  {
    id: "sets",
    label: "Sets",
    items: [
      { id: "in", label: "in", latex: "\\in", caretOffset: "\\in".length },
      { id: "notin", label: "not in", latex: "\\notin", caretOffset: "\\notin".length },
      { id: "subset", label: "subset", latex: "\\subset", caretOffset: "\\subset".length },
      { id: "union", label: "union", latex: "\\cup", caretOffset: "\\cup".length },
      { id: "intersection", label: "intersection", latex: "\\cap", caretOffset: "\\cap".length },
    ],
  },
];

export function normalizeFormulaSource(value: string) {
  return convertFormulaInput(value, { preservePartial: true });
}

export function formulaPreviewSource(value: string) {
  return convertFormulaInput(value, { preservePartial: false });
}

export function insertFormulaTemplate(source: string, selection: FormulaSelection, template: FormulaInsertTemplate) {
  const safeSource = source ?? "";
  const start = clampIndex(selection.start, safeSource.length);
  const end = clampIndex(Math.max(selection.end, selection.start), safeSource.length);
  const selected = safeSource.slice(start, end);
  const templateText = template.latex ?? "";
  const wrap = selected ? template.wrap : undefined;
  const inserted = wrap ? `${wrap.before}${selected}${wrap.after}` : templateText;
  const caretOffset = wrap
    ? wrap.before.length + selected.length + (wrap.caretAfterSelected ?? wrap.after.length)
    : template.caretOffset ?? inserted.length;
  const value = `${safeSource.slice(0, start)}${inserted}${safeSource.slice(end)}`;
  const cursor = start + caretOffset;

  return {
    value: normalizeFormulaSource(value),
    selectionStart: cursor,
    selectionEnd: cursor,
  };
}

function convertFormulaInput(value: string, options: { preservePartial: boolean }): string {
  const source = value.replace(/\r\n/g, "\n").trim();
  if (!source) return "";
  if (isClearlyPartial(source)) return options.preservePartial ? value : source;

  const bareLatex = completeBareLatexCommand(source);
  if (bareLatex) return bareLatex;
  if (isLatexLike(source)) return source;

  const word = SYMBOL_WORDS[source.toLowerCase()];
  if (word) return word;

  const plainShortcut = plainShortcutToLatex(source);
  if (plainShortcut) return plainShortcut;

  const arrow = arrowExpressionToLatex(source, options);
  if (arrow) return arrow;

  return plainExpressionToLatex(source) ?? source;
}

function completeBareLatexCommand(source: string) {
  const command = source.startsWith("\\") ? source.slice(1) : source;
  return BARE_COMMAND_TEMPLATES[command.toLowerCase()];
}

function isLatexLike(source: string) {
  return /\\[A-Za-z]+|[{}]/.test(source);
}

function plainShortcutToLatex(source: string) {
  const lower = source.toLowerCase();
  if (lower === "sqrt") return "\\sqrt{}";
  const rootMatch = source.match(/^sqrt\s*(?:\((.+)\)|\s+(.+))$/i);
  if (rootMatch) {
    const inner = normalizeFormulaSource(rootMatch[1] ?? rootMatch[2] ?? "");
    return `\\sqrt{${inner}}`;
  }

  const functionMatch = source.match(/^(sin|cos|tan|ln|log)\s+([A-Za-z][A-Za-z0-9_]*|\d+(?:\.\d+)?)$/i);
  if (functionMatch) return `\\${functionMatch[1].toLowerCase()} ${normalizeFormulaSource(functionMatch[2])}`;

  return undefined;
}

function arrowExpressionToLatex(source: string, options: { preservePartial: boolean }) {
  const arrows: [string, string][] = [
    ["<->", "\\leftrightarrow"],
    ["->", "\\to"],
    ["<-", "\\leftarrow"],
    ["=>", "\\Rightarrow"],
  ];

  for (const [token, latex] of arrows) {
    const index = source.indexOf(token);
    if (index < 0) continue;
    const left = source.slice(0, index).trim();
    const right = source.slice(index + token.length).trim();
    if (!left || !right) return options.preservePartial ? source : source;
    return `${convertFormulaInput(left, options)} ${latex} ${convertFormulaInput(right, options)}`;
  }

  return undefined;
}

function plainExpressionToLatex(source: string) {
  try {
    const prepared = preparePlainExpression(source);
    return postProcessMathTex(parse(prepared).toTex());
  } catch {
    return undefined;
  }
}

function preparePlainExpression(source: string) {
  return source
    .replaceAll("π", "pi")
    .replaceAll("θ", "theta")
    .replaceAll("√", "sqrt")
    .replaceAll("≤", "<=")
    .replaceAll("≥", ">=")
    .replaceAll("≠", "!=")
    .replace(/\b(sin|cos|tan|asin|acos|atan|ln|log|abs|sqrt)\s+([A-Za-z][A-Za-z0-9_]*|\d+(?:\.\d+)?)(?!\s*\()/gi, "$1($2)");
}

function postProcessMathTex(value: string) {
  return value
    .replace(/\\mathrm\{([A-Za-z][A-Za-z0-9_]*)\}/g, "$1")
    .replace(/\{\s+/g, "{")
    .replace(/\s+\}/g, "}")
    .replace(/\\left\(\s*/g, "\\left(")
    .replace(/\s*\\right\)/g, "\\right)")
    .replace(/\s*=\s*/g, "=")
    .replace(/\s*(\\leq|\\geq|\\neq|<|>)\s*/g, "$1")
    .replace(/\{([A-Za-z0-9\\]+)\}\^\{([A-Za-z0-9]+)\}/g, "$1^$2")
    .replace(/~/g, "")
    .trim();
}

function isClearlyPartial(source: string) {
  if (!groupsAreBalanced(source)) return true;
  if (/\\[A-Za-z]+$/.test(source) && !completeBareLatexCommand(source)) return false;
  if (/[+\-*/=^_(,[<>]$/.test(source)) return true;
  return FUNCTION_NAMES.some((name) => source.toLowerCase().endsWith(`${name}(`));
}

function groupsAreBalanced(source: string) {
  const pairs: Record<string, string> = { "(": ")", "{": "}", "[": "]" };
  const stack: string[] = [];
  for (const char of source) {
    if (char in pairs) stack.push(pairs[char]);
    else if ((char === ")" || char === "}" || char === "]") && stack.pop() !== char) return false;
  }
  return stack.length === 0;
}

function clampIndex(value: number, length: number) {
  return Math.max(0, Math.min(length, Number.isFinite(value) ? value : length));
}
