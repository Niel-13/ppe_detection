import { useState } from "react";
import { Icon } from "../components/icons/Icons";
import Footer from "../components/Footer";
import { T } from "../constants/tokens";

/* ─────────────────────────────────────────
   DATA: accordion cards
───────────────────────────────────────── */
const CARDS = [
  {
    icon: <Icon.HardHat s={20} />,
    ibg: "rgba(45,125,210,.12)", ic: T.accent, ac: T.accent,
    title: "Apa itu PPE?",
    desc: "Perlengkapan wajib di area berbahaya untuk melindungi pekerja dari risiko kecelakaan serius.",
    details: [
      { label: "Safety Helmet", text: "Helm industri melindungi dari benturan benda keras atau jatuh. Wajib di konstruksi, pertambangan, dan pabrik berat. Terbuat dari material ABS tahan impak." },
      { label: "Safety Vest",   text: "Rompi reflektif dengan strip berpendar meningkatkan visibilitas hingga 300m. Digunakan di area kendaraan berat, pekerjaan malam, atau pencahayaan rendah." },
      { label: "Regulasi",      text: "Wajib berdasarkan UU No. 1/1970 Keselamatan Kerja & Permenaker No. 8/2010. Pelanggaran dikenai sanksi administratif hingga pidana." },
    ],
  },
  {
    icon: <Icon.Settings s={20} />,
    ibg: "rgba(147,51,234,.1)", ic: "#9333ea", ac: "#9333ea",
    title: "Arsitektur Sistem",
    desc: "Stack modern: React + WebRTC di frontend, FastAPI + YOLOv8 di backend, terhubung via WebSocket.",
    details: [
      { label: "Frontend — React + WebRTC", text: "Browser akses kamera via getUserMedia(). Frame diambil Canvas API tiap 200ms, dikonversi Base64 JPEG, dikirim ke backend melalui WebSocket connection." },
      { label: "Backend — FastAPI + YOLOv8", text: "FastAPI (Python) terima frame di endpoint /ws/detect. YOLOv8 proses setiap frame dan kembalikan koordinat bounding box + confidence score dalam JSON." },
      {
        label: "Contoh Response", text: "",
        code: `{\n  "detections": [\n    { "label": "helmet",\n      "confidence": 0.982,\n      "bbox": [120, 45, 200, 160] },\n    { "label": "vest",\n      "confidence": 0.965,\n      "bbox": [80, 160, 260, 380] }\n  ],\n  "status": "complete",\n  "inference_ms": 14.2\n}`,
      },
    ],
  },
  {
    icon: <Icon.Video s={20} />,
    ibg: "rgba(8,145,178,.1)", ic: T.teal, ac: T.teal,
    title: "Deteksi Kamera Real-time",
    desc: "Hubungkan kamera dan sistem mendeteksi PPE secara langsung via WebRTC dengan latensi rendah.",
    details: [
      { label: "Alur WebRTC → WebSocket", text: "getUserMedia() → ambil frame Canvas → toDataURL('image/jpeg', 0.8) → ws.send(frame) → terima JSON → render bounding box di overlay. Berulang tiap 200ms." },
      { label: "Multi-kamera Support", text: "Mendukung multi-kamera menggunakan deviceId constraint. User bisa berpindah antar kamera (depan/belakang/eksternal) via dropdown selector di UI." },
      { label: "Endpoint WebSocket", text: "", code: `ws://localhost:8000/ws/detect\n\n# Frame masuk : base64 JPEG string\n# Response   : JSON detections array` },
    ],
  },
  {
    icon: <Icon.Upload s={20} />,
    ibg: "rgba(22,163,74,.1)", ic: T.green, ac: T.green,
    title: "Deteksi Upload Gambar",
    desc: "Upload foto dari area kerja, dapatkan analisis PPE instan dengan bounding box dan confidence score.",
    details: [
      { label: "Format & Batas", text: "Mendukung JPG, PNG, dan WebP. Ukuran maks. 10MB. Resolusi yang direkomendasikan 640×640px atau lebih untuk akurasi optimal." },
      { label: "Endpoint Upload", text: "", code: `POST /api/detect/image\nContent-Type: multipart/form-data\n\n# Response:\n{\n  "detections": [...],\n  "status": "complete",\n  "inference_ms": 18.5\n}` },
      { label: "Kapan Menggunakan?", text: "Upload gambar cocok untuk audit foto dokumentasi lapangan. Kamera realtime lebih tepat untuk monitoring aktif dan enforcement di pintu masuk area kerja." },
    ],
  },
  {
    icon: <Icon.Shield s={20} />,
    ibg: "rgba(240,180,41,.12)", ic: T.gold, ac: T.gold,
    title: "Monitoring Kepatuhan",
    desc: "Status kepatuhan langsung: Lengkap (semua APD terdeteksi) atau Tidak Lengkap (APD kurang).",
    details: [
      { label: "Logika Status", text: "'Lengkap' diberikan ketika helmet DAN vest terdeteksi dengan confidence ≥ threshold (default 60%). Jika salah satu tidak terdeteksi → status 'Tidak Lengkap' dengan alert merah." },
      { label: "Konfigurasi Threshold", text: "Atur confidence threshold di config.py backend. Naikkan (0.75) untuk kurangi false positive; turunkan (0.45) jika APD valid sering tidak terdeteksi." },
      { label: "Integrasi Alert", text: "Siap diintegrasikan dengan notifikasi email/Telegram/Webhook saat pelanggaran terdeteksi. Tambah handler di endpoint FastAPI untuk trigger alert eksternal." },
    ],
  },
];

/* ─────────────────────────────────────────
   SUB-COMPONENT: satu accordion card
───────────────────────────────────────── */
function InfoCard({ card, open, onToggle }) {
  return (
    <div
      className={`ic${open ? " open" : ""}`}
      style={{ "--ac": card.ac }}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="ic-top">
        <div className="ic-icon" style={{ background: card.ibg, color: card.ic }}>
          {card.icon}
        </div>
        <div className="ic-body">
          <div className="ic-title">{card.title}</div>
          <div className="ic-desc">{card.desc}</div>
        </div>
        <div className="ic-chevron">
          <Icon.ChevronDown s={18} />
        </div>
      </div>

      {/* Detail (hanya tampil saat open) */}
      {open && (
        <div className="ic-details" onClick={(e) => e.stopPropagation()}>
          {card.details.map((d, i) => (
            <div key={i} className="ic-detail">
              <div className="ic-detail-label">{d.label}</div>
              {d.text && <div className="ic-detail-text">{d.text}</div>}
              {d.code && <pre className="ic-code">{d.code}</pre>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function AboutPage({ setPage }) {
  const [openIdx, setOpenIdx] = useState(null);
  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i));

  return (
    <div className="about-page">

      {/* ── MINI HERO ── */}
      <div className="about-hero">
        <div className="about-hero-inner">
          <div className="about-hero-badge">
            <Icon.Shield s={12} c="#7dc4f7" /> Tentang Sistem
          </div>
          <h1>PPE Detection <span>System</span></h1>
          <p>
            Panduan lengkap cara kerja sistem deteksi APD berbasis
            FastAPI, React, WebRTC, dan YOLOv8, dari konsep hingga implementasi teknis.
          </p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="about-body">

        {/* FLOW DIAGRAM */}
        <div className="flow-block">
          <div className="flow-label">Arsitektur Sistem</div>
          <div className="flow-title">Alur Kerja</div>
          <div className="flow-steps">
            {[
              { icon: <Icon.Video  s={18} c="#fff"   />, lbl: "Browser",    detail: "WebRTC Camera",    cls: "blue"  },
              null,
              { icon: <Icon.Code   s={18} c="#fff"   />, lbl: "Canvas API", detail: "Frame Extraction", cls: ""      },
              null,
              { icon: <Icon.Wifi   s={18} c="#fff"   />, lbl: "WebSocket",  detail: "ws://host/detect", cls: "blue"  },
              null,
              { icon: <Icon.Cpu    s={18} c={T.navy} />, lbl: "YOLOv8",    detail: "FastAPI Backend",  cls: "amber" },
              null,
              { icon: <Icon.Layers s={18} c="#fff"   />, lbl: "JSON Result",detail: "BBox + Conf",      cls: ""      },
              null,
              { icon: <Icon.Eye    s={18} c={T.navy} />, lbl: "Dashboard",  detail: "React UI",         cls: "amber" },
            ].map((s, i) =>
              s === null ? (
                <div key={i} className="flow-arrow">
                  <Icon.ArrowRight s={13} c="rgba(255,255,255,.22)" />
                </div>
              ) : (
                <div key={i} className="flow-step">
                  <div className={`flow-circle ${s.cls}`}>{s.icon}</div>
                  <div className="flow-lbl">{s.lbl}</div>
                  <div className="flow-detail">{s.detail}</div>
                </div>
              )
            )}
          </div>
        </div>

        {/* SECTION INTRO */}
        <div className="about-section-intro">
          <h2>Detail Teknis</h2>
          <p>5 topik utama dari pengenalan APD hingga konfigurasi monitoring kepatuhan</p>
        </div>

        {/* ACCORDION CARDS */}
        <div className="info-cards">
          {CARDS.map((card, i) => (
            <InfoCard
              key={i}
              card={card}
              open={openIdx === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>

        {/* TECH STACK */}
        <div>
          <div className="tech-title">Tech Stack</div>
          <div className="tech-grid">
            {[
              { icon: <Icon.Zap  s={22} c="#f97316" />, bg: "rgba(249,115,22,.1)",  name: "FastAPI",   role: "Backend REST + WebSocket, Python async framework" },
              { icon: <Icon.Code s={22} c="#61dafb" />, bg: "rgba(97,218,251,.1)",  name: "React",     role: "Frontend SPA, komponen modular + WebRTC" },
              { icon: <Icon.Cpu  s={22} c="#9333ea" />, bg: "rgba(147,51,234,.1)",  name: "YOLOv8",   role: "Object detection model, real-time inference" },
              { icon: <Icon.Wifi s={22} c={T.teal}  />, bg: "rgba(8,145,178,.1)",   name: "WebSocket", role: "Komunikasi bidireksional laten rendah" },
            ].map((t) => (
              <div key={t.name} className="tech-card">
                <div className="tech-ic" style={{ background: t.bg }}>{t.icon}</div>
                <div className="tech-name">{t.name}</div>
                <div className="tech-role">{t.role}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="about-cta">
            <button
              className="btn-primary"
              style={{ fontSize: 14, padding: "10px 22px" }}
              onClick={() => setPage("detection")}
            >
              Coba Deteksi 
            </button>
          </div>
        </div>
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}
