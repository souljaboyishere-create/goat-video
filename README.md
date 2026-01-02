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

See `PLAN.md` for complete architecture and execution plan.

## Tech Stack

- **Frontend**: Next.js 14+, React 18+, TypeScript, Tailwind CSS
- **Backend**: Fastify, Node.js 20+, TypeScript, Prisma, PostgreSQL
- **Workers**: Python 3.10-3.11, FastAPI, Coqui TTS, FFmpeg
- **Queue**: BullMQ (Redis)
- **Storage**: S3-compatible

## Development

Coming soon - see PLAN.md for execution checklist.

