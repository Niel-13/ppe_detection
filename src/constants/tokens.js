/* ─────────────────────────────────────────
   DESIGN TOKENS
   Warna dan nilai desain global
───────────────────────────────────────── */
export const T = {
    navy: "#0c1f35",
    navyMid: "#14304f",
    navyLight: "#1e4976",
    accent: "#2d7dd2",
    gold: "#f0b429",
    goldDark: "#c9920a",
    teal: "#0891b2",
    green: "#16a34a",
    red: "#dc2626",
    bg: "#eef4fb",
    white: "#ffffff",
    border: "rgba(14,32,56,.09)",
    muted: "#64748b",
    soft: "#94a3b8",
};

/* ─────────────────────────────────────────
   INJECT GLOBAL STYLES
   Dipanggil sekali di App.jsx
───────────────────────────────────────── */
export const injectStyles = () => {
    if (document.getElementById("ppe-v4")) return;
    const el = document.createElement("style");
    el.id = "ppe-v4";
    el.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Plus Jakarta Sans',sans-serif;background:${T.bg};color:${T.navy};-webkit-font-smoothing:antialiased;overflow-x:hidden}
@keyframes ppe-spin{to{transform:rotate(360deg)}}
@keyframes ppe-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes ppe-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.82)}}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(14,32,56,.18);border-radius:99px}

/* NAV */
.nav{position:sticky;top:0;z-index:200;height:64px;background:rgba(12,31,53,.98);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:space-between;padding:0 48px;border-bottom:1px solid rgba(255,255,255,.07)}
.nav-logo{display:flex;align-items:center;gap:10px;cursor:pointer;transition:opacity .18s}
.nav-logo:hover{opacity:.85}
.nav-logo-mark{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,${T.accent},${T.teal});display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(45,125,210,.35)}
.nav-logo-name{color:#fff;font-size:15px;font-weight:700;letter-spacing:-.2px}
.nav-logo-sub{color:rgba(255,255,255,.35);font-size:11px;font-weight:400}
.nav-links{display:flex;align-items:center;gap:2px}
.nav-link{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.55);font-family:inherit;font-size:14px;font-weight:500;padding:7px 14px;border-radius:8px;transition:all .18s;letter-spacing:.1px}
.nav-link:hover{color:#fff;background:rgba(255,255,255,.08)}
.nav-link.active{color:#fff;background:rgba(255,255,255,.1);font-weight:600}
.btn-cta{background:${T.gold};color:${T.navy};border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;padding:9px 20px;border-radius:99px;display:flex;align-items:center;gap:7px;transition:all .18s;letter-spacing:.1px}
.btn-cta:hover{background:${T.goldDark};transform:translateY(-1px);box-shadow:0 6px 20px rgba(240,180,41,.4)}

/* HERO */
.hero{position:relative;overflow:hidden;min-height:540px;background:linear-gradient(140deg,${T.navy} 0%,${T.navyMid} 55%,#0d3460 100%);display:flex;align-items:center}
.hero-bg-img{position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=75') center/cover no-repeat;opacity:.09}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);background-size:44px 44px}
.hero::after{content:'';position:absolute;top:-120px;right:-80px;width:420px;height:420px;border-radius:50%;background:radial-gradient(rgba(45,125,210,.2),transparent 70%);pointer-events:none}
.hero-content{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:88px 48px;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;width:100%}
.hero-left{animation:ppe-up .55s ease both}
.hero-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(45,125,210,.18);border:1px solid rgba(45,125,210,.35);color:#7dc4f7;font-size:12px;font-weight:600;letter-spacing:.4px;padding:5px 12px;border-radius:99px;margin-bottom:22px}
.hero-badge-dot{width:6px;height:6px;border-radius:50%;background:#7dc4f7;animation:ppe-pulse 2s infinite}
.hero h1{font-size:48px;font-weight:800;color:#fff;line-height:1.1;letter-spacing:-1.5px;margin-bottom:18px}
.hero h1 em{color:${T.gold};font-style:normal;background:linear-gradient(90deg,${T.gold},#fcd34d);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-sub{font-size:15px;color:rgba(255,255,255,.6);line-height:1.82;margin-bottom:34px;max-width:420px}
.hero-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.btn-primary{background:linear-gradient(135deg,${T.gold},#fcd34d);color:${T.navy};border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;padding:12px 26px;border-radius:99px;display:inline-flex;align-items:center;gap:8px;transition:all .2s;letter-spacing:.1px}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(240,180,41,.45)}
.btn-ghost{background:rgba(255,255,255,.08);color:rgba(255,255,255,.82);border:1px solid rgba(255,255,255,.18);cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;padding:11px 22px;border-radius:99px;display:inline-flex;align-items:center;gap:8px;transition:all .2s}
.btn-ghost:hover{background:rgba(255,255,255,.14);color:#fff;border-color:rgba(255,255,255,.3)}
.hero-right{animation:ppe-up .55s .15s ease both}
.hero-stats{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.h-stat{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:22px 18px;transition:all .22s;backdrop-filter:blur(8px)}
.h-stat:hover{background:rgba(255,255,255,.11);transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.2)}
.h-stat.gold{border-color:rgba(240,180,41,.25);background:rgba(240,180,41,.07)}
.h-stat-num{font-size:30px;font-weight:800;color:#fff;letter-spacing:-1px;line-height:1;margin:10px 0 5px}
.h-stat.gold .h-stat-num{color:${T.gold}}
.h-stat-lbl{font-size:12px;color:rgba(255,255,255,.42);font-weight:500}

/* FEATURES STRIP */
.feat-strip{background:${T.white};border-bottom:1px solid ${T.border};display:flex;justify-content:center}
.feat-inner{max-width:1100px;width:100%;display:grid;grid-template-columns:repeat(3,1fr)}
.feat-item{display:flex;align-items:center;gap:16px;padding:30px 36px;border-right:1px solid ${T.border};transition:all .2s;cursor:default}
.feat-item:last-child{border-right:none}
.feat-item:hover{background:rgba(45,125,210,.03)}
.feat-item:hover .feat-ic{transform:scale(1.08)}
.feat-ic{width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .2s}
.feat-title{font-size:14px;font-weight:700;color:${T.navy};letter-spacing:-.1px}
.feat-desc{font-size:12px;color:${T.muted};margin-top:3px;line-height:1.6}

/* SECTION */
.sec{padding:96px 48px}
.sec-inner{max-width:1100px;margin:0 auto}
.sec-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(45,125,210,.07);border:1px solid rgba(45,125,210,.18);color:${T.accent};font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;padding:5px 13px;border-radius:99px;margin-bottom:16px}
.sec-title{font-size:36px;font-weight:800;color:${T.navy};letter-spacing:-.9px;line-height:1.18}
.sec-sub{font-size:15px;color:${T.muted};line-height:1.78;margin-top:10px}
.sec-hdr{margin-bottom:60px}
.tc{text-align:center}
.tc .sec-tag{display:inline-flex}

/* ABOUT GRID */
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.about-img-wrap{border-radius:22px;overflow:hidden;box-shadow:0 28px 72px rgba(14,32,56,.16)}
.about-img-wrap img{width:100%;display:block;transition:transform .4s}
.about-img-wrap:hover img{transform:scale(1.03)}
.about-caption{font-size:13px;color:${T.muted};line-height:1.75;margin-top:14px;padding:14px 16px;background:rgba(14,32,56,.03);border-radius:11px;border:1px solid rgba(14,32,56,.08);font-style:italic}
.ppe-items{display:flex;flex-direction:column;gap:12px;margin-top:22px}
.ppe-item{display:flex;gap:14px;align-items:flex-start;background:#f7fafd;border:1px solid ${T.border};border-radius:15px;padding:18px;transition:all .22s}
.ppe-item:hover{border-color:rgba(45,125,210,.28);box-shadow:0 6px 20px rgba(14,32,56,.08);transform:translateX(5px)}
.ppe-ic{width:40px;height:40px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.ppe-item-title{font-size:14px;font-weight:700;color:${T.navy};margin-bottom:4px;letter-spacing:-.1px}
.ppe-item-desc{font-size:13px;color:${T.muted};line-height:1.65}

/* HOW IT WORKS */
.how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.how-card{background:${T.white};border:1px solid ${T.border};border-radius:22px;padding:34px 28px;position:relative;overflow:hidden;transition:all .25s;cursor:default}
.how-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(45,125,210,.03),transparent);opacity:0;transition:opacity .25s}
.how-card:hover{border-color:rgba(45,125,210,.25);box-shadow:0 16px 48px rgba(14,32,56,.1);transform:translateY(-5px)}
.how-card:hover::before{opacity:1}
.how-num{position:absolute;top:16px;right:18px;font-size:64px;font-weight:800;color:rgba(14,32,56,.035);line-height:1;letter-spacing:-2px}
.how-ic{width:54px;height:54px;border-radius:15px;display:flex;align-items:center;justify-content:center;margin-bottom:22px}
.how-card h3{font-size:17px;font-weight:800;color:${T.navy};margin-bottom:10px;letter-spacing:-.2px}
.how-card p{font-size:13px;color:${T.muted};line-height:1.78}

/* CTA */
.cta-sec{background:linear-gradient(140deg,${T.navy} 0%,#0d3460 100%);padding:96px 48px;text-align:center;position:relative;overflow:hidden}
.cta-sec::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px);background-size:28px 28px}
.cta-sec::after{content:'';position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:600px;height:300px;border-radius:50%;background:radial-gradient(rgba(45,125,210,.18),transparent 70%);pointer-events:none}
.cta-inner{position:relative;z-index:1;max-width:560px;margin:0 auto}
.cta-sec h2{font-size:38px;font-weight:800;color:#fff;letter-spacing:-1px;margin-bottom:14px}
.cta-sec p{font-size:16px;color:rgba(255,255,255,.55);margin-bottom:34px;line-height:1.75}
.cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

/* FOOTER */
.footer{background:${T.navy};padding:26px 48px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,.06)}
.footer-links{display:flex;gap:2px}
.footer-link{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.38);font-family:inherit;font-size:13px;padding:6px 12px;border-radius:7px;transition:all .15s;font-weight:500}
.footer-link:hover{color:rgba(255,255,255,.85);background:rgba(255,255,255,.07)}
.footer-copy{font-size:12px;color:rgba(255,255,255,.2);font-weight:400}

/* ABOUT PAGE */
.about-page{background:${T.bg};min-height:calc(100vh - 64px)}
.about-hero{background:linear-gradient(135deg,${T.navy},${T.navyMid});padding:72px 48px;text-align:center;position:relative;overflow:hidden}
.about-hero::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px);background-size:24px 24px}
.about-hero-inner{position:relative;z-index:1;max-width:640px;margin:0 auto}
.about-hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(45,125,210,.15);border:1px solid rgba(45,125,210,.28);color:#7dc4f7;font-size:12px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;padding:6px 14px;border-radius:99px;margin-bottom:20px}
.about-hero h1{font-size:40px;font-weight:800;color:#fff;letter-spacing:-1px;margin-bottom:14px}
.about-hero h1 span{color:${T.gold}}
.about-hero p{font-size:15px;color:rgba(255,255,255,.58);line-height:1.75}
.about-body{padding:64px 48px;max-width:1000px;margin:0 auto}
.flow-block{background:${T.navy};border-radius:24px;padding:44px 48px;margin-bottom:56px}
.flow-label{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:6px}
.flow-title{font-size:22px;font-weight:800;color:#fff;letter-spacing:-.3px;margin-bottom:32px}
.flow-steps{display:flex;align-items:center;gap:0}
.flow-step{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center}
.flow-circle{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;border:2px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06)}
.flow-circle.blue{background:${T.accent};border-color:${T.accent};box-shadow:0 0 0 6px rgba(45,125,210,.2)}
.flow-circle.amber{background:${T.gold};border-color:${T.gold};box-shadow:0 0 0 6px rgba(240,180,41,.2)}
.flow-lbl{font-size:12px;font-weight:700;color:rgba(255,255,255,.85)}
.flow-detail{font-size:10px;color:rgba(255,255,255,.38);margin-top:3px;line-height:1.5}
.flow-arrow{flex-shrink:0;width:28px;display:flex;justify-content:center;color:rgba(255,255,255,.22)}
.about-section-intro{text-align:center;margin-bottom:36px}
.about-section-intro h2{font-size:24px;font-weight:800;color:${T.navy};letter-spacing:-.4px}
.about-section-intro p{font-size:14px;color:${T.muted};margin-top:6px}
.info-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-bottom:52px}
.ic{background:${T.white};border:1.5px solid ${T.border};border-radius:20px;padding:24px;cursor:pointer;transition:all .22s;position:relative;overflow:hidden}
.ic::after{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--ac,${T.accent});opacity:0;transition:opacity .2s;border-radius:3px 0 0 3px}
.ic:hover{border-color:rgba(45,125,210,.22);box-shadow:0 8px 32px rgba(14,32,56,.08);transform:translateY(-2px)}
.ic:hover::after,.ic.open::after{opacity:1}
.ic.open{border-color:rgba(45,125,210,.28);box-shadow:0 8px 32px rgba(14,32,56,.1)}
.ic-top{display:flex;align-items:flex-start;gap:14px}
.ic-icon{width:46px;height:46px;border-radius:13px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.ic-body{flex:1}
.ic-title{font-size:16px;font-weight:700;color:${T.navy};margin-bottom:5px}
.ic-desc{font-size:13px;color:${T.muted};line-height:1.65}
.ic-chevron{flex-shrink:0;color:${T.soft};transition:transform .25s,color .2s;margin-top:2px}
.ic.open .ic-chevron{transform:rotate(180deg);color:${T.accent}}
.ic-details{margin-top:20px;padding-top:20px;border-top:1px solid ${T.border};display:flex;flex-direction:column;gap:12px}
.ic-detail{background:#f7fafd;border-radius:12px;padding:14px 16px;border-left:3px solid var(--ac,${T.accent})}
.ic-detail-label{font-size:11px;font-weight:700;color:${T.navy};margin-bottom:5px;text-transform:uppercase;letter-spacing:.3px}
.ic-detail-text{font-size:13px;color:${T.muted};line-height:1.7}
.ic-code{font-family:'Courier New',monospace;font-size:11.5px;background:#1e293b;color:#7dd3fc;padding:10px 14px;border-radius:8px;margin-top:8px;overflow-x:auto;white-space:pre;line-height:1.6}
.tech-title{font-size:20px;font-weight:800;color:${T.navy};letter-spacing:-.3px;margin-bottom:20px}
.tech-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:32px}
.tech-card{background:${T.white};border:1px solid ${T.border};border-radius:16px;padding:22px 18px;text-align:center;transition:all .2s}
.tech-card:hover{border-color:rgba(45,125,210,.25);box-shadow:0 6px 24px rgba(14,32,56,.08);transform:translateY(-3px)}
.tech-ic{width:48px;height:48px;border-radius:14px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center}
.tech-name{font-size:15px;font-weight:700;color:${T.navy};margin-bottom:4px}
.tech-role{font-size:11px;color:${T.muted};line-height:1.5}
.about-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.api-btn{display:inline-flex;align-items:center;gap:8px;background:rgba(45,125,210,.08);border:1px solid rgba(45,125,210,.2);color:${T.accent};padding:9px 18px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;transition:all .18s;font-family:inherit}
.api-btn:hover{background:${T.accent};color:#fff;border-color:${T.accent}}

/* DETECTION PAGE */
.det-page{min-height:calc(100vh - 64px);background:${T.bg}}
.det-hdr{background:${T.white};border-bottom:1px solid ${T.border};padding:40px 48px;text-align:center}
.det-hdr h1{font-size:32px;font-weight:800;color:${T.navy};letter-spacing:-.6px}
.det-hdr p{font-size:15px;color:${T.muted};margin-top:6px}
.det-body{max-width:880px;margin:0 auto;padding:36px 48px 80px;display:flex;flex-direction:column;gap:28px}
.det-card{background:${T.white};border:1px solid ${T.border};border-radius:20px;padding:32px;box-shadow:0 2px 12px rgba(14,32,56,.04)}
.det-card-head{display:flex;align-items:center;gap:14px;margin-bottom:24px}
.det-card-ic{width:48px;height:48px;border-radius:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.det-card-title{font-size:18px;font-weight:700;color:${T.navy}}
.det-card-sub{font-size:13px;color:${T.muted};margin-top:2px}
.ws-pill{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:99px;font-size:12px;font-weight:600;margin-bottom:18px}
.ws-pill.on{background:rgba(22,163,74,.08);border:1px solid rgba(22,163,74,.2);color:#15803d}
.ws-pill.off{background:rgba(100,116,139,.08);border:1px solid rgba(100,116,139,.18);color:${T.muted}}
.ws-dot{width:7px;height:7px;border-radius:50%}
.ws-dot.on{background:${T.green};animation:ppe-pulse 1.8s infinite}
.ws-dot.off{background:${T.soft}}
.cam-row{display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap}
.btn-outline{background:transparent;border:1px solid ${T.border};color:${T.muted};font-family:inherit;font-size:13px;font-weight:600;padding:8px 16px;border-radius:99px;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .18s}
.btn-outline:hover{border-color:rgba(14,32,56,.22);color:${T.navy};background:rgba(14,32,56,.02)}
.btn-navy{background:${T.navy};color:#fff;border:none;font-family:inherit;font-size:13px;font-weight:700;padding:9px 20px;border-radius:99px;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .18s}
.btn-navy:hover{background:${T.navyMid};transform:translateY(-1px);box-shadow:0 4px 14px rgba(14,32,56,.2)}
.btn-danger{background:rgba(220,38,38,.08);color:${T.red};border:1px solid rgba(220,38,38,.18);font-family:inherit;font-size:13px;font-weight:700;padding:9px 20px;border-radius:99px;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .18s}
.btn-danger:hover{background:${T.red};color:#fff}
.btn-teal{background:rgba(8,145,178,.08);color:${T.teal};border:1px solid rgba(8,145,178,.18);font-family:inherit;font-size:13px;font-weight:600;padding:8px 16px;border-radius:99px;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .18s;margin-left:auto}
.btn-teal:hover{background:${T.teal};color:#fff}
.video-box{border-radius:14px;overflow:hidden;background:#0a1628;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center}
.video-box video{width:100%;height:100%;object-fit:cover;display:block}
.vid-ph{text-align:center;color:rgba(255,255,255,.22);display:flex;flex-direction:column;align-items:center;gap:10px}
.vid-ph p{font-size:13px;max-width:230px;line-height:1.6}
.r-alert{margin-top:18px;border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:12px}
.r-alert.ok{background:rgba(22,163,74,.07);border:1px solid rgba(22,163,74,.18)}
.r-alert.warn{background:rgba(220,38,38,.06);border:1px solid rgba(220,38,38,.16)}
.r-alert.idle{background:rgba(100,116,139,.06);border:1px solid rgba(100,116,139,.14)}
.r-alert-ic{width:32px;height:32px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.r-alert.ok .r-alert-ic{background:rgba(22,163,74,.12);color:${T.green}}
.r-alert.warn .r-alert-ic{background:rgba(220,38,38,.1);color:${T.red}}
.r-alert.idle .r-alert-ic{background:rgba(100,116,139,.1);color:${T.muted}}
.r-title{font-size:14px;font-weight:700;color:${T.navy};margin-bottom:2px}
.r-sub{font-size:13px;color:${T.muted}}
.stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:16px}
.stat-box{background:#f7fafd;border:1px solid ${T.border};border-radius:14px;padding:18px 16px;text-align:center}
.stat-ic{width:36px;height:36px;border-radius:10px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center}
.stat-num{font-size:30px;font-weight:800;color:${T.navy};line-height:1;letter-spacing:-1px}
.stat-lbl{font-size:12px;color:${T.muted};margin-top:4px;font-weight:500}
.conf-box{background:#f7fafd;border:1px solid ${T.border};border-radius:14px;padding:16px}
.conf-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:10px}
.conf-pill.ok{background:rgba(22,163,74,.1);color:#15803d}
.conf-pill.warn{background:rgba(220,38,38,.08);color:#b91c1c}
.conf-row{display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;color:${T.muted}}
.conf-row .ok{color:${T.green};font-weight:700}
.conf-row .warn{color:${T.red};font-weight:700}
.conf-bar{height:4px;background:rgba(14,32,56,.07);border-radius:99px;overflow:hidden;margin-top:6px}
.conf-fill{height:100%;border-radius:99px;transition:width .6s ease}
.drop-zone{border:2px dashed rgba(14,32,56,.14);border-radius:14px;padding:40px 24px;text-align:center;cursor:pointer;transition:all .2s;display:block;background:#fafbfd}
.drop-zone:hover,.drop-zone.drag{border-color:${T.accent};background:rgba(45,125,210,.04)}
.drop-ic{width:48px;height:48px;border-radius:14px;background:rgba(14,32,56,.05);display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
.drop-text{font-size:14px;font-weight:600;color:${T.navy};margin-bottom:4px}
.drop-hint{font-size:12px;color:${T.soft}}

/* FULLSCREEN */
.fs-overlay{position:fixed;inset:0;z-index:9999;background:#060d18;display:flex;flex-direction:column;font-family:'Plus Jakarta Sans',sans-serif}
.fs-topbar{position:absolute;top:0;left:0;right:0;z-index:10;display:flex;align-items:center;gap:14px;padding:16px 24px;background:linear-gradient(to bottom,rgba(6,13,24,.95),transparent)}
.fs-live{display:flex;align-items:center;gap:8px}
.fs-dot{width:8px;height:8px;border-radius:50%;background:#f87171;animation:ppe-pulse 1.5s infinite}
.fs-id{color:#fff;font-size:16px;font-weight:800;letter-spacing:.5px}
.fs-loc{font-size:10px;color:rgba(255,255,255,.38);letter-spacing:.5px}
.fs-center{flex:1;display:flex;justify-content:center}
.fs-sel{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#fff;padding:7px 14px;border-radius:8px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;min-width:200px}
.fs-ibtn{width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.18s}
.fs-ibtn:hover{background:rgba(255,255,255,.15)}
.fs-video{flex:1;position:relative;overflow:hidden}
.fs-video img,.fs-video video{width:100%;height:100%;object-fit:cover}
.fs-scan{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0) 0px,rgba(0,0,0,0) 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px)}
.bbox{position:absolute;border:2px solid var(--bc);box-shadow:0 0 10px var(--bc),inset 0 0 8px rgba(0,0,0,.1)}
.bbox-tag{position:absolute;top:-25px;left:-2px;background:var(--bc);color:#0c1f35;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px 4px 4px 0;letter-spacing:.5px;white-space:nowrap}
.fs-foot{background:linear-gradient(to top,rgba(6,13,24,.97),rgba(6,13,24,.75));padding:18px 32px;border-top:1px solid rgba(255,255,255,.05);display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:32px}
.fs-stats{display:flex;gap:32px;align-items:flex-end}
.fs-big{display:flex;flex-direction:column}
.fs-lbl{font-size:9px;letter-spacing:1.5px;color:rgba(255,255,255,.32);text-transform:uppercase;margin-bottom:3px;font-weight:700}
.fs-val{font-size:38px;font-weight:800;color:#fff;line-height:1;letter-spacing:-1px}
.fs-sub{font-size:10px;color:rgba(255,255,255,.32);text-transform:uppercase;letter-spacing:.5px;margin-top:2px}
.fs-sm{display:flex;gap:22px}
.fs-sm-item{display:flex;flex-direction:column}
.fs-sm-val{font-size:22px;font-weight:800;color:#fff;line-height:1}
.fs-bars{display:flex;align-items:flex-end;gap:3px;height:36px}
.fs-bar{width:7px;border-radius:2px;background:rgba(240,180,41,.65);transition:height .35s ease}
.fs-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.fs-acc{font-size:42px;font-weight:800;color:${T.gold};letter-spacing:-1px;line-height:1}
.fs-tech{display:flex;gap:20px}
.fs-tech-item{display:flex;flex-direction:column;align-items:flex-end}
.fs-tech-val{font-size:16px;font-weight:800;color:#67e8f9}
.fs-buf{display:flex;gap:3px;margin-top:3px}
.fs-bs{width:9px;height:5px;border-radius:1px}
.fs-bs.on{background:rgba(103,232,249,.7)}
.fs-bs.off{background:rgba(255,255,255,.1)}

/* RESPONSIVE */
@media(max-width:900px){
  .nav{padding:0 20px}
  .hero-content{grid-template-columns:1fr;padding:60px 24px;gap:36px}
  .hero h1{font-size:34px}
  .feat-inner{grid-template-columns:1fr}
  .feat-item{border-right:none;border-bottom:1px solid ${T.border};padding:20px 24px}
  .feat-item:last-child{border-bottom:none}
  .sec{padding:60px 24px}
  .about-grid,.how-grid{grid-template-columns:1fr}
  .info-cards{grid-template-columns:1fr}
  .stat-row{grid-template-columns:repeat(2,1fr)}
  .tech-grid{grid-template-columns:repeat(2,1fr)}
  .flow-steps{flex-direction:column;gap:10px}
  .flow-arrow{transform:rotate(90deg)}
  .det-body{padding:24px 20px 60px}
  .det-hdr{padding:32px 24px}
  .footer{padding:20px 24px;flex-direction:column;gap:12px;text-align:center}
  .hero-stats{grid-template-columns:1fr 1fr}
  .cta-sec{padding:64px 24px}
  .about-hero{padding:56px 24px}
  .about-body{padding:48px 24px}
}
  `;
    document.head.appendChild(el);
};