import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.leaderboard.title} — I-Imkon.uz`,
};

interface LeaderboardEntry {
  user_id: string;
  first_name: string;
  last_name: string;
  total_score: number;
  rank: number;
}

function getMedal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

function renderTable(data: LeaderboardEntry[], currentUserId: string) {
  if (data.length === 0) {
    return <p className="text-muted-foreground text-center py-4">{uz.common.noData}</p>;
  }
  return (
    <table className="w-full" role="table" aria-label="Reyting jadvali">
      <thead>
        <tr className="border-b text-xs text-muted-foreground">
          <th className="py-2 text-left pl-3 w-12" scope="col">{uz.leaderboard.rank}</th>
          <th className="py-2 text-left" scope="col">{uz.leaderboard.student}</th>
          <th className="py-2 text-right pr-3" scope="col">{uz.leaderboard.score}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, idx) => {
          const isMe = entry.user_id === currentUserId;
          const medal = getMedal(idx + 1);
          return (
            <tr
              key={entry.user_id}
              className={`border-b transition-colors ${isMe ? "bg-primary/5 font-medium" : "hover:bg-muted/50"}`}
              aria-current={isMe ? "true" : undefined}
            >
              <td className="py-2.5 pl-3 text-sm text-muted-foreground">
                {medal ? <span aria-label={`${idx + 1}-o'rin`}>{medal}</span> : <span>{idx + 1}</span>}
              </td>
              <td className="py-2.5 text-sm">
                {entry.first_name} {entry.last_name}
                {isMe && <span className="ml-2 text-xs text-primary">(siz)</span>}
              </td>
              <td className="py-2.5 pr-3 text-sm text-right font-mono">
                {Math.round(entry.total_score || 0)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [allTimeData, weeklyData] = await Promise.all([
    apiGet<LeaderboardEntry[]>("/leaderboard?period=all_time").catch(() => []),
    apiGet<LeaderboardEntry[]>("/leaderboard?period=weekly").catch(() => []),
  ]);

  const myAllTimeRank = allTimeData.findIndex((e) => e.user_id === user.id) + 1;
  const myWeeklyRank = weeklyData.findIndex((e) => e.user_id === user.id) + 1;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{uz.leaderboard.title}</h1>

      {(myAllTimeRank > 0 || myWeeklyRank > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {myAllTimeRank > 0 && (
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-3xl font-bold text-primary">#{myAllTimeRank}</div>
                <div className="text-xs text-muted-foreground mt-1">{uz.leaderboard.allTime}</div>
              </CardContent>
            </Card>
          )}
          {myWeeklyRank > 0 && (
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-3xl font-bold text-primary">#{myWeeklyRank}</div>
                <div className="text-xs text-muted-foreground mt-1">{uz.leaderboard.weekly}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{uz.leaderboard.allTime}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {renderTable(allTimeData, user.id)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">🔥 {uz.leaderboard.weekly}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {renderTable(weeklyData, user.id)}
        </CardContent>
      </Card>
    </div>
  );
}
