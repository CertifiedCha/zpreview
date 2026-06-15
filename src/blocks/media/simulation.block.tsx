import { Atom } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { containerStyleGroup, defaultStylePresets, iconSize, makeBlock } from "../shared";

export const phetSimulations = [
  { id: "forces-and-motion-basics", title: "Forces and Motion: Basics" },
  { id: "energy-skate-park", title: "Energy Skate Park" },
  { id: "circuit-construction-kit-dc", title: "Circuit Construction Kit: DC" },
  { id: "build-an-atom", title: "Build an Atom" },
  { id: "balancing-chemical-equations", title: "Balancing Chemical Equations" },
  { id: "geometric-optics", title: "Geometric Optics" },
  { id: "pendulum-lab", title: "Pendulum Lab" },
  { id: "wave-on-a-string", title: "Wave on a String" },
  { id: "area-builder", title: "Area Builder" },
  { id: "fractions-intro", title: "Fractions Intro" },
];

export const simulationBlock: BlockDefinition = {
  type: "simulation",
  label: "Simulation",
  category: "multimedia",
  icon: <Atom size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "simulation",
      {
        simulationId: "",
        simulationTitle: "",
      },
      { style: { minHeight: 420 } },
    ),
  preview: (_block, theme) => (
    <div className="rounded-2xl border-2 border-dashed border-blue-200 p-4 text-center" style={{ background: theme.bgLight }}>
      <Atom className="mx-auto mb-2" size={28} style={{ color: theme.primary }} />
      <p className="text-xs font-bold text-zinc-700">Choose PhET simulation</p>
    </div>
  ),
  config: {
    content: [
      {
        section: "content",
        kind: "select",
        key: "simulationId",
        label: "PhET simulation",
        options: [{ label: "Choose a simulation", value: "" }, ...phetSimulations.map((sim) => ({ label: sim.title, value: sim.id }))],
      },
    ],
    stylePresets: defaultStylePresets,
    styleGroups: [containerStyleGroup],
  },
};
