const DESMOS_API_VERSION = "v1.12";
const DESMOS_DEMO_API_KEY = "dcb31709b452b1cf9dc26972add0fda6";

type DesmosScientificOptions = {
  allowComplex?: boolean;
  autosize?: boolean;
  backgroundColor?: string;
  decimalToFraction?: boolean;
  degreeMode?: boolean;
  fontSize?: number;
  functionDefinition?: boolean;
  links?: boolean;
  qwertyKeyboard?: boolean;
  settingsMenu?: boolean;
  textColor?: string;
  accentColor?: string;
};

export type DesmosBasicCalculator = {
  destroy: () => void;
  focusFirstExpression: () => void;
  getState?: () => unknown;
  setState?: (state: unknown) => void;
  observeEvent?: (event: string, handler: () => void) => void;
  resize: () => void;
  updateSettings: (options: DesmosScientificOptions) => void;
};

export type DesmosApi = {
  enabledFeatures?: {
    ScientificCalculator?: boolean;
  };
  ScientificCalculator: (element: HTMLElement, options?: DesmosScientificOptions) => DesmosBasicCalculator;
};

declare global {
  interface Window {
    Desmos?: DesmosApi;
  }
}

let desmosLoad: Promise<DesmosApi> | null = null;

export function loadDesmosCalculator() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("Desmos calculator can only run in a browser."));
  }
  if (window.Desmos?.ScientificCalculator) return Promise.resolve(window.Desmos);
  if (desmosLoad) return desmosLoad;

  desmosLoad = new Promise<DesmosApi>((resolve, reject) => {
    const apiKey = getDesmosApiKey();
    const scriptId = "desmos-calculator-api";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    function resolveIfReady() {
      if (window.Desmos?.ScientificCalculator) {
        resolve(window.Desmos);
        return true;
      }
      return false;
    }

    if (resolveIfReady()) return;

    const script = existingScript ?? document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.desmos.com/api/${DESMOS_API_VERSION}/calculator.js?apiKey=${encodeURIComponent(apiKey)}`;
    script.onload = () => {
      if (!resolveIfReady()) {
        reject(new Error("Desmos Scientific Calculator did not load."));
      }
    };
    script.onerror = () => reject(new Error("Unable to load the Desmos calculator API."));

    if (!existingScript) {
      document.head.appendChild(script);
    }
  });

  desmosLoad = desmosLoad.catch((error) => {
    desmosLoad = null;
    throw error;
  });

  return desmosLoad;
}

function getDesmosApiKey() {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  return env?.VITE_DESMOS_API_KEY || DESMOS_DEMO_API_KEY;
}
