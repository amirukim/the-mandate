/**
 * The dramatis personae. Every officeholder here is fictional; none represents
 * a real person. Institutions and portfolios are real.
 */
export interface CharacterDef {
  id: string;
  name: string;
  role: string;
  bio: string;
  loyaltyHint: string;
  baseRelationship: number;
  cabinet: boolean;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: "chiefOfStaff",
    name: "Sarah Tan",
    role: "Principal Private Secretary",
    bio: "Your gatekeeper in the Prime Minister's Office. Twenty years across the civil service and two lost campaigns taught her that the building eats leaders who skip steps.",
    loyaltyHint: "Protects your schedule and your back. Tell her the truth first.",
    baseRelationship: 72,
    cabinet: false,
  },
  {
    id: "finance",
    name: "Tan Sri Azlan Mahmud",
    role: "Minister of Finance",
    bio: "A Treasury lifer elevated to the Exchequer. Treats the deficit as a personal enemy and every subsidy as a loan from the future. Allied to no faction, which makes him useful and distrusted.",
    loyaltyHint: "Loyal to the ledger. He will follow a decision he argued against, on the record.",
    baseRelationship: 58,
    cabinet: true,
  },
  {
    id: "economicAdviser",
    name: "Dr. Kavitha Rao",
    role: "Special Economic Adviser",
    bio: "Former Bank Negara economist who resigned rather than soften an inflation estimate. Believes the public can absorb hard truths if you stop insulting them.",
    loyaltyHint: "Speaks plainly. Values being heard over being agreed with.",
    baseRelationship: 62,
    cabinet: false,
  },
  {
    id: "nationalSecurity",
    name: "Dato' Faridah Yusof",
    role: "National Security Adviser",
    bio: "Came up through the armed forces and the National Security Council. Tracks the South China Sea, the Sulu fringe and the border like weather systems.",
    loyaltyHint: "Apolitical by conviction. Loses trust fast if security is made a partisan prop.",
    baseRelationship: 55,
    cabinet: false,
  },
  {
    id: "foreign",
    name: "Datuk Lim Wei Sheng",
    role: "Minister of Foreign Affairs",
    bio: "A former high commissioner who reads ASEAN like a family group chat: noisy, fragile, indispensable. Argues for balance between Washington and Beijing by instinct and by arithmetic.",
    loyaltyHint: "Loyal to the doctrine of balance. Give him clarity and he gives you leverage.",
    baseRelationship: 60,
    cabinet: true,
  },
  {
    id: "home",
    name: "Datuk Seri Norliza Ahmad",
    role: "Minister of Home Affairs",
    bio: "Runs police, immigration and civil defence with a checklist and a hard stare. Her department floods first in every monsoon and answers first in every inquiry.",
    loyaltyHint: "Values operational clarity above political messaging.",
    baseRelationship: 54,
    cabinet: true,
  },
  {
    id: "borneoMinister",
    name: "Datuk Seri Peter Mojuntin",
    role: "Minister in the Prime Minister's Department (Sabah Affairs)",
    bio: "A GRS parliamentarian from Kota Kinabalu who took the federal posting on one condition: that MA63 files actually move. He reads silence from Putrajaya as policy.",
    loyaltyHint: "Your early-warning system for both Borneo states. Ignoring him is expensive.",
    baseRelationship: 50,
    cabinet: true,
  },
  {
    id: "gpsPremier",
    name: "Datuk Patinggi Jonathan Lingga",
    role: "Premier of Sarawak",
    bio: "Lawyer, negotiator, and the most patient man in Malaysian politics. He does not shout in public; he sends letters that become constitutional arguments.",
    loyaltyHint: "Respect buys flexibility; delay buys litigation.",
    baseRelationship: 52,
    cabinet: false,
  },
  {
    id: "bnChair",
    name: "Tan Sri Raja Nordin",
    role: "Chairman, Barisan Nasional",
    bio: "Keeper of the BN machine and its war chest of favours. Your unity government survives as long as his divisional chiefs stay fed and unembarrassed.",
    loyaltyHint: "Transactionally loyal. He counts promises; you should too.",
    baseRelationship: 50,
    cabinet: false,
  },
  {
    id: "oppositionLeader",
    name: "Dato' Iskandar Rahman",
    role: "Leader of the Opposition",
    bio: "PN's disciplined centre of gravity. Courts your restless backbenchers over nasi dagang and posts the clips by evening. Studies your every compromise for the word betrayal.",
    loyaltyHint: "An adversary, not a monster. Deal with him honestly and he is survivable.",
    baseRelationship: 28,
    cabinet: false,
  },
];

export function characterById(id: string): CharacterDef | undefined {
  return CHARACTERS.find((c) => c.id === id);
}

export function cabinetMembers(): CharacterDef[] {
  return CHARACTERS.filter((c) => c.cabinet);
}
