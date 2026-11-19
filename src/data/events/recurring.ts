import type { GameEventDef } from "../../types/narrative";

/**
 * The recurring governance pool. These fire once the first hundred days are
 * over and the country keeps existing: budgets, monsoons, by-elections, and
 * the slow files that never really close.
 */
export const RECURRING_EVENTS: GameEventDef[] = [
  {
    id: "r_annual_budget",
    kind: "recurring",
    priority: 95,
    schedule: "budget",
    title: "The Budget Comes Due",
    location: "Treasury, Putrajaya",
    category: "economy",
    briefing: [
      "October again. The Treasury's spreadsheets have metabolised last year's promises and are now demanding this year's arithmetic. The deficit glide path, the coalition's wishes and the country's patience arrive in one folder.",
      "Azlan presents the same four doors with different numbers: expand, balance, consolidate, or build. The ringgit is listening before you speak.",
    ],
    dialogue: [
      {
        speaker: "Tan Sri Azlan Mahmud",
        role: "Minister of Finance",
        text: "Prime Minister, the glide path bends or breaks this year. Every ministry has learned to ask in October the way farmers ask before monsoon. Choose our weather.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Expand spending",
        detail: "Another expansionary budget: comfort now, credibility later.",
        summary: "Tabled an expansionary budget.",
        consequences: [
          {
            note: "Spending rises across health, education and rural programmes. The ringgit pays a quiet tithe.",
            effects: [
              { target: "politics.approval", delta: 3 },
              { target: "social.health", delta: 2 },
              { target: "social.education", delta: 2 },
              { target: "economy.fiscalDeficit", delta: 0.4 },
            ],
            news: [{ outlet: "sinar", headline: "Big-spending budget tabled; ministries cheer politely" }],
          },
        ],
      },
      {
        id: "b",
        label: "Hold the balance",
        detail: "A disciplined middle budget. Nobody's favourite, everybody's survival.",
        summary: "Tabled a balanced budget.",
        consequences: [
          {
            note: "The glide path holds. Investors circle it in gold pen; your MPs underline the missing projects.",
            effects: [
              { target: "economy.fiscalDeficit", delta: -0.3 },
              { target: "economy.fdi", delta: 2 },
            ],
            news: [{ outlet: "peninsula", headline: "Budget holds the line; rating agencies nod without smiling" }],
          },
        ],
      },
      {
        id: "c",
        label: "Consolidate harder",
        detail: "Push the deficit down another notch. The popularity invoice arrives with the fiscal one.",
        summary: "Tabled a hard consolidation budget.",
        consequences: [
          {
            note: "Credibility up, comfort down. The editorial is admiring; the kopitiam is not.",
            effects: [
              { target: "economy.fiscalDeficit", delta: -0.6 },
              { target: "politics.approval", delta: -4 },
              { target: "social.satisfaction", delta: -2 },
            ],
            news: [{ outlet: "sinar", headline: "Austerity budget tabled: \"Rakyat asked to hold breath another year\"" }],
          },
        ],
      },
      {
        id: "d",
        label: "Invest in the regions",
        detail: "Borrow for infrastructure, weighted toward the east and Borneo.",
        summary: "Tabled an investment-heavy regional budget.",
        consequences: [
          {
            note: "Cranes on three horizons. Borneo's leaders call it progress; Treasury calls it arithmetic deferred.",
            effects: [
              { target: "federal.stateInfrastructure", delta: 3 },
              { target: "federal.relations.sabah", delta: 3 },
              { target: "federal.relations.sarawak", delta: 3 },
              { target: "economy.fiscalDeficit", delta: 0.3 },
            ],
            news: [{ outlet: "borneo", headline: "Regional budget lands east of the causeway first" }],
          },
        ],
      },
    ],
  },
  {
    id: "r_monsoon_season",
    kind: "recurring",
    priority: 90,
    schedule: "monsoon",
    minGap: 9,
    title: "Monsoon Watch",
    location: "Crisis Operations Room, Putrajaya",
    category: "security",
    briefing: [
      "The northeast monsoon is setting in. The forecasting desk reports water levels in the Kelantan basin running above the ten-year average, and the relief centres are being stocked ahead of the first warning.",
      "The machinery works, on paper. Whether it works before the cameras depends on what you order now.",
    ],
    dialogue: [
      {
        speaker: "Datuk Seri Norliza Ahmad",
        role: "Minister of Home Affairs",
        text: "My agencies are pre-positioned. What I need is your signature on one of three postures: pre-emptive cash, pre-positioned equipment, or a federal-state joint command with the opposition states. Command is the hard one politically. It is also the one that saves the most houses.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Pre-emptive cash to floodbelt states",
        detail: "Disburse standby assistance before the water rises.",
        summary: "Disbursed pre-emptive flood cash to the floodbelt.",
        consequences: [
          {
            note: "Families bank the help before the first evacuation. The eastern states remember.",
            effects: [
              { target: "economy.fiscalDeficit", delta: 0.2 },
              { target: "politics.approval", delta: 2 },
              { target: "federal.relations.kelantan", delta: 3 },
              { target: "federal.relations.terengganu", delta: 2 },
            ],
            news: [{ outlet: "sinar", headline: "Standby aid released before the rain, a first" }],
          },
        ],
      },
      {
        id: "b",
        label: "Pre-position equipment and personnel",
        detail: "Fund early deployment of boats, pumps and personnel to the floodbelt.",
        summary: "Pre-positioned flood equipment and personnel.",
        consequences: [
          {
            note: "The response time this year is measurably faster. There is less to photograph, which is the point.",
            effects: [
              { target: "economy.fiscalDeficit", delta: 0.1 },
              { target: "security.domesticStability", delta: 2 },
            ],
            news: [{ outlet: "peninsula", headline: "Agencies deploy ahead of monsoon; response times cut" }],
          },
        ],
      },
      {
        id: "c",
        label: "Joint federal-state command",
        detail: "Propose a joint command that includes the opposition-led state governments. Politics, swallowed for competence.",
        summary: "Formed a joint federal-state monsoon command with opposition states.",
        consequences: [
          {
            note: "The opposition Menteris Besar accept, guarded but real. Cooperation works, which confuses everyone's talking points.",
            effects: [
              { target: "federal.relations.kelantan", delta: 5 },
              { target: "federal.relations.kedah", delta: 2 },
              { target: "politics.institutionalIntegrity", delta: 2 },
              { target: "politics.oppositionStrength", delta: -1 },
            ],
            news: [{ outlet: "peninsula", headline: "Federal and opposition states share one flood command; a quiet precedent" }],
          },
        ],
      },
    ],
  },
  {
    id: "r_cost_of_living_watch",
    kind: "recurring",
    priority: 60,
    minGap: 5,
    available: (state) => state.social.costOfLivingPressure >= 58,
    title: "The Price of Everything",
    location: "Cabinet Room, Perdana Putra",
    category: "social",
    briefing: [
      "The cost-of-living file never closes; it merely sleeps. Kitchen prices are running ahead of wage slips again, and the parliamentary question this week is one word long: when?",
      "Dr. Rao's chart shows pressure rising through the middle bands, the voters with the most to lose and the least patience.",
    ],
    dialogue: [
      {
        speaker: "Dr. Kavitha Rao",
        role: "Special Economic Adviser",
        text: "Pressure is back above the line. If we do nothing, the opposition owns the word budget. If we act broad, Treasury owns the deficit. Choose your owner.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Widen cash assistance",
        detail: "Another targeted tranche for the squeezed middle and bottom.",
        summary: "Widened cash assistance bands again.",
        consequences: [
          {
            note: "Relief lands. The deficit notices.",
            effects: [
              { target: "social.costOfLivingPressure", delta: -5 },
              { target: "politics.approval", delta: 3 },
              { target: "economy.fiscalDeficit", delta: 0.3 },
            ],
            news: [{ outlet: "sinar", headline: "New aid tranche for the squeezed middle" }],
          },
        ],
      },
      {
        id: "b",
        label: "Press enforcement on profiteering",
        detail: "Raid the profiteers: price-gouging enforcement sweeps on essentials.",
        summary: "Ordered profiteering enforcement sweeps on essentials.",
        consequences: [
          {
            note: "Enforcement makes examples. Traders comply, and mutter. Prices ease a little, honestly or otherwise.",
            effects: [
              { target: "social.costOfLivingPressure", delta: -3 },
              { target: "politics.approval", delta: 1 },
              { target: "politics.institutionalIntegrity", delta: 1 },
            ],
            news: [{ outlet: "sinar", headline: "Enforcement sweeps on essentials: twenty-six compounds issued" }],
          },
        ],
      },
      {
        id: "c",
        label: "Hold the line, explain the plan",
        detail: "No new spending. Publish the data and the medium-term plan, and take the political hit standing.",
        summary: "Held spending; published the cost-of-living data and plan.",
        consequences: [
          {
            note: "The plan is correct and quiet. Approval dips; integrity rises. You chose your owner.",
            effects: [
              { target: "social.costOfLivingPressure", delta: -1 },
              { target: "politics.approval", delta: -2 },
              { target: "politics.institutionalIntegrity", delta: 2 },
            ],
            news: [{ outlet: "peninsula", headline: "No new relief; PM publishes the numbers and takes the questions" }],
          },
        ],
      },
    ],
  },
  {
    id: "r_by_election",
    kind: "recurring",
    priority: 70,
    minGap: 7,
    available: (state) => state.politics.coalitionStability < 66,
    title: "The By-Election",
    location: "Perdana Putra",
    category: "politics",
    briefing: [
      "A death in one constituency brings the question every government dreads: a by-election in a seat the opposition has marked. The margin is four hundred votes. The national media will treat a local contest as a referendum on your hundred days, your Budget, and your character.",
      "The state machinery wants a star candidate. The local division wants a local. The opposition wants your government's blood, in that order.",
    ],
    dialogue: [
      {
        speaker: "Sarah Tan",
        role: "Principal Private Secretary",
        text: "The state boss wants his man; the division wants their teacher; the social media team wants anyone under forty. The Prime Minister's endorsement will be worth one news cycle. Choose carefully which cycle.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Campaign hard in person",
        detail: "Put the premiership itself on the ground: your face, your record, three days of it.",
        summary: "Campaigned personally in the by-election.",
        consequences: [
          {
            note: "The visits draw crowds and dust. Win or lose, the vote becomes about you, which is what the opposition wanted and your party needed.",
            effects: [
              { target: "politics.approval", delta: 1 },
              { target: "politics.coalitionStability", delta: 2 },
              { target: "politics.oppositionStrength", delta: 1 },
            ],
            news: [{ outlet: "sinar", headline: "PM works the markets and the mosques; campaign now openly a referendum" }],
          },
        ],
      },
      {
        id: "b",
        label: "Promise the constituency a project",
        detail: "Commit a visible federal project to the constituency if the seat holds.",
        summary: "Promised a federal project for the by-election constituency.",
        consequences: [
          {
            note: "The announcement photographs well. The ethics lecturers write think-pieces; the voters write the swing.",
            effects: [
              { target: "economy.fiscalDeficit", delta: 0.1 },
              { target: "politics.coalitionStability", delta: 2 },
              { target: "politics.institutionalIntegrity", delta: -2 },
            ],
            news: [{ outlet: "peninsula", headline: "Project-for-votes question hangs over the by-election" }],
          },
        ],
      },
      {
        id: "c",
        label: "Stay out, let the machine work",
        detail: "No PM involvement. Let the state machinery fight it on local terms.",
        summary: "Kept the PM out of the by-election.",
        consequences: [
          {
            note: "You stay clean either way. The seat is fought on drains and diplomas, as local elections prefer.",
            effects: [
              { target: "politics.approval", delta: 0 },
              { target: "politics.coalitionStability", delta: -1 },
            ],
            news: [{ outlet: "peninsula", headline: "PM keeps distance from by-election; both camps claim it as strategy" }],
          },
        ],
      },
    ],
  },
  {
    id: "r_ma63_review",
    kind: "recurring",
    priority: 65,
    minGap: 10,
    available: (state) => state.federal.ma63Progress < 60,
    title: "MA63: The Slow File",
    location: "Ministers' Lounge, Parliament",
    category: "federal",
    briefing: [
      "The Malaysia Agreement file moves at the speed of trust, which is to say slowly and then suddenly. Kuching has tabled its petroleum revenue paper; Kota Kinabalu has echoed it with the 40 percent grant timetable. Both allies are again asking, with the patience of creditors, what this government's word is worth.",
      "Peter Mojuntin's briefing note is one line: \"They are drafting their 2027 budgets around your answer.\"",
    ],
    dialogue: [
      {
        speaker: "Datuk Seri Peter Mojuntin",
        role: "Minister in the Prime Minister's Department (Sabah Affairs)",
        text: "Two files, one mood. Move on the timetable and the mood holds. Stall and the mood becomes a motion in the Sabah assembly, then a campaign, then a problem.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Accelerate the timetable",
        detail: "Publish binding dates for the remaining MA63 devolution items.",
        summary: "Published binding MA63 devolution dates.",
        consequences: [
          {
            note: "Dates published, signatures attached. Borneo is satisfied; the legal service is busy.",
            effects: [
              { target: "federal.ma63Progress", delta: 5 },
              { target: "federal.sabahSarawakAutonomy", delta: 3 },
              { target: "characters.gpsPremier.relationship", delta: 4 },
              { target: "characters.borneoMinister.relationship", delta: 4 },
            ],
            news: [{ outlet: "borneo", headline: "Devolution timetable now binding; both state governments sign" }],
          },
        ],
      },
      {
        id: "b",
        label: "Offer infrastructure in place of cash",
        detail: "Propose capital projects in Borneo in lieu of further revenue transfers.",
        summary: "Offered Borneo infrastructure in lieu of revenue transfers.",
        consequences: [
          {
            note: "Sabah's chief minister accepts with visible reluctance; Kuching notes it without accepting.",
            effects: [
              { target: "federal.stateInfrastructure", delta: 3 },
              { target: "federal.revenueFairness", delta: -1 },
              { target: "characters.borneoMinister.relationship", delta: -2 },
            ],
            news: [{ outlet: "borneo", headline: "Roads offered in place of revenue; Sabah leaders \"will count the tar\"" }],
          },
        ],
      },
      {
        id: "c",
        label: "Let the lawyers argue it",
        detail: "Refer the petroleum claims to constitutional counsel. Slow, reversible, and technically correct.",
        summary: "Referred Borneo petroleum claims to constitutional counsel.",
        consequences: [
          {
            note: "Counsel will take a year to produce what politics could produce in a month.",
            effects: [
              { target: "characters.gpsPremier.relationship", delta: -3 },
              { target: "politics.institutionalIntegrity", delta: 1 },
            ],
            news: [{ outlet: "borneo", headline: "Petroleum claims go to counsel; Kuching calls it a delay with a title" }],
          },
        ],
      },
    ],
  },
  {
    id: "r_water_crisis",
    kind: "recurring",
    priority: 55,
    minGap: 9,
    available: (state) => (state.federal.relations.kelantan ?? 50) < 45,
    title: "The Water Letters",
    location: "Kelantan",
    category: "federal",
    briefing: [
      "The Kota Bharu municipal engineers have written again: pipe bursts are outpacing repairs, and the treatment plants are running on spares. The state government blames federal under-investment going back decades; the federal agency blames state billing and maintenance. Both histories are partially true, which is the hardest kind of dispute.",
      "Water is not a partisan issue for the family carrying buckets. It is only partisan for the adults.",
    ],
    dialogue: [
      {
        speaker: "Datuk Seri Norliza Ahmad",
        role: "Minister of Home Affairs",
        text: "If the taps fail this monsoon, the photographs will be of the government's choice, not the pipes' age. Fix it federally, fund it jointly, or federalise it legally. Pick the fight you can win.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Fund a federal repair programme",
        detail: "Federal money, federal contractors, state cooperation. Direct and visible.",
        summary: "Funded a federal water repair programme for Kelantan.",
        consequences: [
          {
            note: "The repairs start within weeks. Kelantan's government takes credit; the water takes the pressure off.",
            effects: [
              { target: "economy.fiscalDeficit", delta: 0.2 },
              { target: "federal.relations.kelantan", delta: 6 },
              { target: "social.satisfaction", delta: 1 },
            ],
            news: [{ outlet: "sinar", headline: "Federal crews move into Kelantan; taps steady in three districts" }],
          },
        ],
      },
      {
        id: "b",
        label: "Joint funding with the state",
        detail: "A 50-50 programme with the state government, sharing cost and credit.",
        summary: "Formed a joint federal-state water programme in Kelantan.",
        consequences: [
          {
            note: "Slower, cheaper, and the credit is split, which is the honest shape of federation.",
            effects: [
              { target: "economy.fiscalDeficit", delta: 0.1 },
              { target: "federal.relations.kelantan", delta: 4 },
              { target: "politics.institutionalIntegrity", delta: 1 },
            ],
            news: [{ outlet: "peninsula", headline: "Federal and Kelantan share water programme; precedent noted" }],
          },
        ],
      },
      {
        id: "c",
        label: "Audit the state's water company",
        detail: "Order a public audit of the state water operator before any funds move.",
        summary: "Ordered an audit of Kelantan's water operator.",
        consequences: [
          {
            note: "The audit finds mismanagement and heroism in equal measure. The money waits; the buckets do not.",
            effects: [
              { target: "politics.institutionalIntegrity", delta: 2 },
              { target: "federal.relations.kelantan", delta: -3 },
              { target: "politics.approval", delta: -1 },
            ],
            news: [{ outlet: "sinar", headline: "Audit before water: Kelantan leaders call the order an insult with footnotes" }],
          },
        ],
      },
    ],
  },
];
