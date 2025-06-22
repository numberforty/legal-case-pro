# Component Hierarchy

## Overview

Legal Case Pro follows a modular component architecture to promote reusability, maintainability, and separation of concerns. This document outlines the component structure and relationships within the application.

## Top-Level Structure

```
App (Root)
├── AuthProvider
│   └── LanguageProvider
│       ├── Public Routes (Login)
│       └── Protected Routes (Dashboard, Clients, Cases, etc.)
```

## Layout Components

The application uses a consistent layout structure for authenticated sections:

```
Layout
├── Sidebar
├── Header
│   └── LanguageToggle
└── Content Area
```

### Layout Component

`components/layout/Layout.tsx` - Provides the main application layout structure for authenticated pages.

**Props:**
- `children`: React nodes to render in the content area
- `title`: Page title displayed in header
- `subtitle`: Optional page subtitle
- `headerActions`: Optional actions to display in the header

### Sidebar Component

`components/layout/Sidebar.tsx` - Navigation sidebar with collapsible menu.

**Props:**
- `isOpen`: Boolean indicating if sidebar is expanded
- `onToggle`: Function to toggle sidebar state

**Features:**
- Collapsible design (expands/collapses)
- Visual indicators for active section
- Icon and label display
- Animated transitions

### Header Component

`components/layout/Header.tsx` - Application header with title and actions.

**Props:**
- `title`: Main header title
- `subtitle`: Optional subtitle text
- `onMenuToggle`: Function to toggle sidebar
- `children`: Optional action buttons

## Page Components

Each major application section has its own page component structure:

### Dashboard

```
DashboardPage
├── StatCards
├── RecentActivity
├── UpcomingDeadlines
└── RevenueChart
```

### Clients

```
ClientsPage
├── ClientsList
│   └── ClientListItem
├── ClientFilters
└── ClientActionButtons
```

```
ClientDetailsPage
├── ClientHeader
├── ClientInfo
├── ClientCases
└── ClientDocuments
```

### Cases

```
CasesPage
├── CasesList
│   └── CaseListItem
├── CaseFilters
└── CaseActionButtons
```

```
CaseDetailsPage
├── CaseHeader
├── CaseInfo
├── CaseTabs
│   ├── DetailsTab
│   ├── DocumentsTab
│   ├── TasksTab
│   └── TimeEntriesTab
└── CaseActionButtons
```

### Documents

```
DocumentsPage
├── DocumentsList
│   └── DocumentListItem
├── DocumentFilters
└── DocumentUploadButton
```

### Time Tracking

```
TimeTrackingPage
├── TimeEntryForm
├── TimeEntriesList
│   └── TimeEntryItem
└── TimeReports
```

## Authentication Components

```
LoginPage
└── LoginButton
```

```
ProtectedRoute
└── Conditional Child Components
```

## Shared UI Components

The `components/ui` directory contains reusable UI elements:

- `Button` - Standardized button styles
- `Card` - Container with consistent styling
- `Input` - Form input fields
- `Select` - Dropdown selection
- `Checkbox` - Toggle selection
- `Modal` - Dialog overlays
- `Table` - Data table with sorting and pagination
- `Tabs` - Tabbed interface
- `Badge` - Status indicators
- `Toast` - Notification system

## Component Communication Patterns

1. **Props Passing**: Traditional parent-to-child communication
   
2. **Context API**: For globally shared state:
   - `AuthContext`: Authentication state
   - `LanguageContext`: Localization settings

3. **Zustand Stores**: For complex state management:
   - `useClientStore`: Client data management
   - `useCaseStore`: Case data management
   - `useDocumentStore`: Document data management
   - `useUIStore`: UI state (modals, notifications)

4. **Custom Hooks**: For reusable logic:
   - `useAuth`: Authentication operations
   - `useLanguage`: Localization functions
   - `usePagination`: Pagination logic
   - `useForm`: Form handling
   - `useAPI`: API request handling

## Component Design Principles

1. **Single Responsibility**: Components focus on doing one thing well
   
2. **Reusability**: Components are designed for reuse across the application
   
3. **Composability**: Smaller components combine to create complex UI
   
4. **Isolation**: Components can be tested and developed in isolation
   
5. **Consistency**: Common styling and behavior patterns

## Common Component Patterns

### Data Fetching Pattern

```tsx
const ComponentWithData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getData();
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorDisplay message={error} />;
  if (!data) return null;
  
  return <DataDisplay data={data} />;
};
```

### Form Component Pattern

```tsx
const FormComponent = () => {
  const [formData, setFormData] = useState({ field1: '', field2: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiClient.submitData(formData);
      // Success handling
    } catch (err) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

## Sidebar Implementation Issue

Currently, there's an issue with the sidebar not being displayed properly in the application UI. The issue appears to be related to how the Layout component is integrated with pages.

### Issue Details

The `Layout` component from `src/components/layout/Layout.tsx` contains a properly implemented sidebar component, but the main application pages (dashboard, clients, etc.) may not be using this Layout component consistently.

### Current Implementation

Dashboard and other pages implement their own header and navigation without using the shared Layout component, creating an inconsistent UI where the sidebar is not shown properly.

### Recommended Solution

Ensure all protected route pages use the Layout component wrapper:

```tsx
// Example correct implementation
import Layout from '@/components/layout/Layout';

export default function DashboardPage() {
  return (
    <Layout title="Dashboard" subtitle="Your summary and analytics">
      {/* Dashboard content */}
    </Layout>
  );
}
```

All protected pages should follow this pattern to ensure consistent sidebar presentation.
