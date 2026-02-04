"use client";

import { useEffect, useMemo, useState } from "react";
import { getOrders, setOrders, Order, getProducts, setProducts } from "../data/storage";

function printOrder(order: Order) {
  const totalSum = order.lines.reduce((a, l) => a + l.qty * l.price, 0);

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Order ${order.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h1 { margin: 0 0 8px 0; }
        .meta { margin-bottom: 16px; color: #444; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #999; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
        .right { text-align: right; }
      </style>
    </head>
    <body>
      <h1>Պատվեր</h1>
      <div class="meta">
        <div><b>Առաքիչ</b>՝ ${order.createdByName} (${order.createdByCode})</div>
        <div><b>Բաժին</b>՝ ${order.groupKey}</div>
        <div><b>Ամսաթիվ</b>՝ ${new Date(order.createdAt).toLocaleString()}</div>
        <div><b>Պատվերի ID</b>՝ ${order.id}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Անվանում</th>
            <th>Կոդ</th>
            <th>Բնութագիր</th>
            <th class="right">Քանակ</th>
            <th class="right">Գին (AMD)</th>
            <th class="right">Գումար (AMD)</th>
          </tr>
        </thead>
        <tbody>
          ${order.lines
            .map(
              (l, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${l.name}</td>
                <td>${l.code}</td>
                <td>${l.specCode}</td>
                <td class="right">${l.qty}</td>
                <td class="right">${l.price.toLocaleString("ru-RU")}</td>
                <td class="right">${(l.qty * l.price).toLocaleString("ru-RU")}</td>
              </tr>`
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6" class="right"><b>Ընդամենը</b></td>
            <td class="right"><b>${totalSum.toLocaleString("ru-RU")}</b></td>
          </tr>
        </tfoot>
      </table>

      <script>
        window.onload = () => { window.print(); };
      </script>
    </body>
  </html>`;
  const w = window.open("", "_blank");
  if (!w) {
    alert("Չհաջողվեց բացել print պատուհանը");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export default function WarehousePage() {
  const [orders, setLocalOrders] = useState<Order[]>([]);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const r = localStorage.getItem("role");
    setRole(r);
    if (r && r !== "warehouse") window.location.href = "/login";
    setLocalOrders(getOrders());
  }, []);

  const newOrders = useMemo(() => orders.filter((o) => o.status === "NEW"), [orders]);
  const archivedOrders = useMemo(() => orders.filter((o) => o.status === "ARCHIVED"), [orders]);

  const confirmAndArchive = (id: string) => {
    const allOrders = getOrders();
    const order = allOrders.find((o) => o.id === id);
    if (!order) return;

    // Stock decrease (միայն հաստատելու պահին)
    const products = getProducts();
    const pMap = new Map(products.map((p) => [p.id, p]));
    for (const l of order.lines) {
      const p = pMap.get(l.productId);
      if (!p) continue;
      if (p.stock < l.qty) {
        alert(`"${p.name}" ապրանքի մնացորդը բավարար չէ (մնացորդ՝ ${p.stock})`);
        return;
      }
    }
    for (const l of order.lines) {
      const p = pMap.get(l.productId);
      if (!p) continue;
      p.stock = p.stock - l.qty;
    }
    setProducts(Array.from(pMap.values()));

    const warehouseName = localStorage.getItem("userDisplayName") || "Պահեստապետ";
    const next = allOrders.map((o) =>
      o.id === id
        ? {
            ...o,
            status: "ARCHIVED" as const,
            archivedAt: new Date().toISOString(),
            archivedBy: warehouseName,
          }
        : o
    );

    setOrders(next);
    setLocalOrders(next);
  };

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Պահեստ</h1>
        <button
          className="border rounded px-4 py-2"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Ելք
        </button>
      </div>

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Նոր պատվերներ</h2>
        {newOrders.length === 0 && <div className="opacity-60">Նոր պատվեր չկա</div>}

        <div className="grid gap-4">
          {newOrders.map((o) => {
            const totalQty = o.lines.reduce((a, l) => a + l.qty, 0);
            const totalSum = o.lines.reduce((a, l) => a + l.qty * l.price, 0);

            return (
              <div key={o.id} className="border rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="font-semibold">
                      {o.createdByName} ({o.createdByCode}) • {new Date(o.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm opacity-70">
                      Բաժին՝ {o.groupKey} • Քանակ՝ {totalQty} • Գումար՝ {totalSum.toLocaleString("ru-RU")} AMD
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => printOrder(o)}
                      className="border rounded px-4 py-2"
                    >
                      PDF / Print
                    </button>
                    <button
                      onClick={() => confirmAndArchive(o.id)}
                      className="bg-black text-white rounded px-4 py-2"
                    >
                      Հաստատել & Արխիվացնել
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-sm grid gap-1">
                  {o.lines.map((l) => (
                    <div key={l.productId} className="flex justify-between gap-3">
                      <div className="min-w-0 truncate">{l.name}</div>
                      <div className="shrink-0 opacity-80">
                        {l.qty} × {l.price.toLocaleString("ru-RU")} = {(l.qty * l.price).toLocaleString("ru-RU")} AMD
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Արխիվ</h2>
        {archivedOrders.length === 0 && <div className="opacity-60">Արխիվ չկա</div>}

        <div className="grid gap-4">
          {archivedOrders.slice(0, 30).map((o) => (
            <div key={o.id} className="border rounded-2xl p-4">
              <div className="font-semibold">
                {o.createdByName} ({o.createdByCode}) • {new Date(o.createdAt).toLocaleString()}
              </div>
              <div className="text-sm opacity-70">
                Արխիվացված՝ {o.archivedAt ? new Date(o.archivedAt).toLocaleString() : "-"} • կողմից՝ {o.archivedBy || "-"}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
