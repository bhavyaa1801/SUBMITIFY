import { useState, useEffect } from "react";

const SLIDES = [
  { label: "01 — Enter Details", img: "/screenshots/step1.png" },
  { label: "02 — Add Experiments", img: "/screenshots/step2.1.png" },
  { label: "03 — Add Experiments", img: "/screenshots/step2.2.png" },
  { label: "04 — Review", img: "/screenshots/step3.png" },
  { label: "05 — File generating", img: "/screenshots/step4.png" },
  { label: "06 — Download", img: "/screenshots/step5.png" },
];

export default function AppMockup() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      width: "100%",
    }}>

      {/* Step indicators */}
      <div style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
      }}>
        {SLIDES.map((slide, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              padding: "4px 12px",
              borderRadius: 999,
              border: "1px solid",
              borderColor: i === active ? "rgba(99,179,237,0.6)" : "rgba(255,255,255,0.1)",
              background: i === active ? "rgba(99,179,237,0.12)" : "transparent",
              color: i === active ? "#63b3ed" : "rgba(255,255,255,0.3)",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            {slide.label}
          </button>
        ))}
      </div>

      {/* Browser mockup */}
      <div style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "#1a1d24",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}>

        {/* Browser chrome */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: "#13151a",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>

          {/* URL bar */}
          <div style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 6,
            padding: "3px 10px",
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.3)",
            textAlign: "center",
          }}>
            submitify-pi.vercel.app
          </div>
        </div>

        {/* Screenshot */}
        <div style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/10",
          overflow: "hidden",
        }}>
          {SLIDES.map((slide, i) => (
            <img
              key={i}
              src={slide.img}
              alt={slide.label}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "top",
                opacity: i === active ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
            />
          ))}

          {/* Progress bar */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 2,
            background: "rgba(99,179,237,0.4)",
            width: "100%",
          }}>
            <div style={{
              height: "100%",
              background: "#63b3ed",
              width: `${((active + 1) / SLIDES.length) * 100}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>
      </div>

      {/* Caption */}
      <p style={{
        textAlign: "center",
        color: "rgba(255,255,255,0.4)",
        fontSize: "0.8rem",
      }}>
        {SLIDES[active].label} — click steps to navigate
      </p>
    </div>
  );
}