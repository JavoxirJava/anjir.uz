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
