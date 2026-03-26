# ============================================================
# deploy.ps1 — Deploy do Couple-Sync para EC2 (Ubuntu 24.04)
# Uso: .\scripts\deploy.ps1
# ============================================================

$EC2_HOST    = "18.223.122.46"
$EC2_USER    = "ubuntu"
$PEM_FILE    = "C:\Couple-Sync\couple-synk.pem"
$REMOTE_DIR  = "/home/ubuntu/couple-sync"
$SSH_OPTS    = "-i `"$PEM_FILE`" -o StrictHostKeyChecking=no"

function ssh_cmd($cmd) {
    & ssh $SSH_OPTS.Split(" ") "$EC2_USER@$EC2_HOST" $cmd
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY Couple-Sync → EC2" -ForegroundColor Cyan
Write-Host "  Host: $EC2_HOST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ── 1. Corrigir permissões do .pem (necessário no Windows) ──
Write-Host "`n[1/6] Ajustando permissoes do .pem..." -ForegroundColor Yellow
icacls "$PEM_FILE" /inheritance:r /grant:r "${env:USERNAME}:R" | Out-Null

# ── 2. Instalar Docker + Docker Compose na EC2 (idempotente) ──
Write-Host "`n[2/6] Instalando Docker na EC2 (se necessario)..." -ForegroundColor Yellow
$setup_docker = @"
set -e
if ! command -v docker &> /dev/null; then
  echo '→ Instalando Docker...'
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker ubuntu
  echo '→ Docker instalado.'
else
  echo '→ Docker ja instalado: '$(docker --version)
fi
if ! docker compose version &> /dev/null 2>&1; then
  echo '→ Instalando Docker Compose plugin...'
  sudo apt-get install -y docker-compose-plugin
fi
echo '→ Docker Compose: '$(docker compose version)
"@
ssh_cmd "bash -s" <<< $setup_docker
& ssh $SSH_OPTS.Split(" ") "$EC2_USER@$EC2_HOST" "bash -s" @"
$setup_docker
"@

# ── 3. Criar diretório remoto ──
Write-Host "`n[3/6] Criando diretorio remoto $REMOTE_DIR..." -ForegroundColor Yellow
& ssh $SSH_OPTS.Split(" ") "$EC2_USER@$EC2_HOST" "mkdir -p $REMOTE_DIR"

# ── 4. Sincronizar arquivos via rsync (exclui node_modules, .git, etc.) ──
Write-Host "`n[4/6] Sincronizando arquivos para a EC2..." -ForegroundColor Yellow

# Verifica se rsync existe, caso contrario usa scp
$has_rsync = Get-Command rsync -ErrorAction SilentlyContinue

if ($has_rsync) {
    & rsync -avz --progress `
        -e "ssh $SSH_OPTS" `
        --exclude='.git' `
        --exclude='node_modules' `
        --exclude='.env' `
        --exclude='backend/tmp' `
        --exclude='backend/log' `
        --exclude='.local' `
        "C:\Couple-Sync/" `
        "${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}/"
} else {
    Write-Host "  rsync nao encontrado, usando scp em modo tar..." -ForegroundColor DarkYellow
    # Empacota localmente e envia
    $tmpTar = "$env:TEMP\couple-sync-deploy.tar.gz"
    Write-Host "  Compactando projeto..." -ForegroundColor DarkYellow
    & tar -czf $tmpTar `
        --exclude='.git' `
        --exclude='node_modules' `
        --exclude='.env' `
        --exclude='backend/tmp' `
        --exclude='backend/log' `
        --exclude='.local' `
        -C "C:\" "Couple-Sync"
    Write-Host "  Enviando arquivo ($([Math]::Round((Get-Item $tmpTar).Length/1MB,1)) MB)..." -ForegroundColor DarkYellow
    & scp $SSH_OPTS.Split(" ") $tmpTar "${EC2_USER}@${EC2_HOST}:/tmp/couple-sync-deploy.tar.gz"
    & ssh $SSH_OPTS.Split(" ") "$EC2_USER@$EC2_HOST" "tar -xzf /tmp/couple-sync-deploy.tar.gz -C /home/ubuntu/ && mv /home/ubuntu/Couple-Sync $REMOTE_DIR 2>/dev/null || true && rm /tmp/couple-sync-deploy.tar.gz"
    Remove-Item $tmpTar -ErrorAction SilentlyContinue
}

# ── 5. Enviar .env de produção ──
Write-Host "`n[5/6] Enviando .env de producao..." -ForegroundColor Yellow

# Gera .env de producao a partir do .env local, substituindo valores dev
$envProd = Get-Content "C:\Couple-Sync\.env" -Raw

# Substitui variaveis de ambiente para producao
$envProd = $envProd -replace "RAILS_ENV=development", "RAILS_ENV=production"
$envProd = $envProd -replace "POSTGRES_DB=sincronia_development", "POSTGRES_DB=sincronia_production"
$envProd = $envProd -replace "NEXT_PUBLIC_API_URL=http://localhost:3001", "NEXT_PUBLIC_API_URL=http://${EC2_HOST}:3001"
$envProd = $envProd -replace "NEXT_PUBLIC_API_BASE_URL=http://localhost:3001", "NEXT_PUBLIC_API_BASE_URL=http://${EC2_HOST}:3001"
$envProd = $envProd -replace "NEXT_PUBLIC_SITE_URL=http://localhost:3000", "NEXT_PUBLIC_SITE_URL=http://${EC2_HOST}:3000"

# Salva temp e envia
$tmpEnv = "$env:TEMP\.env.prod"
$envProd | Out-File -FilePath $tmpEnv -Encoding utf8 -NoNewline
& scp $SSH_OPTS.Split(" ") $tmpEnv "${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}/.env"
Remove-Item $tmpEnv -ErrorAction SilentlyContinue

Write-Host "  .env enviado." -ForegroundColor Green

# ── 6. Build e subida dos containers ──
Write-Host "`n[6/6] Fazendo build e subindo containers Docker..." -ForegroundColor Yellow

$deploy_cmd = @"
cd $REMOTE_DIR
echo '→ Parando containers antigos...'
sudo docker compose down --remove-orphans 2>/dev/null || true
echo '→ Limpando imagens antigas...'
sudo docker system prune -f 2>/dev/null || true
echo '→ Build das imagens...'
sudo docker compose build --no-cache
echo '→ Subindo servicos...'
sudo docker compose up -d
echo '→ Aguardando servicos iniciarem (60s)...'
sleep 60
echo '→ Status dos containers:'
sudo docker compose ps
echo ''
echo '→ Logs do backend (ultimas 30 linhas):'
sudo docker compose logs backend --tail=30
"@

& ssh $SSH_OPTS.Split(" ") "$EC2_USER@$EC2_HOST" $deploy_cmd

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  DEPLOY CONCLUIDO!" -ForegroundColor Green
Write-Host "  Frontend: http://${EC2_HOST}:3000" -ForegroundColor Green
Write-Host "  Backend:  http://${EC2_HOST}:3001" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
