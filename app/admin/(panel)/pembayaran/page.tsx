"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  AdminButton,
  Badge,
  EmptyState,
  ErrorNote,
  FilterTabs,
  LoadingState,
  PageHeader,
  Panel,
  SelectField,
  SuccessNote,
} from "@/components/admin/ui";
import { useAdminQuery } from "@/components/admin/use-admin-query";
import {
  loadPayments,
  setPaymentStatus,
  type AdminPayment,
} from "@/lib/admin/data";
import {
  formatDateTime,
  formatRupiah,
  paymentStatusLabel,
  paymentStatusTone,
  serviceLabel,
  shortId,
} from "@/lib/admin/format";
import type { PaymentRow } from "@/lib/supabase/database.types";

type PaymentFilter = PaymentRow["status"] | "all";

const filters: { value: PaymentFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Belum bayar" },
  { value: "paid", label: "Lunas" },
  { value: "failed", label: "Gagal" },
  { value: "refunded", label: "Dikembalikan" },
];

export default function AdminPaymentsPage() {
  const load = useCallback(() => loadPayments(), []);
  const { data, loading, error, reload, setData } = useAdminQuery(load);
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [drafts, setDrafts] = useState<
    Record<string, PaymentRow["status"]>
  >({});
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const payments = data ?? [];
  const visible = payments.filter((payment) =>
    filter === "all" ? true : payment.status === filter,
  );

  function updateDraft(payment: AdminPayment, status: PaymentRow["status"]) {
    setDrafts((current) => ({ ...current, [payment.id]: status }));
  }

  async function handleSave(payment: AdminPayment) {
    if (busyId) return;

    const nextStatus = drafts[payment.id] ?? payment.status;
    if (nextStatus === payment.status) return;

    setBusyId(payment.id);
    setActionError("");
    setNotice("");

    const result = await setPaymentStatus(payment.id, nextStatus);
    setBusyId("");

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setData((current) =>
      current
        ? current.map((item) =>
            item.id === payment.id ? { ...item, ...result.data } : item,
          )
        : current,
    );
    setDrafts((current) => {
      const next = { ...current };
      delete next[payment.id];
      return next;
    });
    setNotice("Status pembayaran diperbarui.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Catatan tunai dan QRIS. Pembayaran dicatat dari halaman detail pesanan, lalu statusnya bisa diubah di sini."
        title="Pembayaran"
      />

      {error ? <ErrorNote message={error} onRetry={reload} /> : null}
      {actionError ? <ErrorNote message={actionError} /> : null}
      {notice ? <SuccessNote message={notice} /> : null}

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs
            onChange={(value) => setFilter(value)}
            options={filters}
            value={filter}
          />
          <p className="text-xs font-semibold text-ink-500">
            {payments.length} catatan pembayaran
          </p>
        </div>

        <div className="mt-5">
          {loading && !data ? (
            <LoadingState label="Memuat pembayaran..." />
          ) : null}

          {data && visible.length === 0 ? (
            <EmptyState
              description="Belum ada pembayaran dicatat. Buka detail pesanan untuk mencatat tunai atau QRIS."
              title="Belum ada pembayaran di filter ini"
            />
          ) : null}

          {visible.length > 0 ? (
            <ul className="divide-y-2 divide-ink-900/10">
              {visible.map((payment) => (
                <li
                  key={payment.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 xl:flex-row xl:items-center xl:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        label={paymentStatusLabel(payment.status)}
                        tone={paymentStatusTone(payment.status)}
                      />
                      <span className="text-sm font-extrabold">
                        {formatRupiah(payment.amount)}
                      </span>
                      <span className="text-xs font-semibold text-ink-500">
                        {payment.method === "cash" ? "Tunai" : "QRIS"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-ink-600">
                      {payment.order ? (
                        <>
                          {serviceLabel(payment.order.service_type)} ·{" "}
                          <Link
                            href={`/admin/pesanan/${payment.order.id}`}
                            className="font-extrabold text-brand-700 underline underline-offset-4"
                          >
                            {shortId(payment.order.id)}
                          </Link>{" "}
                          ·{" "}
                          {payment.customer?.name ??
                            payment.customer?.email ??
                            "Pelanggan"}
                        </>
                      ) : (
                        "Pesanan tidak ditemukan"
                      )}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-ink-500">
                      Dibayar {formatDateTime(payment.paid_at)}
                      {payment.reference
                        ? ` · Ref ${payment.reference}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end">
                    <SelectField
                      label="Ubah status"
                      onChange={(event) =>
                        updateDraft(
                          payment,
                          event.target.value as PaymentRow["status"],
                        )
                      }
                      options={filters
                        .filter((item) => item.value !== "all")
                        .map((item) => ({
                          value: item.value,
                          label: item.label,
                        }))}
                      value={drafts[payment.id] ?? payment.status}
                    />
                    <AdminButton
                      disabled={
                        (drafts[payment.id] ?? payment.status) ===
                        payment.status
                      }
                      loading={busyId === payment.id}
                      onClick={() => handleSave(payment)}
                      variant="outline"
                    >
                      Simpan
                    </AdminButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Panel>

      <p className="rounded-xl border-2 border-ink-900/20 bg-white px-4 py-3 text-xs font-semibold leading-relaxed text-ink-600">
        Nominal pembayaran disalin dari total pesanan saat dicatat. Aplikasi
        pelanggan dan driver belum menulis pembayaran, jadi pencatatan saat ini
        dilakukan admin.
      </p>
    </div>
  );
}
