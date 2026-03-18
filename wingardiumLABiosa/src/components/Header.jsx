import { useNavigate, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "Templates", href: "/#templates" },
  // { label: "My files", href: "/files" },
  // { label: "Docs", href: "/docs" },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCreatePage = location.pathname === "/create";

  return (
    <header className="header-root">
      {/* Logo */}
      <div className="header-left">
        <div className="lp-logo" onClick={() => navigate("/")}>
          <span className="lp-logo-icon">📁</span>
          <span className="lp-logo-text">SUBMITIFY</span>
          {/* <span className="lp-version">v1.0</span> */}
        </div>

        {!isCreatePage && (
          <nav className="header-nav">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="header-nav-link">
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      {/* Right side */}
      <div className="header-right">
        {isCreatePage ? (
          <button className="btn-ghost header-back" onClick={() => navigate("/")}>
            ← Back to home
          </button>
        ) : (
          <>
           
            <button className="btn-primary" onClick={() => navigate("/create")}>
              Get started
            </button>
          </>
        )}
      </div>
    </header>
  );
}