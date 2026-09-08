# 🚀 Instruções de Deploy

## 1️⃣ Criar Repositório no GitHub

### Via Web (Mais fácil)

1. Acesse https://github.com/new
2. Nome do repositório: `localizador-farmacias`
3. Descrição: `Localizador de farmácias parceiras com geolocalização e Google Maps`
4. Deixe como **Public** (para que o link QR Code funcione)
5. Clique em **Create repository**

### Via Linha de Comando

Após criar o repositório no GitHub, execute:

```bash
cd "/Users/rodrigoharrop/PROJETOS CLOUDE/localizador-farmacias"

# Adicione o remote (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/localizador-farmacias.git

# Renomeie a branch se necessário
git branch -M main

# Faça o push
git push -u origin main
```

## 2️⃣ Deploy na Vercel

### Opção A: Deploy Direto (Recomendado)

1. Acesse https://vercel.com
2. Clique em **"New Project"**
3. Selecione **"Import Git Repository"**
4. Cole: `https://github.com/SEU_USUARIO/localizador-farmacias`
5. Clique em **Import**
6. Deixe as configurações padrão e clique **Deploy**

✅ Seu site estará disponível em um URL como: `https://localizador-farmacias.vercel.app`

### Opção B: Deploy via CLI

```bash
# Instale o Vercel CLI
npm install -g vercel

# Acesse a pasta do projeto
cd "/Users/rodrigoharrop/PROJETOS CLOUDE/localizador-farmacias"

# Faça login
vercel login

# Deploy
vercel deploy --prod
```

## 3️⃣ Gerar QR Code Público

Após o deploy, você terá um URL público tipo:
```
https://localizador-farmacias.vercel.app
```

Use esse URL para gerar um QR Code:
1. Acesse https://qr-code-generator.com
2. Cole a URL
3. Baixe e imprima em papel adesivo (3x3 cm)
4. Cole nas amostras de medicamento

## 4️⃣ Testando o Site

- **Desktop**: https://seu-url.vercel.app
- **Mobile**: Escaneie o QR Code com a câmera do celular
- **Geolocalização**: Clique em "Encontrar farmácias próximas"
- **Busca por CEP**: Digite um CEP e clique "Buscar"

## 📊 Links Importantes

- **GitHub**: https://github.com/SEU_USUARIO/localizador-farmacias
- **Vercel**: https://seu-url.vercel.app
- **QR Code**: Cole a URL do Vercel em um gerador QR Code

## 🆘 Troubleshooting

### Site não carrega as farmácias
- Verifique se `farmacias.json` foi enviado para a Vercel
- Tente limpar o cache do navegador (Ctrl+Shift+Delete)

### Geolocalização não funciona
- Verifique se o site está em HTTPS (Vercel fornece automaticamente)
- Aceite a permissão de localização no navegador

### QR Code não funciona
- Teste escanear com Google Lens ou Google Camera
- Regenere o QR Code com maior tamanho
- Verifique se a URL está correta

---

**Status**: 🟢 Pronto para deploy!
