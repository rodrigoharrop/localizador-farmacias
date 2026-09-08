let FARMACIAS = [];
let mapa = null;
let marcadores = [];
let localizacaoAtual = null;
let filtroAtual = 'todas';

async function carregarFarmacias() {
  try {
    const response = await fetch('farmacias.json');
    const data = await response.json();
    FARMACIAS = data.farmacias;
  } catch (error) {
    console.error('Erro ao carregar farmácias:', error);
  }
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
        exibirFarmacias();
        btn.disabled = false;
        document.getElementById('geoText').textContent = 'Encontrar farmácias próximas';
      },
      (error) => {
        alert('Não conseguimos acessar sua localização. Por favor, verifique as permissões.');
        btn.disabled = false;
        document.getElementById('geoText').textContent = 'Encontrar farmácias próximas';
      }
    );
  } else {
    alert('Seu navegador não suporta geolocalização.');
    btn.disabled = false;
    document.getElementById('geoText').textContent = 'Encontrar farmácias próximas';
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
    exibirFarmacias();
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

function criarIconePharmacie() {
  return L.divIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: #0F7D3F;
        border-radius: 50%;
        color: white;
        font-size: 20px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(15, 125, 63, 0.4);
      ">
        💊
      </div>
    `,
    iconSize: [40, 40],
    className: 'custom-marker'
  });
}

function criarIconeLocal() {
  return L.divIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: #1FA055;
        border-radius: 50%;
        color: white;
        font-size: 18px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(31, 160, 85, 0.5);
      ">
        📍
      </div>
    `,
    iconSize: [36, 36],
    className: 'custom-marker-local'
  });
}

function inicializarMapa(lat, lng) {
  if (mapa) {
    mapa.remove();
  }

  mapa = L.map('map').setView([lat, lng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapa);

  marcadores.forEach(m => m.remove());
  marcadores = [];

  L.marker([lat, lng], {
    icon: criarIconeLocal()
  }).addTo(mapa).bindPopup('<b>📍 Sua localização</b>').openPopup();

  const farmaciasVisiveis = FARMACIAS.filter(f => {
    if (filtroAtual === 'todas') return true;
    if (filtroAtual === 'OUTRAS') return f.rede === 'OUTRAS';
    return f.rede === filtroAtual;
  });

  farmaciasVisiveis.forEach(farmacia => {
    const marker = L.marker([farmacia.lat, farmacia.lng], {
      icon: criarIconePharmacie()
    }).addTo(mapa);
    
    marker.bindPopup(`
      <div style="width: 220px;">
        <b style="font-size: 14px;">${farmacia.nome}</b><br>
        <span style="font-size: 11px; color: #666;">${farmacia.rede}</span><br>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
          📍 ${farmacia.endereco}<br>
          ${farmacia.bairro} - ${farmacia.cep}<br>
          <div style="margin-top: 8px; display: flex; gap: 6px;">
            <button onclick="iniciarNavegacao(${farmacia.lat}, ${farmacia.lng})" 
              style="flex: 1; padding: 6px; background: #0F7D3F; color: white; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
              🗺️ Navegar
            </button>
          </div>
        </div>
      </div>
    `);
    marcadores.push(marker);
  });
}

function exibirFarmacias() {
  if (!localizacaoAtual) return;

  document.getElementById('filters').style.display = 'flex';

  const farmaciasOrdenadas = FARMACIAS.map(f => ({
    ...f,
    distancia: calcularDistancia(localizacaoAtual.lat, localizacaoAtual.lng, f.lat, f.lng)
  }))
  .filter(f => {
    if (filtroAtual === 'todas') return true;
    if (filtroAtual === 'OUTRAS') return f.rede === 'OUTRAS';
    return f.rede === filtroAtual;
  })
  .sort((a, b) => a.distancia - b.distancia);

  inicializarMapa(localizacaoAtual.lat, localizacaoAtual.lng);

  const container = document.getElementById('farmaciasContainer');
  const resultado = document.getElementById('resultado');
  const empty = document.getElementById('empty');

  if (farmaciasOrdenadas.length === 0) {
    resultado.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  container.innerHTML = farmaciasOrdenadas.map(f => `
    <div class="farmacia-card">
      <div class="farmacia-name">
        💊 ${f.nome}
        <span class="badge">${f.rede}</span>
      </div>
      <div class="farmacia-address">
        📍 ${f.endereco}<br>
        <span style="font-size: 12px; color: #666;">${f.bairro} - CEP: ${f.cep}</span>
      </div>
      <div class="farmacia-distance">
        📏 <strong>${f.distancia.toFixed(1)} km</strong> de você
      </div>
      <div class="farmacia-actions">
        <button class="btn-small btn-map" onclick="iniciarNavegacao(${f.lat}, ${f.lng})">🗺️ Navegar</button>
        <button class="btn-small" onclick="copiarEndereco('${f.endereco}')">📋 Copiar</button>
      </div>
    </div>
  `).join('');

  resultado.style.display = 'block';
  empty.style.display = 'none';
}

function filtrarRede(rede) {
  filtroAtual = rede;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  if (localizacaoAtual) {
    exibirFarmacias();
  }
}

function iniciarNavegacao(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  window.open(url, '_blank');
}

function copiarEndereco(endereco) {
  navigator.clipboard.writeText(endereco).then(() => {
    alert('✅ Endereço copiado!');
  });
}

carregarFarmacias();
