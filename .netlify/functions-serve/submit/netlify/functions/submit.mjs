
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/submit.js
import { getStore } from "@netlify/blobs";
function cleanNickname(s) {
  const nick = (s || "anon").trim().slice(0, 16) || "anon";
  return nick.replace(/[^\p{L}\p{N}_\- ]/gu, "");
}
function better(a, b) {
  if (a.correct !== b.correct) return a.correct > b.correct;
  return a.timeMs < b.timeMs;
}
var submit_default = async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const body = await req.json().catch(() => null);
  if (!body?.attemptId || !Array.isArray(body?.answers)) {
    return Response.json({ error: "Bad payload" }, { status: 400 });
  }
  const store = getStore("times-table-2-9");
  const attempt = await store.get(`attempt:${body.attemptId}`, { type: "json" });
  if (!attempt) return Response.json({ error: "Attempt expired" }, { status: 400 });
  const now = Date.now();
  const maxMs = (attempt.durationSec || 60) * 1e3;
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
      given: g === null || g === void 0 || Number.isNaN(g) ? "" : String(g),
      correct: isCorrect
    };
  });
  const nickname = cleanNickname(body.nickname);
  const entry = { nickname, correct, timeMs, at: now };
  const lbKey = "leaderboard:v1";
  const leaderboard = await store.get(lbKey, { type: "json" }) || [];
  const idx = leaderboard.findIndex((x) => x.nickname === nickname);
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
export {
  submit_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvc3VibWl0LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBnZXRTdG9yZSB9IGZyb20gXCJAbmV0bGlmeS9ibG9ic1wiO1xyXG5cclxuZnVuY3Rpb24gY2xlYW5OaWNrbmFtZShzKSB7XHJcbiAgY29uc3QgbmljayA9IChzIHx8IFwiYW5vblwiKS50cmltKCkuc2xpY2UoMCwgMTYpIHx8IFwiYW5vblwiO1xyXG4gIHJldHVybiBuaWNrLnJlcGxhY2UoL1teXFxwe0x9XFxwe059X1xcLSBdL2d1LCBcIlwiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYmV0dGVyKGEsIGIpIHtcclxuICBpZiAoYS5jb3JyZWN0ICE9PSBiLmNvcnJlY3QpIHJldHVybiBhLmNvcnJlY3QgPiBiLmNvcnJlY3Q7XHJcbiAgcmV0dXJuIGEudGltZU1zIDwgYi50aW1lTXM7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChyZXEpID0+IHtcclxuICBpZiAocmVxLm1ldGhvZCAhPT0gXCJQT1NUXCIpIHJldHVybiBuZXcgUmVzcG9uc2UoXCJNZXRob2QgTm90IEFsbG93ZWRcIiwgeyBzdGF0dXM6IDQwNSB9KTtcclxuXHJcbiAgY29uc3QgYm9keSA9IGF3YWl0IHJlcS5qc29uKCkuY2F0Y2goKCkgPT4gbnVsbCk7XHJcbiAgaWYgKCFib2R5Py5hdHRlbXB0SWQgfHwgIUFycmF5LmlzQXJyYXkoYm9keT8uYW5zd2VycykpIHtcclxuICAgIHJldHVybiBSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiQmFkIHBheWxvYWRcIiB9LCB7IHN0YXR1czogNDAwIH0pO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZShcInRpbWVzLXRhYmxlLTItOVwiKTtcclxuXHJcbiAgLy8gXHUyNzA1IFx1MDQxRFx1MDQyRlx1MDQxQ1x1MDQxMCBnZXRKU09OIFx1MjAxNCBcdTA0M0ZcdTA0M0VcdTA0M0JcdTA0MzdcdTA0MzJcdTA0MzBcdTA0M0NcdTA0MzUgZ2V0KC4uLiwge3R5cGU6J2pzb24nfSlcclxuICBjb25zdCBhdHRlbXB0ID0gYXdhaXQgc3RvcmUuZ2V0KGBhdHRlbXB0OiR7Ym9keS5hdHRlbXB0SWR9YCwgeyB0eXBlOiBcImpzb25cIiB9KTtcclxuICBpZiAoIWF0dGVtcHQpIHJldHVybiBSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiQXR0ZW1wdCBleHBpcmVkXCIgfSwgeyBzdGF0dXM6IDQwMCB9KTtcclxuXHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBjb25zdCBtYXhNcyA9IChhdHRlbXB0LmR1cmF0aW9uU2VjIHx8IDYwKSAqIDEwMDA7XHJcbiAgY29uc3QgZWxhcHNlZE1zID0gbm93IC0gYXR0ZW1wdC5zdGFydGVkQXQ7XHJcbiAgY29uc3QgdGltZU1zID0gTWF0aC5taW4oZWxhcHNlZE1zLCBtYXhNcyk7XHJcblxyXG4gIGNvbnN0IHF1ZXN0aW9ucyA9IGF0dGVtcHQucXVlc3Rpb25zIHx8IFtdO1xyXG4gIGNvbnN0IGNvdW50ID0gYXR0ZW1wdC5jb3VudCB8fCBxdWVzdGlvbnMubGVuZ3RoIHx8IDIwO1xyXG5cclxuICBjb25zdCBnaXZlbiA9IEFycmF5LmZyb20oeyBsZW5ndGg6IGNvdW50IH0sIChfLCBpKSA9PiBib2R5LmFuc3dlcnNbaV0gPz8gbnVsbCk7XHJcblxyXG4gIGxldCBjb3JyZWN0ID0gMDtcclxuICBjb25zdCByZXZpZXcgPSBxdWVzdGlvbnMuc2xpY2UoMCwgY291bnQpLm1hcCgocSwgaSkgPT4ge1xyXG4gICAgY29uc3QgYW5zd2VyID0gcS5hICogcS5iO1xyXG4gICAgY29uc3QgZyA9IGdpdmVuW2ldO1xyXG4gICAgY29uc3QgaXNDb3JyZWN0ID0gTnVtYmVyKGcpID09PSBhbnN3ZXI7XHJcbiAgICBpZiAoaXNDb3JyZWN0KSBjb3JyZWN0Kys7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhOiBxLmEsXHJcbiAgICAgIGI6IHEuYixcclxuICAgICAgYW5zd2VyLFxyXG4gICAgICBnaXZlbjogKGcgPT09IG51bGwgfHwgZyA9PT0gdW5kZWZpbmVkIHx8IE51bWJlci5pc05hTihnKSkgPyBcIlwiIDogU3RyaW5nKGcpLFxyXG4gICAgICBjb3JyZWN0OiBpc0NvcnJlY3RcclxuICAgIH07XHJcbiAgfSk7XHJcblxyXG4gIGNvbnN0IG5pY2tuYW1lID0gY2xlYW5OaWNrbmFtZShib2R5Lm5pY2tuYW1lKTtcclxuXHJcbiAgY29uc3QgZW50cnkgPSB7IG5pY2tuYW1lLCBjb3JyZWN0LCB0aW1lTXMsIGF0OiBub3cgfTtcclxuICBjb25zdCBsYktleSA9IFwibGVhZGVyYm9hcmQ6djFcIjtcclxuXHJcbiAgLy8gXHUyNzA1IFx1MDQxRFx1MDQyRlx1MDQxQ1x1MDQxMCBnZXRKU09OXHJcbiAgY29uc3QgbGVhZGVyYm9hcmQgPSAoYXdhaXQgc3RvcmUuZ2V0KGxiS2V5LCB7IHR5cGU6IFwianNvblwiIH0pKSB8fCBbXTtcclxuXHJcbiAgY29uc3QgaWR4ID0gbGVhZGVyYm9hcmQuZmluZEluZGV4KHggPT4geC5uaWNrbmFtZSA9PT0gbmlja25hbWUpO1xyXG4gIGlmIChpZHggPj0gMCkge1xyXG4gICAgaWYgKGJldHRlcihlbnRyeSwgbGVhZGVyYm9hcmRbaWR4XSkpIGxlYWRlcmJvYXJkW2lkeF0gPSBlbnRyeTtcclxuICB9IGVsc2Uge1xyXG4gICAgbGVhZGVyYm9hcmQucHVzaChlbnRyeSk7XHJcbiAgfVxyXG5cclxuICBsZWFkZXJib2FyZC5zb3J0KCh4LCB5KSA9PiB7XHJcbiAgICBpZiAoeS5jb3JyZWN0ICE9PSB4LmNvcnJlY3QpIHJldHVybiB5LmNvcnJlY3QgLSB4LmNvcnJlY3Q7XHJcbiAgICByZXR1cm4geC50aW1lTXMgLSB5LnRpbWVNcztcclxuICB9KTtcclxuXHJcbiAgYXdhaXQgc3RvcmUuc2V0SlNPTihsYktleSwgbGVhZGVyYm9hcmQuc2xpY2UoMCwgMjApKTtcclxuICBhd2FpdCBzdG9yZS5kZWxldGUoYGF0dGVtcHQ6JHtib2R5LmF0dGVtcHRJZH1gKTtcclxuXHJcbiAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBjb3JyZWN0LCB0aW1lTXMsIHJldmlldyB9KTtcclxufTtcclxuXHJcblxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBQUEsU0FBUyxnQkFBZ0I7QUFFekIsU0FBUyxjQUFjLEdBQUc7QUFDeEIsUUFBTSxRQUFRLEtBQUssUUFBUSxLQUFLLEVBQUUsTUFBTSxHQUFHLEVBQUUsS0FBSztBQUNsRCxTQUFPLEtBQUssUUFBUSx1QkFBdUIsRUFBRTtBQUMvQztBQUVBLFNBQVMsT0FBTyxHQUFHLEdBQUc7QUFDcEIsTUFBSSxFQUFFLFlBQVksRUFBRSxRQUFTLFFBQU8sRUFBRSxVQUFVLEVBQUU7QUFDbEQsU0FBTyxFQUFFLFNBQVMsRUFBRTtBQUN0QjtBQUVBLElBQU8saUJBQVEsT0FBTyxRQUFRO0FBQzVCLE1BQUksSUFBSSxXQUFXLE9BQVEsUUFBTyxJQUFJLFNBQVMsc0JBQXNCLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFFcEYsUUFBTSxPQUFPLE1BQU0sSUFBSSxLQUFLLEVBQUUsTUFBTSxNQUFNLElBQUk7QUFDOUMsTUFBSSxDQUFDLE1BQU0sYUFBYSxDQUFDLE1BQU0sUUFBUSxNQUFNLE9BQU8sR0FBRztBQUNyRCxXQUFPLFNBQVMsS0FBSyxFQUFFLE9BQU8sY0FBYyxHQUFHLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNoRTtBQUVBLFFBQU0sUUFBUSxTQUFTLGlCQUFpQjtBQUd4QyxRQUFNLFVBQVUsTUFBTSxNQUFNLElBQUksV0FBVyxLQUFLLFNBQVMsSUFBSSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQzdFLE1BQUksQ0FBQyxRQUFTLFFBQU8sU0FBUyxLQUFLLEVBQUUsT0FBTyxrQkFBa0IsR0FBRyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBRWhGLFFBQU0sTUFBTSxLQUFLLElBQUk7QUFDckIsUUFBTSxTQUFTLFFBQVEsZUFBZSxNQUFNO0FBQzVDLFFBQU0sWUFBWSxNQUFNLFFBQVE7QUFDaEMsUUFBTSxTQUFTLEtBQUssSUFBSSxXQUFXLEtBQUs7QUFFeEMsUUFBTSxZQUFZLFFBQVEsYUFBYSxDQUFDO0FBQ3hDLFFBQU0sUUFBUSxRQUFRLFNBQVMsVUFBVSxVQUFVO0FBRW5ELFFBQU0sUUFBUSxNQUFNLEtBQUssRUFBRSxRQUFRLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBTSxLQUFLLFFBQVEsQ0FBQyxLQUFLLElBQUk7QUFFN0UsTUFBSSxVQUFVO0FBQ2QsUUFBTSxTQUFTLFVBQVUsTUFBTSxHQUFHLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxNQUFNO0FBQ3JELFVBQU0sU0FBUyxFQUFFLElBQUksRUFBRTtBQUN2QixVQUFNLElBQUksTUFBTSxDQUFDO0FBQ2pCLFVBQU0sWUFBWSxPQUFPLENBQUMsTUFBTTtBQUNoQyxRQUFJLFVBQVc7QUFDZixXQUFPO0FBQUEsTUFDTCxHQUFHLEVBQUU7QUFBQSxNQUNMLEdBQUcsRUFBRTtBQUFBLE1BQ0w7QUFBQSxNQUNBLE9BQVEsTUFBTSxRQUFRLE1BQU0sVUFBYSxPQUFPLE1BQU0sQ0FBQyxJQUFLLEtBQUssT0FBTyxDQUFDO0FBQUEsTUFDekUsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGLENBQUM7QUFFRCxRQUFNLFdBQVcsY0FBYyxLQUFLLFFBQVE7QUFFNUMsUUFBTSxRQUFRLEVBQUUsVUFBVSxTQUFTLFFBQVEsSUFBSSxJQUFJO0FBQ25ELFFBQU0sUUFBUTtBQUdkLFFBQU0sY0FBZSxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUUsTUFBTSxPQUFPLENBQUMsS0FBTSxDQUFDO0FBRW5FLFFBQU0sTUFBTSxZQUFZLFVBQVUsT0FBSyxFQUFFLGFBQWEsUUFBUTtBQUM5RCxNQUFJLE9BQU8sR0FBRztBQUNaLFFBQUksT0FBTyxPQUFPLFlBQVksR0FBRyxDQUFDLEVBQUcsYUFBWSxHQUFHLElBQUk7QUFBQSxFQUMxRCxPQUFPO0FBQ0wsZ0JBQVksS0FBSyxLQUFLO0FBQUEsRUFDeEI7QUFFQSxjQUFZLEtBQUssQ0FBQyxHQUFHLE1BQU07QUFDekIsUUFBSSxFQUFFLFlBQVksRUFBRSxRQUFTLFFBQU8sRUFBRSxVQUFVLEVBQUU7QUFDbEQsV0FBTyxFQUFFLFNBQVMsRUFBRTtBQUFBLEVBQ3RCLENBQUM7QUFFRCxRQUFNLE1BQU0sUUFBUSxPQUFPLFlBQVksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNuRCxRQUFNLE1BQU0sT0FBTyxXQUFXLEtBQUssU0FBUyxFQUFFO0FBRTlDLFNBQU8sU0FBUyxLQUFLLEVBQUUsU0FBUyxRQUFRLE9BQU8sQ0FBQztBQUNsRDsiLAogICJuYW1lcyI6IFtdCn0K
