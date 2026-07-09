// ===== RESULT.JS =====
const R = JSON.parse(sessionStorage.getItem('examResult') || 'null');
if (!R) { window.location.href = 'index.html'; }

const { user, score, correct, wrong, unanswered, userAnswers,
        behaviorLog, tabSwitchCount, totalAfkSeconds, timeUsed, isBlocked, submitReason } = R;

// Student
document.getElementById('student-result-name').textContent = `${user.nama} • ${user.nim} • ${user.jurusan}`;

// Score ring animation
const circumference = 390;
setTimeout(() => {
  const offset = circumference - (score / 100) * circumference;
  document.getElementById('ring-fill').style.strokeDashoffset = offset;
}, 100);
document.getElementById('score-number').textContent = score;

// Grade
let icon='🎉', grade='A', title='Luar Biasa!', sub='Nilai sempurna, keren banget!';
if      (isBlocked)  { icon='🔒'; grade='—'; title='Diblokir!';           sub='Ujian dihentikan karena pelanggaran.'; }
else if (score>=85)  { icon='🏆'; grade='A'; title='Luar Biasa!';         sub='Pertahankan terus prestasi ini!'; }
else if (score>=70)  { icon='👍'; grade='B'; title='Baik!';               sub='Pertahankan prestasi kamu!'; }
else if (score>=55)  { icon='😐'; grade='C'; title='Cukup.';              sub='Masih perlu ditingkatkan ya!'; }
else                 { icon='😟'; grade='D'; title='Perlu Belajar Lagi.'; sub='Jangan menyerah, terus berlatih!'; }

document.getElementById('result-icon').textContent = icon;
document.getElementById('grade-badge').textContent  = grade;
document.getElementById('grade-title').textContent  = title;
document.getElementById('grade-sub').textContent    = sub;

// Stats
document.getElementById('correct-count').textContent   = correct;
document.getElementById('wrong-count').textContent     = wrong;
document.getElementById('unanswered-count').textContent = unanswered;
const m = Math.floor(timeUsed/60), s = timeUsed%60;
document.getElementById('time-used-display').textContent = `${m}m${s}s`;

// Violations
const totalVio = tabSwitchCount + (isBlocked ? 1 : 0);
document.getElementById('vio-badge').textContent = `${totalVio} pelanggaran`;

const vtab = document.getElementById('v-tab');
vtab.textContent = `${tabSwitchCount} kali`;
vtab.style.color = tabSwitchCount >= 2 ? '#f87171' : tabSwitchCount > 0 ? '#fbbf24' : '#34d399';

const vafk = document.getElementById('v-afk');
vafk.textContent = `${totalAfkSeconds} detik`;
vafk.style.color = totalAfkSeconds > 15 ? '#f87171' : totalAfkSeconds > 0 ? '#fbbf24' : '#34d399';

const vstatus = document.getElementById('v-status');
if (isBlocked) {
  vstatus.textContent = '🔒 DIBLOKIR'; vstatus.style.cssText = 'background:rgba(239,68,68,0.15);color:#f87171;border-color:rgba(239,68,68,0.3)';
} else if (submitReason === 'afk') {
  vstatus.textContent = '😴 Auto-Submit AFK'; vstatus.style.cssText = 'background:rgba(251,191,36,0.12);color:#fbbf24;border-color:rgba(251,191,36,0.25)';
} else if (submitReason === 'timeout') {
  vstatus.textContent = '⏰ Waktu Habis'; vstatus.style.cssText = 'background:rgba(251,191,36,0.12);color:#fbbf24;border-color:rgba(251,191,36,0.25)';
} else {
  vstatus.textContent = '✅ Selesai Normal'; vstatus.style.cssText = 'background:rgba(52,211,153,0.12);color:#34d399;border-color:rgba(52,211,153,0.25)';
}

// Log
const logEl = document.getElementById('log-container');
const box = document.createElement('div');
box.className = 'log-summary';
box.innerHTML = `📊 Ringkasan: Pindah tab <strong>${tabSwitchCount}x</strong> • AFK <strong>${totalAfkSeconds} detik</strong> • Waktu pengerjaan <strong>${m} menit ${s} detik</strong> • Submit: <strong>${submitReason==='manual'?'Manual':submitReason==='afk'?'Auto AFK':submitReason==='timeout'?'Waktu habis':'Diblokir'}</strong>`;
logEl.appendChild(box);

behaviorLog.forEach(log => {
  const item = document.createElement('div');
  item.className = 'log-item';
  item.innerHTML = `<span class="log-emoji">${log.icon}</span><span class="log-msg">${log.msg}</span><span class="log-time">${log.time}</span>`;
  logEl.appendChild(item);
});

// Review
const revEl = document.getElementById('review-container');
QUESTIONS.forEach((q, i) => {
  const answered = userAnswers[q.id] !== undefined;
  const isOk = answered && userAnswers[q.id] === q.answer;
  let cls = 'rev-empty', si = '⬜';
  if (answered && isOk)  { cls = 'rev-correct'; si = '✅'; }
  else if (answered)     { cls = 'rev-wrong';   si = '❌'; }

  const yourAns = answered
    ? `${String.fromCharCode(65+userAnswers[q.id])}. ${q.options[userAnswers[q.id]]}`
    : 'Tidak dijawab';
  const rightAns = `${String.fromCharCode(65+q.answer)}. ${q.options[q.answer]}`;

  const item = document.createElement('div');
  item.className = `rev-item ${cls}`;
  item.innerHTML = `
    <div class="rev-header">
      <div class="rev-num">${i+1}</div>
      <div class="rev-q">${q.text}</div>
      <div class="rev-status">${si}</div>
    </div>
    <div class="rev-body">
      <div class="rev-row">
        <span class="rev-row-label">Jawaban kamu:</span>
        <span class="${isOk?'rev-correct-txt':answered?'rev-wrong-txt':'rev-neutral-txt'}">${yourAns}</span>
      </div>
      ${!isOk ? `<div class="rev-row"><span class="rev-row-label">Jawaban benar:</span><span class="rev-correct-txt">${rightAns}</span></div>` : ''}
      <div class="rev-explain">${q.explanation}</div>
    </div>`;
  revEl.appendChild(item);
});

sessionStorage.removeItem('examResult');
sessionStorage.removeItem('currentUser');
