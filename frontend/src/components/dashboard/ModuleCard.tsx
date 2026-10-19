import { ArrowUpRight, Ticket, Droplets, Waves, Landmark, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const icons = [Ticket, Droplets, Waves, Landmark, Users, ShieldCheck];
const colors = ["rose", "blue", "cyan", "gold", "violet", "orange"];

export function ModuleCard({ item, index, onClick, explore }: { item: readonly string[]; index: number; onClick: () => void; explore: string }) {
  const Icon = icons[index];
  return <motion.button className="module-card" onClick={onClick} whileHover={{ y: -5 }} transition={{ duration: .2 }}>
    <div className="module-card-top"><span className={`module-icon ${colors[index]}`}><Icon size={21}/></span><span className="module-index">0{index + 1}</span></div>
    <div className="module-category">{item[2]}</div><h3>{item[0]}</h3><p>{item[1]}</p>
    <div className="module-link">{explore}<ArrowUpRight size={16}/></div>
  </motion.button>;
}
