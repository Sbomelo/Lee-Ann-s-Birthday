 var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(window.location.search);
  var skipWait = params.has('preview');

  /* ---- heading writes in word-by-word, message types in letter-by-letter ---- */
  var headingEl = document.getElementById('reveal-heading');
  var messageEl = document.getElementById('reveal-message');
  var HEADING_WORD_DELAY = 260;
  var TYPE_CHAR_DELAY = 32;

  function extractWords(el) {
    var words = [];
    el.childNodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.trim().split(/\s+/).filter(Boolean).forEach(function (w) { words.push(w); });
      } else if (node.nodeName === 'BR') {
        words.push('\n');
      }
    });
    return words;
  }

  var headingWords = extractWords(headingEl);
  var fullMessageText = messageEl.textContent.trim();
  headingEl.textContent = '';
  messageEl.textContent = '';

  function revealHeadingWords(words, delay, onComplete) {
    var i = 0;
    function step() {
      if (i >= words.length) { onComplete && onComplete(); return; }
      var w = words[i];
      if (w === '\n') {
        headingEl.appendChild(document.createElement('br'));
        i++;
        step();
        return;
      }
      var span = document.createElement('span');
      span.className = 'reveal-word';
      span.textContent = w;
      headingEl.appendChild(span);
      if (words[i + 1] && words[i + 1] !== '\n') {
        headingEl.appendChild(document.createTextNode(' '));
      }
      requestAnimationFrame(function () { span.classList.add('shown'); });
      i++;
      setTimeout(step, delay);
    }
    step();
  }

  function typeMessage(text, onDone) {
    messageEl.classList.add('typing');
    var i = 0;
    function step() {
      if (i > text.length) {
        messageEl.classList.remove('typing');
        onDone && onDone();
        return;
      }
      messageEl.textContent = text.slice(0, i);
      i++;
      setTimeout(step, TYPE_CHAR_DELAY + Math.random() * 24);
    }
    step();
  }

  if (reduced) {
    headingWords.forEach(function (w, idx) {
      if (w === '\n') { headingEl.appendChild(document.createElement('br')); return; }
      var space = (headingWords[idx + 1] && headingWords[idx + 1] !== '\n') ? ' ' : '';
      headingEl.appendChild(document.createTextNode(w + space));
    });
    messageEl.textContent = fullMessageText;
  } else {
    revealHeadingWords(headingWords, HEADING_WORD_DELAY, function () {
      setTimeout(function () { typeMessage(fullMessageText); }, 400);
    });
  }

  /* ---- fireworks ---- */
  var canvas = document.getElementById('fireworks-canvas');
  var ctx = canvas.getContext('2d');
  var W, H;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  var palette = ['#E0507B', '#C2185B', '#F0A93E', '#FADCE6'];
  var shells = [];
  var sparks = [];

  function launchShell() {
    shells.push({
      x: 40 + Math.random() * (W - 80),
      y: H,
      targetY: H * 0.18 + Math.random() * H * 0.35,
      vy: -(6 + Math.random() * 2.5),
      color: palette[Math.floor(Math.random() * palette.length)]
    });
  }

  function explode(shell) {
    var count = 28 + Math.floor(Math.random() * 14);
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      var speed = 1.5 + Math.random() * 3;
      sparks.push({
        x: shell.x, y: shell.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: palette[Math.floor(Math.random() * palette.length)]
      });
    }
  }

  function step() {
    ctx.fillStyle = 'rgba(255, 246, 234, 0.18)';
    ctx.fillRect(0, 0, W, H);

    for (var i = shells.length - 1; i >= 0; i--) {
      var s = shells[i];
      s.y += s.vy;
      s.vy += 0.05;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
      if (s.y <= s.targetY || s.vy >= 0) {
        explode(s);
        shells.splice(i, 1);
      }
    }

    for (var j = sparks.length - 1; j >= 0; j--) {
      var p = sparks[j];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.045;
      p.vx *= 0.985;
      p.alpha -= 0.014;
      if (p.alpha <= 0) { sparks.splice(j, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(step);
  }

  if (!reduced) {
    step();
    (function scheduleShell() {
      launchShell();
      setTimeout(scheduleShell, 500 + Math.random() * 500);
    })();
  }

  /* ---- continue button reveal ---- */
  var continueBtn = document.getElementById('continue-btn');
  var WAIT_MS;
  if (skipWait) {
    WAIT_MS = 300;
  } else if (reduced) {
    WAIT_MS = 10000;
  } else {
    var wordCount = headingWords.filter(function (w) { return w !== '\n'; }).length;
    var estimatedTotal = (wordCount * HEADING_WORD_DELAY) + 400 + (fullMessageText.length * TYPE_CHAR_DELAY) + 900;
    WAIT_MS = Math.max(10000, estimatedTotal);
  }
  setTimeout(function () { continueBtn.classList.add('visible'); }, WAIT_MS);

  continueBtn.addEventListener('click', function () {
    document.body.style.opacity = '0';
    setTimeout(function () {
      window.location.href = 'CatAndCakePage.html';
    }, reduced ? 150 : 400);
  });