import type { Block, BlockLocation, Board, Page } from "./types";
import { blockDefinitions, createDefaultBlock } from "./blockRegistry";
import { uid } from "./theme";

export const STORAGE_KEY = "edu-block-board-v1";

export function createInitialBoard(): Board {
  const title = createDefaultBlock("title");
  const paragraph = createDefaultBlock("paragraph");
  const quiz = createDefaultBlock("quiz");
  const continueBlock = createDefaultBlock("continue");
  const page: Page = {
    id: uid("page"),
    title: "Introduction",
    blocks: [title, paragraph, quiz, continueBlock],
  };

  return {
    id: uid("board"),
    title: "Untitled Board",
    description: "A visual lesson built from blocks.",
    themeId: "brilliant-blue",
    pages: [page],
    currentPageId: page.id,
    updatedAt: Date.now(),
  };
}

export function createHighSchoolMotionLessonBoard(): Board {
  const pageOne: Page = {
    id: uid("page"),
    title: "Start Here",
    blocks: [
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
    ],
  };

  const pageTwo: Page = {
    id: uid("page"),
    title: "Position and Distance",
    blocks: [
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
    ],
  };

  const pageThree: Page = {
    id: uid("page"),
    title: "Speed and Velocity",
    blocks: [
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
    ],
  };

  const pageFour: Page = {
    id: uid("page"),
    title: "Acceleration and Force",
    blocks: [
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
    ],
  };

  const pageFive: Page = {
    id: uid("page"),
    title: "Guided Simulation",
    blocks: [
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
    ],
  };

  const pageSix: Page = {
    id: uid("page"),
    title: "Final Practice",
    blocks: [
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
    ],
  };

  return {
    id: uid("board"),
    title: "High School Physics: Motion and Forces",
    description: "A beginner-friendly interactive lesson with slow explanations, checks for understanding, simulation, and guided practice.",
    themeId: "brilliant-blue",
    advancedStyling: false,
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

  const raw = value as Partial<Board>;
  const pages = Array.isArray(raw.pages)
    ? raw.pages
        .map((page, index) => normalizePage(page, index))
        .filter((page): page is Page => Boolean(page))
    : [];

  const safePages = pages.length > 0 ? pages : fallback.pages;
  const currentPageId = safePages.some((page) => page.id === raw.currentPageId) ? String(raw.currentPageId) : safePages[0].id;

  return {
    id: typeof raw.id === "string" ? raw.id : fallback.id,
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title : fallback.title,
    description: typeof raw.description === "string" ? raw.description : fallback.description,
    themeId: raw.themeId && raw.themeId in { "up-red": true, "brilliant-blue": true, "eco-green": true, "space-dark": true } ? raw.themeId : fallback.themeId,
    advancedStyling: Boolean(raw.advancedStyling),
    pages: safePages,
    currentPageId,
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now(),
  };
}

function normalizePage(value: unknown, index: number): Page | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<Page>;
  const blocks = Array.isArray(raw.blocks)
    ? raw.blocks
        .map(normalizeBlock)
        .filter((block): block is Block => Boolean(block))
    : [];

  return {
    id: typeof raw.id === "string" ? raw.id : uid("page"),
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title : `Page ${index + 1}`,
    blocks,
  };
}

function normalizeBlock(value: unknown): Block | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<Block>;
  if (!raw.type || !(raw.type in blockDefinitions)) return undefined;

  const base = createDefaultBlock(raw.type);
  const children =
    raw.type === "twoColumn"
      ? {
          left: Array.isArray(raw.children?.left) ? raw.children.left.map(normalizeBlock).filter((block): block is Block => Boolean(block)) : (base.children?.left ?? []),
          right: Array.isArray(raw.children?.right) ? raw.children.right.map(normalizeBlock).filter((block): block is Block => Boolean(block)) : (base.children?.right ?? []),
        }
      : undefined;
  const style = { ...base.style, ...(raw.style && typeof raw.style === "object" ? raw.style : {}) };
  const settings = { ...base.settings, ...(raw.settings && typeof raw.settings === "object" ? raw.settings : {}) };

  if (raw.type === "image" && settings.imageFit === "contain" && style.minHeight === 320) {
    settings.imageFit = "fitWidth";
    delete style.minHeight;
  }

  return {
    ...base,
    id: typeof raw.id === "string" ? raw.id : base.id,
    content: { ...base.content, ...(raw.content && typeof raw.content === "object" ? raw.content : {}) },
    style,
    settings,
    locked: Boolean(raw.locked),
    children,
  };
}

export function cloneBlock(block: Block): Block {
  return {
    ...structuredClone(block),
    id: uid(block.type),
    children: block.children
      ? {
          left: block.children.left?.map(cloneBlock),
          right: block.children.right?.map(cloneBlock),
        }
      : undefined,
  };
}

export function getCurrentPage(board: Board): Page {
  return board.pages.find((page) => page.id === board.currentPageId) ?? board.pages[0];
}

export function updateCurrentPage(board: Board, update: (page: Page) => Page): Board {
  return {
    ...board,
    updatedAt: Date.now(),
    pages: board.pages.map((page) => (page.id === board.currentPageId ? update(page) : page)),
  };
}

export function mapBlocks(blocks: Block[], blockId: string, update: (block: Block) => Block): Block[] {
  return blocks.map((block) => {
    if (block.id === blockId) return update(block);
    if (block.children) {
      return {
        ...block,
        children: {
          left: block.children.left ? mapBlocks(block.children.left, blockId, update) : [],
          right: block.children.right ? mapBlocks(block.children.right, blockId, update) : [],
        },
      };
    }
    return block;
  });
}

export function findBlock(blocks: Block[], blockId: string): Block | undefined {
  for (const block of blocks) {
    if (block.id === blockId) return block;
    const left = block.children?.left ? findBlock(block.children.left, blockId) : undefined;
    if (left) return left;
    const right = block.children?.right ? findBlock(block.children.right, blockId) : undefined;
    if (right) return right;
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
        if (leftResult.removed) removed = leftResult.removed;
        if (rightResult.removed) removed = rightResult.removed;
        return {
          ...block,
          children: {
            left: leftResult.blocks,
            right: rightResult.blocks,
          },
        };
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
    if (!block.children) return block;
    const nextChildren = { left: block.children.left ?? [], right: block.children.right ?? [] };
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
    return {
      ...block,
      children: {
        left: insertBlock(nextChildren.left, containerId, index, blockToInsert),
        right: insertBlock(nextChildren.right, containerId, index, blockToInsert),
      },
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
    }
  }

  return undefined;
}

export function resolveDrop(blocks: Block[], overId: string): { containerId: string; index: number } {
  if (overId === "root" || overId.endsWith(":left") || overId.endsWith(":right")) {
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
      const left = getContainerBlocks(block.children.left ?? [], containerId);
      if (left.length || hasContainer(block.children.left ?? [], containerId)) return left;
      const right = getContainerBlocks(block.children.right ?? [], containerId);
      if (right.length || hasContainer(block.children.right ?? [], containerId)) return right;
    }
  }
  return [];
}

function hasContainer(blocks: Block[], containerId: string): boolean {
  return blocks.some((block) => block.children && (`${block.id}:left` === containerId || `${block.id}:right` === containerId || hasContainer(block.children.left ?? [], containerId) || hasContainer(block.children.right ?? [], containerId)));
}
