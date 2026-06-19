// Simple Vercel function test - Node.js style
export default function handler(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true, msg: "Function works!" }));
}
