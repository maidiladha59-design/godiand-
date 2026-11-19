"use client";

import Link from "next/link";
import { useCallback, useState, type FormEvent, type ReactNode } from "react";
import {
  AdminButton,
  Badge,
  ErrorNote,
  LoadingState,
  PageHeader,
  Panel,
  SelectField,
  SuccessNote,
  TextAreaField,
  TextField,
} from "@/components/admin/ui";
import { useAdminQuery } from "@/components/admin/use-admin-query";
import {
  cancelOrderAsAdmin,
  loadOrderDetail,
  recordPayment,
} from "@/lib/admin/data";
import {
  formatDateTime,
  formatRupiah,
  orderStatusLabel,
  orderStatusTone,
  paymentStatusLabel,
  paymentStatusTone,
  serviceLabel,
  shortId,
  vehicleLabel,
} from "@/lib/admin/format";
import type { PaymentRow } from "@/lib/supabase/database.types";

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-extrabold uppercase tracking-wide text-ink-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold leading-relaxed text-ink-800">
        {value}
      </dd>
    </div>
  );
}

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const load = useCallback(() => loadOrderDetail(orderId), [orderId]);
  const { data, loading, error, reload, setData } = useAdminQuery(load);

  const [method, setMethod] = useState<PaymentRow["method"]>("cash");
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentRow["status"]>("paid");
  const [reference, setReference] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  async function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingPayment || !data) return;

    setSavingPayment(true);
    setActionError("");
    setNotice("");

    const result = await recordPayment({
      orderId: data.order.id,
      method,
      status: paymentStatus,
      reference,
    });
    setSavingPayment(false);

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setData((current) =>
      current ? { ...current, payment: result.data } : current,
    );
    setNotice("Pembayaran tersimpan.");
  }

  async function handleCancel() {
    if (cancelling || !data) return;

    if (!window.confirm("Batalkan pesanan ini? Tindakan ini tidak bisa dibatalkan lewat panel.")) {
      return;
    }

    setCancelling(true);
    setActionError("");
    setNotice("");

    const result = await cancelOrderAsAdmin(data.order.id, cancelReason);
    setCancelling(false);

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setData((current) =>
      current
        ? {
            ...current,
            order: result.data,
          }
        : current,
    );
    setCancelReason("");
    setNotice("Pesanan dibatalkan.");
  }

  if (loading && !data) {
    return <LoadingState label="Memuat pesanan..." />;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <ErrorNote message={error || "Pesanan tidak ditemukan."} onRetry={reload} />
        <Link
          href="/admin/pesanan"
          className="text-sm font-extrabold text-brand-700 underline underline-offset-4"
        >
          Kembali ke daftar pesanan
        </Link>
      </div>
    );
  }

  const { order } = data;
  const canCancel = ["pending", "accepted", "in_progress"].includes(
    order.status,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link
            href="/admin/pesanan"
            className="gd-btn min-h-10 rounded-xl border-ink-900 bg-white px-4 text-sm text-ink-900 hover:bg-mist"
          >
            Kembali
          </Link>
        }
        description={`Dibuat ${formatDateTime(order.created_at)} oleh ${
          data.customer?.name ?? data.customer?.email ?? "pelanggan"
        }.`}
        title={`Pesanan ${shortId(order.id)}`}
      />

      {error ? <ErrorNote message={error} onRetry={reload} /> : null}
      {actionError ? <ErrorNote message={actionError} /> : null}
      {notice ? <SuccessNote message={notice} /> : null}

      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            label={serviceLabel(order.service_type)}
            tone="brand"
          />
          <Badge
            label={orderStatusLabel(order.status)}
            tone={orderStatusTone(order.status)}
          />
          {order.cancellation_reason ? (
            <span className="text-xs font-semibold text-coral-700">
              Alasan: {order.cancellation_reason}
            </span>
          ) : null}
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Total" value={formatRupiah(order.total_amount)} />
          <Info label="Ongkir" value={formatRupiah(order.delivery_fee)} />
          <Info label="Item" value={formatRupiah(order.items_total)} />
          <Info label="Jarak" value={`${order.distance_km} km`} />
        </dl>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-extrabold tracking-tight">Rute</h2>
          <dl className="mt-4 space-y-4">
            <Info
              label="Jemput"
              value={
                order.pickup_address ||
                data.pickup?.name ||
                "Titik jemput tidak tercatat"
              }
            />
            <Info
              label="Tujuan"
              value={
                order.dropoff_address ||
                data.dropoff?.name ||
                "Titik tujuan tidak tercatat"
              }
            />
            {order.notes ? (
              <Info label="Catatan pelanggan" value={order.notes} />
            ) : null}
            {order.scheduled_at ? (
              <Info
                label="Dijadwalkan"
                value={formatDateTime(order.scheduled_at)}
              />
            ) : null}
          </dl>
        </Panel>

        <Panel>
          <h2 className="text-lg font-extrabold tracking-tight">
            Pelanggan dan mitra
          </h2>
          <dl className="mt-4 space-y-4">
            <Info
              label="Pelanggan"
              value={
                <>
                  {data.customer?.name ?? "Tanpa nama"}
                  <span className="block text-xs font-semibold text-ink-500">
                    {data.customer?.email ?? "-"}
                    {data.customer?.phone
                      ? ` · ${data.customer.phone}`
                      : ""}
                  </span>
                </>
              }
            />
            <Info
              label="Driver"
              value={
                data.driver ? (
                  <>
                    {data.driver.user?.name ?? "Tanpa nama"}
                    <span className="block text-xs font-semibold text-ink-500">
                      {vehicleLabel(data.driver.vehicle_type)} ·{" "}
                      {data.driver.vehicle_plate ?? "plat belum diisi"}
                    </span>
                  </>
                ) : (
                  "Belum ada driver"
                )
              }
            />
            {data.merchant ? (
              <Info
                label="Merchant"
                value={
                  <>
                    {data.merchant.name}
                    <span className="block text-xs font-semibold text-ink-500">
                      {data.merchant.address ?? "Alamat belum diisi"}
                    </span>
                  </>
                }
              />
            ) : null}
            {data.rating ? (
              <Info
                label="Rating pelanggan"
                value={
                  <>
                    {data.rating.score} / 5
                    {data.rating.comment ? (
                      <span className="block text-xs font-semibold text-ink-500">
                        {data.rating.comment}
                      </span>
                    ) : null}
                  </>
                }
              />
            ) : null}
          </dl>
        </Panel>
      </div>

      <Panel>
        <h2 className="text-lg font-extrabold tracking-tight">Rincian item</h2>
        {data.items.length === 0 ? (
          <p className="mt-3 text-sm font-semibold text-ink-600">
            Pesanan ini tidak punya item menu. Ongkir tetap dihitung dari jarak.
          </p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-ink-900/10">
            {data.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-extrabold">{item.name}</p>
                  <p className="text-xs font-semibold text-ink-500">
                    {item.quantity} x {formatRupiah(item.unit_price)}
                    {item.notes ? ` · ${item.notes}` : ""}
                  </p>
                </div>
                <p className="text-sm font-extrabold">
                  {formatRupiah(item.line_total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-extrabold tracking-tight">Pembayaran</h2>

          {data.payment ? (
            <div className="mt-3 rounded-xl border-2 border-ink-900/20 bg-mist p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  label={paymentStatusLabel(data.payment.status)}
                  tone={paymentStatusTone(data.payment.status)}
                />
                <span className="text-xs font-semibold text-ink-600">
                  {data.payment.method === "cash" ? "Tunai" : "QRIS"} ·{" "}
                  {formatRupiah(data.payment.amount)}
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-ink-500">
                Dibayar: {formatDateTime(data.payment.paid_at)}
                {data.payment.reference
                  ? ` · Ref ${data.payment.reference}`
                  : ""}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold text-ink-600">
              Pembayaran belum dicatat. Aplikasi pelanggan dan driver belum
              menulis ke tabel pembayaran.
            </p>
          )}

          {order.status !== "cancelled" ? (
            <form className="mt-4 space-y-3" onSubmit={handlePayment} noValidate>
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Metode"
                  onChange={(event) =>
                    setMethod(event.target.value as PaymentRow["method"])
                  }
                  options={[
                    { value: "cash", label: "Tunai" },
                    { value: "qris", label: "QRIS" },
                  ]}
                  value={method}
                />
                <SelectField
                  label="Status"
                  onChange={(event) =>
                    setPaymentStatus(
                      event.target.value as PaymentRow["status"],
                    )
                  }
                  options={[
                    { value: "paid", label: "Lunas" },
                    { value: "pending", label: "Belum bayar" },
                    { value: "failed", label: "Gagal" },
                    { value: "refunded", label: "Dikembalikan" },
                  ]}
                  value={paymentStatus}
                />
              </div>
              <TextField
                label="Referensi"
                onChange={(event) => setReference(event.target.value)}
                placeholder="Opsional, misal ID transaksi QRIS"
                value={reference}
              />
              <AdminButton loading={savingPayment} type="submit">
                {data.payment ? "Perbarui pembayaran" : "Catat pembayaran"}
              </AdminButton>
              <p className="text-xs font-semibold text-ink-500">
                Nominal otomatis mengikuti total pesanan.
              </p>
            </form>
          ) : null}
        </Panel>

        <Panel>
          <h2 className="text-lg font-extrabold tracking-tight">
            Tindakan admin
          </h2>

          {canCancel ? (
            <div className="mt-3 space-y-3">
              <TextAreaField
                hint="Opsional. Alasan akan disimpan di pesanan."
                label="Alasan pembatalan"
                maxLength={300}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Contoh: pelanggan meminta batal lewat WhatsApp."
                value={cancelReason}
              />
              <AdminButton
                loading={cancelling}
                onClick={handleCancel}
                variant="danger"
              >
                Batalkan pesanan
              </AdminButton>
              <p className="text-xs font-semibold leading-relaxed text-ink-500">
                Pembatalan oleh admin melepas driver dari pesanan. Pesanan yang
                sudah selesai tidak bisa dibatalkan.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold text-ink-600">
              Tidak ada tindakan yang tersedia untuk pesanan berstatus{" "}
              {orderStatusLabel(order.status).toLowerCase()}.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
