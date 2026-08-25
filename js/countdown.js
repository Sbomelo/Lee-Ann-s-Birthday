var TARGET = new Date(2026, 7, 26, 0, 0, 0); // Aug 26, 2026, midnight local time
  var params = new URLSearchParams(window.location.search);
  var previewMode = params.has('preview');

  var countdownView = document.getElementById('countdown-view');
  var startWrap = document.getElementById('start-wrap');
  var startBtn = document.getElementById('start-btn');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var particlesLayer = document.getElementById('particles-layer');
  var timer = null;

  function pad(n) { return String(n).padStart(2, '0'); }

  function shapeSvg(shape, color) {
    if (shape === 'heart') {
      return '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 21s-7.5-4.6-10-9C.5 8.5 2.5 4 7 4c2.3 0 4 1.2 5 3 1-1.8 2.7-3 5-3 4.5 0 6.5 4.5 5 8-2.5 4.4-10 9-10 9z" fill="' + color + '"/></svg>';
    }
    if (shape === 'star') {
      return '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" fill="' + color + '"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 12 L2 6 L2 18 Z" fill="' + color + '"/><path d="M12 12 L22 6 L22 18 Z" fill="' + color + '"/><circle cx="12" cy="12" r="3" fill="' + color + '"/></svg>';
  }

  function spawnParticle() {
    if (particlesLayer.children.length >= 7) return;
    var shapes = ['heart', 'star', 'bow'];
    var shape = shapes[Math.floor(Math.random() * shapes.length)];
    var colors = ['#E0507B', '#C2185B', '#F0A93E', '#FADCE6'];
    var color = colors[Math.floor(Math.random() * colors.length)];
    var size = 14 + Math.random() * 12;
    var left = 4 + Math.random() * 92;
    var duration = 7 + Math.random() * 4;
    var drift = (Math.random() * 80 - 40) + 'px';
    var rotStart = (Math.random() * 30 - 15) + 'deg';
    var rotEnd = ((Math.random() * 70 + 20) * (Math.random() < 0.5 ? -1 : 1)) + 'deg';

    var el = document.createElement('div');
    el.className = 'particle';
    el.style.left = left + '%';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.setProperty('--drift', drift);
    el.style.setProperty('--rot-start', rotStart);
    el.style.setProperty('--rot-end', rotEnd);
    el.style.animationDuration = duration + 's';
    el.innerHTML = shapeSvg(shape, color);
    particlesLayer.appendChild(el);
    setTimeout(function () { el.remove(); }, duration * 1000 + 200);
  }

  if (!reduced) {
    (function scheduleParticle() {
      spawnParticle();
      setTimeout(scheduleParticle, 700 + Math.random() * 700);
    })();
  }

  function tick() {
    var now = new Date();
    var diff = previewMode ? -1 : (TARGET - now);

    if (diff <= 0) {
      countdownView.style.display = 'none';
      startWrap.classList.add('visible');
      if (timer) clearInterval(timer);
      return;
    }

    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);

    document.getElementById('days').textContent = pad(d);
    document.getElementById('hours').textContent = pad(h);
    document.getElementById('minutes').textContent = pad(m);
    document.getElementById('seconds').textContent = pad(s);
  }

  tick();
  timer = setInterval(tick, 1000);

  function burstConfetti() {
    if (reduced) return;
    var rect = startBtn.getBoundingClientRect();
    var originX = rect.left + rect.width / 2;
    var originY = rect.top + rect.height / 2;
    var colors = ['#E0507B', '#F0A93E', '#C2185B'];
    for (var i = 0; i < 16; i++) {
      var el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = originX + 'px';
      el.style.top = originY + 'px';
      var angle = Math.random() * Math.PI * 2;
      var dist = 80 + Math.random() * 120;
      var tx = Math.cos(angle) * dist;
      var ty = Math.sin(angle) * dist;
      el.style.background = colors[i % colors.length];
      el.style.transform = 'translate(-50%,-50%)';
      el.style.transition = 'transform .7s ease-out, opacity .7s ease-out';
      document.body.appendChild(el);
      requestAnimationFrame(function (node, tx2, ty2) {
        return function () {
          node.style.transform = 'translate(calc(-50% + ' + tx2 + 'px), calc(-50% + ' + ty2 + 'px)) rotate(' + (Math.random() * 360) + 'deg)';
          node.style.opacity = '0';
        };
      }(el, tx, ty));
      setTimeout(function (node) { return function () { node.remove(); }; }(el), 750);
    }
  }

  startBtn.addEventListener('click', function () {
    burstConfetti();
    var wait = reduced ? 150 : 550;
    setTimeout(function () {
      window.location.href = 'RevealPage.html';
    }, wait);
  });