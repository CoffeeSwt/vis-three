import { BaseEvent, Camera, Object3D } from "three";
import { validate } from "uuid";
import { ModelingEngine, SCENEVIEWPOINT } from "../../main";
import { DataSupportManager } from "../../manager/DataSupportManager";
import { ResourceManager } from "../../manager/ResourceManager";
import { Compiler, CompilerAddEvent, COMPILEREVENTTYPE, CompilerTarget } from "../../middleware/Compiler";
import { ObjectChangedEvent, VISTRANSFORMEVENTTYPE } from "../../optimize/VisTransformControls";
import { activeChangeEvent, hoverChangeEvent, SCENESTATUSTYPE } from "../../plugins/SceneStatusManager";
import { CameraCompiler } from "../camera/CameraCompiler";
import { CameraDataSupport } from "../camera/CameraDataSupport";
import { SymbolConfig } from "../common/CommonConfig";
import { MODULETYPE } from "../constants/MODULETYPE";
import { OBJECTEVENT } from "../constants/OBJECTEVENT";
import { ControlsCompiler } from "../controls/ControlsCompiler";
import { ControlsDataSupport } from "../controls/ControlsDataSupport";
import { GeometryCompiler } from "../geometry/GeometryCompiler";
import { GeometryDataSupport } from "../geometry/GeometryDataSupport";
import { LightCompiler } from "../light/LightCompiler";
import { LightDataSupport } from "../light/LightDataSupport";
import { MaterialCompiler } from "../material/MaterialCompiler";
import { MaterialDataSupport } from "../material/MaterialDataSupport";
import { ModelCompiler } from "../model/ModelCompiler";
import { ModelDataSupport } from "../model/ModelDataSupport";
import { RendererCompiler } from "../render/RendererCompiler";
import { RendererDataSupport } from "../render/RendererDataSupport";
import { SceneCompiler } from "../scene/SceneCompiler";
import { SceneDataSupport } from "../scene/SceneDataSupport";
import { TextureCompiler } from "../texture/TextureCompiler";
import { TextureDataSupport } from "../texture/TextureDataSupport";
export interface ModelingEngineSupportParameters {
  dom?: HTMLElement
  dataSupportManager: DataSupportManager
  resourceManager: ResourceManager
}

export interface MESActiveEvent extends BaseEvent {
  type: OBJECTEVENT.ACTIVE
  vidSet: Set<string>
}

export interface MESHoverEvent extends BaseEvent {
  type: OBJECTEVENT.HOVER
  vidSet: Set<string>
}

export class ModelingEngineSupport extends ModelingEngine {

  private compilerMap: Map<MODULETYPE, Compiler>

  private resourceManager: ResourceManager
  private dataSupportManager: DataSupportManager

  private objectConfigMap: WeakMap<Object3D, SymbolConfig>

  private cacheDefaultCamera?: Camera

  constructor (parameters: ModelingEngineSupportParameters) {
    super(parameters.dom)

    // 所有support
    const dataSupportManager = parameters.dataSupportManager
    const textureDataSupport = dataSupportManager.getDataSupport(MODULETYPE.TEXTURE)! as TextureDataSupport
    const materialDataSupport = dataSupportManager.getDataSupport(MODULETYPE.MATERIAL)! as MaterialDataSupport
    const cameraDataSupport = dataSupportManager.getDataSupport(MODULETYPE.CAMERA)! as CameraDataSupport
    const lightDataSupport =  dataSupportManager.getDataSupport(MODULETYPE.LIGHT)! as LightDataSupport
    const geometryDataSupport =  dataSupportManager.getDataSupport(MODULETYPE.GEOMETRY)! as GeometryDataSupport
    const modelDataSupport =  dataSupportManager.getDataSupport(MODULETYPE.MODEL)! as ModelDataSupport
    const rendererDataSupport = dataSupportManager.getDataSupport(MODULETYPE.RENDERER)! as RendererDataSupport
    const sceneDataSupport = dataSupportManager.getDataSupport(MODULETYPE.SCENE)! as SceneDataSupport
    const controlsDataSupport = dataSupportManager.getDataSupport(MODULETYPE.CONTROLS)! as ControlsDataSupport

    // 物体配置数据
    const cameraSupportData = cameraDataSupport.getData()
    const lightSupportData = lightDataSupport.getData()
    const modelSupportData = modelDataSupport.getData()
    

    const textureCompiler = new TextureCompiler({
      target: textureDataSupport.getData()
    })

    const materialCompiler = new MaterialCompiler({
      target: materialDataSupport.getData()
    })

    const cameraCompiler = new CameraCompiler({
      target: cameraSupportData,
      scene: this.scene,
      engine: this
    })

    const lightCompiler = new LightCompiler({
      scene: this.scene,
      target: lightSupportData
    })

    const geometryCompiler = new GeometryCompiler({
      target: geometryDataSupport.getData()
    })

    const modelCompiler = new ModelCompiler({
      scene: this.scene,
      target: modelSupportData
    })

    const rendererCompiler = new RendererCompiler({
      target: rendererDataSupport.getData(),
      glRenderer: this.renderer,
      engine: this
    })

    const sceneCompiler = new SceneCompiler({
      target: sceneDataSupport.getData(),
      scene: this.scene
    })

    const controlsCompiler = new ControlsCompiler({
      target: controlsDataSupport.getData(),
      transformControls: this.transformControls
    })

    const resourceManager = parameters.resourceManager

    // 建立编译器链接
    sceneCompiler.linkTextureMap(textureCompiler.getMap())
    materialCompiler.linkTextureMap(textureCompiler.getMap())

    modelCompiler
    .linkGeometryMap(geometryCompiler.getMap())
    .linkMaterialMap(materialCompiler.getMap())
    .linkObjectMap(lightCompiler.getMap())
    .linkObjectMap(cameraCompiler.getMap())
    .linkObjectMap(modelCompiler.getMap())

    cameraCompiler
    .linkObjectMap(lightCompiler.getMap())
    .linkObjectMap(cameraCompiler.getMap())
    .linkObjectMap(modelCompiler.getMap())

    textureCompiler.linkRescourceMap(resourceManager.getMappingResourceMap())
    geometryCompiler.linkRescourceMap(resourceManager.getMappingResourceMap())

    // 添加通知
    textureDataSupport.addCompiler(textureCompiler)
    materialDataSupport.addCompiler(materialCompiler)
    cameraDataSupport.addCompiler(cameraCompiler)
    lightDataSupport.addCompiler(lightCompiler)
    geometryDataSupport.addCompiler(geometryCompiler)
    modelDataSupport.addCompiler(modelCompiler)
    rendererDataSupport.addCompiler(rendererCompiler)
    sceneDataSupport.addCompiler(sceneCompiler)
    controlsDataSupport.addCompiler(controlsCompiler)

    // 引擎操作更新support
    
    const tempMap = new Map()

    cameraCompiler.getMap().forEach((camera, vid) => {
      tempMap.set(vid, camera)
    })

    lightCompiler.getMap().forEach((light, vid) => {
      tempMap.set(vid, light)
    })

    modelCompiler.getMap().forEach((model, vid) => {
      tempMap.set(vid, model)
    })

    const objectConfigMap = new WeakMap()

    Object.keys(cameraSupportData).forEach(vid => {
      objectConfigMap.set(tempMap.get(vid), cameraSupportData[vid])
    })

    Object.keys(lightSupportData).forEach(vid => {
      objectConfigMap.set(tempMap.get(vid), lightSupportData[vid])
    })

    Object.keys(modelSupportData).forEach(vid => {
      objectConfigMap.set(tempMap.get(vid), modelSupportData[vid])
    })
    
    tempMap.clear() // 清除缓存

    // 运行时添加物体映射
    modelCompiler.addEventListener(COMPILEREVENTTYPE.ADD, event => {
      const e = event as unknown as CompilerAddEvent
      objectConfigMap.set(e.object, modelSupportData[e.vid])
    })

    lightCompiler.addEventListener(COMPILEREVENTTYPE.ADD, event => {
      const e = event as unknown as CompilerAddEvent
      objectConfigMap.set(e.object, lightSupportData[e.vid])
    })

    cameraCompiler.addEventListener(COMPILEREVENTTYPE.ADD, event => {
      const e = event as unknown as CompilerAddEvent
      objectConfigMap.set(e.object, cameraSupportData[e.vid])
    })

    // 控制器变换物体更新support
    this.transformControls.addEventListener(VISTRANSFORMEVENTTYPE.OBJECTCHANGED, (event) => {
      const e = event as unknown as ObjectChangedEvent
      const mode = e.mode

      e.transObjectSet.forEach(object => {
        const config = objectConfigMap.get(object)
        if (config && config[mode]) {
          config[mode].x = object[mode].x
          config[mode].y = object[mode].y
          config[mode].z = object[mode].z
        } else {
          // TODO: 这里不应该会出现选不到的物体，需要做优化 例如 helper的children等
          console.warn(`can not font config in this object: '${object}'`)
        }
      })
    })

    // 状态事件抛出support的vid
    this.sceneStatusManager.addEventListener(SCENESTATUSTYPE.HOVERCHANGE, (event) => {
      const e = event as hoverChangeEvent
      const vidSet = new Set<string>()
      e.objectSet.forEach(object => {
        if (objectConfigMap.has(object)) {
          vidSet.add(objectConfigMap.get(object)!.vid)
        } else {
          console.warn(`modeling engine support hover can not found this object mapping vid`, object)
        }
      })

      this.dispatchEvent({
        type: OBJECTEVENT.HOVER,
        vidSet
      })
    })

    this.sceneStatusManager.addEventListener(SCENESTATUSTYPE.ACTIVECHANGE, (event) => {
      const e = event as activeChangeEvent
      const vidSet = new Set<string>()
      e.objectSet.forEach(object => {
        if (objectConfigMap.has(object)) {
          vidSet.add(objectConfigMap.get(object)!.vid)
        } else {
          console.warn(`modeling engine support avtive can not found this object mapping vid`, object)
        }
      })

      this.dispatchEvent({
        type: OBJECTEVENT.ACTIVE,
        vidSet
      })
    })


    // 缓存编译器
    const compilerMap = new Map()
    compilerMap.set(MODULETYPE.TEXTURE, textureCompiler)
    compilerMap.set(MODULETYPE.MATERIAL, materialCompiler)
    compilerMap.set(MODULETYPE.CAMERA, cameraCompiler)
    compilerMap.set(MODULETYPE.LIGHT, lightCompiler)
    compilerMap.set(MODULETYPE.MODEL, modelCompiler)
    compilerMap.set(MODULETYPE.GEOMETRY, geometryCompiler)
    compilerMap.set(MODULETYPE.RENDERER, rendererCompiler)
    compilerMap.set(MODULETYPE.SCENE, sceneCompiler)
    compilerMap.set(MODULETYPE.CONTROLS, controlsCompiler)

    this.compilerMap = compilerMap

    this.dataSupportManager = parameters.dataSupportManager
    this.resourceManager = parameters.resourceManager

    this.objectConfigMap = objectConfigMap
  }

  getDataSupportManager (): DataSupportManager {
    return this.dataSupportManager
  }

  getResourceManager (): ResourceManager {
    return this.resourceManager
  }

  getCompiler<C extends Compiler> (module: MODULETYPE): C {
    return this.compilerMap.get(module) as C
  }

 
  // 通过vid设置相机
  setCameraByVid (vid: string): this {
    if (!vid) {
      if (this.cacheDefaultCamera) {
        this.setCamera(this.cacheDefaultCamera)
        this.cacheDefaultCamera = undefined
        return this
      } else {
        return this
      }
    }

    if (!validate(vid)) {
      console.warn(`modeling engine support: vid is illeage: '${vid}'`)
      return this
    }

    const cameraMap = (this.compilerMap.get(MODULETYPE.CAMERA)! as CameraCompiler).getMap()
    
    if (!cameraMap.has(vid)) {
      console.warn(`modeling engine support: camera compiler can not fount this vid camera: '${vid}'`)
      return this
    }

    if (!this.cacheDefaultCamera) {
      this.cacheDefaultCamera = this.orbitControls.object
    }

    super.setCamera(cameraMap.get(vid)!)

    return this
  }

  // TODO:设置激活物体和hover物体
  setHoverObjects (...vidList: string[]): this {
    return this
  }

  setActiveObjects (...vidList: string[]): this {
    return this
  }
}