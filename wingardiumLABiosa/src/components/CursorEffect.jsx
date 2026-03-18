import { useEffect, useRef } from "react";

const CODE_CHARS = [
  "{", "}"," AUR KRO PROCASTINATE", "(", ")", "[", "]", "<", ">", "/", "=", " kyu nai ban rhe assingments",
  ";", ":", ".", "=>", "++", "&&", "JAB TUM OR TUMHARE BEECH PHONE AA JAYE", "AREYYYYYYY YAAARRRRR","||", "!=", "==",
  "def", "for", "if", "pdf", "req", "res", "DATA KHTM KHEL KHTM","fn()",
];

export default function CursorEffect() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -999, y: -999 });
  const particles = useRef([]);
  const glitches = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // resize canvas to fill viewport
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // track mouse
    function onMouseMove(e) {
      const px = mouse.current.x;
      const py = mouse.current.y;
      mouse.current = { x: e.clientX, y: e.clientY };

      // spawn code char particle on movement
      if (Math.hypot(e.clientX - px, e.clientY - py) > 8) {
        spawnChar(e.clientX, e.clientY);
      }

      // occasionally spawn glitch
      if (Math.random() < 0.15) {
        spawnGlitch(e.clientX, e.clientY);
      }
    }
    window.addEventListener("mousemove", onMouseMove);

    function spawnChar(x, y) {
      const char = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
      particles.current.push({
        x: x + randomBetween(-12, 12),
        y: y + randomBetween(-12, 12),
        text: char,
        opacity: 0.7 + Math.random() * 0.3,
        size: randomBetween(10, 15),
        vx: randomBetween(-0.6, 0.6),
        vy: randomBetween(-1.5, -0.3),
        life: 2.0,
        decay: randomBetween(0.018, 0.035),
        color: Math.random() < 0.75 ? "#4a9eff" : "#ffffff",
      });
    }

    function spawnGlitch(x, y) {
      glitches.current.push({
        x: x + randomBetween(-30, 30),
        y: y + randomBetween(-10, 10),
        text: CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
        opacity: 0.9,
        life: 1.0,
        decay: randomBetween(0.08, 0.18), 
        offsetX: randomBetween(-6, 6),
        color: Math.random() < 0.5 ? "#ff4a4a" : "#4affea", 
        size: randomBetween(11, 18),
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life * p.opacity);
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px monospace`;
        ctx.fillText(p.text, p.x, p.y);

        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
      });
      particles.current = particles.current.filter((p) => p.life > 0);

      // draw glitch particles — rendered twice with offset for glitch feel
      glitches.current.forEach((g) => {
        ctx.globalAlpha = Math.max(0, g.life * g.opacity);
        ctx.fillStyle = g.color;
        ctx.font = `bold ${g.size}px monospace`;

        // first pass — offset left
        ctx.fillText(g.text, g.x - g.offsetX, g.y);
        // second pass — offset right with low alpha
        ctx.globalAlpha = Math.max(0, g.life * g.opacity * 0.4);
        ctx.fillText(g.text, g.x + g.offsetX, g.y + 2);

        g.life -= g.decay;
      });
      glitches.current = glitches.current.filter((g) => g.life > 0);

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}