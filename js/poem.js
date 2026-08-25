var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(window.location.search);
  var skipWait = params.has('preview');

  var poemEl = document.getElementById('poem-text');
  var nextBtn = document.getElementById('next-btn');

  /* slow, smooth pace for the poem — noticeably gentler than the reveal page's message */
  var BASE_CHAR_DELAY = 70;
  var CHAR_JITTER = 45;
  var LINE_PAUSE = 380;
  var PUNCTUATION_PAUSE = 220;

  function extractTokens(el) {
    var tokens = [];
    el.childNodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split('').forEach(function (ch) { tokens.push(ch); });
      } else if (node.nodeName === 'BR') {
        tokens.push('\n');
      }
    });
    return tokens;
  }

  var tokens = extractTokens(poemEl);
  poemEl.textContent = '';

  function renderInstant() {
    var currentTextNode = null;
    tokens.forEach(function (t) {
      if (t === '\n') {
        poemEl.appendChild(document.createElement('br'));
        currentTextNode = null;
      } else {
        if (!currentTextNode) {
          currentTextNode = document.createTextNode('');
          poemEl.appendChild(currentTextNode);
        }
        currentTextNode.data += t;
      }
    });
  }

  function typePoem(onDone) {
    poemEl.classList.add('typing');
    var i = 0;
    var currentTextNode = null;

    function step() {
      if (i >= tokens.length) {
        poemEl.classList.remove('typing');
        onDone && onDone();
        return;
      }
      var t = tokens[i];
      var delay = BASE_CHAR_DELAY + Math.random() * CHAR_JITTER;

      if (t === '\n') {
        poemEl.appendChild(document.createElement('br'));
        currentTextNode = null;
        delay = LINE_PAUSE;
      } else {
        if (!currentTextNode) {
          currentTextNode = document.createTextNode('');
          poemEl.appendChild(currentTextNode);
        }
        currentTextNode.data += t;
        if ('.,!?;'.indexOf(t) !== -1) delay += PUNCTUATION_PAUSE;
      }

      i++;
      setTimeout(step, delay);
    }
    step();
  }

  function revealNext() { nextBtn.classList.add('visible'); }

  if (reduced || skipWait) {
    renderInstant();
    revealNext();
  } else {
    typePoem(revealNext);
  }

  nextBtn.addEventListener('click', function () {
    window.location.href = 'FunClosingPage.html';
  });