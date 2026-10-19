import { MapPin, Radio } from "lucide-react";

const points = [
  { name: "Chennai", x: 70, y: 19, type: "high" },
  { name: "Coimbatore", x: 25, y: 61, type: "medium" },
  { name: "Madurai", x: 48, y: 72, type: "high" },
  { name: "Salem", x: 43, y: 43, type: "medium" },
  { name: "Tiruchirappalli", x: 57, y: 55, type: "low" }
];

export function TamilNaduMap({ t }: { t: any }) {
  return <section className="panel map-panel"><div className="panel-heading"><div><span className="section-kicker">GEOSPATIAL INTELLIGENCE</span><h2>{t.map}</h2><p>{t.mapDesc}</p></div><span className="map-live"><Radio size={14}/> DEMO</span></div>
    <div className="map-canvas">
      <div className="map-grid"/>
      <svg className="tn-outline" viewBox="0 0 240 340" aria-label="Illustrative Tamil Nadu map">
        <defs><linearGradient id="land" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#C73545" stopOpacity=".22"/><stop offset="1" stopColor="#D9AB53" stopOpacity=".12"/></linearGradient></defs>
        <path d="M77 9 L111 20 L133 47 L161 62 L155 90 L183 111 L171 135 L194 153 L171 182 L159 210 L145 239 L136 271 L117 320 L99 286 L86 258 L63 239 L55 210 L35 190 L43 161 L29 142 L49 118 L42 91 L59 72 L57 45 Z" fill="url(#land)" stroke="#D6A94F" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M77 9 L80 72 L49 118 M80 72 L133 47 M49 118 L91 145 L43 161 M91 145 L155 90 M91 145 L86 198 L55 210 M91 145 L139 173 L171 135 M86 198 L117 226 L159 210 M117 226 L99 286 M117 226 L145 239" fill="none" stroke="#D6A94F" strokeOpacity=".35" strokeWidth="1"/>
      </svg>
      {points.map((p) => <div key={p.name} className={`map-point ${p.type}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}><span className="point-pulse"/><span className="point-tooltip">{p.name}<small>Simulated event</small></span></div>)}
      <div className="map-caption"><MapPin size={14}/> TAMIL NADU <span>·</span> 5 illustrative locations</div>
    </div>
    <div className="map-legend"><span><i className="legend-dot red"/> High priority</span><span><i className="legend-dot gold-dot"/> Review needed</span><span><i className="legend-dot blue-dot"/> Monitoring</span></div>
  </section>;
}
