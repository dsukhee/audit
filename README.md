# ISO 27001 Audit Platform

ISO 27001 болон мэдээллийн аюулгүй байдлын аудитыг системчлэх SaaS платформ.

## Технологи

| Давхарга | Технологи |
| --- | --- |
| Frontend | Next.js 14 (App Router) + TailwindCSS |
| Backend | NestJS 10 + Prisma |
| Database | PostgreSQL |
| Storage | MinIO / AWS S3 (S3-нийцтэй) |
| AI | OpenAI / Local LLM (abstraction) |

## Монорепо бүтэц

```
audit/
├── apps/
│   ├── api/         # NestJS backend (Auth, RBAC, ...)
│   └── web/         # Next.js frontend
├── packages/
│   ├── database/    # Prisma schema + client + ISO 27001 seed
│   └── shared/      # Risk scoring (5×5), тогтмол, төрлүүд
└── docker-compose.yml  # PostgreSQL + MinIO
```

## Эхлүүлэх (Setup)

> Шаардлага: Node.js ≥ 20, pnpm ≥ 9, Docker.

```bash
# 1. Орчны хувьсагч
cp .env.example .env

# 2. Сангуудыг суулгах
pnpm install

# 3. Дэд бүтэц (Postgres + MinIO) асаах
docker compose up -d

# 4. Prisma client үүсгэх
pnpm db:generate

# 5. Дотоод багцуудыг build хийх (api/web ажиллуулахаас өмнө)
pnpm --filter @audit/shared build
pnpm --filter @audit/database build

# 6. Өгөгдлийн сангийн хүснэгт үүсгэх (migration)
pnpm db:migrate

# 7. ISO 27001:2022 хяналт + admin хэрэглэгч seed хийх
pnpm db:seed

# 8. Хөгжүүлэлтийн серверүүд (api :4000, web :3000)
pnpm dev
```

### Анхны нэвтрэх

```
Имэйл:    admin@audit.local
Нууц үг:  Admin@12345
```

> Эхний нэвтрэлтийн дараа нууц үгээ солихыг зөвлөж байна.

## Үндсэн скриптүүд

| Команд | Үйлдэл |
| --- | --- |
| `pnpm dev` | api + web зэрэг ажиллуулах |
| `pnpm db:migrate` | Prisma migration |
| `pnpm db:seed` | ISO 27001 controls + admin seed |
| `pnpm db:studio` | Prisma Studio нээх |
| `pnpm infra:up` / `infra:down` | Docker дэд бүтэц асаах/унтраах |

## Үйлчилгээний хаягууд

| Үйлчилгээ | URL |
| --- | --- |
| Web | http://localhost:3000 |
| API | http://localhost:4000/api |
| API health | http://localhost:4000/api/health |
| MinIO console | http://localhost:9001 |

## Roadmap

- **Phase 1 (одоо):** Монорепо суурь, Auth + RBAC, ISO 27001 seed
- **Phase 2:** Audit Management + Checklist Engine + Evidence
- **Phase 3:** Nonconformity + CAPA + Risk Assessment
- **Phase 4:** AI Audit Assistant + Reports + Dashboard
