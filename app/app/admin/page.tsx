"use client";

"use client";

import { useMemo, useState } from "react";
import { PRODUCTS } from "../../data/catalog";


export default function AdminPage() {
  // localStorage-ում պահելու ենք stock-երը
  const [stockMap, setStockMap] = useState<Record<string, number>>(() => {
    const saved = JSON.parse(localStorage.getItem("stockMap") || "{}");
    return saved;
  });

  const items = useMemo(() => {
    return PRODUCTS.map((p) => ({
      ...p,
      stock: stockMap[p.id] ?? p.stock,
    }));
  }, [stockMap]);

  const setStock = (id: string, value: number) => {
    setStockMap((prev) => ({ ...prev, [id]: value }));
  };

  const save = () => {
    localStorage.setItem("stockMap", JSON.stringify(stockMap));
    alert("Պահվեց ✅");
  };

  const reset = () => {
    localStorage.removeItem("stockMap");
    setStockMap({});
    alert("Վերադարձավ սկզբնական մնացորդին ✅");
  };

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin — Մնացորդների թարմացում</h1>

      <div className="flex gap-3 mb-6">
        <button onClick={save} className="bg-black text-white px-4 py-2 rounded">
          Պահել
        </button>
        <button onClick={reset} className="border px-4 py-2 rounded">
          Reset
        </button>
      </div>

      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className="border rounded-xl p-4 flex justify-between items-center gap-4">
            <div className="min-w-0">
              <div className="text-sm opacity-70">Barcode՝ {p.barcode} • Ֆիրմ՝ {p.firmCode}</div>
              <div className="font-semibold truncate">{p.name}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm opacity-70">Մնացորդ</div>
              <input
                type="number"
                className="border rounded px-3 py-2 w-28 text-center text-lg"
                value={stockMap[p.id] ?? p.stock}
                onChange={(e) => setStock(p.id, Number(e.target.value))}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
