import { describe, expect, it } from "vitest";
import { normalizeChatId } from "../src/services/chatIds.js";

describe("chat id normalization", () => {
  it("normalizes phone numbers", () => {
    expect(normalizeChatId("+1 (555) 123-4567")).toBe("15551234567@c.us");
  });

  it("normalizes group aliases", () => {
    expect(normalizeChatId("group:1203630")).toBe("1203630@g.us");
  });
});
