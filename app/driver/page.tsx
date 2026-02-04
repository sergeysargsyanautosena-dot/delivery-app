"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GROUPS } from "../data/catalog";
import { GROUP_STYLES } from "../data/constants";

export default function DriverPage() {
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    const r = localStorage.getItem("role");
    setRole(r);
    if (r && r !== "driver") window.location.href = "/login";
    setName(localStorage.getItem("userDisplayName") || "");
    setCode(localStorage.getItem("userCode") || "");
  }, []);

  const greeting = useMemo(() => {
    if (!name) return "Առաքիչ";
    return code ? `${name} (${code})` : name;
  }, [name, code]);

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{greeting}</h1>
          <p className="opacity-70">Ընտրիր բաժինը, հավաքիր պատվերը</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/driver/orders" className="border rounded px-4 py-2">
            Իմ պատվերները
          </Link>
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
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {GROUPS.map((g) => (
          <Link
            key={g.key}
            href={`/driver/group/${g.key}`}
            className={`border-2 rounded-2xl p-6 text-center font-semibold text-xl ${GROUP_STYLES[g.key]}`}
          >
            {g.title}
          </Link>
        ))}
      </div>
    </main>
  );
}
