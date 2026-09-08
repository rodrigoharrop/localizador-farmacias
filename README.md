# 💊 Localizador de Farmácias Parceiras

Site responsivo para localizar farmácias parceiras com desconto especial usando geolocalização.

## 🚀 Funcionalidades

- ✅ Geolocalização automática do cliente
- ✅ Busca por CEP
- ✅ Mapa interativo com Leaflet
- ✅ Filtros por rede de farmácia (Pague Menos, Drogasil, Extrafarma, Outras)
- ✅ Cálculo automático de distância
- ✅ Link direto para Google Maps
- ✅ Design responsivo (mobile-first)
- ✅ Compatível com iOS e Android

## 📊 Dados Inclusos

- **72 farmácias** catalogadas
- Cobertura em **Fortaleza - CE**
- Redes: Pague Menos, Drogasil, Extrafarma e outras

## 🛠️ Tecnologias

- HTML5
- CSS3 (Flexbox + Grid)
- JavaScript (Vanilla)
- Leaflet.js (Mapa interativo)
- OpenStreetMap

## 🚀 Como Usar

### Localmente

```bash
python3 -m http.server 3000
# Acesse http://localhost:3000
```

### Deploy na Vercel

```bash
vercel deploy
```

## 📲 QR Code

Para gerar um QR Code que leva a este site:
1. Use um gerador online (QR Code generator)
2. Cole a URL do site
3. Baixe e imprima em papel adesivo (3x3cm mínimo)
4. Cole nas amostras de medicamento

## 📝 Estrutura de Dados

As farmácias estão em `farmacias.json` com os campos:
- CNPJ
- Nome
- Rede
- Endereço completo
- CEP
- Coordenadas GPS (latitude/longitude)

## 🔄 Como Adicionar Novas Farmácias

Edite `farmacias.json` e adicione um novo objeto:

```json
{
  "id": 73,
  "cnpj": "XXXXXXXXXXXXXXXX",
  "nome": "NOME DA FARMACIA",
  "rede": "NOME DA REDE",
  "tipo": "R_ABRA",
  "endereco": "RUA, NUMERO",
  "cidade": "FORTALEZA",
  "bairro": "BAIRRO",
  "cep": "00000000",
  "lat": -3.7xxx,
  "lng": -38.4xxx
}
```

## 📞 Suporte

Para adicionar mais farmácias ou personalizar o site, entre em contato.

## 📄 Licença

MIT
