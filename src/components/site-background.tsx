/**
 * Animatsion grid + yumshoq orblar.
 * Original .animated-grid / .soft-orb bloklarining aynan o'zi.
 */
export function SiteBackground({ variant = "login" }: { variant?: "login" | "dashboard" }) {
  const isDashboard = variant === "dashboard";

  return (
    <>
      <div className={`kpk-grid ${isDashboard ? "kpk-grid--dashboard" : ""}`} aria-hidden />
      <div className={`kpk-orb kpk-orb--one ${isDashboard ? "kpk-orb--soft" : ""}`} aria-hidden />
      <div className={`kpk-orb kpk-orb--two ${isDashboard ? "kpk-orb--soft" : ""}`} aria-hidden />
    </>
  );
}
