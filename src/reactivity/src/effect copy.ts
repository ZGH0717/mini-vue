import { extend } from "../shared";

let activeEffect;
const targetMap = new Map();

export class ReactiveEffect {
  private _fn: any;
  deps: any[] = [];
  active: boolean = true;
  public scheduler: Function | undefined;
  onStop?: Function | undefined;
  constructor(fn, scheduler?: Function) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    if (this.active) {
      activeEffect = this;
    }
    const res = this._fn();
    activeEffect = null;
    return res;
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.onStop && this.onStop();
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}
export function track(target, key) {
  if (!isTracking()) return;
  // target->key->dep

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  trackEffects(dep);
  activeEffect.deps.push(dep);
}

export function trackEffects(dep) {
  if (dep.has(activeEffect)) return;

  dep.add(activeEffect);
}

export function isTracking() {
  return activeEffect && activeEffect.active;
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);

  const dep = depsMap.get(key);

  triggerEffects(dep);
}

export function triggerEffects(dep) {
  for (let effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function stop(runner) {
  runner.effect.stop();
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  extend(_effect, options);
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
