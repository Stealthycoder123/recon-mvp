import { prisma } from "@/lib/prisma";
import { QuestionResponse } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = await prisma.question.count();
    
    if (count === 0) {
      return NextResponse.json(
        { error: "No questions available" },
        { status: 404 }
      );
    }

    const skip = Math.floor(Math.random() * count);
    const question = await prisma.question.findFirst({ skip });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Transform options from Json to string array if present
    const response: QuestionResponse = {
      ...question,
      options: question.options ? (question.options as string[]) : null,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
