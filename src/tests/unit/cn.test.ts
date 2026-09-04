import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, undefined, null, 0, "b")).toBe("a b");
  });

  it("resolves Tailwind conflicts via twMerge", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("bg-primary", "bg-white")).toBe("bg-white");
  });
});
