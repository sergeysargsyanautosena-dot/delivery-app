"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Order, getOrders, setOrders } from "../../data/storage";

export default function DriverOrdersPage() {
  const [orders, setLocalOrders] = useState<Order[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const myCode = typeof window !== "undefined" ? (localStorage.getItem("userCode") || "") : "";

  useEffect(() => {
    const r = localStorage.getItem("role");
    setRole(r);
    if (r && r !== "driver") window.location.href = "/login";

    setLocalOrders(getOrders());
  }, []);

  const mine = useMemo(() => {
    return orders.filter((o) => o.createdByCode === myCode);
  }, [orders, myCode]);

  const remove = (id: string) => {
    if (!confirm("Ջնջե՞լ այս պատվերը")) return;
    const all = getOrders();
    const next = all.filter((o) => o.id !== id);
    setOrders(next);
    setLocalOrders(next);
  };

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Իմ պատվերները</h1>
        <Link href="/driver" className="border rounded px-4 py-2">
          Հետ
        </Link>
      </div>

      {mine.length === 0 && (
        <div className="opacity-60 mt-6">Դու դեռ պատվեր չունես</div>
      )}

      <div className="mt-6 grid gap-4">
        {mine.map((o) => {
          const totalQty = o.lines.reduce((a, l) => a + l.qty, 0);
          const totalSum = o.lines.reduce((a, l) => a + l.qty * l.price, 0);
          return (
            <div key={o.id} className="border rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    {o.groupKey} • {new Date(o.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm opacity-70">
                    Քանակ՝ {totalQty} • Գումար՝ {totalSum.toLocaleString("ru-RU")} AMD • Ստատուս՝ {o.status}
                  </div>
                </div>

                {o.status === "NEW" && (
                  <button
                    onClick={() => remove(o.id)}
                    className="border rounded px-4 py-2"
                  >
                    Ջնջել
                  </button>
                )}
              </div>

              <div className="mt-3 text-sm grid gap-1">
                {o.lines.map((l) => (
                  <div key={l.productId} className="flex justify-between gap-3">
                    <div className="min-w-0 truncate">{l.name}</div>
                    <div className="shrink-0 opacity-80">
                      {l.qty} × {l.price.toLocaleString("ru-RU")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
