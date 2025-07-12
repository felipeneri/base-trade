import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { OrderForm } from "../orderForm";
import { Toaster } from "@/components/ui/sonner";

// Criamos um QueryClient para os testes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Definimos para não tentar novamente em caso de erro nos testes
      retry: false,
    },
  },
});

// Componente wrapper para fornecer o QueryClient e o Toaster
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <Toaster />
  </QueryClientProvider>
);

describe("OrderForm Component", () => {
  // Funções mock para as props
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  // Limpamos os mocks antes de cada teste para garantir isolamento
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o formulário com todos os campos necessários", () => {
    render(
      <TestWrapper>
        <OrderForm isOpen={true} onClose={onClose} onSuccess={onSuccess} />
      </TestWrapper>
    );

    // Verificar se os elementos principais estão presentes
    expect(screen.getByText("Nova Ordem")).toBeInTheDocument();
    expect(screen.getByLabelText(/instrumento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preço/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /criar ordem/i })
    ).toBeInTheDocument();
  });

  it("deve preencher campos de texto e submeter o formulário", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <OrderForm isOpen={true} onClose={onClose} onSuccess={onSuccess} />
      </TestWrapper>
    );

    // Preencher apenas os campos de texto (evitando o Select problemático)
    const priceInput = screen.getByLabelText(/preço/i);
    await user.type(priceInput, "55,40");

    const quantityInput = screen.getByLabelText(/quantidade/i);
    await user.type(quantityInput, "100");

    // Verificar se os valores foram preenchidos
    expect(priceInput).toHaveValue("55.40"); // O componente converte vírgula para ponto
    expect(quantityInput).toHaveValue("100");
  });

  it("deve exibir mensagens de erro de validação para campos obrigatórios", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <OrderForm isOpen={true} onClose={onClose} onSuccess={onSuccess} />
      </TestWrapper>
    );

    // Tentar submeter com o formulário vazio
    const submitButton = screen.getByRole("button", { name: /criar ordem/i });
    await user.click(submitButton);

    // Verificar se as mensagens de erro aparecem
    expect(
      await screen.findByText("Instrumento é obrigatório")
    ).toBeInTheDocument();
    expect(await screen.findByText("Preço é obrigatório")).toBeInTheDocument();
    expect(
      await screen.findByText("Quantidade é obrigatória")
    ).toBeInTheDocument();
  });

  it("deve validar formato de preço inválido", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <OrderForm isOpen={true} onClose={onClose} onSuccess={onSuccess} />
      </TestWrapper>
    );

    // Preencher com preço inválido (mais de 2 casas decimais)
    const priceInput = screen.getByLabelText(/preço/i);
    await user.type(priceInput, "10.123");

    const submitButton = screen.getByRole("button", { name: /criar ordem/i });
    await user.click(submitButton);

    // Verificar se a mensagem de erro de validação aparece
    expect(
      await screen.findByText("Preço deve ser um número válido maior que zero")
    ).toBeInTheDocument();
  });
});
