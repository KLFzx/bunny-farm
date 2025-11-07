import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { ACHIEVEMENTS } from '@/data/achievements';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
  const sortedRows = useMemo(() => {
    const list = [...rows];
    list.sort((a, b) => {
      const ar = (a.rabbits_common || 0) + (a.rabbits_rare || 0) + (a.rabbits_legendary || 0);
      const br = (b.rabbits_common || 0) + (b.rabbits_rare || 0) + (b.rabbits_legendary || 0);
      return br - ar;
    });
    return list;
  }, [rows]);
  const playerIds = useMemo(() => sortedRows.map(r => r.player_id), [sortedRows]);

  const { data: runsData } = useQuery({
    queryKey: ['leaderboard', 'runs', playerIds],
    enabled: playerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_runs')
        .select('player_id, run_ended_at, day, total_coins_earned, rabbits, houses')
        .in('player_id', playerIds)
        .order('run_ended_at', { ascending: false });
      if (error) throw error;
      return data as Array<{ player_id: string; run_ended_at: string | null; day: number; total_coins_earned: number; rabbits: number; houses: number }>;
    },
    staleTime: 30_000,
  });

  const runsByPlayer = useMemo(() => {
    const map: Record<string, Array<{ run_ended_at: string | null; day: number; total_coins_earned: number; rabbits: number; houses: number }>> = {};
    (runsData || []).forEach(r => {
      (map[r.player_id] ||= []).push({
        run_ended_at: r.run_ended_at,
        day: r.day,
        total_coins_earned: r.total_coins_earned,
        rabbits: r.rabbits,
        houses: r.houses,
      });
    });
    return map;
  }, [runsData]);

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
              ) : sortedRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted-foreground" colSpan={10}>No ranks yet. Start playing to appear here!</td>
                </tr>
              ) : (
                sortedRows.map((r, idx) => {
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

                            {!!runsByPlayer[r.player_id]?.length && (
                              <div>
                                <div className="font-semibold mb-2">Previous Runs</div>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs">
                                    <thead className="bg-muted/40">
                                      <tr>
                                        <th className="text-left px-2 py-1">Ended</th>
                                        <th className="text-right px-2 py-1">Day</th>
                                        <th className="text-right px-2 py-1">Rabbits</th>
                                        <th className="text-right px-2 py-1">Houses</th>
                                        <th className="text-right px-2 py-1">Total Coins</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {runsByPlayer[r.player_id]
                                        .slice(0, 20)
                                        .map((run, i) => (
                                          <tr key={(run.run_ended_at || '') + '-' + i} className={i % 2 === 0 ? 'bg-background' : ''}>
                                            <td className="px-2 py-1">{run.run_ended_at ? new Date(run.run_ended_at).toLocaleString() : '-'}</td>
                                            <td className="px-2 py-1 text-right">{run.day ?? '-'}</td>
                                            <td className="px-2 py-1 text-right">{run.rabbits ?? '-'}</td>
                                            <td className="px-2 py-1 text-right">{run.houses ?? '-'}</td>
                                            <td className="px-2 py-1 text-right">{(run.total_coins_earned || 0).toLocaleString()}</td>
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
