import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient();

type Row = {
  number?: string;
  type: "MCQ" | "SHORT" | "ESSAY" | "DATA";
  topic: string;
  specPoint?: string;
  questionText: string;
  options?: string;
  correctAnswer?: string;
  marks?: number | string;
  markScheme?: string;
  imageUrl?: string;
  dataExtract?: string;
};

async function main() {
  const filePath = path.join(__dirname, "recon_questions_complete.xlsx");
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: "" });

  console.log(`📘 Importing ${rows.length} questions from Excel...`);

  for (const r of rows) {
    await prisma.question.create({
      data: {
        number: r.number?.toString().trim() || null,
        type: r.type,
        topic: r.topic.trim(),
        specPoint: r.specPoint?.trim() || null,
        questionText: r.questionText.trim(),
        options: r.options ? JSON.parse(r.options) : null,
        correctAnswer: r.correctAnswer?.toString().trim() || null,
        marks: r.marks !== undefined && r.marks !== "" ? Number(r.marks) : null,
        markScheme: r.markScheme?.trim() || null,
        imageUrl: r.imageUrl?.trim() || null,
        dataExtract: r.dataExtract?.trim() || null,
      },
    });
  }

  console.log("✅ Finished seeding questions from Excel!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("❌ Error seeding:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
