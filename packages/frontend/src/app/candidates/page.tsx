'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CandidatesPage() {
  const [searchCriteria, setSearchCriteria] = useState({
    skills: '',
    platform: 'all',
    experienceLevel: 'all',
  });

  const [candidates] = useState([
    {
      id: '1',
      name: 'Sarah Chen',
      skills: ['React', 'TypeScript', 'Node.js', 'Python'],
      experienceLevel: 'Senior',
      platforms: ['GitHub', 'Kaggle'],
      relevanceScore: 95,
      notableProjects: ['Open source ML library', 'React component framework'],
    },
    {
      id: '2',
      name: 'Alex Kumar',
      skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
      experienceLevel: 'Mid-level',
      platforms: ['GitHub'],
      relevanceScore: 88,
      notableProjects: ['Microservices architecture', 'CI/CD pipeline'],
    },
    {
      id: '3',
      name: 'Maria Garcia',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'],
      experienceLevel: 'Senior',
      platforms: ['Kaggle', 'GitHub'],
      relevanceScore: 92,
      notableProjects: ['Kaggle competition winner', 'ML research papers'],
    },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching candidates:', searchCriteria);
    alert('Candidate sourcing will be connected to backend');
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

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Source Candidates</h2>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills
                </label>
                <input
                  type="text"
                  id="skills"
                  value={searchCriteria.skills}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, skills: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., React, Python, AWS"
                />
              </div>

              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  id="platform"
                  value={searchCriteria.platform}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Platforms</option>
                  <option value="github">GitHub</option>
                  <option value="kaggle">Kaggle</option>
                  <option value="forums">Tech Forums</option>
                </select>
              </div>

              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  id="experienceLevel"
                  value={searchCriteria.experienceLevel}
                  onChange={(e) =>
                    setSearchCriteria({ ...searchCriteria, experienceLevel: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-level</option>
                  <option value="senior">Senior</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search Candidates
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">{candidate.experienceLevel} Developer</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {candidate.relevanceScore}%
                    </div>
                    <p className="text-xs text-gray-600">Relevance Score</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Platforms:</p>
                  <div className="flex gap-2">
                    {candidate.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Notable Projects:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {candidate.notableProjects.map((project, idx) => (
                      <li key={idx}>{project}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                    View Profile
                  </button>
                  <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                    Save to Pool
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
