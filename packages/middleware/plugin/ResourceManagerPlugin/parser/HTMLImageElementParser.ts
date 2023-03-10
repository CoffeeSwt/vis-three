import { CONFIGFACTORY, CONFIGTYPE } from "../../../module";
import { ImageTextureConfig } from "../../../texture/TextureConfig";
import { ParseParams, Parser, ResourceHanlder } from "./Parser";

export class HTMLImageElementParser extends Parser {
  selector: ResourceHanlder = (
    url: string,
    resource: HTMLImageElement,
    parseMap: Map<Function, Parser>
  ) => {
    if (resource instanceof HTMLImageElement) {
      return parseMap.get(HTMLImageElementParser) || null;
    } else {
      return null;
    }
  };

  parse({ url, resource, configMap, resourceMap }: ParseParams): void {
    const config = CONFIGFACTORY[
      CONFIGTYPE.IMAGETEXTURE
    ]() as ImageTextureConfig;
    config.url = url;

    resourceMap.set(url, resource);
    configMap.set(url, config);
  }
}
