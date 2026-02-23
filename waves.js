/**
 * ═══════════════════════════════════════════════════
 *  🌊  DIGITAL WAVES ENGINE  v3.0 — "Deep Ocean"
 * ═══════════════════════════════════════════════════
 *  Full-screen FILLED gradient wave animation
 *  for .sub-page backgrounds.
 *  
 *  Draws layered, filled wave bands with glow,
 *  parallax, scroll-speed modulation, and click
 *  shockwave ripples.
 * ═══════════════════════════════════════════════════
 */

(function () {
    'use strict';

    if (!document.body.classList.contains('sub-page')) return;

    /* ── Config ──────────────────────────────────── */
    const WAVE_COUNT = 5;
    const SEGMENTS = 48;         // lower = faster

    /* ── Create canvas ──────────────────────────── */
    const canvas = document.createElement('canvas');
    canvas.id = 'waves-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    /* ── State ──────────────────────────────────── */
    let W, H;
    let time = 0;
    let scrollSpeed = 0;
    let smoothScrollSpeed = 0;
    let lastScrollY = window.scrollY;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let shockwaves = [];

    /* ── Wave descriptors ──────────────────────── */
    const waves = [];

    function buildWaves() {
        waves.length = 0;
        for (let i = 0; i < WAVE_COUNT; i++) {
            const t = i / (WAVE_COUNT - 1);  // 0 → 1
            waves.push({
                baseY: 0.30 + t * 0.50,              // vertical spread
                amplitude: 40 + Math.random() * 50,       // wave height
                frequency: 0.003 + Math.random() * 0.002,
                speed: 0.25 + Math.random() * 0.35,
                phase: Math.random() * Math.PI * 2,
                opacity: 0.06 + (1 - t) * 0.08,        // front waves brighter
            });
        }
    }

    /* ── Resize ─────────────────────────────────── */
    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    /* ── Input ──────────────────────────────────── */
    function onMouseMove(e) {
        mouseX = e.clientX / W;
        mouseY = e.clientY / H;
    }

    function onDeviceOrientation(e) {
        if (e.gamma != null) mouseX = 0.5 + e.gamma / 90;
        if (e.beta != null) mouseY = 0.5 + (e.beta - 45) / 90;
    }

    function onScroll() {
        const dy = Math.abs(window.scrollY - lastScrollY);
        scrollSpeed = Math.min(dy / 12, 2);   // softer input
        lastScrollY = window.scrollY;
    }

    function onClick(e) {
        // Create a shockwave
        // x, y: click position
        // t: time (0 to 1)
        // maxR: max radius of the ripple
        shockwaves.push({ x: e.clientX, y: e.clientY, t: 0, maxR: 800 });
    }

    /* ── Compute Y for a wave at fraction x ──── */
    function waveY(w, frac, xPx) {
        const fb = 1 + smoothScrollSpeed * 0.15;  // very gentle frequency modulation
        let y = H * w.baseY
            + Math.sin((frac * W * w.frequency * fb) + w.phase + time * w.speed) * w.amplitude
            + Math.sin((frac * W * w.frequency * 1.8 * fb) + w.phase * 0.6 + time * w.speed * 0.5) * w.amplitude * 0.35
            + Math.sin((frac * W * w.frequency * 0.4 * fb) + w.phase * 1.4 + time * w.speed * 1.2) * w.amplitude * 0.2;

        // Shockwave displacement
        // Ripple / Shockwave logic
        for (const sw of shockwaves) {
            const dx = xPx - sw.x;
            const dy2 = y - sw.y;
            const dist = Math.sqrt(dx * dx + dy2 * dy2);

            // "Pebble in water" effect:
            // - Train of waves: sin()
            // - Expanding: - time * speed
            // - Decaying with distance: exp(-k * dist)
            // - Decaying with time: (1 - t)^2

            if (dist < sw.maxR) {
                const timeFactor = (1 - sw.t);   // 1 -> 0
                const distFactor = (1 - dist / sw.maxR); // 1 -> 0

                // Gentler parameters:
                const amplitude = 15 * timeFactor * distFactor;

                // Lower frequency (0.02) -> wider waves
                // Slower speed (sw.t * 10) -> calm expansion
                const ripple = Math.sin(dist * 0.02 - sw.t * 10);

                y += ripple * amplitude;
            }
        }

        // Parallax
        y += (mouseY - 0.5) * 16;

        return y;
    }

    /* ── Draw one filled wave band ──────────── */
    function drawWave(w) {
        const px = (mouseX - 0.5) * 24;

        // Build top edge points
        const pts = [];
        for (let i = 0; i <= SEGMENTS; i++) {
            const f = i / SEGMENTS;
            const x = f * W + px;
            const y = waveY(w, f, f * W);
            pts.push({ x, y });
        }

        // Path: wave line → bottom-right → bottom-left → close
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);

        // Smooth Catmull-Rom spline
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(i - 1, 0)];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[Math.min(i + 2, pts.length - 1)];
            ctx.bezierCurveTo(
                p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
                p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
                p2.x, p2.y
            );
        }

        // Close to bottom of screen
        ctx.lineTo(W + 50, H + 50);
        ctx.lineTo(-50, H + 50);
        ctx.closePath();

        // Gradient fill
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, `rgba(0, 122, 255, ${w.opacity})`);
        grad.addColorStop(0.4, `rgba(90, 200, 250, ${w.opacity * 0.7})`);
        grad.addColorStop(1, 'rgba(0, 50, 120, 0)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Neon edge — simulated with two strokes (wide faded + thin bright)
        // Re-use same points array, just stroke the top edge
        function strokeEdge() {
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[Math.max(i - 1, 0)];
                const p1 = pts[i];
                const p2 = pts[i + 1];
                const p3 = pts[Math.min(i + 2, pts.length - 1)];
                ctx.bezierCurveTo(
                    p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
                    p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
                    p2.x, p2.y
                );
            }
        }

        // Wide soft glow (no shadowBlur needed)
        strokeEdge();
        ctx.strokeStyle = `rgba(90, 200, 250, ${w.opacity * 0.8})`;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Thin bright core
        strokeEdge();
        ctx.strokeStyle = `rgba(140, 220, 255, ${w.opacity * 2.5})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
    }

    function drawGlowSpots() {
        const spots = [
            { cx: 0.3, cy: 0.4, r: 300, speed: 0.08, color: [90, 200, 250] },
            { cx: 0.7, cy: 0.6, r: 350, speed: 0.06, color: [0, 122, 255] },
        ];
        for (const s of spots) {
            const x = (s.cx + Math.sin(time * s.speed) * 0.08) * W;
            const y = (s.cy + Math.cos(time * s.speed * 0.7) * 0.06) * H;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, s.r);
            const [r, g, b] = s.color;
            grad.addColorStop(0, `rgba(${r},${g},${b}, 0.05)`);
            grad.addColorStop(0.5, `rgba(${r},${g},${b}, 0.015)`);
            grad.addColorStop(1, `rgba(${r},${g},${b}, 0)`);
            ctx.beginPath();
            ctx.arc(x, y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    /* ── Main loop ─────────────────────────────── */
    function frame() {
        time += 0.016;
        scrollSpeed *= 0.92;
        // Smooth interpolation — prevents visual jumps
        smoothScrollSpeed += (scrollSpeed - smoothScrollSpeed) * 0.05;

        // Age shockwaves
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            // Slower decay for smoother effect
            shockwaves[i].t += 0.008;
            if (shockwaves[i].t >= 1) shockwaves.splice(i, 1);
        }

        ctx.clearRect(0, 0, W, H);

        // Draw ambient glow first (behind waves)
        drawGlowSpots();

        // Draw waves back-to-front
        for (let i = waves.length - 1; i >= 0; i--) {
            drawWave(waves[i]);
        }

        requestAnimationFrame(frame);
    }

    /* ── Init ────────────────────────────────────── */
    function init() {
        buildWaves();
        resize();

        window.addEventListener('resize', resize, { passive: true });
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('click', onClick);
        window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });

        frame();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
