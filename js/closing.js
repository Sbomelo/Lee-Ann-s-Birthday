var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= dodging No button ================= */
  var zone = document.getElementById('dodge-zone');
  var noBtn = document.getElementById('no-btn');
  var yesBtn = document.getElementById('yes-btn');
  var quip = document.getElementById('dodge-quip');
  var finaleTriggered = false;
  var dodgeFrozen = false;
  var dodgeCount = 0;
  var quips = [
    "Nice try.",
    "It's okay to just say yes.",
    "This button has commitment issues.",
    "Getting warmer... or not.",
    "You can't say no to this one."
  ];

  function freezeNoButton() {
    if (dodgeFrozen) return;
    dodgeFrozen = true;
    var zr = zone.getBoundingClientRect();
    var br = noBtn.getBoundingClientRect();
    noBtn.style.position = 'absolute';
    noBtn.style.left = (br.left - zr.left) + 'px';
    noBtn.style.top = (br.top - zr.top) + 'px';
    noBtn.style.margin = '0';
  }

  function dodgeNoButton(clientX, clientY) {
    if (finaleTriggered) return;
    freezeNoButton();
    var zr = zone.getBoundingClientRect();
    var bw = noBtn.offsetWidth, bh = noBtn.offsetHeight;
    var maxLeft = Math.max(zr.width - bw, 0);
    var maxTop = Math.max(zr.height - bh, 0);
    var newLeft, newTop, tries = 0;
    do {
      newLeft = Math.random() * maxLeft;
      newTop = Math.random() * maxTop;
      tries++;
    } while (
      tries < 8 && clientX != null &&
      Math.hypot((zr.left + newLeft + bw / 2) - clientX, (zr.top + newTop + bh / 2) - clientY) < 100
    );
    noBtn.style.left = newLeft + 'px';
    noBtn.style.top = newTop + 'px';

    dodgeCount++;
    if (dodgeCount === 3 || dodgeCount === 7) {
      quip.textContent = quips[Math.floor(Math.random() * quips.length)];
    }
  }

  document.addEventListener('pointermove', function (e) {
    if (finaleTriggered) return;
    var r = noBtn.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (Math.hypot(cx - e.clientX, cy - e.clientY) < 100) dodgeNoButton(e.clientX, e.clientY);
  });
  noBtn.addEventListener('pointerdown', function (e) { e.preventDefault(); dodgeNoButton(e.clientX, e.clientY); });
  noBtn.addEventListener('touchstart', function (e) { e.preventDefault(); dodgeNoButton(null, null); }, { passive: false });
  noBtn.addEventListener('mouseenter', function (e) { dodgeNoButton(e.clientX, e.clientY); });
  noBtn.addEventListener('focus', function () { dodgeNoButton(null, null); });

  /* ================= finale: fireworks ================= */
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
      if (s.y <= s.targetY || s.vy >= 0) { explode(s); shells.splice(i, 1); }
    }
    for (var j = sparks.length - 1; j >= 0; j--) {
      var p = sparks[j];
      p.x += p.vx; p.y += p.vy; p.vy += 0.045; p.vx *= 0.985; p.alpha -= 0.014;
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

  function startFireworks() {
    if (reduced) return;
    step();
    (function scheduleShell() {
      launchShell();
      setTimeout(scheduleShell, 500 + Math.random() * 500);
    })();
  }

  /* ================= finale: word-by-word heading + typewriter message ================= */
  var headingEl = document.getElementById('finale-heading');
  var messageEl = document.getElementById('finale-message');
  var replayLink = document.getElementById('replay-link');
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
    function stepWord() {
      if (i >= words.length) { onComplete && onComplete(); return; }
      var w = words[i];
      if (w === '\n') {
        headingEl.appendChild(document.createElement('br'));
        i++; stepWord(); return;
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
      setTimeout(stepWord, delay);
    }
    stepWord();
  }

  function typeMessage(text, onDone) {
    messageEl.classList.add('typing');
    var i = 0;
    function stepChar() {
      if (i > text.length) {
        messageEl.classList.remove('typing');
        onDone && onDone();
        return;
      }
      messageEl.textContent = text.slice(0, i);
      i++;
      setTimeout(stepChar, TYPE_CHAR_DELAY + Math.random() * 24);
    }
    stepChar();
  }

  function renderFinaleInstant() {
    headingWords.forEach(function (w, idx) {
      if (w === '\n') { headingEl.appendChild(document.createElement('br')); return; }
      var space = (headingWords[idx + 1] && headingWords[idx + 1] !== '\n') ? ' ' : '';
      headingEl.appendChild(document.createTextNode(w + space));
    });
    messageEl.textContent = fullMessageText;
    replayLink.classList.add('visible');
  }

  function runFinaleSequence() {
    if (reduced) {
      renderFinaleInstant();
      return;
    }
    revealHeadingWords(headingWords, HEADING_WORD_DELAY, function () {
      setTimeout(function () {
        typeMessage(fullMessageText, function () {
          replayLink.classList.add('visible');
        });
      }, 400);
    });
  }

  /* ================= trigger ================= */
  var questionSection = document.getElementById('question-section');
  var finaleContent = document.getElementById('finale-content');

  yesBtn.addEventListener('click', function () {
    if (finaleTriggered) return;
    finaleTriggered = true;
    questionSection.classList.add('leaving');
    setTimeout(function () {
      questionSection.style.display = 'none';
      finaleContent.classList.add('visible');
      startFireworks();
      runFinaleSequence();
    }, reduced ? 100 : 380);
  });