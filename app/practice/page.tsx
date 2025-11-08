"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/auth/client";
import { Question, AttemptResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PracticePage() {
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  async function loadQuestion() {
    try {
      setLoading(true);
      setHasSubmitted(false);
      
      const res = await fetch("/api/questions");
      
      if (!res.ok) {
        throw new Error("Failed to fetch question");
      }
      
      const data = await res.json();
      setQuestion(data);
      setSelected("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load question";
      toast.error("Error", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!question || !selected.trim()) return;

    try {
      setSubmitting(true);

      const res = await fetch("/api/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          selected: selected.trim(),
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Authentication Required", {
            description: "Please log in to submit answers",
          });
          router.push("/login");
          return;
        }
        throw new Error("Failed to submit answer");
      }

      const result: AttemptResponse = await res.json();
      setHasSubmitted(true);
      
      if (result.isCorrect === null) {
        toast.info("Answer Submitted", {
          description: "Your answer has been recorded for review.",
        });
      } else if (result.isCorrect) {
        toast.success("Correct!", {
          description: "Well done! You got it right.",
        });
      } else {
        toast.error("Incorrect", {
          description: `The correct answer is: ${result.correctAnswer || "N/A"}`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit answer";
      toast.error("Submission Failed", {
        description: message,
      });
      setHasSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    async function initAuth() {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push("/login");
          return;
        }
        
        setAuthChecked(true);
        loadQuestion();
      } catch {
        router.push("/login");
      }
    }
    
    initAuth();
  }, [router]);

  if (!authChecked || (loading && !question)) {
    return (
      <div className="min-h-screen p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Card className="p-6 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
            <Skeleton className="h-48 w-full" />
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-muted-foreground">No questions available</p>
        <Button onClick={loadQuestion} variant="outline">Reload</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Practice</h1>
          <div className="text-right">
            <p className="text-sm font-medium">{question.topic}</p>
            {question.specPoint && (
              <p className="text-xs text-muted-foreground">{question.specPoint}</p>
            )}
          </div>
        </div>

        <Card className="p-6 space-y-6 transition-opacity" style={{ opacity: loading ? 0.6 : 1 }}>
          {/* Question Text */}
          <div>
            <p className="text-lg leading-relaxed">{question.questionText}</p>
            {question.marks && (
              <p className="text-sm text-muted-foreground mt-2">
                [{question.marks} mark{question.marks > 1 ? "s" : ""}]
              </p>
            )}
          </div>

          {/* Data Extract */}
          {question.dataExtract && (
            <div className="border-l-4 border-primary/50 pl-4 py-2 bg-muted/30 rounded">
              <p className="text-sm whitespace-pre-wrap">
                {question.dataExtract}
              </p>
            </div>
          )}

          {/* Image */}
          {question.imageUrl && (
            <div className="flex justify-center">
              <img
                src={question.imageUrl}
                alt="Question diagram"
                className="max-w-full h-auto rounded-lg border shadow-sm"
              />
            </div>
          )}

          {/* MCQ Options */}
          {question.type === "MCQ" && question.options && (
            <div className="space-y-3">
              {question.options.map((opt: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelected(opt)}
                  disabled={hasSubmitted || submitting}
                  className={`w-full text-left border-2 rounded-lg p-4 transition-all ${
                    selected === opt
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="font-semibold text-muted-foreground">
                    {String.fromCharCode(65 + i)}.
                  </span>{" "}
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Short Answer */}
          {question.type === "SHORT" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Your Answer:
              </label>
              <textarea
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                placeholder="Type your answer here..."
                disabled={hasSubmitted || submitting}
                rows={6}
                className="w-full border-2 rounded-lg p-4 bg-background resize-none focus:border-primary focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}


          {/* Actions */}
          <div className="flex gap-3">
            {!hasSubmitted ? (
              <Button
                onClick={submitAnswer}
                disabled={!selected.trim() || submitting || loading}
                className="flex-1"
                size="lg"
              >
                {submitting ? "Submitting..." : "Submit Answer"}
              </Button>
            ) : (
              <Button
                onClick={loadQuestion}
                disabled={loading}
                className="flex-1"
                size="lg"
                variant="default"
              >
                {loading ? "Loading..." : "Next Question →"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
