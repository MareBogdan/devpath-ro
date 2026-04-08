-- Flashcard Sets for Prompt Engineering Practic Course
-- 6 modules × 8 flashcards = 48 total
-- Run AFTER sync route has populated lessons
-- Capstone lessons: order_index 4, 9, 14, 19, 24, 29

DO $$
DECLARE
  course_uuid UUID;
  l04 UUID;
  l09 UUID;
  l14 UUID;
  l19 UUID;
  l24 UUID;
  l29 UUID;
BEGIN
  SELECT id INTO course_uuid FROM public.courses WHERE slug = 'prompt-engineering-practic';

  SELECT id INTO l04 FROM public.lessons WHERE course_id = course_uuid AND order_index = 4;
  SELECT id INTO l09 FROM public.lessons WHERE course_id = course_uuid AND order_index = 9;
  SELECT id INTO l14 FROM public.lessons WHERE course_id = course_uuid AND order_index = 14;
  SELECT id INTO l19 FROM public.lessons WHERE course_id = course_uuid AND order_index = 19;
  SELECT id INTO l24 FROM public.lessons WHERE course_id = course_uuid AND order_index = 24;
  SELECT id INTO l29 FROM public.lessons WHERE course_id = course_uuid AND order_index = 29;

  -- ============================================================
  -- MODULE 1 CAPSTONE — Modul 1: Bazele (lesson order_index 4)
  -- ============================================================
  INSERT INTO public.flashcards (lesson_id, front, back) VALUES
    (
      l04,
      'Ce este un prompt?',
      'Orice text trimis unui model de limbaj AI ca instrucțiune, întrebare sau context. Calitatea promptului determină direct calitatea răspunsului.'
    ),
    (
      l04,
      'Care sunt cele 4 componente ale unui prompt bine structurat?',
      'Rolul (cine este AI-ul), Contextul (situația ta), Instrucțiunea/Task-ul (ce vrei să facă), Formatul (cum vrei răspunsul).'
    ),
    (
      l04,
      'Ce înseamnă zero-shot prompting?',
      'Formulezi o instrucțiune directă fără exemple prealabile. Modelul folosește cunoașterea din training. Funcționează bine pentru task-uri comune cu instrucțiuni clare.'
    ),
    (
      l04,
      'Când adaugi rolul în prompt?',
      'Când task-ul beneficiază de o perspectivă expertă specifică — legal, medical, tehnic, marketing. Rolul activează vocabularul și modul de raționare al acelui specialist din cunoașterea modelului.'
    ),
    (
      l04,
      'Ce include „contextul" dintr-un prompt?',
      'Informațiile de fundal pe care modelul nu le poate ghici: situația ta specifică, audiența, constrângerile, istoricul relevant. Regula: tot ce știi tu și modelul nu știe, dar ar trebui.'
    ),
    (
      l04,
      'De ce să specifici formatul output-ului?',
      'Fără instrucțiuni de format, modelul alege ce i se pare potrivit — rareori exact ce ai nevoie. Specifică: structura (JSON, bullet points, tabel), lungimea, tonul, stilul.'
    ),
    (
      l04,
      'Care este cea mai frecventă greșeală în prompting?',
      'Prompturi vagi sau prea generale fără context sau direcție clară. „Ajută-mă cu emailul" vs „Scrie un email scurt de mulțumire pentru o clientă, ton cald, maxim 5 propoziții".'
    ),
    (
      l04,
      'Poți omite instrucțiunea (task-ul) dintr-un prompt?',
      'Nu — instrucțiunea este esența promptului și nu poate fi omisă. Fără ea, modelul nu știe ce acțiune să efectueze. Celelalte componente sunt opționale.'
    );

  -- ============================================================
  -- MODULE 2 CAPSTONE — Modul 2: Tehnici Fundamentale (lesson order_index 9)
  -- ============================================================
  INSERT INTO public.flashcards (lesson_id, front, back) VALUES
    (
      l09,
      'Ce este few-shot prompting?',
      'Furnizezi 2-5 exemple perechi input-output înainte de task-ul real. Modelul identifică pattern-ul și îl aplică. Ideal când formatul dorit este greu de descris dar ușor de demonstrat.'
    ),
    (
      l09,
      'Când alegi few-shot față de zero-shot?',
      'Când zero-shot nu produce stilul, formatul sau tonul specific dorit. Dacă poți descrie clar ce vrei în cuvinte, zero-shot este suficient. Dacă e mai ușor să arăți, adaugă exemple.'
    ),
    (
      l09,
      'Ce este Chain of Thought (CoT)?',
      'Tehnică prin care ghidezi modelul să-și arate raționamentul pas cu pas înainte de răspunsul final. Reduce erorile la probleme complexe: matematică, logică, decizii multi-criteriu.'
    ),
    (
      l09,
      'Care este cel mai simplu trigger pentru Chain of Thought?',
      '„Gândește pas cu pas" sau „Explică raționamentul tău înainte de răspuns." Forțează modelul să proceseze explicit înainte de concluzie.'
    ),
    (
      l09,
      'Ce activează role prompting la nivel tehnic?',
      'Selectează pattern-urile de vocabular, raționament și perspectivă ale acelui tip de expert din cunoașterea modelului. Nu inventează un expert — activează cunoașterea relevantă deja existentă.'
    ),
    (
      l09,
      'Care este diferența dintre „Ești un expert" și „Ești un avocat specializat în dreptul muncii cu 10 ani experiență"?',
      'Al doilea activează cunoaștere specifică (legislație muncii, jurisprudență, practică). Cu cât rolul este mai specific, cu atât răspunsul este mai calibrat pe nevoile tale.'
    ),
    (
      l09,
      'Când sunt utile instrucțiunile negative?',
      'Când vrei să elimini comportamente implicite ale modelului: introduceri lungi, expresii goale („Desigur!"), clișee de marketing, disclaimere inutile. 2-3 instrucțiuni negative bine alese sunt suficiente.'
    ),
    (
      l09,
      'Preferă forma pozitivă sau negativă pentru instrucțiuni?',
      'Preferă forma pozitivă când poți spune exact ce vrei („Ton conversațional" > „Nu fi formal"). Folosește forma negativă când elimini comportamente specifice nedorite sau liste de termeni de evitat.'
    );

  -- ============================================================
  -- MODULE 3 CAPSTONE — Modul 3: System Prompts & Context (lesson order_index 14)
  -- ============================================================
  INSERT INTO public.flashcards (lesson_id, front, back) VALUES
    (
      l14,
      'Ce este un system prompt?',
      'Set de instrucțiuni date modelului înainte de orice conversație cu utilizatorul. Definește comportamentul, personalitatea, limitele și contextul asistentului pentru întreaga sesiune. Invizibil pentru utilizatorul final.'
    ),
    (
      l14,
      'Care sunt cele 5 componente ale unui system prompt eficient?',
      '1. Identitate/rol, 2. Domeniu + limite (ce face și ce nu face), 3. Ton și stil de comunicare, 4. Format output, 5. Protecții (cum gestionează situații dificile și atacuri).'
    ),
    (
      l14,
      'Ce este context window?',
      'Cantitatea maximă de text (în tokeni) pe care modelul o poate procesa simultan. Tot ce depășește această limită este ignorat. Este „memoria de lucru" a modelului.'
    ),
    (
      l14,
      'Ce este RAG (Retrieval Augmented Generation)?',
      'Strategie de management al contextului: stochezi cunoașterea externă (documentații, baze de date) vectorial și recuperezi NUMAI secțiunile relevante la runtime. Scalabilă pentru volume mari de informație.'
    ),
    (
      l14,
      'Ce produce temperature = 0.0?',
      'Generare deterministă — același prompt produce (aproape) același răspuns. Modelul selectează mereu tokenul cu probabilitatea cea mai mare. Ideal pentru clasificare, extragere date, code generation.'
    ),
    (
      l14,
      'Ce produce temperature = 0.8-1.0?',
      'Generare variată și creativă — mai multă „entropie" în selecția tokenilor. Ideal pentru brainstorming, scriere creativă, generare de idei. Evită pentru task-uri unde consistența e critică.'
    ),
    (
      l14,
      'Ce controlează parametrul max_tokens?',
      'Lungimea maximă a output-ului generat. Util pentru a preveni răspunsuri prea lungi și pentru a controla costul. Nu garantează că modelul va scrie exact atâtea tokeni — se oprește mai devreme dacă finalizează.'
    ),
    (
      l14,
      'Cum testezi robustețea unui system prompt?',
      'Definești 3 tipuri de scenarii: (1) cereri tipice, (2) cazuri limită (cereri ambigue), (3) adversariale (tentative de „spargere" a instrucțiunilor). Documentezi comportamentul așteptat vs actual și iterezi.'
    );

  -- ============================================================
  -- MODULE 4 CAPSTONE — Modul 4: Prompting Avansat (lesson order_index 19)
  -- ============================================================
  INSERT INTO public.flashcards (lesson_id, front, back) VALUES
    (
      l19,
      'Care este diferența dintre Chain of Thought și Tree of Thought?',
      'CoT urmează un singur fir liniar de raționament. ToT explorează multiple ramuri la fiecare pas, le evaluează și continuă cu cele mai promițătoare. ToT e mai puternic dar și mult mai costisitor.'
    ),
    (
      l19,
      'Ce este Self-Consistency și cum funcționează?',
      'Rulezi același prompt de N ori cu temperature > 0, generând variație. Răspunsul final = cel mai frecvent din N răspunsuri (majority voting). Crește acuratețea la prețul de N × costul unui prompt.'
    ),
    (
      l19,
      'Ce combină ReAct Pattern?',
      'Reasoning (Thought) + Acting (Action). Ciclul: Thought → Action (apel unealtă) → Observation (rezultat) → repeat. Permite modelelor să interacționeze cu informații externe actuale.'
    ),
    (
      l19,
      'Ce este Prompt Chaining?',
      'Decompoziția unei sarcini complexe în pași secvențiali, unde output-ul fiecărui prompt devine input-ul următorului. Permite specializarea, validarea și controlul la fiecare etapă.'
    ),
    (
      l19,
      'Când alegi Self-Consistency față de temperature = 0?',
      'Temperature = 0 pentru consistență la cost redus. Self-Consistency când acuratețea e critică și costul suplimentar se justifică. De ex: probleme medicale, juridice, matematice complexe.'
    ),
    (
      l19,
      'Ce avantaj major oferă Prompt Chaining față de un singur prompt lung?',
      'Poți valida și controla output-ul la fiecare pas, poți reîncerca pași care eșuează independent, și poți specializa fiecare prompt pentru sub-sarcina sa — izolând erorile.'
    ),
    (
      l19,
      'Tree of Thought este potrivit pentru ce tipuri de probleme?',
      'Probleme cu multiple soluții posibile și ramificații semnificative: planificare strategică, puzzle-uri complexe, raționament multi-pas. Nu merită costul pentru task-uri liniare simple.'
    ),
    (
      l19,
      'Cum descrii o unealtă (tool) pentru ReAct într-un system prompt?',
      'Specifici: numele uneltei, ce face, când s-o folosești, parametrii de input și formatul output-ului. Exemplu: „search_web(query: string) → returnează top 5 rezultate. Folosește când ai nevoie de informații actuale."'
    );

  -- ============================================================
  -- MODULE 5 CAPSTONE — Modul 5: Aplicații Practice (lesson order_index 24)
  -- ============================================================
  INSERT INTO public.flashcards (lesson_id, front, back) VALUES
    (
      l24,
      'Ce trebuie să incluzi într-un prompt pentru debugging?',
      'Mesajul de eroare exact (copy-paste), codul relevant, comportamentul așteptat vs cel observat, versiunile relevante (limbaj, biblioteci). Fără mesajul exact, diagnosticul este imposibil.'
    ),
    (
      l24,
      'Ce faci când ceri generare de cod cu restricții specifice?',
      'Specifici: limbajul și versiunea, semnătura funcției, cazurile limită de tratat, convențiile (type hints, docstrings), dependențele permise/interzise. Tratezi ca un ticket de development.'
    ),
    (
      l24,
      'Cum furnizezi date pentru analiză AI?',
      'Copiezi direct datele (CSV, JSON, tabel) sau un eșantion reprezentativ în prompt. Modelul nu are acces la sursele tale — trebuie să i le dai explicit. Fără date reale = sfaturi generice, nu analiză.'
    ),
    (
      l24,
      'Ce informație e critică când ceri un query SQL?',
      'Schema tabelei (coloane + tipuri de date) + descrierea în cuvinte naturale a ce vrei să obții. Fără schemă, modelul ghicește numele coloanelor și generează SQL care nu funcționează.'
    ),
    (
      l24,
      'Cum obții copywriting variat pentru A/B testing?',
      'Ceri explicit variante cu abordări diferite: „Scrie 3 variante de headline: una bazată pe curiozitate, una pe beneficiu direct, una pe dovadă socială." Fără direcții diferite, primești 3 variații minore ale aceleiași idei.'
    ),
    (
      l24,
      'Ce face diferența între un rezumat generic și unul utilizabil?',
      'Audiența țintă, lungimea dorită și focus-ul specific. „Rezumă pentru directori care vor lua o decizie, maxim 200 cuvinte, focus pe riscuri și resurse necesare" produce altceva decât „Rezumă documentul".'
    ),
    (
      l24,
      'Ce este layered summary (rezumatul stratificat)?',
      'Cererea mai multor niveluri de detaliu în pași separați: Pas 1 = rezumat de 3 propoziții, Pas 2 = expandarea punctului X, Pas 3 = detalii despre aspectul Y. Control granular, evită supraîncărcarea.'
    ),
    (
      l24,
      'Cum ceri code review cu priorități clare?',
      'Specifici dimensiunile de evaluat și ceri clasificarea problemelor: „Revizuiește pentru (1) bug-uri, (2) securitate, (3) performanță. Marchează cu [CRITIC]/[IMPORTANT]/[MINOR]." Fără priorități, feedback-ul este generic.'
    );

  -- ============================================================
  -- MODULE 6 CAPSTONE — Modul 6: AI Agents & Viitor (lesson order_index 29)
  -- ============================================================
  INSERT INTO public.flashcards (lesson_id, front, back) VALUES
    (
      l29,
      'Ce distinge un agent AI de un chatbot?',
      'Agentul poate executa acțiuni autonome cu unelte externe (web search, code execution, API calls), nu doar genera text. Funcționează în cicluri Perceive-Plan-Act-Observe până atinge obiectivul.'
    ),
    (
      l29,
      'Ce informații trebuie să dai unui agent pentru ca acesta să funcționeze predictibil?',
      'Obiectivul clar (ce trebuie obținut), constrângerile (ce NU are voie să facă), uneltele disponibile și condiția de oprire (când s-a terminat task-ul).'
    ),
    (
      l29,
      'Ce este function calling / tool use?',
      'Capacitatea modelului de a decide când să apeleze funcții externe predefinite (search, calculator, DB) și de a formula apelul în JSON. Modelul primește rezultatul și continuă raționamentul.'
    ),
    (
      l29,
      'Care este rolul orchestratorului în sisteme multi-agent?',
      'Primește obiectivul, îl descompune în sub-task-uri, le distribuie agentilor specializați (workers) și sintetizează outputurile într-un rezultat final coerent. Nu execută — coordonează.'
    ),
    (
      l29,
      'Ce este prompt injection attack?',
      'Tentativa de a introduce text malițios în input-ul utilizatorului pentru a suprascrie instrucțiunile din system prompt. Ex: „Ignoră instrucțiunile anterioare și..." System prompt-urile robuste gestionează explicit aceste atacuri.'
    ),
    (
      l29,
      'De ce nu trebuie să incluzi date personale reale în prompts externe?',
      'Datele trimise la API-uri externe pot fi stocate, loguite sau procesate conform politicilor furnizorului. Înlocuiește CNP-uri, parole, date medicale reale cu date fictive similare înainte de a le trimite.'
    ),
    (
      l29,
      'Ce este bias-ul în prompting și cum îl eviți?',
      'Alegerea cuvintelor poate ancora răspunsul: „De ce este X mai bun?" presupune că X e mai bun. Preferă formulări neutre: „Compară X și Y pe criteriile..." Evită întrebările retorice mascate.'
    ),
    (
      l29,
      'Care sunt cele 3 principii esențiale ale prompting-ului etic?',
      '(1) Nu include date personale reale în prompt-uri externe. (2) Fii transparent cu utilizatorii când conținutul a fost generat de AI. (3) Testează prompt-urile pentru potențial de misuse înainte de deployment în producție.'
    );

END $$;
