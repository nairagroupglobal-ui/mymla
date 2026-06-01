// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const statusColors: Record<string, string> = {
  drafted: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  acknowledged: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  forwarded: 'bg-purple-100 text-purple-800',
  awaiting_response: 'bg-orange-100 text-orange-800',
  scheduled: 'bg-green-100 text-green-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800',
};

export const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone: string): boolean {
  const re = /^\+?[\d\s\-()]{10,}$/;
  return re.test(phone);
}

// Export key URLs for public pages
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  HOW_IT_WORKS: '/how-it-works',
  FAQ: '/faq',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  AUTH_LOGIN: '/auth/login',
  AUTH_SIGNUP: '/auth/signup',
  AUTH_RESET: '/auth/reset-password',
  DASHBOARD: '/dashboard',
  DASHBOARD_SUBMISSIONS: '/dashboard/submissions',
  SUBMISSION_NEW: '/dashboard/submissions/new',
  SUBMISSION_VIEW: '/dashboard/submissions/:id',
  OFFICE_DASHBOARD: '/office/dashboard',
  OFFICE_INBOX: '/office/inbox',
  OFFICE_REVIEW: '/office/review',
  ADMIN_USERS: '/admin/users',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_ANALYTICS: '/admin/analytics',
};

// Mock testimonials for public site
export const TESTIMONIALS = [
  {
    name: 'Raj Kumar',
    role: 'Citizen',
    content: 'This platform made it incredibly easy to file a petition with my MLA. The status tracking is amazing!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj',
  },
  {
    name: 'Anjali Singh',
    role: 'MLA Office Staff',
    content: 'The workflow system has reduced our response time significantly. Our citizens appreciate the transparency.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
  },
  {
    name: 'Vikram Patel',
    role: 'Department Head',
    content: 'Integration with our existing systems was smooth. The real-time updates keep everyone informed.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
  },
];

// FAQ entries
export const FAQ_ITEMS = [
  {
    category: 'Getting Started',
    items: [
      {
        question: 'How do I create an account?',
        answer: 'Click on "Sign Up" and provide your email and password. You can also sign up with Google.',
      },
      {
        question: 'What documents do I need to submit a petition?',
        answer: 'Most petitions require a title, description, and supporting documents. Specific requirements vary by category.',
      },
    ],
  },
  {
    category: 'Submissions',
    items: [
      {
        question: 'How long does it take to get a response?',
        answer: 'Response times vary by submission type and MLA office. Most are acknowledged within 48 hours.',
      },
      {
        question: 'Can I track my submission status?',
        answer: 'Yes! You can track your submission in real-time from your dashboard.',
      },
    ],
  },
];
