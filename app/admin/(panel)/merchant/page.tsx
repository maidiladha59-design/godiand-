"use client";

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
  SuccessNote,
} from "@/components/admin/ui";
import { useAdminQuery } from "@/components/admin/use-admin-query";
import {
  loadMerchants,
  setMerchantVerified,
  type AdminMerchant,
} from "@/lib/admin/data";
import {
  formatDateTime,
  merchantCategoryLabel,
} from "@/lib/admin/format";

type MerchantFilter = "all" | "pending" | "verified";

const filters: { value: MerchantFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Belum verifikasi" },
  { value: "verified", label: "Terverifikasi" },
];

export default function AdminMerchantsPage() {
  const load = useCallback(() => loadMerchants(), []);
  const { data, loading, error, reload, setData } = useAdminQuery(load);
  const [filter, setFilter] = useState<MerchantFilter>("all");
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const merchants = data ?? [];
  const visible = merchants.filter((merchant) => {
    if (filter === "pending") return !merchant.is_verified;
    if (filter === "verified") return merchant.is_verified;
    return true;
  });

  async function handleToggle(merchant: AdminMerchant) {
    if (busyId) return;

    if (
      merchant.is_verified &&
      !window.confirm(`Cabut verifikasi untuk ${merchant.name}?`)
    ) {
      return;
    }

    setBusyId(merchant.id);
    setActionError("");
    setNotice("");

    const result = await setMerchantVerified(
      merchant.id,
      !merchant.is_verified,
    );
    setBusyId("");

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setData((current) =>
      current
        ? current.map((item) =>
            item.id === merchant.id
              ? { ...item, ...result.data, owner: item.owner }
              : item,
          )
        : current,
    );
    setNotice(
      result.data.is_verified
        ? "Merchant sudah diverifikasi. Pastikan koordinat dan menu sudah benar."
        : "Verifikasi merchant dicabut.",
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Verifikasi toko makanan, mart, dan laundry. Merchant tidak akan tampil di aplikasi pelanggan sebelum diverifikasi."
        title="Merchant"
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
            {merchants.length} merchant terdaftar
          </p>
        </div>

        <div className="mt-5">
          {loading && !data ? (
            <LoadingState label="Memuat merchant..." />
          ) : null}

          {data && visible.length === 0 ? (
            <EmptyState
              description="Merchant yang didaftarkan lewat dashboard Supabase akan muncul di sini."
              title="Belum ada merchant di filter ini"
            />
          ) : null}

          {visible.length > 0 ? (
            <ul className="divide-y-2 divide-ink-900/10">
              {visible.map((merchant) => (
                <li
                  key={merchant.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold">{merchant.name}</p>
                      <Badge
                        label={
                          merchant.is_verified
                            ? "Terverifikasi"
                            : "Belum verifikasi"
                        }
                        tone={merchant.is_verified ? "mint" : "coral"}
                      />
                      <Badge
                        label={merchant.is_active ? "Aktif" : "Nonaktif"}
                        tone={merchant.is_active ? "brand" : "neutral"}
                      />
                      <Badge
                        label={merchantCategoryLabel(merchant.category)}
                        tone="sun"
                      />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-ink-600">
                      {merchant.address ?? "Alamat belum diisi"}
                      {merchant.phone ? ` · ${merchant.phone}` : ""}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-ink-500">
                      Pemilik: {merchant.owner?.email ?? "belum terhubung"} ·
                      daftar {formatDateTime(merchant.created_at)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-ink-500">
                      {merchant.latitude !== null &&
                      merchant.longitude !== null
                        ? `Koordinat ${merchant.latitude}, ${merchant.longitude}`
                        : "Koordinat belum diisi. Lengkapi lewat dashboard Supabase."}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <AdminButton
                      loading={busyId === merchant.id}
                      onClick={() => handleToggle(merchant)}
                      variant={merchant.is_verified ? "outline" : "primary"}
                    >
                      {merchant.is_verified
                        ? "Cabut verifikasi"
                        : "Verifikasi"}
                    </AdminButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Panel>

      <p className="rounded-xl border-2 border-ink-900/20 bg-white px-4 py-3 text-xs font-semibold leading-relaxed text-ink-600">
        Merchant dengan koordinat kosong bisa diverifikasi, tetapi pelanggan
        mungkin tidak bisa menghitung jarak. Isi koordinat dan menu lewat
        dashboard Supabase sebelum toko dipakai.
      </p>
    </div>
  );
}
