let FARMACIAS = [];
let mapa = null;
let marcadores = [];
let localizacaoAtual = null;
let filtroAtual = 'todas';
let rotaAtual = null;

// Coordenadas centrais de Fortaleza
const FORTALEZA_CENTER = { lat: -3.7319, lng: -38.5267 };

const REDES_INFO = {
  'PAGUE MENOS': {
    logo: 'Logotipo_da_Pague_Menos.svg.webp',
    color: '#003DA5'
  },
  'DROGASIL': {
    logo: 'Logotipo_da_Drogasil_(2024).svg.webp',
    color: '#E63946'
  },
  'EXTRAFARMA': {
    logo: 'Extrafarma.png',
    color: '#6B46C1'
  },
  'OUTRAS': {
    logo: null,
    color: '#666666'
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

function buscarPorCep() {
  const cep = document.getElementById('cepInput').value.replace(/\D/g, '');
  if (cep.length !== 8) {
    alert('CEP inválido. Use 8 dígitos.');
    return;
  }

  const farmaciaRef = FARMACIAS.find(f => f.cep === cep);
  if (farmaciaRef) {
    localizacaoAtual = { lat: farmaciaRef.lat, lng: farmaciaRef.lng };
    inicializarMapa(localizacaoAtual.lat, localizacaoAtual.lng);
    exibirFarmaciasGroupadas();
  } else {
    alert('CEP não encontrado na nossa base de farmácias.');
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
  const logoFile = redeInfo.logo;
  
  if (!logoFile) {
    // Se não tem logo, usa emoji com cor da rede
    return L.divIcon({
      html: `<div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;background:${redeInfo.color};border-radius:50%;color:white;font-size:24px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏪</div>`,
      iconSize: [44, 44],
      className: 'custom-marker'
    });
  }

  // Se tem logo, usa a imagem
  return L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:50px;height:50px;background:white;border-radius:50%;border:3px solid ${redeInfo.color};box-shadow:0 2px 8px rgba(0,0,0,0.3);overflow:hidden;padding:2px;"><img src="${logoFile}" style="max-width:90%;max-height:90%;object-fit:contain;"></div>`,
    iconSize: [50, 50],
    className: 'custom-marker-rede'
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
            <button onclick="abrirGoogleMaps(${farmacia.lat}, ${farmacia.lng})" 
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
  if (rotaAtual) {
    mapa.removeControl(rotaAtual);
  }

  rotaAtual = L.Routing.control({
    waypoints: [
      L.latLng(latOrigem, lngOrigem),
      L.latLng(latDestino, lngDestino)
    ],
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1'
    }),
    lineOptions: {
      styles: [
        { color: '#0F7D3F', opacity: 0.8, weight: 5 }
      ]
    },
    summaryTemplate: '<div class="info"><h2>{name}</h2><p>{distance}, {time}</p></div>',
    altLineOptions: {
      styles: [
        { color: 'gray', opacity: 0.1, weight: 5 }
      ]
    },
    language: 'pt_BR'
  }).addTo(mapa);

  setTimeout(() => {
    const bounds = rotaAtual.getBounds();
    mapa.fitBounds(bounds, { padding: [50, 50] });
  }, 500);
}

function abrirGoogleMaps(lat, lng) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
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

  Object.keys(farmaciasGroupadas).sort().forEach(rede => {
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
                <button class="btn-small" onclick="abrirGoogleMaps(${f.lat}, ${f.lng})">📍 Maps</button>
                <button class="btn-small" onclick="copiarEndereco('${f.endereco}')">📋 Copiar</button>
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
