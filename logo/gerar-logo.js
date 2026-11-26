// Gera os arquivos do logo (modelo A: pin com moeda dividida). Rodar: node gerar-logo.js
// Depois renderiza os PNGs com o Edge em modo headless (ver gerar-logo.sh ou os comandos no final).
const fs = require("fs"), path = require("path");
const D = __dirname;
const PIN = "M32 3C20.9 3 12 11.6 12 22.4 12 37.6 32 61 32 61s20-23.4 20-38.6C52 11.6 43.1 3 32 3z";
const grad = (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#26a17b"/><stop offset="1" stop-color="#2775ca"/></linearGradient>`;
// miolo: anel escuro + moeda dividida (verde USDT, azul USDC)
const miolo = (anel, verde) => `<circle cx="32" cy="24" r="13" fill="${anel}"/><path d="M32 13a11 11 0 0 0 0 22z" fill="${verde}"/><path d="M32 13a11 11 0 0 1 0 22z" fill="#2775ca"/>`;
const svg = (id, anel, verde, extra = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="ondepagarcomcripto"><defs>${grad(id)}</defs>${extra}<path d="${PIN}" fill="url(#${id})"/>${miolo(anel, verde)}</svg>\n`;

fs.writeFileSync(path.join(D, "logo-icone.svg"), svg("g", "#0a0a0c", "#26a17b"));            // para fundo escuro e favicon
fs.writeFileSync(path.join(D, "logo-icone-claro.svg"), svg("g", "#f4f4f6", "#1d8a68"));      // para fundo claro
fs.writeFileSync(path.join(D, "favicon.svg"), svg("g", "#0a0a0c", "#26a17b"));

const fonts = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Instrument+Serif&display=swap">`;
const icone = (px, anel, verde, id) => `<svg width="${px}" height="${px}" viewBox="0 0 64 64"><defs>${grad(id)}</defs><path d="${PIN}" fill="url(#${id})"/>${miolo(anel, verde)}</svg>`;
const base = `*{box-sizing:border-box;margin:0}html,body{width:100%;height:100%;overflow:hidden}body{font-family:'Geist',sans-serif}`;
const page = (w, h, bg, body, css = "") => `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>${base}html,body{width:${w}px;height:${h}px;background:${bg}}${css}</style></head><body>${body}</body></html>`;

// ícones de app: pin sobre fundo escuro, com folga nas bordas
const app = (px) => page(px, px, "#0a0a0c", `<div style="width:${px}px;height:${px}px;display:grid;place-items:center">${icone(Math.round(px * 0.68), "#0a0a0c", "#26a17b", "a")}</div>`);
fs.writeFileSync(path.join(D, "_apple-touch-icon.html"), app(180));
fs.writeFileSync(path.join(D, "_icon-192.html"), app(192));
fs.writeFileSync(path.join(D, "_icon-512.html"), app(512));
// favicon pequeno, sem fundo
fs.writeFileSync(path.join(D, "_favicon-32.html"), page(32, 32, "transparent", icone(32, "#0a0a0c", "#26a17b", "f")));

// nome ao lado do ícone (fundo transparente), versão para fundo escuro e para fundo claro
const horizontal = (texto, verde, anel, verdeMoeda, id) => page(1400, 360, "transparent",
  `<div style="display:flex;align-items:center;gap:36px;height:360px;padding:0 40px">${icone(260, anel, verdeMoeda, id)}<div style="font:400 150px/1 'Instrument Serif',serif;letter-spacing:-2px;color:${texto};white-space:nowrap">ondepagar<span style="color:${verde}">comcripto</span></div></div>`);
fs.writeFileSync(path.join(D, "_horizontal-escuro.html"), horizontal("#f2f2f4", "#26a17b", "#0a0a0c", "#26a17b", "h1"));
fs.writeFileSync(path.join(D, "_horizontal-claro.html"), horizontal("#111114", "#1d8a68", "#f4f4f6", "#1d8a68", "h2"));

// imagem para compartilhar o link (WhatsApp, redes): 1200x630
fs.writeFileSync(path.join(D, "_og-image.html"), page(1200, 630, "#0a0a0c",
  `<div style="position:absolute;inset:0;background:radial-gradient(700px 420px at 30% 40%,rgba(38,161,123,.22),transparent 70%),radial-gradient(600px 400px at 90% 90%,rgba(39,117,202,.2),transparent 70%)"></div>
   <div style="position:absolute;left:80px;top:90px;right:80px;color:#f2f2f4">
     <div style="display:flex;align-items:center;gap:26px">${icone(120, "#0a0a0c", "#26a17b", "o")}<div style="font:400 64px/1 'Instrument Serif',serif;color:#f2f2f4">ondepagar<span style="color:#26a17b">comcripto</span></div></div>
     <div style="font:400 92px/1.04 'Instrument Serif',serif;margin-top:64px;letter-spacing:-1px">Onde pagar com <span style="color:#26a17b">USDT</span> e <span style="color:#5a9bea">USDC</span></div>
     <div style="font:500 30px 'Geist',sans-serif;color:#a9a9b3;margin-top:34px">Mapa grátis de lugares que aceitam cripto · Brasil e Paraguai</div>
   </div>`));
console.log("ok");
