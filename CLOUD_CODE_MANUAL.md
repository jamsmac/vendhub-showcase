# Cloud Code Implementation Manual
## VendHub Showcase - Complete Implementation Guide

**Document Version**: 1.0  
**Target Audience**: Cloud Code Development Team  
**Last Updated**: November 30, 2025  
**Status**: Ready for Handoff  

---

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Development Environment Setup](#development-environment-setup)
4. [Task Management & Workflow](#task-management--workflow)
5. [AI Agent Integration](#ai-agent-integration)
6. [Code Standards & Guidelines](#code-standards--guidelines)
7. [Testing Requirements](#testing-requirements)
8. [Deployment Process](#deployment-process)
9. [Troubleshooting](#troubleshooting)
10. [Reference Materials](#reference-materials)

---

## 🚀 Quick Start

### For Immediate Start (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/jamsmac/vendhub-showcase.git
cd vendhub-showcase

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev

# 4. Open browser
open http://localhost:3000
```

### First Task (30 minutes)

1. Read `FAS_COMPLETE_BREAKDOWN.md` (Phase 2 section)
2. Import `PHASE_1_TASKS.json` into your project management tool
3. Read `PHASE_1_TASK_BREAKDOWN.md` to understand completed work
4. Review `.claude/rules.md` from VendHub repository
5. Pick first Phase 2 task and start implementation

---

## 📋 Project Overview

### What is VendHub Showcase?

VendHub Showcase is a **vending machine management system** built with:
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Node.js (Manus webdev platform)
- **Database**: PostgreSQL (via Manus)
- **Maps**: Google Maps integration
- **Drag & Drop**: @dnd-kit for kanban boards

### Current Status

**Phase 1**: ✅ COMPLETE
- Task priority system (Urgent/High/Medium/Low)
- Operator assignment system
- Kanban board with drag & drop
- Machines page with table and map view
- Products page with CRUD operations
- Machine detail page with service history
- History filtering by operation type
- Date range filtering
- Visual indicators and statistics

**Phase 2**: ⏳ READY TO START
- Assignment notifications
- Notification center
- Priority-based alerts
- Notification preferences

**Phase 3**: 📅 PLANNED
- Advanced filtering & search
- Task history & audit trail
- Dashboard & analytics
- Export & reporting

**Phase 4**: 📅 PLANNED
- Mobile optimization
- Performance optimization
- Accessibility compliance
- Deployment automation

### Key Features

| Feature | Status | Location |
|---------|--------|----------|
| Machines Page | ✅ Complete | `/machines` |
| Machine Detail | ✅ Complete | `/machines/:id` |
| Tasks Page | ✅ Complete | `/tasks` |
| Products Page | ✅ Complete | `/products` |
| Service History | ✅ Complete | `/machines/:id` |
| Kanban Board | ✅ Complete | `/tasks` |
| Map View | ✅ Complete | `/machines` |
| Notifications | ⏳ Phase 2 | TBD |
| Analytics | ⏳ Phase 3 | TBD |

---

## 🔧 Development Environment Setup

### Prerequisites

- Node.js 22.13.0 or higher
- pnpm 9.0.0 or higher
- Git
- GitHub CLI (gh)
- Docker (optional, for database)

### Step 1: Clone Repository

```bash
# Using GitHub CLI
gh repo clone jamsmac/vendhub-showcase

# Or using git
git clone https://github.com/jamsmac/vendhub-showcase.git
cd vendhub-showcase
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm list
```

### Step 3: Environment Configuration

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your settings
# Required variables:
# - VITE_APP_TITLE=VendHub Manager
# - VITE_APP_LOGO=/logo.png
# - Database connection string (if needed)
```

### Step 4: Start Development Server

```bash
# Start dev server (runs on http://localhost:3000)
pnpm dev

# In another terminal, you can run:
pnpm lint      # Check code style
pnpm type-check # TypeScript type checking
pnpm test      # Run tests
```

### Step 5: Verify Setup

1. Open http://localhost:3000 in browser
2. You should see VendHub Manager dashboard
3. Navigate through pages:
   - `/machines` - Machines list
   - `/tasks` - Kanban board
   - `/products` - Products list
   - `/machines/1` - Machine detail

---

## 📊 Task Management & Workflow

### Understanding the Task Structure

All tasks are defined in three formats:

1. **Markdown** (`PHASE_1_TASK_BREAKDOWN.md`)
   - Human-readable format
   - Detailed descriptions and acceptance criteria
   - Best for understanding requirements

2. **JSON** (`PHASE_1_TASKS.json`)
   - Programmatic format
   - Suitable for API imports
   - Contains all metadata

3. **CSV** (`PHASE_1_TASKS_EXPORT.csv`)
   - Spreadsheet format
   - Import into Jira, Azure DevOps, etc.
   - Standard project management tools

### Importing Tasks into Your Tool

#### For Jira

```bash
# 1. Go to Jira project
# 2. Click "Create" → "Import"
# 3. Upload PHASE_1_TASKS_EXPORT.csv
# 4. Map fields to your Jira fields
# 5. Click "Import"
```

#### For Azure DevOps

```bash
# 1. Open Azure DevOps project
# 2. Go to Boards → Backlog
# 3. Click "Import work items"
# 4. Upload PHASE_1_TASKS.json
# 5. Configure field mappings
# 6. Click "Import"
```

#### For GitHub Projects

```bash
# 1. Create GitHub Project
# 2. Add items manually from PHASE_1_TASK_BREAKDOWN.md
# Or use GitHub API to create issues programmatically
```

### Task Workflow

```
1. BACKLOG → READY
   - Task is defined and accepted
   - Acceptance criteria clear
   - Dependencies identified

2. READY → IN PROGRESS
   - Developer starts work
   - Creates feature branch
   - Implements feature

3. IN PROGRESS → CODE REVIEW
   - Developer creates PR
   - Requests review
   - Provides test results

4. CODE REVIEW → TESTING
   - Reviewer approves changes
   - QA runs tests
   - Verifies acceptance criteria

5. TESTING → DONE
   - All tests pass
   - Acceptance criteria met
   - PR merged to main
```

### Daily Standup Template

```
What I did yesterday:
- [ ] Task TASK-101: Implemented priority badge component
- [ ] Task TASK-102: Added priority filtering

What I'm doing today:
- [ ] Task TASK-103: Create priority filter UI
- [ ] Task TASK-104: Implement filter state management

Blockers:
- [ ] Waiting for API endpoint from backend team
```

---

## 🤖 AI Agent Integration

### Available AI Agents

The VendHub project uses specialized AI agents for different tasks:

#### 1. vendhub-dev-architect
**Best for**: Backend, full-stack, architecture decisions

```
"I need to implement task assignment notifications.
Use vendhub-dev-architect to:
1. Design database schema for notifications
2. Create notification service
3. Implement API endpoints
4. Create tests
Following VendHub patterns and REQ-TASK-* requirements."
```

#### 2. vendhub-frontend-specialist
**Best for**: React components, UI/UX, frontend features

```
"I need to build the notification center UI.
Use vendhub-frontend-specialist to:
1. Design notification center component
2. Create notification item component
3. Implement real-time updates
4. Add styling with Tailwind CSS
Following VendHub frontend patterns."
```

#### 3. vendhub-database-expert
**Best for**: Database design, migrations, optimization

```
"I need to design the notifications table.
Use vendhub-database-expert to:
1. Design database schema
2. Create migration with up/down
3. Add indexes for performance
4. Create seed data
Following VendHub database patterns."
```

#### 4. vendhub-tester
**Best for**: Testing, QA, test coverage

```
"I need to write tests for notifications.
Use vendhub-tester to:
1. Write unit tests for service
2. Write integration tests for API
3. Write E2E tests for UI
4. Ensure >80% coverage
Following VendHub testing standards."
```

#### 5. vendhub-auth-security
**Best for**: Authentication, authorization, security

```
"I need to implement notification permissions.
Use vendhub-auth-security to:
1. Design permission model
2. Implement authorization checks
3. Add security validations
4. Review for vulnerabilities
Following VendHub security standards."
```

### How to Use AI Agents

#### Step 1: Identify the Task
```
Task: Implement notification system for task assignments
Phase: Phase 2
Type: Full-stack feature
```

#### Step 2: Choose Primary Agent
```
Primary: vendhub-dev-architect (full-stack)
Secondary: vendhub-frontend-specialist (UI)
Tertiary: vendhub-tester (tests)
```

#### Step 3: Prepare Requirements
```
- Feature description
- Acceptance criteria
- Related tasks
- Dependencies
- Reference materials
```

#### Step 4: Request Implementation
```
"Implement task assignment notifications using vendhub-dev-architect:

Requirements:
- Real-time notifications when task assigned
- Toast notification with task details
- Notification center with history
- Mark as read/unread
- Email notifications

Acceptance Criteria:
- [ ] Notifications sent within 2 seconds
- [ ] Notification center displays all notifications
- [ ] Mark as read works correctly
- [ ] Email notifications sent
- [ ] Tests >80% coverage

Reference:
- See PHASE_2_REQUIREMENTS.md
- Check VendHub/backend/src/modules/notifications/
- Follow .claude/rules.md standards"
```

#### Step 5: Review & Iterate
```
1. Review generated code
2. Check against acceptance criteria
3. Request modifications if needed
4. Approve and merge
```

---

## 📝 Code Standards & Guidelines

### File Naming Conventions

```typescript
// Backend files: kebab-case
user.service.ts
task.controller.ts
machine.entity.ts
notification.dto.ts

// Frontend files: PascalCase for components
TaskList.tsx
NotificationCenter.tsx
MachineDetail.tsx

// Utilities: camelCase
useAuth.ts
formatDate.ts
calculateDistance.ts

// Constants: UPPER_SNAKE_CASE
MAX_FILE_SIZE = 5_000_000
DEFAULT_TIMEOUT = 30000
```

### Class & Function Naming

```typescript
// Classes: PascalCase
class UserService {}
class TaskController {}
class MachineEntity {}

// Methods: camelCase
async createTask() {}
async getUserById() {}
getUsersWithMachines() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3
const DEFAULT_PAGE_SIZE = 20
```

### Code Organization

```typescript
// Backend service structure
export class TaskService {
  constructor(private taskRepository: Repository<Task>) {}

  // Public methods first
  async createTask(dto: CreateTaskDto): Promise<Task> {}
  async getTaskById(id: string): Promise<Task> {}
  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {}
  async deleteTask(id: string): Promise<void> {}

  // Private helper methods
  private validateTaskData(dto: CreateTaskDto): void {}
  private calculatePriority(type: string): Priority {}
}
```

### TypeScript Best Practices

```typescript
// ✅ DO: Use proper types
interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

// ❌ DON'T: Use any type
const user: any = { name: 'John' }

// ✅ DO: Use union types
type TaskStatus = 'pending' | 'in-progress' | 'completed'

// ✅ DO: Use generics
function getById<T>(id: string): Promise<T> {}

// ❌ DON'T: Use implicit any
function process(data) {} // Error: Parameter 'data' implicitly has an 'any' type
```

### React Component Patterns

```typescript
// ✅ DO: Functional components with hooks
interface TaskListProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick }) => {
  const [filter, setFilter] = useState<TaskStatus>('pending')
  
  const filteredTasks = tasks.filter(t => t.status === filter)
  
  return (
    <div className="task-list">
      {filteredTasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={() => onTaskClick(task)}
        />
      ))}
    </div>
  )
}

// ❌ DON'T: Class components (unless necessary)
class TaskList extends React.Component {}

// ❌ DON'T: Inline functions in render
<button onClick={() => handleClick(task)}>Click</button>

// ✅ DO: Extract to named function
const handleTaskClick = useCallback((task: Task) => {
  // Handle click
}, [])
```

### Error Handling

```typescript
// ✅ DO: Proper error handling
async function getUser(id: string): Promise<User> {
  try {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new NotFoundException(`User ${id} not found`)
    }
    return user
  } catch (error) {
    logger.error('Failed to get user', { id, error })
    throw error
  }
}

// ❌ DON'T: Ignore errors
async function getUser(id: string): Promise<User> {
  const user = await userRepository.findById(id)
  return user // What if user is null?
}

// ❌ DON'T: Generic error messages
throw new Error('Error')

// ✅ DO: Specific error messages
throw new NotFoundException(`User with id ${id} not found`)
```

### Comments & Documentation

```typescript
// ✅ DO: JSDoc comments on public methods
/**
 * Create a new task
 * @param dto - Task creation data
 * @returns Created task
 * @throws BadRequestException if data is invalid
 */
async createTask(dto: CreateTaskDto): Promise<Task> {}

// ✅ DO: Explain why, not what
// We need to fetch user separately because the API doesn't support
// nested user data in the task response
const user = await userService.getUserById(task.userId)

// ❌ DON'T: Obvious comments
// Get the task
const task = await taskService.getTaskById(id)

// ❌ DON'T: Outdated comments
// This is a temporary fix (written 2 years ago)
const workaround = true
```

---

## 🧪 Testing Requirements

### Test Coverage Goals

- **Unit Tests**: >80% coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows

### Unit Test Example

```typescript
// task.service.spec.ts
describe('TaskService', () => {
  let service: TaskService
  let repository: Repository<Task>

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as any
    service = new TaskService(repository)
  })

  describe('createTask', () => {
    it('should create a task with valid data', async () => {
      const dto: CreateTaskDto = {
        title: 'Test Task',
        priority: 'high',
      }
      const expected: Task = { id: '1', ...dto }

      jest.spyOn(repository, 'save').mockResolvedValue(expected)

      const result = await service.createTask(dto)

      expect(result).toEqual(expected)
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(dto))
    })

    it('should throw error for invalid priority', async () => {
      const dto: CreateTaskDto = {
        title: 'Test Task',
        priority: 'invalid' as any,
      }

      await expect(service.createTask(dto)).rejects.toThrow(BadRequestException)
    })
  })
})
```

### Integration Test Example

```typescript
// task.controller.spec.ts
describe('TaskController', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [TaskService, { provide: TaskRepository, useValue: mockRepository }],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  describe('POST /tasks', () => {
    it('should create a task', async () => {
      const dto: CreateTaskDto = {
        title: 'Test Task',
        priority: 'high',
      }

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(dto)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.title).toBe(dto.title)
    })
  })
})
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run specific test file
pnpm test task.service.spec.ts

# Run tests matching pattern
pnpm test --testNamePattern="createTask"
```

---

## 🚀 Deployment Process

### Pre-Deployment Checklist

```bash
# 1. Run all tests
pnpm test

# 2. Check code quality
pnpm lint

# 3. Type checking
pnpm type-check

# 4. Build
pnpm build

# 5. Run production build locally
pnpm preview
```

### Deployment Steps

```bash
# 1. Create feature branch
git checkout -b feature/task-notifications

# 2. Make changes and commit
git add .
git commit -m "feat(tasks): add notification system"

# 3. Push to remote
git push origin feature/task-notifications

# 4. Create Pull Request
# - Go to GitHub
# - Click "New Pull Request"
# - Select your branch
# - Fill in description
# - Request review

# 5. After approval, merge
git checkout main
git pull origin main
git merge feature/task-notifications
git push origin main

# 6. Create release tag
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

### Monitoring After Deployment

```bash
# Check application logs
pnpm logs

# Monitor performance
pnpm monitor

# Check error rates
pnpm errors

# View metrics
pnpm metrics
```

---

## 🆘 Troubleshooting

### Common Issues

#### Issue: Dependencies not installing

```bash
# Solution 1: Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Solution 2: Update pnpm
pnpm install -g pnpm@latest
pnpm install
```

#### Issue: Port 3000 already in use

```bash
# Solution 1: Use different port
pnpm dev -- --port 3001

# Solution 2: Kill process on port 3000
lsof -ti:3000 | xargs kill -9
pnpm dev
```

#### Issue: TypeScript errors

```bash
# Solution 1: Clear build cache
rm -rf dist .next
pnpm build

# Solution 2: Update TypeScript
pnpm update typescript

# Solution 3: Check tsconfig.json
cat tsconfig.json
```

#### Issue: Tests failing

```bash
# Solution 1: Clear test cache
pnpm test -- --clearCache

# Solution 2: Run tests in serial
pnpm test -- --runInBand

# Solution 3: Check test environment
pnpm test -- --verbose
```

### Getting Help

1. **Check documentation**: Read relevant markdown files
2. **Search issues**: Check GitHub issues for similar problems
3. **Review logs**: Check application and error logs
4. **Ask team**: Post in team Slack/Discord
5. **Reference materials**: Check VendHub repository

---

## 📚 Reference Materials

### In This Repository

- `README.md` - Project overview
- `PHASE_1_TASK_BREAKDOWN.md` - Completed Phase 1 tasks
- `PHASE_1_TASKS.json` - Tasks in JSON format
- `PHASE_1_TASKS_EXPORT.csv` - Tasks in CSV format
- `TASKS_PAGE_REQUIREMENTS.md` - Detailed requirements
- `FAS_COMPLETE_BREAKDOWN.md` - All phases and features

### In VendHub Repository

Clone VendHub for reference implementations:

```bash
git clone https://github.com/jamsmac/VendHub.git
```

Key files:
- `.claude/rules.md` - Development standards
- `.claude/agents/` - AI agent instructions
- `.claude/testing-guide.md` - Testing guidelines
- `backend/src/modules/` - Backend patterns
- `frontend/components/` - Frontend patterns

### External Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Jest Testing Documentation](https://jestjs.io/docs/getting-started)
- [Playwright E2E Testing](https://playwright.dev/)

---

## ✅ Onboarding Checklist

Complete these steps to get fully onboarded:

- [ ] Read this document (CLOUD_CODE_MANUAL.md)
- [ ] Clone repository and run `pnpm install`
- [ ] Start dev server with `pnpm dev`
- [ ] Navigate through all pages in browser
- [ ] Read `PHASE_1_TASK_BREAKDOWN.md`
- [ ] Review `.claude/rules.md` from VendHub
- [ ] Set up your IDE with TypeScript support
- [ ] Create your first feature branch
- [ ] Pick first Phase 2 task
- [ ] Request AI agent for implementation
- [ ] Create pull request
- [ ] Get code review
- [ ] Merge to main

---

## 📞 Contact & Support

### Team Channels
- **Slack**: #vendhub-development
- **Discord**: VendHub Dev Server
- **GitHub**: Issues and Discussions

### Key Contacts
- **Project Lead**: [Name]
- **Tech Lead**: [Name]
- **QA Lead**: [Name]

### Office Hours
- **Daily Standup**: 10:00 AM UTC
- **Tech Discussion**: 2:00 PM UTC (Wed)
- **Code Review**: 4:00 PM UTC (Fri)

---

## 📝 Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 30, 2025 | Initial version |

---

**Last Updated**: November 30, 2025  
**Status**: Ready for Use  
**Next Review**: December 15, 2025  

---

**Welcome to the VendHub Showcase development team! 🚀**
