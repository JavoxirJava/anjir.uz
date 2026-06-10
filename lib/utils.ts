import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scoreGrade(score: number): { label: string; numeric: number | null; color: string; emoji: string } {
  if (score >= 86) return { label: "A'lo", numeric: 5, color: "text-green-600", emoji: "🏆" };
  if (score >= 65) return { label: "Yaxshi", numeric: 4, color: "text-blue-600", emoji: "⭐" };
  if (score >= 30) return { label: "Qoniqarli", numeric: 3, color: "text-yellow-600", emoji: "👍" };
  return { label: "Qoniqarsiz", numeric: null, color: "text-destructive", emoji: "📚" };
}

export function formatScore(score: number): string {
  return Number.isInteger(score) ? `${score}%` : `${score.toFixed(1)}%`;
}
