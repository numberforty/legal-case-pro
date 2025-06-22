# Development Guidelines

## Overview

This document outlines the development standards, practices, and workflows for the Legal Case Pro application. Following these guidelines ensures code quality, maintainability, and consistency across the project.

## Code Standards

### TypeScript Best Practices

1. **Strong Typing**
   - Avoid using `any` type
   - Define interfaces and types for all data structures
   - Use generics for reusable components and functions
   - Leverage TypeScript's utility types (Pick, Omit, Partial, etc.)

   ```typescript
   // Good
   interface User {
     id: string;
     name: string;
     email: string;
     role: UserRole;
   }

   // Bad
   const user: any = { id: '123', name: 'John' };
   ```

2. **Type Assertions**
   - Use type assertions sparingly
   - Prefer type guards over assertions
   - Use the `as` syntax rather than angle-bracket syntax

   ```typescript
   // Good
   function isUser(obj: any): obj is User {
     return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
   }

   // If necessary
   const user = data as User;
   
   // Avoid
   const user = <User>data;
   ```

3. **Nullability**
   - Enable `strictNullChecks` in tsconfig
   - Use optional chaining (`?.`) and nullish coalescing (`??`)
   - Provide sensible defaults for nullable values

### React Guidelines

1. **Component Structure**
   - Use functional components with hooks
   - Follow single responsibility principle
   - Keep components focused and small
   - Extract complex logic to custom hooks

   ```tsx
   // Good
   function UserProfile({ userId }: { userId: string }) {
     const { user, isLoading, error } = useUser(userId);
     
     if (isLoading) return <LoadingSpinner />;
     if (error) return <ErrorDisplay error={error} />;
     if (!user) return <NotFound />;
     
     return (
       <div>
         <h1>{user.name}</h1>
         <UserDetails user={user} />
       </div>
     );
   }
   ```

2. **State Management**
   - Use `useState` for simple component state
   - Use `useReducer` for complex state logic
   - Use context API for shared state across components
   - Use Zustand for global application state

3. **Side Effects**
   - Use `useEffect` for side effects
   - Clean up effects when component unmounts
   - Be mindful of dependency arrays
   - Avoid nested effects

   ```tsx
   // Good
   useEffect(() => {
     const subscription = api.subscribe(id, handleDataChange);
     return () => api.unsubscribe(subscription);
   }, [id]);
   ```

4. **Performance Optimization**
   - Use `useMemo` for expensive computations
   - Use `useCallback` for functions passed to child components
   - Use `React.memo` for pure functional components
   - Use virtualization for long lists

### Tailwind CSS Guidelines

1. **Class Organization**
   - Group related classes
   - Order classes logically: layout → size → appearance → interactivity
   - Use `@apply` directive in component-specific CSS for repeated patterns

   ```tsx
   // Good class organization
   <div className="flex items-center p-4 mb-2 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow">
   ```

2. **Responsive Design**
   - Use Tailwind's responsive prefixes consistently
   - Mobile-first approach: design for small screens first
   - Test all breakpoints regularly

   ```tsx
   <div className="w-full md:w-2/3 lg:w-1/2 p-4 md:p-6 lg:p-8">
   ```

3. **Theme Extensions**
   - Extend theme in `tailwind.config.js` instead of one-off custom values
   - Reuse design tokens from theme
   - Define semantic color names

### Prisma & Database Guidelines

1. **Schema Design**
   - Use meaningful model and field names
   - Add comprehensive field comments in schema
   - Use appropriate field types and constraints
   - Design with performance in mind

   ```prisma
   model User {
     id          String   @id @default(uuid())
     email       String   @unique
     firstName   String
     lastName    String
     /// User role defines permissions
     role        Role     @default(USER)
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
     
     // Relations
     tasks       Task[]
   }
   ```

2. **Query Optimization**
   - Use `select` to retrieve only needed fields
   - Include relations only when necessary
   - Use transactions for multi-step operations
   - Consider pagination for large result sets

   ```typescript
   // Good
   const users = await prisma.user.findMany({
     select: {
       id: true,
       email: true,
       firstName: true,
       lastName: true,
     },
     take: 10,
     skip: (page - 1) * 10,
   });
   ```

## Naming Conventions

### General Guidelines

1. **Descriptive Names**
   - Use clear, descriptive names
   - Avoid abbreviations except common ones (id, src, etc.)
   - Name should describe purpose or intent

2. **Consistency**
   - Be consistent with similar elements
   - Maintain pattern throughout codebase
   - Follow established conventions from the tech stack

### Specific Conventions

| Item | Convention | Examples |
|------|------------|----------|
| Variables | camelCase | `userData`, `clientList` |
| Functions | camelCase | `fetchUsers()`, `validateEmail()` |
| React Components | PascalCase | `UserProfile`, `DocumentList` |
| React Hooks | camelCase with 'use' prefix | `useAuthState`, `useCaseData` |
| Classes | PascalCase | `ApiClient`, `DateFormatter` |
| Interfaces | PascalCase with 'I' prefix | `IUser`, `IApiResponse` |
| Type Aliases | PascalCase | `UserRole`, `ApiResponse` |
| Enums | PascalCase | `UserRole`, `DocumentStatus` |
| Constants | UPPER_SNAKE_CASE | `MAX_USERS`, `DEFAULT_TIMEOUT` |
| Files | kebab-case | `user-profile.tsx`, `auth-context.ts` |
| Folders | kebab-case | `components/`, `api-client/` |
| Database Models | PascalCase, singular | `User`, `Document` |
| Database Fields | camelCase | `firstName`, `dateCreated` |
| CSS Classes | kebab-case | `nav-item`, `sidebar-toggle` |

### File Naming and Organization

1. **React Components**
   - Match component name to file name
   - One component per file (except small helper components)
   - Group related components in folders

   ```
   components/
     users/
       UserProfile.tsx
       UserAvatar.tsx
       UserSettings.tsx
   ```

2. **Next.js Pages**
   - Follow Next.js routing conventions
   - Use index.tsx for main route pages
   - Use descriptive names for dynamic routes

   ```
   app/
     dashboard/
       page.tsx
     clients/
       page.tsx
       [clientId]/
         page.tsx
   ```

## Project Structure

```
legal-case-pro/
├── .github/
│   └── workflows/          # GitHub Actions
├── .next/                  # Next.js build output
├── documents/              # Project documentation
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js app router
│   ├── components/
│   │   ├── layout/         # Layout components
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utility functions
│   ├── stores/             # Zustand stores
│   └── types/              # TypeScript types
├── .env.example            # Example environment variables
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── jest.config.js          # Jest configuration
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## Git Workflow

### Branching Strategy

Following GitFlow branching model:

1. **main**: Production branch, always deployable
2. **develop**: Integration branch for features
3. **feature/name**: Feature branches
4. **bugfix/name**: Bug fix branches
5. **release/version**: Release preparation
6. **hotfix/name**: Production hotfixes

### Commit Messages

Follow Conventional Commits specification:

```
type(scope): subject

body

footer
```

Where `type` is one of:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Formatting, missing semi colons, etc (no code change)
- **refactor**: Code refactoring
- **test**: Adding tests
- **chore**: Updating build tasks, package manager configs, etc

Example:
```
feat(client): add client search functionality

- Add search input component
- Implement search API endpoint
- Add search results display

Resolves: #123
```

### Pull Request Process

1. Create feature branch from develop
2. Implement changes with tests
3. Submit PR to develop
4. Ensure CI passes
5. Get code review approval
6. Merge using squash and merge

## Code Review Guidelines

### What to Look For

1. **Functionality**: Does the code work as intended?
2. **Architecture**: Is the code well-structured?
3. **Readability**: Is the code easy to understand?
4. **Performance**: Are there any performance concerns?
5. **Security**: Are there any security vulnerabilities?
6. **Testing**: Is the code adequately tested?
7. **Documentation**: Is the code well-documented?

### Review Process

1. Reviewer comments on PR
2. Author addresses comments
3. Reviewer approves or requests changes
4. Continue until approved
5. Author merges PR

## Testing Standards

### Test Types

1. **Unit Tests**:
   - Test individual functions and components
   - Use Jest and React Testing Library
   - Aim for >80% test coverage

2. **Integration Tests**:
   - Test interactions between components
   - Test API endpoints
   - Focus on user workflows

3. **End-to-End Tests**:
   - Test complete application flows
   - Use Cypress or Playwright
   - Cover critical user journeys

### Test Guidelines

1. **Arrange-Act-Assert**:
   - Arrange: Set up test data and conditions
   - Act: Perform the action to test
   - Assert: Verify the result

2. **Mocking**:
   - Mock external dependencies
   - Use Jest mock functions
   - Mock API calls with MSW (Mock Service Worker)

3. **Test Naming**:
   - Descriptive test names that explain behavior
   - Follow pattern: `should <expected behavior> when <condition>`

   ```typescript
   test('should display error message when login fails', () => {
     // Test implementation
   });
   ```

## Accessibility Standards

1. **WCAG Compliance**:
   - Target WCAG 2.1 AA compliance
   - Regular accessibility audits
   - Use tools like Lighthouse, axe, etc.

2. **Implementation Guidelines**:
   - Semantic HTML elements
   - Proper ARIA attributes when needed
   - Keyboard navigation support
   - Focus management
   - Color contrast compliance
   - Screen reader testing

## Performance Guidelines

1. **Bundle Size**:
   - Monitor bundle size with tools
   - Lazy loading of routes and components
   - Code splitting for large dependencies
   - Tree shaking unused code

2. **Rendering Optimization**:
   - Avoid unnecessary re-renders
   - Use React.memo for pure components
   - Implement virtualization for long lists
   - Consider server components for data-heavy pages

3. **Network Optimization**:
   - API request batching
   - Data caching strategies
   - Implement Stale-While-Revalidate pattern
   - Optimize images and assets

## Documentation

1. **Code Documentation**:
   - Document complex functions and components
   - Use JSDoc comments for public APIs
   - Include examples for reusable components

   ```typescript
   /**
    * Formats a date in the user's preferred format
    * @param {Date} date - The date to format
    * @param {string} format - Optional format string
    * @returns {string} Formatted date string
    * @example
    * formatDate(new Date(), 'MM/DD/YYYY')
    */
   function formatDate(date: Date, format?: string): string {
     // Implementation
   }
   ```

2. **README Files**:
   - Main README with project overview
   - Component-specific READMEs for complex sections
   - Document folder structure and purpose

3. **Storybook**:
   - Document UI components with Storybook
   - Include different states and variations
   - Add usage examples and prop documentation

## Onboarding Process

1. **Initial Setup**:
   - Clone repository
   - Install dependencies
   - Set up environment variables
   - Run development server

2. **First Tasks**:
   - Start with small, well-defined tasks
   - Review existing code to understand patterns
   - Add tests for existing functionality
   - Document learnings

3. **Resources**:
   - Project documentation
   - Codebase tours
   - Architecture diagrams
   - Tech stack documentation
   - Team communication channels

## Continuous Improvement

1. **Refactoring**:
   - Regular refactoring sessions
   - Incremental improvements
   - Address technical debt systematically
   - Follow Boy Scout Rule: Leave code cleaner than you found it

2. **Knowledge Sharing**:
   - Regular tech talks or workshops
   - Pair programming sessions
   - Document learnings and decisions
   - Create coding guidelines as patterns emerge
