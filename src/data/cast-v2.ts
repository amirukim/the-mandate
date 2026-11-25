import type { CharacterDef } from "./characters";

/**
 * Supporting cast for the v2 chapters (decision C-6). Additive: none of these
 * sit in the cabinet, and a migrated v1 save simply gains default
 * relationships (50) on first contact. Every figure is fictional.
 */
export const SUPPORTING_CAST: CharacterDef[] = [
  {
    id: "sup-palaceSecretary",
    name: "Datin Marissa Jaafar",
    role: "Private Secretary to His Majesty",
    bio: "Keeps the palace's calendar and, more importantly, its mood. Thirty years around the household taught her that audiences are granted to governments that arrive prepared and humble.",
    loyaltyHint: "Serves the throne, not the government. Never let an audience feel like a formality.",
    baseRelationship: 50,
    cabinet: false,
  },
  {
    id: "sup-attorneyGeneral",
    name: "Tan Sri Halim Usman",
    role: "Attorney General",
    bio: "The government's principal legal adviser and the gatekeeper of every bill's constitutionality. Dry, deliberate, and unmoved by whips or headlines.",
    loyaltyHint: "Loyal to the Federal Constitution. He refuses advice; he does not negotiate it.",
    baseRelationship: 48,
    cabinet: false,
  },
  {
    id: "sup-bankGovernor",
    name: "Governor Nurul Aini Hamzah",
    role: "Governor, Bank Negara",
    bio: "Runs monetary policy at arm's length from Putrajaya and says so in every annual report. Markets parse her press conferences the way others parse budgets.",
    loyaltyHint: "Independence is the job. Pressure applied publicly costs you privately.",
    baseRelationship: 46,
    cabinet: false,
  },
  {
    id: "sup-armedForcesChief",
    name: "General Tan Sri Rohaizad Osman",
    role: "Chief of Defence Forces",
    bio: "Three commands, one doctrine: the military answers to the government of the day and stays out of its politics. Watches readiness budgets more closely than rallies.",
    loyaltyHint: "Apolitical by regulation. Cut readiness for theatre and he will say so to the Council.",
    baseRelationship: 50,
    cabinet: false,
  },
  {
    id: "sup-kelantanLeader",
    name: "Dato' Mukhtar Lazim",
    role: "Menteri Besar of Kelantan",
    bio: "Governs the east coast's poorest state and its most hard-won loyalties. Asks for flood mitigation in the same breath as federal respect, and keeps receipts.",
    loyaltyHint: "Answer the monsoon file before you answer his calls.",
    baseRelationship: 44,
    cabinet: false,
  },
  {
    id: "sup-terengganuLeader",
    name: "Dato' Seri Razali Idrus",
    role: "Menteri Besar of Terengganu",
    bio: "Presides over oil-royalty politics and a coastline under development pressure. A pragmatist who trades silence for funding, and remembers every promise.",
    loyaltyHint: "Royalty cheques arrive or the relationship cools. It is arithmetic, not sentiment.",
    baseRelationship: 46,
    cabinet: false,
  },
  {
    id: "sup-journalist",
    name: "Aina Zulkifli",
    role: "Political Editor, Sinar Waktu",
    bio: "Writes the floor report every Monday. Sources across all seven blocs, quotes exactly, and treats a leak as a debt to be repaid with the next one.",
    loyaltyHint: "Not loyal at all, in the best sense. Give her the story on the record and she is fair.",
    baseRelationship: 42,
    cabinet: false,
  },
  {
    id: "sup-activist",
    name: "Farah Aziz",
    role: "Coordinator, Bersih Rakyat Watch",
    bio: "Anti-corruption campaigner who built a national petition list out of one procurement scandal. She organises loudly, litigates patiently, and reads budgets line by line.",
    loyaltyHint: "Respect is earned in prosecutions, not press conferences.",
    baseRelationship: 40,
    cabinet: false,
  },
  {
    id: "sup-tycoon",
    name: "Tan Sri Vincent Khoo",
    role: "Chairman, Kencana Capital",
    bio: "Conglomerate chairman with ports, power and palm oil across three borders. Philanthropic in public, persuasive in private, and always seven steps from a policy he needs.",
    loyaltyHint: "Every dinner has an agenda. Take the meeting; audit the ask.",
    baseRelationship: 45,
    cabinet: false,
  },
];
