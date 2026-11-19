/**
 * Coalition landscape after the (fictional) 2026 general election.
 * Real coalitions, real chamber size; seats and officeholders are fiction.
 */
export const TOTAL_SEATS = 222; // Real size of the Dewan Rakyat.
export const MAJORITY = 112;

export interface CoalitionDef {
  id: string;
  name: string;
  abbr: string;
  seats: number;
  status: "government" | "opposition" | "kingmaker";
  leader: string;
  stance: string;
  color: string;
  note: string;
}

export const COALITIONS: CoalitionDef[] = [
  {
    id: "ph",
    name: "Pakatan Harapan",
    abbr: "PH",
    seats: 78,
    status: "government",
    leader: "Datuk Seri Kamal Adnan",
    stance: "Reformist centre-left. Institutional reform, targeted aid, urban multiracial base.",
    color: "#5578a5",
    note: "Your own coalition. Holds Putrajaya through the unity government, but its reform agenda constantly collides with coalition arithmetic.",
  },
  {
    id: "bn",
    name: "Barisan Nasional",
    abbr: "BN",
    seats: 34,
    status: "government",
    leader: "Tan Sri Raja Nordin",
    stance: "Establishment conservative. Rural Malay support, patrimonial networks, pragmatic bargaining.",
    color: "#3f5f8a",
    note: "The senior partner in the unity government. Its grassroots resent reform that touches old protections.",
  },
  {
    id: "gps",
    name: "Gabungan Parti Sarawak",
    abbr: "GPS",
    seats: 23,
    status: "government",
    leader: "Datuk Patinggi Jonathan Lingga",
    stance: "Sarawak first. Autonomy, petroleum rights, and leverage over any federal government.",
    color: "#a3822f",
    note: "Kingmakers in Kuala Lumpur. They have governed Sarawak uninterrupted and expect MA63 promises honoured.",
  },
  {
    id: "grs",
    name: "Gabungan Rakyat Sabah",
    abbr: "GRS",
    seats: 5,
    status: "government",
    leader: "Datuk Seri Juffrina Arshad",
    stance: "Sabah localism. Revenue sharing, immigration powers, federal neglect.",
    color: "#b3714a",
    note: "Sabah's home-grown coalition. Volatile, popular at home, and sensitive to any slight from Putrajaya.",
  },
  {
    id: "warisan",
    name: "Parti Warisan",
    abbr: "WARISAN",
    seats: 3,
    status: "kingmaker",
    leader: "Datuk Rosman Jaffar",
    stance: "Sabah regionalism, willing to deal with either bloc.",
    color: "#7a6fa8",
    note: "Small but noisy. Their support is negotiable, and both sides know it.",
  },
  {
    id: "pn",
    name: "Perikatan Nasional",
    abbr: "PN",
    seats: 71,
    status: "opposition",
    leader: "Dato' Iskandar Rahman",
    stance: "Malay-Muslim nationalist and fiscal populist. Opposition of rural grievance and reform fatigue.",
    color: "#4e7d6e",
    note: "The largest opposition bloc in decades. It courts your backbenchers openly and wins towns when prices rise.",
  },
  {
    id: "others",
    name: "Independents and others",
    abbr: "IND",
    seats: 8,
    status: "kingmaker",
    leader: "Various",
    stance: "Unaffiliated members, each with a personal price.",
    color: "#8a8478",
    note: "A floating vote in a hung-style chamber. Watch them when the majority shrinks.",
  },
];

export function governmentSeats(): number {
  return COALITIONS.filter((c) => c.status === "government").reduce((sum, c) => sum + c.seats, 0);
}

export function coalitionById(id: string): CoalitionDef | undefined {
  return COALITIONS.find((c) => c.id === id);
}
