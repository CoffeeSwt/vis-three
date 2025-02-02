import { extendPath, isArray, isObject } from "@vis-three/utils";
import {
  SYMBOL_KEY,
  cacheArray,
  getCacheArray,
  getPath,
  updateArraySymbol,
} from "../../utils/utils";
import { Observer } from "./Observer";
import { react } from "./reactive";

export const proxyWeak = new WeakMap<object, Observer<object>>();

const arrayMethods = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

const arrayMutation = new WeakSet<Array<any>>();

export const proxyGetter = function (
  target: any,
  key: string | symbol,
  receiver: any
) {
  if (Array.isArray(target) && arrayMethods.includes(key as string)) {
    arrayMutation.add(target);
  }
  return Reflect.get(target, key, receiver);
};

export const proxySetter = function (
  target: any,
  key: string | symbol,
  value: any,
  receiver: any,
  observer: Observer<object>
): boolean {
  const path = getPath(target);

  if (typeof key === "symbol" || observer.isIgnore(extendPath(path, key))) {
    return Reflect.set(target, key, value, receiver);
  }

  if (isObject(value) && !proxyWeak.has(value)) {
    value = react(observer, value, target);
  }

  // 新增
  if (target[key] === undefined) {
    if (isObject(value)) {
      value[Symbol.for(SYMBOL_KEY)] = key;
      // 对array value 执行缓存
      isArray(value) && cacheArray(value);
    }

    // 取消setter的更新通知
    isArray(target) && arrayMutation.delete(target);

    const result = Reflect.set(target, key, value);

    isArray(target) && cacheArray(target);

    observer.next({
      operate: "add",
      path,
      key,
      value,
    });

    return result;
  }

  const result = Reflect.set(target, key, value);

  // array的length变更需要重新比对数组，找出真正的操作对象，并且更新缓存
  if (isArray(target)) {
    // 突变进行中，通过length更新通知
    if (arrayMutation.has(target) && key === "length") {
      const oldValue = getCacheArray(target);

      if (!oldValue) {
        console.error("array value is not be cached:", target);
        return result;
      }

      // 跟新array子元素的所有key
      updateArraySymbol(target);

      // 还原length变化场景
      const num = Math.abs(oldValue.length - target.length);
      const operate: "add" | "set" | "delete" =
        oldValue.length >= target.length ? "delete" : "add";
      const contrast = oldValue.length >= target.length ? target : oldValue;

      let execNum = 0;
      let index = 0;

      for (const member of operate === "delete" ? oldValue : target) {
        // TODO: 这里用includes对array<boolean | number | string>类型重复值时会失效，目前来讲暂时用不到重复值，考虑后期换成diff
        if (!contrast.includes(member)) {
          observer.next({
            operate,
            path,
            key: index.toString(),
            value: member,
          });

          execNum += 1;

          if (execNum === num) {
            break;
          }
        }
        index += 1;
      }

      cacheArray(target);
      arrayMutation.delete(target);
      return result;
    } else if (arrayMutation.has(target) || key === "length") {
      return result;
    }
  }

  observer.next({
    operate: "set",
    path,
    key,
    value,
  });

  return result;
};

export const proxyDeleter = function (
  target: any,
  key: string | symbol,
  observer: Observer<object>
): boolean {
  const path = getPath(target);

  if (typeof key === "symbol" || observer.isIgnore(path)) {
    return Reflect.deleteProperty(target, key);
  }

  const value = target[key];
  const result = Reflect.deleteProperty(target, key);

  // array的delete不可信
  if (isArray(target)) {
    return result;
  }

  observer.next({
    operate: "delete",
    path,
    key,
    value,
  });

  return result;
};
