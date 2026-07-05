"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeContext";
import AuthShell from "@/components/AuthShell";

export default function SignupPage() {
  const { vars } = useTheme();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    const res = await fetch("/api/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      setError(data.error || "Could not create account");
      return;
    }
    // auto sign-in
    const s = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (s?.error) { router.replace("/login"); return; }
    router.replace("/wallet");
    router.refresh();
  }

  const input: React.CSSProperties = {
    padding: "15px 16px", borderRadius: 15, border: "none",
    background: "var(--field,#2c2c2e)", color: "var(--ink,#fff)", fontSize: 16, outline: "none", width: "100%",
  };

  return (
    <AuthShell title="Create account" subtitle="Start tracking your spending">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="text" placeholder="Name (optional)" autoComplete="name"
          value={name} onChange={(e) => setName(e.target.value)} style={input} />
        <input type="email" placeholder="Email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
        <input type="password" placeholder="Password (min 6 chars)" autoComplete="new-password" required
          value={password} onChange={(e) => setPassword(e.target.value)} style={input} />
        {error && <div style={{ color: "#ff453a", fontSize: 13, fontWeight: 600, padding: "2px 4px" }}>{error}</div>}
        <button type="submit" disabled={loading} style={{
          marginTop: 6, padding: 15, borderRadius: 15, border: "none",
          background: "var(--ink,#fff)", color: "var(--bg,#000)", fontSize: 16,
          fontWeight: 700, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "var(--sub,#8e8e93)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--ink,#fff)", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
      </div>
    </AuthShell>
  );
}
