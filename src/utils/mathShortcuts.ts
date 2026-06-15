const shortcutMap: Record<string, string> = {
  "\\int": "∫",
  "\\lim": "lim",
  "\\sum": "∑",
  "\\sqrt": "√",
  "\\pi": "π",
  "\\theta": "θ",
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\rightarrow": "→",
  "\\to": "→",
  "\\infty": "∞",
  "\\leq": "≤",
  "\\geq": "≥",
  "\\neq": "≠",
  "\\times": "×",
  "\\div": "÷",
};

export function applyMathShortcuts(value: string) {
  return Object.entries(shortcutMap).reduce((next, [source, replacement]) => next.replaceAll(source, replacement), value);
}
