# Complete Folder Structure

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
│   ├── video-downloader/
│   │   ├── src/
│   │   │   ├── main.py
│   │   │   ├── downloader.py
│   │   │   └── utils.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── video-editor/
│   │   ├── src/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── face-transformer/
│   │   ├── src/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── voice-cloner/           # Uses Coqui TTS
│   │   ├── src/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── lip-sync/
│   │   ├── src/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── subtitle-generator/
│   │   ├── src/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── background-replacer/
│   │   ├── src/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   └── video-renderer/
│       ├── src/
│       ├── requirements.txt
│       └── Dockerfile
│
├── shared/
│   ├── types/                  # Shared TypeScript types
│   └── config/                 # Shared configs
│
├── packages/
│   └── tts-wrapper/            # Python wrapper for Coqui TTS
│       ├── src/
│       │   └── tts_service.py
│       └── requirements.txt
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.web
│   │   └── docker-compose.yml
│   ├── k8s/                    # Kubernetes configs
│   └── scripts/                # Deployment scripts
│
├── .github/
│   └── workflows/              # CI/CD
│
├── PLAN.md                     # Complete architecture plan
├── README.md
├── package.json                # Root package.json (workspaces)
├── pnpm-workspace.yaml         # pnpm workspaces config
├── docker-compose.yml          # Local development
└── .env.example
```

