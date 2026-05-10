import { Icon, LogoMark } from "./icons/Icons";
import { T } from "../constants/tokens";

export default function Navbar({ page, setPage }) {
  return (
    <nav className="nav">
      {/* LOGO */}
      <div className="nav-logo" onClick={() => setPage("home")}>
        <div className="nav-logo-mark">
          <LogoMark />
        </div>
        <div>
          <div className="nav-logo-name">InnoTech</div>
          <div className="nav-logo-sub">langkah seribu proses</div>
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
