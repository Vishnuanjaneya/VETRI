import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

export function MetricCard({ label, value, detail, icon, color }: { label: string; value: string; detail: string; icon: ReactNode; color: string }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${color}`}>{icon}</span></div><div className="metric-value">{value}</div><div className="metric-detail"><ArrowUpRight size={14}/>{detail}</div><div className={`metric-line ${color}`} /></article>;
}
