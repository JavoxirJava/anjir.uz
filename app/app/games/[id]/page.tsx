import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameById, createGameAttempt, getStudentGameAttempts } from "@/lib/db/games";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { GameRunner } from "./GameRunner";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const game = await getGameById(id);
  return { title: game ? `${game.title} — I-Imkon.uz` : "O'yin" };
}

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

export default async function StudentGamePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const game = await getGameById(id);
  if (!game) notFound();

  // Attempt yaratish
  const attemptId = await createGameAttempt(user.id, id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-2">
        <Badge variant="secondary">
          {TYPE_EMOJI[game.game_type]} {TYPE_LABELS[game.game_type]}
        </Badge>
        <h1 className="text-2xl font-bold">{game.title}</h1>
        {game.subjects && (
          <p className="text-sm text-muted-foreground">
            {Array.isArray(game.subjects)
              ? (game.subjects[0] as { name: string })?.name
              : (game.subjects as { name: string }).name}
          </p>
        )}
      </header>

      <GameRunner
        game={{
          id: game.id,
          title: game.title,
          game_type: game.game_type,
          data: game.data,
        }}
        attemptId={attemptId}
      />
    </div>
  );
}
