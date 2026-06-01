// src/components/SubmissionDetail.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { submissionsAPI } from '@/api/client';
import { useRealtimeSubmissions } from '@/hooks/useAuth';
import { formatDateTime, statusColors } from '@/lib/utils';
import { toast } from 'sonner';
import { FileText, MessageSquare, Clock, CheckCircle } from 'lucide-react';

export function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Subscribe to real-time updates
  useRealtimeSubmissions(id);

  const { data: submission, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await submissionsAPI.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (newStatus: string) => submissionsAPI.updateStatus(id!, newStatus),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
      setSelectedStatus('');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    },
  });

  if (isLoading) {
    return <div className="py-8 text-center">Loading submission...</div>;
  }

  if (!submission) {
    return <div className="py-8 text-center">Submission not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500">{submission.submission_number}</p>
            <h1 className="text-3xl font-bold text-gray-900">{submission.title}</h1>
          </div>
          <span className={`text-sm font-semibold px-4 py-2 rounded-full ${statusColors[submission.status]}`}>
            {submission.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-medium">{formatDateTime(submission.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-500">Priority</p>
            <p className="font-medium capitalize">{submission.priority || 'Normal'}</p>
          </div>
          <div>
            <p className="text-gray-500">Last Updated</p>
            <p className="font-medium">{formatDateTime(submission.updated_at)}</p>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="grid grid-cols-2 gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Overview
            </h2>
            <p className="text-gray-600">{submission.description}</p>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Status Timeline
            </h2>
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Submitted</p>
                  <p className="text-sm text-gray-500">{formatDateTime(submission.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-4">Update Status</h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
            >
              <option value="">Select new status</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="under_review">Under Review</option>
              <option value="forwarded">Forwarded</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={() => selectedStatus && updateStatus(selectedStatus)}
              disabled={!selectedStatus || isUpdatingStatus}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments
            </h3>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
            />
            <button className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300">
              Add Comment
            </button>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-4">Attachments</h3>
            <p className="text-gray-500 text-sm">No attachments yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
