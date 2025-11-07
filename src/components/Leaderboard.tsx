import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { ACHIEVEMENTS } from '@/data/achievements';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getOrCreatePlayerId } from '@/utils/playerId';

interface Row {
  player_id: string;
  achievements_count: number;
  achievements: string[];
  day: number;
  house_capacity: number;
  player_name: string | null;
  rabbits_common: number;
  rabbits_rare: number;
  rabbits_legendary: number;
  current_coins: number;
  total_rabbits_born: number;
  total_coins_earned: number;
}

function maskId(id: string) {
  return id?.slice(0, 6) ?? '';
}

export const Leaderboard = () => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_progress')
        .select('player_id, player_name, achievements_count, achievements, day, house_capacity, rabbits_common, rabbits_rare, rabbits_legendary, current_coins, total_rabbits_born, total_coins_earned')
        .order('total_coins_earned', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    staleTime: 30_000,
  });

  const rows = useMemo(() => data ?? [], [data]);
  const myId = useMemo(() => getOrCreatePlayerId(), []);
  const myHistory = useMemo(() => {
    try {
      const raw = localStorage.getItem('rabbitTycoonSave');
      if (!raw) return [] as Array<any>;
      const parsed = JSON.parse(raw);
      return (parsed?.runHistory || []) as Array<{ day: number; totalCoinsEarned: number; endAt: number; rabbits: number; houses: number; achievements: string[] }>;
    } catch {
      return [] as Array<any>;
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-earth text-white rounded-2xl p-6 shadow-soft">
        <h2 className="text-2xl font-bold mb-2">🏆 Player Ranks</h2>
        <p className="text-white/90">Top 100 players by total coins earned</p>
      </div>

      <Card className="p-0 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 w-10" />
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Player</th>
                <th className="text-right px-4 py-3">Total Coins</th>
                <th className="text-right px-4 py-3">Current Coins</th>
                <th className="text-right px-4 py-3">Day</th>
                <th className="text-right px-4 py-3">Capacity</th>
                <th className="text-right px-4 py-3">Achievements</th>
                <th className="text-right px-4 py-3">Rabbits</th>
                <th className="text-right px-4 py-3">Born</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted-foreground" colSpan={10}>Loading…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted-foreground" colSpan={10}>No ranks yet. Start playing to appear here!</td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const totalRabbits = (r.rabbits_common || 0) + (r.rabbits_rare || 0) + (r.rabbits_legendary || 0);
                  const isOpen = !!expanded[r.player_id];
                  return (
                    <>
                      <tr key={r.player_id} className={idx % 2 === 0 ? 'bg-background' : ''}>
                        <td className="px-2 py-3">
                          <button onClick={() => toggle(r.player_id)} className="p-1 rounded hover:bg-muted">
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3 font-mono">{(r.player_name && r.player_name.trim().length > 0) ? r.player_name : maskId(r.player_id)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{(r.total_coins_earned || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{(r.current_coins || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{r.day ?? '-'}</td>
                        <td className="px-4 py-3 text-right">{(r.house_capacity ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{r.achievements_count || 0}</td>
                        <td className="px-4 py-3 text-right">{totalRabbits.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{(r.total_rabbits_born || 0).toLocaleString()}</td>
                      </tr>
                      {isOpen && (
                        <tr className={idx % 2 === 0 ? 'bg-muted/20' : 'bg-muted/10'}>
                          <td />
                          <td colSpan={9} className="px-6 py-4 space-y-4">
                            <div>
                              <div className="font-semibold mb-2">Achievements</div>
                              <div className="flex flex-wrap gap-2">
                                {(r.achievements || []).length === 0 ? (
                                  <span className="text-muted-foreground text-sm">No achievements yet.</span>
                                ) : (
                                  (r.achievements || []).map((id) => {
                                    const a = ACHIEVEMENTS.find(x => x.id === id);
                                    return (
                                      <span key={id} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        {a ? `${a.icon} ${a.name}` : id}
                                      </span>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {r.player_id === myId && myHistory.length > 0 && (
                              <div>
                                <div className="font-semibold mb-2">Your Previous Runs</div>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs">
                                    <thead className="bg-muted/40">
                                      <tr>
                                        <th className="text-left px-2 py-1">Ended</th>
                                        <th className="text-right px-2 py-1">Day</th>
                                        <th className="text-right px-2 py-1">Total Coins</th>
                                        <th className="text-right px-2 py-1">Rabbits</th>
                                        <th className="text-right px-2 py-1">Houses</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {[...myHistory]
                                        .sort((a, b) => (b.endAt || 0) - (a.endAt || 0))
                                        .map((run, i) => (
                                          <tr key={(run.endAt || 0) + '-' + i} className={i % 2 === 0 ? 'bg-background' : ''}>
                                            <td className="px-2 py-1">{run.endAt ? new Date(run.endAt).toLocaleString() : '-'}</td>
                                            <td className="px-2 py-1 text-right">{run.day ?? '-'}</td>
                                            <td className="px-2 py-1 text-right font-medium">{(run.totalCoinsEarned || 0).toLocaleString()}</td>
                                            <td className="px-2 py-1 text-right">{run.rabbits ?? '-'}</td>
                                            <td className="px-2 py-1 text-right">{run.houses ?? '-'}</td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
