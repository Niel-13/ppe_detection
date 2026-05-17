import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "../components/icons/Icons";
import Footer from "../components/Footer";
import { T } from "../constants/tokens";

/* ═══════════════════════════════════════════════════════════
   KONSTANTA
═══════════════════════════════════════════════════════════ */
// Endpoint backend diambil dari environment variable deployment.
// Untuk Vercel/Netlify, isi:
// REACT_APP_API_BASE_URL=https://domain-backend-kamu
// REACT_APP_WS_BASE_URL=wss://domain-backend-kamu
const trimTrailingSlash = (url = "") => url.replace(/\/+$/, "");
const API_HOST = trimTrailingSlash(process.env.REACT_APP_API_BASE_URL || window.location.origin);
const WS_HOST = trimTrailingSlash(
  process.env.REACT_APP_WS_BASE_URL ||
  `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`
);
const WS_URL = `${WS_HOST}/ws/detect`;
const UPLOAD_URL = `${API_HOST}/api/detect/image`;
const FRAME_RATE  = 200; // ms antar frame (5 FPS)
const BEEP_CD     = 4000; // cooldown beep (ms)

// Warna per kelas sesuai model
const CLASS_COLOR = {
  complete_vest_helmet: "#22c55e",  // hijau
  no_helmet:            "#f97316",  // oranye
  no_vest:              "#f97316",  // oranye
  no_vest_no_helmet:    "#ef4444",  // merah
};

// Label tampil per kelas
const CLASS_LABEL = {
  complete_vest_helmet: "APD Lengkap",
  no_helmet:            "Tanpa Helm",
  no_vest:              "Tanpa Vest",
  no_vest_no_helmet:    "Tanpa APD",
};

/* ═══════════════════════════════════════════════════════════
   AUDIO, Web Audio API beep
   Pola beep:
     no_helmet          → 1× beep oranye
     no_vest            → 2× beep oranye
     no_vest_no_helmet  → 3× beep merah (urgent)
═══════════════════════════════════════════════════════════ */
const audioCtxRef = { current: null };

function getAudioCtx() {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume jika di-suspend oleh browser
  if (audioCtxRef.current.state === "suspended") {
    audioCtxRef.current.resume();
  }
  return audioCtxRef.current;
}

function playBeep(violations = []) {
  if (!violations.length) return;
  try {
    const ctx   = getAudioCtx();
    // Pola berdasarkan tipe pelanggaran terberat
    const worst = violations.includes("no_vest_no_helmet") ? "no_vest_no_helmet"
                : violations.includes("no_helmet")        ? "no_helmet"
                : "no_vest";

    const count = worst === "no_vest_no_helmet" ? 3
                : worst === "no_helmet"          ? 1
                : 2;

    const freq  = worst === "no_vest_no_helmet" ? 1200 : 880;
    const gap   = 0.32; // detik antar beep

    for (let i = 0; i < count; i++) {
      const t0  = ctx.currentTime + i * gap;
      const osc = ctx.createOscillator();
      const gn  = ctx.createGain();
      osc.connect(gn);
      gn.connect(ctx.destination);
      osc.type            = "square";
      osc.frequency.value = freq;
      gn.gain.setValueAtTime(0.25, t0);
      gn.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
      osc.start(t0);
      osc.stop(t0 + 0.22);
    }
  } catch (e) {
    console.warn("Beep gagal:", e.message);
  }
}

/* ═══════════════════════════════════════════════════════════
   HELPER, pesan error kamera
═══════════════════════════════════════════════════════════ */
function getCamError(err) {
  switch (err.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Akses kamera ditolak.\n\nCara izinkan:\n• Klik ikon kunci di address bar\n• Pilih 'Izinkan' kamera\n• Refresh halaman";
    case "NotFoundError":
      return "Tidak ada kamera terdeteksi. Pastikan kamera terpasang.";
    case "NotReadableError":
      return "Kamera digunakan aplikasi lain (Zoom, Meet, dll). Tutup dulu, lalu coba lagi.";
    case "SecurityError":
    case "TypeError":
      return "Akses kamera diblokir browser.\n\nPastikan aplikasi dibuka melalui domain HTTPS resmi agar browser mengizinkan akses kamera.";
    default:
      return `Gagal akses kamera: ${err.message}\n\nPastikan aplikasi berjalan melalui domain HTTPS dan izin kamera sudah diberikan.`;
  }
}

/* ═══════════════════════════════════════════════════════════
   BBOX OVERLAY, div overlay posisi berdasar bbox_norm
═══════════════════════════════════════════════════════════ */
function BboxOverlay({ detections, videoRef }) {
  const [rect, setRect] = useState({ offX:0, offY:0, w:1, h:1 });
  const wrapRef = useRef(null);

  useEffect(() => {
    // Hitung area aktual video di dalam container (objectFit:contain)
    function compute() {
      const vid = videoRef?.current;
      const wrap = wrapRef.current;
      if (!wrap) return;
      // Jika ada elemen video nyata, pakai rasio intrinsiknya
      const vw = vid?.videoWidth  || (vid?.clientWidth)  || wrap.clientWidth;
      const vh = vid?.videoHeight || (vid?.clientHeight) || wrap.clientHeight;
      const cw = wrap.clientWidth;
      const ch = wrap.clientHeight;
      const vr = vw / vh;
      const cr = cw / ch;
      let rw, rh;
      if (vr > cr) { rw = cw; rh = cw / vr; }
      else         { rh = ch; rw = ch * vr; }
      setRect({
        offX: (cw - rw) / 2,
        offY: (ch - rh) / 2,
        w: rw,
        h: rh,
      });
    }
    compute();
    const ro = new ResizeObserver(compute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    // Juga observe video untuk saat videoWidth berubah
    const vid = videoRef?.current;
    if (vid) {
      vid.addEventListener("loadedmetadata", compute);
      vid.addEventListener("resize", compute);
    }
    return () => {
      ro.disconnect();
      if (vid) {
        vid.removeEventListener("loadedmetadata", compute);
        vid.removeEventListener("resize", compute);
      }
    };
  }, [videoRef]);

  return (
    <div ref={wrapRef} style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
      {detections?.map((d, i) => {
        const [x1, y1, x2, y2] = d.bbox_norm;
        const color = CLASS_COLOR[d.label] || "#fff";
        const left   = rect.offX + x1 * rect.w;
        const top    = rect.offY + y1 * rect.h;
        const width  = (x2 - x1) * rect.w;
        const height = (y2 - y1) * rect.h;
        return (
          <div
            key={i}
            style={{
              position:  "absolute",
              left, top, width, height,
              border:    `2px solid ${color}`,
              boxShadow: `0 0 10px ${color}90, inset 0 0 10px ${color}10`,
              pointerEvents: "none",
            }}
          >
            <div style={{
              position:   "absolute",
              top:        -24,
              left:       -2,
              background: color,
              color:      "#0c1f35",
              fontSize:   11,
              fontWeight: 800,
              padding:    "2px 8px",
              borderRadius: "4px 4px 4px 0",
              whiteSpace: "nowrap",
              letterSpacing: ".3px",
              boxShadow: `0 2px 8px ${color}60`,
            }}>
              {CLASS_LABEL[d.label] || d.label} {(d.confidence * 100).toFixed(1)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FULLSCREEN
═══════════════════════════════════════════════════════════ */
function FullScreen({ onClose, stream, detections, stats, inferenceMs, cameras, camIdx, onSwitchCamera }) {
  const fsRef      = useRef(null);
  const [bars,     setBars]     = useState(Array(10).fill(20));
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    if (fsRef.current && stream) {
      fsRef.current.srcObject = stream;
      fsRef.current.play().catch(() => {});
    }
  }, [stream]);

  useEffect(() => {
    const base = stats?.avg_confidence ? stats.avg_confidence * 100 : 50;
    setBars(prev => prev.map(() => Math.max(10, Math.min(100, base + (Math.random() * 20 - 10)))));
  }, [stats]);

  const total      = stats?.total_detected  ?? 0;
  const complete   = stats?.complete_count  ?? 0;
  const violations = stats?.violation_count ?? 0;
  const avgConf    = stats?.avg_confidence  ? (stats.avg_confidence * 100).toFixed(1) : "—";
  const ms         = inferenceMs ?? "—";

  const activeCamLabel = cameras?.[camIdx]?.label?.replace(/\s*\(.*?\)/g, "").trim() || `Kamera ${(camIdx ?? 0) + 1}`;

  return (
    <div className="fs-overlay">
      {/* TOP BAR */}
      <div className="fs-topbar">
        <div className="fs-live">
          <div className="fs-dot" />
          <div>
            <div className="fs-id">LIVE - {activeCamLabel}</div>
            <div className="fs-loc">
              {stats?.status === "violation"
                ? `⚠ ${violations} PELANGGARAN APD TERDETEKSI`
                : stats?.status === "complete"
                  ? `✓ ${total} PEKERJA, APD LENGKAP`
                  : "Menunggu deteksi..."}
            </div>
          </div>
        </div>

        {/* CAMERA SWITCHER, dropdown */}
        <div className="fs-center">
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Icon.Camera s={13} c="rgba(255,255,255,.45)"/>
            <select
              value={camIdx}
              onChange={e => onSwitchCamera(Number(e.target.value))}
              style={{
                background:  "rgba(255,255,255,.07)",
                border:      "1px solid rgba(255,255,255,.18)",
                borderRadius: 8,
                color:       "#fff",
                fontSize:    12,
                fontWeight:  600,
                padding:     "5px 28px 5px 10px",
                cursor:      "pointer",
                outline:     "none",
                appearance:  "none",
                WebkitAppearance: "none",
                backgroundImage:  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,.4)'/%3E%3C/svg%3E")`,
                backgroundRepeat:   "no-repeat",
                backgroundPosition: "right 8px center",
                minWidth: 160,
                maxWidth: 220,
              }}
            >
              {cameras && cameras.length > 0
                ? cameras.map((cam, i) => (
                    <option key={cam.deviceId || i} value={i} style={{ background:"#0c1f35" }}>
                      {cam.label?.replace(/\s*\(.*?\)/g,"").trim() || `Kamera ${i+1}`}
                    </option>
                  ))
                : <option value={0} style={{ background:"#0c1f35" }}>Kamera Aktif</option>
              }
            </select>
            {/* Live dot di sebelah kanan dropdown */}
            <div style={{
              width:7, height:7, borderRadius:"50%",
              background:"#4ade80", boxShadow:"0 0 7px #4ade80",
              flexShrink:0,
            }}/>
          </div>
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <div
            className="fs-ibtn"
            onClick={() => setShowInfo(v => !v)}
            title={showInfo ? "Sembunyikan overlay info" : "Tampilkan overlay info"}
            style={{
              background: showInfo ? "rgba(74,222,128,.2)" : "rgba(255,255,255,.07)",
              border: showInfo ? "1px solid rgba(74,222,128,.4)" : "1px solid rgba(255,255,255,.12)",
            }}
          >
            <Icon.Eye s={14} c={showInfo ? "#4ade80" : "#fff"}/>
          </div>
          <div className="fs-ibtn" onClick={onClose}><Icon.X s={14} c="#fff"/></div>
        </div>
      </div>

      {/* VIDEO + BBOX OVERLAY */}
      <div className="fs-video" style={{ position:"relative" }}>
        {stream
          ? <video ref={fsRef} autoPlay playsInline muted style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
          : <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=75"
              style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.45) saturate(.8)" }} alt="stream"/>
        }

        {/* Bbox overlay, hanya tampil saat showInfo aktif */}
        {showInfo && (
          <BboxOverlay detections={detections} videoRef={fsRef}/>
        )}

        {/* Alert banner pelanggaran */}
        {showInfo && stats?.status === "violation" && (
          <div style={{
            position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)",
            background:"rgba(220,38,38,.85)", color:"#fff",
            padding:"10px 24px", borderRadius:999,
            fontSize:13, fontWeight:700, letterSpacing:".5px",
            backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,.2)",
            whiteSpace:"nowrap",
          }}>
            ⚠ PELANGGARAN APD, {detections?.filter(d=>d.label!=="complete_vest_helmet").map(d=>CLASS_LABEL[d.label]).join(", ")}
          </div>
        )}

        {/* Badge "Info Hidden" saat showInfo off */}
        {!showInfo && (
          <div style={{
            position:"absolute", top:12, right:12,
            background:"rgba(0,0,0,.55)", color:"rgba(255,255,255,.5)",
            padding:"4px 12px", borderRadius:99, fontSize:11,
            backdropFilter:"blur(6px)", border:"1px solid rgba(255,255,255,.1)",
          }}>
            Overlay disembunyikan
          </div>
        )}

        <div className="fs-scan"/>
      </div>

      {/* FOOTER STATS, disembunyikan jika showInfo off */}
      {showInfo && (
      <div className="fs-foot">
        <div className="fs-stats">
          <div className="fs-big">
            <div className="fs-lbl">Total Terdeteksi</div>
            <div className="fs-val" style={{ color: violations > 0 ? "#f87171" : "#1e1e1e" }}>{total}</div>
            <div className="fs-sub">Orang</div>
          </div>
          <div className="fs-sm">
            <div className="fs-sm-item">
              <div className="fs-lbl">APD Lengkap</div>
              <div className="fs-sm-val" style={{ color:"#4ade80" }}>{complete}</div>
            </div>
            <div className="fs-sm-item">
              <div className="fs-lbl">Pelanggaran</div>
              <div className="fs-sm-val" style={{ color: violations > 0 ? "#f87171" : "#fff" }}>{violations}</div>
            </div>
          </div>
        </div>

        <div className="fs-bars">
          {bars.map((h, i) => (
            <div key={i} className="fs-bar" style={{
              height: `${h}%`,
              background: violations > 0 ? "rgba(248,113,113,.7)" : "rgba(74,222,128,.7)",
            }}/>
          ))}
        </div>

        <div className="fs-right">
          <div className="fs-tech">
            <div className="fs-tech-item">
              <div className="fs-lbl">Inference</div>
              <div className="fs-tech-val">{ms}ms</div>
            </div>
            <div className="fs-tech-item">
              <div className="fs-lbl">Status APD</div>
              <div style={{
                fontSize:12, fontWeight:700, marginTop:3,
                color: stats?.status === "complete" ? "#4ade80"
                     : stats?.status === "violation" ? "#f87171"
                     : "#94a3b8",
              }}>
                {stats?.status === "complete" ? "LENGKAP"
               : stats?.status === "violation" ? "PELANGGARAN"
               : "NO DATA"}
              </div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div className="fs-lbl">Avg. Confidence</div>
            <div className="fs-acc">{avgConf}{avgConf !== "—" ? "%" : ""}</div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   RESULT CARDS
═══════════════════════════════════════════════════════════ */
function ResultCards({ stats, detections }) {
  const isViolation   = stats.status === "violation";
  const isComplete    = stats.status === "complete";
  const isNoDetection = stats.status === "no_detection";

  const conf = stats.avg_confidence ? (stats.avg_confidence * 100) : 0;
  const confPct = conf.toFixed(1);

  // Warna tema berdasar status
  const theme = isViolation
    ? { bg: "rgba(220,38,38,.06)",  border: "rgba(220,38,38,.18)",  accent: "#ef4444", glow: "rgba(220,38,38,.25)" }
    : isComplete
    ? { bg: "rgba(22,163,74,.06)",  border: "rgba(22,163,74,.18)",  accent: "#22c55e", glow: "rgba(22,163,74,.25)" }
    : { bg: "rgba(100,116,139,.04)", border: "rgba(100,116,139,.12)", accent: "#64748b", glow: "transparent" };

  return (
    <div style={{ marginTop:18, display:"flex", flexDirection:"column", gap:12 }}>

      {/* ── STATUS BANNER ── */}
      <div style={{
        display:"flex", alignItems:"center", gap:14,
        padding:"14px 18px",
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        boxShadow: `0 0 20px ${theme.glow}`,
        position:"relative", overflow:"hidden",
      }}>
        {/* Glow bar kiri */}
        <div style={{
          position:"absolute", left:0, top:0, bottom:0, width:4,
          background: theme.accent,
          borderRadius:"14px 0 0 14px",
        }}/>

        {/* Ikon status */}
        <div style={{
          width:40, height:40, borderRadius:"50%",
          background:`${theme.accent}18`,
          border:`1.5px solid ${theme.accent}40`,
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0, marginLeft:6,
        }}>
          {isViolation
            ? <Icon.AlertTriangle s={20} c={theme.accent}/>
            : isComplete
            ? <Icon.Check s={20} c={theme.accent}/>
            : <Icon.Loader s={20} c={theme.accent}/>}
        </div>

        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:800, color: isNoDetection ? "#64748b" : theme.accent, letterSpacing:".2px" }}>
            {isViolation   ? `Pelanggaran APD Terdeteksi`
           : isComplete    ? `Semua APD Lengkap`
           : "Tidak Ada Orang Terdeteksi"}
          </div>
          <div style={{ fontSize:12, color:"#64748b", marginTop:3 }}>
            {isNoDetection
              ? "Arahkan kamera ke area kerja yang aktif"
              : `${stats.total_detected} orang · ${stats.complete_count} lengkap · ${stats.violation_count} pelanggaran`}
          </div>
        </div>

        {/* Confidence pill */}
        {!isNoDetection && (
          <div style={{
            display:"flex", flexDirection:"column", alignItems:"center",
            padding:"6px 14px",
            background:`${theme.accent}12`,
            border:`1px solid ${theme.accent}30`,
            borderRadius:10,
            flexShrink:0,
          }}>
            <div style={{ fontSize:20, fontWeight:800, color:theme.accent, lineHeight:1 }}>{confPct}%</div>
            <div style={{ fontSize:9, color:"#64748b", marginTop:2, letterSpacing:".5px" }}>AKURASI</div>
          </div>
        )}
      </div>

      {/* ── STAT TILES ── */}
      {!isNoDetection && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
          {/* Total */}
          <div style={{
            padding:"12px 14px", borderRadius:12,
            background:"rgba(45,125,210,.07)", border:"1px solid rgba(45,125,210,.15)",
            display:"flex", flexDirection:"column", gap:4,
          }}>
            <div style={{ fontSize:10, color:"#64748b", fontWeight:600, letterSpacing:".5px", textTransform:"uppercase" }}>Terdeteksi</div>
            <div style={{ fontSize:28, fontWeight:800, color:"#393939", lineHeight:1 }}>{stats.total_detected}</div>
            <div style={{ fontSize:11, color:"#475569" }}>orang</div>
          </div>

          {/* Lengkap */}
          <div style={{
            padding:"12px 14px", borderRadius:12,
            background:"rgba(22,163,74,.07)", border:"1px solid rgba(22,163,74,.15)",
            display:"flex", flexDirection:"column", gap:4,
          }}>
            <div style={{ fontSize:10, color:"#64748b", fontWeight:600, letterSpacing:".5px", textTransform:"uppercase" }}>APD Lengkap</div>
            <div style={{ fontSize:28, fontWeight:800, color:"#22c55e", lineHeight:1 }}>{stats.complete_count}</div>
            <div style={{ fontSize:11, color:"#475569" }}>orang aman</div>
          </div>

          {/* Pelanggaran */}
          <div style={{
            padding:"12px 14px", borderRadius:12,
            background: stats.violation_count > 0 ? "rgba(220,38,38,.07)" : "rgba(100,116,139,.05)",
            border: stats.violation_count > 0 ? "1px solid rgba(220,38,38,.2)" : "1px solid rgba(100,116,139,.12)",
            display:"flex", flexDirection:"column", gap:4,
          }}>
            <div style={{ fontSize:10, color:"#64748b", fontWeight:600, letterSpacing:".5px", textTransform:"uppercase" }}>Pelanggaran</div>
            <div style={{ fontSize:28, fontWeight:800, color: stats.violation_count > 0 ? "#ef4444" : "#334155", lineHeight:1 }}>
              {stats.violation_count}
            </div>
            <div style={{ fontSize:11, color:"#475569" }}>orang</div>
          </div>
        </div>
      )}

      {/* ── CONFIDENCE BAR ── */}
      {!isNoDetection && (
        <div style={{ padding:"12px 16px", borderRadius:12, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <span style={{ fontSize:11, color:"#64748b", fontWeight:600 }}>Rata-rata Confidence Model</span>
            <span style={{ fontSize:13, fontWeight:800, color: conf >= 70 ? "#22c55e" : conf >= 50 ? "#f97316" : "#ef4444" }}>
              {confPct}%
            </span>
          </div>
          <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,.07)", overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:99,
              width:`${Math.min(conf,100)}%`,
              background: conf >= 70 ? "linear-gradient(90deg,#16a34a,#22c55e)"
                        : conf >= 50 ? "linear-gradient(90deg,#ea580c,#f97316)"
                        : "linear-gradient(90deg,#b91c1c,#ef4444)",
              transition:"width .5s ease",
            }}/>
          </div>
        </div>
      )}

      {/* ── LIST DETEKSI PER ORANG ── */}
      {detections.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#475569", letterSpacing:".6px", textTransform:"uppercase", paddingLeft:2 }}>
            Detail Deteksi
          </div>
          {detections.map((d, i) => {
            const color  = CLASS_COLOR[d.label] || "#393939";
            const isVio  = d.label !== "complete_vest_helmet";
            const conf_d = (d.confidence * 100);
            return (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"10px 14px",
                background: isVio ? "rgba(220,38,38,.04)" : "rgba(22,163,74,.04)",
                border:`1px solid ${color}22`,
                borderRadius:11,
                transition:"background .2s",
              }}>
                {/* Nomor */}
                <div style={{
                  width:26, height:26, borderRadius:"50%", flexShrink:0,
                  background:`${color}18`, border:`1.5px solid ${color}40`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:800, color,
                }}>
                  {i+1}
                </div>

                {/* Label */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#393939" }}>
                    {CLASS_LABEL[d.label] || d.label}
                  </div>
                  <div style={{ fontSize:10, color:"#475569", marginTop:1 }}>
                    {isVio ? "⚠ Perlu tindakan" : "✓ APD sesuai standar"}
                  </div>
                </div>

                {/* Mini confidence bar + nilai */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, minWidth:60 }}>
                  <span style={{ fontSize:13, fontWeight:800, color }}>{conf_d.toFixed(1)}%</span>
                  <div style={{ width:56, height:4, borderRadius:99, background:"rgba(255,255,255,.08)" }}>
                    <div style={{
                      height:"100%", borderRadius:99,
                      width:`${Math.min(conf_d,100)}%`,
                      background: color,
                    }}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN: Detection Page
═══════════════════════════════════════════════════════════ */
export default function DetectionPage({ setPage }) {
  const videoRef     = useRef(null);
  const captureRef   = useRef(null); // canvas tersembunyi untuk capture frame
  const wsRef        = useRef(null);
  const lastBeepRef  = useRef(0);
  const frameTimerRef= useRef(null);
  const sendingFrameRef = useRef(false);

  const [mediaStream, setMediaStream] = useState(null);
  const [camOn,       setCamOn]       = useState(false);
  const [camError,    setCamError]    = useState("");
  const [cameras,     setCameras]     = useState([]);
  const [camIdx,      setCamIdx]      = useState(0);
  const [fs,          setFs]          = useState(false);

  // Status koneksi WS
  const [wsStatus,    setWsStatus]    = useState("off"); // off | connecting | on | error

  // Hasil deteksi kamera
  const [detections,  setDetections]  = useState([]);
  const [liveStats,   setLiveStats]   = useState(null);
  const [inferenceMs, setInferenceMs] = useState(null);

  // Upload
  const [imgSrc,  setImgSrc]  = useState(null);
  const [imgRes,  setImgRes]  = useState(null);
  const [imgDets, setImgDets] = useState([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [drag,    setDrag]    = useState(false);

  /* ── Enumerate kamera ── */
  const refreshCameras = useCallback(async () => {
    if (!navigator.mediaDevices) return;
    const devs = await navigator.mediaDevices.enumerateDevices().catch(() => []);
    setCameras(devs.filter(d => d.kind === "videoinput"));
  }, []);

  useEffect(() => { refreshCameras(); }, [refreshCameras]);

  /* ── Assign stream ke video element via useEffect ── */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (mediaStream) {
      vid.srcObject = mediaStream;
      vid.play().catch(e => console.warn("play():", e.name));
    } else {
      vid.srcObject = null;
    }
  }, [mediaStream]);

  /* ── WebSocket + frame sender ── */
  useEffect(() => {
    if (!mediaStream) {
      setWsStatus("off");
      setDetections([]);
      setLiveStats(null);
      setInferenceMs(null);
      return;
    }

    // Buka koneksi WebSocket
    setWsStatus("connecting");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("on");

      // Mulai kirim frame setiap FRAME_RATE ms
      // Tambahan lock mencegah flood frame ke backend.
      frameTimerRef.current = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN || sendingFrameRef.current) return;

        const vid = videoRef.current;
        const cvs = captureRef.current;

        if (!vid || !cvs || !vid.videoWidth || !vid.videoHeight) return;

        sendingFrameRef.current = true;

        try {
          cvs.width  = vid.videoWidth;
          cvs.height = vid.videoHeight;

          const ctx = cvs.getContext("2d");
          if (!ctx) {
            sendingFrameRef.current = false;
            return;
          }

          ctx.drawImage(vid, 0, 0, cvs.width, cvs.height);

          const frame = cvs.toDataURL("image/jpeg", 0.70);
          ws.send(frame);
        } catch (err) {
          console.error("Frame capture gagal:", err);
          sendingFrameRef.current = false;
        }
      }, FRAME_RATE);
    };

    ws.onmessage = (e) => {
      sendingFrameRef.current = false;
      try {
        const data = JSON.parse(e.data);
        if (data.error) { console.error("WS error:", data.error); return; }

        setDetections(data.detections || []);
        setLiveStats({
          status:          data.status,
          total_detected:  data.total_detected,
          complete_count:  data.complete_count,
          violation_count: data.violation_count,
          violations:      data.violations || [],
          avg_confidence:  data.avg_confidence,
        });
        setInferenceMs(data.inference_ms);

        // Beep jika ada pelanggaran dengan cooldown
        if (data.violation_count > 0) {
          const now = Date.now();
          if (now - lastBeepRef.current >= BEEP_CD) {
            lastBeepRef.current = now;
            playBeep(data.violations);
          }
        }
      } catch (err) {
        console.error("Parse WS message gagal:", err);
      }
    };

    ws.onclose = () => {
      setWsStatus("off");
      clearInterval(frameTimerRef.current);
    };

    ws.onerror = () => {
      sendingFrameRef.current = false;
      setWsStatus("error");
      clearInterval(frameTimerRef.current);
    };

    return () => {
      clearInterval(frameTimerRef.current);
      ws.close();
    };
  }, [mediaStream]);

  /* ── Toggle kamera ── */
  const toggleCam = useCallback(async () => {
    // Nonaktifkan
    if (camOn) {
      mediaStream?.getTracks().forEach(t => t.stop());
      setMediaStream(null);
      setCamOn(false);
      setCamError("");
      return;
    }

    // Cek support
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError("Akses kamera tidak didukung.\nGunakan browser terbaru dan buka aplikasi melalui domain HTTPS.");
      return;
    }

    setCamError("");
    try {
      // Pakai deviceId jika sudah ada daftar kamera, fallback ke default
      const camList = await navigator.mediaDevices.enumerateDevices()
        .then(d => d.filter(x => x.kind === "videoinput"))
        .catch(() => []);

      // Update daftar kamera sekaligus
      setCameras(camList);

      const selectedCam = camList[camIdx] || camList[0];
      const vc = selectedCam?.deviceId
        ? { deviceId: { exact: selectedCam.deviceId } }
        : true;

      const stream = await navigator.mediaDevices.getUserMedia({ video: vc, audio: false });

      // Set stream dulu, camOn jadi true, WebSocket useEffect akan trigger
      setMediaStream(stream);
      setCamOn(true);
      getAudioCtx();
    } catch (err) {
      console.error("Cam error:", err.name, err.message);
      setCamError(getCamError(err));
    }
  }, [camOn, camIdx, mediaStream]);

  /* ── Cleanup unmount ── */
  useEffect(() => {
    return () => {
      mediaStream?.getTracks().forEach(t => t.stop());
      clearInterval(frameTimerRef.current);
    };
  }, [mediaStream]);

  /* ── Upload gambar → POST ke backend ── */
  const handleFile = async (file) => {
    setImgRes(null);
    setImgDets([]);
    setImgLoading(true);
    setImgSrc(URL.createObjectURL(file));

    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch(UPLOAD_URL, { method:"POST", body:form });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setImgRes({
        status:          data.status,
        total_detected:  data.total_detected,
        complete_count:  data.complete_count,
        violation_count: data.violation_count,
        violations:      data.violations || [],
        avg_confidence:  data.avg_confidence,
      });
      setImgDets(data.detections || []);

      // Beep jika ada pelanggaran pada gambar
      if (data.violation_count > 0) {
        playBeep(data.violations);
      }
    } catch (err) {
      console.error("Upload error:", err.message);
      setImgRes({ status:"error", error: err.message });
    } finally {
      setImgLoading(false);
    }
  };


  const wsPillClass = wsStatus === "on"    ? "on"
                    : wsStatus === "error" ? "err"
                    : "off";

  const wsPillText = wsStatus === "on"         ? "WebSocket Terhubung, Mengirim frame ke model"
                   : wsStatus === "connecting"  ? "Menghubungkan ke backend..."
                   : wsStatus === "error"       ? "Gagal terhubung ke backend. Periksa URL backend dan status server"
                   : "WebSocket Tidak Aktif";

  return (
    <div className="det-page">
      {/* Canvas tersembunyi untuk capture frame */}
      <canvas ref={captureRef} style={{ display:"none" }}/>

      {/* Fullscreen dengan data nyata */}
      {fs && (
        <FullScreen
          onClose={() => setFs(false)}
          stream={mediaStream}
          detections={detections}
          stats={liveStats}
          inferenceMs={inferenceMs}
          cameras={cameras}
          camIdx={camIdx}
          onSwitchCamera={async (i) => {
            if (i === camIdx) return;
            // Ganti kamera: stop stream lama, buka stream baru
            mediaStream?.getTracks().forEach(t => t.stop());
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: cameras[i] ? { deviceId: { exact: cameras[i].deviceId } } : true,
                audio: false,
              });
              setMediaStream(stream);
              setCamIdx(i);
            } catch (err) {
              setCamError(getCamError(err));
            }
          }}
        />
      )}

      {/* HEADER */}
      <div className="det-hdr">
        <h1>PPE Detection</h1>
        <p>Deteksi APD real-time via kamera atau upload gambar · Model: YOLOv8 ONNX</p>
      </div>

      <div className="det-body">

        {/* ═══════ CARD KAMERA ═══════ */}
        <div className="det-card">
          <div className="det-card-head">
            <div className="det-card-ic" style={{ background:"rgba(8,145,178,.1)" }}>
              <Icon.Video s={22} c={T.teal}/>
            </div>
            <div>
              <div className="det-card-title">Deteksi Kamera Real-time</div>
              <div className="det-card-sub">WebRTC → WebSocket → YOLOv8 ONNX → hasil langsung</div>
            </div>
          </div>

          {/* Status WebSocket */}
          <div className={`ws-pill ${wsPillClass}`} style={
            wsStatus === "error" ? { background:"rgba(220,38,38,.08)", border:"1px solid rgba(220,38,38,.2)", color:T.red } : {}
          }>
            <div className={`ws-dot ${wsPillClass === "on" ? "on" : "off"}`}/>
            {wsPillText}
          </div>

          {/* Kontrol kamera */}
          <div className="cam-row">
            {cameras.length > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:6,
                background:"rgba(14,32,56,.05)", border:`1px solid ${T.border}`,
                borderRadius:8, padding:"0 10px", height:34,
              }}>
                <Icon.Camera s={13} c={T.muted}/>
                <select
                  value={camIdx}
                  onChange={async e => {
                    const i = Number(e.target.value);
                    setCamIdx(i);
                    if (!camOn || !cameras[i]) return;
                    // Jika kamera aktif, langsung switch stream
                    mediaStream?.getTracks().forEach(t => t.stop());
                    try {
                      const stream = await navigator.mediaDevices.getUserMedia({
                        video: { deviceId: { exact: cameras[i].deviceId } },
                        audio: false,
                      });
                      setMediaStream(stream);
                    } catch (err) {
                      setCamError(getCamError(err));
                    }
                  }}
                  style={{
                    background:"transparent", border:"none", outline:"none",
                    fontFamily:"inherit", fontSize:13, fontWeight:600,
                    color: T.navy, cursor:"pointer",
                    maxWidth:160,
                  }}
                >
                  {cameras.map((cam, i) => (
                    <option key={cam.deviceId || i} value={i}>
                      {cam.label?.replace(/\s*\(.*?\)/g,"").trim() || `Kamera ${i+1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button className={camOn ? "btn-danger" : "btn-navy"} onClick={toggleCam}>
              {camOn
                ? <><Icon.X s={13} c={T.red}/> Nonaktifkan</>
                : <><Icon.Video s={13} c="#fff"/> Aktifkan Kamera</>}
            </button>
            {camOn && (
              <button className="btn-teal" onClick={() => setFs(true)}>
                <Icon.Maximize s={13} c={T.teal}/> Full Screen
              </button>
            )}
          </div>

          {/* Error kamera */}
          {camError && (
            <div className="r-alert warn" style={{ marginBottom:16 }}>
              <div className="r-alert-ic"><Icon.AlertTriangle s={16} c={T.red}/></div>
              <div style={{ flex:1 }}>
                <div className="r-title">Gagal Mengakses Kamera</div>
                <div className="r-sub" style={{ whiteSpace:"pre-line" }}>{camError}</div>
                <div style={{
                  marginTop:10, padding:"10px 14px", borderRadius:8,
                  background:"rgba(220,38,38,.07)", border:"1px solid rgba(220,38,38,.15)",
                  fontSize:12, color:"#64748b", lineHeight:1.7,
                }}>
                  <strong style={{ color:"#dc2626" }}>⚠ Akses kamera membutuhkan HTTPS</strong><br/>
                  Pastikan aplikasi dibuka melalui domain deploy yang sudah memakai SSL/HTTPS.<br/>
                  Jika masih gagal, cek izin kamera pada browser lalu refresh halaman.
                </div>
              </div>
            </div>
          )}

          {/* Video + bbox overlay */}
          <div className="video-box" style={{ position:"relative", overflow:"hidden" }}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{ display:camOn?"block":"none", width:"100%", height:"100%", objectFit:"contain" }}/>
            {/* Bbox overlay real-time */}
            {camOn && (
              <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
                <BboxOverlay detections={detections} videoRef={videoRef}/>
              </div>
            )}
            {!camOn && !camError && (
              <div className="vid-ph">
                <Icon.Camera s={42} c="rgba(255,255,255,.12)"/>
                <p>Klik "Aktifkan Kamera" untuk mulai deteksi</p>
              </div>
            )}
            {!camOn && camError && (
              <div className="vid-ph">
                <Icon.AlertTriangle s={42} c="rgba(239,68,68,.3)"/>
                <p style={{ color:"rgba(239,68,68,.6)" }}>Kamera tidak dapat diakses</p>
              </div>
            )}
          </div>

          {/* Hasil deteksi real */}
          {liveStats ? (
            <ResultCards stats={liveStats} detections={detections}/>
          ) : camOn ? (
            <div className="r-alert idle" style={{ marginTop:16 }}>
              <div className="r-alert-ic"><Icon.Loader s={16} c={T.muted}/></div>
              <div>
                <div className="r-title">Menghubungkan ke model...</div>
                <div className="r-sub">Sistem sedang menghubungkan kamera ke backend deteksi</div>
              </div>
            </div>
          ) : null}
        </div>

        {/* ═══════ CARD UPLOAD ═══════ */}
        <div className="det-card">
          <div className="det-card-head">
            <div className="det-card-ic" style={{ background:"rgba(45,125,210,.1)" }}>
              <Icon.Upload s={22} c={T.accent}/>
            </div>
            <div>
              <div className="det-card-title">Deteksi dengan Gambar</div>
              <div className="det-card-sub">Unggah foto area kerja untuk langsung menganalisis penggunaan alat pelindung diri pekerja.</div>
            </div>
          </div>

          <label
            className={`drop-zone${drag?" drag":""}`}
            onDragOver={e=>{ e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e=>{ e.preventDefault(); setDrag(false); const f=e.dataTransfer.files[0]; if(f?.type.startsWith("image/")) handleFile(f); }}
          >
            <input type="file" accept="image/jpeg,image/png,image/webp"
              onChange={e=>{ if(e.target.files[0]) handleFile(e.target.files[0]); }}
              style={{ display:"none" }}/>
            <div className="drop-ic"><Icon.Upload s={22} c={T.soft}/></div>
            <div className="drop-text">Drag &amp; drop gambar atau klik untuk upload</div>
            <div className="drop-hint">JPG / PNG / WebP · Maks. 10MB</div>
          </label>

          {imgSrc && (
            <div style={{ marginTop:18 }}>
              {/* Preview gambar + bbox overlay */}
              <div style={{ position:"relative", borderRadius:14, overflow:"hidden", background:"#080f1e" }}>
                <img src={imgSrc} alt="preview"
                  style={{ width:"100%", maxHeight:400, objectFit:"contain", display:"block" }}/>
                {imgRes?.status !== "error" && imgDets.length > 0 && (
                  <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
                    <BboxOverlay detections={imgDets} videoRef={null}/>
                  </div>
                )}
              </div>

              {/* Hasil */}
              {imgLoading ? (
                <div className="r-alert idle" style={{ marginTop:12 }}>
                  <div className="r-alert-ic"><Icon.Loader s={16} c={T.muted}/></div>
                  <div>
                    <div className="r-title">Mengirim ke model...</div>
                    <div className="r-sub">sedang menganalisis gambar</div>
                  </div>
                </div>
              ) : imgRes?.status === "error" ? (
                <div className="r-alert warn" style={{ marginTop:12 }}>
                  <div className="r-alert-ic"><Icon.AlertTriangle s={16} c={T.red}/></div>
                  <div>
                    <div className="r-title">Deteksi Gagal</div>
                    <div className="r-sub">{imgRes.error}</div>
                  </div>
                </div>
              ) : imgRes ? (
                <ResultCards stats={imgRes} detections={imgDets}/>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <Footer setPage={setPage}/>
    </div>
  );
}