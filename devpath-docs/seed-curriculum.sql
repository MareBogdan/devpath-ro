-- ═══════════════════════════════════════════════════════════════════════════
-- DevPath RO — Curriculum Seed (12 courses, 321 lessons)
-- CC-3 · Source: devpath-docs/CURRICULUM-STRUCTURE.md + devpath-curriculum-v4-definitiv.md
-- ═══════════════════════════════════════════════════════════════════════════
--
-- HOW TO RUN:
--   1. Open Supabase SQL Editor
--   2. Paste this entire file
--   3. Click Run
--
-- IDEMPOTENCY:
--   - Courses use ON CONFLICT (slug) DO NOTHING — safe to re-run.
--   - Lessons have no UNIQUE (course_id, order_index) constraint, so a raw
--     re-run would duplicate. To prevent that, the script aborts (and rolls
--     the transaction back) if any lessons already exist for the 12 new
--     course slugs. To re-seed lessons from scratch, first run:
--        DELETE FROM public.lessons l
--        USING public.courses c
--        WHERE l.course_id = c.id
--          AND c.slug IN (
--            'hardware-fizica','sisteme-de-operare','retele-internet',
--            'python-inginerie-software','algoritmi-structuri-date',
--            'baze-date-ingineria-datelor','matematica-ai','machine-learning',
--            'deep-learning-computer-vision','ai-generativ-llms',
--            'agentic-ai-mcp','ai-in-productie'
--          );
--
-- NOTES:
--   - Column is content_md (not content_mdx) per schema.sql.
--   - module_index follows the dotted notation: Module X.N → module_index N.
--     Hook lessons (Module X.0) are folded into module 1 (matches the example
--     in the seeding spec).
--   - All lessons are seeded with is_published = false; flip them to true
--     after MDX content is written.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- COURSES (12)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO public.courses (slug, title, description, difficulty, order_index)
VALUES
  ('hardware-fizica', 'Hardware & Fizică', 'De la electronul fizic la primul procesor virtual asamblat de tine', 2.0, 1, true),
  ('sisteme-de-operare', 'Sisteme de Operare', 'Ce se întâmplă în interiorul mașinii tale după ce apeși butonul de pornire', 2.5, 2, true),
  ('retele-internet', 'Rețele & Internet', 'Cum ajunge un pachet de date de la tastatura ta la un server din Tokyo în 80ms', 2.5, 3, true),
  ('python-inginerie-software', 'Python & Inginerie Software', 'Gândire algoritmică, cod curat și uneltele cu care lucrează orice inginer în 2026', 2.5, 4, true),
  ('algoritmi-structuri-date', 'Algoritmi & Structuri de Date', 'Diferența dintre cod care merge și cod care scalează la milioane de utilizatori', 3.0, 5, true),
  ('baze-date-ingineria-datelor', 'Baze de Date & Ingineria Datelor', 'De la un tabel Excel la un pipeline care alimentează un model AI', 3.0, 6, true),
  ('matematica-ai', 'Matematică pentru AI', 'Transformi ecuațiile din manual în instrumente vizuale pe care le simți', 3.0, 7, true),
  ('machine-learning', 'Machine Learning', 'Primul tău model care învață din date, fără reguli scrise de tine', 3.5, 8, true),
  ('deep-learning-computer-vision', 'Deep Learning & Computer Vision', 'De la perceptronul simplu la arhitecturile care au schimbat lumea', 4.0, 9, true),
  ('ai-generativ-llms', 'AI Generativ & LLMs', 'Cum gândește, vorbește și creează un model de limbaj modern', 4.0, 10, true),
  ('agentic-ai-mcp', 'Agentic AI & MCP', 'Modelele care planifică, acționează și se corectează singure', 4.5, 11, true),
  ('ai-in-productie', 'AI în Producție', 'De la experimentul local la sistemul care rulează 24/7 fără să cadă', 4.0, 12, true)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PRE-FLIGHT — abort if lessons already exist for any of the 12 new courses
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_existing int;
BEGIN
  SELECT COUNT(*) INTO v_existing
  FROM public.lessons l
  JOIN public.courses c ON c.id = l.course_id
  WHERE c.slug IN (
    'hardware-fizica','sisteme-de-operare','retele-internet',
    'python-inginerie-software','algoritmi-structuri-date',
    'baze-date-ingineria-datelor','matematica-ai','machine-learning',
    'deep-learning-computer-vision','ai-generativ-llms',
    'agentic-ai-mcp','ai-in-productie'
  );

  IF v_existing > 0 THEN
    RAISE EXCEPTION 'ABORT: % lessons already exist for the 12 new courses. See header comment for the DELETE statement.', v_existing;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSONS — 321 rows in a single multi-VALUES INSERT
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO public.lessons (course_id, title, order_index, type, module_index, content_md, is_published)
VALUES
  -- ─── CURSUL 1: Hardware & Fizică (30 lessons) ──────────────────────────
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Cum funcționează ecranul telefonului tău?', 1, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Ce este electricitatea?', 2, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Circuitul închis', 3, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Conductoare vs. izolatoare', 4, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Analogic vs. Digital', 5, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Semiconductorii — de la nisip la siliciu', 6, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Tranzistorul — robinet electric controlat de tensiune', 7, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'LAB: Aprinde tranzistorul', 8, 'lab', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Sistemul binar', 9, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'JOC: Traducătorul Binar', 10, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Poarta NOT', 11, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Poarta AND', 12, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Poarta OR', 13, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Poarta XOR', 14, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'NAND — cărămida Lego universală', 15, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'BOSS: Alarma de Seif', 16, 'boss', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Half-Adder', 17, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Full-Adder', 18, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Multiplexorul', 19, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Ceasul de sistem', 20, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Flip-Flop — primul bit de memorie', 21, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Registrele', 22, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'JOC: Grila Memoriei RAM', 23, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Unitatea Aritmetică (ALU)', 24, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Unitatea de Control', 25, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Program Counter', 26, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Ciclul Fetch-Decode-Execute', 27, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'Arhitectura Von Neumann', 28, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'BOSS: Asamblează CPU', 29, 'boss', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'hardware-fizica'), 'De la binar la Assembly', 30, 'lesson', 5, '', false),

  -- ─── CURSUL 2: Sisteme de Operare (22 lessons) ─────────────────────────
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Procesul de Boot', 1, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Anatomia OS-ului: Kernel vs. Shell', 2, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'User Mode vs. Kernel Mode', 3, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Nașterea unui Proces', 4, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Context Switching', 5, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Firele de Execuție (Threads)', 6, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Deadlock-uri', 7, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Race Conditions', 8, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Fragmentarea Memoriei', 9, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Simulatorul de Paginare', 10, 'lab', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Memoria Virtuală și Swap', 11, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Garbage Collector', 12, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Arhitectura Sistemelor de Fișiere', 13, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Permisiuni Unix (rwx)', 14, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Mașini Virtuale și Hypervisors', 15, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Containere Docker vs. VM', 16, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Orchestrare Kubernetes', 17, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Shell-ul și primele comenzi', 18, 'lesson', 6, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Scripturi Bash', 19, 'lab', 6, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'SSH', 20, 'lesson', 6, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'Variabile de mediu și .env', 21, 'lesson', 6, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'sisteme-de-operare'), 'BOSS: Administratorul de Sistem', 22, 'boss', 6, '', false),

  -- ─── CURSUL 3: Rețele & Internet (26 lessons) ──────────────────────────
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'Trimiți un mesaj pe WhatsApp — ce se întâmplă?', 1, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'LAN și adresele MAC', 2, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'Adresele IP', 3, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'DNS — agenda telefonică globală', 4, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'Lățime de bandă vs. Latență', 5, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'TCP vs. UDP', 6, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'SIMULATOR: TCP/IP Exhaustiv', 7, 'lab', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'Modelul OSI — cele 7 straturi', 8, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'Porturile — clădirea cu 65.535 de uși', 9, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'Rutarea pachetelor', 10, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'NAT', 11, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'Proxy Forward', 12, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'Reverse Proxy', 13, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'Load Balancer', 14, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'CDN', 15, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'Criptografia Asimetrică', 16, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'SSL/TLS Handshake', 17, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'Firewall', 18, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'VPN', 19, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'HTTP', 20, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'REST vs. GraphQL', 21, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'API', 22, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'WebSockets', 23, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'Webhooks', 24, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'JSON-RPC', 25, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'retele-internet'), 'BOSS: Arhitectul de Cloud', 26, 'boss', 5, '', false),

  -- ─── CURSUL 4: Python & Inginerie Software (38 lessons) ────────────────
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), '3 linii de Python care ating internetul', 1, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Sintaxa', 2, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Variabile', 3, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Tipuri de date primitive', 4, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Operatori aritmetici și logici', 5, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Structuri decizionale If/Elif/Else', 6, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Bucle FOR', 7, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Bucle WHILE și pericolul buclei infinite', 8, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Funcții', 9, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Scope: Local vs. Global', 10, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Try/Except', 11, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Liste', 12, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Dicționare (Hash Maps)', 13, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Tuple-uri', 14, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Set-uri', 15, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Mutabilitate vs. Imutabilitate', 16, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Clase și Obiecte', 17, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Atribute și Metode', 18, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Encapsulare', 19, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Moștenire', 20, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Polimorfism', 21, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Singleton', 22, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Factory', 23, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Observer', 24, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Strategy', 25, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'List Comprehensions', 26, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Generatoare și yield', 27, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Decoratori', 28, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Async/Await', 29, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Gestionarea Fișierelor (File I/O)', 30, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Expresii Regulate (RegEx)', 31, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Modulul requests', 32, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Serializare JSON + Pydantic', 33, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'uv + Virtual Environments + pyproject.toml', 34, 'lesson', 6, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'pytest + Unit Testing', 35, 'lesson', 6, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'FastAPI — primul API REST', 36, 'lesson', 6, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'Git — commit, branch, merge, rebase', 37, 'lesson', 6, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'python-inginerie-software'), 'BOSS: Aplicația Completă', 38, 'boss', 6, '', false),

  -- ─── CURSUL 5: Algoritmi & Structuri de Date (20 lessons) ──────────────
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'De ce aplicația ta îngheață la 10.000 de utilizatori?', 1, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Căutare Liniară vs. Binară', 2, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Notarea Big O', 3, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Space-Time Tradeoff', 4, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Bubble Sort', 5, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Quick Sort', 6, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Merge Sort', 7, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Heap Sort și TimSort', 8, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Arbori Binari de Căutare (BST)', 9, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Heap', 10, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Grafuri', 11, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'BFS vs. DFS', 12, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Algoritmul lui Dijkstra', 13, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Trie', 14, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Recursivitate', 15, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Memoization', 16, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Programare Dinamică', 17, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Greedy Algorithms', 18, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'Two Pointers & Sliding Window', 19, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'algoritmi-structuri-date'), 'BOSS: Optimizatorul', 20, 'boss', 4, '', false),

  -- ─── CURSUL 6: Baze de Date & Ingineria Datelor (27 lessons) ───────────
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Excel vs. Server Database', 1, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Schema, rânduri, coloane', 2, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'CRUD', 3, 'lab', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Clauza WHERE și filtrarea', 4, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Chei Primare', 5, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Foreign Keys și Normalizarea', 6, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'JOIN-uri', 7, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'GROUP BY și Agregările', 8, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Indexarea', 9, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Tranzacțiile ACID', 10, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'De ce a apărut NoSQL', 11, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Baze Documentare (MongoDB)', 12, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Baze de tip Graf (Neo4j)', 13, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Redis', 14, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Teorema CAP', 15, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Ce este un Data Pipeline', 16, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Extract', 17, 'lab', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Transform', 18, 'lab', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Load', 19, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Automatizare — Cron Jobs și Airflow', 20, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Data Streaming (Kafka)', 21, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Limitarea căutării exacte', 22, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Embeddings', 23, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Geometria semantică', 24, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Cosine Similarity', 25, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'Vector Databases', 26, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'baze-date-ingineria-datelor'), 'BOSS: Sistemul de Căutare Semantică', 27, 'boss', 4, '', false),

  -- ─── CURSUL 7: Matematică pentru AI (21 lessons) ───────────────────────
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'De ce AI-ul nu înțelege cuvinte — înțelege vectori', 1, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Scalari și Vectori', 2, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Produsul Scalar (Dot Product)', 3, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Matrici', 4, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Înmulțirea Matricială', 5, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Transpusa, Inversa și Determinantul', 6, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Distribuția Normală', 7, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Teorema lui Bayes', 8, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Entropie Shannon', 9, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Cross-Entropie', 10, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Divergența KL', 11, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Funcții și continuitate', 12, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Derivata', 13, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Regula Lanțului (Chain Rule)', 14, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Gradienți', 15, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Introducere în Pandas', 16, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Curățarea Datelor', 17, 'lab', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Detectarea Anomaliilor', 18, 'lab', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Explorarea Datelor (EDA)', 19, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'Vizualizări cu Matplotlib/Seaborn', 20, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'matematica-ai'), 'BOSS: Coborârea pe Gradient', 21, 'boss', 4, '', false),

  -- ─── CURSUL 8: Machine Learning (22 lessons) ───────────────────────────
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'De la IF/ELSE la Predicție', 1, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Regresia Liniară', 2, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Funcția de Pierdere (Loss)', 3, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Gradient Descent', 4, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Regresia Logistică', 5, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Arbori de Decizie', 6, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Random Forest', 7, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Overfitting vs. Underfitting', 8, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Cross-Validation și Hyperparameter Tuning', 9, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'K-Means Clustering', 10, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Reducerea Dimensionalității (PCA)', 11, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Detectarea Anomaliilor Nesupervizate', 12, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Agentul și Mediul', 13, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Q-Learning', 14, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Dilema Explorare vs. Exploatare', 15, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Deep Q-Networks (DQN)', 16, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'CPU vs. GPU', 17, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Arhitectura GPU', 18, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'VRAM și Bandwidth', 19, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'CUDA', 20, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'Quantizarea', 21, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'machine-learning'), 'BOSS: Supraviețuirea Robotului', 22, 'boss', 4, '', false),

  -- ─── CURSUL 9: Deep Learning & Computer Vision (22 lessons) ────────────
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'De ce 2012 a schimbat totul', 1, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Perceptronul', 2, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Rețeaua Multistrat (MLP)', 3, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Funcții de Activare (ReLU, Sigmoid, tanh)', 4, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Backpropagation', 5, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Optimizatori (SGD, Adam, AdamW)', 6, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Regularizare (Dropout, L2, Batch Norm)', 7, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Limitarea MLP pe imagini', 8, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Convoluția', 9, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Pooling', 10, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Arhitectura CNN completă', 11, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Transfer Learning', 12, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'HuggingFace Hub + Spaces', 13, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Object Detection (YOLO)', 14, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'ResNet', 15, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Vision Transformer (ViT)', 16, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'CNN vs. ViT', 17, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Mixture of Experts (MoE)', 18, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Clasificare de imagini', 19, 'lab', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'Segmentare semantică', 20, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'LAB: Detector de emoții faciale', 21, 'lab', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'deep-learning-computer-vision'), 'BOSS: De la dataset la model deployat', 22, 'boss', 4, '', false),

  -- ─── CURSUL 10: AI Generativ & LLMs (38 lessons) ───────────────────────
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'De ce ChatGPT nu știe să numere literele din "strawberry"?', 1, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Tokenizarea', 2, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Predicția Următorului Token', 3, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Temperatura și Top-P', 4, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Limitarea RNN', 5, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Mecanismul de Atenție (Self-Attention)', 6, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Query, Key, Value', 7, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Multi-Head Attention', 8, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Positional Encoding', 9, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Arhitectura completă Transformer', 10, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Scaling Laws', 11, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Pre-Training', 12, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Post-Training Stack 2026: SFT → DPO → GRPO', 13, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'RLHF conceptual', 14, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Fine-Tuning vs. Pre-Training', 15, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'LoRA', 16, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'QLoRA — 4-bit + LoRA', 17, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Model Selection Framework', 18, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Prompt Engineering', 19, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Structured Outputs cu instructor+Pydantic', 20, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Context Window Management', 21, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Prompt Caching', 22, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Modele Locale cu Ollama', 23, 'lab', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Reasoning Models (o1, o3, DeepSeek-R1)', 24, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Chain-of-Thought', 25, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Long Context vs. RAG', 26, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Limitele actuale ale LLM-urilor', 27, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Halucinația', 28, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Arhitectura RAG', 29, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Chunking Strategies', 30, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Reranking', 31, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Advanced RAG (HyDE, Hybrid Search, Contextual Compression)', 32, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'GraphRAG', 33, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Evaluarea unui sistem RAG', 34, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Modele de Difuzie', 35, 'lesson', 6, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'AI Multimodal (CLIP, VLMs, Whisper)', 36, 'lesson', 6, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'Gradio', 37, 'lab', 6, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-generativ-llms'), 'BOSS: Sistem RAG Complet cu Gradio UI', 38, 'boss', 6, '', false),

  -- ─── CURSUL 11: Agentic AI & MCP (29 lessons) ──────────────────────────
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Creierul în Borcan', 1, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Tool Calling', 2, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Structured Outputs pentru Agenți', 3, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'ReAct Pattern', 4, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'De ce MCP?', 5, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Arhitectura MCP: Host, Client, Server', 6, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Transport: STDIO vs. HTTP+SSE', 7, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'MCP Tools', 8, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'MCP Resources', 9, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'MCP Prompts', 10, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'LAB: Primul tău MCP Server', 11, 'lab', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'MCP în ecosistem', 12, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Securitate MCP', 13, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'De ce agenți multipli?', 14, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Patterns de Orchestrare', 15, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Agent Memory', 16, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Durable Agent State', 17, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'LangGraph', 18, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'smolagents', 19, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'LangGraph vs. smolagents vs. OpenAI Agents SDK', 20, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'LAB: Echipa de 3 agenți', 21, 'lab', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Computer Use / GUI Agents', 22, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Agent-to-Agent (A2A) Protocol', 23, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Generative UI', 24, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Voice Agents', 25, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Synthetic Data cu LLM-uri', 26, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'Vibe Coding', 27, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'LAB: Agent Complet end-to-end', 28, 'lab', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'agentic-ai-mcp'), 'BOSS: Sistemul Multi-Agent Final', 29, 'boss', 4, '', false),

  -- ─── CURSUL 12: AI în Producție (26 lessons) ───────────────────────────
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'De ce modelele eșuează în producție', 1, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'MLflow și Model Registry', 2, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Automatizarea lansării (CI/CD)', 3, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Monitoring', 4, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'A/B Testing pentru modele', 5, 'lesson', 1, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'LLM-as-a-Judge', 6, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Evals cu Braintrust', 7, 'lab', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Tracing cu Langfuse', 8, 'lab', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Observability Stack complet', 9, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Evals în CI/CD', 10, 'lesson', 2, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'KV Cache', 11, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Continuous Batching', 12, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Speculative Decoding', 13, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'MoE Serving', 14, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'vLLM în practică', 15, 'lab', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'FastAPI pentru AI — streaming SSE', 16, 'lab', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Latency Optimization', 17, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Cost Optimization', 18, 'lesson', 3, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Prompt Injection', 19, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Indirect Prompt Injection', 20, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Defense in Depth', 21, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Jailbreaking', 22, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'EU AI Act', 23, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Bias și Etica Datelor', 24, 'lesson', 4, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'Edge AI', 25, 'lesson', 5, '', false),
  ((SELECT id FROM public.courses WHERE slug = 'ai-in-productie'), 'BOSS: UX pentru AI + Capstone Final', 26, 'boss', 5, '', false)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION — should return 12 rows, each matching the expected count
-- Expected: 30, 22, 26, 38, 20, 27, 21, 22, 22, 38, 29, 26  →  total 321
-- ═══════════════════════════════════════════════════════════════════════════
SELECT
  c.order_index,
  c.slug,
  c.title,
  c.difficulty,
  COUNT(l.id) AS lesson_count
FROM public.courses c
LEFT JOIN public.lessons l ON l.course_id = c.id
WHERE c.slug NOT IN ('ai-fundamentals', 'prompt-engineering-practic')
GROUP BY c.id, c.order_index, c.slug, c.title, c.difficulty
ORDER BY c.order_index;

-- Also confirm grand total
SELECT COUNT(*) AS total_new_lessons
FROM public.lessons l
JOIN public.courses c ON c.id = l.course_id
WHERE c.slug NOT IN ('ai-fundamentals', 'prompt-engineering-practic');

COMMIT;
