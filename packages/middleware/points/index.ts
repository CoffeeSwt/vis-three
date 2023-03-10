import { defineModule } from "../module";
import { PointsCompiler } from "./PointsCompiler";
import PointsProcessor from "./PointsProcessor";
import { PointsRule } from "./PointsRule";

export default defineModule({
  type: "points",
  compiler: PointsCompiler,
  rule: PointsRule,
  processors: [PointsProcessor],
});
