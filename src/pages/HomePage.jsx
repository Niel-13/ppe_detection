import { Icon } from "../components/icons/Icons";
import Footer from "../components/Footer";
import { T } from "../constants/tokens";

export default function HomePage({ setPage }) {
  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-img" />
        <div className="hero-grid" />
        <div className="hero-content">

          {/* Kiri: teks */}
          <div className="hero-left">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              AI-Powered Workplace Safety
            </div>
            <h1>PPE Detection <em>System</em></h1>
            <p className="hero-sub">
              Sistem deteksi otomatis Alat Pelindung Diri (APD) berbasis Computer Vision.
              Pantau helm dan rompi keselamatan pekerja secara real-time menggunakan AI.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => setPage("detection")}>
                Coba Sekarang
              </button>
              <button className="btn-ghost" onClick={() => setPage("about")}>
                Pelajari Lebih
              </button>
            </div>
          </div>

          {/* Kanan: stat cards */}
          <div className="hero-right">
            <div className="hero-stats">
              {[
                { icon: <Icon.HardHat s={20} c="#7dc4f7" />, num: "98%",  lbl: "Akurasi Helmet",     cls: "" },
                { icon: <Icon.Vest    s={20} c={T.gold}  />, num: "96%",  lbl: "Akurasi Vest",       cls: "gold" },
                { icon: <Icon.Activity s={20} c="#7dc4f7"/>, num: "5 FPS",lbl: "Realtime Detection", cls: "" },
              ].map((s, i) => (
                <div key={i} className={`h-stat ${s.cls}`}>
                  {s.icon}
                  <div className="h-stat-num">{s.num}</div>
                  <div className="h-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE STRIP ── */}
      <div className="feat-strip">
        <div className="feat-inner">
          {[
            { icon: <Icon.HardHat s={20} c={T.accent} />, bg: "rgba(45,125,210,.1)",  title: "Helmet Detection",     desc: "Deteksi helm keselamatan otomatis" },
            { icon: <Icon.Vest    s={20} c={T.gold}   />, bg: "rgba(240,180,41,.12)", title: "Vest Detection",       desc: "Identifikasi rompi reflektif pekerja" },
            { icon: <Icon.Video   s={20} c={T.teal}   />, bg: "rgba(8,145,178,.1)",   title: "Real-Time Monitoring", desc: "Pantau via kamera langsung (WebRTC)" },
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

      {/* ── APA ITU PPE ── */}
      <section className="sec" style={{ background: T.white }}>
        <div className="sec-inner">
          <div className="sec-hdr">
            <div className="sec-tag"><Icon.BookOpen s={12} c={T.accent} /> Pengenalan</div>
            <h2 className="sec-title">Apa itu PPE?</h2>
            <p className="sec-sub" style={{ maxWidth: 500 }}>
              Personal Protective Equipment (APD) adalah perlengkapan wajib di area kerja
              berbahaya untuk melindungi pekerja dari risiko kecelakaan.
            </p>
          </div>

          <div className="about-grid">
            {/* Gambar */}
            <div>
              <div className="about-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80"
                  alt="Pekerja dengan PPE"
                />
              </div>
              <div className="about-caption">
                Penggunaan APD yang benar dapat mencegah kecelakaan, cedera, bahkan kematian
                akibat paparan bahan berbahaya, suhu ekstrem, atau kecelakaan mekanik.
              </div>
            </div>

            {/* Teks */}
            <div>
              <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.8, marginBottom: 22 }}>
                APD adalah perlengkapan pelindung yang digunakan untuk menjaga keselamatan
                dan kesehatan pekerja dari berbagai bahaya di tempat kerja.
              </p>
              <div className="ppe-items">
                {[
                  {
                    icon: <Icon.HardHat s={18} c={T.accent} />,
                    bg: "rgba(45,125,210,.1)",
                    title: "1. Safety Helmet",
                    desc: "Melindungi kepala dari benturan benda keras. Wajib di area konstruksi, pertambangan, dan manufaktur.",
                  },
                  {
                    icon: <Icon.Vest s={18} c={T.gold} />,
                    bg: "rgba(240,180,41,.12)",
                    title: "2. Safety Vest",
                    desc: "Rompi reflektif meningkatkan visibilitas pekerja di area lalu lintas kendaraan dan pencahayaan rendah.",
                  },
                  {
                    icon: <Icon.Shield s={18} c="#9333ea" />,
                    bg: "rgba(147,51,234,.08)",
                    title: "Dasar Hukum",
                    desc: "Diwajibkan UU No. 1/1970 Keselamatan Kerja dan Permenaker No. 8/2010.",
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

      {/* ── HOW IT WORKS ── */}
      <section className="sec">
        <div className="sec-inner">
          <div className="sec-hdr tc">
            <div className="sec-tag"><Icon.Settings s={12} c={T.accent} /> Cara Kerja</div>
            <h2 className="sec-title">Bagaimana Sistem Bekerja?</h2>
            <p className="sec-sub" style={{ maxWidth: 480, margin: "10px auto 0" }}>
              Tiga tahap sederhana dari kamera hingga hasil deteksi real-time
            </p>
          </div>
          <div className="how-grid">
            {[
              {
                n: "01", icon: <Icon.Camera s={22} c={T.accent} />, bg: "rgba(45,125,210,.1)",
                title: "Capture Input",
                desc: "Browser mengakses kamera via WebRTC (getUserMedia) atau menerima gambar upload. Frame diambil Canvas API tiap 200ms.",
              },
              {
                n: "02", icon: <Icon.Cpu s={22} c="#9333ea" />, bg: "rgba(147,51,234,.1)",
                title: "AI Analysis — YOLOv8",
                desc: "FastAPI backend memproses frame dengan YOLOv8. Setiap frame dianalisis untuk mendeteksi helmet dan vest beserta confidence score.",
              },
              {
                n: "03", icon: <Icon.Activity s={22} c={T.teal} />, bg: "rgba(8,145,178,.1)",
                title: "Hasil via WebSocket",
                desc: "Hasil (bounding box, label, confidence) dikirim real-time via WebSocket ke React frontend dan ditampilkan di dashboard.",
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

      {/* ── CTA ── */}
      <section className="cta-sec">
        <div className="cta-inner">
          <h2>Siap Tingkatkan Keselamatan Kerja?</h2>
          <p>Mulai gunakan sistem deteksi PPE berbasis AI sekarang juga</p>
          <div className="cta-btns">
            <button className="btn-primary" onClick={() => setPage("detection")}>
              Mulai Deteksi 
            </button>
            <button className="btn-ghost" onClick={() => setPage("about")}>
              Tentang Sistem
            </button>
          </div>
        </div>
      </section>

      <Footer setPage={setPage} />
    </div>
  );
}
