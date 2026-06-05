import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { Home, Calendar, Pill, MessageCircle, UserCircle } from "lucide-react";

export function PatientLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  const nav = [
    { to: "/",            icon: Home,          label: t("nav.home") },
    { to: "/checklist",   icon: Calendar,      label: t("nav.checklist") },
    { to: "/medications", icon: Pill,          label: t("nav.medications") },
    { to: "/chat",        icon: MessageCircle, label: t("nav.chat") },
    { to: "/profile",     icon: UserCircle,    label: t("nav.profile") },
  ];

  return (
    <div className="flex justify-center" style={{ background: "#E8EDF4", minHeight: "100dvh" }}>
      <div
        className="w-full max-w-sm flex flex-col"
        style={{ background: "var(--surface)", height: "100dvh" }}
      >
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <Outlet />
        </main>

        <nav
          className="flex flex-shrink-0"
          style={{
            background: "var(--surface-card)",
            borderTop: "1px solid var(--border)",
            height: "68px",
          }}
        >
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className="flex-1"
              style={{ textDecoration: "none" }}
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center justify-center h-full gap-1" style={{ cursor: "pointer" }}>
                  <Icon size={20} style={{ color: isActive ? "var(--teal)" : "var(--text-muted)" }} />
                  <span className="text-xs font-medium" style={{ color: isActive ? "var(--teal)" : "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
