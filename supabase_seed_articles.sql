-- ══════════════════════════════════════════════════════════
--  MEDICORE — Demo Articles + Profile Migration
--  Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ══════════════════════════════════════════════════════════

-- Migration: add email column to existing profiles (safe to re-run)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- Skip articles that already exist (by slug)
INSERT INTO public.articles (title, slug, excerpt, content, cover_url, category, status, views)
SELECT * FROM (VALUES
  (
    'Understanding Heart Health: A Complete Guide',
    'understanding-heart-health-guide',
    'Learn the fundamentals of cardiovascular wellness, from daily habits to warning signs you should never ignore.',
    E'## Why Heart Health Matters\n\nCardiovascular disease remains one of the leading causes of illness worldwide. The good news: many risk factors are modifiable with consistent lifestyle choices.\n\n### Daily habits that protect your heart\n\n- **Move regularly** — aim for at least 150 minutes of moderate activity per week.\n- **Eat a balanced diet** rich in vegetables, whole grains, and healthy fats.\n- **Manage stress** through sleep, mindfulness, or activities you enjoy.\n- **Know your numbers** — blood pressure, cholesterol, and blood sugar.\n\n### When to see a doctor\n\nSeek urgent care for chest pain, sudden shortness of breath, or pain radiating to the arm or jaw. Routine check-ups help catch problems early.\n\n> Prevention is always easier than treatment. Small changes today compound over decades.',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    'cardiology',
    'published',
    1240
  ),
  (
    'Brain Health at Every Age',
    'brain-health-at-every-age',
    'Practical strategies to support memory, focus, and long-term neurological wellness across the lifespan.',
    E'## Protecting Your Brain\n\nYour brain adapts throughout life — a concept called neuroplasticity. Supporting it requires sleep, nutrition, social connection, and mental challenge.\n\n### Evidence-based tips\n\n1. **Sleep 7–9 hours** — deep sleep clears metabolic waste from the brain.\n2. **Stay socially engaged** — loneliness is linked to cognitive decline.\n3. **Learn new skills** — languages, instruments, or puzzles build cognitive reserve.\n4. **Control vascular risk factors** — what helps the heart helps the brain.\n\n### Warning signs\n\nPersistent memory loss, confusion, or personality changes warrant a professional evaluation — early diagnosis improves outcomes for many conditions.',
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80',
    'neurology',
    'published',
    892
  ),
  (
    'Nutrition Basics: Building a Healthy Plate',
    'nutrition-basics-healthy-plate',
    'A practical guide to balanced eating — no fad diets, just sustainable habits backed by science.',
    E'## The Healthy Plate Model\n\nFill half your plate with vegetables and fruit, one quarter with lean protein, and one quarter with whole grains.\n\n### Key nutrients\n\n- **Fiber** — supports digestion and stable blood sugar.\n- **Protein** — essential for muscle repair and immune function.\n- **Healthy fats** — olive oil, nuts, and fatty fish support heart and brain health.\n\n### Hydration\n\nWater is the best default drink. Limit sugary beverages and excessive alcohol.\n\n### Sustainable change\n\nFocus on adding nutritious foods rather than restricting entire food groups. Consistency beats perfection.',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    'nutrition',
    'published',
    2103
  ),
  (
    'Skin Care Essentials: Dermatology for Daily Life',
    'skin-care-essentials-dermatology',
    'Sun protection, gentle cleansing, and when to consult a dermatologist about common skin concerns.',
    E'## Daily Skin Care Foundations\n\nHealthy skin starts with protection and consistency.\n\n### Morning routine\n\n- Gentle cleanser\n- Moisturizer suited to your skin type\n- **Broad-spectrum SPF 30+** — the single most effective anti-aging step\n\n### Common concerns\n\n- **Acne** — over-the-counter retinoids or benzoyl peroxide may help; persistent cases need medical care.\n- **Eczema** — moisturize frequently; avoid harsh soaps.\n- **Changing moles** — the ABCDE rule helps identify suspicious lesions.\n\nSee a dermatologist for rashes that persist, painful lesions, or any mole that changes shape or color.',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    'dermatology',
    'published',
    756
  ),
  (
    'Pediatric Wellness: A Parent''s Year-Round Checklist',
    'pediatric-wellness-parent-checklist',
    'Vaccinations, growth milestones, sleep, and screen time — what parents should track from infancy through adolescence.',
    E'## Keeping Children Healthy\n\nPreventive care sets the foundation for lifelong wellness.\n\n### Well-child visits\n\nRegular check-ups monitor growth, development, vision, hearing, and immunization status.\n\n### Sleep by age\n\n- Infants: 14–17 hours (including naps)\n- School-age: 9–12 hours\n- Teens: 8–10 hours\n\n### Screen time\n\nThe American Academy of Pediatrics recommends consistent limits and screen-free bedrooms for better sleep.\n\n### When to call the doctor\n\nHigh fever in infants, difficulty breathing, dehydration, or unusual lethargy require prompt medical attention.',
    'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80',
    'pediatrics',
    'published',
    634
  ),
  (
    'Mental Health Matters: Recognizing Anxiety and Depression',
    'mental-health-anxiety-depression',
    'Understanding common mental health conditions, reducing stigma, and knowing when professional support can help.',
    E'## Mental Health Is Health\n\nAnxiety and depression are among the most common conditions worldwide — and they are treatable.\n\n### Signs of anxiety\n\n- Persistent worry or restlessness\n- Sleep disturbance\n- Physical symptoms: racing heart, tension, fatigue\n\n### Signs of depression\n\n- Low mood lasting two weeks or more\n- Loss of interest in activities\n- Changes in appetite, sleep, or concentration\n\n### Getting help\n\nTalk therapy, medication, lifestyle changes, or a combination can be effective. Crisis lines are available 24/7 in many countries.\n\nYou do not need to wait until things feel unbearable to reach out.',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    'psychiatry',
    'published',
    1587
  ),
  (
    'Bone and Joint Health: Preventing Injuries as You Age',
    'bone-joint-health-preventing-injuries',
    'Strength training, posture, and recovery strategies to keep your musculoskeletal system strong.',
    E'## Strong Bones, Active Life\n\nBone density peaks in your twenties; maintaining it requires weight-bearing exercise and adequate calcium and vitamin D.\n\n### Injury prevention\n\n- Warm up before activity\n- Use proper form when lifting\n- Wear supportive footwear\n- Allow rest days for recovery\n\n### Common conditions\n\n- **Osteoarthritis** — joint wear; managed with exercise, weight control, and pain relief.\n- **Osteoporosis** — silent until a fracture; screening recommended for at-risk adults.\n\nConsult an orthopedist for joint swelling, instability, or pain that limits daily function.',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    'orthopedics',
    'published',
    445
  ),
  (
    'Cancer Screening: What Tests Do You Need and When?',
    'cancer-screening-what-tests-when',
    'An overview of evidence-based screening guidelines for breast, colorectal, cervical, and lung cancer.',
    E'## Early Detection Saves Lives\n\nScreening tests find cancer before symptoms appear, when treatment is often more effective.\n\n### Common screenings\n\n| Cancer type | Typical starting age | Test |\n|-------------|---------------------|------|\n| Colorectal | 45–50 | Colonoscopy or stool test |\n| Breast | 40–50 (varies) | Mammography |\n| Cervical | 21 | Pap smear / HPV test |\n| Lung | 50+ (smokers) | Low-dose CT |\n\n### Discuss with your doctor\n\nGuidelines vary by personal and family history. Your clinician can recommend a schedule tailored to your risk profile.\n\nScreening is not diagnosis — abnormal results require follow-up, not panic.',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    'oncology',
    'published',
    923
  ),
  (
    '10 Habits for Better General Health',
    'ten-habits-better-general-health',
    'Simple, science-backed daily practices that improve energy, immunity, and overall quality of life.',
    E'## Small Steps, Big Impact\n\n1. **Sleep consistently** — same bedtime and wake time.\n2. **Eat mostly whole foods** — minimize ultra-processed items.\n3. **Move every day** — even a 20-minute walk counts.\n4. **Stay hydrated** — thirst is a late signal; drink water regularly.\n5. **Manage stress** — breathing exercises, hobbies, or counseling.\n6. **Avoid tobacco** — the single largest preventable health risk.\n7. **Limit alcohol** — follow national guidelines for your region.\n8. **Stay up to date on vaccines** — flu, COVID, and routine boosters.\n9. **Build social connections** — loneliness affects physical health.\n10. **See your doctor annually** — prevention beats emergency care.\n\nHealth is a marathon. Choose habits you can maintain for years, not days.',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
    'general',
    'published',
    3421
  )
) AS seed(title, slug, excerpt, content, cover_url, category, status, views)
WHERE NOT EXISTS (
  SELECT 1 FROM public.articles a WHERE a.slug = seed.slug
);

-- Verify
SELECT category, count(*) AS article_count
FROM public.articles
WHERE status = 'published'
GROUP BY category
ORDER BY category;
