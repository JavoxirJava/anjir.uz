import { getCurrentUser } from "@/lib/api/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { getGamesByTeacher } from "@/lib/db/games";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GameDeleteButton } from "./GameDeleteButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.teacher.myGames} — I-Imkon.uz`,
};

const TYPE_LABELS: Record<string, string> = {
  word_match: uz.games.wordMatch,
  ordering: uz.games.ordering,
  memory: uz.games.memory,
};

const TYPE_EMOJI: Record<string, string> = {
  word_match: "🔤",
  ordering: "📋",
  memory: "🧠",
};

export default async function TeacherGamesPage() {
  const user = await getCurrentUser();
  const games = await getGamesByTeacher(user!.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">{uz.teacher.myGames}</h1>
        <Link
          href="/teacher/games/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          + {uz.teacher.addGame}
        </Link>
      </div>

      {games.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
          <Link href="/teacher/games/new" className="mt-4 inline-block text-sm text-primary underline">
            {uz.teacher.addGame}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3" role="list" aria-label={uz.teacher.myGames}>
          {games.map((game) => (
            <li key={game.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 pt-4 pb-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">
                        {TYPE_EMOJI[game.template_type]} {TYPE_LABELS[game.template_type]}
                      </Badge>
                      {game.subjects && (
                        <span className="text-xs text-muted-foreground">
                          {Array.isArray(game.subjects)
                            ? (game.subjects[0] as { name: string })?.name
                            : (game.subjects as { name: string }).name}
                        </span>
                      )}
                    </div>
                    <h2 className="font-medium">{game.title}</h2>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <GameDeleteButton id={game.id} />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
