"use client";

export default function StatusBar() {
  return (
    <div style={{
      position: "relative", zIndex: 5, display: "flex", justifyContent: "flex-end",
      alignItems: "center", padding: "14px 26px 2px", fontSize: 15, fontWeight: 600,
    }}>
      <svg width="27" height="13" viewBox="0 0 26 12" fill="none"><rect x="1" y="1" width="21" height="10" rx="3" stroke="currentColor" strokeOpacity=".45" /><rect x="3" y="3" width="16" height="6" rx="1.5" fill="currentColor" /><rect x="23.5" y="4" width="2" height="4" rx="1" fill="currentColor" fillOpacity=".5" /></svg>
    </div>
  );
}
