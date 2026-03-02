# PotuPartners — Complete Deployment Guide

> Step-by-step instructions to deploy the full stack:  
> **Frontend → Hostinger** | **Backend + RAG → DigitalOcean VPS** | **Database → DO Managed PostgreSQL** | **Files → DO Spaces**

---

## Table of Contents

1. [Prerequisites & Accounts](#1-prerequisites--accounts)
2. [DigitalOcean: Create Infrastructure](#2-digitalocean-create-infrastructure)
3. [VPS: Initial Server Setup](#3-vps-initial-server-setup)
4. [Backend: Environment & Deploy](#4-backend-environment--deploy)
5. [RAG Service: Environment & Deploy](#5-rag-service-environment--deploy)
6. [Nginx: Configure & SSL](#6-nginx-configure--ssl)
7. [Frontend: Build & Deploy to Hostinger](#7-frontend-build--deploy-to-hostinger)
8. [Verify Everything Works](#8-verify-everything-works)
9. [CI/CD: GitHub Actions Setup](#9-cicd-github-actions-setup)
10. [Ongoing Maintenance](#10-ongoing-maintenance)

---

## 1. Prerequisites & Accounts

### What you need before starting

| Requirement | Where to get it | Cost |
|---|---|---|
| DigitalOcean account | cloud.digitalocean.com | Pay-as-you-go |
| Hostinger account with your domain | Already have this | — |
| Domain pointed to Hostinger | Hostinger DNS panel | — |
| GitHub repository | github.com | Free |
| OpenAI API key | platform.openai.com | Pay-per-use |
| Local tools: Node 20, Git, SSH client | Install below | Free |

### Install tools on your Windows machine

```powershell
# Install Node.js 20 (if not installed)
# Download from https://nodejs.org — choose LTS (v20)

# Verify after install:
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x

# Install Git if not installed:
# https://git-scm.com/download/win

# SSH is built into Windows 10/11 — verify:
ssh -V
```

---

## 2. DigitalOcean: Create Infrastructure

You need 3 things on DigitalOcean: a **Droplet** (VPS), a **Managed PostgreSQL** database, and a **Space** (file storage).

### 2.1 — Create a Droplet (VPS)

1. Go to **cloud.digitalocean.com → Create → Droplets**
2. Settings:
   - **Region:** Singapore (SGP1) — closest to Nigeria
   - **Image:** Ubuntu 22.04 LTS x64
   - **Size:** Basic → Regular → **$12/mo (2 vCPU, 2GB RAM)** minimum, **$24/mo (2 vCPU, 4GB RAM)** recommended for RAG
   - **Authentication:** SSH Key (see below)
   - **Hostname:** `potupartners-api`
3. Add your SSH key:
   ```powershell
   # In PowerShell on your Windows machine:
   # Generate a key if you don't have one:
   ssh-keygen -t ed25519 -C "juliosilahi@gmail.com"
   # Press Enter for all prompts (saves to C:\Users\YourName\.ssh\id_ed25519)

   # Copy your PUBLIC key to clipboard:
   Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | clip
   ```
   Paste into the "SSH Key" field in DigitalOcean.
4. Click **Create Droplet** — note the IP address shown (e.g. `165.245.185.246`)

### 2.2 — Create Managed PostgreSQL Database

1. Go to **Databases → Create Database Cluster**
2. Settings:
   - **Engine:** PostgreSQL 16
   - **Region:** Singapore (same as droplet)
   - **Plan:** Basic → $15/mo (1 vCPU, 1GB RAM)
   - **Name:** `potupartners-db`
3. After creation, go to the database → **Settings → Trusted Sources**
   - Add your Droplet's IP address
   - This ensures only your VPS can connect
4. Go to **Connection Details** → select **Connection string** → copy it. Looks like:
   ```
   postgresql://doadmin:AVNS_xxxxxx@db-postgresql-sgp1-xxxxx.db.ondigitalocean.com:25060/defaultdb?sslmode=require
   ```
   **Save this — you'll need it in Step 4.**

### 2.3 — Create a Space (File Storage)

1. Go to **Spaces Object Storage → Create Space**
2. Settings:
   - **Region:** Singapore (SGP1)
   - **Name:** `potupartners-files` (must be globally unique — add a suffix if taken, e.g. `potupartners-files-ng`)
   - **CDN:** Enable CDN ✅
3. After creation, note:
   - **Endpoint:** `https://sgp1.digitaloceanspaces.com`
   - **CDN URL:** shown on the Space page, e.g. `https://potupartners-files.sgp1.cdn.digitaloceanspaces.com`
4. Create API keys for Spaces:
   - Go to **API → Spaces Keys → Generate New Key**
   - **Name:** `potupartners-spaces`
   - Copy the **Access Key** and **Secret Key** — secret shown only once
   - **Save both — you'll need them in Step 4.**

### 2.4 — Point your API subdomain to the Droplet

Add a DNS record so `api.potupartners.site` points to your Droplet:

**Option A — Use DigitalOcean DNS (recommended):**
1. Go to **Networking → Domains → Add Domain** → add `potupartners.site`
2. Update your domain's nameservers at your registrar to point to DigitalOcean's nameservers:
   - `ns1.digitalocean.com`
   - `ns2.digitalocean.com`
   - `ns3.digitalocean.com`
3. In DigitalOcean DNS, add:
   - **A record:** `api` → your Droplet IP (e.g. `165.245.185.246`)
   - **A record:** `@` → your Hostinger IP (from Hostinger hPanel → DNS Zone)

**Option B — Use Hostinger DNS (simpler):**
1. Go to Hostinger **hPanel → Domains → DNS Zone**
2. Add a new **A record:**
   - **Name:** `api`
   - **Points to:** your Droplet IP (e.g. `165.245.185.246`)
   - **TTL:** 3600

DNS propagation takes 5–30 minutes. You can verify with:
```powershell
nslookup api.potupartners.site
# Should return your Droplet IP
```

---

## 3. VPS: Initial Server Setup

### 3.1 — Connect to your Droplet

```powershell
# In PowerShell:
ssh root@165.245.185.246
# Replace 165.245.185.246 with your actual Droplet IP
# Type "yes" when prompted for fingerprint
```

### 3.2 — Run the setup script

Copy the setup script to the server and run it. Do this **from your local PowerShell** (not inside SSH):

```powershell
# Upload setup script from your project folder:
scp X:\Project\PotuPartners\scripts\setup.sh root@165.245.185.246:/root/setup.sh

# Now SSH in and run it:
ssh root@165.245.185.246
chmod +x /root/setup.sh
bash /root/setup.sh
```

This takes **5–10 minutes** and installs:
- Node.js 20, npm, PM2, TypeScript
- Python 3.11 + venv for RAG service
- Nginx
- Certbot (Let's Encrypt SSL)
- UFW firewall (SSH, 80, 443 open; 4000, 8000 blocked)
- Fail2Ban (brute-force protection)
- Log rotation
- SSH hardening

> ⚠️ The script disables password SSH login. Make sure your SSH key is working **before** you run it, or you could lock yourself out.

### 3.3 — Create the SSH key for the app user

```bash
# Still inside your SSH session as root:

# Switch to app user
su - potupartners

# Create SSH directory
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key so you can SSH as this user later
# (paste the content of your id_ed25519.pub from your Windows machine)
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Exit back to root
exit
```

Test it works from your local Windows machine:
```powershell
ssh potupartners@165.245.185.246
# Should log in without password
exit
```

### 3.4 — Create log directories

```bash
# SSH as root:
ssh root@165.245.185.246

mkdir -p /var/log/potupartners
chown potupartners:potupartners /var/log/potupartners
```

---

## 4. Backend: Environment & Deploy

### 4.1 — Generate your secrets

Run these commands on your **Windows machine** in PowerShell, or in Git Bash:

```bash
# Option A — Git Bash (recommended):
# Open Git Bash, then:
openssl rand -hex 64   # Copy output → JWT_ACCESS_SECRET
openssl rand -hex 64   # Copy output → JWT_REFRESH_SECRET  
openssl rand -hex 32   # Copy output → RAG_SERVICE_SECRET
```

If you don't have OpenSSL, use Node.js instead:
```powershell
# In PowerShell:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Run 3 times — use outputs for each secret
```

### 4.2 — Create the backend .env file

In VS Code, open `backend/.env.example`, create a new file `backend/.env` (this file is gitignored), and fill in your values:

```env
# ── Server ──────────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://potupartners.site

# ── PostgreSQL ───────────────────────────────────────────────────────────────
# Paste the connection string from DO Managed DB (Step 2.2)
DATABASE_URL=postgresql://doadmin:AVNS_xxxxxx@db-postgresql-sgp1-xxxxx.db.ondigitalocean.com:25060/defaultdb?sslmode=require

# ── JWT Secrets (use your generated values from Step 4.1) ───────────────────
JWT_ACCESS_SECRET=your_64_char_hex_here
JWT_REFRESH_SECRET=your_different_64_char_hex_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── DigitalOcean Spaces ──────────────────────────────────────────────────────
DO_SPACES_KEY=your_spaces_access_key      # From Step 2.3
DO_SPACES_SECRET=your_spaces_secret_key   # From Step 2.3
DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
DO_SPACES_BUCKET=potupartners-files       # Your Space name from Step 2.3
DO_SPACES_CDN_URL=https://potupartners-files.sgp1.cdn.digitaloceanspaces.com

# ── RAG Microservice ─────────────────────────────────────────────────────────
RAG_SERVICE_URL=http://127.0.0.1:8000
RAG_SERVICE_SECRET=your_32_char_hex_here  # From Step 4.1

# ── Security ─────────────────────────────────────────────────────────────────
BCRYPT_ROUNDS=12
LOG_LEVEL=info
```

### 4.3 — Fix the migrate script path

There's one small thing to fix before deploying. The `package.json` migrate script points to the wrong path. Open `backend/package.json` and update the migrate script:

```json
"scripts": {
  "dev":     "ts-node-dev --respawn --transpile-only src/index.ts",
  "build":   "tsc --project tsconfig.json",
  "start":   "node dist/index.js",
  "migrate": "node dist/db/migrate.js",
  "seed":    "ts-node src/scripts/seed.ts",
  "lint":    "eslint src --ext .ts"
}
```

### 4.4 — Upload and deploy backend to VPS

From your **local PowerShell** (not inside SSH):

```powershell
# Navigate to your project root
cd X:\Project\PotuPartners

# 1. Upload the backend source code (excludes node_modules, .env)
rsync -avz --compress --delete `
  --exclude='node_modules/' `
  --exclude='dist/' `
  --exclude='.env' `
  -e "ssh" `
  backend/ `
  potupartners@165.245.185.246:/opt/potupartners/backend/

# 2. Upload your .env file separately (never rsync with source to avoid accidental commits)
scp backend/.env potupartners@165.245.185.246:/opt/potupartners/backend/.env
```

> **Windows note:** If `rsync` is not available in PowerShell, use **Git Bash** and run the same commands there. Git Bash includes rsync.

### 4.5 — Install dependencies, build, and migrate (on server)

```powershell
# SSH into the server as the app user
ssh potupartners@165.245.185.246
```

Now inside the SSH session:

```bash
# Go to backend directory
cd /opt/potupartners/backend

# Install all dependencies (including devDeps for TypeScript compilation)
npm install

# Compile TypeScript to JavaScript
npm run build

# Verify the dist/ folder was created:
ls dist/
# Should see: index.js, config/, modules/, socket/, utils/, db/, middleware/

# Run database migrations (creates all tables)
npm run migrate
# Expected output:
#   ✅  Applying 001_create_users.sql…
#   ✅  Applying 002_create_refresh_tokens.sql…
#   ...
#   🎉  All migrations applied

# Seed the database with admin + staff accounts
ADMIN_PASSWORD=_1998Ace npm run seed
# IMPORTANT: Change YourStrongPassword123! to something secure
# Write this password down — you'll need it to log in to the admin panel
```
# Seed: creates admin + 4 partners + 2 associates
NODE_TLS_REJECT_UNAUTHORIZED=0 ADMIN_PASSWORD=1998 npm run seed
### 4.6 — Start the backend with PM2

```bash
# Still inside SSH as potupartners:

# Upload the ecosystem.config.js from your project root
# (do this from local machine in a second terminal):
# scp X:\Project\PotuPartners\ecosystem.config.js potupartners@165.245.185.246:/opt/potupartners/

cd /opt/potupartners

# Start both API and RAG service (RAG will fail until Step 5 — that's ok)
pm2 start ecosystem.config.js --only potupartners-api --env production

# Verify it started:
pm2 status
# Should show: potupartners-api | online | ...

# Check logs for errors:
pm2 logs potupartners-api --lines 30

# Save PM2 state so it restarts after server reboot:
pm2 save
```

Quick sanity check — the API should respond on port 4000 internally:
```bash
curl http://localhost:4000/health
# Expected: {"status":"ok","env":"production","uptime":...}
```

---

## 5. RAG Service: Environment & Deploy

### 5.1 — Create the RAG service .env file

In VS Code, create `rag-service/.env`:

```env
# ── Service Auth ─────────────────────────────────────────────────────────────
# Must EXACTLY match RAG_SERVICE_SECRET in backend/.env
RAG_SERVICE_SECRET=your_32_char_hex_here

# ── OpenAI ───────────────────────────────────────────────────────────────────
OPENAI_API_KEY=sk-proj-your_openai_key_here

# ── LLM Settings ─────────────────────────────────────────────────────────────
LLM_MODEL=gpt-4o
EMBEDDING_MODEL=text-embedding-3-small
MAX_RETRIEVED_CHUNKS=5
TEMPERATURE=0.1
MAX_TOKENS=1000

# ── ChromaDB ─────────────────────────────────────────────────────────────────
CHROMA_PERSIST_PATH=./chroma_db
CHROMA_COLLECTION_NAME=potupartners_docs

# ── Chunking ─────────────────────────────────────────────────────────────────
CHUNK_SIZE=800
CHUNK_OVERLAP=120

# ── DigitalOcean Spaces (for downloading RAG docs to process) ─────────────────
DO_SPACES_KEY=your_spaces_access_key
DO_SPACES_SECRET=your_spaces_secret_key
DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
DO_SPACES_BUCKET=potupartners-files

# ── Backend callback (tells backend when indexing is done) ────────────────────
BACKEND_URL=http://127.0.0.1:4000
BACKEND_SERVICE_SECRET=your_32_char_hex_here

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_LEVEL=INFO
```

### 5.2 — Upload and deploy RAG service

From local PowerShell or Git Bash:

```powershell
# Upload RAG service (exclude venv and chroma_db — those are built on server)
rsync -avz --compress --delete `
  --exclude='venv/' `
  --exclude='chroma_db/' `
  --exclude='__pycache__/' `
  --exclude='*.pyc' `
  --exclude='.env' `
  -e "ssh" `
  rag-service/ `
  potupartners@165.245.185.246:/opt/potupartners/rag-service/

# Upload .env separately
scp rag-service/.env potupartners@165.245.185.246:/opt/potupartners/rag-service/.env
```

### 5.3 — Install Python dependencies (on server)

```bash
# SSH into server
ssh potupartners@165.245.185.246

cd /opt/potupartners/rag-service

# Activate the venv (created by setup.sh)
source venv/bin/activate

# Install dependencies (this takes 2–4 minutes — downloading PyMuPDF, ChromaDB, etc.)
pip install --upgrade pip
pip install -r requirements.txt

# Test the service starts:
uvicorn app.main:app --host 127.0.0.1 --port 8000 &
sleep 3
curl http://127.0.0.1:8000/health
# Expected: {"status":"ok","collection_count":0}

# Kill the test process
kill %1

# Deactivate venv
deactivate
```

### 5.4 — Start RAG service with PM2

```bash
# Still SSH'd in as potupartners:
cd /opt/potupartners

# Start RAG service
pm2 start ecosystem.config.js --only potupartners-rag --env production

# Check status
pm2 status
# Both potupartners-api and potupartners-rag should show "online"

pm2 logs potupartners-rag --lines 20
# Should see: "RAG service starting up" and "ChromaDB ready"

# Save PM2 state
pm2 save
```

---

## 6. Nginx: Configure & SSL

### 6.1 — Upload and enable Nginx config

From local PowerShell or Git Bash:

```powershell
# Upload from your project folder
scp X:\Project\PotuPartners\nginx\potupartners.conf root@165.245.185.246:/etc/nginx/sites-available/potupartners
```

Then on the server (SSH as root):

```bash
ssh root@165.245.185.246

# Enable the site (create symlink)
ln -sf /etc/nginx/sites-available/potupartners /etc/nginx/sites-enabled/potupartners

# Remove default site if still there
rm -f /etc/nginx/sites-enabled/default

# Test configuration syntax
nginx -t
# Expected: nginx: configuration file /etc/nginx/nginx.conf test is successful
```

> ⚠️ If `nginx -t` fails, it's likely because SSL certificates don't exist yet. That's fine — continue to Step 6.2 which creates them.

### 6.2 — Get SSL certificate (Let's Encrypt)

First, make sure DNS is working (from Step 2.4):
```bash
# On the server:
nslookup api.potupartners.site
# Must return your Droplet IP before this step works
```

Get the certificate:
```bash
# Still SSH'd as root:

# Temporarily edit Nginx to work WITHOUT SSL (for the ACME challenge)
# The Nginx config already handles this — just start Nginx first
systemctl start nginx

# Get certificate for your API domain
certbot --nginx -d api.potupartners.site \
  --non-interactive \
  --agree-tos \
  --email ssl@potupartners.site
# Replace ssl@potupartners.site with a real email — you'll get renewal reminders

# Expected output at end:
# Successfully received certificate.
# Certificate is saved at: /etc/letsencrypt/live/api.potupartners.site/fullchain.pem
```

Now test Nginx with SSL:
```bash
nginx -t
# Should now pass
systemctl reload nginx
```

Verify SSL works:
```bash
curl https://api.potupartners.site/health
# Expected: {"status":"ok","env":"production",...}
```

### 6.3 — Verify SSL auto-renewal

```bash
# Test that auto-renewal works:
certbot renew --dry-run
# Expected: Congratulations, all simulated renewals succeeded
```

Certbot installs a systemd timer that runs this automatically every 12 hours.

---

## 7. Frontend: Build & Deploy to Hostinger

### 7.1 — Update frontend environment for production

Open `frontend/.env.local` in VS Code and verify these values match your actual domains:

```env
NEXT_PUBLIC_API_URL=https://api.potupartners.site
NEXT_PUBLIC_SOCKET_URL=https://api.potupartners.site
NEXT_PUBLIC_APP_NAME=PotuPartners
NEXT_PUBLIC_APP_URL=https://potupartners.site
NEXT_PUBLIC_CDN_URL=https://potupartners-files.sgp1.cdn.digitaloceanspaces.com
```

> If your Space was named something different in Step 2.3 (e.g. `potupartners-files-ng`), update `NEXT_PUBLIC_CDN_URL` to match.

### 7.2 — Install frontend dependencies and build

In VS Code terminal (PowerShell), navigate to the frontend directory:

```powershell
cd X:\Project\PotuPartners\frontend

# Install dependencies
npm install

# Build for production (creates the 'out/' folder)
npm run build
```

The build takes 1–3 minutes. When complete you'll see:
```
✓ Compiled successfully
✓ Generating static pages (X/X)
Export successful
```

A new folder `frontend/out/` will be created — this is what gets deployed to Hostinger.

> **If the build fails:** Check the error message. Common issues:
> - TypeScript errors → fix the flagged file
> - Missing env vars → verify `.env.local` has all `NEXT_PUBLIC_*` values
> - `next-pwa` error → run `npm install` again

### 7.3 — Get Hostinger SSH access

1. Log in to **hPanel** (hpanel.hostinger.com)
2. Go to **Hosting → Manage → SSH Access**
3. Enable SSH Access (toggle it on if off)
4. Note your:
   - **SSH Host:** e.g. `server123.hostinger.com` or an IP
   - **SSH Username:** e.g. `u123456789`
   - **SSH Port:** usually `65002` for shared Hostinger (not 22)
5. Upload your SSH public key (same one from Step 2.1):
   - Click "Manage SSH Keys" → "Add SSH Key"
   - Paste the content of `C:\Users\YourName\.ssh\id_ed25519.pub`

Test SSH access:
```powershell
ssh -p 65002 u123456789@server123.hostinger.com
# Should log in without password
exit
```

> **Note:** Hostinger shared hosting uses port `65002` for SSH, not port `22`.

### 7.4 — Find your public_html path

```powershell
ssh -p 65002 u123456789@server123.hostinger.com
pwd
# Usually: /home/u123456789
ls
# You'll see: public_html/ (this is where web files go)
exit
```

The path to your web root is: `/home/u123456789/public_html`

### 7.5 — Deploy frontend to Hostinger

From your local PowerShell or Git Bash:

```powershell
# Using rsync with Hostinger's custom SSH port (-p 65002)
rsync -avz --compress --delete `
  -e "ssh -p 65002" `
  X:\Project\PotuPartners\frontend\out\ `
  u123456789@server123.hostinger.com:/home/u123456789/public_html/
```

> **For Git Bash syntax** (no backtick line continuation):
> ```bash
> rsync -avz --compress --delete \
>   -e "ssh -p 65002" \
>   /x/Project/PotuPartners/frontend/out/ \
>   u123456789@server123.hostinger.com:/home/u123456789/public_html/
> ```

This uploads all static files. You'll see each file listed as it uploads. Takes 30–60 seconds.

### 7.6 — Configure Hostinger for SPA routing

Because this is a Next.js static export, all routes need to serve `index.html`. Create an `.htaccess` file:

```powershell
# SSH into Hostinger
ssh -p 65002 u123456789@server123.hostinger.com

# Create .htaccess file for SPA routing
cat > /home/u123456789/public_html/.htaccess << 'EOF'
Options -MultiViews
RewriteEngine On
RewriteBase /

# Serve existing files/directories directly
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Route all other requests to index.html
RewriteRule ^ index.html [L]

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
EOF

exit
```

### 7.7 — Verify frontend is live

Open your browser and visit: **https://potupartners.site**

You should see the PotuPartners landing page with:
- Hero section with letter-by-letter animation
- Navigation bar
- Gold accents on black background

---

## 8. Verify Everything Works

Run through this checklist top to bottom.

### 8.1 — Backend API

```powershell
# Health check
curl https://api.potupartners.site/health
# Expected: {"status":"ok","env":"production","uptime":...}

# Auth endpoint responds (should return 400 for empty body, not 500)
curl -X POST https://api.potupartners.site/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{}"
# Expected: {"success":false,"error":"Validation failed",...}
```

### 8.2 — Database connection

```bash
# SSH into server
ssh potupartners@165.245.185.246

# Check API logs for DB connection message
pm2 logs potupartners-api --lines 50 | grep -i "database\|postgres\|connected"
# Should see connection success on startup

# Verify tables exist:
# (replace with your actual DATABASE_URL)
psql "postgresql://doadmin:AVNS_xxx@your-db-host:25060/defaultdb?sslmode=require" \
  -c "\dt"
# Should list: users, refresh_tokens, conversations, messages, files, rag_documents, _migrations
```

### 8.3 — Admin login

1. Open **https://potupartners.site/admin**
2. Log in with:
   - Email: `admin@potupartners.site`
   - Password: the password you set in `ADMIN_PASSWORD` during Step 4.5
3. You should see the admin dashboard with tabs: Dashboard, Documents, Users, Chats

### 8.4 — Chat system

1. Open **https://potupartners.site**
2. Click the gold chat button (bottom-right)
3. Register a new client account
4. Select a partner from the contact list
5. Send a message — it should appear immediately
6. Test AI chatbot: select "AI Chatbot" from contact list, ask a question
   - Before uploading any documents, it will say it's unavailable — that's correct

### 8.5 — File upload test

1. In a chat conversation, click the paperclip icon
2. Upload a PDF or image
3. It should upload to DigitalOcean Spaces and display in the chat

### 8.6 — RAG service

```bash
# SSH into server
ssh potupartners@165.245.185.246

# Check RAG service health
curl http://127.0.0.1:8000/health
# Expected: {"status":"ok","collection_count":0}

pm2 logs potupartners-rag --lines 20
# Should show: "RAG service starting up", "ChromaDB ready"
```

To test RAG end-to-end:
1. Log into admin panel at `https://potupartners.site/admin`
2. Go to **Documents** tab
3. Upload a PDF (e.g. a law firm practice area document)
4. Wait ~30 seconds for indexing (status changes from "Pending" to "Indexed")
5. Go back to the main site → open AI Chatbot chat → ask a question related to the document

---

## 9. CI/CD: GitHub Actions Setup

This automates deployment — every push to `main` deploys automatically.

### 9.1 — Push project to GitHub

```powershell
cd X:\Project\PotuPartners

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit: PotuPartners full stack"

# Create a new repository at github.com, then:
git remote add origin https://github.com/your-username/potupartners.git
git push -u origin main
```

> The `.gitignore` already excludes all `.env` files and `node_modules`. Safe to push.

### 9.2 — Generate deploy SSH keys

You need **two separate deploy keys** — one for Hostinger, one for DigitalOcean.

```bash
# In Git Bash:

# Key for DigitalOcean
ssh-keygen -t ed25519 -C "github-actions-do" -f ~/.ssh/deploy_do -N ""

# Key for Hostinger
ssh-keygen -t ed25519 -C "github-actions-hostinger" -f ~/.ssh/deploy_hostinger -N ""
```

Add each public key to the respective server:

```bash
# Add DO key to DigitalOcean server:
ssh-copy-id -i ~/.ssh/deploy_do.pub potupartners@165.245.185.246
# OR manually:
cat ~/.ssh/deploy_do.pub | ssh potupartners@165.245.185.246 "cat >> ~/.ssh/authorized_keys"

# Add Hostinger key to Hostinger:
cat ~/.ssh/deploy_hostinger.pub
# Copy the output, then in hPanel → SSH Access → Add SSH Key, paste it
```

### 9.3 — Add secrets to GitHub

Go to your GitHub repo → **Settings → Secrets and Variables → Actions → New repository secret**

Add each of these:

| Secret Name | Value |
|---|---|
| `DO_SSH_PRIVATE_KEY` | Full content of `~/.ssh/deploy_do` (the private key) |
| `DO_HOST` | Your Droplet IP: `165.245.185.246` |
| `DO_USER` | `potupartners` |
| `HOSTINGER_SSH_PRIVATE_KEY` | Full content of `~/.ssh/deploy_hostinger` |
| `HOSTINGER_HOST` | Your Hostinger SSH host: `server123.hostinger.com` |
| `HOSTINGER_USER` | `u123456789` |
| `HOSTINGER_DOCUMENT_ROOT` | `/home/u123456789/public_html` |
| `NEXT_PUBLIC_API_URL` | `https://api.potupartners.site` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://api.potupartners.site` |
| `NEXT_PUBLIC_APP_URL` | `https://potupartners.site` |
| `NEXT_PUBLIC_CDN_URL` | `https://potupartners-files.sgp1.cdn.digitaloceanspaces.com` |

> To copy the private key content in Git Bash:
> ```bash
> cat ~/.ssh/deploy_do
> # Select all output and copy it — including the -----BEGIN----- and -----END----- lines
> ```

### 9.4 — Update GitHub Actions for Hostinger SSH port

Hostinger uses port 65002 for SSH, not 22. Update the frontend workflow:

Open `.github/workflows/deploy-frontend.yml` and find the rsync step. Replace:
```yaml
-e "ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no"
```
With:
```yaml
-e "ssh -i ~/.ssh/id_ed25519 -p 65002 -o StrictHostKeyChecking=no"
```

Commit and push this change.

### 9.5 — Test CI/CD

Make a small change (e.g. edit a comment in `frontend/src/app/page.tsx`), commit, and push to `main`:

```powershell
git add .
git commit -m "Test CI/CD pipeline"
git push
```

Go to your GitHub repo → **Actions** tab. You should see two workflows running:
- `Deploy Frontend → Hostinger` 
- `Deploy Backend → DigitalOcean`

Both should complete with green checkmarks in ~5 minutes.

---

## 10. Ongoing Maintenance

### Restart services after server reboot

```bash
ssh potupartners@165.245.185.246
pm2 resurrect      # Restores saved PM2 state
pm2 status         # Verify both services running
```

### View real-time logs

```bash
ssh potupartners@165.245.185.246
pm2 logs                          # All logs
pm2 logs potupartners-api         # API only
pm2 logs potupartners-rag         # RAG only
pm2 logs --lines 100              # Last 100 lines
```

### Restart a service manually

```bash
pm2 restart potupartners-api
pm2 restart potupartners-rag
pm2 restart all
```

### Re-deploy backend manually (without CI/CD)

```powershell
# From your Windows machine (Git Bash):
cd /x/Project/PotuPartners

rsync -avz --compress --delete \
  --exclude='node_modules/' --exclude='dist/' --exclude='.env' \
  backend/ potupartners@165.245.185.246:/opt/potupartners/backend/

ssh potupartners@165.245.185.246 "
  cd /opt/potupartners/backend &&
  npm install &&
  npm run build &&
  npm run migrate &&
  pm2 reload potupartners-api --update-env
"
```

### Re-deploy frontend manually

```powershell
cd X:\Project\PotuPartners\frontend
npm run build

rsync -avz --compress --delete `
  -e "ssh -p 65002" `
  out/ `
  u123456789@server123.hostinger.com:/home/u123456789/public_html/
```

### Add a new knowledge base document

1. Log into admin panel: `https://potupartners.site/admin`
2. Go to **Documents** tab
3. Upload PDF/DOCX
4. Wait for status to change to "Indexed" (30–120 seconds depending on document size)
5. AI chatbot immediately uses new knowledge

### Monitor server health

```bash
ssh potupartners@165.245.185.246

# CPU and memory
htop

# Disk space
df -h

# PM2 process monitor (live dashboard)
pm2 monit

# Check nginx error log
tail -f /var/log/nginx/potupartners-error.log

# Check UFW blocked IPs (fail2ban)
sudo fail2ban-client status sshd
```

### Update SSL certificate manually (auto-renews, but for reference)

```bash
ssh root@165.245.185.246
certbot renew
systemctl reload nginx
```

---

## Troubleshooting

### "502 Bad Gateway" from Nginx
The backend isn't running. SSH in and check:
```bash
pm2 status
pm2 logs potupartners-api --lines 50
# Start it if stopped:
pm2 start potupartners-api
```

### "CORS error" in browser console
The `CORS_ORIGIN` in `backend/.env` doesn't exactly match your frontend domain. Check:
- No trailing slash: `https://potupartners.site` ✅ not `https://potupartners.site/`
- Correct protocol: `https://` not `http://`
- After fixing, run: `pm2 restart potupartners-api`

### "WebSocket connection failed" in chat
Check that the Socket.io path is proxied in Nginx. SSH to server:
```bash
nginx -t && systemctl reload nginx
```
Also verify `NEXT_PUBLIC_SOCKET_URL` in frontend `.env.local` matches your API domain.

### Database connection refused
The Managed Database Trusted Sources needs your Droplet IP. Go to DO → Databases → your DB → Settings → Trusted Sources → add Droplet IP.

### RAG service not responding
```bash
pm2 logs potupartners-rag --lines 50
# Common causes:
# - OPENAI_API_KEY not set or invalid
# - Not enough memory (upgrade to 4GB droplet)
pm2 restart potupartners-rag
```

### Frontend build fails locally
```powershell
# Clear cache and rebuild:
cd X:\Project\PotuPartners\frontend
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
npm install
npm run build
```