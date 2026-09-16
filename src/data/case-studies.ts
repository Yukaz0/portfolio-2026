// Isi case study (D3/D4). Setiap kalimat harus dapat dilacak ke salah satu sumber:
// source code publik, README publik, output test/build, atau release.
//
// Klaim yang DIHAPUS karena tidak punya bukti atau metodologi:
// - pocketkafka: listener TLS :9093 (tidak ada di config/config.yaml, hanya di tabel README),
//   "< 60 MB idle RAM", "< 29 MB Docker image".
// - kafka-ws-bridge: "millions of messages per second".
// - opc-load-simulator-python: "10+ nodes".
// - digital-gateway-notifier: "enterprise-grade", "high reliability".
// - pi-codego: "~15-30 MB RAM", "< 80 ms startup".
//
// Catatan audit lengkap: .hermes/data/case-study-evidence.md (gitignored).

import type { Locale } from '../i18n/config';

export interface CaseStudyContent {
  title: string;
  summary: string;
  role: string;
  problem: string[];
  constraints: string[];
  architecture: string[];
  decisions: string[];
  verification: string[];
  results: string[];
}

export interface CaseStudy {
  slug: string;
  repoName: string;
  stack: string[];
  sourceUrl: string;
  demoUrl?: string;
  flow: string[];
  content: Record<Locale, CaseStudyContent>;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'pocketkafka',
    repoName: 'pocketkafka',
    stack: ['Go 1.26', 'Kafka wire protocol', 'MQTT 3.1.1', 'Prometheus', 'Docker'],
    sourceUrl: 'https://github.com/Yukaz0/pocketkafka',
    flow: [
      'Producer',
      'Broker :9092',
      'Partitioned log',
      'Group coordinator',
      'Consumer',
    ],
    content: {
      en: {
        title: 'PocketKafka: a Kafka-compatible broker in one dependency-free Go binary',
        summary: 'An event-streaming broker implemented from the wire protocol up, packaged as a single static binary that also embeds a web UI, a schema registry, and REST and MQTT gateways.',
        role: 'Solo project. Protocol implementation, storage engine, gateways, CLI, and the test suite.',
        problem: [
          'Standing up Kafka for a small industrial integration means operating a JVM broker plus a separate schema registry, a REST proxy, and an MQTT bridge for sensor telemetry.',
          'Every extra component adds memory, image size, and one more service to monitor, which hurts most on constrained or edge hosts.',
        ],
        constraints: [
          'No third-party Go modules. Everything from protocol encoding to the storage engine is written against the standard library, so the dependency graph stays empty.',
          'Existing Kafka clients had to keep working, which rules out inventing a new protocol and forces conformance to the Kafka wire format.',
          'A single static binary is the deployment unit, so the web UI assets are embedded rather than served from a sidecar.',
        ],
        architecture: [
          'The broker listens on 9092 for the Kafka wire protocol, with an internal listener on 29092 for container-to-container traffic.',
          'Three sidecars run inside the same process: an embedded web UI on 8080, a Confluent-compatible schema registry on 8081, and an HTTP REST proxy on 8082.',
          'An MQTT 3.1.1 bridge on 1883 accepts IoT telemetry and lands it on Kafka topics, and its traffic is exposed in the same web UI live tail as the Kafka messages.',
          'Storage, consumer-group coordination, and the schema registry are separate internal packages (internal/storage, internal/coordinator, internal/schemaregistry) rather than one shared blob.',
          'Prometheus metrics and Kubernetes-style health probes are served from the web listener.',
        ],
        decisions: [
          'A purpose-built log storage engine was written instead of embedding an existing library, because a zero-dependency build was the point of the project.',
          'Retention, log compaction, idempotence, and tiered storage each got a dedicated implementation and its own test file, so the guarantees are pinned by tests rather than asserted in prose.',
          'Tiered storage offloads cold segments to an S3 or MinIO endpoint and ships disabled by default, so the default deployment stays self-contained.',
          'Consumer-group session, rebalance, and heartbeat timeouts are configuration rather than constants, and offsets can be kept in memory or on disk.',
          'The admin CLI (cmd/kctl) supports JSON output so topic and consumer-group operations can be scripted in CI.',
        ],
        verification: [
          'Fifteen Go test files cover protocol encoding and compression, record batches, partition behaviour, log compaction, idempotence, tiered storage, SASL and SCRAM, the REST and MQTT gateways, and web auth.',
          'End-to-end coverage lives in internal/e2e as separate basic and feature suites.',
          'CI runs go build ./..., go vet ./... and go test ./... on every push and pull request, and recent runs on the master branch are green.',
        ],
        results: [
          'The build is genuinely dependency-free: go.mod declares only the module path and the Go version.',
          'The implemented surface is currently green under vet and the full test suite.',
          'What is not claimed: no throughput, latency, memory, or image-size measurement is published, so none appears here. The README also documents a TLS listener that has no counterpart in the sample configuration, and that claim is left out too.',
        ],
      },
      id: {
        title: 'PocketKafka: broker kompatibel Kafka dalam satu binary Go tanpa dependency',
        summary: 'Broker event streaming yang diimplementasikan mulai dari protokol wire, dikemas sebagai satu binary statis yang juga membawa web UI, schema registry, serta gateway REST dan MQTT.',
        role: 'Proyek solo. Implementasi protokol, storage engine, gateway, CLI, dan test suite.',
        problem: [
          'Menjalankan Kafka untuk integrasi industri berskala kecil berarti mengoperasikan broker JVM plus schema registry terpisah, REST proxy, dan MQTT bridge untuk telemetri sensor.',
          'Setiap komponen tambahan menambah memori, ukuran image, dan satu lagi layanan yang harus dimonitor. Ini paling terasa di host edge yang terbatas.',
        ],
        constraints: [
          'Tanpa modul Go pihak ketiga. Dari encoding protokol sampai storage engine ditulis dengan standard library, sehingga dependency graph tetap kosong.',
          'Klien Kafka yang sudah ada harus tetap bekerja. Ini menghilangkan opsi membuat protokol baru dan memaksa implementasi mengikuti format wire Kafka.',
          'Satu binary statis adalah unit deployment, jadi aset web UI di-embed dan tidak dilayani dari container terpisah.',
        ],
        architecture: [
          'Broker mendengarkan port 9092 untuk protokol wire Kafka, dengan listener internal di 29092 untuk lalu lintas antar container.',
          'Tiga layanan berjalan di dalam proses yang sama: web UI di 8080, schema registry kompatibel Confluent di 8081, dan HTTP REST proxy di 8082.',
          'MQTT bridge 3.1.1 di 1883 menerima telemetri IoT dan menaruhnya ke topik Kafka. Lalu lintasnya tampil di live tail web UI yang sama dengan pesan Kafka.',
          'Storage, koordinasi consumer group, dan schema registry adalah paket internal terpisah (internal/storage, internal/coordinator, internal/schemaregistry), bukan satu blok gabungan.',
          'Metrics Prometheus dan health probe bergaya Kubernetes dilayani dari listener web.',
        ],
        decisions: [
          'Storage engine log ditulis khusus alih-alih memakai library yang sudah ada, karena build tanpa dependency memang tujuan proyeknya.',
          'Retention, log compaction, idempotence, dan tiered storage masing-masing punya implementasi dan file test sendiri, sehingga jaminannya dipatok oleh test, bukan diklaim di dokumentasi.',
          'Tiered storage memindahkan segmen dingin ke endpoint S3 atau MinIO dan mati secara default, sehingga deployment bawaan tetap mandiri.',
          'Timeout session, rebalance, dan heartbeat consumer group menjadi konfigurasi, bukan konstanta, dan offset bisa disimpan di memori atau di disk.',
          'CLI admin (cmd/kctl) mendukung output JSON sehingga operasi topik dan consumer group bisa diskrip di CI.',
        ],
        verification: [
          'Lima belas file test Go mencakup encoding protokol dan kompresi, record batch, perilaku partisi, log compaction, idempotence, tiered storage, SASL dan SCRAM, gateway REST dan MQTT, serta auth web.',
          'Cakupan end-to-end ada di internal/e2e sebagai suite dasar dan suite fitur.',
          'CI menjalankan go build ./..., go vet ./... dan go test ./... pada setiap push dan pull request, dan run terakhir di branch master hijau.',
        ],
        results: [
          'Build-nya benar-benar tanpa dependency: go.mod hanya mendeklarasikan path module dan versi Go.',
          'Permukaan yang sudah diimplementasikan saat ini hijau di bawah vet dan seluruh test suite.',
          'Yang tidak diklaim: tidak ada pengukuran throughput, latensi, memori, atau ukuran image yang dipublikasikan, jadi tidak ada yang dicantumkan di sini. README juga mendokumentasikan listener TLS yang tidak punya padanan di contoh konfigurasi, dan klaim itu ikut dihilangkan.',
        ],
      },
    },
  },
  {
    slug: 'industrial-iot-dashboard',
    repoName: 'industrial-iot-dashboard',
    stack: ['React 19', 'TypeScript', 'Vite 7', 'TailwindCSS 3', 'Recharts 3'],
    sourceUrl: 'https://github.com/Yukaz0/industrial-iot-dashboard',
    flow: [
      'OPC UA simulator',
      'Kafka: sensor-data',
      'kafka-ws-bridge',
      'WebSocket /ws',
      'Dashboard',
    ],
    content: {
      en: {
        title: 'Industrial IoT dashboard: OPC UA to Kafka to WebSocket, rendered live',
        summary: 'The presentation layer of an industrial telemetry pipeline, rendering 3-phase power analytics, breaker and digital I/O state, and a threshold alarm log from either a live WebSocket stream or a built-in simulator.',
        role: 'Solo project. Frontend architecture, WebSocket client, data transformation layer, and the offline simulator.',
        problem: [
          'Industrial telemetry is only useful when an operator can see it: 3-phase voltage, current and power, breaker and protection state, and which thresholds were crossed.',
          'Building that view normally requires access to a live plant, or a replay of plant data, before any interface work can start.',
        ],
        constraints: [
          'The dashboard is the last stage of a three-part pipeline, so its message contract is dictated by the upstream bridge rather than chosen freely.',
          'It has to be demonstrable with no backend at all, otherwise the interface cannot be reviewed or shown on its own.',
          'The live transport is a WebSocket carrying a continuous stream, so the client must handle connection loss, subscription, and constant re-rendering.',
          'Incoming payloads are flat maps of OPC tag names, not tidy nested objects, so a transformation layer is mandatory.',
        ],
        architecture: [
          'Edge: the OPC UA simulator publishes sensor values to the sensor-data Kafka topic.',
          'Transport: kafka-ws-bridge subscribes to that topic and broadcasts each message to subscribed WebSocket clients under /ws/sensor-data.',
          'Presentation: this app connects to ws://localhost:8000/ws with the sensor-data topic and renders the payloads it receives.',
          'A single header toggle switches the entire component tree between the live WebSocket source and the built-in simulator.',
          'The transformation layer decodes flat OPC tags such as OPC_PM_AMC_ACREL:UA_V, IA and PA into typed 3-phase readings, and tags such as OPC_BoardIO:CLS_F5_M3_DI_1 into digital I/O and protection state.',
        ],
        decisions: [
          'The wire contract is typed in one place as WsEnvelope, WsClientCommand, SensorData, DigitalIOStatus and AlarmEvent, so both the live and simulated sources produce identical shapes and no component has to branch on where the data came from.',
          'Messages are filtered on the envelope event name, so connection bookkeeping frames and data frames share one socket without leaking into the UI.',
          'Blob and text frames are both handled, because the bridge may deliver payloads either way.',
          'The client auto-reconnects after a short delay instead of surfacing a dead socket, since a monitoring screen is expected to recover by itself.',
          'The simulator is a first-class mode rather than a fixture file, because it doubles as the standalone demo.',
        ],
        verification: [
          'The production build runs the TypeScript compiler before Vite, so a type error fails the build rather than shipping.',
          'Honest gap: there are no automated tests. The only automated checks are the type-check and lint, and no CI workflow runs them on push.',
          'The simulation itself is the practical verification: mock mode exercises the same transformation and rendering path as live mode.',
          'An error path in the transformation layer is guarded because the payload shape from the simulator was still evolving during development, which is documented in the code.',
        ],
        results: [
          'A working dashboard covering 3-phase power analytics, digital I/O with protection trips, and a threshold alarm log.',
          'Runs standalone through mock mode, and against the real pipeline through the WebSocket mode.',
          'What is not claimed: no measured latency, message rate, or scale figure, because none is published. The repository also still carries prototype leftovers and the package name temp-app, which is not presented here as finished product quality.',
        ],
      },
      id: {
        title: 'Dashboard Industrial IoT: OPC UA ke Kafka ke WebSocket, dirender langsung',
        summary: 'Lapisan presentasi dari pipeline telemetri industri, menampilkan analitik daya 3 fasa, status breaker dan digital I/O, serta log alarm ambang batas dari stream WebSocket langsung atau simulator bawaan.',
        role: 'Proyek solo. Arsitektur frontend, klien WebSocket, lapisan transformasi data, dan simulator offline.',
        problem: [
          'Telemetri industri hanya berguna kalau operator bisa melihatnya: tegangan, arus, dan daya 3 fasa, status breaker dan proteksi, serta ambang batas mana yang terlampaui.',
          'Membangun tampilan itu biasanya butuh akses ke plant yang hidup, atau rekaman data plant, sebelum pekerjaan antarmuka bisa dimulai.',
        ],
        constraints: [
          'Dashboard ini adalah tahap terakhir dari pipeline tiga bagian, jadi kontrak pesannya ditentukan oleh bridge di hulu, bukan dipilih bebas.',
          'Harus bisa didemokan tanpa backend sama sekali, kalau tidak antarmukanya tidak bisa direview atau ditunjukkan sendiri.',
          'Transport live-nya adalah WebSocket yang membawa stream terus-menerus, jadi klien harus menangani koneksi putus, langganan topik, dan render ulang yang konstan.',
          'Payload yang masuk berupa map datar berisi nama tag OPC, bukan objek bersarang yang rapi, sehingga lapisan transformasi wajib ada.',
        ],
        architecture: [
          'Edge: simulator OPC UA mempublikasikan nilai sensor ke topik Kafka sensor-data.',
          'Transport: kafka-ws-bridge berlangganan topik itu dan menyiarkan setiap pesan ke klien WebSocket yang berlangganan di /ws/sensor-data.',
          'Presentasi: aplikasi ini terhubung ke ws://localhost:8000/ws dengan topik sensor-data, lalu merender payload yang diterimanya.',
          'Satu toggle di header mengganti seluruh pohon komponen antara sumber WebSocket langsung dan simulator bawaan.',
          'Lapisan transformasi mendekode tag OPC datar seperti OPC_PM_AMC_ACREL:UA_V, IA, dan PA menjadi bacaan 3 fasa bertipe, serta tag seperti OPC_BoardIO:CLS_F5_M3_DI_1 menjadi status digital I/O dan proteksi.',
        ],
        decisions: [
          'Kontrak wire-nya diberi tipe di satu tempat sebagai WsEnvelope, WsClientCommand, SensorData, DigitalIOStatus, dan AlarmEvent, sehingga sumber live maupun simulasi menghasilkan bentuk yang identik dan tidak ada komponen yang perlu bercabang berdasarkan asal data.',
          'Pesan difilter berdasarkan nama event pada envelope, sehingga frame pembuka koneksi dan frame data berbagi satu socket tanpa bocor ke UI.',
          'Frame tipe Blob dan teks dua-duanya ditangani, karena bridge bisa mengirim payload dengan salah satu dari keduanya.',
          'Klien melakukan reconnect otomatis setelah jeda singkat alih-alih menampilkan socket mati, karena layar monitoring seharusnya pulih sendiri.',
          'Simulator dijadikan mode kelas satu, bukan file fixture, karena sekaligus berfungsi sebagai demo mandiri.',
        ],
        verification: [
          'Build produksi menjalankan compiler TypeScript sebelum Vite, sehingga error tipe menggagalkan build alih-alih ikut terkirim.',
          'Kesenjangan yang diakui: tidak ada test otomatis. Pemeriksaan otomatisnya hanya type-check dan lint, dan tidak ada workflow CI yang menjalankannya saat push.',
          'Simulasinya sendiri adalah verifikasi praktis: mode mock melewati jalur transformasi dan rendering yang sama dengan mode live.',
          'Ada jalur error di lapisan transformasi yang dijaga karena bentuk payload dari simulator masih berkembang saat pengembangan, dan ini terdokumentasi di kodenya.',
        ],
        results: [
          'Dashboard yang berfungsi, mencakup analitik daya 3 fasa, digital I/O dengan trip proteksi, dan log alarm ambang batas.',
          'Berjalan mandiri lewat mode mock, dan berjalan terhadap pipeline nyata lewat mode WebSocket.',
          'Yang tidak diklaim: tidak ada angka latensi, laju pesan, atau skala yang terukur, karena tidak ada yang dipublikasikan. Repositorinya juga masih membawa sisa prototipe dan nama package temp-app, dan itu tidak dipresentasikan di sini sebagai kualitas produk jadi.',
        ],
      },
    },
  },
  {
    slug: 'digital-gateway-notifier',
    repoName: 'digital-gateway-notifier',
    stack: ['Python', 'FastAPI', 'confluent-kafka', 'PostgreSQL', 'React', 'Docker Compose'],
    sourceUrl: 'https://github.com/Yukaz0/digital-gateway-notifier',
    flow: [
      'Kafka: alarm topic',
      'Worker consumer',
      'Route by priority',
      'Telegram + WhatsApp',
      'Kafka: notification logs',
    ],
    content: {
      en: {
        title: 'Notification gateway: turning Kafka alarms into WhatsApp and Telegram messages',
        summary: 'A service that consumes alarm events from Kafka and delivers them to the people who actually act on them, with recipient management, per-user channel preferences, and an audit trail written back to Kafka.',
        role: 'Solo project. Kafka consumer, channel integrations, backend API, dashboard, and container topology.',
        problem: [
          'Alarms already reach Kafka, but the people who must act on them do not read Kafka topics. They read WhatsApp and Telegram.',
          'A raw topic subscription also has no notion of who should be notified for which class of alarm, or through which channel.',
        ],
        constraints: [
          'Delivery targets are third-party services, so the gateway has to tolerate a channel that is down or not yet authenticated.',
          'Recipients and channel preferences change independently of the alarm stream, so they belong in a database rather than in configuration files.',
          'Alarm traffic is bursty, and notification calls are slow relative to message consumption, so the consumer must not stall behind them.',
          'The dashboard and the consumer both need health signals, since a silently dead consumer looks identical to a quiet plant.',
        ],
        architecture: [
          'Inbound: a worker process consumes alarm messages from the alarm topic in its own consumer group.',
          'Routing: recipients are selected by priority level and by the channel each user enabled, read from PostgreSQL.',
          'Delivery: Telegram goes through the bot integration, and WhatsApp goes through a WAHA HTTP API instance rather than the official Business API.',
          'State: PostgreSQL holds recipients, Telegram chat registrations, and preferences, with tables created on startup by the database manager.',
          'Control plane: a FastAPI backend exposes JWT-authenticated endpoints, and a React dashboard edits recipients and preferences.',
          'Audit: every delivery result is published to a notification-logs topic, so history is available to the dashboard from the same substrate as the alarms.',
          'Supervision: a watchdog thread checks consumer health and forces the process to exit if the consumer thread dies, so the container restarts instead of idling.',
        ],
        decisions: [
          'The asyncio event loop runs in a dedicated background thread, and the Telegram bot stays on the main thread because it needs the signal handlers.',
          'The watchdog deliberately opts for a hard process exit over in-place recovery, trading a container restart for the certainty that a wedged consumer cannot silently pass as healthy.',
          'Channel integrations sit behind a notifier package, so adding a channel does not touch the consumer.',
          'Notification history is published back to Kafka rather than written only to the database, keeping one transport in play for both ingestion and observability.',
          'Kafka authentication is optional and switches to SASL PLAIN only when credentials are present, so local development needs no broker auth.',
          'The GSM modem path is kept separate from the network notifiers, because its failure modes are physical rather than protocol-level.',
        ],
        verification: [
          'Honest gap: the Python side has no test suite. The only test artifact in the repository is the Create React App default test file.',
          'There is no CI workflow, so nothing runs automatically on push.',
          'What the repository does make verifiable is structure and intent: the consumer wiring, the routing by priority, the channel adapters, the database manager, and the Docker Compose topology.',
        ],
        results: [
          'A working multi-channel gateway with recipient management, per-user channel preferences, and a delivery audit trail.',
          'Containerized end to end, covering the backend, dashboard, worker, and WhatsApp service.',
          'What is not claimed: no throughput, reliability, or uptime figures. The README relies on marketing language that nothing in the repository measures, so it is not repeated here.',
        ],
      },
      id: {
        title: 'Gateway notifikasi: mengubah alarm Kafka menjadi pesan WhatsApp dan Telegram',
        summary: 'Layanan yang mengonsumsi event alarm dari Kafka dan mengirimkannya ke orang yang benar-benar menindaklanjutinya, lengkap dengan manajemen penerima, preferensi kanal per pengguna, dan jejak audit yang ditulis kembali ke Kafka.',
        role: 'Proyek solo. Consumer Kafka, integrasi kanal, backend API, dashboard, dan topologi container.',
        problem: [
          'Alarm sudah sampai ke Kafka, tetapi orang yang harus menindaklanjutinya tidak membaca topik Kafka. Mereka membaca WhatsApp dan Telegram.',
          'Langganan topik mentah juga tidak punya konsep siapa yang harus diberi tahu untuk kelas alarm tertentu, atau lewat kanal mana.',
        ],
        constraints: [
          'Target pengirimannya layanan pihak ketiga, jadi gateway harus tahan terhadap kanal yang mati atau belum terautentikasi.',
          'Penerima dan preferensi kanal berubah terpisah dari stream alarm, jadi tempatnya di database, bukan di file konfigurasi.',
          'Lalu lintas alarm bersifat burst, dan panggilan notifikasi lambat dibanding konsumsi pesan, sehingga consumer tidak boleh tersendat di belakangnya.',
          'Dashboard dan consumer dua-duanya butuh sinyal kesehatan, karena consumer yang mati diam terlihat sama dengan plant yang sedang sepi.',
        ],
        architecture: [
          'Inbound: proses worker mengonsumsi pesan alarm dari topik alarm dalam consumer group-nya sendiri.',
          'Routing: penerima dipilih berdasarkan level prioritas dan kanal yang diaktifkan tiap pengguna, dibaca dari PostgreSQL.',
          'Pengiriman: Telegram lewat integrasi bot, dan WhatsApp lewat instance WAHA HTTP API, bukan API Business resmi.',
          'State: PostgreSQL menyimpan penerima, registrasi chat Telegram, dan preferensi, dengan tabel yang dibuat saat startup oleh database manager.',
          'Control plane: backend FastAPI menyediakan endpoint ber-auth JWT, dan dashboard React mengelola penerima serta preferensi.',
          'Audit: setiap hasil pengiriman dipublikasikan ke topik notification logs, sehingga riwayatnya tersedia untuk dashboard dari substrat yang sama dengan alarmnya.',
          'Supervisi: thread watchdog memeriksa kesehatan consumer dan memaksa proses keluar bila thread consumer mati, sehingga container restart alih-alih menganggur.',
        ],
        decisions: [
          'Event loop asyncio berjalan di thread latar khusus, dan bot Telegram tetap di thread utama karena membutuhkan signal handler.',
          'Watchdog sengaja memilih keluar paksa daripada pemulihan di tempat, menukar restart container dengan kepastian bahwa consumer yang macet tidak bisa diam-diam lolos sebagai sehat.',
          'Integrasi kanal berada di balik package notifier, sehingga menambah kanal tidak menyentuh consumer.',
          'Riwayat notifikasi dipublikasikan kembali ke Kafka alih-alih hanya ditulis ke database, menjaga satu transport untuk ingestion sekaligus observability.',
          'Autentikasi Kafka bersifat opsional dan baru memakai SASL PLAIN bila kredensial tersedia, sehingga pengembangan lokal tidak butuh auth broker.',
          'Jalur modem GSM dipisahkan dari notifier jaringan, karena mode kegagalannya bersifat fisik, bukan level protokol.',
        ],
        verification: [
          'Kesenjangan yang diakui: sisi Python tidak punya test suite. Satu-satunya artefak test di repositori adalah file test bawaan Create React App.',
          'Tidak ada workflow CI, jadi tidak ada yang berjalan otomatis saat push.',
          'Yang bisa diverifikasi dari repositori adalah struktur dan niatnya: penyusunan consumer, routing berdasarkan prioritas, adapter kanal, database manager, dan topologi Docker Compose.',
        ],
        results: [
          'Gateway multi-kanal yang berfungsi, dengan manajemen penerima, preferensi kanal per pengguna, dan jejak audit pengiriman.',
          'Terkontainerisasi end to end, mencakup backend, dashboard, worker, dan layanan WhatsApp.',
          'Yang tidak diklaim: tidak ada angka throughput, keandalan, atau uptime. README memakai bahasa pemasaran yang tidak diukur oleh apa pun di repositori, jadi frasa itu tidak diulang di sini.',
        ],
      },
    },
  },
];

export const CASE_STUDY_SLUGS = CASE_STUDIES.map((c) => c.slug);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
