// src/components/SubmissionList.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { submissionsAPI } from '@/api/client';
import { formatDate, statusColors } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ChevronRight, Filter } from 'lucide-react';
import type { Submission } from '@/types';

interface SubmissionListProps {
  citizenId?: string;
  reviewerId?: string;
  organizationId?: string;
}

export function SubmissionList({ citizenId, reviewerId, organizationId }: SubmissionListProps) {
  const [filter, setFilter] = useState<'all' | 'drafted' | 'submitted' | 'resolved' | 'rejected'>('all');

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['submissions', citizenId, reviewerId, filter],
    queryFn: async () => {
      let result;
      if (citizenId) {
        result = await submissionsAPI.listByCitizen(citizenId, { 
          status: filter === 'all' ? undefined : filter 
        });
      } else if (reviewerId) {
        result = await submissionsAPI.listForReview(reviewerId, { 
          status: filter === 'all' ? undefined : filter 
        });
      } else {
        return [];
      }

      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!(citizenId || reviewerId),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No submissions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex gap-2 items-center mb-6">
        <Filter className="w-4 h-4 text-gray-600" />
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
        >
          All
        </button>
        {['drafted', 'submitted', 'resolved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-3 py-1 rounded-full text-sm capitalize ${
              filter === status ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Submissions Grid */}
      <div className="space-y-3">
        {submissions.map((submission: Submission) => (
          <Link
            key={submission.id}
            to={`/dashboard/submissions/${submission.id}`}
            className="block p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="text-sm text-gray-500">{submission.submission_number}</p>
                <h3 className="font-bold text-lg text-gray-900">{submission.title}</h3>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[submission.status] || 'bg-gray-100'}`}>
                {submission.status.replace(/_/g, ' ')}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{submission.description}</p>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{formatDate(submission.created_at)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
