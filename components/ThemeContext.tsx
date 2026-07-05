"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { THEMES, ThemeKey } from "@/lib/constants";

type IconMode = "monochrome" | "category";
interface ThemeCtx {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  icons: IconMode;
  setIcons: (m: IconMode) => void;
  vars: Record<string, string>;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>("noir");
  const [icons, setIconsState] = useState<IconMode>("monochrome");

  useEffect(() => {
    const t = (localStorage.getItem("wallet-theme") as ThemeKey) || "noir";
    const i = (localStorage.getItem("wallet-icons") as IconMode) || "monochrome";
    setThemeState(t); setIconsState(i);
  }, []);

  const setTheme = (t: ThemeKey) => { setThemeState(t); localStorage.setItem("wallet-theme", t); };
  const setIcons = (m: IconMode) => { setIconsState(m); localStorage.setItem("wallet-icons", m); };

  return (
    <Ctx.Provider value={{ theme, setTheme, icons, setIcons, vars: THEMES[theme] }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be used within ThemeProvider");
  return c;
}
