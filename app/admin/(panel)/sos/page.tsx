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
  SuccessNote,
} from "@/components/admin/ui";
import { useAdminQuery } from "@/components/admin/use-admin-query";
import {
  loadSosReports,
  setSosStatus,
  type AdminSos,
} from "@/lib/admin/data";
import {
  formatDateTime,
  shortId,
  sosStatusLabel,
  sosStatusTone,
} from "@/lib/admin/format";
import type { SosReportRow } from "@/lib/supabase/database.types";

type SosFilter = SosReportRow["status"] | "all";

const filters: { value: SosFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "open", label: "Baru" },
  { value: "acknowledged", label: "Ditangani" },
  { value: "resolved", label: "Selesai" },
];

export default function AdminSosPage() {
  const load = useCallback(() => loadSosReports(), []);
  const { data, loading, error, reload, setData } = useAdminQuery(load);
  const [filter, setFilter] = useState<SosFilter>("all");
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const reports = data ?? [];
  const visible = reports.filter((report) =>
    filter === "all" ? true : report.status === filter,
  );

  async function handleStatus(
    report: AdminSos,
    status: SosReportRow["status"],
  ) {
    if (busyId) return;

    setBusyId(report.id);
    setActionError("");
    setNotice("");

    const result = await setSosStatus(report.id, status);
    setBusyId("");

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setData((current) =>
      current
        ? current.map((item) =>
            item.id === report.id
              ? { ...item, ...result.data, reporter: item.reporter }
              : item,
          )
        : current,
    );
    setNotice(`Laporan ditandai ${sosStatusLabel(status).toLowerCase()}.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Laporan darurat dari aplikasi pelanggan dan driver. Hubungi 112 atau 110 lebih dulu kalau nyawa terancam."
        title="SOS"
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
            {reports.length} laporan tersimpan
          </p>
        </div>

        <div className="mt-5">
          {loading && !data ? (
            <LoadingState label="Memuat laporan SOS..." />
          ) : null}

          {data && visible.length === 0 ? (
            <EmptyState
              description="Laporan baru dari aplikasi pelanggan atau driver akan muncul di sini."
              title="Tidak ada laporan di filter ini"
            />
          ) : null}

          {visible.length > 0 ? (
            <ul className="space-y-4">
              {visible.map((report) => (
                <li
                  key={report.id}
                  className={`rounded-xl border-2 p-4 ${
                    report.status === "open"
                      ? "border-coral-600 bg-coral-50"
                      : "border-ink-900/20 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      label={sosStatusLabel(report.status)}
                      tone={sosStatusTone(report.status)}
                    />
                    <Badge
                      label={report.category}
                      tone={report.category === "darurat" ? "coral" : "sun"}
                    />
                    <span className="text-xs font-semibold text-ink-500">
                      {formatDateTime(report.created_at)}
                    </span>
                  </div>

                  <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-relaxed text-ink-800">
                    {report.message || "Tanpa pesan."}
                  </p>

                  <p className="mt-2 text-xs font-semibold text-ink-600">
                    Pelapor:{" "}
                    {report.reporter?.name ??
                      report.reporter?.email ??
                      "tidak diketahui"}
                    {report.reporter?.phone
                      ? ` · ${report.reporter.phone}`
                      : ""}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-ink-500">
                    {report.latitude !== null && report.longitude !== null
                      ? `Koordinat ${report.latitude}, ${report.longitude}`
                      : "Lokasi tidak dikirim"}
                    {report.order_id ? (
                      <>
                        {" · "}
                        <Link
                          href={`/admin/pesanan/${report.order_id}`}
                          className="font-extrabold text-brand-700 underline underline-offset-4"
                        >
                          Pesanan {shortId(report.order_id)}
                        </Link>
                      </>
                    ) : null}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {report.status === "open" ? (
                      <AdminButton
                        loading={busyId === report.id}
                        onClick={() => handleStatus(report, "acknowledged")}
                        variant="sun"
                      >
                        Tandai ditangani
                      </AdminButton>
                    ) : null}
                    {report.status !== "resolved" ? (
                      <AdminButton
                        loading={busyId === report.id}
                        onClick={() => handleStatus(report, "resolved")}
                        variant="primary"
                      >
                        Selesaikan
                      </AdminButton>
                    ) : (
                      <AdminButton
                        loading={busyId === report.id}
                        onClick={() => handleStatus(report, "open")}
                        variant="outline"
                      >
                        Buka lagi
                      </AdminButton>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Panel>

      <p className="rounded-xl border-2 border-ink-900/20 bg-white px-4 py-3 text-xs font-semibold leading-relaxed text-ink-600">
        Status dan penanganan dicatat di tabel <code>sos_reports</code>.
        Lokasi hanya terisi kalau aplikasi mengirimkannya; saat ini aplikasi
        menyarankan pelapor menyebut patokan tempat.
      </p>
    </div>
  );
}
