import { getStore } from "@netlify/blobs";

function cleanNickname(s) {
  const nick = (s || "anon").trim().slice(0, 16) || "anon";
  return nick.replace(/[^\p{L}\p{N}_\- ]/gu, "");
}

function better(a, b) {
  if (a.correct !== b.correct) return a.correct > b.correct;
  return a.timeMs < b.timeMs;
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const body = await req.json().catch(() => null);
  if (!body?.attemptId || !Array.isArray(body?.answers)) {
    return Response.json({ error: "Bad payload" }, { status: 400 });
  }

  const store = getStore("times-table-2-9");

  // ✅ НЯМА getJSON — ползваме get(..., {type:'json'})
  const attempt = await store.get(`attempt:${body.attemptId}`, { type: "json" });
  if (!attempt) return Response.json({ error: "Attempt expired" }, { status: 400 });

  const now = Date.now();
  const maxMs = (attempt.durationSec || 60) * 1000;
  const elapsedMs = now - attempt.startedAt;
  const timeMs = Math.min(elapsedMs, maxMs);

  const questions = attempt.questions || [];
  const count = attempt.count || questions.length || 20;

  const given = Array.from({ length: count }, (_, i) => body.answers[i] ?? null);

  let correct = 0;
  const review = questions.slice(0, count).map((q, i) => {
    const answer = q.a * q.b;
    const g = given[i];
    const isCorrect = Number(g) === answer;
    if (isCorrect) correct++;
    return {
      a: q.a,
      b: q.b,
      answer,
      given: (g === null || g === undefined || Number.isNaN(g)) ? "" : String(g),
      correct: isCorrect
    };
  });

  const nickname = cleanNickname(body.nickname);

  const entry = { nickname, correct, timeMs, at: now };
  const lbKey = "leaderboard:v1";

  // ✅ НЯМА getJSON
  const leaderboard = (await store.get(lbKey, { type: "json" })) || [];

  const idx = leaderboard.findIndex(x => x.nickname === nickname);
  if (idx >= 0) {
    if (better(entry, leaderboard[idx])) leaderboard[idx] = entry;
  } else {
    leaderboard.push(entry);
  }

  leaderboard.sort((x, y) => {
    if (y.correct !== x.correct) return y.correct - x.correct;
    return x.timeMs - y.timeMs;
  });

  await store.setJSON(lbKey, leaderboard.slice(0, 20));
  await store.delete(`attempt:${body.attemptId}`);

  return Response.json({ correct, timeMs, review });
};


