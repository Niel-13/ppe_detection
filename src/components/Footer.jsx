export default function Footer({ setPage }) {
  return (
    <footer className="footer">
      <div className="footer-links">
        {[
          ["Home",      "home"],
          ["About",     "about"],
          ["Detection", "detection"],
        ].map(([label, page]) => (
          <button
            key={label}
            className="footer-link"
            onClick={() => setPage(page)}
          >
            {label}
          </button>
        ))}
      </div>
      <span className="footer-copy">© 2026 PPE Detection System</span>
    </footer>
  );
}
