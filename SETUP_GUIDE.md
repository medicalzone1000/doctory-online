# 🚀 دليل ربط MediCore بـ Supabase

---

## ✅ الخطوة 1 — تشغيل قاعدة البيانات

1. افتح **Supabase Dashboard** → مشروعك `doctory-online`
2. من القائمة الجانبية اختر **SQL Editor**
3. اضغط **New query**
4. افتح ملف `supabase_setup.sql` من هذا الفولدر
5. انسخ كل المحتوى والصقه في SQL Editor
6. اضغط **Run** ✅

---

## ✅ الخطوة 2 — نسخ مفتاح API

1. في Supabase Dashboard → **Settings** → **API**
2. انسخ **Project URL** (هيبدأ بـ `https://egcfnjfrrajxwfhucltk.supabase.co`)
3. انسخ **anon public** key (المفتاح الطويل تحت `Project API keys`)
4. افتح ملف `config/constants.js`
5. استبدل السطر ده:
   ```js
   export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```
   بالمفتاح اللي نسخته ✅

---

## ✅ الخطوة 3 — تشغيل الموقع

### طريقة سهلة بدون سيرفر (VS Code Extension):
1. نزّل امتداد **Live Server** في VS Code
2. اضغط بالزر الأيمن على `index.html` → **Open with Live Server**
3. الموقع هيشتغل على `http://127.0.0.1:5500`

### أو عبر Node.js:
```bash
npx serve .
```
ثم افتح `http://localhost:3000`

---

## ✅ الخطوة 4 — إنشاء حساب Admin

1. افتح الموقع وسجّل حساب جديد من صفحة Register
2. بعد التسجيل، ارجع لـ **Supabase Dashboard** → **SQL Editor**
3. شغّل هذا الأمر (بعد تسجيل دخولك):
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);
   ```
4. الآن حسابك أصبح Admin ✅

---

## ✅ الخطوة 5 — تفعيل Email في Supabase

1. Supabase Dashboard → **Authentication** → **Providers**
2. تأكد أن **Email** مفعّل
3. في **Settings** → يمكنك تعطيل "Confirm email" للتطوير المحلي

---

## 📁 الملفات اللي اتغيرت

| الملف | التغيير |
|-------|---------|
| `config/constants.js` | أضفنا SUPABASE_URL و SUPABASE_ANON_KEY |
| `src/api/supabase.js` | **جديد** — Supabase client |
| `src/api/auth.api.js` | ربطناه بـ Supabase Auth |
| `src/api/articles.api.js` | ربطناه بـ Supabase Database |
| `src/api/users.api.js` | ربطناه بـ Supabase profiles table |
| `src/services/auth.service.js` | يستخدم Supabase session |
| `supabase_setup.sql` | **جديد** — SQL لإنشاء DB كامل |

---

## 🗄️ جداول قاعدة البيانات

| الجدول | الوصف |
|--------|-------|
| `profiles` | بيانات المستخدمين (role, name, bio) |
| `articles` | المقالات الطبية |
| `article-covers` | Storage bucket لصور المقالات |

---

## ⚠️ ملاحظات مهمة

- ملف `src/api/client.js` القديم لا يزال موجود لكن **لم يعد يُستخدم**
- Supabase يتعامل مع JWT تلقائياً، مش محتاج تحفظه يدوياً
- Row Level Security (RLS) مفعّل — الـ Admin فقط يقدر يحذف articles/users
