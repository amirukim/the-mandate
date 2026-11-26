import type { Effect } from "../types/game";
import type { LText } from "./lt";

/**
 * The order paper (v2 Phase 7): bills the PM can table in the Dewan Rakyat.
 * Vote arithmetic lives in engine/parliament.ts; these are the stakes.
 * Fictional bills; the chamber arithmetic (222 seats, 112 majority, 148 for
 * two-thirds) is the real one.
 */
export type BillKind = "ordinary" | "constitution" | "supply";

export interface BillDef {
  id: string;
  kind: BillKind;
  title: LText;
  summary: LText;
  /** Effects applied if the bill passes. */
  effects: Effect[];
  /** Coalition anger when it passes: bloc id → +anger. */
  anger?: Record<string, number>;
  /** Coalition anger relieved when it passes (negative entries). */
  appease?: Record<string, number>;
}

export const BILLS: BillDef[] = [
  {
    id: "civil-service-reform",
    kind: "ordinary",
    title: { en: "Civil Service Reform Act", ms: "Akta Reformasi Perkhidmatan Awam" },
    summary: {
      en: "Performance contracts for the top civil service tiers and open posting of senior roles.",
      ms: "Kontrak prestasi untuk peringkat tertinggi perkhidmatan awam dan penghargaan terbuka jawatan kanan.",
    },
    effects: [
      { target: "economy.productivity", delta: 4 },
      { target: "politics.institutionalIntegrity", delta: 3 },
      { target: "politics.approval", delta: 1 },
    ],
    anger: { bn: 4 },
  },
  {
    id: "term-limits",
    kind: "constitution",
    title: { en: "Constitutional term limits", ms: "Had penggal perlembagaan" },
    summary: {
      en: "A constitutional amendment limiting any PM to two terms. Needs two-thirds of the House.",
      ms: "Pindaan perlembagaan mengehadkan mana-mana PM kepada dua penggal. Perlu dua pertiga Dewan.",
    },
    effects: [
      { target: "politics.institutionalIntegrity", delta: 8 },
      { target: "social.cohesion", delta: 2 },
    ],
    anger: { bn: 6, gps: 3 },
    appease: { pn: 12 },
  },
  {
    id: "ma63-grant-bill",
    kind: "ordinary",
    title: { en: "MA63 Special Grant Act", ms: "Akta Geran Khas MA63" },
    summary: {
      en: "Writes the expanded Sarawak and Sabah special grant into statute, beyond annual review.",
      ms: "Menulis geran khas Sarawak dan Sabah yang diperluas ke dalam undang-undang, di luar semakan tahunan.",
    },
    effects: [
      { target: "federal.ma63Progress", delta: 6 },
      { target: "federal.revenueFairness", delta: 5 },
      { target: "politics.approval", delta: 1 },
    ],
    appease: { gps: 10, grs: 8 },
    anger: { pn: 3 },
  },
  {
    id: "anti-hopping",
    kind: "constitution",
    title: { en: "Anti-hopping strengthening", ms: "Penguatan anti-lompat" },
    summary: {
      en: "Closes the by-election loophole in the anti-hopping law. Requires two-thirds.",
      ms: "Menutup lubang pilihan raya kecil dalam undang-undang anti-lompat. Perlu dua pertiga.",
    },
    effects: [
      { target: "politics.institutionalIntegrity", delta: 5 },
      { target: "politics.coalitionStability", delta: 4 },
    ],
    appease: { pn: 10 },
  },
  {
    id: "subsidy-reform-bill",
    kind: "ordinary",
    title: { en: "Targeted subsidy framework", ms: "Kerangka subsidi bersasar" },
    summary: {
      en: "A statutory framework to phase blanket fuel subsidies into income-targeted aid.",
      ms: "Kerangka statutori untuk memindahkan subsidi minyak pukal kepada bantuan bersasar pendapatan.",
    },
    effects: [
      { target: "economy.fiscalDeficit", delta: -0.3 },
      { target: "politics.approval", delta: -2 },
      { target: "social.costOfLivingPressure", delta: 2 },
    ],
    anger: { pn: 5 },
  },
  {
    id: "sabah-immigration",
    kind: "ordinary",
    title: { en: "Sabah immigration devolution", ms: "Pemindahan imigresen Sabah" },
    summary: {
      en: "Returns full control of entry rules to the Sabah state government, as in 1963.",
      ms: "Mengembalikan kawalan penuh peraturan kemasukan kepada kerajaan negeri Sabah, seperti 1963.",
    },
    effects: [
      { target: "federal.sabahSarawakAutonomy", delta: 5 },
      { target: "security.borderProtection", delta: 2 },
    ],
    appease: { grs: 8 },
    anger: { pn: 4 },
  },
  {
    id: "parliament-reform",
    kind: "ordinary",
    title: { en: "Parliament reform act", ms: "Akta reforma parlimen" },
    summary: {
      en: "Fixed committee chairs for the opposition, budget committee teeth, PMQ every sitting week.",
      ms: "Pengerusi jawatankuasa tetap untuk pembangkang, kuasa jawatankuasa belanjawan, PMQ setiap minggu persidangan.",
    },
    effects: [
      { target: "politics.institutionalIntegrity", delta: 4 },
      { target: "politics.oppositionStrength", delta: -2 },
    ],
  },
  {
    id: "education-autonomy",
    kind: "ordinary",
    title: { en: "School autonomy act", ms: "Akta autonomi sekolah" },
    summary: {
      en: "Decentralises hiring and curriculum mixing to state education boards.",
      ms: "Menyahpusat pengambilan dan pencampuran kurikulum kepada lembaga pendidikan negeri.",
    },
    effects: [
      { target: "social.education", delta: 4 },
      { target: "politics.approval", delta: 1 },
    ],
    anger: { pn: 3 },
  },
];

export function billById(id: string): BillDef | undefined {
  return BILLS.find((b) => b.id === id);
}
