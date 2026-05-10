import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "../components/icons/Icons";
import Footer from "../components/Footer";
import { T } from "../constants/tokens";

/* ═══════════════════════════════════════════════════════════
   KONSTANTA
═══════════════════════════════════════════════════════════ */
const WS_URL      = "ws://localhost:8000/ws/detect";
const UPLOAD_URL  = "http://localhost:8000/api/detect/image";
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
   AUDIO — Web Audio API beep
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
   HELPER — pesan error kamera
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
    default:
      return `Gagal akses kamera: ${err.message}\nGunakan localhost atau HTTPS.`;
  }
}

/* ═══════════════════════════════════════════════════════════
   BBOX OVERLAY — div overlay posisi berdasar bbox_norm
═══════════════════════════════════════════════════════════ */
function BboxOverlay({ detections }) {
  if (!detections?.length) return null;
  return (
    <>
      {detections.map((d, i) => {
        const [x1, y1, x2, y2] = d.bbox_norm;
        const color = CLASS_COLOR[d.label] || "#fff";
        return (
          <div
            key={i}
            style={{
              position:  "absolute",
              left:      `${x1 * 100}%`,
              top:       `${y1 * 100}%`,
              width:     `${(x2 - x1) * 100}%`,
              height:    `${(y2 - y1) * 100}%`,
              border:    `2px solid ${color}`,
              boxShadow: `0 0 8px ${color}80`,
              pointerEvents: "none",
            }}
          >
            <div style={{
              position:   "absolute",
              top:        -22,
              left:       -2,
              background: color,
              color:      "#0c1f35",
              fontSize:   11,
              fontWeight: 800,
              padding:    "2px 7px",
              borderRadius: "4px 4px 4px 0",
              whiteSpace: "nowrap",
              letterSpacing: ".3px",
            }}>
              {CLASS_LABEL[d.label] || d.label} &nbsp; {(d.confidence * 100).toFixed(1)}%
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   FULLSCREEN — data nyata, tanpa dummy
═══════════════════════════════════════════════════════════ */
function FullScreen({ onClose, stream, detections, stats, inferenceMs }) {
  const fsRef  = useRef(null);
  const [bars, setBars] = useState(Array(10).fill(20));
  const [sel,  setSel]  = useState("STREAM 01 (KAMERA)");

  // Assign stream ke video fullscreen
  useEffect(() => {
    if (fsRef.current && stream) {
      fsRef.current.srcObject = stream;
      fsRef.current.play().catch(() => {});
    }
  }, [stream]);

  // Animasi bar chart dari avg_confidence
  useEffect(() => {
    const base = stats?.avg_confidence ? stats.avg_confidence * 100 : 50;
    setBars(prev => prev.map(() => Math.max(10, Math.min(100, base + (Math.random() * 20 - 10)))));
  }, [stats]);

  const total      = stats?.total_detected  ?? 0;
  const complete   = stats?.complete_count  ?? 0;
  const violations = stats?.violation_count ?? 0;
  const avgConf    = stats?.avg_confidence  ? (stats.avg_confidence * 100).toFixed(1) : "—";
  const ms         = inferenceMs ?? "—";

  return (
    <div className="fs-overlay">
      {/* TOP BAR */}
      <div className="fs-topbar">
        <div className="fs-live">
          <div className="fs-dot" />
          <div>
            <div className="fs-id">LIVE {sel}</div>
            <div className="fs-loc">
              {stats?.status === "violation"
                ? `⚠ ${violations} PELANGGARAN APD TERDETEKSI`
                : stats?.status === "complete"
                  ? `✓ ${total} PEKERJA — APD LENGKAP`
                  : "Menunggu deteksi..."}
            </div>
          </div>
        </div>
        <div className="fs-center">
          <select className="fs-sel" value={sel} onChange={e => setSel(e.target.value)}>
            {["STREAM 01 (KAMERA)", "STREAM 02 (AREA A)", "STREAM 03 (AREA B)", "STREAM 04 (PINTU MASUK)"].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div className="fs-ibtn"><Icon.Eye s={14} c="#fff"/></div>
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

        {/* Bbox overlay real detections */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <BboxOverlay detections={detections}/>
        </div>

        {/* Alert banner */}
        {stats?.status === "violation" && (
          <div style={{
            position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)",
            background:"rgba(220,38,38,.85)", color:"#fff",
            padding:"10px 24px", borderRadius:999,
            fontSize:13, fontWeight:700, letterSpacing:".5px",
            backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,.2)",
          }}>
            ⚠ PELANGGARAN APD — {detections?.filter(d=>d.label!=="complete_vest_helmet").map(d=>CLASS_LABEL[d.label]).join(", ")}
          </div>
        )}

        <div className="fs-scan"/>
      </div>

      {/* FOOTER STATS — semua dari data nyata */}
      <div className="fs-foot">
        {/* Kiri: jumlah */}
        <div className="fs-stats">
          <div className="fs-big">
            <div className="fs-lbl">Total Terdeteksi</div>
            <div className="fs-val" style={{ color: violations > 0 ? "#f87171" : "#fff" }}>{total}</div>
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

        {/* Tengah: bar chart dari confidence */}
        <div className="fs-bars">
          {bars.map((h, i) => (
            <div key={i} className="fs-bar" style={{
              height: `${h}%`,
              background: violations > 0 ? "rgba(248,113,113,.7)" : "rgba(74,222,128,.7)",
            }}/>
          ))}
        </div>

        {/* Kanan: akurasi + teknis */}
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
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RESULT CARDS — tampil hasil deteksi
═══════════════════════════════════════════════════════════ */
function ResultCards({ stats, detections }) {
  const isViolation   = stats.status === "violation";
  const isComplete    = stats.status === "complete";
  const isNoDetection = stats.status === "no_detection";

  return (
    <>
      {/* Status alert */}
      <div className={`r-alert ${isViolation ? "warn" : isComplete ? "ok" : "idle"}`}>
        <div className="r-alert-ic">
          {isViolation   ? <Icon.AlertTriangle s={16} c={T.red}/>
         : isComplete    ? <Icon.Check s={16} c={T.green}/>
         : <Icon.Loader  s={16} c={T.muted}/>}
        </div>
        <div>
          <div className="r-title">
            {isViolation   ? `⚠ Pelanggaran APD Terdeteksi (${stats.violation_count} orang)`
           : isComplete    ? `✓ APD Lengkap — ${stats.total_detected} orang terdeteksi`
           : "Tidak ada orang terdeteksi"}
          </div>
          <div className="r-sub">
            {isNoDetection
              ? "Arahkan kamera ke area kerja"
              : `${stats.complete_count} lengkap · ${stats.violation_count} pelanggaran · avg ${(stats.avg_confidence*100).toFixed(1)}%`}
          </div>
        </div>
      </div>

      {/* Stat boxes */}
      <div className="stat-row">
        <div className="stat-box">
          <div className="stat-ic" style={{ background:"rgba(45,125,210,.1)" }}>
            <Icon.Activity s={17} c={T.accent}/>
          </div>
          <div className="stat-num">{stats.total_detected}</div>
          <div className="stat-lbl">Terdeteksi</div>
        </div>

        <div className="stat-box">
          <div className="stat-ic" style={{ background:"rgba(22,163,74,.1)" }}>
            <Icon.Check s={17} c={T.green}/>
          </div>
          <div className="stat-num" style={{ color: T.green }}>{stats.complete_count}</div>
          <div className="stat-lbl">APD Lengkap</div>
        </div>

        <div className="stat-box">
          <div className="stat-ic" style={{ background:"rgba(220,38,38,.08)" }}>
            <Icon.AlertTriangle s={17} c={T.red}/>
          </div>
          <div className="stat-num" style={{ color: stats.violation_count > 0 ? T.red : T.navy }}>
            {stats.violation_count}
          </div>
          <div className="stat-lbl">Pelanggaran</div>
        </div>

        <div className="stat-box">
          <div className="stat-ic" style={{ background:"rgba(8,145,178,.1)" }}>
            <Icon.Activity s={17} c={T.teal}/>
          </div>
          <div className="stat-num" style={{ fontSize:22 }}>
            {stats.avg_confidence ? `${(stats.avg_confidence*100).toFixed(0)}%` : "—"}
          </div>
          <div className="stat-lbl">Avg Confidence</div>
        </div>
      </div>

      {/* Detail per orang yang terdeteksi */}
      {detections.length > 0 && (
        <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:8 }}>
          {detections.map((d, i) => {
            const color = CLASS_COLOR[d.label] || "#64748b";
            const isVio = d.label !== "complete_vest_helmet";
            return (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                background: isVio ? "rgba(220,38,38,.05)" : "rgba(22,163,74,.05)",
                border: `1px solid ${color}30`,
                borderLeft: `3px solid ${color}`,
                borderRadius:10, padding:"10px 14px",
              }}>
                <div style={{
                  width:10, height:10, borderRadius:"50%", background:color, flexShrink:0,
                }}/>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#0c1f35" }}>
                    Orang {i+1} — {CLASS_LABEL[d.label] || d.label}
                  </span>
                </div>
                <div style={{
                  fontSize:12, fontWeight:700, color,
                  background:`${color}18`, padding:"2px 10px", borderRadius:99,
                }}>
                  {(d.confidence*100).toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
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
    if (!camOn || !mediaStream) {
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
      frameTimerRef.current = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const vid = videoRef.current;
        const cvs = captureRef.current;
        if (!vid || !cvs || !vid.videoWidth) return;

        cvs.width  = vid.videoWidth;
        cvs.height = vid.videoHeight;
        cvs.getContext("2d").drawImage(vid, 0, 0);
        ws.send(cvs.toDataURL("image/jpeg", 0.75));
      }, FRAME_RATE);
    };

    ws.onmessage = (e) => {
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
      setWsStatus("error");
      clearInterval(frameTimerRef.current);
    };

    return () => {
      clearInterval(frameTimerRef.current);
      ws.close();
    };
  }, [camOn, mediaStream]);

  /* ── Toggle kamera ── */
  const toggleCam = useCallback(async () => {
    if (camOn) {
      mediaStream?.getTracks().forEach(t => t.stop());
      setMediaStream(null);
      setCamOn(false);
      setCamError("");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError("Browser tidak mendukung WebRTC.\nGunakan Chrome/Firefox/Edge via localhost atau HTTPS.");
      return;
    }

    setCamError("");
    try {
      const vc = cameras[camIdx]
        ? { deviceId: { exact: cameras[camIdx].deviceId } }
        : { facingMode: "user" };

      const stream = await navigator.mediaDevices.getUserMedia({ video: vc, audio: false });
      await refreshCameras();
      setMediaStream(stream);
      setCamOn(true);

      // Resume AudioContext saat ada user gesture (klik tombol)
      getAudioCtx();
    } catch (err) {
      console.error("Cam error:", err.name, err.message);
      setCamError(getCamError(err));
    }
  }, [camOn, cameras, camIdx, mediaStream, refreshCameras]);

  /* ── Ganti kamera ── */
  const switchCamera = useCallback(async () => {
    const next = (camIdx + 1) % Math.max(cameras.length, 1);
    setCamIdx(next);
    if (!camOn || cameras.length < 2) return;
    mediaStream?.getTracks().forEach(t => t.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameras[next] ? { deviceId:{ exact:cameras[next].deviceId } } : true,
        audio: false,
      });
      setMediaStream(stream);
    } catch (err) {
      setCamError(getCamError(err));
      setCamOn(false);
      setMediaStream(null);
    }
  }, [camOn, camIdx, cameras, mediaStream]);

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

  const camLabel = cameras[camIdx]?.label?.replace(/\s*\(.*?\)/g,"").trim() || `Kamera ${camIdx+1}`;

  const wsPillClass = wsStatus === "on"    ? "on"
                    : wsStatus === "error" ? "err"
                    : "off";

  const wsPillText = wsStatus === "on"         ? "WebSocket Terhubung — Mengirim frame ke model"
                   : wsStatus === "connecting"  ? "Menghubungkan ke backend..."
                   : wsStatus === "error"       ? "Gagal terhubung ke backend (pastikan server berjalan)"
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
            {cameras.length > 1 && (
              <button className="btn-outline" onClick={switchCamera}>
                <Icon.Camera s={13} c={T.muted}/> {camLabel}
              </button>
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
              <div>
                <div className="r-title">Gagal Mengakses Kamera</div>
                <div className="r-sub" style={{ whiteSpace:"pre-line" }}>{camError}</div>
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
                <BboxOverlay detections={detections}/>
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
                <div className="r-sub">Pastikan backend FastAPI berjalan di localhost:8000</div>
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
              <div className="det-card-sub">Upload foto area kerja → analisis langsung via POST /api/detect/image</div>
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
                    <BboxOverlay detections={imgDets}/>
                  </div>
                )}
              </div>

              {/* Hasil */}
              {imgLoading ? (
                <div className="r-alert idle" style={{ marginTop:12 }}>
                  <div className="r-alert-ic"><Icon.Loader s={16} c={T.muted}/></div>
                  <div>
                    <div className="r-title">Mengirim ke model...</div>
                    <div className="r-sub">YOLOv8 sedang menganalisis gambar</div>
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