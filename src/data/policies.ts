import type { Effect } from "../types/game";
import type { LText } from "./lt";

/**
 * The policy dossier (v2 Phase 7): measures the PM can enact. Effects apply
 * through the standard effect pipeline; delayed ones ride pendingEffects like
 * event consequences, so the simulation reads them without knowing policies.
 * Fictional measures; the institutions and constraints they touch are real.
 */
export type PolicyDomain = "economy" | "social" | "security" | "institutions";

export interface PolicyMeasure {
  id: string;
  domain: PolicyDomain;
  title: LText;
  summary: LText;
  /** Immediate effects on enactment. */
  effects: Effect[];
  /** Effects that mature later, scheduled as delayed consequences. */
  delayed?: { turns: number; effects: Effect[]; note: LText };
  /** Measures that cannot coexist with this one. */
  conflicts?: string[];
  /** Coalition anger on enactment: bloc id → +anger (0-100). */
  anger?: Record<string, number>;
}

export const POLICY_MEASURES: PolicyMeasure[] = [
  // --- Economy ---
  {
    id: "subsidy-restructure",
    domain: "economy",
    title: { en: "Subsidy restructuring", ms: "Penstrukturan semula subsidi" },
    summary: {
      en: "Retarget fuel and food subsidies by household income. Fiscally freeing, politically bleeding.",
      ms: "Sasaran semula subsidi minyak dan makanan mengikut pendapatan isi rumah. Berfaedah dari segi fiskal, melemahkan dari segi politik.",
    },
    effects: [
      { target: "economy.fiscalDeficit", delta: -0.4 },
      { target: "politics.approval", delta: -2 },
    ],
    delayed: {
      turns: 3,
      effects: [
        { target: "economy.fdi", delta: 4 },
        { target: "economy.productivity", delta: 5 },
        { target: "social.costOfLivingPressure", delta: 2 },
      ],
      note: {
        en: "Rating agencies note the subsidy savings; the queues at the aid offices grew first.",
        ms: "Agensi penarafan perhatikan jimatan subsidi; barisan di pejabat bantuan membesar lebih dahulu.",
      },
    },
  },
  {
    id: "sst-expansion",
    domain: "economy",
    title: { en: "SST expansion", ms: "Peluasan SST" },
    summary: {
      en: "Broaden the sales and service tax net. Revenue now, prices later.",
      ms: "Meluaskan liputan cukai jualan dan perkhidmatan. Hasil sekarang, harga kemudian.",
    },
    effects: [
      { target: "economy.revenue", delta: 12 },
      { target: "social.costOfLivingPressure", delta: 4 },
      { target: "politics.approval", delta: -3 },
    ],
    delayed: {
      turns: 2,
      effects: [{ target: "economy.fiscalDeficit", delta: -0.5 }],
      note: {
        en: "The wider SST net closes part of the deficit gap.",
        ms: "Liputan SST yang lebih luas menutup sebahagian jurang defisit.",
      },
    },
  },
  {
    id: "green-transition",
    domain: "economy",
    title: { en: "Green transition fund", ms: "Dana transisi hijau" },
    summary: {
      en: "Seed solar, grid storage and EV supply chains. Costs land before the dividends.",
      ms: "Menyemai solar, simpanan grid dan rantaian bekalan EV. Kos tiba sebelum pulangannya.",
    },
    effects: [{ target: "economy.fiscalDeficit", delta: 0.5 }],
    delayed: {
      turns: 4,
      effects: [
        { target: "economy.fdi", delta: 6 },
        { target: "economy.productivity", delta: 4 },
        { target: "politics.approval", delta: 2 },
      ],
      note: {
        en: "The first green factories break ground; the wire services call it a bet that paid.",
        ms: "Kilang hijau pertama bermula; agensi wire menyebutnya sebagai pertaruhan yang terbayar.",
      },
    },
  },

  // --- Social ---
  {
    id: "str-housing",
    domain: "social",
    title: { en: "Housing redevelopment", ms: "Pembangunan semula perumahan" },
    summary: {
      en: "Redevelop the old str schemes with mixed-density housing. Slow, visible, popular late.",
      ms: "Membangunkan semula skim str lama dengan perumahan bercampur. Perlahan, ketara, popular kemudian.",
    },
    effects: [
      { target: "social.housingAffordability", delta: 4 },
      { target: "economy.fiscalDeficit", delta: 0.3 },
    ],
    delayed: {
      turns: 3,
      effects: [
        { target: "social.housingAffordability", delta: 6 },
        { target: "politics.approval", delta: 3 },
      ],
      note: {
        en: "The first rebuilt blocks hand keys to families on the news.",
        ms: "Blok pertama yang dibangunkan semula menyerahkan kunci kepada keluarga di berita.",
      },
    },
  },
  {
    id: "school-meals",
    domain: "social",
    title: { en: "Universal school meals", ms: "Makanan sekolah sejagat" },
    summary: {
      en: "Free breakfast in every sekolah kebangsaan. Cheap per child, decisive in class.",
      ms: "Sarapan percuma di setiap sekolah kebangsaan. Murah bagi setiap kanak-kanak, menentukan di dalam kelas.",
    },
    effects: [
      { target: "economy.fiscalDeficit", delta: 0.2 },
      { target: "social.education", delta: 3 },
      { target: "politics.approval", delta: 2 },
    ],
    delayed: {
      turns: 2,
      effects: [{ target: "social.health", delta: 2 }],
      note: {
        en: "Teachers report steadier mornings; the programme quietly works.",
        ms: "Guru melaporkan pagi yang lebih tenang; program itu berfungsi secara senyap.",
      },
    },
  },
  {
    id: "wage-floor",
    domain: "social",
    title: { en: "Minimum wage floor", ms: "Lantai upah minimum" },
    summary: {
      en: "Lift the statutory wage floor. Wages rise, prices test the ceiling.",
      ms: "Menaikkan lantai upah statutori. Upah naik, harga menguji had atas.",
    },
    effects: [
      { target: "social.wageGrowth", delta: 1.2 },
      { target: "economy.inflation", delta: 0.6 },
      { target: "politics.approval", delta: 2 },
      { target: "social.costOfLivingPressure", delta: -3 },
    ],
  },

  // --- Security ---
  {
    id: "border-tech",
    domain: "security",
    title: { en: "Border surveillance net", ms: "Jaringan pengawasan sempadan" },
    summary: {
      en: "Cameras and sensors along the northern border and the Sulu sea lanes.",
      ms: "Kamera dan sensor di sepanjang sempadan utara dan laluan laut Sulu.",
    },
    effects: [
      { target: "security.borderProtection", delta: 8 },
      { target: "economy.fiscalDeficit", delta: 0.3 },
    ],
    delayed: {
      turns: 2,
      effects: [{ target: "security.domesticStability", delta: 3 }],
      note: {
        en: "Smuggling routes are visibly closing; the generals take credit.",
        ms: "Laluan penyeludupan kelihatan tertutup; para jeneral menuntut pujian.",
      },
    },
  },
  {
    id: "cyber-shield",
    domain: "security",
    title: { en: "National cyber shield", ms: "Perisai siber negara" },
    summary: {
      en: "Stand up a consolidated cyber defence command for agencies and the grid.",
      ms: "Mendirikan pemerintahan pertahanan siber bersatu untuk agensi dan grid.",
    },
    effects: [
      { target: "security.cybersecurity", delta: 9 },
      { target: "economy.fiscalDeficit", delta: 0.2 },
    ],
  },
  {
    id: "community-policing",
    domain: "security",
    title: { en: "Community policing", ms: "Policing komuniti" },
    summary: {
      en: "Beat officers back into the kampung and flat blocks, with resident boards.",
      ms: "Pegawai ronda kembali ke kampung dan blok pangsapuri, dengan lembaga penduduk.",
    },
    effects: [
      { target: "security.policeEffectiveness", delta: 5 },
      { target: "social.cohesion", delta: 2 },
    ],
    delayed: {
      turns: 3,
      effects: [
        { target: "social.cohesion", delta: 4 },
        { target: "politics.approval", delta: 2 },
      ],
      note: {
        en: "The resident boards are solving small disputes before they reach the stations.",
        ms: "Lembaga penduduk menyelesaikan pertikaian kecil sebelum sampai ke balai.",
      },
    },
  },

  // --- Institutions ---
  {
    id: "procurement-reform",
    domain: "institutions",
    title: { en: "Open procurement", ms: "Perolehan terbuka" },
    summary: {
      en: "Publish every federal tender and beneficial owner. The old networks will howl.",
      ms: "Menerbitkan setiap tender persekutuan dan pemilik manfaat. Rangkaian lama akan melolong.",
    },
    effects: [
      { target: "politics.institutionalIntegrity", delta: 6 },
      { target: "politics.coalitionStability", delta: -2 },
    ],
    anger: { bn: 6 },
  },
  {
    id: "mpfund-disclosure",
    domain: "institutions",
    title: { en: "MP fund disclosure", ms: "Pendedahan dana Ahli Parlimen" },
    summary: {
      en: "Force constituency funds into a published ledger. Nobody thanks you for this.",
      ms: "Memaksa dana kawasan ke dalam lejar yang diterbitkan. Tiada siapa berterima kasih.",
    },
    effects: [
      { target: "politics.institutionalIntegrity", delta: 5 },
      { target: "politics.coalitionStability", delta: -3 },
    ],
    anger: { gps: 5, grs: 4, bn: 3 },
  },
  {
    id: "rtk-commission",
    domain: "institutions",
    title: { en: "Right-to-information commission", ms: "Suruhanjaya hak bermaklumat" },
    summary: {
      en: "A standing commission to declassify files after twenty years, and faster on request.",
      ms: "Suruhanjaya tetap untuk menyahkelaskan fail selepas dua puluh tahun, dan lebih pantas atas permintaan.",
    },
    effects: [{ target: "politics.institutionalIntegrity", delta: 3 }],
    delayed: {
      turns: 3,
      effects: [
        { target: "politics.institutionalIntegrity", delta: 4 },
        { target: "social.cohesion", delta: 3 },
      ],
      note: {
        en: "The first declassified files answer questions families asked for decades.",
        ms: "Fail pertama yang disahkelaskan menjawab soalan yang ditanya keluarga selama berdekad.",
      },
    },
  },
];

export function measureById(id: string): PolicyMeasure | undefined {
  return POLICY_MEASURES.find((m) => m.id === id);
}
