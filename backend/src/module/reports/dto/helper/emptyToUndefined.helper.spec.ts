import { emptyToUndefined } from "@/module/reports/dto/helper/emptyToUndefined.helper";

describe("emptyToUndefined", () => {
  it("should return undefined when value is an empty string", () => {
    expect(emptyToUndefined("")).toBeUndefined();
  });

  it("should return the same value when it is not an empty string", () => {
    expect(emptyToUndefined("Monte Alegre")).toBe("Monte Alegre");
  });
});
