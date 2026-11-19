/**
 * Terjemahan Bahasa Melayu: peristiwa Bab I.
 * Struktur mencerminkan data EN mengikut id; kesan (effects) kekal dalam
 * fail EN — hanya teks yang diterjemahkan di sini.
 */

export interface ConsequenceMs {
  note?: string;
  description?: string;
  news?: Array<{ headline?: string; body?: string }>;
}

export interface OptionMs {
  label?: string;
  detail?: string;
  summary?: string;
  consequences?: ConsequenceMs[];
}

export interface EventMs {
  title?: string;
  location?: string;
  briefing?: string[];
  dialogue?: Array<{ role?: string; text?: string }>;
  options?: Record<string, OptionMs>;
}

export const EVENTS_CH1_MS: Record<string, EventMs> = {
  c1_swearing_in: {
    title: "Meja Pertama",
    location: "Pejabat Perdana Menteri, Perdana Putra",
    briefing: [
      "Sumpah diambil di Istana pada pagi Selasa. Menjelang petang Selasa, konvoi membawa anda melalui boulevard Putrajaya yang lengang ke sebuah pejabat yang berbau permaidani baharu dan kuasa lama. Perjanjian gabungan kerajaan perpaduan berusia dua hari dan sudah mula berkecai di pinggirnya.",
      "Di atas meja: ucapan Titah Diraja untuk draf, kabinet yang belum lengkap, dan sebuah negara yang tidak memenangkan sesiapa. Gabungan anda memegang 140 daripada 222 kerusi Dewan Rakyat, dirapatkan oleh kekayaan Sarawak, harapan Sabah, dan kenangan tentang apa yang berlaku apabila kerajaan perpaduan runtuh.",
      "Sarah Tan, Setiausaha Peribadi Utama anda, telah mengatur taklimat pertama. Negara akan mendengar anda malam ini. Apa yang didengar pertama, itulah yang paling lama dipercayai.",
    ],
    dialogue: [
      {
        role: "Setiausaha Peribadi Utama",
        text: "YB, janji manis itu palsu dan jadual lebih teruk lagi. Tiga penyiar mahukan ucapan sulung anda, GPS mahukan panggilan hormat sebelum Titah Diraja, dan Perbendaharaan sudah menghantar seseorang berdiri di depan pintu anda dengan sefail. Tambahan pula: pendahulu anda meninggalkan laci berkunci. Saya sedang menyuruhnya dibuka.",
      },
      {
        role: "Menteri Kewangan",
        text: "Perdana Menteri. Saya tidak akan menanam berita utama: bil subsidi memakan kita hidup-hidup dan setiap bulan lengah menelan bilion daripada Perbendaharaan. Tetapi malam ini bukan tentang lejar. Malam ini tentang sama ada negara percaya anda tahu apa yang anda buat. Katakan sesuatu yang benar. Sisa penggal ini bergantung padanya.",
      },
    ],
    options: {
      a: {
        label: "Bicarakan perpaduan dahulu",
        detail: "Ucapan tenang tentang gabungan, kestabilan dan perintah Seri Paduka. Tenangkan pasaran dan rakan bahawa kerajaan ini tidak akan tumbang.",
        summary: "Membuka penggal dengan ucapan perpaduan untuk menenangkan pasaran dan rakan.",
        consequences: [
          {
            note: "Ucapan itu berbaur negarawan. Meja bon dengannya; kaum perfeksionis dalam gabungan anda sendiri berselorol tentang saat yang terlepas.",
            news: [
              { headline: "PM baharu pilih tangan yang tenang berbanding retorik yang menjerit" },
              { headline: "\"Tiada drama, hanya kerja\": janji pertama PM kepada rakyat" },
            ],
          },
        ],
      },
      b: {
        label: "Bicarakan pembaharuan dahulu",
        detail: "Sebut agenda yang belum selesai: kemerdekaan institusi, ketelusan perolehan, taring SPRM. Janjikan negara pembaharuan yang sentiasa dijanjikan itu.",
        summary: "Membuka penggal dengan menjanjikan pembaharuan institusi dari hari pertama.",
        consequences: [
          {
            note: "Kaum pembaharuan bersorak. Bilik perang rakan gabungan lama senyap dengan cara yang salah. Rakan Borneo bertanya, secara bertulis, apa makna pembaharuan bagi fail autonomi mereka.",
            news: [
              { headline: "\"Pembaharuan bukan slogan\": PM berikrar institusi meng atas personaliti" },
              {
                headline: "Ucapan pembaharuan dipuji, PN bertanya: \"Pembaharuan untuk siapa?\"",
                body: "Pemimpin pembangkang menggelar ucapan itu sebagai menghina mandat komuniti majoriti, dalam ucapan yang lebih panjang daripada ucapan PM.",
              },
            ],
          },
        ],
      },
      c: {
        label: "Bicarakan kos sara hidup",
        detail: "Mulakan dari meja dapur: beras, sewa, kasut sekolah. Janjikan fail pertama kerajaan ialah harga hidup.",
        summary: "Membuka penggal dengan menjanjikan kos sara hidup sebagai fail pertama kerajaan.",
        consequences: [
          {
            note: "Negara menghembus nafas lega. Perbendaharaan menghembus nafas secara berbeza: kelegaan segera bermakna defisit lebih besar kelak, dan Azlan sudah melakar memo itu.",
            news: [
              { headline: "Ikrar pertama PM: \"Harga beras masalah saya, bukan masalah kamu\"" },
              {
                headline: "Pasaran berkelip saat PM utamakan kos sara hidup",
                body: "Penganalisis bertanya adakah naluri pertama kerajaan baharu ialah disiplin fiskal atau kebaikan fiskal. Mereka menjangka kebaikan.",
              },
            ],
          },
        ],
      },
      d: {
        label: "Bicarakan keselamatan dan ketertiban",
        detail: "Ucapan sulung yang lebih keras: sempadan, laluan laut, keselamatan jalan dan sekolah. Kedudukkan kerajaan sebagai penjaga kehidupan biasa.",
        summary: "Membuka penggal dengan ucapan keselamatan dan ketertiban.",
        consequences: [
          {
            note: "Pasukan berpakaian seragam berdiri lebih tegak. Liberal urban terkejut. Penasihat yang memantau Laut China Selatan membenarkan dirinya satu anggukan.",
            news: [
              { headline: "Ucapan sulung bertumpu pada keselamatan: \"Ketertiban juga satu perkhidmatan\"" },
              { headline: "Pemimpin Borneo tunggu PM sebut MA63. Beliau tidak menyebutnya." },
            ],
          },
        ],
      },
    },
  },

  c1_subsidy_file: {
    title: "Kos Sara Hidup yang Menekan",
    location: "Bilik Kabinet, Perdana Putra",
    briefing: [
      "Fail yang dibawa Azlan ada satu angka dibulat merah: bil subsidi. Bahan api, minyak masak, sokongan beras dan tarif elektrik bersama-sama memakan bahagian perbelanjaan persekutuan yang tiada kementerian berani sebut secara terbuka. Setiap isi rumah di Malaysia merasai aturan semasa sebagai satu-satunya halangan antara mereka dengan pasaran terbuka.",
      "Tetapi pengiraannya tidak berkompromi. Subsidi bahan api seumpama rata kebanyakannya membayar mereka yang memandu; program tersasar berisiko gagal klasik — keluarga yang layak tercicir; pelepasan cukai membocorkan hasil yang negara tidak mampu; dan rasionalisasi, kata kegemaran Perbendaharaan, ialah kata yang pasaran cintai dan pengundi dengar sebagai harga naik.",
      "Bank Negara secara sulit menandakan bahawa berbuat tiada apa juga satu keputusan: ringgit tidak gemar optimisme yang tidak boleh disahkan, dan pelabur menolak janji tanpa laluan fiskal.",
    ],
    dialogue: [
      {
        role: "Menteri Kewangan",
        text: "Perdana Menteri, ada empat pintu keluar dari bilik ini. Satu menjaga keamanan dan membeli masa depan. Satu bijak tetapi bocor. Satu jujur dan menyakitkan. Satu lagi idea saya, dan hanya itu yang menamatkan perbualan ini selamanya. Pilih politik yang anda mampu hidup dengannya. Saya boleh pastikan mana-mana satu berjaya di atas kertas.",
      },
      {
        role: "Penasihat Ekonomi Khas",
        text: "Satu amaran daripada jabatan lama saya: apa pun yang anda pilih, beritahu orang ramai apa sebenarnya. Keputusan paling buruk bukan dasar yang salah. Ia dasar yang betul tetapi tiada siapa percaya, ditemui di stesen minyak.",
      },
    ],
    options: {
      a: {
        label: "Perluas bantuan tersasar",
        detail: "Lebarkan jalur transfer tunai berasaskan pendapatan dan percepat pendaftaran. Bantuan sampar terus ke akaun isi rumah yang memerlukan.",
        summary: "Meluaskan transfer tunai tersasar untuk melindungi isi rumah berpendapatan rendah.",
        consequences: [
          {
            note: "Keluarga merasainya dalam tempoh beberapa minggu. Pendaftaran melonjak melebihi anggaran — itu berita baik dan berita buruk.",
            news: [
              { headline: "Bantuan tunai diluaskan: \"Guna untuk kasut anak-anak,\" pesan PM kepada penerima" },
              { headline: "Bantuan tersasar diperluas; Perbendaharaan akui jalannya akan kos lebih daripada anggaran awal" },
            ],
          },
          {
            description: "Pendaftaran bantuan melebihi unjuran; program diperluas kini berkos lebih daripada belanjawan.",
            news: [{ headline: "Pengambilan bantuan melebihi unjuran; soal transek kedua berpecah Kabinet" }],
          },
        ],
      },
      b: {
        label: "Kekalkan subsidi bahan api seumpama rata",
        detail: "Kekalkan harga pam di mana ia ada, untuk semua orang. Biusan tertua dalam politik Malaysia masih berkesan.",
        summary: "Mengekalkan subsidi bahan api seumpama rata supaya harga pam kekal.",
        consequences: [
          {
            note: "Harga pam kekal. Suasana terus naik. Di suatu bilik taklimat, graf defisit senyap mencuram.",
            news: [
              { headline: "Raya datang awal: harga bahan api kekal, PM tepati janji" },
              { headline: "Subsidi berterusan; ahli ekonomi sebut perkataan \"tidak mampan\" sebelas kali" },
            ],
          },
          {
            description: "Bahan api murah bocor merentas sempadan dan masuk ke margin penyeludup; ringgit dan inflasi merasainya.",
            news: [{ headline: "Arbitrase subsidi bahan api terbongkar di sempadan utara; penguatkuasa minta perlindungan politik" }],
          },
        ],
      },
      c: {
        label: "Ringankan cukai barangan asas",
        detail: "Keluarkan barangan asas daripada cukai jualan dan lebarkan pelepasan. Isyarat harga kekal jujur dan penyata hasil jadi lebih nipis.",
        summary: "Memotong cukai jualan barangan asas dan melebarkan pelepasan isi rumah.",
        consequences: [
          {
            note: "Rak kedai merasainya lebih dahulu. Kumpulan perniagaan puji kesederhanaannya. Unjuran hasil Perbendaharaan bergerak ke satu arah sahaja.",
            news: [
              { headline: "Barangan asas dikeluarkan daripada cukai jualan; peruncit serap penjimatan \"di mana boleh\"" },
              { headline: "Pelepasan cukai diumum; ahli ekonomi bertanya siapa bayar tahun depan" },
            ],
          },
          {
            description: "Kehilangan hasil daripada pengecualian cukai mula terasa lebih berat daripada model.",
            news: [{ headline: "Memo Perbendaharaan bocor: kekurangan hasil \"besar\" selepas pakej pelepasan" }],
          },
        ],
      },
      d: {
        label: "Mula rasionalisasi subsidi",
        detail: "Umumkan peta jalan bertarikh dan diterbitkan: subsidi bahan api seumpama rata bertukar kepada sokongan tersasar menjelang hujung tahun, dengan sokongan tunai dimuat lebih awal supaya golongan termiskin dilindungi sebelum harga bergerak.",
        summary: "Melancarkan peta jalan rasionalisasi subsidi bertarikh dengan perlindungan dimuat awal.",
        consequences: [
          {
            note: "Negara mendengar perkataan peta jalan dan merasa sejuk. Pasaran mendengar perkataan yang sama dan menghangat. Tiga bulan akan datang menentukan siapa yang betul.",
            news: [
              { headline: "PM terbitkan peta jalan keluar dari subsidi; ringgit kukuh atas berita itu" },
              { headline: "\"Peta jalan\" mengganggu peniaga di pasar malam: \"Peta jalan ke mana?\"" },
            ],
          },
          {
            description: "Peta jalan rasionalisasi terbukti kukuh dari segi fiskal tetapi mahal dari segi politik.",
            news: [{ headline: "Perbendaharaan isytiharkan rasionalisasi on track; ahli belakang mengisytiharkannya surat bunuh diri" }],
          },
        ],
      },
    },
  },

  c1_budget_2027: {
    title: "Belanjawan 2027",
    location: "Bilik Kabinet, Perdana Putra",
    briefing: [
      "Belanjawan 2027 mesti dibentangkan bulan ini. Pengiraan asas cukai mewariskan defisit kepada Perbendaharaan — bukan pilihannya. Setiap ringgit untuk kesihatan ialah ringgit yang tidak ke rel, dan setiap satu mata penyatuan ialah satu mata kesakitan yang akan dirasa seseorang sebelum pilihan raya akan datang.",
      "Azlan menyediakan empat rangka kerja, setiap satu dengan sasaran defisit dan satu mangsa. Rakan gabungan turut menyediakan tuntutan mereka — lebih besar dan kurang terperinci. GPS mahu kejujuran infrastruktur pantai timur; BN mahu komitmen luar bandar yang bagus untuk kamera; ahli belakang anda sendiri mahu satu cerita untuk diceritakan di surau dan kopitiam.",
      "Dewan Rakyat akan luluskan apa yang anda bentangkan. Negara akan menghukum apa yang anda bentangkan dalam kitaran berita.",
    ],
    dialogue: [
      {
        role: "Menteri Kewangan",
        text: "Empat sasaran defisit, Perdana Menteri. Pada 4.6 peratus kita membeli keselesaan dan menjual maruah ringgit. Pada 3.4 peratus kita membeli kredibiliti dan menjual kerusi ahli belakang anda. Cadangan saya ialah yang tiada siapa akan berterima kasih. Biasanya begitulah.",
      },
      {
        role: "Setiausaha Peribadi Utama",
        text: "Whip melaporkan ketua-ketua bahagian BN mahu \"sesuatu untuk dibuka\" di kawasan mereka. GPS mahu perkataan infrastrutura disebut sambil memandang ke Sabah dan Sarawak. Ahli parlimen anda sendiri mahu dilihat menjawab soal harga. Ucapan Belanjawan perlu menyebut ketiga-tiganya dalam satu nafas.",
      },
    ],
    options: {
      a: {
        label: "Belanjawan pengembangan (defisit 4.6%)",
        detail: "Dana kesihatan, pendidikan dan program luar bandar dengan kuat. Bimbang jurang itu kemudian.",
        summary: "Membentangkan Belanjawan 2027 pengembangan dengan sasaran defisit 4.6 peratus.",
        consequences: [
          {
            note: "Kementerian bersorak. Ringgit mengeluh dan meluncur beberapa sen. Perkataan selesa digunakan — dan dibenci — secara serentak.",
            news: [
              { headline: "Belanjawan 2027: perbelanjaan kesihatan dan sekolah terbesar dalam beberapa tahun" },
              { headline: "Pasaran gelar Belanjawan 2027 \"selesa\"; ringgit tidak bersetuju" },
            ],
          },
        ],
      },
      b: {
        label: "Belanjawan seimbang (defisit 3.9%)",
        detail: "Kekalkan garisan: perbelanjaan pertumbuhan sederhana, tiada silap mata baharu, lalai meluncur yang boleh dipercayai untuk agaya penarafan membulatkan dengan pen emas.",
        summary: "Membentangkan Belanjawan 2027 seimbang dengan sasaran defisit 3.9 peratus.",
        consequences: [
          {
            note: "Belanjawan membosankan — itu satu puji. Pelabur perasan. Ahli belakang perasan ketiadaan majlis perasmian.",
            news: [{ headline: "Belanjawan 2027 digelar \"membosankan secara kredibel\"; penganalisis bermaksud baik" }],
          },
          {
            description: "Bendung belanjawan seimbang dirasakan dalam barisan klinik dan senarai penyenggaraan sekolah.",
          },
        ],
      },
      c: {
        label: "Belanjawan penyatuan (defisit 3.4%)",
        detail: "Potong lemak, tangguh projek kemegahan, lindungi hanya isi rumah termiskin. Belanjawan bertanggungjawab, dengan harga populariti kerajaan.",
        summary: "Membentangkan Belanjawan 2027 penyatuan dengan sasaran defisit 3.4 peratus.",
        consequences: [
          {
            note: "Angka yang dibentangkan meraih editorial yang jarang: \"orang dewasa di dalam bilik\". Bilik tempat ahli parlimen anda duduk kurang berbaik; beberapa orang menghantar mesej kepada Sarah dalam tempoh sejam.",
            news: [
              { headline: "Belanjawan yang serius akhirnya, kata editorial yang ahli parlimen tidak akan baca kuat" },
              { headline: "Belanjawan penyatuan: \"Ketuk katil sendiri,\" gurau pasaran, bukan rakyat" },
            ],
          },
          {
            description: "Penyatuan mula berbuah: pelabur membalas dan tekanan perumahan sedikit lega.",
          },
        ],
      },
      d: {
        label: "Belanjawan pelaburan (defisit 4.3%)",
        detail: "Pinjam untuk masa depan: rel, pemecahan banjir, grid dan infrastruktur digital merentas setiap rantau, termasuk pantai timur.",
        summary: "Membentangkan Belanjawan 2027 ledakan pelaburan dengan sasaran defisit 4.3 peratus.",
        consequences: [
          {
            note: "Kontraktor bersorak di tiga zon waktu. Rakan Borneo mencatat dengan diterima bahawa peta kali ini memasukkan mereka.",
            news: [
              { headline: "Belanjawan 2027 akhirnya melukar timur ke atas peta infrastrutura" },
              { headline: "Belanjawan pelaburan mempertaruhkan projek yang kerajaan lampau tidak siapkan" },
            ],
          },
          {
            description: "Kerja infrastrutura awal mengangkat produktiviti di atas tanah.",
          },
        ],
      },
    },
  },

  c1_ma63_demand: {
    title: "Fail Borneo",
    location: "Lounge Menteri, Parlimen",
    briefing: [
      "Peter Mojuntin tidak duduk sehingga anda duduk, dan dia membawa kedua-dua kerajaan negeri Borneo bersamanya — dalam semangat jika bukan dalam jas. Fail di atas meja lebih tua enam dekad daripada kerajaan anda: Perjanjian Malaysia 1963, dan soal spesifik, diaudit, berulang kali ditangguhkan tentang geran hasil bersih 40 peratus yang terhutang kepada Sabah, bersama tuntutan selari Sarawak atas hasil petroleum.",
      "Surat Premier Lingga tiba pagi yang sama, seperti surat-surat dari Kuching: sopan, tepat, dan disusun seperti tuntutan perlembagaan. Ketua menteri Sabah menggemakannya dengan bahasa lebih tajam. Kedua-duanya sekutu kerajaan anda. Kedua-duanya memerhati sama ada kata-kata Perdana Menteri baharu ini mata wang atau kupon.",
      "Menerima tuntutan itu menelan wang sebenar setiap tahun. Menangguhkannya menelan kepercayaan — dan kepercayaan satu-satunya yang memegang sayap Borneo majoriti anda di tempatnya.",
    ],
    dialogue: [
      {
        role: "Menteri di Jabatan Perdana Menteri (Hal Ehwal Sabah)",
        text: "Perdana Menteri, saya terima kementerian ini dengan satu syarat: fail ini bergerak. Sabah telah menunggu sepanjang sebelas PM penuh kajian. Kajian bukan penyelesaian. Bangsa saya boleh mendengar beza antara geran dan ucapan salam.",
      },
      {
        role: "Premier Sarawak",
        text: "Kuching tidak perlukan urgensi anda, Perdana Menteri. Kami perlukan pengiraan anda. Terbitkan angkanya, bentangkan formulanya, dan Sarawak akan berunding seperti orang dewasa. Yang tidak akan kami buat ialah bertepuk tangan untuk satu dekad lagi jawatankuasa kerja.",
      },
    ],
    options: {
      a: {
        label: "Terima tuntutan, secara berstruktur",
        detail: "Terima geran hasil bersih 40 peratus untuk Sabah dengan jadual berperingkat yang diaudit, dan gerakkan fail hasil petroleum Sarawak secara selari. Bayar untuk kepercayaan sekarang.",
        summary: "Menerima tuntutan hasil 40 peratus Sabah dengan jadual berperingkat yang diaudit.",
        consequences: [
          {
            note: "Kota Kinabalu bergembira. Kuching mengangguk, setelah berunding jadual itu secara senyap. Perbendaharaan membuka turus baharu dan kelihatan jauh lebih tua.",
            news: [
              { headline: "Bersejarah: tuntutan 40 peratus Sabah diterima dengan jadual audit" },
              { headline: "Penyelesaian Borneo dipuji dan dihargai: apa kesan geran itu kepada defisit" },
            ],
          },
        ],
      },
      b: {
        label: "Bentangkan jawatankuasa pilihan parlimen",
        detail: "Jawatankuasa pilihan MA63 dua pihak dengan terma diterbitkan dan tarikh laporan. Perlahan, sah, dan boleh diharungi.",
        summary: "Merujuk tuntutan hasil MA63 kepada jawatankuasa pilihan dua pihak.",
        consequences: [
          {
            note: "Kerajaan yang bertanggungjawab, kekecewaan bergaya Borneo. Jawatankuasa membeli masa dan sedikit kredibiliti; ia tidak membeli rasa terima kasih.",
            news: [{ headline: "MA63 ke jawatankuasa pilihan; pemimpin Sabah \"mencatat prosesnya\"" }],
          },
          {
            description: "Jawatankuasa pilihan melaporkan; formulanya senyap memperbaiki keadilan hasil.",
            news: [{ headline: "Jawatankuasa capai formula timbang tara; kedua-dua negeri gelarnya \"permulaan\"" }],
          },
        ],
      },
      c: {
        label: "Tawarkan penyelesaian separa",
        detail: "Danakan geran pada separuh kadar tuntutan, dibingkai sebagai ansuran pertama. Separuh jambatan untuk separuh kos.",
        summary: "Menawarkan penyelesaian separa setara 20 peratus sebagai ansuran pertama.",
        consequences: [
          {
            note: "Langkah separa diukur dengan tepat. Ketua menteri Sabah menggelarnya bayaran pendahuluan; perkataan itu bukan pujian.",
            news: [{ headline: "\"Bayaran pendahuluan,\" kata Sabah, \"itulah yang anda buat sebelum berniat membayar\"" }],
          },
          {
            description: "Rakan Borneo mula sejuk; whip melaporkan GPS dan GRS menajamkan tuntutan di tempat lain.",
          },
        ],
      },
      d: {
        label: "Tolak atas alasan fiskal",
        detail: "Katakan dengan jelas bahawa persekutuan tidak mampu pada penggal ini. Jawapan yang jujur, dan yang paling mahal.",
        summary: "Menolak tuntutan hasil MA63 atas alasan fiskal.",
        consequences: [
          {
            note: "Kenyataan itu benar dan meletup pada sentuhan pertama. Mojuntin menawarkan peletakan jawatan di tempat; anda tidak menerimanya — buat masa ini.",
            news: [
              { headline: "PM tolak tuntutan 40 peratus; usul di Dewan Undangan Sabah dirancang" },
              { headline: "PM pilih lejar meng atas kesabaran Borneo" },
            ],
          },
        ],
      },
    },
  },

  c1_minimum_wage: {
    title: "Persoalan Gaji",
    location: "Bilik Kabinet, Perdana Putra",
    briefing: [
      "Gaji minimum negara berdiri di RM1,700, ditetapkan tahun lepas. Sumber Manusia berhujah ia sudah di bawah keperluan seorang dewasa di Lembah Klang, dan salah kira di Johor bersebelahan Singapura. Pemberi kerja memberi amaran bahawa perniagaan kecil, terutamanya di utara dan timur, masih pulih daripada kejutan berturut-turut.",
      "Persekutuan buruh, platform pekerja gig dan satu kohort penghantar makanan yang sangat teratur telah bersepakat pada satu tuntutan dua bahagian: naikkan paras lantai, dan bawa pekerja gig ke dalam orbit Kumpulan Wang Simpanan Pekerja. Platform, tidak mengejutkan, lebih suka frasa kerja moden yang fleksibel.",
      "Apa pun yang anda pilih menjadi jawapan kerajaan kepada soalan utama dekad ini: sama ada bekerja di Malaysia membayar satu kehidupan.",
    ],
    dialogue: [
      {
        role: "Penasihat Ekonomi Khas",
        text: "Kenaikan mendadak membeli tepukan dan menelan jam kerja: pemberi kerja memotong lebih masa dahulu, bilangan pekerja kemudian. Jalan berperingkat memberi anda kebanyakan kebaikan dengan lebih sedikit kerosakan. Bahagian KWSP untuk pekerja gig ialah pembaharuan yang benar-benar membawa masa depan.",
      },
      {
        role: "Menteri Dalam Negeri",
        text: "Dari seberang pagar saya: paras gaji turut menggerakkan corak migrasi. Apa pun pilihan kita, agensi penguatkuasaan perlukan peruntukan pemeriksaan, atau paras itu kekal di atas kertas.",
      },
    ],
    options: {
      a: {
        label: "Naikkan paras ke RM2,000",
        detail: "Lompatan tegas, seluruh negara, berkuat kuasa suku akan datang. Kesatuan bersorak; persatuan PKS tidak.",
        summary: "Menaikkan gaji minimum negara kepada RM2,000 berkuat kuasa suku hadapan.",
        consequences: [
          {
            note: "Slip gaji naik. Harga menu turut naik di sektor yang berjalan atas margin nipis.",
            news: [
              { headline: "RM2,000: PM tetapkan paras gaji lebih tinggi daripada janji" },
              { headline: "Paras gaji ke RM2,000; persekutuan PKS unjarkan \"kesakitan di utara\"" },
            ],
          },
          {
            description: "Pemberi kerja kecil memotong jam kerja; pengangguran naik sedikit apabila paras gaji mula berkuat kuasa.",
          },
        ],
      },
      b: {
        label: "Kekalkan RM1,700, tambah KWSP gig",
        detail: "Kekalkan paras, tetapi undang-undangkan caruman simpanan untuk pekerja gig: platform padanan, pekerja kekal fleksibel.",
        summary: "Mengekalkan paras RM1,700 dan mengundangkan padanan KWSP untuk pekerja gig.",
        consequences: [
          {
            note: "Penghantar dan pemandu mendapat akaun persaraan untuk pertama kalinya. Platform mengeluh tentang kos dan patuh. Soalan paras gaji hidup untuk satu tahun lagi.",
            news: [
              { headline: "Pekerja gig akan dapat padanan KWSP; platform \"alui kejelasan\"" },
              { headline: "Dana persaraan penghantar dipuji; paras gaji ditangguh ke tahun depan" },
            ],
          },
        ],
      },
      c: {
        label: "Berperingkat ke RM1,850 menjelang Julai",
        detail: "Jalan tengah: langkah sementara dengan tarikh semakan diterbitkan. Semua mendapat sesuatu; tiada siapa mendapat kemenangan.",
        summary: "Memeringkatkan gaji minimum ke RM1,850 dengan semakan bulan Julai.",
        consequences: [
          {
            note: "Timbang tara itu ditandatangani, diumumkan, dan serta-merta digelari timbang tara oleh kedua-dua sayap. Ia mungkin berjaya.",
            news: [{ headline: "Paras gaji naik berperingkat ke RM1,850; kedua-dua pihak mendakwa kekecewaan" }],
          },
        ],
      },
      d: {
        label: "Tangguh untuk kajian produktiviti",
        detail: "Lantik semakan penuh dan tangguh sebarang kenaikan. Komuniti perniagaan menghembus nafas. Dapur-dapur Malaysia menghirup.",
        summary: "Menangguhkan keputusan gaji dan melantik kajian produktiviti.",
        consequences: [
          {
            note: "Perkataan tangguh tidak bagus untuk kamera di sebelah bilangan kedai runcit sebuah keluarga.",
            news: [{ headline: "Keputusan gaji ditangguh \"untuk kajian\"; pekerja bertanya apa yang dipelajari dekad lampau" }],
          },
          {
            description: "Kekakuan gaji menyalakan kemarahan kos sara hidup di pekan-pekan.",
          },
        ],
      },
    },
  },

  c1_backdoor_whispers: {
    title: "Bisikan Pintu Belakang",
    location: "Pejabat Perdana Menteri, Perdana Putra",
    briefing: [
      "Ia tiba seperti biasanya benda begini tiba: gambar di majlis makan malam yang sepatutnya persendirian. Tiga ahli belakang anda, ketawa bersama ketua whip pembangkang. Kapsyernya menulis dirinya sendiri. Pengiraan di belakangnya lebih tepat daripada gambar itu.",
      "Whip mengira sebelas ahli merentas bangku kerajaan yang akan menjawab panggilan telefon daripada Perikatan Nasional malam ini. Majoriti anda 140. Pembangkang perlukan dua puluh lapan. Mereka belum ada, tetapi mereka tidak perlukannya: mereka cukup dengan sebilangan daripada anggota anda untuk mewujudkan mahkamah, dan mahkamah itu mewujudkan krisis.",
      "Sarah Tan menyiapkan tiga fail: satu untuk kesetiaan yang boleh diatur, satu untuk pertarungan yang boleh dimenangi, dan satu untuk perjanjian yang boleh dibisikkan.",
    ],
    dialogue: [
      {
        role: "Setiausaha Peribadi Utama",
        text: "Tiga jalan, PM. Fail GLC menstabilkan angka dan menodai lejar. Serangan balas mencabar mereka di atas lantai Dewan dan hidup atau mati dengan angka anda sendiri. Bisikan Borneo tidak berkos wang yang boleh dibeli, tetapi menelan segala-galanya yang integriti berpura-pura tidak berharga.",
      },
      {
        role: "Pengerusi, Barisan Nasional",
        text: "Perdana Menteri, saya telah menjaga ketua-ketua saya sepanjang empat PM. Mereka minta dua perkara: hormat dan slot. Beri saya kedua-duanya dan kerajaan ini hidup melebihi penggal anda. Tolak slot, saya tetap menjaga mereka — tetapi dengan cara seseorang menjaga kucing: sedar bahawa ia mungkin pergi.",
      },
    ],
    options: {
      a: {
        label: "Atur kesetiaan dengan jawatan GLC",
        detail: "Senyapkan penatanya ke lembaga syarikat berkaitan kerajaan dan kerusi duta. Pelincir tertua mesin ini.",
        summary: "Meletakkan yang bermuhasabah ke jawatan GLC dan duta untuk mengukuhkan majoriti.",
        consequences: [
          {
            note: "Panggilan telefon berhenti menjelang makan malam. Angka bertahan. Di suatu tempat, seorang pegawai SPRM membuka fail berlabel spekulatif — seperti mana semua fail sedemikian bermula.",
            news: [{ headline: "Seminggu senyap pelantikan lembaga; pembangkang mencium tikus bergaji" }],
          },
          {
            description: "Patronage GLC mula menarik pemeriksaan anti-rasuah.",
            news: [{ headline: "SPRM sahkan semakan awal ke atas pelantikan GLC terkini" }],
          },
        ],
      },
      b: {
        label: "Cabari mereka di atas lantai",
        detail: "Uji Dewan: jadualkan usul kerajaan sendiri dan paksa isu ini secara terbuka. Menang, bisikan mati. Kalah, ia tidak.",
        summary: "Memaksa ujian keyakinan di atas lantai Dewan Rakyat.",
        consequences: [
          {
            note: "Usul itu lulus. Anda mengira undi setuju sendiri, dua kali, dan kali kedua untuk nadi anda sendiri. Senyuman pemimpin pembangkang ialah senyuman lelaki yang memfailkan undi itu untuk kemudian hari.",
            news: [
              { headline: "Usul kerajaan lulus selesa; bisikan pintu belakang runtuh atas senarai undi" },
              { headline: "PM menang Dewan dan tidak kehilangan siapa-siapa, minggu ini" },
            ],
          },
        ],
      },
      c: {
        label: "Bisik kepada Borneo dahulu",
        detail: "Kukuhkan lantai kerajaan dari bawah: jaminan senyap kepada GPS dan GRS bahawa fail Borneo bergerak, sebelum mana-mana pertarungan dipilih.",
        summary: "Mengukuhkan majoriti melalui jaminan senyap kepada GPS dan GRS.",
        consequences: [
          {
            note: "Kuching dan Kota Kinabalu membalas dengan kehangatan rakan yang tahu kuasa mereka dan tetap menyukai anda. Ketua-ketua BN perasan siapa anda hubungi dahulu.",
            news: [{ headline: "PM hubungi Kuching dan Kota Kinabalu; kedua-duanya laporkan kerajaan \"mendengar dengan betul\"" }],
          },
        ],
      },
      d: {
        label: "Tandatangani pakta perpaduan awam",
        detail: "Paksa setiap pemimpin gabungan ke satu pentas untuk menandatangani pakta pemerintahan dengan terma tetap. Ketelusan sebagai perisai.",
        summary: "Menandatangani pakta perpaduan gabungan secara awam dengan terma tetap.",
        consequences: [
          {
            note: "Majlis menandatangani itu bagus untuk gambar. Terma pakta itu nyata, menjadikan rundingan masa depan lebih sukar dan pengkhianatan lebih kelihatan. Itulah tujuannya.",
            news: [{ headline: "Pakta perpaduan ditandatangani secara awam; \"kini kita boleh lihat siapa memecahkannya,\" kata penganalisis" }],
          },
          {
            description: "Pembangkang mula berkempen menentang terma pakta itu.",
          },
        ],
      },
    },
  },

  c1_maritime_incident: {
    title: "Kapal-Kapal Kelabu",
    location: "Bilik Majlis Keselamatan Negara, Putrajaya",
    briefing: [
      "Pada jam 0507, sebuah kapal pengawal pantas kuasa besar jiran mengiringi flotilla tinjauan ke zon eksklusif ekonomi Malaysia di luar pantai timur, tujuh puluh batu nautika di dalam garisan. Kapal Agensi Penguatkuasaan Maritim membayangi mereka pada jarak maksimum yang sah. Tiada siapa menembak apa-apa kecuali kamera.",
      "Insiden itu menepati corak: taktik salami, setiap hirisan boleh dinafikan secara berasingan. Pasukan Dato' Faridah menilai tiga balasan bertaring sebenar: nota bantahan rasmi, laluan diplomatik senyap, kenyataan ASEAN-dahulukan, atau kenaikan tahap kehadiran maritim anda sendiri yang ketara.",
      "Menteri Luar mengingatkan bahawa Malaysia tidak memengerusikan apa-apa tahun ini dan terpaksa meminjam pentas orang lain. Filipina memegang pengerusi ASEAN 2026; Manila tidak berhutang apa-apa kepada anda tetapi memahami corak itu lebih baik daripada sesiapa.",
    ],
    dialogue: [
      {
        role: "Penasihat Keselamatan Negara",
        text: "Corak itu lebih penting daripada insiden. Setiap hirisan yang tidak dijawab menjadi norm baharu. Nasihat saya ialah konsistensi meng atas drama, tetapi saya dibayar untuk berfikir dalam dekad.",
      },
      {
        role: "Menteri Luar Negeri",
        text: "Beijing akan membaca nada kita dalam tempoh sejam, begitu juga Washington. Nota bantahan ialah mesej kepada tiga ibu negara serentak. Diplomasi senyap melindungi perdagangan; diplomasi kuat melindungi wilayah. Jawapan jujurnya kita perlukan kedua-duanya akhirnya. Anda pilih yang mana dahulu.",
      },
    ],
    options: {
      a: {
        label: "Nota bantahan rasmi",
        detail: "Keluarkan bantahan diplomatik rasmi merujuk UNCLOS, dan buat ia terbuka. Prinsip, direkodkan.",
        summary: "Mengeluarkan nota bantahan UNCLOS secara awam atas pencerobohan ZEE.",
        consequences: [
          {
            note: "Nota didaftarkan dan diterbitkan. Flotilla tinjauan beredar dua hari kemudian — sama ada hormat atau jadual.",
            news: [
              { headline: "Putrajaya daftar bantahan rasmi atas insiden tinjauan ZEE" },
              { headline: "PM berdiri di laut: \"Perairan kita bukan tapak tinjauan\"" },
            ],
          },
        ],
      },
      b: {
        label: "Diplomasi senyap",
        detail: "Bangkitkan melalui saluran belakang yang sedia ada dan kekalkan kenyataan awam yang hambar. Lindungi hubungan dagang; serap kemarahan kementerian dalam negeri.",
        summary: "Menangani pencerobohan melalui diplomasi saluran belakang yang senyap.",
        consequences: [
          {
            note: "Flotilla beredar mengikut jadual dan tiada apa yang direkodkan sejarah. Pembangkang menyebutnya untuk anda — dengan kuat.",
            news: [{ headline: "Kerajaan berkait mulut tentang insiden ZEE; pembangkang gelarnya bahu mengangkat" }],
          },
        ],
      },
      c: {
        label: "Dorong kenyataan ASEAN",
        detail: "Bawa Manila dan Jakarta ke arah kenyataan bersama ASEAN tentang aktiviti tinjauan maritim. Lebih lambat, tetapi ia membangun tabiat rantau.",
        summary: "Memastikan kenyataan bersama ASEAN tentang aktiviti tinjauan maritim.",
        consequences: [
          {
            note: "Manila memberi lebih daripada jangkaan; Jakarta menambah beratnya. Kenyataan itu hambar dan bersejarah pada masa yang sama.",
            news: [{ headline: "ASEAN keluarkan kenyataan bersama yang jarang tentang kapal tinjauan; Putrajaya diberi kredit" }],
          },
          {
            description: "Mekanisme perundingan maritim ASEAN yang anda semaikan bermesyuarat buat pertama kali.",
          },
        ],
      },
      d: {
        label: "Danakan pembangunan pengawal pantas",
        detail: "Umumkan kapal luar pantai baharu dan pesawat pengawasan untuk Agensi Penguatkuasaan Maritim. Kehadiran sebagai dasar.",
        summary: "Mengumumkan pembangunan pengawal pantas berperuntukan untuk kehadiran ZEE.",
        consequences: [
          {
            note: "Kapal mengambil masa bertahun-tahun; pengumuman hanya satu sidang media. Jiran dan rakan serentak menyesuaikan anggaran mereka tentang anda.",
            news: [{ headline: "Kapal ronda luar pantai baharu diumumkan; pembina kapal tiga negara menghubungi dalam tempoh seminggu" }],
          },
        ],
      },
    },
  },

  c1_monsoon_floods: {
    title: "Monsun Timur Laut",
    location: "Bilik Operasi Krisis, Putrajaya",
    briefing: [
      "Monsun tiba mengikut jadual — satu-satunya yang mengikut jadual. Dalam tujuh puluh dua jam, sungai-sungai Kelantan keluar dari teluknya dan tanah rendah Terengganu banjir untuk kali keempat dalam satu dekad. Empat puluh satu ribu orang berada di pusat pemindahan menjelang Jumaat. Angkanya terus meningkat sepanjang hujung minggu.",
      "Meteorolog telah memberi amaran, pelan induk saliran wujud, dan semakan laporan mendapati belanjawan penyenggaraan kurang dana tiga tahun berturut-turut. Setiap kerajaan mewarisi fail yang sama. Kerajaan anda turut mewarisi hujan itu.",
      "Mesin pertahanan awam Norliza sedang berfungsi. Soalan di atas meja anda ialah apa yang dibeli oleh tindakan politik: kelajuan, pembaikan, menyalahkan, atau daya tahan.",
    ],
    dialogue: [
      {
        role: "Menteri Dalam Negeri",
        text: "Pusat pemindahan penuh tetapi terkawal. Mekanisme bantuan sedia. Yang saya perlukan daripada anda ialah keputusan tentang gelombang kedua: tunai sekarang, pembinaan semula kemudian, atau audit yang ditakuti negeri-negeri. Ketiga-tiganya boleh dipertahankan. Melakukan ketiga-tiganya bulan ini tidak.",
      },
      {
        role: "Penasihat Ekonomi Khas",
        text: "Pilihan pembinaan semula ialah wang sebenar dengan pulangan sebenar. Bantuan membeli minggu ini. Audit membeli integriti. Daya tahan membeli dekad ini. Pilih ufuk yang anda mahu dikenangi.",
      },
    ],
    options: {
      a: {
        label: "Tunai dan bantuan segera",
        detail: "Muat awal bantuan tunai kepada isi rumah terjejas dan elaun banjir kepada anggota bertugas. Kelajuan di atas segalanya.",
        summary: "Memuatkan awal bantuan tunai kepada isi rumah terjejas banjir dan anggota bertugas.",
        consequences: [
          {
            note: "Bantuan sampar ketika air masih tinggi. Akhbar timur mencetak gambar sampul sebenar, bukan rekaan.",
            news: [
              { headline: "Tunai di tangan menjelang Isnin: arahan banjir PM memotong birokrasi" },
              { headline: "Ketika semenanjung banjir, Borneo memerhatikan bagaimana bentuk bantuan" },
            ],
          },
        ],
      },
      b: {
        label: "Bina semula dengan betul, sekali",
        detail: "Komitmen dana pembinaan semula untuk saliran, takungan dan jalan dinaikkan, dilaksanakan mengikut jadual diterbitkan.",
        summary: "Mengkomitmenkan dana pembinaan semula untuk saliran dan infrastrutura daya tahan banjir.",
        consequences: [
          {
            note: "Komitmen itu yang pertama seumpamanya dengan tarikh dilampirkan. Ia tidak menolong sesiapa bulan ini — itu kelemahan jujurnya dan kekuatan sebenarnya.",
            news: [{ headline: "Dana pembinaan semula diterbitkan dengan tarikh; jurutera gembira secara berhati-hati" }],
          },
          {
            description: "Kerja pembinaan semula awal bertahan di daerah paling terjejas.",
          },
        ],
      },
      c: {
        label: "Audit keabaikan saliran",
        detail: "Arahan audit awam atas kegagalan penyenggaraan negeri dan persekutuan. Akauntabiliti sekarang; keselesaan kemudian.",
        summary: "Mengarahkan audit awam atas kegagalan penyenggaraan banjir merentas aras kerajaan.",
        consequences: [
          {
            note: "Audit menemukan apa yang semua orang tahu, secara bertulis, dengan tandatangan. Negeri pembangkang menggelarnya perburuan penyihir; sekutu menggelarnya tertunggak; keluarga yang dilanda banjir menggelarnya Selasa.",
            news: [
              { headline: "Audit banjir menamakan tiga tahun berturut-turut penyenggaraan ditangguhkan" },
              { headline: "Audit dahulu, bantuan masih tersangkut borang: mangsa banjir tidak kagum" },
            ],
          },
        ],
      },
      d: {
        label: "Danakan pelan daya tahan",
        detail: "Program daya tahan banjir sepuluh tahun: takungan, peramalan cuaca, dan penempatan semula dari dataran banjir paling teruk, dana setiap tahun tanpa mengira politik.",
        summary: "Melancarkan program daya tahan banjir nasional berdana sepuluh tahun.",
        consequences: [
          {
            note: "Pelan itu paling kurang dramatik dan paling mahal, diumumkan kepada negara yang sedang menonton banjir semasa, bukan banjir akan datang.",
            news: [{ headline: "Pelan banjir sepuluh tahun dibentangkan; tepukan daripada perancang, selamba daripada yang basah" }],
          },
          {
            description: "Peningkatan peramalan program daya tahan memotong masa tindak balas monsun.",
          },
        ],
      },
    },
  },

  c1_hundred_days: {
    title: "Seratus Hari",
    location: "Pejabat Perdana Menteri, Perdana Putra",
    briefing: [
      "Seratus hari. Frasa itu diimport; pemeriksaannya tidak. Seratus hari pertama anda menghasilkan satu Belanjawan, satu keputusan subsidi, satu penyelesaian atau kebuntuan Borneo, satu jawapan gaji, satu kejutan pintu belakang yang terselamat, satu monsun dan satu bulan kapal kelabu di luar pantai. Angka mengatakan anda masih berdiri; suasana mengatakan negara masih menimbang.",
      "Sarah Tan telah melakar ucapan itu. Dr. Rao melampirkan angkanya. Pemimpin gabungan masing-masing meminta satu perenggan kredit. Pembangkang telah pra-melakar bantahan mereka — petanda keyakinan mereka terhadap kegagalan anda lebih tinggi daripada keyakinan anda sendiri.",
      "Ucapan ini menutup Bab Satu. Apa yang anda janjikan di sini menjadi ukuran anda dinilai sepanjang sisa penggal.",
    ],
    dialogue: [
      {
        role: "Setiausaha Peribadi Utama",
        text: "Ucapan itu ditulis tiga cara: rekod, permintaan maaf, dan perubahan arah. Pilih satu dengan jujur, PM. Negara boleh mencium bezanya, begitu juga gabungan anda.",
      },
      {
        role: "Pemimpin Pembangkang",
        text: "Seratus hari, Perdana Menteri. Rakan-rakan saya mengira janji-janji anda. Saya mengira tandatangan anda atas tuntutan orang lain. Malam ini negara menyemak nota dengan kami berdua.",
      },
    ],
    options: {
      a: {
        label: "Mainkan rekod dengan jujur",
        detail: "Laporkan dengan jujur: apa yang dilakukan, apa yang tersangkut, apa kosnya. Layani awam sebagai orang dewasa.",
        summary: "Menyampaikan laporan seratus hari yang jujur tentang capaian dan kekurangan.",
        consequences: [
          {
            note: "Kejujuran itu sampar. Tidak ke semua tempat, tidak kepada semua orang, tetapi ke tempat yang penting: tengah yang boleh dipujuk.",
            news: [{ headline: "Ucapan seratus hari tanpa pernis: \"Inilah yang tidak kita lakukan\"" }],
          },
        ],
      },
      b: {
        label: "Raih kemenangan",
        detail: "Mulakan dengan kejayaan: penyelesaian yang ditandatangani, bantuan yang sampar, kapal yang akan datang. Momentum ialah mata wang.",
        summary: "Menyampaikan ucapan seratus hari penuh kemenangan.",
        consequences: [
          {
            note: "Rally itu terasa baik dan kelihatan lebih baik dalam gambar. Setiap ketinggalan kini menjadi sumbangan kepada iklan seterusnya pembangkang.",
            news: [
              { headline: "PM raikan 100 hari: \"Mandat ini berfungsi\"" },
              { headline: "Ucapan kemenangan tinggalkan tiga fail; meja fakta pembangkang tidak" },
            ],
          },
        ],
      },
      c: {
        label: "Tukar ke ufuk seterusnya",
        detail: "Akui ke tersasar dan tukar arah dengan kuat: namakan agenda seratus hari kedua sebelum sesiapa menamakannya untuk anda.",
        summary: "Menukar ucapan seratus hari kepada agenda ke hadapan.",
        consequences: [
          {
            note: "Penukaran itu menetapkan semula soalan daripada apa yang anda lakukan kepada apa yang akan anda lakukan — tanah yang anda pilih sendiri.",
            news: [{ headline: "PM melakar seratus hari kedua: dua rang undang-undang pembaharuan dan jadual masa Borneo" }],
          },
        ],
      },
      d: {
        label: "Susun semula kabinet",
        detail: "Gunakan saat ini untuk menyegarkan kabinet: naikkan yang berprestasi, persarahkan yang menjadi pemberat, dan ingatkan semua orang kerajaan ini kerajaan siapa.",
        summary: "Mengumumkan penstrukturan semula kabinet di tanda seratus hari.",
        consequences: [
          {
            note: "Penstrukturan itu jadi muka depan dua hari. Menteri yang naik setia selama sebulan; yang tertinggal bersabar lebih singkat.",
            news: [
              { headline: "Penyegaran kabinet di 100 hari: lapan naik, tiga diucapkan terima kasih" },
              { headline: "Penstrukturan mengganjar prestasi, kata PM, sementara yang digugurkan mengira sampai sepuluh" },
            ],
          },
        ],
      },
    },
  },
};
