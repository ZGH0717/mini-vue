import { reactive } from "../src/reactive";
import { effect } from "../src/effect";
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
    expect(nextAge).toBe(11);
  });
});
