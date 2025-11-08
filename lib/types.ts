import { QuestionType } from "@prisma/client";

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  topic: string;
  specPoint: string | null;
  options: string[] | null;
  correctAnswer: string | null;
  markScheme: string | null;
  marks: number | null;
  imageUrl: string | null;
  dataExtract: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attempt {
  id: string;
  userId: string;
  questionId: string;
  selected: string | null;
  isCorrect: boolean | null;
  score: number | null;
  createdAt: Date;
}

export interface AttemptResponse {
  success: boolean;
  isCorrect: boolean | null;
  correctAnswer: string | null;
  attempt: Attempt;
}

export type QuestionResponse = Question;
