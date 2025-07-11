// Removendo import React desnecessário
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrderHistory, useCancelOrder } from "@/hooks/useOrders";
import { OrderHistorySkeleton } from "../skeletons";
import { CancelOrderConfirmation } from "./cancelOrderConfirmation";
import type { Order } from "@/stores/types";
import {
  Ban,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  User,
  CheckIcon,
} from "lucide-react";
import Decimal from "decimal.js";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface OrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export function OrderDetails({ isOpen, onClose, order }: OrderDetailsProps) {
  // Estado para controlar o dialog de confirmação de cancelamento
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Buscar histórico da ordem
  const { data: orderHistory = [], isLoading: isHistoryLoading } =
    useOrderHistory(order.id);

  const cancelOrderMutation = useCancelOrder();

  // Formatadores
  const formatCurrency = (value: string) => {
    const decimal = new Decimal(value);
    return `R$ ${decimal.toFixed(2)}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("pt-BR"),
      time: date.toLocaleTimeString("pt-BR"),
    };
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      Aberta: {
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        icon: Clock,
      },
      Parcial: {
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        icon: TrendingUp,
      },
      Executada: {
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        icon: CheckIcon,
      },
      Cancelada: {
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        icon: Ban,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge
        variant="secondary"
        className={`${config.className} text-xs sm:text-sm`}
      >
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        {status}
      </Badge>
    );
  };

  const getSideBadge = (side: Order["side"]) => {
    const sideConfig = {
      Compra: {
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 opacity-80",
        icon: TrendingUp,
      },
      Venda: {
        className:
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 opacity-80",
        icon: TrendingDown,
      },
    };

    const config = sideConfig[side];
    const Icon = config.icon;

    return (
      <Badge
        variant="secondary"
        className={`${config.className} text-xs sm:text-sm`}
      >
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        {side}
      </Badge>
    );
  };

  // Calcular estatísticas
  const totalExecuted = new Decimal(order.quantity).minus(
    new Decimal(order.remainingQuantity)
  );
  const executionPercentage = totalExecuted
    .div(new Decimal(order.quantity))
    .mul(100);

  const totalValue = new Decimal(order.price).mul(new Decimal(order.quantity));
  const executedValue = new Decimal(order.price).mul(totalExecuted);

  // Abrir dialog de confirmação de cancelamento
  const handleCancelOrder = () => {
    if (order.status !== "Aberta" && order.status !== "Parcial") return;
    setShowCancelConfirmation(true);
  };

  // Efetivamente cancelar a ordem após confirmação
  const handleConfirmCancelOrder = async () => {
    try {
      await cancelOrderMutation.mutateAsync(order.id);
      setShowCancelConfirmation(false);
      // O modal será fechado automaticamente quando os dados forem atualizados
    } catch (error) {
      console.error("Erro ao cancelar ordem:", error);
      setShowCancelConfirmation(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh] sm:w-[90vw] sm:max-w-[600px] sm:h-[90vh] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] 2xl:max-w-[1000px] p-3 sm:p-6">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            Detalhes da Ordem #{order.id}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Informações completas e histórico de alterações da ordem
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4" type="always">
          <div className="space-y-2 sm:space-y-3 md:space-y-4 pb-2">
            {/* Informações principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* Dados da ordem */}
              <Card className="h-full">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                    Informações da Ordem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        ID
                      </label>
                      <p className="text-xs sm:text-sm font-mono break-all">
                        {order.id}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Instrumento
                      </label>
                      <p className="text-xs sm:text-sm font-semibold">
                        {order.instrument}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Lado
                      </label>
                      <div>{getSideBadge(order.side)}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Status
                      </label>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Preço
                      </label>
                      <p className="text-xs sm:text-sm font-semibold">
                        {formatCurrency(order.price)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Quantidade
                      </label>
                      <p className="text-xs sm:text-sm">{order.quantity}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Qtd. Restante
                      </label>
                      <p className="text-xs sm:text-sm">
                        {order.remainingQuantity}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Executado
                      </label>
                      <p className="text-xs sm:text-sm">
                        {totalExecuted.toString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Valor Total
                        </label>
                        <p className="text-xs sm:text-sm font-semibold">
                          {formatCurrency(totalValue.toString())}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Valor Executado
                        </label>
                        <p className="text-xs sm:text-sm font-semibold">
                          {formatCurrency(executedValue.toString())}
                        </p>
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                          % Executado
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-brand-purple h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  100,
                                  executionPercentage.toNumber()
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs sm:text-sm font-medium min-w-[3rem]">
                            {executionPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados do usuário e timestamps */}
              <Card className="h-full">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    Informações Complementares
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Usuário
                    </label>
                    <p className="text-xs sm:text-sm font-mono break-all">
                      {order.userId}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Data/Hora de Criação
                    </label>
                    <div className="text-xs sm:text-sm">
                      <p>{formatDateTime(order.createdAt).date}</p>
                      <p className="text-muted-foreground">
                        {formatDateTime(order.createdAt).time}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Última Atualização
                    </label>
                    <div className="text-xs sm:text-sm">
                      <p>{formatDateTime(order.updatedAt).date}</p>
                      <p className="text-muted-foreground">
                        {formatDateTime(order.updatedAt).time}
                      </p>
                    </div>
                  </div>

                  {/* Ações disponíveis */}
                  <div className="pt-3 sm:pt-4 border-t">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Ações Disponíveis
                    </label>
                    <div className="mt-2">
                      {order.status === "Aberta" ||
                      order.status === "Parcial" ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleCancelOrder}
                          disabled={cancelOrderMutation.isPending}
                          className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Ban className="w-3 h-3 sm:w-4 sm:h-4" />
                          {cancelOrderMutation.isPending
                            ? "Cancelando..."
                            : "Cancelar Ordem"}
                        </Button>
                      ) : (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Nenhuma ação disponível para ordens com status "
                          {order.status}"
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Histórico de status */}
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  Histórico de Alterações de Status
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Cronologia completa de todas as mudanças de status da ordem
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isHistoryLoading ? (
                  <OrderHistorySkeleton rows={2} />
                ) : orderHistory.length === 0 ? (
                  <p className="text-center py-8 text-xs sm:text-sm text-muted-foreground">
                    Nenhum histórico encontrado
                  </p>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm min-w-[100px]">
                            Status
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm min-w-[100px]">
                            Data
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm min-w-[100px]">
                            Horário
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm min-w-[150px] hidden md:table-cell">
                            Timestamp
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderHistory.map((history) => {
                          const datetime = formatDateTime(history.timestamp);
                          return (
                            <TableRow key={history.id}>
                              <TableCell className="p-2 sm:p-4">
                                {getStatusBadge(history.status)}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm p-2 sm:p-4">
                                {datetime.date}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm p-2 sm:p-4">
                                {datetime.time}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground p-2 sm:p-4 hidden md:table-cell">
                                {history.timestamp}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>

      {/* Dialog de confirmação para cancelamento da ordem */}
      <CancelOrderConfirmation
        isOpen={showCancelConfirmation}
        onConfirm={handleConfirmCancelOrder}
        onCancel={() => setShowCancelConfirmation(false)}
        order={order}
        isLoading={cancelOrderMutation.isPending}
      />
    </Dialog>
  );
}
