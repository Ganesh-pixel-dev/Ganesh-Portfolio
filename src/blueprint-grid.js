/**
 * Blueprint Grid — Self-drawing architectural grid for the hero section.
 * Replaces the forensic orb. Lines draw themselves on load, intersection
 * points glow amber on mouse proximity.
 */

export function initBlueprintGrid(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  const spacing = 80;
  let mouseX = -1000, mouseY = -1000;
  let drawProgress = 0;
  let startTime = null;
  const drawDuration = 2200;

  function resize() {
    const parent = canvas.parentElement;
    W = canvas.width = parent.clientWidth || window.innerWidth;
    H = canvas.height = parent.clientHeight || window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  // Ease-out cubic
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function draw(timestamp) {
    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;
    drawProgress = Math.min(1, elapsed / drawDuration);
    const ease = easeOut(drawProgress);

    ctx.clearRect(0, 0, W, H);

    const cols = Math.ceil(W / spacing) + 1;
    const rows = Math.ceil(H / spacing) + 1;

    // Vertical lines
    for (let i = 0; i <= cols; i++) {
      const x = i * spacing;
      const len = H * ease;
      const distX = Math.abs(mouseX - x);
      const bright = distX < 200 ? 0.035 + (1 - distX / 200) * 0.1 : 0.025;

      ctx.strokeStyle = `rgba(59, 130, 246, ${bright})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, len);
      ctx.stroke();
    }

    // Horizontal lines
    for (let j = 0; j <= rows; j++) {
      const y = j * spacing;
      if (y > H * ease) continue;
      const len = W * ease;
      const distY = Math.abs(mouseY - y);
      const bright = distY < 200 ? 0.035 + (1 - distY / 200) * 0.1 : 0.025;

      ctx.strokeStyle = `rgba(59, 130, 246, ${bright})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(len, y);
      ctx.stroke();
    }

    // Intersection dots
    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = i * spacing;
        const y = j * spacing;
        if (y > H * ease || x > W * ease) continue;

        const dx = mouseX - x, dy = mouseY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 220) {
          const intensity = 1 - dist / 220;

          // Outer glow
          if (intensity > 0.2) {
            ctx.fillStyle = `rgba(245, 158, 11, ${intensity * 0.08})`;
            ctx.beginPath();
            ctx.arc(x, y, 2 + intensity * 18, 0, Math.PI * 2);
            ctx.fill();
          }

          // Core dot
          const size = 1.5 + intensity * 2.5;
          ctx.fillStyle = `rgba(245, 158, 11, ${0.25 + intensity * 0.75})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Default faint dot
          ctx.fillStyle = `rgba(59, 130, 246, 0.06)`;
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  // Delay to sync with loader timeline
  setTimeout(() => requestAnimationFrame(draw), 1500);
}
