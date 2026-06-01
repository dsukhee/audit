# ISO 27001 Audit Platform

Мэдээллийн аюулгүй байдлын аудитын платформ — ISO 27001:2022 стандартаар аудит хийх, чеклист бөглөх, үл тохирол бүртгэх, эрсдэл үнэлэх, тайлан гаргах.

## 🏗️ Архитектур

```
audit/
├── packages/
│   ├── database/        # Prisma ORM + PostgreSQL schema
│   ├── api/             # Express + tRPC API server (port 4000)
│   └── web/             # Next.js 14 frontend (port 3000)
├── .env.example         # Орчны хувьсагчийн загвар
├── package.json         # npm workspaces root
└── README.md
```

### Технологи

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 14, React 18, Tailwind CSS, tRPC client |
| Backend | Express.js, tRPC v11, Zod validation |
| Database | PostgreSQL 14+, Prisma ORM |
| Auth | JWT + bcrypt |

---

## 🖥️ Windows 11 дээр суулгах заавар

### Шаардлага (Prerequisites)

Эдгээрийг эхлээд суулгана:

| Програм | Татах холбоос |
|---------|---------------|
| **Node.js 18+** | https://nodejs.org (LTS хувилбар сонго) |
| **Git** | https://git-scm.com |
| **PostgreSQL 14+** | https://www.postgresql.org/download/windows/ |

> 💡 **Хялбар сонголт:** PostgreSQL-ийн оронд Docker ашиглаж болно:
> https://www.docker.com/products/docker-desktop/

---

### Алхам 1: Фолдер үүсгэх ба Clone хийх

**PowerShell** нээж дараахыг ажиллуулна:

```powershell
# Хөгжүүлэлтийн фолдер үүсгэх (анх удаа)
mkdir C:\Dev
cd C:\Dev

# Repo clone хийх
git clone https://github.com/dsukhee/audit.git
cd audit
```

> ⚠️ **АНХААРУУЛГА:** `C:\Windows\System32` дотор clone ХИЙХГҮЙ!
> Өөрийн фолдер үүсгэж ажиллаарай (жишээ: `C:\Dev`, `D:\Projects`, эсвэл Desktop).

---

### Алхам 2: Dependencies суулгах

```powershell
npm install
```

---

### Алхам 3: Environment тохируулах

```powershell
# .env файл үүсгэх
copy .env.example .env
```

`.env` файлыг Notepad-ээр нээж PostgreSQL-ийн мэдээллээ оруулна:

```powershell
notepad .env
```

Файлын агуулга:
```env
DATABASE_URL="postgresql://postgres:ТАНЫ_НУУЦ_ҮГ@localhost:5432/auditdb"
PORT=4000
JWT_SECRET="минимум-32-тэмдэгт-санамсаргүй-текст"
CORS_ORIGIN="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

### Алхам 4: PostgreSQL Database үүсгэх

**Сонголт А — pgAdmin ашиглах:**
1. pgAdmin нээх
2. Servers → PostgreSQL → Databases дээр right-click
3. Create → Database → Name: `auditdb` → Save

**Сонголт Б — psql командаар:**
```powershell
psql -U postgres -c "CREATE DATABASE auditdb;"
```

**Сонголт В — Docker ашиглах (хамгийн хялбар):**
```powershell
docker run --name audit-db -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=auditdb -p 5432:5432 -d postgres:16
```

---

### Алхам 5: Database migration ба seed

```powershell
# Prisma client үүсгэх
npm run db:generate

# Migration ажиллуулах (хүснэгтүүд үүсгэх)
npm run db:migrate

# Жишээ өгөгдөл оруулах
cd packages\database
npx tsx prisma/seed.ts
cd ..\..
```

Seed амжилттай дууссан бол:
```
✅ Seed completed!
   Admin: admin@audit.mn / admin123
   Auditor: auditor@audit.mn / auditor123
   Standard: ISO 27001:2022
   Controls: 10 controls created
   Organization: Жишээ ХХК
```

---

### Алхам 6: Серверүүдийг ажиллуулах

**Терминал 1 — API сервер:**
```powershell
npm run dev:api
```
Гаралт: `🚀 API server running at http://localhost:4000`

**Терминал 2 — Web frontend:**
```powershell
npm run dev:web
```
Гаралт: `▲ Next.js ... ready - started server on 0.0.0.0:3000`

---

### Алхам 7: Нээх

Браузер дээр нээнэ:
- **Frontend:** http://localhost:3000
- **API Health:** http://localhost:4000/health
- **Prisma Studio (DB browser):** `npm run db:studio` → http://localhost:5555

---

## 📋 Нэвтрэх мэдээлэл (Seed data)

| Үүрэг | И-мэйл | Нууц үг |
|--------|---------|---------|
| Админ | admin@audit.mn | admin123 |
| Аудитор | auditor@audit.mn | auditor123 |

---

## 🧩 Модулиуд

| Модуль | Тайлбар |
|--------|---------|
| Auth / RBAC | Нэвтрэлт, 3 үүрэг (Admin, Auditor, OrgRep) |
| Organization | Аудит хийлгэх байгууллагууд |
| Audit Management | Аудит үүсгэх, статус удирдах, баг томилох |
| Checklist Engine | ISO хяналт тус бүрээр чеклист бөглөх |
| Evidence | Нотлох баримт файл хавсаргах |
| Nonconformity (NC) | Үл тохирол бүртгэх, CAPA удирдах |
| Risk Assessment | ISO 27005, 5×5 эрсдэлийн матриц |
| AI Assistant | Finding автоматаар үүсгэх (тохируулах шаардлагатай) |
| Reports | Executive Summary, Full Report (DOCX/PDF) |

---

## 📁 API Endpoints (tRPC)

| Router | Procedures |
|--------|-----------|
| `auth` | `register`, `login`, `me` |
| `audit` | `list`, `getById`, `create`, `updateStatus` |
| `organization` | `list`, `getById`, `create` |
| `checklist` | `getByAudit`, `initialize`, `respond` |
| `nonconformity` | `listByAudit`, `getById`, `create`, `updateStatus` |
| `risk` | `list`, `create`, `update` |

tRPC endpoint: `http://localhost:4000/trpc`

---

## 🛠️ Ашигтай командууд

```powershell
# Бүгдийг нэг дор ажиллуулах (API + Web)
npm run dev

# Зөвхөн API
npm run dev:api

# Зөвхөн Web
npm run dev:web

# Database migration шинээр үүсгэх
npm run db:migrate

# Prisma Studio (визуал DB browser)
npm run db:studio

# Build (production)
npm run build
```

---

## ❓ Түгээмэл алдаа шийдэх

### `ENOENT: Could not read package.json`
→ Та буруу фолдерт байна. `cd C:\Dev\audit` гэж шилжээрэй.

### `Connection refused` (PostgreSQL)
→ PostgreSQL сервис ажиллаж байгаа эсэхийг шалгах:
```powershell
Get-Service postgresql*
```
Зогссон бол: `Start-Service postgresql-x64-16`

### `Port 4000 already in use`
→ Өөр програм ашиглаж байна:
```powershell
netstat -ano | findstr :4000
taskkill /PID <PID_NUMBER> /F
```

---

## 📄 License

Private — Internal use only.
