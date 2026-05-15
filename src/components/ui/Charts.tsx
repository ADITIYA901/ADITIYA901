import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

export function VotePieChart({ data, height = 300 }: { data: PieChartData[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface BarChartData {
  name: string;
  votes: number;
  color?: string;
}

export function VoteBarChart({ data, height = 300 }: { data: BarChartData[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        />
        <Bar dataKey="votes" animationDuration={800}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface LineChartData {
  name: string;
  value: number;
}

export function TrendLineChart({ data, height = 300, color = '#3b82f6' }: { data: LineChartData[]; height?: number; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
