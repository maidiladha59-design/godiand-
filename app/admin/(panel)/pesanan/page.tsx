"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  Badge,
  EmptyState,
  ErrorNote,
  FilterTabs,
  LoadingState,
  PageHeader,
  Panel,
} from "@/components/admin/ui";
import { useAdminQuery } from "@/components/admin/use-admin-query";
import { loadOrders } from "@/lib/admin/data";
import {
  formatDateTime,
  formatRupiah,
  orderStatusLabel,
  orderStatusTone,
  serviceLabel,
  shortId,
} from "@/lib/admin/format";
import type { OrderStatus } from "@/lib/supabase/database.types";

type OrderFilter = OrderStatus | "all";

const filters: { value: OrderFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "accepted", label: "Diterima" },
  { value: "in_progress", label: "Berjalan" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderFilter>("all");
  const load = useCallback(() => loadOrders(status), [status]);
  const { data, loading, error, reload } = useAdminQuery(load);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Pantau semua pesanan lintas layanan. Buka detail untuk melihat rute, item, pembayaran, dan membatalkan pesanan."
        title="Pesanan"
      />

      {error ? <ErrorNote message={error} onRetry={reload} /> : null}

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs
            onChange={(value) => setStatus(value)}
            options={filters}
            value={status}
          />
          <p className="text-xs font-semibold text-ink-500">
            {data?.length ?? 0} pesanan terbaru
          </p>
        </div>

        <div className="mt-5">
          {loading && !data ? (
            <LoadingState label="Memuat pesanan..." />
          ) : null}

          {data && data.length === 0 ? (
            <EmptyState
              description="Pesanan dari aplikasi pelanggan akan muncul di sini."
              title="Belum ada pesanan di filter ini"
            />
          ) : null}

          {data && data.length > 0 ? (
            <ul className="divide-y-2 divide-ink-900/10">
              {data.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/pesanan/${order.id}`}
                    className="flex flex-col gap-3 py-4 transition hover:bg-mist sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-extrabold">
                          {serviceLabel(order.service_type)} ·{" "}
                          {shortId(order.id)}
                        </p>
                        <Badge
                          label={orderStatusLabel(order.status)}
                          tone={orderStatusTone(order.status)}
                        />
                      </div>
                      <p className="mt-1 truncate text-xs font-semibold text-ink-600">
                        {order.customer?.name ??
                          order.customer?.email ??
                          "Pelanggan"}{" "}
                        · {formatDateTime(order.created_at)}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-ink-500">
                        {order.driver
                          ? `Driver ${order.driver.user?.name ?? "tanpa nama"}`
                          : "Belum ada driver"}
                        {order.merchant ? ` · ${order.merchant.name}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-extrabold">
                        {formatRupiah(order.total_amount)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink-900 bg-white text-sm font-extrabold"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
