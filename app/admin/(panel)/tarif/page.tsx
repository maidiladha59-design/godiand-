"use client";

import { useCallback, useState, type FormEvent } from "react";
import {
  AdminButton,
  Badge,
  EmptyState,
  ErrorNote,
  LoadingState,
  PageHeader,
  Panel,
  SelectField,
  SuccessNote,
  TextField,
} from "@/components/admin/ui";
import { useAdminQuery } from "@/components/admin/use-admin-query";
import {
  createFare,
  loadFares,
  setFareActive,
  type NewFareInput,
} from "@/lib/admin/data";
import {
  formatDate,
  formatRupiah,
  serviceLabel,
} from "@/lib/admin/format";
import type { ServiceType } from "@/lib/supabase/database.types";

const serviceOptions: { value: ServiceType; label: string }[] = [
  { value: "ride", label: "Ojek" },
  { value: "send", label: "Antar" },
  { value: "food", label: "Makan" },
  { value: "laundry", label: "Laundry" },
  { value: "titip", label: "Titip" },
  { value: "mart", label: "Mart" },
];

export default function AdminFaresPage() {
  const load = useCallback(() => loadFares(), []);
  const { data, loading, error, reload, setData } = useAdminQuery(load);
  const [serviceType, setServiceType] = useState<ServiceType>("ride");
  const [baseFare, setBaseFare] = useState("");
  const [perKm, setPerKm] = useState("");
  const [minimumFare, setMinimumFare] = useState("");
  const [maxDistance, setMaxDistance] = useState("30");
  const [effectiveFrom, setEffectiveFrom] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setActionError("");
    setNotice("");

    const input: NewFareInput = {
      serviceType,
      baseFare: Number(baseFare),
      perKm: Number(perKm),
      minimumFare: Number(minimumFare),
      maxDistanceKm: Number(maxDistance),
      effectiveFrom,
    };

    if (
      !baseFare.trim() ||
      !perKm.trim() ||
      !minimumFare.trim() ||
      !maxDistance.trim() ||
      !effectiveFrom ||
      !Number.isInteger(input.baseFare) ||
      !Number.isInteger(input.perKm) ||
      !Number.isInteger(input.minimumFare) ||
      input.baseFare < 0 ||
      input.perKm < 0 ||
      input.minimumFare < 0 ||
      !Number.isFinite(input.maxDistanceKm) ||
      input.maxDistanceKm <= 0
    ) {
      setActionError("Isi angka yang valid. Nominal minimal 0 dan jarak di atas 0.");
      return;
    }

    setSaving(true);
    const result = await createFare(input);
    setSaving(false);

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setBaseFare("");
    setPerKm("");
    setMinimumFare("");
    setMaxDistance("30");
    setNotice(
      `Tarif ${serviceLabel(result.data.service_type)} mulai ${formatDate(result.data.effective_from)} sudah disimpan.`,
    );
    setData((current) =>
      current ? [result.data, ...current] : [result.data],
    );
    await reload();
  }

  async function handleActive(fareId: string, active: boolean) {
    if (busyId) return;

    setBusyId(fareId);
    setActionError("");
    setNotice("");

    const result = await setFareActive(fareId, active);
    setBusyId("");

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setData((current) =>
      current
        ? current.map((item) =>
            item.id === fareId ? { ...item, ...result.data } : item,
          )
        : current,
    );
    setNotice(active ? "Tarif diaktifkan." : "Tarif dinonaktifkan.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Tarif dihitung server saat pesanan dibuat. Tambah tarif baru per tanggal, bukan menimpa riwayat lama."
        title="Tarif"
      />

      {error ? <ErrorNote message={error} onRetry={reload} /> : null}
      {actionError ? <ErrorNote message={actionError} /> : null}
      {notice ? <SuccessNote message={notice} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <Panel>
          <h2 className="text-lg font-extrabold tracking-tight">
            Tambah tarif
          </h2>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-ink-600">
            Tarif dengan tanggal yang sama sudah ada tidak bisa ditambahkan
            dua kali.
          </p>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
            <SelectField
              label="Layanan"
              onChange={(event) =>
                setServiceType(event.target.value as ServiceType)
              }
              options={serviceOptions}
              value={serviceType}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                inputMode="numeric"
                label="Tarif dasar"
                min={0}
                onChange={(event) => setBaseFare(event.target.value)}
                placeholder="5000"
                type="number"
                value={baseFare}
              />
              <TextField
                inputMode="numeric"
                label="Per km"
                min={0}
                onChange={(event) => setPerKm(event.target.value)}
                placeholder="2000"
                type="number"
                value={perKm}
              />
              <TextField
                inputMode="numeric"
                label="Tarif minimum"
                min={0}
                onChange={(event) => setMinimumFare(event.target.value)}
                placeholder="9000"
                type="number"
                value={minimumFare}
              />
              <TextField
                inputMode="decimal"
                label="Jarak maksimum (km)"
                min={0}
                onChange={(event) => setMaxDistance(event.target.value)}
                placeholder="15"
                step="0.1"
                type="number"
                value={maxDistance}
              />
            </div>
            <TextField
              label="Berlaku mulai"
              onChange={(event) => setEffectiveFrom(event.target.value)}
              type="date"
              value={effectiveFrom}
            />
            <AdminButton className="w-full" loading={saving} type="submit">
              Simpan tarif
            </AdminButton>
          </form>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold tracking-tight">
              Riwayat tarif
            </h2>
            <p className="text-xs font-semibold text-ink-500">
              {data?.length ?? 0} baris
            </p>
          </div>

          {loading && !data ? (
            <div className="mt-4">
              <LoadingState label="Memuat tarif..." />
            </div>
          ) : null}

          {data && data.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                description="Jalankan seed awal atau tambah tarif pertama di samping."
                title="Belum ada tarif"
              />
            </div>
          ) : null}

          {data && data.length > 0 ? (
            <ul className="mt-4 divide-y-2 divide-ink-900/10">
              {data.map((fare) => (
                <li
                  key={fare.id}
                  className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold">
                        {serviceLabel(fare.service_type)}
                      </p>
                      <Badge
                        label={fare.is_active ? "Aktif" : "Nonaktif"}
                        tone={fare.is_active ? "mint" : "neutral"}
                      />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-ink-600">
                      Dasar {formatRupiah(fare.base_fare)} +{" "}
                      {formatRupiah(fare.per_km)}/km · minimum{" "}
                      {formatRupiah(fare.minimum_fare)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-ink-500">
                      Maks {fare.max_distance_km} km · berlaku{" "}
                      {formatDate(fare.effective_from)}
                    </p>
                  </div>
                  <AdminButton
                    loading={busyId === fare.id}
                    onClick={() => handleActive(fare.id, !fare.is_active)}
                    variant={fare.is_active ? "outline" : "primary"}
                  >
                    {fare.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </AdminButton>
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>
      </div>

      <p className="rounded-xl border-2 border-ink-900/20 bg-white px-4 py-3 text-xs font-semibold leading-relaxed text-ink-600">
        Tarif yang dipakai adalah baris aktif dengan tanggal berlaku terbaru
        yang tidak melewati hari ini. Cek nominal sebelum rilis ke pengguna.
      </p>
    </div>
  );
}
