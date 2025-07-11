import { useState, useEffect } from "react";
import {
  Filter,
  Plus,
  SortAsc,
  SortDesc,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  MoreHorizontalIcon,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOrders as useOrdersQuery, useCancelOrder } from "@/hooks/useOrders";
import {
  type Order,
  type OrderFilters,
  type OrderSort,
  type Pagination,
} from "@/stores/types";
import { OrderForm } from "./orderForm";
import { OrderDetails } from "./orderDetails";
import { CancelOrderConfirmation } from "./cancelOrderConfirmation";
import { TradeTableSkeleton } from "../skeletons";
import Decimal from "decimal.js";
import { DatePicker } from "../datePicker";
import { motion, AnimatePresence } from "motion/react";

export default function TradeList() {
  // Estados locais para filtros, ordenação e paginação
  const [filters, setFilters] = useState<OrderFilters>({});
  const [sort, setSort] = useState<OrderSort>({
    field: "createdAt",
    direction: "desc",
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    per_page: 10,
    items: 0,
    last: 0,
    first: 0,
    next: 0,
    pages: 0,
    prev: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  // React Query para buscar ordens
  const {
    data: ordersResponse,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useOrdersQuery(filters, sort, pagination);

  const orders = ordersResponse?.orders || [];
  // Dados de paginação da API para exibição (não para controle de requisições)
  const displayPagination = ordersResponse?.pagination || pagination;

  const cancelOrderMutation = useCancelOrder();

  // Combinar loading states - isLoading para primeira carga, isFetching para refetch
  const isLoadingData = isLoading || isFetching;

  // Sincronizar erro da query com estado local
  useEffect(() => {
    if (queryError) {
      setError(queryError?.message || "Erro desconhecido");
    }
  }, [queryError]);

  // Comentário removido: sincronização não é necessária pois o estado local controla as requisições

  // Filtros temporários para o formulário
  const [tempFilters, setTempFilters] = useState<OrderFilters>(filters);

  // Funções auxiliares
  const clearFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetError = () => {
    setError(null);
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset para primeira página
  };

  // Limpar filtros
  const handleClearFilters = () => {
    setTempFilters({});
    clearFilters();
    setShowFilters(false);
  };

  // Ordenação
  const handleSort = (field: keyof Order) => {
    const newDirection =
      sort.field === field && sort.direction === "asc" ? "desc" : "asc";
    setSort({ field, direction: newDirection });
  };

  // Paginação
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Abrir dialog de confirmação de cancelamento
  const handleCancelOrder = (order: Order) => {
    if (order.status !== "Aberta" && order.status !== "Parcial") {
      setError(
        'Apenas ordens com status "Aberta" ou "Parcial" podem ser canceladas'
      );
      return;
    }

    setOrderToCancel(order);
    setShowCancelConfirmation(true);
  };

  // Efetivamente cancelar a ordem após confirmação
  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      await cancelOrderMutation.mutateAsync(orderToCancel.id);
      setShowCancelConfirmation(false);
      setOrderToCancel(null);
      refetch(); // Recarregar dados
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Erro ao cancelar ordem"
      );
      setShowCancelConfirmation(false);
      setOrderToCancel(null);
    }
  };

  // Ver detalhes da ordem
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Formatadores
  const formatCurrency = (value: string) => {
    const decimal = new Decimal(value);
    return `R$ ${decimal.toFixed(2)}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      Aberta: {
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 opacity-80",
      },
      Parcial: {
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 opacity-80",
      },
      Executada: {
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 opacity-80",
      },
      Cancelada: {
        className:
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 opacity-80",
      },
    };

    const config = statusConfig[status];

    return (
      <Badge variant="secondary" className={config.className}>
        {status}
      </Badge>
    );
  };

  const getSideBadge = (side: Order["side"]) => {
    const sideConfig = {
      Compra: {
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 opacity-80",
      },
      Venda: {
        className:
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 opacity-80",
      },
    };

    const config = sideConfig[side];

    return (
      <Badge variant="secondary" className={config.className}>
        {side}
      </Badge>
    );
  };

  const getSortIcon = (field: keyof Order) => {
    if (sort.field !== field) return null;
    return sort.direction === "asc" ? (
      <SortAsc className="inline w-4 h-4 ml-1" />
    ) : (
      <SortDesc className="inline w-4 h-4 ml-1" />
    );
  };

  // Instrumentos únicos para o filtro
  const uniqueInstruments = [
    ...new Set(orders.map((order) => order.instrument)),
  ];

  return (
    <div className="relative min-h-screen">
      {/* Container principal */}
      <motion.div
        className="relative space-y-6 backdrop-blur-[4px] p-6 rounded-xl border border-muted/70 dark:border-muted/50 bg-gradient-to-br from-background/10 via-brand-purple/8 to-brand-green/8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.7,
        }}
      >
        {/* Header com ações */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
              disabled={isLoadingData}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>

            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoadingData}
              className="flex items-center gap-2"
            >
              {isLoadingData ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                "Atualizar"
              )}
            </Button>
          </div>

          <Button
            onClick={() => setShowOrderForm(true)}
            className="flex items-center gap-2"
            disabled={isLoadingData}
          >
            <Plus className="w-4 h-4" />
            Nova Ordem
          </Button>
        </div>

        {/* Painel de filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{
                duration: 0.4,
                ease: "easeInOut",
                height: { duration: 0.3 },
              }}
              style={{ overflow: "hidden" }}
            >
              <Card className="bg-background/60 backdrop-blur-xl border-border/30">
                <CardHeader>
                  <CardTitle>Filtros</CardTitle>
                  <CardDescription>
                    Filtre as ordens por ID, instrumento, status, data e lado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Filtro por ID */}
                    <div className="space-y-2">
                      <Label htmlFor="filter-id">ID da Ordem</Label>
                      <Input
                        id="filter-id"
                        placeholder="Digite o ID..."
                        value={tempFilters.id || ""}
                        onChange={(e) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            id: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Filtro por instrumento */}
                    <div className="space-y-2">
                      <Label htmlFor="filter-instrument">Instrumento</Label>
                      <Select
                        value={tempFilters.instrument || "all"}
                        onValueChange={(value) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            instrument: value === "all" ? undefined : value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um instrumento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {uniqueInstruments.map((instrument) => (
                            <SelectItem key={instrument} value={instrument}>
                              {instrument}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por lado */}
                    <div className="space-y-2">
                      <Label htmlFor="filter-side">Lado</Label>
                      <Select
                        value={tempFilters.side || "all"}
                        onValueChange={(value) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            side:
                              value === "all"
                                ? undefined
                                : (value as Order["side"]),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o lado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Compra">Compra</SelectItem>
                          <SelectItem value="Venda">Venda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por status */}
                    <div className="space-y-2">
                      <Label htmlFor="filter-status">Status</Label>
                      <Select
                        value={tempFilters.status || "all"}
                        onValueChange={(value) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            status:
                              value === "all"
                                ? undefined
                                : (value as Order["status"]),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Aberta">Aberta</SelectItem>
                          <SelectItem value="Parcial">Parcial</SelectItem>
                          <SelectItem value="Executada">Executada</SelectItem>
                          <SelectItem value="Cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por data inicial */}
                    <DatePicker
                      label="Data Inicial"
                      date={tempFilters.dateFrom}
                      setDate={(date) =>
                        setTempFilters((prev) => ({ ...prev, dateFrom: date }))
                      }
                    />

                    {/* Filtro por data final */}
                    <DatePicker
                      label="Data Final"
                      date={tempFilters.dateTo}
                      setDate={(date) =>
                        setTempFilters((prev) => ({ ...prev, dateTo: date }))
                      }
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleApplyFilters}
                      disabled={isLoadingData}
                    >
                      {isLoadingData ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Aplicando...
                        </>
                      ) : (
                        "Aplicar Filtros"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      disabled={isLoadingData}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mensagens de erro */}
        {error && (
          <Card className="border-red-200/50 bg-red-50/80 dark:bg-red-950/60 backdrop-blur-xl shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-red-800 dark:text-red-300">
                  {typeof error === "string" ? error : "Erro desconhecido"}
                </p>
                <Button variant="ghost" size="sm" onClick={resetError}>
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de ordens */}
        {isLoadingData ? (
          <TradeTableSkeleton rows={pagination.per_page} />
        ) : (
          <Card className="bg-background/80 dark:bg-background/95 backdrop-blur-xl border-border/30">
            <CardHeader>
              <CardTitle>Lista de Ordens</CardTitle>
              <CardDescription>
                {/* ordens quando mais de 1 ou ordem quando 1 */}
                Exibindo {orders.length} orde{orders.length > 1 ? "ns" : "m"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("id")}
                      >
                        ID {getSortIcon("id")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("instrument")}
                      >
                        Instrumento {getSortIcon("instrument")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("side")}
                      >
                        Lado {getSortIcon("side")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("price")}
                      >
                        Preço {getSortIcon("price")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("quantity")}
                      >
                        Quantidade {getSortIcon("quantity")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("remainingQuantity")}
                      >
                        Qtd. Restante {getSortIcon("remainingQuantity")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("status")}
                      >
                        Status {getSortIcon("status")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("createdAt")}
                      >
                        Data/Hora {getSortIcon("createdAt")}
                      </TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          Nenhuma ordem encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell>{order.instrument}</TableCell>
                          <TableCell>{getSideBadge(order.side)}</TableCell>
                          <TableCell>{formatCurrency(order.price)}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.remainingQuantity}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            {formatDateTime(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={cancelOrderMutation.isPending}
                                >
                                  {cancelOrderMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <MoreHorizontalIcon className="w-4 h-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="start"
                                className="w-[200px]"
                              >
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(order)}
                                  disabled={cancelOrderMutation.isPending}
                                >
                                  <Eye className="w-4 h-4" />
                                  Ver detalhes
                                </DropdownMenuItem>

                                {(order.status === "Aberta" ||
                                  order.status === "Parcial") && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleCancelOrder(order)}
                                      disabled={cancelOrderMutation.isPending}
                                    >
                                      {cancelOrderMutation.isPending ? (
                                        <>
                                          <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                                          Cancelando...
                                        </>
                                      ) : (
                                        <>
                                          <Ban className="w-4 h-4 text-red-600" />
                                          Cancelar ordem
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Linhas por página:</p>
                  <Select
                    value={pagination.per_page.toString()}
                    onValueChange={(value) =>
                      setPagination((prev) => ({
                        ...prev,
                        per_page: parseInt(value),
                        page: 1,
                      }))
                    }
                    disabled={isLoadingData}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={pageSize.toString()}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">
                      Página {displayPagination.page} de{" "}
                      {displayPagination.pages}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ({displayPagination.items}{" "}
                      {displayPagination.items === 1 ? "item" : "itens"} total)
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        handlePageChange(displayPagination.page - 1)
                      }
                      disabled={displayPagination.page <= 1 || isLoadingData}
                      title="Página anterior"
                    >
                      {isLoadingData ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        handlePageChange(displayPagination.page + 1)
                      }
                      disabled={
                        displayPagination.page >= displayPagination.pages ||
                        isLoadingData
                      }
                      title="Próxima página"
                    >
                      {isLoadingData ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modais */}
        {showOrderForm && (
          <OrderForm
            isOpen={showOrderForm}
            onClose={() => setShowOrderForm(false)}
            onSuccess={() => setShowOrderForm(false)}
          />
        )}

        {showOrderDetails && selectedOrder && (
          <OrderDetails
            isOpen={showOrderDetails}
            onClose={() => {
              setShowOrderDetails(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
          />
        )}

        {/* Dialog de confirmação para cancelamento da ordem */}
        {orderToCancel && (
          <CancelOrderConfirmation
            isOpen={showCancelConfirmation}
            onConfirm={handleConfirmCancelOrder}
            onCancel={() => {
              setShowCancelConfirmation(false);
              setOrderToCancel(null);
            }}
            order={orderToCancel}
            isLoading={cancelOrderMutation.isPending}
          />
        )}
      </motion.div>
    </div>
  );
}
