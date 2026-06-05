import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { getGameById, createGameAttempt } from "@/lib/db/games";
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
  // Foydalanuvchi va o'yin bir-biriga bog'liq emas — parallel olamiz.
  const [user, game] = await Promise.all([getCurrentUser(), getGameById(id)]);
  if (!user) redirect("/login");
  if (!game) notFound();

  if (game.external_url) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <Badge variant="secondary">
            {TYPE_EMOJI[game.template_type]} {TYPE_LABELS[game.template_type]}
          </Badge>
          <h1 className="text-2xl font-bold">{game.title}</h1>
          <p className="text-sm text-muted-foreground">
            Bu o&apos;yin tashqi platformada joylashgan.
          </p>
        </header>

        <a
          href={game.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2"
        >
          Tashqi o&apos;yinni ochish ↗
        </a>
      </div>
    );
  }

  // Attempt yaratish
  const attemptId = await createGameAttempt(user.id, id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-2">
        <Badge variant="secondary">
          {TYPE_EMOJI[game.template_type]} {TYPE_LABELS[game.template_type]}
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
          game_type: game.template_type as "word_match" | "ordering" | "memory",
          data: game.content_json,
        }}
        attemptId={attemptId}
      />
    </div>
  );
}
