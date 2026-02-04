"use client";

import { useEffect, useMemo, useState } from "react";
import { GROUPS, Product, ProductGroupKey } from "../data/catalog";
import { getProducts, setProducts } from "../data/storage";

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseCSV(text: string): string[][] {
  // Simple CSV parser that supports quoted fields
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };

  const pushRow = () => {
    // skip empty trailing row
    if (row.length === 1 && row[0].trim() === "") return;
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1];
        if (next === '"') {
          cell += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i += 1;
          continue;
        }
      }
      cell += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (ch === ",") {
      pushCell();
      i += 1;
      continue;
    }

    if (ch === "\n") {
      pushCell();
      pushRow();
      i += 1;
      continue;
    }

    if (ch === "\r") {
      // Windows line endings
      i += 1;
      continue;
    }

    cell += ch;
    i += 1;
  }

  pushCell();
  pushRow();
  return rows;
}

export default function AdminPage() {
  const [role, setRole] = useState<string | null>(null);
  const [groupKey, setGroupKey] = useState<ProductGroupKey>("FLAMINGO");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const r = localStorage.getItem("role");
    setRole(r);
    if (r && r !== "admin") window.location.href = "/login";
  }, []);

  const handleFile = async (file: File) => {
    setMsg("");
    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      setMsg("CSV-ում տվյալ չկա");
      return;
    }

    const headers = rows[0].map((h) => normalizeHeader(h));

    const idx = (names: string[]) => {
      for (const n of names) {
        const i = headers.indexOf(normalizeHeader(n));
        if (i !== -1) return i;
      }
      return -1;
    };

    const codeIdx = idx(["կոդ", "code", "barcode"]);
    const specIdx = idx(["բնութագիր կոդ", "բնութագիր", "speccode", "firmcode"]);
    const nameIdx = idx(["անվանում", "name"]);
    const stockIdx = idx(["մնացորդ", "stock", "qty", "quantity"]);
    const priceIdx = idx(["գին", "price"]);

    if ([codeIdx, specIdx, nameIdx, stockIdx, priceIdx].some((x) => x === -1)) {
      setMsg("CSV header-ները սխալ են. Պետք է ունենա՝ Կոդ, Բնութագիր Կոդ, Անվանում, Մնացորդ, Գին");
      return;
    }

    const parsed: Product[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const code = (row[codeIdx] || "").trim();
      const specCode = (row[specIdx] || "").trim();
      const name = (row[nameIdx] || "").trim();
      const stockRaw = (row[stockIdx] || "").trim();
      const priceRaw = (row[priceIdx] || "").trim();

      if (!code || !name) continue;

      const stock = Number(stockRaw.replace(/\s+/g, "").replace(",", "."));
      const price = Number(priceRaw.replace(/\s+/g, "").replace(",", "."));

      if (!Number.isFinite(stock) || stock < 0) {
        setMsg(`Սխալ մնացորդ՝ "${name}" (${stockRaw})`);
        return;
      }
      if (!Number.isFinite(price) || price <= 0) {
        setMsg(`Սխալ գին՝ "${name}" (${priceRaw}). Գինը պարտադիր է (AMD)`);
        return;
      }

      parsed.push({
        id: crypto.randomUUID(),
        group: groupKey,
        code,
        specCode,
        name,
        stock: Math.floor(stock),
        price: Math.floor(price),
      });
    }

    if (parsed.length === 0) {
      setMsg("Ֆայլից ոչ մի ապրանք չկարդացվեց");
      return;
    }

    const existing = getProducts();
    const kept = existing.filter((p) => p.group !== groupKey);

    // Replace entire group inventory (մաքրում + նորից դնում)
    setProducts([...kept, ...parsed]);

    setMsg(`✅ Թարմացվեց ${groupKey} բաժինը — ${parsed.length} ապրանք`);
  };

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Admin — Ապրանքների թարմացում</h1>
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

      <div className="mt-6 grid gap-4 max-w-2xl">
        <div className="grid gap-2">
          <label className="text-sm opacity-70">Բաժին</label>
          <select
            value={groupKey}
            onChange={(e) => setGroupKey(e.target.value as ProductGroupKey)}
            className="border rounded px-4 py-3"
          >
            {GROUPS.map((g) => (
              <option key={g.key} value={g.key}>
                {g.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm opacity-70">
            Upload CSV (Կոդ, Բնութագիր Կոդ, Անվանում, Մնացորդ, Գին)
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
            className="border rounded px-4 py-3"
          />
          <p className="text-xs opacity-60">
            Այս գործողությունը տվյալ բաժնի հին ապրանքները մաքրում է ու նորերը դնում է (100% ճիշտ մնացորդների համար)։
          </p>
        </div>

        {msg && (
          <div className={`border rounded p-3 ${msg.startsWith("✅") ? "border-green-500" : "border-red-500"}`}>
            {msg}
          </div>
        )}
      </div>
    </main>
  );
}
