import { SplineTubeGeometry } from "@vis-three/core";
import { Vector3 } from "three";
import { EngineSupport } from "../engine";
import { defineProcessor, ProcessorCommands } from "../module";
import { commands, create, dispose } from "./common";
import { GeometryCompiler } from "./GeometryCompiler";
import { getSplineTubeGeometryConfig } from "./GeometryConfig";
import { SplineTubeGeometryConfig } from "./GeometryInterface";

export default defineProcessor<
  SplineTubeGeometryConfig,
  SplineTubeGeometry,
  EngineSupport,
  GeometryCompiler
>({
  type: "SplineTubeGeometry",
  config: getSplineTubeGeometryConfig,
  commands: commands as unknown as ProcessorCommands<
    SplineTubeGeometryConfig,
    SplineTubeGeometry,
    EngineSupport,
    GeometryCompiler
  >,
  create: (config) =>
    create(
      new SplineTubeGeometry(
        config.path.map(
          (vector3) => new Vector3(vector3.x, vector3.y, vector3.z)
        ),
        config.tubularSegments,
        config.radius,
        config.radialSegments,
        config.closed
      ),
      config
    ),
  dispose: dispose,
});
