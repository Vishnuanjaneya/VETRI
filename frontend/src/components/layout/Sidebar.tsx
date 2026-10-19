import { useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Waves,
  Droplets,
  Ticket,
  Users,
  Landmark,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const icons = [Ticket, Droplets, Waves, Landmark, Users, ShieldCheck];

export function Sidebar({
  active,
  onSelect,
  t,
}: {
  active: number;
  onSelect: (n: number) => void;
  t: any;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const labels: string[] = t.modulesList.map(
    (item: readonly string[]) => item[0]
  );

  return (
    <>
      <button
        type="button"
        className="mobile-menu-trigger"
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(v => !v)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {mobileOpen && (
        <button
          type="button"
          className="mobile-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <a className="brand" href="#home">
        <span className="brand-mark">
          <img
            src="/vetri-logo.svg"
            alt="VETRI AI logo"
            width={40}
            height={40}
          />
        </span>
        <span>
          VETRI<span className="gold"> AI</span>
          <small className="brand-full-form">
      Vigilance Engine for Trust,<br />
      Resilience &amp; Intelligence
    </small>
        </span>
      </a>

      <div className="nav-label">{t.overview}</div>

      <button
        className={`nav-item ${active === -1 ? "selected" : ""}`}
        onClick={() => { onSelect(-1); setMobileOpen(false); }}
      >
        <LayoutDashboard size={18} />
        {t.dashboard}
      </button>

      <div className="nav-label">{t.modules}</div>

      {labels.map((label, i) => {
        const Icon = icons[i];

        return (
          <button
            key={label}
            className={`nav-item ${active === i ? "selected" : ""}`}
            onClick={() => { onSelect(i); setMobileOpen(false); }}
          >
            <Icon size={18} />
            <span>{label}</span>
            <ChevronRight className="nav-chevron" size={15} />
          </button>
        );
      })}

      <div className="sidebar-bottom">
        <div className="status-dot" />
        <span>{t.live}</span>
        <small>{t.demo}</small>
      </div>
    </aside>
    </>
  );
}