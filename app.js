let nextTimeout = null;

const $ = (id) => document.getElementById(id);

const ui = {
  subtitle: $("subtitle"),
  timeLeft: $("timeLeft"),
  progress: $("progress"),

  startCard: $("startCard"),
  quizCard: $("quizCard"),
  resultCard: $("resultCard"),

  nickname: $("nickname"),
  startBtn: $("startBtn"),
  refreshLb: $("refreshLb"),
  lb: $("lb"),

  qIndex: $("qIndex"),
  expr: $("expr"),
  answerInput: $("answerInput"),
  feedback: $("feedback"),

  summary: $("summary"),
  againBtn: $("againBtn"),
  refreshLb2: $("refreshLb2"),
  lb2: $("lb2"),
  reviewList: $("reviewList"),
};

let cfg = null;
let attempt = null;
let answers = [];
let currentIndex = 0;

let timer = null;
let endsAtMs = 0;
let finishing = false;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

async function loadConfig() {
  const r = await fetch("/config.json", { cache: "no-store" });
  if (!r.ok) throw new Error("Не мога да заредя config.json");
  cfg = await r.json();

  ui.subtitle.textContent = `${cfg.count} задачи • ${cfg.durationSec} сек • ${cfg.min}–${cfg.max}`;
  ui.timeLeft.textContent = String(cfg.durationSec);
  ui.progress.textContent = `0/${cfg.count}`;
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

function startTimer(durationSec) {
  endsAtMs = Date.now() + durationSec * 1000;

  const tick = () => {
    const left = Math.max(0, Math.ceil((endsAtMs - Date.now()) / 1000));
    ui.timeLeft.textContent = String(left);
    if (left <= 0) finish("time");
  };

  tick();
  stopTimer();
  timer = setInterval(tick, 250);
}

function showScreen(which) {
  ui.startCard.hidden = which !== "start";
  ui.quizCard.hidden = which !== "quiz";
  ui.resultCard.hidden = which !== "result";
}

function renderQuestion() {
  const total = cfg.count;

  // Guard: ако attempt е приключил/занулен или индексът е извън масива
  const q = attempt?.questions?.[currentIndex];
  if (!q) {
    finish("done");
    return;
  }

  ui.qIndex.textContent = `${currentIndex + 1}/${total}`;
  ui.progress.textContent = `${currentIndex}/${total}`;

  ui.expr.textContent = `${q.a} × ${q.b}`;

  ui.answerInput.value = "";
  ui.answerInput.disabled = false;
  ui.answerInput.focus();

  ui.feedback.textContent = "";
  ui.feedback.classList.remove("good", "bad");
}


function setFeedback(ok, correctAnswer) {
  ui.feedback.classList.remove("good", "bad");
  if (ok) {
    ui.feedback.textContent = "✅ Вярно!";
    ui.feedback.classList.add("good");
  } else {
    ui.feedback.textContent = `❌ Грешно. Правилният е: ${correctAnswer}`;
    ui.feedback.classList.add("bad");
  }
}

function getNickname() {
  return ui.nickname ? ui.nickname.value.trim().slice(0, 16) : "";
}


async function apiStart() {
  const r = await fetch("/api/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      count: cfg.count,
      durationSec: cfg.durationSec,
      min: cfg.min,
      max: cfg.max
    })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "Грешка при /api/start");
  return data;
}

async function apiSubmit(payload) {
  const r = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "Грешка при /api/submit");
  return data;
}

async function apiLeaderboard() {
  const r = await fetch("/api/leaderboard");
  if (!r.ok) throw new Error(`Leaderboard HTTP ${r.status}`);
  const data = await r.json();
  return data.items || [];
}

function renderLeaderboard(items, targetEl) {
  if (!items.length) {
    targetEl.innerHTML = `<p class="muted">Няма резултати още.</p>`;
    return;
  }

  targetEl.innerHTML = `
    <ol>
      ${items.map(x => {
        const timeSecNum = Number(x.timeMs || 0) / 1000;
        const timeText = timeSecNum.toLocaleString("bg-BG", {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3
        });

        return `<li><b>${esc(x.nickname)}</b> — ${x.correct}/${cfg.count} — ${timeText} сек</li>`;
      }).join("")}
    </ol>
  `;
}


async function refreshLeaderboard() {
  try {
    const items = await apiLeaderboard();
    renderLeaderboard(items, ui.lb);
    renderLeaderboard(items, ui.lb2);
  } catch (e) {
    const msg = esc(e?.message || "Грешка при зареждане на Top 20");
    if (ui.lb) ui.lb.innerHTML = `<p class="muted">${msg}</p>`;
    if (ui.lb2) ui.lb2.innerHTML = `<p class="muted">${msg}</p>`;
  }
}


async function start() {
  finishing = false;
  answers = Array(cfg.count).fill(null);
  currentIndex = 0;

  attempt = await apiStart();

  showScreen("quiz");
  ui.answerInput.disabled = false;

  startTimer(attempt.durationSec || cfg.durationSec);
  renderQuestion();
}

async function checkAndNext() {
  if (!attempt || finishing) return;

  // ако времето е свършило
  if (Date.now() >= endsAtMs) {
    finish("time");
    return;
  }

  // guard: ако липсва въпрос (race/индекс), приключваме
  const q = attempt?.questions?.[currentIndex];
  if (!q) {
    finish("done");
    return;
  }

  // защита от двойно натискане (Enter + OK, или бързо Enter)
  if (ui.answerInput.disabled) return;

  const correct = q.a * q.b;

  const raw = ui.answerInput.value;
  const given = raw === "" ? null : Number(raw);

  const ok = Number(given) === correct;
  answers[currentIndex] = given;

  setFeedback(ok, correct);

  ui.answerInput.disabled = true;

  const isLast = currentIndex === cfg.count - 1;

  // ако е последен въпрос: спираме таймера веднага
  if (isLast) {
    stopTimer();
    finish("done");
    return;
  }

  // чистим предишен timeout (ако има)
  if (nextTimeout) {
    clearTimeout(nextTimeout);
    nextTimeout = null;
  }

  nextTimeout = setTimeout(() => {
    // ако вече приключваме или attempt е занулен — спираме
    if (finishing || !attempt) return;

    currentIndex++;
    ui.progress.textContent = `${currentIndex}/${cfg.count}`;

    if (currentIndex >= cfg.count) {
      stopTimer();
      finish("done");
      return;
    }

    ui.answerInput.disabled = false;
    renderQuestion();
  }, 380);
}

async function finish(reason) {
  if (finishing) return;
  finishing = true;

  stopTimer();
  if (nextTimeout) {
    clearTimeout(nextTimeout);
    nextTimeout = null;
  }

  ui.answerInput.disabled = true;

  const localAttempt = attempt;
  attempt = null;

  if (!localAttempt || !localAttempt.attemptId) {
    showScreen("start");
    finishing = false;
    return;
  }

  const nickname = getNickname();

  let result;
  try {
    result = await apiSubmit({
      attemptId: localAttempt.attemptId,
      nickname,
      answers
    });
  } catch (e) {
    showScreen("quiz");
    ui.answerInput.disabled = false;
    finishing = false;
    alert((e && e.message) ? e.message : "Грешка при запис на резултата.");
    return;
  }

  showScreen("result");

  const masteryMinCorrect = Number((cfg && cfg.masteryMinCorrect) != null ? cfg.masteryMinCorrect : cfg.count);
  const masteryMaxTimeMs = Number((cfg && cfg.masteryMaxTimeMs) != null ? cfg.masteryMaxTimeMs : 45000);
  const isMaster = (result.correct >= masteryMinCorrect) && (result.timeMs <= masteryMaxTimeMs);

  // ✅ време: 43,567 сек (bg-BG запетая, 3 знака)
  const timeSecNum = Number(result.timeMs || 0) / 1000;
  const timeText = timeSecNum.toLocaleString("bg-BG", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });

  ui.summary.innerHTML = `
    <div><b>Верни:</b> ${result.correct}/${cfg.count}</div>
    <div><b>Време:</b> ${timeText} сек</div>
    <div class="muted">Край: ${reason === "time" ? "времето изтече" : "задачите свършиха"}</div>
    ${isMaster ? `<div class="badge">🏆 Майстор на таблицата</div>` : ""}
  `;

  ui.reviewList.innerHTML = (result.review || []).map((x, idx) => {
    const cls = x.correct ? "good" : "bad";
    const givenTxt = (x.given === "" ? "—" : esc(x.given));
    return `
      <div class="item ${cls}">
        <div><b>${idx + 1}) ${x.a} × ${x.b}</b> = <b>${givenTxt}</b></div>
        <div class="small">Правилен: <b>${x.answer}</b></div>
      </div>
    `;
  }).join("");

  await refreshLeaderboard();
}



function wire() {
  ui.startBtn.addEventListener("click", () => start().catch(e => alert(e.message)));
  ui.againBtn.addEventListener("click", () => {
    showScreen("start");
    ui.timeLeft.textContent = String(cfg.durationSec);
    ui.progress.textContent = `0/${cfg.count}`;
    ui.answerInput.disabled = false;
    finishing = false;
  });

  ui.answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      checkAndNext().catch(err => alert(err.message));
    }
    const okBtn = document.getElementById("okBtn");
if (okBtn) {
  okBtn.addEventListener("click", () => checkAndNext().catch(err => alert(err.message)));
}

  });

}

(async function main() {
  await loadConfig();
  wire();
  showScreen("start");
  await refreshLeaderboard();
})();


