"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeContext";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const { vars } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Wrong email or password"); return; }
    router.replace("/wallet");
    router.refresh();
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your wallet">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input className="auth-input" type="email" placeholder="Email" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} required
          style={inputStyle(vars)} />
        <input className="auth-input" type="password" placeholder="Password" autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} required
          style={inputStyle(vars)} />
        {error && <div style={{ color: "#ff453a", fontSize: 13, fontWeight: 600, padding: "2px 4px" }}>{error}</div>}
        <button type="submit" disabled={loading} style={primaryBtn(vars, loading)}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "var(--sub,#8e8e93)" }}>
        New here?{" "}
        <Link href="/signup" style={{ color: "var(--ink,#fff)", fontWeight: 700, textDecoration: "none" }}>
          Create an account
        </Link>
      </div>
    </AuthShell>
  );
}

function inputStyle(_v: Record<string, string>): React.CSSProperties {
  return {
    padding: "15px 16px", borderRadius: 15, border: "none",
    background: "var(--field,#2c2c2e)", color: "var(--ink,#fff)",
    fontSize: 16, outline: "none", width: "100%",
  };
}
function primaryBtn(_v: Record<string, string>, loading: boolean): React.CSSProperties {
  return {
    marginTop: 6, padding: "15px", borderRadius: 15, border: "none",
    background: "var(--ink,#fff)", color: "var(--bg,#000)", fontSize: 16,
    fontWeight: 700, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1,
  };
}
