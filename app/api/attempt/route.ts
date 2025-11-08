import { getUser } from "@/auth/server";
import { prisma } from "@/lib/prisma";
import { AttemptResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { questionId, selected } = body;

    if (!questionId || !selected) {
      return NextResponse.json(
        { success: false, error: "Missing questionId or selected answer" },
        { status: 400 }
      );
    }

    // Fetch the question to check correctness
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    // Determine correctness
    let isCorrect: boolean | null = null;
    if (question.type === "MCQ" && question.correctAnswer) {
      isCorrect = selected.trim() === question.correctAnswer.trim();
    }
    // For SHORT, ESSAY, DATA types, isCorrect remains null (manual grading)

    // Create attempt record with the authenticated user's ID
    const attempt = await prisma.attempt.create({
      data: {
        userId: user.id,
        questionId,
        selected,
        isCorrect,
      },
    });

    const response: AttemptResponse = {
      success: true,
      isCorrect,
      correctAnswer: question.correctAnswer,
      attempt,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
