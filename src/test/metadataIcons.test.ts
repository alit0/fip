import { readFileSync } from "fs";
import { describe, it, expect } from "vitest";
import { appIcons } from "@/lib/metadata/icons";

describe("app metadata icons", () => {
  it("declares favicon and apple touch icon", () => {
    expect(appIcons).toMatchObject({
      icon: [{ url: "/favicon.ico", sizes: "any" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    });
  });

  it("ships valid static icon files", () => {
    const ico = readFileSync("public/favicon.ico");
    const apple = readFileSync("public/apple-touch-icon.png");

    expect([...ico.subarray(0, 4)]).toEqual([0, 0, 1, 0]);
    expect(apple.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });
});
