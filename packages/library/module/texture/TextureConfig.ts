import { SymbolConfig, Vector2Config } from "@vis-three/middleware";
import {
  ClampToEdgeWrapping,
  CubeReflectionMapping,
  LinearEncoding,
  LinearFilter,
  LinearMipmapLinearFilter,
  RGBAFormat,
  UVMapping,
} from "three";

export interface TextureConfig extends SymbolConfig {
  name: string;
  mapping: number;
  wrapS: number;
  wrapT: number;
  magFilter: number;
  minFilter: number;
  anisotropy: number;
  format: number;
  offset: Vector2Config;
  repeat: Vector2Config;
  rotation: number;
  center: Vector2Config;
  matrixAutoUpdate: boolean;
  encoding: number;
  needsUpdate: boolean;
  flipY: boolean;
}

export interface ImageTextureConfig extends TextureConfig {
  url: string;
}

export interface VideoTextureConfig extends TextureConfig {
  url: string;
}

export interface CubeTextureConfig extends TextureConfig {
  cube: {
    nx: string;
    ny: string;
    nz: string;
    px: string;
    py: string;
    pz: string;
  };
}

export interface CanvasTextureConfig extends TextureConfig {
  url: string;
  needsUpdate: boolean;
}

export interface LoadTextureConfig extends TextureConfig {
  url: string;
}

export type TextureAllType =
  | ImageTextureConfig
  | CubeTextureConfig
  | CanvasTextureConfig
  | VideoTextureConfig
  | LoadTextureConfig;

export const getTextureConfig = function (): TextureConfig {
  return {
    vid: "",
    type: "Texture",
    name: "",
    mapping: UVMapping,
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    magFilter: LinearFilter,
    minFilter: LinearMipmapLinearFilter,
    anisotropy: 1,
    format: RGBAFormat,
    flipY: true,
    offset: {
      x: 0,
      y: 0,
    },
    repeat: {
      x: 1,
      y: 1,
    },
    rotation: 0,
    center: {
      x: 0,
      y: 0,
    },
    matrixAutoUpdate: true,
    encoding: LinearEncoding,
    needsUpdate: false,
  };
};

export const getImageTextureConfig = function (): ImageTextureConfig {
  return Object.assign(getTextureConfig(), {
    url: "",
  });
};

export const getVideoTextureConfig = function (): ImageTextureConfig {
  return Object.assign(getTextureConfig(), {
    url: "",
    minFilter: LinearFilter,
  });
};

export const getCubeTextureConfig = function (): CubeTextureConfig {
  return Object.assign(getTextureConfig(), {
    cube: {
      nx: "",
      ny: "",
      nz: "",
      px: "",
      py: "",
      pz: "",
    },
    mapping: CubeReflectionMapping,
    flipY: false,
  });
};

export const getCanvasTextureConfig = function (): CanvasTextureConfig {
  return Object.assign(getTextureConfig(), {
    url: "",
    needsUpdate: false,
  });
};

export const getLoadTextureConfig = function (): LoadTextureConfig {
  return Object.assign(getTextureConfig(), {
    url: "",
  });
};
