// Kurasi copy proyek (D1/D2). Deskripsi mentah GitHub tidak pernah dirender ke UI:
// deskripsi bisa berubah dan beberapa di antaranya memuat klaim tanpa bukti.
//
// Aturan:
// - `summary` hanya memuat fakta yang dapat dibuktikan dari source, test, CI, atau release.
// - `evidence` adalah catatan verifikasi internal (tidak dirender di UI).
// - Data dinamis (url, language) tetap berasal dari src/data/public-repos.json.
// - DILARANG menyalin angka pemasaran tanpa metodologi, misalnya
//   "millions of messages per second" (kafka-ws-bridge) dan "10+ nodes"
//   (opc-load-simulator-python). Keduanya tidak punya benchmark publik.

import type { Locale } from '../i18n/config';

export interface CuratedProject {
  repoName: string;
  featured: boolean;
  caseStudySlug?: string;
  /** Diagram alir beranimasi. Maksimal satu proyek, lihat DESIGN.md MOTION 2. */
  showFlow?: boolean;
  summary: Record<Locale, string>;
  evidence: string[];
}

export const CURATED_PROJECTS: CuratedProject[] = [
  {
    repoName: 'pocketkafka',
    featured: true,
    caseStudySlug: 'pocketkafka',
    showFlow: true,
    summary: {
      en: 'A Kafka-compatible event broker written from scratch in Go. Wire protocol, consumer-group coordination, log compaction, tiered storage, a schema registry, and REST plus MQTT gateways all ship in one static binary with no third-party dependencies.',
      id: 'Broker event streaming kompatibel Kafka yang ditulis dari nol dengan Go. Protokol wire, koordinasi consumer group, log compaction, tiered storage, schema registry, serta gateway REST dan MQTT semuanya ada dalam satu binary statis tanpa dependency pihak ketiga.',
    },
    evidence: [
      'go.mod contains only the module line and `go 1.26`: zero third-party requires',
      '15 _test.go files: pkg/protocol, pkg/client, internal/storage (partition, compaction, idempotence, tiered), internal/server (sasl, scram), internal/gateway (rest, mqtt), internal/web, internal/e2e',
      'CI (.github/workflows/ci.yml) runs go build ./..., go vet ./..., go test ./... on push/PR; recent runs on master are green',
      'Entrypoints cmd/server, cmd/kctl, cmd/client-example; deploy/grafana/dashboard.json present',
      'No published releases, so no version or release claim is made',
    ],
  },
  {
    repoName: 'industrial-iot-dashboard',
    featured: false,
    caseStudySlug: 'industrial-iot-dashboard',
    summary: {
      en: 'The presentation layer of an OPC UA to Kafka to WebSocket pipeline. It renders 3-phase voltage, current and power analytics, a digital I/O and breaker state panel, and a threshold alarm log, driven either by live WebSocket telemetry or a built-in mock simulator.',
      id: 'Lapisan presentasi dari pipeline OPC UA ke Kafka ke WebSocket. Menampilkan analitik tegangan, arus, dan daya 3 fasa, panel status digital I/O dan breaker, serta log alarm ambang batas, dengan sumber telemetri WebSocket langsung atau simulator mock bawaan.',
    },
    evidence: [
      'Live/mock duality implemented in src/hooks/useWebSocket.ts and src/hooks/useMockData.ts',
      'Components: src/components/dashboard/{KPICards,PowerChart,DigitalIOPanel,AlarmTable}.tsx',
      'src/types/index.ts defines the shared WsEnvelope, SensorData, DigitalIOStatus and AlarmEvent contracts',
      'Build script is `tsc -b && vite build`; stack React 19.2 + Vite 7.3 + Tailwind 3.4 + Recharts 3.8',
      'No test files; validation is type-check plus eslint. Prototype leftovers (src/main.ts, src/counter.ts, src/style.css) and package.json name "temp-app" are not mentioned in UI copy',
    ],
  },
  {
    repoName: 'digital-gateway-notifier',
    featured: false,
    caseStudySlug: 'digital-gateway-notifier',
    summary: {
      en: 'A Kafka alarm consumer that fans notifications out to Telegram and WhatsApp. A FastAPI backend handles JWT-authenticated user management, a React dashboard edits recipients and channel preferences, and PostgreSQL stores them, with an audit trail published back to Kafka.',
      id: 'Consumer alarm Kafka yang menyebarkan notifikasi ke Telegram dan WhatsApp. Backend FastAPI menangani manajemen pengguna ber-auth JWT, dashboard React mengelola penerima dan preferensi kanal, PostgreSQL menyimpannya, dan jejak audit dikirim kembali ke Kafka.',
    },
    evidence: [
      'Consumer in apps/worker/main.py; helpers in libs/kafka_client/{kafka_manager,kafka_consume_backup}.py',
      'Channels: libs/notifiers/telegram.py and libs/notifiers/whatsapp.py (WAHA HTTP API)',
      'Auth: apps/backend/auth.py with python-jose, bcrypt and passlib pinned in requirements.txt',
      'Topics referenced: ALARM_EVENTS inbound, NOTIFICATION_LOGS for the audit trail',
      'Docs drift is real: README cites backend_api/, frontend-dashboard/, bot/ and notifiers/, but the code lives in apps/* and libs/*',
      'Only test artifact is the Create React App default apps/frontend/src/App.test.js; no Python test suite and no CI workflow',
    ],
  },
  {
    repoName: 'kafka-ws-bridge',
    featured: false,
    summary: {
      en: 'A FastAPI service that bridges Kafka topics to WebSocket clients with topic-based routing. Connected clients subscribe per topic, an HTTP endpoint publishes back to Kafka, and health and metrics endpoints expose the service state.',
      id: 'Layanan FastAPI yang menjembatani topik Kafka ke klien WebSocket dengan routing per topik. Klien yang terhubung berlangganan per topik, ada endpoint HTTP untuk publish balik ke Kafka, dan endpoint health serta metrics untuk memantau layanan.',
    },
    evidence: [
      'README documents the Kafka topic to WebSocket broadcast flow for subscribed clients',
      'HTTP publish path back to Kafka plus /health and /metrics endpoints',
      'Stack: FastAPI + confluent-kafka, Dockerfile and docker-compose.yml',
      'REMOVED CLAIM: the repo description says "designed to handle millions of messages per second"; no benchmark or methodology is published, so it is excluded from UI copy',
    ],
  },
  {
    repoName: 'opc-load-simulator-python',
    featured: false,
    summary: {
      en: 'An OPC UA server simulator built on Node-OPCUA for exercising clients, SCADA systems and gateways without physical hardware. Address space and node behaviour come from JSON config, it generates sine, cosine and random sensor values, and it ships with Docker Compose and a Kubernetes manifest.',
      id: 'Simulator server OPC UA berbasis Node-OPCUA untuk menguji klien, sistem SCADA, dan gateway tanpa perangkat fisik. Address space dan perilaku node diatur lewat konfigurasi JSON, nilainya dibangkitkan sebagai sinus, kosinus, dan acak, serta tersedia Docker Compose dan manifest Kubernetes.',
    },
    evidence: [
      'src/services/OpcUaServer.js, src/services/DataStore.js, src/sensor-data.js, src/config/config.js',
      'src/services/WebServer.js plus src/public/index.html serve a small web interface',
      'Packaging: Dockerfile, docker-compose.yml, kubernetes/deployment.yaml, CI workflow present',
      'Runtime is Node/JavaScript even though the repo name says "python"; the card shows the API-reported language',
      'REMOVED CLAIM: the repo description says "10+ nodes"; no benchmark or methodology is published, so it is excluded from UI copy',
    ],
  },
  {
    repoName: 'pi-codego',
    featured: false,
    summary: {
      en: 'A native Go rewrite of a coding-agent CLI: no Node or Bun runtime, an interactive Bubbletea TUI plus print and headless RPC modes, multi-provider LLM clients, native tool execution with context cancellation, and JSONL session trees.',
      id: 'Rewrite native Go dari CLI coding agent: tanpa runtime Node atau Bun, ada TUI Bubbletea interaktif plus mode print dan RPC headless, klien LLM multi-provider, eksekusi tool native dengan pembatalan context, dan session tree JSONL.',
    },
    evidence: [
      'pkg/agent/{engine,steering}.go, pkg/context/{skills,prompts,agents_md}.go, pkg/mcp/{client,config,tool}.go',
      'Provider clients under pkg/provider (Anthropic, Gemini, factory)',
      'Tests colocated: commands_test.go, engine_test.go, steering_test.go, prompts_test.go, skills_test.go, factory_test.go',
      'CI and release workflows present (.github/workflows/ci.yml, release.yml)',
      'Unverified README figures (~15-30 MB RAM, <80 ms startup, ~21 MB binary) are excluded from UI copy',
    ],
  },
];

export function curatedFor(repoName: string): CuratedProject | undefined {
  return CURATED_PROJECTS.find((p) => p.repoName === repoName);
}
