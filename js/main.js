/* ============================================================
   樂藝整合行銷 — 主腳本
   模組：
   1. Cursor          自訂滑鼠游標
   2. ReadingProgress 閱讀進度條
   3. Reveal          捲動入場動畫
   4. CountUp         數字累加動畫
   5. NavActive       導覽列高亮
   6. HeroParallax    Hero 視差效果
   7. VideoViewport   影片進入視窗自動播放
============================================================ */


/* ── 1. CURSOR ────────────────────────────────────────────── */
(function initCursor() {
  const cur  = document.getElementById('cursor');
  const ring = document.getElementById('cring');

  // 僅在有 hover 能力的裝置啟用（非觸控）
  if (!window.matchMedia('(hover: hover)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  // 圓環緩動跟隨
  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  // 互動元素懸停放大
  const interactiveSelectors = 'a, button, .service-card, .pain-item, .fan-card, .post-card, .reel-card';
  document.querySelectorAll(interactiveSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cur.style.transform  = 'translate(-50%,-50%) scale(2.5)';
      ring.style.borderColor = 'rgba(196,151,58,.7)';
    });
    el.addEventListener('mouseleave', () => {
      cur.style.transform  = 'translate(-50%,-50%) scale(1)';
      ring.style.borderColor = 'rgba(196,151,58,.5)';
    });
  });
})();


/* ── 2. READING PROGRESS ──────────────────────────────────── */
(function initReadingProgress() {
  const fill = document.getElementById('pf');
  window.addEventListener('scroll', () => {
    const pct = scrollY / (document.body.scrollHeight - innerHeight) * 100;
    fill.style.width = Math.min(pct, 100) + '%';
  });
})();


/* ── 3. REVEAL ────────────────────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => obs.observe(el));
})();


/* ── 4. COUNT UP ──────────────────────────────────────────── */
(function initCountUp() {
  function countUp(el) {
    const target   = +el.dataset.target;
    const duration = 1800;
    const step     = 16;
    const inc      = target / (duration / step);
    let value      = 0;

    const timer = setInterval(() => {
      value = Math.min(value + inc, target);
      el.textContent = Math.round(value).toLocaleString();
      if (value >= target) clearInterval(timer);
    }, step);
  }

  const obs = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        obs.unobserve(entry.target);
      }
    }),
    { threshold: 0.5 }
  );

  document.querySelectorAll('.count-up').forEach(el => obs.observe(el));
})();


/* ── 5. NAV ACTIVE ────────────────────────────────────────── */
(function initNavActive() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let activeId = '';
    sections.forEach(s => {
      if (scrollY >= s.offsetTop - 140) activeId = s.id;
    });

    navLinks.forEach(link => {
      link.style.color = link.getAttribute('href') === '#' + activeId
        ? 'var(--gold)'
        : '';
    });
  });
})();


/* ── 6. HERO PARALLAX ─────────────────────────────────────── */
(function initHeroParallax() {
  const grid = document.querySelector('.hero-grid');
  if (!grid) return;

  window.addEventListener('scroll', () => {
    grid.style.transform = `translateY(${scrollY * 0.15}px)`;
  });
})();


/* ── 7. VIDEO VIEWPORT ────────────────────────────────────── */
(function initVideoViewport() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {}); // 忽略自動播放政策錯誤
      } else {
        video.pause();
      }
    }),
    { threshold: 0.3 }
  );

  document.querySelectorAll('.reel-video').forEach(v => obs.observe(v));
})();


/* ── 8. LIGHTBOX ──────────────────────────────────────────── */
(function initLightbox() {
  const lb       = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');
  const lbClose  = document.getElementById('lb-close');
  const lbPrev   = document.getElementById('lb-prev');
  const lbNext   = document.getElementById('lb-next');
  const lbCount  = document.getElementById('lb-counter');

  let images  = [];   // 當前 fan-wrap 的所有圖片 src
  let current = 0;

  function open(imgs, index) {
    images  = imgs;
    current = index;
    render();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function render() {
    lbImg.src         = images[current];
    lbCount.textContent = `${current + 1} / ${images.length}`;
    lbPrev.disabled   = current === 0;
    lbNext.disabled   = current === images.length - 1;
  }

  // 點擊 fan-card 開啟 lightbox
  document.querySelectorAll('.fan-wrap').forEach(wrap => {
    const cards = wrap.querySelectorAll('.fan-card img');
    const srcs  = Array.from(cards).map(img => img.src);
    cards.forEach((img, i) => {
      img.parentElement.addEventListener('click', () => open(srcs, i));
    });
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click',  () => { current--; render(); });
  lbNext.addEventListener('click',  () => { current++; render(); });

  // 點擊背景關閉
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  // 鍵盤支援
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft'  && current > 0)              { current--; render(); }
    if (e.key === 'ArrowRight' && current < images.length-1){ current++; render(); }
  });
})();
