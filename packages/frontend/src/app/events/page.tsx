'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useEvents, EventFilters } from '@/hooks/useEvents';
import Link from 'next/link';

export default function EventsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState<EventFilters>({});

  const { data: events, isLoading: eventsLoading } = useEvents(filters);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'hackathon':
        return 'bg-purple-100 text-purple-800';
      case 'bootcamp':
        return 'bg-blue-100 text-blue-800';
      case 'networking':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <Link href="/dashboard" className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold">Idea Hub</h1>
              </Link>
              <div className="ml-6 flex space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Dashboard
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Events</h2>
            <p className="mt-2 text-gray-600">Manage your recruitment events</p>
          </div>
          <Link
            href="/events/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create Event
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">
                Event Type
              </label>
              <select
                id="type-filter"
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                <option value="hackathon">Hackathon</option>
                <option value="bootcamp">Bootcamp</option>
                <option value="networking">Networking</option>
              </select>
            </div>
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value || undefined })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Event List */}
        {eventsLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getEventTypeColor(event.type)}`}
                  >
                    {event.type}
                  </span>
                </div>
                <p className="mb-4 text-sm text-gray-600">{formatDate(event.date)}</p>
                {event.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-gray-700">{event.description}</p>
                )}
                {event.goals && event.goals.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-1 text-xs font-medium text-gray-500">Goals:</p>
                    <div className="flex flex-wrap gap-1">
                      {event.goals.slice(0, 3).map((goal, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                        >
                          {goal}
                        </span>
                      ))}
                      {event.goals.length > 3 && (
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                          +{event.goals.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between border-t pt-4 text-xs text-gray-500">
                  <span>{event.venues?.length || 0} venues</span>
                  <span>{event.tasks?.length || 0} tasks</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-600">No events found. Create your first event to get started!</p>
            <Link
              href="/events/new"
              className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create Event
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
