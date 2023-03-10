import { validate } from "uuid";
import { ControlsCompiler } from "./ControlsCompiler";
import { ProxyNotice, Rule } from "../module";

export const validSymbols: string[] = [];

export const ControlsRule: Rule<ControlsCompiler> = function (
  input: ProxyNotice,
  compiler: ControlsCompiler
) {
  Rule(input, compiler, (vid) => {
    return validate(vid) || validSymbols.includes(vid);
  });
};
