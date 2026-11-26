/**
 * Fictional population, industry and standing issues per state, printed on the
 * map's bottom-sheet card. Figures are invented for the setting; the fiction
 * label on the menu covers them.
 */
import type { StateDef } from "./states";

export const STATE_CARDS: Record<string, { population: string; industry: string; issues: string[] }> = {
  selangor: { population: "7.2 juta", industry: "Logistics, electronics, port services", issues: ["Water tariffs", "Urban cost of living"] },
  "kuala-lumpur": { population: "2.3 juta", industry: "Finance, government, tourism", issues: ["Congestion", "Affordable housing"] },
  putrajaya: { population: "110 ribu", industry: "Federal administration", issues: ["Commuter rail capacity"] },
  johor: { population: "4.1 juta", industry: "Manufacturing, SEZ logistics, palm oil", issues: ["Water sale to Singapore", "RTS Link"] },
  penang: { population: "1.8 juta", industry: "Electronics manufacturing, tourism", issues: ["Flood mitigation", "Transport projects"] },
  perak: { population: "2.6 juta", industry: "Manufacturing, mining heritage", issues: ["Outmigration of youth"] },
  kedah: { population: "2.3 juta", industry: "Rice, aerospace in Kulim", issues: ["Water for rice fields"] },
  perlis: { population: "280 ribu", industry: "Agriculture, cross-border trade", issues: ["Border smuggling"] },
  kelantan: { population: "1.6 juta", industry: "Cottage crafts, agriculture", issues: ["Monsoon floods", "Clean water supply"] },
  terengganu: { population: "1.2 juta", industry: "Oil and gas, tourism islands", issues: ["Royalty politics", "Coastal erosion"] },
  pahang: { population: "1.7 juta", industry: "Forestry, palm oil, Cameron highlands", issues: ["Highland land slips", "Bauxite pollution"] },
  sabah: { population: "3.9 juta", industry: "Palm oil, tourism, oil", issues: ["MA63 grant", "Irregular migration"] },
  sarawak: { population: "2.9 juta", industry: "Hydropower, oil, agriculture", issues: ["Autonomy files", "Rural connectivity"] },
  labuan: { population: "100 ribu", industry: "Offshore finance, duty-free trade", issues: [" Ferry links to the mainland"] },
};

export function cardFor(state: StateDef) {
  return STATE_CARDS[state.id] ?? { population: "—", industry: "—", issues: [] };
}
