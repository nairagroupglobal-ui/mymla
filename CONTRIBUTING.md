# Contributing to MLA.com

Thank you for your interest in contributing to MLA.com! This guide will help you get started.

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.

## How to Contribute

### Reporting Bugs

1. Check existing [issues](https://github.com/yourusername/mla.com/issues)
2. Provide:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment info (OS, Node version, etc.)

### Suggesting Enhancements

1. Describe the enhancement and use case
2. Explain why this would be useful
3. List any alternative solutions you've considered

### Pull Requests

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open Pull Request with:
   - Clear title and description
   - Reference to related issues (#123)
   - Screenshots/videos if UI changes

## Development Guidelines

### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mla.com.git
cd mla.com

# Add upstream
git remote add upstream https://github.com/original/mla.com.git

# Install dependencies
npm install

# Create development branch
git checkout -b feature/your-feature
```

### Code Style

- **TypeScript**: Use strict mode, add types
- **Components**: Functional components with hooks
- **Naming**: camelCase for files/variables, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic
- **Imports**: Organize by external, internal, types

Example:
```typescript
import React from 'react';
import { cn } from '@/lib/utils';
import type { ComponentProps } from '@/types';

interface MyComponentProps {
  title: string;
  onSubmit: (data: any) => void;
}

/**
 * MyComponent - Displays user interface
 * @param props - Component props
 */
export function MyComponent({ title, onSubmit }: MyComponentProps) {
  return <div className={cn('p-4')}>{title}</div>;
}
```

### Commit Messages

Use clear, descriptive messages:
```
feat: Add user submission form
fix: Resolve authentication token expiry
docs: Update API documentation
style: Format code with Prettier
refactor: Simplify notification logic
test: Add tests for submission validation
```

### Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- submitForm.test.ts
```

### Linting and Type Checking

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

### Building

```bash
# Development build
npm run build

# Preview production build
npm run preview

# Check build size
npm run build --analyze
```

## Project Structure

```
src/
├── api/           # API client and endpoints
├── components/    # Reusable React components
├── hooks/         # Custom React hooks
├── lib/           # Utilities, helpers, constants
├── pages/         # Page components (routes)
├── styles/        # Global CSS and themes
├── types/         # TypeScript type definitions
└── App.tsx        # Main app component
```

## Adding New Features

### Example: Add Notification Badge

1. **Create component**:
```typescript
// src/components/NotificationBadge.tsx
interface NotificationBadgeProps {
  count: number;
  onClick?: () => void;
}

export function NotificationBadge({ count, onClick }: NotificationBadgeProps) {
  return (
    <button onClick={onClick} className="relative">
      <Bell className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
```

2. **Add tests**:
```typescript
// src/components/NotificationBadge.test.ts
import { render, screen } from '@testing-library/react';
import { NotificationBadge } from './NotificationBadge';

describe('NotificationBadge', () => {
  it('renders count when > 0', () => {
    render(<NotificationBadge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows 9+ when count > 9', () => {
    render(<NotificationBadge count={15} />);
    expect(screen.getByText('9+')).toBeInTheDocument();
  });
});
```

3. **Use in app**:
```typescript
// src/pages/Home.tsx
import { NotificationBadge } from '@/components/NotificationBadge';

function Home() {
  const { notifications } = useNotifications(user?.id);
  return <NotificationBadge count={notifications.length} />;
}
```

## Updating Database Schema

For database changes:

1. Create migration file in `supabase/migrations/`:
```sql
-- supabase/migrations/003_add_feature.sql
CREATE TABLE new_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- other columns...
);

-- Add RLS policies
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
```

2. Test locally:
```bash
supabase migration up
```

3. Commit migration with feature

## Performance Considerations

- Use React.memo for expensive components
- Implement proper caching with TanStack Query
- Lazy load routes with React.lazy
- Optimize images and assets
- Monitor bundle size

## Accessibility (a11y)

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation
- Maintain color contrast (WCAG AA)
- Test with screen readers

Example:
```typescript
<button
  aria-label="Close dialog"
  onClick={handleClose}
  className="p-2 hover:bg-gray-100"
>
  <X className="w-6 h-6" />
</button>
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for functions
- Document complex logic
- Update SETUP.md for setup changes
- Add examples for new features

## Review Process

1. GitHub Actions runs automated checks
2. Code review by maintainers
3. Feedback incorporated
4. Merged after approval

## Release Process

- Version bumps follow Semantic Versioning
- Changelog updated with all changes
- Release notes prepared
- Tagged and released

## Getting Help

- Ask in [GitHub Discussions](https://github.com/yourusername/mla.com/discussions)
- Check [documentation](README.md)
- Review existing issues and PRs
- Contact maintainers directly if needed

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Git Guide](https://git-scm.com/doc)

## Legal

By submitting a pull request, you agree that your contributions will be licensed under the same license as the project (MIT).

---

Thank you for contributing! 🎉

**Last Updated**: 2024
