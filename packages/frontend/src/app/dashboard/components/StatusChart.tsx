'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { StatusSummary } from '@/hooks/useDashboard';

interface StatusChartProps {
  data: StatusSummary;
  title: string;
}

const COLORS = {
  requested: '#3B82F6', // blue
  waiting: '#EAB308', // yellow
  confirmed: '#22C55E', // green
  needsAction: '#F97316', // orange
  rejected: '#EF4444', // red
};

const STATUS_LABELS = {
  requested: 'Requested',
  waiting: 'Waiting',
  confirmed: 'Confirmed',
  needsAction: 'Needs Action',
  rejected: 'Rejected',
};

export default function StatusChart({ data, title }: StatusChartProps) {
  const chartData = [
    { name: STATUS_LABELS.requested, value: data.requested, color: COLORS.requested },
    { name: STATUS_LABELS.waiting, value: data.waiting, color: COLORS.waiting },
    { name: STATUS_LABELS.confirmed, value: data.confirmed, color: COLORS.confirmed },
    { name: STATUS_LABELS.needsAction, value: data.needsAction, color: COLORS.needsAction },
    { name: STATUS_LABELS.rejected, value: data.rejected, color: COLORS.rejected },
  ].filter((item) => item.value > 0);

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
