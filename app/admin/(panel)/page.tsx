"use client";

import Link from "next/link";
import { useCallback } from "react";
import {
  Badge,
  EmptyState,
  ErrorNote,
  LoadingState,
  PageHeader,
  Panel,
  StatCard,
} from "@/components/admin/ui";
import { useAdminQuery } from "@/components/admin/use-admin-query";
import { loadDashboard } from "@/lib/admin/data";
import {
  formatDateTime,
  formatRupiah,
  orderStatusLabel,
  orderStatusTone,
  serviceLabel,
  shortId,
} from "@/lib/admin/format";

export default function AdminDashboardPage() {
  const load = useCallback(() => loadDashboard(), []);
  const { data, loading, error, reload } = useAdminQuery(load);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link
            href="/admin/pesanan"
            className="gd-btn gd-btn-primary min-h-10 rounded-xl px-4 text-sm"
          >
            Lihat semua pesanan
          </Link>
        }
        description="Pantau antrean pesanan, verifikasi mitra, dan laporan darurat dari satu tempat."
        title="Ringkasan"
      />

      {error ? <ErrorNote message={error} onRetry={reload} /> : null}

      {loading && !data ? <LoadingState label="Memuat ringkasan..." /> : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              href="/admin/pesanan"
              label="Pesanan menunggu"
              note="Belum diambil driver."
              tone="sun"
              value={data.counts.pendingOrders}
            />
            <StatCard
              href="/admin/pesanan"
              label="Pesanan berjalan"
              note="Diterima atau sedang diantar."
              tone="brand"
              value={data.counts.activeOrders}
            />
            <StatCard
              href="/admin/driver"
              label="Driver belum verifikasi"
              note="Perlu dicek sebelum bisa mengambil pesanan."
              tone="grape"
              value={data.counts.unverifiedDrivers}
            />
            <StatCard
              href="/admin/merchant"
              label="Merchant belum verifikasi"
              note="Toko belum tampil di aplikasi pelanggan."
              tone="coral"
              value={data.counts.unverifiedMerchants}
            />
            <StatCard
              href="/admin/sos"
              label="SOS baru"
              note="Laporan darurat yang belum ditangani."
              tone="coral"
              value={data.counts.openSos}
            />
            <StatCard
              href="/admin/pembayaran"
              label="Pembayaran belum lunas"
              note="Tunai atau QRIS yang masih pending."
              tone="mint"
              value={data.counts.pendingPayments}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Panel>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold tracking-tight">
                  Pesanan terbaru
                </h2>
                <Link
                  href="/admin/pesanan"
                  className="text-xs font-extrabold text-brand-700 underline underline-offset-4"
                >
                  Semua
                </Link>
              </div>

              {data.recentOrders.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    description="Pesanan baru dari aplikasi pelanggan akan muncul di sini."
                    title="Belum ada pesanan"
                  />
                </div>
              ) : (
                <ul className="mt-4 divide-y-2 divide-ink-900/10">
                  {data.recentOrders.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/admin/pesanan/${order.id}`}
                        className="flex flex-col gap-2 py-3 transition hover:bg-mist sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold">
                            {serviceLabel(order.service_type)} ·{" "}
                            {shortId(order.id)}
                          </p>
                          <p className="truncate text-xs font-semibold text-ink-500">
                            {order.customer?.name ??
                              order.customer?.email ??
                              "Pelanggan"}{" "}
                            · {formatDateTime(order.created_at)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            label={orderStatusLabel(order.status)}
                            tone={orderStatusTone(order.status)}
                          />
                          <span className="text-sm font-extrabold">
                            {formatRupiah(order.total_amount)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold tracking-tight">
                  SOS baru
                </h2>
                <Link
                  href="/admin/sos"
                  className="text-xs font-extrabold text-brand-700 underline underline-offset-4"
                >
                  Semua
                </Link>
              </div>

              {data.openSos.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    description="Tidak ada laporan darurat yang menunggu."
                    title="Aman"
                  />
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {data.openSos.map((report) => (
                    <li
                      key={report.id}
                      className="rounded-xl border-2 border-coral-600/40 bg-coral-50 p-3"
                    >
                      <p className="text-xs font-extrabold uppercase tracking-wide text-coral-700">
                        {report.category}
                      </p>
                      <p className="mt-1 line-clamp-3 text-sm font-semibold leading-relaxed text-ink-700">
                        {report.message || "Tanpa pesan."}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-ink-500">
                        {formatDateTime(report.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}
