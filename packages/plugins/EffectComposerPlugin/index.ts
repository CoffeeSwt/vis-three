import {
  Engine,
  ENGINE_EVENT,
  Plugin,
  RenderEvent,
  SetCameraEvent,
  SetSceneEvent,
  SetSizeEvent,
} from "@vis-three/core";
import {
  RGBAFormat,
  Vector2,
  WebGLMultisampleRenderTarget,
  WebGLRenderTarget,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import {
  WebGLRendererEngine,
  WEBGL_RENDERER_PLUGIN,
} from "@vis-three/plugin-webgl-renderer";
import { Optional, transPkgName } from "@vis-three/utils";
import { name as pkgname } from "./package.json";
export interface EffectComposerParameters {
  WebGLMultisampleRenderTarget?: boolean;
  samples?: number;
  format?: number;
  MSAA?: boolean;
}

export interface EffectComposerEngine extends WebGLRendererEngine {
  effectComposer: EffectComposer;
}

export const EFFECT_COMPOSER_PLUGIN = transPkgName(pkgname);

export const EffectComposerPlugin: Plugin<
  EffectComposerEngine,
  EffectComposerParameters
> = function (params: EffectComposerParameters = {}) {
  let setCameraFun: (event: SetCameraEvent) => void;
  let setSizeFun: (event: SetSizeEvent) => void;
  let setSceneFun: (event: SetSceneEvent) => void;
  let renderFun: (event: RenderEvent) => void;

  return {
    name: EFFECT_COMPOSER_PLUGIN,
    deps: WEBGL_RENDERER_PLUGIN,
    install(engine) {
      let composer: EffectComposer;

      if (params.WebGLMultisampleRenderTarget || params.MSAA) {
        const renderer = engine.webGLRenderer;
        const pixelRatio = renderer.getPixelRatio();
        const size = renderer.getDrawingBufferSize(new Vector2());

        if (Number(window.__THREE__) > 137) {
          composer = new EffectComposer(
            renderer,
            new WebGLRenderTarget(
              size.width * pixelRatio,
              size.height * pixelRatio,
              {
                format: params.format || RGBAFormat,
                // @ts-ignore
                samples: params.samples || 4,
              }
            )
          );
        } else {
          composer = new EffectComposer(
            renderer,
            new WebGLMultisampleRenderTarget(
              size.width * pixelRatio,
              size.height * pixelRatio,
              {
                format: params.format || RGBAFormat,
              }
            )
          );
        }
      } else {
        composer = new EffectComposer(engine.webGLRenderer);
      }

      engine.effectComposer = composer;

      const renderPass = new RenderPass(engine.scene, engine.camera);
      composer.addPass(renderPass);

      setCameraFun = (event) => {
        renderPass.camera = event.camera;
      };

      engine.addEventListener<SetCameraEvent>(
        ENGINE_EVENT.SETCAMERA,
        setCameraFun
      );

      setSceneFun = (event) => {
        renderPass.scene = event.scene;
      };

      engine.addEventListener<SetSceneEvent>(
        ENGINE_EVENT.SETSCENE,
        setSceneFun
      );

      setSizeFun = (event) => {
        composer.setSize(event.width, event.height);
      };

      engine.addEventListener<SetSizeEvent>(ENGINE_EVENT.SETSIZE, setSizeFun);

      console.warn(
        `${EFFECT_COMPOSER_PLUGIN}: hope install close behind the ${WEBGL_RENDERER_PLUGIN}, because ${WEBGL_RENDERER_PLUGIN}\`s renderFun can be dispose. if you not do this, render are prone to bugs`
      );

      engine.popLatestEvent(ENGINE_EVENT.RENDER);

      renderFun = () => {
        composer.render();
      };

      engine.addEventListener<RenderEvent>(ENGINE_EVENT.RENDER, renderFun);
    },
    dispose(engine: Optional<EffectComposerEngine, "effectComposer">) {
      engine.removeEventListener<SetCameraEvent>(
        ENGINE_EVENT.SETCAMERA,
        setCameraFun
      );

      engine.addEventListener<SetSceneEvent>(
        ENGINE_EVENT.SETSCENE,
        setSceneFun
      );

      engine.addEventListener<SetSizeEvent>(ENGINE_EVENT.SETSIZE, setSizeFun);

      engine.removeEventListener<RenderEvent>(ENGINE_EVENT.RENDER, renderFun);

      delete engine.effectComposer;
    },
  };
};
