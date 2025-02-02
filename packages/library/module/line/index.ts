import { SUPPORT_LIFE_CYCLE } from "@vis-three/middleware";
import { LineCompiler } from "./LineCompiler";
import LineProcessor from "./processors/LineProcessor";
import { LineRule } from "./LineRule";

export * from "./LineCompiler";
export * from "./LineConfig";

export default {
  type: "line",
  object: true,
  compiler: LineCompiler,
  rule: LineRule,
  processors: [LineProcessor],
  lifeOrder: SUPPORT_LIFE_CYCLE.THREE,
};
