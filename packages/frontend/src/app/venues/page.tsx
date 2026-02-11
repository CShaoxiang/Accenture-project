'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VenuesPage() {
  const [searchCriteria, setSearchCriteria] = useState({
    location: '',
    minCapacity: '',
    maxCapacity: '',
    minRating: '',
  });

  const [venues] = useState([
    {
      id: '1',
      name: 'Tech Hub Convention Center',
      location: 'San Francisco, CA',
      capacity: 500,
      rating: 4.5,
      amenities: ['WiFi', 'Projector', 'Catering', 'Parking'],
      status: 'Available',
    },
    {
      id: '2',
      name: 'Innovation Space',
      location: 'Austin, TX',
      capacity: 300,
      rating: 4.8,
      amenities: ['WiFi', 'Whiteboard', 'Kitchen', 'Parking'],
      status: 'Available',
    },
    {
      id: '3',
      name: 'Startup Campus',
      location: 'Seattle, WA',
      capacity: 200,
      rating: 4.3,
      amenities: ['WiFi', 'Projector', 'Breakout Rooms'],
      status: 'Requested',
    },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching venues:', searchCriteria);
    alert('Search functionality will be connected to backend');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Idea Hub
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              ← Back to Dashboard
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Venues</h2>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={searchCriteria.location}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City, State"
                />
              </div>

              <div>
                <label htmlFor="minCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Capacity
                </label>
                <input
                  type="number"
                  id="minCapacity"
                  value={searchCriteria.minCapacity}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, minCapacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
              </div>

              <div>
                <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Capacity
                </label>
                <input
                  type="number"
                  id="maxCapacity"
                  value={searchCriteria.maxCapacity}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, maxCapacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="500"
                />
              </div>

              <div>
                <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rating
                </label>
                <select
                  id="minRating"
                  value={searchCriteria.minRating}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, minRating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search Venues
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div key={venue.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      venue.status === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {venue.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>📍 {venue.location}</p>
                  <p>👥 Capacity: {venue.capacity}</p>
                  <p>⭐ Rating: {venue.rating}/5</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Amenities:</p>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
