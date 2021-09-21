import { reactive } from "../src/reactive";
import { effect, stop } from "../src/effect";
describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    // update
    user.age++;
    expect(nextAge).toBe(12);
  });

  it("runner", () => {
    const user = reactive({
      age: 1,
    });
    let age;
    const runner = effect(() => {
      age = user.age + 1;
      return "foo";
    });
    const r = runner();

    expect(age).toBe(2);

    expect(r).toBe("foo");
  });

  it("scheduler", () => {
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // // should not run yet
    expect(dummy).toBe(1);
    // // manually run
    run();
    // // should have run
    expect(dummy).toBe(2);
  });

  it("stop", () => {
    let dummy;
    let dummy2 = 1;
    const obj = reactive({ prop: 1, obj: 1 });
    const test = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    effect(() => {
      dummy2 += test.prop;
    });
    stop(runner);
    obj.prop++;
    expect(dummy).toBe(2);
    runner();
    expect(dummy).toBe(3);
    expect(dummy2).toBe(2);
  });

  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );

    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
