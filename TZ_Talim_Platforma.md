# TEXNIK TOPSHIRIQ (TZ)

## 5–9-sinf o'quvchilari uchun inklyuziv ta'lim-test platformasi

**Versiya:** 1.0 (MVP)
**Sana:** 2026-yil
**Tili:** O'zbek tili (lotin alifbosi)

---

## 1. KIRISH

### 1.1. Loyiha haqida qisqacha

Loyiha — 5-sinfdan 9-sinfgacha bo'lgan umumiy o'rta ta'lim muassasalari o'quvchilari uchun mo'ljallangan **veb-platforma**. Platforma o'quvchilarga dars jarayonida va mustaqil o'rganish uchun testlar yechish, ma'ruzalarni o'zlashtirish, amaliy topshiriqlarni bajarish va qo'shimcha kitoblardan foydalanish imkonini beradi.

Platformaning asosiy xususiyati — **inklyuzivlik**. Tizim imkoniyati cheklangan o'quvchilar (ko'rish, eshitish va motorika bo'yicha cheklovlarga ega o'quvchilar) uchun to'liq moslashtirilgan bo'ladi.

### 1.2. Maqsad va vazifalar

**Maqsad:** 5–9-sinf o'quvchilari uchun sinfda va sinfdan tashqari holatda ham foydalanish mumkin bo'lgan, imkoniyati cheklanganlarni inobatga olgan holda qurilgan raqamli o'quv muhitini yaratish.

**Vazifalar:**

1. O'quvchilarga fan bo'yicha test yechish orqali bilim darajasini mustahkamlash imkonini berish
2. O'qituvchilarga o'z fanlari bo'yicha o'quv materiallari (ma'ruza, amaliyot, test) qo'shish va o'quvchilar faoliyatini kuzatish imkonini berish
3. O'quvchilarning sensor (ko'rish, eshitish, motorika) ehtiyojlarini aniqlab, ularga mos interfeys taqdim etish
4. PDF kitoblarni AI yordamida audio formatga o'tkazish orqali ko'zi ojiz o'quvchilarga kitob tinglash imkonini berish
5. Sinflar orasida sog'lom raqobat muhitini yaratuvchi leaderboard tizimini joriy qilish

### 1.3. Maqsadli auditoriya

- **Birlamchi foydalanuvchilar:** 5–9-sinf o'quvchilari (10–16 yosh)
- **Ikkilamchi foydalanuvchilar:** o'qituvchilar, maktab direktorlari, platforma administratori
- **Alohida e'tibor:** imkoniyati cheklangan o'quvchilar (ko'rish, eshitish, motorika cheklovlari)

---

## 2. TEXNOLOGIK STEK

### 2.1. Asosiy texnologiyalar

| Qism | Texnologiya | Izoh |
|------|-------------|------|
| Frontend | Next.js 14+ (App Router), React 18+, TypeScript | SSR va SEO uchun |
| Styling | Tailwind CSS + shadcn/ui | Accessibility komponentlari uchun |
| Backend & DB | Supabase (PostgreSQL) | DB, auth, row-level security |
| Autentifikatsiya | Supabase Auth (custom telefon provayderi) | +998 raqam + parol |
| Fayl saqlash | Cloudflare R2 | PDF, audio fayllar |
| Video saqlash | Cloudflare Stream *(taxmin)* | Adaptiv bitrate streaming |
| AI: PDF → Audio | Google Cloud TTS yoki Gemini TTS | Kitoblar uchun |
| AI: Audio → Matn | OpenAI Whisper API *(taxmin)* | Video subtitr generatsiyasi |
| Brauzer TTS | Web Speech API | Testlar va interfeys uchun bepul o'qib berish |
| Hosting | Vercel (Next.js uchun tabiiy) | Edge caching |

### 2.2. Tanlov asoslari

- **Next.js:** SEO, performance, ko'p foydalanuvchili tizim uchun SSR/ISR imkoniyatlari
- **Supabase:** RLS orqali rol-based ruxsatlarni DB darajasida himoya qilish
- **Cloudflare R2:** S3-compatible, chiqish trafigi bepul, Oʻzbekistonga yaqin edge serverlar
- **Cloudflare Stream:** HLS/DASH adaptiv streaming, to'g'ridan-to'g'ri playerbilan integratsiya
- **Web Speech API:** testlar uchun — har safar qayta generatsiya qilish shart emas, bepul

---

## 3. ROLLAR VA RUXSATLAR

### 3.1. Rollar ierarxiyasi

```
Super Admin
    ├── Direktorlarni boshqaradi
    └── Fanlarni boshqaradi (global ro'yxat)
        │
        └── Direktor (maktab darajasida)
                ├── Maktab ma'lumotlarini boshqaradi
                ├── O'qituvchilarni qo'shadi va boshqaradi
                └── Maktab-umumiy ma'ruzalar qo'sha oladi
                        │
                        └── O'qituvchi (fan + sinf darajasida)
                                ├── Bir yoki bir nechta maktabda ishlay oladi
                                ├── O'z fani bo'yicha ma'ruza, test, vazifa qo'shadi
                                └── O'z sinflarining o'quvchilarini boshqaradi
                                        │
                                        └── O'quvchi
                                                ├── Test yechadi
                                                ├── Ma'ruza va kitoblardan foydalanadi
                                                └── Leaderboard'da qatnashadi
```

### 3.2. Ruxsatlar matritsasi

| Amal | Super Admin | Direktor | O'qituvchi | O'quvchi |
|------|:---:|:---:|:---:|:---:|
| Maktab yaratish | ✅ | ❌ | ❌ | ❌ |
| Direktor qo'shish | ✅ | ❌ | ❌ | ❌ |
| O'qituvchi qo'shish | ✅ | ✅ (o'z maktabiga) | ❌ | ❌ |
| Fan yaratish (global) | ✅ | ❌ | ❌ | ❌ |
| Maktabga fan biriktirish | ✅ | ✅ | ❌ | ❌ |
| Sinf yaratish | ✅ | ✅ | ❌ | ❌ |
| O'quvchini tasdiqlash | ✅ | ✅ | ✅ (o'z sinflari) | ❌ |
| Ma'ruza qo'shish | ✅ | ✅ (maktab-umumiy) | ✅ (fan-sinf) | ❌ |
| Test va savollar CRUD | ✅ | ❌ | ✅ (o'z fanlari) | ❌ |
| Test yechish | ❌ | ❌ | ❌ | ✅ |
| Kitob qo'shish | ✅ | ✅ | ✅ | ❌ |
| O'quvchilarni ko'rish | ✅ (barcha) | ✅ (maktab) | ✅ (o'z sinflari) | ❌ |
| Leaderboard ko'rish | ✅ (barcha) | ✅ (maktab) | ✅ (o'z sinflari) | ✅ (o'z sinfi) |
| Analitika ko'rish | ✅ (tizim) | ✅ (maktab) | ✅ (o'z sinflari) | ✅ (shaxsiy) |
| Parol tiklash | ✅ (barcha) | ✅ (maktab) | ✅ (o'z sinflari) | ❌ |

### 3.3. Ob'ektlar tuzilmasi

- **Maktab** → ko'p **Sinf**lari bo'ladi (5-A, 5-B, 6-A, ...)
- **Sinf** → ko'p **O'quvchi**lari bo'ladi, bir yoki bir nechta **Fan**ga ega
- **Fan** → ko'p **O'qituvchi**ga tegishli bo'lishi mumkin (har xil sinflarda)
- **O'qituvchi** → bir yoki bir nechta **Maktab** × **Sinf** × **Fan** kombinatsiyasida ishlaydi

---

## 4. FOYDALANUVCHI OQIMLARI (USER FLOWS)

### 4.1. O'quvchining ro'yxatdan o'tish va ishga tushish oqimi

```
1. O'quvchi "Ro'yxatdan o'tish" sahifasiga keladi
2. Ma'lumotlarni kiritadi:
   - Ism, familiya
   - Telefon raqam (+998)
   - Parol
   - Maktab (dropdown ro'yxatdan)
   - Sinf (maktabga bog'liq ro'yxatdan)
3. "Yuborish" bosadi → status: PENDING
4. O'qituvchi yoki direktor tomonidan tasdiqlash kutiladi
   - O'quvchi shu holatda ham tizimga kira oladi, lekin
     faqat "Arizangiz ko'rib chiqilmoqda" xabari ko'rinadi
5. Tasdiqlandi → status: ACTIVE
   (rad etilsa: sabab ko'rsatiladi, o'quvchi qayta ariza bera oladi)
6. Birinchi kirish:
   a. Sensor screening taklif qilinadi (skip mumkin)
   b. Screening natijasi asosida moslashtirilgan interfeys rejimi
      avtomatik yoqiladi
   c. O'quvchi sozlamalardan har qanday paytda o'zgartira oladi
7. Dashboard'ga tushadi
8. Har bir fan uchun "Kirish testi" bajarilishi taklif qilinadi
   (har fanga 1 marta, majburiy emas lekin tavsiya etiladi)
9. Odatiy foydalanish boshlanadi
```

### 4.2. Sensor screening oqimi

```
1. Ko'rish testi
   - Ekranda turli o'lchamdagi va rang kontrastidagi shakllar
   - "Doirani toping", "Ko'k kvadratni bosing" kabi topshiriqlar
   - 4–5 ta bosqich, har biri avvalgisidan kichikroq/kontrastsizroq
   - Natija: muvaffaqiyatsiz bosqichlardan kelib chiqib
     "Kuchsiz ko'ruvchilar rejimi" taklif qilinadi

2. Eshitish testi
   - Turli chastota va baland/past ovozda audio yo'riqnomalar
   - "Nechta qo'ng'iroq eshitdingiz?" kabi topshiriqlar
   - 3–4 ta bosqich
   - Natija: "Subtitrlar har doim yoqilgan holda" rejimi taklifi

3. Motorika testi
   - "5 ta ko'k doirani 10 soniyada bosing" kabi vazifa
   - Bosish tezligi va aniqligi o'lchanadi
   - Natija: "Kattalashtirilgan interfeys + kengaytirilgan hover vaqti"
     rejimi taklifi

4. Natijalar yakunlanadi
   - Har uchala testning natijasi birgalikda ko'rib chiqiladi
   - Bir nechta rejim bir vaqtning o'zida yoqilishi mumkin
   - O'quvchi har bir taklifni qabul qilishi yoki rad etishi mumkin
5. Screening tugagach, sozlamalarga yoziladi
   → "Profil → Imkoniyatlar" orqali keyinchalik tahrirlanadi
```

**Muhim:** Sensor screening **faqat birinchi kirishda** bir marta avtomatik taklif qilinadi. Keyingi kirishlarda takrorlanmaydi. Skip qilish mumkin.

### 4.3. Testni yechish oqimi

```
1. O'quvchi testni ochadi → test ma'lumotlari ko'rinadi:
   - Nomi, tavsifi
   - Savollar soni
   - Vaqt chegarasi (agar belgilangan bo'lsa)
   - Oldingi urinishlar soni / ruxsat etilgan maksimum
2. "Testni boshlash" bosadi
3. Savollar ketma-ket ko'rsatiladi:
   - Har bir savol alohida sahifada yoki bir sahifada ketma-ket
   - Har bir savol yonida "Ovozli o'qish" tugmasi (Web Speech API)
   - Rasmli savollar bo'lsa, rasm alt-text bilan taqdim etiladi
   - Klaviatura navigatsiyasi to'liq qo'llab-quvvatlanadi
4. O'quvchi javoblarni belgilaydi
5. Vaqt chegarasi bo'lsa — timer ko'rinib turadi, tugasa avtomatik yuboriladi
6. "Yuborish" bosadi → javoblar saqlanadi, natija hisoblanadi
7. Natija sahifasi:
   - To'g'ri javoblar soni / jami savollar
   - Foiz
   - Leaderboard'dagi joy (agar test leaderboard'ga ta'sir qilsa)
   - Agar qayta yechish ruxsat etilgan bo'lsa — "Qayta yechish" tugmasi
```

**Eslatma:** Tab almashtirish (tab switch) test natijasiga ta'sir qilmaydi. O'quvchi xohlagan paytda test sahifasidan chiqib, qaytib kira oladi.

---

## 5. FUNKSIONAL TALABLAR

### 5.1. Autentifikatsiya va ro'yxatdan o'tish

**5.1.1. Ro'yxatdan o'tish**
- Kiritiladigan maydonlar: ism, familiya, telefon raqam (+998 formatda), parol, maktab, sinf
- OTP yo'q — telefon raqam faqat identifikator sifatida ishlatiladi
- Maktab va sinf dropdown-dan tanlanadi (super admin tomonidan qo'shilgan)
- Ro'yxatdan o'tgandan keyin status: `PENDING` (kutilmoqda)

**5.1.2. Ro'yxatni tasdiqlash**
- O'qituvchi yoki direktor o'z dashbordida "Kutilayotgan o'quvchilar" ro'yxatini ko'radi
- Har bir arizani **tasdiqlash** yoki **rad etish** mumkin
- Rad etishda sabab (majburiy matn) ko'rsatiladi, bu o'quvchiga bildirishnomada ko'rinadi
- Tasdiqlangach, o'quvchi status: `ACTIVE`

**5.1.3. Tizimga kirish**
- Telefon raqam + parol
- Sessiya Supabase Auth orqali boshqariladi
- "Meni eslab qol" opsiyasi bor

**5.1.4. Parolni tiklash**
- O'quvchi uchun: sinfdagi o'qituvchi yoki direktor qo'lda yangi parol belgilaydi
- O'qituvchi uchun: direktor yangilaydi
- Direktor uchun: super admin yangilaydi
- Super admin uchun: texnik yordam orqali
- O'z-o'zidan parol tiklash (SMS/email) **MVP da YO'Q**

**5.1.5. Xavfsizlik holati**
> ⚠️ **Eslatma:** MVP bosqichida yuqori darajadagi xavfsizlik birinchi darajali maqsad emas. Asosiy maqsad — demonstratsiya. Mahsulot tasdiqlangach, xavfsizlik qayta ko'rib chiqiladi (2FA, rate limiting, audit log, encryption at rest va h.k.).

### 5.2. Sensor screening va moslashuvchan interfeys

**5.2.1. Screening vazifalari**

| Test turi | Topshiriq namunasi | Natija rejimi |
|-----------|-------------------|---------------|
| Ko'rish | Turli o'lcham va kontrastdagi shakllarni topish | **Kuchsiz ko'ruvchilar:** yirik shrift, yuqori kontrast, minimal UI zichligi |
| Eshitish | Turli chastotadagi audio yo'riqnomani bajarish | **Eshitish cheklovi:** barcha audio subtitr bilan, ovozga bog'liq ma'lumot yo'q |
| Motorika | Belgilangan vaqtda tugmalarni bosish | **Sekin motorika:** kengaytirilgan klik maydoni, uzun hover vaqti, saqlash tasdiqlari |

**5.2.2. Rejimlar kombinatsiyasi**

O'quvchi bir vaqtning o'zida bir nechta rejimga ega bo'lishi mumkin (masalan, kuchsiz ko'ruvchi + sekin motorika). Har bir rejim mustaqil ravishda yoqiladi/o'chiriladi.

**5.2.3. Qo'lda sozlash**

O'quvchi "Profil → Imkoniyatlar" sahifasida quyidagilarni o'zgartira oladi:
- Shrift o'lchami: kichik / o'rta / katta / juda katta
- Kontrast: oddiy / yuqori kontrast / qorong'i rejim
- Rang ko'rligi moslashuvi: oddiy / protanopiya / deuteranopiya / tritanopiya
- Animatsiyalar: yoqilgan / o'chirilgan (reduced motion)
- TTS manbai: brauzer (Web Speech API) / platforma (Google Cloud TTS)
- Barcha audio/videoda subtitr: yoqilgan / o'chirilgan

### 5.3. Testlar

**5.3.1. Test turlari**

| Tur | Izoh | Yechish soni |
|-----|------|-------------|
| **Fanga kirish testi** | Fan bo'yicha o'quvchining boshlang'ich darajasini aniqlash | 1 marta |
| **Mavzudan keyingi test** | Har bir ma'ruzadan keyin biriktiriladi | 3 martagacha |
| **Mustaqil uy testi** | Darsdan tashqari yechiladigan | Cheksiz, leaderboard'ga ta'sir qiladi |

**5.3.2. Savol turlari (3–4 tur)**

MVP uchun qo'llab-quvvatlanadigan savol turlari:

1. **Bir javobli test** (single choice) — 4 variant, bittasi to'g'ri
2. **Ko'p javobli test** (multiple choice) — 4+ variant, bir nechtasi to'g'ri
3. **To'g'ri/Noto'g'ri** (true/false)
4. **Bo'sh joyni to'ldirish** (fill in the blank) — qat'iy matn moslashuvi

**Muhim:** Savollar matematik formulalarni (LaTeX/KaTeX) **qo'llab-quvvatlamaydi**. Kerakli formulalar rasm sifatida qo'shiladi.

**5.3.3. Test tuzilmasi**

O'qituvchi test yaratayotganda:
- Nomi, tavsifi
- Fan va sinf(lar) belgilanadi (bir test bir yoki bir nechta sinfga ko'rinishi mumkin)
- Vaqt chegarasi: **ixtiyoriy** (belgilanmasa — vaqt chegarasiz)
- Test turi (kirish / mavzudan keyingi / uy testi)
- Savollar: qat'iy tartibda ko'rsatiladi (aralashtirish yo'q)
- Har bir savol: matn, rasm (ixtiyoriy), javob variantlari, to'g'ri javob(lar), ball

**5.3.4. Test yechish xususiyatlari**

- Har bir savolda **"Ovozli o'qish"** tugmasi — Web Speech API orqali
- Rasmli savollar uchun alt-text majburiy (screen reader uchun)
- Klaviatura bilan to'liq navigatsiya (Tab, Enter, Space, O'q tugmalari)
- Tab almashtirish test natijasiga ta'sir qilmaydi
- Ulanish uzilsa — javoblar local storage'ga saqlanadi, ulanish tiklangach yuboriladi

**5.3.5. Natija va ball**

- **Formula:** `Ball = (To'g'ri javoblar soni / Jami savollar soni) × 100%`
- Bonus/jarima yo'q (tezlik, urinishlar soni test ballini tashkil etmaydi)
- Leaderboardga qo'shilishda: `Leaderboard ball = To'g'ri javoblar / Urinishlar soni` (foiz) — bir necha marta yechgan o'quvchida ko'rsatkich pasayib boradi

### 5.4. Ma'ruzalar

**5.4.1. Ma'ruza formatlar**

| Format | Qo'llanish | Fayl hajmi chegarasi *(taxmin)* |
|--------|-----------|--------------------------------|
| PDF | Matn ma'ruzalari, darsliklar | 5 MB |
| Video | Video darslar | 100 MB *(Cloudflare Stream orqali)* |
| Audio | Audio darslar, podkastlar | 20 MB |
| PPT | Slaydli taqdimotlar | 10 MB (yuklangach PDF'ga konvertatsiya) |

**5.4.2. Ma'ruza qo'shish**

O'qituvchi:
- Fan va sinf(lar) tanlaydi
- Mavzu nomi, tavsifi
- Formatni tanlaydi va fayl yuklaydi
- Videoga subtitr **majburiy** (qo'lda yozadi yoki AI orqali generatsiya qiladi — Whisper)
- Ma'ruzaga tegishli "mavzudan keyingi test" biriktirishi mumkin

Direktor:
- Butun maktab uchun maxsus ma'ruza qo'sha oladi (masalan, "Maktab qoidalari bo'yicha dars")

**5.4.3. Ma'ruzani ko'rish/tinglash**

- PDF: built-in PDF viewer + "Ovozli o'qib berish" (Google Cloud TTS yoki Web Speech)
- Video: Cloudflare Stream player, subtitrlar har doim kiritilishi mumkin, klaviatura boshqaruvi
- Audio: custom audio player, transkripsiya ko'rinadi
- PPT: PDF sifatida ko'riladi
- Barcha ma'ruzalar uchun **bookmark** funksiyasi (qayerda to'xtaganini eslab qolish)

### 5.5. Amaliyotlar

Amaliyot 4 xil bo'ladi:

**5.5.1. Vazifa (Assignment)**
- O'qituvchi vazifa matnini kiritadi, ixtiyoriy fayl (PDF) biriktiradi
- Muddat (deadline) ixtiyoriy
- O'quvchi javob matn yoki fayl (PDF, rasm) sifatida yuboradi
- O'qituvchi qo'lda baholaydi (ball va izoh)

**5.5.2. Test**
→ 5.3-bo'limda batafsil yoritilgan

**5.5.3. Interaktiv o'yin**

O'qituvchi quyidagi shablonlardan birini tanlaydi va kontent kiritadi:

| Shablon | Tavsifi | O'qituvchi kiritadigan |
|---------|---------|------------------------|
| **So'z–Ma'no** | So'zni to'g'ri ma'nosiga bog'lash | So'z–ma'no juftliklari ro'yxati |
| **To'g'ri tartib** | Narsalarni yoki hodisalarni to'g'ri tartibga joylash | Elementlar va to'g'ri tartibi |
| **Xotira kartalari** | Juft kartalarni topish | Juftlik rasm/matnlar |

Natija: har bir o'yin uchun ball, vaqt, leaderboard'ga qo'shiladi (MVP uchun uy testiga o'xshab cheksiz yechiladi).

**5.5.4. Mashqlar**

- Oddiy interaktiv mashqlar (masalan: javob matnini yozish, to'g'ri variantni tanlash)
- Testdan farqi: ball hisoblanmaydi, faqat mashq qilish uchun

### 5.6. Qo'shimcha mustaqil o'rganish uchun kitoblar

> **Eslatma:** Bu "elektron kutubxona" emas, balki fanga qo'shimcha, mustaqil o'rganish uchun maxsus kitoblar kolleksiyasi.

**5.6.1. Kitob qo'shish (admin, direktor yoki o'qituvchi tomonidan)**

Kiritiladigan maydonlar:
- Kitob nomi (title)
- Tavsif (description)
- PDF fayl (max 5 MB)
- Audio versiya — 3 yo'ldan biri:
  - **Yuklash:** mavjud audio faylni yuklash
  - **AI generatsiyasi:** platforma PDF'ni audio formatga o'tkazadi
  - **Aralash:** qisman yuklash + qisman AI

**5.6.2. Audio generatsiyasi**

- **TTS manbai tanlanadi** (admin):
  - Web Speech API (brauzerda, bepul)
  - Google Cloud TTS (sifatliroq, lekin generatsiya server tomonida)
- Kitob hajmi bo'yicha ogohlantirish:
  - 5 MB PDF ≈ ~50–100 sahifa
  - Audio generatsiyasi sahifalar soniga proporsional ravishda vaqt va pul talab qiladi
  - Agar sahifalar soni 50 dan ko'p bo'lsa, admin ekranda ogohlantirish oladi
  - Admin baribir davom ettira oladi (xohlasa)
- **Preview rejimi:** saqlashdan oldin audioni eshitib ko'rish mumkin
- **Cache:** bir marta generatsiya qilingan audio qayta-qayta ishlatiladi, saqlanadi
- **Streaming:** audio to'liq yuklanmasdan, qismma-qism eshittiriladi (adaptiv)

**5.6.3. OCR (skanerlangan PDF uchun)**

- Agar PDF ichida matn yo'q bo'lsa (rasm ko'rinishidagi skan) — OCR avtomatik yoqiladi
- OCR manbai: **Gemini 2.5 Pro Vision** (o'zbek lotin va kirill matn uchun yaxshi)
- OCR muvaffaqiyatsiz bo'lsa — admin ogohlantiriladi, kitobni qayta yuklash talab etiladi

**5.6.4. O'quvchi tomonidan foydalanish**

- PDF ichida o'qish (built-in viewer)
- Audio tinglash (player, pause/resume, tezlik)
- **Bookmark** — qayerda to'xtaganini eslab qoladi (PDF sahifa + audio vaqt)
- Matn va audio sinxron bo'lishi mumkin (agar AI tomonidan generatsiya qilingan bo'lsa)

### 5.7. Leaderboard

**5.7.1. Ikki xil leaderboard**

1. **Doimiy leaderboard** — barcha vaqt uchun to'plangan ballar
2. **Haftalik leaderboard** — har dushanba boshida reset qilinadi

**5.7.2. Qamrov va ko'rinish**

- **O'quvchi** — faqat o'z sinfi (o'z maktabidagi) leaderboard'ini ko'radi
- **O'qituvchi** — o'zi dars beradigan sinflar leaderboard'ini ko'radi
- **Direktor** — butun maktab bo'yicha leaderboard'ni ko'radi (sinf-sinf bo'yicha alohida)
- **Super admin** — barcha maktablar va sinflar bo'yicha

**5.7.3. Ball hisoblash**

- Faqat **test** va **interaktiv o'yin** natijalari leaderboard'ga kiradi
- Formulasi: `O'rtacha = (To'g'ri javoblar yig'indisi) / (Urinishlar soni)` (foiz)
- Ko'p urinish → o'rtacha pasayishi mumkin, bu leaderboard'ga ta'sir qiladi

**5.7.4. Ko'rinish**

Leaderboard'da ko'rsatiladi:
- O'rin (rank)
- Ism Familiya (nickname yo'q, haqiqiy ism)
- Umumiy ball / foiz
- Haftalik o'zgarish (↑ / ↓ / —)

### 5.8. Bildirishnomalar *(taxmin)*

MVP uchun **faqat platforma ichidagi** bildirishnomalar (SMS va email yo'q):

- O'quvchi ro'yxati tasdiqlanganda / rad etilganda
- Yangi ma'ruza qo'shilganda (o'z sinfiga)
- Yangi vazifa qo'shilganda (muddati bilan)
- Vazifa baholanganda
- O'qituvchi tomonidan shaxsiy xabar
- Leaderboard'da yuqoriga yoki pastga siljiganda (ixtiyoriy)

### 5.9. Analitika

**5.9.1. O'quvchi shaxsiy profili**

- Yechilgan testlar soni, o'rtacha natija
- Har bir fan bo'yicha progress (masalan: "Matematika: 45% tugallangan")
- Leaderboarddagi joy (sinf ichida)
- Oxirgi faollik vaqti
- Tugatilgan ma'ruzalar ro'yxati

**5.9.2. O'qituvchi dashbordi**

- O'z sinflari o'quvchilari ro'yxati (har biriga klik → batafsil)
- Har bir o'quvchining:
  - Sensor ehtiyojlari (qanday rejimlar yoqilgan)
  - Kirish testi natijasi (foiz va 1–5 daraja — faqat o'qituvchiga ko'rinadi)
  - Hozirgi progress
  - So'nggi testlar natijalari
- Test statistikasi:
  - Qaysi savollar ko'pchilik tomonidan xato javob berilgan
  - O'rtacha yechish vaqti
  - Ishtirok foizi

**5.9.3. Direktor dashbordi**

- Butun maktab bo'yicha yuqoridagi ma'lumotlar
- Sinflar o'rtasida qiyosiy grafiklar
- O'qituvchilar faollik ko'rsatkichi

**5.9.4. Super admin dashbordi**

- Tizim bo'yicha umumiy statistika
- Maktablar soni, o'quvchilar, o'qituvchilar soni
- Faollik grafiklari
- Tizim resurslari (storage, API chaqiruvlar)

> **Eslatma:** Export (Excel/CSV) funksiyasi MVP'da **yo'q**. Kelgusi versiyada qo'shilishi mumkin.

### 5.10. Profil va sozlamalar

Har bir foydalanuvchi o'z profilida:
- Shaxsiy ma'lumotlarni tahrirlashi (ism, familiya)
- Parolni o'zgartirishi (eski parolni kiritib)
- Imkoniyatlar sozlamalarini boshqarishi (5.2.3)
- TTS tanlovi
- Bildirishnomalar sozlamalari

---

## 6. NOFUNKSIONAL TALABLAR

### 6.1. Accessibility — WCAG 2.1 AA standarti (MAJBURIY)

Bu — loyihaning **eng muhim ustuvor yo'nalishi**. Barcha komponentlar quyidagi talablarni bajarishi shart:

**6.1.1. Semantik HTML va ARIA**
- `<button>`, `<nav>`, `<main>`, `<article>`, `<section>` kabi semantik taglar
- `aria-label`, `aria-describedby`, `aria-live`, `role` atributlar
- Har bir interaktiv element uchun mos label

**6.1.2. Klaviatura navigatsiyasi**
- Barcha amallar faqat klaviatura orqali bajarilishi mumkin (sichqoncha shart emas)
- Tab tartibi mantiqiy bo'lishi
- Focus indikatorlar aniq va ko'zga tashlanadigan (2px outline minimum)
- Modallar va overlay'lar focus trap bilan

**6.1.3. Rang va kontrast**
- Matn va fon kontrasti: **kamida 4.5:1** (AA darajasi)
- Katta matnlar uchun: kamida 3:1
- Ma'lumot faqat rang orqali yetkaziladi (masalan, "qizil = xato" + "❌" belgi)
- 3 xil rang sxemasi: **oddiy**, **yuqori kontrast**, **qorong'i rejim**

**6.1.4. Shrift o'lcham**
- 4 ta o'lcham variant: kichik (14px) / o'rta (16px) / katta (20px) / juda katta (24px)
- Butun interfeys proporsional ravishda kattalashadi
- Min touch target: 44×44px

**6.1.5. Screen reader moslashuvi**
- NVDA, JAWS, VoiceOver tomonidan sinovdan o'tkaziladi
- Dinamik kontent `aria-live` orqali e'lon qilinadi
- Rasmlarda `alt` matni, bezakli rasmlar `alt=""` bilan

**6.1.6. Platforma tomonidan o'qish (TTS)**
- Ro'yxatdan o'tishda o'quvchi tanlaydi:
  - "Platforma o'zi o'qib berishini istayman" → Web Speech API yoki Google Cloud TTS
  - "Menda o'zimning screen reader dasturim bor" → faqat semantik markup, tizim tomonidan ovoz chiqarilmaydi
- Har bir matn elementi yonida "Ovozli o'qish" tugmasi bo'lishi (ixtiyoriy foydalanish)

**6.1.7. Motion va animatsiyalar**
- `prefers-reduced-motion` media query qo'llab-quvvatlanadi
- Sozlamalarda qo'lda o'chirish mumkin
- Parpirash (flashing) yo'q (epileptik xuruj oldini olish)

### 6.2. Responsiv dizayn

- Minimal qo'llab-quvvatlanadigan ekran: 320px kenglikda (mobil)
- Breakpoint'lar: mobil (<640px), tablet (640–1024px), desktop (>1024px)
- Mobilda ham barcha funksiyalar ishlaydi (offline rejim yo'q)

### 6.3. Brauzerlar

Qo'llab-quvvatlanadigan brauzerlar (oxirgi 2 versiya):
- Chrome, Edge, Firefox, Safari
- Mobil: Chrome Android, Safari iOS

### 6.4. Til

- Interfeys **faqat o'zbek tilida** (lotin alifbosi)
- Kelgusida boshqa tillar qo'shilishi mumkin (i18n tayyorlash maqsadga muvofiq)

### 6.5. Performance

- Sahifaning birinchi ma'noli ko'rinishi (LCP): <2.5 sekund
- Interaktivligi (TTI): <3 sekund
- Kitob audio streaming: 1 sekunddan kam kutish vaqti
- DB so'rovlari indexlangan va optimallashtirilgan

---

## 7. MA'LUMOTLAR MODELI (yuqori daraja)

Asosiy jadvallar ro'yxati. Batafsil schema keyingi bosqichda tuziladi.

### 7.1. Foydalanuvchilar va ierarxiya

| Jadval | Asosiy maydonlar |
|--------|------------------|
| `users` | id, phone, password_hash, first_name, last_name, role, status, created_at |
| `schools` | id, name, address, director_id |
| `classes` | id, school_id, grade (5–9), letter (A, B, C...) |
| `subjects` | id, name (global, super admin boshqaradi) |
| `school_subjects` | school_id, subject_id |
| `teacher_assignments` | teacher_id, school_id, class_id, subject_id |
| `student_profiles` | user_id, school_id, class_id, approved_by, approved_at |
| `accessibility_profiles` | user_id, vision_mode, hearing_mode, motor_mode, tts_source, font_size, contrast_mode, reduce_motion |

### 7.2. O'quv kontenti

| Jadval | Asosiy maydonlar |
|--------|------------------|
| `lectures` | id, creator_id (teacher/director), school_id, subject_id, class_id, title, description, content_type, file_url, created_at |
| `lecture_subtitles` | lecture_id, vtt_url, language, source (manual/ai) |
| `practices` | id, subject_id, class_id, type (assignment/test/game/exercise), ref_id |
| `assignments` | id, teacher_id, subject_id, class_id, title, description, file_url, deadline |
| `assignment_submissions` | id, assignment_id, student_id, text, file_url, submitted_at, grade, comment |

### 7.3. Testlar

| Jadval | Asosiy maydonlar |
|--------|------------------|
| `tests` | id, teacher_id, subject_id, title, description, time_limit, test_type (entry/post_topic/home_study), max_attempts |
| `test_classes` | test_id, class_id (bir test → bir necha sinf) |
| `questions` | id, test_id, question_text, question_type, image_url, points, order |
| `question_options` | id, question_id, option_text, is_correct |
| `test_attempts` | id, student_id, test_id, started_at, finished_at, score |
| `test_answers` | attempt_id, question_id, answer_text, is_correct |

### 7.4. O'yinlar

| Jadval | Asosiy maydonlar |
|--------|------------------|
| `games` | id, teacher_id, template_type (word_match/ordering/memory), subject_id, title, content_json |
| `game_classes` | game_id, class_id |
| `game_attempts` | id, student_id, game_id, score, duration, completed_at |

### 7.5. Kitoblar

| Jadval | Asosiy maydonlar |
|--------|------------------|
| `books` | id, uploader_id, title, description, pdf_url, audio_url, audio_source (uploaded/web_speech/google_tts), ocr_required |
| `book_bookmarks` | user_id, book_id, page, audio_timestamp, updated_at |

### 7.6. Leaderboard va analitika

- Leaderboard asosan **view** (hisoblangan ko'rinish) sifatida amalga oshiriladi
- Agregatsiyalar real vaqtda hisoblanadi (MVP uchun kichik ma'lumotlarda yetarli)
- Kelgusida materialized view'ga o'tkazish mumkin

### 7.7. Bildirishnomalar

| Jadval | Asosiy maydonlar |
|--------|------------------|
| `notifications` | id, user_id, type, title, message, link, read, created_at |

---

## 8. SAHIFALAR RO'YXATI (FRONTEND)

### 8.1. Umumiy

- `/` — Landing (loyiha haqida)
- `/login` — Tizimga kirish
- `/register` — Ro'yxatdan o'tish
- `/pending` — Ariza kutilmoqda sahifasi

### 8.2. O'quvchi

- `/app` — Dashboard (fan ro'yxati, oxirgi ma'ruzalar, topshiriqlar)
- `/app/subjects/[id]` — Fan sahifasi (ma'ruzalar, vazifalar, testlar)
- `/app/lectures/[id]` — Ma'ruza ko'rish
- `/app/tests/[id]` — Testni yechish
- `/app/tests/[id]/result` — Natija sahifasi
- `/app/games/[id]` — O'yinni o'ynash
- `/app/assignments/[id]` — Vazifani ko'rish va yuborish
- `/app/books` — Kitoblar ro'yxati
- `/app/books/[id]` — Kitobni o'qish/tinglash
- `/app/leaderboard` — O'z sinfining leaderboard'i
- `/app/profile` — Shaxsiy profil
- `/app/settings` — Sozlamalar (imkoniyatlar, bildirishnomalar, parol)
- `/app/onboarding/sensor-screening` — Sensor screening
- `/app/onboarding/entry-test/[subject_id]` — Kirish testi

### 8.3. O'qituvchi

- `/teacher` — Dashboard
- `/teacher/students` — O'quvchilar ro'yxati (kutilayotgan + tasdiqlangan)
- `/teacher/students/[id]` — O'quvchi batafsil (sensor, natijalar)
- `/teacher/lectures` — Ma'ruzalarim
- `/teacher/lectures/new` — Yangi ma'ruza qo'shish
- `/teacher/tests` — Testlarim
- `/teacher/tests/new` — Yangi test tuzish
- `/teacher/tests/[id]/edit` — Test tahrirlash
- `/teacher/games` — O'yinlarim
- `/teacher/games/new` — Yangi o'yin yaratish
- `/teacher/assignments` — Vazifalar
- `/teacher/assignments/[id]/submissions` — Vazifa javoblarini baholash
- `/teacher/analytics` — Analitika

### 8.4. Direktor

- `/director` — Dashboard
- `/director/teachers` — O'qituvchilar ro'yxati
- `/director/teachers/new` — Yangi o'qituvchi qo'shish
- `/director/classes` — Sinflar ro'yxati
- `/director/students` — Butun maktab o'quvchilari
- `/director/subjects` — Maktab fanlari
- `/director/lectures` — Maktab-umumiy ma'ruzalar
- `/director/analytics` — Maktab analitikasi

### 8.5. Super admin

- `/admin` — Dashboard
- `/admin/schools` — Maktablar
- `/admin/directors` — Direktorlar
- `/admin/subjects` — Global fanlar ro'yxati
- `/admin/users` — Barcha foydalanuvchilar
- `/admin/analytics` — Tizim bo'yicha analitika

---

## 9. BOSQICHLAR (MILESTONES)

### Bosqich 1: Asos (2–3 hafta)
- [ ] Loyiha arxitekturasi (Next.js + Supabase sozlash)
- [ ] Autentifikatsiya (4 rol, RLS policies)
- [ ] Asosiy UI kutubxonasi (shadcn/ui + accessibility moslashuvi)
- [ ] Maktab, sinf, fan CRUD (super admin va direktor)
- [ ] O'quvchi ro'yxatdan o'tish + tasdiqlash oqimi

### Bosqich 2: O'quv kontenti (3–4 hafta)
- [ ] Ma'ruza CRUD (PDF, video, audio, PPT yuklash)
- [ ] Cloudflare R2 + Stream integratsiyasi
- [ ] Video subtitr (qo'lda va AI orqali — Whisper)
- [ ] Ma'ruzani ko'rish sahifasi (PDF viewer, video player)

### Bosqich 3: Testlar va o'yinlar (3–4 hafta)
- [ ] Test builder (o'qituvchi uchun)
- [ ] Test yechish (Web Speech API bilan)
- [ ] 3 ta o'yin shabloni
- [ ] Natija va baholash
- [ ] Vazifa yuborish va baholash

### Bosqich 4: Accessibility (2 hafta, lekin butun bosqichlar davomida ham)
- [ ] Sensor screening implementatsiyasi
- [ ] Imkoniyat rejimlari (ko'rish, eshitish, motorika)
- [ ] WCAG 2.1 AA audit va tuzatishlar
- [ ] Screen reader sinovlari (NVDA, VoiceOver)

### Bosqich 5: Kitoblar va AI (2–3 hafta)
- [ ] Kitob qo'shish (PDF upload)
- [ ] Google Cloud TTS integratsiyasi
- [ ] Gemini Vision OCR (skanerlangan kitoblar uchun)
- [ ] Audio generatsiyasi, preview, cache
- [ ] Streaming audio player
- [ ] Bookmark

### Bosqich 6: Leaderboard va analitika (2 hafta)
- [ ] Doimiy va haftalik leaderboard
- [ ] O'quvchi profili (progress)
- [ ] O'qituvchi/direktor/admin analitikasi
- [ ] Bildirishnomalar tizimi

### Bosqich 7: Sinov va tayyorlov (2 hafta)
- [ ] QA va bug fixing
- [ ] Accessibility test (haqiqiy foydalanuvchilar bilan, iloji bo'lsa)
- [ ] Performance optimizatsiya
- [ ] Production deploy

**Jami taxminiy muddat:** 16–20 hafta (4–5 oy)

---

## 10. CHEKLOVLAR VA TAXMINLAR

### 10.1. Cheklovlar

- Xavfsizlik MVP uchun birinchi darajali emas — keyinroq takomillashtiriladi
- SMS/email tasdiqlash **yo'q**
- Offline rejim **yo'q**
- Mobil ilova **yo'q** (faqat responsiv web)
- Surdotarjima (sign language) **yo'q** — faqat subtitr
- Adaptiv qiyinlik (moslashuvchan darajalar) MVP'da **yo'q**
- Ma'lumotlarni export qilish (CSV/Excel) MVP'da **yo'q**

### 10.2. Taxminlar (tasdiqlash kerak)

| Soha | Taxmin | Tasdiqlang |
|------|--------|-----------|
| Alifbo | Lotin | ☐ |
| Video hosting | Cloudflare Stream | ☐ |
| AI subtitr | OpenAI Whisper API | ☐ |
| OCR | Gemini 2.5 Pro Vision | ☐ |
| Fayl hajmi: video | 100 MB | ☐ |
| Fayl hajmi: audio | 20 MB | ☐ |
| Fayl hajmi: PPT | 10 MB | ☐ |
| Bildirishnomalar | Faqat platforma ichida | ☐ |
| O'yin shablonlari | So'z-ma'no, To'g'ri tartib, Xotira kartalari | ☐ |
| Ishga tushirish muddati | 4–5 oy | ☐ |

---

## 11. KELGUSI VERSIYALAR UCHUN G'OYALAR

MVP tasdiqlangandan keyin ko'rib chiqilishi mumkin:

- SMS orqali telefon raqam tasdiqlash (OTP)
- 2FA va yaxshilangan xavfsizlik
- Mobil ilova (React Native yoki PWA)
- Offline rejim (kitoblar va ma'ruzalar uchun)
- Rus tili va kirill alifbosi
- Adaptiv qiyinlik (savollar teg bilan)
- Ota-ona kabineti (o'z farzandini kuzatish)
- Ko'proq o'yin shablonlari
- Ma'lumotlarni export (PDF/Excel hisobotlar)
- Gamifikatsiya (badge, daraja ikonalari)
- Real vaqt chat (o'qituvchi–o'quvchi)
- Bir vaqtning o'zida bir nechta o'qituvchining bir testga kiritishi (co-authorship)
- Video dars yozish (live streaming)
- Surdotarjima avatari (agar O'zbek ishora tili AI modeli paydo bo'lsa)

---

## 12. LUG'AT

| Termin | Tushuntirish |
|--------|--------------|
| TZ | Texnik topshiriq (Техническое задание) |
| MVP | Minimum Viable Product — minimal ishchi mahsulot |
| RLS | Row-Level Security — DB qatoridagi himoya (Supabase) |
| WCAG | Web Content Accessibility Guidelines — veb kontent imkoniyatlari yo'riqnomasi |
| TTS | Text-to-Speech — matnni ovozga aylantirish |
| STT | Speech-to-Text — ovozni matnga aylantirish |
| OCR | Optical Character Recognition — rasmdagi matnni aniqlash |
| ARIA | Accessible Rich Internet Applications — imkoniyatga doir standartlar to'plami |
| HLS/DASH | Video streaming protokollari |

---

*Ushbu TZ MVP bosqichi uchun mo'ljallangan. Keyingi takomillashtirishlarda qo'shimchalar va o'zgartirishlar kiritilishi mumkin.*
