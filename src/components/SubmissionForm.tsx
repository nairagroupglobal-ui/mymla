// src/components/SubmissionForm.tsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submissionsAPI, categoriesAPI } from '@/api/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const submissionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  categoryId: z.string().min(1, 'Please select a category'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface SubmissionFormProps {
  organizationId: string;
  citizenId: string;
  onSuccess?: (submissionId: string) => void;
}

export function SubmissionForm({ organizationId, citizenId, onSuccess }: SubmissionFormProps) {
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await categoriesAPI.list();
      if (error) throw error;
      return data || [];
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { priority: 'normal' },
  });

  const { mutate: createSubmission, isPending } = useMutation({
    mutationFn: async (data: SubmissionFormData) => {
      const { data: submission, error } = await submissionsAPI.create({
        organization_id: organizationId,
        citizen_id: citizenId,
        category_id: data.categoryId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'drafted',
      });

      if (error) throw error;
      return submission;
    },
    onSuccess: (submission) => {
      toast.success('Submission saved as draft');
      reset();
      setAttachmentFile(null);
      onSuccess?.(submission.id);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create submission');
    },
  });

  const onSubmit = (data: SubmissionFormData) => {
    createSubmission(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          {...register('categoryId')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a category</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input
          type="text"
          {...register('title')}
          placeholder="Enter submission title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          {...register('description')}
          placeholder="Provide detailed description"
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
        <select {...register('priority')} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (Optional)</label>
        <input
          type="file"
          onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        {attachmentFile && <p className="text-sm text-gray-600 mt-1">Selected: {attachmentFile.name}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPending ? 'Saving...' : 'Save as Draft'}
      </button>
    </form>
  );
}
