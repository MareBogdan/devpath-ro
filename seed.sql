-- ============================================
-- DevPath RO — Seed Data for Testing
-- ============================================
-- Run this in Supabase SQL Editor to populate
-- the database with the first course.
--
-- NOTE: If you prefer the UI approach, click
-- "Inserează date de test" on the /courses page.
-- ============================================

-- Insert AI Fundamentals course
WITH inserted_course AS (
  INSERT INTO public.courses (slug, title, description, difficulty, is_free, order_index)
  VALUES (
    'ai-fundamentals',
    'AI Fundamentals',
    'Înțelege inteligența artificială de la zero. De la definiții și istoric, la Machine Learning, Neural Networks și LLM-uri — totul explicat cu analogii clare și exemple practice în română.',
    'beginner',
    true,
    1
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
)

-- Insert 3 lessons for the course
INSERT INTO public.lessons (course_id, title, content_md, type, order_index)
SELECT
  inserted_course.id,
  lesson_data.title,
  lesson_data.content_md,
  lesson_data.type::text,
  lesson_data.order_index
FROM inserted_course,
(VALUES
  (
    'Ce este Inteligența Artificială?',
    E'## Ce este Inteligența Artificială?\n\nInteligența artificială (AI) este un domeniu al informaticii care se ocupă cu crearea de sisteme capabile să îndeplinească sarcini care, în mod normal, ar necesita inteligență umană.\n\n### O definiție simplă\n\nGândește-te la AI ca la un **program care învață din exemple**, nu unul care urmează instrucțiuni fixe.\n\n- **Programare clasică:** Tu scrii regulile exacte. Calculatorul le urmează.\n- **AI:** Tu oferi exemple. Calculatorul descoperă singur regulile.\n\n### Un exemplu concret\n\n```python\n# Abordarea AI\nmodel = AntreneazaModel(\n    exemple_pozitive=1000_poze_cu_pisici,\n    exemple_negative=1000_poze_fara_pisici\n)\npredictie = model.predict(imagine_noua)\n```\n\n> **Concluzie:** AI nu este magie — este matematică, date și putere de calcul!',
    'theory',
    1
  ),
  (
    'Cum "gândește" un calculator',
    E'## Cum "gândește" un calculator\n\nCalculatoarele nu "gândesc" în sens uman — **procesează numere**.\n\n### Totul sunt numere\n\n```python\n# O imagine 4x4 în grayscale (0=negru, 255=alb)\nimagine = [\n    [255, 200, 150, 100],\n    [180, 210,  90,  60],\n    [120, 170, 230, 200],\n    [ 80, 100, 140, 190]\n]\n```\n\n### ML vs Programare clasică\n\n```python\nfrom sklearn.naive_bayes import MultinomialNB\n\nmodel = MultinomialNB()\nmodel.fit(email_features, labels)\npredictie = model.predict([email_nou])\n```\n\n> **Key insight:** AI-ul este excepțional de bun la găsit pattern-uri în date masive.',
    'theory',
    2
  ),
  (
    'Tipuri de AI — Narrow vs General AI',
    E'## Tipuri de AI — Narrow AI vs General AI\n\n### Narrow AI — Ce există azi\n\n```python\nchess_ai  = StockfishEngine()   # Bate la șah, nu poate juca dame\nimage_ai  = ImageClassifier()   # Recunoaște imagini, nu poate scrie cod\nspeech_ai = WhisperModel()      # Transcrie audio, nu poate "vedea"\ngpt4      = LanguageModel()     # Scrie text, limitat la text\n```\n\n### Comparație\n\n| Caracteristică | Narrow AI | AGI (teoretic) |\n|---|---|---|\n| Domeniu | Un task | Orice task |\n| Exemple reale | ChatGPT | Nu există |\n\n> **Takeaway:** Tot AI-ul pe care îl folosești azi este Narrow AI. Impresionant? Da. General? Departe.',
    'theory',
    3
  )
) AS lesson_data(title, content_md, type, order_index)
WHERE inserted_course.id IS NOT NULL;
