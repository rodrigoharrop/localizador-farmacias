let FARMACIAS = [];
let mapa = null;
let marcadores = [];
let localizacaoAtual = null;
let filtroAtual = 'todas';

// Coordenadas centrais de Fortaleza
const FORTALEZA_CENTER = { lat: -3.7319, lng: -38.5267 };

const REDES_INFO = {
  'PAGUE MENOS': {
    logo: 'Logotipo_da_Pague_Menos.svg.webp',
    iconMapa: 'icone Pague Menos.png',
    color: '#003DA5'
  },
  'DROGASIL': {
    logo: 'Logotipo_da_Drogasil_(2024).svg.webp',
    iconMapa: 'icone Drogasil.jpg',
    color: '#E63946'
  },
  'EXTRAFARMA': {
    logo: 'Extrafarma.png',
    iconMapa: 'icone ExtraFarma.jpeg',
    color: '#6B46C1'
  },
  'OUTRAS': {
    logo: null,
    iconMapa: null,
    color: '#0F7D3F'
  }
};

async function carregarFarmacias() {
  try {
    const response = await fetch('farmacias.json');
    const data = await response.json();
    FARMACIAS = data.farmacias;
    inicializarPagina();
  } catch (error) {
    console.error('Erro ao carregar farmácias:', error);
  }
}

function inicializarPagina() {
  inicializarMapa(FORTALEZA_CENTER.lat, FORTALEZA_CENTER.lng);
  exibirFarmaciasGroupadas();
}

function obterLocalizacao() {
  const btn = document.getElementById('geoBtn');
  btn.disabled = true;
  document.getElementById('geoText').textContent = 'Localizando...';

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        localizacaoAtual = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        inicializarMapa(localizacaoAtual.lat, localizacaoAtual.lng);
        exibirFarmaciasGroupadas();
        btn.disabled = false;
        document.getElementById('geoText').textContent = 'Usar minha localização';
      },
      (error) => {
        alert('Não conseguimos acessar sua localização. Por favor, verifique as permissões.');
        btn.disabled = false;
        document.getElementById('geoText').textContent = 'Usar minha localização';
      }
    );
  }
}


function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function criarIconeRede(rede) {
  const redeInfo = REDES_INFO[rede] || REDES_INFO['OUTRAS'];
  
  if (redeInfo.iconMapa) {
    return L.icon({
      iconUrl: redeInfo.iconMapa,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
      className: 'custom-marker-icon'
    });
  }
  
  return L.divIcon({
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: ${redeInfo.color};
      border-radius: 50%;
      color: white;
      font-size: 20px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-weight: bold;
    ">💊</div>`,
    iconSize: [40, 40],
    className: 'custom-marker'
  });
}

function criarIconeLocal() {
  return L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:#1FA055;border-radius:50%;color:white;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(31,160,85,0.5);">📍</div>`,
    iconSize: [36, 36],
    className: 'custom-marker-local'
  });
}

function inicializarMapa(lat, lng) {
  if (mapa) {
    mapa.remove();
  }

  mapa = L.map('map').setView([lat, lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapa);

  marcadores.forEach(m => m.remove());
  marcadores = [];

  if (localizacaoAtual) {
    L.marker([lat, lng], {
      icon: criarIconeLocal()
    }).addTo(mapa).bindPopup('<b>📍 Sua localização</b>').openPopup();
  }

  const farmaciasVisiveis = FARMACIAS.filter(f => {
    if (filtroAtual === 'todas') return true;
    if (filtroAtual === 'OUTRAS') return f.rede === 'OUTRAS';
    return f.rede === filtroAtual;
  });

  farmaciasVisiveis.forEach(farmacia => {
    const marker = L.marker([farmacia.lat, farmacia.lng], {
      icon: criarIconeRede(farmacia.rede)
    }).addTo(mapa);
    
    const distancia = localizacaoAtual ? calcularDistancia(localizacaoAtual.lat, localizacaoAtual.lng, farmacia.lat, farmacia.lng) : 0;
    
    marker.bindPopup(`
      <div style="width: 240px;">
        <b style="font-size: 14px;">${farmacia.nome}</b><br>
        <span style="font-size: 11px; color: #666;">${farmacia.rede}</span><br>
        ${localizacaoAtual ? `<span style="font-size: 11px; color: #0F7D3F; font-weight: 600;">📏 ${distancia.toFixed(1)} km</span><br>` : ''}
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
          📍 ${farmacia.endereco}<br>
          <small>${farmacia.bairro} - ${farmacia.cep}</small><br>
          <div style="margin-top: 8px; display: flex; gap: 6px;">
            ${localizacaoAtual ? `<button onclick="mostrarRota(${localizacaoAtual.lat}, ${localizacaoAtual.lng}, ${farmacia.lat}, ${farmacia.lng})" 
              style="flex: 1; padding: 6px; background: #0F7D3F; color: white; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
              🗺️ Ver Rota
            </button>` : ''}
            <button onclick="abrirGoogleMaps('${farmacia.nome.replace(/'/g, "\\'")}', '${farmacia.endereco.replace(/'/g, "\\'")}', '${farmacia.cidade}')" 
              style="flex: 1; padding: 6px; background: #666; color: white; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
              📍 Google Maps
            </button>
          </div>
        </div>
      </div>
    `);
    marcadores.push(marker);
  });
}

function mostrarRota(latOrigem, lngOrigem, latDestino, lngDestino) {
  if (window.rotaAtual) {
    mapa.removeLayer(window.rotaAtual);
  }

  const latlngs = [
    [latOrigem, lngOrigem],
    [latDestino, lngDestino]
  ];
  
  window.rotaAtual = L.polyline(latlngs, {
    color: '#0F7D3F',
    weight: 3,
    opacity: 0.8,
    dashArray: '5, 5'
  }).addTo(mapa);

  const group = new L.featureGroup([
    L.marker([latOrigem, lngOrigem]),
    L.marker([latDestino, lngDestino])
  ]);
  mapa.fitBounds(group.getBounds(), { padding: [50, 50] });

  setTimeout(() => {
    const url = `https://www.google.com/maps/dir/${latOrigem},${lngOrigem}/${latDestino},${lngDestino}`;
    window.open(url, '_blank');
  }, 300);
}

function abrirGoogleMaps(nome, endereco, cidade) {
  const query = encodeURIComponent(`${nome} ${endereco}, ${cidade}`);
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  window.open(url, '_blank');
}

function exibirFarmaciasGroupadas() {
  const container = document.getElementById('farmaciasContainer');
  const filtroAtualRede = filtroAtual === 'todas' ? null : filtroAtual;

  const farmaciasGroupadas = {};
  
  FARMACIAS.forEach(f => {
    if (filtroAtualRede && f.rede !== filtroAtualRede) return;
    
    if (!farmaciasGroupadas[f.rede]) {
      farmaciasGroupadas[f.rede] = [];
    }
    
    let farmacia = { ...f };
    if (localizacaoAtual) {
      farmacia.distancia = calcularDistancia(localizacaoAtual.lat, localizacaoAtual.lng, f.lat, f.lng);
    }
    
    farmaciasGroupadas[f.rede].push(farmacia);
  });

  Object.keys(farmaciasGroupadas).forEach(rede => {
    if (localizacaoAtual) {
      farmaciasGroupadas[rede].sort((a, b) => a.distancia - b.distancia);
    }
  });

  let html = '<div class="redes-container">';

  const ordemRedes = ['PAGUE MENOS', 'DROGASIL', 'EXTRAFARMA', 'OUTRAS'];
  Object.keys(farmaciasGroupadas).sort((a, b) => {
    const indexA = ordemRedes.indexOf(a);
    const indexB = ordemRedes.indexOf(b);
    return indexA - indexB;
  }).forEach(rede => {
    const farmacias = farmaciasGroupadas[rede];
    const redeClass = rede.toLowerCase().replace(' ', '-');
    const redeInfo = REDES_INFO[rede] || { logo: null, color: '#666' };
    
    let logoHtml = '';
    if (redeInfo.logo) {
      logoHtml = `<div class="rede-logo-container"><img src="${redeInfo.logo}" alt="${rede}" class="rede-logo"></div>`;
    } else {
      logoHtml = `<div class="rede-logo-text">${rede}</div>`;
    }
    
    html += `
      <div class="rede-section">
        <div class="rede-header ${redeClass}" style="border-bottom-color: ${redeInfo.color}">
          ${logoHtml}
          <div class="rede-count">${farmacias.length} lojas</div>
        </div>
        <div class="farmacia-grid">
          ${farmacias.map(f => `
            <div class="farmacia-card">
              <div class="farmacia-name">💊 ${f.nome}</div>
              <div class="farmacia-address">
                📍 ${f.endereco}<br>
                <small>${f.bairro} - CEP: ${f.cep}</small>
              </div>
              ${localizacaoAtual ? `<div class="farmacia-distance show">📏 ${f.distancia.toFixed(1)} km</div>` : ''}
              <div class="farmacia-actions">
                ${localizacaoAtual ? `<button class="btn-small btn-map" onclick="mostrarRota(${localizacaoAtual.lat}, ${localizacaoAtual.lng}, ${f.lat}, ${f.lng})">🗺️ Ver Rota</button>` : ''}
                <button class="btn-small" onclick="abrirGoogleMaps('${f.nome.replace(/'/g, "\\'")}', '${f.endereco.replace(/'/g, "\\'")}', '${f.cidade}')">📍 Maps</button>
                <button class="btn-small" onclick="copiarEndereco('${f.endereco.replace(/'/g, "\\'")}')"📋 Copiar</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function filtrarRede(rede) {
  filtroAtual = rede;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.closest('.filter-btn').classList.add('active');

  inicializarMapa(
    localizacaoAtual ? localizacaoAtual.lat : FORTALEZA_CENTER.lat,
    localizacaoAtual ? localizacaoAtual.lng : FORTALEZA_CENTER.lng
  );
  exibirFarmaciasGroupadas();
}

function copiarEndereco(endereco) {
  navigator.clipboard.writeText(endereco).then(() => {
    alert('✅ Endereço copiado!');
  });
}

carregarFarmacias();
