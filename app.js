(function () {
  const $ = (s) => document.querySelector(s);
  const ic = (n) => `<svg class="ic"><use href="#i-${n}"/></svg>`; // ícones SVG do sprite no index.html
  const COINS = ["USDT", "USDC", "BTC", "ETH", "SOL"];
  const CATS = ["restaurante", "hotel", "mercado", "eletrônicos", "compras", "saúde", "serviços", "produtos online", "serviços digitais", "câmbio / P2P", "caixa eletrônico"];
  const isAtm = (p) => p.cat === "caixa eletrônico";
  // tipo do cadastro: comércio físico (padrão) ou loja/produto online
  const TYPE_LABEL = { online: "Online" };
  const ptype = (p) => p.type || "fisico";
  const hasPos = (p) => p.lat != null && p.lng != null; // lugares online não têm posição no mapa
  const CITY = Object.fromEntries(CITIES.map((c) => [c.name, c]));
  // sem nenhuma moeda marcada o mapa mostra todos os lugares; marcar uma moeda filtra
  const state = { coins: new Set(), cat: "", q: "", city: "", country: "", type: "" }; // country "" = Brasil e Paraguai juntos
  let places = PLACES.slice();
  const SB = window.SUPABASE || {};
  const sbOn = () => !!(SB.url && SB.key);
  const sbFetch = (path, opts = {}) => fetch(`${SB.url}/rest/v1/${path}`, { ...opts, headers: { apikey: SB.key, Authorization: `Bearer ${SB.key}`, "Content-Type": "application/json", ...(opts.headers || {}) } });

  // ---- map
  // por enquanto o mapa cobre só Brasil e Paraguai
  const map = L.map("map", { zoomControl: false, minZoom: 4, maxBounds: [[-36, -76], [7, -32]], maxBoundsViscosity: 0.8 }).setView([-23.4, -57.4], 7);
  L.control.zoom({ position: "bottomright" }).addTo(map);
  // OSM padrão; o tema escuro é feito por filtro CSS (ver .leaflet-tile-pane no style.css)
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap", maxZoom: 19,
  }).addTo(map);
  const setTiles = () => {};
  // contorno do país (GeoJSON público); se falhar, o mapa segue sem o destaque
  fetch("https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries/PRY.geo.json")
    .then((r) => r.json())
    .then((g) => L.geoJSON(g, { interactive: false, style: { color: "#26a17b", weight: 1.5, fillColor: "#26a17b", fillOpacity: 0.07 } }).addTo(map).bringToBack())
    .catch(() => {});
  // agrupa pontos próximos (há milhares de lugares só com Bitcoin)
  const layer = L.markerClusterGroup({
    maxClusterRadius: 45, showCoverageOnHover: false, chunkedLoading: true,
    iconCreateFunction: (c) => L.divIcon({ className: "", html: `<div class="clu">${c.getChildCount()}</div>`, iconSize: [34, 34] }),
  }).addTo(map);

  // ---- helpers
  const kind = (p) => {
    const u = p.coins.includes("USDT"), c = p.coins.includes("USDC");
    return u && c ? "both" : u ? "usdt" : c ? "usdc" : p.coins.includes("BTC") ? "btc" : "other";
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const tags = (p) => p.coins.map((c) => `<span class="tag ${c}">${c}</span>`).join("");
  // vídeos: p.videos = [{ url, title, channel }]. Miniatura; ao clicar, toca na própria ficha.
  const ytId = (u) => { const m = String(u).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : ""; };
  const vids = (p) => (p.videos || []).map((v) => ({ ...v, id: ytId(v.url) })).filter((v) => v.id);
  const vidsHtml = (p) => {
    const list = vids(p); if (!list.length) return "";
    return `<div class="vids"><b>Vídeos pagando com cripto</b>${list.map((v) => `<button class="vid" data-id="${v.id}">
      <img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="" loading="lazy"><span class="play">${ic("play")}</span>
      <span class="vt">${esc(v.title || "Ver vídeo")}${v.channel ? `<small>${esc(v.channel)}</small>` : ""}</span></button>`).join("")}</div>`;
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".vid"); if (!b) return;
    b.outerHTML = `<iframe class="vidframe" src="https://www.youtube-nocookie.com/embed/${b.dataset.id}?autoplay=1" title="Vídeo" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  });
  // vídeo geral (não é de uma loja): abre num pop-up
  const vm = $("#vmodal");
  $("#btnHow").onclick = (e) => {
    $("#vbox").innerHTML = `<iframe class="vidframe" src="https://www.youtube-nocookie.com/embed/${e.currentTarget.dataset.id}?autoplay=1" title="Vídeo" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    vm.showModal();
  };
  const closeV = () => { $("#vbox").innerHTML = ""; vm.close(); };
  $("#vclose").onclick = closeV;
  vm.addEventListener("close", () => ($("#vbox").innerHTML = ""));
  vm.addEventListener("click", (e) => { if (e.target === vm) closeV(); });
  const popup = (p) => `<div class="pop"><h4>${esc(p.name)}</h4>
    <div class="muted">${esc(p.cat)} · ${esc(p.city)}</div>
    <div class="coins">${tags(p)}${TYPE_LABEL[ptype(p)] ? `<span class="tag typetag">${TYPE_LABEL[ptype(p)]}</span>` : ""}</div>
    ${p.nets && p.nets.length ? `<div class="muted">Redes: ${esc(p.nets.join(", "))}</div>` : ""}
    <div style="margin-top:6px">${p.verified ? '<span class="ok">' + ic("check") + ' Verificado</span>' : '<span class="muted">Não verificado</span>'}</div>
    ${vids(p).length ? `<div style="margin-top:6px"><span class="tag vtag">${ic("play")} ${vids(p).length} vídeo${vids(p).length > 1 ? "s" : ""} na ficha</span></div>` : ""}
    ${p.addr ? `<div class="muted" style="margin-top:6px">${esc(p.addr)}</div>` : ""}
    ${p.web ? `<div style="margin-top:6px"><a href="${esc(p.web)}" target="_blank" rel="noopener noreferrer">Site</a></div>` : ""}
    ${p.note ? `<div style="margin-top:6px;font-size:12px">${esc(p.note)}</div>` : ""}
    ${p.src ? `<div class="muted" style="margin-top:6px;font-size:11px">${p.approx ? "Localização aproximada · " : ""}Fonte: ${esc(p.src)}</div>` : ""}
    ${p.wa ? `<div style="margin-top:6px"><a href="https://wa.me/${p.wa.replace(/\D/g, "")}" target="_blank" rel="noopener">WhatsApp</a></div>` : ""}</div>`;

  const pc = (p) => p.country || "py"; // lugares sem país são do Paraguai
  function filtered() {
    const q = state.q.trim().toLowerCase();
    return places.filter((p) =>
      (!state.country || pc(p) === state.country) &&
      (!state.type || ptype(p) === state.type) &&
      (!state.coins.size || isAtm(p) || p.coins.some((c) => state.coins.has(c))) && // caixas eletrônicos aparecem sempre
      (!state.cat || p.cat === state.cat) &&
      (!state.city || p.city === state.city) &&
      (!q || (p.name + " " + p.city + " " + p.cat).toLowerCase().includes(q)));
  }

  // ---- render
  const markers = new Map();
  function render() {
    const list = filtered();
    layer.clearLayers(); markers.clear();
    list.forEach((p) => {
      if (!hasPos(p)) return; // online: só na lista
      const m = L.marker([p.lat, p.lng], {
        icon: L.divIcon({ className: "", html: `<div class="pt ${kind(p)}${isAtm(p) ? " atm" : ""}"></div>`, iconSize: [16, 16] }),
      }).bindPopup(popup(p));
      m.addTo(layer); markers.set(p.id, m);
    });
    const MAX = 150; // lista curta: com milhares de lugares, use a busca ou aproxime o mapa
    $("#listCount").textContent = list.length > MAX ? `${MAX} de ${list.length}` : list.length;
    $("#list").innerHTML = list.slice(0, MAX).map((p) =>`<div class="item" data-id="${p.id}">
      <b>${esc(p.name)}</b><span class="meta">${esc(p.cat)} · ${esc(p.city)}${p.verified ? ' · <span class="ok">' + ic("check") + '</span>' : ""}</span>
      <div class="coins">${tags(p)}${TYPE_LABEL[ptype(p)] ? `<span class="tag typetag">${TYPE_LABEL[ptype(p)]}</span>` : ""}${vids(p).length ? `<span class="tag vtag">${ic("play")} ${vids(p).length} vídeo${vids(p).length > 1 ? "s" : ""}</span>` : ""}</div></div>`).join("") || (state.type === "online"
      ? `<p class="muted">Ainda não há lojas online cadastradas aqui. Seja o primeiro: toque em Cadastrar.</p>`
      : '<p class="muted">Nenhum lugar encontrado com esses filtros.</p>');
    stats(); crumbs();
  }

  // trilha: Paraguai › Cidade › Lugar
  let current = null;
  function crumbs() {
    const parts = [`<button data-a="country">${{ br: "Brasil", py: "Paraguai" }[state.country] || "Brasil e Paraguai"}</button>`];
    if (state.city) parts.push(current ? `<button data-a="city">${esc(state.city)}</button>` : `<b>${esc(state.city)}</b>`);
    if (current) parts.push(`<b>${esc(current.name)}</b>`);
    $("#crumbs").innerHTML = parts.join(" › ");
  }
  $("#crumbs").onclick = (e) => {
    const a = e.target.dataset.a; if (!a) return;
    if (a === "country") { closeDetail(); setCountry(state.country, true); }
    if (a === "city") { closeDetail(); pickCity(state.city); }
  };
  function showDetail(p) {
    current = p;
    const el = $("#detail");
    el.hidden = false; $("#list").hidden = true; document.querySelector(".listhead").hidden = true;
    el.innerHTML = `<button class="back" id="back">‹ ${esc(p.city)}</button>
      <h2>${esc(p.name)}</h2>
      <div class="muted">${esc(p.cat)} · ${esc(p.city)}</div>
      <div class="coins">${tags(p)}${TYPE_LABEL[ptype(p)] ? `<span class="tag typetag">${TYPE_LABEL[ptype(p)]}</span>` : ""}</div>
      <dl><dt>Redes</dt><dd>${esc((p.nets || []).join(", ") || "—")}</dd>
      <dt>Status</dt><dd>${p.verified ? '<span class="ok">' + ic("check") + ' Verificado</span>' : "Não verificado"}</dd>
      ${p.addr ? `<dt>Onde fica</dt><dd>${esc(p.addr)}${p.approx ? ' <span class="muted">(posição aproximada)</span>' : ""}</dd>` : ""}
      ${p.web ? `<dt>Site</dt><dd><a href="${esc(p.web)}" target="_blank" rel="noopener noreferrer">${esc(p.web.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</a></dd>` : ""}
      ${p.note ? `<dt>Moedas</dt><dd>${esc(p.note)}</dd>` : ""}
      ${p.src ? `<dt>Fonte</dt><dd>${esc(p.src)}</dd>` : ""}
      <dt>Contato</dt><dd>${p.wa ? `<a href="https://wa.me/${p.wa.replace(/\D/g, "")}" target="_blank" rel="noopener">WhatsApp</a>` : "—"}</dd></dl>
      ${vidsHtml(p)}
      <div class="row"><button class="pill" id="okBtn">✔ Ainda aceita</button><button class="pill" id="noBtn">✖ Não aceita mais</button></div>`;
    $("#back").onclick = () => { closeDetail(); crumbs(); };
    $("#okBtn").onclick = $("#noBtn").onclick = () => toast("Obrigado! Sua confirmação ajuda a manter o mapa atualizado");
    crumbs();
  }
  function closeDetail() {
    current = null; $("#detail").hidden = true; $("#list").hidden = false; document.querySelector(".listhead").hidden = false;
  }

  function stats() {
    const all = places.filter((p) => (!state.country || pc(p) === state.country) && !isAtm(p)); // placar só de lugares que aceitam pagamento
    const nU = all.filter((p) => p.coins.includes("USDT")).length;
    const nC = all.filter((p) => p.coins.includes("USDC")).length;
    const t = nU + nC || 1;
    $("#nUsdt").textContent = nU; $("#nUsdc").textContent = nC;
    const pu = Math.round((nU / t) * 1000) / 10;
    $("#pUsdt").textContent = pu.toFixed(1).replace(".", ",");
    $("#pUsdc").textContent = (100 - pu).toFixed(1).replace(".", ",");
    $("#barUsdt").style.width = pu + "%"; $("#barUsdc").style.width = 100 - pu + "%";
    $("#barNote").textContent = "proporção de aceitação";
    $("#nTotal").textContent = all.length;
    $("#nCities").textContent = new Set(all.map((p) => p.city)).size;
    $("#nVerified").textContent = all.filter((p) => p.verified).length;
    bars("#byCity", count(all, "city"), (k) => pickCity(k));
    bars("#byCat", count(all, "cat"), (k) => { state.cat = k; $("#cat").value = k; render(); });
  }
  const count = (arr, key) => Object.entries(arr.reduce((a, p) => ((a[p[key]] = (a[p[key]] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1]);
  function bars(sel, rows, onClick) {
    const max = rows[0] ? rows[0][1] : 1;
    const el = $(sel);
    el.innerHTML = rows.map(([k, n]) => `<div class="brow" data-k="${esc(k)}"><span>${esc(k)}</span><i style="width:${(n / max) * 100}%"></i><span>${n}</span></div>`).join("");
    el.onclick = (e) => { const r = e.target.closest(".brow"); if (r) onClick(r.dataset.k); };
  }

  // ---- city search
  function pickCity(name) {
    const c = CITY[name];
    if (!c) { // cidade só presente nos dados (ex.: importados): voa para o primeiro lugar dela
      const p = places.find((x) => x.city === name && (!state.country || pc(x) === state.country) && hasPos(x));
      state.city = name; state.q = ""; render(); if (p) map.flyTo([p.lat, p.lng], 13, { duration: 0.8 }); return;
    }
    setCountry(c.c || "py", false);
    state.city = ""; state.q = ""; $("#q").value = name; $("#sugg").hidden = true;
    map.flyTo([c.lat, c.lng], c.z, { duration: 0.8 });
    state.city = name; render(); location.hash = "c=" + encodeURIComponent(name);
  }
  $("#q").addEventListener("input", (e) => {
    const v = e.target.value.trim().toLowerCase();
    state.city = ""; state.q = v; render();
    const m = v ? CITIES.filter((c) => c.name.toLowerCase().includes(v)).slice(0, 5) : []; // busca em Brasil e Paraguai
    $("#sugg").hidden = !m.length;
    $("#sugg").innerHTML = m.map((c) => `<button data-n="${esc(c.name)}">${ic("pin")} ${esc(c.name)}</button>`).join("");
  });
  $("#sugg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) pickCity(b.dataset.n); });
  $("#q").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { const f = $("#sugg button"); if (f) pickCity(f.dataset.n); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT") { e.preventDefault(); $("#q").focus(); }
  });
  $("#btnSearch").onclick = () => $("#q").focus();

  // ---- filters
  $("#chips").innerHTML = COINS.map((c) => `<button class="chip ${state.coins.has(c) ? "on" : ""}" data-c="${c}">${c}</button>`).join("");
  $("#chips").onclick = (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    const c = b.dataset.c; state.coins.has(c) ? state.coins.delete(c) : state.coins.add(c);
    b.classList.toggle("on"); render();
  };
  const catOpts = CATS.map((c) => `<option value="${c}">${c[0].toUpperCase() + c.slice(1)}</option>`).join("");
  $("#cat").insertAdjacentHTML("beforeend", catOpts);
  $("#cat").onchange = (e) => { state.cat = e.target.value; render(); };
  $("#types").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    state.type = b.dataset.t;
    document.querySelectorAll("#types button").forEach((x) => x.classList.toggle("on", x === b));
    closeDetail(); render();
  };
  $("#list").onclick = (e) => {
    const it = e.target.closest(".item"); if (!it) return;
    const p = places.find((x) => x.id == it.dataset.id), m = markers.get(p.id);
    if (hasPos(p)) { map.flyTo([p.lat, p.lng], 16, { duration: 0.7 }); if (m) layer.zoomToShowLayer(m, () => m.openPopup()); }
    state.city = p.city; showDetail(p);
  };

  // ---- country toggle
  function setCountry(c, fly) {
    state.country = c; state.city = ""; state.q = ""; $("#q").value = ""; $("#sugg").hidden = true;
    document.querySelectorAll("#country button").forEach((x) => x.classList.toggle("on", x.dataset.c === c));
    closeDetail(); render();
    if (fly) map.flyTo(c === "br" ? [-14.2, -51.9] : c === "py" ? [-23.4, -57.4] : [-17, -54], c === "br" ? 4 : c === "py" ? 7 : 4, { duration: 1 });
  }
  $("#country").onclick = (e) => {
    const b = e.target.closest("button"); if (b) setCountry(b.dataset.c, true);
  };

  // ---- theme / lang / share
  const themeBtn = $("#btnTheme");
  const syncTheme = () => (themeBtn.innerHTML = ic(document.documentElement.dataset.theme === "light" ? "sun" : "moon"));
  syncTheme();
  themeBtn.onclick = () => {
    const t = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch (e) {}
    syncTheme(); setTiles();
  };
  $("#btnLang").onclick = () => toast("Espanhol e inglês chegam na próxima versão");
  $("#btnShare").onclick = async () => {
    try { await navigator.clipboard.writeText(location.href); toast("Link copiado"); } catch (e) { toast(location.href); }
  };

  // ---- add company
  const modal = $("#modal");
  $("#fCity").innerHTML = CITIES.map((c) => `<option>${c.name}</option>`).join("");
  $("#fCat").innerHTML = catOpts;
  const open = () => modal.showModal();
  $("#btnAdd").onclick = open; $("#btnAdd2").onclick = open;
  $("#cancel").onclick = () => modal.close();
  // loja online não tem cidade nem endereço: pede o país e o link
  const syncType = () => {
    const online = $("#fType").value === "online";
    $("#fCityWrap").hidden = online; $("#fAddrWrap").hidden = online; $("#fCountryWrap").hidden = !online;
    $("#fWeb").required = online;
  };
  $("#fType").onchange = syncType; syncType();
  // cadastro vai para a fila de revisão no Supabase; só aparece no mapa depois de aprovado
  $("#form").addEventListener("submit", async (e) => {
    e.preventDefault(); // mantém o formulário aberto se o envio falhar
    const form = e.target, f = new FormData(form), type = f.get("type") || "fisico", online = type === "online";
    const city = CITY[f.get("city")];
    if (f.get("site_url")) return; // campo-isca contra robôs
    if (!sbOn()) { toast("Cadastro ainda não está ativo. Fale com a gente no grupo do WhatsApp."); return; }
    const row = {
      type, name: String(f.get("name") || "").trim().slice(0, 120), cat: f.get("cat"),
      city: online ? "Online" : f.get("city"), country: online ? f.get("country") : city.c || "py",
      addr: online ? null : String(f.get("addr") || "").trim().slice(0, 200) || null,
      coins: f.getAll("coin"), wa: String(f.get("wa") || "").trim().slice(0, 30) || null,
      web: String(f.get("web") || "").trim().slice(0, 200) || null,
      // física: posição do centro da cidade, corrigida na revisão; online: sem posição
      lat: online ? null : city.lat, lng: online ? null : city.lng,
      note: online ? "Cadastro online enviado pela comunidade." : "Cadastro enviado pela comunidade. Posição a confirmar.",
    };
    try {
      const r = await sbFetch("places", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(row) });
      if (!r.ok) throw new Error(r.status);
      form.reset(); modal.close(); toast("Recebido! Entra no mapa depois da revisão.");
    } catch (err) { toast("Não foi possível enviar agora. Tente de novo em instantes."); }
  });

  // lugares aprovados no Supabase entram no mapa
  async function loadRemote() {
    if (!sbOn()) return;
    try {
      const r = await sbFetch("places?status=eq.approved&select=*&limit=1000");
      if (!r.ok) return;
      (await r.json()).forEach((x) => places.push({
        id: "r" + x.id, type: x.type || "fisico", country: x.country, name: x.name, cat: x.cat, city: x.city, addr: x.addr || "", coins: x.coins || [],
        nets: x.nets || [], wa: x.wa || "", web: x.web || undefined, lat: x.lat, lng: x.lng, verified: !!x.verified,
        note: x.note || undefined, src: "Cadastro da comunidade", approx: !x.verified,
      }));
      render();
    } catch (err) { /* sem conexão com o banco: o site segue com os dados locais */ }
  }

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2800);
  }

  // ---- init (URL: #c=Cidade)
  render();
  const m = location.hash.match(/c=([^&]+)/);
  if (m && CITY[decodeURIComponent(m[1])]) pickCity(decodeURIComponent(m[1]));
  else map.fitBounds(L.latLngBounds(places.filter(hasPos).map((p) => [p.lat, p.lng])).pad(0.05));
  loadRemote();
})();
