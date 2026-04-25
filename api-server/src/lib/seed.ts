import { sql } from "drizzle-orm";
import { db, categoriesTable, questionsTable, productsTable } from "@workspace/db";
import { logger } from "./logger";

const PRODUCTS_SEED = [
  { name: "باقة المبتدئ", description: "5 جولات للعبة سين جيم", rounds: 5, priceCents: 499, discountPercent: 0, badge: null, sortOrder: 1 },
  { name: "الباقة الشائعة", description: "15 جولة + جولة هدية", rounds: 16, priceCents: 1299, discountPercent: 15, badge: "الأكثر مبيعاً", sortOrder: 2 },
  { name: "باقة المحترف", description: "40 جولة لتجربة بلا حدود", rounds: 40, priceCents: 2999, discountPercent: 25, badge: "أفضل قيمة", sortOrder: 3 },
];

const SEED: { name: string; questions: { points: number; text: string; answer: string }[] }[] = [
  {
    name: "تاريخ",
    questions: [
      { points: 100, text: "من هو مؤسس الدولة الأموية؟", answer: "معاوية بن أبي سفيان" },
      { points: 200, text: "في أي عام هجري وقعت غزوة بدر؟", answer: "العام الثاني للهجرة" },
      { points: 300, text: "ما هي أول عاصمة للخلافة العباسية؟", answer: "الكوفة ثم بغداد" },
      { points: 400, text: "من القائد المسلم الذي فتح الأندلس؟", answer: "طارق بن زياد" },
      { points: 500, text: "ما هو الاسم الحقيقي لصلاح الدين الأيوبي؟", answer: "يوسف بن أيوب" },
      { points: 600, text: "متى سقطت غرناطة؟", answer: "1492 م" },
    ],
  },
  {
    name: "جغرافيا",
    questions: [
      { points: 100, text: "ما هي عاصمة المملكة العربية السعودية؟", answer: "الرياض" },
      { points: 200, text: "أين يقع جبل إيفرست؟", answer: "بين نيبال والصين" },
      { points: 300, text: "ما هو أطول نهر في العالم؟", answer: "نهر النيل" },
      { points: 400, text: "ما هي أكبر قارة في العالم من حيث المساحة؟", answer: "آسيا" },
      { points: 500, text: "ما هو المحيط الذي يقع بين أمريكا وأوروبا؟", answer: "المحيط الأطلسي" },
      { points: 600, text: "ما هي الدولة التي تتكون من أكثر من 17 ألف جزيرة؟", answer: "إندونيسيا" },
    ],
  },
  {
    name: "علوم",
    questions: [
      { points: 100, text: "ما هو الغاز الذي يتنفسه الإنسان؟", answer: "الأكسجين" },
      { points: 200, text: "ما هي سرعة الضوء تقريباً؟", answer: "300,000 كم/ثانية" },
      { points: 300, text: "من هو مخترع المصباح الكهربائي؟", answer: "توماس إديسون" },
      { points: 400, text: "ما هو العضو الذي يضخ الدم في جسم الإنسان؟", answer: "القلب" },
      { points: 500, text: "ما هو أقرب كوكب للشمس؟", answer: "عطارد" },
      { points: 600, text: "ما هو الرمز الكيميائي للذهب؟", answer: "Au" },
    ],
  },
  {
    name: "رياضة",
    questions: [
      { points: 100, text: "كم عدد لاعبي فريق كرة القدم؟", answer: "11 لاعب" },
      { points: 200, text: "في أي دولة أقيمت أول بطولة لكأس العالم؟", answer: "أوروغواي" },
      { points: 300, text: "من هو اللاعب الملقب بالجوهرة السوداء؟", answer: "بيليه" },
      { points: 400, text: "ما هي الرياضة التي تستخدم فيها كرة بيضاوية؟", answer: "كرة القدم الأمريكية" },
      { points: 500, text: "كم تستمر مباراة كرة السلة الرسمية؟", answer: "40 دقيقة" },
      { points: 600, text: "ما هو طول سباق الماراثون؟", answer: "42.195 كيلومتر" },
    ],
  },
  {
    name: "ثقافة عامة",
    questions: [
      { points: 100, text: "ما هي لغة القرآن الكريم؟", answer: "اللغة العربية" },
      { points: 200, text: "من هو مؤلف كتاب البخلاء؟", answer: "الجاحظ" },
      { points: 300, text: "ما هو الطائر الذي لا يطير؟", answer: "النعامة" },
      { points: 400, text: "ما هو الحيوان الذي يُسمى بسفينة الصحراء؟", answer: "الجمل" },
      { points: 500, text: "ما هو اللون الذي يرمز للسلام؟", answer: "الأبيض" },
      { points: 600, text: "من هو أول من صعد إلى الفضاء؟", answer: "يوري غاغارين" },
    ],
  },
  {
    name: "أدب وشعر",
    questions: [
      { points: 100, text: "من هو شاعر العرب الأكبر في العصر الجاهلي؟", answer: "امرؤ القيس" },
      { points: 200, text: "من قال «الناس للناس من بدوٍ ومن حضرٍ»؟", answer: "أبو العلاء المعري" },
      { points: 300, text: "من هو أمير الشعراء؟", answer: "أحمد شوقي" },
      { points: 400, text: "من مؤلف رواية موسم الهجرة إلى الشمال؟", answer: "الطيب صالح" },
      { points: 500, text: "ما اسم الديوان الذي ضم قصائد المتنبي الأخيرة؟", answer: "ديوان المتنبي" },
      { points: 600, text: "من أصدر مجلة الرسالة في مصر؟", answer: "أحمد حسن الزيات" },
    ],
  },
];

export async function seedIfEmpty(): Promise<void> {
  const [{ value }] = await db.select({ value: sql<number>`count(*)::int` }).from(categoriesTable);
  if (Number(value) === 0) {
    logger.info("Seeding initial categories and questions");
    for (const cat of SEED) {
      const [c] = await db.insert(categoriesTable).values({ name: cat.name }).returning();
      await db.insert(questionsTable).values(
        cat.questions.map((q) => ({
          categoryId: c.id,
          text: q.text,
          answer: q.answer,
          points: q.points,
        })),
      );
    }
    logger.info({ count: SEED.length }, "Seeding complete");
  }

  const [{ value: pCount }] = await db.select({ value: sql<number>`count(*)::int` }).from(productsTable);
  if (Number(pCount) === 0) {
    logger.info("Seeding initial products");
    await db.insert(productsTable).values(PRODUCTS_SEED.map((p) => ({ ...p, payhipUrl: "", currency: "USD", active: true })));
  }
}
