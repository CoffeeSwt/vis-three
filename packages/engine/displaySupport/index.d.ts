import { EngineSupport } from "@vis-three/middleware";
import { Screenshot, WebGLRendererEngine } from "@vis-three/plugin-webgl-renderer";
import { CSS2DRendererEngine } from "@vis-three/plugin-css2d-renderer";
import { CSS3DRendererEngine } from "@vis-three/plugin-css3d-renderer";
import { EffectComposerEngine } from "@vis-three/plugin-effect-composer";
import { OrbitControlsEngine } from "@vis-three/plugin-orbit-controls";
import { WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";
export declare class DisplayEngineSupport extends EngineSupport implements WebGLRendererEngine, EffectComposerEngine, OrbitControlsEngine, CSS2DRendererEngine, CSS3DRendererEngine {
    webGLRenderer: WebGLRenderer;
    getScreenshot: (params?: Screenshot | undefined) => Promise<string>;
    effectComposer: EffectComposer;
    orbitControls: any;
    css2DRenderer: CSS2DRenderer;
    css3DRenderer: CSS3DRenderer;
    constructor();
}
