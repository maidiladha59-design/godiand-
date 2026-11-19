"use client";

import { useCallback, useEffect, useState } from "react";
import type { Result } from "@/lib/admin/data";

export function useAdminQuery<T>(loader: () => Promise<Result<T>>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await loader();
      if (result.ok) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Data belum bisa dimuat. Coba lagi ya.");
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  return { data, loading, error, reload, setData };
}
