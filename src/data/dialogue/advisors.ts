import type { DialogueGraph, DialogueChoice, DialogueNode, LocalizedText, DialogueExpression } from "../../engine/dialogue";
import { L, type SceneLine } from "./helper";

/**
 * Advisor arcs (v2 Phase 8): three conversations that open when the
 * relationship is earned, played in the Messages app. They carry small
 * relationship and flag consequences — the personal layer of the story.
 */
export interface AdvisorArc {
  id: string;
  characterId: string;
  minRelationship: number;
  /** Played once. */
  title: LocalizedText;
  graph: DialogueGraph;
}

function arcNodes(
  id: string,
  beats: SceneLine[],
  prompt: LocalizedText,
  choices: DialogueChoice[],
  resolutions: Record<string, SceneLine>,
): DialogueGraph {
  const nodes: Record<string, DialogueNode> = {};
  beats.forEach((beat, i) => {
    nodes[`beat${i}`] = { kind: "line", speaker: beat.speaker, role: beat.role, text: beat.text, expression: beat.expression, next: i + 1 < beats.length ? `beat${i + 1}` : "decision" };
  });
  nodes.decision = { kind: "choices", prompt, choices: choices.map((c) => ({ ...c, to: `res-${c.id}` })) };
  nodes.out = { kind: "end" };
  for (const [cid, res] of Object.entries(resolutions)) {
    nodes[`res-${cid}`] = { kind: "line", speaker: res.speaker, role: res.role, text: res.text, expression: res.expression, next: "out" };
  }
  return { id, start: "beat0", nodes };
}

export const ADVISOR_ARCS: AdvisorArc[] = [
  {
    id: "arc_sarah-truth",
    characterId: "chiefOfStaff",
    minRelationship: 55,
    title: L("A memo, off the record", "Memo, luar rekod"),
    graph: arcNodes(
      "arc_sarah-truth",
      [
        {
          speaker: "chiefOfStaff",
          role: L("Principal Private Secretary", "Setiausaha Peribadi Utama"),
          expression: "neutral",
          text: L(
            "You asked me to say things plainly when it matters, so: two senior officers are running their files past the ex-PM's people before they clear them here. I wrote it down. You are the only reader.",
            "Anda minta saya bercakap jujur bila penting, jadi: dua pegawai kanan meluluskan fail mereka kepada orang bekas PM dahulu sebelum diluluskan di sini. Saya tulis. Anda pembaca tunggalnya.",
          ),
        },
        {
          speaker: "chiefOfStaff",
          expression: "concerned",
          text: L(
            "If we act on this loudly, the civil service closes ranks and I lose my ears. If we ignore it, the file traffic becomes the real government.",
            "Jika kita bertindak dengan bising, perkhidmatan awam menutup barisan dan saya kekal telinga saya. Jika kita abaikan, laluannya fail menjadi kerajaan yang sebenar.",
          ),
        },
      ],
      L("How do you want this handled?", "Bagaimana anda mahu ini dikendalikan?"),
      [
        {
          id: "quiet", to: "res-quiet",
          label: L("Handle it quietly — reassign, no headlines", "Kendali senyap — susun semula, tanpa tajuk"),
          effects: [
            { target: "politics.institutionalIntegrity", delta: 2 },
            { target: "characters.chiefOfStaff.relationship", delta: 6 },
          ],
          setFlags: { "arc.sarah.handled": "quiet" },
        },
        {
          id: "names", to: "res-names",
          label: L("Give me the names — I will deal with it myself", "Berikan nama — saya urus sendiri"),
          effects: [{ target: "characters.chiefOfStaff.relationship", delta: -2 }, { target: "politics.coalitionStability", delta: 1 }],
          setFlags: { "arc.sarah.handled": "direct" },
        },
        {
          id: "monitor", to: "res-monitor",
          label: L("Watch it for a month, tell me nothing unless it grows", "Pantau sebulan, jangan beritahu kecuali membesar"),
          effects: [{ target: "characters.chiefOfStaff.relationship", delta: 3 }],
          setFlags: { "arc.sarah.handled": "monitored" },
        },
      ],
      {
        quiet: {
          speaker: "chiefOfStaff",
          expression: "pleased",
          text: L(
            "Both retire to the east coast by spring and nobody connects it to anything. This is why the office works: some files never become news.",
            "Kedua-duanya bersara ke pantai timur menjelang spring dan tiada siapa hubungkan dengan apa-apa. Itu sebab pejabat ini berfungsi: sebahagian fail tidak pernah jadi berita.",
          ),
        },
        names: {
          speaker: "chiefOfStaff",
          expression: "stern",
          text: L(
            "Understood. You will handle them yourself, and the officers will learn who protects them and who protects the file.",
            "Faham. Anda urus sendiri, dan pegawai akan belajar siapa melindungi mereka dan siapa melindungi fail.",
          ),
        },
        monitor: {
          speaker: "chiefOfStaff",
          expression: "neutral",
          text: L(
            "A month it is. If the traffic doubles, you will hear from me before the next exco meets.",
            "Sebulan. Jika laluannya berganda, anda akan dengar dari saya sebelum exco seterusnya bersidang.",
          ),
        },
      },
    ),
  },

  {
    id: "arc_kavitha-forecast",
    characterId: "economicAdviser",
    minRelationship: 60,
    title: L("The downside file", "Fail kesan bawah"),
    graph: arcNodes(
      "arc_kavitha-forecast",
      [
        {
          speaker: "economicAdviser",
          role: L("Special Economic Adviser", "Penasihat Khas Ekonomi"),
          expression: "concerned",
          text: L(
            "I ran the stress case nobody commissioned. If commodity prices slip and the ringgit follows, two of our budget assumptions break by Q3.",
            "Saya jalankan kes tekanan yang tiada siapa pesan. Jika harga komoditi turut dan ringgit mengikut, dua andaian belanjawan kita pecah menjelang suku tiga.",
          ),
        },
        {
          speaker: "economicAdviser",
          expression: "neutral",
          text: L(
            "Publishing it would move markets. Keeping it internal means the ministries keep spending like the good case is the only case.",
            "Menerbitkannya akan menggerakkan pasaran. Mengekalnya dalaman bermakna kementerian terus berbelanja seolah kes baik itu satu-satunya kes.",
          ),
        },
      ],
      L("What do I do with this file?", "Apa yang saya buat dengan fail ini?"),
      [
        {
          id: "internal", to: "res-internal",
          label: L("Brief the finance ministry quietly", "Takalah kementerian kewangan secara senyap"),
          effects: [{ target: "economy.productivity", delta: 2 }, { target: "characters.economicAdviser.relationship", delta: 5 }],
          setFlags: { "arc.kavitha.forecast": "internal" },
        },
        {
          id: "publish", to: "res-publish",
          label: L("Publish it — credibility is worth a bad quarter", "Terbitkan — kredibiliti berbaloi satu suku buruk"),
          effects: [{ target: "politics.approval", delta: -2 }, { target: "economy.fdi", delta: -1 }, { target: "politics.institutionalIntegrity", delta: 2 }],
          setFlags: { "arc.kavitha.forecast": "published" },
        },
        {
          id: "monthly", to: "res-monthly",
          label: L("Make the stress case a standing monthly brief", "Jadikan kes tekanan takalah bulanan tetap"),
          effects: [{ target: "economy.productivity", delta: 1 }, { target: "characters.economicAdviser.relationship", delta: 4 }],
          setFlags: { "arc.kavitha.forecast": "monthly" },
        },
      ],
      {
        internal: {
          speaker: "economicAdviser",
          expression: "pleased",
          text: L(
            "Done. Treasury will quietly trim two lines and nobody will know why the numbers improved. That is the system working.",
            "Selesai. Perbendaharaan akan potong dua peruntukan senyap dan tiada siapa tahu kenapa angka membaik. Itu sistem yang berfungsi.",
          ),
        },
        publish: {
          speaker: "economicAdviser",
          expression: "neutral",
          text: L(
            "The ringgit dips on the headline and recovers on the follow-through. Institutions are built in exactly this kind of afternoon.",
            "Ringgit turun dengan tajuk itu dan pulih dengan susulannya. Institusi dibina tepat dalam jenis petang begini.",
          ),
        },
        monthly: {
          speaker: "economicAdviser",
          expression: "pleased",
          text: L(
            "A standing brief means the bad case never sneaks up on us again. Cheap insurance, and it makes my office useful.",
            "Takalah tetap bermakna kes buruk tidak lagi menyerang secara senyap. Insurans murah, dan menjadikan pejabat saya berguna.",
          ),
        },
      },
    ),
  },

  {
    id: "arc_nordin-bargain",
    characterId: "bnChair",
    minRelationship: 60,
    title: L("An old man's arithmetic", "Aritmetik orang tua"),
    graph: arcNodes(
      "arc_nordin-bargain",
      [
        {
          speaker: "bnChair",
          role: L("Chairman, Barisan Nasional", "Pengerusi, Barisan Nasional"),
          expression: "neutral",
          text: L(
            "Datuk Seri, a case from my party's era sits with your prosecutors. Let it rest and my forty seats sit quietly with yours for the rest of this term.",
            "Datuk Seri, satu kes zaman parti saya ada dengan peguam negara anda. Biarkan ia rehat dan empat puluh kerusi saya duduk tenang bersama anda sepanjang penggal ini.",
          ),
        },
        {
          speaker: "bnChair",
          expression: "concerned",
          text: L(
            "I am not threatening you. I am showing you the price list, because you are new and the last three PMs paid without reading it.",
            "Saya tidak mengugut anda. Saya tunjukkan senarai harga, kerana anda baharu dan tiga PM terakhir membayar tanpa membacanya.",
          ),
        },
      ],
      L("The file, and the votes. What is your answer?", "Fail itu, dan undinya. Apa jawaban anda?"),
      [
        {
          id: "accept", to: "res-accept",
          label: L("Let the case rest", "Biarkan kes itu rehat"),
          effects: [
            { target: "politics.coalitionStability", delta: 4 },
            { target: "politics.institutionalIntegrity", delta: -4 },
            { target: "characters.bnChair.relationship", delta: 6 },
          ],
          setFlags: { "arc.nordin.bargain": "accepted" },
        },
        {
          id: "refuse", to: "res-refuse",
          label: L("The file proceeds. That is the answer.", "Fail itu diteruskan. Itu jawabannya."),
          effects: [
            { target: "politics.institutionalIntegrity", delta: 3 },
            { target: "politics.coalitionStability", delta: -3 },
            { target: "politics.oppositionStrength", delta: 1 },
          ],
          setFlags: { "arc.nordin.bargain": "refused" },
        },
        {
          id: "defer", to: "res-defer",
          label: L("The courts have their own calendar — I follow it", "Mahkamah ada kalendar sendiri — saya ikutnya"),
          effects: [{ target: "politics.coalitionStability", delta: 1 }, { target: "characters.bnChair.relationship", delta: -1 }],
          setFlags: { "arc.nordin.bargain": "deferred" },
        },
      ],
      {
        accept: {
          speaker: "bnChair",
          expression: "pleased",
          text: L(
            "Then we understand each other, and you have learned the first lesson of coalition government at a reasonable price. The case will find its own reasons to rest.",
            "Maka kita saling faham, dan anda belajar pelajaran pertama kerajaan gabungan pada harga berpatutan. Kes itu akan temui sebabnya sendiri untuk rehat.",
          ),
        },
        refuse: {
          speaker: "bnChair",
          expression: "stern",
          text: L(
            "Hm. Nobody has said that sentence to me in this room in twelve years. I will count my seats tonight and you will count yours. Good evening, Datuk Seri.",
            "Hm. Tiada siapa ucap ayat itu kepada saya dalam bilik ini selama dua belas tahun. Saya akan kira kerusi saya malam ini dan anda kira anda. Selamat malam, Datuk Seri.",
          ),
        },
        defer: {
          speaker: "bnChair",
          expression: "neutral",
          text: L(
            "The courts' calendar and my patience move at different speeds. We will see which arrives first. Thank you for the tea, Datuk Seri.",
            "Kalendar mahkamah dan kesabaran saya bergerak pada kelajuan berbeza. Kita lihat mana tiba dahulu. Terima kasih untuk tehnya, Datuk Seri.",
          ),
        },
      },
    ),
  },
];

export type { DialogueExpression };
