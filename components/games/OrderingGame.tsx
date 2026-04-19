"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  items: string[];
  correctOrder: number[];
  onFinish: (score: number, durationSec: number) => void;
  startTime: number;
}

/**
 * To'g'ri tartib o'yini.
 * Keyboard: Tab + Enter/Space bilan element tanlash va joylashtirish.
 */
export function OrderingGame({ items, correctOrder, onFinish, startTime }: Props) {
  const [shuffled] = useState(() =>
    items.map((text, i) => ({ text, originalIndex: i })).sort(() => Math.random() - 0.5)
  );
  const [order, setOrder] = useState<number[]>([]); // shuffled index'lar
  const [remaining, setRemaining] = useState<number[]>(shuffled.map((_, i) => i));
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  function addToOrder(shuffledIdx: number) {
    const newOrder = [...order, shuffledIdx];
    const newRemaining = remaining.filter((i) => i !== shuffledIdx);
    setOrder(newOrder);
    setRemaining(newRemaining);

    if (newOrder.length === items.length) {
      const dur = Math.round((Date.now() - startTime) / 1000);
      const correctOriginalOrder = newOrder.map((si) => shuffled[si].originalIndex);
      const correct = correctOriginalOrder.every((orig, pos) => orig === correctOrder[pos]);
      setFinished(true);
      onFinish(correct ? 100 : 50, dur);
    }
  }

  function removeFromOrder(idx: number) {
    const shuffledIdx = order[idx];
    setOrder(order.filter((_, i) => i !== idx));
    setRemaining([...remaining, shuffledIdx]);
  }

  return (
    <div className="space-y-6">
      {/* Tartib joyi */}
      <div>
        <p className="text-sm font-medium mb-2" id="order-label">Tartib (birinchidan oxirigacha):</p>
        <div
          className="min-h-16 rounded-lg border-2 border-dashed p-3 space-y-2"
          role="list"
          aria-labelledby="order-label"
          aria-live="polite"
        >
          {order.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Quyidan elementlarni ketma-ket bosing
            </p>
          ) : (
            order.map((si, pos) => (
              <button
                key={pos}
                type="button"
                role="listitem"
                onClick={() => !finished && removeFromOrder(pos)}
                aria-label={`${pos + 1}-o'rin: ${shuffled[si].text}. O'chirish uchun bosing.`}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg border bg-background px-4 py-2.5 text-sm text-left transition-colors",
                  !finished && "hover:border-destructive hover:bg-destructive/5 cursor-pointer focus-visible:outline-2"
                )}
              >
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0"
                  aria-hidden="true"
                >
                  {pos + 1}
                </span>
                {shuffled[si].text}
                {!finished && <span className="ml-auto text-muted-foreground text-xs">✕</span>}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Elementlar */}
      {remaining.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2" id="items-label">Elementlar:</p>
          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-labelledby="items-label"
          >
            {remaining.map((si) => (
              <button
                key={si}
                type="button"
                role="listitem"
                onClick={() => addToOrder(si)}
                aria-label={`Qo'shish: ${shuffled[si].text}`}
                className="rounded-lg border px-4 py-2.5 text-sm hover:bg-primary/10 hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors cursor-pointer"
              >
                {shuffled[si].text}
              </button>
            ))}
          </div>
        </div>
      )}

      {finished && (
        <p className="text-center text-green-600 font-semibold" role="status" aria-live="assertive">
          ✓ Tugallandi!
        </p>
      )}
    </div>
  );
}
