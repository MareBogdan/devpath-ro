// ─────────────────────────────────────────────────────────────────────────────
// DevPath RO — Dummy / Placeholder Data
// Used for showcasing pages before real content is published.
// All text is in Romanian.
// comingSoon courses are real DB stubs — they appear locked on the UI.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DummyCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName: string;        // lucide-react icon name
  color: string;           // primary accent hex for the card
  gradientFrom: string;
  gradientTo: string;
  difficulty: number;
  lessonCount: number;
  category: string;
  comingSoon: true;
  releaseQuarter: string;  // e.g. "Q3 2026"
}

export interface InterviewQuestion {
  id: string;
  questionText: string;           // Romanian
  difficulty: 1 | 2 | 3;         // 1=junior, 2=mid, 3=senior
  expectedAnswerSummary: string;  // Romanian summary (1-2 sentences)
  tags: string[];
}

export interface InterviewCategory {
  id: string;
  slug: string;
  name: string;
  iconName: string;
  color: string;
  description: string;   // Romanian
  questionCount: number;
  questions: InterviewQuestion[];
}

export interface DummyLeaderboardUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  xpPoints: number;
  level: number;
  streakCount: number;
  completedLessons: number;
  plan: "free" | "pro" | "lifetime";
}

export interface BadgeShowcase {
  id: string;
  slug: string;
  name: string;
  description: string;           // Romanian
  iconEmoji: string;
  unlockCondition: string;       // Romanian
  unlockedPercentage: number;    // 0-100, % of users who have it
  rarity: "common" | "uncommon" | "rare" | "legendary";
  xpReward: number;
}

// ─── Dummy Courses (coming soon) ─────────────────────────────────────────────

export const DUMMY_COURSES: DummyCourse[] = [
  {
    id: "dummy-frontend-mastery",
    slug: "frontend-mastery",
    title: "Frontend Mastery",
    description:
      "Stăpânește React, TypeScript și CSS modern. De la componente de bază până la arhitecturi scalabile folosite în aplicații reale. Gândire orientată spre performanță și accesibilitate.",
    iconName: "Monitor",
    color: "#3B82F6",
    gradientFrom: "#3B82F6",
    gradientTo: "#8B5CF6",
    difficulty: 3.0,
    lessonCount: 24,
    category: "Frontend",
    comingSoon: true,
    releaseQuarter: "Q3 2026",
  },
  {
    id: "dummy-backend-engineering",
    slug: "backend-engineering",
    title: "Backend Engineering",
    description:
      "Node.js, REST APIs, GraphQL și baze de date — tot ce ai nevoie să construiești servere robuste. Include autentificare, caching, job queues și deployment pe cloud.",
    iconName: "Server",
    color: "#10B981",
    gradientFrom: "#10B981",
    gradientTo: "#059669",
    difficulty: 3.0,
    lessonCount: 28,
    category: "Backend",
    comingSoon: true,
    releaseQuarter: "Q4 2026",
  },
  {
    id: "dummy-devops-pipeline",
    slug: "devops-pipeline",
    title: "DevOps Pipeline",
    description:
      "Docker, CI/CD, Kubernetes și cloud. Automatizează orice — de la build-uri la deployment-uri zero-downtime. Monitorizare, logging și cultura DevOps.",
    iconName: "GitBranch",
    color: "#F59E0B",
    gradientFrom: "#F59E0B",
    gradientTo: "#EF4444",
    difficulty: 4.0,
    lessonCount: 20,
    category: "DevOps",
    comingSoon: true,
    releaseQuarter: "Q1 2027",
  },
  {
    id: "dummy-cybersecurity-basics",
    slug: "cybersecurity-basics",
    title: "Cybersecurity Basics",
    description:
      "Principii de securitate, vectori de atac, criptografie și protejarea aplicațiilor web. Înțelege cum gândesc hackerii ca să construiești sisteme invulnerabile.",
    iconName: "Shield",
    color: "#EF4444",
    gradientFrom: "#EF4444",
    gradientTo: "#7C3AED",
    difficulty: 2.0,
    lessonCount: 18,
    category: "Security",
    comingSoon: true,
    releaseQuarter: "Q2 2027",
  },
];

// ─── Interview Categories & Questions ────────────────────────────────────────

export const INTERVIEW_CATEGORIES: InterviewCategory[] = [
  {
    id: "cat-frontend",
    slug: "frontend",
    name: "Frontend",
    iconName: "Monitor",
    color: "#3B82F6",
    description: "React, CSS, performanță și optimizare UI",
    questionCount: 5,
    questions: [
      {
        id: "fe-1",
        questionText: "Ce este Virtual DOM și de ce este util în React?",
        difficulty: 1,
        expectedAnswerSummary:
          "Virtual DOM este o reprezentare în memorie a DOM-ului real. React îl folosește pentru a calcula diferențele (diffing) și a actualiza eficient doar elementele modificate.",
        tags: ["React", "DOM", "performanță"],
      },
      {
        id: "fe-2",
        questionText: "Explică diferența dintre `useMemo` și `useCallback`.",
        difficulty: 2,
        expectedAnswerSummary:
          "`useMemo` memorează rezultatul unui calcul costisitor. `useCallback` memorează o funcție pentru a evita recrearea ei la fiecare render. Ambele optimizează performanța prin memoizare selectivă.",
        tags: ["React", "hooks", "performanță"],
      },
      {
        id: "fe-3",
        questionText:
          "Cum implementezi code splitting și lazy loading în Next.js?",
        difficulty: 2,
        expectedAnswerSummary:
          "Prin `dynamic()` din next/dynamic sau `React.lazy()` cu Suspense. Reduce bundle-ul inițial încărcând componente la nevoie.",
        tags: ["Next.js", "bundle", "optimizare"],
      },
      {
        id: "fe-4",
        questionText:
          "Descrie arhitectura unui design system scalabil în React cu TypeScript.",
        difficulty: 3,
        expectedAnswerSummary:
          "Include tokens de design (culori, spațiu), componente atomice cu variante (CVA), compunere prin compound components, documentație Storybook și versioning semantic.",
        tags: ["Design System", "TypeScript", "arhitectură"],
      },
      {
        id: "fe-5",
        questionText:
          "Ce este hydration mismatch în Next.js și cum îl previi?",
        difficulty: 3,
        expectedAnswerSummary:
          "Apare când HTML-ul server-side diferă de cel client-side (ex: date care variază per request, valori random). Se previne cu `suppressHydrationWarning`, `useEffect` sau condiții bazate pe `isMounted`.",
        tags: ["Next.js", "SSR", "hydration"],
      },
    ],
  },
  {
    id: "cat-backend",
    slug: "backend",
    name: "Backend",
    iconName: "Server",
    color: "#10B981",
    description: "API design, baze de date și arhitecturi server-side",
    questionCount: 5,
    questions: [
      {
        id: "be-1",
        questionText:
          "Care este diferența dintre autentificare și autorizare?",
        difficulty: 1,
        expectedAnswerSummary:
          "Autentificarea verifică identitatea (cine ești). Autorizarea verifică permisiunile (ce poți face). JWT autentifică, RLS/RBAC autorizează.",
        tags: ["securitate", "auth", "JWT"],
      },
      {
        id: "be-2",
        questionText:
          "Explică N+1 query problem și cum o rezolvi în SQL.",
        difficulty: 2,
        expectedAnswerSummary:
          "Se produce când execuți N query-uri individuale în loc de un JOIN. Se rezolvă cu eager loading, DataLoader (GraphQL) sau JOIN-uri explicite.",
        tags: ["SQL", "ORM", "performanță"],
      },
      {
        id: "be-3",
        questionText:
          "Cum implementezi rate limiting la nivel de API?",
        difficulty: 2,
        expectedAnswerSummary:
          "Prin sliding window sau token bucket, stocate în Redis. Middleware care verifică requesturi per IP sau user_id. Răspuns 429 când limita e depășită.",
        tags: ["API", "Redis", "securitate"],
      },
      {
        id: "be-4",
        questionText:
          "Descrie diferențele principale dintre REST și GraphQL și când să le alegi.",
        difficulty: 2,
        expectedAnswerSummary:
          "REST e simplu, cacheable, standard HTTP. GraphQL elimină over/under-fetching, ideal pentru date complexe cu relații. REST pentru API-uri publice simple, GraphQL pentru UI-uri cu nevoi variate de date.",
        tags: ["REST", "GraphQL", "design"],
      },
      {
        id: "be-5",
        questionText:
          "Proiectează un sistem de job queues pentru trimiterea de notificări în timp real.",
        difficulty: 3,
        expectedAnswerSummary:
          "Bull/BullMQ pe Redis pentru cozi, workers separați, retry exponential, dead-letter queue pentru eșecuri. WebSockets sau SSE pentru livrare real-time. Monitorizare cu Arena sau Bull Board.",
        tags: ["queue", "Redis", "arhitectură"],
      },
    ],
  },
  {
    id: "cat-devops",
    slug: "devops",
    name: "DevOps",
    iconName: "GitBranch",
    color: "#F59E0B",
    description: "CI/CD, containere și infrastructură cloud",
    questionCount: 5,
    questions: [
      {
        id: "do-1",
        questionText: "Ce este un container Docker și cum diferă de o mașină virtuală?",
        difficulty: 1,
        expectedAnswerSummary:
          "Containerele partajează kernel-ul OS-ului gazdă, sunt ușoare și pornesc rapid. VM-urile virtualizează hardware-ul complet, sunt mai izolate dar consumă mai multe resurse.",
        tags: ["Docker", "VM", "containere"],
      },
      {
        id: "do-2",
        questionText: "Descrie un pipeline CI/CD complet pentru o aplicație Next.js.",
        difficulty: 2,
        expectedAnswerSummary:
          "Trigger la push: lint → build → teste → build Docker image → push registry → deploy pe Kubernetes/Vercel. Preview pentru PR-uri, producție pe merge în main.",
        tags: ["CI/CD", "GitHub Actions", "deployment"],
      },
      {
        id: "do-3",
        questionText: "Cum implementezi zero-downtime deployment?",
        difficulty: 3,
        expectedAnswerSummary:
          "Blue-green deployment sau rolling updates. Load balancer dirijează traficul spre noua versiune treptat. Health checks verifică că noile pod-uri sunt ready. Rollback automat la erori.",
        tags: ["Kubernetes", "deployment", "HA"],
      },
      {
        id: "do-4",
        questionText: "Ce este Infrastructure as Code și care sunt avantajele Terraform?",
        difficulty: 2,
        expectedAnswerSummary:
          "IaC definește infrastructura în fișiere versionabile. Terraform e declarativ, multi-cloud, cu state management și plan/apply pentru preview înainte de modificări.",
        tags: ["Terraform", "IaC", "cloud"],
      },
      {
        id: "do-5",
        questionText: "Cum monitorizezi și alertezi pentru o aplicație în producție?",
        difficulty: 2,
        expectedAnswerSummary:
          "Stack-ul clasic: Prometheus (metrici) + Grafana (vizualizare) + Alertmanager (alerte). Sau cloud-native: CloudWatch, Datadog. SLO-uri pentru reliability, alertă pe erori/latență/saturation.",
        tags: ["monitoring", "Prometheus", "SRE"],
      },
    ],
  },
  {
    id: "cat-databases",
    slug: "databases",
    name: "Baze de date",
    iconName: "Database",
    color: "#8B5CF6",
    description: "SQL, indexare, tranzacții și optimizare",
    questionCount: 5,
    questions: [
      {
        id: "db-1",
        questionText: "Explică diferența dintre INNER JOIN și LEFT JOIN.",
        difficulty: 1,
        expectedAnswerSummary:
          "INNER JOIN returnează doar rândurile care se potrivesc în ambele tabele. LEFT JOIN returnează toate rândurile din tabela stângă, cu NULL pentru lipsa de potrivire în dreapta.",
        tags: ["SQL", "JOIN", "fundamente"],
      },
      {
        id: "db-2",
        questionText: "Ce este un index și cum alegi coloanele de indexat?",
        difficulty: 2,
        expectedAnswerSummary:
          "Un index accelerează căutările pe o coloană prin structuri B-tree sau Hash. Se indexează coloanele din WHERE, JOIN, ORDER BY des utilizate. Prea mulți indecși încetinesc INSERT/UPDATE.",
        tags: ["index", "performanță", "SQL"],
      },
      {
        id: "db-3",
        questionText: "Explică proprietățile ACID ale tranzacțiilor.",
        difficulty: 2,
        expectedAnswerSummary:
          "Atomicity (totul sau nimic), Consistency (starea validă după tranzacție), Isolation (tranzacțiile nu se interferează), Durability (datele persistă după commit). Fundamentale pentru integritate.",
        tags: ["ACID", "tranzacții", "PostgreSQL"],
      },
      {
        id: "db-4",
        questionText:
          "Când alegi NoSQL în loc de SQL și ce trade-off-uri accepți?",
        difficulty: 2,
        expectedAnswerSummary:
          "NoSQL pentru scale orizontal, scheme flexibile, latență mică (Redis, Cassandra). Trade-off-uri: consistență eventuală, relații complexe dificile, JOIN-uri absente. SQL rămâne mai bun pentru relații și tranzacții.",
        tags: ["NoSQL", "arhitectură", "trade-offs"],
      },
      {
        id: "db-5",
        questionText:
          "Proiectează schema pentru un sistem de comentarii ierarhice cu performanță optimă.",
        difficulty: 3,
        expectedAnswerSummary:
          "Adjacency list (parent_id) — simplu dar lent pentru subarbori. Nested sets — citire rapidă, modificare costisitoare. Materialized path (1/2/5) — echilibru bun. Recursive CTE pentru interogare. Indexuri pe parent_id și path.",
        tags: ["schema design", "recursiv", "CTE"],
      },
    ],
  },
  {
    id: "cat-system-design",
    slug: "system-design",
    name: "System Design",
    iconName: "Network",
    color: "#06B6D4",
    description: "Arhitecturi scalabile și decizii de design la scară mare",
    questionCount: 5,
    questions: [
      {
        id: "sd-1",
        questionText: "Ce este scalarea orizontală vs verticală?",
        difficulty: 1,
        expectedAnswerSummary:
          "Scalare verticală: mașini mai puternice (mai mult RAM/CPU). Orizontală: mai multe mașini în paralel. Orizontala e mai scalabilă și fault-tolerant dar necesită distribuție/sincronizare.",
        tags: ["scalabilitate", "arhitectură"],
      },
      {
        id: "sd-2",
        questionText: "Proiectează un URL shortener (ex: bit.ly) care gestionează 1 miliard de URL-uri.",
        difficulty: 3,
        expectedAnswerSummary:
          "Base62 encoding pentru slug scurt, Cassandra/DynamoDB pentru stocare (cheie = slug), Redis cache pentru top URL-uri, CDN pentru redirect rapid, rate limiting anti-abuse, analytics async.",
        tags: ["system design", "scale", "Cassandra"],
      },
      {
        id: "sd-3",
        questionText: "Cum funcționează un CDN și de ce îmbunătățește latența?",
        difficulty: 1,
        expectedAnswerSummary:
          "CDN distribuie conținut static pe servere edge globale. Requestul e servit de cel mai apropiat PoP, reducând latența rețelei. Cache invalidation e gestionată prin TTL sau purge API.",
        tags: ["CDN", "performanță", "rețea"],
      },
      {
        id: "sd-4",
        questionText: "Ce este CAP theorem și cum influențează deciziile de arhitectură?",
        difficulty: 3,
        expectedAnswerSummary:
          "Un sistem distribuit poate garanta doar 2 din 3: Consistency, Availability, Partition tolerance. În practică, partiționarea e inevitabilă → alegi CP (PostgreSQL) sau AP (Cassandra) în funcție de nevoi.",
        tags: ["CAP", "distributed systems", "trade-offs"],
      },
      {
        id: "sd-5",
        questionText:
          "Proiectează o arhitectură pentru un feed de activitate la scară Twitter.",
        difficulty: 3,
        expectedAnswerSummary:
          "Push model: la post nou, fanout asincron în Kafka, workers scriu în Redis lista fiecărui follower. Pull model pentru celebrities (prea mulți followeri). Hybrid: push pentru <10k followeri, pull altfel. Redis Sorted Set pentru feed.",
        tags: ["feed", "Kafka", "Redis", "scale"],
      },
    ],
  },
  {
    id: "cat-ai-ml",
    slug: "ai-ml",
    name: "AI & ML",
    iconName: "Brain",
    color: "#6C5CE7",
    description: "Machine Learning, rețele neuronale și LLM-uri",
    questionCount: 5,
    questions: [
      {
        id: "ai-1",
        questionText: "Ce este overfitting și cum îl previi?",
        difficulty: 1,
        expectedAnswerSummary:
          "Overfitting apare când modelul memorează datele de antrenare în loc să generalizeze. Soluții: regularizare (L1/L2), dropout, mai multe date, early stopping, cross-validation.",
        tags: ["ML", "regularizare", "fundamente"],
      },
      {
        id: "ai-2",
        questionText: "Explică mecanismul Attention din Transformer.",
        difficulty: 3,
        expectedAnswerSummary:
          "Attention calculează relevanța fiecărui token față de celelalte: Q·K^T / √d_k → softmax → ponderate V. Multi-head attention rulează asta în paralel pe subspații diferite, capturând relații diverse.",
        tags: ["Transformer", "attention", "NLP"],
      },
      {
        id: "ai-3",
        questionText: "Ce este RLHF și de ce e important pentru alinierea LLM-urilor?",
        difficulty: 3,
        expectedAnswerSummary:
          "Reinforcement Learning from Human Feedback: un reward model antrenat pe preferințe umane ghidează fine-tuning-ul prin PPO. Aliniază comportamentul LLM la valorile umane, reducând răspunsuri nocive.",
        tags: ["RLHF", "LLM", "aliniere"],
      },
      {
        id: "ai-4",
        questionText: "Cum evaluezi calitatea unui model de clasificare dincolo de accuracy?",
        difficulty: 2,
        expectedAnswerSummary:
          "Precision, recall, F1 pentru clase dezechilibrate. AUC-ROC pentru separabilitate generală. Confusion matrix pentru analiza erorilor. Calibration pentru probabilități corecte.",
        tags: ["evaluare", "metrici", "clasificare"],
      },
      {
        id: "ai-5",
        questionText: "Explică RAG (Retrieval-Augmented Generation) și când să îl folosești.",
        difficulty: 2,
        expectedAnswerSummary:
          "RAG combină un retriever (vector search) cu un LLM generator. La query, documentele relevante sunt extrase și injectate în context. Util când LLM-ul nu are cunoștințele necesare sau datele se schimbă frecvent.",
        tags: ["RAG", "embeddings", "LLM"],
      },
    ],
  },
  {
    id: "cat-security",
    slug: "security",
    name: "Securitate",
    iconName: "Shield",
    color: "#EF4444",
    description: "Vulnerabilități web, criptografie și securizarea aplicațiilor",
    questionCount: 5,
    questions: [
      {
        id: "sec-1",
        questionText: "Care sunt cele mai comune vulnerabilități OWASP Top 10?",
        difficulty: 1,
        expectedAnswerSummary:
          "SQL Injection, XSS, CSRF, broken auth, sensitive data exposure, misconfiguration, insecure deserialization, etc. Înțelegerea lor e baza securizării oricărei aplicații web.",
        tags: ["OWASP", "vulnerabilități", "web"],
      },
      {
        id: "sec-2",
        questionText: "Cum funcționează un atac SQL Injection și cum îl previi?",
        difficulty: 1,
        expectedAnswerSummary:
          "Atacatorul injectează SQL malițios prin input nevalidat. Prevenție: prepared statements / parametrizare, ORM cu escaping automat, principiul least privilege la DB.",
        tags: ["SQL Injection", "input validation", "securitate"],
      },
      {
        id: "sec-3",
        questionText: "Explică cum funcționează JWT și care sunt limitările sale.",
        difficulty: 2,
        expectedAnswerSummary:
          "JWT: header.payload.signature encodat Base64. Serverul verifică semnătura fără DB lookup. Limitare: nu poate fi revocat înainte de expirare (soluție: refresh tokens + blacklist).",
        tags: ["JWT", "auth", "token"],
      },
      {
        id: "sec-4",
        questionText: "Ce este Content Security Policy și cum reduce riscul de XSS?",
        difficulty: 2,
        expectedAnswerSummary:
          "CSP e un header HTTP care specifică sursele permise pentru scripturi, stiluri, imagini. Blochează scripturi inline și din domenii neautorizate, limitând impactul XSS chiar dacă injectarea reușește.",
        tags: ["CSP", "XSS", "HTTP headers"],
      },
      {
        id: "sec-5",
        questionText: "Proiectează un sistem de autentificare securizat pentru o aplicație SaaS multi-tenant.",
        difficulty: 3,
        expectedAnswerSummary:
          "OAuth2 + OIDC pentru SSO, MFA obligatoriu, session tokens cu rotație, RLS la nivel DB per tenant, audit logging al tuturor acțiunilor, rate limiting pe login, SIEM pentru detecție anomalii.",
        tags: ["auth", "multi-tenant", "SSO", "securitate"],
      },
    ],
  },
  {
    id: "cat-networking",
    slug: "networking",
    name: "Rețele",
    iconName: "Wifi",
    color: "#0EA5E9",
    description: "Protocoale, DNS, HTTP și comunicare în rețea",
    questionCount: 5,
    questions: [
      {
        id: "net-1",
        questionText: "Ce se întâmplă când tastezi un URL în browser și apeși Enter?",
        difficulty: 1,
        expectedAnswerSummary:
          "DNS lookup → TCP handshake → TLS handshake → HTTP request → server procesează → response → browser parsează HTML → renderizare. Fiecare pas are implicații de latență și securitate.",
        tags: ["HTTP", "DNS", "TCP", "TLS"],
      },
      {
        id: "net-2",
        questionText: "Explică diferența dintre HTTP/1.1, HTTP/2 și HTTP/3.",
        difficulty: 2,
        expectedAnswerSummary:
          "HTTP/1.1: o cerere per conexiune, head-of-line blocking. HTTP/2: multiplexare pe o conexiune TCP, header compression (HPACK). HTTP/3: pe QUIC (UDP), elimină HoL la transport, faster recovery.",
        tags: ["HTTP", "performanță", "protocol"],
      },
      {
        id: "net-3",
        questionText: "Cum funcționează DNS și ce este DNS caching?",
        difficulty: 1,
        expectedAnswerSummary:
          "DNS rezolvă domeniu → IP prin ierarhie: resolver → root → TLD → authoritative. Caching la nivel OS/browser/resolver cu TTL reduce latența și încărcarea serverelor.",
        tags: ["DNS", "rețea", "caching"],
      },
      {
        id: "net-4",
        questionText: "Ce este un WebSocket și când îl preferi față de polling?",
        difficulty: 2,
        expectedAnswerSummary:
          "WebSocket e o conexiune full-duplex persistentă pe TCP. Ideal pentru real-time bidirectional (chat, live updates, gaming). Polling e mai simplu dar mai costisitor. SSE pentru one-way streaming.",
        tags: ["WebSocket", "real-time", "SSE"],
      },
      {
        id: "net-5",
        questionText: "Proiectează o soluție pentru reducerea latențelor globale sub 100ms.",
        difficulty: 3,
        expectedAnswerSummary:
          "CDN edge pentru statice + API responses cacheabile. Edge functions (Cloudflare Workers, Vercel Edge) pentru logică aproape de user. Anycast routing. Reduce round-trips prin HTTP/2 push sau prefetch. Optimizare TLS (0-RTT).",
        tags: ["latency", "CDN", "edge", "optimizare"],
      },
    ],
  },
];

// ─── Dummy Leaderboard Users ──────────────────────────────────────────────────

export const DUMMY_LEADERBOARD: DummyLeaderboardUser[] = [
  {
    id: "dummy-user-1",
    name: "Alexandru Ionescu",
    avatarUrl: null,
    xpPoints: 12450,
    level: 10,
    streakCount: 47,
    completedLessons: 89,
    plan: "lifetime",
  },
  {
    id: "dummy-user-2",
    name: "Maria Constantin",
    avatarUrl: null,
    xpPoints: 9820,
    level: 8,
    streakCount: 31,
    completedLessons: 72,
    plan: "pro",
  },
  {
    id: "dummy-user-3",
    name: "Andrei Popescu",
    avatarUrl: null,
    xpPoints: 8130,
    level: 7,
    streakCount: 22,
    completedLessons: 61,
    plan: "pro",
  },
  {
    id: "dummy-user-4",
    name: "Elena Duma",
    avatarUrl: null,
    xpPoints: 6750,
    level: 6,
    streakCount: 18,
    completedLessons: 53,
    plan: "pro",
  },
  {
    id: "dummy-user-5",
    name: "Bogdan Toma",
    avatarUrl: null,
    xpPoints: 5490,
    level: 5,
    streakCount: 14,
    completedLessons: 45,
    plan: "free",
  },
  {
    id: "dummy-user-6",
    name: "Ioana Radu",
    avatarUrl: null,
    xpPoints: 4200,
    level: 4,
    streakCount: 9,
    completedLessons: 34,
    plan: "pro",
  },
  {
    id: "dummy-user-7",
    name: "Mihai Stancu",
    avatarUrl: null,
    xpPoints: 3100,
    level: 3,
    streakCount: 6,
    completedLessons: 26,
    plan: "free",
  },
  {
    id: "dummy-user-8",
    name: "Cristina Florescu",
    avatarUrl: null,
    xpPoints: 2350,
    level: 3,
    streakCount: 4,
    completedLessons: 19,
    plan: "free",
  },
  {
    id: "dummy-user-9",
    name: "Vlad Gheorghe",
    avatarUrl: null,
    xpPoints: 1580,
    level: 2,
    streakCount: 3,
    completedLessons: 12,
    plan: "free",
  },
  {
    id: "dummy-user-10",
    name: "Ana Moldovan",
    avatarUrl: null,
    xpPoints: 750,
    level: 1,
    streakCount: 1,
    completedLessons: 6,
    plan: "free",
  },
];

// ─── Badge Showcase ───────────────────────────────────────────────────────────

export const BADGE_SHOWCASE: BadgeShowcase[] = [
  {
    id: "badge-first-lesson",
    slug: "first-lesson",
    name: "Prima Lecție",
    description: "Ai completat prima lecție. Începuturile sunt cele mai importante.",
    iconEmoji: "🌱",
    unlockCondition: "Completează prima lecție",
    unlockedPercentage: 87,
    rarity: "common",
    xpReward: 50,
  },
  {
    id: "badge-first-course",
    slug: "first-course",
    name: "Primul Curs",
    description: "Ai finalizat primul curs complet. Ești pe calea cea bună!",
    iconEmoji: "🏆",
    unlockCondition: "Completează primul curs",
    unlockedPercentage: 34,
    rarity: "uncommon",
    xpReward: 500,
  },
  {
    id: "badge-streak-7",
    slug: "streak-7",
    name: "Seria de Foc",
    description: "7 zile consecutive de activitate. Consistența e superputerea ta.",
    iconEmoji: "🔥",
    unlockCondition: "7 zile consecutive de activitate",
    unlockedPercentage: 28,
    rarity: "uncommon",
    xpReward: 200,
  },
  {
    id: "badge-streak-30",
    slug: "streak-30",
    name: "Maestrul Lunii",
    description: "30 de zile consecutive. Disciplina ta este extraordinară.",
    iconEmoji: "⚡",
    unlockCondition: "30 zile consecutive de activitate",
    unlockedPercentage: 8,
    rarity: "rare",
    xpReward: 1000,
  },
  {
    id: "badge-ambassador",
    slug: "ambassador",
    name: "Ambasador",
    description: "Ai invitat primul tău prieten pe platformă. Mulțumim!",
    iconEmoji: "🤝",
    unlockCondition: "Invită 1 prieten",
    unlockedPercentage: 15,
    rarity: "uncommon",
    xpReward: 300,
  },
  {
    id: "badge-recruiter",
    slug: "recruiter",
    name: "Recrutorul",
    description: "3 prieteni invitați. Ești un adevărat ambasador DevPath!",
    iconEmoji: "🌐",
    unlockCondition: "Invită 3 prieteni",
    unlockedPercentage: 5,
    rarity: "rare",
    xpReward: 750,
  },
  {
    id: "badge-quiz-master",
    slug: "quiz-master",
    name: "Quiz Master",
    description: "10 quiz-uri cu scor perfect. Cunoașterea ta este solidă.",
    iconEmoji: "🎯",
    unlockCondition: "10 quiz-uri cu scor 100%",
    unlockedPercentage: 12,
    rarity: "rare",
    xpReward: 400,
  },
  {
    id: "badge-night-owl",
    slug: "night-owl",
    name: "Bufniță de Noapte",
    description: "Ai completat o lecție după ora 23:00. Noaptea este a ta.",
    iconEmoji: "🦉",
    unlockCondition: "Completează o lecție după 23:00",
    unlockedPercentage: 41,
    rarity: "common",
    xpReward: 100,
  },
  {
    id: "badge-speed-learner",
    slug: "speed-learner",
    name: "Învățăcel Rapid",
    description: "5 lecții completate într-o singură zi. Viteza ta impresionează!",
    iconEmoji: "⚡",
    unlockCondition: "5 lecții în aceeași zi",
    unlockedPercentage: 19,
    rarity: "uncommon",
    xpReward: 350,
  },
  {
    id: "badge-legendary",
    slug: "legendary",
    name: "Legenda DevPath",
    description: "Ai completat toate cursurile disponibile. Ești o inspirație.",
    iconEmoji: "👑",
    unlockCondition: "Completează toate cursurile",
    unlockedPercentage: 1,
    rarity: "legendary",
    xpReward: 5000,
  },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

/** Get the rarity color for a badge */
export function getBadgeRarityColor(rarity: BadgeShowcase["rarity"]): string {
  const map: Record<BadgeShowcase["rarity"], string> = {
    common: "#6B7280",
    uncommon: "#10B981",
    rare: "#3B82F6",
    legendary: "#FDCB6E",
  };
  return map[rarity];
}

/** Get gradient stops for a dummy course */
export function getCourseGradient(course: DummyCourse): string {
  return `linear-gradient(135deg, ${course.gradientFrom}22 0%, ${course.gradientTo}22 100%)`;
}
