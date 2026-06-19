// Simple Vercel function test - force Node.js runtime
export const config = {
  runtime: 'nodejs18.x',
};

export default function handler(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true, msg: "Node.js function works!" }));
}
