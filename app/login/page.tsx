"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "driver" | "warehouse" | "admin";

type User = {
  username: string;
  password: string;
  role: Role;
  displayName: string;
  code?: string; // courier code like 400
};

const USERS: User[] = [
  { username: "admin", password: "admin123", role: "admin", displayName: "Admin" },
  { username: "warehouse", password: "warehouse123", role: "warehouse", displayName: "Պահեստապետ" },

  // Couriers (քո տվյալի համաձայն)
  { username: "400", password: "400", role: "driver", displayName: "Գագիկ Նազարյան", code: "400" },
  { username: "401", password: "401", role: "driver", displayName: "Ավետ Ավետիսյան", code: "401" },
  { username: "402", password: "402", role: "driver", displayName: "Վահե", code: "402" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const byUsername = useMemo(() => {
    const map: Record<string, User> = {};
    for (const u of USERS) map[u.username] = u;
    return map;
  }, []);

  const handleLogin = () => {
    const u = byUsername[username.trim()];
    if (!u || u.password !== password) {
      alert("Սխալ մուտքանուն կամ գաղտնաբառ");
      return;
    }

    localStorage.setItem("role", u.role);
    localStorage.setItem("userDisplayName", u.displayName);
    if (u.code) localStorage.setItem("userCode", u.code);
    localStorage.setItem("username", u.username);

    if (u.role === "driver") router.push("/driver");
    if (u.role === "warehouse") router.push("/warehouse");
    if (u.role === "admin") router.push("/admin");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Մուտք</h1>

      <div className="w-full max-w-sm grid gap-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded px-4 py-3 text-lg"
          placeholder="Մուտքանուն (օր․ 400)"
          autoComplete="username"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded px-4 py-3 text-lg"
          placeholder="Գաղտնաբառ"
          type="password"
          autoComplete="current-password"
        />

        <button
          onClick={handleLogin}
          className="bg-black text-white px-6 py-3 rounded text-lg"
        >
          Մուտք
        </button>

        <p className="text-xs opacity-60">
          Couriers՝ 400/401/402 (password-ը նույնն է), Admin՝ admin/admin123, Warehouse՝ warehouse/warehouse123
        </p>
      </div>
    </main>
  );
}
