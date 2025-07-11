import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TradeTableSkeletonProps {
  rows?: number;
}

export function TradeTableSkeleton({ rows = 10 }: TradeTableSkeletonProps) {
  return (
    <Card className="bg-background/80 dark:bg-background/95 backdrop-blur-xl border-border/30">
      <CardHeader>
        <CardTitle>Lista de Ordens</CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-30" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border mt-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Instrumento</TableHead>
                <TableHead>Lado</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Qtd. Restante</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, index) => (
                <TableRow key={index} className="h-[50px]">
                  <TableCell className="w-14">
                    <Skeleton className="h-4 w-6" />
                  </TableCell>
                  <TableCell className="w-30">
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-14" />
                  </TableCell>
                  <TableCell className="w-26">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="w-32">
                    <Skeleton className="h-4 w-6" />
                  </TableCell>
                  <TableCell className="w-36">
                    <Skeleton className="h-4 w-6" />
                  </TableCell>
                  <TableCell className="w-34">
                    <Skeleton className="h-4 w-14" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-30" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-6 rounded" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Skeleton para paginação */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>

          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
