import "@testing-library/jest-dom";
import { vi } from "vitest";

import { server } from "./__mocks__/server";

// Mock para window.matchMedia, que não é implementado no JSDOM.
// Isso evita que componentes que usam hooks de tema (como o useTheme)
// quebrem durante os testes.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // obsoleto
    removeListener: vi.fn(), // obsoleto
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock para PointerEvent, que não é totalmente suportado no JSDOM.
// Componentes do Radix UI (como o Select) usam essas APIs.
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Estabelece o servidor de mock da API antes de todos os testes.
beforeAll(() => server.listen());

// Reseta qualquer handler de requisição que possamos adicionar durante os testes,
// para que eles não afetem outros testes.
afterEach(() => server.resetHandlers());

// Limpa o servidor após a conclusão dos testes.
afterAll(() => server.close());
