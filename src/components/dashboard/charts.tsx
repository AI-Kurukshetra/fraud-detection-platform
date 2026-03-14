"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const levelColors = ["#16a34a", "#f59e0b", "#f97316", "#e11d48"];

export function RiskDistributionChart({
  data,
}: {
  data: Array<{ level: string; value: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="level" innerRadius={65} outerRadius={95}>
              {data.map((entry, index) => (
                <Cell key={entry.level} fill={levelColors[index % levelColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function VolumeChart({
  data,
}: {
  data: Array<{ day: string; volume: number; fraudRate: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction volume and fraud trend</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="volume" stroke="#0f766e" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="fraudRate" stroke="#0ea5e9" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function RuleHitsChart({
  data,
}: {
  data: Array<{ name: string; hits: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top triggered rules</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hits" fill="#0369a1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
