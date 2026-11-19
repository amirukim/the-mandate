import type { GameEventDef } from "../../types/narrative";

/**
 * Chapter I: The First Hundred Days. November 2026 to February 2027.
 * Every officeholder is fictional. Institutions are real.
 */
export const CHAPTER1_EVENTS: GameEventDef[] = [
  {
    id: "c1_swearing_in",
    kind: "chapter",
    chapter: 1,
    priority: 100,
    window: [0, 0],
    title: "The First Table",
    location: "Prime Minister's Office, Perdana Putra",
    category: "politics",
    briefing: [
      "The oath was taken at the Palace on a Tuesday morning. By Tuesday afternoon, the motorcade carried you through Putrajaya's empty boulevards to an office that smells of fresh carpet and old power. The unity government's coalition agreement is two days old and already fraying at the margins.",
      "On the table: the King's speech to draft, a cabinet to finish, and a nation that elected no outright winner. Your coalition commands 140 of 222 seats in the Dewan Rakyat, held together by Sarawak gold, Sabah hope, and the memory of what happens when unity governments fall.",
      "Sarah Tan, your Principal Private Secretary, has arranged the first briefing. The country will hear from you tonight. What it hears first, it will believe longest.",
    ],
    dialogue: [
      {
        speaker: "Sarah Tan",
        role: "Principal Private Secretary",
        text: "YB, the cake is a lie and the diaries are worse. Three broadcasters want your first address, GPS wants a courtesy call before the King's speech, and Treasury has already sent someone to stand outside your door with a folder. Also: your predecessor left the drawers locked. I am having them opened.",
      },
      {
        speaker: "Tan Sri Azlan Mahmud",
        role: "Minister of Finance",
        text: "Prime Minister. I will not bury the headline: the subsidy bill is eating us alive and every month of delay costs the Treasury billions. But tonight is not about the ledger. Tonight is about whether the country believes you know what you are doing. Say something true. The rest of the term depends on it.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Speak of unity first",
        detail: "A sober address about coalition, stability and the King's command. Reassure markets and partners that the government will not topple.",
        summary: "Opened the term with a unity address to steady markets and partners.",
        consequences: [
          {
            note: "The address plays as statesmanlike. Bond desks approve; the perfectionists in your own coalition mutter about missing the moment.",
            effects: [
              { target: "politics.approval", delta: 4 },
              { target: "social.cohesion", delta: 3 },
              { target: "characters.bnChair.relationship", delta: 6 },
              { target: "characters.finance.relationship", delta: 2 },
            ],
            news: [
              {
                outlet: "peninsula",
                headline: "New PM chooses steady hand over soaring rhetoric",
                body: "The inaugural address was dull, deliberate and possibly brilliant. Every faction heard the word continuity.",
              },
              { outlet: "sinar", headline: "\"No drama, only work\": PM's first promise to the rakyat" },
            ],
          },
        ],
      },
      {
        id: "b",
        label: "Speak of reform first",
        detail: "Name the unfinished agenda: institutional independence, procurement transparency, MACC's teeth. Promise the country the reform it keeps being promised.",
        summary: "Opened the term by promising institutional reform from the first day.",
        consequences: [
          {
            note: "Reformists cheer. The old coalition partner's war rooms go quiet in the wrong way. Borneo partners ask, in writing, what reform means for their autonomy files.",
            effects: [
              { target: "politics.approval", delta: 1 },
              { target: "politics.institutionalIntegrity", delta: 4 },
              { target: "flags", set: "reformTone" },
              { target: "characters.gpsPremier.relationship", delta: 3 },
            ],
            news: [
              {
                outlet: "peninsula",
                headline: "\"Reform is not a slogan\": PM pledges institutions over personalities",
              },
              {
                outlet: "sinar",
                headline: "Reform speech wins plaudits, PN asks: \"Reform for whom?\"",
                body: "The opposition leader called the address an insult to the mandate of the majority community, in a speech that ran longer than the PM's.",
              },
            ],
          },
        ],
      },
      {
        id: "c",
        label: "Speak of the cost of living",
        detail: "Lead with the kitchen table: rice, rent, school shoes. Promise that the government's first file will be the price of living.",
        summary: "Opened the term by promising the cost of living as the government's first file.",
        consequences: [
          {
            note: "The country exhales. The Treasury exhales differently: immediate relief now implies a bigger deficit later, and Azlan has already drafted the memo saying so.",
            effects: [
              { target: "politics.approval", delta: 5 },
              { target: "social.costOfLivingPressure", delta: -4 },
              { target: "economy.fiscalDeficit", delta: 0.1 },
              { target: "characters.finance.relationship", delta: -2 },
            ],
            news: [
              { outlet: "sinar", headline: "PM's first vow: \"The price of rice is my problem, not yours\"" },
              {
                outlet: "peninsula",
                headline: "Markets blink at cost-of-living-first premiership",
                body: "Strategists ask whether the new government's first instinct will be fiscal discipline or fiscal kindness. They expect kindness.",
              },
            ],
          },
        ],
      },
      {
        id: "d",
        label: "Speak of security and order",
        detail: "A harder first address: the border, the sea lanes, the safety of streets and schools. Position the government as the guardian of ordinary life.",
        summary: "Opened the term with a security-and-order address.",
        consequences: [
          {
            note: "The uniformed services stand straighter. Urban liberals flinch. The adviser who watches the South China Sea allows herself one nod.",
            effects: [
              { target: "politics.approval", delta: 2 },
              { target: "security.domesticStability", delta: 3 },
              { target: "security.policeEffectiveness", delta: 2 },
              { target: "characters.nationalSecurity.relationship", delta: 6 },
            ],
            news: [
              { outlet: "peninsula", headline: "First address leans on security: \"Order is a service too\"" },
              { outlet: "borneo", headline: "Borneo leaders wait for PM to mention MA63. He did not." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "c1_subsidy_file",
    kind: "chapter",
    chapter: 1,
    priority: 90,
    window: [0, 1],
    title: "The Rising Cost of Living",
    location: "Cabinet Room, Perdana Putra",
    category: "economy",
    briefing: [
      "The folder Azlan carries has one number circled in red: the subsidy bill. Fuel, cooking oil, rice support and electricity tariffs together consume a share of federal spending that no ministry will name out loud in public. Every household in Malaysia feels the current arrangement as the only thing standing between them and the open market.",
      "But the arithmetic is unforgiving. A broad fuel subsidy mostly pays people who drive; a targeted programme risks the classic failure of leaving out the family that deserves it; tax relief leaks revenue the state cannot spare; and rationalisation, the Treasury's favourite word, is the word markets love and voters hear as prices going up.",
      "Bank Negara has privately flagged that doing nothing is also a decision: the ringgit dislikes optimism it cannot verify, and investors discount promises not backed by a fiscal path.",
    ],
    dialogue: [
      {
        speaker: "Tan Sri Azlan Mahmud",
        role: "Minister of Finance",
        text: "Prime Minister, four doors out of this room. One keeps the peace and costs the future. One is clever and leaks. One is honest and hurts. One is mine, and it is the only one that ends this conversation permanently. Choose the politics you can survive. I will make any of them work on paper.",
      },
      {
        speaker: "Dr. Kavitha Rao",
        role: "Special Economic Adviser",
        text: "One caution from my old shop: whatever you choose, tell people what it is. The worst outcome is not the wrong policy. It is a right policy nobody believes, discovered at the pump station.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Expand targeted assistance",
        detail: "Widen the income-tested cash transfer bands and speed up registration. Help lands directly in the accounts of households that need it.",
        summary: "Expanded targeted cash assistance to shield lower-income households.",
        consequences: [
          {
            note: "Families feel it within weeks. Registrations surge past the estimate, which is the good news and the bad news.",
            effects: [
              { target: "social.costOfLivingPressure", delta: -6 },
              { target: "politics.approval", delta: 4 },
              { target: "social.povertyRate", delta: -0.4 },
              { target: "economy.fiscalDeficit", delta: 0.3 },
              { target: "flags", set: "subsidyPolicy:targeted" },
            ],
            news: [
              { outlet: "sinar", headline: "Cash aid widened: \"Use it for the children's shoes,\" PM tells recipients" },
              {
                outlet: "peninsula",
                headline: "Targeted aid broadened; Treasury admits the net will cost more than first drawn",
              },
            ],
          },
          {
            delayTurns: 2,
            description: "Aid registrations exceeded projections; the expanded programme now costs more than budgeted.",
            effects: [
              { target: "economy.revenue", delta: -4 },
              { target: "economy.fiscalDeficit", delta: 0.2 },
              { target: "politics.approval", delta: 1 },
            ],
            news: [
              {
                outlet: "peninsula",
                headline: "Aid uptake swells past forecasts; second tranche question splits Cabinet",
              },
            ],
          },
        ],
      },
      {
        id: "b",
        label: "Hold broad fuel subsidies",
        detail: "Keep the pump price where it is, for everyone. The oldest anaesthetic in Malaysian politics still works.",
        summary: "Maintained broad fuel subsidies to keep pump prices fixed.",
        consequences: [
          {
            note: "Pump prices hold. The mood lifts at once. Somewhere in a briefing room, a graph of the deficit quietly steepens.",
            effects: [
              { target: "social.costOfLivingPressure", delta: -9 },
              { target: "politics.approval", delta: 6 },
              { target: "economy.fiscalDeficit", delta: 0.8 },
              { target: "flags", set: "subsidyPolicy:broad" },
            ],
            news: [
              { outlet: "sinar", headline: "Raya comes early: fuel price stays, PM keeps promise" },
              {
                outlet: "peninsula",
                headline: "Subsidy status quo continues; economists invoke the word \"unsustainable\" eleven times",
              },
            ],
          },
          {
            delayTurns: 3,
            description: "Cheap fuel is leaking across borders and into smugglers' margins; the ringgit and inflation feel it.",
            effects: [
              { target: "economy.ringgit", delta: 0.05 },
              { target: "economy.inflation", delta: 0.3 },
              { target: "politics.institutionalIntegrity", delta: -2 },
            ],
            news: [
              {
                outlet: "peninsula",
                headline: "Fuel subsidy arbitrage exposed at northern border; enforcement asks for political cover",
              },
            ],
          },
        ],
      },
      {
        id: "c",
        label: "Relieve taxes on essentials",
        detail: "Carve essentials out of sales tax and widen reliefs. The price signal stays honest and the revenue statement gets thinner.",
        summary: "Cut sales tax on essentials and widened household reliefs.",
        consequences: [
          {
            note: "Shelves feel it first. Business groups applaud the simplicity. Treasury's revenue forecast moves in one direction.",
            effects: [
              { target: "social.costOfLivingPressure", delta: -5 },
              { target: "politics.approval", delta: 3 },
              { target: "economy.revenue", delta: -6 },
              { target: "economy.fdi", delta: 4 },
              { target: "flags", set: "subsidyPolicy:relief" },
            ],
            news: [
              { outlet: "peninsula", headline: "Essentials carved out of sales tax; retailers pass savings \"where they can\"" },
              { outlet: "sinar", headline: "Tax relief announced; economists ask who pays next year" },
            ],
          },
          {
            delayTurns: 2,
            description: "Revenue losses from the tax carve-outs are landing harder than modelled.",
            effects: [
              { target: "economy.fiscalDeficit", delta: 0.3 },
              { target: "politics.approval", delta: -1 },
            ],
            news: [
              { outlet: "peninsula", headline: "Treasury memo leaks: revenue shortfall \"material\" after relief package" },
            ],
          },
        ],
      },
      {
        id: "d",
        label: "Begin subsidy rationalisation",
        detail: "Announce a dated, published roadmap: broad fuel subsidy converts to targeted support by year's end, with cash support front-loaded so the poorest are protected before prices move.",
        summary: "Launched a dated subsidy rationalisation roadmap with front-loaded protection.",
        consequences: [
          {
            note: "The country hears the word roadmap and feels a chill. Markets hear the same word and warm. The next three months will decide who was right.",
            effects: [
              { target: "politics.approval", delta: -3 },
              { target: "social.costOfLivingPressure", delta: -1 },
              { target: "economy.inflation", delta: 0.2 },
              { target: "politics.institutionalIntegrity", delta: 3 },
              { target: "flags", set: "subsidyPolicy:restructure" },
            ],
            news: [
              { outlet: "peninsula", headline: "PM publishes subsidy exit roadmap; ringgit firms on the news" },
              { outlet: "sinar", headline: "\"Roadmap\" worries traders at Pasar Malam: \"Roadmap to where?\"" },
            ],
          },
          {
            delayTurns: 3,
            description: "The rationalisation roadmap is proving fiscally sound but politically expensive.",
            effects: [
              { target: "economy.fiscalDeficit", delta: -0.5 },
              { target: "economy.productivity", delta: 3 },
              { target: "politics.approval", delta: -2 },
              { target: "social.satisfaction", delta: -2 },
            ],
            news: [
              {
                outlet: "peninsula",
                headline: "Treasury declares rationalisation on track; backbenchers declare it a suicide note",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "c1_budget_2027",
    kind: "chapter",
    chapter: 1,
    priority: 85,
    window: [1, 1],
    title: "Budget 2027",
    location: "Cabinet Room, Perdana Putra",
    category: "economy",
    briefing: [
      "Budget 2027 must be tabled this month. The tax man's baseline arithmetic gives the Treasury a deficit it inherited, not chose. Every ringgit spent on health is a ringgit not spent on rail, and every point of consolidation is a point of pain somebody will feel before the next election.",
      "Azlan has prepared four frameworks, each with a deficit target and a victim. The coalition partners have also prepared their asks, which are larger and less itemised. GPS wants east coast infrastructural truth-telling; BN wants rural commitments that photograph well; your own backbench want a story to tell at the surau and the kopitiam.",
      "The Dewan Rakyat will pass what you table. The country will judge what you tabled in roughly one news cycle.",
    ],
    dialogue: [
      {
        speaker: "Tan Sri Azlan Mahmud",
        role: "Minister of Finance",
        text: "Four deficit targets, Prime Minister. At 4.6 percent we buy comfort and sell the ringgit's dignity. At 3.4 percent we buy credibility and sell your backbenchers' seats. My recommendation is the one nobody will thank me for. It usually is.",
      },
      {
        speaker: "Sarah Tan",
        role: "Principal Private Secretary",
        text: "Whips report the BN divisional chiefs want \"something to open\" in their constituencies. GPS wants the word infrastructure said while looking at Sabah and Sarawak. Your own MPs want to be seen answering the price question. The Budget speech has to say all three in one breath.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Expansion budget (4.6% deficit)",
        detail: "Fund health, education and rural programmes hard. Worry about the gap later.",
        summary: "Tabled an expansionary Budget 2027 at a 4.6 percent deficit target.",
        consequences: [
          {
            note: "Ministries celebrate. The ringgit shrugs and slides a few sen. The word comfortable is used, and resented, in equal measure.",
            effects: [
              { target: "politics.approval", delta: 4 },
              { target: "social.health", delta: 3 },
              { target: "social.education", delta: 3 },
              { target: "economy.fiscalDeficit", delta: 0.4 },
              { target: "flags", set: "budget2027:expansion" },
            ],
            news: [
              { outlet: "sinar", headline: "Budget 2027: biggest health and school spending in years" },
              { outlet: "peninsula", headline: "Markets mark Budget 2027 \"comfortable\"; ringgit disagrees" },
            ],
          },
        ],
      },
      {
        id: "b",
        label: "Balanced budget (3.9% deficit)",
        detail: "Hold the line: modest growth spending, no new gimmicks, a credible glide path the rating agencies can circle in gold pen.",
        summary: "Tabled a balanced Budget 2027 at a 3.9 percent deficit target.",
        consequences: [
          {
            note: "A boring budget, which is a compliment. Investors notice. Backbenchers notice the absence of ribbon-cuttings.",
            effects: [
              { target: "economy.fiscalDeficit", delta: -0.3 },
              { target: "economy.ringgit", delta: -0.03 },
              { target: "economy.fdi", delta: 3 },
              { target: "flags", set: "budget2027:balanced" },
            ],
            news: [
              { outlet: "peninsula", headline: "Budget 2027 called \"credibly dull\"; analysts mean it kindly" },
            ],
          },
          {
            delayTurns: 2,
            description: "The balanced budget's restraint is being felt in clinic queues and school maintenance lists.",
            effects: [
              { target: "social.satisfaction", delta: -2 },
              { target: "politics.approval", delta: -1 },
            ],
          },
        ],
      },
      {
        id: "c",
        label: "Consolidation budget (3.4% deficit)",
        detail: "Cut fat, delay vanity projects, protect only the poorest households. The responsible budget, at the price of the government's popularity.",
        summary: "Tabled a consolidation Budget 2027 at a 3.4 percent deficit target.",
        consequences: [
          {
            note: "The tabled numbers earn a rare editorial: \"adults in the room\". The room your MPs sit in is less kind; several text Sarah within the hour.",
            effects: [
              { target: "politics.approval", delta: -5 },
              { target: "social.satisfaction", delta: -3 },
              { target: "economy.fiscalDeficit", delta: -0.8 },
              { target: "flags", set: "budget2027:consolidation" },
            ],
            news: [
              { outlet: "peninsula", headline: "A serious budget at last, says the editorial the MPs will not read aloud" },
              { outlet: "sinar", headline: "Consolidation budget: \"Ketuk katil sendiri,\" jokes the market, not the rakyat" },
            ],
          },
          {
            delayTurns: 3,
            description: "Consolidation is bearing fruit: investors respond and housing pressure eases slightly.",
            effects: [
              { target: "economy.fdi", delta: 5 },
              { target: "economy.productivity", delta: 2 },
              { target: "social.housingAffordability", delta: 2 },
            ],
          },
        ],
      },
      {
        id: "d",
        label: "Investment-led budget (4.3% deficit)",
        detail: "Borrow for the future: rail, flood mitigation, grid and digital infrastructure across every region, including the east.",
        summary: "Tabled an investment-led Budget 2027 at a 4.3 percent deficit target.",
        consequences: [
          {
            note: "Contractors cheer in three time zones. Borneo partners note, approvingly, that the maps this time include them.",
            effects: [
              { target: "federal.stateInfrastructure", delta: 4 },
              { target: "economy.unemployment", delta: -0.2 },
              { target: "economy.fiscalDeficit", delta: 0.2 },
              { target: "flags", set: "budget2027:investment" },
              { target: "characters.gpsPremier.relationship", delta: 4 },
              { target: "characters.borneoMinister.relationship", delta: 4 },
            ],
            news: [
              { outlet: "borneo", headline: "Budget 2027 finally draws the east on the infrastructure map" },
              { outlet: "peninsula", headline: "Investment-led budget bets on projects past governments did not finish" },
            ],
          },
          {
            delayTurns: 3,
            description: "Early infrastructure works are lifting productivity on the ground.",
            effects: [
              { target: "economy.productivity", delta: 3 },
              { target: "politics.approval", delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "c1_ma63_demand",
    kind: "chapter",
    chapter: 1,
    priority: 88,
    window: [1, 2],
    title: "The Borneo File",
    location: "Ministers' Lounge, Parliament",
    category: "federal",
    briefing: [
      "Peter Mojuntin does not sit down until you do, and he brings both Borneo state governments with him in spirit if not in person. The file on the table predates your government by six decades: the Malaysia Agreement 1963, and the specific, audited, repeatedly deferred question of the 40 percent net revenue grant owed to Sabah, together with Sarawak's parallel demands on petroleum revenue.",
      "Premier Lingga's letter arrives the same morning, as letters from Kuching do: courteous, exact, and structured like a constitutional claim. Sabah's chief minister echoes it in sharper language. Both are allies of your government. Both are watching whether the new Prime Minister's word is a currency or a coupon.",
      "Granting the claim costs real money every year. Deferring it costs trust, and trust is the only thing holding your majority's Borneo wing in place.",
    ],
    dialogue: [
      {
        speaker: "Datuk Seri Peter Mojuntin",
        role: "Minister in the Prime Minister's Department (Sabah Affairs)",
        text: "Prime Minister, I took this ministry on one condition: that this file moves. Sabah has waited through eleven PMs' worth of studies. A study is not a settlement. My people can hear the difference between a grant and a greeting.",
      },
      {
        speaker: "Datuk Patinggi Jonathan Lingga",
        role: "Premier of Sarawak",
        text: "Kuching does not need your urgency, Prime Minister. We need your arithmetic. Publish the numbers, table the formula, and Sarawak will negotiate like adults. What we will not do is applaud another decade of working committees.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Grant the claim, structured",
        detail: "Accept the 40 percent net revenue grant for Sabah with a phased, audited schedule, and move Sarawak's petroleum revenue file in parallel. Pay for trust now.",
        summary: "Granted Sabah's 40 percent revenue claim on a phased, audited schedule.",
        consequences: [
          {
            note: "Kota Kinabalu erupts in celebration. Kuching nods, having negotiated the schedule quietly. Treasury opens a new column and ages visibly.",
            effects: [
              { target: "federal.revenueFairness", delta: 6 },
              { target: "federal.sabahSarawakAutonomy", delta: 5 },
              { target: "characters.gpsPremier.relationship", delta: 8 },
              { target: "characters.borneoMinister.relationship", delta: 8 },
              { target: "economy.fiscalDeficit", delta: 0.5 },
              { target: "economy.revenue", delta: -8 },
              { target: "flags", set: "ma63Track:grant" },
            ],
            news: [
              { outlet: "borneo", headline: "Historic: Sabah's 40 percent claim granted on audited schedule" },
              { outlet: "peninsula", headline: "Borneo settlement praised and priced: what the grant does to the deficit" },
            ],
          },
        ],
      },
      {
        id: "b",
        label: "Table a parliamentary select committee",
        detail: "A bipartisan MA63 select committee with published terms and a reporting deadline. Slow, legitimate, and survivable.",
        summary: "Referred the MA63 revenue claims to a bipartisan select committee.",
        consequences: [
          {
            note: "Responsible government, Borneo-style disappointment. The committee buys time and some credibility; it does not buy gratitude.",
            effects: [
              { target: "federal.sabahSarawakAutonomy", delta: 2 },
              { target: "characters.gpsPremier.relationship", delta: 3 },
              { target: "characters.borneoMinister.relationship", delta: -2 },
              { target: "politics.institutionalIntegrity", delta: 2 },
            ],
            news: [
              { outlet: "borneo", headline: "MA63 goes to select committee; Sabah leaders \"note the process\"" },
            ],
          },
          {
            delayTurns: 4,
            description: "The select committee reports; its formula quietly improves revenue fairness.",
            effects: [
              { target: "federal.revenueFairness", delta: 3 },
              { target: "federal.ma63Progress", delta: 4 },
            ],
            news: [
              { outlet: "borneo", headline: "Committee lands on a compromise formula; both states call it \"a start\"" },
            ],
          },
        ],
      },
      {
        id: "c",
        label: "Offer a partial settlement",
        detail: "Fund the grant at half the claimed rate, framed as a first instalment. Half a bridge for half the cost.",
        summary: "Offered a partial 20 percent-equivalent settlement as a first instalment.",
        consequences: [
          {
            note: "Half measures are measured precisely. Sabah's chief minister calls it a down payment; the word is not a compliment.",
            effects: [
              { target: "federal.sabahSarawakAutonomy", delta: 1 },
              { target: "economy.revenue", delta: -4 },
              { target: "characters.borneoMinister.relationship", delta: -4 },
            ],
            news: [
              { outlet: "borneo", headline: "\"A down payment,\" says Sabah, \"is what you make before you intend to pay\"" },
            ],
          },
          {
            delayTurns: 2,
            description: "Borneo partners cool; whips report GPS and GRS sharpening their asks elsewhere.",
            effects: [
              { target: "politics.coalitionStability", delta: -4 },
              { target: "federal.revenueFairness", delta: 1 },
            ],
          },
        ],
      },
      {
        id: "d",
        label: "Refuse on fiscal grounds",
        detail: "Say plainly the federation cannot afford it this term. The honest answer, and the most expensive one.",
        summary: "Refused the MA63 revenue claim on fiscal grounds.",
        consequences: [
          {
            note: "The statement is truthful and detonates on contact. Mojuntin offers his resignation on the spot; you do not accept it, yet.",
            effects: [
              { target: "federal.sabahSarawakAutonomy", delta: -4 },
              { target: "characters.gpsPremier.relationship", delta: -10 },
              { target: "characters.borneoMinister.relationship", delta: -8 },
              { target: "politics.coalitionStability", delta: -6 },
            ],
            news: [
              { outlet: "borneo", headline: "PM refuses 40 percent claim; Sabah assembly motions planned" },
              { outlet: "sinar", headline: "PM chooses the ledger over Borneo's patience" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "c1_minimum_wage",
    kind: "chapter",
    chapter: 1,
    priority: 80,
    window: [3, 3],
    title: "The Wage Question",
    location: "Cabinet Room, Perdana Putra",
    category: "social",
    briefing: [
      "The national minimum wage stands at RM1,700, set last year. Human Resources argues it is already below what a single adult needs in the Klang Valley and is a rounding error in Singapore-adjacent Johor. Employers warn that small businesses, especially in the north and east, are still recovering from consecutive shocks.",
      "Labour federations, gig-worker platforms and a very organised cohort of delivery riders have converged on one demand with two parts: raise the floor, and bring gig workers into the Employees Provident Fund's orbit. The platforms, unsurprisingly, prefer the phrase flexible modern work.",
      "Whatever you choose becomes the government's answer to the decade's central question: whether work in Malaysia pays a life.",
    ],
    dialogue: [
      {
        speaker: "Dr. Kavitha Rao",
        role: "Special Economic Adviser",
        text: "A blunt raise buys applause and costs hours: employers cut overtime first, headcount second. The phased path gets you most of the good with less of the damage. The EPF piece for gig workers is the reform with an actual future attached to it.",
      },
      {
        speaker: "Datuk Seri Norliza Ahmad",
        role: "Minister of Home Affairs",
        text: "From my side of the fence: wage floors move migration patterns too. Whatever we choose, the enforcement agencies need budget for inspection, or the floor stays on paper.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Raise the floor to RM2,000",
        detail: "A decisive jump, nationwide, effective next quarter. Unions celebrate; the SME associations do not.",
        summary: "Raised the national minimum wage to RM2,000 effective next quarter.",
        consequences: [
          {
            note: "Pay slips rise. So do menu prices in sections of the economy that run on thin margins.",
            effects: [
              { target: "social.wageGrowth", delta: 1.2 },
              { target: "social.costOfLivingPressure", delta: -3 },
              { target: "politics.approval", delta: 3 },
              { target: "economy.inflation", delta: 0.2 },
              { target: "flags", set: "wagePolicy:raise2000" },
            ],
            news: [
              { outlet: "sinar", headline: "RM2,000: PM sets the wage floor higher than promised" },
              { outlet: "peninsula", headline: "Wage floor to RM2,000; SME federation forecasts \"pain in the north\"" },
            ],
          },
          {
            delayTurns: 2,
            description: "Small employers are trimming hours; unemployment ticks up as the wage floor lands.",
            effects: [
              { target: "economy.unemployment", delta: 0.3 },
              { target: "social.costOfLivingPressure", delta: 1 },
            ],
          },
        ],
      },
      {
        id: "b",
        label: "Keep RM1,700, add gig-worker EPF",
        detail: "Hold the floor, but legislate provident contributions for gig workers: platforms match, workers keep flexibility.",
        summary: "Kept the RM1,700 floor and legislated EPF matching for gig workers.",
        consequences: [
          {
            note: "Riders and drivers gain a retirement account for the first time. Platforms mutter about costs and comply. The floor question survives for another year.",
            effects: [
              { target: "social.satisfaction", delta: 2 },
              { target: "politics.institutionalIntegrity", delta: 2 },
              { target: "politics.approval", delta: 1 },
              { target: "flags", set: "wagePolicy:gig_epf" },
            ],
            news: [
              { outlet: "peninsula", headline: "Gig workers to get EPF matching; platforms \"welcome clarity\"" },
              { outlet: "sinar", headline: "Riders' retirement fund wins praise; wage floor left for next year" },
            ],
          },
        ],
      },
      {
        id: "c",
        label: "Phase to RM1,850 by July",
        detail: "A middle path: an interim step with a published review date. Everyone gets something; nobody gets a victory.",
        summary: "Phased the minimum wage to RM1,850 with a July review.",
        consequences: [
          {
            note: "The compromise is signed, announced and immediately called a compromise by both wings. It will probably work.",
            effects: [
              { target: "social.wageGrowth", delta: 0.6 },
              { target: "politics.approval", delta: 1 },
              { target: "flags", set: "wagePolicy:phase1850" },
            ],
            news: [
              { outlet: "peninsula", headline: "Wage floor rises in steps to RM1,850; both sides claim disappointment" },
            ],
          },
        ],
      },
      {
        id: "d",
        label: "Defer for a productivity study",
        detail: "Commission a full review and defer any rise. The business community breathes out. The kitchens of Malaysia breathe in.",
        summary: "Deferred the wage decision and commissioned a productivity review.",
        consequences: [
          {
            note: "The word defer does not photograph well next to a family's grocery bill.",
            effects: [
              { target: "politics.approval", delta: -3 },
              { target: "economy.fdi", delta: 2 },
              { target: "flags", set: "wagePolicy:defer" },
            ],
            news: [
              { outlet: "sinar", headline: "Wage decision deferred \"for study\"; workers ask what the last decade studied" },
            ],
          },
          {
            delayTurns: 2,
            description: "Wage stagnation is feeding cost-of-living anger in the towns.",
            effects: [
              { target: "social.costOfLivingPressure", delta: 3 },
              { target: "politics.approval", delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "c1_backdoor_whispers",
    kind: "chapter",
    chapter: 1,
    priority: 82,
    window: [3, 3],
    title: "Whispers of the Backdoor",
    location: "Prime Minister's Office, Perdana Putra",
    category: "politics",
    briefing: [
      "It arrives the way such things always arrive: a photograph taken at a dinner that should have been private. Three of your backbenchers, laughing with the opposition leader's chief whip. The caption writes itself. The arithmetic behind it is more precise than the photograph.",
      "The whips count eleven members across the government benches who would take a phone call from Perikatan Nasional tonight. Your majority is 140. The opposition needs twenty-eight. It does not have them, but it does not need them: it needs enough of yours to create a court, and the court creates the crisis.",
      "Sarah Tan has prepared three folders: one for loyalty that can be organised, one for a fight that can be won, and one for a deal that can be whispered.",
    ],
    dialogue: [
      {
        speaker: "Sarah Tan",
        role: "Principal Private Secretary",
        text: "Three ways through, PM. The GLC folder stabilises the numbers and stains the ledger. The counter-attack dares them on the floor of the House and lives or dies by your own numbers. The Borneo whisper costs nothing money can buy and everything integrity pretends not to price.",
      },
      {
        speaker: "Tan Sri Raja Nordin",
        role: "Chairman, Barisan Nasional",
        text: "Prime Minister, I have kept my chiefs in line through four PMs. They ask me for two things: respect and slots. Give me both and this government outlives your term. Refuse the slots, and I will still keep them, but I will keep them the way one keeps a cat: aware it might leave.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Organise loyalty with GLC posts",
        detail: "Quietly place waverers into government-linked company boards and envoys' seats. The machine's oldest lubricant.",
        summary: "Placed waverers into GLC and envoy posts to firm the majority.",
        consequences: [
          {
            note: "The phone calls stop by dinner. The numbers hold. Somewhere, an MACC officer opens a file labelled speculative, which is how all such files begin.",
            effects: [
              { target: "politics.coalitionStability", delta: 8 },
              { target: "characters.bnChair.relationship", delta: 5 },
              { target: "politics.institutionalIntegrity", delta: -6 },
              { target: "flags", set: "glcLoyalty" },
            ],
            news: [
              { outlet: "peninsula", headline: "A quiet week of board appointments; opposition smells a rat with a salary" },
            ],
          },
          {
            delayTurns: 3,
            description: "The GLC patronage is drawing anti-graft scrutiny.",
            effects: [
              { target: "politics.approval", delta: -3 },
              { target: "politics.institutionalIntegrity", delta: -3 },
            ],
            news: [
              { outlet: "peninsula", headline: "MACC confirms preliminary review of recent GLC appointments" },
            ],
          },
        ],
      },
      {
        id: "b",
        label: "Dare them on the floor",
        detail: "Test the House: schedule the government's own motion and force the issue publicly. Win, and the whispers die. Lose, and they do not.",
        summary: "Forced a confidence test on the floor of the Dewan Rakyat.",
        consequences: [
          {
            note: "The motion passes. You count the ayes yourself, twice, and the second time is for your own pulse. The opposition leader's smile is the smile of a man filing the vote for later.",
            effects: [
              { target: "politics.coalitionStability", delta: -3 },
              { target: "politics.oppositionStrength", delta: -4 },
              { target: "politics.approval", delta: 2 },
            ],
            news: [
              { outlet: "peninsula", headline: "Government motion carries comfortably; backdoor talk collapses on the division lists" },
              { outlet: "sinar", headline: "PM wins the House and loses nobody, this week" },
            ],
          },
        ],
      },
      {
        id: "c",
        label: "Whisper to Borneo first",
        detail: "Strengthen the government's floor from below: quiet assurances to GPS and GRS that Borneo files move, before any fight is picked.",
        summary: "Shored up the majority through quiet assurances to GPS and GRS.",
        consequences: [
          {
            note: "Kuching and Kota Kinabalu both respond with the warmth of partners who know their leverage and like you anyway. The BN chiefs notice who you called first.",
            effects: [
              { target: "characters.gpsPremier.relationship", delta: 4 },
              { target: "characters.borneoMinister.relationship", delta: 4 },
              { target: "politics.coalitionStability", delta: 5 },
              { target: "politics.institutionalIntegrity", delta: -1 },
            ],
            news: [
              { outlet: "borneo", headline: "PM calls Kuching and Kota Kinabalu; both report the government \"listening properly\"" },
            ],
          },
        ],
      },
      {
        id: "d",
        label: "Sign a public unity pact",
        detail: "Force every coalition leader onto one stage to sign a governing pact with fixed terms. Transparency as armour.",
        summary: "Signed a public coalition unity pact on stage with fixed governing terms.",
        consequences: [
          {
            note: "The signing photographs well. The pact's terms are real, which makes future bargaining harder and betrayal visible. That was the point.",
            effects: [
              { target: "politics.approval", delta: 2 },
              { target: "politics.coalitionStability", delta: 4 },
              { target: "politics.institutionalIntegrity", delta: 2 },
            ],
            news: [
              { outlet: "peninsula", headline: "Unity pact signed in public; \"now we can see who breaks it,\" says analyst" },
            ],
          },
          {
            delayTurns: 2,
            description: "The opposition has begun campaigning against the pact's terms.",
            effects: [
              { target: "politics.oppositionStrength", delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "c1_maritime_incident",
    kind: "chapter",
    chapter: 1,
    priority: 75,
    window: [2, 3],
    title: "The Grey Hulls",
    location: "National Security Council Room, Putrajaya",
    category: "diplomacy",
    briefing: [
      "At 0507 hours, a coast guard vessel of a neighbouring great power escorted a survey flotilla into Malaysia's exclusive economic zone off the east coast, seventy nautical miles inside the line. The Maritime Enforcement Agency's vessel shadowed them at the legal maximum distance. Nobody fired anything except cameras.",
      "The incident fits a pattern: salami tactics, each slice individually deniable. Dato' Faridah's team assesses three responses with real teeth: a formal protest note, a quiet diplomatic track, an ASEAN-first statement, or a visible upgrade of your own maritime presence.",
      "The Minister of Foreign Affairs reminds you that Malaysia chairs nothing this year and therefore must borrow other people's stages. The Philippines holds the ASEAN chair in 2026; Manila owes you nothing but understands the pattern better than anyone.",
    ],
    dialogue: [
      {
        speaker: "Dato' Faridah Yusof",
        role: "National Security Adviser",
        text: "The pattern matters more than the incident. Every unanswered slice becomes the new normal. My advice is consistency over drama, but I am paid to think in decades.",
      },
      {
        speaker: "Datuk Lim Wei Sheng",
        role: "Minister of Foreign Affairs",
        text: "Beijing will read our tone within the hour, as will Washington. A protest note is a message to three capitals at once. Quiet diplomacy protects trade; loud diplomacy protects territory. The honest answer is we need both eventually. You choose which comes first.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Formal protest note",
        detail: "Issue a formal diplomatic protest citing UNCLOS, and make it public. Principle, on the record.",
        summary: "Issued a public UNCLOS protest note over the EEZ incursion.",
        consequences: [
          {
            note: "The note is lodged and published. The survey flotilla leaves two days later, which is either respect or schedule.",
            effects: [
              { target: "diplomacy.china", delta: -4 },
              { target: "diplomacy.unitedStates", delta: 4 },
              { target: "politics.approval", delta: 1 },
              { target: "politics.institutionalIntegrity", delta: 2 },
            ],
            news: [
              { outlet: "peninsula", headline: "Putrajaya lodges formal protest over EEZ survey incident" },
              { outlet: "sinar", headline: "PM stands up at sea: \"Our waters are not a survey site\"" },
            ],
          },
        ],
      },
      {
        id: "b",
        label: "Quiet diplomacy",
        detail: "Raise it through established back-channels and keep the public statement bland. Protect the trade relationship; absorb the interior ministry's frustration.",
        summary: "Handled the incursion through quiet back-channel diplomacy.",
        consequences: [
          {
            note: "The flotilla departs on schedule and nothing is said that history could quote. The opposition says it for you, loudly.",
            effects: [
              { target: "diplomacy.china", delta: 2 },
              { target: "diplomacy.unitedStates", delta: -1 },
              { target: "politics.approval", delta: -1 },
              { target: "security.maritimeSecurity", delta: -1 },
            ],
            news: [
              { outlet: "peninsula", headline: "Government tight-lipped on EEZ incident; opposition calls it a shrug" },
            ],
          },
        ],
      },
      {
        id: "c",
        label: "Push an ASEAN statement",
        detail: "Work Manila and Jakarta for a joint ASEAN statement on maritime survey activity. Slower, but it builds the regional habit.",
        summary: "Secured an ASEAN joint statement on maritime survey activity.",
        consequences: [
          {
            note: "Manila delivers more than expected; Jakarta adds its weight. The statement is bland and historic at the same time.",
            effects: [
              { target: "diplomacy.asean", delta: 3 },
              { target: "diplomacy.china", delta: -2 },
              { target: "diplomacy.indonesia", delta: 2 },
            ],
            news: [
              { outlet: "peninsula", headline: "ASEAN issues rare joint statement on survey vessels; Putrajaya credited" },
            ],
          },
          {
            delayTurns: 2,
            description: "The ASEAN maritime consultation mechanism you seeded meets for the first time.",
            effects: [
              { target: "diplomacy.asean", delta: 2 },
              { target: "security.maritimeSecurity", delta: 2 },
            ],
          },
        ],
      },
      {
        id: "d",
        label: "Fund the coast guard buildup",
        detail: "Announce new offshore vessels and surveillance aircraft for the Maritime Enforcement Agency. Presence as policy.",
        summary: "Announced a funded coast guard buildup for EEZ presence.",
        consequences: [
          {
            note: "Hulls will take years; the announcement takes one press conference. Both neighbours and partners adjust their estimates of you.",
            effects: [
              { target: "security.maritimeSecurity", delta: 5 },
              { target: "economy.fiscalDeficit", delta: 0.2 },
              { target: "diplomacy.china", delta: -1 },
              { target: "flags", set: "maritimePosture:buildup" },
            ],
            news: [
              { outlet: "peninsula", headline: "New offshore patrol vessels announced; shipbuilders from three countries call within a week" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "c1_monsoon_floods",
    kind: "chapter",
    chapter: 1,
    priority: 84,
    window: [2, 4],
    title: "The Northeast Monsoon",
    location: "Crisis Operations Room, Putrajaya",
    category: "security",
    briefing: [
      "The monsoon arrives on schedule, which is the only thing on schedule. Within seventy-two hours, Kelantan's rivers leave their channels and Terengganu's lowlands flood for the fourth time in a decade. Forty-one thousand people are in relief centres by Friday. The number grows through the weekend.",
      "The meteorologists had warned, the drainage master plans exist, and the last review found maintenance budgets under-funded for three consecutive years. Every government inherits the same file. Your government inherited the rain as well.",
      "Norliza's civil defence machinery is working. The question on your desk is what the political response buys: speed, repair, blame, or resilience.",
    ],
    dialogue: [
      {
        speaker: "Datuk Seri Norliza Ahmad",
        role: "Minister of Home Affairs",
        text: "Relief centres are at capacity and holding. The aid mechanics are ready. What I need from you is a decision on the second wave: cash now, reconstruction later, or the audit the states are dreading. All three are defensible. Doing all three this month is not.",
      },
      {
        speaker: "Dr. Kavitha Rao",
        role: "Special Economic Adviser",
        text: "The reconstruction option is real money with real payback. Relief buys the week. The audit buys integrity. Resilience buys the decade. Choose the horizon you want to be remembered on.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Immediate cash and relief",
        detail: "Front-load cash assistance to affected households and flood allowances to deployed personnel. Speed above all.",
        summary: "Front-loaded cash relief to flood-affected households and deployed personnel.",
        consequences: [
          {
            note: "Aid lands while the water is still high. The eastern papers run photos of the actual envelopes, not the mock-ups.",
            effects: [
              { target: "politics.approval", delta: 4 },
              { target: "social.costOfLivingPressure", delta: -2 },
              { target: "economy.fiscalDeficit", delta: 0.3 },
              { target: "federal.relations.kelantan", delta: 4 },
              { target: "federal.relations.terengganu", delta: 4 },
            ],
            news: [
              { outlet: "sinar", headline: "Cash in hand by Monday: PM's flood order cuts through red tape" },
              { outlet: "borneo", headline: "While the peninsula floods, Borneo watches what help looks like" },
            ],
          },
        ],
      },
      {
        id: "b",
        label: "Rebuild properly, once",
        detail: "Commit reconstruction funds to drainage, retention and raised roads, executed against a published schedule.",
        summary: "Committed reconstruction funding to drainage and flood-resilient infrastructure.",
        consequences: [
          {
            note: "The commitment is the first of its kind to come with dates attached. It helps nobody this month, which is its honest weakness and its real strength.",
            effects: [
              { target: "federal.stateInfrastructure", delta: 4 },
              { target: "economy.unemployment", delta: -0.1 },
              { target: "economy.fiscalDeficit", delta: 0.2 },
              { target: "federal.relations.pahang", delta: 3 },
            ],
            news: [
              { outlet: "peninsula", headline: "Reconstruction fund published with dates; engineers cautiously delighted" },
            ],
          },
          {
            delayTurns: 3,
            description: "Early reconstruction works are holding in the worst-hit districts.",
            effects: [
              { target: "security.domesticStability", delta: 2 },
              { target: "politics.approval", delta: 2 },
            ],
          },
        ],
      },
      {
        id: "c",
        label: "Audit the drainage neglect",
        detail: "Order a public audit of state and federal maintenance failures. Accountability now; comfort later.",
        summary: "Ordered a public audit of flood maintenance failures across levels of government.",
        consequences: [
          {
            note: "The audit finds what everyone knows, in writing, with signatures. The opposition states call it a witch hunt; your allies call it overdue; the flooded families call it Tuesday.",
            effects: [
              { target: "politics.institutionalIntegrity", delta: 3 },
              { target: "politics.approval", delta: -2 },
              { target: "federal.relations.kelantan", delta: -3 },
            ],
            news: [
              { outlet: "peninsula", headline: "Flood audit names three consecutive years of deferred maintenance" },
              { outlet: "sinar", headline: "Audit first, aid still stuck in forms: flood victims unimpressed" },
            ],
          },
        ],
      },
      {
        id: "d",
        label: "Fund the resilience plan",
        detail: "A ten-year flood resilience programme: retention basins, forecasting, and relocation from the worst floodplains, funded every year regardless of politics.",
        summary: "Launched a funded ten-year national flood resilience programme.",
        consequences: [
          {
            note: "The plan is the least dramatic and most expensive response, announced to a country watching the current flood, not the future one.",
            effects: [
              { target: "economy.fiscalDeficit", delta: 0.2 },
              { target: "social.satisfaction", delta: 1 },
              { target: "flags", set: "floodResilience" },
            ],
            news: [
              { outlet: "peninsula", headline: "Ten-year flood plan tabled; applause from planners, shrugs from the wet" },
            ],
          },
          {
            delayTurns: 4,
            description: "The resilience programme's forecasting upgrades cut monsoon response times.",
            effects: [
              { target: "social.satisfaction", delta: 2 },
              { target: "security.domesticStability", delta: 2 },
              { target: "politics.approval", delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "c1_hundred_days",
    kind: "chapter",
    chapter: 1,
    priority: 70,
    window: [3, 4],
    title: "One Hundred Days",
    location: "Prime Minister's Office, Perdana Putra",
    category: "politics",
    briefing: [
      "One hundred days. The phrase is imported, the scrutiny is not. Your first hundred days produced a Budget, a subsidy decision, a Borneo settlement or standoff, a wage answer, a survived backdoor scare, a monsoon and a month of grey hulls offshore. The numbers say you are standing; the mood says the country is still deciding.",
      "Sarah Tan has drafted the address. Dr. Rao has annexed the numbers. The coalition leaders have each requested one paragraph of credit. The opposition has pre-drafted its rebuttal, which suggests their confidence in your failure was higher than yours.",
      "This address closes Chapter One. What you promise here becomes the standard you are judged against for the rest of the term.",
    ],
    dialogue: [
      {
        speaker: "Sarah Tan",
        role: "Principal Private Secretary",
        text: "The speech is written three ways: the record, the apology, and the pivot. Pick one honestly, PM. The country can smell the difference, and so can your coalition.",
      },
      {
        speaker: "Dato' Iskandar Rahman",
        role: "Leader of the Opposition",
        text: "One hundred days, Prime Minister. My colleagues have counted your promises. I have counted your signatures on other people's demands. Tonight the country compares notes with both of us.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Play the record straight",
        detail: "Report honestly: what was done, what stalled, what it cost. Treat the public as adults.",
        summary: "Delivered an honest hundred-days report of results and shortfalls.",
        consequences: [
          {
            note: "The honesty lands. Not everywhere, not with everyone, but where it counts: the persuadable middle.",
            effects: [
              { target: "politics.approval", delta: 3 },
              { target: "politics.institutionalIntegrity", delta: 3 },
              { target: "social.satisfaction", delta: 1 },
              { target: "characters.chiefOfStaff.relationship", delta: 4 },
            ],
            news: [
              { outlet: "peninsula", headline: "A hundred-days speech without varnish: \"Here is what we did not do\"" },
            ],
          },
        ],
      },
      {
        id: "b",
        label: "Claim the victory lap",
        detail: "Lead with the wins: the settlement that was signed, the relief that landed, the ships that will come. Momentum is a currency.",
        summary: "Delivered a triumphant hundred-days address focused on wins.",
        consequences: [
          {
            note: "The rally feels good and photographs better. Every omission is now a donation to the opposition's next ad.",
            effects: [
              { target: "politics.approval", delta: 4 },
              { target: "social.cohesion", delta: -1 },
              { target: "flags", set: "victoryLap" },
            ],
            news: [
              { outlet: "sinar", headline: "PM celebrates 100 days: \"The mandate is working\"" },
              { outlet: "peninsula", headline: "Victory lap speech omits three files; the opposition's fact-check desk does not" },
            ],
          },
        ],
      },
      {
        id: "c",
        label: "Pivot to the next horizon",
        detail: "Acknowledge the stumbles and pivot hard: name the second hundred days' agenda before anyone names it for you.",
        summary: "Pivoted the hundred-days address to a forward agenda.",
        consequences: [
          {
            note: "The pivot resets the question from what you did to what you will do, which is the ground you chose.",
            effects: [
              { target: "politics.approval", delta: 1 },
              { target: "economy.fdi", delta: 2 },
              { target: "flags", set: "pivotAgenda" },
            ],
            news: [
              { outlet: "peninsula", headline: "PM sketches second hundred days: two reform bills and a Borneo timetable" },
            ],
          },
        ],
      },
      {
        id: "d",
        label: "Reshuffle the cabinet",
        detail: "Use the moment to refresh the cabinet: promote performers, retire ballast, and remind everyone whose government this is.",
        summary: "Announced a cabinet reshuffle at the hundred-day mark.",
        consequences: [
          {
            note: "The reshuffle is front pages for two days. Promoted ministers are loyal for a month; the passed-over are patient for less.",
            effects: [
              { target: "politics.approval", delta: 2 },
              { target: "politics.coalitionStability", delta: -3 },
              { target: "politics.institutionalIntegrity", delta: 2 },
            ],
            news: [
              { outlet: "peninsula", headline: "Cabinet refresh at 100 days: eight promoted, three thanked" },
              { outlet: "sinar", headline: "Reshuffle rewards performance, says PM, while the dropped ministers count to ten" },
            ],
          },
        ],
      },
    ],
  },
];

