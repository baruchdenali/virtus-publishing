// Simple Vercel function test
export default function handler(request) {
  return new Response(JSON.stringify({ 
    ok: true, 
    msg: "Function works!",
    url: request.url 
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
