# VendHub Manager - TODO List

## Phase 1: Telegram Bot Integration
- [x] Install telegram bot SDK (node-telegram-bot-api or telegraf)
- [x] Create Telegram bot service in server
- [x] Set up webhook endpoint for bot messages
- [x] Implement /start command (registration request)
- [x] Implement /status command (user status check)
- [x] Implement /help command
- [x] Create access request approval flow in admin panel
- [ ] Add Telegram ID linking to user profiles

## Phase 2: Russian UI & Navigation
- [ ] Update all UI text to Russian
- [ ] Implement collapsible sidebar (240px / 64px modes)
- [ ] Add Command Palette (⌘K) component
- [ ] Create header with notifications bell
- [ ] Implement user menu dropdown
- [ ] Add favorites section to sidebar
- [ ] Create breadcrumb navigation

## Phase 3: Core Modules - Operations
- [ ] Machines list page with filters
- [ ] Machine detail card with real-time status
- [ ] Machine map view (already exists, update UI)
- [ ] Tasks kanban board
- [ ] Tasks calendar view
- [ ] Equipment components registry
- [ ] Locations management
- [ ] QR scanner page

## Phase 4: Core Modules - Inventory & Finance
- [ ] Inventory 3-level view (already exists, update UI)
- [ ] Products/Ingredients catalog
- [ ] Recipes builder with cost calculator
- [ ] Purchases/Procurement module
- [ ] Transactions list
- [ ] Counterparties (suppliers/clients)
- [ ] Contracts management
- [ ] Commissions settings

## Phase 5: Core Modules - Analytics & Team
- [ ] Sales analytics dashboard
- [ ] Inventory analytics
- [ ] Efficiency reports
- [ ] Report builder
- [ ] Incidents tracking
- [ ] Users management (already exists, update UI)
- [ ] Access requests approval
- [ ] Complaints module

## Phase 6: System & Settings
- [ ] System settings page
- [ ] Telegram bot configuration panel
- [ ] Notification preferences
- [ ] Role permissions editor
- [ ] Audit logs viewer
- [ ] Backup/restore functionality

## Phase 6.5: Notification System
- [ ] Set up email notification service (SMTP/SendGrid)
- [ ] Create notification templates (Telegram + Email)
- [ ] Implement notification triggers for key events
- [ ] Add notification preferences to user settings
- [ ] Test notification delivery for all scenarios

## Phase 7: GitHub Repository
- [ ] Initialize new repo at https://github.com/jamsmac/VHM24
- [ ] Create README with setup instructions
- [ ] Add .env.example with all required variables
- [ ] Configure GitHub Actions for CI/CD
- [ ] Push initial code
- [ ] Create deployment documentation

## New Features - Access Requests
- [x] Add search bar to filter access requests by name or Telegram ID
- [x] Add bulk selection with checkboxes for mass approve/reject actions
- [x] Add role dropdown to change user role before approving request
- [x] Add bulk role assignment for multiple selected requests
- [x] Add admin comments field to access requests for internal notes
- [x] Integrate SMTP service (Nodemailer) for email notifications
- [x] Create email templates for access request approval/rejection
- [x] Send email notifications when requests are approved or rejected
- [x] Add email configuration to environment variables
- [x] Add email field to access_requests database schema
- [x] Create unit tests for email service

## New Features - Audit Log System
- [x] Create access_request_audit_logs database table
- [x] Add database operations for logging approval/rejection actions
- [x] Create tRPC API endpoint for fetching audit logs
- [x] Build audit log UI component with timeline view
- [x] Integrate audit log display into access requests page
- [x] Add unit tests for audit log functionality

## New Features - Dashboard Widget
- [x] Create RecentAdminActions component
- [x] Integrate widget into main dashboard
- [x] Display last 5 audit log entries with action badges
- [x] Add link to full audit log page

## New Features - Date Range Filtering
- [x] Install react-day-picker for date selection
- [x] Add date range filtering to audit log API endpoint
- [x] Update database queries to support date filtering
- [x] Create preset filter buttons (All Time, Today, 7 Days, 30 Days)
- [x] Integrate date filtering into audit log section
- [x] Add unit tests for date filtering (9 tests passing)

## New Features - Custom Date Picker
- [x] Create DateRangePicker component with react-day-picker
- [x] Add calendar UI with range selection (dual month view)
- [x] Integrate custom picker with preset filters
- [x] Add calendar button with popover interface
- [x] Display selected date range in readable Russian format
- [x] Add clear/reset functionality
- [x] Custom dark theme styling for calendar

## New Features - Action Type Filter
- [x] Add action type parameter to audit log API endpoint
- [x] Update database queries to support action type filtering
- [x] Create action type dropdown component
- [x] Add filter options (All Actions, Approved, Rejected)
- [x] Integrate action filter with date filters
- [x] Add unit tests for action type filtering (9 tests passing)

## New Features - Audit Log Enhancements
- [x] Implement CSV export functionality for filtered audit logs
- [x] Create download button with export icon
- [x] Generate CSV with proper headers and data formatting (UTF-8 BOM)
- [x] Add search input to filter by admin/user name
- [x] Implement client-side search filtering
- [x] Add statistics summary badges (approved/rejected counts)
- [x] Display statistics based on current filters
- [x] Export respects all active filters (date, action type, search)

## New Features - Bulk Actions
- [x] Add checkbox selection to access request table
- [x] Implement select all/deselect all functionality
- [x] Create bulk approve/reject buttons
- [x] Add confirmation dialog for bulk operations
- [x] Update API to handle bulk operations
- [x] Show success/error toasts for bulk actions
- [x] Add bulk role selection dropdown

## New Features - Email Digest Scheduling
- [x] Create email digest generation function
- [x] Design daily/weekly digest email templates (HTML with statistics)
- [x] Implement cron job for scheduled email sending (node-cron)
- [x] Add digest configuration (frequency, recipients via env vars)
- [x] Include statistics and recent actions in digest
- [x] Initialize scheduler on server startup
- [ ] Add unsubscribe/preferences functionality (future enhancement)

## Email & Telegram Notification Integration (COMPLETED)

### Database Schema ✅
- [x] notificationPreferences table: User notification settings
- [x] alertNotifications table: Alert delivery tracking
- [x] notificationLog table: Notification history

### Notification Service ✅
- [x] NotificationService.ts: Email and Telegram delivery
- [x] SMTP email configuration
- [x] Telegram Bot API integration
- [x] Severity-based filtering (critical, warning, info)
- [x] Quiet hours support
- [x] Notification logging and retry logic

### tRPC Endpoints ✅
- [x] getPreferences: Fetch user notification settings
- [x] updatePreferences: Save notification preferences
- [x] sendTest: Send test notification via channel
- [x] getStats: Notification statistics and metrics

### UI Components ✅
- [x] NotificationPreferences.tsx: Settings form with toggles
- [x] Email alerts configuration (critical, warning, info)
- [x] Telegram alerts configuration (critical, warning, info)
- [x] Quiet hours time picker
- [x] Timezone selector
- [x] Test notification buttons
- [x] Statistics display

### User Settings Page ✅
- [x] UserSettings.tsx: Main settings page with tabs
- [x] Notifications tab with preferences
- [x] Profile tab (placeholder)
- [x] Security tab (placeholder)
- [x] Responsive design with dark mode

## New Features - Role Change History
- [x] Create role_changes database table
- [x] Track role modifications with old/new values
- [x] Add API endpoints for role change logs (list, byUserId)
- [x] Create "Role Changes" tab in UI (4th tab)
- [x] Display role change timeline with details
- [x] Show old/new role badges with color coding
- [x] Include admin name and timestamp for each change

## New Features - User Role Editing UI
- [x] Add role editing functionality to Users page
- [x] Create role change dialog with reason input field
- [x] Add API endpoint for updating user roles
- [x] Automatically log role changes to roleChanges table
- [x] Show success/error toasts for role updates
- [x] Refresh user list after role change
- [x] Replace mock data with real database integration

## New Features - Digest Configuration UI
- [x] Create Settings page for digest configuration
- [x] Add frequency selector (daily/weekly)
- [x] Add recipient email management (add/remove)
- [x] Add enable/disable toggle for digest
- [x] Add "Test Digest" button to send immediately
- [x] Store configuration in database (digestConfig table)
- [x] Add API endpoints for digest settings (get, update, test)
- [x] Update scheduler to use database config
- [x] Update emailDigest to use database config

## New Features - Notification Preferences
- [x] Add notification preferences fields to users table
- [x] Create user preferences API endpoints (get, update)
- [x] Add notification settings page (/notification-preferences)
- [x] Add email notification opt-in/opt-out toggle
- [x] Add Telegram notification opt-in/opt-out toggle
- [x] Respect preferences when sending notifications (approval/rejection)
- [x] Add getUserByTelegramId helper function


## Phase 8: Localization & Uzbek Features
- [x] Implement i18n framework (react-i18next installed)
- [x] Create English translation file with 100+ keys
- [ ] Complete Russian translation for all UI (next phase)
- [x] Add Uzbek currency (UZS) support with proper formatting
- [x] Add Uzbek-specific validators (phone +998, INN, bank account) - 22 tests
- [x] Add Uzbek date format (DD.MM.YYYY) in validators
- [x] Update Dashboard to show UZS currency
- [x] Add Uzbek regions/locations support in validators
- [ ] Create Uzbek-specific documentation (next phase)

## Phase 9: Navigation & Access Control
- [x] Add sidebar navigation with all pages (MainLayout component)
- [x] Implement role-based access control (admin-only pages)
- [x] Add collapsible sidebar (240px / 64px modes)
- [ ] Implement breadcrumb navigation (next phase)
- [ ] Create user menu dropdown (next phase)
- [x] Add notifications bell in header
- [ ] Add command palette (⌘K) (next phase)

## Phase 10: Core Modules UI
- [ ] Machines list page with filters
- [ ] Machine detail page with status
- [ ] Tasks kanban board
- [ ] Tasks calendar view
- [ ] Inventory 3-level view
- [ ] Transactions list
- [ ] Incidents tracking
- [ ] Complaints management


## Phase 11: Machines Module (No QR Codes)
- [ ] Create machines database table with schema
- [ ] Add machine status enum (active, maintenance, offline, retired)
- [ ] Create tRPC API endpoints for machines (list, get, create, update, delete)
- [ ] Implement machine list page with filters (status, location, type)
- [ ] Add search functionality for machine name/ID
- [ ] Create machine detail page with full information
- [ ] Add location/map integration for machine placement
- [ ] Create machine status history tracking
- [ ] Add machine photo upload functionality
- [ ] Implement machine performance metrics
- [ ] Create unit tests for machine operations


## Phase 11: Machines Module
- [ ] Add machines API endpoints (list, get, create, update, delete)
- [ ] Create Machines list page with status display
- [ ] Add status color coding (active=green, offline=red, maintenance=yellow)
- [ ] Implement search by machine name/serial number
- [ ] Add filters by status and location
- [ ] Create machine detail page
- [ ] Add machine edit dialog
- [ ] Implement machine creation form
- [ ] Add location/map display
- [ ] Create unit tests for machines operations


## Phase 12: Machine Detail Page
- [x] Create machine detail page component
- [x] Display complete machine information (name, serial, model, location)
- [x] Show operational status with color coding
- [x] Display revenue statistics and sales metrics
- [x] Add maintenance history timeline
- [x] Show next service due date with warnings
- [x] Implement edit machine dialog
- [x] Add status update functionality
- [x] Create maintenance log entry form
- [ ] Add unit tests for detail page operations


## Phase 13: Machines Module Implementation
- [ ] Create machines list page with status display and filtering
- [ ] Create machines detail page with maintenance history
- [ ] Add machine creation/editing forms
- [ ] Implement machine status update functionality
- [ ] Add maintenance logging with cost tracking
- [ ] Create unit tests for machines operations

## Phase 14: Tasks Module Implementation
- [ ] Create tasks list page with status display
- [ ] Build kanban board with drag-and-drop functionality
- [ ] Implement task creation and editing
- [ ] Add task status workflow (pending, in-progress, completed)
- [ ] Create task assignment to users
- [ ] Add task priority levels
- [ ] Create unit tests for tasks operations


## Phase 15: Manual Operations Architecture
- [ ] Create photo validation system for task completion
- [ ] Implement before/after photo requirements for tasks
- [ ] Add photo upload and storage integration
- [ ] Create photo gallery view in task detail page
- [ ] Implement photo validation rules (size, format, quality)
- [ ] Create inventory movement audit trail table
- [ ] Track all inventory changes with timestamps and operators
- [ ] Implement audit log display for inventory movements
- [ ] Create connectivity monitoring system
- [ ] Implement automated offline incident creation
- [ ] Add machine status polling mechanism
- [ ] Create incident notification system
- [ ] Add unit tests for manual operations features


## Phase 16: Machines Module List Page
- [x] Create Machines list page component
- [x] Display machine cards with status badges
- [x] Add statistics dashboard (total, active, offline, maintenance)
- [x] Implement search by machine name or serial number
- [x] Add status filter (all, active, offline, maintenance, retired)
- [x] Add location filter
- [x] Display revenue and sales metrics per machine
- [x] Show last maintenance and next service dates
- [x] Add navigation route for Machines page
- [x] Update sidebar navigation to include Machines link
- [x] Test Machines page functionality


## Phase 17: Machine Detail Page
- [ ] Create MachineDetail page component
- [ ] Display complete machine information (name, serial, model, location, status)
- [ ] Add revenue chart showing daily/weekly/monthly trends
- [ ] Implement maintenance history timeline
- [ ] Show inventory levels for machine
- [ ] Add edit machine dialog with form validation
- [ ] Implement status update functionality
- [ ] Add photo gallery for machine
- [ ] Create maintenance log entry form
- [ ] Add navigation back to machines list

## Phase 18: Tasks Module with Kanban Board
- [ ] Create Tasks page with kanban layout
- [ ] Implement drag-and-drop functionality between columns
- [ ] Add task creation dialog with priority and due date
- [ ] Create task assignment to team members
- [ ] Add task status columns (pending, in-progress, completed)
- [ ] Implement task filtering and search
- [ ] Add task detail view/edit modal
- [ ] Show task statistics dashboard
- [ ] Add photo upload for task completion
- [ ] Implement task notifications

## Phase 19: 3-Level Inventory Tracking
- [ ] Design 3-level inventory database schema (products → components → raw materials)
- [ ] Create Inventory page with hierarchical view
- [ ] Implement stock level tracking with alerts
- [ ] Add inventory transfer functionality between machines
- [ ] Create low stock alerts and notifications
- [ ] Implement inventory adjustment forms
- [ ] Add inventory history tracking
- [ ] Create inventory reports and analytics
- [ ] Implement barcode/SKU search
- [ ] Add bulk inventory operations


## Phase 20: Complete Tasks Module with Drag-and-Drop
- [ ] Complete drag-and-drop functionality implementation in Tasks.tsx
- [ ] Add task creation dialog with form validation
- [ ] Implement task detail modal
- [ ] Enable status updates via drag-and-drop between columns
- [ ] Add task statistics cards (total, pending, in-progress, completed)
- [ ] Test drag-and-drop functionality across all browsers
- [ ] Add task assignment dropdown
- [ ] Implement task priority selection

## Phase 21: Fix TypeScript Errors
- [ ] Fix Date type assignments in server/db.ts (lines 617, 654)
- [ ] Verify getUserByTelegramId function exists in server/db.ts
- [ ] Fix all remaining TypeScript compilation errors
- [ ] Run full test suite to ensure no regressions
- [ ] Verify dev server compiles without errors

## Phase 22: Final Checkpoint
- [ ] Test all implemented features end-to-end
- [ ] Verify Machine Detail page with revenue charts
- [ ] Test Tasks module drag-and-drop functionality
- [ ] Verify all navigation links work correctly
- [ ] Check responsive design on mobile/tablet
- [ ] Save comprehensive checkpoint with all features


## Phase 30: Reference Books (Справочники) Implementation

### Database & Schema ✅
- [x] Create locations table (Локации)
- [x] Create categories table (Категории)
- [x] Create units table (Единицы измерения)
- [x] Create machineTypes table (Типы аппаратов)
- [x] Create componentTypes table (Типы компонентов)
- [x] Create taskTypes table (Типы задач)
- [x] Create supplierTypes table (Типы поставщиков)
- [x] Create referenceBookAuditLog table
- [x] Create SQL migration (0013_reference_books.sql)
- [x] Create Drizzle schema (schema-reference-books.ts)
- [x] Create indexes and views
- [x] Create stored procedures

### API Endpoints
- [ ] Add referenceBooks router to main tRPC router
- [ ] Implement locations CRUD endpoints
- [ ] Implement categories CRUD endpoints
- [ ] Implement units CRUD endpoints
- [ ] Implement machineTypes CRUD endpoints
- [ ] Implement componentTypes CRUD endpoints
- [ ] Implement taskTypes CRUD endpoints
- [ ] Implement supplierTypes CRUD endpoints
- [ ] Add validation schemas for all entities
- [ ] Write unit tests for API endpoints

### UI Components
- [ ] Create ReferenceBookForm component
- [ ] Create ReferenceBookTable component
- [ ] Create ReferenceBookModal component
- [ ] Create search and filter functionality
- [ ] Add loading states and error handling

### Pages
- [ ] Create /master-data page with tabs
- [ ] Create individual reference book pages
- [ ] Add navigation links to sidebar
- [ ] Test all CRUD operations

### Integration
- [ ] Integrate locations with machines module
- [ ] Integrate categories with products module
- [ ] Integrate units with products module
- [ ] Integrate machineTypes with machines module
- [ ] Integrate taskTypes with tasks module
- [ ] Integrate supplierTypes with suppliers module

### AI-Agent Integration
- [ ] Create AI-agents for each reference book
- [ ] Add suggestion generation
- [ ] Add learning mechanism
- [ ] Test with real data

### Bulk Operations
- [ ] Implement bulk import from Excel/CSV
- [ ] Implement bulk export to Excel/CSV
- [ ] Implement bulk update operations
- [ ] Add import preview and validation

## Phase 23: Inventory Tracking System (3-Level Hierarchy)

### Database & API
- [x] Review existing inventory schema in drizzle/schema.ts
- [x] Create inventory router in server/routers/inventory.ts
- [x] Implement getInventoryByLevel endpoint (warehouse/operator/machine)
- [x] Implement getInventoryByProduct endpoint
- [x] Implement updateInventoryQuantity endpoint
- [x] Implement createStockTransfer endpoint
- [x] Implement getStockTransfers endpoint
- [x] Implement getLowStockAlerts endpoint

### UI Components
- [x] Create Inventory page with 3-level tree view
- [x] Add product list with stock levels for each location
- [x] Implement stock level progress bars with color coding
- [x] Add filtering by product category and location
- [x] Create stock transfer modal with validation
- [x] Add low stock alerts section
- [x] Implement search functionality

### Features
- [x] Stock transfer workflow (warehouse → operator → machine)
- [x] Low stock threshold alerts (configurable per product)
- [ ] Stock consumption tracking linked to machine sales
- [ ] Transfer history with audit trail
- [ ] Stock adjustment functionality with reason tracking

### Testing
- [x] Write unit tests for inventory API endpoints
- [x] Test stock transfer logic
- [x] Test low stock alert calculations
- [x] Verify 3-level hierarchy queries


## Phase 24: Stock Transfer Approval & Inventory Adjustments

### Database Schema
- [x] Create inventoryAdjustments table in schema.ts
- [x] Add fields: id, inventoryId, productId, adjustmentType, quantity, reason, photoUrl, performedBy, createdAt
- [x] Add approvedBy and approvedAt fields to stockTransfers table
- [x] Run database migration to apply schema changes

### Stock Transfer Approval Workflow
- [x] Create admin transfers page (/admin/transfers)
- [x] Add API endpoint to get pending transfers
- [x] Create approve transfer mutation with inventory update logic
- [x] Create reject transfer mutation
- [ ] Add notification system for transfer status changes (deferred)
- [ ] Implement automatic inventory adjustment on approval (deferred)
- [x] Add approval history to transfer records

### Transfer History & Audit Trail
- [x] Create transfer history page (/inventory/transfer-history)
- [x] Add filtering by date range, status, user, product
- [ ] Display before/after stock levels for each transfer (deferred)
- [x] Show approval/rejection timestamps and admin names
- [ ] Add export to CSV functionality (deferred)
- [ ] Implement pagination for large datasets (deferred)

### Inventory Adjustment Interface
- [x] Create inventory adjustment form component
- [x] Add adjustment type dropdown (damage, shrinkage, correction, found)
- [x] Implement mandatory reason code field
- [x] Add photo upload functionality for evidence
- [x] Create API endpoint to record adjustments
- [x] Implement automatic inventory quantity update
- [ ] Add adjustment history view per product (deferred)
- [x] Create audit log for all adjustments

### Testing
- [x] Write unit tests for approval workflow
- [x] Test inventory adjustment logic
- [x] Test transfer history filtering
- [x] Verify automatic inventory updates
- [ ] Test notification delivery


## Phase 25: Real-Time Notification System

### Database Schema
- [x] Create notifications table in schema.ts
- [x] Add fields: id, userId, type, title, message, relatedId, read, createdAt
- [x] Run database migration

### Backend Infrastructure
- [x] Create notification service module
- [x] Add createNotification function
- [x] Add getUserNotifications function
- [x] Add markNotificationAsRead function
- [x] Add markAllNotificationsAsRead function
- [ ] Implement real-time push via Server-Sent Events (SSE) (deferred - using polling for now)

### API Endpoints
- [x] Create notifications router
- [x] Add notifications.list endpoint (get user notifications)
- [x] Add notifications.unreadCount endpoint
- [x] Add notifications.markAsRead endpoint
- [x] Add notifications.markAllAsRead endpoint
- [ ] Add notifications.subscribe endpoint (SSE) (deferred)

### Frontend Notification Center
- [x] Create NotificationCenter component
- [x] Add bell icon with unread count badge in header
- [x] Implement dropdown with notification list
- [x] Add mark as read functionality
- [x] Add mark all as read button
- [x] Style notification items with icons and timestamps
- [x] Add empty state for no notifications

### Integration with Transfer Workflow
- [x] Trigger notification on transfer approval
- [x] Trigger notification on transfer rejection
- [x] Send notification to requester with transfer details
- [x] Include link to transfer history
- [x] Add real-time update to notification center

### Testing
- [x] Write unit tests for notification service
- [x] Test notification creation on approval/rejection
- [ ] Test SSE connection and real-time updates (deferred - using polling)
- [x] Verify notification UI updates


## Phase 26: Inventory Enhancements

### Inventory Adjustment Buttons
- [x] Add "Adjust Stock" button to each product card in Inventory page
- [x] Connect button to InventoryAdjustmentModal
- [x] Pass inventory item data to modal
- [x] Refresh inventory data after adjustment

### Automatic Inventory Updates on Transfer Approval
- [x] Implement inventory decrement at source location on approval
- [x] Implement inventory increment at destination location on approval
- [x] Add transaction logging for inventory changes
- [x] Send completion notification with updated stock levels
- [x] Handle edge cases (insufficient stock, missing inventory records)

### Low Stock Alert Notifications
- [x] Create scheduled job for daily low stock checks
- [x] Query inventory items below threshold
- [x] Create notifications for managers/admins
- [x] Include product details and current stock levels
- [x] Add link to inventory page in notification
- [x] Configure job schedule (daily at specific time)

### Testing
- [x] Test adjustment button functionality
- [x] Test automatic inventory updates on approval
- [x] Test low stock alert notification creation
- [x] Verify notification delivery to correct users


## Phase 27: AI-Agent Integration & Claude API

- [ ] Create ProductForm component with AI-agent integration
- [ ] Add AI suggestions for product fields (name, category, price, SKU)
- [ ] Create MachineForm component with AI-agent integration
- [ ] Add AI suggestions for machine fields (name, model, location, status)
- [ ] Build AI-Agent Management Dashboard at /admin/ai-agents
- [ ] Display agent statistics (suggestion accuracy, confirmation rate)
- [ ] Show prompt versions and change history
- [ ] Display improvement history and approvals
- [ ] Implement Claude API integration in generateSuggestions
- [ ] Add Anthropic API key to environment variables
- [ ] Test Claude suggestions with real data
- [ ] Add error handling for API failures
- [ ] Implement suggestion caching

## 100% Completion Tasks
- [x] Create modern authentication page with hero background
- [x] Add login and registration forms
- [x] Generate visual assets (auth-hero-bg.jpg, vending-machine-hero.jpg, dashboard-preview.jpg)
- [x] Install and configure sonner toast library
- [x] Add social auth buttons (Google, Telegram)
- [ ] Fix database schema errors (sql().notNull issue)
- [ ] Complete all remaining UI features
- [ ] Test all functionality
- [ ] Create production build
- [ ] Prepare deployment package

## OAuth Integration Tasks
- [x] Implement Google OAuth backend endpoint
- [x] Implement Telegram OAuth backend endpoint
- [x] Update Auth.tsx to use real OAuth flows
- [x] Add OAuth callback handlers
- [x] Add Telegram Login Widget component
- [x] Add Telegram auth verification backend
- [x] Add error handling for OAuth failures
- [x] Test Google OAuth flow (7 tests passing)
- [x] Test Telegram OAuth flow (7 tests passing)

## Email/Password Authentication Tasks
- [x] Install bcrypt and @types/bcrypt
- [x] Update database schema to add password_hash field
- [x] Create password hashing service with bcrypt
- [x] Implement user registration endpoint
- [x] Implement user login endpoint
- [x] Update Auth.tsx to use real registration/login
- [x] Add password validation (min 8 chars, complexity)
- [x] Write unit tests for auth service (18 tests passing)
- [x] Test registration flow
- [x] Test login flow

## Advanced Authentication Features
### Password Reset Flow
- [ ] Add password reset tokens table to database
- [ ] Create password reset request endpoint
- [ ] Create password reset confirmation endpoint
- [ ] Send password reset email with token link
- [ ] Add password reset UI pages
- [ ] Add token expiration (1 hour)
- [ ] Test password reset flow

### Email Verification
- [ ] Add email verification tokens table to database
- [ ] Add emailVerified field to users table
- [ ] Send verification email on registration
- [ ] Create email verification endpoint
- [ ] Add resend verification email endpoint
- [ ] Add email verification UI
- [ ] Test email verification flow

### OAuth Account Linking
- [ ] Update OAuth handlers to check existing email
- [ ] Create account linking confirmation UI
- [ ] Allow users to link OAuth to existing account
- [ ] Allow users to unlink OAuth accounts
- [ ] Add linked accounts management page
- [ ] Test account linking flow

## Complete Database Migration
- [ ] Migrate products table columns
- [ ] Migrate inventoryAdjustments table columns
- [ ] Migrate tasks table columns
- [ ] Migrate components table columns
- [ ] Migrate componentHistory table columns
- [ ] Migrate transactions table columns
- [ ] Migrate suppliers table columns
- [ ] Migrate stockTransfers table columns
- [ ] Migrate accessRequests table columns
- [ ] Migrate accessRequestAuditLogs table columns
- [ ] Migrate roleChanges table columns
- [ ] Migrate digestConfig table columns
- [ ] Migrate users table columns
- [ ] Migrate notifications table columns
- [ ] Verify all migrations successful
- [ ] Test all API endpoints


## Phase 24: Frontend Rebuild & Navigation Fix (Nov 30, 2025)
- [x] Fixed React rendering issues (black screen problem)
- [x] Created new VendHubLayout component with working sidebar
- [x] Implemented Russian interface throughout the app
- [x] Added collapsible sidebar (240px / 64px modes) with toggle button
- [x] Created navigation groups with expand/collapse functionality
- [x] Added header with notifications badge (3) and help icon
- [x] Implemented user profile section at bottom of sidebar
- [x] Created placeholder pages for all modules:
  - [x] Dashboard with metrics cards
  - [x] Machines page
  - [x] Tasks page
  - [x] Locations page
  - [x] Inventory page
  - [x] Products page
  - [x] Recipes page
  - [x] Transactions page
  - [x] Counterparties page
  - [x] Contracts page
  - [x] Analytics page
  - [x] Reports page
  - [x] Incidents page
  - [x] Users page
  - [x] Access Requests page
  - [x] Settings page
  - [x] Help page
- [x] Fixed routing with wouter (all routes working)
- [x] Added badges to navigation items (Tasks: 5, Access Requests: 2)
- [x] Verified navigation between pages works correctly
- [x] Tested group expansion/collapse functionality
- [x] Fixed CHOKIDAR_USEPOLLING for file watching stability

### Next Steps for Phase 24
- [ ] Add Command Palette (⌘K) component
- [ ] Implement user menu dropdown with theme switcher
- [ ] Add favorites section to sidebar
- [ ] Create breadcrumb navigation
- [ ] Implement responsive design for tablet/mobile
- [ ] Add bottom navigation for mobile view
- [ ] Connect pages to real data via tRPC
- [ ] Add loading states and skeletons
- [ ] Implement form validation
- [ ] Add toast notifications for actions


## Phase 25: Command Palette Implementation (Nov 30, 2025)
- [x] Create CommandPalette component with Dialog/Command from shadcn
- [x] Add keyboard shortcut listener (⌘K / Ctrl+K)
- [x] Implement fuzzy search for pages and actions
- [x] Add navigation to all pages from palette
- [x] Show recent pages in palette (stored in localStorage)
- [x] Style palette with dark theme
- [x] Add icons for each page/action
- [x] Implement ESC to close palette
- [x] Test keyboard navigation (arrow keys, Enter)
- [x] Update todo.md with completion status
- [ ] Add quick actions (create task, add machine, etc.) - future enhancement


## Phase 26: Backend Integration (Nov 30, 2025)
- [ ] Review existing database schema (drizzle/schema.ts)
- [ ] Set up tRPC client in frontend
- [ ] Create tRPC router structure for all modules
- [ ] Implement machines module (list, create, update, delete)
- [ ] Implement tasks module (list, create, update, delete)
- [ ] Implement inventory module (list, update stock levels)
- [ ] Implement products module (list, create, update, delete)
- [ ] Implement locations module (list, create, update, delete)
- [ ] Implement users module (list, roles, permissions)
- [ ] Connect Dashboard metrics to real database queries
- [ ] Add loading states and error handling
- [ ] Test all CRUD operations
- [ ] Update todo.md with completion status


## Phase 27: Backend Connection Fixes (Nov 30, 2025)
- [x] Identify drizzle schema mismatch (camelCase fields vs snake_case DB columns)
- [x] Fix machines table schema with proper snake_case mapping
- [x] Fix products table schema with proper snake_case mapping  
- [x] Fix tasks table schema with proper snake_case mapping
- [ ] Fix all remaining tables in schema (inventory, transactions, suppliers, etc.)
- [ ] Test tRPC endpoints return correct data
- [ ] Verify Dashboard displays real data from database
- [ ] Test Machines page with real data
- [ ] Test Tasks page with real data
- [ ] Test Products page with real data
- [ ] Create comprehensive seed script with realistic data
- [ ] Save checkpoint with working backend integration


## Phase 28: Backend Integration Status (Nov 30, 2025)
- [x] Fixed drizzle schema for machines table (removed non-existent columns)
- [x] Fixed drizzle schema for products table (fixed updatedAt column name)
- [x] Fixed drizzle schema for tasks table (snake_case mapping)
- [x] Verified API endpoints work via curl (machines, tasks, products)
- [x] Added test data to database (3 machines, 3 tasks, 3 products)
- [x] Added error handling to Dashboard component
- [ ] **BLOCKED**: React Query not fetching data (requests stuck in pending state)
- [ ] **BLOCKED**: Dashboard not displaying backend data
- [ ] Need to debug tRPC client configuration
- [ ] Need to check browser console for errors
- [ ] Consider alternative: use fetch() instead of tRPC for initial testing

## Known Issues:
1. Dashboard shows loading state indefinitely (React Query requests don't complete)
2. tRPC endpoints work via curl but not from browser
3. Possible CORS or network configuration issue
4. Need to investigate React Query + tRPC integration


## Phase 29: Core Pages Implementation (Nov 30, 2025)

### Machines Page
- [ ] Create Machines page component with table layout
- [ ] Add status filter buttons (All, Online, Offline, Maintenance)
- [ ] Implement search by serial number or location
- [ ] Add status badges with color coding (green/yellow/red)
- [ ] Create interactive map view with Google Maps
- [ ] Add map markers for each machine with status indicators
- [ ] Implement toggle between table and map views
- [ ] Add machine details modal/drawer
- [ ] Connect to backend machines.list endpoint

### Tasks Page
- [ ] Create Tasks page component with kanban layout
- [ ] Implement three columns: Pending, In Progress, Completed
- [ ] Add drag-and-drop functionality with @dnd-kit/core
- [ ] Create task cards with priority indicators
- [ ] Add task assignment dropdown (select operator)
- [ ] Implement task status update on drop
- [ ] Add "Create New Task" button and modal
- [ ] Add task filtering by priority/assignee
- [ ] Connect to backend tasks.list and tasks.update endpoints

### Products Page
- [ ] Create Products page component with table layout
- [ ] Add "Create Product" button and modal form
- [ ] Implement product form with validation (name, SKU, price, category)
- [ ] Add edit functionality (inline or modal)
- [ ] Add delete confirmation dialog
- [ ] Display inventory levels with color-coded indicators
- [ ] Add low stock warnings (threshold-based)
- [ ] Implement search and category filtering
- [ ] Connect to backend products CRUD endpoints
- [ ] Add inventory adjustment functionality


## Phase 29 Completion Status (Nov 30, 2025)

### Machines Page - COMPLETED ✅
- [x] Created Machines page component with table layout
- [x] Added status filter buttons (All, Online, Offline, Maintenance)
- [x] Implemented search by serial number or location
- [x] Added status badges with color coding (green/yellow/red)
- [x] Created interactive map view with Google Maps
- [x] Added map markers for each machine with status indicators
- [x] Implemented toggle between table and map views
- [x] Added Russian UI translations
- [x] Connected to backend machines.list endpoint

### Tasks Page - COMPLETED ✅
- [x] Created Tasks page component with kanban layout
- [x] Implemented three columns: Pending, In Progress, Completed
- [x] Added drag-and-drop functionality with @dnd-kit/core
- [x] Created task cards with priority indicators
- [x] Added task assignment display
- [x] Implemented task status update on drop
- [x] Added "Create New Task" button and modal
- [x] Added task filtering by priority/assignee
- [x] Connected to backend tasks.list and tasks.update endpoints
- [x] Added Russian UI translations
- [x] Fixed filter error with optional chaining

### Products Page - COMPLETED ✅
- [x] Created Products page component with table layout
- [x] Added "Create Product" button and modal form
- [x] Implemented product form with validation (name, SKU, price, category)
- [x] Added edit functionality (modal)
- [x] Added delete confirmation dialog
- [x] Displayed inventory levels with color-coded indicators
- [x] Added low stock warnings (threshold-based)
- [x] Implemented search and category filtering
- [x] Connected to backend products.list endpoint
- [x] Added inventory statistics dashboard
- [x] Added Russian UI translations


## Phase 30: Machine Detail Page with Service History

### Machine Detail Page Component
- [ ] Create MachineDetail.tsx page component
- [ ] Add route /machines/:id to App.tsx
- [ ] Implement back button navigation
- [ ] Add machine info header with status badge
- [ ] Display technical specifications (model, serial number, installation date)
- [ ] Show current location with map preview

### Service History Timeline
- [ ] Create ServiceHistory component with timeline layout
- [ ] Display all maintenance operations chronologically
- [ ] Show operation type icons (repair, refill, cleaning, inspection)
- [ ] Add operation details (date, operator, description, cost)
- [ ] Implement filter by operation type
- [ ] Add "Add Service Record" button and modal

### Sales Statistics
- [ ] Create SalesChart component with revenue graph
- [ ] Display daily/weekly/monthly sales trends
- [ ] Show top-selling products in this machine
- [ ] Add revenue comparison with other machines
- [ ] Display transaction count statistics

### Current Inventory
- [ ] Create InventoryTable component
- [ ] Display all products currently in machine
- [ ] Show stock levels with progress bars
- [ ] Add low stock warnings
- [ ] Implement "Refill" action button
- [ ] Show last refill date for each product

### Backend Integration
- [ ] Connect to machines.getById tRPC endpoint
- [ ] Connect to serviceHistory.list endpoint
- [ ] Connect to sales.getByMachine endpoint
- [ ] Connect to inventory.getByMachine endpoint
- [ ] Add mock data fallback for all sections


## Phase 30 Completion Status

All tasks completed:
- [x] Create MachineDetail.tsx page component
- [x] Add route /machines/:id to App.tsx
- [x] Implement back button navigation
- [x] Add machine info header with status badge
- [x] Display technical specifications (model, serial number, installation date)
- [x] Show current location with map preview
- [x] Create ServiceHistory component with timeline layout
- [x] Display all maintenance operations chronologically
- [x] Show operation type icons (repair, refill, cleaning, inspection)
- [x] Add operation details (date, operator, description, cost)
- [x] Create SalesChart component with revenue graph
- [x] Display daily/weekly/monthly sales trends
- [x] Show top-selling products in this machine
- [x] Create InventoryTable component
- [x] Display all products currently in machine
- [x] Show stock levels with progress bars
- [x] Add low stock warnings
- [x] Show last refill date for each product
- [x] Add mock data fallback for all sections
- [x] Translate all UI to Russian


## Phase 31: Maintenance History Filtering

### Filter UI Components
- [ ] Add filter button group above maintenance history timeline
- [ ] Create "Все" (All) filter button showing total count
- [ ] Create "Ремонт" (Repair) filter button with repair count
- [ ] Create "Пополнение" (Refill) filter button with refill count
- [ ] Create "Обслуживание" (Service) filter button with service count
- [ ] Create "Инспекция" (Inspection) filter button with inspection count
- [ ] Add active state styling for selected filter
- [ ] Add hover effects for filter buttons

### Filter Logic
- [ ] Add useState for selected filter type
- [ ] Implement filter logic to count records by type
- [ ] Filter maintenance history array based on selected type
- [ ] Update timeline display to show only filtered records
- [ ] Ensure "Все" shows all records

### UX Enhancements
- [ ] Add smooth transition when switching filters
- [ ] Show "Нет записей" message when filter returns empty results
- [ ] Maintain timeline icons and styling for filtered results


## Phase 31 Completion Status

All tasks completed:
- [x] Add filter button group above maintenance history timeline
- [x] Create "Все" (All) filter button showing total count
- [x] Create "Ремонт" (Repair) filter button with repair count
- [x] Create "Пополнение" (Refill) filter button with refill count
- [x] Create "Обслуживание" (Service) filter button with service count
- [x] Create "Инспекция" (Inspection) filter button with inspection count
- [x] Add active state styling for selected filter
- [x] Add hover effects for filter buttons
- [x] Add useState for selected filter type
- [x] Implement filter logic to count records by type
- [x] Filter maintenance history array based on selected type
- [x] Update timeline display to show only filtered records
- [x] Ensure "Все" shows all records
- [x] Add smooth transition when switching filters
- [x] Show "Нет записей" message when filter returns empty results
- [x] Maintain timeline icons and styling for filtered results


## Phase 32: Date Range Picker for Maintenance History

### Date Range UI Components
- [ ] Add date range filter section above operation type filters
- [ ] Create preset period buttons (Последний месяц / 3 месяца / 6 месяцев / Год / Всё время)
- [ ] Add custom date range picker with start and end date inputs
- [ ] Style preset buttons with active state
- [ ] Add calendar icon to date inputs
- [ ] Make date range section responsive

### Date Range State Management
- [ ] Add useState for selected date range (start, end)
- [ ] Add useState for active preset period
- [ ] Implement preset button click handlers
- [ ] Implement custom date input change handlers
- [ ] Calculate date ranges for each preset option

### Filtering Logic
- [ ] Filter maintenance history by date range
- [ ] Combine date range filter with operation type filter
- [ ] Update record counts in operation type filters based on date range
- [ ] Handle edge cases (invalid dates, future dates)
- [ ] Show filtered date range in UI

### UX Enhancements
- [ ] Clear date range button
- [ ] Show active date range indicator
- [ ] Smooth transitions when changing filters
- [ ] Update "Нет записей" message to include date range context


## Phase 32 Completion Status

All tasks completed:
- [x] Add date range filter section above operation type filters
- [x] Create preset period buttons (Последний месяц / 3 месяца / 6 месяцев / Год / Всё время)
- [x] Add custom date range picker with start and end date inputs
- [x] Style preset buttons with active state
- [x] Add calendar icon to date inputs
- [x] Make date range section responsive
- [x] Add useState for selected date range (start, end)
- [x] Add useState for active preset period
- [x] Implement preset button click handlers
- [x] Implement custom date input change handlers
- [x] Calculate date ranges for each preset option
- [x] Filter maintenance history by date range
- [x] Combine date range filter with operation type filter
- [x] Update record counts in operation type filters based on date range
- [x] Handle edge cases (invalid dates, future dates)
- [x] Show filtered date range in UI
- [x] Clear date range button (via preset selection)
- [x] Show active date range indicator
- [x] Smooth transitions when changing filters
- [x] Update "Нет записей" message to include date range context


## Phase 33: Visual Date Range Indicator in Header

### Date Range Display Logic
- [ ] Create function to format date range for display
- [ ] Handle different preset formats (Last month, 3 months, etc.)
- [ ] Format custom date range as "DD.MM.YYYY - DD.MM.YYYY"
- [ ] Show "Всё время" for all-time filter
- [ ] Calculate and format date ranges for presets

### Header Badge Component
- [ ] Add badge next to "История обслуживания" title
- [ ] Style badge with calendar icon
- [ ] Use appropriate color scheme for visibility
- [ ] Make badge responsive for mobile
- [ ] Update badge text dynamically when filters change

### UX Enhancements
- [ ] Show record count in the indicator
- [ ] Add subtle animation when date range changes
- [ ] Ensure badge doesn't overlap with "Добавить запись" button
- [ ] Test on different screen sizes


## Phase 33 Completion Status

All tasks completed:
- [x] Create function to format date range for display
- [x] Handle different preset formats (Last month, 3 months, etc.)
- [x] Format custom date range as "DD.MM.YYYY - DD.MM.YYYY"
- [x] Show "Всё время" for all-time filter
- [x] Calculate and format date ranges for presets
- [x] Add badge next to "История обслуживания" title
- [x] Style badge with calendar icon
- [x] Use appropriate color scheme for visibility
- [x] Make badge responsive for mobile
- [x] Update badge text dynamically when filters change
- [x] Show record count in the indicator (via operation type filters)
- [x] Add subtle animation when date range changes
- [x] Ensure badge doesn't overlap with "Добавить запись" button
- [x] Test on different screen sizes


## Phase 34: Reset All Filters Button

### Reset Handler Function
- [ ] Create resetFilters function
- [ ] Reset dateRangePreset to "Всё время"
- [ ] Reset maintenanceFilter to "Все"
- [ ] Reset customDateRange to empty values
- [ ] Add optional toast notification on reset

### Reset Button UI
- [ ] Add reset button next to date range badge
- [ ] Use X icon from lucide-react
- [ ] Style as outline variant for subtle appearance
- [ ] Add hover tooltip "Сбросить все фильтры"
- [ ] Make button responsive on mobile

### Button Visibility Logic
- [ ] Show button only when filters are not default
- [ ] Hide when dateRangePreset="Всё время" AND maintenanceFilter="Все"
- [ ] Smooth fade in/out animation
- [ ] Position button properly in header layout

### Testing
- [ ] Test reset with date filters active
- [ ] Test reset with operation type filters active
- [ ] Test reset with both filters active
- [ ] Verify button disappears when filters are default
- [ ] Check mobile responsiveness


## Phase 34 Completion Status

All tasks completed:
- [x] Create resetFilters function
- [x] Reset dateRangePreset to "Всё время"
- [x] Reset maintenanceFilter to "Все"
- [x] Reset customDateRange to empty values
- [x] Add optional toast notification on reset
- [x] Add reset button next to date range badge
- [x] Use X icon from lucide-react
- [x] Style as outline variant for subtle appearance
- [x] Add hover tooltip "Сбросить все фильтры"
- [x] Make button responsive on mobile
- [x] Show button only when filters are not default
- [x] Hide when dateRangePreset="Всё время" AND maintenanceFilter="Все"
- [x] Smooth fade in/out animation
- [x] Position button properly in header layout
- [x] Test reset with date filters active
- [x] Test reset with operation type filters active
- [x] Test reset with both filters active
- [x] Verify button disappears when filters are default
- [x] Check mobile responsiveness


## Phase 35: Maintenance Statistics Panel

### Statistics Calculation Functions
- [ ] Create function to calculate total cost of filtered operations
- [ ] Create function to calculate total time of filtered operations
- [ ] Create function to calculate average time per operation
- [ ] Create function to count total number of filtered operations
- [ ] Parse time strings (e.g., "45 мин", "2 часа") to minutes
- [ ] Handle edge cases (no operations, missing data)

### Statistics Panel UI
- [ ] Create statistics panel component with 4 metric cards
- [ ] Add card for total cost with currency formatting
- [ ] Add card for total time with time formatting
- [ ] Add card for average time per operation
- [ ] Add card for operation count
- [ ] Use icons (DollarSign, Clock, BarChart3, etc.)
- [ ] Style cards with consistent spacing and colors
- [ ] Make panel responsive for mobile

### Integration with Filters
- [ ] Position panel below filter buttons
- [ ] Update statistics when date filters change
- [ ] Update statistics when operation type filters change
- [ ] Show "No data" state when no operations match filters
- [ ] Smooth transitions when statistics update

### Testing
- [ ] Test with all filters active
- [ ] Test with single filter active
- [ ] Test with no filters (all time, all types)
- [ ] Verify calculations are correct
- [ ] Check mobile responsiveness


## Phase 35 Completion Status

All tasks completed:
- [x] Create function to calculate total cost of filtered operations
- [x] Create function to calculate total time of filtered operations
- [x] Create function to calculate average time per operation
- [x] Create function to count total number of filtered operations
- [x] Parse time strings (e.g., "45 мин", "2 часа") to minutes
- [x] Handle edge cases (no operations, missing data)
- [x] Create statistics panel component with 4 metric cards
- [x] Add card for total cost with currency formatting
- [x] Add card for total time with time formatting
- [x] Add card for average time per operation
- [x] Add card for operation count
- [x] Use icons (DollarSign, Clock, BarChart3, etc.)
- [x] Style cards with consistent spacing and colors
- [x] Make panel responsive for mobile
- [x] Position panel below filter buttons
- [x] Update statistics when date filters change
- [x] Update statistics when operation type filters change
- [x] Show "No data" state when no operations match filters
- [x] Smooth transitions when statistics update
- [x] Test with all filters active
- [x] Test with single filter active
- [x] Test with no filters (all time, all types)
- [x] Verify calculations are correct
- [x] Check mobile responsiveness


## Authentication & Authorization Implementation (NEW)

### Database & Schema
- [x] Add sessions table for session management
- [x] Add passwordRecovery table for password reset tokens
- [x] Fix schema imports and unique index syntax

### Password & Token Services
- [x] Enhance PasswordService with bcrypt hashing
- [x] Add password strength validation
- [x] Add temporary password generation
- [x] Create TokenService for JWT generation
- [x] Implement token verification and expiration

### Database Functions
- [x] Create db-auth.ts with user CRUD operations
- [x] Implement session management functions
- [x] Implement password recovery token functions
- [x] Add last signed-in timestamp tracking

### Auth Endpoints (tRPC)
- [x] Create auth router with register endpoint
- [x] Implement login endpoint with token generation
- [x] Add changePassword endpoint
- [x] Add updateProfile endpoint
- [x] Add logout endpoint
- [x] Integrate with database and services

### Login/Register UI
- [x] Update Login component with tRPC integration
- [x] Create Register component with password strength indicator
- [x] Create AuthPage with toggle between login/register
- [x] Add smooth transitions and validation feedback

### Password Recovery
- [x] Create passwordRecovery router with request/reset endpoints
- [x] Implement token verification
- [x] Add email resend functionality
- [x] Create PasswordRecovery UI component with multi-step flow

### RBAC (Role-Based Access Control)
- [x] Create RBAC middleware with permission definitions
- [x] Implement role hierarchy (user < operator < manager < admin)
- [x] Add permission checking utilities
- [x] Create tRPC RBAC middleware (requirePermission, requireRole, etc.)

### Page-Level Access Control
- [x] Create ProtectedRoute component
- [x] Implement RoleBasedRender component
- [x] Implement PermissionBasedRender component
- [x] Create AccessDeniedPage
- [x] Create useAuth hook for easy auth state access
- [x] Create usePermission and useCanPerform hooks

### Row-Level Security (RLS)
- [x] Create RLS utilities for data filtering
- [x] Implement resource-based filtering by role
- [x] Add ownership-based access control
- [x] Create RLS middleware for tRPC

### Email Integration (TODO)
- [ ] Set up email service (SendGrid, Mailgun, etc.)
- [ ] Create email templates for password reset
- [ ] Create email templates for account verification
- [ ] Implement email sending in password recovery flow
- [ ] Implement email sending in registration flow

### Two-Factor Authentication (TODO)
- [ ] Implement 2FA setup endpoint
- [ ] Create 2FA verification during login
- [ ] Add TOTP/SMS options
- [ ] Create 2FA management UI

### Testing (TODO)
- [ ] Write vitest tests for auth endpoints
- [ ] Test password hashing and verification
- [ ] Test token generation and validation
- [ ] Test RBAC middleware
- [ ] Test RLS filtering
- [ ] Integration tests for login/register flow


## Admin User Management Panel Implementation (NEW)

### Database & Schema
- [x] Add status field to users table (active, suspended, inactive)
- [x] Add suspension tracking fields (suspendedAt, suspendedReason, suspendedBy)
- [x] Add status index for efficient filtering

### Database Functions
- [x] Create db-users.ts with user management operations
- [x] Implement getAllUsers with filtering and pagination
- [x] Implement getUserCount for pagination
- [x] Implement updateUserRole with audit logging
- [x] Implement suspendUser and reactivateUser functions
- [x] Implement getUserStatistics for dashboard
- [x] Implement getAllRoleChanges for audit log

### tRPC Endpoints
- [x] Create userManagement router with admin-only access
- [x] Implement listUsers endpoint with search and filtering
- [x] Implement getStatistics endpoint
- [x] Implement updateRole endpoint with validation
- [x] Implement suspendUser endpoint with reason tracking
- [x] Implement reactivateUser endpoint
- [x] Implement getRoleChangeHistory endpoint
- [x] Implement exportUsers endpoint for CSV export

### Frontend Components
- [x] Create UserListTable component with filtering and search
- [x] Add role, status, and date filters
- [x] Implement CSV export functionality
- [x] Create RoleAssignmentDialog with confirmation
- [x] Add role descriptions and warnings
- [x] Create SuspensionDialog with two-step confirmation
- [x] Add audit trail notices
- [x] Create AuditLogViewer component
- [x] Implement audit log table with pagination
- [x] Add CSV export for audit logs

### Admin Page
- [x] Create AdminUsers page layout
- [x] Add statistics dashboard with key metrics
- [x] Implement Users tab with UserListTable
- [x] Implement Audit Log tab with AuditLogViewer
- [x] Integrate all dialogs and handlers
- [x] Add refresh functionality
- [x] Protect page with admin-only access

### Features Implemented
- User listing with search and filtering
- Role assignment with confirmation dialog
- Account suspension/reactivation with reason tracking
- Audit log viewing with CSV export
- User statistics dashboard
- Role change history tracking
- CSV export for users and audit logs
- Two-step confirmation for critical actions
- Audit trail for all administrative actions


## Comprehensive Activity Logging System (NEW)

### Database Schema
- [x] Create activityLogs table with full tracking (action, resource, method, status, IP, user agent, duration, etc.)
- [x] Create loginAttempts table for tracking login attempts with failure reasons and lockout
- [x] Create suspiciousActivities table for flagging and reviewing suspicious behavior
- [x] Create apiRateLimits table for rate limiting and tracking
- [x] Create dataAccessLogs table for sensitive data access tracking
- [x] Add comprehensive indexes for efficient querying

### Activity Logging Service (activityLogger.ts)
- [x] Implement extractIpAddress function with proxy support (X-Forwarded-For, CF-Connecting-IP, etc.)
- [x] Implement extractUserAgent and extractReferer functions
- [x] Create logActivity function with request body sanitization
- [x] Create logLoginAttempt function with automatic lockout after 5 failed attempts
- [x] Create flagSuspiciousActivity function for security alerts
- [x] Create logDataAccess function for sensitive data tracking
- [x] Create checkRateLimit function with automatic flagging
- [x] Implement getActivityLogs with filtering and pagination
- [x] Implement getSuspiciousActivities with filtering

### tRPC Middleware
- [x] Create activityLoggingMiddleware for automatic API call logging
- [x] Implement request/response tracking with timing
- [x] Add rate limiting headers to responses
- [x] Create resourceAccessMiddleware for tracking resource access
- [x] Create sensitiveDataAccessMiddleware for sensitive operations

### Login/Logout Tracking (activityTracking.ts)
- [x] Create logLoginAttempt endpoint for recording login attempts
- [x] Create logLogout endpoint for tracking logouts
- [x] Create getActivityLogs endpoint (admin only)
- [x] Create getSuspiciousActivities endpoint (admin only)
- [x] Create getMyActivityLogs endpoint for user's own logs
- [x] Create getMyLoginHistory endpoint for login history
- [x] Create getActiveSessions endpoint for viewing active sessions
- [x] Create exportActivityLogs endpoint for CSV export
- [x] Create getActivityStatistics endpoint for analytics

### Data Access Logging (dataAccessLogger.ts)
- [x] Create logSensitiveDataAccess function
- [x] Define SENSITIVE_DATA_TYPES constants
- [x] Create createDataAccessLogger middleware factory
- [x] Implement specialized loggers for each data type (users, financial, audit, roles, config, API keys, locations, inventory)

### Frontend Components
- [x] Create ActivityLogViewer component with filtering and search
- [x] Add action, status, and IP address filters
- [x] Implement pagination and CSV export
- [x] Create SecurityDashboard component with metrics and suspicious activity detection
- [x] Add tabs for suspicious activities, top IPs, and top endpoints
- [x] Implement activity statistics visualization

### Admin Security Page (AdminSecurity.tsx)
- [x] Create comprehensive security monitoring page
- [x] Add Security Dashboard tab with key metrics
- [x] Add Activity Log tab with advanced filtering
- [x] Add Sessions tab with session management info
- [x] Add Guide tab with security best practices
- [x] Protect page with admin-only access

### Features Implemented
- Comprehensive activity logging for all user actions
- Login attempt tracking with automatic account lockout
- API call logging with performance metrics
- Sensitive data access tracking
- Suspicious activity detection and flagging
- Rate limiting with automatic alerts
- IP address extraction with proxy support
- Request body sanitization for security
- Activity statistics and analytics
- CSV export for compliance and auditing
- Security dashboard with real-time metrics
- Session management and monitoring
- Best practices guide for administrators


## Dynamic Permission Editor System (NEW)

### Database Schema (5 new tables)
- [x] Create permissions table with key, name, description, category, and risk level
- [x] Create rolePermissions table to map permissions to roles dynamically
- [x] Create permissionChanges table for auditing permission modifications
- [x] Create permissionGroups table for grouping related permissions
- [x] Create permissionGroupMembers table to link permissions to groups

### Permission Management Service (db-permissions.ts)
- [x] getAllPermissions: Fetch all permissions with filtering
- [x] getPermissionsByCategory: Filter permissions by category
- [x] getRolePermissions: Get all permissions for a specific role
- [x] hasPermission: Check if a role has a specific permission
- [x] grantPermission: Grant a permission to a role with audit logging
- [x] revokePermission: Remove a permission from a role with audit logging
- [x] updateRolePermissions: Bulk update all permissions for a role
- [x] getPermissionChangeHistory: Audit trail of permission changes
- [x] getPermissionGroups: Fetch permission groups
- [x] getGroupPermissions: Get permissions in a group
- [x] createPermission: Create new permission (for admins)
- [x] updatePermission: Modify permission details
- [x] deletePermission: Remove a permission
- [x] getRoleHierarchy: Get all permissions for all roles
- [x] getPermissionStats: Analytics on permission distribution

### tRPC Endpoints (permissionsRouter)
- [x] getAllPermissions: Query all permissions (admin only)
- [x] getPermissionsByCategory: Filter by category (admin only)
- [x] getRolePermissions: Get role's permissions (admin only)
- [x] hasPermission: Check if role has permission (admin only)
- [x] grantPermission: Grant permission to role (admin only, audited)
- [x] revokePermission: Revoke permission from role (admin only, audited)
- [x] updateRolePermissions: Bulk update permissions (admin only, audited)
- [x] getPermissionChangeHistory: View audit trail (admin only)
- [x] getPermissionGroups: Fetch groups (admin only)
- [x] getGroupPermissions: Get group members (admin only)
- [x] createPermission: Create new permission (admin only)
- [x] updatePermission: Modify permission (admin only)
- [x] deletePermission: Remove permission (admin only)
- [x] getRoleHierarchy: View role hierarchy (admin only)
- [x] getPermissionStats: View statistics (admin only)

### Frontend Components
- [x] PermissionMatrix: Interactive table with checkboxes for selecting permissions
  * Search by name, key, or description
  * Filter by category and risk level
  * Group permissions by category
  * Show risk level badges (low, medium, high, critical)
  * Select/deselect all in category
  * Display permission summary

- [x] RolePreviewPanel: Real-time preview of what a role can access
  * Role description and statistics
  * Permissions grouped by category with tabs
  * Visual indication of selected permissions
  * Access summary showing capabilities (users, machines, inventory, reports, settings, audit)
  * Risk level breakdown (critical, high risk counts)

### Permission Hierarchy & Inheritance (usePermissionHierarchy.ts)
- [x] ROLE_HIERARCHY: Define role levels (user < operator < manager < admin)
- [x] DEFAULT_ROLE_PERMISSIONS: Pre-configured permissions for each role
- [x] inheritsFrom: Check if role inherits from another
- [x] getInheritedPermissions: Get permissions from role and lower roles
- [x] getExclusivePermissions: Get role-specific permissions
- [x] getMinimumRoleForPermission: Find minimum role for a permission
- [x] isHighRiskPermission: Check if permission is high-risk
- [x] getConfigurationWarnings: Validate role configuration
- [x] suggestPermissionsForRole: Get recommended permissions
- [x] getRoleDescription: Get role description
- [x] getRoleDisplayName: Get role display name
- [x] getRoleColor: Get role UI color

### Permission Editor Page (AdminPermissions.tsx)
- [x] Role selector with permission count display
- [x] Permission matrix with advanced filtering
- [x] Real-time preview panel showing accessible features
- [x] Apply recommended permissions button
- [x] Save/Discard changes functionality
- [x] Unsaved changes warning
- [x] Configuration warnings display
- [x] Sticky action buttons at bottom
- [x] Tabs for matrix view and preview view
- [x] Loading states and error handling

### Permission Validation (permissionValidator.ts)
- [x] validatePermissions: Comprehensive validation of permission sets
  * Detect conflicting permissions
  * Detect suspicious combinations
  * Detect missing related permissions
  * Check for excessive critical/high-risk permissions
  * Return errors, warnings, and suggestions

- [x] detectConflicts: Find permission conflicts
  * Delete without view/create
  * Missing prerequisite permissions

- [x] detectSuspiciousCombinations: Find unusual permission patterns
  * Delete without create/update
  * Excessive admin permissions
  * Export without view

- [x] detectMissingRelatedPermissions: Suggest related permissions
  * Create requires view
  * Update requires view
  * Delete requires view and update
  * Export requires view

- [x] isSafeToGrant: Check if permission is safe for role
  * Critical permissions only for admins
  * High-risk permissions restricted for users

- [x] getPermissionImpact: Assess permission impact
  * Risk level
  * Description
  * Affected areas

- [x] comparePermissions: Diff two permission sets
  * Added permissions
  * Removed permissions
  * Unchanged permissions

- [x] generateAuditMessage: Create audit trail message

### Features Implemented
- Dynamic permission management without hardcoding
- Role-based permission assignment with inheritance
- Real-time preview of role capabilities
- Comprehensive validation and conflict detection
- Audit logging for all permission changes
- Permission grouping by category
- Risk level assessment (low, medium, high, critical)
- Recommended permissions for each role
- Configuration warnings and suggestions
- Bulk permission updates with change tracking
- Permission statistics and analytics
- Admin-only access control


## Automated Process Cleanup System (NEW)

### Cleanup Scripts (4 files)
- [x] cleanup-db-processes.mjs: Main cleanup utility that kills stale database migration processes
  * Detects processes matching patterns: db:push, db:pull, drizzle-kit, drizzle-migrate, pnpm db, tsx.*db, tsx.*migrate, esbuild.*service
  * Graceful shutdown with SIGTERM (5 second timeout) then SIGKILL if needed
  * Optional build artifact cleanup (--clean-build flag)
  * Optional port lock cleanup (--clean-ports flag)
  * Logging to .cleanup-log.txt file
  * Exit codes: 0 for success, 1 for failure

- [x] pre-migration.mjs: Pre-migration hook that runs before database operations
  * Automatically called before pnpm db:push
  * Runs cleanup-db-processes.mjs with --clean-build flag
  * Cleans up dist directory to ensure fresh build
  * Provides user feedback with emoji indicators

- [x] pre-start.mjs: Pre-start hook that runs before dev server starts
  * Automatically called before pnpm dev
  * Runs cleanup-db-processes.mjs with --clean-build and --clean-ports flags
  * Kills any processes using ports 3000, 5173, 5174, 8000, 8080
  * Ensures clean startup environment
  * Non-blocking: warns on errors but doesn't prevent startup

- [x] monitor-processes.mjs: Real-time process monitor (optional background service)
  * Runs continuously and checks for stale processes every 30 seconds
  * Tracks process age and kills processes older than 5 minutes
  * Kills drizzle-kit/db:push processes running longer than 2 minutes
  * Maintains process tracking file (.tracked-processes.json)
  * Logs to .process-monitor.log file
  * Can be run as background service: node scripts/monitor-processes.mjs &

### Package.json Script Updates
- [x] dev: Now runs pre-start.mjs before starting dev server
  * Command: node scripts/pre-start.mjs && NODE_ENV=development tsx watch server/_core/index.ts
  * Automatically cleans up stale processes and ports before starting

- [x] db:push: Now runs pre-migration.mjs before database operations
  * Command: node scripts/pre-migration.mjs && drizzle-kit generate && drizzle-kit migrate
  * Automatically cleans up stale processes and build artifacts before migration

- [x] db:cleanup: Manual cleanup of stale database processes
  * Command: node scripts/cleanup-db-processes.mjs
  * Can be run manually anytime: pnpm db:cleanup

- [x] db:cleanup:full: Full cleanup including build artifacts and port locks
  * Command: node scripts/cleanup-db-processes.mjs --clean-build --clean-ports
  * Can be run manually: pnpm db:cleanup:full

- [x] cleanup:processes: Alias for db:cleanup
  * Command: node scripts/cleanup-db-processes.mjs

- [x] cleanup:all: Alias for db:cleanup:full
  * Command: node scripts/cleanup-db-processes.mjs --clean-build --clean-ports

### Features
- Automatic cleanup before dev server starts
- Automatic cleanup before database migrations
- Manual cleanup commands for on-demand use
- Real-time monitoring option for background cleanup
- Graceful process termination with timeout
- Comprehensive logging to files
- Port lock detection and cleanup
- Build artifact cleanup
- Process tracking and history

### How It Works
1. **Dev Server Start:** When you run `pnpm dev`, pre-start.mjs runs first and:
   - Kills all stale db:push, drizzle-kit, and other database processes
   - Cleans up build artifacts (dist, .turbo, etc.)
   - Kills any processes using common dev ports (3000, 5173, etc.)
   - Then starts the dev server

2. **Database Migration:** When you run `pnpm db:push`, pre-migration.mjs runs first and:
   - Kills all stale database processes
   - Cleans up build artifacts
   - Then runs drizzle-kit generate and migrate

3. **Manual Cleanup:** You can manually run cleanup anytime:
   - `pnpm db:cleanup` - Kill stale database processes only
   - `pnpm db:cleanup:full` - Kill processes, clean build artifacts, and free ports

4. **Background Monitoring (Optional):** Run in another terminal:
   - `node scripts/monitor-processes.mjs` - Continuously monitors and kills stale processes

### Logging
- `.cleanup-log.txt` - Log of all cleanup operations
- `.process-monitor.log` - Log of background monitor activity
- `.tracked-processes.json` - JSON file tracking monitored processes

### Benefits
- Prevents server crashes from stale processes
- Eliminates database lock issues from orphaned migrations
- Frees up memory and system resources
- Ensures clean environment for dev and migrations
- Automatic cleanup without manual intervention
- Optional background monitoring for production environments


## GitHub Actions, Docker & System Health (NEW)

### GitHub Actions Workflow
- [x] .github/workflows/cleanup.yml: Automated cleanup workflow that:
  * Runs on every push to main/develop branches
  * Runs on every pull request to main/develop branches
  * Runs on schedule every 6 hours (cron job)
  * Installs dependencies and runs cleanup script
  * Kills stale database migration processes
  * Cleans up build artifacts
  * Frees up development ports
  * Creates workflow summary with cleanup logs
  * Posts failure notifications to PR comments
  * Posts success notifications to PR comments
  * Provides detailed health check report

### Dockerfile & Docker Compose
- [x] Dockerfile: Multi-stage production Docker image that:
  * Stage 1: Dependencies - Installs pnpm and dependencies
  * Stage 2: Builder - Builds the application with esbuild
  * Stage 3: Runtime - Lean production image with only runtime dependencies
  * Includes cleanup scripts for pre-startup cleanup
  * Runs as non-root nodejs user for security
  * Exposes port 3000
  * Includes health check endpoint
  * Startup script runs cleanup before starting app
  * Multi-stage build for minimal image size

- [x] docker-compose.yml: Development and production compose file that:
  * App service with environment variables
  * MySQL database service
  * Health checks for both services
  * Automatic restart policy
  * Volume mounts for logs and database
  * Network configuration for service communication
  * Depends on MySQL before starting app

### System Health Monitoring Service
- [x] systemHealthService.ts: Backend service that monitors:
  * Memory usage (total, used, free, percentage)
  * CPU usage (cores, usage percentage, load average)
  * Disk usage (total, used, free, percentage)
  * Process list (top 10 processes)
  * Stale processes detection
  * System uptime
  * Health status determination (healthy/warning/critical)
  * Issue detection and reporting
  * Process killing functionality
  * Byte formatting utilities
  * Uptime formatting utilities

### tRPC System Health Endpoints
- [x] systemHealth.ts: 8 tRPC endpoints for system monitoring:
  * getHealth: Get current system health status (admin only)
  * getProcesses: Get detailed process list (admin only)
  * getStaleProcesses: Get list of stale processes (admin only)
  * killProcess: Kill a specific process by PID (admin only)
  * killAllStaleProcesses: Kill all stale processes (admin only)
  * getMetrics: Get formatted metrics for dashboard (admin only)
  * healthCheck: Public health endpoint for Docker/Kubernetes (no auth)

### System Health Dashboard Widget
- [x] SystemHealthWidget.tsx: React component that:
  * Displays real-time system health metrics
  * Shows memory, CPU, disk, and stale process metrics
  * Color-coded status indicators (green/yellow/red)
  * Progress bars for resource usage
  * Auto-refresh every 30 seconds (toggleable)
  * One-click cleanup button for stale processes
  * Issues section with detailed problem list
  * Status icons and badges
  * Metric icons for visual distinction
  * Last updated timestamp
  * Responsive grid layout

### Admin Dashboard Page
- [x] AdminDashboard.tsx: Comprehensive admin dashboard that:
  * Displays system health widget at the top
  * Shows user statistics (total, active, admins, suspended)
  * Quick action buttons for common admin tasks
  * Links to user management, permissions, and security pages
  * System information card (Node version, environment, platform)
  * Help and documentation section
  * Refresh button to reload all data
  * Protected route (admin only)
  * Responsive layout for mobile and desktop

### Features
- Automated cleanup on every push/PR in CI/CD
- Scheduled cleanup every 6 hours in GitHub Actions
- Docker health checks every 30 seconds
- Real-time system monitoring in admin dashboard
- One-click cleanup from admin UI
- Automatic process killing on container startup
- Public health endpoint for Kubernetes/Docker monitoring
- Comprehensive logging and reporting
- Issue detection and alerting
- Non-blocking startup (warnings only)

### How It Works

**GitHub Actions Workflow:**
1. Triggered on push, PR, or schedule (every 6 hours)
2. Installs dependencies
3. Runs cleanup script
4. Creates workflow summary with logs
5. Posts success/failure comments to PRs
6. Provides health check report

**Docker Deployment:**
1. Multi-stage build for minimal image size
2. Health check every 30 seconds
3. Startup script runs cleanup before starting app
4. Non-root user for security
5. Automatic restart on failure
6. MySQL database with health checks

**Admin Dashboard:**
1. Real-time system metrics with color-coded status
2. Auto-refresh every 30 seconds
3. One-click cleanup button for stale processes
4. Issue detection and alerting
5. Quick links to other admin pages
6. System information display

### Benefits
- Prevents stale processes in CI/CD pipelines
- Ensures clean Docker deployments
- Real-time monitoring from admin UI
- Automatic cleanup without manual intervention
- Health checks for Docker/Kubernetes
- Comprehensive logging and auditing
- Non-blocking operations (warnings only)
- Production-ready monitoring


## Historical Performance Analytics (COMPLETED)

### Database Schema ✅
- [x] performanceMetrics table: Stores raw metrics every minute
- [x] performanceMetricsHourly table: Hourly aggregated metrics
- [x] performanceMetricsDaily table: Daily aggregated metrics

### Performance Metrics Service ✅
- [x] performanceMetricsService.ts: Automatic collection and aggregation

### tRPC Endpoints (7 endpoints) ✅
- [x] getMetricsRange, getHourlyMetrics, getDailyMetrics, getStatistics, getLast24Hours, getTrends, getDaySummary, comparePeriods

### Chart Components ✅
- [x] PerformanceLineChart, PerformanceAreaChart, HourlyPerformanceChart, PerformanceStatistics, PerformanceComparison

### Admin Analytics Page ✅
- [x] AdminAnalytics.tsx with 4 tabs (Overview, Trends, Statistics, Comparison)

### Export Functionality ✅
- [x] performanceExport.ts with CSV, JSON, and text export utilities

---

## Real-Time Performance Alerts (NEW)

### Database Schema
- [x] alertRules table: Stores alert configuration with metric, threshold, operator, escalation levels
- [x] alertHistory table: Logs all triggered alerts with timestamp, metric value, rule ID, status
- [x] alertEscalation table: Defines escalation policies (notify user, notify admin, auto-action)
- [x] alertNotifications table: Tracks notification delivery

### Alert Rules Service
- [x] alertRulesService.ts: Complete service with:
  * Checking metrics against rules with configurable operators
  * Triggering notifications when thresholds exceeded
  * Managing escalation policies with multi-level actions
  * Tracking alert state (active, acknowledged, resolved)
  * Preventing alert spam with cooldown periods
  * Batch alert checking for all enabled rules

### tRPC Endpoints
- [x] createRule: Create new alert rule
- [x] updateRule: Update existing rule
- [x] deleteRule: Delete rule
- [x] listRules: Get all rules
- [x] getRule: Get single rule by ID
- [x] getHistory: Get triggered alerts with filtering
- [x] getActive: Get currently active alerts
- [x] acknowledgeAlert: Mark alert as acknowledged
- [x] resolveAlert: Mark alert as resolved
- [x] testRule: Test rule with current metrics
- [x] checkAll: Admin-only batch checking
### Alert Configuration UI (COMPLETED)
- [x] AlertRulesEditor component: Form to create/edit rules
- [x] AlertRulesList component: List view with all rules
- [x] AlertHistoryViewer component: Timeline view of triggered alertsFeatures
- Configurable thresholds for each metric (memory, CPU, disk)
- Multiple operators (>, <, >=, <=, ==)
- Escalation policies (notify user, notify admin, auto-action)
- Cooldown periods to prevent alert spam
- Alert acknowledgment and resolution tracking
- Alert history with filtering and search
- Test alert functionality
- Enable/disable rules without deleting

---

## Performance Recommendations Engine (NEW)

### Analysis Service
- [x] performanceRecommendationsService.ts: Complete service with:
  * Analyzing historical data patterns from daily metrics
  * Detecting peak usage times by hour
  * Identifying trends (increasing, decreasing, stable)
  * Calculating growth rates and days to threshold
  * Generating actionable recommendations
  * 24-hour caching to avoid repeated analysis

### Recommendation Types
- [x] Peak Usage Detection: "Peak memory at 2 PM (82%), consider scaling up"
- [x] Trend Analysis: "Memory increasing 2%/day, critical in 5 days"
- [x] Cost Optimization: "CPU 35% avg, consider downsizing to save 20-30%"
- [x] Capacity Planning: "Disk 70% avg, plan upgrade for future growth"
- [x] Performance Improvement: "Implement caching to reduce peak CPU by 15%"

### tRPC Endpoints
- [x] getAll: Get all recommendations with stats
- [x] getByType: Filter by recommendation type
- [x] getCritical: Get critical recommendations only
- [x] getStats: Get summary statistics
- [x] refresh: Force re-analysis (admin only)

### Recommendation Display
- [ ] RecommendationCard component: Single recommendation display
- [ ] RecommendationsPanel component: List of all recommendations

### Features
- Automatic analysis of historical data
- Pattern detection (peaks, trends, anomalies)
- Actionable recommendations with estimated impact
- Dismissal tracking to avoid duplicate suggestions
- Implementation tracking for follow-up
- Severity levels (info, warning, critical)
- Time-based recommendations (daily, weekly, monthly)

---

## Custom Date Range Picker (NEW)

### DateRangePicker Component
- [x] client/src/components/DateRangePicker.tsx: Enhanced component with:
  * Preset buttons (All Time, 24h, 7d, 30d, 90d)
  * Dual month calendar view
  * Start and end date selection
  * Clear/Reset button
  * Validation (end date >= start date)
  * Responsive design for mobile
  * Dark theme styling
  * Backward compatible with existing API

### Features
- [x] Click start date, then end date to select range
- [x] Keyboard navigation support
- [x] Visual feedback for selected dates (blue/green)
- [x] Disabled future dates
- [x] Preset quick-select buttons
- [x] Custom range selection with calendar
- [x] Export selected range as ISO strings
- [x] Multiple callback support (onDateRangeChange, onRangeChange, onPresetChange)

### Integration
- [x] Updated AdminAnalytics.tsx to use DateRangePicker
- [x] Replaced fixed time range buttons with picker
- [x] Added custom date range state management
- [x] Updated chart titles to show selected range
- [x] Integrated with existing chart queries


## Alert Rules UI Components (COMPLETED)

### AlertRulesEditor Component ✅
- [x] Create AlertRulesEditor.tsx with form for creating/editing rules
- [x] Form fields: name, description, metric selector, threshold input
- [x] Operator selector (>, <, >=, <=, ==)
- [x] Escalation level selector (low, medium, high, critical)
- [x] Cooldown minutes input with validation
- [x] Notification toggles (notifyUser, notifyAdmin)
- [x] Auto-action selector (optional)
- [x] Enable/disable toggle
- [x] Submit and cancel buttons
- [x] Form validation with error messages
- [x] Loading state during submission

### AlertRulesList Component ✅
- [x] Create AlertRulesList.tsx with card-based view
- [x] Display: name, metric, threshold, operator, status, escalation level
- [x] Edit button for each rule
- [x] Delete button with confirmation dialog
- [x] Enable/disable status badge
- [x] Test button to trigger test alert
- [x] Search/filter by name or metric
- [x] Sorting by name, metric, threshold
- [x] Empty state when no rules exist
- [x] Success/error toast notifications
- [x] Responsive design with color-coded badges

### AlertHistoryViewer Component ✅
- [x] Create AlertHistoryViewer.tsx with timeline view
- [x] Display: timestamp, metric, value, threshold, status
- [x] Status badges (active, acknowledged, resolved)
- [x] Acknowledge button for active alerts
- [x] Resolve button for acknowledged alerts
- [x] Filter by status and date range
- [x] Search by metric
- [x] Severity color coding
- [x] Export button (CSV)
- [x] Statistics cards (active, acknowledged, resolved counts)
- [x] Date range picker integration

### AlertsDashboard Page ✅
- [x] Create Alerts.tsx page component
- [x] Header with title and refresh button
- [x] Tabs: Rules, History, Statistics
- [x] Rules tab: AlertRulesList with create button
- [x] History tab: AlertHistoryViewer with filters
- [x] Statistics tab: Alert counts and tips
- [x] Active alerts summary card with badge
- [x] Quick actions (create rule, refresh, export)
- [x] Responsive layout for mobile/tablet
- [x] Protected route (admin only)

### Integration ✅
- [x] Add Alerts route to App.tsx
- [x] Add Alerts link to sidebar navigation
- [x] Import Alerts page in App.tsx
- [x] Add AlertCircle icon to navigation
- [x] Update navigation with "Оповещения" (Notifications) label


## Authentication System Implementation (NEW)

### Phase 1: Registration & Login Pages
- [ ] Remove role selection from Registration page
- [ ] Simplify Registration to only email + password fields
- [ ] Simplify Login to only email + password fields
- [ ] Remove OnboardingWizard component (role selection)
- [ ] Update auth routing to skip role selection

### Phase 2: Automatic Account Creation on Approval
- [ ] Generate username from full name (e.g., "aziz_petrov")
- [ ] Generate temporary password (8+ chars, uppercase, lowercase, numbers)
- [ ] Create user account automatically when admin approves request
- [ ] Link Telegram ID to created user account
- [ ] Mark account as "first_login_required" flag

### Phase 3: Send Credentials via Telegram
- [ ] Send Telegram message with username and temporary password
- [ ] Format message: "Доступ предоставлен! Логин: {username}, Пароль: {temp_password}"
- [ ] Include link to web application
- [ ] Send via Telegram Bot API after account creation

### Phase 4: Mandatory Password Change on First Login
- [ ] Detect first login (check "first_login_required" flag)
- [ ] Show password change dialog on login
- [ ] Require new password before accessing dashboard
- [ ] Validate password strength (8+ chars, uppercase, lowercase, numbers)
- [ ] Clear "first_login_required" flag after successful change
- [ ] Show profile completion form after password change

### Phase 5: Access & Refresh Token System
- [ ] Implement JWT-based token generation
- [ ] Access token: 15-30 minutes expiration
- [ ] Refresh token: 7-30 days expiration
- [ ] Store refresh tokens in database
- [ ] Implement token refresh endpoint
- [ ] Implement automatic token refresh in frontend
- [ ] Implement token rotation on refresh

### Phase 6: Two-Factor Authentication (2FA)
- [ ] Make 2FA mandatory for SuperAdmin and Admin roles
- [ ] Implement TOTP (Time-based One-Time Password) with Google Authenticator
- [ ] Generate QR code for 2FA setup
- [ ] Store 2FA secret in database
- [ ] Verify 6-digit codes on login
- [ ] Block login without correct 2FA code
- [ ] Implement backup codes for account recovery

### Phase 7: Brute-Force Protection
- [ ] Track failed login attempts per user
- [ ] Lock account after 5 failed attempts
- [ ] Implement 15-minute lockout period
- [ ] Log all failed attempts with IP address
- [ ] Show lockout message to user
- [ ] Allow admin to unlock accounts manually
- [ ] Send email notification on account lockout

### Phase 8: Password Recovery
- [ ] Implement "Forgot Password" page
- [ ] Send password reset email with time-limited link
- [ ] Validate reset token expiration (24 hours)
- [ ] Allow user to set new password
- [ ] Invalidate all refresh tokens on password reset
- [ ] Logout user from all devices on password reset
- [ ] Log password reset in audit log

### Phase 9: Session Management & Logout
- [ ] Implement logout endpoint
- [ ] Invalidate refresh token on logout
- [ ] Clear session cookies
- [ ] Logout user from current device only
- [ ] Implement "logout from all devices" option
- [ ] Log logout events in audit log
- [ ] Handle token expiration gracefully

### Phase 10: Account Blocking & Admin Controls
- [ ] Add "blocked" status to users table
- [ ] Implement block/unblock endpoints
- [ ] Immediately terminate all active sessions on block
- [ ] Invalidate all tokens on block
- [ ] Prevent login attempts from blocked accounts
- [ ] Log blocking action with reason
- [ ] Show "Account blocked" message to user
- [ ] Allow admin to provide unblock reason

### Phase 11: Telegram Bot Commands for Authenticated Users
- [ ] Implement /tasks command - show today's tasks
- [ ] Implement /status command - show task status
- [ ] Implement /complete command - mark task as completed
- [ ] Implement /photo command - upload task photo
- [ ] Implement /location command - send geolocation
- [ ] Implement /help command - show available commands
- [ ] Restrict commands based on user role
- [ ] Log all bot interactions in audit log

### Phase 12: Testing & Verification
- [ ] Test registration and login flows
- [ ] Test automatic account creation on approval
- [ ] Test temporary password and first login
- [ ] Test token refresh mechanism
- [ ] Test 2FA setup and verification
- [ ] Test brute-force protection
- [ ] Test password recovery
- [ ] Test session management
- [ ] Test account blocking
- [ ] Test Telegram bot commands
- [ ] Test audit logging
- [ ] Verify all security features work correctly


## Authentication System Implementation
- [x] Fix syntax errors in routers.ts (remove duplicate closing braces)
- [x] Add missing createUser function to db.ts
- [x] Update approve access request endpoint to generate credentials
- [x] Generate temporary username from full name
- [x] Generate temporary password (8+ chars with uppercase, lowercase, numbers, special chars)
- [x] Create user account automatically on access request approval
- [x] Update Login component to use username instead of email
- [x] Add getUserByUsername function to db-auth.ts
- [x] Update auth router login endpoint to support username
- [x] Add isTemporaryPassword and isFirstLogin fields to users table schema
- [x] Implement mandatory password change on first login
- [x] Create MandatoryPasswordChange component
- [x] Update App.tsx to show password change screen after first login
- [ ] Implement access token and refresh token system
- [ ] Implement 2FA for SuperAdmin and Admin roles
- [ ] Implement brute-force protection and account lockout
- [ ] Implement password recovery via email
- [ ] Implement session management and logout
- [ ] Implement account blocking and admin controls
- [ ] Implement Telegram bot commands for authenticated users
- [ ] Test all authentication flows end-to-end
