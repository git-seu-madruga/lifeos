// No app data, API response, OAuth response or HTML is stored in Cache Storage.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith(fetch(event.request).catch(() => new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0c0d10"><title>LifeOS — Sem conexão</title><style>body{background:#0c0d10;color:#e8eaef;font:16px system-ui;margin:0;min-height:100vh;display:grid;place-items:center}main{max-width:380px;padding:28px}p{color:#a3a9b6;line-height:1.6}button{background:#6ea8fe;color:#0c0d10;border:0;border-radius:10px;padding:12px 20px;font:inherit;cursor:pointer}</style><main><h1>LifeOS</h1><p>Você está sem conexão. Conecte-se à internet para acessar sua conta e sincronizar com o Notion.</p><button onclick="location.reload()">Tentar novamente</button></main></html>`, {status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})));
});
