import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCreateOrder } from "@/hooks/useOrders";
import type { Order } from "@/stores/types";
import Decimal from "decimal.js";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "motion/react";
import { toast } from "sonner";

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderFormData {
  instrument: string;
  side: "Compra" | "Venda";
  price: string;
  quantity: string;
  userId: string;
}

// Lista de instrumentos disponíveis (poderia vir de uma API)
const availableInstruments = [
  "PETR4",
  "VALE3",
  "ITUB4",
  "BBDC4",
  "ABEV3",
  "MGLU3",
  "WEGE3",
  "RENT3",
  "GGBR4",
  "USIM5",
];

// Schema de validação com Yup
const schema = yup
  .object({
    instrument: yup.string().required("Instrumento é obrigatório"),
    side: yup
      .string()
      .oneOf(["Compra", "Venda"], "Lado deve ser Compra ou Venda")
      .required("Lado é obrigatório"),
    price: yup
      .string()
      .required("Preço é obrigatório")
      .test(
        "valid-price",
        "Preço deve ser um número válido maior que zero",
        (value) => {
          if (!value) return false;
          try {
            const price = new Decimal(value.replace(",", "."));
            return price.gt(0) && price.decimalPlaces() <= 2;
          } catch {
            return false;
          }
        }
      ),
    quantity: yup
      .string()
      .required("Quantidade é obrigatória")
      .test(
        "valid-quantity",
        "Quantidade deve ser um número inteiro maior que zero",
        (value) => {
          if (!value) return false;
          try {
            const quantity = new Decimal(value);
            return quantity.gt(0) && quantity.isInt();
          } catch {
            return false;
          }
        }
      ),
    userId: yup.string().required("ID do usuário é obrigatório"),
  })
  .required();

export function OrderForm({ isOpen, onClose, onSuccess }: OrderFormProps) {
  const createOrderMutation = useCreateOrder();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      instrument: "",
      side: "Compra",
      price: "",
      quantity: "",
      userId: "felipe369",
    },
  });

  // Observar valores para o resumo
  const watchedValues = watch();

  // Submeter formulário
  const onSubmit = async (data: OrderFormData) => {
    const orderToCreate: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
      instrument: data.instrument,
      side: data.side,
      price: new Decimal(data.price.replace(",", ".")).toFixed(2), // Garantir 2 casas decimais
      quantity: new Decimal(data.quantity).toString(),
      remainingQuantity: new Decimal(data.quantity).toString(), // Inicialmente igual à quantidade
      status: "Aberta", // Toda ordem criada inicia com status "Aberta"
      userId: data.userId,
    };

    createOrderMutation.mutate(orderToCreate, {
      onSuccess: () => {
        setTimeout(() => {
          reset();
          onSuccess();
          toast.success("Ordem criada com sucesso!", {
            description: `${data.side} de ${data.quantity} ${data.instrument} a R$ ${data.price}`,
          });
        }, 300);
      },
      onError: (error) => {
        // Mostrar toast de erro
        toast.error("Erro ao criar ordem", {
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
        });
      },
    });
  };

  // Fechar modal
  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  // Formatar preço enquanto digita
  const handlePriceChange = (value: string) => {
    // Permitir apenas números e vírgula/ponto
    const cleanValue = value.replace(/[^0-9.,]/g, "").replace(",", ".");
    return cleanValue;
  };

  // Formatar quantidade enquanto digita
  const handleQuantityChange = (value: string) => {
    // Permitir apenas números inteiros
    const cleanValue = value.replace(/[^0-9]/g, "");
    return cleanValue;
  };

  // Verificar se deve mostrar o resumo
  const shouldShowSummary =
    watchedValues.instrument && watchedValues.price && watchedValues.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Ordem</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova ordem de{" "}
            {watchedValues.side?.toLowerCase()}. Toda ordem criada inicia com
            status "Aberta".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Instrumento */}
          <div className="space-y-2">
            <Label htmlFor="instrument">Instrumento *</Label>
            <Controller
              name="instrument"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="instrument" className="w-full">
                    <SelectValue placeholder="Selecione um instrumento" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInstruments.map((instrument) => (
                      <SelectItem key={instrument} value={instrument}>
                        {instrument}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.instrument && (
              <p className="text-sm text-red-600">
                {errors.instrument.message}
              </p>
            )}
          </div>

          {/* Lado */}
          <div className="space-y-2">
            <Label htmlFor="side">Lado *</Label>
            <Controller
              name="side"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="side" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compra">Compra</SelectItem>
                    <SelectItem value="Venda">Venda</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.side && (
              <p className="text-sm text-red-600">{errors.side.message}</p>
            )}
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$) *</Label>
            <Input
              id="price"
              type="text"
              placeholder="0.00"
              {...register("price", {
                onChange: (e) => {
                  e.target.value = handlePriceChange(e.target.value);
                },
              })}
            />
            {errors.price && (
              <p className="text-sm text-red-600">{errors.price.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use ponto ou vírgula como separador decimal (ex: 25.50)
            </p>
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade *</Label>
            <Input
              id="quantity"
              type="text"
              placeholder="0"
              {...register("quantity", {
                onChange: (e) => {
                  e.target.value = handleQuantityChange(e.target.value);
                },
              })}
            />
            {errors.quantity && (
              <p className="text-sm text-red-600">{errors.quantity.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Deve ser um número inteiro (ex: 100)
            </p>
          </div>

          {/* ID do usuário (oculto em produção) */}
          <div className="space-y-2">
            <Label htmlFor="userId">ID do Usuário</Label>
            <Input
              id="userId"
              type="text"
              {...register("userId")}
              className="bg-muted"
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Identificação automática do usuário
            </p>
          </div>

          {/* Resumo da ordem com animação */}
          {shouldShowSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-muted rounded-lg space-y-2"
            >
              <h4 className="font-medium">Resumo da Ordem</h4>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Instrumento:</strong> {watchedValues.instrument}
                </p>
                <p>
                  <strong>Lado:</strong> {watchedValues.side}
                </p>
                <p>
                  <strong>Preço:</strong> R$ {watchedValues.price}
                </p>
                <p>
                  <strong>Quantidade:</strong> {watchedValues.quantity}
                </p>
                {watchedValues.price && watchedValues.quantity && (
                  <p>
                    <strong>Valor Total:</strong> R${" "}
                    {(() => {
                      try {
                        const price = new Decimal(
                          watchedValues.price.replace(",", ".") || "0"
                        );
                        const quantity = new Decimal(
                          watchedValues.quantity || "0"
                        );
                        return price.mul(quantity).toFixed(2);
                      } catch {
                        return "0.00";
                      }
                    })()}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || createOrderMutation.isPending}
          >
            {isSubmitting || createOrderMutation.isPending
              ? "Criando..."
              : "Criar Ordem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
