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
  loadDrivers,
  setDriverVerified,
  type AdminDriver,
} from "@/lib/admin/data";
import {
  formatDateTime,
  vehicleLabel,
  type AdminTone,
} from "@/lib/admin/format";

type DriverFilter = "all" | "pending" | "verified";

const filters: { value: DriverFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Belum verifikasi" },
  { value: "verified", label: "Terverifikasi" },
];

function driverStatusTone(status: AdminDriver["status"]): AdminTone {
  if (status === "available") return "mint";
  if (status === "busy") return "sun";
  return "neutral";
}

function driverStatusLabel(status: AdminDriver["status"]): string {
  if (status === "available") return "Online";
  if (status === "busy") return "Mengantar";
  return "Offline";
}

export default function AdminDriversPage() {
  const load = useCallback(() => loadDrivers(), []);
  const { data, loading, error, reload, setData } = useAdminQuery(load);
  const [filter, setFilter] = useState<DriverFilter>("all");
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const drivers = data ?? [];
  const visible = drivers.filter((driver) => {
    if (filter === "pending") return !driver.is_verified;
    if (filter === "verified") return driver.is_verified;
    return true;
  });

  async function handleToggle(driver: AdminDriver) {
    if (busyId) return;

    if (
      driver.is_verified &&
      !window.confirm(
        `Cabut verifikasi untuk ${driver.user?.name ?? driver.user?.email ?? "driver ini"}?`,
      )
    ) {
      return;
    }

    setBusyId(driver.id);
    setActionError("");
    setNotice("");

    const result = await setDriverVerified(driver.id, !driver.is_verified);
    setBusyId("");

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setData((current) =>
      current
        ? current.map((item) =>
            item.id === driver.id
              ? { ...item, ...result.data, user: item.user }
              : item,
          )
        : current,
    );
    setNotice(
      result.data.is_verified
        ? "Driver sudah diverifikasi dan bisa mengambil pesanan."
        : "Verifikasi driver dicabut.",
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Cek kendaraan dan identitas sebelum mengaktifkan driver. Driver terverifikasi bisa melihat pesanan yang belum diambil."
        title="Driver"
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
            {drivers.length} driver terdaftar
          </p>
        </div>

        <div className="mt-5">
          {loading && !data ? <LoadingState label="Memuat driver..." /> : null}

          {data && visible.length === 0 ? (
            <EmptyState
              description="Driver yang mendaftar lewat aplikasi driver akan muncul di sini."
              title="Belum ada driver di filter ini"
            />
          ) : null}

          {visible.length > 0 ? (
            <ul className="divide-y-2 divide-ink-900/10">
              {visible.map((driver) => (
                <li
                  key={driver.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold">
                        {driver.user?.name ?? "Tanpa nama"}
                      </p>
                      <Badge
                        label={
                          driver.is_verified
                            ? "Terverifikasi"
                            : "Belum verifikasi"
                        }
                        tone={driver.is_verified ? "mint" : "coral"}
                      />
                      <Badge
                        label={driverStatusLabel(driver.status)}
                        tone={driverStatusTone(driver.status)}
                      />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-ink-600">
                      {driver.user?.email ?? "Email tidak ditemukan"}
                      {driver.user?.phone ? ` · ${driver.user.phone}` : ""}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-ink-500">
                      {vehicleLabel(driver.vehicle_type)} ·{" "}
                      {driver.vehicle_plate ?? "Plat belum diisi"} · daftar{" "}
                      {formatDateTime(driver.created_at)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-ink-500">
                      {driver.is_verified
                        ? `Diverifikasi ${formatDateTime(driver.verified_at)}`
                        : "Menunggu pengecekan admin"}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <AdminButton
                      loading={busyId === driver.id}
                      onClick={() => handleToggle(driver)}
                      variant={driver.is_verified ? "outline" : "primary"}
                    >
                      {driver.is_verified ? "Cabut verifikasi" : "Verifikasi"}
                    </AdminButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Panel>

      <p className="rounded-xl border-2 border-ink-900/20 bg-white px-4 py-3 text-xs font-semibold leading-relaxed text-ink-600">
        Verifikasi tidak mengubah status online driver. Driver yang masih punya
        pesanan aktif tidak bisa dicabut verifikasinya sampai pesanan selesai
        atau dibatalkan.
      </p>
    </div>
  );
}
