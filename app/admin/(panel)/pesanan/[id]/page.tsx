import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOrderDetail } from "@/components/admin/order-detail";
import { LoadingState } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: { absolute: "Detail Pesanan | Admin GoDiand" },
  robots: { index: false, follow: false, noarchive: true },
};

async function OrderDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminOrderDetail orderId={id} />;
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState label="Memuat pesanan..." />}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
