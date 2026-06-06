import { EmptyState } from "@/components/EmptyState";
import { QAItem } from "@/components/QAItem";
import { qaQuestions } from "@/lib/data";
import { MessageCircleQuestion } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl text-cream">Community Q&A</h1>
      <p className="mt-2 text-cream/60">
        Ask brewers across India. Upvote, accept answers, and tag by method.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Espresso", "V60", "Aeropress", "Grind", "Natural", "Honey"].map((tag) => (
          <span key={tag} className="rounded-full border border-cream/15 px-3 py-1 text-xs text-cream/70">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        {qaQuestions.map((q) => (
          <QAItem key={q.id} question={q} />
        ))}
      </div>
      {qaQuestions.length === 0 && (
        <EmptyState
          className="mt-8"
          icon={<MessageCircleQuestion className="h-5 w-5" />}
          title="No questions yet"
          description="Community questions will appear here once brewers and café regulars start asking for help."
          actionHref="/signup"
          actionLabel="Join BrewCircle"
        />
      )}
    </div>
  );
}
