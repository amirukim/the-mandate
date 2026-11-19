import type { EventMs } from "./ms-events-ch1";

/**
 * Terjemahan Bahasa Melayu: peristiwa berulang (bujet tahunan, monsun,
 * pilihan raya kecil, fail perlahan).
 */
export const EVENTS_RECURRING_MS: Record<string, EventMs> = {
  r_annual_budget: {
    title: "Belanjawan Kembali Menagih",
    location: "Kementerian Kewangan, Putrajaya",
    briefing: [
      "Oktober lagi. Helaian hela Perbendaharaan telah mencerna janji tahun lepas dan kini menagih pengiraan tahun ini. Lalai defisit, kehendak gabungan dan kesabaran negara tiba dalam satu fail.",
      "Azlan membentangkan empat pintu yang sama dengan angka berbeza: kembang, seimbang, menyatu, atau membina. Ringgit mendengar sebelum anda bersuara.",
    ],
    dialogue: [
      {
        role: "Menteri Kewangan",
        text: "Perdana Menteri, lalai ini membengkok atau patah tahun ini. Setiap kementerian sudah belajar meminta pada bulan Oktober, sebagaimana petani meminta sebelum monsun. Pilih cuaca kita.",
      },
    ],
    options: {
      a: {
        label: "Kembangkan perbelanjaan",
        detail: "Belanjawan pengembangan lagi: keselesaan sekarang, kredibiliti kemudian.",
        summary: "Membentangkan belanjawan pengembangan.",
        consequences: [
          {
            note: "Perbelanjaan naik merentas kesihatan, pendidikan dan program luar bandar. Ringgit membayar harganya secara senyap.",
            news: [{ headline: "Belanjawan berbelanja besar dibentangkan; kementerian bersorak secara sopan" }],
          },
        ],
      },
      b: {
        label: "Kekalkan keseimbangan",
        detail: "Belanjawan tengah yang berdisiplin. Bukan kegemaran sesiapa, penyelamat semua orang.",
        summary: "Membentangkan belanjawan seimbang.",
        consequences: [
          {
            note: "Lalai itu bertahan. Pelabur membulatnya dengan pen emas; ahli parlimen anda menggariskan projek yang hilang.",
            news: [{ headline: "Belanjawan kekal garisan; agaya penarafan mengangguk tanpa senyuman" }],
          },
        ],
      },
      c: {
        label: "Menyatu dengan lebih keras",
        detail: "Tekan defisit turut satu not lagi. Invois populariti tiba bersama invois fiskal.",
        summary: "Membentangkan belanjawan penyatuan keras.",
        consequences: [
          {
            note: "Kredibiliti naik, keselesaan turun. Editorial kagum; kopitiam tidak.",
            news: [{ headline: "Belanjawan penjimatan dibentangkan: \"Rakyat diminta tahan nafas setahun lagi\"" }],
          },
        ],
      },
      d: {
        label: "Melabur di rantau",
        detail: "Pinjam untuk infrastrutura, ditimbangkan ke timur dan Borneo.",
        summary: "Membentangkan belanjawan rantau berat ke pelaburan.",
        consequences: [
          {
            note: "Kren di tiga ufuk. Pemimpin Borneo menggelarnya kemajuan; Perbendaharaan menggelarnya pengiraan yang ditangguhkan.",
            news: [{ headline: "Belanjawan rantau mendarat di timur tambak dahulu" }],
          },
        ],
      },
    },
  },

  r_monsoon_season: {
    title: "Pemantauan Monsun",
    location: "Bilik Operasi Krisis, Putrajaya",
    briefing: [
      "Monsun timur laut mula menghala masuk. Meja peramalan melaporkan aras air di lembah Kelantan melebihi purata sepuluh tahun, dan pusat bantuan sedang distok menjelang amaran pertama.",
      "Mesin itu berfungsi, di atas kertas. Sama ada ia berfungsi sebelum kamera datang bergantung pada apa yang anda arahkan sekarang.",
    ],
    dialogue: [
      {
        role: "Menteri Dalam Negeri",
        text: "Agensi saya sudah di kedudukan awal. Yang saya perlukan ialah tandatangan anda atas satu daripada tiga postur: tunai pencegahan, peralatan pra-kedudukan, atau arahan bersama persekutuan-negeri dengan negeri pembangkang. Arahan yang paling sukar secara politik. Ia juga yang menyelamatkan paling banyak rumah.",
      },
    ],
    options: {
      a: {
        label: "Tunai pencegahan untuk negeri lintah banjir",
        detail: "Serahkan bantuan sedia ada sebelum air naik.",
        summary: "Menyalurkan tunai banjir pencegahan ke kawasan lintah banjir.",
        consequences: [
          {
            note: "Keluarga menbankan bantuan sebelum pemindahan pertama. Negeri timur mengingati.",
            news: [{ headline: "Bantuan sedia dilepaskan sebelum hujan, satu yang pertama" }],
          },
        ],
      },
      b: {
        label: "Pra-kedudukan peralatan dan anggota",
        detail: "Dana penempatan awal bot, pam dan anggota ke kawasan lintah banjir.",
        summary: "Pra-kedudukan peralatan banjir dan anggota.",
        consequences: [
          {
            note: "Masa tindak balas tahun ini terukur lebih pantas. Kurang bahan untuk gambar — memang itulah tujuannya.",
            news: [{ headline: "Agensi tergerak sebelum monsun; masa tindak balas dipotong" }],
          },
        ],
      },
      c: {
        label: "Arahan bersama persekutuan-negeri",
        detail: "Cadangkan arahan bersama yang memasukkan kerajaan negeri pembangkang. Politik, ditelan demi kecekapan.",
        summary: "Membentuk arahan monsun bersama persekutuan-negeri dengan negeri pembangkang.",
        consequences: [
          {
            note: "Menteri Besar pembangkang menerima — berhati-hati tetapi nyata. Kerjasama berfungsi, dan itu mengelirukan narasi semua pihak.",
            news: [{ headline: "Persekutuan dan negeri pembangkang kongsi satu arahan banjir; preseden yang senyap" }],
          },
        ],
      },
    },
  },

  r_cost_of_living_watch: {
    title: "Harga Segala-Galanya",
    location: "Bilik Kabinet, Perdana Putra",
    briefing: [
      "Fail kos sara hidup tidak pernah tutup; ia cuma tidur. Harga dapur berlari mendahului slip gaji lagi, dan soal parlimen minggu ini panjangnya satu perkataan: bila?",
      "Graf Dr. Rao menunjukkan tekanan naik merentas jalur tengah — pengundi dengan paling banyak untuk hilang dan paling sedikit kesabaran.",
    ],
    dialogue: [
      {
        role: "Penasihat Ekonomi Khas",
        text: "Tekanan kembali di atas garisan. Jika kita berbuat tiada-apa, pembangkang memiliki perkataan belanjawan. Jika kita bertindak luas, Perbendaharaan memiliki defisit. Pilih tuan anda.",
      },
    ],
    options: {
      a: {
        label: "Lebarkan bantuan tunai",
        detail: "Transek tersasar lagi untuk tengah dan bawah yang mencekik.",
        summary: "Melebarkan jalur bantuan tunai sekali lagi.",
        consequences: [
          {
            note: "Bantuan sampar. Defisit perasan.",
            news: [{ headline: "Transek bantuan baharu untuk tengah yang mencekik" }],
          },
        ],
      },
      b: {
        label: "Tekan penguatkuasaan atas profiteering",
        detail: "Serbu para pencekik: gelombang penguatkuasaan harga melampau atas barangan asas.",
        summary: "Mengarahkan gelombang penguatkuasaan profiteering atas barangan asas.",
        consequences: [
          {
            note: "Penguatkuasaan menjadikan contoh. Peniaga patuh dan mengeluh. Harga sedikit lega — jujur atau tidak.",
            news: [{ headline: "Gelombang penguatkuasaan atas barangan asas: dua puluh enam kompaun dikeluarkan" }],
          },
        ],
      },
      c: {
        label: "Kekal garisan, terangkan pelannya",
        detail: "Tiada perbelanjaan baharu. Terbitkan data dan pelan sederhana-tempoh, dan terima tamparan politik sambil berdiri.",
        summary: "Kekal perbelanjaan; menerbitkan data dan pelan kos sara hidup.",
        consequences: [
          {
            note: "Pelan itu betul dan senyap. Kelulusan turun; integriti naik. Anda memilih tuan anda.",
            news: [{ headline: "Tiada bantuan baharu; PM terbitkan angkanya dan jawab soalan-soalannya" }],
          },
        ],
      },
    },
  },

  r_by_election: {
    title: "Pilihan Raya Kecil",
    location: "Perdana Putra",
    briefing: [
      "Satu kematian dalam satu kawasan membawa soalan yang setiap kerajaan geruni: pilihan raya kecil di satu kerusi yang pembangkang tandai. Marginnya empat ratus undi. Media nasional akan layankan pertandingan tempatan sebagai referendum atas seratus hari anda, Belanjawan anda, dan watak anda.",
      "Mesin negeri mahu calon bintang. Bahagian tempatan mahu orang tempatan. Pembangkang mahu darah kerajaan anda — mengikut turutan itu.",
    ],
    dialogue: [
      {
        role: "Setiausaha Peribadi Utama",
        text: "Ketua negeri mahu anak buahnya; bahagian mahu cikgu mereka; pasukan media sosial mahu sesiapa di bawah empat puluh. Sokongan Perdana Menteri bernilai satu kitaran berita. Pilih dengan teliti kitaran yang mana.",
      },
    ],
    options: {
      a: {
        label: "Berkempen keras secara sendiri",
        detail: "Letakkan premiership itu sendiri ke atas tanah: wajah anda, rekod anda, tiga harinya.",
        summary: "Berkempen secara peribadi dalam pilihan raya kecil.",
        consequences: [
          {
            note: "Lawatan-lawatan itu menarik orang ramai dan debu. Menang atau kalah, undi itu menjadi tentang anda — yang dikehendaki pembangkang dan diperlukan parti anda.",
            news: [{ headline: "PM menyusuri pasar dan masjid; kempen kini terang-terangan referendum" }],
          },
        ],
      },
      b: {
        label: "Janjikan projek kepada kawasan",
        detail: "Komitmen satu projek persekutuan yang ketara kepada kawasan jika kerusi bertahan.",
        summary: "Menjanjikan projek persekutuan untuk kawasan pilihan raya kecil.",
        consequences: [
          {
            note: "Pengumuman itu bagus untuk gambar. Pensyarah etika menulis rencana; pengundi menulis ayun undi.",
            news: [{ headline: "Soalan projek untuk undi bergantung atas pilihan raya kecil" }],
          },
        ],
      },
      c: {
        label: "Jangan campur, biarkan mesin bekerja",
        detail: "Tiada libat urus PM. Biarkan mesin negeri berperang atas terma tempatan.",
        summary: "Menjauhkan PM daripada pilihan raya kecil.",
        consequences: [
          {
            note: "Anda kekal bersih sama ada apa pun. Kerusi dipertaruhkan atas paip dan diploma, seperti yang dipilih pilihan raya tempatan.",
            news: [{ headline: "PM jaga jarak dari pilihan raya kecil; kedua-dua kempen mendakwa ia strategi" }],
          },
        ],
      },
    },
  },

  r_ma63_review: {
    title: "MA63: Fail Perlahan",
    location: "Lounge Menteri, Parlimen",
    briefing: [
      "Fail Perjanjian Malaysia bergerak dengan kelajuan kepercayaan — bermakna perlahan, kemudian mendadak. Kuching telah membentangkan kertas hasil petroleumannya; Kota Kinabalu menggemakannya dengan jadual waktu geran 40 peratus. Kedua-dua sekutu sekali lagi bertanya, dengan kesabaran pemiutang, berapa nilai kata-kata kerajaan ini.",
      "Nota taklimat Peter Mojuntin satu baris: \"Mereka sedang melakar belanjawan 2027 sekitar jawapan anda.\"",
    ],
    dialogue: [
      {
        role: "Menteri di Jabatan Perdana Menteri (Hal Ehwal Sabah)",
        text: "Dua fail, satu suasana. Bergerak atas jadual waktu dan suasana bertahan. Tangguh dan suasana menjadi usul di Dewan Undangan Sabah, kemudian kempen, kemudian masalah.",
      },
    ],
    options: {
      a: {
        label: "Percepat jadual waktu",
        detail: "Terbitkan tarikh mengikat untuk baki item penyerahan MA63.",
        summary: "Menerbitkan tarikh penyerahan MA63 yang mengikat.",
        consequences: [
          {
            note: "Tarikh diterbitkan, tandatangan dilampirkan. Borneo berpuas hati; perkhidmatan undang-undang sibuk.",
            news: [{ headline: "Jadual waktu penyerahan kini mengikat; kedua-dua kerajaan negeri menandatangani" }],
          },
        ],
      },
      b: {
        label: "Tawarkan infrastrutura menggantikan tunai",
        detail: "Cadangkan projek modal di Borneo menggantikan transfer hasil lanjutan.",
        summary: "Menawarkan infrastrutura Borneo menggantikan transfer hasil.",
        consequences: [
          {
            note: "Ketua menteri Sabah menerima dengan keberatan yang kelihatan; Kuching mencatatnya tanpa menerima.",
            news: [{ headline: "Jalan ditawarkan menggantikan hasil; pemimpin Sabah \"akan mengira tar itu\"" }],
          },
        ],
      },
      c: {
        label: "Biarkan peguam membahaskannya",
        detail: "Rujuk tuntutan petroleum kepada peguam perlembagaan. Perlahan, boleh diterbalikkan, dan secara teknikal betul.",
        summary: "Merujuk tuntutan petroleum Borneo kepada peguam perlembagaan.",
        consequences: [
          {
            note: "Peguam akan ambil setahun untuk menghasilkan apa yang politik boleh hasilkan dalam sebulan.",
            news: [{ headline: "Tuntutan petroleum ke tangan peguam; Kuching gelaya penangguhan bergelar" }],
          },
        ],
      },
    },
  },

  r_water_crisis: {
    title: "Surat-Surat Air",
    location: "Kelantan",
    briefing: [
      "Jurutera perbandaran Kota Bharu menulis lagi: letusan paip mendahului pembaikan, dan loji rawatan berjalan atas alat ganti. Kerajaan negeri menyalahkan kurang pelaburan persekutuan sejak dekad-dekad; agensi persekutuan menyalahkan bil dan penyenggaraan negeri. Kedua-dua sejarah sebahagian benar — itu pertikaian yang paling sukar.",
      "Air bukan isu partisan untuk keluarga yang membawa baldi. Ia hanya partisan untuk orang dewasa.",
    ],
    dialogue: [
      {
        role: "Menteri Dalam Negeri",
        text: "Jika paip gagal monsun ini, gambar yang keluar ialah gambar pilihan kerajaan, bukan umur paip. Baiki secara persekutuan, danakan secara bersama, atau persekutukan secara undang-undang. Pilih perlawanan yang anda mampu menang.",
      },
    ],
    options: {
      a: {
        label: "Danakan program pembaikan persekutuan",
        detail: "Wang persekutuan, kontraktor persekutuan, kerjasama negeri. Terus dan kelihatan.",
        summary: "Menyandakan program pembaikan air persekutuan untuk Kelantan.",
        consequences: [
          {
            note: "Pembaikan bermula dalam beberapa minggu. Kerajaan Kelantan mengambil kredit; air kehilangan tekanannya.",
            news: [{ headline: "Pasukan persekutuan masuk Kelantan; paip stabil dalam tiga daerah" }],
          },
        ],
      },
      b: {
        label: "Dana bersama dengan negeri",
        detail: "Program 50-50 dengan kerajaan negeri, berkongsi kos dan kredit.",
        summary: "Membentuk program air bersama persekutuan-negeri di Kelantan.",
        consequences: [
          {
            note: "Lebih lambat, lebih murah, dan kredit terbahagi — itulah bentuk jujur persekutuan.",
            news: [{ headline: "Persekutuan dan Kelantan kongsi program air; preseden dicatat" }],
          },
        ],
      },
      c: {
        label: "Audit syarikat air negeri",
        detail: "Arahan audit awam atas operator air negeri sebelum apa-apa dana bergerak.",
        summary: "Mengarahkan audit operator air Kelantan.",
        consequences: [
          {
            note: "Audit menemukan salah urus dan kepahlawanan dalam ukuran yang sama. Wang menunggu; baldi tidak.",
            news: [{ headline: "Audit dahulu, air kemudian: pemimpin Kelantan gelar arahan itu penghinaan dengan nota kaki" }],
          },
        ],
      },
    },
  },
};
