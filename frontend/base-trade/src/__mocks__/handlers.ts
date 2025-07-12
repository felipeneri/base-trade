import { http, HttpResponse } from "msw";

const API_BASE_URL = "http://localhost:3000";

// Define a forma do objeto da ordem que esperamos receber na requisição
interface OrderRequestBody {
  [key: string]: unknown;
}

export const handlers = [
  // Mock para a criação de uma nova ordem
  http.post(`${API_BASE_URL}/orders`, async ({ request }) => {
    const newOrder = (await request.json()) as OrderRequestBody;

    // Simulamos a resposta do backend, adicionando id e timestamps
    const response = {
      id: `order-${Date.now()}`,
      ...newOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  // Mock para a criação do histórico de status
  // Necessário porque useCreateOrder também chama essa rota
  http.post(`${API_BASE_URL}/orderStatusHistory`, async () => {
    return HttpResponse.json({}, { status: 201 });
  }),

  // Mock para buscar ordens compatíveis (chamado por tryExecuteOrder)
  // Retornamos um array vazio para não complicar o teste de criação
  http.get(`${API_BASE_URL}/orders`, () => {
    return HttpResponse.json([]);
  }),
];
