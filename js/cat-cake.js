 var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOLD_DURATION = 1400;

  var wrap = document.getElementById('cat-cake-wrap');
  var flame = document.getElementById('flame');
  var smoke = document.getElementById('smoke');
  var cheeks = document.getElementById('cheeks');
  var catSvgHost = wrap; // used for eyes-happy class toggle via a wrapper
  var breathFill = document.getElementById('breath-fill');
  var sceneSub = document.getElementById('scene-sub');
  var nextBtn = document.getElementById('next-btn');
  var relightBtn = document.getElementById('relight-btn');

  var holding = false;
  var extinguished = false;
  var hasBlownOnce = false;
  var holdTimer = null;

  function startHold() {
    if (extinguished || holding) return;
    holding = true;
    cheeks.classList.add('puffing');
    flame.classList.remove('cake-flame');
    flame.classList.add('intense');

    breathFill.style.transition = 'none';
    breathFill.style.width = '0%';
    // force reflow so the transition below actually animates from 0
    breathFill.offsetWidth;
    breathFill.style.transition = 'width ' + HOLD_DURATION + 'ms linear';
    breathFill.style.width = '100%';

    holdTimer = setTimeout(blowOut, HOLD_DURATION);
  }

  function cancelHold() {
    if (!holding) return;
    holding = false;
    clearTimeout(holdTimer);
    cheeks.classList.remove('puffing');
    if (!extinguished) {
      flame.classList.remove('intense');
      flame.classList.add('cake-flame');
    }
    breathFill.style.transition = 'width .25s ease';
    breathFill.style.width = '0%';
  }

  function burstAt(x, y) {
    if (reduced) return;
    var colors = ['#E0507B', '#F0A93E', '#C2185B', '#FADCE6'];
    for (var i = 0; i < 14; i++) {
      var el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      var angle = Math.random() * Math.PI * 2;
      var dist = 60 + Math.random() * 90;
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

  function blowOut() {
    holding = false;
    extinguished = true;
    hasBlownOnce = true;

    cheeks.classList.remove('puffing');
    flame.classList.remove('intense');
    flame.classList.add('out');

    if (!reduced) {
      smoke.classList.add('show');
    }

    wrap.classList.add('eyes-happy');
    sceneSub.textContent = "You blew it out! Make a wish.";

    var rect = wrap.getBoundingClientRect();
    burstAt(rect.left + rect.width / 2, rect.top + rect.height * 0.45);

    nextBtn.classList.add('visible');
    relightBtn.classList.add('visible');
  }

  function relight() {
    extinguished = false;
    flame.classList.remove('out');
    flame.classList.add('cake-flame');
    smoke.classList.remove('show');
    wrap.classList.remove('eyes-happy');
    breathFill.style.transition = 'width .25s ease';
    breathFill.style.width = '0%';
    sceneSub.textContent = 'Press and hold the candle to blow it out';
  }

  wrap.addEventListener('pointerdown', function (e) { e.preventDefault(); startHold(); });
  wrap.addEventListener('pointerup', cancelHold);
  wrap.addEventListener('pointerleave', cancelHold);
  wrap.addEventListener('pointercancel', cancelHold);

  wrap.addEventListener('keydown', function (e) {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      startHold();
    }
  });
  wrap.addEventListener('keyup', function (e) {
    if (e.key === ' ' || e.key === 'Enter') cancelHold();
  });

  relightBtn.addEventListener('click', relight);
  nextBtn.addEventListener('click', function () {
    window.location.href = 'PoemPage.html';
  });