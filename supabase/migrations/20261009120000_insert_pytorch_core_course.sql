-- Migration: insert pytorch-core as Course 7, shift the ML courses 7-12 -> 8-13
-- Date: 2026-10-09 (MASTER-PLAN P1)
--
-- WHY
-- Without PyTorch Core the student goes from "what is a derivative" (C6 matematica-ai)
-- straight to "fine-tune ResNet" (computer-vision-cnn). Owner decision 2026-10-09:
-- pytorch-core becomes Course 7; the existing ML courses move +1 -> 13 courses total.
--
-- WHAT
--   1. Guard: abort unless the live state is exactly what we expect
--      (12 courses, order_index 1..12, no pytorch-core yet).
--   2. courses.order_index += 1 for order_index >= 7   (computer-vision-cnn 7->8 ... pytorch-productie 12->13).
--      courses has NO unique constraint on order_index, so a plain UPDATE is safe.
--   3. INSERT course pytorch-core at order_index 7 (definition verbatim from CURRICULUM-STRUCTURE.md).
--   4. INSERT its 16 lesson skeletons exactly like the other unpublished courses:
--      content_md = '' (NOT NULL), is_published = false, is_free = false,
--      module_index = ceil(order/5) capped at 3 (1-5 -> 1, 6-10 -> 2, 11-16 -> 3).
--   5. Post-check: 13 courses, order_index exactly 1..13, pytorch-core at 7 with 16 lessons.
--
-- NOT TOUCHED: any lesson of courses 1-6 or 8-13, any .mdx, any lab/boss row of courses 1-6
-- (those come in a later prompt). No child table references the new lessons.
--
-- Everything runs in ONE transaction: any failed guard/check rolls the whole thing back.
-- Not idempotent by design — a second run trips the guard instead of duplicating.

begin;

-- 1. Guard ---------------------------------------------------------------------------
do $$
begin
  if (select count(*) from public.courses) <> 12 then
    raise exception 'P1 guard: expected 12 courses, found %', (select count(*) from public.courses);
  end if;
  if exists (select 1 from public.courses where slug = 'pytorch-core') then
    raise exception 'P1 guard: pytorch-core already exists';
  end if;
  if (select array_agg(order_index order by order_index) from public.courses)
       <> array[1,2,3,4,5,6,7,8,9,10,11,12] then
    raise exception 'P1 guard: courses.order_index is not exactly 1..12';
  end if;
end
$$;

-- 2. Shift the ML courses (7..12 -> 8..13) -------------------------------------------
update public.courses
   set order_index = order_index + 1
 where order_index >= 7;

-- 3. New course 7 ---------------------------------------------------------------------
insert into public.courses (slug, title, description, difficulty, is_free, order_index)
values (
  'pytorch-core',
  'PyTorch Core',
  'Inima cursului — tensori, Autograd și primul Training Loop scris manual, de la zero',
  3.0,
  false,
  7
);

-- 4. Its 16 lesson skeletons -----------------------------------------------------------
insert into public.lessons
  (course_id, title, type, order_index, module_index, content_md, is_published, is_free)
select c.id,
       v.title,
       v.type,
       v.ord,
       least(ceil(v.ord / 5.0)::int, 3),
       '',
       false,
       false
from public.courses c
cross join (values
    (1, 'De ce PyTorch — tensori vs NumPy, GPU, graf dinamic', 'lesson'),
    (2, 'Tensori — creare, shape, dtype, device (CPU/GPU)', 'lesson'),
    (3, 'Operații cu tensori — broadcasting, reshape, indexare', 'lesson'),
    (4, 'LAB: Portează cod NumPy în PyTorch', 'lab'),
    (5, 'Autograd — requires_grad, .backward(), .grad', 'lesson'),
    (6, 'Graful de calcul dinamic', 'lesson'),
    (7, 'Gradient descent manual cu Autograd', 'lesson'),
    (8, 'nn.Module — primul model', 'lesson'),
    (9, 'Funcții de pierdere (loss) — MSE, CrossEntropy', 'lesson'),
    (10, 'Optimizatori — SGD, Adam, optimizer.step()', 'lesson'),
    (11, 'Training Loop manual — forward, loss, backward, step', 'lesson'),
    (12, 'LAB: Scrie un training loop de la zero', 'lab'),
    (13, 'Dataset & DataLoader — batching, shuffle', 'lesson'),
    (14, 'Dataset custom — clasa Dataset personalizată', 'lesson'),
    (15, 'GPU training — .to(device), bune practici', 'lesson'),
    (16, 'BOSS: Rețea neuronală de la zero (MNIST) cu training loop propriu', 'boss')
) as v(ord, title, type)
where c.slug = 'pytorch-core';

-- 5. Post-check -----------------------------------------------------------------------
do $$
begin
  if (select count(*) from public.courses) <> 13 then
    raise exception 'P1 post-check: expected 13 courses';
  end if;
  if (select array_agg(order_index order by order_index) from public.courses)
       <> array[1,2,3,4,5,6,7,8,9,10,11,12,13] then
    raise exception 'P1 post-check: courses.order_index is not exactly 1..13';
  end if;
  if (select order_index from public.courses where slug = 'pytorch-core') <> 7 then
    raise exception 'P1 post-check: pytorch-core is not at order_index 7';
  end if;
  if (select count(*) from public.lessons l join public.courses c on c.id = l.course_id
       where c.slug = 'pytorch-core' and l.is_published = false and l.content_md = '') <> 16 then
    raise exception 'P1 post-check: pytorch-core must have exactly 16 unpublished empty lessons';
  end if;
end
$$;

commit;
