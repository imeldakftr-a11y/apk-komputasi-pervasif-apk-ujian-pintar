// ===== EXAM.JS — Pervasive Computing Features =====

// Auth check
const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
if (!user) { window.location.href = 'index.html'; }
document.getElementById('student-name-display').textContent = `👤 ${user.nama}`;

// ===== CONFIG =====
const EXAM_DURATION  = 10 * 60;  // 10 menit
const MAX_TAB_SWITCH = 2;         // Maks pindah tab sebelum diblokir
const IDLE_THRESHOLD = 10;        // Detik sebelum dianggap AFK
const AFK_AUTO_SUBMIT= 10;        // Detik countdown sebelum auto submit saat AFK
const CAT_REFRESH_DURATION = 10;  // Detik durasi jeda refreshing kucing
const CAT_REFRESH_MAX = 3;        // Maks kesempatan refreshing

// ===== STATE =====
let timeLeft       = EXAM_DURATION;
let timerInterval  = null;
let isPaused       = false;
let isLocked       = false;
let examSubmitted  = false;

let tabSwitchCount = 0;
let behaviorLog    = [];
let userAnswers    = {};
let answeredCount  = 0;

// AFK state
let lastActivityTime   = Date.now();
let isIdle             = false;
let totalAfkSeconds    = 0;
let idleCheckInterval  = null;
let afkCountdown       = AFK_AUTO_SUBMIT;
let afkCountdownInterval = null;

// Cat refresh break state
let catRefreshLeft     = CAT_REFRESH_MAX;
let catRefreshActive   = false;
let catRefreshInterval = null;

// ===== ANTI-COPY =====
// Block Ctrl+C, Ctrl+A, Ctrl+V, right-click
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.ctrlKey && ['c','a','u','s'].includes(e.key.toLowerCase())) {
    e.preventDefault();
    flashStatusWarn('🚫 Menyalin teks tidak diizinkan selama ujian!');
  }
  if (e.key === 'PrintScreen') {
    e.preventDefault();
    flashStatusWarn('🚫 Screenshot tidak diizinkan!');
  }
  resetActivity();
});
document.addEventListener('copy', e => { e.preventDefault(); flashStatusWarn('🚫 Copy tidak diizinkan!'); });
document.addEventListener('cut',  e => { e.preventDefault(); });

// ===== RENDER SOAL =====
function renderQuestions() {
  const c = document.getElementById('questions-container');
  QUESTIONS.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `q-card-${q.id}`;
    card.innerHTML = `
      <div class="question-number">📌 Soal ${i+1} dari ${QUESTIONS.length}</div>
      <div class="question-text">${q.text}</div>
      <div class="option-list">
        ${q.options.map((opt,oi)=>`
          <label class="option-item" id="opt-${q.id}-${oi}" onclick="selectOption(${q.id},${oi})">
            <input type="radio" name="q${q.id}" value="${oi}"/>
            <span class="option-letter">${String.fromCharCode(65+oi)}</span>
            <span class="option-label">${opt}</span>
          </label>
        `).join('')}
      </div>`;
    c.appendChild(card);
  });
}

function selectOption(qId, optIdx) {
  if (isLocked || examSubmitted) return;
  const wasAnswered = userAnswers[qId] !== undefined;
  
  document.querySelectorAll(`[id^="opt-${qId}-"]`).forEach(el => el.classList.remove('selected'));
  document.getElementById(`opt-${qId}-${optIdx}`).classList.add('selected');
  const radio = document.querySelector(`input[name="q${qId}"][value="${optIdx}"]`);
  if (radio) radio.checked = true;
  
  userAnswers[qId] = optIdx;
  document.getElementById(`q-card-${qId}`).classList.add('answered');
  
  if (!wasAnswered) {
    answeredCount++;
    updateProgress();
  }
  resetActivity();
}

function updateProgress() {
  const pct = (answeredCount / QUESTIONS.length) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${answeredCount} dari ${QUESTIONS.length} soal dijawab`;
  updateUnansweredNavigator();
}

// ===== FITUR: NAVIGATOR SOAL BELUM DIISI =====
function updateUnansweredNavigator() {
  const unanswered = QUESTIONS.filter(q => userAnswers[q.id] === undefined);
  const badge = document.getElementById('unanswered-badge');
  badge.textContent = unanswered.length;
  badge.classList.toggle('all-done', unanswered.length === 0);

  const grid = document.getElementById('navigator-grid');
  if (unanswered.length === 0) {
    grid.innerHTML = `<div class="navigator-empty">🎉 Semua soal sudah dijawab!</div>`;
    return;
  }
  grid.innerHTML = unanswered.map(q => {
    const idx = QUESTIONS.findIndex(x => x.id === q.id) + 1;
    return `<button class="navigator-chip" onclick="focusQuestion(${q.id})">Soal ${idx}</button>`;
  }).join('');
}

function toggleNavigator() {
  document.getElementById('navigator-panel').classList.toggle('hidden');
}

// ===== FITUR: AUTO ZOOM KE SOAL YANG DIPENCET =====
function focusQuestion(qId) {
  const card = document.getElementById(`q-card-${qId}`);
  if (!card) return;
  document.getElementById('navigator-panel').classList.add('hidden');
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.add('zoomed');
  setTimeout(() => card.classList.remove('zoomed'), 1600);
}

// ===== TIMER =====
function startTimer() {
  timerInterval = setInterval(() => {
    if (isPaused || isLocked || examSubmitted) return;
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      addLog('⏰', 'Waktu habis! Jawaban otomatis dikumpulkan.');
      submitExam(false, 'timeout');
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeLeft/60), s = timeLeft%60;
  document.getElementById('timer').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  document.getElementById('timer-box').classList.toggle('urgent', timeLeft <= 60);
}

// ===== FITUR PERVASIF 1: TAB VISIBILITY =====
document.addEventListener('visibilitychange', () => {
  if (isLocked || examSubmitted) return;
  if (!document.hidden) {
    if (!isIdle) setStatus('ok','✅','Kembali ke ujian. Lanjutkan mengerjakan!');
    return;
  }

  tabSwitchCount++;
  updateBadge('tab-badge', `🔖 Tab: ${tabSwitchCount}/${MAX_TAB_SWITCH}`, 'badge-red');
  addLog('🔖', `Pindah tab ke-${tabSwitchCount} terdeteksi pada ${getTime()}`);

  if (tabSwitchCount >= MAX_TAB_SWITCH) {
    // BLOKIR
    isLocked = true; isPaused = true;
    // Simpan NIM ke blacklist localStorage agar tidak bisa login ulang
    const blocked = JSON.parse(localStorage.getItem('blockedNIMs') || '[]');
    if (!blocked.includes(user.nim)) { blocked.push(user.nim); localStorage.setItem('blockedNIMs', JSON.stringify(blocked)); }
    addLog('🔒', `Ujian DIBLOKIR karena pindah tab ${tabSwitchCount} kali (maks ${MAX_TAB_SWITCH}).`);
    clearAfkCountdown();
    document.getElementById('lock-count').textContent = tabSwitchCount;
    document.getElementById('lock-overlay').classList.remove('hidden');
  } else {
    const sisa = MAX_TAB_SWITCH - tabSwitchCount;
    setStatus('danger','🚨',`Peringatan! Pindah tab ${tabSwitchCount}x. Sisa toleransi: ${sisa} kali lagi!`);
    showOverlay('⚠️','Peringatan Pindah Tab!',
      `Anda pindah tab ke-${tabSwitchCount} dari maksimal ${MAX_TAB_SWITCH} kali. Jika ${sisa} kali lagi, ujian Anda DIBLOKIR!`);
  }
});

// ===== FITUR PERVASIF 2: IDLE / AFK DETECTOR =====
function resetActivity() {
  lastActivityTime = Date.now();
  if (isIdle && !isLocked && !examSubmitted) {
    isIdle = false;
    isPaused = false;
    clearAfkCountdown();
    document.getElementById('afk-overlay').classList.add('hidden');
    addLog('🟢', `Pengguna kembali aktif. Hitungan AFK dihentikan.`);
    if (!document.hidden) setStatus('ok','✅','Aktivitas terdeteksi. Ujian dilanjutkan!');
  }
}

function startIdleDetector() {
  ['mousemove','mousedown','keydown','touchstart','scroll'].forEach(e =>
    document.addEventListener(e, resetActivity, { passive: true })
  );

  idleCheckInterval = setInterval(() => {
    if (isLocked || examSubmitted || catRefreshActive) return;
    const secIdle = Math.floor((Date.now() - lastActivityTime) / 1000);

    if (secIdle >= IDLE_THRESHOLD && !isIdle) {
      // Mulai AFK mode
      isIdle = true;
      isPaused = true;
      afkCountdown = AFK_AUTO_SUBMIT;
      addLog('😴', `AFK terdeteksi pada ${getTime()} (idle ${secIdle}s)`);
      setStatus('afk','😴','User is Away From Keyboard — Timer dijeda!');
      document.getElementById('afk-overlay').classList.remove('hidden');
      startAfkCountdown();
    } else if (isIdle) {
      totalAfkSeconds++;
      updateBadge('afk-badge', `⏳ AFK: ${totalAfkSeconds} dtk`);
      setStatus('afk-warn','⚠️',`AFK ${totalAfkSeconds}s — Ujian akan dikumpulkan otomatis jika tidak ada aktivitas!`);
    }
  }, 1000);
}

function startAfkCountdown() {
  afkCountdownInterval = setInterval(() => {
    if (!isIdle || isLocked || examSubmitted) { clearAfkCountdown(); return; }
    document.getElementById('afk-countdown').textContent = afkCountdown;
    if (afkCountdown <= 0) {
      clearAfkCountdown();
      addLog('⏰', `Ujian auto-submit karena AFK melebihi ${AFK_AUTO_SUBMIT} detik.`);
      document.getElementById('afk-overlay').classList.add('hidden');
      submitExam(false, 'afk');
    }
    afkCountdown--;
  }, 1000);
}

function clearAfkCountdown() {
  clearInterval(afkCountdownInterval);
  afkCountdownInterval = null;
}

// ===== FITUR: REFRESHING KUCING (3x KESEMPATAN, 10 DETIK) =====
function startCatRefresh() {
  if (catRefreshActive || catRefreshLeft <= 0 || isLocked || examSubmitted) return;

  catRefreshActive = true;
  catRefreshLeft--;
  updateCatRefreshButton();
  isPaused = true; // jeda timer ujian selama refreshing
  addLog('🐱', `Fitur Refreshing digunakan pada ${getTime()} (sisa ${catRefreshLeft}x).`);

  let countdown = CAT_REFRESH_DURATION;
  document.getElementById('cat-countdown').textContent = countdown;
  document.getElementById('cat-overlay-left').textContent = `${catRefreshLeft}x`;
  document.getElementById('cat-overlay').classList.remove('hidden');

  catRefreshInterval = setInterval(() => {
    countdown--;
    document.getElementById('cat-countdown').textContent = countdown;
    if (countdown <= 0) {
      clearInterval(catRefreshInterval);
      catRefreshInterval = null;
      document.getElementById('cat-overlay').classList.add('hidden');
      catRefreshActive = false;
      resetActivity();
      if (!isIdle && !isLocked && !examSubmitted) isPaused = false;
      addLog('🐱', `Sesi Refreshing selesai pada ${getTime()}.`);
    }
  }, 1000);
}

function updateCatRefreshButton() {
  const btn = document.getElementById('cat-refresh-btn');
  const countEl = document.getElementById('cat-refresh-count');
  countEl.textContent = `(${catRefreshLeft}x)`;
  if (catRefreshLeft <= 0) {
    btn.disabled = true;
    btn.classList.add('disabled');
  }
}

// ===== FITUR: KONFIRMASI SEBELUM SUBMIT =====
function askConfirmSubmit() {
  if (examSubmitted || isLocked) return;
  const unanswered = QUESTIONS.filter(q => userAnswers[q.id] === undefined).length;
  const msg = unanswered > 0
    ? `Kamu masih memiliki <strong>${unanswered} soal</strong> yang belum dijawab. Apakah kamu yakin ingin mengumpulkan jawaban sekarang?`
    : `Semua soal sudah dijawab. Pastikan kamu sudah memeriksa semua jawabanmu. Apakah kamu yakin ingin mengumpulkan sekarang?`;
  document.getElementById('confirm-submit-message').innerHTML = msg;
  document.getElementById('confirm-submit-overlay').classList.remove('hidden');
}

function closeConfirmSubmit() {
  document.getElementById('confirm-submit-overlay').classList.add('hidden');
}

function confirmSubmit() {
  document.getElementById('confirm-submit-overlay').classList.add('hidden');
  submitExam(false);
}

// ===== UI HELPERS =====
function setStatus(type, icon, text) {
  document.getElementById('status-bar').className = `status-bar status-${type}`;
  document.getElementById('status-icon').textContent = icon;
  document.getElementById('status-text').textContent = text;
}

function flashStatusWarn(msg) {
  setStatus('danger','🚫', msg);
  setTimeout(() => {
    if (!isIdle && !isLocked) setStatus('ok','✅','Ujian Berjalan — Selamat mengerjakan!');
  }, 2500);
}

function updateBadge(id, text, cls='') {
  const el = document.getElementById(id);
  el.textContent = text;
  if (cls) el.className = `badge ${cls}`;
}

function showOverlay(icon, title, msg) {
  document.getElementById('overlay-icon').textContent = icon;
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-message').textContent = msg;
  document.getElementById('overlay').classList.remove('hidden');
}

function dismissOverlay() {
  document.getElementById('overlay').classList.add('hidden');
  if (!isIdle && !isLocked) setStatus('ok','✅','Ujian Berjalan — Selamat mengerjakan!');
}

function addLog(icon, msg) {
  behaviorLog.push({ icon, msg, time: getTime() });
}

function getTime() {
  return new Date().toLocaleTimeString('id-ID');
}

// ===== SUBMIT =====
function submitExam(forced, reason='manual') {
  if (examSubmitted) return;
  examSubmitted = true;
  clearInterval(timerInterval);
  clearInterval(idleCheckInterval);
  clearAfkCountdown();

  const timeUsed = EXAM_DURATION - timeLeft;
  let correct = 0;
  QUESTIONS.forEach(q => { if (userAnswers[q.id] === q.answer) correct++; });
  const wrong = QUESTIONS.filter(q => userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.answer).length;
  const unanswered = QUESTIONS.filter(q => userAnswers[q.id] === undefined).length;

  addLog('📤', `Ujian dikumpulkan (${reason === 'timeout' ? 'waktu habis' : reason === 'afk' ? 'auto AFK' : reason === 'blocked' ? 'diblokir' : 'manual'}) pada ${getTime()}.`);

  sessionStorage.setItem('examResult', JSON.stringify({
    user, timeUsed,
    score: Math.round((correct / QUESTIONS.length) * 100),
    correct, wrong, unanswered,
    userAnswers, behaviorLog, tabSwitchCount, totalAfkSeconds,
    isBlocked: isLocked && tabSwitchCount >= MAX_TAB_SWITCH,
    submitReason: reason,
  }));
  window.location.href = 'result.html';
}

// ===== INIT =====
renderQuestions();
updateUnansweredNavigator();
startTimer();
startIdleDetector();
addLog('🚀', `Ujian dimulai: ${user.nama} (${user.nim}) pada ${getTime()}.`);
