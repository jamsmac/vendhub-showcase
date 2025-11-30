# VendHub Showcase - Vending Machine Management System

A modern React-based web application for managing vending machines, tasks, and inventory. Built with React 19, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

### 🤖 Machines (Аппараты)
- **Machine List & Filters**: View all vending machines with status filtering (online/offline/maintenance)
- **Interactive Map**: Google Maps integration showing machine locations with color-coded markers
- **Machine Details**: Comprehensive machine information page with:
  - Revenue statistics and sales charts
  - Maintenance history with timeline view
  - Current inventory status
  - Top-selling products
  - Maintenance history filtering by operation type and date range
  - Statistics panel showing total cost, time, and operation counts

### 📋 Tasks (Задачи)
- **Kanban Board**: Drag-and-drop task management with three columns:
  - Pending (Ожидание)
  - In Progress (В работе)
  - Completed (Завершено)
- **Task Management**: Create, edit, and assign tasks to operators
- **Priority Filtering**: Filter tasks by priority level

### 📦 Products (Товары)
- **CRUD Operations**: Create, read, update, and delete products
- **Inventory Tracking**: Monitor stock levels with visual indicators
- **Low Stock Alerts**: Automatic warnings for items running low
- **Category Filtering**: Organize products by category
- **Warehouse Statistics**: Overview of total inventory and stock status

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Routing**: Wouter
- **State Management**: React Context + Hooks
- **Charts**: Recharts
- **Maps**: Google Maps API (via Manus proxy)
- **UI Components**: shadcn/ui (Button, Card, Dialog, Badge, etc.)
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Drag & Drop**: @dnd-kit

## Project Structure

```
client/
  ├── public/          # Static assets
  ├── src/
  │   ├── pages/       # Page components
  │   │   ├── Home.tsx
  │   │   ├── Machines.tsx
  │   │   ├── MachineDetail.tsx
  │   │   ├── Tasks.tsx
  │   │   └── Products.tsx
  │   ├── components/  # Reusable UI components
  │   ├── contexts/    # React contexts
  │   ├── hooks/       # Custom hooks
  │   ├── lib/         # Utility functions
  │   ├── App.tsx      # Main app component with routes
  │   ├── main.tsx     # React entry point
  │   └── index.css    # Global styles & design tokens
  ├── index.html       # HTML template
  └── vite.config.ts   # Vite configuration

server/               # Backend API (placeholder)
shared/               # Shared types and constants
```

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/jamsmac/vendhub-showcase.git
cd vendhub-showcase

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`

## Key Features Implementation

### Maintenance History Filtering
- Filter by operation type (Repair, Refill, Service, Inspection)
- Date range picker with presets (Last month, 3 months, 6 months, Year, All time)
- Custom date range selection
- Statistics panel showing:
  - Total cost of operations
  - Total time spent
  - Average time per operation
  - Operation count

### Machine Map View
- Toggle between table and map view
- Color-coded markers (green=online, red=offline, yellow=maintenance)
- Click markers to view machine details

### Kanban Board
- Drag-and-drop tasks between columns
- Create new tasks with title, description, and priority
- Assign tasks to team members
- Filter by priority level

### Inventory Management
- Real-time stock level tracking
- Low stock warnings (< 30% of capacity)
- Product categories and filtering
- Warehouse statistics overview

## Design System

The application uses a dark theme with carefully chosen colors:
- **Primary**: Blue (interactive elements)
- **Success**: Green (online/active status)
- **Warning**: Orange (maintenance/low stock)
- **Danger**: Red (offline/critical)

All components follow accessibility best practices with proper contrast ratios and keyboard navigation support.

## API Integration

The application is designed to work with a backend API. Currently using mock data for demonstration. To integrate with a real API:

1. Update API endpoints in `client/src/lib/trpc.ts`
2. Replace mock data in page components with actual API calls
3. Implement proper error handling and loading states

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance Optimizations

- Code splitting with React lazy loading
- Optimized re-renders with React.memo
- Efficient filtering and sorting algorithms
- Responsive images and lazy loading
- CSS-in-JS with Tailwind for minimal bundle size

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Real-time notifications for machine status changes
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] User role-based access control
- [ ] Export reports (PDF/Excel)
- [ ] Integration with payment systems

---

**Last Updated**: November 30, 2025
**Version**: 1.0.0
