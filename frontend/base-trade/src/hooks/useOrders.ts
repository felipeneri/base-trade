import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type Order,
  type OrderStatusHistory,
  type Trade,
  type OrderFilters,
  type OrderSort,
  type Pagination,
} from "../stores/types";
import Decimal from "decimal.js";
import { startOfDay, endOfDay } from "date-fns";

// Configuração da API (JSON Server)
const API_BASE_URL = "http://localhost:3000";

// Função auxiliar para buscar dados da API
async function fetchApi<T>(endpoint: string): Promise<T> {
  // Adicionar delay de 1 segundo para simular carregamento
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
}

// Função auxiliar para post/put/delete
async function mutateApi<T>(
  endpoint: string,
  data?: unknown,
  method: "POST" | "PUT" | "DELETE" = "POST"
): Promise<T> {
  // Adicionar delay de 1 segundo para simular carregamento
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  if (method === "DELETE") {
    return {} as T;
  }

  return response.json();
}

// Função auxiliar para requisições paginadas que retorna metadados
async function fetchPaginated<T>(endpoint: string): Promise<{
  data: T[];
  pagination: Pagination;
}> {
  // Adicionar delay de 1.5-2 segundos para simular carregamento
  await new Promise((resolve) =>
    setTimeout(resolve, 1500 + Math.random() * 500)
  );

  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  const result = await response.json();

  // JSON Server com paginação retorna os dados no array 'data'
  // e os metadados nas propriedades do objeto de resposta (sem page e per_page)
  return {
    data: result.data || result, // Se result.data existir, usar, senão usar result
    pagination: {
      page: 1, // Será corrigido no useOrders
      per_page: 10, // Será corrigido no useOrders
      items:
        result.items || (result.data ? result.data.length : result.length) || 0,
      last: result.last || 1,
      first: result.first || 1,
      next: result.next || null,
      pages: result.pages || 1,
      prev: result.prev || null,
    },
  };
}

// Hook para buscar todas as ordens com filtros e paginação
export function useOrders(
  filters?: OrderFilters,
  sort?: OrderSort,
  pagination?: Pagination
) {
  return useQuery({
    queryKey: ["orders", filters, sort, pagination],
    queryFn: async () => {
      let endpoint = "/orders";
      const params = new URLSearchParams();

      // Aplicar filtros
      if (filters?.id) params.append("id", filters.id);
      if (filters?.instrument) params.append("instrument", filters.instrument);
      if (filters?.side) params.append("side", filters.side);
      if (filters?.status) params.append("status", filters.status);

      // Filtros de data usando operadores nativos do JSON Server
      // Datas devem estar no formato ISO 8601 (YYYY-MM-DD...)
      if (filters?.dateFrom) {
        const fromDate = startOfDay(filters.dateFrom).toISOString();
        params.append("createdAt_gte", fromDate);
      }
      if (filters?.dateTo) {
        const toDate = endOfDay(filters.dateTo).toISOString();
        params.append("createdAt_lte", toDate);
      }

      // Aplicar ordenação
      if (sort?.field) {
        params.append("_sort", sort.field);
        params.append("_order", sort.direction);
      }

      // Aplicar paginação
      if (pagination?.page && pagination?.per_page) {
        params.append("_page", pagination.page.toString());
        params.append("_per_page", pagination.per_page.toString());
      }

      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const result = await fetchPaginated<Order>(endpoint);

      // Corrigir page e per_page que não vêm da API
      const correctedPagination = {
        ...result.pagination,
        page: pagination?.page || 1,
        per_page: pagination?.per_page || 10,
      };

      return {
        orders: result.data,
        pagination: correctedPagination,
      };
    },
  });
}

// Hook para buscar uma ordem específica
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchApi<Order>(`/orders/${id}`),
    enabled: !!id,
  });
}

// Hook para buscar histórico de status de uma ordem
export function useOrderHistory(orderId: string) {
  return useQuery({
    queryKey: ["orderHistory", orderId],
    queryFn: () =>
      fetchApi<OrderStatusHistory[]>(`/orderStatusHistory?orderId=${orderId}`),
    enabled: !!orderId,
  });
}

// Hook para buscar trades relacionados a uma ordem
export function useOrderTrades(orderId: string) {
  return useQuery({
    queryKey: ["orderTrades", orderId],
    queryFn: async () => {
      const trades = await fetchApi<Trade[]>(
        `/trades?buyingOrderId=${orderId}`
      );
      const sellingTrades = await fetchApi<Trade[]>(
        `/trades?sellingOrderId=${orderId}`
      );
      return [...trades, ...sellingTrades];
    },
    enabled: !!orderId,
  });
}

// Hook para criar uma nova ordem
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newOrder: Omit<Order, "id" | "createdAt" | "updatedAt">
    ) => {
      const now = new Date().toISOString();
      const orderToCreate: Omit<Order, "id"> = {
        ...newOrder,
        status: "Aberta", // Toda ordem criada inicia com status "Aberta"
        remainingQuantity: newOrder.quantity, // Inicialmente, quantidade restante = quantidade total
        createdAt: now,
        updatedAt: now,
      };

      // Criar a ordem
      const createdOrder = await mutateApi<Order>("/orders", orderToCreate);

      //Criar entrada no histórico de status
      const historyEntry: Omit<OrderStatusHistory, "id"> = {
        orderId: createdOrder.id,
        status: "Aberta",
        timestamp: now,
      };
      await mutateApi<OrderStatusHistory>("/orderStatusHistory", historyEntry);

      //Simular execução de ordens (implementar lógica de matching)
      await tryExecuteOrder(createdOrder);

      return createdOrder;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas para refetch
      // Usar invalidação específica para evitar re-renders desnecessários
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["trades"],
        exact: false,
        refetchType: "active",
      });
      // Também invalidamos queries específicas de ordens para garantir que os
      // componentes de detalhes reflitam as execuções e histórico mais recentes.
      queryClient.invalidateQueries({
        queryKey: ["orderTrades"],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["orderHistory"],
        exact: false,
        refetchType: "active",
      });
    },
  });
}

// Hook para cancelar uma ordem
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      // Buscar a ordem atual
      const order = await fetchApi<Order>(`/orders/${orderId}`);

      // Verificar se pode ser cancelada (apenas "Aberta" ou "Parcial")
      if (order.status !== "Aberta" && order.status !== "Parcial") {
        throw new Error(
          'Apenas ordens com status "Aberta" ou "Parcial" podem ser canceladas'
        );
      }

      const now = new Date().toISOString();

      // Atualizar o status da ordem
      const updatedOrder = await mutateApi<Order>(
        `/orders/${orderId}`,
        { ...order, status: "Cancelada", updatedAt: now },
        "PUT"
      );

      // Adicionar entrada no histórico
      const historyEntry: Omit<OrderStatusHistory, "id"> = {
        orderId,
        status: "Cancelada",
        timestamp: now,
      };
      await mutateApi<OrderStatusHistory>("/orderStatusHistory", historyEntry);

      return updatedOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["orderHistory"],
        exact: false,
        refetchType: "active",
      });
    },
  });
}

// Função auxiliar para tentar executar uma ordem (lógica de matching)
async function tryExecuteOrder(newOrder: Order) {
  const isNewOrderBuy = newOrder.side === "Compra";
  const contraparteType = isNewOrderBuy ? "Venda" : "Compra";

  // Buscar ordens da contraparte
  const contraparteOrders = await fetchApi<Order[]>(
    `/orders?side=${contraparteType}&instrument=${newOrder.instrument}`
  );

  // Filtrar ordens compatíveis (status "Aberta" ou "Parcial")
  const compatibleOrders = contraparteOrders.filter(
    (order) =>
      (order.status === "Aberta" || order.status === "Parcial") &&
      isPriceCompatible(newOrder, order)
  );

  // Ordenar por prioridade preço-tempo
  const sortedOrders = sortByPriceTimePriority(compatibleOrders, isNewOrderBuy);

  let remainingQuantity = new Decimal(newOrder.remainingQuantity);
  let currentOrder = newOrder;

  for (const counterOrder of sortedOrders) {
    if (remainingQuantity.lte(0)) break;

    const counterQuantity = new Decimal(counterOrder.remainingQuantity);
    const tradeQuantity = Decimal.min(remainingQuantity, counterQuantity);

    if (tradeQuantity.gt(0)) {
      // Executar o trade
      await executeTrade(currentOrder, counterOrder, tradeQuantity);
      remainingQuantity = remainingQuantity.minus(tradeQuantity);

      // Atualizar a ordem atual
      currentOrder = {
        ...currentOrder,
        remainingQuantity: remainingQuantity.toString(),
        status: remainingQuantity.eq(0) ? "Executada" : "Parcial",
        updatedAt: new Date().toISOString(),
      };
    }
  }
}

// Funções auxiliares para a lógica de execução
function isPriceCompatible(order1: Order, order2: Order): boolean {
  const price1 = new Decimal(order1.price);
  const price2 = new Decimal(order2.price);

  if (order1.side === "Compra") {
    // Compra compatível se preço de compra >= preço de venda
    return price1.gte(price2);
  } else {
    // Venda compatível se preço de venda <= preço de compra
    return price1.lte(price2);
  }
}

function sortByPriceTimePriority(
  orders: Order[],
  isForBuying: boolean
): Order[] {
  return orders.sort((a, b) => {
    const priceA = new Decimal(a.price);
    const priceB = new Decimal(b.price);

    // Prioridade 1: Preço
    const priceComparison = isForBuying
      ? priceB.cmp(priceA) // Para compra, preços mais altos primeiro
      : priceA.cmp(priceB); // Para venda, preços mais baixos primeiro

    if (priceComparison !== 0) return priceComparison;

    // Prioridade 2: Tempo (mais antigo primeiro)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

async function executeTrade(
  buyOrder: Order,
  sellOrder: Order,
  quantity: Decimal
) {
  const now = new Date().toISOString();

  // O preço do negócio é sempre o da ordem que estava no livro
  const tradePrice =
    buyOrder.createdAt < sellOrder.createdAt ? buyOrder.price : sellOrder.price;

  // Criar o trade
  const trade: Omit<Trade, "id"> = {
    buyingOrderId: buyOrder.side === "Compra" ? buyOrder.id : sellOrder.id,
    sellingOrderId: buyOrder.side === "Venda" ? buyOrder.id : sellOrder.id,
    quantity: quantity.toString(),
    price: tradePrice,
    timestamp: now,
  };

  await mutateApi<Trade>("/trades", trade);

  // Atualizar ambas as ordens
  const updateOrder = async (order: Order) => {
    const newRemainingQuantity = new Decimal(order.remainingQuantity).minus(
      quantity
    );
    const newStatus = newRemainingQuantity.eq(0) ? "Executada" : "Parcial";

    const updatedOrder = await mutateApi<Order>(
      `/orders/${order.id}`,
      {
        ...order,
        remainingQuantity: newRemainingQuantity.toString(),
        status: newStatus,
        updatedAt: now,
      },
      "PUT"
    );

    // Adicionar entrada no histórico se o status mudou
    if (order.status !== newStatus) {
      const historyEntry: Omit<OrderStatusHistory, "id"> = {
        orderId: order.id,
        status: newStatus,
        timestamp: now,
      };
      await mutateApi<OrderStatusHistory>("/orderStatusHistory", historyEntry);
    }

    return updatedOrder;
  };

  await Promise.all([updateOrder(buyOrder), updateOrder(sellOrder)]);
}
