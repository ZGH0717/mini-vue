import { ReactiveEffect } from "./effect";

class ComputedImpl {
  effect: ReactiveEffect;
  private _dirty: boolean = true;
  private _value: any;
  constructor(fn) {
    this.effect = new ReactiveEffect(fn, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }
  get value() {
    if (this._dirty) {
      this._value = this.effect.run();
      this._dirty = false;
    }
    return this._value;
  }
}

export function computed(fn) {
  return new ComputedImpl(fn);
}
