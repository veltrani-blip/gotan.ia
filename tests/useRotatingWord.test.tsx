import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRotatingWord } from "@/lib/useRotatingWord";

describe("useRotatingWord", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("começa pela primeira palavra", () => {
    const { result } = renderHook(() => useRotatingWord(["a", "b", "c"], 2000));
    expect(result.current).toBe("a");
  });

  it("avança após o intervalo", () => {
    const { result } = renderHook(() => useRotatingWord(["a", "b", "c"], 2000));
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current).toBe("b");
  });

  it("faz loop cíclico", () => {
    const { result } = renderHook(() => useRotatingWord(["a", "b"], 1000));
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current).toBe("a");
  });

  it("retorna string vazia para lista vazia", () => {
    const { result } = renderHook(() => useRotatingWord([], 1000));
    expect(result.current).toBe("");
  });
});
