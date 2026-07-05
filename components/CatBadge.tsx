"use client";
import Icon from "@/components/Icon";
import { CAT_BY_KEY, CategoryKey } from "@/lib/constants";
import { useTheme } from "@/components/ThemeContext";

// Round tinted badge with a category icon — respects theme + icon mode.
export default function CatBadge({
  catKey, size = 42, iconSize = 21,
}: { catKey: CategoryKey; size?: number; iconSize?: number }) {
  const { theme, icons } = useTheme();
  const cat = CAT_BY_KEY[catKey];
  const inkHex = theme === "noir" ? "#ffffff" : "#000000";
  const monoCircle = theme === "noir" ? "#2c2c2e" : "#ececef";
  const useColor = icons === "category";
  const tint = useColor ? cat.color + "26" : monoCircle;
  const iconColor = useColor ? cat.color : inkHex;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flex: "none",
      display: "flex", alignItems: "center", justifyContent: "center", background: tint,
    }}>
      <Icon name={cat.icon} color={iconColor} size={iconSize} />
    </div>
  );
}
