import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { http } from "@/infrastructure/http/http";
import { useAuthStore } from "@/modules/auth/application/auth.store";
import { invalidateInventory } from "@/modules/inventory/application/invalidate-inventory";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { Button } from "@/shared/ui/button";
import type { Order } from "../domain/orders.models";

export function useWompiAvailability() {
  return useQuery({
    queryKey: ["wompi-availability"],
    queryFn: async () =>
      (
        await http.get<{ enabled: boolean; environment: "sandbox" }>(
          "/payments/wompi/availability",
        )
      ).data,
  });
}
export function WompiPayment({ order }: { order: Order }) {
  const client = useQueryClient();
  const availability = useWompiAvailability();
  const transactionId = order.pago?.wompi?.transactionId;
  const verification = useMutation({
    mutationFn: async () => {
      await http.post(`/payments/wompi/orders/${order.pedidoId}/reconcile`, {
        transactionId,
      });
      await client.invalidateQueries({
        predicate: (q) =>
          ["orders", "admin-orders", "order-detail", "wompi-return"].includes(
            String(q.queryKey[0]),
          ),
      });
      await invalidateInventory(client);
    },
  });
  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await http.post<{
        checkoutUrl: string;
        environment: string;
      }>(`/payments/wompi/orders/${order.pedidoId}/checkout`);
      const url = new URL(data.checkoutUrl);
      if (
        data.environment !== "sandbox" ||
        url.origin !== "https://checkout.wompi.co" ||
        url.pathname !== "/p/" ||
        !url.searchParams.get("public-key")?.startsWith("pub_test_")
      )
        throw Error("La respuesta no corresponde al entorno de prueba");
      window.location.assign(url.toString());
    },
  });
  if (
    order.pago?.metodoPago !== "WOMPI" ||
    order.estado !== "CONFIRMADO" ||
    !["PENDIENTE", "RECHAZADO"].includes(order.pago.estado)
  )
    return null;
  return (
    <section
      className="space-y-2 rounded-lg border border-primary/30 p-3"
      aria-label="Pago Wompi de prueba"
    >
      <p className="font-medium">Wompi Sandbox · Simulación</p>
      <p className="text-sm text-muted-foreground">
        Usa únicamente datos de prueba. Esta compra no mueve dinero real.
      </p>
      {order.pago.estado === "PENDIENTE" && transactionId ? (
        <Button
          disabled={verification.isPending || !availability.data?.enabled}
          onClick={() => verification.mutate()}
        >
          Verificar pago Wompi pendiente
        </Button>
      ) : (
        <Button
          disabled={mutation.isPending || !availability.data?.enabled}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending
            ? "Preparando pago…"
            : order.pago.estado === "RECHAZADO"
              ? "Reintentar Wompi (prueba)"
              : "Pagar con Wompi (prueba)"}
        </Button>
      )}
      {!availability.isPending && !availability.data?.enabled && (
        <p role="status">
          Wompi Sandbox no está disponible. Contacta al administrador.
        </p>
      )}
      {order.pago.wompi && (
        <p className="break-all text-xs text-muted-foreground">
          Referencia: {order.pago.wompi.reference}
        </p>
      )}
      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getApiErrorMessage(
            mutation.error,
            "No se pudo abrir el pago de prueba",
          )}
        </p>
      )}
      {verification.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getApiErrorMessage(
            verification.error,
            "No se pudo verificar el pago pendiente",
          )}
        </p>
      )}
      {verification.isSuccess && (
        <p role="status">
          Consulta completada. Revisa el estado actualizado del pedido.
        </p>
      )}
    </section>
  );
}
export function WompiReturn() {
  const [params] = useSearchParams();
  const userId = useAuthStore((state) => state.user?.usuarioId);
  const id = params.get("id"),
    orderId = Number(params.get("wompiOrder"));
  const valid =
    !!id &&
    /^[A-Za-z0-9_-]{1,100}$/.test(id) &&
    Number.isInteger(orderId) &&
    orderId > 0 &&
    orderId <= 2147483647;
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["wompi-return", userId, orderId, id],
    enabled: valid && !!userId,
    retry: false,
    staleTime: Infinity,
    queryFn: async () => {
      const { data } = await http.post<{ paymentStatus: string }>(
        `/payments/wompi/orders/${orderId}/reconcile`,
        { transactionId: id },
      );
      await client.invalidateQueries({
        predicate: (q) =>
          ["orders", "admin-orders", "order-detail"].includes(
            String(q.queryKey[0]),
          ),
      });
      await invalidateInventory(client);
      return data;
    },
  });
  if (!id || !params.has("wompiOrder")) return null;
  if (!valid)
    return (
      <p role="alert">
        No se pudo identificar el pago de prueba. Revisa el pedido.
      </p>
    );
  return (
    <section
      aria-label="Resultado Wompi de prueba"
      className="space-y-2 rounded-lg border bg-card p-4"
    >
      <p className="font-medium">Resultado de Wompi Sandbox</p>
      {query.isPending && <p role="status">Verificando el pago de prueba…</p>}
      {query.data && (
        <p>
          Pago de prueba verificado: {query.data.paymentStatus}. La entrega del
          pedido se gestiona por separado.
        </p>
      )}
      {query.isError && (
        <p role="alert" className="text-destructive">
          {getApiErrorMessage(
            query.error,
            "No se pudo verificar el pago; no se ha aprobado por esta redirección",
          )}
        </p>
      )}
      <Button
        variant="outline"
        disabled={query.isFetching}
        onClick={() => void query.refetch()}
      >
        Volver a verificar pago
      </Button>
    </section>
  );
}
