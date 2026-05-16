# AGENT_CHANGES

Qisqa jurnal: agent tomonidan qilingan o'zgarishlar, qachon va qaysi so'rov asosida.

## 2026-05-16 14:02:19 +05

- So'rov: "loyhani to'liq o'rgan"
  - Nima qilindi: loyiha strukturasi, `app/`, `lib/`, `server/`, auth/role oqimi, assignments oqimi, Next 16 docs va lint holati tahlil qilindi.
  - Nega: keyingi kod yozishdan oldin to'liq kontekst olish uchun.

- So'rov: student assignment daraja oqimini qo'shish (`past/o'rta/yuqori`, `bajardim/bajara olmadim`, teacher tasdiqi, testga yo'naltirish)
  - Nima qilindi: assignment progress workflow backend/frontendga qo'shildi:
    - student: `done` yoki `cannot_do`
    - teacher: `approve` yoki `reject`
    - assignments ro'yxatida progress ko'rsatish
    - teacher submissionsda progress review tugmalari
  - Nega: siz tariflagan adaptiv topshiriq oqimini ishlatish uchun.

- So'rov: "daraja bittada tushmasin/oshmasin, 3 bosqichli counter bo'lsin"
  - Nima qilindi: `level_progress_score` logikasi joriy qilindi:
    - `+1/-1` hisob yuradi
    - `6` ga yetsa daraja ko'tarilib score `3` ga qaytadi
    - `0` ga yetsa daraja tushib score `3` ga qaytadi
  - Nega: siz bergan `+ + -` kabi net hisob mantiqini qo'llash uchun.

- So'rov: "Supabase kerak emas, Node.js backendga mosla, Supabase'ni olib tashla"
  - Nima qilindi:
    - `lib/supabase/*` fayllari olib tashlandi
    - Supabase dependency'lar root va `server/` package'lardan olib tashlandi
    - importlar `lib/types/domain.ts` ga ko'chirildi
    - serverdagi eski `migrate-from-supabase` skriptlari olib tashlandi
  - Nega: loyiha to'liq Node.js backend bilan ishlashi va Supabase izlari qolmasligi uchun.

---

Eslatma: keyingi barcha o'zgarishlar ham shu faylga vaqt + sabab + qisqa natija ko'rinishida qo'shib boriladi.

## 2026-05-16 14:11:18 +05

- So'rov: "topshiriq qo'shishda tavsifni xohlasa PDF shaklida ham qo'shish; fayl R2'ga saqlansin"
  - Nima qilindi:
    - `teacher` assignment yaratish formasiga ixtiyoriy PDF upload qo'shildi
    - upload `useFileUpload()` orqali R2 (`/api/upload` yoki `/api/upload/presign`) ga yuboriladi
    - yaratilayotgan assignment payloadiga `file_url` yuborish qo'shildi
    - `student` assignment detail sahifasida "Tavsif PDF'ni ochish" havolasi chiqarildi
  - Nega: topshiriq tavsifini matndan tashqari PDF ko'rinishida berish talabi uchun.

## 2026-05-16 14:37:33 +05

- So'rov: Netlify build logidagi `Property 'file_url' does not exist on type 'AssignmentRow'` xatosini tuzatish
  - Nima qilindi: `lib/api/assignments.ts` ichidagi `AssignmentRow` type'iga `file_url?: string | null` maydoni qo'shildi.
  - Nega: `app/app/assignments/[id]/page.tsx` da `assignment.file_url` ishlatilgani uchun TypeScript build xatosini bartaraf etish.

## 2026-05-16 14:49:02 +05

- So'rov: "lectures page uzoq loadingdan keyin xatolik beradi"
  - Nima qilindi:
    - `lib/api/server.ts` ga server API chaqiriqlari uchun `10s` timeout (`AbortController`) qo'shildi.
    - timeout holati `ApiError(504)` bilan boshqarildi.
    - `app/app/lectures/page.tsx` da no-data holatiga qayta urinish haqida foydalanuvchi xabari qo'shildi.
  - Nega: backend javobi osilib qolsa sahifa cheksiz kutib turmasligi va tezroq fallback berishi uchun.

## 2026-05-16 14:55:49 +05

- So'rov: "localhost'da lectures bo'sh chiqyapti"
  - Nima qilindi:
    - `server/src/routes/students.ts` da legacy DB schema uchun fallback qo'shildi:
      - `/students/me` query'da yangi ustunlar yo'q bo'lsa eski query bilan javob qaytaradi.
      - `/students/me/assignments` ham eski schema holatida default qiymatlar bilan ishlaydi.
  - Nega: backend DB migratsiyasi hali to'liq qo'llanmagan holatda ham frontend sahifalar yiqilmasligi uchun.

## 2026-05-16 15:05:30 +05

- So'rov: "video play paytida `The media resource ... was not suitable` xatosi"
  - Nima qilindi:
    - `components/lectures/VideoPlayer.tsx` da `play()` promise xatosi ushlanadigan qilindi.
    - `onError` handler qo'shilib media error kodi bo'yicha aniq xabarlar chiqarildi.
    - Player ichida fallback havola qo'shildi: "Videoni ochish".
  - Nega: decode/codec muammolarida UI yiqilmasligi va foydalanuvchiga aniq yo'naltirish berish uchun.

## 2026-05-16 15:09:19 +05

- So'rov: "video avval ochilgan, hozir ochmay qoldi"
  - Nima qilindi:
    - `VideoPlayer`da `play()` xatosi differensial handling qilindi (`NotSupportedError`, `NotAllowedError`, boshqa holatlar).
    - `onCanPlay` qo'shilib vaqtinchalik xato chiqqanda qayta yuklangach xabar avtomatik tozalanadigan qilindi.
  - Nega: oldingi qattiq error-message logikasi sabab bo'lishi mumkin bo'lgan regressiyani yumshatish va noto'g'ri "format xato" signalini kamaytirish uchun.

## 2026-05-16 15:11:34 +05

- So'rov: "video link to'g'ridan-to'g'ri ochiladi, lekin sayt playerida ochilmaydi"
  - Nima qilindi: `VideoPlayer` ichidagi `crossOrigin=\"anonymous\"` atributi olib tashlandi.
  - Nega: R2 CORS headerlari to'liq bo'lmasa, aynan `crossOrigin` sabab `<video>` yuklanishi bloklanishi mumkin; direct URL esa ochilaveradi.

## 2026-05-16 15:18:57 +05

- So'rov: "teacher lecture video upload formida controlled/uncontrolled input xatosi"
  - Nima qilindi: `app/teacher/lectures/new/NewLectureForm.tsx` ichidagi hidden inputlarda `value={field.value ?? ""}` qo'shildi (2 joy).
  - Nega: `undefined`dan stringga o'tish sababli chiqayotgan React controlled/uncontrolled warningni bartaraf etish uchun.

## 2026-05-16 15:29:50 +05

- So'rov: "ma'ruzalarni update qilish imkonini qo'shish"
  - Nima qilindi:
    - Backendga `PUT /lectures/:id` update endpoint qo'shildi (`server/src/routes/lectures.ts`).
    - Frontend API qatlamiga `updateLecture()` qo'shildi (`lib/api/lectures.ts`).
    - Server actionga `updateLectureAction()` qo'shildi (`app/actions/lectures.ts`).
    - Teacher uchun yangi edit sahifa va forma qo'shildi:
      - `app/teacher/lectures/[id]/edit/page.tsx`
      - `app/teacher/lectures/[id]/edit/EditLectureForm.tsx`
    - Teacher lectures ro'yxatida `Tahrirlash` tugmasi qo'shildi (`app/teacher/lectures/page.tsx`).
  - Nega: teacher mavjud ma'ruzani qayta tahrirlay olishi (title, tavsif, fan/sinf, kontent turi/fayli, subtitr) uchun.

## 2026-05-16 15:33:11 +05

- So'rov: "edit formasida fan/sinfda ID chiqib qolishi, mavjud video/VTT holati ko'rinsin va majburiy qayta kiritish bo'lmasin"
  - Nima qilindi:
    - `subject` va `class` select'larda tanlangan qiymat label (nom) ko'rinishida chiqadigan qilindi.
    - Mavjud media fayl va VTT uchun "Hozirgi fayl/VTT mavjud" havolalari qo'shildi.
    - Update submit tugmasidan `!hasFile` cheklovi olib tashlandi (faqat pendingda bloklanadi).
  - Nega: teacher faqat kerakli maydonlarni o'zgartirib saqlay olishi va mavjud resurs holatini ko'rib turishi uchun.
