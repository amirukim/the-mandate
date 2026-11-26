import type { GraphEventDef } from "../../engine/graph-events";
import { ev } from "./helper";
import { mkScene, L, PROMPT } from "./helper";

/**
 * Briefing scenes, chapter windows t0–t23 (v2 Phase 8 content). All people and
 * outcomes are fiction; the offices and pressure they describe are real.
 */

export const BRIEFING_EVENTS: GraphEventDef[] = [
  ev(
    {
      id: "g_sepak-takraw-diplomacy", kind: "chapter", chapter: 1, window: [0, 1], priority: 60,
      title: L("The kampung court", "Laman kampung"), location: L("Kota Bharu, Kelantan", "Kota Bharu, Kelantan"), category: "politics",
    },
    mkScene(
      "g_sepak-takraw-diplomacy",
      {
        speaker: "borneoMinister",
        role: L("Minister in the Prime Minister's Department", "Menteri di Jabatan Perdana Menteri"),
        expression: "pleased",
        text: L(
          "The villagers have chalked a court behind the surau and want you to open it personally, Datuk Seri. Half the division committees are watching how you answer.",
          "Penduduk kampung telah melorek laman di belakang surau dan mahu anda membukanya secara peribadi, Datuk Seri. Separuh jawatankuasa bahagian memerhatikan jawapan anda.",
        ),
      },
      PROMPT.decide,
      [
        {
          id: "play", to: "res-play",
          label: L("Take off your shoes and play a set", "Tanggalkan kasut dan main satu set"),
          effects: [{ target: "politics.approval", delta: 1 }, { target: "social.cohesion", delta: 1 }],
          news: { outlet: "peninsula", headline: L("PM plays sepak takraw in Kelantan walkabout", "PM main sepak takraw dalam jelajah Kelantan") },
        },
        {
          id: "graceful", to: "res-graceful",
          label: L("Send warm regrets with a commitment to return", "Hantar zikr penuh hormat dengan janji untuk kembali"),
          effects: [{ target: "politics.coalitionStability", delta: 1 }],
        },
        {
          id: "minister", to: "res-minister",
          label: L("Send your Sabah minister in your place", "Hantar menteri Sabah sebagai wakil"),
          effects: [{ target: "characters.borneoMinister.relationship", delta: 4 }],
          setFlags: { "courtesy.borneoMinister.sent": true },
        },
      ],
      {
        play: {
          speaker: "pm", expression: "pleased",
          text: L(
            "Your first touch is terrible, your second is on the news by evening. The kelab penyokong clips travel further than any press release.",
            "Sentuhan pertama anda buruk, yang kedua muncul di berita pada petangnya. Klip kelab penyokong tersebar lebih jauh daripada sebarang siaran akhbar.",
          ),
        },
        graceful: {
          speaker: "borneoMinister", expression: "neutral",
          text: L(
            "The elders accept the regret with grace. Your name cools a little in the kopitiam conversation, but nothing burns.",
            "Orang-orang tua menerima zikr itu dengan sopan. Nama anda sedikit sejuk dalam perbualan kopitiam, tetapi tiada yang membakar.",
          ),
        },
        minister: {
          speaker: "borneoMinister", expression: "pleased",
          text: L(
            "I opened the court and stayed for dinner. Sabah remembers who is sent, Datuk Seri — and who is spared the trip.",
            "Saya merasmikan laman itu dan tinggal untuk makan malam. Sabah ingat siapa yang dihantar, Datuk Seri — dan siapa yang dijimatkan perjalanan.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_flood-drill", kind: "chapter", chapter: 1, window: [0, 2], priority: 70,
      title: L("Monsoon rehearsal", "Latihan monsun"), location: L("Kuala Krai, Kelantan", "Kuala Krai, Kelantan"), category: "security",
    },
    mkScene(
      "g_flood-drill",
      {
        speaker: "nationalSecurity",
        role: L("National Security Adviser", "Penasihat Keselamatan Negara"),
        expression: "neutral",
        text: L(
          "The district office wants a full evacuation rehearsal before the rains. The APM is willing, the budget line is not. Last year's response was slow and everyone remembers it.",
          "Pejabat daerah mahu latihan pemindahan penuh sebelum hujan. APM bersedia, peruntukan tidak. Tindakan tahun lepas lambat dan semua orang masih ingat.",
        ),
      },
      PROMPT.decideBrief,
      [
        {
          id: "fund", to: "res-fund",
          label: L("Fund the rehearsal from contingency", "Biayai latihan daripada luar jangka"),
          effects: [{ target: "economy.fiscalDeficit", delta: 0.1 }, { target: "security.domesticStability", delta: 2 }],
          news: { outlet: "peninsula", headline: L("Full monsoon rehearsal ordered for Kelantan", "Latihan penuh monsun diarahkan untuk Kelantan") },
        },
        {
          id: "tabletop", to: "res-tabletop",
          label: L("A tabletop exercise only — the trucks stay dry", "Latihan meja sahaja — lori kekal kering"),
          effects: [{ target: "security.domesticStability", delta: -1 }],
          setFlags: { "crisis.flood.unprepared": true },
        },
        {
          id: "states", to: "res-states",
          label: L("Push it to the state governments", "Serah kepada kerajaan negeri"),
          effects: [{ target: "federal.sabahSarawakAutonomy", delta: 1 }, { target: "politics.approval", delta: -1 }],
        },
      ],
      {
        fund: {
          speaker: "nationalSecurity", expression: "pleased",
          text: L(
            "Good. The boats launch on time in the drill, and the photos of them doing it will outlive the cost line.",
            "Bagus. Bot dilancarkan tepat pada masanya dalam latihan, dan gambar mereka melakukannya akan hidup lebih lama daripada baris kos itu.",
          ),
        },
        tabletop: {
          speaker: "nationalSecurity", expression: "concerned",
          text: L(
            "The maps are updated and the tea is hot. If the real thing comes early, we will be arranging lorries by phone.",
            "Peta dikemas kini dan teh masih panas. Jika banjir sebenar datang awal, kita akan mengatur lori melalui telefon.",
          ),
        },
        states: {
          speaker: "nationalSecurity", expression: "neutral",
          text: L(
            "Kuala Krai accepts the principle and not the budget. The states will run it their way, and the credits will be theirs.",
            "Kuala Krai terima prinsipnya, bukan bajetnya. Negeri akan jalankan cara mereka, dan kredit akan menjadi milik mereka.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_kopitiam-wages", kind: "chapter", chapter: 1, window: [1, 3], priority: 55,
      title: L("The kopitiam roundtable", "Meja bulat kopitiam"), location: L("Petaling Jaya, Selangor", "Petaling Jaya, Selangor"), category: "economy",
    },
    mkScene(
      "g_kopitiam-wages",
      {
        speaker: "economicAdviser",
        role: L("Special Economic Adviser", "Penasihat Khas Ekonomi"),
        expression: "neutral",
        text: L(
          "The kopitiam association wants a meeting before any wage floor moves. Their margins are thinner than they claim, and their workers' patience is thinner still.",
          "Persatuan kopitiam mahu bertemu sebelum lantai upah bergerak. Margin mereka lebih nipis daripada yang didakwa, dan kesabaran pekerja lebih nipis lagi.",
        ),
      },
      PROMPT.decide,
      [
        {
          id: "listen", to: "res-listen",
          label: L("Hear them out, then hold the line on wages", "Dengar mereka, kekal garisan upah"),
          effects: [{ target: "social.wageGrowth", delta: 0.4 }, { target: "social.cohesion", delta: 1 }],
          news: { outlet: "peninsula", headline: L("PM hears kopitiam concerns; wage floor stands", "PM dengar isu kopitiam; lantai upah kekal") },
        },
        {
          id: "credit", to: "res-credit",
          label: L("Offer a small-business wage credit instead", "Tawarkan kredit upah perusahaan kecil"),
          effects: [{ target: "economy.fiscalDeficit", delta: 0.2 }, { target: "politics.approval", delta: 1 }],
        },
        {
          id: "defer", to: "res-defer",
          label: L("Promise to revisit next year", "Janji semakan tahun depan"),
          effects: [{ target: "social.costOfLivingPressure", delta: 2 }, { target: "politics.coalitionStability", delta: 1 }],
        },
      ],
      {
        listen: {
          speaker: "economicAdviser", expression: "pleased",
          text: L(
            "They grumbled for an hour and accepted it in two sentences. Workers noticed who was in the room, and it was not the association's lawyers.",
            "Mereka mengeluh sejam dan menerimanya dalam dua ayat. Pkerja perhatikan siapa di dalam bilik, dan ia bukan peguam persatuan.",
          ),
        },
        credit: {
          speaker: "economicAdviser", expression: "neutral",
          text: L(
            "The credit costs less than the fight. Both sides claim victory, which in this trade is what success looks like.",
            "Kredit itu lebih murah daripada pergaduhan. Kedua-dua pihak mengaku menang — dalam perdagangan ini, itulah rupa kejayaan.",
          ),
        },
        defer: {
          speaker: "economicAdviser", expression: "concerned",
          text: L(
            "Next year is a promise made in someone else's term. The workers read it exactly that way.",
            "Tahun depan ialah janji yang dibuat dalam penggal orang lain. Pekerja membacanya tepat begitu.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_istana-courtesy", kind: "chapter", chapter: 1, window: [2, 3], priority: 65,
      title: L("Istana courtesy call", "Zikrah istana"), location: L("Istana Negara, Kuala Lumpur", "Istana Negara, Kuala Lumpur"), category: "politics",
    },
    mkScene(
      "g_istana-courtesy",
      {
        speaker: "sup-palaceSecretary",
        role: L("Istana secretary", "Setiausaha istana"),
        expression: "neutral",
        text: L(
          "Their Highnesses request a private audience before the month ends. Protocol suggests a personal call and a quiet word on the federation's mood.",
          "Kedua-dua Paduka Baginda memohon audiens peribadi sebelum bulan tamat. Protokol mencadangkan zikrah peribadi dan sepatah dua tentang suhu persekutuan.",
        ),
      },
      PROMPT.decide,
      [
        {
          id: "attend", to: "res-attend",
          label: L("Attend personally, speak plainly", "Hadir secara peribadi, bercakap jujur"),
          effects: [{ target: "politics.coalitionStability", delta: 2 }],
          setFlags: { "istana.personal": true },
        },
        {
          id: "letter", to: "res-letter",
          label: L("Send a formal letter with your programme", "Hantar surat rasmi bersama program anda"),
          effects: [{ target: "politics.institutionalIntegrity", delta: 1 }],
        },
        {
          id: "brief", to: "res-brief",
          label: L("Pre-brief the press on the visit", "Beri takalah awal kepada media tentang zikrah"),
          effects: [{ target: "politics.approval", delta: 1 }, { target: "politics.institutionalIntegrity", delta: -1 }],
          news: { outlet: "sinar", headline: L("Palane visit turned into a photo call", "Zikrah istana menjadi majlis foto") },
        },
      ],
      {
        attend: {
          speaker: "sup-palaceSecretary", expression: "pleased",
          text: L(
            "Forty minutes, no notes, no leaks. Their Highnesses remember ministers who speak plainly and ministers who perform.",
            "Empat puluh minit, tanpa nota, tanpa kebocoran. Paduka Baginda mengingati menteri yang jujur dan menteri yang berlakon.",
          ),
        },
        letter: {
          speaker: "sup-palaceSecretary", expression: "neutral",
          text: L(
            "The letter is filed with the others. It is correct, and it is paper.",
            "Surat itu difailkan bersama yang lain. Ia betul, dan ia kertas.",
          ),
        },
        brief: {
          speaker: "sup-palaceSecretary", expression: "stern",
          text: L(
            "The Istana noticed the cameras before they noticed the programme. That will be remembered longer than the pictures.",
            "Istana perhatikan kamera sebelum perhatikan program. Itu akan diingati lebih lama daripada gambarnya.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_transit-fare", kind: "recurring", priority: 50, minGap: 6, chapter: 2,
      title: L("Klang Valley transit review", "Semakan pengangkutan Lembah Klang"), location: L("Putrajaya", "Putrajaya"), category: "economy",
    },
    mkScene(
      "g_transit-fare",
      {
        speaker: "finance",
        role: L("Minister of Finance", "Menteri Kewangan"),
        expression: "neutral",
        text: L(
          "The rail operators are back for the fare review. The subsidy hole widens every quarter, and every commuter ride is a promise someone else pays for.",
          "Pengendali rel kembali untuk semakan tambang. Lubang subsidi melebar setiap suku tahun, dan setiap perjalanan ialah janji yang dibayar orang lain.",
        ),
      },
      PROMPT.decide,
      [
        {
          id: "freeze", to: "res-freeze",
          label: L("Freeze the fares another year", "Bekukan tambang setahun lagi"),
          effects: [{ target: "economy.fiscalDeficit", delta: 0.2 }, { target: "politics.approval", delta: 2 }, { target: "social.costOfLivingPressure", delta: -1 }],
        },
        {
          id: "raise", to: "res-raise",
          label: L("Allow the indexed increase", "Benarkan kenaikan berindeks"),
          effects: [{ target: "economy.revenue", delta: 6 }, { target: "social.costOfLivingPressure", delta: 3 }, { target: "politics.approval", delta: -2 }],
          news: { outlet: "peninsula", headline: L("Transit fares rise under indexed formula", "Tambang pengangkutan naik mengikut formula berindeks") },
        },
        {
          id: "means", to: "res-means",
          label: L("Means-test the concession pass", "Uji bawa konsesi mengikut pendapatan"),
          effects: [{ target: "politics.institutionalIntegrity", delta: 1 }, { target: "social.costOfLivingPressure", delta: -1 }],
        },
      ],
      {
        freeze: {
          speaker: "finance", expression: "concerned",
          text: L(
            "Popular, and the hole grows. I will find the money where I can, but you should hear me say it is not free.",
            "Popular, dan lubangnya membesar. Saya akan cari wangnya di mana boleh, tetapi anda patut dengar saya kata ia bukan percuma.",
          ),
        },
        raise: {
          speaker: "finance", expression: "neutral",
          text: L(
            "The formula is defensible and the talkshows are not. This is the expensive kind of correct.",
            "Formula itu boleh dipertahankan dan rancangan dangalawak tidak. Ini jenis betul yang mahal.",
          ),
        },
        means: {
          speaker: "finance", expression: "pleased",
          text: L(
            "Means-testing is the boring machine that keeps this affordable for the right people. It needs quiet maintenance, not speeches.",
            "Uji bawa ialah mesin membosankan yang kekalkan kemampuan untuk orang yang berhak. Ia perlu penyelenggaraan senyap, bukan ucapan.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_dry-season-rations", kind: "recurring", priority: 55, minGap: 5, chapter: 2,
      title: L("Interior supply runs", "Konvoi bekalan pendalaman"), location: L("Kapit, Sarawak", "Kapit, Sarawak"), category: "federal",
    },
    mkScene(
      "g_dry-season-rations",
      {
        speaker: "gpsPremier",
        role: L("Premier of Sarawak", "Premier Sarawak"),
        expression: "concerned",
        text: L(
          "The rivers are low and the longhouse supply runs are costing double. We can move it ourselves, Datuk Seri, but the federal flag on the boxes would say something.",
          "Sungai cetek dan konvoi bekalan rumah panjang kosnya berganda. Kita boleh gerakkan sendiri, Datuk Seri, tetapi bendera persekutuan pada kotak itu akan berkata sesuatu.",
        ),
      },
      PROMPT.decideBrief,
      [
        {
          id: "federal", to: "res-federal",
          label: L("Put the federal flag on the crates", "Letak bendera persekutuan pada kotak"),
          effects: [{ target: "federal.revenueFairness", delta: 2 }, { target: "characters.gpsPremier.relationship", delta: 3 }, { target: "politics.approval", delta: 1 }],
          news: { outlet: "borneo", headline: L("Federal lift joins the Kapit supply runs", "Bantuan persekutuan sertai konvoi bekalan Kapit") },
        },
        {
          id: "contract", to: "res-contract",
          label: L("Contract it out to the boat operators", "Kontrakkan kepada pengusaha bot"),
          effects: [{ target: "economy.fiscalDeficit", delta: 0.15 }],
        },
        {
          id: "devolve", to: "res-devolve",
          label: L("Hand the whole file to Kuching", "Serah seluruh fail kepada Kuching"),
          effects: [{ target: "federal.sabahSarawakAutonomy", delta: 2 }, { target: "characters.gpsPremier.relationship", delta: 5 }],
        },
      ],
      {
        federal: {
          speaker: "gpsPremier", expression: "pleased",
          text: L(
            "Then the boxes say what we both want them to say. That is how a federation sounds when it works.",
            "Maka kotak itu akan berkata apa yang kita berdua mahu. Begitulah bunyi persekutuan ketika ia berfungsi.",
          ),
        },
        contract: {
          speaker: "gpsPremier", expression: "neutral",
          text: L(
            "The operators will charge the peak rate and deliver the peak effort. Efficient, and completely anonymous.",
            "Pengusaha akan caj kadar puncak dan beri usaha puncak. Cekap, dan sepenuhnya tanpa nama.",
          ),
        },
        devolve: {
          speaker: "gpsPremier", expression: "pleased",
          text: L(
            "Kuching accepts, and remembers. Autonomy is a muscle, Datuk Seri — every rep counts.",
            "Kuching terima, dan ingat. Autonomi itu otot, Datuk Seri — setiap pengulangan dikira.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_sabah-battery-hub", kind: "recurring", priority: 60, minGap: 6, chapter: 2,
      title: L("The battery hub bid", "Bida hab bateri"), location: L("Kota Kinabalu, Sabah", "Kota Kinabalu, Sabah"), category: "economy",
    },
    mkScene(
      "g_sabah-battery-hub",
      {
        speaker: "economicAdviser",
        role: L("Special Economic Adviser", "Penasihat Khas Ekonomi"),
        expression: "neutral",
        text: L(
          "A battery manufacturer will build the regional hub in Sabah — if the incentives clear this quarter. The GRS chief minister has made it his signature file.",
          "Pengeluar bateri akan membina hab serantau di Sabah — jika insentif lulus suku ini. Ketua menteri GRS jadikannya fail tanda arasnya.",
        ),
      },
      PROMPT.decide,
      [
        {
          id: "incentives", to: "res-incentives",
          label: L("Clear the full incentive package", "Lulus pakej insentif penuh"),
          effects: [{ target: "economy.fdi", delta: 5 }, { target: "economy.fiscalDeficit", delta: 0.3 }],
          news: { outlet: "borneo", headline: L("Battery hub cleared for Sabah with federal incentives", "Hab bateri diluluskan untuk Sabah dengan insentif persekutuan") },
        },
        {
          id: "split", to: "res-split",
          label: L("Split the plant: Sabah assembly, peninsula cells", "Pecahkan kilang: pemasangan Sabah, sel semenanjung"),
          effects: [{ target: "economy.fdi", delta: 2 }, { target: "economy.fiscalDeficit", delta: 0.15 }, { target: "characters.borneoMinister.relationship", delta: -2 }],
        },
        {
          id: "decline", to: "res-decline",
          label: L("Decline — the incentives are too rich", "Tolak — insentif terlalu mewah"),
          effects: [{ target: "economy.fdi", delta: -1 }, { target: "politics.institutionalIntegrity", delta: 1 }],
        },
      ],
      {
        incentives: {
          speaker: "economicAdviser", expression: "pleased",
          text: L(
            "Signed. Kota Kinabalu gets the cranes, the ledger gets the gap, and in three years the numbers argue about which of us was right.",
            "Ditandatangani. Kota Kinabalu dapat kren, leger dapat jurang, dan tiga tahun lagi angka akan berdebat siapa antara kita yang betul.",
          ),
        },
        split: {
          speaker: "economicAdviser", expression: "neutral",
          text: L(
            "Half a win, twice the paperwork. Sabah reads the split as exactly what it is — a peninsula holding the good half.",
            "Separuh kemenangan, dua kali kerja kertas. Sabah baca pemecahan itu sebagai apa adanya — semenanjung memegang bahagian yang baik.",
          ),
        },
        decline: {
          speaker: "economicAdviser", expression: "concerned",
          text: L(
            "The factory goes to Batam and nobody writes a story about the incentives we refused. Discipline is invisible until it isn't.",
            "Kilang itu ke Batam dan tiada siapa menulis tentang insentif yang kita tolak. Disiplin tak nampak sehingga ia nampak.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_teacher-rural", kind: "recurring", priority: 45, minGap: 7, chapter: 2,
      title: L("Rural postings", "Penempatan luar bandar"), location: L("Baling, Kedah", "Baling, Kedah"), category: "social",
    },
    mkScene(
      "g_teacher-rural",
      {
        speaker: "chiefOfStaff",
        role: L("Principal Private Secretary", "Setiausaha Peribadi Utama"),
        expression: "neutral",
        text: L(
          "Four hundred rural classrooms open the term without a permanent teacher. The education DG has three options and none of them are cheap.",
          "Empat ratus kelas luar bandar buka sesi tanpa guru tetap. KP Pendidikan ada tiga pilihan dan tiada satu murah.",
        ),
      },
      PROMPT.decideBrief,
      [
        {
          id: "allowance", to: "res-allowance",
          label: L("Double the rural allowance", "Gandakan elaun luar bandar"),
          effects: [{ target: "economy.fiscalDeficit", delta: 0.2 }, { target: "social.education", delta: 3 }],
          news: { outlet: "peninsula", headline: L("Rural teacher allowance doubled", "Elaun guru luar bandar digandakan") },
        },
        {
          id: "bond", to: "res-bond",
          label: L("Bond top graduates to three rural years", "Ikat graduan cemerlang ke tiga tahun luar bandar"),
          effects: [{ target: "social.education", delta: 2 }, { target: "politics.approval", delta: -1 }],
        },
        {
          id: "campaign", to: "res-campaign",
          label: L("A status campaign — make the posting a prize", "Kempen status — jadikan penempatan itu anugerah"),
          effects: [{ target: "social.cohesion", delta: 1 }, { target: "social.education", delta: 1 }],
        },
      ],
      {
        allowance: {
          speaker: "chiefOfStaff", expression: "pleased",
          text: L(
            "Money moves people. The first fifty transfers confirm by Friday, and the unions call it the first honest answer in years.",
            "Wang menggerakkan manusia. Lima puluh pemindahan pertama disahkan Jumaat ini, dan kesatuan sebut ia jawaban jujur pertama sejak bertahun.",
          ),
        },
        bond: {
          speaker: "chiefOfStaff", expression: "neutral",
          text: L(
            "The top grads will serve, and resent, and mostly become good teachers anyway. Society gets the classrooms; the graduates get a story.",
            "Graduan cemerlang akan berkhidmat, dan terasa, dan kebanyakannya tetap jadi guru baik. Masyarakat dapat kelas; graduan dapat cerita.",
          ),
        },
        campaign: {
          speaker: "chiefOfStaff", expression: "neutral",
          text: L(
            "Posters are cheaper than allowances and work on exactly the people money doesn't move. It is slow, and it is real.",
            "Poster lebih murah daripada elaun dan berfungsi tepat pada orang yang wang tidak menggerakkan. Lambat, dan benar.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_jawi-signage", kind: "recurring", priority: 40, minGap: 6, chapter: 2,
      title: L("The signage dispute", "Pertikaian papan tanda"), location: L("Petaling Jaya, Selangor", "Petaling Jaya, Selangor"), category: "politics",
    },
    mkScene(
      "g_jawi-signage",
      {
        speaker: "home",
        role: L("Minister of Home Affairs", "Menteri Dalam Negeri"),
        expression: "concerned",
        text: L(
          "A council ordered jawi added to every shopfront sign. The traders' groups are calling it a test case and the tablets are already signing petitions.",
          "Satu majlis mengarahkan jawi ditambah pada setiap papan kedai. Gabungan peniaga sebut ia ujian pertama, dan tablet sudah menerima petisyen.",
        ),
      },
      PROMPT.decidePress,
      [
        {
          id: "neutral", to: "res-neutral",
          label: L("Federal neutrality: signage is a council matter", "Neutral persekutuan: papan tanda hal majlis"),
          effects: [{ target: "social.cohesion", delta: 2 }],
          news: { outlet: "sinar", headline: L("Putrajaya: signage stays a local matter", "Putrajaya: papan tanda kekal hal tempatan") },
        },
        {
          id: "states", to: "res-states",
          label: L("Back the council's cultural mandate", "Sokong mandat kebudayaan majlis"),
          effects: [{ target: "federal.sabahSarawakAutonomy", delta: 1 }, { target: "politics.approval", delta: -1 }, { target: "politics.oppositionStrength", delta: 1 }],
        },
        {
          id: "pause", to: "res-pause",
          label: L("Pause the order pending consultation", "Tangguh arahan menunggu perbincangan"),
          effects: [{ target: "politics.coalitionStability", delta: 1 }, { target: "social.cohesion", delta: -1 }],
        },
      ],
      {
        neutral: {
          speaker: "home", expression: "neutral",
          text: L(
            "Neutrality will be attacked from both flanks by Tuesday, and defended by everyone with a shop by Friday. That is the trade.",
            "Neutral akan diserang dari dua sayap oleh Selasa, dan dipertahankan semua yang ada kedai oleh Jumaat. Itu tukarnya.",
          ),
        },
        states: {
          speaker: "home", expression: "stern",
          text: L(
            "The petitions become primaries by next month. You have bought a cultural decision with a political invoice.",
            "Petisyen jadi pertandingan dalaman bulan depan. Anda beli keputusan budaya dengan invois politik.",
          ),
        },
        pause: {
          speaker: "home", expression: "neutral",
          text: L(
            "Consultation is where these things go to sleep. The council saves face, the traders keep their signs, and the temperature drops.",
            "Perbincangan adalah tempat perkara begini tidur. Majlis selamat muka, peniaga kekal papan, suhu turun.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_data-centre-power", kind: "recurring", priority: 50, minGap: 5, chapter: 2,
      title: L("The grid and the data centres", "Grid dan pusat data"), location: L("Cyberjaya, Selangor", "Cyberjaya, Selangor"), category: "economy",
    },
    mkScene(
      "g_data-centre-power",
      {
        speaker: "economicAdviser",
        role: L("Special Economic Adviser", "Penasihat Khas Ekonomi"),
        expression: "concerned",
        text: L(
          "The new data-centre cluster is drawing more power than the peninsula plan assumed. TNB wants a decision on the tariff and the reserve margin this month.",
          "Kluster pusat data baharu menarik lebih kuasa daripada anggaran pelan semenanjung. TNB mahu keputusan tarif dan margin rizab bulan ini.",
        ),
      },
      PROMPT.decideBrief,
      [
        {
          id: "tariff", to: "res-tariff",
          label: L("A special industrial tariff for high load", "Tarif industri khas untuk beban tinggi"),
          effects: [{ target: "economy.revenue", delta: 8 }, { target: "social.costOfLivingPressure", delta: 1 }],
          news: { outlet: "peninsula", headline: L("Special tariff for high-load data centres", "Tarif khas untuk pusat data beban tinggi") },
        },
        {
          id: "cap", to: "res-cap",
          label: L("Cap new connections until the grid catches up", "Had sambungan baharu sehingga grid kejar"),
          effects: [{ target: "economy.productivity", delta: -1 }, { target: "politics.institutionalIntegrity", delta: 1 }],
        },
        {
          id: "renewable", to: "res-renewable",
          label: L("Approve expansion tied to renewable purchase", "Lulus pengembangan syarat beli tenaga boleh baharu"),
          effects: [{ target: "economy.fdi", delta: -2 }, { target: "economy.productivity", delta: 3 }],
        },
      ],
      {
        tariff: {
          speaker: "economicAdviser", expression: "neutral",
          text: L(
            "The operators will pay and grumble in Singapore English. The grid breathes. This is the option with no philosophy in it.",
            "Pengendali akan bayar dan mengeluh dalam bahasa Inggeris Singapura. Grid bernafas. Ini pilihan tanpa falsafah.",
          ),
        },
        cap: {
          speaker: "economicAdviser", expression: "stern",
          text: L(
            "The cap is respected until the first minister's friend calls about it. You have bought time, not a policy.",
            "Had itu dihormati sehingga kawan menteri pertama telefon mengenainya. Anda beli masa, bukan polisi.",
          ),
        },
        renewable: {
          speaker: "economicAdviser", expression: "pleased",
          text: L(
            "Two operators walk, one signs with a solar farm attached. The one that signs is the one you wanted.",
            "Dua pengendali beredar, satu menandatangani dengan ladang solar. Yang menandatangani ialah yang anda mahu.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_rti-accelerate", kind: "recurring", priority: 45, minGap: 6, chapter: 2,
      title: L("The retired judge's letter", "Surat hakim bersara"), location: L("Putrajaya", "Putrajaya"), category: "politics",
    },
    mkScene(
      "g_rti-accelerate",
      {
        speaker: "sup-attorneyGeneral",
        role: L("Attorney-General", "Peguam Negara"),
        expression: "neutral",
        text: L(
          "A retired Federal Court judge, now chairing the transparency commission, writes asking you to accelerate declassification. She has the files and the impatience.",
          "Hakim Mahkamah Persekutuan bersara, kini pengerusi suruhanjaya ketelusan, menulis meminta pelaksanaan penyahkelasan dipercepat. Dia ada failnya dan sikap tidak sabarnya.",
        ),
      },
      PROMPT.decide,
      [
        {
          id: "accelerate", to: "res-accelerate",
          label: L("Accelerate the schedule", "Percepatkan jadual"),
          effects: [{ target: "politics.institutionalIntegrity", delta: 2 }, { target: "politics.coalitionStability", delta: -1 }],
          news: { outlet: "peninsula", headline: L("Declassification schedule brought forward", "Jadual penyahkelasan disemak maju") },
        },
        {
          id: "steady", to: "res-steady",
          label: L("Hold the statutory pace", "Kekali pace statutori"),
          effects: [{ target: "politics.institutionalIntegrity", delta: 1 }],
        },
        {
          id: "stall", to: "res-stall",
          label: L("Quietly starve the commission's budget", "Kekurangkan bajet suruhanjaya secara senyap"),
          effects: [{ target: "politics.institutionalIntegrity", delta: -2 }],
          setFlags: { "rti.starved": true },
        },
      ],
      {
        accelerate: {
          speaker: "sup-attorneyGeneral", expression: "pleased",
          text: L(
            "She will be insufferable with gratitude, and the archive will be unignorable. Some of it will land on your own front bench.",
            "Dia akan tersangat bersyukur, dan arkib itu tidak boleh diabaikan. Sebahagiannya akan mendarat di kader depan anda sendiri.",
          ),
        },
        steady: {
          speaker: "sup-attorneyGeneral", expression: "neutral",
          text: L(
            "The statute holds, the letters keep coming, and nothing dramatic happens. That is what she agreed to, if not what she hoped for.",
            "Statut bertahan, surat terus datang, tiada apa dramatik. Itu yang dipersetujuinya, walaupun bukan yang diharapnya.",
          ),
        },
        stall: {
          speaker: "sup-attorneyGeneral", expression: "stern",
          text: L(
            "Budgets are never quietly starved; they are noticed, and the noticing is the story. I will advise against this in writing.",
            "Bajet tidak pernah dikurangkan secara senyap; ia diperhatikan, dan pemerhatian itu jadi berita. Saya akan nasihat menentang ini secara bertulis.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_gps-highway-toll", kind: "recurring", priority: 55, minGap: 5, chapter: 2,
      title: L("Pan Borneo tolls", "Tol Pan Borneo"), location: L("Kuching, Sarawak", "Kuching, Sarawak"), category: "federal",
    },
    mkScene(
      "g_gps-highway-toll",
      {
        speaker: "gpsPremier",
        role: L("Premier of Sarawak", "Premier Sarawak"),
        expression: "stern",
        text: L(
          "The peninsula abolished its highway tolls years ago. Pan Borneo still collects. Putrajaya either believes in one federation or it does not, Datuk Seri.",
          "Semenanjung mansuhkan tol lebuh raya bertahun dahulu. Pan Borneo masih kutip. Putrajaya sama ada percaya satu persekutuan atau tidak, Datuk Seri.",
        ),
      },
      PROMPT.decideBrief,
      [
        {
          id: "abolish", to: "res-abolish",
          label: L("Abolish the collection, federal budget absorbs it", "Mansuh kutipan, bajet persekutuan tanggung"),
          effects: [{ target: "economy.fiscalDeficit", delta: 0.5 }, { target: "characters.gpsPremier.relationship", delta: 6 }, { target: "politics.approval", delta: 1 }],
          news: { outlet: "borneo", headline: L("Pan Borneo tolls abolished", "Tol Pan Borneo dimansuhkan") },
        },
        {
          id: "freeze", to: "res-freeze",
          label: L("Freeze the rates, study full abolition", "Bekukan kadar, kaji pemansuhan penuh"),
          effects: [{ target: "economy.fiscalDeficit", delta: 0.2 }, { target: "characters.gpsPremier.relationship", delta: 2 }],
        },
        {
          id: "hold", to: "res-hold",
          label: L("Hold the line — the peninsular precedent is not law", "Kekal garisan — preseden semenanjung bukan undang"),
          effects: [{ target: "characters.gpsPremier.relationship", delta: -4 }, { target: "politics.coalitionStability", delta: -2 }],
        },
      ],
      {
        abolish: {
          speaker: "gpsPremier", expression: "pleased",
          text: L(
            "Then the road belongs to the people who drive it. Kuching will not forget which KL minister moved this file.",
            "Maka jalan itu milik orang yang memandunya. Kuching tidak akan lupa menteri KL mana yang menggerakkan fail ini.",
          ),
        },
        freeze: {
          speaker: "gpsPremier", expression: "neutral",
          text: L(
            "A study is a promise with a committee attached. The freeze buys you the year; the memory costs you longer.",
            "Kajian ialah janji dengan jawatankuasa. Pembekuan membeli setahun; memorinya mengkos anda lebih lama.",
          ),
        },
        hold: {
          speaker: "gpsPremier", expression: "stern",
          text: L(
            "Then say so plainly in the House and we will answer plainly in the state. Precedents are choices, Datuk Seri.",
            "Maka katakan jujur di Dewan dan kami jawab jujur di negeri. Preseden ialah pilihan, Datuk Seri.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_pension-cliff", kind: "chapter", chapter: 2, window: [16, 22], priority: 65,
      title: L("The pension cliff", "Tebing pencen"), location: L("Putrajaya", "Putrajaya"), category: "economy",
    },
    mkScene(
      "g_pension-cliff",
      {
        speaker: "finance",
        role: L("Minister of Finance", "Menteri Kewangan"),
        expression: "concerned",
        text: L(
          "The retirement scheme's actuarial report is on your desk and every scenario after 2034 is red. Reform now is painful and permanent. Delay is comfortable and expensive.",
          "Laporan aktuarial skim persaraan ada di meja anda dan setiap senario selepas 2034 merah. Reforma sekarang menyakitkan dan kekal. Tangguh selesa dan mahal.",
        ),
      },
      PROMPT.decide,
      [
        {
          id: "reform", to: "res-reform",
          label: L("Table the reform act this term", "Bentangkan akta reforma penggal ini"),
          effects: [{ target: "economy.fiscalDeficit", delta: -0.5 }, { target: "politics.approval", delta: -3 }, { target: "politics.coalitionStability", delta: -2 }],
          setFlags: { "pension.reform": "tabled" },
          news: { outlet: "peninsula", headline: L("Pension reform act tabled amid protests", "Akta reforma pencen dibentangkan amid bantahan") },
        },
        {
          id: "committee", to: "res-committee",
          label: L("A royal commission, report in two years", "Suruhanjaya diraja, lapor dua tahun"),
          effects: [{ target: "politics.institutionalIntegrity", delta: 2 }],
        },
        {
          id: "shelve", to: "res-shelve",
          label: L("Shelve it for a calmer season", "Simpan untuk musim lebih tenang"),
          effects: [{ target: "politics.coalitionStability", delta: 2 }],
          setFlags: { "pension.reform": "shelved" },
        },
      ],
      {
        reform: {
          speaker: "finance", expression: "stern",
          text: L(
            "You will be shouted at in the Dewan and thanked in 2040 by people who will not know your name. That is the whole trade.",
            "Anda akan disoraki di Dewan dan diucap terima kasih pada 2040 oleh orang yang tidak kenal nama anda. Itu keseluruhan tukarnya.",
          ),
        },
        committee: {
          speaker: "finance", expression: "neutral",
          text: L(
            "The commission buys respectability and two years of interest. It is the correct answer to the wrong question.",
            "Suruhanjaya membeli kredibiliti dan dua tahun faedah. Itu jawaban betul untuk soalan yang salah.",
          ),
        },
        shelve: {
          speaker: "finance", expression: "concerned",
          text: L(
            "Shelved files do not rot; they wait. I will keep the report where you can see it, Datuk Seri.",
            "Fail tersimpan tidak busuk; ia menunggu. Saya akan kekalkan laporan di tempat anda nampak, Datuk Seri.",
          ),
        },
      },
    ),
  ),
];
