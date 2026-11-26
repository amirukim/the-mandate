import type { GraphEventDef } from "../../engine/graph-events";
import { ev, mkScene, L, PROMPT } from "./helper";

/**
 * Crisis and condition-gated scenes (v2 Phase 8). Gated ones only surface when
 * the state calls for them: monsoon months, budget season, a fragile coalition.
 */

export const CRISIS_EVENTS: GraphEventDef[] = [
  ev(
    {
      id: "g_monsoon-evacuation", kind: "recurring", schedule: "monsoon", priority: 80, minGap: 4,
      title: L("Kampung under water", "Kampung ditenggelami"), location: L("Pasir Mas, Kelantan", "Pasir Mas, Kelantan"), category: "security",
    },
    mkScene(
      "g_monsoon-evacuation",
      {
        speaker: "nationalSecurity",
        role: L("National Security Adviser", "Penasihat Keselamatan Negara"),
        expression: "concerned",
        text: L(
          "The river is a metre from the bund and rising nine centimetres an hour. Two thousand people, one road, and every camera in the country pointed at it.",
          "Sungai satu meter dari tambak dan naik sembilan sentimeter sejam. Dua ribu orang, satu jalan, dan semua kamera negara tertumpu ke situ.",
        ),
      },
      PROMPT.decideBrief,
      [
        {
          id: "deploy", to: "res-deploy",
          label: L("Deploy the army early — pre-empt the question", "Hantar tentera awal — awalkan soalannya"),
          effects: [{ target: "security.militaryReadiness", delta: 2 }, { target: "politics.approval", delta: 2 }, { target: "economy.fiscalDeficit", delta: 0.1 }],
          news: { outlet: "peninsula", headline: L("Army deployed ahead of Kelantan flood peak", "Tentera dihantar awal sebelum puncak banjir Kelantan") },
        },
        {
          id: "wait", to: "res-wait",
          label: L("Wait for the districts to request assistance", "Tunggu daerah minta bantuan"),
          effects: [{ target: "politics.coalitionStability", delta: -2 }, { target: "security.domesticStability", delta: -2 }],
        },
        {
          id: "cash", to: "res-cash",
          label: L("Deploy cash aid and the air force together", "Gerakkan bantuan tunai dan TUDM bersama"),
          effects: [{ target: "economy.fiscalDeficit", delta: 0.3 }, { target: "politics.approval", delta: 1 }, { target: "security.maritimeSecurity", delta: 1 }],
        },
      ],
      {
        deploy: {
          speaker: "nationalSecurity", expression: "pleased",
          text: L(
            "The convoys move at four in the morning and the footage beats the water by two hours. This is what the machinery is for.",
            "Konvoi bergerak pukul empat pagi dan rakaman mengalahkan air dua jam. Inilah gunanya jentera ini.",
          ),
        },
        wait: {
          speaker: "nationalSecurity", expression: "stern",
          text: L(
            "Protocol was followed and people stood on rooftops waiting for it. The district chief's press conference writes your next month for you.",
            "Protokol diikuti dan orang berdiri di atas bumbung menunggunya. Sidang media ketua daerah menulis bulan hadapan anda untuk anda.",
          ),
        },
        cash: {
          speaker: "nationalSecurity", expression: "neutral",
          text: L(
            "Helicopters and envelopes, in that order. It costs, it works, and nobody remembers the invoice during the thank-you prayers.",
            "Helikopter dan sampul, dalam urutan itu. Ia berkos, ia berfungsi, dan tiada siapa ingat invoisnya semasa doa syukur.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_cyber-breach", kind: "recurring", priority: 65, minGap: 6,
      title: L("The breach", "Kebocoran"), location: L("Cyberjaya, Selangor", "Cyberjaya, Selangor"), category: "security",
    },
    mkScene(
      "g_cyber-breach",
      {
        speaker: "nationalSecurity",
        role: L("National Security Adviser", "Penasihat Keselamatan Negara"),
        expression: "stern",
        text: L(
          "A contractor's credentials opened a citizen-services database for eleven hours. We do not know what left. We know the press has a copy of something.",
          "Kredencial kontraktor membuka pangkalan data perkhidmatan warga selama sebelas jam. Kita tidak tahu apa yang keluar. Kita tahu media ada salinan sesuatu.",
        ),
      },
      PROMPT.decidePress,
      [
        {
          id: "disclose", to: "res-disclose",
          label: L("Full disclosure tonight, hotline by morning", "Pendedahan penuh malam ini, talian panjang menjelang pagi"),
          effects: [{ target: "politics.institutionalIntegrity", delta: 3 }, { target: "politics.approval", delta: -2 }],
          news: { outlet: "peninsula", headline: L("Government confirms data breach, opens hotline", "Kerajaan sah kebocoran data, buka talian panjang") },
        },
        {
          id: "patch", to: "res-patch",
          label: L("Patch quietly, audit for a month", "Tampal senyap, audit sebulan"),
          effects: [{ target: "politics.institutionalIntegrity", delta: -2 }, { target: "security.cybersecurity", delta: 1 }],
          setFlags: { "crisis.cyber.concealed": true },
        },
        {
          id: "foreign", to: "res-foreign",
          label: L("Attribute it to a foreign actor", "Tuding kepada pihak asing"),
          effects: [{ target: "diplomacy.china", delta: -3 }, { target: "social.cohesion", delta: -1 }, { target: "politics.approval", delta: 1 }],
        },
      ],
      {
        disclose: {
          speaker: "nationalSecurity", expression: "neutral",
          text: L(
            "The hotline takes forty thousand calls and the opposition says it proves chaos. Discipline is remembered longer than panic.",
            "Talian panjang menerima empat puluh ribu panggilan dan pembangkang kata itu bukti huru-hara. Disiplin diingati lebih lama daripada kepanikan.",
          ),
        },
        patch: {
          speaker: "nationalSecurity", expression: "concerned",
          text: L(
            "The hole is closed and the secret is a countdown. Every quiet week makes the eventual headline worse.",
            "Lubang ditutup dan rahsia menjadi kiraan detik. Setiap minggu senyap menjadikan tajuk akhir lebih teruk.",
          ),
        },
        foreign: {
          speaker: "nationalSecurity", expression: "stern",
          text: L(
            "The attribution is defensible and convenient, which is exactly why it will be doubted. Beijing will call it fabrication and our own teenagers will meme it.",
            "Perhatian itu boleh dipertahankan dan mudah — sebab itu ia akan diragui. Beijing sebut ia rekaan dan remaja kita sendiri jadikan meme.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_haze-diplomacy", kind: "recurring", schedule: "monsoon", priority: 60, minGap: 4,
      title: L("The haze returns", "Jerebu kembali"), location: L("Klang Valley", "Lembah Klang"), category: "diplomacy",
    },
    mkScene(
      "g_haze-diplomacy",
      {
        speaker: "foreign",
        role: L("Minister of Foreign Affairs", "Menteri Luar Negeri"),
        expression: "neutral",
        text: L(
          "API crossed 200 in three states. The plumes are on satellite from Sumatra again, and Jakarta's environment ministry is already apologising in advance.",
          "API melepasi 200 di tiga negeri. Asap kelihatan dari Sumatera melalui satelit lagi, dan kementerian alam sekitar Jakarta sudah bermaaf awal.",
        ),
      },
      PROMPT.decidePress,
      [
        {
          id: "pressure", to: "res-pressure",
          label: L("Name the corporations in public", "Sebut syarikat secara terbuka"),
          effects: [{ target: "diplomacy.indonesia", delta: -4 }, { target: "politics.approval", delta: 2 }, { target: "social.health", delta: 1 }],
          news: { outlet: "peninsula", headline: L("KL names plantation groups over haze", "KL sebut gabungan ladang berhubung jerebu") },
        },
        {
          id: "quiet", to: "res-quiet",
          label: L("Quiet diplomacy and cloud seeding", "Diplomasi senyap dan pemetikan awan"),
          effects: [{ target: "diplomacy.indonesia", delta: 2 }, { target: "economy.fiscalDeficit", delta: 0.1 }, { target: "politics.approval", delta: -1 }],
        },
        {
          id: "health", to: "res-health",
          label: L("Public health response only — masks and closures", "Respons kesihatan sahaja — topeng dan penutupan"),
          effects: [{ target: "social.health", delta: 2 }, { target: "social.costOfLivingPressure", delta: 1 }],
        },
      ],
      {
        pressure: {
          speaker: "foreign", expression: "neutral",
          text: L(
            "Jakarta will recall it for a year and their plantation lobby for five. The API drops when the monsoon arrives either way.",
            "Jakarta akan ingat setahun dan lobinya ladang lima tahun. API turun juga bila monsun tiba.",
          ),
        },
        quiet: {
          speaker: "foreign", expression: "pleased",
          text: L(
            "The seeded clouds worked over Selangor and nobody photographed the bill. Diplomacy at its best is invisible.",
            "Awan metikan berjaya di Selangor dan tiada siapa foto invoisnya. Diplomasi terbaik tidak kelihatan.",
          ),
        },
        health: {
          speaker: "foreign", expression: "neutral",
          text: L(
            "Masks, school closures, and the NGO tables at the malls. Domestic answers to a foreign problem — honest, and it shows.",
            "Topeng, penutupan sekolah, dan meja NGO di pusat beli-belah. Jawaban domestik untuk masalah asing — jujur, dan ia kelihatan.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_budget-leak", kind: "recurring", schedule: "budget", priority: 70,
      title: L("The leaked line", "Peruntukan yang bocor"), location: L("Putrajaya", "Putrajaya"), category: "politics",
    },
    mkScene(
      "g_budget-leak",
      {
        speaker: "finance",
        role: L("Minister of Finance", "Menteri Kewangan"),
        expression: "stern",
        text: L(
          "A draft allocation was photographed in this building before tabled. The opposition has the page number. Someone in this ministry is a source.",
          "Draf peruntukan difotokan dalam bangunan ini sebelum dibentangkan. Pembangkang ada nombor halamannya. Ada sumber dalam kementerian ini.",
        ),
      },
      PROMPT.decide,
      [
        {
          id: "own", to: "res-own",
          label: L("Own it — table the draft unchanged, today", "Miliki ia — bentangkan draf tanpa ubah, hari ini"),
          effects: [{ target: "politics.institutionalIntegrity", delta: 2 }, { target: "politics.approval", delta: -1 }],
          news: { outlet: "peninsula", headline: L("Budget tabled early after leak, unchanged", "Belanjawan dibentang awal selepas bocor, tanpa ubah") },
        },
        {
          id: "sweep", to: "res-sweep",
          label: L("Order a leak investigation, delayed table", "Arahan siasatan kebocoran, bentangan ditangguh"),
          effects: [{ target: "politics.institutionalIntegrity", delta: 1 }, { target: "politics.coalitionStability", delta: -1 }],
        },
        {
          id: "counter", to: "res-counter",
          label: L("Feed a counter-leak about their finances", "Berikan kebocoran balas tentang kewangan mereka"),
          effects: [{ target: "politics.institutionalIntegrity", delta: -3 }, { target: "politics.oppositionStrength", delta: -1 }],
          setFlags: { "crisis.leak.countered": true },
        },
      ],
      {
        own: {
          speaker: "finance", expression: "pleased",
          text: L(
            "You take the story away from them by finishing it. The editorial writers hate it; the editorial facts are yours.",
            "Anda habiskan cerita itu sebelum mereka. Penulis rencana benci; fakta rencana milik anda.",
          ),
        },
        sweep: {
          speaker: "finance", expression: "neutral",
          text: L(
            "The investigation will find an intern with an ideology, or nothing. Both outcomes take longer than the news cycle.",
            "Siasatan akan temui seorang intern berideologi, atau tiada apa. Kedua-duanya lebih lama daripada kitaran berita.",
          ),
        },
        counter: {
          speaker: "finance", expression: "stern",
          text: L(
            "That is how everyone in this building wins and how the building loses. I have seen the archive on this trick, Datuk Seri.",
            "Itu cara semua orang dalam bangunan ini menang dan bangunan ini kalah. Saya pernah lihat arkif tentang muslihat ini, Datuk Seri.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_defector-overture", kind: "recurring", priority: 60, minGap: 5,
      title: L("The overture", "Rayuan"), location: L("Kuala Lumpur", "Kuala Lumpur"), category: "politics",
      // surfaces only when the bloc is genuinely fragile
    },
    mkScene(
      "g_defector-overture",
      {
        speaker: "chiefOfStaff",
        role: L("Principal Private Secretary", "Setiausaha Peribadi Utama"),
        expression: "neutral",
        text: L(
          "A PN backbencher's lawyer called. He wants to cross the floor, quietly, with a ministry in the handover. His constituency is marginal and his motives are not love.",
          "Peguam seorang ahli belakang PN telefon. Dia mahu lompat, senyap, dengan jawatan dalam pakej. Kawasannya marginal dan motifnya bukan cinta.",
        ),
      },
      PROMPT.decide,
      [
        {
          id: "accept", to: "res-accept",
          label: L("Take the man and the vote", "Terima lelaki itu dan undinya"),
          effects: [{ target: "politics.oppositionStrength", delta: -3 }, { target: "politics.coalitionStability", delta: -2 }, { target: "politics.institutionalIntegrity", delta: -1 }],
          setFlags: { "defection.accepted": true },
          news: { outlet: "sinar", headline: L("PN backbencher crosses to government benches", "Ahli PN lompat ke bangku kerajaan") },
        },
        {
          id: "public", to: "res-public",
          label: L("Publicise the approach and refuse it", "Publikasikan rayuan dan tolaknya"),
          effects: [{ target: "politics.approval", delta: 1 }, { target: "politics.oppositionStrength", delta: 2 }],
        },
        {
          id: "rebuff", to: "res-rebuff",
          label: L("Refuse it quietly through his lawyer", "Tolak senyap melalui peguamnya"),
          effects: [{ target: "politics.institutionalIntegrity", delta: 1 }],
        },
      ],
      {
        accept: {
          speaker: "chiefOfStaff", expression: "concerned",
          text: L(
            "The arithmetic likes him and the room remembers how he arrived. Every future defection is now priced against this purchase.",
            "Aritmetik suka dia dan bilik ingat cara dia datang. Setiap lompatan akan datang dihargai mengikut pembelian ini.",
          ),
        },
        public: {
          speaker: "chiefOfStaff", expression: "pleased",
          text: L(
            "The press conference writes itself and the PN chief has to answer why his men are shopping. It costs an enemy, cheaply.",
            "Sidang media menulis dirinya dan ketua PN terpaksa jawab kenapa anak buahnya membeli-belah. Kosnya satu musuh, murah.",
          ),
        },
        rebuff: {
          speaker: "chiefOfStaff", expression: "neutral",
          text: L(
            "His lawyer understands immediately and the story dies in a phone call. Some integrity is only visible to the people who keep it.",
            "Peguamnya faham serta-merta dan cerita itu mati dalam satu panggilan. Sebahagian integriti hanya nampak kepada orang yang menjaganya.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_bread-price", kind: "recurring", priority: 50, minGap: 5,
      title: L("The bread question", "Soalan roti"), location: L("Putrajaya", "Putrajaya"), category: "economy",
    },
    mkScene(
      "g_bread-price",
      {
        speaker: "economicAdviser",
        role: L("Special Economic Adviser", "Penasihat Khas Ekonomi"),
        expression: "neutral",
        text: L(
          "Wheat and freight moved together and every bakery is repricing on Monday. The subsidy scheme covers flour; it does not cover the argument.",
          "Gandum dan pengangkutan naik serentak dan semua bakeri ubah harga hari Isnin. Skim subsidi meliputi tepung; ia tidak meliputi perdebatan.",
        ),
      },
      PROMPT.decide,
      [
        {
          id: "cap", to: "res-cap",
          label: L("Cap the shelf price for six months", "Hadkan harga rak enam bulan"),
          effects: [{ target: "social.costOfLivingPressure", delta: -3 }, { target: "economy.fiscalDeficit", delta: 0.25 }],
          news: { outlet: "peninsula", headline: L("Shelf-price cap ordered for bread and flour", "Had harga rak diarahkan untuk roti dan tepung") },
        },
        {
          id: "transfer", to: "res-transfer",
          label: L("Top up STR payments instead", "Tambah bayaran STR sebagai ganti"),
          effects: [{ target: "economy.fiscalDeficit", delta: 0.2 }, { target: "politics.approval", delta: 1 }],
        },
        {
          id: "market", to: "res-market",
          label: L("Let the market reprice, say so plainly", "Biar pasar ubah harga, katakan jujur"),
          effects: [{ target: "social.costOfLivingPressure", delta: 3 }, { target: "politics.approval", delta: -3 }, { target: "politics.institutionalIntegrity", delta: 1 }],
        },
      ],
      {
        cap: {
          speaker: "economicAdviser", expression: "neutral",
          text: L(
            "Bakers will shrink the loaf before they absorb it — the cap becomes a weight debate. It still buys six quiet months.",
            "Bakeri akan kecilkan roti sebelum menanggungnya — had itu jadi perdebatan berat. Tetap membeli enam bulan tenang.",
          ),
        },
        transfer: {
          speaker: "economicAdviser", expression: "pleased",
          text: L(
            "The transfer is invisible in the shop and visible in the bank. The honest kind of help, and the quietest.",
            "Pindahan itu tak kelihatan di kedai dan kelihatan di bank. Bantuan yang jujur, dan paling senyap.",
          ),
        },
        market: {
          speaker: "economicAdviser", expression: "concerned",
          text: L(
            "Saying it plainly is the right economics and the wrong politics, in exactly the order that costs us. I will stand next to you anyway.",
            "Katakan jujur ialah ekonomi betul dan politik salah, tepat dalam urutan yang mengkos kita. Saya tetap berdiri sebelah anda.",
          ),
        },
      },
    ),
  ),

  ev(
    {
      id: "g_ringgit-slide", kind: "recurring", priority: 55, minGap: 5,
      title: L("The slide", "Anjakan ringgit"), location: L("Bank Negara Malaysia", "Bank Negara Malaysia"), category: "economy",
    },
    mkScene(
      "g_ringgit-slide",
      {
        speaker: "sup-bankGovernor",
        role: L("Governor, Bank Negara", "Gabernor, Bank Negara"),
        expression: "concerned",
        text: L(
          "The ringgit tests the level the markets treat as psychological. I can spend reserves defending it, talk it up, or let it find the floor. All three are legitimate; one is cheap.",
          "Ringgit uji paras yang pasar anggap psikologi. Saya boleh belanjakan rizab mempertahankannya, katakan ia naik, atau biarkan ia cari lantai. Ketiga-tiga sah; satu murah.",
        ),
      },
      PROMPT.decideBrief,
      [
        {
          id: "reserves", to: "res-reserves",
          label: L("Defend the level with reserves", "Pertahan paras dengan rizab"),
          effects: [{ target: "economy.ringgit", delta: -0.04 }, { target: "economy.fiscalDeficit", delta: 0.15 }],
          news: { outlet: "peninsula", headline: L("Bank Negara seen defending the ringgit", "Bank Negara kelihatan mempertahankan ringgit") },
        },
        {
          id: "jawbone", to: "res-jawbone",
          label: L("Public confidence line, no intervention", "Ucapan keyakinan awam, tanpa campur"),
          effects: [{ target: "economy.ringgit", delta: 0.02 }, { target: "economy.fdi", delta: 1 }],
        },
        {
          id: "float", to: "res-float",
          label: L("Let it find the floor — exporters smile", "Biarkan cari lantai — pengeksport tersenyum"),
          effects: [{ target: "economy.ringgit", delta: -0.08 }, { target: "economy.fdi", delta: -2 }, { target: "social.costOfLivingPressure", delta: 2 }],
        },
      ],
      {
        reserves: {
          speaker: "sup-bankGovernor", expression: "stern",
          text: L(
            "We hold the level and the speculators learn our account balance by watching it. Expensive lessons are still lessons.",
            "Kita tahan paras dan spekulator belajar baki akaun kita dengan memerhatikannya. Pelajaran mahal tetap pelajaran.",
          ),
        },
        jawbone: {
          speaker: "sup-bankGovernor", expression: "neutral",
          text: L(
            "Words move a currency for a week at most. The markets respect the statements and price the fundamentals.",
            "Perkataan gerakkan mata wang sekurang-kurangnya seminggu. Pasar hormati ucapan dan hargai asas.",
          ),
        },
        float: {
          speaker: "sup-bankGovernor", expression: "neutral",
          text: L(
            "The exporters' associations will thank you and the importers' will not. The floor exists; it is simply lower than the newspapers like.",
            "Gabungan pengeksport akan berterima kasih dan pengimport tidak. Lantai itu wujud; hanya lebih rendah daripada yang akhbar suka.",
          ),
        },
      },
    ),
  ),
];
