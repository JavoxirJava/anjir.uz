"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { finishGameAction } from "@/app/actions/games";
import { WordMatchGame } from "@/components/games/WordMatchGame";
import { OrderingGame } from "@/components/games/OrderingGame";
import { MemoryGame } from "@/components/games/MemoryGame";

interface Props {
  game: {
    id: string;
    title: string;
    game_type: "word_match" | "ordering" | "memory";
    data: Record<string, unknown>;
  };
  attemptId: string;
}

export function GameRunner({ game, attemptId }: Props) {
  const router = useRouter();
  const [startTime] = useState(() => Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalDuration, setFinalDuration] = useState<number | null>(null);

  const handleFinish = useCallback(async (score: number, durationSec: number) => {
    if (isFinished) return;
    setIsFinished(true);
    setFinalScore(score);
    setFinalDuration(durationSec);

    const result = await finishGameAction(attemptId, score, durationSec);
    if (result?.error) {
      toast.error(result.error);
    }
  }, [attemptId, isFinished]);

  const data = game.data;

  function renderGame() {
    if (game.game_type === "word_match") {
      const pairs = (data.pairs as { word: string; meaning: string }[]) ?? [];
      return (
        <WordMatchGame
          pairs={pairs}
          onFinish={handleFinish}
          startTime={startTime}
        />
      );
    }

    if (game.game_type === "ordering") {
      const items = (data.items as string[]) ?? [];
      const correctOrder = (data.correctOrder as number[]) ?? items.map((_, i) => i);
      return (
        <OrderingGame
          items={items}
          correctOrder={correctOrder}
          onFinish={handleFinish}
          startTime={startTime}
        />
      );
    }

    if (game.game_type === "memory") {
      const pairs = (data.pairs as { front: string; back: string }[]) ?? [];
      return (
        <MemoryGame
          pairs={pairs}
          onFinish={handleFinish}
          startTime={startTime}
        />
      );
    }

    return <p>Noma&apos;lum o&apos;yin turi</p>;
  }

  return (
    <div className="space-y-6">
      {renderGame()}

      {isFinished && (
        <div className="rounded-xl border bg-card p-6 text-center space-y-3" role="status" aria-live="polite">
          <div className="text-4xl font-bold">{finalScore}%</div>
          <p className="text-muted-foreground">
            {finalDuration !== null && `${finalDuration} soniyada yakunlandi`}
          </p>
          <button
            type="button"
            onClick={() => router.push("/app/games")}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 transition-colors"
          >
            O&apos;yinlarga qaytish
          </button>
        </div>
      )}
    </div>
  );
}
