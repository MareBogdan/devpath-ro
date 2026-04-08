-- Gate Questions for Prompt Engineering Practic Course
-- Run AFTER sync route has populated lessons
-- Theory lessons only: L01-04, L06-09, L11-14, L16-19, L21-24, L26-29
-- 24 lessons × 2 questions = 48 total

DO $$
DECLARE
  course_uuid UUID;
  l01 UUID; l02 UUID; l03 UUID; l04 UUID;
  l06 UUID; l07 UUID; l08 UUID; l09 UUID;
  l11 UUID; l12 UUID; l13 UUID; l14 UUID;
  l16 UUID; l17 UUID; l18 UUID; l19 UUID;
  l21 UUID; l22 UUID; l23 UUID; l24 UUID;
  l26 UUID; l27 UUID; l28 UUID; l29 UUID;
BEGIN
  SELECT id INTO course_uuid FROM public.courses WHERE slug = 'prompt-engineering-practic';

  SELECT id INTO l01 FROM public.lessons WHERE course_id = course_uuid AND order_index = 1;
  SELECT id INTO l02 FROM public.lessons WHERE course_id = course_uuid AND order_index = 2;
  SELECT id INTO l03 FROM public.lessons WHERE course_id = course_uuid AND order_index = 3;
  SELECT id INTO l04 FROM public.lessons WHERE course_id = course_uuid AND order_index = 4;
  SELECT id INTO l06 FROM public.lessons WHERE course_id = course_uuid AND order_index = 6;
  SELECT id INTO l07 FROM public.lessons WHERE course_id = course_uuid AND order_index = 7;
  SELECT id INTO l08 FROM public.lessons WHERE course_id = course_uuid AND order_index = 8;
  SELECT id INTO l09 FROM public.lessons WHERE course_id = course_uuid AND order_index = 9;
  SELECT id INTO l11 FROM public.lessons WHERE course_id = course_uuid AND order_index = 11;
  SELECT id INTO l12 FROM public.lessons WHERE course_id = course_uuid AND order_index = 12;
  SELECT id INTO l13 FROM public.lessons WHERE course_id = course_uuid AND order_index = 13;
  SELECT id INTO l14 FROM public.lessons WHERE course_id = course_uuid AND order_index = 14;
  SELECT id INTO l16 FROM public.lessons WHERE course_id = course_uuid AND order_index = 16;
  SELECT id INTO l17 FROM public.lessons WHERE course_id = course_uuid AND order_index = 17;
  SELECT id INTO l18 FROM public.lessons WHERE course_id = course_uuid AND order_index = 18;
  SELECT id INTO l19 FROM public.lessons WHERE course_id = course_uuid AND order_index = 19;
  SELECT id INTO l21 FROM public.lessons WHERE course_id = course_uuid AND order_index = 21;
  SELECT id INTO l22 FROM public.lessons WHERE course_id = course_uuid AND order_index = 22;
  SELECT id INTO l23 FROM public.lessons WHERE course_id = course_uuid AND order_index = 23;
  SELECT id INTO l24 FROM public.lessons WHERE course_id = course_uuid AND order_index = 24;
  SELECT id INTO l26 FROM public.lessons WHERE course_id = course_uuid AND order_index = 26;
  SELECT id INTO l27 FROM public.lessons WHERE course_id = course_uuid AND order_index = 27;
  SELECT id INTO l28 FROM public.lessons WHERE course_id = course_uuid AND order_index = 28;
  SELECT id INTO l29 FROM public.lessons WHERE course_id = course_uuid AND order_index = 29;

  -- ============================================================
  -- LESSON 01 — Ce Este un Prompt?
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l01,
      'Care este cea mai bună definiție a unui prompt?',
      '["Un program care rulează pe server", "Orice text pe care îl trimiți unui model AI ca instrucțiune sau întrebare", "Un tip de bază de date pentru AI", "Un limbaj de programare special pentru AI"]',
      1,
      'Un prompt este orice text trimis unui model de limbaj — poate fi o întrebare, o instrucțiune, un context sau o combinație. Calitatea promptului determină direct calitatea răspunsului.',
      'both',
      0
    ),
    (
      l01,
      'De ce este importantă specificitatea în formularea unui prompt?',
      '["Modelele AI procesează mai rapid prompturile scurte", "Un prompt specific ghidează modelul spre contextul și formatul exact dorit, reducând răspunsurile vagi", "Specificitatea este importantă doar pentru programatori", "Modelele AI înțeleg contextul automat fără detalii suplimentare"]',
      1,
      'Modelul AI nu știe nimic despre situația ta dacă nu îi spui. Un prompt specific cu context, obiectiv și format produce un răspuns utilizabil imediat. Un prompt vag produce un răspuns generic.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 02 — Anatomia unui Prompt
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l02,
      'Care sunt cele 4 componente ale unui prompt bine structurat?',
      '["Titlu, Conținut, Concluzie, Sursă", "Rol, Context, Task/Instrucțiune, Format", "Introducere, Subiect, Detalii, Exemplu", "Cerere, Audiență, Ton, Lungime"]',
      1,
      'Un prompt eficient conține: Rolul (cine este AI-ul), Contextul (situația ta specifică), Task-ul (ce vrei să facă) și Formatul (cum să arate răspunsul). Împreună, aceste componente ghidează modelul precis.',
      'both',
      0
    ),
    (
      l02,
      'Poți omite componenta ''Instrucțiunea'' (Task-ul) dintr-un prompt?',
      '["Da, dacă contextul este suficient de detaliat", "Da, dacă specifici rolul clar", "Nu — instrucțiunea este esența promptului și nu poate fi omisă", "Depinde de modelul AI folosit"]',
      2,
      'Instrucțiunea este singura componentă obligatorie. Fără ea, modelul nu știe ce acțiune să efectueze. Celelalte componente (rol, context, format) sunt opționale și se adaugă în funcție de complexitatea task-ului.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 03 — Greșeli Comune
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l03,
      'Care este cea mai frecventă greșeală în prompting?',
      '["Folosirea unui ton prea formal", "Prompts prea vagi sau prea generale care nu oferă context sau direcție clară", "Scrierea promptului în limba română în loc de engleză", "Adăugarea prea multor exemple"]',
      1,
      'Prompturile vagi sunt sursa principală de răspunsuri slabe. ''Ajută-mă cu emailul'' poate însemna orice. ''Scrie un email scurt de mulțumire pentru o clientă care a recomandat 3 prieteni, ton cald, maxim 5 propoziții'' este un prompt utilizabil.',
      'both',
      0
    ),
    (
      l03,
      'Ce se întâmplă când adaugi context specific la un prompt generic?',
      '["Modelul devine confuz din cauza prea multor informații", "Calitatea răspunsului se îmbunătățește semnificativ, deoarece modelul înțelege situația ta exactă", "Nu face nicio diferență — modelul oricum generează același tip de răspuns", "Promptul devine prea lung și modelul îl ignoră parțial"]',
      1,
      'Contextul specific este cheia diferenței dintre un răspuns generic și unul utilizabil imediat. Modelul poate personaliza tonul, vocabularul, exemplele și structura exact pentru situația ta.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 04 — Zero-Shot Prompting
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l04,
      'Zero-shot prompting înseamnă că:',
      '["Modelul nu are cunoștințe anterioare și trebuie instruit de la zero", "Trimiți o instrucțiune directă fără exemple prealabile, bazându-te pe cunoașterea generală a modelului", "Folosești un model care nu a fost antrenat anterior", "Ești la prima utilizare a unui model AI"]',
      1,
      'Zero-shot = fără exemple. Modelul folosește cunoașterea din training pentru a îndeplini task-ul direct din instrucțiune. Funcționează bine pentru task-uri comune și instrucțiuni clare.',
      'both',
      0
    ),
    (
      l04,
      'Când este recomandat să treci de la zero-shot la few-shot (cu exemple)?',
      '["Mereu — few-shot este întotdeauna superior", "Când zero-shot nu produce stilul, formatul sau tonul specific de care ai nevoie", "Niciodată — exemplele confundă modelul", "Doar pentru task-uri de programare"]',
      1,
      'Zero-shot funcționează bine pentru task-uri comune. Adaugi exemple când ai nevoie de un format specific, un ton particular sau o abordare neobișnuită pe care modelul nu o poate deduce doar din instrucțiune.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 06 — Few-Shot Prompting
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l06,
      'Few-shot prompting se referă la furnizarea de:',
      '["Câteva cuvinte în prompt pentru concizie", "2-5 exemple perechi input-output înainte de task-ul real, pentru a demonstra pattern-ul dorit", "Multiple modele AI testate simultan", "Prompts repetate pentru a verifica consistența"]',
      1,
      'Few-shot înseamnă să arăți modelului exemple ale input-ului și output-ului dorit. Modelul identifică pattern-ul din exemple și îl aplică la noul input — ca a arăta unui coleg 2-3 exemple de cum vrei lucrul făcut.',
      'both',
      0
    ),
    (
      l06,
      'Pentru ce tip de task este few-shot cel mai util?',
      '["Task-uri simple de traducere", "Task-uri care necesită un format sau ton foarte specific, greu de descris în cuvinte", "Generarea de cod Python", "Răspunsuri la întrebări factuale"]',
      1,
      'Când formatul sau stilul este greu de descris dar ușor de demonstrat, few-shot este ideal. Exemplele transmit pattern-ul mai eficient decât o descriere verbală. Util pentru clasificare, extragere de date, formatare specifică.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 07 — Chain of Thought
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l07,
      'Ce realizează Chain of Thought (CoT) față de un prompt standard?',
      '["Răspunsuri mai scurte și mai concise", "Ghidează modelul să-și arate raționamentul pas cu pas, reducând erorile la probleme complexe", "Accelerează procesarea promptului", "Generează mai multe variante de răspuns simultan"]',
      1,
      'CoT forțează modelul să ''gândească cu voce tare'' înainte de a da răspunsul final. Procesul de raționament explicit reduce erorile la probleme care implică mai mulți pași: matematică, logică, decizii multi-criteriu.',
      'both',
      0
    ),
    (
      l07,
      'Care este cel mai simplu mod de a activa Chain of Thought într-un prompt?',
      '["Adăugând ''Răspunde în format JSON''", "Adăugând ''Gândește pas cu pas'' sau ''Explică raționamentul tău''", "Folosind multiple exemple în prompt", "Specificând un rol de expert"]',
      1,
      'Fraza ''Gândește pas cu pas'' este trigger-ul clasic pentru CoT. Simplu, universal și eficient. Modelul va arăta procesul de raționament înainte de concluzie, ceea ce îmbunătățește calitatea la task-uri complexe.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 08 — Role Prompting
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l08,
      'De ce funcționează role prompting?',
      '["Creează un program separat în AI care simulează expertul", "Activează pattern-urile de vocabular, raționament și perspectivă ale acelui tip de expert din cunoașterea modelului", "Face modelul mai rapid pentru domenii specifice", "Debochează funcționalități ascunse ale modelului"]',
      1,
      'Modelul a absorbit texte produse de experți din toate domeniile. Specificând rolul, îi spui din care parte a cunoașterii sale să răspundă — vocabularul unui avocat, perspectiva unui medic, abordarea unui consultant.',
      'both',
      0
    ),
    (
      l08,
      'Care este structura de bază a unui rol eficient în prompt?',
      '["''Ești un robot avansat cu abilități speciale''", "''Ești un [titlul/expertiza], cu [experiență specifică], pentru [audiența ta]''", "''Comportă-te ca și cum ai fi expert''", "''Răspunde ca un professional în domeniu''"]',
      1,
      'Un rol eficient specifică titlul sau expertiza, opțional experiența relevantă și audiența. Cu cât mai specific, cu atât mai bine calibrat vocabularul și perspectiva răspunsului.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 09 — Instrucțiuni Negative
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l09,
      'Care este scopul principal al instrucțiunilor negative în prompting?',
      '["Să faci promptul mai scurt", "Să suprascrii comportamentele implicite ale modelului și să elimini conținut nedorit din output", "Să securizezi conversația de utilizatori neautorizați", "Să faci modelul mai creativ"]',
      1,
      'Modelele au tendințe implicite: introduceri lungi, expresii goale (''Desigur!''), clișee, disclaimere inutile. Instrucțiunile negative (''Fără introducere'', ''Fără clișee'') suprascriu aceste comportamente implicit.',
      'both',
      0
    ),
    (
      l09,
      'Câte instrucțiuni negative sunt suficiente într-un prompt obișnuit?',
      '["Cât mai multe posibil pentru a acoperi toate cazurile", "Zero — instrucțiunile negative slăbesc promptul", "2-3 instrucțiuni negative bine alese, adresând comportamentele care te deranjează cel mai mult", "Exact 10 pentru maximum de precizie"]',
      2,
      'Un prompt cu 20 de ''nu face'' devine greu de urmărit și poate produce comportament inconsistent. 2-3 instrucțiuni negative clare, adresând exact ce te deranjează repetat, sunt mult mai eficiente.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 11 — System Prompts
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l11,
      'Ce este un system prompt și când este procesat?',
      '["Un mesaj special trimis la sfârșitul conversației pentru rezumat", "Un set de instrucțiuni procesate de model înainte de orice mesaj al utilizatorului, definind comportamentul sesiunii", "O configurație tehnică a serverului AI", "Primul mesaj al utilizatorului în conversație"]',
      1,
      'System prompt-ul este processat înaintea oricărui mesaj al utilizatorului. Definește ''regulile jocului'': cine este asistentul, ce poate face, cum comunică și ce restricții are. Utilizatorul final nu îl vede.',
      'both',
      0
    ),
    (
      l11,
      'Care sunt componentele esențiale ale unui system prompt eficient?',
      '["Doar rolul și domeniul", "Identitate/rol, domeniu+limite, ton, format output și protecții", "Numai restricțiile de securitate", "Lista completă de lucruri pe care modelul nu le poate face"]',
      1,
      'Un system prompt complet acoperă: cine este asistentul (identitate), ce poate și ce nu poate face (domeniu+limite), cum comunică (ton), cum structurează răspunsurile (format) și cum gestionează situațiile dificile (protecții).',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 12 — Context Window
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l12,
      'Ce este fereastra de context (context window) a unui model AI?',
      '["Interfața grafică a aplicației AI", "Cantitatea maximă de text (în tokeni) pe care modelul o poate procesa simultan — memoria sa de lucru", "Viteza cu care modelul generează text", "Numărul de utilizatori care pot folosi modelul simultan"]',
      1,
      'Context window = memoria de lucru. Tot ce depășește această limită este ignorat complet de model. Gestionarea eficientă a contextului este esențială pentru aplicații cu conversații lungi sau documente mari.',
      'both',
      0
    ),
    (
      l12,
      'Care este cea mai eficientă strategie pentru a folosi un asistent care trebuie să ''cunoască'' o documentație de 200 de pagini?',
      '["Injectezi toată documentația în fiecare conversație", "Retrieval Augmented Generation (RAG) — stochezi documentația vectorial și recuperezi doar secțiunile relevante la runtime", "Rezumi documentația la 2 pagini", "Iei un model cu context window mai mare"]',
      1,
      'RAG permite stocarea documentației mari extern și recuperarea inteligentă a secțiunilor relevante la fiecare interogare. Este singura abordare scalabilă — injectarea întregii documentații depășește orice context window și costă enorm.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 13 — Formatarea Output-ului
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l13,
      'Când este recomandat să specifici formatul output-ului în prompt?',
      '["Niciodată — modelul alege întotdeauna formatul optim", "Oricând ai nevoie de structură precisă, lungime controlată sau un stil specific pentru downstream processing", "Doar pentru output-uri JSON care vor fi procesate de cod", "Numai în system prompts, nu în prompts individuale"]',
      1,
      'Fără instrucțiuni de format, modelul alege ce i se pare potrivit — rareori exact ce ai nevoie. Specificarea formatului (JSON, tabel, bullet points, lungime) este esențială când output-ul va fi utilizat direct sau procesat automat.',
      'both',
      0
    ),
    (
      l13,
      'Ce avantaj oferă cererea de output în format JSON față de text liber?',
      '["JSON este mai ușor de citit de oameni", "JSON permite procesarea automată programatică, cu câmpuri predictibile și structură garantată", "JSON reduce costul de tokeni", "JSON face modelul mai precis în răspunsuri"]',
      1,
      'JSON este ideal când output-ul va fi procesat de cod. Câmpurile sunt predictibile, parsarea este directă și structura este garantată (dacă promptul este bine construit). Esențial pentru integrări API și automatizări.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 14 — Temperature și Parametri
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l14,
      'Ce produce temperature = 0.0 la un model AI?',
      '["Modelul refuză să răspundă", "Output deterministic — același prompt produce (aproape) același răspuns de fiecare dată, selectând mereu tokenul cu probabilitatea cea mai mare", "Output complet aleator și creativ", "Răspunsuri mai scurte și mai rapide"]',
      1,
      'Temperature = 0 face generarea deterministă. Ideal pentru: extragere de date, clasificare, code generation, orice unde consistența și precizia contează mai mult decât creativitatea.',
      'both',
      0
    ),
    (
      l14,
      'Pentru ce tip de task este recomandat temperature înalt (0.8-1.0)?',
      '["Extragerea de date structurate dintr-un document", "Generarea de idei creative, brainstorming, scriere creativă unde varietatea și noutatea sunt dorite", "Clasificarea sentiment-ului unui text", "Traduceri precise din română în engleză"]',
      1,
      'Temperature înalt introduce mai multă ''variație'' în selecția tokenilor, producând output mai creativ și variat. Ideal pentru brainstorming, scriere creativă, generare de alternative. Evită-l pentru task-uri unde precizia și consistența sunt critice.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 16 — Tree of Thought
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l16,
      'Care este diferența principală dintre Chain of Thought și Tree of Thought?',
      '["CoT este mai nou și mai puternic decât ToT", "CoT urmează un singur fir liniar de raționament; ToT explorează multiple căi paralele, le evaluează și continuă cu cele mai promițătoare", "ToT funcționează doar pentru probleme matematice", "Nu există diferență practică între ele"]',
      1,
      'CoT = un drum de la problemă la soluție. ToT = un arbore unde la fiecare pas se generează și evaluează mai multe ramuri. ToT este mai puternic pentru probleme complexe cu multiple soluții posibile, dar și mai costisitor.',
      'both',
      0
    ),
    (
      l16,
      'Pentru ce tip de problemă este Tree of Thought cel mai potrivit?',
      '["Traducerea unui text scurt", "Probleme cu multiple soluții posibile, unde explorarea diferitelor abordări înainte de a alege direcția optimă are valoare", "Rezumarea unui articol", "Generarea unui email de business"]',
      1,
      'ToT strălucește la probleme de planificare, raționament strategic, puzzle-uri complexe sau orice situație unde există ramificații semnificative ale soluției. Nu merită costul pentru task-uri simple și liniare.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 17 — Self-Consistency
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l17,
      'Cum funcționează Self-Consistency în prompting?',
      '["Modelul verifică intern dacă răspunsul său este logic coerent", "Rulezi același prompt de N ori cu temperature > 0, colectezi N răspunsuri și alegi cel mai frecvent prin majority voting", "Folosești N modele AI diferite care votează răspunsul final", "Modelul generează un răspuns și îl verifică automat"]',
      1,
      'Self-Consistency rulează același prompt multiplu, generând variație prin temperature > 0. Răspunsul final = cel care apare cel mai des (majority voting). Ca un juriu: mai mulți deliberatori independenți, decizia = consens.',
      'both',
      0
    ),
    (
      l17,
      'Care este costul principal al Self-Consistency?',
      '["Răspunsuri mai puțin precise", "Costul este de N ori prețul unei singure generări, plus latență mai mare", "Nu există cost suplimentar", "Modelul se poate ''bloca'' în bucle infinite"]',
      1,
      'Self-Consistency costă N × prețul unui singur prompt. Cu N=5, plătești de 5 ori. Se justifică doar pentru probleme complexe unde acuratețea este critică și costul rămâne acceptabil.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 18 — ReAct Pattern
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l18,
      'ReAct Pattern combină ce două capacități?',
      '["Rapid și Accurate (Rapid + Accurate)", "Raționament (Reasoning) și Acțiune (Acting) — alternând între gândire și execuția de unelte externe", "Recuperare și Actualizare (Retrieval + Actualization)", "Reacție și Context (React + Context)"]',
      1,
      'ReAct = Reasoning + Acting. Modelul alternează: Thought (ce trebuie să fac), Action (execut o unealtă: search, calculator, API), Observation (procesez rezultatul). Permite modelelor să interacționeze cu lumea reală.',
      'both',
      0
    ),
    (
      l18,
      'Care este ciclul de bază al ReAct Pattern?',
      '["Prompt → Răspuns → Evaluare", "Thought → Action → Observation → (repeat until done)", "Input → Process → Output", "Request → Tool → Response"]',
      1,
      'Ciclul ReAct: Thought (raționament despre pasul următor), Action (apelul la o unealtă), Observation (rezultatul uneltei). Ciclul se repetă până când modelul are suficiente informații pentru răspunsul final.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 19 — Prompt Chaining
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l19,
      'Ce înseamnă Prompt Chaining?',
      '["Repeți același prompt de mai multe ori", "Împarți o sarcină complexă în pași secvențiali, unde output-ul fiecărui prompt devine input-ul următorului", "Conectezi mai multe modele AI în serie", "Folosești un singur prompt lung care face totul simultan"]',
      1,
      'Prompt Chaining = decompoziție secvențială. Pas 1 extrage, Pas 2 clasifică, Pas 3 generează. Fiecare pas primește output-ul pasului anterior. Permite specializarea și validarea la fiecare etapă.',
      'both',
      0
    ),
    (
      l19,
      'Care este principalul avantaj al Prompt Chaining față de un singur prompt lung?',
      '["Este mai ieftin în termeni de tokeni", "Permite validarea și controlul la fiecare etapă, specializarea fiecărui pas și izolarea erorilor", "Produce răspunsuri mai scurte", "Nu există avantaje — un singur prompt este mai simplu"]',
      1,
      'Cu un singur prompt lung, dacă ceva merge greșit nu știi unde. Cu Prompt Chaining poți verifica output-ul la fiecare pas, poți reîncerca pașii care eșuează și poți specializa fiecare prompt pentru sub-sarcina sa.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 21 — Prompting pentru Cod
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l21,
      'Ce este esențial să incluzi într-un prompt pentru debugging?',
      '["Istoricul complet al proiectului", "Mesajul de eroare exact (copy-paste) și codul relevant, nu parafrazat", "Versiunea sistemului de operare", "Câte linii de cod are funcția cu eroare"]',
      1,
      'Fără mesajul de eroare exact și codul relevant, modelul nu poate diagnostica problema. ''Am o eroare'' nu ajută. ''TypeError: NoneType + codul funcției'' permite o diagnoză precisă a cauzei și soluției.',
      'both',
      0
    ),
    (
      l21,
      'Care este anti-pattern-ul principal în prompting pentru generarea de cod?',
      '["Specificarea limbajului de programare", "Cererea de ''cel mai bun cod'' fără a defini ce înseamnă ''cel mai bun'' (viteza, lizibilitate, securitate?)", "Includerea type hints în cerere", "Specificarea cazurilor limită"]',
      1,
      '''Cel mai bun'' este nedefinit. Cel mai rapid? Cel mai lizibil? Cel mai sigur? Specifică dimensiunea care contează: ''optimizat pentru lizibilitate'', ''minimizând alocările de memorie'', ''cu focus pe securitate''.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 22 — Prompting pentru Analiza Datelor
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l22,
      'De ce trebuie să incluzi datele reale (sau un eșantion) în promptul pentru analiză?',
      '["Datele fac promptul mai lung și modelul mai atent", "AI-ul nu are acces la datele tale — fără ele, primești sfaturi generice, nu analiză specifică", "Datele ajută modelul să se antreneze mai bine", "Este o cerință tehnică a platformelor AI"]',
      1,
      'Modelul nu are acces la baza ta de date, foile tale Excel sau sistemele interne. Trebuie să furnizezi datele direct în prompt. Fără date reale, modelul poate oferi doar sfaturi generice despre cum să analizezi, nu analiza propriu-zisă.',
      'both',
      0
    ),
    (
      l22,
      'Când ceri generarea unui query SQL cu AI, ce informație este critică să incluzi?',
      '["Numărul de rânduri din tabelă", "Schema tabelei (numele coloanelor și tipurile) plus descrierea în cuvinte a ce vrei să obții", "Versiunea bazei de date", "Cât de des rulează query-ul"]',
      1,
      'Fără schema tabelei, modelul ghicește numele coloanelor și generează SQL care nu funcționează în baza ta de date. Schema + descrierea naturală a obiectivului = query funcțional din prima sau aproape.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 23 — Prompting pentru Scriere
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l23,
      'Ce trebuie să specifici mereu când ceri un text de marketing sau copywriting?',
      '["Culorile brandului", "Audiența țintă, tonul dorit, lungimea și obiectivul textului (informare, conversie, engagement)", "Software-ul de editare folosit", "Fontul preferat"]',
      1,
      'Un text de marketing fără audiență definită, ton și obiectiv clar produce conținut generic care nu convertește. ''Scrie un email'' vs ''Scrie un email pentru manageri IT 40-55 ani, ton direct, obiectiv: demo booking, maxim 150 cuvinte'' — diferența este dramatică.',
      'both',
      0
    ),
    (
      l23,
      'Cum obții 3 variante de headline pentru a testa cea mai eficientă?',
      '["Trimiți același prompt de 3 ori", "Ceri explicit ''Scrie 3 variante de headline cu abordări diferite: una bazată pe curiozitate, una pe beneficiu direct, una pe urgență''", "Folosești 3 modele AI diferite", "Modifici ușor promptul de fiecare dată"]',
      1,
      'Specificând nu doar numărul de variante, ci și abordarea diferită a fiecăreia, obții variante cu adevărat distincte pe care le poți testa comparativ. ''Scrie 3 variante'' fără direcție produce 3 variații minore ale aceleiași idei.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 24 — Prompting pentru Rezumare
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l24,
      'Ce informație face diferența între un rezumat generic și unul utilizabil?',
      '["Lungimea documentului de rezumat", "Audiența țintă, lungimea dorită și focus-ul specific (ce aspecte sunt prioritare)", "Formatul documentului original (PDF, Word, etc.)", "Modelul AI folosit pentru rezumare"]',
      1,
      'Un rezumat bun necesită context: pentru cine este (directori sau tehnicieni?), cât de lung (200 cuvinte sau 2 pagini?), ce aspecte prioritizezi (buget, termene, riscuri?). Fără aceste detalii, primești un rezumat complet dar neutilizabil în context.',
      'both',
      0
    ),
    (
      l24,
      'Ce este tehnica rezumatului stratificat (layered summary)?',
      '["Rezumarea documentului strat cu strat, de la suprafață la profunzime, simultan", "Cererea mai multor niveluri de detaliu în pași separați — rezumat scurt mai întâi, apoi expandarea punctelor cheie la cerere", "Utilizarea mai multor modele AI pentru a rezuma același document", "Împărțirea documentului în secțiuni și rezumarea lor independent"]',
      1,
      'Layered summary = pași separați. Primul prompt: rezumat de 3 propoziții. Al doilea: expandează punctul X. Al treilea: detaliază aspectul Y. Controlezi granularitatea la fiecare pas și eviți supraîncărcarea cu informații nedorite.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 26 — Agenți AI
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l26,
      'Ce distinge un agent AI de un chatbot standard?',
      '["Agentul are o interfață mai frumoasă", "Agentul poate executa acțiuni autonome cu unelte externe, nu doar genera text — poate căuta, calcula, scrie fișiere, apela API-uri", "Agentul este mai scump de utilizat", "Agentul răspunde mai rapid"]',
      1,
      'Un chatbot generează text. Un agent poate și acționa: caută pe web, rulează cod, apelează API-uri, gestionează fișiere. Această capacitate de acțiune autonomă, în cicluri Perceive-Plan-Act-Observe, este ce definește un agent.',
      'both',
      0
    ),
    (
      l26,
      'Ce este esențial să incluzi în instrucțiunea dată unui agent?',
      '["O descriere detaliată a istoricului companiei", "Obiectivul clar (ce trebuie obținut), constrângerile (ce nu are voie să facă) și condiția de oprire (când s-a terminat)", "Toate uneltele disponibile în detaliu tehnic", "Instrucțiuni pentru fiecare scenariu posibil"]',
      1,
      'Un agent fără obiectiv clar poate rula la infinit sau poate lua decizii neprevăzute. Obiectivul SMART + constrângeri + condiție de oprire = agent predictibil și eficient. ''Găsește X, nu accesa Y, oprește-te când ai Z'' este structura de bază.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 27 — Tool Use și Function Calling
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l27,
      'Ce este function calling / tool use la un model AI?',
      '["Funcționalitatea de a scrie cod sursă", "Capacitatea modelului de a decide când să apeleze funcții externe predefinite pentru a obține informații actuale sau a executa acțiuni", "Integrarea cu alte modele AI", "Capacitatea de a accesa internetul direct"]',
      1,
      'Function calling înseamnă că modelul poate ''apela'' funcții externe: web search, calculator, baze de date, API-uri. Modelul decide când o unealtă este necesară, formulează apelul în format JSON, primește rezultatul și continuă raționamentul.',
      'both',
      0
    ),
    (
      l27,
      'Când NU este recomandat să folosești tool use?',
      '["Niciodată — tool use este întotdeauna mai bun", "Pentru întrebări factuale simple din cunoașterea de training a modelului, unde tool use adaugă latență fără beneficiu", "Pentru orice calcul matematic", "Când utilizezi modele mai mici"]',
      1,
      'Tool use are cost (latență, tokens pentru definițiile uneltelor). Nu are sens pentru întrebări la care modelul răspunde corect din training. Folosește-l când ai nevoie de informații actuale, calcule precise sau acțiuni externe.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 28 — Sisteme Multi-Agent
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l28,
      'Care este rolul orchestratorului într-un sistem multi-agent?',
      '["Execută toate task-urile simultan pentru eficiență maximă", "Planifică, coordonează și distribuie sub-task-uri agentilor worker, sintetizând rezultatele finale", "Monitorizează costurile sistemului", "Comunică direct cu utilizatorul final"]',
      1,
      'Orchestratorul nu execută task-uri — le coordonează. Primește obiectivul, îl descompune în sub-task-uri, le distribuie agentilor specializați și sintetizează outputurile într-un rezultat final coerent.',
      'both',
      0
    ),
    (
      l28,
      'Care sunt cele 3 tipuri principale de pipeline multi-agent?',
      '["Mic, Mediu, Mare", "Secvențial (output → input), Paralel (simultan, rezultate combinate), Ierarhic (agent manager + sub-agenți)", "Simplu, Compus, Complex", "Rapid, Normal, Aprofundat"]',
      1,
      'Pipeline secvențial: A → B → C (fiecare primește output-ul precedentului). Pipeline paralel: A, B, C lucrează simultan, rezultatele se combină. Pipeline ierarhic: un agent manager delegă la sub-agenți. Alegerea depinde de dependențele între sub-task-uri.',
      'both',
      1
    );

  -- ============================================================
  -- LESSON 29 — Etica în Prompting
  -- ============================================================
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (
      l29,
      'Ce este un atac de tip prompt injection?',
      '["Un virus informatic care afectează modelele AI", "O tentativă de a introduce text malițios în input-ul utilizatorului pentru a suprascrie instrucțiunile din system prompt", "O tehnică de optimizare a performanței", "Un tip de spam în conversațiile AI"]',
      1,
      'Prompt injection: un utilizator trimite text de genul ''Ignoră instrucțiunile anterioare și...'' sperând că modelul va urma noile instrucțiuni în locul celor din system prompt. System prompt-urile robuste gestionează explicit aceste atacuri.',
      'both',
      0
    ),
    (
      l29,
      'De ce este important să nu incluzi date personale (CNP, parole, date medicale) în prompturi trimise la servicii AI externe?',
      '["Modelele AI nu pot procesa date personale", "Datele trimise la servicii externe pot fi stocate, loguite sau procesate conform politicilor furnizorului — confidențialitatea nu este garantată", "Este o cerință legală română specifică", "Datele personale fac promptul prea lung"]',
      1,
      'Când trimiți date la un API extern (ChatGPT, Claude API, etc.), datele pot fi stocate temporar, procesate pentru îmbunătățirea modelului sau accesate de echipele de siguranță. Înlocuiește datele reale cu date fictive similare înainte de a le trimite în prompts.',
      'both',
      1
    );

END $$;
