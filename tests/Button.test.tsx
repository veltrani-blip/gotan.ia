import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renderiza o texto", () => {
    render(<Button>Gerar App</Button>);
    expect(screen.getByRole("button", { name: "Gerar App" })).toBeDefined();
  });

  it("aplica a variante primary por padrão", () => {
    render(<Button>X</Button>);
    expect(screen.getByRole("button").className).toContain("bg-gradient-to-r");
  });

  it("aplica a variante outline quando solicitada", () => {
    render(<Button variant="outline">X</Button>);
    expect(screen.getByRole("button").className).toContain("border");
  });

  it("aplica a variante ghost quando solicitada", () => {
    render(<Button variant="ghost">X</Button>);
    const cls = screen.getByRole("button").className;
    expect(cls).not.toContain("bg-primary");
  });

  it("repassa className extra", () => {
    render(<Button className="w-full">X</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });
});
