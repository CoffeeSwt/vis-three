import { DeepPartial } from "@vis-three/utils";
export interface GlobalOption {
    proxy: {
        expand?: (c: any) => any;
        timing: "before" | "after";
        toRaw?: (c: any) => any;
    };
    symbol: {
        generator: Function;
        validator: Function;
    };
}
export declare const globalOption: GlobalOption;
export declare const defineOption: (options: DeepPartial<GlobalOption>) => void;
