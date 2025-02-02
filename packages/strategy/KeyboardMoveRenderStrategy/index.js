import { transPkgName } from "@vis-three/utils";
import { name as pkgname } from "./package.json";
import { RENDER_MANAGER_PLUGIN, RENDER_EVENT, } from "@vis-three/render-manager-plugin";
import { KEYBOARD_MOVE_CONTROLS_PLUGIN, } from "@vis-three/keyboard-move-controls-plugin";
export const name = transPkgName(pkgname);
export const KeyboardMoveRenderStrategy = function () {
    let renderFun;
    return {
        name,
        condition: [KEYBOARD_MOVE_CONTROLS_PLUGIN, RENDER_MANAGER_PLUGIN],
        exec(engine) {
            renderFun = (event) => {
                engine.keyboardMoveControls.update(event.delta);
            };
            engine.renderManager.addEventListener(RENDER_EVENT.RENDER, renderFun);
        },
        rollback(engine) {
            engine.renderManager.removeEventListener(RENDER_EVENT.RENDER, renderFun);
        },
    };
};
