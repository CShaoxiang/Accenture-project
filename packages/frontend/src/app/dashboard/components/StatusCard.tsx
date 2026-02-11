interface StatusCardProps {
  title: string;
  value: number;
  color: string;
  icon?: string;
}

export default function StatusCard({ title, value, color }: StatusCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color] || colorClasses.blue}`}>
      <h3 className="text-sm font-medium uppercase tracking-wide">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
