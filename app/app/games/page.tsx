import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGamesForStudent } from "@/lib/db/games";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.student.games} — I-Imkon.uz`,
};

const TYPE_LABELS: Record<string, string> = {
  word_match: uz.games.wordMatch,
  ordering:   uz.games.ordering,
  memory:     uz.games.memory,
};

const TYPE_EMOJI: Record<string, string> = {
  word_match: "🔤",
  ordering:   "📋",
  memory:     "🧠",
};

const TYPE_DESC: Record<string, string> = {
  word_match: uz.games.wordMatchDesc,
  ordering:   uz.games.orderingDesc,
  memory:     uz.games.memoryDesc,
};

export default async function StudentGamesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Student class_id
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("class_id")
    .eq("user_id", user.id)
    .single();

  const games = profile?.class_id
    ? await getGamesForStudent(profile.class_id)
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.student.games}</h1>

      {games.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
          <p className="text-sm text-muted-foreground mt-1">
            O&apos;qituvchingiz o&apos;yin qo&apos;shishi kutilmoqda
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label={uz.student.games}>
          {games.map((game) => (
            <li key={game.id}>
              <Link href={`/app/games/${game.id}`} className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xl">
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardContent className="pt-5 pb-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" aria-hidden="true">
                        {TYPE_EMOJI[game.game_type]}
                      </span>
                      <Badge variant="secondary">
                        {TYPE_LABELS[game.game_type]}
                      </Badge>
                    </div>
                    <h2 className="font-semibold">{game.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {TYPE_DESC[game.game_type]}
                    </p>
                    {game.subjects && (
                      <p className="text-xs text-muted-foreground">
                        📚 {Array.isArray(game.subjects)
                          ? (game.subjects[0] as { name: string })?.name
                          : (game.subjects as { name: string }).name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
