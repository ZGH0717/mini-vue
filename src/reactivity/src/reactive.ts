import { track } from "./effect";

export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      // TODO 依赖收集
      track(target,key)
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      // TODO 触发依赖
      return Reflect.set(target, key, value);
    },
  });
}
