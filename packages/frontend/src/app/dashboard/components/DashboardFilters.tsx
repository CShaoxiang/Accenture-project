import { DashboardFilters as Filters } from '@/hooks/useDashboard';

interface DashboardFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  events: Array<{ id: string; name: string }>;
}

export default function DashboardFilters({
  filters,
  onFilterChange,
  events,
}: DashboardFiltersProps) {
  const handleEventChange = (eventId: string) => {
    onFilterChange({
      ...filters,
      eventId: eventId === 'all' ? undefined : eventId,
    });
  };

  const handleEntityTypeChange = (entityType: string) => {
    onFilterChange({
      ...filters,
      entityType:
        entityType === 'all'
          ? undefined
          : (entityType as 'venue' | 'student_body' | 'stakeholder'),
    });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({
      ...filters,
      status: status === 'all' ? undefined : status,
    });
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-semibold">Filters</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="event-filter" className="mb-2 block text-sm font-medium text-gray-700">
            Event
          </label>
          <select
            id="event-filter"
            value={filters.eventId || 'all'}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="entity-type-filter"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Entity Type
          </label>
          <select
            id="entity-type-filter"
            value={filters.entityType || 'all'}
            onChange={(e) => handleEntityTypeChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="venue">Venues</option>
            <option value="student_body">Student Bodies</option>
            <option value="stakeholder">Stakeholders</option>
          </select>
        </div>

        <div>
          <label htmlFor="status-filter" className="mb-2 block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="WAITING">Waiting</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="NEEDS_ACTION">Needs Action</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>
    </div>
  );
}
