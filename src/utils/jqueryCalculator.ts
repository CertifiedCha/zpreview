import $ from "jquery";

type CalculatorStatic = JQueryStatic & {
  calculator?: {
    scientificLayout: string[];
  };
};

let pluginLoad: Promise<CalculatorStatic> | null = null;

export function loadJQueryCalculator() {
  if (!pluginLoad) {
    const globalWindow = window as Window & typeof globalThis & { $: JQueryStatic; jQuery: JQueryStatic };
    globalWindow.$ = $;
    globalWindow.jQuery = $;

    pluginLoad = import("jquery.calculator/jquery.plugin.js")
      .then(() => import("jquery.calculator/jquery.calculator.js"))
      .then(() => $ as CalculatorStatic);
  }

  return pluginLoad;
}
