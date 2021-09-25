import { track, trigger } from "./effect";
import { extend, isObject } from "../shared";

export enum ReactiveFlags {
  IS_REACTIVE = "__v_is_reactive",
  IS_READONLY = "__v_is_readonly",
}
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shalldowGet = createGetter(true, true);
const mutableHandlers = {
  get,
  set,
};
const readonlyHandlers = {
  get: readonlyGet,

  set(target, key) {
    console.warn(`${target}只读，不允许需要其中的key值`);
    return true;
  },
};

const shallowReadonlyHandlers = {
  get: shalldowGet,
};
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    if (isObject(target[key]) && !shallow) {
      return isReadonly ? readonly(target[key]) : reactive(target[key]);
    }
    const res = Reflect.get(target, key);
    track(target, key);
    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

export function reactive(raw) {
  return new Proxy(raw, mutableHandlers);
}

export function readonly(raw) {
  return new Proxy(raw, readonlyHandlers);
}

export function shallowReadonly(raw) {
  return new Proxy(raw, extend({}, readonlyHandlers, shallowReadonlyHandlers));
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
