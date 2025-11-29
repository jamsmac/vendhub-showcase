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
