"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createGameAction } from "@/app/actions/games";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Subject { id: string; name: string }
interface ClassItem { id: string; grade: number; letter: string }

type GameType = "word_match" | "ordering" | "memory";

interface WordPair { word: string; meaning: string }
interface OrderItem { text: string }
interface MemoryPair { front: string; back: string }

const GAME_TYPES: { value: GameType; label: string; desc: string; emoji: string }[] = [
  { value: "word_match", label: uz.games.wordMatch, desc: uz.games.wordMatchDesc, emoji: "🔤" },
  { value: "ordering",   label: uz.games.ordering,  desc: uz.games.orderingDesc,  emoji: "📋" },
  { value: "memory",     label: uz.games.memory,     desc: uz.games.memoryDesc,    emoji: "🧠" },
];

export function GameBuilderForm({
  subjects,
  classes,
}: {
  subjects: Subject[];
  classes: ClassItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle]           = useState("");
  const [gameType, setGameType]     = useState<GameType>("word_match");
  const [subjectId, setSubjectId]   = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // Word match ma'lumotlari
  const [wordPairs, setWordPairs] = useState<WordPair[]>([
    { word: "", meaning: "" },
    { word: "", meaning: "" },
  ]);

  // Ordering ma'lumotlari
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { text: "" },
    { text: "" },
    { text: "" },
  ]);

  // Memory ma'lumotlari
  const [memoryPairs, setMemoryPairs] = useState<MemoryPair[]>([
    { front: "", back: "" },
    { front: "", back: "" },
    { front: "", back: "" },
  ]);

  // ---- Word match helpers ----
  function updateWordPair(idx: number, field: keyof WordPair, val: string) {
    setWordPairs((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
  }
  function addWordPair() { setWordPairs((p) => [...p, { word: "", meaning: "" }]); }
  function removeWordPair(idx: number) { setWordPairs((p) => p.filter((_, i) => i !== idx)); }

  // ---- Ordering helpers ----
  function updateOrderItem(idx: number, val: string) {
    setOrderItems((prev) => prev.map((it, i) => (i === idx ? { text: val } : it)));
  }
  function addOrderItem() { setOrderItems((p) => [...p, { text: "" }]); }
  function removeOrderItem(idx: number) { setOrderItems((p) => p.filter((_, i) => i !== idx)); }
  function moveOrderItem(idx: number, dir: -1 | 1) {
    const next = [...orderItems];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setOrderItems(next);
  }

  // ---- Memory helpers ----
  function updateMemoryPair(idx: number, field: keyof MemoryPair, val: string) {
    setMemoryPairs((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
  }
  function addMemoryPair() { setMemoryPairs((p) => [...p, { front: "", back: "" }]); }
  function removeMemoryPair(idx: number) { setMemoryPairs((p) => p.filter((_, i) => i !== idx)); }

  // ---- Class toggle ----
  function toggleClass(id: string) {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  // ---- Submit ----
  function buildGameData(): Record<string, unknown> {
    if (gameType === "word_match") {
      return { pairs: wordPairs };
    } else if (gameType === "ordering") {
      return {
        items: orderItems.map((it) => it.text),
        // correctOrder: indeks tartib [0,1,2,...] — orderItems allaqachon to'g'ri tartibda
        correctOrder: orderItems.map((_, i) => i),
      };
    } else {
      return { pairs: memoryPairs };
    }
  }

  function validate(): string | null {
    if (!title.trim()) return "Sarlavha kiritilishi shart";
    if (!subjectId) return "Fan tanlanishi shart";
    if (selectedClasses.length === 0) return "Kamida 1 ta sinf tanlang";

    if (gameType === "word_match") {
      if (wordPairs.length < 2) return "Kamida 2 ta juft kerak";
      if (wordPairs.some((p) => !p.word.trim() || !p.meaning.trim()))
        return "Barcha so'z va ma'nolarni to'ldiring";
    } else if (gameType === "ordering") {
      if (orderItems.length < 2) return "Kamida 2 ta element kerak";
      if (orderItems.some((it) => !it.text.trim()))
        return "Barcha elementlarni to'ldiring";
    } else {
      if (memoryPairs.length < 2) return "Kamida 2 ta karta juft kerak";
      if (memoryPairs.some((p) => !p.front.trim() || !p.back.trim()))
        return "Barcha karta tomonlarini to'ldiring";
    }
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("template_type", gameType);
    fd.append("subject_id", subjectId);
    selectedClasses.forEach((c) => fd.append("classIds", c));
    fd.append("content_json", JSON.stringify(buildGameData()));

    startTransition(async () => {
      const result = await createGameAction(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("O'yin yaratildi!");
        router.push("/teacher/games");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Umumiy ma'lumotlar */}
      <Card>
        <CardHeader>
          <CardTitle>O&apos;yin ma&apos;lumotlari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sarlavha */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Sarlavha *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O'yin sarlavhasi"
              required
              aria-required="true"
            />
          </div>

          {/* Fan */}
          <div className="space-y-1.5">
            <Label htmlFor="subject">Fan (ixtiyoriy)</Label>
            <select
              id="subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring bg-background"
            >
              <option value="">— Fan tanlang —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Sinflar */}
          <fieldset>
            <legend className="text-sm font-medium mb-2">Sinflar *</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Sinflar ro'yxati">
              {classes.map((cls) => {
                const isSelected = selectedClasses.includes(cls.id);
                return (
                  <button
                    key={cls.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => toggleClass(cls.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 ${
                      isSelected
                        ? "border-primary bg-primary/10 font-medium"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {cls.grade}{cls.letter}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      {/* O'yin turi */}
      <Card>
        <CardHeader>
          <CardTitle>O&apos;yin turi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="O'yin turi">
            {GAME_TYPES.map((gt) => (
              <button
                key={gt.value}
                type="button"
                role="radio"
                aria-checked={gameType === gt.value}
                onClick={() => setGameType(gt.value)}
                className={`rounded-lg border-2 p-4 text-left transition-colors focus-visible:outline-2 ${
                  gameType === gt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="text-2xl mb-1" aria-hidden="true">{gt.emoji}</div>
                <div className="font-medium text-sm">{gt.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{gt.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Word Match editor */}
      {gameType === "word_match" && (
        <Card>
          <CardHeader>
            <CardTitle>So&apos;z–Ma&apos;no juftlari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wordPairs.map((pair, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="text-xs text-muted-foreground mt-3 w-6 shrink-0 text-right">
                  {idx + 1}.
                </span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    placeholder="So'z"
                    value={pair.word}
                    onChange={(e) => updateWordPair(idx, "word", e.target.value)}
                    aria-label={`${idx + 1}-juft: so'z`}
                  />
                  <Input
                    placeholder="Ma'no / tarjimasi"
                    value={pair.meaning}
                    onChange={(e) => updateWordPair(idx, "meaning", e.target.value)}
                    aria-label={`${idx + 1}-juft: ma'no`}
                  />
                </div>
                {wordPairs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeWordPair(idx)}
                    aria-label={`${idx + 1}-juftni o'chirish`}
                    className="mt-2 text-destructive hover:bg-destructive/10 rounded p-1 focus-visible:outline-2 shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addWordPair}>
              + Juft qo&apos;shish
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ordering editor */}
      {gameType === "ordering" && (
        <Card>
          <CardHeader>
            <CardTitle>Elementlar (to&apos;g&apos;ri tartib yuqoridan pastga)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Elementlarni to&apos;g&apos;ri tartibda kiriting. O&apos;quvchilar ularni aralashtirilib ko&apos;rsatishadi.
            </p>
            {orderItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-xs font-mono text-muted-foreground w-6 shrink-0 text-right">
                  {idx + 1}.
                </span>
                <Input
                  value={item.text}
                  onChange={(e) => updateOrderItem(idx, e.target.value)}
                  placeholder={`${idx + 1}-element`}
                  aria-label={`${idx + 1}-element matni`}
                  className="flex-1"
                />
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveOrderItem(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Yuqoriga ko'chirish"
                    className="rounded p-1 hover:bg-muted disabled:opacity-40 focus-visible:outline-2"
                  >↑</button>
                  <button
                    type="button"
                    onClick={() => moveOrderItem(idx, 1)}
                    disabled={idx === orderItems.length - 1}
                    aria-label="Pastga ko'chirish"
                    className="rounded p-1 hover:bg-muted disabled:opacity-40 focus-visible:outline-2"
                  >↓</button>
                  {orderItems.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOrderItem(idx)}
                      aria-label={`${idx + 1}-elementni o'chirish`}
                      className="text-destructive hover:bg-destructive/10 rounded p-1 focus-visible:outline-2"
                    >✕</button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
              + Element qo&apos;shish
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Memory editor */}
      {gameType === "memory" && (
        <Card>
          <CardHeader>
            <CardTitle>Karta juftlari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Har bir juftning ikkala tomoni alohida kartada ko&apos;rsatiladi.
            </p>
            {memoryPairs.map((pair, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="text-xs text-muted-foreground mt-3 w-6 shrink-0 text-right">
                  {idx + 1}.
                </span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    placeholder="1-tomon (masalan: so'z)"
                    value={pair.front}
                    onChange={(e) => updateMemoryPair(idx, "front", e.target.value)}
                    aria-label={`${idx + 1}-juft: old tomon`}
                  />
                  <Input
                    placeholder="2-tomon (masalan: tarjima)"
                    value={pair.back}
                    onChange={(e) => updateMemoryPair(idx, "back", e.target.value)}
                    aria-label={`${idx + 1}-juft: orqa tomon`}
                  />
                </div>
                {memoryPairs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeMemoryPair(idx)}
                    aria-label={`${idx + 1}-juftni o'chirish`}
                    className="mt-2 text-destructive hover:bg-destructive/10 rounded p-1 focus-visible:outline-2 shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addMemoryPair}>
              + Juft qo&apos;shish
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/teacher/games")}
          disabled={isPending}
        >
          {uz.common.cancel}
        </Button>
        <Button type="submit" disabled={isPending} aria-busy={isPending}>
          {isPending ? uz.common.loading : "O'yin yaratish"}
        </Button>
      </div>
    </form>
  );
}
