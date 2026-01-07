import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("times-table-2-9");
  const items = (await store.get("leaderboard:v1", { type: "json" })) || [];
  return Response.json({ items });
};


