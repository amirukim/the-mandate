/**
 * Historical primer. What follows mixes two kinds of text and labels each:
 * REAL: verifiable structural facts about Malaysia's system and politics.
 * FICTION: the alternate-history 2026 scenario this game runs on.
 * No real officeholder is depicted, quoted, or alleged about anywhere in the game.
 */
export interface PrimerEntry {
  kind: "real" | "fiction";
  text: string;
}

export const PRIMER: PrimerEntry[] = [
  {
    kind: "real",
    text: "Malaysia is a federal constitutional elective monarchy. The Yang di-Pertuan Agong is elected every five years by the Conference of Rulers from among nine state rulers. Executive authority is exercised through a cabinet headed by a Prime Minister who commands the confidence of the Dewan Rakyat.",
  },
  {
    kind: "real",
    text: "Parliament is bicameral: the Dewan Rakyat (House of Representatives) has 222 elected members, and the Dewan Negara (Senate) has 70 appointed and selected members. General elections must be held at least every five years.",
  },
  {
    kind: "real",
    text: "The federation has 13 states and 3 federal territories. Sabah and Sarawak joined under the Malaysia Agreement 1963 (MA63), which carried special terms, including revenue arrangements and immigration powers, whose implementation remains an active political subject.",
  },
  {
    kind: "real",
    text: "Malaysia's politics since 2018 has been defined by coalition fluidity: Barisan Nasional lost federal power for the first time in 2018; the Perikatan Nasional bloc governed 2020 to 2021; and a Pakatan Harapan and Barisan Nasional unity government formed after the November 2022 general election produced no outright majority.",
  },
  {
    kind: "real",
    text: "The national minimum wage was raised to RM1,700 per month effective February 2025. Fuel and food subsidies have long consumed a large share of federal spending, and successive governments have moved, unevenly, toward targeted support.",
  },
  {
    kind: "real",
    text: "Malaysia chaired ASEAN in 2025. Under the chair rotation, the Philippines assumed the chairmanship for 2026.",
  },
  {
    kind: "real",
    text: "Bank Negara Malaysia is the central bank and sets monetary policy independently. The Malaysian Anti-Corruption Commission and the Election Commission are federal bodies whose independence is a recurring subject of reform debate.",
  },
  {
    kind: "fiction",
    text: "The scenario: a general election in late 2026 returned another hung parliament. A unity government was formed under a fictional Prime Minister, the player, commanding 140 of 222 seats through PH, BN, GPS and GRS. Every officeholder, statistic, event and headline in this game is fictional.",
  },
];
