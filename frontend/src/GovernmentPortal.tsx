import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowUpRight, CheckCircle2, Clock3, Radar, ShieldAlert, Sparkles, RotateCcw, Zap } from "lucide-react";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { MetricCard } from "./components/dashboard/MetricCard";
import { ModuleCard } from "./components/dashboard/ModuleCard";
import { FairPassWorkspace } from "./features/fairpass/presentation/FairPassWorkspace";
import { TamilNaduMap } from "./components/dashboard/TamilNaduMap";
import { translations, type Language } from "./core/i18n/translations";

export default function GovernmentPortal() {
  const [lang, setLang] = useState<Language>("en");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const saved = localStorage.getItem("vetri-theme");
      return saved === "light" ? "light" : "dark";
    } catch { return "dark"; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("vetri-theme", theme); } catch {}
  }, [theme]);
  const [active, setActive] = useState(-1);
  const [runs, setRuns] = useState(128);
  const [showResult, setShowResult] = useState(false);
const t = translations[lang];
  const items = t.modulesList;
  const chooseModule = (n: number) => { setActive(n); setShowResult(false); };
  const runScenario = () => { setRuns(v => v + 1); setShowResult(true); };
  const reset = () => { setRuns(128); setShowResult(false); setActive(-1); };
  const selected = active >= 0 ? items[active] : null;

  return <div className="app-shell">
    <Sidebar active={active} onSelect={chooseModule} t={t}/>
    <main className="main-area">
      <Topbar lang={lang} onLanguage={() => setLang(v => v === "en" ? "ta" : "en")} theme={theme} onTheme={() => setTheme(v => v === "dark" ? "light" : "dark")} t={t} onBackToPortal={() => { window.location.hash = ""; window.location.reload(); }}/>
      <div className="page-content">
        {active === 0 ? (
          <FairPassWorkspace />
        ) : active === -1 ? (
        <>
        <motion.section className="hero" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
          <div className="hero-glow"/>
          <div className="hero-content"><div className="eyebrow"><span className="eyebrow-line"/>{t.eyebrow}</div>
            <h1>{selected ? selected[0] : t.title}</h1><p>{selected ? selected[1] : t.subtitle}</p>
            <div className="hero-actions"><button className="primary-button" onClick={() => active < 0 ? document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" }) : runScenario()}>{active < 0 ? t.modules : t.run}<ArrowUpRight size={17}/></button><button className="secondary-button" onClick={reset}><RotateCcw size={15}/>{t.reset}</button></div>
          </div>
          <div className="hero-visual" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><div className="core-emblem"><Radar size={48}/><span>V</span></div><div className="orbit-label label-one"><Activity size={13}/> INTELLIGENCE</div><div className="orbit-label label-two"><Zap size={13}/> RESILIENCE</div><div className="orbit-label label-three"><ShieldAlert size={13}/> PUBLIC IMPACT</div></div>
          <div className="hero-bottom"><span><span className="status-dot"/> {t.live}</span><span>{t.demo}</span><span>VETRI / 001</span></div>
        </motion.section>

        <div className="section-heading"><div><span className="section-kicker">SYSTEM OVERVIEW</span><h2>{t.dashboard}</h2></div><span className="demo-badge"><span className="status-dot"/>{t.demo}</span></div>
        <div className="metrics-grid">
          <MetricCard label={t.events} value={String(runs)} detail="Demo scenario runs" icon={<Radar size={20}/>} color="rose"/>
          <MetricCard label={t.risks} value={showResult ? "09" : "07"} detail="Synthetic risk indicators" icon={<ShieldAlert size={20}/>} color="gold"/>
          <MetricCard label={t.response} value={showResult ? "96%" : "94%"} detail="Illustrative readiness score" icon={<CheckCircle2 size={20}/>} color="blue"/>
          <MetricCard label={t.services} value="06" detail="Independent feature modules" icon={<Activity size={20}/>} color="violet"/>
        </div>

        <div className="section-heading" id="modules"><div><span className="section-kicker">ONE PLATFORM · SIX CAPABILITIES</span><h2>{t.modules}</h2></div><button className="text-button" onClick={() => setActive(-1)}>{t.all}<ArrowUpRight size={15}/></button></div>
        <div className="modules-grid">{items.map((item, i) => <ModuleCard key={item[0]} item={item} index={i} onClick={() => chooseModule(i)} explore={t.explore}/>)}</div>

        <div className="lower-grid"><TamilNaduMap t={t}/>
          <section className="panel activity-panel"><div className="panel-heading"><div><span className="section-kicker">ACTIVITY STREAM</span><h2>{t.recent}</h2></div><span className="activity-icon"><Activity size={17}/></span></div>
            <div className="activity-list">
              {t.activities.map((a, i) => (
                <div className="activity-item" key={a[0]}>
                  <span className={`activity-symbol activity-${i}`}>
                    <Activity size={16}/>
                  </span>
                  <div className="activity-copy">
                    <b>{a[0]}</b>
                    <span>{a[1]}</span>
                    <small>{a[2]}</small>
                  </div>
                  <Clock3 size={15} className="activity-clock"/>
                </div>
              ))}
            </div>
            <div className="activity-footer"><span className="status-dot"/>{t.demo}<span className="activity-time">Just now</span></div>
          </section>
        </div>

        <AnimatePresence>{showResult && <motion.section className="result-panel" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><div className="result-icon"><Sparkles size={20}/></div><div><b>{t.success}</b><p>{selected ? selected[1] : "A synthetic scenario was analysed."} — this result is illustrative and requires human review.</p></div><button className="icon-button" onClick={() => setShowResult(false)} aria-label="Close">×</button></motion.section>}</AnimatePresence>
        <footer className="footer"><span>© 2026 VETRI AI <span className="footer-dot">·</span> Built for a resilient future</span><span>{t.footer}</span></footer>
        </>
        ) : (
          <section className="panel" style={{ padding: 24, marginTop: 24 }}>
            <span className="section-kicker">MODULE WORKSPACE</span>
            <h2>{selected?.[0]}</h2>
            <p>{selected?.[1]}</p>
            <p style={{ color: "var(--muted, #9298a7)", fontSize: 12 }}>
              This module workspace is not connected to a live backend yet.
              Its module-specific features will be implemented separately.
            </p>
          </section>
        )}
      </div>
    </main>
  </div>;
}
