import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/axios";

type AnswerCount = { answer: string; count: number };
type CommunitySummary = {
  total: number;
  memory: AnswerCount[];
  recipe: AnswerCount[];
  vote: AnswerCount[];
  pattern: AnswerCount[];
};

const labels: Record<string, Record<string, string>> = {
  memory: {
    qabili: "Qabili palaw",
    rice: "Another pilaf",
    other: "Another food",
    skip: "Prefer to skip",
    safe: "Selected the safe option",
  },
  recipe: {
    qabili: "Qabili palaw",
    rice: "Another rice dish",
    suggestion: "Own suggestion",
  },
  vote: {
    yes: "Interested",
    no: "Not interested",
    unsure: "Not sure yet",
  },
  pattern: {
    simple: "Simple",
    carpet: "Carpet-inspired",
    none: "No preference",
  },
};

function BreakdownCard({
  title,
  description,
  answers,
  total,
  category,
}: {
  title: string;
  description: string;
  answers: AnswerCount[];
  total: number;
  category: keyof typeof labels;
}) {
  const ordered = [...answers].sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ordered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No answers yet.</p>
        ) : (
          ordered.map(item => {
            const percent = total ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.answer} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span>{labels[category][item.answer] ?? item.answer}</span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {item.count} <span className="text-muted-foreground">· {percent}%</span>
                  </span>
                </div>
                <Progress value={percent} className="h-2" />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardCommunityResponses() {
  const query = useQuery({
    queryKey: ["dashboard", "anonymous-community-responses"],
    queryFn: async () =>
      (await api.get<CommunitySummary>("/community/admin/responses")).data,
  });
  const summary = query.data;
  const safetyCount = summary?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Anonymous responses
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Rayhana Table survey</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Completed answer choices collected to inform future work.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
        >
          {query.isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/[0.035]">
        <CardContent className="flex items-start gap-3 py-5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm leading-6 text-muted-foreground">
            Only completed answer choices are shown here. Survey records contain no names,
            email addresses, locations, IP addresses, or optional written notes.
          </p>
        </CardContent>
      </Card>

      {query.isLoading ? (
        <div className="flex min-h-48 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading survey results…
        </div>
      ) : query.isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Survey results could not be loaded.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check your admin access and try again.
              </p>
            </div>
            <Button variant="outline" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : summary ? (
        <>
          <Card>
            <CardContent className="flex items-center justify-between gap-4 py-5">
              <div>
                <p className="text-sm text-muted-foreground">Completed surveys</p>
                <p className="mt-1 text-4xl font-semibold tabular-nums">
                  {summary.total.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ClipboardList className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {summary.total === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="font-medium">No completed responses yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Results will appear here after someone completes all four survey steps.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              <BreakdownCard
                title="Food that brings people together"
                description="First survey question"
                category="memory"
                answers={summary.memory}
                total={summary.total}
              />
              <BreakdownCard
                title="Kitchen safety choice"
                description="Responses that selected the safe option"
                category="memory"
                answers={[{ answer: "safe", count: safetyCount }]}
                total={summary.total}
              />
              <BreakdownCard
                title="Next shared meal"
                description="Recipe choice"
                category="recipe"
                answers={summary.recipe}
                total={summary.total}
              />
              <BreakdownCard
                title="Concept interest"
                description="Response to the product concept"
                category="vote"
                answers={summary.vote}
                total={summary.total}
              />
              <BreakdownCard
                title="Pattern preference"
                description="Optional design preference"
                category="pattern"
                answers={summary.pattern}
                total={summary.total}
              />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
