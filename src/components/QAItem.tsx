import type { QAQuestion } from "@/lib/types";
import { CheckCircle2, ChevronUp, MessageCircle } from "lucide-react";

export function QAItem({ question }: { question: QAQuestion }) {
  const accepted = question.answers.find((a) => a.id === question.acceptedAnswerId);

  return (
    <article className="rounded-2xl border border-cream/10 bg-roast p-4">
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1 text-cream/50">
          <ChevronUp className="h-4 w-4" />
          <span className="text-sm font-medium text-cream">{question.upvotes}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-cream">{question.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-cream/60">{question.body}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {question.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-amber/10 px-2 py-0.5 text-xs text-amber">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-cream/50">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream/10 text-[10px] font-bold">
              {question.avatar}
            </span>
            @{question.author}
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {question.answers.length} answers
            </span>
          </div>
          {accepted && (
            <div className="mt-3 rounded-xl border border-green-500/20 bg-green-500/5 p-3">
              <div className="flex items-center gap-1 text-xs font-medium text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Accepted answer · @{accepted.author}
              </div>
              <p className="mt-1 text-sm text-cream/80">{accepted.body}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
