# Tasks Page (Задачи) - Enhanced Feature Requirements

**Document Version**: 1.0  
**Last Updated**: November 30, 2025  
**Status**: Draft for Implementation

---

## Executive Summary

This document outlines comprehensive feature requirements for enhancing the Tasks (Задачи) page with advanced operator assignment notifications, priority management system, and improved task lifecycle management. The enhancements focus on improving team collaboration, task visibility, and operational efficiency.

---

## 1. Operator Assignment & Notifications System

### 1.1 Operator Assignment Features

#### 1.1.1 Assign Task to Operator
**Requirement**: Enable task assignment to specific team members with real-time notifications.

**Acceptance Criteria**:
- [ ] Task card displays "Assign to" dropdown/modal
- [ ] Shows list of available operators (team members)
- [ ] Displays operator avatar and name
- [ ] Shows operator's current workload (number of assigned tasks)
- [ ] Allows reassignment to different operator
- [ ] Shows assignment timestamp
- [ ] Supports bulk assignment to multiple tasks
- [ ] Assignment history is tracked

**UI Components**:
```
Task Card
├── Assignee Badge
│   ├── Avatar (circular with initials)
│   ├── Operator Name
│   └── "Assign" button (if unassigned)
├── Assignment Modal
│   ├── Search operator by name
│   ├── Filter by department/role
│   ├── Show operator availability status
│   ├── Display current workload
│   └── Confirm assignment button
```

**Data Structure**:
```typescript
interface TaskAssignment {
  taskId: number;
  assignedTo: number; // operator ID
  assignedBy: number; // user ID who assigned
  assignedAt: Date;
  previousAssignee?: number;
  reassignmentReason?: string;
  notificationSent: boolean;
}
```

#### 1.1.2 Operator Workload Display
**Requirement**: Show operator's current task load and capacity.

**Acceptance Criteria**:
- [ ] Display count of assigned tasks per operator
- [ ] Show breakdown by status (Pending/In Progress/Completed)
- [ ] Display average task completion time
- [ ] Show operator availability status (Available/Busy/On Leave)
- [ ] Visual indicator for overloaded operators (red warning)
- [ ] Prevent assignment if operator is at capacity (optional)
- [ ] Show estimated completion time for all assigned tasks

**Metrics to Display**:
- Total assigned tasks: 5
- In progress: 2
- Pending: 3
- Completed today: 4
- Average completion time: 2.5 hours
- Availability: Available

### 1.2 Notification System

#### 1.2.1 Real-Time Assignment Notifications
**Requirement**: Notify operators when tasks are assigned to them.

**Acceptance Criteria**:
- [ ] Toast notification appears immediately upon assignment
- [ ] In-app notification bell shows count of new notifications
- [ ] Notification includes task title, priority, and due date
- [ ] Notification has action buttons (View Task / Dismiss)
- [ ] Sound alert for high-priority/urgent assignments (optional)
- [ ] Email notification sent to operator (backend)
- [ ] SMS notification for critical tasks (optional)
- [ ] Notification persistence (stored in database)

**Notification Types**:
```typescript
enum NotificationType {
  TASK_ASSIGNED = "task_assigned",
  TASK_REASSIGNED = "task_reassigned",
  TASK_URGENT = "task_urgent",
  TASK_OVERDUE = "task_overdue",
  TASK_COMPLETED = "task_completed",
  TASK_COMMENT = "task_comment",
}
```

**Notification Content**:
```
🔔 New Task Assigned
Title: "Пополнить автомат снеками"
Priority: High (🔴)
Due: Today, 14:00
Machine: Lobby Snack #04

[View Task] [Dismiss]
```

#### 1.2.2 Notification Preferences
**Requirement**: Allow operators to customize notification settings.

**Acceptance Criteria**:
- [ ] Toggle in-app notifications on/off
- [ ] Toggle email notifications on/off
- [ ] Toggle SMS notifications on/off
- [ ] Set notification quiet hours (e.g., 6 PM - 8 AM)
- [ ] Filter notifications by priority level
- [ ] Filter notifications by task type
- [ ] Notification history/archive view
- [ ] Mark notifications as read/unread
- [ ] Bulk clear notifications

**Settings Interface**:
```
Notification Preferences
├── In-App Notifications
│   ├── ☑ Enable
│   ├── ☑ Sound alerts
│   └── ☑ Desktop notifications
├── Email Notifications
│   ├── ☑ Enable
│   ├── ☑ High priority only
│   └── ☑ Daily digest
├── SMS Notifications
│   ├── ☑ Enable
│   ├── ☑ Urgent only
│   └── Phone: +998 XX XXX XX XX
├── Quiet Hours
│   ├── From: 18:00
│   └── To: 08:00
└── Notification History
    └── [View All]
```

#### 1.2.3 Notification Center
**Requirement**: Centralized view of all notifications with filtering and search.

**Acceptance Criteria**:
- [ ] Bell icon in header with unread count badge
- [ ] Click bell to open notification panel/modal
- [ ] Display notifications in reverse chronological order
- [ ] Show notification timestamp (relative time: "5 minutes ago")
- [ ] Filter by notification type (All/Task Assigned/Overdue/etc.)
- [ ] Filter by priority (All/Urgent/High/Medium/Low)
- [ ] Search notifications by task title or operator name
- [ ] Mark as read/unread individually or in bulk
- [ ] Archive/delete notifications
- [ ] Pagination or infinite scroll for many notifications
- [ ] Show notification details on click

**Notification Panel Layout**:
```
Notification Center
├── Header
│   ├── Title: "Notifications (5)"
│   ├── Filter dropdown
│   └── Search bar
├── Notification List
│   ├── Notification Item 1
│   │   ├── Icon (type indicator)
│   │   ├── Title & Description
│   │   ├── Timestamp
│   │   └── Action buttons
│   ├── Notification Item 2
│   └── ...
├── Footer
│   ├── "Mark all as read"
│   └── "Clear all"
```

---

## 2. Task Priority Management System

### 2.1 Priority Levels

**Requirement**: Implement comprehensive priority system with visual indicators and filtering.

**Priority Levels**:
| Level | Label | Color | Icon | Description |
|-------|-------|-------|------|-------------|
| 1 | Urgent (Срочно) | Red (#EF4444) | 🔴 | Requires immediate action, impacts operations |
| 2 | High (Высокий) | Orange (#F97316) | 🟠 | Important, should be done today |
| 3 | Medium (Средний) | Yellow (#EAB308) | 🟡 | Normal priority, routine work |
| 4 | Low (Низкий) | Green (#22C55E) | 🟢 | Can be deferred, non-urgent |

**Acceptance Criteria**:
- [ ] Each task has a priority level (required field)
- [ ] Priority displayed as colored badge on task card
- [ ] Priority icon visible in task list
- [ ] Priority can be changed after task creation
- [ ] Color coding consistent across all views
- [ ] Priority affects task ordering in kanban board
- [ ] Default priority is "Medium"
- [ ] Priority change is logged in task history

### 2.2 Priority-Based Filtering

**Requirement**: Filter and sort tasks by priority level.

**Acceptance Criteria**:
- [ ] Filter button in task header
- [ ] Multi-select filter (can select multiple priorities)
- [ ] "Show only Urgent and High" quick filter button
- [ ] Filter persists during session
- [ ] Show count of tasks per priority level
- [ ] Visual indicator of active filters
- [ ] Clear filters button
- [ ] Filter options:
  - All priorities
  - Urgent only
  - High & Urgent
  - Medium & above
  - Low priority
  - Custom selection

**Filter UI**:
```
Priority Filter
├── 🔴 Urgent (2)
├── 🟠 High (5)
├── 🟡 Medium (8)
├── 🟢 Low (3)
└── [Apply] [Clear]
```

### 2.3 Priority-Based Sorting

**Requirement**: Sort tasks by priority and other criteria.

**Acceptance Criteria**:
- [ ] Sort by priority (high to low / low to high)
- [ ] Sort by due date (nearest first)
- [ ] Sort by creation date (newest/oldest)
- [ ] Sort by assignee name (A-Z)
- [ ] Sort by status
- [ ] Multi-level sorting (primary + secondary)
- [ ] Sort preference persists
- [ ] Visual indicator of current sort order
- [ ] Ascending/descending toggle

**Sort Options**:
```
Sort By
├── Priority (High → Low) ✓
├── Priority (Low → High)
├── Due Date (Nearest)
├── Due Date (Latest)
├── Created Date (Newest)
├── Created Date (Oldest)
├── Assignee (A-Z)
└── Status
```

### 2.4 Priority-Based Notifications

**Requirement**: Enhanced notifications based on task priority.

**Acceptance Criteria**:
- [ ] Urgent tasks trigger immediate notification
- [ ] High priority tasks get visual emphasis
- [ ] Sound alert for urgent assignments
- [ ] Desktop notification for urgent tasks
- [ ] Urgent tasks appear at top of notification list
- [ ] Different notification styling per priority
- [ ] Urgent task overdue triggers escalation notification
- [ ] Allow notification rules per priority level

**Notification Rules**:
```
Urgent (Срочно)
├── Immediate in-app notification
├── Sound alert enabled
├── Desktop notification
├── Email notification
└── SMS notification (if enabled)

High (Высокий)
├── In-app notification
├── Desktop notification
├── Email notification
└── SMS (optional)

Medium (Средний)
├── In-app notification
├── Email (optional)
└── SMS (disabled)

Low (Низкий)
├── In-app notification only
└── Email (optional)
```

---

## 3. Enhanced Task Card Display

### 3.1 Task Card Components

**Requirement**: Improve task card with priority and assignment information.

**Acceptance Criteria**:
- [ ] Priority badge with color and icon
- [ ] Assignee avatar and name
- [ ] Task type indicator (Пополнение/Ремонт/Обслуживание)
- [ ] Due date with relative time format
- [ ] Machine location reference
- [ ] Task description preview (truncated)
- [ ] Quick action buttons (Edit/Delete/Reassign)
- [ ] Hover effects for better UX
- [ ] Responsive layout for mobile

**Task Card Layout**:
```
┌─────────────────────────────────────┐
│ 🔴 Urgent  [Edit] [Delete]          │
│                                      │
│ Пополнить автомат снеками           │
│ Необходимо пополнить запасы снеков  │
│                                      │
│ 📍 Lobby Snack #04                  │
│ 🕐 Today, 14:00 (in 2 hours)        │
│                                      │
│ Assigned to:                         │
│ [Avatar] Иван Иванов                │
│                                      │
│ Type: Пополнение                    │
└─────────────────────────────────────┘
```

### 3.2 Task Status Indicators

**Requirement**: Clear visual indication of task status.

**Status Types**:
| Status | Label | Color | Icon |
|--------|-------|-------|------|
| pending | Pending (Ожидание) | Gray | ⏳ |
| in-progress | In Progress (В работе) | Blue | 🔵 |
| completed | Completed (Завершено) | Green | ✅ |
| overdue | Overdue (Просрочено) | Red | ⚠️ |
| on-hold | On Hold (Отложено) | Orange | ⏸️ |

**Acceptance Criteria**:
- [ ] Status displayed on task card
- [ ] Status color matches priority scheme
- [ ] Status can be changed via drag-drop or dropdown
- [ ] Status change triggers notification
- [ ] Status history is tracked
- [ ] Overdue tasks highlighted in red
- [ ] Completed tasks show completion time

---

## 4. Task Lifecycle Management

### 4.1 Task Creation with Priority

**Requirement**: Create tasks with priority level during creation.

**Acceptance Criteria**:
- [ ] Priority dropdown in task creation dialog
- [ ] Priority is required field
- [ ] Default priority is "Medium"
- [ ] Priority can be changed before submission
- [ ] Visual preview of priority badge in dialog
- [ ] Help text explaining priority levels
- [ ] Priority recommendation based on task type

**Create Task Form**:
```
Create New Task
├── Title (required)
├── Description
├── Machine (select)
├── Type (select)
├── Priority (required)
│   ├── 🔴 Urgent
│   ├── 🟠 High
│   ├── 🟡 Medium (default)
│   └── 🟢 Low
├── Assign to (select operator)
├── Due Date (date picker)
└── [Create] [Cancel]
```

### 4.2 Task Status Transitions

**Requirement**: Control valid status transitions.

**Valid Transitions**:
```
Pending (Ожидание)
├── → In Progress (when assigned)
├── → On Hold (if blocked)
└── → Completed (if no work needed)

In Progress (В работе)
├── → Completed (when done)
├── → On Hold (if blocked)
└── → Pending (if reassigned)

On Hold (Отложено)
├── → In Progress (resume)
├── → Pending (reassign)
└── → Completed (if resolved)

Completed (Завершено)
└── → Pending (if needs rework)

Overdue (Просрочено)
├── → In Progress (resume)
├── → Completed (complete late)
└── → Pending (reassign)
```

**Acceptance Criteria**:
- [ ] Only valid transitions allowed
- [ ] Status change requires confirmation for some transitions
- [ ] Reason/notes required for certain transitions
- [ ] Status change timestamp recorded
- [ ] Status change triggers appropriate notifications
- [ ] Completed tasks show completion timestamp

### 4.3 Task History & Audit Trail

**Requirement**: Track all changes to task.

**Acceptance Criteria**:
- [ ] View task history/timeline
- [ ] Show all status changes with timestamp
- [ ] Show all priority changes with reason
- [ ] Show all reassignments with reason
- [ ] Show comments and notes
- [ ] Show who made each change
- [ ] Sortable history (newest/oldest first)
- [ ] Export task history
- [ ] Undo last change (optional)

**History Item Format**:
```
[Timestamp] [User] [Action]
2025-11-30 14:30 Иван Иванов Assigned to Михаил Смирнов
2025-11-30 14:25 Admin Priority changed: Medium → High
2025-11-30 14:20 Иван Иванов Status: Pending → In Progress
2025-11-30 14:00 Admin Task created
```

---

## 5. Advanced Filtering & Search

### 5.1 Multi-Criteria Filtering

**Requirement**: Filter tasks by multiple criteria simultaneously.

**Filter Options**:
- [ ] Status (Pending/In Progress/Completed/Overdue/On Hold)
- [ ] Priority (Urgent/High/Medium/Low)
- [ ] Assignee (specific operator or unassigned)
- [ ] Task Type (Пополнение/Ремонт/Обслуживание/Инспекция)
- [ ] Machine (specific machine or all)
- [ ] Due Date (Today/Tomorrow/This Week/Overdue)
- [ ] Created Date (Last 24h/This Week/This Month)
- [ ] My Tasks (only assigned to current user)
- [ ] Unassigned Tasks (no operator assigned)

**Acceptance Criteria**:
- [ ] Multiple filters can be applied simultaneously
- [ ] Filter combinations persist during session
- [ ] Show count of tasks matching filters
- [ ] Visual indicator of active filters
- [ ] Quick filter buttons for common combinations
- [ ] Save filter presets
- [ ] Clear all filters button
- [ ] Filter results update in real-time

### 5.2 Search Functionality

**Requirement**: Search tasks by title, description, and other fields.

**Acceptance Criteria**:
- [ ] Search by task title
- [ ] Search by task description
- [ ] Search by machine name/location
- [ ] Search by operator name
- [ ] Search by task ID
- [ ] Case-insensitive search
- [ ] Partial word matching
- [ ] Search results highlight matching text
- [ ] Search suggestions/autocomplete
- [ ] Search history (optional)
- [ ] Clear search button

**Search Box**:
```
🔍 Search tasks by title, machine, or operator...
[Clear] [Recent Searches ▼]
```

---

## 6. Dashboard & Analytics

### 6.1 Tasks Overview Dashboard

**Requirement**: High-level view of task metrics.

**Metrics to Display**:
- [ ] Total tasks (all time)
- [ ] Tasks by status (Pending/In Progress/Completed)
- [ ] Tasks by priority (Urgent/High/Medium/Low)
- [ ] Overdue tasks count
- [ ] Completion rate (%)
- [ ] Average completion time
- [ ] Tasks assigned today
- [ ] Unassigned tasks count

**Dashboard Cards**:
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Tasks  │ In Progress  │ Completed    │ Overdue      │
│      24      │       5      │      12      │       2      │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 🔴 Urgent    │ 🟠 High      │ 🟡 Medium    │ 🟢 Low       │
│       2      │       5      │       8      │       9      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 6.2 Operator Performance Metrics

**Requirement**: Track operator productivity and performance.

**Metrics**:
- [ ] Tasks completed per operator
- [ ] Average completion time per operator
- [ ] Completion rate (%) per operator
- [ ] Current workload per operator
- [ ] On-time completion rate
- [ ] Task quality rating (if available)
- [ ] Response time to assignments

**Operator Stats Table**:
```
Operator          | Assigned | Completed | Avg Time | On-Time %
Иван Иванов       |    8     |     6     |  2.5h   |   83%
Михаил Смирнов    |    5     |     5     |  2.0h   |   100%
Сара Джонсон      |    7     |     4     |  3.2h   |   71%
```

---

## 7. Mobile Responsiveness

### 7.1 Mobile Task View

**Requirement**: Optimize task display for mobile devices.

**Acceptance Criteria**:
- [ ] Single column layout on mobile
- [ ] Touch-friendly task cards (larger tap targets)
- [ ] Simplified filter interface
- [ ] Swipe gestures for status changes
- [ ] Collapsible task details
- [ ] Mobile-optimized kanban (horizontal scroll)
- [ ] Bottom sheet for task creation
- [ ] Notification badge visible on mobile
- [ ] Performance optimized for slow connections

### 7.2 Mobile Notifications

**Acceptance Criteria**:
- [ ] Push notifications on mobile
- [ ] In-app notification badge
- [ ] Notification sound/vibration
- [ ] Quick actions from notification
- [ ] Notification settings in mobile app

---

## 8. Integration Points

### 8.1 Backend API Requirements

**Endpoints Needed**:
```
GET    /api/tasks                    # List all tasks
GET    /api/tasks/:id                # Get task details
POST   /api/tasks                    # Create task
PUT    /api/tasks/:id                # Update task
DELETE /api/tasks/:id                # Delete task
PATCH  /api/tasks/:id/status         # Update status
PATCH  /api/tasks/:id/priority       # Update priority
PATCH  /api/tasks/:id/assign         # Assign to operator
GET    /api/tasks/:id/history        # Get task history
GET    /api/operators                # List operators
GET    /api/operators/:id/workload   # Get operator workload
POST   /api/notifications            # Create notification
GET    /api/notifications            # List notifications
PATCH  /api/notifications/:id/read   # Mark as read
```

### 8.2 WebSocket Events (Real-Time)

**Events**:
```
task:created          # New task created
task:updated          # Task details updated
task:status-changed   # Status changed
task:priority-changed # Priority changed
task:assigned         # Task assigned to operator
task:reassigned       # Task reassigned
notification:new      # New notification
notification:read     # Notification marked as read
operator:online       # Operator came online
operator:offline      # Operator went offline
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Task priority levels UI
- [ ] Priority filtering and sorting
- [ ] Operator assignment dropdown
- [ ] Basic assignment notifications (toast)
- [ ] Task card enhancements with priority display

### Phase 2: Notifications (Week 2)
- [ ] Notification center UI
- [ ] Notification preferences
- [ ] Real-time notifications (WebSocket)
- [ ] Notification history
- [ ] Email notification backend

### Phase 3: Advanced Features (Week 3)
- [ ] Task history and audit trail
- [ ] Advanced filtering and search
- [ ] Operator workload display
- [ ] Dashboard and analytics
- [ ] Mobile optimizations

### Phase 4: Polish & Testing (Week 4)
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Bug fixes and refinements

---

## 10. Success Metrics

### Quantitative Metrics
- [ ] Task assignment time < 30 seconds
- [ ] Notification delivery < 2 seconds
- [ ] Page load time < 2 seconds
- [ ] 95% of notifications delivered successfully
- [ ] 99% uptime for notification system

### Qualitative Metrics
- [ ] Operators report improved task visibility
- [ ] Managers report better task tracking
- [ ] Team reports improved communication
- [ ] Reduced task assignment errors
- [ ] Improved task completion rate

---

## 11. Acceptance Criteria Checklist

### Priority System
- [ ] All 4 priority levels implemented
- [ ] Color coding consistent
- [ ] Priority filtering works correctly
- [ ] Priority sorting works correctly
- [ ] Priority change notifications sent

### Assignment System
- [ ] Tasks can be assigned to operators
- [ ] Reassignment works correctly
- [ ] Assignment history tracked
- [ ] Operator workload displayed
- [ ] Bulk assignment supported

### Notification System
- [ ] Toast notifications appear
- [ ] Notification center accessible
- [ ] Notifications persist
- [ ] Notification preferences work
- [ ] Real-time updates working

### UI/UX
- [ ] Mobile responsive
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] Consistent design language
- [ ] Smooth animations
- [ ] Error handling and validation

---

## 12. Dependencies & Constraints

### Technical Dependencies
- Backend API for task management
- WebSocket support for real-time updates
- Email service for notifications
- Database schema updates
- Authentication system

### Resource Constraints
- Development time: ~4 weeks
- QA time: ~1 week
- Deployment: ~1 day

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 13. Future Enhancements

- [ ] AI-powered task prioritization
- [ ] Automated task assignment based on skills
- [ ] Task templates for common operations
- [ ] Integration with calendar systems
- [ ] SMS notifications
- [ ] Voice notifications
- [ ] Mobile app (native iOS/Android)
- [ ] Advanced analytics and reporting
- [ ] Integration with Telegram bot
- [ ] Task dependencies and workflows

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | AI Agent | Initial requirements document |

---

**End of Document**
