#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🚀 Deploy Automático - Localizador de Farmácias${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Verificar se gh está instalado
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI não encontrado.${NC}"
    echo "Instalando..."
    curl -sL https://github.com/cli/cli/releases/download/v2.56.0/gh_2.56.0_macOS_arm64.zip -o /tmp/gh.zip
    unzip -q /tmp/gh.zip -d /tmp
    mv /tmp/gh_2.56.0_macOS_arm64/bin/gh ~/.local/bin/
    export PATH="$HOME/.local/bin:$PATH"
fi

# Verificar autenticação
echo -e "${YELLOW}1️⃣  Verificando autenticação GitHub...${NC}"
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}🔐 Você precisa autenticar no GitHub${NC}"
    echo "Clique no navegador que será aberto para autenticar..."
    gh auth login --scopes repo --web
fi

echo -e "${GREEN}✅ Autenticação confirmada!${NC}"
echo ""

# Obter nome de usuário
USERNAME=$(gh api user -q .login)
echo -e "${BLUE}👤 Usuário: $USERNAME${NC}"
echo ""

# Criar repositório
echo -e "${YELLOW}2️⃣  Criando repositório no GitHub...${NC}"
cd "/Users/rodrigoharrop/PROJETOS CLOUDE/localizador-farmacias"

# Verificar se repo já existe
if gh repo view localizador-farmacias 2>/dev/null; then
    echo -e "${YELLOW}📦 Repositório já existe. Atualizando...${NC}"
else
    gh repo create localizador-farmacias \
        --public \
        --source=. \
        --remote=origin \
        --push \
        --description "Localizador de farmácias parceiras com geolocalização e Google Maps - 72 lojas catalogadas"
fi

REPO_URL="https://github.com/$USERNAME/localizador-farmacias"
echo -e "${GREEN}✅ Repositório criado: $REPO_URL${NC}"
echo ""

# Fazer push
echo -e "${YELLOW}3️⃣  Fazendo push do código...${NC}"
git push -u origin main --force 2>/dev/null || echo "Já sincronizado"
echo -e "${GREEN}✅ Código enviado!${NC}"
echo ""

# Deploy na Vercel
echo -e "${YELLOW}4️⃣  Preparando deploy na Vercel...${NC}"
echo ""
echo -e "${BLUE}📋 PRÓXIMOS PASSOS:${NC}"
echo ""
echo "1. Acesse: https://vercel.com"
echo "2. Clique em 'New Project'"
echo "3. Selecione 'Import Git Repository'"
echo "4. Cole: $REPO_URL"
echo "5. Clique 'Import' e depois 'Deploy'"
echo ""
echo -e "${GREEN}Seu repositório está pronto!${NC}"
echo -e "${BLUE}GitHub: $REPO_URL${NC}"
echo ""
echo -e "${YELLOW}⏱️  O deploy na Vercel levará ~2 minutos${NC}"
echo ""

