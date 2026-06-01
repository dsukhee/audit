import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ISO_27001_2022, ISO_27001_2022_CONTROLS } from './data/iso27001-2022';

const prisma = new PrismaClient();

async function seedStandardAndControls() {
  console.log('→ ISO 27001:2022 стандартыг seed хийж байна...');

  const standard = await prisma.standard.upsert({
    where: { code: ISO_27001_2022.code },
    update: {
      name: ISO_27001_2022.name,
      version: ISO_27001_2022.version,
      description: ISO_27001_2022.description,
    },
    create: {
      code: ISO_27001_2022.code,
      name: ISO_27001_2022.name,
      version: ISO_27001_2022.version,
      description: ISO_27001_2022.description,
    },
  });

  // clause → control.id зураглал (parentId-г холбоход хэрэглэнэ)
  const clauseToId = new Map<string, string>();
  let order = 0;

  for (const c of ISO_27001_2022_CONTROLS) {
    const parentId = c.parentClause ? clauseToId.get(c.parentClause) ?? null : null;

    const control = await prisma.control.upsert({
      where: {
        standardId_clause: { standardId: standard.id, clause: c.clause },
      },
      update: {
        title: c.title,
        question: c.question ?? null,
        category: c.category,
        parentId,
        sortOrder: order,
      },
      create: {
        standardId: standard.id,
        clause: c.clause,
        title: c.title,
        question: c.question ?? null,
        category: c.category,
        parentId,
        sortOrder: order,
      },
    });

    clauseToId.set(c.clause, control.id);
    order += 1;
  }

  console.log(`  ✓ ${ISO_27001_2022_CONTROLS.length} хяналт seed хийгдлээ.`);
  return standard;
}

async function seedAdminUser() {
  console.log('→ Анхны admin хэрэглэгчийг seed хийж байна...');

  const email = 'admin@audit.local';
  const passwordHash = await bcrypt.hash('Admin@12345', 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  console.log(`  ✓ Admin: ${email} / Admin@12345 (эхний нэвтрэлтийн дараа солино уу)`);
}

async function main() {
  console.log('=== ISO 27001 Audit Platform — DB seed эхэллээ ===');
  await seedStandardAndControls();
  await seedAdminUser();
  console.log('=== Seed амжилттай дууслаа ===');
}

main()
  .catch((e) => {
    console.error('Seed алдаа:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
