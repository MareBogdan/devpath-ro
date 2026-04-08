import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

// Admin-only: idempotent seed for glossar_terms (DELETE then INSERT)
export async function POST(req: Request) {
  // Auth check — always first
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Admin check
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  // Validate request body (no input needed, but accept optional force flag)
  let body: unknown = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    // ignore empty body
  }

  const schema = z.object({ force: z.boolean().optional() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const TERMS = [
    // AI General (10)
    {
      term: "Inteligență Artificială",
      definition:
        "Inteligența Artificială (IA) este ramura informaticii care creează sisteme capabile să execute sarcini ce necesită în mod normal inteligență umană, cum ar fi recunoașterea imaginilor sau traducerea limbilor. IA îngustă rezolvă o singură problemă bine definită (de ex. un filtru de spam), în timp ce IA generală ar putea realiza orice sarcină intelectuală la nivel uman, dar nu există încă.",
      category: "AI General",
    },
    {
      term: "Algoritm",
      definition:
        "Un algoritm este o secvență finită și bine definită de instrucțiuni care rezolvă o problemă sau îndeplinește o sarcină. În inteligența artificială, algoritmii definesc cum un model învață din date, cum face predicții și cum se optimizează în timp.",
      category: "AI General",
    },
    {
      term: "Model",
      definition:
        "Un model AI este un program matematic antrenat pe date care poate face predicții sau genera rezultate pentru date noi. Modelul este produsul final al procesului de antrenare — echivalentul unui creier artificial specializat pe o anumită sarcină.",
      category: "AI General",
    },
    {
      term: "Inferență",
      definition:
        "Inferența este procesul prin care un model AI deja antrenat generează predicții sau răspunsuri pentru date noi. Este etapa de \"utilizare\" a modelului, spre deosebire de antrenare care este etapa de \"învățare\".",
      category: "AI General",
    },
    {
      term: "Antrenare",
      definition:
        "Antrenarea este procesul prin care un model AI ajustează parametrii interni (ponderile) pe baza unui set de date, cu scopul de a minimiza erorile. Este analogă cu studiul uman: modelul vede multe exemple și învață să recunoască tipare.",
      category: "AI General",
    },
    {
      term: "Date de antrenare",
      definition:
        "Datele de antrenare sunt setul de exemple folosite pentru a antrena un model AI. Calitatea și diversitatea acestor date influențează direct performanța modelului — un model antrenat pe date de slabă calitate va face predicții slabe.",
      category: "AI General",
    },
    {
      term: "Date de test",
      definition:
        "Datele de test sunt un set separat de exemple, nevăzute în timpul antrenării, folosite pentru a evalua cât de bine generalizează modelul pe date noi. Dacă modelul performează bine pe datele de antrenare, dar slab pe cele de test, este un semn de overfitting.",
      category: "AI General",
    },
    {
      term: "Benchmark",
      definition:
        "Un benchmark este un set standardizat de teste sau probleme folosit pentru a compara performanța diferitelor modele AI în condiții identice. Exemple celebre: GLUE (NLP), ImageNet (viziune), MMLU (raționament general).",
      category: "AI General",
    },
    {
      term: "Deployment",
      definition:
        "Deployment-ul (sau punerea în producție) este procesul de integrare a unui model AI antrenat într-o aplicație reală, accesibilă utilizatorilor finali. Implică aspecte tehnice precum scalabilitate, latență, monitorizare și actualizare continuă.",
      category: "AI General",
    },
    {
      term: "Bias",
      definition:
        "Bias-ul în AI se referă la tendința unui model de a produce rezultate sistematic incorecte sau nedrepte față de anumite grupuri sau cazuri. Apare din date de antrenare ne-reprezentative sau din presupuneri greșite în design-ul algoritmului.",
      category: "AI General",
    },
    // ML (12)
    {
      term: "Machine Learning",
      definition:
        "Machine Learning (Învățare Automată) este o ramură a AI în care calculatoarele învață din date fără a fi programate explicit pentru fiecare sarcină. În loc de reguli scrise manual, modelul descoperă singur tipare în date.",
      category: "ML",
    },
    {
      term: "Supervised Learning",
      definition:
        "Supervised Learning (Învățarea Supravegheată) este metoda prin care modelul este antrenat pe perechi de intrare-ieșire etichetate. Modelul învață să prezică ieșirea corectă pentru date noi, pe baza exemplelor anterioare. Exemple: clasificarea emailurilor ca spam sau recunoașterea cifrelor scrise de mână.",
      category: "ML",
    },
    {
      term: "Unsupervised Learning",
      definition:
        "Unsupervised Learning (Învățarea Nesupravegheată) este metoda prin care modelul descoperă structuri sau tipare în date fără etichete prestabilite. Este folosit pentru clustering (gruparea clienților similari) sau reducerea dimensionalității.",
      category: "ML",
    },
    {
      term: "Reinforcement Learning",
      definition:
        "Reinforcement Learning (Învățarea prin Recompensă) este un paradigm în care un agent ia decizii într-un mediu și primește recompense sau penalizări în funcție de acțiunile sale. Prin maximizarea recompensei cumulate, agentul învață strategii optime — așa a fost antrenat AlphaGo.",
      category: "ML",
    },
    {
      term: "Regresie",
      definition:
        "Regresia este un tip de problemă de Machine Learning în care modelul prezice o valoare numerică continuă (de ex. prețul unei case sau temperatura de mâine). Cel mai simplu exemplu este regresia liniară, care găsește o linie dreaptă ce se potrivește cel mai bine datelor.",
      category: "ML",
    },
    {
      term: "Clasificare",
      definition:
        "Clasificarea este un tip de problemă de Machine Learning în care modelul atribuie fiecărui exemplu o categorie discretă (de ex. pisică sau câine, spam sau nu). Spre deosebire de regresie, ieșirea este o etichetă, nu o valoare continuă.",
      category: "ML",
    },
    {
      term: "Clustering",
      definition:
        "Clustering este tehnica de grupare automată a datelor în clustere (grupe) pe baza similarității, fără etichete prestabilite. Algoritmul K-Means, de exemplu, grupează clienții unui magazin în segmente cu comportamente similare de cumpărare.",
      category: "ML",
    },
    {
      term: "Gradient Descent",
      definition:
        "Gradient Descent (Coborârea Gradientului) este algoritmul de optimizare folosit pentru a antrena modele AI. Ajustează iterativ ponderile modelului în direcția care reduce cel mai mult eroarea, asemănător cu coborârea unei pante spre cel mai jos punct dintr-un peisaj.",
      category: "ML",
    },
    {
      term: "Learning Rate",
      definition:
        "Learning Rate (Rata de Învățare) este un hyperparametru care controlează cât de mari sunt pașii de ajustare a ponderilor în fiecare iterație de antrenare. Prea mare: modelul oscilează și nu converge; prea mic: antrenarea e lentă și poate rămâne blocată în minime locale.",
      category: "ML",
    },
    {
      term: "Overfitting",
      definition:
        "Overfitting-ul apare când modelul memorează datele de antrenare în loc să învețe tipare generalizabile. Modelul performează excelent pe datele de antrenare, dar slab pe date noi. Este echivalentul unui elev care memorează răspunsurile exacte fără să înțeleagă materia.",
      category: "ML",
    },
    {
      term: "Underfitting",
      definition:
        "Underfitting-ul apare când modelul este prea simplu pentru a capta tiparul din date, performând slab atât pe datele de antrenare, cât și pe datele de test. Este opusul overfitting-ului — modelul nu a \"învățat\" suficient.",
      category: "ML",
    },
    {
      term: "Cross-validation",
      definition:
        "Cross-validation este o tehnică de evaluare a modelelor care împarte datele în mai multe subseturi (fold-uri), antrenând și testând modelul pe combinații diferite. Oferă o estimare mai robustă a performanței decât o singură împărțire train/test.",
      category: "ML",
    },
    // DL (10)
    {
      term: "Deep Learning",
      definition:
        "Deep Learning (Învățarea Profundă) este o subramură a Machine Learning care utilizează rețele neuronale artificiale cu mai multe straturi ascunse. Excelează la sarcini precum recunoașterea imaginilor, traducerea automată și generarea de text.",
      category: "DL",
    },
    {
      term: "Rețea Neuronală",
      definition:
        "O rețea neuronală artificială este un sistem de calcul inspirat din creierul uman, format din neuroni artificiali organizați în straturi. Fiecare neuron primește intrări, le procesează și transmite un semnal mai departe, formând lanțuri de calcul complexe.",
      category: "DL",
    },
    {
      term: "Neuron Artificial",
      definition:
        "Un neuron artificial este unitatea de bază a unei rețele neuronale. Primește mai multe valori de intrare, le înmulțește cu ponderi (weights), adună rezultatele și aplică o funcție de activare pentru a produce o ieșire. Este analogul matematic al neuronului biologic.",
      category: "DL",
    },
    {
      term: "Strat Ascuns",
      definition:
        "Un strat ascuns (hidden layer) este un strat intermediar de neuroni dintr-o rețea neuronală, plasat între stratul de intrare și cel de ieșire. Straturile ascunse permit rețelei să învețe reprezentări complexe și abstracte ale datelor.",
      category: "DL",
    },
    {
      term: "Backpropagation",
      definition:
        "Backpropagation (propagarea înapoi a erorii) este algoritmul prin care o rețea neuronală calculează contribuția fiecărui parametru la eroarea totală și ajustează ponderile corespunzător. Este \"inima\" antrenării rețelelor neuronale profunde.",
      category: "DL",
    },
    {
      term: "Funcție de Activare",
      definition:
        "Funcția de activare introduce non-linearitate într-un neuron artificial, permițând rețelei să înțeleagă tipare complexe. Fără funcții de activare, oricâte straturi ar avea, rețeaua s-ar comporta ca o simplă transformare liniară.",
      category: "DL",
    },
    {
      term: "ReLU",
      definition:
        "ReLU (Rectified Linear Unit) este cea mai populară funcție de activare, definită simplu ca: f(x) = max(0, x). Lasă valorile pozitive neschimbate și le transformă pe cele negative în zero. Este eficientă computațional și ajută la evitarea problemei gradientului care dispare.",
      category: "DL",
    },
    {
      term: "Dropout",
      definition:
        "Dropout este o tehnică de regularizare care, în timpul antrenării, dezactivează aleatoriu un procent din neuroni la fiecare iterație. Forțează rețeaua să nu depindă de neuroni individuali și previne overfitting-ul, îmbunătățind generalizarea.",
      category: "DL",
    },
    {
      term: "Batch Normalization",
      definition:
        "Batch Normalization normalizează activările din fiecare strat pe parcursul unui mini-batch, stabilizând procesul de antrenare. Accelerează convergența, permite rate de învățare mai mari și reduce sensibilitatea față de inițializarea ponderilor.",
      category: "DL",
    },
    {
      term: "Convolutional Neural Network",
      definition:
        "CNN (Rețeaua Neuronală Convoluțională) este arhitectura de Deep Learning optimizată pentru procesarea imaginilor. Folosește filtre care scanează imaginea pentru a detecta caracteristici locale (muchii, texturi, forme), organizate ierarhic de la simple la complexe.",
      category: "DL",
    },
    // NLP (10)
    {
      term: "NLP",
      definition:
        "NLP (Natural Language Processing — Procesarea Limbajului Natural) este ramura AI care se ocupă cu înțelegerea și generarea textului uman de către calculatoare. Include sarcini precum traducerea automată, analiza sentimentelor, rezumarea textului și chatboții.",
      category: "NLP",
    },
    {
      term: "Token",
      definition:
        "Un token este unitatea de bază cu care lucrează modelele de limbaj. Poate fi un cuvânt întreg, o parte de cuvânt sau un semn de punctuație. De exemplu, cuvântul \"antrenare\" poate fi împărțit în token-urile [\"antr\", \"en\", \"are\"].",
      category: "NLP",
    },
    {
      term: "Tokenizare",
      definition:
        "Tokenizarea este procesul de împărțire a textului în token-uri (unități de bază) pentru a fi procesat de un model de limbaj. Fiecare model are propriul vocabular de token-uri, iar textul este convertit într-o secvență de identificatori numerici.",
      category: "NLP",
    },
    {
      term: "Embedding",
      definition:
        "Un embedding este o reprezentare numerică densă a unui cuvânt, token sau document într-un spațiu vectorial. Cuvintele cu sens similar au vectori apropiați. De exemplu, vectorii pentru \"rege\" și \"regină\" ar fi similari, iar distanța față de \"autobuz\" ar fi mare.",
      category: "NLP",
    },
    {
      term: "Transformer",
      definition:
        "Transformer este arhitectura revoluționară introdusă în 2017 (\"Attention Is All You Need\") care stă la baza tuturor modelelor moderne de limbaj (GPT, BERT, LLaMA). Procesează textul în paralel folosind mecanismul de atenție, fiind mult mai eficient decât arhitecturile anterioare secvențiale.",
      category: "NLP",
    },
    {
      term: "Attention",
      definition:
        "Mecanismul de atenție (Attention) permite unui model să se concentreze pe diferite părți ale intrării atunci când generează fiecare element de ieșire. Când traduce \"Il mange une pomme\", modelul \"acordă atenție\" cuvântului corect din franceză pentru fiecare cuvânt englezesc generat.",
      category: "NLP",
    },
    {
      term: "Context Window",
      definition:
        "Context Window (Fereastra de Context) reprezintă numărul maxim de token-uri pe care un model de limbaj le poate procesa simultan. GPT-4 are un context de 128.000 token-uri (~300 pagini). Textul care depășește această limită este ignorat de model.",
      category: "NLP",
    },
    {
      term: "Prompt",
      definition:
        "Un prompt este textul de intrare furnizat unui model de limbaj pentru a obține un răspuns. Calitatea și formularea promptului influențează dramatic calitatea răspunsului — de aceea există \"Prompt Engineering\" ca disciplină separată.",
      category: "NLP",
    },
    {
      term: "Fine-tuning",
      definition:
        "Fine-tuning-ul este procesul de antrenare suplimentară a unui model pre-antrenat (de exemplu GPT) pe un set de date specific unui domeniu sau sarcini. Permite adaptarea unui model general la un caz de utilizare particular fără a-l antrena de la zero.",
      category: "NLP",
    },
    {
      term: "RAG",
      definition:
        "RAG (Retrieval-Augmented Generation) este o tehnică prin care un model de limbaj este combinat cu o bază de cunoștințe externă. Modelul caută mai întâi informații relevante din documente reale, apoi generează răspunsul bazat pe aceste informații, reducând halucinarile.",
      category: "NLP",
    },
    // Python (5)
    {
      term: "NumPy",
      definition:
        "NumPy este biblioteca fundamentală Python pentru calcul numeric. Oferă structura de date ndarray (array multi-dimensional) și operații matematice vectorizate extrem de rapide. Este baza pe care sunt construite Pandas, Scikit-learn și PyTorch.",
      category: "Python",
    },
    {
      term: "Pandas",
      definition:
        "Pandas este biblioteca Python pentru manipularea și analiza datelor tabulare. Introduce structura DataFrame (similară unui tabel Excel), cu operații puternice de filtrare, grupare, agregare și transformare a datelor.",
      category: "Python",
    },
    {
      term: "Scikit-learn",
      definition:
        "Scikit-learn este biblioteca Python de referință pentru Machine Learning clasic. Oferă implementări simple și consistente pentru sute de algoritmi (regresie, clasificare, clustering, reducere dimensională) cu o interfață uniformă fit/predict.",
      category: "Python",
    },
    {
      term: "PyTorch",
      definition:
        "PyTorch este framework-ul de Deep Learning dezvoltat de Meta, cel mai folosit în cercetare. Oferă tensori GPU-accelerați, autodiferențiere automată (autograd) și o interfață Python intuitivă pentru construirea și antrenarea rețelelor neuronale.",
      category: "Python",
    },
    {
      term: "Matplotlib",
      definition:
        "Matplotlib este biblioteca Python de vizualizare a datelor. Permite crearea de grafice, diagrame, histograme și heatmap-uri. Deși există alternative mai moderne (Seaborn, Plotly), Matplotlib rămâne standardul de bază pentru vizualizare în știința datelor.",
      category: "Python",
    },
    // Tools (3)
    {
      term: "API",
      definition:
        "API (Application Programming Interface) este un set de reguli și protocoale care permite aplicațiilor să comunice între ele. În AI, API-urile OpenAI, Anthropic sau Google permit dezvoltatorilor să folosească modele puternice de limbaj direct din cod, fără a le antrena ei înșiși.",
      category: "Tools",
    },
    {
      term: "Pyodide",
      definition:
        "Pyodide este o implementare a Python care rulează direct în browser prin WebAssembly (WASM). Permite executarea codului Python în pagini web, fără un server backend, inclusiv biblioteci populare precum NumPy și Pandas.",
      category: "Tools",
    },
    {
      term: "Supabase",
      definition:
        "Supabase este o platformă open-source de tip Backend-as-a-Service construită pe PostgreSQL. Oferă bază de date, autentificare, stocare de fișiere, API REST auto-generat și comunicare în timp real (Realtime), toate într-un singur serviciu.",
      category: "Tools",
    },
  ] as const;

  // Idempotent: delete all existing terms then re-insert
  const { error: deleteError } = await supabase
    .from("glossar_terms")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all rows

  if (deleteError) {
    return new Response(
      JSON.stringify({ error: "Failed to clear existing terms", details: deleteError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { error: insertError, data: inserted } = await supabase
    .from("glossar_terms")
    .insert(TERMS.map((t) => ({ ...t })))
    .select("id");

  if (insertError) {
    return new Response(
      JSON.stringify({ error: "Failed to insert terms", details: insertError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, inserted: inserted?.length ?? 0 }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
