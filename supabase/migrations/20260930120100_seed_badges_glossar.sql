-- ─────────────────────────────────────────────────────────────────────────────
-- 20260930120100_seed_badges_glossar.sql
-- Deploy-MVP Phase 2 — catalog seed data for the fresh project:
--   • 25 badges (devpath-docs/devpath-vision.md → "Badges System"; slugs match
--     tryAward() in src/lib/gamification.ts and BADGE_CATEGORY in the admin page)
--   • 50 glossary terms (the curated list from src/app/api/admin/seed-glossar/route.ts,
--     which cannot run on RLS: glossar_terms has SELECT-only policies)
-- Idempotent: badges upsert on slug; glossary terms insert only if the term is absent.
-- NOTE: cod_rulat and programator_in_formare are seeded per the 25-badge spec but
--   have no awarding code yet (programator_in_formare depended on the retired
--   learning_mode). xp_reward is 0 — badge XP is not awarded anywhere in the app.
-- NO quiz questions / interactive-layer rows are seeded here on purpose.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.badges (slug, name, icon, description, xp_reward)
values
  ('prima_lectie', 'Prima Lecție', '🌱', 'Ai completat prima ta lecție pe DevPath RO. Totul începe cu un singur pas.', 0),
  ('primul_modul', 'Primul Modul', '📦', 'Ai terminat toate lecțiile dintr-un modul întreg. Structura începe să apară.', 0),
  ('primul_curs', 'Primul Curs', '🎓', 'Un curs întreg completat. Aceasta e o realizare reală — nu oricine ajunge aici.', 0),
  ('la_jumatate', 'La Jumătate', '⚡', 'Ai terminat jumătate dintr-un curs. Cea mai grea parte e depășită.', 0),
  ('tocilarul', 'Tocilarul', '📚', 'Ai trecut toate quiz-urile dintr-un curs. Se vede că ai citit cu atenție.', 0),
  ('maini_murdare', 'Mâini Murdare', '🛠️', 'Ai completat primul tău exercițiu practic. Teoria e bună — practica e mai bună.', 0),
  ('constructor', 'Constructor', '🏗️', 'Ai trimis primul tău proiect. Ai construit ceva cu propriile mâini.', 0),
  ('complet', 'Complet!', '✅', 'Ai terminat toate modulele unui curs. Nu mulți pot spune asta.', 0),
  ('trei_zile', 'Trei Zile La Rând', '🔥', 'Trei zile consecutive de învățare. Obiceiurile se formează în 21 de zile — ești la start.', 0),
  ('o_saptamana', 'O Săptămână', '🔥🔥', 'Șapte zile la rând. Săptămâna asta a contat.', 0),
  ('doua_saptamani', 'Două Săptămâni', '⚡🔥', '14 zile consecutive. La această rată, în 6 luni vei ști mai mult despre AI decât 95% din România.', 0),
  ('o_luna', 'O Lună', '🏆🔥', '30 de zile la rând. Aceasta nu mai e o încercare — e cine ești tu acum.', 0),
  ('legenda', 'Legenda', '👑', '100 de zile consecutive. Într-un an de azi, vei privi înapoi la această zi.', 0),
  ('perfect_primul', 'Perfect!', '💯', 'Primul quiz cu scor 100%. Se poate — și tu ai demonstrat-o.', 0),
  ('geniu_in_formare', 'Geniu în Formare', '🧠', 'Cinci quiz-uri cu scor perfect. Nu e noroc — e cunoaștere reală.', 0),
  ('cod_rulat', 'Cod Rulat', '💻', 'Primul tău cod Python executat în browser. Bun venit în lumea programatorilor.', 0),
  ('jucaus_perfect', 'Jucăuș Perfect', '🎮', 'Scor perfect la un mini-joc. Reflexele tale de învățare sunt ascuțite.', 0),
  ('cartele_dibace', 'Cartele Dibace', '🃏', 'Prima sesiune de flashcarduri completată. Memoria ta mulțumește.', 0),
  ('programator_in_formare', 'Programator în Formare', '⚙️', 'Ai activat Modul Tehnic. Vrei să mergi mai adânc — respectabil.', 0),
  ('vocea_comunitatii', 'Vocea Comunității', '💬', 'Primul comentariu postat. Cunoașterea ta ajută acum și pe alții.', 0),
  ('ambasador', 'Ambasador', '🤝', 'Primul prieten adus pe platformă. Cel mai bun lucru pe care îl poți face pentru cineva drag.', 0),
  ('recrutorul', 'Recrutorul', '🌐', 'Trei prieteni aduși pe platformă. Construiești o comunitate.', 0),
  ('vitrina_deschisa', 'Vitrina Deschisă', '🌟', 'Profilul tău public e în lume. Învățarea ta e acum vizibilă pentru oricine.', 0),
  ('bufnita_de_noapte', 'Bufnița de Noapte', '🦉', 'Ai completat o lecție între miezul nopții și 4 dimineața. Unii învață când lumea doarme.', 0),
  ('sarbatoare_cu_minte', 'Sărbătoare cu Minte', '🎊', 'Ai învățat într-o zi de sărbătoare națională. Dragobete, Crăciun sau 1 Decembrie — mintea ta nu ia vacanță.', 0)
on conflict (slug) do update
  set name        = excluded.name,
      icon        = excluded.icon,
      description = excluded.description,
      xp_reward   = excluded.xp_reward;

insert into public.glossar_terms (term, definition, category)
select v.term, v.definition, v.category
  from (values
  ('Inteligență Artificială', 'Inteligența Artificială (IA) este ramura informaticii care creează sisteme capabile să execute sarcini ce necesită în mod normal inteligență umană, cum ar fi recunoașterea imaginilor sau traducerea limbilor. IA îngustă rezolvă o singură problemă bine definită (de ex. un filtru de spam), în timp ce IA generală ar putea realiza orice sarcină intelectuală la nivel uman, dar nu există încă.', 'AI General'),
  ('Algoritm', 'Un algoritm este o secvență finită și bine definită de instrucțiuni care rezolvă o problemă sau îndeplinește o sarcină. În inteligența artificială, algoritmii definesc cum un model învață din date, cum face predicții și cum se optimizează în timp.', 'AI General'),
  ('Model', 'Un model AI este un program matematic antrenat pe date care poate face predicții sau genera rezultate pentru date noi. Modelul este produsul final al procesului de antrenare — echivalentul unui creier artificial specializat pe o anumită sarcină.', 'AI General'),
  ('Inferență', 'Inferența este procesul prin care un model AI deja antrenat generează predicții sau răspunsuri pentru date noi. Este etapa de "utilizare" a modelului, spre deosebire de antrenare care este etapa de "învățare".', 'AI General'),
  ('Antrenare', 'Antrenarea este procesul prin care un model AI ajustează parametrii interni (ponderile) pe baza unui set de date, cu scopul de a minimiza erorile. Este analogă cu studiul uman: modelul vede multe exemple și învață să recunoască tipare.', 'AI General'),
  ('Date de antrenare', 'Datele de antrenare sunt setul de exemple folosite pentru a antrena un model AI. Calitatea și diversitatea acestor date influențează direct performanța modelului — un model antrenat pe date de slabă calitate va face predicții slabe.', 'AI General'),
  ('Date de test', 'Datele de test sunt un set separat de exemple, nevăzute în timpul antrenării, folosite pentru a evalua cât de bine generalizează modelul pe date noi. Dacă modelul performează bine pe datele de antrenare, dar slab pe cele de test, este un semn de overfitting.', 'AI General'),
  ('Benchmark', 'Un benchmark este un set standardizat de teste sau probleme folosit pentru a compara performanța diferitelor modele AI în condiții identice. Exemple celebre: GLUE (NLP), ImageNet (viziune), MMLU (raționament general).', 'AI General'),
  ('Deployment', 'Deployment-ul (sau punerea în producție) este procesul de integrare a unui model AI antrenat într-o aplicație reală, accesibilă utilizatorilor finali. Implică aspecte tehnice precum scalabilitate, latență, monitorizare și actualizare continuă.', 'AI General'),
  ('Bias', 'Bias-ul în AI se referă la tendința unui model de a produce rezultate sistematic incorecte sau nedrepte față de anumite grupuri sau cazuri. Apare din date de antrenare ne-reprezentative sau din presupuneri greșite în design-ul algoritmului.', 'AI General'),
  ('Machine Learning', 'Machine Learning (Învățare Automată) este o ramură a AI în care calculatoarele învață din date fără a fi programate explicit pentru fiecare sarcină. În loc de reguli scrise manual, modelul descoperă singur tipare în date.', 'ML'),
  ('Supervised Learning', 'Supervised Learning (Învățarea Supravegheată) este metoda prin care modelul este antrenat pe perechi de intrare-ieșire etichetate. Modelul învață să prezică ieșirea corectă pentru date noi, pe baza exemplelor anterioare. Exemple: clasificarea emailurilor ca spam sau recunoașterea cifrelor scrise de mână.', 'ML'),
  ('Unsupervised Learning', 'Unsupervised Learning (Învățarea Nesupravegheată) este metoda prin care modelul descoperă structuri sau tipare în date fără etichete prestabilite. Este folosit pentru clustering (gruparea clienților similari) sau reducerea dimensionalității.', 'ML'),
  ('Reinforcement Learning', 'Reinforcement Learning (Învățarea prin Recompensă) este un paradigm în care un agent ia decizii într-un mediu și primește recompense sau penalizări în funcție de acțiunile sale. Prin maximizarea recompensei cumulate, agentul învață strategii optime — așa a fost antrenat AlphaGo.', 'ML'),
  ('Regresie', 'Regresia este un tip de problemă de Machine Learning în care modelul prezice o valoare numerică continuă (de ex. prețul unei case sau temperatura de mâine). Cel mai simplu exemplu este regresia liniară, care găsește o linie dreaptă ce se potrivește cel mai bine datelor.', 'ML'),
  ('Clasificare', 'Clasificarea este un tip de problemă de Machine Learning în care modelul atribuie fiecărui exemplu o categorie discretă (de ex. pisică sau câine, spam sau nu). Spre deosebire de regresie, ieșirea este o etichetă, nu o valoare continuă.', 'ML'),
  ('Clustering', 'Clustering este tehnica de grupare automată a datelor în clustere (grupe) pe baza similarității, fără etichete prestabilite. Algoritmul K-Means, de exemplu, grupează clienții unui magazin în segmente cu comportamente similare de cumpărare.', 'ML'),
  ('Gradient Descent', 'Gradient Descent (Coborârea Gradientului) este algoritmul de optimizare folosit pentru a antrena modele AI. Ajustează iterativ ponderile modelului în direcția care reduce cel mai mult eroarea, asemănător cu coborârea unei pante spre cel mai jos punct dintr-un peisaj.', 'ML'),
  ('Learning Rate', 'Learning Rate (Rata de Învățare) este un hyperparametru care controlează cât de mari sunt pașii de ajustare a ponderilor în fiecare iterație de antrenare. Prea mare: modelul oscilează și nu converge; prea mic: antrenarea e lentă și poate rămâne blocată în minime locale.', 'ML'),
  ('Overfitting', 'Overfitting-ul apare când modelul memorează datele de antrenare în loc să învețe tipare generalizabile. Modelul performează excelent pe datele de antrenare, dar slab pe date noi. Este echivalentul unui elev care memorează răspunsurile exacte fără să înțeleagă materia.', 'ML'),
  ('Underfitting', 'Underfitting-ul apare când modelul este prea simplu pentru a capta tiparul din date, performând slab atât pe datele de antrenare, cât și pe datele de test. Este opusul overfitting-ului — modelul nu a "învățat" suficient.', 'ML'),
  ('Cross-validation', 'Cross-validation este o tehnică de evaluare a modelelor care împarte datele în mai multe subseturi (fold-uri), antrenând și testând modelul pe combinații diferite. Oferă o estimare mai robustă a performanței decât o singură împărțire train/test.', 'ML'),
  ('Deep Learning', 'Deep Learning (Învățarea Profundă) este o subramură a Machine Learning care utilizează rețele neuronale artificiale cu mai multe straturi ascunse. Excelează la sarcini precum recunoașterea imaginilor, traducerea automată și generarea de text.', 'DL'),
  ('Rețea Neuronală', 'O rețea neuronală artificială este un sistem de calcul inspirat din creierul uman, format din neuroni artificiali organizați în straturi. Fiecare neuron primește intrări, le procesează și transmite un semnal mai departe, formând lanțuri de calcul complexe.', 'DL'),
  ('Neuron Artificial', 'Un neuron artificial este unitatea de bază a unei rețele neuronale. Primește mai multe valori de intrare, le înmulțește cu ponderi (weights), adună rezultatele și aplică o funcție de activare pentru a produce o ieșire. Este analogul matematic al neuronului biologic.', 'DL'),
  ('Strat Ascuns', 'Un strat ascuns (hidden layer) este un strat intermediar de neuroni dintr-o rețea neuronală, plasat între stratul de intrare și cel de ieșire. Straturile ascunse permit rețelei să învețe reprezentări complexe și abstracte ale datelor.', 'DL'),
  ('Backpropagation', 'Backpropagation (propagarea înapoi a erorii) este algoritmul prin care o rețea neuronală calculează contribuția fiecărui parametru la eroarea totală și ajustează ponderile corespunzător. Este "inima" antrenării rețelelor neuronale profunde.', 'DL'),
  ('Funcție de Activare', 'Funcția de activare introduce non-linearitate într-un neuron artificial, permițând rețelei să înțeleagă tipare complexe. Fără funcții de activare, oricâte straturi ar avea, rețeaua s-ar comporta ca o simplă transformare liniară.', 'DL'),
  ('ReLU', 'ReLU (Rectified Linear Unit) este cea mai populară funcție de activare, definită simplu ca: f(x) = max(0, x). Lasă valorile pozitive neschimbate și le transformă pe cele negative în zero. Este eficientă computațional și ajută la evitarea problemei gradientului care dispare.', 'DL'),
  ('Dropout', 'Dropout este o tehnică de regularizare care, în timpul antrenării, dezactivează aleatoriu un procent din neuroni la fiecare iterație. Forțează rețeaua să nu depindă de neuroni individuali și previne overfitting-ul, îmbunătățind generalizarea.', 'DL'),
  ('Batch Normalization', 'Batch Normalization normalizează activările din fiecare strat pe parcursul unui mini-batch, stabilizând procesul de antrenare. Accelerează convergența, permite rate de învățare mai mari și reduce sensibilitatea față de inițializarea ponderilor.', 'DL'),
  ('Convolutional Neural Network', 'CNN (Rețeaua Neuronală Convoluțională) este arhitectura de Deep Learning optimizată pentru procesarea imaginilor. Folosește filtre care scanează imaginea pentru a detecta caracteristici locale (muchii, texturi, forme), organizate ierarhic de la simple la complexe.', 'DL'),
  ('NLP', 'NLP (Natural Language Processing — Procesarea Limbajului Natural) este ramura AI care se ocupă cu înțelegerea și generarea textului uman de către calculatoare. Include sarcini precum traducerea automată, analiza sentimentelor, rezumarea textului și chatboții.', 'NLP'),
  ('Token', 'Un token este unitatea de bază cu care lucrează modelele de limbaj. Poate fi un cuvânt întreg, o parte de cuvânt sau un semn de punctuație. De exemplu, cuvântul "antrenare" poate fi împărțit în token-urile ["antr", "en", "are"].', 'NLP'),
  ('Tokenizare', 'Tokenizarea este procesul de împărțire a textului în token-uri (unități de bază) pentru a fi procesat de un model de limbaj. Fiecare model are propriul vocabular de token-uri, iar textul este convertit într-o secvență de identificatori numerici.', 'NLP'),
  ('Embedding', 'Un embedding este o reprezentare numerică densă a unui cuvânt, token sau document într-un spațiu vectorial. Cuvintele cu sens similar au vectori apropiați. De exemplu, vectorii pentru "rege" și "regină" ar fi similari, iar distanța față de "autobuz" ar fi mare.', 'NLP'),
  ('Transformer', 'Transformer este arhitectura revoluționară introdusă în 2017 ("Attention Is All You Need") care stă la baza tuturor modelelor moderne de limbaj (GPT, BERT, LLaMA). Procesează textul în paralel folosind mecanismul de atenție, fiind mult mai eficient decât arhitecturile anterioare secvențiale.', 'NLP'),
  ('Attention', 'Mecanismul de atenție (Attention) permite unui model să se concentreze pe diferite părți ale intrării atunci când generează fiecare element de ieșire. Când traduce "Il mange une pomme", modelul "acordă atenție" cuvântului corect din franceză pentru fiecare cuvânt englezesc generat.', 'NLP'),
  ('Context Window', 'Context Window (Fereastra de Context) reprezintă numărul maxim de token-uri pe care un model de limbaj le poate procesa simultan. GPT-4 are un context de 128.000 token-uri (~300 pagini). Textul care depășește această limită este ignorat de model.', 'NLP'),
  ('Prompt', 'Un prompt este textul de intrare furnizat unui model de limbaj pentru a obține un răspuns. Calitatea și formularea promptului influențează dramatic calitatea răspunsului — de aceea există "Prompt Engineering" ca disciplină separată.', 'NLP'),
  ('Fine-tuning', 'Fine-tuning-ul este procesul de antrenare suplimentară a unui model pre-antrenat (de exemplu GPT) pe un set de date specific unui domeniu sau sarcini. Permite adaptarea unui model general la un caz de utilizare particular fără a-l antrena de la zero.', 'NLP'),
  ('RAG', 'RAG (Retrieval-Augmented Generation) este o tehnică prin care un model de limbaj este combinat cu o bază de cunoștințe externă. Modelul caută mai întâi informații relevante din documente reale, apoi generează răspunsul bazat pe aceste informații, reducând halucinarile.', 'NLP'),
  ('NumPy', 'NumPy este biblioteca fundamentală Python pentru calcul numeric. Oferă structura de date ndarray (array multi-dimensional) și operații matematice vectorizate extrem de rapide. Este baza pe care sunt construite Pandas, Scikit-learn și PyTorch.', 'Python'),
  ('Pandas', 'Pandas este biblioteca Python pentru manipularea și analiza datelor tabulare. Introduce structura DataFrame (similară unui tabel Excel), cu operații puternice de filtrare, grupare, agregare și transformare a datelor.', 'Python'),
  ('Scikit-learn', 'Scikit-learn este biblioteca Python de referință pentru Machine Learning clasic. Oferă implementări simple și consistente pentru sute de algoritmi (regresie, clasificare, clustering, reducere dimensională) cu o interfață uniformă fit/predict.', 'Python'),
  ('PyTorch', 'PyTorch este framework-ul de Deep Learning dezvoltat de Meta, cel mai folosit în cercetare. Oferă tensori GPU-accelerați, autodiferențiere automată (autograd) și o interfață Python intuitivă pentru construirea și antrenarea rețelelor neuronale.', 'Python'),
  ('Matplotlib', 'Matplotlib este biblioteca Python de vizualizare a datelor. Permite crearea de grafice, diagrame, histograme și heatmap-uri. Deși există alternative mai moderne (Seaborn, Plotly), Matplotlib rămâne standardul de bază pentru vizualizare în știința datelor.', 'Python'),
  ('API', 'API (Application Programming Interface) este un set de reguli și protocoale care permite aplicațiilor să comunice între ele. În AI, API-urile OpenAI, Anthropic sau Google permit dezvoltatorilor să folosească modele puternice de limbaj direct din cod, fără a le antrena ei înșiși.', 'Tools'),
  ('Pyodide', 'Pyodide este o implementare a Python care rulează direct în browser prin WebAssembly (WASM). Permite executarea codului Python în pagini web, fără un server backend, inclusiv biblioteci populare precum NumPy și Pandas.', 'Tools'),
  ('Supabase', 'Supabase este o platformă open-source de tip Backend-as-a-Service construită pe PostgreSQL. Oferă bază de date, autentificare, stocare de fișiere, API REST auto-generat și comunicare în timp real (Realtime), toate într-un singur serviciu.', 'Tools')
  ) as v(term, definition, category)
 where not exists (
   select 1 from public.glossar_terms g where g.term = v.term
 );
