
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/leaderboard.js
import { getStore } from "@netlify/blobs";
var leaderboard_default = async () => {
  const store = getStore("times-table-2-9");
  const items = await store.get("leaderboard:v1", { type: "json" }) || [];
  return Response.json({ items });
};
export {
  leaderboard_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvbGVhZGVyYm9hcmQuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGdldFN0b3JlIH0gZnJvbSBcIkBuZXRsaWZ5L2Jsb2JzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3luYyAoKSA9PiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZShcInRpbWVzLXRhYmxlLTItOVwiKTtcclxuICBjb25zdCBpdGVtcyA9IChhd2FpdCBzdG9yZS5nZXQoXCJsZWFkZXJib2FyZDp2MVwiLCB7IHR5cGU6IFwianNvblwiIH0pKSB8fCBbXTtcclxuICByZXR1cm4gUmVzcG9uc2UuanNvbih7IGl0ZW1zIH0pO1xyXG59O1xyXG5cclxuXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFBQSxTQUFTLGdCQUFnQjtBQUV6QixJQUFPLHNCQUFRLFlBQVk7QUFDekIsUUFBTSxRQUFRLFNBQVMsaUJBQWlCO0FBQ3hDLFFBQU0sUUFBUyxNQUFNLE1BQU0sSUFBSSxrQkFBa0IsRUFBRSxNQUFNLE9BQU8sQ0FBQyxLQUFNLENBQUM7QUFDeEUsU0FBTyxTQUFTLEtBQUssRUFBRSxNQUFNLENBQUM7QUFDaEM7IiwKICAibmFtZXMiOiBbXQp9Cg==
