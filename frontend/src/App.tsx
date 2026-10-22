import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, ArrowRight, Landmark, Users, Languages,
  ShieldCheck, Droplets, BellRing, MessageSquareText
} from "lucide-react";
import GovernmentPortal from "./GovernmentPortal";

type Language = "en" | "ta";
type Portal = "government" | "citizen" | null;

const copy = {
  en: {
    tagline: "VIGILANCE ENGINE FOR TRUST, RESILIENCE & INTELLIGENCE",
    title: "One platform. Two experiences.",
    subtitle: "Technology for stronger public services and safer communities.",
    government: "Government Portal",
    govDesc: "For authorized officials to monitor services, review incidents and explore operational insights.",
    citizen: "Citizen Portal",
    citizenDesc: "Access public-service guidance, report civic issues and view relevant public alerts.",
    enter: "Continue",
    demo: "Prototype experience · Demo data only",
    back: "Back to portal selection",
    citizenTitle: "Public services, made simpler.",
    citizenSubtitle: "Explore public information and service guidance in one place.",
    services: "Public service guidance",
    servicesDesc: "Find guidance on accessing public services.",
    report: "Report a civic issue",
    reportDesc: "Prepare a report about a local public issue.",
    alerts: "Public safety alerts",
    alertsDesc: "View the public alerts available in this demo.",
    water: "Water information",
    waterDesc: "Explore water-quality information when available.",
    coming: "Demo preview",
    notice: "This prototype is not an official government service. Do not submit sensitive personal information.",
    language: "தமிழ்"
  },
  ta: {
    tagline: "நம்பிக்கை, மீள்திறன் மற்றும் நுண்ணறிவுக்கான கண்காணிப்பு தளம்",
    title: "ஒரே தளம். இரண்டு அனுபவங்கள்.",
    subtitle: "சிறந்த பொதுச் சேவைகளுக்கும் பாதுகாப்பான சமூகங்களுக்கும் தொழில்நுட்பம்.",
    government: "அரசு தளம்",
    govDesc: "அனுமதி பெற்ற அதிகாரிகள் சேவைகள், சம்பவங்கள் மற்றும் செயல்பாட்டு விவரங்களைக் கண்காணிக்க.",
    citizen: "குடிமக்கள் தளம்",
    citizenDesc: "பொதுச் சேவை வழிகாட்டுதலைப் பெறவும், குடிமைப் பிரச்சினைகளைத் தெரிவிக்கவும், பொது எச்சரிக்கைகளைப் பார்க்கவும்.",
    enter: "தொடரவும்",
    demo: "முன்மாதிரி அனுபவம் · மாதிரி தரவு மட்டும்",
    back: "தளத் தேர்வுக்குத் திரும்பு",
    citizenTitle: "பொதுச் சேவைகள் இனி எளிதாக.",
    citizenSubtitle: "பொதுத் தகவல்களையும் சேவை வழிகாட்டுதலையும் ஒரே இடத்தில் அறியுங்கள்.",
    services: "பொதுச் சேவை வழிகாட்டுதல்",
    servicesDesc: "பொதுச் சேவைகளைப் பெறுவதற்கான வழிகாட்டுதலை அறியுங்கள்.",
    report: "குடிமைப் பிரச்சினையைத் தெரிவிக்கவும்",
    reportDesc: "உங்கள் பகுதியிலுள்ள பொதுப் பிரச்சினையைப் பதிவு செய்யத் தயாராகுங்கள்.",
    alerts: "பொதுப் பாதுகாப்பு எச்சரிக்கைகள்",
    alertsDesc: "இந்த முன்மாதிரியில் உள்ள பொது எச்சரிக்கைகளைப் பாருங்கள்.",
    water: "நீர் தகவல்கள்",
    waterDesc: "கிடைக்கும்போது நீர்தரத் தகவல்களைப் பாருங்கள்.",
    coming: "முன்மாதிரிப் பார்வை",
    notice: "இது அதிகாரப்பூர்வ அரசு சேவை அல்ல. முக்கியமான தனிப்பட்ட தகவல்களைப் பகிர வேண்டாம்.",
    language: "English"
  }
};

export default function App() {
  const [portal, setPortal] = useState<Portal>(null);
  const [lang, setLang] = useState<Language>(() => {
    try {
      return localStorage.getItem("vetri-language") === "ta" ? "ta" : "en";
    } catch {
      return "en";
    }
  });

  const toggleLanguage = () => {
    setLang(current => {
      const next = current === "en" ? "ta" : "en";
      try {
        localStorage.setItem("vetri-language", next);
      } catch {}
      return next;
    });
  };
  const t = copy[lang];

  if (portal === "government") {
    return (
      <div className="government-portal-wrapper">
        <GovernmentPortal />
      </div>
    );
  }

  if (portal === "citizen") {
    const cards = [
      { icon: MessageSquareText, title: t.services, desc: t.servicesDesc },
      { icon: Activity, title: t.report, desc: t.reportDesc },
      { icon: BellRing, title: t.alerts, desc: t.alertsDesc },
      { icon: Droplets, title: t.water, desc: t.waterDesc }
    ];

    return (
      <main className="portal-page citizen-page">
        <header className="portal-topbar">
          <a className="portal-brand" href="#" onClick={(e) => { e.preventDefault(); setPortal(null); }}>
            <span className="portal-brand-icon"><Activity size={23} /></span>
            <span>VETRI <b>AI</b><small>{t.tagline}</small></span>
          </a>
          <div className="portal-top-actions">
            <button className="portal-language" onClick={toggleLanguage}><Languages size={16}/>{t.language}</button>
            <button className="portal-back" onClick={() => setPortal(null)}>{t.back}</button>
          </div>
        </header>
        <section className="citizen-hero">
          <span className="portal-eyebrow"><Users size={15}/> VETRI AI · CITIZEN SERVICES</span>
          <h1>{t.citizenTitle}</h1>
          <p>{t.citizenSubtitle}</p>
        </section>
        <section className="citizen-grid">
          {cards.map(({ icon: Icon, title, desc }) => (
            <article className="citizen-card" key={title}>
              <span className="citizen-card-icon"><Icon size={23}/></span>
              <h2>{title}</h2>
              <p>{desc}</p>
              <span className="citizen-preview">{t.coming} <ArrowRight size={15}/></span>
            </article>
          ))}
        </section>
        <p className="portal-notice"><ShieldCheck size={16}/>{t.notice}</p>
        <footer className="portal-footer">© 2026 VETRI AI · {t.demo}</footer>
      </main>
    );
  }

  return (
    <main className="portal-page">
      <header className="portal-topbar">
        <a className="portal-brand" href="#">
          <span className="portal-brand-icon"><Activity size={23}/></span>
          <span>VETRI <b>AI</b><small>{t.tagline}</small></span>
        </a>
        <button className="portal-language" onClick={toggleLanguage}><Languages size={16}/>{t.language}</button>
      </header>
      <section className="portal-welcome">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <span className="portal-eyebrow"><Activity size={15}/> PUBLIC IMPACT PLATFORM</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </motion.div>
      </section>
      <section className="portal-choice-grid">
        <motion.button className="portal-choice government-choice" whileHover={{ y: -4 }} whileTap={{ scale: 0.99 }} onClick={() => setPortal("government")}>
          <span className="portal-choice-icon"><Landmark size={28}/></span>
          <span className="portal-choice-label">01 / OPERATIONS</span>
          <strong>{t.government}</strong>
          <span className="portal-choice-description">{t.govDesc}</span>
          <span className="portal-choice-cta">{t.enter}<ArrowRight size={17}/></span>
        </motion.button>
        <motion.button className="portal-choice citizen-choice" whileHover={{ y: -4 }} whileTap={{ scale: 0.99 }} onClick={() => setPortal("citizen")}>
          <span className="portal-choice-icon"><Users size={28}/></span>
          <span className="portal-choice-label">02 / PUBLIC SERVICES</span>
          <strong>{t.citizen}</strong>
          <span className="portal-choice-description">{t.citizenDesc}</span>
          <span className="portal-choice-cta">{t.enter}<ArrowRight size={17}/></span>
        </motion.button>
      </section>
      <footer className="portal-footer"><span><ShieldCheck size={15}/> {t.demo}</span><span>VETRI AI · PUBLIC IMPACT</span></footer>
    </main>
  );
}
