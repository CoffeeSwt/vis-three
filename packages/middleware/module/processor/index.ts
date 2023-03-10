import {
  DeepIntersection,
  DeepPartial,
  DeepRecord,
  DeepUnion,
} from "@vis-three/utils";
import { SymbolConfig } from "../common";
import { EngineSupport } from "../../engine";
import { CompileNotice, Compiler } from "../compiler";
import { CONFIGFACTORY, CONFIGTYPE } from "../space";

export interface ProcessParams<
  S extends SymbolConfig,
  T extends object,
  E extends EngineSupport,
  C extends Compiler<any, any>
> extends CompileNotice {
  config: S;
  target: T;
  compiler: C;
  engine: E;
  processor: Processor<S, T, E, C>;
}

export type RegCommand<
  S extends SymbolConfig,
  T extends object,
  E extends EngineSupport,
  C extends Compiler<S, T>
> = {
  reg: RegExp;
  handler: (params: ProcessParams<S, T, E, C>) => void;
};

export type KeyCommand<
  S extends SymbolConfig,
  T extends object,
  E extends EngineSupport,
  C extends Compiler<S, T>
> = (params: ProcessParams<S, T, E, C>) => void;

export type CommandStructure<
  S extends SymbolConfig,
  T extends object,
  E extends EngineSupport,
  C extends Compiler<S, T>
> = DeepIntersection<
  DeepPartial<
    DeepRecord<DeepUnion<S, KeyCommand<S, T, E, C>>, KeyCommand<S, T, E, C>>
  >,
  { $reg?: RegCommand<S, T, E, C>[] }
>;

export interface ProcessorCommands<
  S extends SymbolConfig,
  T extends object,
  E extends EngineSupport,
  C extends Compiler<any, any>
> {
  add?: CommandStructure<S, T, E, C>;
  set?: CommandStructure<S, T, E, C>;
  delete?: CommandStructure<S, T, E, C>;
}

export interface ProcessorOptions<
  S extends SymbolConfig,
  T extends object,
  E extends EngineSupport,
  C extends Compiler<S, T>
> {
  type: string;
  config: () => S;
  commands?: ProcessorCommands<S, T, E, C>;
  create: (config: S, engine: E, compiler: C) => T;
  dispose: (target: T, engine: E, compiler: C) => void;
}

export type DefineProcessor = <
  S extends SymbolConfig,
  T extends object,
  E extends EngineSupport,
  C extends Compiler<any, any>
>(
  options: ProcessorOptions<S, T, E, C>
) => Processor<S, T, E, C>;

export class Processor<
  S extends SymbolConfig,
  T extends object,
  E extends EngineSupport,
  C extends Compiler<S, T>
> {
  type: string;
  config: () => S;
  commands?: ProcessorCommands<S, T, E, C>;
  create: (config: S, engine: E, compiler: C) => T;
  dispose: (target: T, engine: E, compiler: C) => void;

  constructor(options: ProcessorOptions<S, T, E, C>) {
    this.type = options.type;
    this.commands = options.commands;

    this.create = options.create;
    this.dispose = options.dispose;

    this.config = () => {
      const c = options.config();
      c.type = this.type;
      return c;
    };

    CONFIGTYPE[this.type.toLocaleUpperCase()] = this.type;
    CONFIGFACTORY[this.type] = this.config;
  }

  process(params: ProcessParams<S, T, E, C>) {
    if (!this.commands || !this.commands[params.operate]) {
      this[params.operate](params);
      return;
    }
    let commands = this.commands[params.operate]!;

    for (const key of ([] as string[]).concat(params.path, params.key)) {
      if (!commands[key] && !commands.$reg) {
        this[params.operate](params);
        return;
      } else if (commands[key]) {
        if (typeof commands[key] === "function") {
          (commands[key] as Function)(params);
          return;
        } else {
          commands = commands[key];
        }
      } else if (commands.$reg) {
        for (const item of commands.$reg) {
          if (item.reg.test(key)) {
            item.handler(params);
            return;
          }
        }
      }
    }

    this[params.operate](params);
  }

  add(params: ProcessParams<S, T, E, C>) {
    let target = params.target;
    const path = params.path;

    for (const key of path) {
      if (typeof target[key] !== undefined) {
        target = target[key];
      } else {
        console.warn(`processor can not exec default add operate.`, params);
        return;
      }
    }

    target[params.key] = params.value;
  }

  set(params: ProcessParams<S, T, E, C>) {
    let target = params.target;
    const path = params.path;

    for (const key of path) {
      if (typeof target[key] !== undefined) {
        target = target[key];
      } else {
        console.warn(`processor can not exec default set operate.`, params);
        return;
      }
    }

    target[params.key] = params.value;
  }

  delete(params: ProcessParams<S, T, E, C>) {
    let target = params.target;
    const path = params.path;

    for (const key of path) {
      if (typeof target[key] !== undefined) {
        target = target[key];
      } else {
        console.warn(`processor can not exec default delete operate.`, params);
        return;
      }
    }

    delete target[params.key];
  }
}

export const defineProcessor: DefineProcessor = <
  S extends SymbolConfig,
  T extends object,
  E extends EngineSupport,
  C extends Compiler<any, any>
>(
  options: ProcessorOptions<S, T, E, C>
) => {
  return new Processor<S, T, E, C>(options);
};
