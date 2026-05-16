import { Icon } from "../components/icons/Icons";
import Footer from "../components/Footer";
import { T } from "../constants/tokens";

export default function HomePage({ setPage }) {
  return (
    <div>

      {/* ══════ HERO ══════ */}
      <section className="hero">
        <div className="hero-bg-img" />
        <div className="hero-grid" />
        <div className="hero-content">

          {/* Kiri */}
          <div className="hero-left">
            <h1>Deteksi APD <em>Otomatis</em> Berbasis AI</h1>
            <p className="hero-sub">
              Monitor pemakaian helm dan rompi keselamatan pekerja secara langsung
              dari kamera menggunakan model YOLOv8 ONNX, ringan, cepat,
              dan berjalan sepenuhnya di server lokal Anda.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => setPage("detection")}>
                <Icon.Video s={15} c={T.navy} /> Mulai Deteksi
              </button>
              <button className="btn-ghost" onClick={() => setPage("about")}>
                Pelajari Cara Kerja
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FEATURE STRIP ══════ */}
      <div className="feat-strip">
        <div className="feat-inner">
          {[
            { icon: <Icon.HardHat s={20} c={T.accent} />, bg: "rgba(45,125,210,.1)",  title: "Deteksi Helm",        desc: "Identifikasi safety helmet secara otomatis dari kamera" },
            { icon: <Icon.Shield  s={20} c={T.gold}   />, bg: "rgba(240,180,41,.12)", title: "Deteksi Rompi",       desc: "Kenali safety vest di setiap frame secara real-time" },
            { icon: <Icon.Video   s={20} c={T.teal}   />, bg: "rgba(8,145,178,.1)",   title: "Streaming Kamera",    desc: "Koneksi langsung via WebRTC + WebSocket lokal" },
          ].map((f) => (
            <div key={f.title} className="feat-item">
              <div className="feat-ic" style={{ background: f.bg }}>{f.icon}</div>
              <div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════ APA ITU APD ══════ */}
      <section className="sec" style={{ background: T.white }}>
        <div className="sec-inner">
          <div className="sec-hdr">
            <div className="sec-tag"><Icon.BookOpen s={12} c={T.accent} /> Pengenalan</div>
            <h2 className="sec-title">Apa itu APD?</h2>
            <p className="sec-sub" style={{ maxWidth: 500 }}>
              Alat Pelindung Diri (APD) adalah perlengkapan wajib di area kerja
              berbahaya, bukan sekadar aturan, tapi garis pertahanan terakhir
              sebelum kecelakaan terjadi.
            </p>
          </div>

          <div className="about-grid">
            <div>
              <div className="about-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80"
                  alt="Pekerja dengan APD"
                />
              </div>
              <div className="about-caption">
                Berdasarkan data Kemnaker, mayoritas kecelakaan kerja di sektor
                konstruksi dan industri terjadi akibat APD yang tidak digunakan
                secara konsisten, bukan karena tidak tersedia.
              </div>
            </div>

            <div>
              <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.8, marginBottom: 22 }}>
                Sistem ini hadir untuk menutup celah tersebut: mendeteksi
                secara visual apakah setiap pekerja sudah mengenakan APD yang
                sesuai, secara otomatis, konsisten, dan tanpa intervensi manual.
              </p>
              <div className="ppe-items">
                {[
                  {
                    icon: <Icon.HardHat s={18} c={T.accent} />,
                    bg: "rgba(45,125,210,.1)",
                    title: "Safety Helmet",
                    desc: "Melindungi kepala dari benturan benda keras. Wajib di area konstruksi, pertambangan, dan manufaktur berat.",
                  },
                  {
                    icon: <Icon.Shield s={18} c={T.gold} />,
                    bg: "rgba(240,180,41,.12)",
                    title: "Safety Vest",
                    desc: "Rompi reflektif meningkatkan visibilitas pekerja di area lalu lintas kendaraan dan kondisi pencahayaan rendah.",
                  },
                  {
                    icon: <Icon.BookOpen s={18} c="#9333ea" />,
                    bg: "rgba(147,51,234,.08)",
                    title: "Dasar Hukum",
                    desc: "Diwajibkan UU No. 1/1970 Keselamatan Kerja dan Permenaker No. 8/2010, pelanggaran dapat berujung sanksi.",
                  },
                ].map((item) => (
                  <div key={item.title} className="ppe-item">
                    <div className="ppe-ic" style={{ background: item.bg }}>{item.icon}</div>
                    <div>
                      <div className="ppe-item-title">{item.title}</div>
                      <div className="ppe-item-desc">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section className="sec">
        <div className="sec-inner">
          <div className="sec-hdr tc">
            <div className="sec-tag"><Icon.Settings s={12} c={T.accent} /> Cara Kerja</div>
            <h2 className="sec-title">Dari Kamera ke Hasil Deteksi</h2>
            <p className="sec-sub" style={{ maxWidth: 480, margin: "10px auto 0" }}>
              Tiga tahap yang terjadi dalam hitungan milidetik, sepenuhnya otomatis
            </p>
          </div>
          <div className="how-grid">
            {[
              {
                n: "01", icon: <Icon.Camera s={22} c={T.accent} />, bg: "rgba(45,125,210,.1)",
                title: "Ambil Frame",
                desc: "Browser mengakses kamera via WebRTC. Frame diambil Canvas API tiap 200ms, dikompresi ke JPEG, dan dikirim ke backend via WebSocket.",
              },
              {
                n: "02", icon: <Icon.Cpu s={22} c="#9333ea" />, bg: "rgba(147,51,234,.1)",
                title: "Inferensi Model",
                desc: "FastAPI menerima frame dan menjalankan model YOLOv8 ONNX. Setiap frame diproses untuk mendeteksi 4 kondisi APD beserta confidence score.",
              },
              {
                n: "03", icon: <Icon.Activity s={22} c={T.teal} />, bg: "rgba(8,145,178,.1)",
                title: "Tampil di Dashboard",
                desc: "Hasil bounding box, label, dan status kepatuhan dikirim balik via WebSocket dan langsung muncul sebagai overlay di video secara real-time.",
              },
            ].map((c) => (
              <div key={c.n} className="how-card">
                <div className="how-num">{c.n}</div>
                <div className="how-ic" style={{ background: c.bg }}>{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="cta-sec">
        <div className="cta-inner">
          <h2>Siap Mencoba Sistemnya?</h2>
          <p>
            Aktifkan kamera atau upload foto area kerja,
            hasil deteksi APD langsung terlihat tanpa konfigurasi tambahan.
          </p>
          <div className="cta-btns">
            <button className="btn-primary" onClick={() => setPage("detection")}>
              Buka Halaman Deteksi
            </button>
            <button className="btn-ghost" onClick={() => setPage("about")}>
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>
      </section>

      <Footer setPage={setPage} />
    </div>
  );
}