import { useEffect, useRef, useState } from "react";

const CODE_POOL = [
  'college = input("Enter University Name: ")',
  'subject = input("Enter Subject Name: ")',
  'year = input("Enter Academic Year: ")',
  'student = input("Enter Student Name: ")',
  "def generate_cover(details):",
  "    pdf.add_page()",
  '    pdf.set_font("Arial", 16)',
  "    pdf.cell(0, 10, details.college)",
  "    return pdf",
  "for i, exp in enumerate(experiments):",
  "    write_heading(f'Exp {i+1}')",
  "    write_aim(exp.aim)",
  "    write_algorithm(exp.algo)",
  "    write_source_code(exp)",
  "    write_output(exp)",
  "@app.post('/api/generate')",
  "async def generate(req: LabRequest):",
  "    pdf = build_pdf(req)",
  "    return StreamingResponse(pdf)",
  "SELECT * FROM projects",
  "WHERE user_id = $1",
  "ORDER BY created_at DESC",
  "LIMIT 10;",
  "{ student: 'Anyan',",
  "  experiments: [...] }",
  "write_heading(f'Exp {i+1}')",
  "write_aim(exp.aim)",
  "write_algorithm(exp.algo)",
  "write_source_code(exp)",
  "write_output(exp)",
  "content_type: application/json",
  "status: 200 OK",
  "language = 'Python'",
  'subject_code = "KCS451"',
  "enrollment = '2200601520001'",
  "pdf.output('lab_file.pdf')",
  "groq.chat.completions.create(",
  '  model="llama3-8b-8192",',
  "  messages=[system_prompt]",
  ")",
];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function generateColumns(count, width) {
  return Array.from({ length: count }, (_, i) => {
    const x = (i / count) * width + randomBetween(0, width / count);
    const xFraction = x / width;


    const opacity = xFraction < 0.10
      ? 0.015
      : xFraction < 0.50
      ? 0.015 + ((xFraction - 0.30) / 0.20) * 0.10  
      : 0.10 + (xFraction - 0.50) * 0.35;            
    return {
      id: i,
      x,
      lines: Array.from({ length: Math.floor(randomBetween(20, 30)) }, () => ({
        text: CODE_POOL[Math.floor(Math.random() * CODE_POOL.length)],
        opacity,
      })),
      speed: randomBetween(50, 90),
      offset: randomBetween(0, 100),
      fontSize: randomBetween(10, 13),
    };
  });
}

// inject keyframe once
if (typeof document !== "undefined" && !document.getElementById("floatup-style")) {
  const style = document.createElement("style");
  style.id = "floatup-style";
  style.textContent = `
    @keyframes floatUp {
      0%   { transform: translateY(100vh); }
      100% { transform: translateY(-100%); }
    }
  `;
  document.head.appendChild(style);
}

export default function FloatingCode({ columnCount = 16, className = "" }) {
  const containerRef = useRef(null);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    function spawn() {
      setColumns(generateColumns(columnCount, window.innerWidth));
    }
    spawn();
    window.addEventListener("resize", spawn);
    return () => window.removeEventListener("resize", spawn);
  }, [columnCount]);

  return (
    <div
      ref={containerRef}
      className={`floating-code-root ${className}`}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {columns.map((col) => (
        <div
          key={col.id}
          style={{
            position: "absolute",
            left: col.x,
            top: "50vh",                
            fontFamily: "monospace",
            fontSize: col.fontSize,
            color: "#4a9eff",
            whiteSpace: "nowrap",
            animation: `floatUp ${col.speed}s linear infinite`,
            animationDelay: `-${(col.offset / 100) * col.speed}s`,
          }}
        >
          {col.lines.map((line, li) => (
            <div key={li} style={{ opacity: line.opacity, lineHeight: 1.7 }}>
              {line.text}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}