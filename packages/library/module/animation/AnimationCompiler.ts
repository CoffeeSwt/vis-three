import { CompileNotice, Compiler } from "@vis-three/middleware";
import { AnimationAllType } from "./AnimationConfig";

export class AnimationCompiler extends Compiler<AnimationAllType, Function> {
  scriptAniSymbol = "vis.scriptAni";

  constructor() {
    super();
  }

  private restoreAttribute(config: AnimationAllType): this {
    if (!config.target || !config.attribute) {
      return this;
    }

    let target = this.engine.getObjectBySymbol(config.target) as any;
    let configure = this.engine.getConfigBySymbol(config.target) as any;

    if (!target || !configure) {
      console.warn(
        "AnimationCompiler: can not found object target or config in engine",
        config.vid
      );
    }

    const attirbuteList = config.attribute.split(".");

    attirbuteList.shift();

    const attribute = attirbuteList.pop()!;

    for (const key of attirbuteList) {
      if (target[key] && configure[key]) {
        target = target[key];
        configure = configure[key];
      } else {
        console.warn(
          `AnimationCompiler: object and config attribute are not sync`
        );

        return this;
      }
    }

    target[attribute] = configure[attribute];
    return this;
  }

  cover(config: AnimationAllType): this {
    super.cover(config);

    const fun = this.map.get(config.vid)!;
    config[Symbol.for(this.scriptAniSymbol)] = fun;

    return this;
  }

  remove(config: AnimationAllType): this {
    this.engine.removeEventListener(
      "render",
      config[Symbol.for(this.scriptAniSymbol)]
    );

    this.restoreAttribute(config);

    delete config[Symbol.for(this.scriptAniSymbol)];
    super.remove(config);

    return this;
  }

  compile(vid: string, notice: CompileNotice): this {
    const config = this.target[vid]!;

    this.restoreAttribute(config);

    super.compile(vid, notice);

    const oldFun = this.map.get(vid)!;
    const fun = config[Symbol.for(this.scriptAniSymbol)];
    this.map.set(config.vid, fun);
    this.weakMap.delete(oldFun);
    this.weakMap.set(fun, vid);
    return this;
  }
}
