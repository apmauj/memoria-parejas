/* ============================================================
   CONFIGURACIÓN Y DATOS POR DEFECTO
   ============================================================ */
const DIFFICULTY_MAP = {
  easy:   { pairs: 4, cols: 4, rows: 2 },
  medium: { pairs: 6, cols: 4, rows: 3 },
  hard:   { pairs: 8, cols: 4, rows: 4 }
};

// Pares por defecto con silabas predefinidas
const DEFAULT_PAIRS = [
  { name: 'GATO',      emoji: '🐱', syllables: 'GA-TO' },
  { name: 'PERRO',     emoji: '🐶', syllables: 'PER-RO' },
  { name: 'SOL',       emoji: '☀️', syllables: 'SOL' },
  { name: 'LUNA',      emoji: '🌙', syllables: 'LU-NA' },
  { name: 'FLOR',      emoji: '🌸', syllables: 'FLOR' },
  { name: 'ÁRBOL',     emoji: '🌳', syllables: 'ÁR-BOL' },
  { name: 'PESCADO',   emoji: '🐟', syllables: 'PES-CA-DO' },
  { name: 'ESTRELLA',  emoji: '⭐', syllables: 'ES-TRE-LLA' },
  { name: 'CASA',      emoji: '🏠', syllables: 'CA-SA' },
  { name: 'CORAZÓN',   emoji: '❤️', syllables: 'CO-RA-ZÓN' },
  { name: 'MARIPOSA',  emoji: '🦋', syllables: 'MA-RI-PO-SA' },
  { name: 'LEÓN',      emoji: '🦁', syllables: 'LE-ÓN' }
];

/* ============================================================
   ESTADO DEL JUEGO
   ============================================================ */
let state = {
  screen: 'INIT',
  playerName: '',
  difficulty: 'easy',
  pairs: [],           // { pairId, name, imageUrl, syllables }
  cards: [],           // { id, type, pairId, value, imageUrl, matched, revealed }
  flippedCards: [],
  score: 0,
  pairsFound: 0,
  totalPairs: 0,
  attempts: 0,
  errors: 0,
  streak: 0,
  bestStreak: 0,
  firstAttempt: true,  // true si aún no erró en la racha actual
  timerStart: 0,
  timerInterval: null,
  elapsedSeconds: 0,
  locked: false,
  muted: false,
  useCustom: false
};

// Imágenes cargadas por el usuario
let uploadedImages = []; // { name, imageUrl }

/* ============================================================
   MANEJADOR DE SONIDOS (WEB AUDIO API)
   ============================================================ */
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.15, delay = 0) {
  if (state.muted) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch(e) { /* silenciar errores de audio */ }
}

const SFX = {
  flip() {
    playTone(800, 0.08, 'sine', 0.1);
    playTone(1200, 0.06, 'sine', 0.06, 0.03);
  },
  match() {
    playTone(523, 0.15, 'sine', 0.15);
    playTone(659, 0.15, 'sine', 0.15, 0.12);
    playTone(784, 0.25, 'sine', 0.18, 0.24);
  },
  error() {
    playTone(300, 0.2, 'triangle', 0.1);
    playTone(220, 0.3, 'triangle', 0.08, 0.15);
  },
  victory() {
    const notes = [523, 587, 659, 784, 880, 1047];
    notes.forEach((n, i) => playTone(n, 0.2, 'sine', 0.12, i * 0.12));
  }
};

/* ============================================================
   SÍNTESIS DE VOZ
   ============================================================ */
function speakWord(word) {
  if (state.muted) return;
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(word);
  utt.lang = 'es-ES';
  utt.rate = 0.8;
  utt.pitch = 1.15;
  utt.volume = 0.9;
  window.speechSynthesis.speak(utt);
}

/* ============================================================
   SEPARACIÓN SILÁBICA (BÁSICO PARA ESPAÑOL)
   ============================================================ */
function separateSyllables(word) {
  // Buscar silabas predefinidas primero
  const def = DEFAULT_PAIRS.find(p => p.name === word);
  if (def) return def.syllables;

  const vowels = 'AEIOUÁÉÍÓÚÜ';
  const strongVowels = 'AEOÁÉÓÚ';
  const weakVowels = 'IUÍÚÜ';
  let syllables = [];
  let i = 0;

  while (i < word.length) {
    let syl = '';

    // Consonante inicial
    while (i < word.length && !vowels.includes(word[i])) {
      syl += word[i];
      i++;
    }

    if (i >= word.length) { if (syl) syllables.push(syl); break; }

    // Primera vocal
    syl += word[i];
    i++;

    // Segunda vocal (diptongo/triptongo)
    if (i < word.length && vowels.includes(word[i])) {
      const prev = syl[syl.length - 1];
      const curr = word[i];
      // Si la anterior es débil y la actual fuerte → nueva sílaba
      if (weakVowels.includes(prev) && strongVowels.includes(curr)) {
        syllables.push(syl);
        syl = '';
      }
      syl += word[i];
      i++;
      // Tercera vocal
      if (i < word.length && vowels.includes(word[i]) && weakVowels.includes(word[i - 1])) {
        syl += word[i];
        i++;
      }
    }

    // Consonante intermedia
    if (i < word.length && !vowels.includes(word[i])) {
      const c1 = word[i];
      // Ver si la próxima consonante forma grupo
      if (i + 1 < word.length && !vowels.includes(word[i + 1])) {
        const c2 = word[i + 1];
        const groups = ['BL','BR','CL','CR','DR','FL','FR','GL','GR','PL','PR','TR','CH','LL','RR'];
        if (groups.includes(c1 + c2)) {
          // Grupo consonántico: va con la siguiente sílaba
          syllables.push(syl);
          syl = '';
          syl += c1 + c2;
          i += 2;
        } else {
          // Dos consonantes que no forman grupo: primera va con sílaba actual
          syl += c1;
          i++;
        }
      } else {
        syl += c1;
        i++;
      }
    }

    if (syl) syllables.push(syl);
  }

  return syllables.join('-') || word;
}

/* ============================================================
   GENERADOR DE IMÁGENES EMOJI (CANVAS)
   ============================================================ */
function createEmojiImageUrl(emoji) {
  const c = document.createElement('canvas');
  c.width = 240; c.height = 240;
  const ctx = c.getContext('2d');
  // Fondo redondeado
  ctx.fillStyle = '#FFF8F0';
  ctx.beginPath();
  ctx.roundRect(0, 0, 240, 240, 24);
  ctx.fill();
  // Emoji
  ctx.font = '140px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 120, 125);
  return c.toDataURL('image/png');
}

// Precargar imágenes emoji
const emojiImageCache = {};
DEFAULT_PAIRS.forEach(p => {
  emojiImageCache[p.name] = createEmojiImageUrl(p.emoji);
});

/* ============================================================
   SISTEMA DE TOAST
   ============================================================ */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

/* ============================================================
   FONDO ANIMADO
   ============================================================ */
function createBackgroundShapes() {
  const container = document.getElementById('bg-shapes');
  const colors = ['#FF6B35','#00B894','#FDCB6E','#E74C3C','#FF9FF3','#54A0FF'];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('div');
    s.className = 'bg-shape';
    const size = 50 + Math.random() * 140;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      background:${colors[i % colors.length]};
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      animation-duration:${10 + Math.random()*14}s;
      animation-delay:${-Math.random()*12}s;
      border-radius:${Math.random()>0.5 ? '50%' : '35%'};
    `;
    container.appendChild(s);
  }
}

/* ============================================================
   NAVEGACIÓN DE PANTALLAS
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ============================================================
   CARGA DE IMÁGENES
   ============================================================ */
function handleFiles(files) {
  const validExts = ['jpg','jpeg','png','webp'];
  Array.from(files).forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!validExts.includes(ext)) return;

    const name = file.name.replace(/\.[^.]+$/, '').toUpperCase().trim();
    if (!name) return;

    // Verificar duplicados
    if (uploadedImages.some(u => u.name === name)) {
      showToast(`"${name}" YA ESTÁ CARGADO`, 'error');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    uploadedImages.push({ name, imageUrl });
  });
  renderPreviews();
}

function removeImage(index) {
  URL.revokeObjectURL(uploadedImages[index].imageUrl);
  uploadedImages.splice(index, 1);
  renderPreviews();
}

function renderPreviews() {
  const grid = document.getElementById('preview-grid');
  grid.innerHTML = '';
  uploadedImages.forEach((img, i) => {
    const div = document.createElement('div');
    div.className = 'preview-item';
    div.innerHTML = `
      <img src="${img.imageUrl}" alt="${img.name}">
      <div class="preview-name">${img.name}</div>
      <button class="remove-btn" data-index="${i}" aria-label="Quitar"><i class="fas fa-xmark"></i></button>
    `;
    grid.appendChild(div);
  });
  // Eventos de quitar
  grid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      removeImage(parseInt(btn.dataset.index));
    });
  });
}

/* ============================================================
   GENERACIÓN DE CARTAS
   ============================================================ */
function generateCards(pairs) {
  const cards = [];
  let id = 0;
  pairs.forEach(p => {
    // Carta imagen
    cards.push({
      id: id++,
      type: 'image',
      pairId: p.name,
      value: p.name,
      imageUrl: p.imageUrl,
      syllables: p.syllables || separateSyllables(p.name),
      matched: false,
      revealed: false
    });
    // Carta texto
    cards.push({
      id: id++,
      type: 'text',
      pairId: p.name,
      value: p.name,
      imageUrl: null,
      syllables: p.syllables || separateSyllables(p.name),
      matched: false,
      revealed: false
    });
  });
  // Mezclar (Fisher-Yates)
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

/* ============================================================
   RENDERIZAR TABLERO
   ============================================================ */
function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  state.cards.forEach(card => {
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.id = card.id;
    div.setAttribute('role', 'button');
    div.setAttribute('aria-label', 'Carta boca abajo');
    div.setAttribute('tabindex', '0');

    let frontContent = '';
    if (card.type === 'image') {
      frontContent = `<img src="${card.imageUrl}" alt="${card.value}" draggable="false">`;
    } else {
      frontContent = `<span class="card-text">${card.value}</span>`;
    }

    div.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back"><i class="fas fa-star"></i></div>
        <div class="card-face card-front">${frontContent}</div>
      </div>
    `;

    div.addEventListener('click', () => onCardClick(card.id));
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(card.id); }
    });

    board.appendChild(div);
  });
}

/* ============================================================
   LÓGICA DE JUEGO
   ============================================================ */
function onCardClick(cardId) {
  if (state.locked) return;
  const card = state.cards[cardId];
  if (!card || card.matched || card.revealed) return;

  // Voltear carta
  card.revealed = true;
  const el = getCardElement(cardId);
  el.classList.add('flipped');
  el.setAttribute('aria-label', card.value);
  SFX.flip();
  speakWord(card.value);

  state.flippedCards.push(card);

  if (state.flippedCards.length === 2) {
    state.attempts++;
    state.locked = true;
    lockAllCards(true);
    updateHUD();

    const [c1, c2] = state.flippedCards;

    if (c1.pairId === c2.pairId && c1.id !== c2.id) {
      // ¡Coincidencia!
      setTimeout(() => handleMatch(c1, c2), 500);
    } else {
      // No coincide
      setTimeout(() => handleMismatch(c1, c2), 1000);
    }
  }
}

function handleMatch(c1, c2) {
  c1.matched = true;
  c2.matched = true;
  state.pairsFound++;
  state.streak++;
  if (state.streak > state.bestStreak) state.bestStreak = state.streak;

  // Puntaje: 100 base + 50 si es primer intento de la racha
  let pts = 100;
  if (state.firstAttempt) pts += 50;
  // Multiplicador por racha
  const multiplier = 1 + (state.streak - 1) * 0.25;
  pts = Math.round(pts * multiplier);
  state.score += pts;
  state.firstAttempt = true;

  const el1 = getCardElement(c1.id);
  const el2 = getCardElement(c2.id);
  el1.classList.add('matched');
  el2.classList.add('matched');

  SFX.match();
  showSyllableOverlay(c1.value, c1.syllables);

  // Resetear estado después del mismo delay que mismatch para consistencia
  setTimeout(() => {
    state.flippedCards = [];
    state.locked = false;
    lockAllCards(false);
    updateHUD();

    // Verificar victoria
    if (state.pairsFound === state.totalPairs) {
      setTimeout(handleVictory, 600);
    }
  }, 600);
}

function handleMismatch(c1, c2) {
  state.errors++;
  state.streak = 0;
  state.firstAttempt = true;
  state.score = Math.max(0, state.score - 10);

  const el1 = getCardElement(c1.id);
  const el2 = getCardElement(c2.id);
  el1.classList.add('error');
  el2.classList.add('error');

  SFX.error();

  setTimeout(() => {
    // Resetear cartas que no coinciden
    c1.revealed = false;
    c2.revealed = false;
    el1.classList.remove('flipped', 'error');
    el2.classList.remove('flipped', 'error');
    el1.setAttribute('aria-label', 'Carta boca abajo');
    el2.setAttribute('aria-label', 'Carta boca abajo');

    // Resetear estado del juego
    state.flippedCards = [];
    state.locked = false;
    lockAllCards(false);
    updateHUD();
  }, 600);
}

function getCardElement(id) {
  return document.querySelector(`.card[data-id="${id}"]`);
}

function lockAllCards(locked) {
  document.querySelectorAll('.card').forEach(c => {
    const cardId = parseInt(c.dataset.id);
    const card = state.cards[cardId];
    // No bloquear/desbloquear cartas que ya están matched
    if (card && !card.matched) {
      if (locked) c.classList.add('locked');
      else c.classList.remove('locked');
    }
  });
}

/* ============================================================
   OVERLAY DE SILABAS
   ============================================================ */
function showSyllableOverlay(word, syllables) {
  const overlay = document.getElementById('syllable-overlay');
  document.getElementById('syl-word').textContent = word;
  document.getElementById('syl-syllables').textContent = syllables;
  overlay.classList.add('show');
  setTimeout(() => overlay.classList.remove('show'), 1800);
}

/* ============================================================
   TEMPORIZADOR
   ============================================================ */
function startTimer() {
  state.timerStart = Date.now();
  state.elapsedSeconds = 0;
  state.timerInterval = setInterval(() => {
    state.elapsedSeconds = Math.floor((Date.now() - state.timerStart) / 1000);
    document.getElementById('hud-time').textContent = formatTime(state.elapsedSeconds);
  }, 500);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/* ============================================================
   HUD
   ============================================================ */
function updateHUD() {
  document.getElementById('hud-name').textContent = state.playerName;
  document.getElementById('hud-score').textContent = state.score;
  document.getElementById('hud-pairs').textContent = `${state.pairsFound}/${state.totalPairs}`;
  document.getElementById('hud-attempts').textContent = state.attempts;
  document.getElementById('hud-errors').textContent = state.errors;
  document.getElementById('hud-streak').textContent = state.streak;
}

/* ============================================================
   VICTORIA
   ============================================================ */
function handleVictory() {
  stopTimer();
  SFX.victory();

  // Calcular estrellas
  const accuracy = state.totalPairs / Math.max(1, state.attempts);
  let stars = 1;
  if (accuracy >= 0.7) stars = 3;
  else if (accuracy >= 0.4) stars = 2;

  // Mensaje motivacional
  const messages = {
    3: '¡EXCELENTE! SOS UN CRACK!',
    2: '¡MUY BIEN! SEGUÍ ASÍ!',
    1: '¡SEGUÍ PRACTICANDO!'
  };

  // Llenar pantalla fin
  document.getElementById('end-score').textContent = state.score;
  document.getElementById('end-time').textContent = formatTime(state.elapsedSeconds);
  document.getElementById('end-attempts').textContent = state.attempts;
  document.getElementById('end-errors').textContent = state.errors;
  document.getElementById('end-message').textContent = messages[stars];

  // Estrellas
  const starEls = document.querySelectorAll('#end-stars .fa-star');
  starEls.forEach((s, i) => {
    s.classList.toggle('earned', i < stars);
  });

  // Guardar ranking
  saveToRanking({
    name: state.playerName,
    score: state.score,
    difficulty: state.difficulty,
    pairs: state.totalPairs,
    time: state.elapsedSeconds,
    date: new Date().toLocaleDateString('es-AR')
  });

  showScreen('screen-end');
  startConfetti();
}

/* ============================================================
   CONFETTI
   ============================================================ */
let confettiParticles = [];
let confettiRunning = false;

function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#FF6B35','#00B894','#FDCB6E','#E74C3C','#FF9FF3','#54A0FF','#FFF'];

  confettiParticles = [];
  for (let i = 0; i < 180; i++) {
    confettiParticles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 300,
      w: 5 + Math.random() * 9,
      h: 3 + Math.random() * 7,
      vx: (Math.random() - 0.5) * 5,
      vy: 2.5 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 12,
      opacity: 1
    });
  }

  confettiRunning = true;
  animateConfetti(ctx, canvas);
}

function animateConfetti(ctx, canvas) {
  if (!confettiRunning) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let alive = false;

  for (const p of confettiParticles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;
    p.vx *= 0.99;
    p.rot += p.rotV;
    if (p.y > canvas.height + 30) p.opacity -= 0.03;
    if (p.opacity <= 0) continue;
    alive = true;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * Math.PI / 180);
    ctx.globalAlpha = Math.max(0, p.opacity);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }

  if (alive) requestAnimationFrame(() => animateConfetti(ctx, canvas));
  else { confettiRunning = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

/* ============================================================
   RANKING (LOCALSTORAGE)
   ============================================================ */
function getRanking() {
  try { return JSON.parse(localStorage.getItem('memoria-ranking') || '[]'); }
  catch { return []; }
}

function saveToRanking(entry) {
  const ranking = getRanking();
  ranking.push(entry);
  ranking.sort((a, b) => b.score - a.score);
  ranking.splice(10);
  localStorage.setItem('memoria-ranking', JSON.stringify(ranking));
}

function renderRanking() {
  const list = document.getElementById('ranking-list');
  const ranking = getRanking();
  if (ranking.length === 0) {
    list.innerHTML = '<li class="ranking-empty">AÚN NO HAY REGISTROS</li>';
    return;
  }
  list.innerHTML = ranking.map((r, i) => `
    <li class="ranking-item">
      <div class="ranking-pos">${i + 1}</div>
      <div class="ranking-name">${r.name}</div>
      <div class="ranking-score">${r.score}</div>
      <div class="ranking-date">${r.date || ''}</div>
    </li>
  `).join('');
}

/* ============================================================
   FUNCIONALIDAD QR
   ============================================================ */
function generateQR() {
  const url = window.location.href;
  const canvas = document.getElementById('qr-canvas');
  const ctx = canvas.getContext('2d');

  // Crear código QR con qrcode-generator
  const qr = qrcode(0, 'M'); // 0 = auto-detect, 'M' = medium error correction
  qr.addData(url);
  qr.make();

  // Calcular tamaño del módulo
  const size = qr.getModuleCount();
  const cellSize = Math.floor(200 / size); // 200px canvas
  const margin = Math.floor((200 - size * cellSize) / 2);

  // Limpiar canvas
  ctx.fillStyle = '#FEF6E8'; // colorLight
  ctx.fillRect(0, 0, 200, 200);

  // Dibujar módulos
  ctx.fillStyle = '#3D2C1E'; // colorDark
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (qr.isDark(row, col)) {
        const x = margin + col * cellSize;
        const y = margin + row * cellSize;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }
}

function openQRModal() {
  generateQR();
  document.getElementById('qr-modal').classList.add('show');
}

/* ============================================================
   INICIAR JUEGO
   ============================================================ */
function startGame(useCustom) {
  const name = document.getElementById('player-name').value.trim().toUpperCase();
  if (!name) { showToast('INGRESÁ TU NOMBRE', 'error'); document.getElementById('player-name').focus(); return; }

  const diff = DIFFICULTY_MAP[state.difficulty];
  let pairs;

  if (useCustom) {
    if (uploadedImages.length < diff.pairs) {
      showToast(`CARGÁ AL MENOS ${diff.pairs} IMÁGENES`, 'error');
      return;
    }
    // Seleccionar pares aleatorios
    const shuffled = [...uploadedImages].sort(() => Math.random() - 0.5);
    pairs = shuffled.slice(0, diff.pairs).map(img => ({
      name: img.name,
      imageUrl: img.imageUrl,
      syllables: separateSyllables(img.name)
    }));
  } else {
    const shuffled = [...DEFAULT_PAIRS].sort(() => Math.random() - 0.5);
    pairs = shuffled.slice(0, diff.pairs).map(p => ({
      name: p.name,
      imageUrl: emojiImageCache[p.name],
      syllables: p.syllables
    }));
  }

  // Reiniciar estado
  state.playerName = name;
  state.pairs = pairs;
  state.totalPairs = pairs.length;
  state.cards = generateCards(pairs);
  state.flippedCards = [];
  state.score = 0;
  state.pairsFound = 0;
  state.attempts = 0;
  state.errors = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.firstAttempt = true;
  state.locked = false;
  state.useCustom = useCustom;

  renderBoard();
  updateHUD();
  showScreen('screen-game');
  startTimer();
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  createBackgroundShapes();

  // Dificultad
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.difficulty = btn.dataset.diff;
    });
  });

  // Drop zone
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
    fileInput.value = '';
  });

  // Botones de inicio
  document.getElementById('btn-start-custom').addEventListener('click', () => startGame(true));
  document.getElementById('btn-start-default').addEventListener('click', () => startGame(false));

  // Pantalla fin
  document.getElementById('btn-play-again').addEventListener('click', () => {
    confettiRunning = false;
    startGame(state.useCustom);
  });
  document.getElementById('btn-go-home').addEventListener('click', () => {
    confettiRunning = false;
    showScreen('screen-start');
  });

  // Ranking
  document.getElementById('btn-show-ranking').addEventListener('click', openRanking);
  document.getElementById('btn-show-ranking-end').addEventListener('click', openRanking);
  document.getElementById('btn-close-ranking').addEventListener('click', () => {
    document.getElementById('ranking-modal').classList.remove('show');
  });
  document.getElementById('ranking-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('show');
  });

  // QR
  document.getElementById('btn-share-qr').addEventListener('click', openQRModal);
  document.getElementById('qr-float-btn').addEventListener('click', openQRModal);
  document.getElementById('btn-close-qr').addEventListener('click', () => {
    document.getElementById('qr-modal').classList.remove('show');
  });
  document.getElementById('qr-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('show');
  });

  // Mute
  document.getElementById('btn-mute').addEventListener('click', () => {
    state.muted = !state.muted;
    const btn = document.getElementById('btn-mute');
    btn.classList.toggle('muted', state.muted);
    btn.innerHTML = state.muted
      ? '<i class="fas fa-volume-xmark"></i>'
      : '<i class="fas fa-volume-high"></i>';
    if (state.muted) window.speechSynthesis?.cancel();
  });

  // Cerrar overlay silabas al hacer click
  document.getElementById('syllable-overlay').addEventListener('click', () => {
    document.getElementById('syllable-overlay').classList.remove('show');
  });
});

function openRanking() {
  renderRanking();
  document.getElementById('ranking-modal').classList.add('show');
}