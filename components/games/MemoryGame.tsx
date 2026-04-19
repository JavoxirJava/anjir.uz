"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Card {
  id: number;
  pairId: number;
  text: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Props {
  pairs: { front: string; back: string }[];
  onFinish: (score: number, durationSec: number) => void;
  startTime: number;
}

/**
 * Xotira kartalari o'yini.
 * Juft kartalarni toping. Keyboard: Tab + Enter/Space.
 */
export function MemoryGame({ pairs, onFinish, startTime }: Props) {
  const [cards, setCards] = useState<Card[]>(() => {
    const deck: Card[] = [];
    pairs.forEach((pair, pairId) => {
      deck.push({ id: pairId * 2,     pairId, text: pair.front, isFlipped: false, isMatched: false });
      deck.push({ id: pairId * 2 + 1, pairId, text: pair.back,  isFlipped: false, isMatched: false });
    });
    // Aralashtirish
    return deck.sort(() => Math.random() - 0.5);
  });

  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [finished, setFinished] = useState(false);

  const matchedCount = cards.filter((c) => c.isMatched).length / 2;
  const totalPairs = pairs.length;

  const flipCard = useCallback((cardId: number) => {
    if (isLocked || finished) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedIds.includes(cardId)) return;

    const newFlipped = [...flippedIds, cardId];

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);

      const [firstId, secondId] = newFlipped;
      const first  = cards.find((c) => c.id === firstId)!;
      const second = cards.find((c) => c.id === secondId)!;

      if (first.pairId === second.pairId) {
        // To'g'ri juft
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          )
        );
        setFlippedIds([]);
        setIsLocked(false);

        const newMatchedCount = matchedCount + 1;
        if (newMatchedCount === totalPairs) {
          setFinished(true);
          const dur = Math.round((Date.now() - startTime) / 1000);
          // Ball: moves qancha kam bo'lsa shuncha yaxshi
          const minMoves = totalPairs;
          const ratio = Math.min(1, minMoves / (moves + 1));
          const score = Math.round(60 + ratio * 40);
          onFinish(score, dur);
        }
      } else {
        // Noto'g'ri — 800ms keyin qaytarish
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedIds([]);
          setIsLocked(false);
        }, 800);
      }
    } else {
      setFlippedIds(newFlipped);
    }
  }, [cards, flippedIds, isLocked, finished, matchedCount, totalPairs, moves, startTime, onFinish]);

  // Klaviatura uchun
  function handleKeyDown(e: React.KeyboardEvent, cardId: number) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      flipCard(cardId);
    }
  }

  const cols = totalPairs <= 4 ? "grid-cols-4" : totalPairs <= 6 ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-6";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground" aria-live="polite">
          {matchedCount}/{totalPairs} juft topildi
        </span>
        <span className="text-muted-foreground">
          {moves} harakat
        </span>
      </div>

      <div
        className={`grid ${cols} gap-3`}
        role="grid"
        aria-label="Xotira kartalari"
      >
        {cards.map((card) => {
          const label = card.isMatched
            ? `Topildi: ${card.text}`
            : card.isFlipped
              ? `Ochiq: ${card.text}`
              : `Yopiq karta ${card.id + 1}`;

          return (
            <button
              key={card.id}
              type="button"
              role="gridcell"
              aria-label={label}
              aria-pressed={card.isFlipped || card.isMatched}
              disabled={card.isMatched || isLocked}
              onClick={() => flipCard(card.id)}
              onKeyDown={(e) => handleKeyDown(e, card.id)}
              className={cn(
                "relative aspect-square rounded-xl border-2 text-sm font-medium transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                "flex items-center justify-center text-center p-2 cursor-pointer",
                card.isMatched
                  ? "border-green-400 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300 cursor-default"
                  : card.isFlipped
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-muted hover:bg-muted/80 text-transparent select-none"
              )}
            >
              {(card.isFlipped || card.isMatched) ? (
                <span className="break-words leading-tight">{card.text}</span>
              ) : (
                <span aria-hidden="true" className="text-2xl text-muted-foreground/40">?</span>
              )}
            </button>
          );
        })}
      </div>

      {finished && (
        <p className="text-center text-green-600 font-semibold" role="status" aria-live="assertive">
          🎉 Barcha juftlar topildi! ({moves} harakat)
        </p>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Kartalarni bosib juftlarini toping
      </p>
    </div>
  );
}
