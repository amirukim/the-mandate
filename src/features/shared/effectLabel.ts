import type { Effect } from "../../types/game";
import type { Lang } from "../../types/lang";

/** Compact human labels for effect targets, EN/MS, used by the dossier and
 * vote cards. Targets without an entry fall back to the raw path. */
const LABELS: Record<string, { en: string; ms: string }> = {
  "economy.gdpGrowth": { en: "GDP growth", ms: "Pertumbuhan KDNK" },
  "economy.inflation": { en: "Inflation", ms: "Inflasi" },
  "economy.ringgit": { en: "Ringgit", ms: "Ringgit" },
  "economy.debtToGdp": { en: "Debt", ms: "Hutang" },
  "economy.fiscalDeficit": { en: "Deficit", ms: "Defisit" },
  "economy.revenue": { en: "Revenue", ms: "Hasil" },
  "economy.unemployment": { en: "Unemployment", ms: "Pengangguran" },
  "economy.householdIncome": { en: "Household income", ms: "Pendapatan isi rumah" },
  "economy.fdi": { en: "Investment", ms: "Pelaburan" },
  "economy.productivity": { en: "Productivity", ms: "Produktiviti" },
  "politics.approval": { en: "Approval", ms: "Kelulusan" },
  "politics.coalitionStability": { en: "Stability", ms: "Kestabilan" },
  "politics.oppositionStrength": { en: "Opposition", ms: "Pembangkang" },
  "politics.institutionalIntegrity": { en: "Integrity", ms: "Integriti" },
  "social.costOfLivingPressure": { en: "Cost of living", ms: "Kos sara hidup" },
  "social.povertyRate": { en: "Poverty", ms: "Kemiskinan" },
  "social.health": { en: "Health", ms: "Kesihatan" },
  "social.education": { en: "Education", ms: "Pendidikan" },
  "social.housingAffordability": { en: "Housing", ms: "Perumahan" },
  "social.wageGrowth": { en: "Wage growth", ms: "Pertumbuhan upah" },
  "social.satisfaction": { en: "Satisfaction", ms: "Kepuasan" },
  "social.cohesion": { en: "Cohesion", ms: "Kohesi" },
  "security.militaryReadiness": { en: "Readiness", ms: "Kesiapan" },
  "security.policeEffectiveness": { en: "Policing", ms: "Policing" },
  "security.cybersecurity": { en: "Cyber", ms: "Siber" },
  "security.maritimeSecurity": { en: "Maritime", ms: "Maritim" },
  "security.borderProtection": { en: "Borders", ms: "Sempadan" },
  "security.domesticStability": { en: "Stability", ms: "Kestabilan" },
  "federal.sabahSarawakAutonomy": { en: "Autonomy", ms: "Autonomi" },
  "federal.ma63Progress": { en: "MA63", ms: "MA63" },
  "federal.stateInfrastructure": { en: "State infra", ms: "Infra negeri" },
  "federal.revenueFairness": { en: "Revenue fairness", ms: "Keadilan hasil" },
};

const UNITS: Record<string, string> = {
  "economy.gdpGrowth": "%",
  "economy.inflation": "%",
  "economy.fiscalDeficit": "% GDP",
  "economy.debtToGdp": "% GDP",
  "economy.unemployment": "%",
  "social.wageGrowth": "%",
  "economy.householdIncome": "RM",
};

/** "+4 investment" / "-0.4 % GDP deficit" style chip text. */
export function effectLabel(effect: Effect, lang: Lang): string {
  const label = LABELS[effect.target]?.[lang] ?? effect.target;
  const unit = UNITS[effect.target] ?? "";
  if (effect.set !== undefined) return `${label}: ${effect.set}`;
  const delta = effect.delta ?? 0;
  const sign = delta > 0 ? "+" : "";
  const value = Number.isInteger(delta) ? `${delta}` : delta.toFixed(delta < 1 && delta > -1 ? 2 : 1);
  return `${sign}${value}${unit ? ` ${unit}` : ""} ${label}`.trim();
}
