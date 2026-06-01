import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@audit.mn" },
    update: {},
    create: {
      email: "admin@audit.mn",
      passwordHash: adminPassword,
      firstName: "Админ",
      lastName: "Хэрэглэгч",
      role: "ADMIN",
    },
  });

  // Create auditor user
  const auditorPassword = await bcrypt.hash("auditor123", 12);
  const auditor = await prisma.user.upsert({
    where: { email: "auditor@audit.mn" },
    update: {},
    create: {
      email: "auditor@audit.mn",
      passwordHash: auditorPassword,
      firstName: "Болд",
      lastName: "Аудитор",
      role: "AUDITOR",
    },
  });

  // Create ISO 27001:2022 standard
  const standard = await prisma.standard.upsert({
    where: { code: "ISO 27001:2022" },
    update: {},
    create: {
      code: "ISO 27001:2022",
      name: "Information Security Management Systems",
      version: "2022",
      description: "Requirements for establishing, implementing, maintaining and continually improving an information security management system",
    },
  });

  // Create sample controls (Annex A)
  const controls = [
    { clause: "A.5.1", title: "Policies for information security", category: "Organizational Controls", question: "Мэдээллийн аюулгүй байдлын бодлого баталсан уу?" },
    { clause: "A.5.2", title: "Information security roles and responsibilities", category: "Organizational Controls", question: "Мэдээллийн аюулгүй байдлын үүрэг хариуцлага тодорхойлсон уу?" },
    { clause: "A.5.3", title: "Segregation of duties", category: "Organizational Controls", question: "Үүрэг хариуцлагын зөрчилгүй байдлыг хангаж байна уу?" },
    { clause: "A.6.1", title: "Screening", category: "People Controls", question: "Ажилтнуудын шалгаруулалт хийгдэж байна уу?" },
    { clause: "A.6.2", title: "Terms and conditions of employment", category: "People Controls", question: "Хөдөлмөрийн гэрээнд аюулгүй байдлын нөхцөл тусгасан уу?" },
    { clause: "A.7.1", title: "Physical security perimeters", category: "Physical Controls", question: "Физик аюулгүй байдлын хилийн хязгаар тодорхойлсон уу?" },
    { clause: "A.8.1", title: "User endpoint devices", category: "Technological Controls", question: "Хэрэглэгчийн төхөөрөмжийн аюулгүй байдлыг хангаж байна уу?" },
    { clause: "A.8.5", title: "Secure authentication", category: "Technological Controls", question: "Аюулгүй нэвтрэлт танилт хангагдсан уу?" },
    { clause: "A.8.9", title: "Configuration management", category: "Technological Controls", question: "Тохиргооны удирдлагын процесс хэрэгжүүлсэн үү?" },
    { clause: "A.8.16", title: "Monitoring activities", category: "Technological Controls", question: "Хяналтын үйл ажиллагааг тогтмол явуулж байна уу?" },
  ];

  for (let i = 0; i < controls.length; i++) {
    await prisma.control.upsert({
      where: { standardId_clause: { standardId: standard.id, clause: controls[i].clause } },
      update: {},
      create: {
        standardId: standard.id,
        clause: controls[i].clause,
        title: controls[i].title,
        category: controls[i].category,
        question: controls[i].question,
        sortOrder: i + 1,
      },
    });
  }

  // Create sample organization
  const org = await prisma.organization.upsert({
    where: { id: "sample-org" },
    update: {},
    create: {
      id: "sample-org",
      name: "Жишээ ХХК",
      industry: "Мэдээллийн технологи",
      registrationNo: "1234567",
      contactEmail: "info@sample.mn",
    },
  });

  console.log("✅ Seed completed!");
  console.log(`   Admin: admin@audit.mn / admin123`);
  console.log(`   Auditor: auditor@audit.mn / auditor123`);
  console.log(`   Standard: ${standard.code}`);
  console.log(`   Controls: ${controls.length} controls created`);
  console.log(`   Organization: ${org.name}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
