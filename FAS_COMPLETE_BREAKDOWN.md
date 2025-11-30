# VendHub Showcase - Complete FAS (Feature Acceptance Specification) Task Breakdown
## All Phases with AI Agent Instructions & Cloud Code Guidelines

**Document Version**: 1.0  
**Last Updated**: November 30, 2025  
**Status**: Ready for Cloud Code Implementation  
**Total Phases**: 4  
**Total Features**: 35+  

---

## 📋 Document Structure

This document contains:
1. **Complete FAS List** - All features for Phases 1-4
2. **AI Agent Instructions** - How to use specialized agents for each feature
3. **Cloud Code Guidelines** - Instructions for Cloud Code team
4. **Ready-Made Solutions** - References to existing implementations in VendHub repo
5. **System Modification Agent** - How to apply the comprehensive system modifier
6. **Integration Patterns** - How to integrate with existing VendHub codebase

---

## 🤖 AI Agent System Overview

The VendHub project uses a specialized AI agent system for different aspects of development:

### Available Agents

#### 1. **vendhub-dev-architect** (Primary Agent)
**Purpose**: Full-stack development, architecture planning, implementation  
**Expertise**: NestJS, TypeORM, PostgreSQL, React, TypeScript  
**Responsibilities**:
- Analyzing existing codebase structure
- Planning new features according to sprint requirements
- Implementing backend NestJS modules
- Creating database migrations with up/down methods
- Developing frontend React components
- Ensuring compliance with REQ-* requirements
- Reviewing code for adherence to VendHub standards

**When to Use**:
- Implementing new backend modules
- Creating database migrations
- Developing complex features
- Reviewing architectural decisions
- Planning feature implementations

**Example Usage**:
```
"I need to implement task priority system with assignment notifications.
Use the vendhub-dev-architect agent to plan and implement this feature
following VendHub patterns and REQ-TASK-* requirements."
```

#### 2. **vendhub-auth-security** (Security Specialist)
**Purpose**: Authentication, authorization, security best practices  
**Expertise**: JWT, OAuth, bcrypt, RBAC, security patterns  
**Responsibilities**:
- Implementing authentication systems
- Setting up role-based access control
- Security code review
- Vulnerability assessment
- Security best practices implementation

**When to Use**:
- Implementing user authentication
- Setting up authorization rules
- Security reviews
- Implementing security features

#### 3. **vendhub-database-expert** (Database Specialist)
**Purpose**: Database design, migrations, optimization  
**Expertise**: PostgreSQL, TypeORM, database architecture  
**Responsibilities**:
- Database schema design
- Migration creation
- Performance optimization
- Data integrity checks
- Index optimization

**When to Use**:
- Designing database schemas
- Creating complex migrations
- Performance optimization
- Database refactoring

#### 4. **vendhub-frontend-specialist** (Frontend Expert)
**Purpose**: React components, UI/UX, frontend architecture  
**Expertise**: React, TypeScript, Next.js, UI patterns  
**Responsibilities**:
- Component development
- UI/UX implementation
- Frontend state management
- Performance optimization
- Accessibility compliance

**When to Use**:
- Developing React components
- Implementing complex UI features
- Frontend optimization
- UI/UX improvements

#### 5. **vendhub-telegram-bot** (Bot Specialist)
**Purpose**: Telegram bot development and integration  
**Expertise**: Telegram API, bot patterns, user interactions  
**Responsibilities**:
- Bot command implementation
- Keyboard and inline button design
- User interaction flows
- Bot integration with backend

**When to Use**:
- Implementing Telegram bot features
- Creating bot commands
- Bot integration tasks

#### 6. **vendhub-tester** (QA Specialist)
**Purpose**: Testing strategy, test implementation, quality assurance  
**Expertise**: Jest, Supertest, Playwright, E2E testing  
**Responsibilities**:
- Unit test implementation
- Integration test creation
- E2E test development
- Test coverage analysis
- Quality metrics

**When to Use**:
- Writing tests for features
- Test coverage analysis
- Quality assurance
- Testing strategy planning

---

## 🔧 System Modification Agent (Comprehensive Modifier)

**Purpose**: Apply systematic improvements across the entire codebase  
**Scope**: Architecture, code quality, standards compliance, refactoring  

### How to Use the System Modifier

The system modification agent should be applied to:
1. Ensure all code follows VendHub standards from `.claude/rules.md`
2. Apply architectural principles (manual operations, photo validation, 3-level inventory)
3. Standardize naming conventions across all modules
4. Ensure proper error handling and validation
5. Apply security best practices
6. Standardize test coverage and patterns

### Application Process

```
1. ANALYZE CURRENT STATE
   - Review existing code structure
   - Identify deviations from standards
   - List areas needing modification

2. PLAN MODIFICATIONS
   - Create systematic change plan
   - Identify dependencies
   - Plan rollout order

3. APPLY MODIFICATIONS
   - Update code to standards
   - Refactor for consistency
   - Apply best practices

4. VERIFY COMPLIANCE
   - Check all standards are met
   - Run tests
   - Verify no regressions
```

### Key Standards to Apply

From `.claude/rules.md`:
- ✅ Manual operations architecture (NO direct machine connectivity)
- ✅ Mandatory photo validation for task completions
- ✅ 3-level inventory system (Warehouse → Operator → Machine)
- ✅ Tasks as central mechanism for all operations
- ✅ Proper security practices (bcrypt salt >= 10, JWT lifetimes)
- ✅ File naming conventions (kebab-case for files, PascalCase for classes)
- ✅ Validation on all inputs
- ✅ JSDoc comments on public methods
- ✅ Swagger/OpenAPI documentation on controllers
- ✅ Proper error handling and logging

---

## 📋 Phase 1: Foundation & Core Features

### Phase 1 Overview
**Duration**: Week 1  
**Focus**: Task priority system and basic assignment  
**Story Points**: 60  
**Tasks**: 20  

**Status**: ✅ COMPLETED (See PHASE_1_TASK_BREAKDOWN.md for details)

### Phase 1 Features
1. ✅ Task Priority Levels (Urgent/High/Medium/Low)
2. ✅ Priority Filtering & Sorting
3. ✅ Operator Assignment System
4. ✅ Operator Workload Display
5. ✅ Task Creation with Priority & Assignment

**Deliverables**:
- Priority badge component
- Task card updates with priority display
- Filter and sort UI
- Operator assignment dropdown
- API endpoints for tasks and operators
- Mock data for development
- Unit and integration tests

**AI Agent to Use**: `vendhub-dev-architect`

**Cloud Code Instructions**:
```
1. Import PHASE_1_TASK_BREAKDOWN.md into your project management tool
2. Use PHASE_1_TASKS.json for programmatic task creation
3. Assign tasks to team members based on PHASE_1_TASK_BREAKDOWN.md resource allocation
4. Follow the daily breakdown (Day 1-5) for sprint planning
5. Use the acceptance criteria for code review
6. Reference PHASE_1_TASKS_EXPORT.csv for Jira/Azure DevOps import
```

---

## 📋 Phase 2: Notifications & Real-Time Updates

### Phase 2 Overview
**Duration**: Week 2  
**Focus**: Comprehensive notification system  
**Story Points**: 45  
**Tasks**: 15  

### Phase 2 Features

#### 2.1 Assignment Notifications
- [ ] Real-time task assignment notifications
- [ ] Toast notifications with task details
- [ ] In-app notification bell with badge
- [ ] Notification center with history
- [ ] Mark as read/unread functionality
- [ ] Bulk notification management

**AI Agent**: `vendhub-dev-architect` + `vendhub-frontend-specialist`  
**Backend Tasks**:
- Create notifications table in database
- Implement notification service
- Create notification API endpoints
- Implement WebSocket for real-time updates
- Add email notification service

**Frontend Tasks**:
- Build notification center component
- Create notification item component
- Implement notification badge
- Add real-time notification listener
- Create notification preferences UI

**Ready-Made Solutions** (from VendHub repo):
- Check `backend/src/modules/notifications/` for existing patterns
- Review `telegram-bot/src/handlers/` for notification patterns
- Look at `frontend/components/` for notification UI patterns

#### 2.2 Notification Preferences
- [ ] In-app notification toggle
- [ ] Email notification toggle
- [ ] SMS notification toggle (optional)
- [ ] Quiet hours configuration
- [ ] Filter by priority level
- [ ] Filter by task type
- [ ] Notification history/archive

**AI Agent**: `vendhub-frontend-specialist`  
**Tasks**:
- Create settings page for notifications
- Implement preference storage
- Add notification rule engine
- Create preference UI components

#### 2.3 Priority-Based Notifications
- [ ] Urgent tasks trigger immediate notification
- [ ] High priority tasks get visual emphasis
- [ ] Sound alert for urgent assignments
- [ ] Desktop notifications for urgent tasks
- [ ] Escalation notifications for overdue tasks
- [ ] Different notification styling per priority

**AI Agent**: `vendhub-dev-architect`  
**Tasks**:
- Implement notification priority rules
- Create escalation logic
- Add sound/desktop notification support
- Implement notification styling system

### Phase 2 Deliverables
- Notification service with full CRUD
- Notification API endpoints
- WebSocket implementation for real-time updates
- Notification center UI component
- Notification preferences component
- Email notification service
- Comprehensive notification tests

**Estimated Hours**: 80-100 hours  
**Team**: 2 Backend + 2 Frontend developers

---

## 📋 Phase 3: Advanced Features & Analytics

### Phase 3 Overview
**Duration**: Week 3  
**Focus**: Advanced filtering, search, analytics, and reporting  
**Story Points**: 50  
**Tasks**: 18  

### Phase 3 Features

#### 3.1 Advanced Filtering & Search
- [ ] Multi-criteria filtering (status, priority, assignee, type, machine, date)
- [ ] Search by title, description, machine, operator
- [ ] Case-insensitive search with partial matching
- [ ] Search suggestions/autocomplete
- [ ] Save filter presets
- [ ] Quick filter buttons
- [ ] Filter persistence during session

**AI Agent**: `vendhub-frontend-specialist`  
**Backend Tasks**:
- Implement advanced search API
- Create filter query builder
- Add search indexing (optional)

**Frontend Tasks**:
- Build filter UI components
- Implement search input with suggestions
- Create filter preset manager
- Add filter state management

#### 3.2 Task History & Audit Trail
- [ ] View complete task history
- [ ] Track all status changes with timestamps
- [ ] Track priority changes with reason
- [ ] Track reassignments with reason
- [ ] Show comments and notes
- [ ] Show who made each change
- [ ] Sortable history
- [ ] Export task history

**AI Agent**: `vendhub-dev-architect`  
**Tasks**:
- Create audit log table
- Implement history tracking service
- Create history API endpoints
- Build history UI component
- Implement export functionality

#### 3.3 Dashboard & Analytics
- [ ] Tasks overview dashboard
- [ ] Tasks by status metrics
- [ ] Tasks by priority metrics
- [ ] Overdue tasks tracking
- [ ] Completion rate statistics
- [ ] Average completion time
- [ ] Operator performance metrics
- [ ] Charts and visualizations

**AI Agent**: `vendhub-frontend-specialist`  
**Tasks**:
- Design dashboard layout
- Create metric cards
- Implement charts (Recharts, Chart.js)
- Create analytics API endpoints
- Build performance reports

#### 3.4 Export & Reporting
- [ ] Export tasks to Excel
- [ ] Export tasks to PDF
- [ ] Export history to Excel
- [ ] Generate performance reports
- [ ] Scheduled report generation
- [ ] Email report delivery

**AI Agent**: `vendhub-dev-architect`  
**Tasks**:
- Implement Excel export service
- Implement PDF export service
- Create report templates
- Implement scheduled report generation
- Add email delivery service

### Phase 3 Deliverables
- Advanced search and filter system
- Task history and audit trail
- Dashboard with analytics
- Export and reporting system
- Performance metrics and charts
- Comprehensive analytics tests

**Estimated Hours**: 90-110 hours  
**Team**: 2 Backend + 2 Frontend developers

---

## 📋 Phase 4: Mobile Optimization & Deployment

### Phase 4 Overview
**Duration**: Week 4  
**Focus**: Mobile responsiveness, performance optimization, deployment  
**Story Points**: 40  
**Tasks**: 12  

### Phase 4 Features

#### 4.1 Mobile Optimization
- [ ] Single column layout on mobile
- [ ] Touch-friendly task cards
- [ ] Simplified filter interface
- [ ] Swipe gestures for status changes
- [ ] Collapsible task details
- [ ] Mobile-optimized kanban (horizontal scroll)
- [ ] Bottom sheet for task creation
- [ ] Responsive navigation

**AI Agent**: `vendhub-frontend-specialist`  
**Tasks**:
- Review responsive design
- Optimize for touch interactions
- Implement mobile-specific UI patterns
- Test on various devices
- Optimize performance for mobile

#### 4.2 Performance Optimization
- [ ] Code splitting and lazy loading
- [ ] Image optimization
- [ ] Bundle size reduction
- [ ] Database query optimization
- [ ] Caching strategies
- [ ] CDN integration
- [ ] Performance monitoring

**AI Agent**: `vendhub-dev-architect`  
**Tasks**:
- Profile application performance
- Identify bottlenecks
- Implement optimization strategies
- Add performance monitoring
- Create performance benchmarks

#### 4.3 Accessibility Compliance
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast verification
- [ ] ARIA labels and descriptions
- [ ] Focus management
- [ ] Accessibility testing

**AI Agent**: `vendhub-frontend-specialist`  
**Tasks**:
- Audit for accessibility issues
- Implement ARIA labels
- Add keyboard navigation
- Test with screen readers
- Create accessibility test suite

#### 4.4 Deployment & DevOps
- [ ] Docker containerization
- [ ] Kubernetes deployment (optional)
- [ ] CI/CD pipeline setup
- [ ] Database migration scripts
- [ ] Environment configuration
- [ ] Health checks and monitoring
- [ ] Backup and recovery procedures

**AI Agent**: DevOps specialist (external)  
**Tasks**:
- Create Dockerfile
- Set up CI/CD workflows
- Configure deployment automation
- Implement health checks
- Set up monitoring and alerting

### Phase 4 Deliverables
- Mobile-optimized interface
- Performance optimizations
- Accessibility compliance
- Deployment automation
- Monitoring and alerting
- Documentation

**Estimated Hours**: 70-90 hours  
**Team**: 1 Backend + 2 Frontend + 1 DevOps

---

## 🔗 Integration with VendHub Repository

### Existing Solutions to Reuse

The VendHub repository contains ready-made solutions for many features:

#### Backend Patterns
```
VendHub/backend/src/modules/
├── auth/                    # Authentication patterns
├── users/                   # User management
├── machines/                # Machine management
├── tasks/                   # Task management (CORE)
├── inventory/               # Inventory system
├── nomenclature/            # Product catalog
└── notifications/           # Notification patterns
```

**How to Use**:
1. Review existing implementations
2. Adapt patterns for vendhub-showcase
3. Maintain consistency with VendHub standards
4. Reference for database schema design

#### Frontend Patterns
```
VendHub/frontend/components/
├── tasks/                   # Task components
├── machines/                # Machine components
├── inventory/               # Inventory components
├── common/                  # Reusable components
└── layouts/                 # Layout components
```

**How to Use**:
1. Review component structure
2. Adapt React patterns
3. Use similar styling approach
4. Maintain component naming conventions

#### Database Schemas
```
VendHub/backend/src/database/
├── entities/
│   ├── task.entity.ts       # Task schema
│   ├── machine.entity.ts    # Machine schema
│   ├── user.entity.ts       # User schema
│   └── ...
└── migrations/
    ├── *.migration.ts       # Migration examples
```

**How to Use**:
1. Reference for schema design
2. Adapt migration patterns
3. Ensure compatibility with VendHub standards
4. Follow naming conventions

### Copying Ready-Made Solutions

**Process**:
1. Identify feature in VendHub repo
2. Copy relevant code files
3. Adapt to vendhub-showcase context
4. Update imports and dependencies
5. Test thoroughly
6. Document changes

**Example**:
```bash
# Copy task service pattern
cp VendHub/backend/src/modules/tasks/services/task.service.ts \
   vendhub-showcase/backend/src/services/task.service.ts

# Adapt imports and class names
# Update database entities
# Test with new schema
```

---

## 📝 Cloud Code Implementation Guidelines

### For Cloud Code Team

#### 1. Project Setup
```
1. Clone vendhub-showcase repository
2. Install dependencies: pnpm install
3. Set up environment variables
4. Run database migrations
5. Seed initial data
6. Start development server
```

#### 2. Task Assignment Workflow
```
1. Read PHASE_1_TASK_BREAKDOWN.md (or relevant phase)
2. Import tasks into your project management tool
3. Assign tasks to developers
4. Follow daily breakdown for sprint planning
5. Use acceptance criteria for code review
```

#### 3. AI Agent Usage
```
For each task:
1. Identify which AI agent to use (see agent list above)
2. Provide task description and requirements
3. Reference relevant phase documentation
4. Request implementation with tests
5. Review generated code
6. Request modifications if needed
```

#### 4. Code Review Checklist
```
Before merging any PR:
1. ✅ Follows VendHub naming conventions
2. ✅ Includes proper error handling
3. ✅ Has unit tests (>80% coverage)
4. ✅ Has integration tests
5. ✅ Includes JSDoc comments
6. ✅ Includes Swagger/OpenAPI docs
7. ✅ No console.log statements
8. ✅ No any types in TypeScript
9. ✅ Passes linting
10. ✅ Passes type checking
```

#### 5. Documentation Requirements
```
For each feature:
1. Create README in feature directory
2. Document API endpoints (Swagger)
3. Document database schema
4. Document component props (React)
5. Create usage examples
6. Document configuration options
```

#### 6. Testing Requirements
```
For each feature:
1. Unit tests for services/utilities
2. Integration tests for API endpoints
3. E2E tests for critical flows
4. Test coverage > 80%
5. All edge cases covered
6. Error scenarios tested
```

#### 7. Git Workflow
```
1. Create feature branch: git checkout -b feature/task-name
2. Make changes following standards
3. Commit with proper message format:
   feat(module): description
   
   Detailed explanation of changes.
   
   Closes #123
4. Push to remote
5. Create PR with description
6. Request review
7. Merge after approval
```

#### 8. Deployment Process
```
1. Ensure all tests pass
2. Create checkpoint/tag
3. Build production bundle
4. Run pre-deployment checks
5. Deploy to staging
6. Run smoke tests
7. Deploy to production
8. Monitor for errors
```

---

## 📊 Complete FAS Summary Table

| Phase | Feature | Status | Tasks | Hours | AI Agent | Priority |
|-------|---------|--------|-------|-------|----------|----------|
| 1 | Priority System | ✅ Done | 6 | 17 | dev-architect | Critical |
| 1 | Assignment System | ✅ Done | 6 | 18 | dev-architect | Critical |
| 1 | Backend Integration | ✅ Done | 4 | 11 | dev-architect | Critical |
| 1 | Testing & QA | ✅ Done | 3 | 7 | tester | Critical |
| 2 | Assignment Notifications | ⏳ Pending | 6 | 20 | dev-architect | High |
| 2 | Notification Preferences | ⏳ Pending | 4 | 15 | frontend-specialist | High |
| 2 | Priority Notifications | ⏳ Pending | 3 | 12 | dev-architect | High |
| 2 | Notification Testing | ⏳ Pending | 2 | 8 | tester | High |
| 3 | Advanced Filtering | ⏳ Pending | 4 | 18 | frontend-specialist | Medium |
| 3 | Task History | ⏳ Pending | 4 | 16 | dev-architect | Medium |
| 3 | Dashboard & Analytics | ⏳ Pending | 5 | 22 | frontend-specialist | Medium |
| 3 | Export & Reporting | ⏳ Pending | 3 | 14 | dev-architect | Medium |
| 3 | Analytics Testing | ⏳ Pending | 2 | 8 | tester | Medium |
| 4 | Mobile Optimization | ⏳ Pending | 4 | 18 | frontend-specialist | Medium |
| 4 | Performance Optimization | ⏳ Pending | 3 | 15 | dev-architect | Medium |
| 4 | Accessibility | ⏳ Pending | 3 | 14 | frontend-specialist | Medium |
| 4 | Deployment & DevOps | ⏳ Pending | 2 | 12 | devops | Low |

**Total**: 60+ tasks, 300+ hours, 4 weeks

---

## 🎯 Success Criteria

### Phase 1 (Completed)
- ✅ All priority levels implemented
- ✅ Filtering and sorting working
- ✅ Assignment system functional
- ✅ API endpoints created
- ✅ Tests passing (>80% coverage)

### Phase 2 (In Progress)
- [ ] Real-time notifications working
- [ ] Notification center implemented
- [ ] Preferences system functional
- [ ] Email notifications sending
- [ ] Notification tests passing

### Phase 3 (Upcoming)
- [ ] Advanced search working
- [ ] Task history complete
- [ ] Dashboard with analytics
- [ ] Export functionality working
- [ ] Performance metrics tracked

### Phase 4 (Upcoming)
- [ ] Mobile responsive design
- [ ] Performance optimized
- [ ] Accessibility compliant
- [ ] Deployment automated
- [ ] Monitoring active

---

## 📚 Reference Documents

### In This Repository
- `PHASE_1_TASK_BREAKDOWN.md` - Detailed Phase 1 tasks
- `PHASE_1_TASKS.json` - JSON format for programmatic import
- `PHASE_1_TASKS_EXPORT.csv` - CSV for Jira/Azure DevOps
- `TASKS_PAGE_REQUIREMENTS.md` - Detailed requirements
- `README.md` - Project overview

### In VendHub Repository
- `.claude/rules.md` - Development standards
- `.claude/agents/` - AI agent instructions
- `.claude/phase-1-mvp-checklist.md` - MVP checklist
- `.claude/testing-guide.md` - Testing guidelines
- `.claude/deployment-guide.md` - Deployment guide
- `docs/architecture/` - Architecture documentation
- `docs/dictionaries/` - System dictionaries

---

## 🚀 Getting Started

### For Cloud Code Team

1. **Read This Document** (you are here)
2. **Review PHASE_1_TASK_BREAKDOWN.md** - Understand completed work
3. **Check VendHub/.claude/rules.md** - Learn development standards
4. **Import tasks** from PHASE_1_TASKS.json or PHASE_1_TASKS_EXPORT.csv
5. **Start Phase 2** - Use AI agents for implementation
6. **Follow guidelines** - Reference this document throughout

### For AI Agents

1. **Use vendhub-dev-architect** for backend/full-stack features
2. **Use vendhub-frontend-specialist** for UI/UX features
3. **Use vendhub-tester** for test implementation
4. **Apply system modifier** for code quality improvements
5. **Reference VendHub patterns** for consistency

### For Project Managers

1. **Use PHASE_1_TASKS.json** for task creation
2. **Follow daily breakdown** for sprint planning
3. **Track progress** against acceptance criteria
4. **Manage dependencies** between tasks
5. **Allocate resources** based on estimates

---

## 📞 Support & Questions

### If You Need Help

1. **Architecture Questions**: Reference `.claude/rules.md` and VendHub patterns
2. **Implementation Questions**: Check VendHub repository for examples
3. **Testing Questions**: Review `.claude/testing-guide.md`
4. **Deployment Questions**: Check `.claude/deployment-guide.md`
5. **Code Review**: Use checklist in Cloud Code Guidelines section

---

## ✅ Sign-Off

**Document Status**: Ready for Implementation  
**Last Updated**: November 30, 2025  
**Version**: 1.0.0  
**Approved By**: AI System Architect  

**Next Steps**:
1. ✅ Phase 1 complete and deployed
2. ⏳ Phase 2 ready to start
3. ⏳ Phase 3 planned
4. ⏳ Phase 4 planned

---

**End of Document**

---

## Appendix A: Quick Reference - AI Agent Selection

| Task Type | Primary Agent | Secondary Agent |
|-----------|---------------|-----------------|
| Backend Service | dev-architect | database-expert |
| API Endpoint | dev-architect | auth-security |
| Database Migration | database-expert | dev-architect |
| React Component | frontend-specialist | dev-architect |
| Authentication | auth-security | dev-architect |
| Testing | tester | dev-architect |
| Telegram Bot | telegram-bot | dev-architect |
| Performance | dev-architect | frontend-specialist |
| Security Review | auth-security | dev-architect |
| Deployment | DevOps (external) | dev-architect |

## Appendix B: File Structure for Cloud Code

```
vendhub-showcase/
├── .claude/                          # Claude Code rules
│   ├── rules.md                      # Development standards
│   ├── agents/                       # AI agent instructions
│   └── templates/                    # Code templates
├── client/                           # Frontend (React)
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   ├── components/              # Reusable components
│   │   ├── hooks/                   # Custom hooks
│   │   └── lib/                     # Utilities
│   └── package.json
├── server/                           # Backend (Node.js)
│   ├── src/
│   │   ├── modules/                 # Feature modules
│   │   ├── common/                  # Common utilities
│   │   └── config/                  # Configuration
│   └── package.json
├── docs/                             # Documentation
│   ├── PHASE_1_TASK_BREAKDOWN.md
│   ├── PHASE_1_TASKS.json
│   ├── TASKS_PAGE_REQUIREMENTS.md
│   └── FAS_COMPLETE_BREAKDOWN.md    # This file
├── README.md
└── package.json
```

## Appendix C: Environment Setup for Cloud Code

```bash
# 1. Clone repository
git clone https://github.com/jamsmac/vendhub-showcase.git
cd vendhub-showcase

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Start development server
pnpm dev

# 5. Run tests
pnpm test

# 6. Run linting
pnpm lint

# 7. Type check
pnpm type-check
```

## Appendix D: Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>

Types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only
- style: Changes that don't affect code meaning
- refactor: Code change that neither fixes bug nor adds feature
- perf: Code change that improves performance
- test: Adding or updating tests
- chore: Changes to build process or dependencies

Scope: Module or component affected
Subject: Brief description (imperative mood)
Body: Detailed explanation (optional)
Footer: Issue reference (Closes #123)

Example:
feat(tasks): add priority system with filtering

Implemented 4-level priority system (Urgent/High/Medium/Low)
with color coding and filtering capabilities.
Added priority badges to task cards and implemented
multi-select filtering UI.

Closes #45
```
