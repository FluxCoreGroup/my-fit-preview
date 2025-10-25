import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyStats {
  week: string;
  weight?: number;
  waist?: number;
  sessions: number;
  avgRpe?: number;
}

const ProgressCharts = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<WeeklyStats[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchProgressData = async () => {
      try {
        // Fetch sessions from last 12 weeks
        const twelveWeeksAgo = new Date();
        twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

        const { data: sessions } = await supabase
          .from('sessions')
          .select('id, session_date')
          .eq('user_id', user.id)
          .eq('completed', true)
          .gte('session_date', twelveWeeksAgo.toISOString())
          .order('session_date');

        // Fetch feedback (RPE data)
        const { data: feedbacks } = await supabase
          .from('feedback')
          .select('session_id, rpe, created_at')
          .eq('user_id', user.id)
          .gte('created_at', twelveWeeksAgo.toISOString());

        // Fetch weekly check-ins (weight data)
        const { data: checkins } = await supabase
          .from('weekly_checkins')
          .select('average_weight, created_at')
          .eq('user_id', user.id)
          .gte('created_at', twelveWeeksAgo.toISOString())
          .order('created_at');

        // Group data by week
        const weeklyStats: { [key: string]: WeeklyStats } = {};
        
        // Process sessions
        (sessions || []).forEach(session => {
          if (session?.session_date) {
            const week = getWeekNumber(new Date(session.session_date));
            if (!weeklyStats[week]) {
              weeklyStats[week] = { week, sessions: 0 };
            }
            weeklyStats[week].sessions++;
          }
        });

        // Process feedback
        if (feedbacks && feedbacks.length > 0) {
          const feedbackByWeek: { [key: string]: number[] } = {};
          feedbacks.forEach(fb => {
            if (fb.rpe) {
              const week = getWeekNumber(new Date(fb.created_at));
              if (!feedbackByWeek[week]) feedbackByWeek[week] = [];
              feedbackByWeek[week].push(fb.rpe);
            }
          });
          
          Object.entries(feedbackByWeek).forEach(([week, rpes]) => {
            if (!weeklyStats[week]) weeklyStats[week] = { week, sessions: 0 };
            weeklyStats[week].avgRpe = Math.round(rpes.reduce((a, b) => a + b, 0) / rpes.length);
          });
        }

        // Process weight check-ins
        (checkins || []).forEach(checkin => {
          if (checkin?.created_at) {
            const week = getWeekNumber(new Date(checkin.created_at));
            if (!weeklyStats[week]) weeklyStats[week] = { week, sessions: 0 };
            if (checkin.average_weight) {
              weeklyStats[week].weight = Number(checkin.average_weight);
            }
          }
        });

        // Convert to array and sort
        const dataArray = Object.values(weeklyStats).sort((a, b) => a.week.localeCompare(b.week));
        setWeeklyData(dataArray);
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user]);

  const getWeekNumber = (date: Date): string => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `S${weekNo}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (weeklyData.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">
          Complète quelques séances pour voir tes statistiques de progression.
        </p>
      </Card>
    );
  }

  const hasWeightData = weeklyData.some(d => d.weight);
  const hasRpeData = weeklyData.some(d => d.avgRpe);

  return (
    <div className="space-y-6">
      {/* Sessions par semaine */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Fréquence d'entraînement</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="week" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Séances" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Évolution du poids */}
      {hasWeightData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution du poids</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData.filter(d => d.weight)}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Poids (kg)"
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}


      {/* RPE moyen */}
      {hasRpeData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Intensité moyenne (RPE)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData.filter(d => d.avgRpe)}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="avgRpe" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                name="RPE moyen"
                dot={{ fill: 'hsl(var(--chart-2))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default ProgressCharts;
