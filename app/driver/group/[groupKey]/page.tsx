"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductGroupKey } from "../../../data/catalog";
import { getProducts, getOrders, setOrders } from "../../../data/storage";

export default function GroupPage() {
  const router = useRouter();
  const params = useParams<{ groupKey: string }>();
  const groupKey = params.groupKey as ProductGroupKey;

  const [role, setRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [qty, setQty] = useState<Record<string, number>>({});

  useEffect(() => {
    const r = localStorage.getItem("role");
    setRole(r);
    if (r && r !== "driver") window.location.href = "/login";
  }, []);

  const products = useMemo(() => {
    const all = getProducts();
    const s = search.trim().toLowerCase();
    return all
      .filter((p) => p.group === groupKey)
      .filter((p) => {
        if (!s) return true;
        return (
          p.name.toLowerCase().includes(s) ||
          p.code.toLowerCase().includes(s) ||
          p.specCode.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, "hy"));
  }, [groupKey, search]);

  const getQty = (id: string) => qty[id] ?? 0;
  const setQtySafe = (id: string, nextQty: number) => {
    nextQty = Math.max(0, Math.floor(nextQty));
    setQty((prev) => ({ ...prev, [id]: nextQty }));
  };

  const inc = (id: string) => setQtySafe(id, getQty(id) + 1);
  const dec = (id: string) => setQtySafe(id, getQty(id) - 1);

  const selectedCount = useMemo(() => {
    return Object.values(qty).reduce((a, b) => a + (b || 0), 0);
  }, [qty]);

  const submit = () => {
    const lines = products
      .map((p) => ({
        productId: p.id,
        code: p.code,
        specCode: p.specCode,
        name: p.name,
        price: p.price,
        qty: getQty(p.id),
      }))
      .filter((l) => l.qty > 0);

    if (lines.length === 0) {
      alert("Ընտրիր գոնե 1 ապրանք");
      return;
    }

    // Basic stock check (պարզ՝ որ չպատվիրեն ավել stock-ից)
    const productMap = new Map(getProducts().map((p) => [p.id, p]));
    for (const l of lines) {
      const p = productMap.get(l.productId);
      if (!p) continue;
      if (l.qty > p.stock) {
        alert(`"${p.name}" ապրանքի մնացորդը բավարար չէ (մնացորդ՝ ${p.stock})`);
        return;
      }
    }

    const createdByCode = localStorage.getItem("userCode") || "";
    const createdByName = localStorage.getItem("userDisplayName") || "Courier";

    const orders = getOrders();
    orders.unshift({
      id: crypto.randomUUID(),
      groupKey,
      createdAt: new Date().toISOString(),
      status: "NEW",
      createdByCode,
      createdByName,
      lines,
    });

    setOrders(orders);
    router.push("/driver/orders");
  };

  return (
    <main className="min-h-screen p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{groupKey}</h1>
          <p className="text-sm opacity-70">Ընտրված քանակ՝ {selectedCount}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="border rounded px-4 py-2"
        >
          Հետ
        </button>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Որոնել՝ անվանում / կոդ / բնութագիր կոդ"
          className="border rounded px-4 py-3 w-full sm:max-w-xl"
        />

        <button
          onClick={submit}
          className="bg-black text-white px-6 py-3 rounded w-full sm:w-auto"
        >
          Ուղարկել պատվերը
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="border rounded-2xl p-4 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="font-semibold truncate">{p.name}</div>
              <div className="text-sm opacity-70">
                Կոդ՝ {p.code} • Բնութագիր՝ {p.specCode}
              </div>
              <div className="text-sm mt-1">
                <span className="opacity-70">Մնացորդ՝ </span>
                <span className={p.stock === 0 ? "text-red-600 font-semibold" : "font-semibold"}>
                  {p.stock}
                </span>
                <span className="mx-2 opacity-40">|</span>
                <span className="opacity-70">Գին՝ </span>
                <span className="font-semibold">{p.price.toLocaleString("ru-RU")} AMD</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => dec(p.id)}
                className="border rounded-xl w-11 h-11 text-xl"
              >
                −
              </button>

              <input
                value={getQty(p.id)}
                onChange={(e) => setQtySafe(p.id, Number(e.target.value || 0))}
                inputMode="numeric"
                className="border rounded-xl w-16 h-11 text-center text-lg"
              />

              <button
                onClick={() => inc(p.id)}
                className="border rounded-xl w-11 h-11 text-xl"
              >
                +
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="opacity-60 mt-8">
            Այս բաժնում ապրանք չկա կամ որոնմամբ չի գտնվել։
          </div>
        )}
      </div>
    </main>
  );
}
