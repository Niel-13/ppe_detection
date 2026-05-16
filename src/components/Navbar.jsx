import logoImage from '../assets/logo.png';

export default function Navbar({ page, setPage }) {
  return (
    <nav className="nav">
      {/* LOGO */}
      <div className="nav-logo" onClick={() => setPage("home")} style={{ cursor: 'pointer' }}>
      <div className="nav-logo-mark">
        {/* 2. Ganti <LogoMark /> dengan tag img */}
        <img 
          src={logoImage} 
          alt="InnoTech Logo" 
          className="logo-img-element"
        />
      </div>
    </div>

      {/* LINKS */}
      <div className="nav-links">
        {[
          ["home",      "Home"],
          ["about",     "About"],
          ["detection", "Detection"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`nav-link${page === key ? " active" : ""}`}
            onClick={() => setPage(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* CTA */}
      <button className="btn-cta" onClick={() => setPage("detection")}>
        Get Started
      </button>
    </nav>
  );
}
