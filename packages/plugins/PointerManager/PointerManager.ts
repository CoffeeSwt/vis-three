import { EventDispatcher } from "@vis-three/core";
import {
  BaseEvent,
  Camera,
  OrthographicCamera,
  PerspectiveCamera,
  Plane,
  Ray,
  Vector2,
  Vector3,
} from "three";

export interface VisPointerEvent extends Omit<PointerEvent, "type">, BaseEvent {
  mouse: Vector2;
}

export interface PointerManagerParameters {
  dom?: HTMLElement;
  throttleTime?: number;
}

export class PointerManager extends EventDispatcher {
  private dom: HTMLElement | undefined;
  mouse: Vector2;

  private canMouseMove: boolean;
  private mouseEventTimer: number | null;
  private throttleTime: number;

  private pointerDownHandler: (event: PointerEvent) => void;
  private pointerMoveHandler: (event: PointerEvent) => void;
  private pointerUpHandler: (event: PointerEvent) => void;
  private mouseDownHandler: (event: MouseEvent) => void;
  private mouseUpHandler: (event: MouseEvent) => void;
  private clickHandler: (event: MouseEvent) => void;
  private dblclickHandler: (event: MouseEvent) => void;
  private contextmenuHandler: (event: MouseEvent) => void;

  constructor(parameters: PointerManagerParameters) {
    super();
    this.dom = parameters.dom;
    this.mouse = new Vector2();

    this.canMouseMove = true;
    this.mouseEventTimer = null;
    this.throttleTime = parameters.throttleTime || 1000 / 60;

    const mergeEvent = (event: MouseEvent) => {
      const eventObject = {
        mouse: {
          x: this.mouse.x,
          y: this.mouse.y,
        },
      };
      for (const key in event) {
        eventObject[key] = event[key];
      }
      return eventObject as VisPointerEvent;
    };

    const extendEventHandler = (event: PointerEvent | MouseEvent) => {
      event.preventDefault();
      this.dispatchEvent(mergeEvent(event));
    };

    const pointEventHandler = (event: PointerEvent | MouseEvent) => {
      this.dispatchEvent(mergeEvent(event));
    };

    this.pointerMoveHandler = (event: PointerEvent) => {
      if (!this.canMouseMove) {
        return;
      }
      this.canMouseMove = false;
      this.mouseEventTimer = window.setTimeout(() => {
        const mouse = this.mouse;
        const dom = this.dom!;
        const boundingBox = dom.getBoundingClientRect();
        // 兼容css3 dom
        mouse.x =
          ((event.clientX - boundingBox.left) / dom.offsetWidth) * 2 - 1;
        mouse.y =
          -((event.clientY - boundingBox.top) / dom.offsetHeight) * 2 + 1;

        this.canMouseMove = true;

        this.dispatchEvent(mergeEvent(event));
      }, this.throttleTime);
    };

    this.mouseDownHandler = pointEventHandler;

    this.mouseUpHandler = pointEventHandler;

    this.pointerDownHandler = pointEventHandler;

    this.pointerUpHandler = pointEventHandler;

    this.clickHandler = pointEventHandler;

    this.dblclickHandler = pointEventHandler;

    this.contextmenuHandler = extendEventHandler;
  }

  /**
   * 设置当前作用的dom
   * @param dom
   * @returns
   */
  setDom(dom: HTMLElement): this {
    if (this.dom) {
      const dom = this.dom;
      dom.removeEventListener("mousedown", this.mouseDownHandler);
      dom.removeEventListener("mouseup", this.mouseUpHandler);
      dom.removeEventListener("pointerdown", this.pointerDownHandler);
      dom.removeEventListener("pointermove", this.pointerMoveHandler);
      dom.removeEventListener("pointerup", this.pointerUpHandler);
      dom.removeEventListener("click", this.clickHandler);
      dom.removeEventListener("dblclick", this.dblclickHandler);
      dom.removeEventListener("contextmenu", this.contextmenuHandler);
    }
    dom.addEventListener("mousedown", this.mouseDownHandler);
    dom.addEventListener("mouseup", this.mouseUpHandler);
    dom.addEventListener("pointerdown", this.pointerDownHandler);
    dom.addEventListener("pointermove", this.pointerMoveHandler);
    dom.addEventListener("pointerup", this.pointerUpHandler);
    dom.addEventListener("click", this.clickHandler);
    dom.addEventListener("dblclick", this.dblclickHandler);
    dom.addEventListener("contextmenu", this.contextmenuHandler);

    this.dom = dom;
    return this;
  }

  /**
   * 获取归一化的鼠标指针
   * @returns mouse
   */
  getNormalMouse(): Vector2 {
    return this.mouse;
  }

  /**
   * 获取当前指针位置从给定相机出发的世界坐标
   * @param camera
   * @param offset
   * @param result
   * @returns
   */
  getWorldPosition(camera: Camera, offset: number, result?: Vector3) {
    !result && (result = new Vector3());

    if (camera instanceof PerspectiveCamera) {
      const mouse = new Vector3(this.mouse.x, this.mouse.y, 1)
        .unproject(camera)
        .sub(result.setFromMatrixPosition(camera.matrixWorld))
        .normalize();

      result.add(mouse.multiplyScalar(offset));
    } else if (camera instanceof OrthographicCamera) {
      const mouse = new Vector3(
        this.mouse.x,
        this.mouse.y,
        (camera.near + camera.far) / (camera.near - camera.far)
      ).unproject(camera);

      result
        .set(0, 0, -1)
        .transformDirection(camera.matrixWorld)
        .add(mouse.multiplyScalar(offset));
    } else {
      console.warn(
        `pointer manager can not support this type camera: ${camera.type}`
      );
    }

    return result;
  }

  /**
   * 获取当前指针从给定相机出发与给定平面的焦点
   * @param camera
   * @param plane
   * @param result
   */
  intersectPlane(camera: Camera, plane: Plane, result?: Vector3) {
    !result && (result = new Vector3());
    const mouse = new Vector3();
    const ray = new Ray();

    if (camera instanceof PerspectiveCamera) {
      const cameraPosition = new Vector3().setFromMatrixPosition(
        camera.matrixWorld
      );

      mouse
        .set(this.mouse.x, this.mouse.y, 1)
        .unproject(camera)
        .sub(cameraPosition)
        .normalize();

      ray.set(cameraPosition, mouse);
    } else if (camera instanceof OrthographicCamera) {
      mouse
        .set(
          this.mouse.x,
          this.mouse.y,
          (camera.near + camera.far) / (camera.near - camera.far)
        )
        .unproject(camera);

      const direction = new Vector3()
        .set(0, 0, -1)
        .transformDirection(camera.matrixWorld);

      ray.set(mouse, direction);
    } else {
      console.warn(
        `pointer manager can not support this type camera: ${camera.type}`
      );
    }

    return ray.intersectPlane(plane, result);
  }
}
