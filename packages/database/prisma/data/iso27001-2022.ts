/**
 * ISO/IEC 27001:2022 — Checklist Engine-д зориулсан хяналтын өгөгдөл.
 *
 * Бүтэц:
 *   - Management System clauses 4–10 (category: "Management System Clauses")
 *   - Annex A controls: 4 бүлэг (themes) + нийт 93 хяналт
 *       A.5 Organizational controls (37)
 *       A.6 People controls (8)
 *       A.7 Physical controls (14)
 *       A.8 Technological controls (34)
 *
 * `parentClause` нь иерархи холбоосыг илэрхийлнэ (Control.parentId).
 * `title` — албан ёсны англи нэр, `question` — аудитын монгол асуулт.
 */

export interface ControlSeed {
  clause: string;
  title: string;
  category: string;
  question?: string;
  parentClause?: string | null;
}

export const ISO_27001_2022 = {
  code: 'ISO 27001:2022',
  name: 'Information Security Management Systems — Requirements',
  version: '2022',
  description:
    'Мэдээллийн аюулгүй байдлын удирдлагын тогтолцоо (ISMS) — шаардлага. ISO/IEC 27001:2022.',
};

export const ISO_27001_2022_CONTROLS: ControlSeed[] = [
  // ===========================================================================
  // MANAGEMENT SYSTEM CLAUSES (4–10)
  // ===========================================================================
  { clause: '4', title: 'Context of the organization', category: 'Management System Clauses' },
  {
    clause: '4.1',
    title: 'Understanding the organization and its context',
    category: 'Management System Clauses',
    parentClause: '4',
    question: 'Байгууллага ISMS-д нөлөөлөх дотоод, гадаад асуудлуудаа тодорхойлсон эсэх?',
  },
  {
    clause: '4.2',
    title: 'Understanding the needs and expectations of interested parties',
    category: 'Management System Clauses',
    parentClause: '4',
    question: 'Сонирхогч талуудын шаардлага, хүлээлтийг тодорхойлж баримтжуулсан эсэх?',
  },
  {
    clause: '4.3',
    title: 'Determining the scope of the ISMS',
    category: 'Management System Clauses',
    parentClause: '4',
    question: 'ISMS-ийн хамрах хүрээг тодорхойлж баримтжуулсан эсэх?',
  },
  {
    clause: '4.4',
    title: 'Information security management system',
    category: 'Management System Clauses',
    parentClause: '4',
    question: 'ISMS-ийг байгуулж, хэрэгжүүлж, тасралтгүй сайжруулж байгаа эсэх?',
  },

  { clause: '5', title: 'Leadership', category: 'Management System Clauses' },
  {
    clause: '5.1',
    title: 'Leadership and commitment',
    category: 'Management System Clauses',
    parentClause: '5',
    question: 'Дээд удирдлага ISMS-д манлайлал, амлалтаа харуулдаг эсэх?',
  },
  {
    clause: '5.2',
    title: 'Policy',
    category: 'Management System Clauses',
    parentClause: '5',
    question: 'Мэдээллийн аюулгүй байдлын бодлогыг баталж, түгээсэн эсэх?',
  },
  {
    clause: '5.3',
    title: 'Organizational roles, responsibilities and authorities',
    category: 'Management System Clauses',
    parentClause: '5',
    question: 'ISMS-ийн үүрэг, хариуцлага, эрх мэдлийг хуваарилж зарласан эсэх?',
  },

  { clause: '6', title: 'Planning', category: 'Management System Clauses' },
  {
    clause: '6.1',
    title: 'Actions to address risks and opportunities',
    category: 'Management System Clauses',
    parentClause: '6',
    question: 'Эрсдэл, боломжийг шийдвэрлэх арга хэмжээг төлөвлөсөн эсэх?',
  },
  {
    clause: '6.1.1',
    title: 'General',
    category: 'Management System Clauses',
    parentClause: '6.1',
    question: 'Эрсдэл, боломжийг тодорхойлох ерөнхий шаардлагыг хангасан эсэх?',
  },
  {
    clause: '6.1.2',
    title: 'Information security risk assessment',
    category: 'Management System Clauses',
    parentClause: '6.1',
    question: 'Эрсдэлийн үнэлгээний үйл явцыг тодорхойлж, тогтмол хэрэгжүүлдэг эсэх?',
  },
  {
    clause: '6.1.3',
    title: 'Information security risk treatment',
    category: 'Management System Clauses',
    parentClause: '6.1',
    question: 'Эрсдэл боловсруулах төлөвлөгөө (SoA) бэлтгэж хэрэгжүүлсэн эсэх?',
  },
  {
    clause: '6.2',
    title: 'Information security objectives and planning to achieve them',
    category: 'Management System Clauses',
    parentClause: '6',
    question: 'Мэдээллийн аюулгүй байдлын зорилтуудыг тодорхойлж төлөвлөсөн эсэх?',
  },
  {
    clause: '6.3',
    title: 'Planning of changes',
    category: 'Management System Clauses',
    parentClause: '6',
    question: 'ISMS-ийн өөрчлөлтийг төлөвлөгөөт байдлаар хийдэг эсэх?',
  },

  { clause: '7', title: 'Support', category: 'Management System Clauses' },
  {
    clause: '7.1',
    title: 'Resources',
    category: 'Management System Clauses',
    parentClause: '7',
    question: 'ISMS-д шаардлагатай нөөцийг тодорхойлж хангасан эсэх?',
  },
  {
    clause: '7.2',
    title: 'Competence',
    category: 'Management System Clauses',
    parentClause: '7',
    question: 'Ажилтнуудын ур чадварыг тодорхойлж, хангасан эсэх?',
  },
  {
    clause: '7.3',
    title: 'Awareness',
    category: 'Management System Clauses',
    parentClause: '7',
    question: 'Ажилтнууд бодлого болон өөрийн үүргийн талаар мэдлэгтэй эсэх?',
  },
  {
    clause: '7.4',
    title: 'Communication',
    category: 'Management System Clauses',
    parentClause: '7',
    question: 'Дотоод, гадаад харилцааны хэрэгцээг тодорхойлсон эсэх?',
  },
  {
    clause: '7.5',
    title: 'Documented information',
    category: 'Management System Clauses',
    parentClause: '7',
    question: 'Баримтжуулсан мэдээллийг хянаж, шинэчилж удирддаг эсэх?',
  },

  { clause: '8', title: 'Operation', category: 'Management System Clauses' },
  {
    clause: '8.1',
    title: 'Operational planning and control',
    category: 'Management System Clauses',
    parentClause: '8',
    question: 'Үйл ажиллагааны төлөвлөлт, хяналтыг хэрэгжүүлдэг эсэх?',
  },
  {
    clause: '8.2',
    title: 'Information security risk assessment (operation)',
    category: 'Management System Clauses',
    parentClause: '8',
    question: 'Эрсдэлийн үнэлгээг төлөвлөсөн интервалаар гүйцэтгэдэг эсэх?',
  },
  {
    clause: '8.3',
    title: 'Information security risk treatment (operation)',
    category: 'Management System Clauses',
    parentClause: '8',
    question: 'Эрсдэл боловсруулах төлөвлөгөөг хэрэгжүүлдэг эсэх?',
  },

  { clause: '9', title: 'Performance evaluation', category: 'Management System Clauses' },
  {
    clause: '9.1',
    title: 'Monitoring, measurement, analysis and evaluation',
    category: 'Management System Clauses',
    parentClause: '9',
    question: 'ISMS-ийн гүйцэтгэлийг хянаж, хэмжиж, үнэлдэг эсэх?',
  },
  {
    clause: '9.2',
    title: 'Internal audit',
    category: 'Management System Clauses',
    parentClause: '9',
    question: 'Дотоод аудитыг төлөвлөгөөт байдлаар хийдэг эсэх?',
  },
  {
    clause: '9.3',
    title: 'Management review',
    category: 'Management System Clauses',
    parentClause: '9',
    question: 'Удирдлагын дүн шинжилгээг тогтмол хийдэг эсэх?',
  },

  { clause: '10', title: 'Improvement', category: 'Management System Clauses' },
  {
    clause: '10.1',
    title: 'Continual improvement',
    category: 'Management System Clauses',
    parentClause: '10',
    question: 'ISMS-ийг тасралтгүй сайжруулдаг эсэх?',
  },
  {
    clause: '10.2',
    title: 'Nonconformity and corrective action',
    category: 'Management System Clauses',
    parentClause: '10',
    question: 'Үл тохирлыг бүртгэж, залруулах арга хэмжээ авдаг эсэх?',
  },

  // ===========================================================================
  // ANNEX A — A.5 ORGANIZATIONAL CONTROLS (37)
  // ===========================================================================
  { clause: 'A.5', title: 'Organizational controls', category: 'A.5 Organizational' },
  { clause: 'A.5.1', title: 'Policies for information security', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Мэдээллийн аюулгүй байдлын бодлогуудыг баталж, түгээж, тогтмол хянадаг эсэх?' },
  { clause: 'A.5.2', title: 'Information security roles and responsibilities', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Мэдээллийн аюулгүй байдлын үүрэг, хариуцлагыг тодорхойлж хуваарилсан эсэх?' },
  { clause: 'A.5.3', title: 'Segregation of duties', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Зөрчилдөж болзошгүй үүргүүдийг тусгаарласан эсэх?' },
  { clause: 'A.5.4', title: 'Management responsibilities', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Удирдлага ажилтнуудаас бодлого, журам мөрдөхийг шаарддаг эсэх?' },
  { clause: 'A.5.5', title: 'Contact with authorities', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Холбогдох эрх бүхий байгууллагуудтай харилцах журамтай эсэх?' },
  { clause: 'A.5.6', title: 'Contact with special interest groups', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Мэргэжлийн бүлэг, форумуудтай холбоо тогтоосон эсэх?' },
  { clause: 'A.5.7', title: 'Threat intelligence', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Аюул заналын мэдээллийг цуглуулж дүн шинжилгээ хийдэг эсэх?' },
  { clause: 'A.5.8', title: 'Information security in project management', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Төслийн удирдлагад мэдээллийн аюулгүй байдлыг тусгадаг эсэх?' },
  { clause: 'A.5.9', title: 'Inventory of information and other associated assets', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Мэдээлэл болон холбогдох хөрөнгийн бүртгэлийг хөтөлдөг эсэх?' },
  { clause: 'A.5.10', title: 'Acceptable use of information and other associated assets', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Хөрөнгийг зөвшөөрөгдсөн байдлаар ашиглах журамтай эсэх?' },
  { clause: 'A.5.11', title: 'Return of assets', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Ажлаас гарах үед хөрөнгийг буцаан авдаг эсэх?' },
  { clause: 'A.5.12', title: 'Classification of information', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Мэдээллийг ангилах схемтэй эсэх?' },
  { clause: 'A.5.13', title: 'Labelling of information', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Мэдээллийг ангиллын дагуу тэмдэглэдэг эсэх?' },
  { clause: 'A.5.14', title: 'Information transfer', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Мэдээлэл дамжуулах дүрэм, журам, гэрээтэй эсэх?' },
  { clause: 'A.5.15', title: 'Access control', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Хандалтын хяналтын бодлого тодорхойлж хэрэгжүүлсэн эсэх?' },
  { clause: 'A.5.16', title: 'Identity management', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Хэрэглэгчийн нэр (identity)-ийн бүх амьдралын мөчлөгийг удирддаг эсэх?' },
  { clause: 'A.5.17', title: 'Authentication information', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Нэвтрэлт баталгаажуулах мэдээллийг (нууц үг г.м.) хамгаалдаг эсэх?' },
  { clause: 'A.5.18', title: 'Access rights', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Хандалтын эрхийг олгож, хянаж, цуцалдаг эсэх?' },
  { clause: 'A.5.19', title: 'Information security in supplier relationships', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Нийлүүлэгчтэй холбоотой эрсдэлийг удирддаг эсэх?' },
  { clause: 'A.5.20', title: 'Addressing information security within supplier agreements', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Нийлүүлэгчийн гэрээнд аюулгүй байдлын шаардлага тусгасан эсэх?' },
  { clause: 'A.5.21', title: 'Managing information security in the ICT supply chain', category: 'A.5 Organizational', parentClause: 'A.5', question: 'ИКТ нийлүүлэлтийн сүлжээний эрсдэлийг удирддаг эсэх?' },
  { clause: 'A.5.22', title: 'Monitoring, review and change management of supplier services', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Нийлүүлэгчийн үйлчилгээг хянаж, өөрчлөлтийг удирддаг эсэх?' },
  { clause: 'A.5.23', title: 'Information security for use of cloud services', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Үүлэн үйлчилгээний аюулгүй байдлын шаардлагыг тодорхойлсон эсэх?' },
  { clause: 'A.5.24', title: 'Information security incident management planning and preparation', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Ослын удирдлагын төлөвлөлт, бэлтгэлтэй эсэх?' },
  { clause: 'A.5.25', title: 'Assessment and decision on information security events', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Аюулгүй байдлын үйл явдлыг үнэлж шийдвэр гаргадаг эсэх?' },
  { clause: 'A.5.26', title: 'Response to information security incidents', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Ослыг тодорхойлсон журмын дагуу шийдвэрлэдэг эсэх?' },
  { clause: 'A.5.27', title: 'Learning from information security incidents', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Гарсан ослоос сургамж авч хяналтаа сайжруулдаг эсэх?' },
  { clause: 'A.5.28', title: 'Collection of evidence', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Нотлох баримт цуглуулах, хадгалах журамтай эсэх?' },
  { clause: 'A.5.29', title: 'Information security during disruption', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Тасалдлын үед аюулгүй байдлыг хадгалах төлөвлөгөөтэй эсэх?' },
  { clause: 'A.5.30', title: 'ICT readiness for business continuity', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Бизнесийн тасралтгүй байдалд ИКТ-ийн бэлэн байдлыг хангасан эсэх?' },
  { clause: 'A.5.31', title: 'Legal, statutory, regulatory and contractual requirements', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Хууль, эрх зүй, гэрээний шаардлагыг тодорхойлж мөрддөг эсэх?' },
  { clause: 'A.5.32', title: 'Intellectual property rights', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Оюуны өмчийн эрхийг хамгаалах журамтай эсэх?' },
  { clause: 'A.5.33', title: 'Protection of records', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Бүртгэлийг алдагдал, гажуудлаас хамгаалдаг эсэх?' },
  { clause: 'A.5.34', title: 'Privacy and protection of PII', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Хувийн мэдээлэл (PII)-ийг хамгаалах шаардлагыг мөрддөг эсэх?' },
  { clause: 'A.5.35', title: 'Independent review of information security', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Мэдээллийн аюулгүй байдлыг хараат бусаар хянадаг эсэх?' },
  { clause: 'A.5.36', title: 'Compliance with policies, rules and standards for information security', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Бодлого, дүрэм, стандарт мөрдөлтийг тогтмол шалгадаг эсэх?' },
  { clause: 'A.5.37', title: 'Documented operating procedures', category: 'A.5 Organizational', parentClause: 'A.5', question: 'Үйл ажиллагааны журмыг баримтжуулж нийтэлсэн эсэх?' },

  // ===========================================================================
  // ANNEX A — A.6 PEOPLE CONTROLS (8)
  // ===========================================================================
  { clause: 'A.6', title: 'People controls', category: 'A.6 People' },
  { clause: 'A.6.1', title: 'Screening', category: 'A.6 People', parentClause: 'A.6', question: 'Ажилд авахдаа нэр дэвшигчдийг шалгадаг эсэх?' },
  { clause: 'A.6.2', title: 'Terms and conditions of employment', category: 'A.6 People', parentClause: 'A.6', question: 'Хөдөлмөрийн гэрээнд аюулгүй байдлын үүрэг тусгасан эсэх?' },
  { clause: 'A.6.3', title: 'Information security awareness, education and training', category: 'A.6 People', parentClause: 'A.6', question: 'Ажилтнуудад сургалт, мэдлэг олгох хөтөлбөртэй эсэх?' },
  { clause: 'A.6.4', title: 'Disciplinary process', category: 'A.6 People', parentClause: 'A.6', question: 'Зөрчил гаргасан тохиолдолд сахилгын журам мөрддөг эсэх?' },
  { clause: 'A.6.5', title: 'Responsibilities after termination or change of employment', category: 'A.6 People', parentClause: 'A.6', question: 'Ажлаас гарсан/шилжсэний дараах үүргийг тодорхойлсон эсэх?' },
  { clause: 'A.6.6', title: 'Confidentiality or non-disclosure agreements', category: 'A.6 People', parentClause: 'A.6', question: 'Нууцлалын гэрээ (NDA) байгуулдаг эсэх?' },
  { clause: 'A.6.7', title: 'Remote working', category: 'A.6 People', parentClause: 'A.6', question: 'Зайнаас ажиллах аюулгүй байдлын арга хэмжээтэй эсэх?' },
  { clause: 'A.6.8', title: 'Information security event reporting', category: 'A.6 People', parentClause: 'A.6', question: 'Ажилтнууд аюулгүй байдлын үйл явдлыг мэдээлэх сувагтай эсэх?' },

  // ===========================================================================
  // ANNEX A — A.7 PHYSICAL CONTROLS (14)
  // ===========================================================================
  { clause: 'A.7', title: 'Physical controls', category: 'A.7 Physical' },
  { clause: 'A.7.1', title: 'Physical security perimeters', category: 'A.7 Physical', parentClause: 'A.7', question: 'Физик аюулгүй байдлын хүрээг тодорхойлж хамгаалсан эсэх?' },
  { clause: 'A.7.2', title: 'Physical entry', category: 'A.7 Physical', parentClause: 'A.7', question: 'Хамгаалалттай бүсэд нэвтрэх хяналттай эсэх?' },
  { clause: 'A.7.3', title: 'Securing offices, rooms and facilities', category: 'A.7 Physical', parentClause: 'A.7', question: 'Ажлын байр, өрөө, байгууламжийг хамгаалсан эсэх?' },
  { clause: 'A.7.4', title: 'Physical security monitoring', category: 'A.7 Physical', parentClause: 'A.7', question: 'Физик орчныг тогтмол хянадаг (CCTV г.м.) эсэх?' },
  { clause: 'A.7.5', title: 'Protecting against physical and environmental threats', category: 'A.7 Physical', parentClause: 'A.7', question: 'Физик болон байгаль орчны аюулаас хамгаалдаг эсэх?' },
  { clause: 'A.7.6', title: 'Working in secure areas', category: 'A.7 Physical', parentClause: 'A.7', question: 'Хамгаалалттай бүсэд ажиллах журамтай эсэх?' },
  { clause: 'A.7.7', title: 'Clear desk and clear screen', category: 'A.7 Physical', parentClause: 'A.7', question: 'Цэвэр ширээ, цэвэр дэлгэцийн бодлого мөрддөг эсэх?' },
  { clause: 'A.7.8', title: 'Equipment siting and protection', category: 'A.7 Physical', parentClause: 'A.7', question: 'Тоног төхөөрөмжийг зөв байршуулж хамгаалсан эсэх?' },
  { clause: 'A.7.9', title: 'Security of assets off-premises', category: 'A.7 Physical', parentClause: 'A.7', question: 'Байгууллагаас гадуурх хөрөнгийг хамгаалдаг эсэх?' },
  { clause: 'A.7.10', title: 'Storage media', category: 'A.7 Physical', parentClause: 'A.7', question: 'Хадгалах төхөөрөмжийг (USB, диск г.м.) удирддаг эсэх?' },
  { clause: 'A.7.11', title: 'Supporting utilities', category: 'A.7 Physical', parentClause: 'A.7', question: 'Туслах хангамжийн (цахилгаан, хөргөлт) тасралтыг хамгаалсан эсэх?' },
  { clause: 'A.7.12', title: 'Cabling security', category: 'A.7 Physical', parentClause: 'A.7', question: 'Кабель шугам сүлжээг хамгаалсан эсэх?' },
  { clause: 'A.7.13', title: 'Equipment maintenance', category: 'A.7 Physical', parentClause: 'A.7', question: 'Тоног төхөөрөмжийг зохих ёсоор засвар үйлчилгээ хийдэг эсэх?' },
  { clause: 'A.7.14', title: 'Secure disposal or re-use of equipment', category: 'A.7 Physical', parentClause: 'A.7', question: 'Тоног төхөөрөмжийг устгах/дахин ашиглахдаа аюулгүй болгодог эсэх?' },

  // ===========================================================================
  // ANNEX A — A.8 TECHNOLOGICAL CONTROLS (34)
  // ===========================================================================
  { clause: 'A.8', title: 'Technological controls', category: 'A.8 Technological' },
  { clause: 'A.8.1', title: 'User endpoint devices', category: 'A.8 Technological', parentClause: 'A.8', question: 'Эцсийн төхөөрөмжүүдийг (laptop, утас) хамгаалдаг эсэх?' },
  { clause: 'A.8.2', title: 'Privileged access rights', category: 'A.8 Technological', parentClause: 'A.8', question: 'Давуу эрхтэй хандалтыг хязгаарлаж хянадаг эсэх?' },
  { clause: 'A.8.3', title: 'Information access restriction', category: 'A.8 Technological', parentClause: 'A.8', question: 'Мэдээлэлд хандах эрхийг хязгаарласан эсэх?' },
  { clause: 'A.8.4', title: 'Access to source code', category: 'A.8 Technological', parentClause: 'A.8', question: 'Эх кодад хандах эрхийг хязгаарласан эсэх?' },
  { clause: 'A.8.5', title: 'Secure authentication', category: 'A.8 Technological', parentClause: 'A.8', question: 'Найдвартай нэвтрэлт (MFA г.м.) хэрэгжүүлсэн эсэх?' },
  { clause: 'A.8.6', title: 'Capacity management', category: 'A.8 Technological', parentClause: 'A.8', question: 'Нөөц хүчин чадлыг хянаж төлөвлөдөг эсэх?' },
  { clause: 'A.8.7', title: 'Protection against malware', category: 'A.8 Technological', parentClause: 'A.8', question: 'Хортой программаас хамгаалах арга хэмжээтэй эсэх?' },
  { clause: 'A.8.8', title: 'Management of technical vulnerabilities', category: 'A.8 Technological', parentClause: 'A.8', question: 'Техникийн эмзэг байдлыг илрүүлж засдаг эсэх?' },
  { clause: 'A.8.9', title: 'Configuration management', category: 'A.8 Technological', parentClause: 'A.8', question: 'Тохиргооны удирдлагыг (baseline) хэрэгжүүлсэн эсэх?' },
  { clause: 'A.8.10', title: 'Information deletion', category: 'A.8 Technological', parentClause: 'A.8', question: 'Шаардлагагүй мэдээллийг найдвартай устгадаг эсэх?' },
  { clause: 'A.8.11', title: 'Data masking', category: 'A.8 Technological', parentClause: 'A.8', question: 'Эмзэг өгөгдлийг далдлах (masking) арга хэрэглэдэг эсэх?' },
  { clause: 'A.8.12', title: 'Data leakage prevention', category: 'A.8 Technological', parentClause: 'A.8', question: 'Өгөгдөл алдагдлаас сэргийлэх (DLP) арга хэмжээтэй эсэх?' },
  { clause: 'A.8.13', title: 'Information backup', category: 'A.8 Technological', parentClause: 'A.8', question: 'Нөөц хувилбар (backup)-ыг тогтмол хийж шалгадаг эсэх?' },
  { clause: 'A.8.14', title: 'Redundancy of information processing facilities', category: 'A.8 Technological', parentClause: 'A.8', question: 'Боловсруулах байгууламжийн нөөцлөлт (redundancy)-тэй эсэх?' },
  { clause: 'A.8.15', title: 'Logging', category: 'A.8 Technological', parentClause: 'A.8', question: 'Үйл явдлын лог бичиж хадгалдаг эсэх?' },
  { clause: 'A.8.16', title: 'Monitoring activities', category: 'A.8 Technological', parentClause: 'A.8', question: 'Сүлжээ, системийн үйл ажиллагааг хянадаг эсэх?' },
  { clause: 'A.8.17', title: 'Clock synchronization', category: 'A.8 Technological', parentClause: 'A.8', question: 'Системийн цагийг нэгдсэн эх үүсвэрт синк хийдэг эсэх?' },
  { clause: 'A.8.18', title: 'Use of privileged utility programs', category: 'A.8 Technological', parentClause: 'A.8', question: 'Давуу эрхтэй хэрэгслүүдийн ашиглалтыг хязгаарласан эсэх?' },
  { clause: 'A.8.19', title: 'Installation of software on operational systems', category: 'A.8 Technological', parentClause: 'A.8', question: 'Үйлдвэрлэлийн системд програм суулгахыг хянадаг эсэх?' },
  { clause: 'A.8.20', title: 'Networks security', category: 'A.8 Technological', parentClause: 'A.8', question: 'Сүлжээг хамгаалж удирддаг эсэх?' },
  { clause: 'A.8.21', title: 'Security of network services', category: 'A.8 Technological', parentClause: 'A.8', question: 'Сүлжээний үйлчилгээний аюулгүй байдлыг тодорхойлсон эсэх?' },
  { clause: 'A.8.22', title: 'Segregation of networks', category: 'A.8 Technological', parentClause: 'A.8', question: 'Сүлжээг бүсчилж тусгаарласан эсэх?' },
  { clause: 'A.8.23', title: 'Web filtering', category: 'A.8 Technological', parentClause: 'A.8', question: 'Вэб хандалтыг шүүж хянадаг эсэх?' },
  { clause: 'A.8.24', title: 'Use of cryptography', category: 'A.8 Technological', parentClause: 'A.8', question: 'Криптографийн ашиглалтын бодлоготой эсэх?' },
  { clause: 'A.8.25', title: 'Secure development life cycle', category: 'A.8 Technological', parentClause: 'A.8', question: 'Аюулгүй хөгжүүлэлтийн амьдралын мөчлөгийг мөрддөг эсэх?' },
  { clause: 'A.8.26', title: 'Application security requirements', category: 'A.8 Technological', parentClause: 'A.8', question: 'Аппликейшний аюулгүй байдлын шаардлагыг тодорхойлсон эсэх?' },
  { clause: 'A.8.27', title: 'Secure system architecture and engineering principles', category: 'A.8 Technological', parentClause: 'A.8', question: 'Аюулгүй архитектур, инженерчлэлийн зарчмыг мөрддөг эсэх?' },
  { clause: 'A.8.28', title: 'Secure coding', category: 'A.8 Technological', parentClause: 'A.8', question: 'Аюулгүй кодчиллын зарчмыг хэрэгжүүлсэн эсэх?' },
  { clause: 'A.8.29', title: 'Security testing in development and acceptance', category: 'A.8 Technological', parentClause: 'A.8', question: 'Хөгжүүлэлт, хүлээн авалтын үед аюулгүй байдлын тест хийдэг эсэх?' },
  { clause: 'A.8.30', title: 'Outsourced development', category: 'A.8 Technological', parentClause: 'A.8', question: 'Гадны хөгжүүлэлтийг хянаж, шаардлага тавьдаг эсэх?' },
  { clause: 'A.8.31', title: 'Separation of development, test and production environments', category: 'A.8 Technological', parentClause: 'A.8', question: 'Хөгжүүлэлт, тест, үйлдвэрлэлийн орчныг тусгаарласан эсэх?' },
  { clause: 'A.8.32', title: 'Change management', category: 'A.8 Technological', parentClause: 'A.8', question: 'Өөрчлөлтийн удирдлагын журам мөрддөг эсэх?' },
  { clause: 'A.8.33', title: 'Test information', category: 'A.8 Technological', parentClause: 'A.8', question: 'Тестийн өгөгдлийг хамгаалж сонгож ашигладаг эсэх?' },
  { clause: 'A.8.34', title: 'Protection of information systems during audit testing', category: 'A.8 Technological', parentClause: 'A.8', question: 'Аудитын тестийн үед системийг хамгаалдаг эсэх?' },
];
