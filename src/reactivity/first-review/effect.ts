import { extend } from "../shared";

let activeEffect;
let shouldTrack;
export class ReactiveEffect {
  private _fn: any;
  private active = true;
  private deps: any = [];
  public scheduler: Function | undefined;
  constructor(fn, scheduler?) {
    this.scheduler = scheduler;
    this._fn = fn;
  }
  run() {
    if (!this.active) {
      return this._fn();
    }
    shouldTrack = true;
    activeEffect = this;
    const res = this._fn();
    shouldTrack = false;
    return res;
  }
  onStop() {
    if (this.active) {
      this.deps.forEach((dep) => {
        dep.delete(this);
      });
      this.deps.length = [];
      this.active = false;
      this.onStop && this.onStop();
    }
  }
}
const targetMaps = new WeakMap();

export function track(target, key) {
  if (!isTracking()) return;

  let targetMap = targetMaps.get(target);
  if (!targetMap) {
    targetMap = new Map();
    targetMaps.set(target, targetMap);
  }
  let deps = targetMap.get(key);
  if (!deps) {
    deps = new Set();
    targetMap.set(key, deps);
  }
  if (deps.has(activeEffect)) return;

  trackEffects(deps);
}
export function trackEffects(deps) {
  deps.add(activeEffect);
  activeEffect && activeEffect.deps.push(deps);
}

export function isTracking() {
  return activeEffect && shouldTrack;
}

export function trigger(target, key) {
  const targetMap = targetMaps.get(target);
  const deps = targetMap.get(key);
  triggerEffets(deps);
}

export function triggerEffets(deps) {
  for (let dep of deps) {
    if (dep.scheduler) {
      dep.scheduler();
    } else {
      dep.run();
    }
  }
}
export function effect(
  fn,
  options: {
    scheduler?: Function | undefined;
    onStop?: Function | undefined;
  } = {}
) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  extend(_effect, options);
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  return runner.effect.onStop();
}
