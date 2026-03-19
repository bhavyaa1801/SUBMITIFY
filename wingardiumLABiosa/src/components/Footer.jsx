import { useNavigate } from "react-router-dom";

const FOOTER_COLS = [
  // {
  //   heading: "PRODUCT",
  //   links: [
  //     { label: "Generate file", href: "/create" },
  //     { label: "Templates", href: "/#templates" },
  //     { label: "Sample PDF", href: "/sample.pdf" },
  //   ],
  // },
  {
    heading: "DOCS",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Supported formats", href: "#" },
  
    ],
  },
  {
    heading: "CONNECT",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/bhavyarajput/?skipRedirect=true", external: true },
      { label: "Report a bug", href: "https://forms.gle/C7aKtZbgXKRXykX88" },

    ],
  },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer-root">
      {/* Brand */}
      <div className="footer-brand">
        <div className="lp-logo" onClick={() => navigate("/")}>
          <span className="lp-logo-icon">📁</span>
          <span className="lp-logo-text">SUBMITIFY</span>
        </div>
        <p className="footer-tagline">
          Academic lab file generator built for students. BY A STUDENT LOL
           <br>
          </br>
          with love GANG 😭
          <br />
          Powered by Groq AI, FastAPI, and PostgreSQL.
        </p>
      </div>

      {/* Link columns */}
      {FOOTER_COLS.map((col) => (
        <div key={col.heading} className="footer-col">
          <span className="footer-col-heading">{col.heading}</span>
          {col.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="footer-link"
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
            </a>
          ))}
        </div>
      ))}

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span className="footer-copy">
          © {new Date().getFullYear()} LabFile. Built for students.
        </span>
        <span className="footer-mono">
          powered by{" "}
          <span className="footer-groq">groq</span>
        </span>
      </div>
    </footer>
  );
}