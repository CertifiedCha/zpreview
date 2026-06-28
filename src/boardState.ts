import type { Block, BlockLocation, Board, BoardColumn, BoardHeader, ColumnCount, FlashcardItem, FrozenBoardColumn, MiniPage, Page } from "./types";
import { blockDefinitions, createDefaultBlock } from "./blockRegistry";
import { BOARD_DOCUMENT_SCHEMA_VERSION } from "./boardContract";
import { normalizeDropdownQuizItems } from "./blocks/activities/quiz/dropdownQuiz";
import { normalizeEnumerationQuizItems } from "./blocks/activities/quiz/enumerationQuiz";
import { uid } from "./theme";

export const STORAGE_KEY = "edu-block-board-v1";
export const DEFAULT_BLOCK_GAP = 20;
export const DEFAULT_HITBOX_INSET = 0;
export const MAX_PINNED_COLUMNS = 2;
export const HEADER_CONTAINER_ID = "header:content";
export const HEADER_ALLOWED_BLOCK_TYPES: Block["type"][] = ["previousPage", "nextPage", "goToPage", "paragraph", "sectionHeader", "line", "separator", "hyperlink"];

export function createInitialBoard(): Board {
  const title = createDefaultBlock("title");
  const paragraph = createDefaultBlock("paragraph");
  const quiz = createDefaultBlock("quiz");
  const continueBlock = createDefaultBlock("continue");
  const page = createPage("Introduction", [title, paragraph, quiz, continueBlock]);

  return {
    schemaVersion: BOARD_DOCUMENT_SCHEMA_VERSION,
    id: uid("board"),
    title: "Untitled Board",
    description: "A visual lesson built from blocks.",
    themeId: "brilliant-blue",
    blockGap: DEFAULT_BLOCK_GAP,
    hitboxInset: DEFAULT_HITBOX_INSET,
    defaultColumnCount: 1,
    frozenColumns: [],
    pinnedFrozenColumnIds: [],
    header: createDefaultHeader(),
    studentProgressPersistence: "session",
    pages: [page],
    currentPageId: page.id,
    updatedAt: Date.now(),
  };
}

export function createHighSchoolMotionLessonBoard(): Board {
  const pageOne = createPage("Start Here", [
      block("title", {
        title: "Motion and Forces",
        subtitle: "A beginner-friendly high-school physics lesson that builds slowly from everyday observations to equations and simulation.",
      }),
      block("sectionHeader", {
        label: "Before we calculate",
        title: "Physics starts with noticing",
        subtitle: "You do not need to memorize formulas first. Start by describing what you see.",
      }),
      block("paragraph", {
        text: "Imagine watching a cart roll across the classroom floor. At first it is beside your desk. A few seconds later it is near the door. Even before we know any equations, we can say something important happened: the cart's position changed over time. That simple idea is the beginning of motion.",
      }),
      block("callout", {
        title: "Learning goal",
        text: "By the end, you should be able to explain position, distance, displacement, speed, velocity, acceleration, and net force in your own words.",
      }),
      block("continue", { label: "I understand the goal" }),
      block("paragraph", {
        text: "A beginner mistake is trying to solve too quickly. In this lesson, we will slow down. First we will name the quantities. Then we will compare them. Only after that will we calculate and use a simulation.",
      }),
      block("keyPoints", {
        title: "The big map",
        rows: [
          ["Position tells where something is."],
          ["Distance tells how much ground was covered."],
          ["Displacement tells the change from start to finish, including direction."],
          ["Speed tells how fast distance changes."],
          ["Velocity tells how fast displacement changes, including direction."],
          ["Acceleration tells how quickly velocity changes."],
          ["Force is a push or pull that can change motion."],
        ],
      }),
      block("quiz", {
        question: "If an object is moving, what must be changing?",
        choices: [
          { id: "a", text: "Its color" },
          { id: "b", text: "Its position over time" },
          { id: "c", text: "Its mass" },
          { id: "d", text: "Its name" },
        ],
        correctChoiceId: "b",
        correctExplanation: "Correct. Motion means position changes as time passes.",
        incorrectExplanation: "Not quite. Motion is about position changing over time.",
        hint: "Ask: where was it before, and where is it now?",
      }),
      block("nextPage", { label: "Learn position and distance" }),
    ]);

  const pageTwo = createPage("Position and Distance", [
      block("title", {
        title: "Position, Distance, and Displacement",
        subtitle: "These three words sound similar, but they answer different questions.",
      }),
      block("sectionHeader", {
        label: "Concept 1",
        title: "Position answers: Where is it?",
        subtitle: "Position is an object's location compared with a reference point.",
      }),
      block("paragraph", {
        text: "A reference point is the place you measure from. If the classroom door is our reference point, we might say a cart is 2 meters to the left of the door. If your desk is the reference point, the number may be different. Position always depends on what you choose as zero.",
      }),
      block("table", {
        title: "Example positions",
        rows: [
          ["Object", "Reference point", "Position"],
          ["Cart", "Door", "2 m left"],
          ["Book", "Desk edge", "0.4 m right"],
          ["Student", "Front board", "5 m back"],
        ],
      }, { style: { tableBorderMode: "rows", tableHeaderFillColor: "transparent", tableHeaderFontColor: "#2563eb" } }),
      block("continue", { label: "Continue to distance" }),
      block("sectionHeader", {
        label: "Concept 2",
        title: "Distance answers: How much ground?",
        subtitle: "Distance counts the total path traveled.",
      }),
      block("paragraph", {
        text: "If you walk 3 meters forward and then 3 meters back, your distance traveled is 6 meters. Distance does not care that you ended where you started. It only adds up the path you actually walked.",
      }),
      block("sectionHeader", {
        label: "Concept 3",
        title: "Displacement answers: What changed from start to finish?",
        subtitle: "Displacement includes direction and ignores extra wandering.",
      }),
      block("paragraph", {
        text: "In the same walk, you moved 3 meters forward and 3 meters back. Your final position is the same as your starting position, so your displacement is 0 meters. This is why distance and displacement can be very different.",
      }),
      block("quiz", {
        question: "A student walks 4 m east, then 4 m west back to the starting point. What is the distance traveled?",
        choices: [
          { id: "a", text: "0 m" },
          { id: "b", text: "4 m" },
          { id: "c", text: "8 m" },
          { id: "d", text: "16 m" },
        ],
        correctChoiceId: "c",
        correctExplanation: "Yes. Distance adds the whole path: 4 m + 4 m = 8 m.",
        incorrectExplanation: "Careful: distance counts the path, not just the final change.",
        hint: "Add every part of the walk.",
      }),
      block("quiz", {
        question: "The same student ends where they started. What is the displacement?",
        choices: [
          { id: "a", text: "0 m" },
          { id: "b", text: "4 m east" },
          { id: "c", text: "8 m" },
          { id: "d", text: "8 m west" },
        ],
        correctChoiceId: "a",
        correctExplanation: "Correct. The start and end positions are the same, so displacement is 0 m.",
        incorrectExplanation: "Displacement compares only the starting position and final position.",
        hint: "Where did the student finish compared with where they began?",
      }),
      block("nextPage", { label: "Speed and velocity" }),
    ]);

  const pageThree = createPage("Speed and Velocity", [
      block("title", {
        title: "Speed and Velocity",
        subtitle: "Now we describe how quickly position changes.",
      }),
      block("sectionHeader", {
        label: "Speed",
        title: "Speed is distance divided by time",
        subtitle: "It tells how fast something is moving, without saying which direction.",
      }),
      block("equation", {
        mathSource: "speed = \\frac{distance}{time}",
        caption: "The unit is often meters per second, written m/s.",
      }, { settings: { showCaption: true, mathDisplay: "display" } }),
      block("paragraph", {
        text: "If a cart travels 10 meters in 2 seconds, its speed is 5 meters per second. That means that, on average, the cart covers 5 meters every second.",
      }),
      block("quiz", {
        question: "If a runner travels 12 m in 3 s, what is the runner's speed?",
        answerText: "4 m/s",
        correctExplanation: "Correct. 12 divided by 3 is 4, so the speed is 4 m/s.",
        incorrectExplanation: "Use speed = distance / time.",
        hint: "Divide 12 m by 3 s.",
      }, { settings: { quizVariant: "shortAnswer" } }),
      block("continue", { label: "Continue" }),
      block("sectionHeader", {
        label: "Velocity",
        title: "Velocity is speed with direction",
        subtitle: "Direction matters when the path is not just a number.",
      }),
      block("paragraph", {
        text: "Speed might say '5 m/s.' Velocity says something like '5 m/s east.' This extra direction makes velocity more powerful. If two cyclists both move at 5 m/s but one goes east and the other goes west, their speeds are the same, but their velocities are different.",
      }),
      block("quiz", {
        question: "Which statement best describes velocity?",
        choices: [
          { id: "a", text: "How far an object travels" },
          { id: "b", text: "Speed with direction" },
          { id: "c", text: "The total time of motion" },
          { id: "d", text: "The mass of the object" },
        ],
        correctChoiceId: "b",
        correctExplanation: "Correct. Velocity describes both how fast something moves and which direction it moves.",
        incorrectExplanation: "Not quite. Velocity needs direction, not just distance or time.",
        hint: "Think about the difference between 20 m/s and 20 m/s east.",
      }),
      block("nextPage", { label: "Acceleration and force" }),
    ]);

  const pageFour = createPage("Acceleration and Force", [
      block("title", {
        title: "Acceleration and Force",
        subtitle: "Acceleration explains changing motion. Force explains why motion changes.",
      }),
      block("sectionHeader", {
        label: "Acceleration",
        title: "Acceleration means velocity is changing",
        subtitle: "The object may speed up, slow down, or change direction.",
      }),
      block("paragraph", {
        text: "Many beginners think acceleration only means 'speeding up.' In physics, acceleration is broader. If velocity changes in any way, there is acceleration. A car speeding up has acceleration. A bicycle slowing down has acceleration. A ball turning in a curve also has acceleration because its direction changes.",
      }),
      block("keyPoints", {
        title: "Three ways velocity can change",
        rows: [["The object can get faster."], ["The object can get slower."], ["The object can change direction."]],
      }),
      block("quiz", {
        question: "Complete the sentence: Acceleration describes how quickly ___ changes.",
        text: "Acceleration describes how quickly ___ changes.",
        choices: [
          { id: "a", text: "velocity" },
          { id: "b", text: "mass" },
          { id: "c", text: "temperature" },
        ],
        answerText: "velocity",
        correctExplanation: "Exactly. Acceleration is the rate of change of velocity.",
        incorrectExplanation: "Look back at the definition of acceleration.",
      }, { settings: { quizVariant: "fillBlank", fillBlankMode: "drag", quizButtonWidth: "full" } }),
      block("continue", { label: "Continue to force" }),
      block("sectionHeader", {
        label: "Force",
        title: "Force is a push or pull",
        subtitle: "A net force can change an object's motion.",
      }),
      block("paragraph", {
        text: "When forces are balanced, the motion does not change. When forces are unbalanced, there is a net force. A net force can make an object speed up, slow down, or change direction. This is the bridge between motion and forces.",
      }),
      block("stepByStep", {
        title: "How to reason through a force problem",
        rows: [
          ["Look for pushes and pulls", "Identify each force acting on the object."],
          ["Decide if forces balance", "If equal forces act in opposite directions, they cancel."],
          ["Find the net force", "If one side is stronger, motion changes in that direction."],
          ["Connect force to acceleration", "A net force causes acceleration, not just motion by itself."],
        ],
      }),
      block("nextPage", { label: "Try the simulation" }),
    ]);

  const pageFive = createPage("Guided Simulation", [
      block("title", {
        title: "Guided Simulation Lab",
        subtitle: "Use the simulation slowly. Change one thing at a time and explain what you notice.",
      }),
      block("simulation", {
        simulationId: "forces-and-motion-basics",
        simulationTitle: "Forces and Motion: Basics",
      }, { style: { minHeight: 430 } }),
      block("callout", {
        title: "Lab rule",
        text: "Only change one variable at a time. If you change force and mass together, it becomes harder to know what caused the result.",
      }),
      block("stepByStep", {
        title: "Simulation tasks",
        rows: [
          ["Start with no applied force", "Observe whether the object changes motion."],
          ["Apply a small force", "Watch the speed indicator and describe what changes."],
          ["Apply a larger force", "Compare the motion with the small-force trial."],
          ["Add friction if available", "Notice how friction opposes motion."],
        ],
      }),
      block("quiz", {
        question: "Select all quantities that can change when a net force acts on an object.",
        text: "Select all that apply",
        choices: [
          { id: "a", text: "Velocity" },
          { id: "b", text: "Acceleration" },
          { id: "c", text: "Position over time" },
          { id: "d", text: "The definition of mass" },
        ],
        correctChoiceIds: "a,b,c",
        correctExplanation: "Yes. Net force causes acceleration, which changes velocity and position over time.",
        incorrectExplanation: "Review the simulation and focus on what changes while force is applied.",
      }, { settings: { quizVariant: "multiSelect", quizMarker: "checkbox", quizButtonWidth: "full" } }),
      block("quiz", {
        question: "If two equal teams pull a rope in opposite directions, what is the net force?",
        choices: [
          { id: "a", text: "Zero, because the forces balance" },
          { id: "b", text: "Very large, because both teams pull" },
          { id: "c", text: "Always to the left" },
          { id: "d", text: "Always to the right" },
        ],
        correctChoiceId: "a",
        correctExplanation: "Correct. Equal opposite forces cancel, so the net force is zero.",
        incorrectExplanation: "Think about opposite forces with the same strength.",
        hint: "Balanced forces cancel.",
      }),
      block("nextPage", { label: "Final practice" }),
    ]);

  const pageSix = createPage("Final Practice", [
      block("title", {
        title: "Final Practice",
        subtitle: "Use the ideas one at a time. Read carefully before calculating.",
      }),
      block("table", {
        title: "Practice data",
        rows: [
          ["Object", "Distance", "Time"],
          ["Cart A", "20 m", "4 s"],
          ["Cart B", "45 m", "9 s"],
          ["Runner", "100 m", "12.5 s"],
        ],
      }, { style: { tableBorderMode: "rows", tableHeaderFillColor: "transparent", tableHeaderFontColor: "#2563eb" } }),
      block("quiz", {
        question: "If a cart travels 20 m in 4 s, what is its speed?",
        answerText: "5 m/s",
        correctExplanation: "Correct. Speed = distance / time = 20 / 4 = 5 m/s.",
        incorrectExplanation: "Use speed = distance divided by time.",
        hint: "Divide meters by seconds.",
      }, { settings: { quizVariant: "shortAnswer" } }),
      block("quiz", {
        question: "Cart B travels 45 m in 9 s. What is its speed?",
        answerText: "5 m/s",
        correctExplanation: "Correct. 45 divided by 9 is 5 m/s.",
        incorrectExplanation: "Use speed = distance / time.",
        hint: "Divide 45 by 9.",
      }, { settings: { quizVariant: "shortAnswer" } }),
      block("quiz", {
        question: "Which situation definitely shows acceleration?",
        choices: [
          { id: "a", text: "A book resting on a desk" },
          { id: "b", text: "A car moving at constant speed in a straight line" },
          { id: "c", text: "A bicycle slowing down" },
          { id: "d", text: "A student standing still" },
        ],
        correctChoiceId: "c",
        correctExplanation: "Correct. Slowing down means velocity is changing, so there is acceleration.",
        incorrectExplanation: "Acceleration means velocity changes. Look for speeding up, slowing down, or changing direction.",
      }),
      block("callout", {
        title: "Exit explanation",
        text: "In your notebook, write three sentences: one explaining speed, one explaining velocity, and one explaining acceleration. Use your own example for each.",
      }),
      block("thumbsCheck", { question: "Can you explain motion and force without starting from formulas?" }),
    ]);

  return {
    schemaVersion: BOARD_DOCUMENT_SCHEMA_VERSION,
    id: uid("board"),
    title: "High School Physics: Motion and Forces",
    description: "A beginner-friendly interactive lesson with slow explanations, checks for understanding, simulation, and guided practice.",
    themeId: "brilliant-blue",
    advancedStyling: false,
    blockGap: DEFAULT_BLOCK_GAP,
    hitboxInset: DEFAULT_HITBOX_INSET,
    defaultColumnCount: 1,
    frozenColumns: [],
    pinnedFrozenColumnIds: [],
    header: createDefaultHeader("Motion and Forces"),
    studentProgressPersistence: "session",
    pages: [pageOne, pageTwo, pageThree, pageFour, pageFive, pageSix],
    currentPageId: pageOne.id,
    updatedAt: Date.now(),
  };
}

function block(type: Block["type"], content: Block["content"], extra?: Partial<Block>): Block {
  const base = createDefaultBlock(type);
  return {
    ...base,
    content: { ...base.content, ...content },
    style: { ...base.style, ...(extra?.style ?? {}) },
    settings: { ...base.settings, ...(extra?.settings ?? {}) },
    children: extra?.children ?? base.children,
  };
}

export function normalizeBoard(value: unknown): Board {
  const fallback = createInitialBoard();
  if (!value || typeof value !== "object") return fallback;

  const raw = value as Partial<Board> & { pinnedFrozenColumnId?: unknown };
  const frozenColumns = Array.isArray(raw.frozenColumns)
    ? raw.frozenColumns.slice(0, 2).map(normalizeFrozenColumn).filter((column): column is FrozenBoardColumn => Boolean(column))
    : [];
  const localColumnLimit = Math.max(1, 3 - frozenColumns.length);
  const pages = Array.isArray(raw.pages)
    ? raw.pages
        .map((page, index) => normalizePage(page, index, localColumnLimit))
        .filter((page): page is Page => Boolean(page))
    : [];

  const safePages = pages.length > 0 ? pages : fallback.pages;
  const currentPageId = safePages.some((page) => page.id === raw.currentPageId) ? String(raw.currentPageId) : safePages[0].id;
  const pinnedFrozenColumnIds = normalizePinnedColumnIds(raw.pinnedFrozenColumnIds, raw.pinnedFrozenColumnId, frozenColumns.map((column) => column.id));
  const availableLocalPins = Math.max(0, MAX_PINNED_COLUMNS - pinnedFrozenColumnIds.length);

  return {
    schemaVersion: BOARD_DOCUMENT_SCHEMA_VERSION,
    id: typeof raw.id === "string" ? raw.id : fallback.id,
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title : fallback.title,
    description: typeof raw.description === "string" ? raw.description : fallback.description,
    themeId: raw.themeId && raw.themeId in { "up-red": true, "brilliant-blue": true, "eco-green": true, "space-dark": true } ? raw.themeId : fallback.themeId,
    advancedStyling: Boolean(raw.advancedStyling),
    blockGap: normalizeLayoutNumber(raw.blockGap, DEFAULT_BLOCK_GAP, 64),
    hitboxInset: normalizeLayoutNumber(raw.hitboxInset, DEFAULT_HITBOX_INSET, 48),
    defaultColumnCount: normalizeColumnCount(raw.defaultColumnCount),
    frozenColumns,
    pinnedFrozenColumnIds,
    header: normalizeHeader(raw.header),
    studentProgressPersistence: raw.studentProgressPersistence === "resume" ? "resume" : "session",
    pages: safePages.map((page) => ({ ...page, pinnedColumnIds: (page.pinnedColumnIds ?? []).slice(0, availableLocalPins) })),
    currentPageId,
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now(),
  };
}

export function createPage(title: string, blocks: Block[] = [], columnCount: ColumnCount = 1): Page {
  return {
    id: uid("page"),
    title,
    columns: Array.from({ length: columnCount }, (_, index) => createBoardColumn(index === 0 ? blocks : [])),
    pinnedColumnIds: [],
  };
}

export function createDefaultHeader(title = "Lesson title"): BoardHeader {
  return {
    enabled: true,
    children: {
      content: [
        block("previousPage", { label: "Previous Page" }),
        block("paragraph", { text: title }, { style: { textAlign: "center", fontSize: 14 } }),
        block("nextPage", { label: "Next page" }),
      ],
    },
    style: {
      fillColor: "#ffffff",
      borderColor: "#d4d4d8",
      shadowColor: "#d4d4d8",
      borderWidth: 1,
      radius: 0,
      blockGap: 20,
    },
  };
}

export function createBoardColumn(blocks: Block[] = []): BoardColumn {
  return { id: uid("column"), blocks };
}

function normalizeLayoutNumber(value: unknown, fallback: number, maximum: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(maximum, Math.max(0, value)) : fallback;
}

function normalizeColumnCount(value: unknown): ColumnCount {
  return value === 2 || value === 3 ? value : 1;
}

function normalizePage(value: unknown, index: number, maximumColumns = 3): Page | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<Page> & { blocks?: unknown; pinnedColumnId?: unknown };
  const legacyBlocks = Array.isArray(raw.blocks)
    ? raw.blocks
        .map(normalizeBlock)
        .filter((block): block is Block => Boolean(block))
    : [];
  const columns = Array.isArray(raw.columns)
    ? raw.columns
        .slice(0, maximumColumns)
        .map(normalizeColumn)
        .filter((column): column is BoardColumn => Boolean(column))
    : [];
  const safeColumns = columns.length ? columns : [createBoardColumn(legacyBlocks)];
  const pinnedColumnIds = normalizePinnedColumnIds(raw.pinnedColumnIds, raw.pinnedColumnId, safeColumns.map((column) => column.id));

  return {
    id: typeof raw.id === "string" ? raw.id : uid("page"),
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title : `Page ${index + 1}`,
    columns: safeColumns,
    pinnedColumnIds,
  };
}

function normalizePinnedColumnIds(value: unknown, legacyValue: unknown, validColumnIds: string[]) {
  const validIds = new Set(validColumnIds);
  const candidates = [...(Array.isArray(value) ? value : []), ...(typeof legacyValue === "string" ? [legacyValue] : [])];
  return Array.from(new Set(candidates.filter((id): id is string => typeof id === "string" && validIds.has(id)))).slice(0, MAX_PINNED_COLUMNS);
}

function normalizeFrozenColumn(value: unknown): FrozenBoardColumn | undefined {
  const column = normalizeColumn(value);
  if (!column || !value || typeof value !== "object") return undefined;
  const raw = value as Partial<FrozenBoardColumn>;
  return {
    ...column,
    side: raw.side === "right" ? "right" : "left",
    order: typeof raw.order === "number" && Number.isFinite(raw.order) ? Math.max(0, Math.floor(raw.order)) : 0,
  };
}

function normalizeColumn(value: unknown): BoardColumn | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<BoardColumn>;
  return {
    id: typeof raw.id === "string" ? raw.id : uid("column"),
    blocks: Array.isArray(raw.blocks) ? raw.blocks.map(normalizeBlock).filter((block): block is Block => Boolean(block)) : [],
  };
}

function normalizeHeader(value: unknown): BoardHeader {
  const fallback = createDefaultHeader();
  if (!value || typeof value !== "object") return fallback;
  const raw = value as Partial<BoardHeader>;
  return {
    enabled: raw.enabled !== false,
    children: {
      content: normalizeHeaderBlocks(raw.children?.content, fallback.children.content),
    },
    style: { ...fallback.style, ...(raw.style && typeof raw.style === "object" ? raw.style : {}) },
  };
}

function normalizeHeaderBlocks(value: unknown, fallback: Block[]) {
  const blocks = Array.isArray(value)
    ? value.map(normalizeBlock).filter((block): block is Block => block !== undefined && HEADER_ALLOWED_BLOCK_TYPES.includes(block.type))
    : [];
  return blocks.length ? blocks : fallback.map(cloneBlock);
}

function normalizeBlock(value: unknown): Block | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<Block>;
  if (!raw.type || !(raw.type in blockDefinitions)) return undefined;

  const base = createDefaultBlock(raw.type);
  const children = raw.type === "twoColumn"
    ? {
        left: normalizeChildBlocks(raw.children?.left, base.children?.left),
        right: normalizeChildBlocks(raw.children?.right, base.children?.right),
      }
    : raw.type === "popup"
      ? { content: normalizeChildBlocks(raw.children?.content, base.children?.content) }
      : undefined;
  const miniPages = raw.type === "miniPage" ? normalizeMiniPages(raw.miniPages, base.miniPages) : undefined;
  const activeMiniPageId = raw.type === "miniPage"
    ? (miniPages?.some((page) => page.id === raw.activeMiniPageId) ? raw.activeMiniPageId : miniPages?.[0]?.id)
    : undefined;
  const style = { ...base.style, ...(raw.style && typeof raw.style === "object" ? raw.style : {}) };
  const settings = { ...base.settings, ...(raw.settings && typeof raw.settings === "object" ? raw.settings : {}) };

  if (raw.type === "image" && settings.imageFit === "contain" && style.minHeight === 320) {
    settings.imageFit = "fitWidth";
    delete style.minHeight;
  }

  const content = { ...base.content, ...(raw.content && typeof raw.content === "object" ? raw.content : {}) };
  if (raw.type === "quiz" && settings.quizVariant === "dropdown") {
    content.dropdownQuizItems = normalizeDropdownQuizItems(raw.content?.dropdownQuizItems, base.content.dropdownQuizItems);
  }
  if (raw.type === "quiz" && settings.quizVariant === "enumeration") {
    content.enumerationItems = normalizeEnumerationQuizItems(raw.content?.enumerationItems, base.content.enumerationItems);
  }
  if (raw.type === "flashcard") {
    content.flashcards = normalizeFlashcardItems(raw.content?.flashcards, base.content.flashcards ?? []);
    if (settings.flashcardVariant === "flip") content.flashcards = content.flashcards.slice(0, 1);
  }

  return {
    ...base,
    id: typeof raw.id === "string" ? raw.id : base.id,
    content,
    style,
    settings,
    pinned: Boolean(raw.pinned),
    locked: Boolean(raw.locked),
    children,
    miniPages,
    activeMiniPageId,
  };
}

function normalizeMiniPages(value: unknown, fallback: MiniPage[] | undefined): MiniPage[] {
  const pages = Array.isArray(value)
    ? value.flatMap((candidate): MiniPage[] => {
        if (!candidate || typeof candidate !== "object") return [];
        const raw = candidate as Partial<MiniPage>;
        return [{
          id: typeof raw.id === "string" && raw.id ? raw.id : uid("mini-page"),
          blocks: Array.isArray(raw.blocks) ? raw.blocks.map(normalizeBlock).filter((block): block is Block => Boolean(block)) : [],
        }];
      })
    : [];
  if (pages.length) return pages;
  return fallback?.length ? structuredClone(fallback) : [{ id: uid("mini-page"), blocks: [] }];
}

export function normalizeFlashcardItems(value: unknown, fallback: FlashcardItem[]): FlashcardItem[] {
  if (!Array.isArray(value)) return structuredClone(fallback);
  const items = value.flatMap((candidate): FlashcardItem[] => {
    if (!candidate || typeof candidate !== "object") return [];
    const raw = candidate as Partial<FlashcardItem>;
    return [{
      id: typeof raw.id === "string" && raw.id ? raw.id : uid("card"),
      frontText: typeof raw.frontText === "string" ? raw.frontText : "",
      backText: typeof raw.backText === "string" ? raw.backText : "",
      ...(typeof raw.frontImageSrc === "string" ? { frontImageSrc: raw.frontImageSrc } : {}),
      ...(typeof raw.frontImageAlt === "string" ? { frontImageAlt: raw.frontImageAlt } : {}),
      ...(typeof raw.backImageSrc === "string" ? { backImageSrc: raw.backImageSrc } : {}),
      ...(typeof raw.backImageAlt === "string" ? { backImageAlt: raw.backImageAlt } : {}),
    }];
  });
  return items.length ? items : structuredClone(fallback);
}

export function cloneBlock(block: Block): Block {
  const miniPages = block.miniPages?.map((page) => ({ id: uid("mini-page"), blocks: page.blocks.map(cloneBlock) }));
  return {
    ...structuredClone(block),
    id: uid(block.type),
    children: block.children
      ? {
          left: block.children.left?.map(cloneBlock),
          right: block.children.right?.map(cloneBlock),
          content: block.children.content?.map(cloneBlock),
        }
      : undefined,
    miniPages,
    activeMiniPageId: miniPages?.[0]?.id,
  };
}

export function findBlockInHeader(board: Board, blockId: string): Block | undefined {
  return board.header?.children.content ? findBlock(board.header.children.content, blockId) : undefined;
}

export function findLocationInHeader(board: Board, blockId: string): BlockLocation | undefined {
  const location = board.header?.children.content ? findLocation(board.header.children.content, blockId, HEADER_CONTAINER_ID) : undefined;
  return location?.containerId === HEADER_CONTAINER_ID ? location : undefined;
}

export function updateBlockInHeader(board: Board, updated: Block): Board {
  const header = board.header ?? createDefaultHeader();
  return {
    ...board,
    header: { ...header, children: { content: mapBlocks(header.children.content, updated.id, () => updated) } },
    updatedAt: Date.now(),
  };
}

export function insertBlockInHeader(board: Board, index: number, blockToInsert: Block): Board {
  if (!HEADER_ALLOWED_BLOCK_TYPES.includes(blockToInsert.type)) return board;
  const header = board.header ?? createDefaultHeader();
  const content = [...header.children.content];
  content.splice(index, 0, blockToInsert);
  return { ...board, header: { ...header, children: { content } }, updatedAt: Date.now() };
}

export function removeBlockFromHeader(board: Board, blockId: string): { board: Board; removed?: Block } {
  const header = board.header ?? createDefaultHeader();
  const result = removeBlock(header.children.content, blockId);
  return {
    board: { ...board, header: { ...header, children: { content: result.blocks } }, updatedAt: Date.now() },
    removed: result.removed,
  };
}

function normalizeChildBlocks(value: unknown, fallback: Block[] | undefined) {
  return Array.isArray(value) ? value.map(normalizeBlock).filter((block): block is Block => Boolean(block)) : (fallback ?? []);
}

export function getCurrentPage(board: Board): Page {
  return board.pages.find((page) => page.id === board.currentPageId) ?? board.pages[0];
}

export function getFrozenColumns(board: Board, side?: FrozenBoardColumn["side"]): FrozenBoardColumn[] {
  return board.frozenColumns
    .filter((column) => !side || column.side === side)
    .sort((a, b) => a.order - b.order);
}

export function getComposedPage(board: Board, page = getCurrentPage(board)): Page {
  return {
    ...page,
    columns: [...getFrozenColumns(board, "left"), ...page.columns, ...getFrozenColumns(board, "right")],
    pinnedColumnIds: [...(board.pinnedFrozenColumnIds ?? []), ...(page.pinnedColumnIds ?? [])].slice(0, MAX_PINNED_COLUMNS),
  };
}

export function isFrozenColumn(board: Board, columnId: string) {
  return board.frozenColumns.some((column) => column.id === columnId);
}

export function getNewPageColumnCount(board: Board): ColumnCount {
  return Math.max(1, Math.min(board.defaultColumnCount, 3 - board.frozenColumns.length)) as ColumnCount;
}

export function updateCurrentComposedPage(board: Board, update: (page: Page) => Page): Board {
  const currentPage = getCurrentPage(board);
  const nextComposed = update(getComposedPage(board, currentPage));
  const columnsById = new Map(nextComposed.columns.map((column) => [column.id, column]));
  return {
    ...board,
    updatedAt: Date.now(),
    frozenColumns: board.frozenColumns.map((column) => ({ ...column, blocks: columnsById.get(column.id)?.blocks ?? column.blocks })),
    pages: board.pages.map((page) => page.id === currentPage.id
      ? { ...page, columns: page.columns.map((column) => columnsById.get(column.id) ?? column) }
      : page),
  };
}

export function freezePageColumn(board: Board, pageId: string, columnId: string, side: FrozenBoardColumn["side"]): { board: Board; error?: string } {
  const page = board.pages.find((item) => item.id === pageId);
  const column = page?.columns.find((item) => item.id === columnId);
  if (!page || !column) return { board, error: "That page column no longer exists." };
  if (page.columns.length <= 1) return { board, error: "Every page must keep at least one page-only column." };
  if (board.frozenColumns.length >= 2) return { board, error: "A board can keep at most two columns across pages." };

  const projectedFrozenCount = board.frozenColumns.length + 1;
  const affectedPages = board.pages.filter((item) => item.id !== pageId && item.columns.length + projectedFrozenCount > 3);
  if (affectedPages.length) {
    return { board, error: `Cannot keep this column across pages because these pages already use all available column slots: ${affectedPages.map((item) => item.title).join(", ")}.` };
  }

  const nextOrder = board.frozenColumns.filter((item) => item.side === side).length;
  const wasPinned = page.pinnedColumnIds?.includes(columnId) ?? false;
  const pinnedFrozenColumnIds = wasPinned
    ? [...(board.pinnedFrozenColumnIds ?? []), columnId].slice(0, MAX_PINNED_COLUMNS)
    : board.pinnedFrozenColumnIds ?? [];
  const availableLocalPins = Math.max(0, MAX_PINNED_COLUMNS - pinnedFrozenColumnIds.length);
  return {
    board: {
      ...board,
      updatedAt: Date.now(),
      frozenColumns: [...board.frozenColumns, { ...column, side, order: nextOrder }],
      pinnedFrozenColumnIds,
      pages: board.pages.map((item) => item.id === pageId
        ? { ...item, columns: item.columns.filter((candidate) => candidate.id !== columnId), pinnedColumnIds: (item.pinnedColumnIds ?? []).filter((id) => id !== columnId).slice(0, availableLocalPins) }
        : { ...item, pinnedColumnIds: (item.pinnedColumnIds ?? []).slice(0, availableLocalPins) }),
    },
  };
}

export function unfreezeBoardColumn(board: Board, columnId: string, pageId = board.currentPageId): Board {
  const frozen = board.frozenColumns.find((column) => column.id === columnId);
  const page = board.pages.find((item) => item.id === pageId);
  if (!frozen || !page || page.columns.length + board.frozenColumns.length > 3) return board;
  const localColumn: BoardColumn = { id: frozen.id, blocks: frozen.blocks };
  const wasPinned = board.pinnedFrozenColumnIds?.includes(columnId) ?? false;
  return {
    ...board,
    updatedAt: Date.now(),
    frozenColumns: board.frozenColumns.filter((column) => column.id !== columnId),
    pinnedFrozenColumnIds: (board.pinnedFrozenColumnIds ?? []).filter((id) => id !== columnId),
    pages: board.pages.map((item) => item.id === pageId
      ? {
          ...item,
          columns: frozen.side === "left" ? [localColumn, ...item.columns] : [...item.columns, localColumn],
          pinnedColumnIds: wasPinned ? [...(item.pinnedColumnIds ?? []), columnId].slice(0, MAX_PINNED_COLUMNS) : item.pinnedColumnIds ?? [],
        }
      : item),
  };
}

export function deleteFrozenBoardColumn(board: Board, columnId: string): Board {
  if (!board.frozenColumns.some((column) => column.id === columnId)) return board;
  return {
    ...board,
    updatedAt: Date.now(),
    frozenColumns: board.frozenColumns.filter((column) => column.id !== columnId),
    pinnedFrozenColumnIds: (board.pinnedFrozenColumnIds ?? []).filter((id) => id !== columnId),
  };
}

export function setPinnedBoardColumn(board: Board, pageId: string, columnId: string, pinned = true): Board {
  const frozen = board.frozenColumns.some((column) => column.id === columnId);
  const page = board.pages.find((item) => item.id === pageId);
  if (!frozen && !page?.columns.some((column) => column.id === columnId)) return board;

  const frozenPins = board.pinnedFrozenColumnIds ?? [];
  const localPins = page?.pinnedColumnIds ?? [];
  if (pinned && !frozenPins.includes(columnId) && !localPins.includes(columnId) && frozenPins.length + localPins.length >= MAX_PINNED_COLUMNS) return board;

  const pinnedFrozenColumnIds = frozen
    ? pinned ? [...frozenPins, columnId].slice(0, MAX_PINNED_COLUMNS) : frozenPins.filter((id) => id !== columnId)
    : frozenPins;
  const availableLocalPins = Math.max(0, MAX_PINNED_COLUMNS - pinnedFrozenColumnIds.length);
  return {
    ...board,
    updatedAt: Date.now(),
    pinnedFrozenColumnIds,
    pages: board.pages.map((item) => {
      const currentPins = item.pinnedColumnIds ?? [];
      if (frozen) return { ...item, pinnedColumnIds: currentPins.slice(0, availableLocalPins) };
      if (item.id !== pageId) return item;
      const nextPins = pinned ? [...currentPins, columnId] : currentPins.filter((id) => id !== columnId);
      return { ...item, pinnedColumnIds: Array.from(new Set(nextPins)).slice(0, availableLocalPins) };
    }),
  };
}

export function moveFrozenBoardColumn(board: Board, columnId: string, side: FrozenBoardColumn["side"], targetColumnId?: string): Board {
  const moving = board.frozenColumns.find((column) => column.id === columnId);
  if (!moving) return board;
  const remaining = board.frozenColumns.filter((column) => column.id !== columnId);
  const sideColumns = remaining.filter((column) => column.side === side).sort((a, b) => a.order - b.order);
  const targetIndex = targetColumnId ? sideColumns.findIndex((column) => column.id === targetColumnId) : -1;
  sideColumns.splice(targetIndex < 0 ? sideColumns.length : targetIndex, 0, { ...moving, side });
  const reordered = remaining
    .filter((column) => column.side !== side)
    .map((column, _index, list) => ({ ...column, order: list.filter((item) => item.side === column.side).findIndex((item) => item.id === column.id) }))
    .concat(sideColumns.map((column, order) => ({ ...column, order })));
  return { ...board, frozenColumns: reordered, updatedAt: Date.now() };
}

export function updateCurrentPage(board: Board, update: (page: Page) => Page): Board {
  return {
    ...board,
    updatedAt: Date.now(),
    pages: board.pages.map((page) => (page.id === board.currentPageId ? update(page) : page)),
  };
}

export function columnContainerId(columnId: string) {
  return `column:${columnId}`;
}

export function miniPageContainerId(blockId: string, miniPageId: string) {
  return `${blockId}:mini:${miniPageId}`;
}

export function isBlockContainerId(containerId: string) {
  return containerId.endsWith(":left") || containerId.endsWith(":right") || containerId.endsWith(":content") || containerId.includes(":mini:");
}

export function createMiniPage(): MiniPage {
  return { id: uid("mini-page"), blocks: [] };
}

export function getMiniPages(block: Block): MiniPage[] {
  return block.miniPages?.length ? block.miniPages : [createMiniPage()];
}

export function getActiveMiniPage(block: Block): MiniPage {
  const pages = getMiniPages(block);
  return pages.find((page) => page.id === block.activeMiniPageId) ?? pages[0];
}

export function getMiniPageContextForBlock(board: Board, blockId: string): { miniPageBlock: Block; miniPage: MiniPage; index: number } | undefined {
  const search = (blocks: Block[]): { miniPageBlock: Block; miniPage: MiniPage; index: number } | undefined => {
    for (const block of blocks) {
      for (const [index, miniPage] of (block.miniPages ?? []).entries()) {
        if (findBlock(miniPage.blocks, blockId)) return { miniPageBlock: block, miniPage, index };
        const nested = search(miniPage.blocks);
        if (nested) return nested;
      }
      const left = search(block.children?.left ?? []);
      if (left) return left;
      const right = search(block.children?.right ?? []);
      if (right) return right;
      const content = search(block.children?.content ?? []);
      if (content) return content;
    }
    return undefined;
  };
  for (const column of board.frozenColumns) {
    const context = search(column.blocks);
    if (context) return context;
  }
  for (const page of board.pages) {
    for (const column of page.columns) {
      const context = search(column.blocks);
      if (context) return context;
    }
  }
  return board.header?.children.content ? search(board.header.children.content) : undefined;
}

export function getPageBlockCount(page: Page) {
  return page.columns.reduce((count, column) => count + column.blocks.length, 0);
}

export function findBlockInPage(page: Page, blockId: string): Block | undefined {
  for (const column of page.columns) {
    const block = findBlock(column.blocks, blockId);
    if (block) return block;
  }
  return undefined;
}

export function findLocationInPage(page: Page, blockId: string): BlockLocation | undefined {
  for (const column of page.columns) {
    const location = findLocation(column.blocks, blockId, columnContainerId(column.id));
    if (location) return location;
  }
  return undefined;
}

export function findColumnIdForBlock(page: Page, blockId: string): string | undefined {
  return page.columns.find((column) => Boolean(findBlock(column.blocks, blockId)))?.id;
}

export function getContainerBlocksInPage(page: Page, containerId: string): Block[] {
  const column = page.columns.find((item) => columnContainerId(item.id) === containerId);
  if (column) return column.blocks;
  for (const item of page.columns) {
    const blocks = getContainerBlocks(item.blocks, containerId);
    if (blocks.length || hasContainer(item.blocks, containerId)) return blocks;
  }
  return [];
}

export function insertBlockInPage(page: Page, containerId: string, index: number, block: Block): Page {
  return {
    ...page,
    columns: page.columns.map((column) => {
      if (columnContainerId(column.id) === containerId) {
        const blocks = [...column.blocks];
        blocks.splice(index, 0, block);
        return { ...column, blocks };
      }
      if (!hasContainer(column.blocks, containerId)) return column;
      return { ...column, blocks: insertBlock(column.blocks, containerId, index, block) };
    }),
  };
}

export function removeBlockFromPage(page: Page, blockId: string): { page: Page; removed?: Block } {
  let removed: Block | undefined;
  const columns = page.columns.map((column) => {
    if (removed) return column;
    const result = removeBlock(column.blocks, blockId);
    if (!result.removed) return column;
    removed = result.removed;
    return { ...column, blocks: result.blocks };
  });
  return { page: { ...page, columns }, removed };
}

export function updateBlockInPage(page: Page, updated: Block): Page {
  return {
    ...page,
    columns: page.columns.map((column) => ({ ...column, blocks: mapBlocks(column.blocks, updated.id, () => updated) })),
  };
}

export function resolvePageDrop(page: Page, overId: string): { containerId: string; index: number } {
  if (overId.startsWith("column:") || isBlockContainerId(overId)) {
    return { containerId: overId, index: getContainerBlocksInPage(page, overId).length };
  }
  const location = findLocationInPage(page, overId);
  if (location) return { containerId: location.containerId, index: location.index };
  const firstColumn = page.columns[0];
  return { containerId: columnContainerId(firstColumn.id), index: firstColumn.blocks.length };
}

export function addPageColumn(page: Page): Page {
  if (page.columns.length >= 3) return page;
  return { ...page, columns: [...page.columns, createBoardColumn()] };
}

export function swapPageColumns(page: Page, firstColumnId: string, secondColumnId: string): Page {
  if (firstColumnId === secondColumnId) return page;
  const firstIndex = page.columns.findIndex((column) => column.id === firstColumnId);
  const secondIndex = page.columns.findIndex((column) => column.id === secondColumnId);
  if (firstIndex < 0 || secondIndex < 0) return page;
  const columns = [...page.columns];
  [columns[firstIndex], columns[secondIndex]] = [columns[secondIndex], columns[firstIndex]];
  return { ...page, columns };
}

export function duplicatePageColumn(page: Page, sourceColumn: BoardColumn, afterColumnId?: string): Page {
  if (page.columns.length >= 3) return page;
  const copy = createBoardColumn(sourceColumn.blocks.map(cloneBlock));
  const targetIndex = page.columns.findIndex((column) => column.id === afterColumnId);
  const insertionIndex = targetIndex < 0 ? page.columns.length : targetIndex + 1;
  const columns = [...page.columns];
  columns.splice(insertionIndex, 0, copy);
  return { ...page, columns };
}

export function setPinnedPageColumn(page: Page, columnId: string, pinned = true): Page {
  if (!page.columns.some((column) => column.id === columnId)) return page;
  const currentPins = page.pinnedColumnIds ?? [];
  if (pinned && !currentPins.includes(columnId) && currentPins.length >= MAX_PINNED_COLUMNS) return page;
  const nextPins = pinned ? [...currentPins, columnId] : currentPins.filter((id) => id !== columnId);
  return { ...page, pinnedColumnIds: Array.from(new Set(nextPins)).slice(0, MAX_PINNED_COLUMNS) };
}

export function removePageColumn(page: Page, columnId: string, mode: "merge" | "delete"): Page {
  if (page.columns.length <= 1) return page;
  const index = page.columns.findIndex((column) => column.id === columnId);
  if (index < 0) return page;
  const removed = page.columns[index];
  const columns = page.columns.filter((column) => column.id !== columnId).map((column) => ({ ...column, blocks: [...column.blocks] }));
  if (mode === "merge" && removed.blocks.length) {
    if (index > 0) columns[index - 1].blocks.push(...removed.blocks);
    else columns[0].blocks.unshift(...removed.blocks);
  }
  return {
    ...page,
    columns,
    pinnedColumnIds: (page.pinnedColumnIds ?? []).filter((id) => id !== columnId),
  };
}

export function clonePage(page: Page, title = `${page.title} Copy`): Page {
  const columnIdMap = new Map<string, string>();
  const columns = page.columns.map((column) => {
    const id = uid("column");
    columnIdMap.set(column.id, id);
    return { id, blocks: column.blocks.map(cloneBlock) };
  });
  return {
    id: uid("page"),
    title,
    columns,
    pinnedColumnIds: (page.pinnedColumnIds ?? []).map((id) => columnIdMap.get(id)).filter((id): id is string => Boolean(id)),
  };
}

export function mapBlocks(blocks: Block[], blockId: string, update: (block: Block) => Block): Block[] {
  return blocks.map((block) => {
    if (block.id === blockId) return update(block);
    const miniPages = block.miniPages?.map((page) => ({ ...page, blocks: mapBlocks(page.blocks, blockId, update) }));
    if (block.children) {
      return {
        ...block,
        children: {
          left: block.children.left ? mapBlocks(block.children.left, blockId, update) : [],
          right: block.children.right ? mapBlocks(block.children.right, blockId, update) : [],
          content: block.children.content ? mapBlocks(block.children.content, blockId, update) : undefined,
        },
        miniPages,
      };
    }
    return miniPages ? { ...block, miniPages } : block;
  });
}

export function findBlock(blocks: Block[], blockId: string): Block | undefined {
  for (const block of blocks) {
    if (block.id === blockId) return block;
    const left = block.children?.left ? findBlock(block.children.left, blockId) : undefined;
    if (left) return left;
    const right = block.children?.right ? findBlock(block.children.right, blockId) : undefined;
    if (right) return right;
    const content = block.children?.content ? findBlock(block.children.content, blockId) : undefined;
    if (content) return content;
    for (const page of block.miniPages ?? []) {
      const miniBlock = findBlock(page.blocks, blockId);
      if (miniBlock) return miniBlock;
    }
  }
  return undefined;
}

export function removeBlock(blocks: Block[], blockId: string): { blocks: Block[]; removed?: Block } {
  let removed: Block | undefined;
  const next = blocks
    .map((block) => {
      if (block.id === blockId) {
        removed = block;
        return null;
      }
      if (block.children) {
        const leftResult = removeBlock(block.children.left ?? [], blockId);
        const rightResult = removeBlock(block.children.right ?? [], blockId);
        const contentResult = removeBlock(block.children.content ?? [], blockId);
        const miniPages = block.miniPages?.map((page) => {
          const result = removeBlock(page.blocks, blockId);
          if (result.removed) removed = result.removed;
          return { ...page, blocks: result.blocks };
        });
        if (leftResult.removed) removed = leftResult.removed;
        if (rightResult.removed) removed = rightResult.removed;
        if (contentResult.removed) removed = contentResult.removed;
        return {
          ...block,
          children: {
            left: leftResult.blocks,
            right: rightResult.blocks,
            content: block.children.content ? contentResult.blocks : undefined,
          },
          miniPages,
        };
      }
      if (block.miniPages) {
        const miniPages = block.miniPages.map((page) => {
          const result = removeBlock(page.blocks, blockId);
          if (result.removed) removed = result.removed;
          return { ...page, blocks: result.blocks };
        });
        return { ...block, miniPages };
      }
      return block;
    })
    .filter(Boolean) as Block[];

  return { blocks: next, removed };
}

export function insertBlock(blocks: Block[], containerId: string, index: number, blockToInsert: Block): Block[] {
  if (containerId === "root") {
    const next = [...blocks];
    next.splice(index, 0, blockToInsert);
    return next;
  }

  return blocks.map((block) => {
    const nextChildren = { left: block.children?.left ?? [], right: block.children?.right ?? [] };
    if (block.children) {
      if (`${block.id}:left` === containerId) {
        const left = [...nextChildren.left];
        left.splice(index, 0, blockToInsert);
        return { ...block, children: { ...nextChildren, left } };
      }
      if (`${block.id}:right` === containerId) {
        const right = [...nextChildren.right];
        right.splice(index, 0, blockToInsert);
        return { ...block, children: { ...nextChildren, right } };
      }
      if (`${block.id}:content` === containerId) {
        const content = [...(block.children.content ?? [])];
        content.splice(index, 0, blockToInsert);
        return { ...block, children: { ...nextChildren, content } };
      }
    }
    if (block.miniPages?.some((page) => miniPageContainerId(block.id, page.id) === containerId)) {
      return {
        ...block,
        miniPages: block.miniPages.map((page) => {
          if (miniPageContainerId(block.id, page.id) !== containerId) return page;
          const blocks = [...page.blocks];
          blocks.splice(index, 0, blockToInsert);
          return { ...page, blocks };
        }),
      };
    }
    return {
      ...block,
      children: block.children ? {
        left: insertBlock(nextChildren.left, containerId, index, blockToInsert),
        right: insertBlock(nextChildren.right, containerId, index, blockToInsert),
        content: block.children.content ? insertBlock(block.children.content, containerId, index, blockToInsert) : undefined,
      } : undefined,
      miniPages: block.miniPages?.map((page) => ({ ...page, blocks: insertBlock(page.blocks, containerId, index, blockToInsert) })),
    };
  });
}

export function findLocation(blocks: Block[], blockId: string, containerId = "root"): BlockLocation | undefined {
  const index = blocks.findIndex((block) => block.id === blockId);
  if (index >= 0) return { containerId, index, list: blocks };

  for (const block of blocks) {
    if (block.children) {
      const left = findLocation(block.children.left ?? [], blockId, `${block.id}:left`);
      if (left) return left;
      const right = findLocation(block.children.right ?? [], blockId, `${block.id}:right`);
      if (right) return right;
      const content = findLocation(block.children.content ?? [], blockId, `${block.id}:content`);
      if (content) return content;
    }
    for (const page of block.miniPages ?? []) {
      const mini = findLocation(page.blocks, blockId, miniPageContainerId(block.id, page.id));
      if (mini) return mini;
    }
  }

  return undefined;
}

export function resolveDrop(blocks: Block[], overId: string): { containerId: string; index: number } {
  if (overId === "root" || isBlockContainerId(overId)) {
    const location = getContainerBlocks(blocks, overId);
    return { containerId: overId, index: location.length };
  }

  const location = findLocation(blocks, overId);
  if (location) return { containerId: location.containerId, index: location.index };

  return { containerId: "root", index: blocks.length };
}

export function getContainerBlocks(blocks: Block[], containerId: string): Block[] {
  if (containerId === "root") return blocks;
  for (const block of blocks) {
    if (block.children) {
      if (`${block.id}:left` === containerId) return block.children.left ?? [];
      if (`${block.id}:right` === containerId) return block.children.right ?? [];
      if (`${block.id}:content` === containerId) return block.children.content ?? [];
      const left = getContainerBlocks(block.children.left ?? [], containerId);
      if (left.length || hasContainer(block.children.left ?? [], containerId)) return left;
      const right = getContainerBlocks(block.children.right ?? [], containerId);
      if (right.length || hasContainer(block.children.right ?? [], containerId)) return right;
      const content = getContainerBlocks(block.children.content ?? [], containerId);
      if (content.length || hasContainer(block.children.content ?? [], containerId)) return content;
    }
    for (const page of block.miniPages ?? []) {
      if (miniPageContainerId(block.id, page.id) === containerId) return page.blocks;
      const mini = getContainerBlocks(page.blocks, containerId);
      if (mini.length || hasContainer(page.blocks, containerId)) return mini;
    }
  }
  return [];
}

function hasContainer(blocks: Block[], containerId: string): boolean {
  return blocks.some((block) =>
    (block.children && (`${block.id}:left` === containerId || `${block.id}:right` === containerId || `${block.id}:content` === containerId || hasContainer(block.children.left ?? [], containerId) || hasContainer(block.children.right ?? [], containerId) || hasContainer(block.children.content ?? [], containerId)))
    || (block.miniPages?.some((page) => miniPageContainerId(block.id, page.id) === containerId || hasContainer(page.blocks, containerId)) ?? false)
  );
}
