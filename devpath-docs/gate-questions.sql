-- Gate Questions for AI Fundamentals Course
-- Run AFTER sync-action has been executed (P1.6.1)
-- All questions use mode='both' → shown in both Simple and Technical modes
-- Theory lessons only: L01,02,03,05,06,07,08,10,11,12,15,16,17,18,20,21,22,25,26,27,28,29

DO $$
DECLARE
  course_uuid UUID;
  l01 UUID; l02 UUID; l03 UUID; l05 UUID; l06 UUID;
  l07 UUID; l08 UUID; l10 UUID; l11 UUID; l12 UUID;
  l15 UUID; l16 UUID; l17 UUID; l18 UUID; l20 UUID;
  l21 UUID; l22 UUID; l25 UUID; l26 UUID; l27 UUID;
  l28 UUID; l29 UUID;
BEGIN
  SELECT id INTO course_uuid FROM public.courses WHERE slug = 'ai-fundamentals';

  SELECT id INTO l01 FROM public.lessons WHERE course_id = course_uuid AND order_index = 1;
  SELECT id INTO l02 FROM public.lessons WHERE course_id = course_uuid AND order_index = 2;
  SELECT id INTO l03 FROM public.lessons WHERE course_id = course_uuid AND order_index = 3;
  SELECT id INTO l05 FROM public.lessons WHERE course_id = course_uuid AND order_index = 5;
  SELECT id INTO l06 FROM public.lessons WHERE course_id = course_uuid AND order_index = 6;
  SELECT id INTO l07 FROM public.lessons WHERE course_id = course_uuid AND order_index = 7;
  SELECT id INTO l08 FROM public.lessons WHERE course_id = course_uuid AND order_index = 8;
  SELECT id INTO l10 FROM public.lessons WHERE course_id = course_uuid AND order_index = 10;
  SELECT id INTO l11 FROM public.lessons WHERE course_id = course_uuid AND order_index = 11;
  SELECT id INTO l12 FROM public.lessons WHERE course_id = course_uuid AND order_index = 12;
  SELECT id INTO l15 FROM public.lessons WHERE course_id = course_uuid AND order_index = 15;
  SELECT id INTO l16 FROM public.lessons WHERE course_id = course_uuid AND order_index = 16;
  SELECT id INTO l17 FROM public.lessons WHERE course_id = course_uuid AND order_index = 17;
  SELECT id INTO l18 FROM public.lessons WHERE course_id = course_uuid AND order_index = 18;
  SELECT id INTO l20 FROM public.lessons WHERE course_id = course_uuid AND order_index = 20;
  SELECT id INTO l21 FROM public.lessons WHERE course_id = course_uuid AND order_index = 21;
  SELECT id INTO l22 FROM public.lessons WHERE course_id = course_uuid AND order_index = 22;
  SELECT id INTO l25 FROM public.lessons WHERE course_id = course_uuid AND order_index = 25;
  SELECT id INTO l26 FROM public.lessons WHERE course_id = course_uuid AND order_index = 26;
  SELECT id INTO l27 FROM public.lessons WHERE course_id = course_uuid AND order_index = 27;
  SELECT id INTO l28 FROM public.lessons WHERE course_id = course_uuid AND order_index = 28;
  SELECT id INTO l29 FROM public.lessons WHERE course_id = course_uuid AND order_index = 29;

  -- ───────────────────────────────────────────────
  -- LESSON 01 — Ce este Inteligența Artificială
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l01,
     'Care este un exemplu de AI pe care îl folosești zilnic?',
     '["Un ceas deșteptător", "Recomandările de pe Netflix", "O lampă cu senzor de mișcare", "Un calculator de buzunar"]',
     1,
     'Netflix analizează ce ai urmărit și găsește tipare pentru a-ți recomanda ce ți-ar plăcea — exact ce face AI: găsește pattern-uri în date.',
     'both', 0),
    (l01,
     'Ce face AI diferit față de programarea clasică?',
     '["Rulează mai rapid", "Învață din date, nu urmează reguli scrise manual", "Folosește mai multă memorie RAM", "Este scris într-un limbaj special"]',
     1,
     'Programarea clasică = reguli scrise manual. AI = înveți mașinăria să găsească singură regulile din exemple. Asta e diferența fundamentală.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 02 — Cum Gândește un Calculator
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l02,
     'Cum "vede" calculatorul o fotografie?',
     '["Ca o imagine cu culori", "Ca milioane de numere (valorile pixelilor)", "Ca un fișier text cu descrierea imaginii", "Nu poate procesa imagini"]',
     1,
     'Calculatorul vede doar numere. O imagine = o matrice de numere 0-255 per pixel per canal RGB. Asta procesează AI-ul, nu imaginea în sine.',
     'both', 0),
    (l02,
     'La ce este calculatorul (și AI-ul) cel mai bun?',
     '["Înțelegerea contextului emoțional", "Găsirea de pattern-uri în cantități mari de date", "Luarea deciziilor etice", "Creativitatea artistică spontană"]',
     1,
     'AI excelează la găsirea de pattern-uri repetitive în volume mari de date — mult mai rapid și consistent decât oamenii.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 03 — Tipuri de AI
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l03,
     'Ce tip de AI este ChatGPT?',
     '["AGI — poate face orice sarcină umană", "Narrow AI — specializat pe text și conversație", "Super AI — depășește inteligența umană", "Reactive AI — fără memorie"]',
     1,
     'ChatGPT e Narrow AI: excelent la text, dar nu poate conduce o mașină sau opera chirurgical. AGI (care poate face orice) nu există încă.',
     'both', 0),
    (l03,
     'Ce este AGI și de ce nu există încă?',
     '["Un AI care înțelege emoții", "Un AI care poate face orice sarcină cognitivă umană — dar nimeni nu a reușit să-l construiască", "Un AI mai rapid decât ChatGPT", "Un AI cu mai mult spațiu de stocare"]',
     1,
     'AGI = Artificial General Intelligence, capabil să înveți orice la nivelul unui om. Suntem departe de asta — toate sistemele actuale sunt Narrow AI.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 05 — Ce este Machine Learning
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l05,
     'Ce face Machine Learning diferit față de programarea clasică?',
     '["Rulează pe hardware special", "Găsește singur pattern-uri din date, fără reguli scrise manual", "Folosește mai puțin cod", "Este mai ușor de înțeles"]',
     1,
     'ML = programezi mașinăria să învețe din exemple, nu îi scrii reguli manual. Algoritmul găsește singur pattern-urile din date.',
     'both', 0),
    (l05,
     'Care sunt cele trei ingrediente esențiale pentru Machine Learning?',
     '["Hardware, software, internet", "Date, algoritm, putere de calcul", "Programator, AI, cloud", "Python, TensorFlow, GPU"]',
     1,
     'Fără date nu ai ce învăța, fără algoritm nu știi cum să înveți, fără putere de calcul nu poți procesa datele. Toate trei sunt necesare.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 06 — Supervised vs Unsupervised Learning
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l06,
     'Un medic etichetează mii de radiografii ca "tumoră" sau "sănătos" pentru a antrena un AI. Ce tip de learning este acesta?',
     '["Unsupervised Learning", "Supervised Learning", "Reinforcement Learning", "Transfer Learning"]',
     1,
     'Supervised Learning = ai date etichetate (cu răspunsul corect). Medicul a pus etichete → model învață din perechi (radiografie, diagnostic).',
     'both', 0),
    (l06,
     'Netflix grupează utilizatori cu gusturi similare fără să le spună ce grup este "corect". Ce tip de learning este acesta?',
     '["Supervised Learning", "Reinforcement Learning", "Unsupervised Learning", "Semi-supervised Learning"]',
     2,
     'Unsupervised Learning = găsești structuri ascunse fără etichete. Netflix nu știe dinainte câte grupuri există — algoritmul le descoperă singur.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 07 — Cum se Antrenează un Model
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l07,
     'Ce reprezintă "eroarea" în procesul de antrenare?',
     '["Numărul de exemple de antrenare", "Diferența dintre predicția modelului și răspunsul corect", "Viteza la care rulează modelul", "Numărul de parametri ai modelului"]',
     1,
     'Eroarea = cât de greșit e modelul. Dacă prezice 0.8 dar răspunsul corect e 1.0, eroarea e 0.2. Antrenarea = minimizarea acestei erori.',
     'both', 0),
    (l07,
     'De ce trebuie să testăm modelul pe date pe care NU le-a văzut în antrenare?',
     '["Ca să fie mai rapid", "Ca să verificăm că a memorat datele", "Ca să vedem dacă a învățat cu adevărat, nu doar a memorat", "Ca să economisim memorie"]',
     2,
     'Test set separat = verificare reală. Dacă modelul performează bine și pe date noi, a învățat pattern-uri generale. Dacă nu, a memorat.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 08 — Overfitting și Underfitting
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l08,
     'Un model are 98% acuratețe pe datele de antrenare dar doar 62% pe date noi. Ce problemă are?',
     '["Underfitting", "Overfitting", "Performanță normală", "Eroare de implementare"]',
     1,
     'Overfitting = modelul a memorat datele de antrenare în loc să învețe pattern-uri generale. Mare discrepanță train/test = semn clasic.',
     'both', 0),
    (l08,
     'Care este cea mai simplă soluție pentru overfitting?',
     '["Mărește modelul (mai mulți parametri)", "Antrenează mai multe epoci", "Adaugă mai multe date diverse de antrenare", "Micșorează learning rate"]',
     2,
     'Mai multe date diverse = modelul nu poate memora toate exemplele, e forțat să găsească pattern-uri generale. Cea mai eficientă soluție.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 10 — Neuronul Artificial
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l10,
     'Ce rol au "weights" (greutățile) unui neuron artificial?',
     '["Determină viteza de calcul", "Determină importanța fiecărui semnal de intrare", "Stabilesc câți neuroni are stratul următor", "Controlează memoria rețelei"]',
     1,
     'Weights = importanța fiecărei intrări. Un weight mare → acel input contează mult. Antrenarea = ajustarea weights-urilor pentru predicții mai bune.',
     'both', 0),
    (l10,
     'Ce face funcția de activare a unui neuron?',
     '["Calculează suma intrărilor", "Decide dacă neuronul transmite semnalul mai departe și cu ce intensitate", "Stochează informația din trecut", "Inițializează weights-urile"]',
     1,
     'Funcția de activare introduce non-linearitate. Fără ea, rețeaua ar fi doar o funcție liniară, incapabilă să învețe pattern-uri complexe.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 11 — Rețea Neuronală
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l11,
     'Ce face hidden layer (stratul ascuns) al unei rețele neuronale?',
     '["Primește datele de intrare", "Procesează și transformă informația în reprezentări intermediare", "Produce predicția finală", "Stochează weights-urile"]',
     1,
     'Hidden layers extrag caracteristici din ce în ce mai abstracte. Primul strat vede muchii, al doilea forme, al treilea obiecte complete.',
     'both', 0),
    (l11,
     'Care strat primește pixelii bruti ai unei imagini?',
     '["Hidden layer", "Output layer", "Input layer", "Activation layer"]',
     2,
     'Input layer = primul strat, primește datele brute (pixeli, numere, cuvinte tokenizate). Nu face nicio prelucrare, doar transmite mai departe.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 12 — Deep Learning
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l12,
     'De ce se numește "Deep" Learning?',
     '["Procesează date profunde (sensibile)", "Folosește rețele cu multe straturi ascunse (deep = adânc)", "Înțelege concepte profunde filosofice", "Necesită servere foarte performante"]',
     1,
     'Deep = adânc în engleză. Se referă la numărul de straturi ascunse (hidden layers). Mai multe straturi = capabilitate de a învăța pattern-uri mai complexe.',
     'both', 0),
    (l12,
     'Ce este Transfer Learning?',
     '["Transferul datelor de antrenare între servere", "Reutilizarea unui model deja antrenat ca punct de start pentru o sarcină nouă", "Migrarea modelului de pe CPU pe GPU", "Copierea weights-urilor între doi neuroni"]',
     1,
     'Transfer Learning = nu reînveți de la zero. Pornești de la un model antrenat pe milioane de exemple și îl ajustezi pentru sarcina ta specifică.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 15 — Language Models
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l15,
     'Ce face de fapt un language model când generează text?',
     '["Caută răspunsul în internet", "Prezice cel mai probabil cuvânt/token următor, repetat", "Citează din baza sa de date", "Traduce gândul în cuvinte"]',
     1,
     'LM-urile sunt predictori de secvențe: la fiecare pas aleg cel mai probabil token următor dat contextul anterior. Întregul text = serie de predicții.',
     'both', 0),
    (l15,
     'Ce controlează "temperatura" unui language model?',
     '["Viteza de generare a textului", "Cât de previzibil sau creativ este răspunsul", "Numărul de tokeni generați", "Calitatea traducerii"]',
     1,
     'Temperature 0 = mereu cel mai probabil răspuns (predictibil). Temperature înaltă = distribuție mai plată → răspunsuri mai diverse/creative/haotice.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 16 — Transformers
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l16,
     'Ce este mecanismul de Attention în Transformers?',
     '["Un filtru care elimină cuvintele irelevante", "Permite modelului să vadă relațiile dintre orice două cuvinte din text simultan", "O metodă de compresie a textului", "Stratul final care generează output-ul"]',
     1,
     'Self-attention = fiecare token "se uită" la toți ceilalți tokeni și decide cât de relevant e fiecare pentru înțelegerea sa. Asta permite capturarea dependențelor la distanță.',
     'both', 0),
    (l16,
     'De ce folosim Multi-Head Attention în loc de un singur head?',
     '["Pentru a fi mai rapid", "Ca să procesăm mai mulți tokeni", "Ca rețeaua să poată urmări simultan multiple tipuri de relații (sintactice, semantice, etc.)", "Pentru a reduce consumul de memorie"]',
     2,
     'Fiecare head de attention se specializează pe un tip de relație. Împreună capturează o imagine completă: un head poate urmări relațiile gramaticale, altul coreferiența.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 17 — Tokenizare
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l17,
     'Ce este un token în contextul unui language model?',
     '["Un cuvânt complet din dicționar", "O bucată de text (poate fi cuvânt, silabă sau literă) pe care modelul o procesează ca unitate", "O propoziție completă", "Un caracter individual"]',
     1,
     'Token ≠ cuvânt. Algoritmul BPE divide textul în bucăți frecvente. "tokenizare" poate fi 3 tokeni: "token", "iz", "are". Depinde de frecvența în datele de antrenare.',
     'both', 0),
    (l17,
     'De ce contează numărul de tokeni dintr-un prompt?',
     '["Afectează doar viteza afișării", "Determină costul API și dacă încap în context window", "Influențează calitatea gramaticii", "Nu contează, e gestionat automat"]',
     1,
     'API-urile AI costă per token (input + output). Contextul are o limită maximă de tokeni. Prompturi lungi = cost mai mare și risc de depășire a contextului.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 18 — Context Window
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l18,
     'Ce este context window-ul unui model AI?',
     '["Fereastra de browser în care rulezi AI-ul", "Cantitatea maximă de text (tokeni) pe care modelul o poate procesa simultan", "Memoria permanentă a modelului", "Numărul maxim de utilizatori simultani"]',
     1,
     'Context window = câți tokeni pot fi "în minte" simultan: promptul + istoricul conversației + răspunsul. Depășești limita → modelul "uită" mesajele vechi.',
     'both', 0),
    (l18,
     'De ce ChatGPT "uită" conversațiile anterioare când deschizi o sesiune nouă?',
     '["Are o politică de confidențialitate strictă", "Nu are memorie permanentă — ține minte doar ce e în context window-ul curent", "Sesiunile sunt criptate", "Serverele se resetează periodic"]',
     1,
     'LLM-urile nu au memorie persistentă. "Amintirile" = textul din context window. Sesiune nouă = context gol = zero memorie. Asta e arhitectura fundamentală.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 20 — Ce este un Prompt
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l20,
     'Care este cel mai important principiu al unui prompt bun?',
     '["Să fie cât mai scurt posibil", "Să fie specific: să precizeze ce, cum, în ce format și cu ce limitări", "Să conțină cuvinte tehnice", "Să înceapă întotdeauna cu o întrebare"]',
     1,
     'AI-ul execută literal instrucțiunile tale. Vag in = vag out. Un prompt complet precizează sarcina, contextul, formatul dorit și limitările.',
     'both', 0),
    (l20,
     'Ce face system prompt-ul dintr-o conversație cu AI?',
     '["Prima întrebare a utilizatorului", "Instrucțiunile invizibile care stabilesc personalitatea și regulile AI-ului pentru toată conversația", "Rezumatul automat al conversației", "Comanda de inițializare a serverului"]',
     1,
     'System prompt = fișa postului AI-ului, citită la fiecare mesaj. Stabilește rolul, tonul, limitele și regulile — înainte ca utilizatorul să scrie primul cuvânt.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 21 — Tehnici de Bază Prompt Engineering
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l21,
     'Ce este few-shot prompting?',
     '["A pune o singură întrebare scurtă", "A furniza câteva exemple concrete în prompt înainte de sarcina reală", "A folosi AI-ul de puține ori pe zi", "A limita lungimea răspunsului"]',
     1,
     'Few-shot = dai AI-ului 2-5 exemple de format intrare→ieșire înainte de sarcina reală. Modelul înțelege ce format și ton vrei fără instrucțiuni explicite.',
     'both', 0),
    (l21,
     'De ce Chain-of-Thought (CoT) prompting îmbunătățește acuratețea la probleme complexe?',
     '["Reduce numărul de tokeni folosiți", "Forțează modelul să explice pașii intermediari, reducând erorile de raționament", "Accelerează generarea textului", "Permite accesul la internet"]',
     1,
     'CoT = "gândește pas cu pas". Externalizarea raționamentului în text permite modelului să nu "sară" la o concluzie greșită și să corecteze erori intermediare.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 22 — Roluri și System Prompts
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l22,
     'Ce este system prompt-ul în arhitectura unei conversații AI?',
     '["Primul mesaj al utilizatorului", "Instrucțiunile cu prioritate maximă care definesc comportamentul AI-ului pentru toată sesiunea", "Răspunsul automat de bun venit", "Configurarea serverului de AI"]',
     1,
     'System prompt are prioritatea maximă în ierarhia mesajelor. Definește identitatea, limitele și regulile AI-ului — ca un contract invizibil.',
     'both', 0),
    (l22,
     'Când e util să dai un rol explicit AI-ului în system prompt?',
     '["Niciodată — înrăutățește răspunsurile", "Când vrei răspunsuri specializate, consistente, adaptate unui context specific", "Doar pentru chatboți de customer service", "Numai în aplicații cu cod Python"]',
     1,
     'Rolul activ (ex: "Ești un profesor de matematică pentru liceu") calibrează vocabularul, profunzimea și tonul pentru audiența ta. Crește relevanța și consistența.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 25 — OpenAI API
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l25,
     'Ce este un API în contextul utilizării AI?',
     '["Un tip de model AI mai rapid", "O interfață prin care aplicația ta trimite cereri și primește răspunsuri de la un model AI extern", "Un limbaj de programare pentru AI", "O platformă de hosting pentru modele"]',
     1,
     'API = Application Programming Interface. Aplicația ta → request HTTP → serverele OpenAI → procesare model → response JSON. Tu nu rulezi modelul local.',
     'both', 0),
    (l25,
     'Ce avantaj oferă streaming-ul față de a aștepta răspunsul complet?',
     '["Reduce costul per token", "Textul apare imediat token cu token, ca ChatGPT, îmbunătățind experiența utilizatorului", "Îmbunătățește calitatea răspunsului", "Elimină necesitatea API key-ului"]',
     1,
     'Streaming = răspunsul apare progresiv, nu după 10-15 secunde de ecran gol. Experiența utilizatorului e dramatică mai bună — percepe că AI-ul "gândește" în timp real.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 26 — RAG (Retrieval-Augmented Generation)
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l26,
     'Ce problemă rezolvă RAG (Retrieval-Augmented Generation)?',
     '["Face modelul mai rapid", "Permite modelului să răspundă cu informații din documente proprii, peste cunoașterea de bază", "Reduce costul API-ului", "Elimină hallucinations complet"]',
     1,
     'LLM-urile au knowledge cutoff (nu știu de ieri). RAG injectează documente relevante în context înainte de generare — modelul "citește" sursa ta, nu inventează.',
     'both', 0),
    (l26,
     'Ce sunt embeddings și de ce sunt necesare în RAG?',
     '["Fișiere comprimate cu datele de antrenare", "Reprezentări numerice ale textului care permit căutarea semantică a documentelor relevante", "Modele mini pentru calcule locale", "Indecșii de căutare clasici (keyword-based)"]',
     1,
     'Embeddings = vectori care captează sensul textului. Căutarea semantică găsește documente relevante conceptual, nu doar lexical. Fără embeddings, RAG nu poate identifica ce document să injecteze.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 27 — AI Agents
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l27,
     'Ce face un AI agent diferit față de un simplu chatbot?',
     '["Răspunde mai rapid", "Poate lua acțiuni reale în lume — caută pe internet, execută cod, modifică fișiere", "Are o personalitate mai prietenoasă", "Folosește un model mai mare"]',
     1,
     'Chatbot = text in, text out. Agent = text in, acțiuni reale out. Agentul poate apela tools, executa pași multipli, și adapta planul în funcție de rezultate.',
     'both', 0),
    (l27,
     'Ce este "tool use" (function calling) în contextul agenților AI?',
     '["Utilizarea corectă a tastaturii de către utilizator", "Capacitatea AI-ului de a apela funcții externe și de a folosi rezultatele în raționament", "Un plugin pentru IDE-uri de programare", "Selectarea modelului AI potrivit"]',
     1,
     'Tool use = AI-ul poate invoca funcții definite de tine (căutare web, calculatoare, DB queries) și primește rezultatele înapoi pentru a continua raționamentul.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 28 — Etică și Siguranță AI
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l28,
     'De unde provin biasurile (prejudecățile) din sistemele AI?',
     '["Din programarea deliberată a dezvoltatorilor", "Din datele de antrenare care reflectă inegalitățile și prejudecățile din lumea reală", "Din hardware-ul folosit", "Din interfața grafică"]',
     1,
     'AI = oglindă a datelor. Dacă datele de antrenare conțin bias istoric (ex: CV-uri din industrii dominate de bărbați), modelul perpetuează și amplifică acel bias.',
     'both', 0),
    (l28,
     'Ce categorizează EU AI Act pentru aplicațiile cu risc inacceptabil?',
     '["Sisteme costisitoare de antrenare", "Sisteme care amenință drepturile fundamentale — scoring social, manipulare subliminală, recunoaștere facială în spații publice", "Modele cu mai mult de 100B parametri", "Aplicații care folosesc date personale"]',
     1,
     'EU AI Act interzice total sistemele cu risc inacceptabil: scoring social al cetățenilor, exploatare subliminală, biometrie în timp real în spații publice.',
     'both', 1);

  -- ───────────────────────────────────────────────
  -- LESSON 29 — Piața Muncii și AI
  -- ───────────────────────────────────────────────
  INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
  VALUES
    (l29,
     'Ce tip de joburi sunt cel mai puțin afectate de automatizarea AI?',
     '["Introducere date și clasificare documente", "Judecată contextuală, empatie, creativitate și responsabilitate cu miză mare", "Traduceri standard și rapoarte automate", "Răspunsuri la întrebări frecvente"]',
     1,
     'AI elimină task-urile repetitive și bine definite. Rămân valoroase: creativitatea, judecata etică, relațiile umane, domenii cu prezență fizică sau decizie cu consecințe mari.',
     'both', 0),
    (l29,
     'Care este combinația câștigătoare pe piața muncii AI în 2025?',
     '["Să știi doar prompt engineering", "Să fii expert tehnic AI fără expertiză de domeniu", "AI + expertiză de domeniu specific (medicină, drept, educație, etc.)", "Să ai cât mai multe certificări AI"]',
     2,
     'AI + domeniu = valoare rară. Un cardiolog care știe AI medical e mult mai greu de înlocuit decât un generalist. Combinația e mai valoroasă decât oricare separat.',
     'both', 1);

END $$;
