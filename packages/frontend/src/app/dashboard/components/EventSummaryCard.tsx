import { EventSummary } from '@/hooks/useDashboard';

interface EventSummaryCardProps {
  event: EventSummary;
}

export default function EventSummaryCard({ event }: EventSummaryCardProps) {
  const total = Object.values(event.statusSummary).reduce((sum, val) => sum + val, 0);
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const typeColors: Record<string, string> = {
    hackathon: 'bg-purple-100 text-purple-800',
    bootcamp: 'bg-indigo-100 text-indigo-800',
    networking: 'bg-pink-100 text-pink-800',
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            typeColors[event.type] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{event.statusSummary.requested}</p>
          <p className="text-xs text-gray-600">Requested</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{event.statusSummary.waiting}</p>
          <p className="text-xs text-gray-600">Waiting</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{event.statusSummary.confirmed}</p>
          <p className="text-xs text-gray-600">Confirmed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{event.statusSummary.needsAction}</p>
          <p className="text-xs text-gray-600">Needs Action</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{event.statusSummary.rejected}</p>
          <p className="text-xs text-gray-600">Rejected</p>
        </div>
      </div>

      <div className="mt-4 border-t pt-2">
        <p className="text-sm text-gray-600">
          Total Entities: <span className="font-semibold">{total}</span>
        </p>
      </div>
    </div>
  );
}
