import { hasChange, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

enum RefFlags {
  IS_REF = "__is_ref",
}

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  public [RefFlags.IS_REF] = true;
  constructor(value) {
    this.dep = new Set();
    this._rawValue = value;
    this._value = convert(value);
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
    triggerEffects(this.dep);
  }
}
function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref[RefFlags.IS_REF];
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },

    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
