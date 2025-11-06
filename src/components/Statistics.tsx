import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card } from './ui/card';
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Calendar, Coins, User } from 'lucide-react';
import {ACHIEVEMENTS} from '@/data/achievements';
import { getOrCreatePlayerId } from '@/utils/playerId';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchPlayerProgress, updatePlayerName } from '@/services/playerDataSync';
import { toast } from 'sonner';

interface StatsData {
  day: number;
  rabbits: number;
  coins: number;
  totalEarned: number;
}

export const Statistics = () => {
  const { gameState } = useGame();
  const playerId = getOrCreatePlayerId();
  const [name, setName] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Prefer DB value; fallback to localStorage
    (async () => {
      const db = await fetchPlayerProgress();
      const initial = (db?.player_name?.trim?.() || localStorage.getItem('rabbitTycoon_playerName') || '').trim();
      setName(initial);
    })();
  }, []);

  const onSaveName = async () => {
    const trimmed = (name || '').trim();
    if (trimmed.length === 0) {
      toast.error('Name cannot be empty.');
      return;
    }
    if (trimmed.length > 32) {
      toast.error('Name is too long (max 32 chars).');
      return;
    }
    setSaving(true);
    await updatePlayerName(trimmed);
    setSaving(false);
    toast.success('Name saved! It will appear on the Ranks board.');
  };

  // Generate historical data based on current state
  // In a real implementation, you'd track this over time
  const generateHistoricalData = (): StatsData[] => {
    const data: StatsData[] = [];
    const currentDay = gameState.day;
    const startDay = Math.max(1, currentDay - 20); // Show last 20 days

    for (let day = startDay; day <= currentDay; day++) {
      // Simulate growth curve
      const progress = (day - startDay) / (currentDay - startDay);
      data.push({
        day,
        rabbits: Math.floor(1 + (gameState.rabbits.length - 1) * progress),
        coins: Math.floor(50 + (gameState.coins - 50) * progress),
        totalEarned: Math.floor(gameState.totalCoinsEarned * progress),
      });
    }

    return data;
  };

  const historicalData = generateHistoricalData();
  const spentData = (() => {
    const arr = [...gameState.coinsSpentByDay];
    arr.sort((a, b) => a.day - b.day);
    return arr.slice(-20); // last 20 entries
  })();

  const stats = [
    {
      label: 'Total Days Survived',
      value: gameState.day,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Current Population',
      value: gameState.rabbits.length,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Total Rabbits Born',
      value: gameState.totalRabbitsBorn,
      icon: Trophy,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      label: 'Total Coins Earned',
      value: gameState.totalCoinsEarned,
      icon: Coins,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-earth text-white rounded-2xl p-6 shadow-soft">
        <h2 className="text-2xl font-bold mb-2">📊 Statistics</h2>
        <p className="text-white/90">Track your progress and achievements over time</p>
      </div>

      {/* Player ID Card */}
      <Card className="p-4 shadow-card bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Your Player ID (synced with database)</p>
              <p className="text-sm font-mono font-semibold break-all">{playerId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter a display name"
              maxLength={32}
            />
            <Button onClick={onSaveName} disabled={saving}>
              {saving ? 'Saving…' : 'Save Name'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 shadow-card">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            </Card>
          );
        })}
      </div>

      {/* Rabbit Population Chart */}
      <Card className="p-6 shadow-card">
        <h3 className="font-bold text-lg mb-4">🐰 Population Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="rabbits" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Rabbits"
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Coins Spent Per Day */}
      <Card className="p-6 shadow-card">
        <h3 className="font-bold text-lg mb-4">💰 Coins Spent Per Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={spentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: any) => [value, 'Spent']}
            />
            <Legend />
            <Bar 
              dataKey="spent" 
              fill="hsl(var(--secondary))" 
              name="Coins Spent"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Coins Chart */}
      <Card className="p-6 shadow-card">
        <h3 className="font-bold text-lg mb-4">💰 Earnings Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="totalEarned" 
              fill="hsl(var(--accent))" 
              name="Total Coins Earned"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Resource Efficiency */}
      <Card className="p-6 shadow-card">
        <h3 className="font-bold text-lg mb-4">⚡ Resource Efficiency</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-accent/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Food Type</p>
            <p className="text-xl font-bold capitalize">{gameState.foodType}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Efficiency: {gameState.foodType === 'pellets' ? '+50%' : gameState.foodType === 'lettuce' ? '+20%' : 'Standard'}
            </p>
          </div>
          <div className="p-4 bg-water/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Water Type</p>
            <p className="text-xl font-bold capitalize">{gameState.waterType}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Breeding: {gameState.waterType === 'purified' ? '2x Rate' : 'Standard'}
            </p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Housing Capacity</p>
            <p className="text-xl font-bold">{gameState.houses * 4}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Current: {gameState.rabbits.length} / {gameState.houses * 4}
            </p>
          </div>
          <div className="p-4 bg-secondary/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Achievements</p>
            <p className="text-xl font-bold">{gameState.unlockedAchievements.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Progress: {Math.round((gameState.unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
