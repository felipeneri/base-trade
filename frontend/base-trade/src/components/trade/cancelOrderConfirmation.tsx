import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/stores/types";
import { Ban, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import Decimal from "decimal.js";

interface CancelOrderConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  order: Order;
  isLoading?: boolean;
}

export function CancelOrderConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  order,
  isLoading = false,
}: CancelOrderConfirmationProps) {
  const formatCurrency = (value: string) => {
    const decimal = new Decimal(value);
    return `R$ ${decimal.toFixed(2)}`;
  };

  const getSideBadge = (side: Order["side"]) => {
    const sideConfig = {
      Compra: {
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        icon: TrendingUp,
      },
      Venda: {
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        icon: TrendingDown,
      },
    };

    const config = sideConfig[side];
    const Icon = config.icon;

    return (
      <Badge
        variant="secondary"
        className={`${config.className} text-xs inline-flex items-center gap-1`}
      >
        <Icon className="w-3 h-3" />
        {side}
      </Badge>
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Ban className="w-5 h-5" />
            Cancelar Ordem
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>Você tem certeza que deseja cancelar esta ordem?</p>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ID:</span>
                  <span className="text-sm font-mono">{order.id}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Instrumento:</span>
                  <span className="text-sm font-semibold">
                    {order.instrument}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lado:</span>
                  {getSideBadge(order.side)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quantidade:</span>
                  <span className="text-sm">{order.quantity}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Preço:</span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(order.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Qtd. Restante:</span>
                  <span className="text-sm">{order.remainingQuantity}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Esta ação não pode ser desfeita. A ordem será permanentemente
                cancelada.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <Ban className="w-4 h-4 mr-2" />
                Sim, cancelar ordem
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
