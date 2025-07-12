import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { vi } from "vitest";
import type { Mock } from "vitest";
import { ThemeToggle } from "../themeToggle";
import { useTheme } from "../../hooks/useTheme";

// Mock do hook useTheme para controlar os valores retornados nos testes.
vi.mock("../../hooks/useTheme");

describe("ThemeToggle Component", () => {
  it("deve renderizar o ícone da lua quando o tema for 'light'", () => {
    // Definimos o retorno do mock para o tema 'light'.
    (useTheme as Mock).mockReturnValue({
      theme: "light",
      toggleTheme: vi.fn(),
    });

    render(<ThemeToggle />);

    // Verificamos se o botão com o ícone da lua está visível.
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(document.querySelector(".lucide-moon")).toBeInTheDocument();
    expect(document.querySelector(".lucide-sun")).not.toBeInTheDocument();
  });

  it("deve renderizar o ícone do sol quando o tema for 'dark'", () => {
    // Definimos o retorno do mock para o tema 'dark'.
    (useTheme as Mock).mockReturnValue({
      theme: "dark",
      toggleTheme: vi.fn(),
    });

    render(<ThemeToggle />);

    // Verificamos se o botão com o ícone do sol está visível.
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(document.querySelector(".lucide-sun")).toBeInTheDocument();
    expect(document.querySelector(".lucide-moon")).not.toBeInTheDocument();
  });

  it("deve chamar a função toggleTheme quando o botão for clicado", async () => {
    const user = userEvent.setup();
    const toggleThemeMock = vi.fn();

    // Definimos o retorno do mock com uma função espiã (spy).
    (useTheme as Mock).mockReturnValue({
      theme: "light",
      toggleTheme: toggleThemeMock,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button");
    await user.click(button);

    // Verificamos se a função mockada foi chamada uma vez.
    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });
});
