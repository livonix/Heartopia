# 🤝 Contributing to Heartopia Wiki

Thank you for your interest in contributing to Heartopia Wiki! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [🎯 Code of Conduct](#-code-of-conduct)
- [🚀 Getting Started](#-getting-started)
- [🛠️ Development Workflow](#️-development-workflow)
- [📝 Coding Standards](#-coding-standards)
- [🧪 Testing](#-testing)
- [📖 Documentation](#-documentation)
- [🐛 Bug Reports](#-bug-reports)
- [✨ Feature Requests](#-feature-requests)

## 🎯 Code of Conduct

### Our Pledge

We are committed to making participation in our project a harassment-free experience for everyone, regardless of:

- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, education, socioeconomic status, nationality
- Personal appearance, race, religion, or sexual identity and orientation

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission

### Enforcement

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned with this Code of Conduct.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- MySQL 8.x or higher
- Git
- Basic knowledge of TypeScript, React, and Node.js

### Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/wiki.git
   cd wiki
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/livonix/heartopia.git
   ```

3. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   
   # Edit with your configuration
   nano backend/.env
   ```

5. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   ```

## 🛠️ Development Workflow

### 1. Create a Branch

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Or a bugfix branch
git checkout -b fix/bug-description
```

### 2. Make Changes

- Follow the coding standards below
- Write tests for new functionality
- Update documentation as needed
- Keep commits small and focused

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Run tests
npm test

# Build the project
npm run build
```

### 4. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add user authentication system"

# Use conventional commits:
# feat: new feature
# fix: bug fix
# docs: documentation changes
# style: formatting changes
# refactor: code refactoring
# test: adding or updating tests
# chore: maintenance tasks
```

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## 📝 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Provide types for all functions and variables
- Use interfaces for object shapes
- Avoid `any` type when possible

```typescript
// Good
interface User {
  id: number;
  username: string;
  role: UserRole;
}

const getUser = async (id: number): Promise<User> => {
  // implementation
};

// Bad
const getUser = async (id: any): Promise<any> => {
  // implementation
};
```

### React Components

- Use functional components with hooks
- Follow React best practices
- Use proper TypeScript typing
- Keep components small and focused

```typescript
// Good
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};
```

### CSS/Styling

- Use Tailwind CSS classes
- Follow the utility-first approach
- Keep custom CSS to a minimum
- Use responsive design patterns

```typescript
// Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">

// Bad
<div className="custom-component">
```

### File Organization

- Group related files together
- Use descriptive file names
- Keep components in their own files
- Use barrel exports for clean imports

```
components/
├── admin/
│   ├── AdminDashboard.tsx
│   ├── WikiTab.tsx
│   └── UsersTab.tsx
├── common/
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── index.ts
└── layout/
    ├── Header.tsx
    └── Footer.tsx
```

## 🧪 Testing

### Unit Tests

- Write tests for all new functions
- Use Jest and React Testing Library
- Test both success and error cases
- Aim for 80%+ code coverage

```typescript
// Example test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button onClick={jest.fn()}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

- Test component interactions
- Test API endpoints
- Test user workflows
- Use realistic test data

### E2E Tests

- Test critical user journeys
- Use Playwright or Cypress
- Test on multiple browsers
- Include mobile testing

## 📖 Documentation

### Code Documentation

- Use JSDoc comments for public functions
- Document complex logic
- Include parameter and return types
- Add usage examples

```typescript
/**
 * Fetches user data from the API
 * @param userId - The ID of the user to fetch
 * @param options - Additional options for the request
 * @returns Promise resolving to user data
 * @throws {ApiError} When the user is not found
 * 
 * @example
 * ```typescript
 * const user = await getUser(123, { includeProfile: true });
 * console.log(user.username);
 * ```
 */
export const getUser = async (
  userId: number, 
  options?: GetUserOptions
): Promise<User> => {
  // implementation
};
```

### README Updates

- Update README.md for new features
- Include installation instructions
- Add configuration examples
- Document breaking changes

## 🐛 Bug Reports

### Before Creating a Bug Report

- Check existing issues for duplicates
- Try the latest version of the software
- Check if the bug is reproducible
- Gather necessary information

### Bug Report Template

```markdown
## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear description of what you expected to happen.

## Actual Behavior
A clear description of what actually happened.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- OS: [e.g. Windows 10, macOS 12.0]
- Browser: [e.g. Chrome 96, Firefox 95]
- Node.js version: [e.g. 18.2.0]
- App version: [e.g. 2.2.0]

## Additional Context
Add any other context about the problem here.
```

## ✨ Feature Requests

### Before Requesting a Feature

- Check if the feature already exists
- Check existing feature requests
- Consider if the feature fits the project goals
- Think about implementation complexity

### Feature Request Template

```markdown
## Feature Description
A clear and concise description of the feature you want to add.

## Problem Statement
What problem does this feature solve? Why is it needed?

## Proposed Solution
How do you envision this feature working?

## Alternatives Considered
What other approaches did you consider? Why did you choose this one?

## Additional Context
Add any other context, mockups, or examples about the feature request.
```

## 📞 Getting Help

- **Discord**: [Join our Discord server](https://discord.gg/heartopiafr)
- **GitHub Issues**: [Create an issue](https://github.com/livonix/heartopia/issues)
- **Email**: contact@heartopia.fr

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Heartopia Wiki! 🎉
