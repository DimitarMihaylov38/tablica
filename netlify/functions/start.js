import { getStore } from "@netlify/blobs";
import crypto from "crypto";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestions({ count, min, max }) {
  // Уникални двойки (a,b). При 2..9 има 64 възможности, достатъчно за 20.
  const used = new Set();
  const out = [];

  while (out.length < count) {
    const a = randInt(min, max);
    const b = randInt(min, max);
    const key = `${a}x${b}`;
    if (used.has(key)) continue;
    used.add(key);
    out.push({ a, b });
  }
  return out;
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const body = await req.json().catch(() => ({}));

  const count = Number(body.count ?? 20);
  const durationSec = Number(body.durationSec ?? 60);

  // по твоята логика: махаме всички задачи с 1 => min=2 max=9
  const min = Number(body.min ?? 2);
  const max = Number(body.max ?? 9);

  if (!Number.isFinite(count) || count <= 0 || count > 50) {
    return Response.json({ error: "Bad count" }, { status: 400 });
  }
  if (!Number.isFinite(durationSec) || durationSec < 10 || durationSec > 600) {
    return Response.json({ error: "Bad duration" }, { status: 400 });
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 2 || max > 20 || min > max) {
    return Response.json({ error: "Bad range" }, { status: 400 });
  }

  const questions = makeQuestions({ count, min, max });
  const attemptId = crypto.randomUUID();
  const startedAt = Date.now();

  const store = getStore("times-table-2-9");
  await store.setJSON(
    `attempt:${attemptId}`,
    { questions, startedAt, durationSec, count },
    { ttl: 60 * 10 } // 10 мин
  );

  return Response.json({ attemptId, questions, durationSec, count });
};

