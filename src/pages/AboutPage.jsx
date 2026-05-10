import { useState, useEffect, useRef } from "react";
import { Icon } from "../components/icons/Icons";
import Footer from "../components/Footer";
import { T } from "../constants/tokens";

/* ─────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────── */
function Counter({ to, suffix = "", duration = 1400 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setVal(Math.floor(p * to));
        if (p < 1) requestAnimationFrame(step);
        else setVal(to);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─────────────────────────────────────
   TIMELINE STEP
───────────────────────────────────── */
function TimelineStep({ num, color, title, sub, icon, last }) {
  return (
    <div style={{ display:"flex", gap:20, position:"relative" }}>
      {/* Line */}
      {!last && (
        <div style={{
          position:"absolute", left:21, top:46, bottom:-24,
          width:2,
          background:`linear-gradient(${color}80,transparent)`,
        }}/>
      )}
      {/* Circle */}
      <div style={{
        width:44, height:44, borderRadius:"50%", flexShrink:0,
        background:`${color}18`, border:`2px solid ${color}55`,
        display:"flex", alignItems:"center", justifyContent:"center",
        zIndex:1,
      }}>
        {icon}
      </div>
      {/* Content */}
      <div style={{ paddingBottom: last ? 0 : 32 }}>
        <div style={{ fontSize:11, fontWeight:700, color, letterSpacing:".8px", textTransform:"uppercase", marginBottom:4 }}>
          Langkah {num}
        </div>
        <div style={{ fontSize:15, fontWeight:800, color:T.navy, marginBottom:5 }}>{title}</div>
        <div style={{ fontSize:13, color:T.muted, lineHeight:1.7 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   KELAS BADGE
───────────────────────────────────── */
const CLASSES = [
  { label:"APD Lengkap",     color:"#22c55e", bg:"rgba(22,163,74,.1)",   desc:"Helm & vest terdeteksi",       icon:"✓" },
  { label:"Tanpa Helm",      color:"#f97316", bg:"rgba(249,115,22,.1)",  desc:"Vest ada, helm tidak ada",     icon:"⚠" },
  { label:"Tanpa Vest",      color:"#f97316", bg:"rgba(249,115,22,.1)",  desc:"Helm ada, vest tidak ada",     icon:"⚠" },
  { label:"Tanpa APD",       color:"#ef4444", bg:"rgba(220,38,38,.1)",   desc:"Helm & vest tidak terdeteksi", icon:"✗" },
];

/* ─────────────────────────────────────
   TECH PILL
───────────────────────────────────── */
function TechPill({ name, version, color, bg }) {
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:8,
      padding:"7px 14px", borderRadius:99,
      background:bg, border:`1px solid ${color}30`,
    }}>
      <div style={{ width:7, height:7, borderRadius:"50%", background:color, boxShadow:`0 0 6px ${color}` }}/>
      <span style={{ fontSize:13, fontWeight:700, color:T.navy }}>{name}</span>
      {version && <span style={{ fontSize:11, color:T.muted }}>{version}</span>}
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN
───────────────────────────────────── */
export default function AboutPage({ setPage }) {
  const [activeClass, setActiveClass] = useState(0);

  return (
    <div style={{ background:T.bg, minHeight:"calc(100vh - 64px)" }}>

      {/* ══════ HERO ══════ */}
      <div style={{
        position:"relative", overflow:"hidden",
        background:`linear-gradient(140deg, ${T.navy} 0%, ${T.navyMid} 60%, #0d3460 100%)`,
        padding:"88px 48px 80px",
      }}>
        {/* dot grid */}
        <div style={{
          position:"absolute", inset:0, opacity:.4,
          backgroundImage:"radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)",
          backgroundSize:"28px 28px",
        }}/>
        {/* glow kiri */}
        <div style={{
          position:"absolute", top:-120, left:-80,
          width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(rgba(45,125,210,.25),transparent 70%)",
          pointerEvents:"none",
        }}/>
        {/* glow kanan */}
        <div style={{
          position:"absolute", bottom:-80, right:-40,
          width:300, height:300, borderRadius:"50%",
          background:"radial-gradient(rgba(240,180,41,.15),transparent 70%)",
          pointerEvents:"none",
        }}/>

        <div style={{ position:"relative", zIndex:1, maxWidth:720, margin:"0 auto", textAlign:"center" }}>
          {/* badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8, marginBottom:24,
            background:"rgba(45,125,210,.18)", border:"1px solid rgba(45,125,210,.35)",
            color:"#7dc4f7", fontSize:11, fontWeight:700, letterSpacing:"1px",
            textTransform:"uppercase", padding:"6px 16px", borderRadius:99,
          }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#7dc4f7", animation:"ppe-pulse 2s infinite" }}/>
            Tentang Sistem
          </div>

          <h1 style={{
            fontSize:"clamp(32px,5vw,52px)", fontWeight:800, color:"#fff",
            letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:18,
          }}>
            Deteksi APD{" "}
            <span style={{
              background:"linear-gradient(90deg,#f0b429,#fcd34d)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            }}>
              Berbasis AI
            </span>
            {" "}untuk Keselamatan Kerja
          </h1>

          <p style={{ fontSize:16, color:"rgba(255,255,255,.6)", lineHeight:1.8, maxWidth:560, margin:"0 auto 40px" }}>
            Sistem monitoring Alat Pelindung Diri (APD) secara <em style={{ color:"rgba(255,255,255,.85)", fontStyle:"normal" }}>real-time</em> menggunakan
            YOLOv8 ONNX , mendeteksi helm dan rompi keselamatan otomatis dari kamera atau foto.
          </p>

          {/* stat row */}
          <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
            {[
              { val:4,   suf:"",  label:"Kelas Deteksi",     color:"#7dc4f7" },
              { val:640, suf:"px",label:"Input Resolution",  color:T.gold },
              { val:200, suf:"ms",label:"Frame Rate",         color:"#86efac" },
              { val:50,  suf:"%", label:"Min Confidence",     color:"#c4b5fd" },
            ].map((s, i) => (
              <div key={i} style={{
                padding:"16px 22px", borderRadius:16,
                background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)",
                minWidth:110, textAlign:"center",
              }}>
                <div style={{ fontSize:26, fontWeight:800, color:s.color, letterSpacing:"-1px" }}>
                  <Counter to={s.val} suffix={s.suf} />
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:4, fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ BODY ══════ */}
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"72px 48px" }}>

        {/* ── SECTION 1: Apa itu APD ── */}
        <div style={{ marginBottom:80 }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:48, flexWrap:"wrap" }}>
            {/* Kiri teks */}
            <div style={{ flex:"1 1 300px" }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"1.2px", textTransform:"uppercase", color:T.accent, marginBottom:12 }}>
                Keselamatan Kerja
              </div>
              <h2 style={{ fontSize:28, fontWeight:800, color:T.navy, letterSpacing:"-.6px", lineHeight:1.25, marginBottom:16 }}>
                Mengapa APD itu<br/>
                <span style={{ color:T.accent }}>sangat penting?</span>
              </h2>
              <p style={{ fontSize:14, color:T.muted, lineHeight:1.85, marginBottom:20 }}>
                Setiap tahun, ribuan kecelakaan kerja terjadi di area konstruksi dan industri, mayoritas bisa dicegah jika APD digunakan dengan benar.
                Sistem ini hadir untuk memastikan setiap pekerja terlindungi secara konsisten, bukan hanya saat inspeksi.
              </p>
              <p style={{ fontSize:14, color:T.muted, lineHeight:1.85 }}>
                Berdasarkan <strong style={{ color:T.navy }}>UU No. 1/1970</strong> tentang Keselamatan Kerja dan <strong style={{ color:T.navy }}>Permenaker No. 8/2010</strong>,
                penggunaan APD bukan pilihan, melainkan kewajiban hukum yang pelanggarannya dapat berujung sanksi pidana.
              </p>
            </div>

            {/* Kanan: item APD */}
            <div style={{ flex:"1 1 280px", display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { icon:<Icon.HardHat s={18} c="#fff"/>, bg:"linear-gradient(135deg,#2d7dd2,#0891b2)", title:"Safety Helmet", desc:"Melindungi kepala dari benturan & benda jatuh. Wajib di area konstruksi, pertambangan & pabrik berat.", tag:"Wajib" },
                { icon:<Icon.Shield  s={18} c="#fff"/>, bg:"linear-gradient(135deg,#f0b429,#f97316)", title:"Safety Vest",   desc:"Rompi reflektif meningkatkan visibilitas hingga 300m, esensial di area kendaraan berat & malam hari.", tag:"Wajib" },
              ].map((item, i) => (
                <div key={i} style={{
                  display:"flex", gap:14, padding:"18px 20px", borderRadius:16,
                  background:"#fff", border:`1px solid ${T.border}`,
                  boxShadow:"0 2px 12px rgba(14,32,56,.06)",
                  transition:"all .2s",
                }}>
                  <div style={{
                    width:44, height:44, borderRadius:12, flexShrink:0,
                    background:item.bg,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 4px 12px rgba(14,32,56,.15)",
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      <span style={{ fontSize:14, fontWeight:800, color:T.navy }}>{item.title}</span>
                      <span style={{
                        fontSize:9, fontWeight:700, letterSpacing:".5px",
                        color:"#16a34a", background:"rgba(22,163,74,.1)",
                        padding:"2px 7px", borderRadius:99,
                      }}>{item.tag}</span>
                    </div>
                    <p style={{ fontSize:12, color:T.muted, lineHeight:1.7, margin:0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Kelas Deteksi Interactive ── */}
        <div style={{ marginBottom:80 }}>
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"1.2px", textTransform:"uppercase", color:T.teal, marginBottom:10 }}>
              Model YOLOv8 ONNX
            </div>
            <h2 style={{ fontSize:28, fontWeight:800, color:T.navy, letterSpacing:"-.6px" }}>
              4 Kelas yang Dideteksi
            </h2>
            <p style={{ fontSize:14, color:T.muted, marginTop:8 }}>
              Klik setiap kelas untuk melihat detailnya
            </p>
          </div>

          {/* Tab selector */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24, justifyContent:"center" }}>
            {CLASSES.map((c, i) => (
              <button
                key={i}
                onClick={() => setActiveClass(i)}
                style={{
                  padding:"8px 18px", borderRadius:99, cursor:"pointer",
                  border:`1.5px solid ${activeClass === i ? c.color : "transparent"}`,
                  background: activeClass === i ? c.bg : "rgba(14,32,56,.04)",
                  color: activeClass === i ? c.color : T.muted,
                  fontWeight:700, fontSize:13,
                  transition:"all .2s", fontFamily:"inherit",
                }}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {(() => {
            const c = CLASSES[activeClass];
            return (
              <div style={{
                padding:"28px 32px", borderRadius:20,
                background:c.bg, border:`1.5px solid ${c.color}30`,
                display:"flex", alignItems:"center", gap:28,
                transition:"all .3s",
              }}>
                <div style={{
                  width:64, height:64, borderRadius:"50%", flexShrink:0,
                  background:`${c.color}20`, border:`2px solid ${c.color}50`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:28,
                }}>
                  {c.icon}
                </div>
                <div>
                  <div style={{ fontSize:18, fontWeight:800, color:c.color, marginBottom:6 }}>{c.label}</div>
                  <div style={{ fontSize:14, color:T.navy, marginBottom:8 }}>{c.desc}</div>
                  <div style={{
                    display:"inline-flex", gap:8, alignItems:"center",
                    fontSize:12, color:T.muted,
                    background:"rgba(255,255,255,.6)", padding:"4px 12px",
                    borderRadius:8, fontFamily:"monospace",
                  }}>
                    Class ID: {activeClass} &nbsp;|&nbsp; Threshold: ≥ 0.40
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── SECTION 3: Cara Kerja Timeline ── */}
        <div style={{ marginBottom:80 }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:64, flexWrap:"wrap" }}>
            <div style={{ flex:"1 1 200px" }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"1.2px", textTransform:"uppercase", color:"#9333ea", marginBottom:12 }}>
                Alur Sistem
              </div>
              <h2 style={{ fontSize:28, fontWeight:800, color:T.navy, letterSpacing:"-.6px", lineHeight:1.25, marginBottom:12 }}>
                Bagaimana cara<br/>kerjanya?
              </h2>
              <p style={{ fontSize:14, color:T.muted, lineHeight:1.8 }}>
                Dari kamera hingga hasil deteksi, semuanya terjadi dalam hitungan milidetik menggunakan pipeline WebRTC → WebSocket → ONNX.
              </p>
            </div>

            <div style={{ flex:"2 1 320px" }}>
              <TimelineStep num={1} color={T.accent}  icon={<Icon.Video   s={18} c={T.accent}/>}  title="Ambil Frame Kamera"       sub="Browser mengakses kamera via getUserMedia() dan mengambil frame setiap 200ms menggunakan Canvas API." />
              <TimelineStep num={2} color="#9333ea"   icon={<Icon.Wifi    s={18} c="#9333ea"/>}   title="Kirim via WebSocket"       sub="Frame dikompresi ke JPEG base64 (kualitas 75%) dan dikirim ke endpoint ws://localhost:8000/ws/detect." />
              <TimelineStep num={3} color={T.gold}    icon={<Icon.Cpu     s={18} c={T.gold}/>}    title="Inferensi YOLOv8 ONNX"    sub="Backend FastAPI mendecode frame, menjalankan model ONNX (input 640×640), dan memproses output [1,8,8400]." />
              <TimelineStep num={4} color="#22c55e"   icon={<Icon.Layers  s={18} c="#22c55e"/>}   title="NMS & Postprocessing"      sub="Non-Maximum Suppression menyaring deteksi duplikat. Koordinat dikonversi ke bbox_norm (0–1) relatif gambar." last />
            </div>
          </div>
        </div>

        {/* ── SECTION 4: Arsitektur Visual ── */}
        <div style={{
          borderRadius:24, overflow:"hidden", marginBottom:80,
          background:`linear-gradient(135deg, ${T.navy} 0%, #0d3460 100%)`,
          padding:"44px 48px",
        }}>
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"1.2px", textTransform:"uppercase", color:"rgba(255,255,255,.35)", marginBottom:6 }}>
              Stack Teknis
            </div>
            <div style={{ fontSize:22, fontWeight:800, color:"#fff", letterSpacing:"-.3px" }}>Arsitektur Sistem</div>
          </div>

          {/* Flow */}
          <div style={{ display:"flex", alignItems:"center", gap:0, overflowX:"auto", paddingBottom:8 }}>
            {[
              { label:"Browser",     detail:"WebRTC Camera",    circle:"linear-gradient(135deg,#2d7dd2,#0891b2)", icon:<Icon.Video   s={16} c="#fff"/> },
              null,
              { label:"Canvas API",  detail:"Frame → JPEG",     circle:"rgba(255,255,255,.1)",                    icon:<Icon.Code    s={16} c="rgba(255,255,255,.7)"/> },
              null,
              { label:"WebSocket",   detail:"ws:// bidireksional", circle:"linear-gradient(135deg,#9333ea,#6366f1)", icon:<Icon.Wifi  s={16} c="#fff"/> },
              null,
              { label:"FastAPI",     detail:"Python Backend",   circle:"linear-gradient(135deg,#f0b429,#f97316)", icon:<Icon.Zap     s={16} c={T.navy}/> },
              null,
              { label:"YOLOv8 ONNX", detail:"Inference Engine", circle:"linear-gradient(135deg,#16a34a,#0891b2)", icon:<Icon.Cpu    s={16} c="#fff"/> },
              null,
              { label:"React UI",    detail:"Dashboard Live",   circle:"linear-gradient(135deg,#f0b429,#f59e0b)", icon:<Icon.Eye    s={16} c={T.navy}/> },
            ].map((s, i) =>
              s === null ? (
                <div key={i} style={{ flexShrink:0, width:32, display:"flex", justifyContent:"center" }}>
                  <Icon.ArrowRight s={14} c="rgba(255,255,255,.2)"/>
                </div>
              ) : (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", minWidth:80 }}>
                  <div style={{
                    width:52, height:52, borderRadius:"50%",
                    background:s.circle, marginBottom:10,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 0 0 6px rgba(255,255,255,.05)",
                  }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.85)" }}>{s.label}</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,.35)", marginTop:3, lineHeight:1.5 }}>{s.detail}</div>
                </div>
              )
            )}
          </div>

          {/* Response preview */}
          <div style={{
            marginTop:32, padding:"20px 24px", borderRadius:14,
            background:"rgba(0,0,0,.3)", border:"1px solid rgba(255,255,255,.08)",
            fontFamily:"monospace", fontSize:12, color:"rgba(255,255,255,.7)", lineHeight:1.9,
          }}>
            <div style={{ color:"rgba(255,255,255,.3)", marginBottom:8, fontSize:11, letterSpacing:".5px" }}>// Contoh JSON Response WebSocket</div>
            <div><span style={{ color:"#93c5fd" }}>"status"</span><span style={{ color:"rgba(255,255,255,.4)" }}>: </span><span style={{ color:"#86efac" }}>"violation"</span>,</div>
            <div><span style={{ color:"#93c5fd" }}>"total_detected"</span><span style={{ color:"rgba(255,255,255,.4)" }}>: </span><span style={{ color:"#fcd34d" }}>2</span>,</div>
            <div><span style={{ color:"#93c5fd" }}>"violation_count"</span><span style={{ color:"rgba(255,255,255,.4)" }}>: </span><span style={{ color:"#fca5a5" }}>1</span>,</div>
            <div><span style={{ color:"#93c5fd" }}>"avg_confidence"</span><span style={{ color:"rgba(255,255,255,.4)" }}>: </span><span style={{ color:"#fcd34d" }}>0.873</span>,</div>
            <div><span style={{ color:"#93c5fd" }}>"inference_ms"</span><span style={{ color:"rgba(255,255,255,.4)" }}>: </span><span style={{ color:"#fcd34d" }}>18.4</span></div>
          </div>
        </div>

        {/* ── SECTION 5: Tech Stack Pills ── */}
        <div style={{ marginBottom:80 }}>
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"1.2px", textTransform:"uppercase", color:T.muted, marginBottom:10 }}>
              Dibangun dengan
            </div>
            <h2 style={{ fontSize:28, fontWeight:800, color:T.navy, letterSpacing:"-.6px" }}>Tech Stack</h2>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
            {[
              { name:"React 19",    role:"Frontend SPA + WebRTC",          color:"#61dafb", bg:"rgba(97,218,251,.08)",  icon:<Icon.Code  s={22} c="#61dafb"/> },
              { name:"FastAPI",     role:"Backend REST + WebSocket",        color:"#f97316", bg:"rgba(249,115,22,.08)", icon:<Icon.Zap   s={22} c="#f97316"/> },
              { name:"YOLOv8 ONNX", role:"Object Detection Model",          color:"#9333ea", bg:"rgba(147,51,234,.08)", icon:<Icon.Cpu   s={22} c="#9333ea"/> },
              { name:"WebSocket",   role:"Real-time bidireksional",         color:T.teal,   bg:"rgba(8,145,178,.08)",  icon:<Icon.Wifi  s={22} c={T.teal}/> },
            ].map((t, i) => (
              <div key={i} style={{
                padding:"22px 20px", borderRadius:18,
                background:"#fff", border:`1px solid ${t.color}22`,
                boxShadow:"0 2px 16px rgba(14,32,56,.05)",
                transition:"all .22s",
              }}>
                <div style={{
                  width:48, height:48, borderRadius:14, marginBottom:16,
                  background:t.bg, border:`1px solid ${t.color}25`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  {t.icon}
                </div>
                <div style={{ fontSize:16, fontWeight:800, color:T.navy, marginBottom:5 }}>{t.name}</div>
                <div style={{ fontSize:12, color:T.muted, lineHeight:1.6 }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{
          borderRadius:24, padding:"52px 48px", textAlign:"center",
          background:`linear-gradient(135deg, ${T.navy}, #0d3460)`,
          position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", inset:0, opacity:.5,
            backgroundImage:"radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)",
            backgroundSize:"22px 22px",
          }}/>
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8, marginBottom:18,
              background:"rgba(240,180,41,.15)", border:"1px solid rgba(240,180,41,.3)",
              color:T.gold, fontSize:11, fontWeight:700, letterSpacing:"1px",
              textTransform:"uppercase", padding:"6px 14px", borderRadius:99,
            }}>
              Siap Digunakan
            </div>
            <h2 style={{ fontSize:30, fontWeight:800, color:"#fff", letterSpacing:"-.6px", marginBottom:12 }}>
              Mulai Deteksi Sekarang
            </h2>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.55)", marginBottom:32, maxWidth:440, margin:"0 auto 32px" }}>
              Aktifkan kamera atau upload foto area kerja, sistem akan langsung mendeteksi kepatuhan APD secara otomatis.
            </p>
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <button
                onClick={() => setPage("detection")}
                style={{
                  background:`linear-gradient(135deg, ${T.gold}, #fcd34d)`,
                  color:T.navy, border:"none", cursor:"pointer",
                  fontFamily:"inherit", fontSize:14, fontWeight:800,
                  padding:"13px 28px", borderRadius:99,
                  display:"inline-flex", alignItems:"center", gap:8,
                  boxShadow:"0 8px 24px rgba(240,180,41,.4)",
                  transition:"all .2s",
                }}
              >
                <Icon.Video s={15} c={T.navy}/> Buka Deteksi
              </button>
              <button
                onClick={() => setPage("home")}
                style={{
                  background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.8)",
                  border:"1px solid rgba(255,255,255,.18)", cursor:"pointer",
                  fontFamily:"inherit", fontSize:14, fontWeight:600,
                  padding:"12px 24px", borderRadius:99,
                  display:"inline-flex", alignItems:"center", gap:8,
                  transition:"all .2s",
                }}
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>

      </div>

      <Footer setPage={setPage} />
    </div>
  );
}