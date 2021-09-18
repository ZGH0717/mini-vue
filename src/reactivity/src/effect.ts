let activeEffect;

class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    this._fn();
  }
}
const targetMap = new Map();
export function track(target, key) {
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
  dep.add(activeEffect);
}

export function trigger(target,key){
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  for(let _effect of dep){
    _effect.run()
  }
}

export function effect(fn) {
  const effect = new ReactiveEffect(fn);
  effect.run();
  return effect;
}
