import { describe, it, expect } from "vitest";
import { formatPrice } from "@/lib/formatPrice";

describe("formatPrice", () => {
  it("formata zero como Grátis", () => {
    expect(formatPrice(0)).toBe("Grátis");
  });

  it("formata valor com duas casas e cifrão", () => {
    expect(formatPrice(3.99)).toBe("$3.99");
  });

  it("mantém duas casas para inteiros", () => {
    expect(formatPrice(15)).toBe("$15.00");
  });
});
