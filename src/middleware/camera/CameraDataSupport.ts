import { Camera } from "three";
import { IgnoreAttribute } from "../../core/ProxyBroadcast";
import { MODULETYPE } from "../constants/MODULETYPE";
import { ObjectDataSupport } from "../object/ObjectDataSupport";
import { CameraCompiler, CameraCompilerTarget } from "./CameraCompiler";
import { CameraConfigAllType } from "./CameraConfig";
import { CameraRule } from "./CameraRule";
export class CameraDataSupport extends ObjectDataSupport<
  CameraRule,
  CameraCompiler,
  CameraConfigAllType,
  CameraCompilerTarget,
  Camera
> {
  MODULE: MODULETYPE = MODULETYPE.CAMERA;

  constructor(data?: CameraCompilerTarget, ignore?: IgnoreAttribute) {
    !data && (data = {});
    super(CameraRule, data, ignore);
  }
}
