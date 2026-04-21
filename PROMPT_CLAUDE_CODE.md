# Claude Code uchun prompt
## "I-Imkon.uz" — inklyuziv ta'lim-test platformasi

---

## BOSHLANG'ICH KO'RSATMA (birinchi xabar Claude Code'ga)

```
Salom! Men "anjir.uz" nomli ta'lim platformasini qurmoqchiman. 
Loyiha haqida to'liq texnik topshiriq `TZ_Talim_Platforma.md` faylida yozilgan.

BIRINCHI VAZIFA: TZ_Talim_Platforma.md faylini to'liq o'qib chiq va qisqacha 
tushunganingni ayt. Hali kod yozma. Men tasdiqlagandan keyingina boshlaymiz.

Loyihada qat'iy qoidalar:

1. STACK
   - Next.js 14+ (App Router)
   - JavaScript (type safety uchun JSDoc ishlatamiz, TypeScript YO'Q)
     [YOKI: TypeScript — agar sen JS o'rniga TS tavsiya qilsang, sababini ayt]
   - Tailwind CSS + shadcn/ui
   - Supabase (PostgreSQL + Auth + Storage)
   - Cloudflare R2 (fayllar) + Cloudflare Stream (video)
   - Zod (validatsiya)
   - React Hook Form (formalar)
   - Zustand yoki React Context (global state — minimal)
   - date-fns (sana/vaqt)

2. LOYIHA TUZILISHI
   /app             — Next.js App Router sahifalar
   /components      — UI komponentlar (shadcn + custom)
   /components/a11y — accessibility-specific komponentlar
   /lib             — yordamchi funksiyalar, Supabase client
   /lib/db          — database query helperlari
   /lib/supabase    — client/server config
   /hooks           — React hooks
   /styles          — global CSS
   /public          — static fayllar
   /supabase        — migrations, RLS policies
   /docs            — qo'shimcha hujjatlar (Swagger/API, DB schema)

3. QAT'IY QOIDALAR
   ✅ Har bir komponent WCAG 2.1 AA'ga moslashgan bo'lishi kerak:
      - Semantik HTML
      - aria-* atributlar
      - Klaviatura navigatsiyasi
      - Focus indikatorlar (2px outline)
      - Alt matnlar
   ✅ Har bir matn o'zbek tilida (lotin alifbosi)
   ✅ Har bir form React Hook Form + Zod validatsiya bilan
   ✅ Har bir DB query Supabase RLS orqali himoyalangan
   ✅ Rollar: faqat DB tekshirish emas, UI darajasida ham yashirish
   ✅ Xato holatlari — har doim toast yoki inline xabar
   ✅ Loading holatlari — har doim skeleton yoki spinner
   ❌ Sichqonchaga bog'liq interaktivlik YO'Q (hover tooltip = ha, lekin 
      klaviatura bilan focus bo'lganda ham ko'rinishi kerak)
   ❌ Ranglar orqali yagona ma'lumot yetkazish YO'Q (ikon + rang birga)
   ❌ Hardcoded string YO'Q — barchasi `/lib/strings/uz.js` da
      (kelajakda i18n uchun)
   ❌ `any` turi YO'Q (agar TS tanlasak)
   ❌ console.log YO'Q production kodida

4. ISH TARTIBI
   - TZ dagi bosqichlar tartibida ishlaymiz
   - Har bir bosqichdan oldin qisqacha reja beraman/tasdiqlanadi
   - Har bosqich oxirida: kod ishlayotganiga ishonch + demo yo'riqnoma
   - Katta fayllar emas, modulli kichik fayllar
   - Har bir route uchun mos error.js va loading.js

5. AKSSESSIBILITY BIRINCHI
   Bu loyihaning ENG MUHIM qismi. Ishlab chiqishda har bir komponent uchun 
   quyidagi savollarni ber:
   - Klaviaturadan boshqara olamanmi?
   - Screen reader to'g'ri o'qiy oladimi?
   - Shriftni 200% oshirsam sindir(ma)adimi?
   - Rangni olib tashlasam ma'nosi tushunarlimi?
   - Focus ko'rinadimi?

Agar savollaring bo'lsa, hoziroq sura. 
Tushunganingni tasdiqlagach, Bosqich 1 dan boshlaymiz:
  1.1. Next.js loyihasi yaratish
  1.2. Supabase va Cloudflare sozlash
  1.3. Loyiha skeleton (layout, theme, fonts)
  1.4. Accessibility utility komponentlar (ScreenReaderOnly, 
       SkipLink, FocusTrap va h.k.)
  1.5. Auth: 4 ta rol, login/register sahifalar
  1.6. RLS policies
```

---

## BOSQICH 1 TUGAGACH, KEYINGI PROMPTLAR

### Bosqich 2 uchun prompt namunasi

```
Ajoyib, Bosqich 1 tugadi. Endi Bosqich 2 ga o'tamiz — o'quv kontenti 
(ma'ruzalar).

Kichik reja tuz va tasdiqlatsangiz keyin yozamiz:
- DB schema: lectures, lecture_subtitles jadvallari
- Cloudflare R2 upload integratsiyasi (PDF/audio)
- Cloudflare Stream upload integratsiyasi (video)
- O'qituvchi dashboard: ma'ruzalar CRUD
- O'quvchi uchun ma'ruza ko'rish sahifasi:
  * PDF viewer (accessibility bilan)
  * Video player (subtitr, klaviatura)
  * Audio player
- AI subtitr generatsiya (Whisper API)

Reja tayyor bo'lgach, bitta-bitta implementatsiya qilamiz.
```

### Bosqich 3 uchun prompt namunasi

```
Endi Bosqich 3 — testlar va o'yinlar.

Reja:
- Test builder (o'qituvchi)
- 4 ta savol turi (single, multiple, true/false, fill)
- Rasm yuklash savollarga
- Vaqt chegarasi
- O'quvchi uchun test yechish UI:
  * Web Speech API bilan "Ovozli o'qish" har savolda
  * Klaviatura to'liq
  * Local storage zaxira (connection drop)
- 3 ta o'yin shabloni: So'z-ma'no, To'g'ri tartib, Xotira kartalari
- Natija hisoblash va saqlash
- Leaderboard'ga qo'shilish

Reja tasdiqlangach, boshlaymiz.
```

### Bosqich 4 uchun prompt namunasi

```
Bosqich 4 — Accessibility chuqurlashtirish.

Ishlar:
- Sensor screening testlari (3 ta):
  * Ko'rish: shakl topish, kontrast
  * Eshitish: audio yo'riqnoma
  * Motorika: bosish tezligi
- Imkoniyat rejimlari va profil sozlamalari:
  * Shrift o'lchami (4 darajali)
  * Kontrast rejimlari (oddiy/yuqori/qorong'i)
  * Rang ko'rligi moslashuvi
  * Reduced motion
  * TTS manbai tanlovi (Web Speech API / Google Cloud TTS)
- WCAG 2.1 AA audit: 
  * axe-core bilan avtomatik test
  * NVDA yoki VoiceOver bilan qo'lda sinov
- Barcha eski komponentlarni qayta ko'rib chiqish

Avval reja tasdiqlanadi.
```

### Bosqich 5 uchun prompt namunasi

```
Bosqich 5 — Kitoblar va AI integratsiyasi.

Ishlar:
- DB schema: books, book_bookmarks
- PDF upload (Cloudflare R2)
- Gemini Vision OCR: skanerlangan PDF tekshirish va matn chiqarish
- Audio generatsiyasi:
  * Google Cloud TTS integratsiyasi (server tomon)
  * Sahifalar soni hisoblash va ogohlantirish (50+ bo'lsa)
  * Progress bar (generatsiya vaqtida)
  * Preview
  * Cache (qayta-qayta generatsiya qilmaslik)
- Audio streaming (HLS)
- Kitob o'qish UI:
  * PDF viewer (scroll + page)
  * Audio player (tezlik, pause/resume)
  * Bookmark (PDF sahifa + audio timestamp)
  * Matn va audio sinxronizatsiyasi (agar mumkin bo'lsa)

Reja bilan boshlaymiz.
```

### Bosqich 6 uchun prompt namunasi

```
Bosqich 6 — Leaderboard va analitika.

Ishlar:
- Leaderboard DB view:
  * Doimiy (barcha vaqt)
  * Haftalik (har dushanba reset)
- Qamrov bo'yicha filter:
  * O'quvchi → o'z sinfi
  * O'qituvchi → o'z sinflari
  * Direktor → butun maktab
  * Super admin → barchasi
- O'quvchi profili: progress, oxirgi faollik, fanlar bo'yicha foizlar
- O'qituvchi analitikasi:
  * O'quvchilar ro'yxati va statistikasi
  * Har o'quvchining sensor ehtiyojlari
  * Savollar statistikasi (eng ko'p xato qilinganlari)
  * Ishtirok foizi
- Direktor dashboard (maktab bo'yicha)
- Super admin dashboard (tizim bo'yicha)
- Bildirishnomalar tizimi (in-app only)
- Charts: Recharts yoki Chart.js bilan

Reja tasdiqlangach, boshlaymiz.
```

### Bosqich 7 uchun prompt namunasi

```
Bosqich 7 — Sinov, optimizatsiya va deploy.

Ishlar:
- E2E testlar: Playwright bilan asosiy oqimlar
- Performance:
  * Lighthouse audit
  * Image optimization (next/image)
  * Lazy loading
  * ISR/SSG strategiyalari
- SEO: metadata, sitemap, robots.txt
- Production env sozlash:
  * Vercel deploy
  * Supabase production
  * Cloudflare R2/Stream production bucket
  * Environment variables tekshiruvi
- Monitoring: Sentry yoki boshqa
- Hujjatlar:
  * README.md (setup, run)
  * docs/ papkasida API va DB documentation

Reja bilan boshlaymiz.
```

---

## FOYDALI QO'SHIMCHA PROMPTLAR

### Xato paytida
```
Xato keldi. Avval xatoni tushun: [xato matni yoki screenshot]
1. Nima xato bo'lganini aytib ber (root cause)
2. 2-3 ta yechim variantini ayt
3. Men tanlaganimdan keyin tuzat
```

### Refactoring paytida
```
Mana bu fayl [path] juda katta bo'lib ketdi. Uni accessibility va 
o'qilishini saqlagan holda kichik modulli qismlarga bo'l. Avval reja ko'rsat.
```

### Accessibility audit
```
[Component/Page path] ni WCAG 2.1 AA bo'yicha audit qil. 
Checklist:
- Semantik HTML
- ARIA atributlar
- Klaviatura navigatsiya
- Focus indikatorlar
- Rang kontrasti
- Screen reader matni
- Responsive (mobil + 200% zoom)
Topilgan muammolarni ro'yxat qil, keyin bitta-bitta tuzatamiz.
```

### DB migratsiyasi
```
Supabase migratsiya yozish kerak: [vazifa tavsifi]
- /supabase/migrations/ ga SQL fayl yoz
- RLS policies bilan birga
- Rollback script'ni ham yoz
- Mavjud data'ga ta'sirini aytib ber
```

### Yangi komponent yaratish
```
Yangi komponent kerak: [nom va funksiya].
Talablar:
- WCAG 2.1 AA
- Klaviatura to'liq
- Screen reader'ga moslangan
- Tailwind + shadcn primitives
- JSDoc (yoki TS) bilan props dokumentatsiyasi
- Ixcham storybook namunasi yoki demo sahifa
```

---

## ESHITISH UCHUN MASLAHATLAR

1. **Claude Code'ga papkangizni (`anjir.uz`) kursating** — u fayllarni ko'ra oladi va tahrirlaydi.

2. **`TZ_Talim_Platforma.md` ni papka ildiziga joylang** — shunda Claude Code uni o'qiy oladi.

3. **Har bosqichdan keyin `git commit` qiling** — xato bo'lsa qaytib kelish oson.

4. **Claude Code'dan "ko'rsat va tushuntir" deb so'rang**:
   - "Nega bu yechim?"
   - "Boshqa variantlar bormi?"
   - "Bu qaerda ishlatiladi?"

5. **Kichik iteratsiyalarda ishlang**: "hamma narsani bir zumda qil" emas, balki "avval shuni qil, tekshiraman, keyin keyingi".

6. **Supabase va Cloudflare kalitlarini `.env.local` ga joylang**, Claude Code'ga kalitlarni bermang (`.gitignore` ga qo'yiladi).

---

## TAYYOR! PAPKAGA QO'YADIGAN FAYLLAR

Sizning `anjir.uz` papkangizga shu 2 ta faylni qo'ying:
1. `TZ_Talim_Platforma.md` — texnik topshiriq
2. `PROMPT_CLAUDE_CODE.md` — ushbu prompt (yuqoridagi "Boshlang'ich ko'rsatma" ni birinchi xabar qilib yuboring)

Keyin Claude Code'ga oddiy yozing:
> Papkamda `TZ_Talim_Platforma.md` va `PROMPT_CLAUDE_CODE.md` fayllari bor. 
> PROMPT_CLAUDE_CODE.md ni o'qib, undagi "Boshlang'ich ko'rsatma" 
> qismidagi ko'rsatmaga amal qil.

Omad!
