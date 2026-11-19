/**
 * Terjemahan Bahasa Melayu: watak, gabungan, negeri, suara nasihat,
 * dan tajuk ekonomi bulanan.
 */

export const CHARACTER_MS: Record<string, { role: string; bio: string; loyaltyHint: string }> = {
  chiefOfStaff: {
    role: "Setiausaha Peribadi Utama",
    bio: "Penjaga pintu anda di Pejabat Perdana Menteri. Dua puluh tahun merentas perkhidmatan awam dan dua kempen yang kalah mengajarnya bahawa bangunan ini memakan pemimpin yang melangkah langkah.",
    loyaltyHint: "Melindungi jadual dan belakang anda. Beritahu dia kebenaran dahulu.",
  },
  finance: {
    role: "Menteri Kewangan",
    bio: "Anak Perbendaharaan yang dinaikkan menjadi Exchequer. Menganggap defisit sebagai musuh peribadi dan setiap subsidi sebagai pinjaman daripada masa depan. Tidak berpihak kepada faksi mana-mana — itulah yang menjadikannya berguna dan tidak dipercayai.",
    loyaltyHint: "Setia kepada lejar. Dia akan mengikut keputusan yang dia bantah, atas rekod.",
  },
  economicAdviser: {
    role: "Penasihat Ekonomi Khas",
    bio: "Bekas ahli ekonomi Bank Negara yang meletakkan jawatan kerana enggan melunakkan unjuran inflasi. Percaya awam mampu menelan kebenaran yang sukar jika anda berhenti menghinakan mereka.",
    loyaltyHint: "Bercakap lurus. Lebih menghargai didengar daripada disetujui.",
  },
  nationalSecurity: {
    role: "Penasihat Keselamatan Negara",
    bio: "Naik melalui angkatan tentera dan Majlis Keselamatan Negara. Memantau Laut China Selatan, pinggiran Sulu dan sempadan seperti sistem cuaca.",
    loyaltyHint: "Apolitikal secara keyakinan. Kepercayaannya hilang pantas jika keselamatan dijadikan alat parti.",
  },
  foreign: {
    role: "Menteri Luar Negeri",
    bio: "Bekas pesuruhjaya tinggi yang membaca ASEAN seperti grup chat keluarga: bising, rapuh, tidak ternilai. Berhujah untuk keseimbangan antara Washington dan Beijing secara naluri dan secara pengiraan.",
    loyaltyHint: "Setia kepada doktrin keseimbangan. Beri dia kejelasan dan dia memberi anda leverage.",
  },
  home: {
    role: "Menteri Dalam Negeri",
    bio: "Mengurus polis, imigresen dan pertahanan awam dengan senarai semak dan pandangan tajam. Jabatannya banjir dahulu pada setiap musim dan menjawab dahulu pada setiap siasatan.",
    loyaltyHint: "Menghargai kejelasan operasi meng atas pesangan politik.",
  },
  borneoMinister: {
    role: "Menteri di Jabatan Perdana Menteri (Hal Ehwal Sabah)",
    bio: "Ahli parlimen GRS dari Kota Kinabalu yang menerima jawatan persekutuan dengan satu syarat: fail MA63 benar-benar bergerak. Dia membaca senyap Putrajaya sebagai dasar.",
    loyaltyHint: "Sistem amaran awal anda untuk kedua-dua negeri Borneo. Mengabaikannya mahal.",
  },
  gpsPremier: {
    role: "Premier Sarawak",
    bio: "Peguam, perunding, dan lelaki paling sabar di Malaysia. Dia tidak menjerit di khalayak; dia menghantar surat yang menjadi hujah perlembagaan.",
    loyaltyHint: "Hormat membeli fleksibiliti; lengah membeli litigasi.",
  },
  bnChair: {
    role: "Pengerusi, Barisan Nasional",
    bio: "Penjaga mesin BN dan gudang janji-janjinya. Kerajaan perpaduan anda hidup selagi ketua-ketua bahagiannya kekal kenyang dan tidak dipermalukan.",
    loyaltyHint: "Setia secara transaksional. Dia mengira janji; anda patut mengira juga.",
  },
  oppositionLeader: {
    role: "Pemimpin Pembangkang",
    bio: "Pusat graviti PN yang berdisiplin. Memikat ahli belakang anda yang gelisah di atas nasi dagang dan memuatkan klipnya menjelang petang. Mengkaji setiap kompromi anda mencari perkataan pengkhianatan.",
    loyaltyHint: "Penantang, bukan raksasa. Berurus dengan jujur dan dia boleh diharungi.",
  },
};

export const COALITION_MS: Record<string, { stance: string; note: string }> = {
  ph: {
    stance: "Pembaharuan tengah-kiri. Pembaharuan institusi, bantuan tersasar, pangkalan bandar berbilang bangsa.",
    note: "Gabungan anda sendiri. Memegang Putrajaya menerusi kerajaan perpaduan, tetapi agenda pembaharuannya sentiasa berlanggar dengan pengiraan gabungan.",
  },
  bn: {
    stance: "Konservatif arus utama. Sokongan Melayu luar bandar, rangkaian patronase, perundingan pragmatik.",
    note: "Rakan teratas dalam kerajaan perpaduan. Akar umbinya membenci pembaharuan yang menyentuh perlindungan lama.",
  },
  gps: {
    stance: "Sarawak dahulukan. Autonomi, hak petroleum, dan leverage ke atas mana-mana kerajaan persekutuan.",
    note: "Penentu di Kuala Lumpur. Mereka mengurus Sarawak tanpa henti dan menjangka janji MA63 dihormati.",
  },
  grs: {
    stance: "Lokalisme Sabah. Kongsi hasil, kuasa imigresen, keabaikan persekutuan.",
    note: "Gabungan tempatan Sabah. Meruap, popular di negeri, dan sensitif kepada sebarang penghinaan daripada Putrajaya.",
  },
  warisan: {
    stance: "Regionalisme Sabah, sedia berurus dengan mana-mana blok.",
    note: "Kecil tetapi bising. Sokongan mereka boleh dirunding, dan kedua-dua pihak tahu itu.",
  },
  pn: {
    stance: "Nasionalis Melayu-Islam dan populis fiskal. Pembangkang keluhan luar bandar dan letih pembaharuan.",
    note: "Blok pembangkang terbesar dalam beberapa dekad. Ia memikat ahli belakang anda secara terbuka dan menangi pekan bila harga naik.",
  },
  others: {
    stance: "Ahli bebas dan lain-lain, setiap satu dengan harga persendirian.",
    note: "Undi terapung dalam Dewan bergaya tergantung. Awasi mereka apabila majoriti mengecil.",
  },
};

export const STATE_MS: Record<string, string> = {
  selangor:
    "Negeri terkaya dan enjin Lembah Klang. Tarif air, konsesi lebuhraya dan kos sara hidup bandar mendominasi politiknya.",
  johor: "Gerbang selatan. Jualan air ke Singapura, pautan RTS dan Zon Ekonomi Khas Johor-Singapura mentakrifkan hubungannya dengan Putrajaya.",
  penang: "Kuasa pembuatan elektronik. Mitigasi banjir dan projek pengangkutan memakan belanjawan negeri dan kesabarannya.",
  perak: "Negeri ayun yang telah berpusing. Bandar-bandar tua, kontroversi bauksit dan migrasi keluar membentuk keluhannya.",
  kelantan:
    "Tepat PN. Decad-dekad masalah bekalan air dan pertikaian royalti minyak yang dikenangi menjadikan kebencian terhadap kerajaan persekutuan sentiasa di permukaan.",
  terengganu:
    "Royalti petroleum dan banjir monsun mendominasi. Pantai timur merasa laut dua kali setahun.",
  pahang: "Negeri terbesar semenanjung. Letusan tanah tinggi, pencemaran perlombongan dan lembangan sungai mudah banjir menguji institusinya.",
  kedah: "Jelapang padi dengan siku yang tajam. Pimpinannya menekan tuntutan atas air dan sumber galian terhadap kawalan persekutuan.",
  perlis: "Negeri terkecil, bersebelahan sempadan Thai. Perdagangan rentas sempadan dan laluan penyeludupan ialah realiti hariannya.",
  "negeri-sembilan":
    "Tradisi pusaka tanah adat masih hidup di sini. Sambungan rel ke arah ibu negara menggerakkan politik pertumbuhannya.",
  melaka: "Kecil, bersejarah dan pantai. Pengembangan pelabuhan dan pelancongan warisan membawa ekonominya.",
  sabah: "MA63 dokumen hidup di sini, bukan sejarah. Tuntutan geran hasil 40 peratus, bekalan kuasa terputus dan imigresen tidak teratur mentakrifkan tuntutannya.",
  sarawak:
    "Negeri paling tegas dalam persekutuan. Ia mengejar kawalan gas sendiri dan penyerahan peraturan dengan sabar yang tersusun.",
  "kuala-lumpur":
    "Wilayah persekutuan di bawah jagaan Parlimen. Dewan Bandaraya berjawab kepada kabinet persekutuan, bukan Dewan Undangan Negeri.",
  putrajaya: "Ibu negara pentadbiran. Penduduknya kebanyakannya kerajaan itu sendiri.",
  labuan: "Pulau pusat kewangan luar pesisir di luar pantai Sabah, diurus persekutuan, ekonominya terikat dengan Borneo.",
};

/** Suara nasihat dalam bahasa Melayu; subjek ialah tajuk fail dalam barisan. */
export const COUNSEL_MS: Record<string, (subject: string) => string> = {
  chiefOfStaff: (s) =>
    `Bangunan ini sudah mula membincangkan ${s}. Kendalikan secara sengaja: ke arah mana anda condong, sebut sekali, dengan jelas, kepada orang-orang anda sendiri dahulu.`,
  finance: (s) =>
    `Perbendaharaan telah mengira ${s}. Setiap ringgit yang dijanjikan atas fail itu ialah ringgit yang diambil daripada fail lain. Putuskan apa yang hilang, bukan hanya apa yang menang.`,
  economicAdviser: (s) =>
    `Tentang ${s}, datanya tidak romantik. Lindungi pertumbuhan, jaga kuasa beli, dan jelaskan imbangannya kepada awam sebelum pembangkang menjelaskannya untuk anda.`,
  nationalSecurity: (s) =>
    `Keselamatan membaca ${s} sebagai boleh diurus tetapi bising. Kecekapan senyap menangi di sini; satu kegagalan yang kelihatan akan bergerak lebih jauh daripada sepuluh kejayaan yang senyap.`,
  foreign: (s) =>
    `${s} akan dibaca di Beijing, Washington dan Jakarta dalam tempoh sejam. Konsistensi lebih penting daripada kebijaksanaan; rakan mengganjar kebolehjangkaan.`,
  home: (s) =>
    `${s} menyentuh mesin akar umbi. Polis dan pertahanan awam perlu arahan jelas dan satu suara. Jauhkan politik daripada laluan mereka.`,
};

/** Tajuk ekonomi bulanan, dipadankan dengan tajuk EN dalam simulasi. */
export const ECONOMY_MS: Array<{ en: string; headline: string; body: string }> = [
  {
    en: "Economy accelerates past 5% as exports hum",
    headline: "Ekonomi memecut melebihi 5% ketika eksport berdenyut lancar",
    body: "Statistik suku tahunan mengatasi jangkaan; kilang-kilang elektronik menjadualkan syif tambahan dan ringgit mengukuh.",
  },
  {
    en: "Growth cools below four percent, ringgit under watch",
    headline: "Pertumbuhan sejuk di bawah empat peratus, ringgit dalam pantauan",
    body: "Penghantaran melembut dan pasaran menimbang sama ada ini lengah atau arah.",
  },
  {
    en: "Prices climb faster than wages, households squeeze",
    headline: "Harga mendaki lebih pantas daripada gaji, isi rumah mencekik",
    body: "Barangan dapur dan yuran sekolah menagih perhatian yang belanjawan tidak beri.",
  },
  {
    en: "Steady month for the economy, say statisticians",
    headline: "Bulan yang stabil bagi ekonomi, kata statistikawan",
    body: "Tiada lonjakan, tiada jurang; angka-angka bergerak seperti yang dijangka, yang sendirinya satu berita.",
  },
];
