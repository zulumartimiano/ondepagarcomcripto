// Só dados reais. Cidades para a busca e lugares com fonte (compra do dono do projeto, Compras Paraguai, BTC Map).
window.CITIES = [
  { name: "Asunción", lat: -25.2637, lng: -57.5759, z: 12 },
  { name: "Ciudad del Este", lat: -25.5097, lng: -54.6111, z: 13 },
  { name: "Encarnación", lat: -27.3306, lng: -55.8667, z: 13 },
  { name: "San Lorenzo", lat: -25.34, lng: -57.51, z: 13 },
  { name: "Luque", lat: -25.27, lng: -57.49, z: 13 },
  { name: "Lambaré", lat: -25.346, lng: -57.607, z: 13 },
  { name: "Fernando de la Mora", lat: -25.3167, lng: -57.5667, z: 13 },
  { name: "Pedro Juan Caballero", lat: -22.5469, lng: -55.7289, z: 13 },
  { name: "Villarrica", lat: -25.78, lng: -56.4333, z: 13 },
  { name: "Concepción", lat: -23.4064, lng: -57.4344, z: 13 },
  { name: "Hernandarias", lat: -25.41, lng: -54.64, z: 13 },
  { name: "Presidente Franco", lat: -25.55, lng: -54.61, z: 13 },
  { name: "Salto del Guairá", lat: -24.06, lng: -54.31, z: 13 },
  { name: "Coronel Oviedo", lat: -25.45, lng: -56.44, z: 13 },
  { name: "Caacupé", lat: -25.386, lng: -57.14, z: 13 },
  // Brasil (c: "br"). Cidades sem c são do Paraguai.
  { c: "br", name: "Foz do Iguaçu", lat: -25.5163, lng: -54.5854, z: 12 },
  { c: "br", name: "Ponta Porã", lat: -22.5296, lng: -55.7253, z: 13 },
  { c: "br", name: "São Paulo", lat: -23.5505, lng: -46.6333, z: 11 },
  { c: "br", name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, z: 11 },
  { c: "br", name: "Curitiba", lat: -25.4284, lng: -49.2733, z: 12 },
  { c: "br", name: "Florianópolis", lat: -27.5954, lng: -48.548, z: 12 },
  { c: "br", name: "Porto Alegre", lat: -30.0346, lng: -51.2177, z: 12 },
  { c: "br", name: "Brasília", lat: -15.7939, lng: -47.8828, z: 11 },
  { c: "br", name: "Belo Horizonte", lat: -19.9167, lng: -43.9345, z: 12 },
  { c: "br", name: "Campo Grande", lat: -20.4697, lng: -54.6201, z: 12 },
  { c: "br", name: "Salvador", lat: -12.9777, lng: -38.5016, z: 12 },
  { c: "br", name: "Fortaleza", lat: -3.7319, lng: -38.5267, z: 12 },
  { c: "br", name: "Recife", lat: -8.0476, lng: -34.877, z: 12 },
  { c: "br", name: "Manaus", lat: -3.119, lng: -60.0217, z: 12 },
];

// coins: lista de moedas aceitas; verified: confirmado pela equipe
window.PLACES = [

  // LOJAS REAIS. Fontes: páginas das lojas no Compras Paraguai (coordenadas e contatos) e vídeo do Gustavo Nigre.
  // approx:true = posição estimada; note = o que foi (ou não) confirmado.
  { id: 101, name: "Shopping China", cat: "compras", city: "Ciudad del Este", lat: -25.515006, lng: -54.606187, coins: ["USDT"], nets: ["Tron"], verified: true, wa: "+595981701701", web: "https://www.shoppingchina.com.br/", addr: "Av. Dr. Luis Maria Argaña, Ciudad del Este", src: "Compra feita pelo dono do projeto + Compras Paraguai", note: "Aceita USDT na rede Tron: confirmado em compra filmada pelo dono do projeto (vídeo na ficha). USDC não confirmado.", videos: [{ url: "https://youtu.be/_nnlXa4cjgw", title: "Pagando com USDT (rede Tron) no Shopping China" }] },
  { id: 106, name: "Shopping China (Pedro Juan Caballero)", cat: "compras", city: "Pedro Juan Caballero", lat: -22.559797, lng: -55.709979, coins: ["USDT"], nets: [], verified: false, wa: "+595981701701", web: "https://www.shoppingchina.com.br/", addr: "Rua V e Callejon Internacional", src: "Compras Paraguai", note: "Aceita USDT, segundo a página da loja no Compras Paraguai. Confirmar se vale para esta unidade." },
  { id: 107, name: "Shopping China (Salto del Guairá)", cat: "compras", city: "Salto del Guairá", lat: -24.056633, lng: -54.307431, coins: ["USDT"], nets: [], verified: false, wa: "+595981701701", web: "https://www.shoppingchina.com.br/", addr: "Av. Paraguay", src: "Compras Paraguai", note: "Aceita USDT, segundo a página da loja no Compras Paraguai. Confirmar se vale para esta unidade." },
  { id: 102, name: "New Zone", cat: "eletrônicos", city: "Ciudad del Este", lat: -25.51, lng: -54.6056, coins: ["USDT", "USDC"], nets: [], verified: true, wa: "+595994376439", web: "https://www.newzone.com.py/", addr: "Shopping del Este (último andar), Av. Monseñor Rodríguez, perto da ponte", src: "Compra feita pelo dono do projeto + vídeo do Gustavo Nigre", approx: true, note: "Compra confirmada pelo dono do projeto. Moeda e rede usadas a confirmar." },
  { id: 103, name: "Cellshop", cat: "eletrônicos", city: "Ciudad del Este", lat: -25.510349, lng: -54.610702, coins: ["USDT"], nets: ["Tron"], verified: true, wa: "+595994193150", web: "https://cellshop.com/", addr: "Shopping Ibiza, térreo, Rua Carlos Antonio López nº 8", src: "Compra feita pelo dono do projeto + Compras Paraguai", note: "Aceita USDT na rede Tron: confirmado em compra filmada pelo dono do projeto (vídeo na ficha). USDC não confirmado.", videos: [{ url: "https://youtu.be/my6zhvLT0R4", title: "Pagando com USDT (rede Tron) na Cellshop" }] },
  { id: 104, name: "Atacado Connect", cat: "eletrônicos", city: "Ciudad del Este", lat: -25.51077, lng: -54.610112, coins: ["USDT"], nets: [], verified: true, wa: "+595983147295", web: "https://www.atacadoconnect.com/", addr: "Galeria Jebai Center, 3º andar, Av. Carlos Antonio López", src: "Compra feita pelo dono do projeto + Compras Paraguai", note: "Aceita USDT: compra confirmada pelo dono do projeto e página da loja. Rede e USDC a confirmar." },
  { id: 105, name: "Matrix Importados", cat: "eletrônicos", city: "Ciudad del Este", lat: -25.512715, lng: -54.606549, coins: ["USDT", "USDC"], nets: [], verified: true, wa: "+554599037946", web: "https://matriximportados.com.br/", addr: "Shopping Paris, térreo, Av. Luis Maria Argaña", src: "Compra feita pelo dono do projeto + Compras Paraguai", note: "Compra confirmada pelo dono do projeto. Moeda e rede usadas a confirmar." },
  { id: 108, name: "Shopping Paris", cat: "compras", city: "Ciudad del Este", lat: -25.512715, lng: -54.606549, coins: ["USDT"], nets: ["Tron"], verified: true, wa: "", addr: "Av. Luis Maria Argaña, Ciudad del Este", src: "Compra feita pelo dono do projeto", approx: true, note: "Aceita USDT na rede Tron: confirmado em compra filmada pelo dono do projeto (vídeo na ficha). USDC não confirmado.", videos: [{ url: "https://youtu.be/z7NDQGLmC2Y", title: "Pagando com USDT (rede Tron) no Shopping Paris" }] },
  // Empresa dos criadores do site (online, Brasil). Dados tirados do próprio site da empresa.
  { id: 109, type: "online", country: "br", name: "Cripto na Hora (Zulu P2P)", cat: "câmbio / P2P", city: "Online", coins: ["USDT", "USDC"], nets: ["Tron", "Polygon", "Ethereum", "Solana"], verified: true, wa: "+5512982340551", web: "https://criptonahora.com", addr: "", src: "Empresa dos criadores do site", note: "Converte USDT e USDC em reais por PIX e permite pagar boletos com cripto. Empresa dos criadores deste site." },
];
