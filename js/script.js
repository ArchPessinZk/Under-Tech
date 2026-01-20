document.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.reveal');

  function revealOnScroll() {
    const trigger = window.innerHeight * 0.85;
    revealEls.forEach(el => {
      if (el.getBoundingClientRect().top < trigger) {
        el.classList.add('in-view');
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();

  document.querySelectorAll('.parallax').forEach(card => {
    let cx = 0, cy = 0;
    let tx = 0, ty = 0;

    function animate() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;

      card.style.transform =
        `perspective(900px)
         rotateX(${cy}deg)
         rotateY(${cx}deg)
         translateY(-4px)`;

      requestAnimationFrame(animate);
    }

    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;

      tx = x * 10;
      ty = -y * 10;
    });

    card.addEventListener('mouseleave', () => {
      tx = 0;
      ty = 0;
    });

    animate();
  });
});

(() => {
  const canvas = document.getElementById('bg-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth * DPR;
    h = canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const mouse = {
    x: w / 2,
    y: h / 2,
    tx: w / 2,
    ty: h / 2
  };

  window.addEventListener('mousemove', e => {
    mouse.tx = e.clientX * DPR;
    mouse.ty = e.clientY * DPR;
  });

  const lerp = (a, b, n) => a + (b - a) * n;

  class Particle {
    constructor() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.size = Math.random() * 1.5 + 0.5;
    }

    update() {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 180) {
        this.vx += dx * 0.0003;
        this.vy += dy * 0.0003;
      }

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = w;
      if (this.x > w) this.x = 0;
      if (this.y < 0) this.y = h;
      if (this.y > h) this.y = 0;

      this.vx *= 0.98;
      this.vy *= 0.98;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
    }
  }

  const particles = [];
  const COUNT = Math.min(120, Math.floor(window.innerWidth / 10));

  for (let i = 0; i < COUNT; i++) {
    particles.push(new Particle());
  }

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < 140) {
          ctx.strokeStyle = `rgba(255,255,255,${1 - dist / 140})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    mouse.x = lerp(mouse.x, mouse.tx, 0.14);
    mouse.y = lerp(mouse.y, mouse.ty, 0.14);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    connect();
    requestAnimationFrame(animate);
  }

  animate();
})();
