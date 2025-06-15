"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StatusCheck {
  online: boolean;
}

interface DayStatus {
  date: string;
  checks: StatusCheck[];
}

interface ChartData {
  date: string;
  uptimePct: number;
  color: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function uptimeColor(pct: number) {
  if (pct >= 90) return "#22c55e"; // green
  if (pct >= 50) return "#eab308"; // yellow
  return "#ef4444"; // red
}

export default function StatusPage() {
  const [data, setData] = useState<DayStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/m3-chat/status/refs/heads/main/STATUS.JSON"
    )
      .then((res) => res.json())
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data.length) return <div>No data available</div>;

  const chartData: ChartData[] = data
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => {
      const upCount = day.checks.filter((c) => c.online).length;
      const total = day.checks.length;
      const uptimePct = total > 0 ? (upCount / total) * 100 : 0;
      return {
        date: formatDate(day.date),
        uptimePct,
        color: uptimeColor(uptimePct),
      };
    });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload as ChartData;
      return (
        <Card className="p-2 bg-background border border-muted shadow-md">
          <CardContent className="p-2 text-xs text-foreground">
            <div>{d.date}</div>
            <div>Uptime: {d.uptimePct.toFixed(1)}%</div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">M3 Chat Status</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Uptime over the last 2 weeks. Data updates every 5 minutes.
      </p>

      {/* Legend */}
      <div className="flex gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-green-500" />
          <span>≥ 90% uptime</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-yellow-400" />
          <span>50% - 89% uptime</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-red-500" />
          <span>&lt; 50% uptime</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 60 }}>
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            height={60}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="uptimePct" minPointSize={5}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </main>
  );
}
