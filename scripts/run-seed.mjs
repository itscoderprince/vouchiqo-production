import { GET } from "../app/api/seed/route.js";

async function run() {
  console.log("⏳ Invoking seed GET handler...");
  const res = await GET();
  const json = await res.json();
  console.log("Result:", json);
  process.exit(0);
}

run();
