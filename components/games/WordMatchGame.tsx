"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Pair { word: string; meaning: string }

interface Props {
  pairs: Pair[];
  onFinish: (score: number, durationSec: number) => void;
  startTime: number;
}

/**
 * So'z–Ma'no o'yini.
 * Keyboard: Tab bilan harakatlanish, Enter/Space bilan tanlash.
 */
export function WordMatchGame({ pairs, onFinish, startTime }: Props) {
  const [leftSelected, setLeftSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: number; right: number } | null>(null);

  // So'zlarni aralashtirish
  const [shuffledRight] = useState(() =>
    [...pairs.map((p, i) => ({ text: p.meaning, originalIndex: i }))]
      .sort(() => Math.random() - 0.5)
  );

  const handleRight = useCallback((rightOrigIndex: number, rightShuffledIndex: number) => {
    if (leftSelected === null) return;
    if (matched.has(leftSelected)) return;

    if (leftSelected === rightOrigIndex) {
      // To'g'ri juft
      setMatched((prev) => {
        const next = new Set(prev);
        next.add(leftSelected);
        if (next.size === pairs.length) {
          const dur = Math.round((Date.now() - startTime) / 1000);
          onFinish(100, dur);
        }
        return next;
      });
      setLeftSelected(null);
    } else {
      // Noto'g'ri
      setWrongPair({ left: leftSelected, right: rightShuffledIndex });
      setTimeout(() => {
        setWrongPair(null);
        setLeftSelected(null);
      }, 800);
    }
  }, [leftSelected, matched, onFinish, pairs.length, startTime]);

  const score = Math.round((matched.size / pairs.length) * 100);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {matched.size}/{pairs.length} juft topildi
      </p>

      <div className="grid grid-cols-2 gap-4" role="group" aria-label="So'z-Ma'no o'yini">
        {/* Chap: So'zlar */}
        <div className="space-y-2" role="list" aria-label="So'zlar">
          {pairs.map((pair, i) => {
            const isMatched = matched.has(i);
            const isSelected = leftSelected === i;
            return (
              <button
                key={i}
                type="button"
                role="listitem"
                disabled={isMatched}
                aria-pressed={isSelected}
                aria-label={`So'z: ${pair.word}${isMatched ? " (to'g'ri topildi)" : ""}`}
                onClick={() => !isMatched && setLeftSelected(i === leftSelected ? null : i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!isMatched) setLeftSelected(i === leftSelected ? null : i);
                  }
                }}
                className={cn(
                  "w-full text-left rounded-lg border px-4 py-3 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isMatched && "opacity-50 bg-green-50 border-green-300 dark:bg-green-950/30 cursor-default",
                  isSelected && !isMatched && "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2",
                  !isMatched && !isSelected && "hover:bg-muted cursor-pointer",
                  wrongPair?.left === i && "border-destructive bg-destructive/10 animate-pulse"
                )}
              >
                {isMatched && <span aria-hidden="true" className="mr-2">✓</span>}
                {pair.word}
              </button>
            );
          })}
        </div>

        {/* O'ng: Ma'nolar (aralashtrilgan) */}
        <div className="space-y-2" role="list" aria-label="Ma'nolar">
          {shuffledRight.map((item, si) => {
            const isMatched = matched.has(item.originalIndex);
            const isWrong = wrongPair?.right === si;
            return (
              <button
                key={si}
                type="button"
                role="listitem"
                disabled={isMatched || leftSelected === null}
                aria-label={`Ma'no: ${item.text}${isMatched ? " (to'g'ri topildi)" : ""}`}
                onClick={() => !isMatched && handleRight(item.originalIndex, si)}
                className={cn(
                  "w-full text-left rounded-lg border px-4 py-3 text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isMatched && "opacity-50 bg-green-50 border-green-300 dark:bg-green-950/30 cursor-default",
                  !isMatched && leftSelected !== null && "hover:bg-muted cursor-pointer border-dashed",
                  !isMatched && leftSelected === null && "cursor-default opacity-60",
                  isWrong && "border-destructive bg-destructive/10 animate-pulse"
                )}
              >
                {isMatched && <span aria-hidden="true" className="mr-2">✓</span>}
                {item.text}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Avval chap tomondagi so&apos;zni, keyin o&apos;ng tomondagi ma&apos;nosini bosing
      </p>
    </div>
  );
}
