import { EntityStatusBreakdown } from '@/hooks/useDashboard';

interface EntityBreakdownProps {
  data: EntityStatusBreakdown;
}

export default function EntityBreakdown({ data }: EntityBreakdownProps) {
  const entities = [
    { name: 'Venues', data: data.venues },
    { name: 'Student Bodies', data: data.studentBodies },
    { name: 'Stakeholders', data: data.stakeholders },
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-semibold">Entity Status Breakdown</h3>
      <div className="space-y-6">
        {entities.map((entity) => {
          const total = Object.values(entity.data).reduce((sum, val) => sum + val, 0);

          return (
            <div key={entity.name}>
              <h4 className="mb-2 font-medium text-gray-700">{entity.name}</h4>
              <div className="grid grid-cols-5 gap-2">
                <div className="rounded bg-blue-50 p-2 text-center">
                  <p className="text-xs text-gray-600">Requested</p>
                  <p className="text-lg font-semibold text-blue-700">{entity.data.requested}</p>
                </div>
                <div className="rounded bg-yellow-50 p-2 text-center">
                  <p className="text-xs text-gray-600">Waiting</p>
                  <p className="text-lg font-semibold text-yellow-700">{entity.data.waiting}</p>
                </div>
                <div className="rounded bg-green-50 p-2 text-center">
                  <p className="text-xs text-gray-600">Confirmed</p>
                  <p className="text-lg font-semibold text-green-700">{entity.data.confirmed}</p>
                </div>
                <div className="rounded bg-orange-50 p-2 text-center">
                  <p className="text-xs text-gray-600">Needs Action</p>
                  <p className="text-lg font-semibold text-orange-700">
                    {entity.data.needsAction}
                  </p>
                </div>
                <div className="rounded bg-red-50 p-2 text-center">
                  <p className="text-xs text-gray-600">Rejected</p>
                  <p className="text-lg font-semibold text-red-700">{entity.data.rejected}</p>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">Total: {total}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
