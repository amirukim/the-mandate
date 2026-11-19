/**
 * The federation. Real states and territories; ruling alignments and relations
 * reflect the fictional 2026 setting.
 */
export interface StateDef {
  id: string;
  name: string;
  capital: string;
  region: "peninsula-north" | "peninsula-south" | "east-coast" | "borneo" | "territories";
  rulerTitle: "Menteri Besar" | "Chief Minister" | "Premier";
  ruling: string;
  relation: number;
  note: string;
}

export const STATES: StateDef[] = [
  {
    id: "selangor",
    name: "Selangor",
    capital: "Shah Alam",
    region: "peninsula-south",
    rulerTitle: "Menteri Besar",
    ruling: "ph",
    relation: 66,
    note: "The wealthiest state and the engine of the Klang Valley. Water tariffs, highway concessions and urban cost of living dominate its politics.",
  },
  {
    id: "johor",
    name: "Johor",
    capital: "Johor Bahru",
    region: "peninsula-south",
    rulerTitle: "Menteri Besar",
    ruling: "bn",
    relation: 58,
    note: "The southern gateway. The water sale to Singapore, the RTS Link and the Johor-Singapore Special Economic Zone define its relationship with Putrajaya.",
  },
  {
    id: "penang",
    name: "Penang",
    capital: "George Town",
    region: "peninsula-north",
    rulerTitle: "Chief Minister",
    ruling: "ph",
    relation: 64,
    note: "Electronics manufacturing powerhouse. Flood mitigation and transport projects consume its state budget and its patience.",
  },
  {
    id: "perak",
    name: "Perak",
    capital: "Ipoh",
    region: "peninsula-north",
    rulerTitle: "Menteri Besar",
    ruling: "pn",
    relation: 42,
    note: "A swing state that has turned. Aging towns, bauxite controversies and outmigration shape its grievances.",
  },
  {
    id: "kelantan",
    name: "Kelantan",
    capital: "Kota Bharu",
    region: "east-coast",
    rulerTitle: "Menteri Besar",
    ruling: "pn",
    relation: 38,
    note: "PN heartland. Decades of water-supply trouble and a remembered oil royalty dispute keep resentment of the federal government close to the surface.",
  },
  {
    id: "terengganu",
    name: "Terengganu",
    capital: "Kuala Terengganu",
    region: "east-coast",
    rulerTitle: "Menteri Besar",
    ruling: "pn",
    relation: 40,
    note: "Petroleum royalties and monsoon floods dominate. The east coast feels the sea twice a year.",
  },
  {
    id: "pahang",
    name: "Pahang",
    capital: "Kuantan",
    region: "east-coast",
    rulerTitle: "Menteri Besar",
    ruling: "bn",
    relation: 55,
    note: "The peninsula's largest state. Highland land slips, mining pollution and flood-prone river basins test its institutions.",
  },
  {
    id: "kedah",
    name: "Kedah",
    capital: "Alor Setar",
    region: "peninsula-north",
    rulerTitle: "Menteri Besar",
    ruling: "pn",
    relation: 39,
    note: "Rice bowl with sharpened elbows. Its leadership presses claims over water and mineral resources against federal control.",
  },
  {
    id: "perlis",
    name: "Perlis",
    capital: "Kangar",
    region: "peninsula-north",
    rulerTitle: "Menteri Besar",
    ruling: "pn",
    relation: 41,
    note: "The smallest state, hard on the Thai border. Cross-border trade and smuggling routes are its daily reality.",
  },
  {
    id: "negeri-sembilan",
    name: "Negeri Sembilan",
    capital: "Seremban",
    region: "peninsula-south",
    rulerTitle: "Menteri Besar",
    ruling: "ph",
    relation: 61,
    note: "Customary land inheritance traditions survive here. Rail extensions toward the capital drive its growth politics.",
  },
  {
    id: "melaka",
    name: "Melaka",
    capital: "Melaka City",
    region: "peninsula-south",
    rulerTitle: "Chief Minister",
    ruling: "bn",
    relation: 56,
    note: "Small, historic and coastal. Port expansion and heritage tourism carry its economy.",
  },
  {
    id: "sabah",
    name: "Sabah",
    capital: "Kota Kinabalu",
    region: "borneo",
    rulerTitle: "Chief Minister",
    ruling: "grs",
    relation: 52,
    note: "MA63 is a living document here, not history. The 40 percent revenue grant claim, power outages and irregular immigration define its demands.",
  },
  {
    id: "sarawak",
    name: "Sarawak",
    capital: "Kuching",
    region: "borneo",
    rulerTitle: "Premier",
    ruling: "gps",
    relation: 58,
    note: "The most assertive state in the federation. It pursues control of its own gas and regulatory devolution with methodical patience.",
  },
  {
    id: "kuala-lumpur",
    name: "Kuala Lumpur",
    capital: "Kuala Lumpur",
    region: "territories",
    rulerTitle: "Menteri Besar",
    ruling: "ph",
    relation: 60,
    note: "A federal territory under Parliament's care. City hall answers to the federal cabinet, not a state assembly.",
  },
  {
    id: "putrajaya",
    name: "Putrajaya",
    capital: "Putrajaya",
    region: "territories",
    rulerTitle: "Menteri Besar",
    ruling: "federal",
    relation: 62,
    note: "The administrative capital. Its population is largely the government itself.",
  },
  {
    id: "labuan",
    name: "Labuan",
    capital: "Victoria",
    region: "territories",
    rulerTitle: "Menteri Besar",
    ruling: "federal",
    relation: 57,
    note: "An offshore financial centre island off Sabah's coast, administratively federal, economically tied to Borneo.",
  },
];

export function stateById(id: string): StateDef | undefined {
  return STATES.find((s) => s.id === id);
}
