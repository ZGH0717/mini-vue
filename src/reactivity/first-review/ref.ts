import { hasChange, isObject } from "../shared";
import {  trackEffects, triggerEffets,isTracking } from "./effect";
import { reactive } from "./reactive";

enum RefFlags {
  IS_REF = "__v_is_ref",
}

class RefImpl {
  private _value: any;
  public dep: any;
  private _rawValue: any;
  public [RefFlags.IS_REF] = true;
  constructor(value) {
    this._rawValue = value;
    this._value = convert(value);
    this.dep = new Set();
  }
  get value() {
    if (isTracking()) {
      trackEffects(this.dep);
    }
    return this._value;
  }
  set value(newValue) {
    if (!hasChange(this._rawValue, newValue)) return;
    this._rawValue = newValue;
    this._value = convert(newValue);
    triggerEffets(this.dep);
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(value) {
  return !!value[RefFlags.IS_REF];
}

export function unRef(value) {
  return isRef(value) ? value.value : value;
}

export function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key) {
      return isRef(target[key]) ? unRef(target[key]) : target[key];
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return (target[key] = value);
      }
    },
  });
}
