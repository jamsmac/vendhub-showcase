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

## New Features - Role Change History
- [x] Create role_changes database table
- [x] Track role modifications with old/new values
- [x] Add API endpoints for role change logs (list, byUserId)
- [x] Create "Role Changes" tab in UI (4th tab)
- [x] Display role change timeline with details
- [x] Show old/new role badges with color coding
- [x] Include admin name and timestamp for each change
