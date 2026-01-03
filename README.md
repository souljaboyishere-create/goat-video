# AI Video Creation Platform

Complete AI-powered video and audio creation platform with modular pipeline.

## Project Structure

```
video-ai-platform/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # Next.js app router
│   │   │   ├── components/     # React components
│   │   │   ├── lib/            # Utilities
│   │   │   └── types/          # TypeScript types
│   │   ├── public/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── api/                    # Node.js/Fastify backend
│       ├── src/
│       │   ├── routes/         # API routes
│       │   ├── services/       # Business logic
│       │   ├── models/         # Data models
│       │   ├── middleware/     # Auth, validation
│       │   └── utils/
│       ├── prisma/             # Database schema
│       ├── package.json
│       └── tsconfig.json
│
├── workers/
│   ├── video-downloader/       # yt-dlp video downloader
│   ├── video-editor/           # FFmpeg video editing
│   ├── face-transformer/       # Face transformation (InsightFace → Stable Diffusion)
│   ├── voice-cloner/           # Coqui TTS voice cloning
│   ├── lip-sync/               # Wav2Lip lip-sync
│   ├── subtitle-generator/     # Whisper subtitle generation
│   ├── background-replacer/   # Background replacement
│   └── video-renderer/         # Final video rendering
│
├── shared/
│   ├── types/                  # Shared TypeScript types
│   └── config/                 # Shared configs
│
├── packages/
│   └── tts-wrapper/            # Coqui TTS wrapper
│
├── infrastructure/
│   ├── docker/                 # Dockerfiles
│   ├── k8s/                    # Kubernetes configs
│   └── scripts/                # Deployment scripts
│
├── scripts/                     # Cross-platform scripts
│   ├── check-services.ps1      # Windows service check
│   ├── check-services.sh       # Unix service check
│   ├── start-infrastructure.ps1 # Windows infrastructure start
│   ├── start-infrastructure.sh  # Unix infrastructure start
│   ├── test-e2e.ps1            # Windows E2E test
│   ├── test-e2e.sh             # Unix E2E test
│   └── start-dev.ps1           # Windows dev servers
│
├── .github/
│   └── workflows/              # CI/CD
│
├── PLAN.md                     # Complete architecture plan
├── package.json                # Root package.json (workspaces)
├── pnpm-workspace.yaml         # pnpm workspaces config
├── docker-compose.yml          # Local development
└── .env.example
```

## Quick Start

See `QUICK_START.md` for detailed setup instructions.

**Cross-Platform Support:**
- **Windows**: Use PowerShell scripts (`.ps1` files)
- **macOS/Linux**: Use Bash scripts (`.sh` files)

### Quick Commands

**Start Development Servers:**

Windows:
```powershell
.\scripts\start-dev.ps1
```

macOS/Linux:
```bash
./scripts/start-dev.sh
```

Or manually:
```bash
# Terminal 1: API
cd "apps 2/api"
pnpm dev

# Terminal 2: Web
cd "apps 2/web"
pnpm dev
```

**Start Infrastructure (Docker):**

Windows:
```powershell
.\scripts\start-infrastructure.ps1
```

macOS/Linux:
```bash
./scripts/start-infrastructure.sh
```

**Check Service Health:**

Windows:
```powershell
.\scripts\check-services.ps1
```

macOS/Linux:
```bash
./scripts/check-services.sh
```

## Tech Stack

- **Frontend**: Next.js 14+, React 18+, TypeScript, Tailwind CSS
- **Backend**: Fastify, Node.js 20+, TypeScript, Prisma, PostgreSQL
- **Workers**: Python 3.10-3.11, FastAPI, Coqui TTS, FFmpeg
- **Queue**: BullMQ (Redis)
- **Storage**: S3-compatible (MinIO for local dev)

## Development

### Prerequisites

- Node.js 20+
- pnpm (install with `npm install -g pnpm`)
- Python 3.11+ (for workers)
- Docker (optional, for infrastructure services)

### Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start infrastructure:**
   - Use Docker: `docker-compose up -d`
   - Or use local services (see `QUICK_START.md`)

3. **Setup backend:**
   ```bash
   cd "apps 2/api"
   pnpm install
   pnpm prisma:generate
   pnpm prisma:migrate dev
   ```

4. **Setup frontend:**
   ```bash
   cd "apps 2/web"
   pnpm install
   ```

5. **Start development servers:**
   - Use the cross-platform scripts (see Quick Commands above)
   - Or start manually in separate terminals

## Project Notes

- The workspace folder is named `apps 2` (with a space) - this is intentional
- All scripts are available in both PowerShell (`.ps1`) and Bash (`.sh`) versions
- Documentation uses relative paths for cross-platform compatibility

## Documentation

- `QUICK_START.md` - Fast setup guide
- `PLAN.md` - Complete architecture plan
- `TESTING_GUIDE.md` - Comprehensive testing instructions
