import { Bell, Globe2, Search, Sparkles, Sun, Moon, ArrowLeft } from "lucide-react";

export function Topbar({ lang, onLanguage, theme, onTheme, t, onBackToPortal }: { lang: string; onLanguage: () => void; theme: string; onTheme: () => void; t: any; onBackToPortal?: () => void }) {
  return <header className="topbar">
    <div className="topbar-left">{onBackToPortal && <button className="topbar-back" onClick={onBackToPortal} aria-label="Back to portal selection" title="Back to portal selection"><ArrowLeft size={17}/><span>{lang === "en" ? "Portals" : "தளங்கள்"}</span></button>}<div className="breadcrumb"><span>VETRI AI</span><span className="slash">/</span><b>{t.dashboard}</b></div></div>
    <div className="top-actions"><span className="environment"><span className="status-dot"/> Demo environment</span><button className="icon-button" aria-label="Toggle colour theme" title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={onTheme}>{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</button><button className="icon-button" aria-label="Search"><Search size={18}/></button><button className="icon-button" aria-label="Notifications"><Bell size={18}/></button><button className="language-button" onClick={onLanguage}><Globe2 size={17}/>{lang === "en" ? "தமிழ்" : "English"}</button><div className="avatar"><Sparkles size={18}/></div></div>
  </header>;
}
