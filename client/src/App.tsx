import React, { useState } from 'react';
import '@/i18n/config';
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import VendHubLayout from "./components/VendHubLayout";
import CommandPalette from "./components/CommandPalette";
import { trpc } from "@/lib/trpc";
import Registration from "./components/Registration";
import Login from "./components/Login";
import OnboardingWizard from "./components/OnboardingWizard";
import MandatoryPasswordChange from "./components/MandatoryPasswordChange";
import Alerts from "./pages/Alerts";
import AdminAnalytics from "./pages/AdminAnalytics";

// Auth state management
interface AuthState {
  isAuthenticated: boolean;
  user?: {
    id: number;
    email: string;
    fullName: string;
    role: string;
    needsPasswordChange?: boolean;
  };
  needsOnboarding?: boolean;
  needsPasswordChangeFirst?: boolean;
}

// Dashboard with real backend data
function DashboardPage() {
  const { data: machines, isLoading: machinesLoading, error: machinesError } = trpc.machines.list.useQuery(undefined, {
    retry: 1,
    staleTime: 30000,
  });
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = trpc.tasks.list.useQuery(undefined, {
    retry: 1,
    staleTime: 30000,
  });
  // Disabled products query due to schema issues - will be re-enabled after schema is fixed
  const products = [];
  const productsLoading = false;
  const productsError = null;

  const isLoading = machinesLoading || tasksLoading;
  const hasError = machinesError || tasksError;

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Главная панель</h1>
        </div>
        <div className="p-6 border border-red-500 rounded-lg">
          <div className="text-red-500 font-bold">Ошибка загрузки данных</div>
          <div className="text-sm text-muted-foreground mt-2">
            {machinesError?.message || tasksError?.message || productsError?.message}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Главная панель</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border rounded-lg animate-pulse">
              <div className="h-10 bg-muted rounded w-20 mb-2"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeTasks = tasks?.filter(t => t.status === 'pending' || t.status === 'in_progress').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Главная панель</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border rounded-lg">
          <div className="text-4xl font-bold">{machines?.length || 0}</div>
          <div className="text-sm text-muted-foreground">Всего аппаратов</div>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="text-4xl font-bold">{activeTasks}</div>
          <div className="text-sm text-muted-foreground">Активных задач</div>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="text-4xl font-bold">{products?.length || 0}</div>
          <div className="text-sm text-muted-foreground">Товаров</div>
        </div>
      </div>
    </div>
  );
}

// Import Machines page
import MachinesPageComponent from "./pages/Machines";
import MachineDetailPageComponent from "./pages/MachineDetail";
const MachinesPage = MachinesPageComponent;
const MachineDetailPage = MachineDetailPageComponent;

// Import Tasks page
import TasksPageComponent from "./pages/Tasks";
const TasksPage = TasksPageComponent;

// Import Products page
import ProductsPageComponent from "./pages/Products";
const ProductsPage = ProductsPageComponent;

// Placeholder pages
function LocationsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Локации</h2>
      <p className="text-muted-foreground">Места размещения аппаратов</p>
    </div>
  );
}

function InventoryPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Остатки</h2>
      <p className="text-muted-foreground">Управление складскими остатками</p>
    </div>
  );
}

function RecipesPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Рецепты</h2>
      <p className="text-muted-foreground">Рецепты напитков</p>
    </div>
  );
}

function TransactionsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Транзакции</h2>
      <p className="text-muted-foreground">Финансовые операции</p>
    </div>
  );
}

function CounterpartiesPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Контрагенты</h2>
      <p className="text-muted-foreground">Поставщики и партнёры</p>
    </div>
  );
}

function ContractsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Договоры</h2>
      <p className="text-muted-foreground">Договоры с контрагентами</p>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Аналитика</h2>
      <p className="text-muted-foreground">Дашборд аналитики</p>
    </div>
  );
}

function ReportsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Отчёты</h2>
      <p className="text-muted-foreground">Различные отчёты</p>
    </div>
  );
}

function IncidentsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Инциденты</h2>
      <p className="text-muted-foreground">Учёт инцидентов</p>
    </div>
  );
}

function UsersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Пользователи</h2>
      <p className="text-muted-foreground">Управление пользователями</p>
    </div>
  );
}

function AccessRequestsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Заявки на доступ</h2>
      <p className="text-muted-foreground">Обработка заявок на доступ</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Настройки</h2>
      <p className="text-muted-foreground">Настройки системы</p>
    </div>
  );
}

function HelpPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Помощь</h2>
      <p className="text-muted-foreground">Справка и документация</p>
    </div>
  );
}

function Router() {
  return (
    <>
      <CommandPalette />
      <VendHubLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/machines" component={MachinesPage} />
        <Route path="/machines/:id" component={MachineDetailPage} />
        <Route path="/tasks" component={TasksPage} />
        <Route path="/locations" component={LocationsPage} />
        <Route path="/inventory" component={InventoryPage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/recipes" component={RecipesPage} />
        <Route path="/transactions" component={TransactionsPage} />
        <Route path="/counterparties" component={CounterpartiesPage} />
        <Route path="/contracts" component={ContractsPage} />
        <Route path="/analytics" component={AdminAnalytics} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/incidents" component={IncidentsPage} />
        <Route path="/users" component={UsersPage} />
        <Route path="/access-requests" component={AccessRequestsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/help" component={HelpPage} />
      </Switch>
    </VendHubLayout>
    </>
  );
}

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
  });
  const [currentView, setCurrentView] = useState<'auth' | 'password-change' | 'onboarding' | 'app'>('auth');

  const handleRegistrationComplete = () => {
    // After registration, show login
    setCurrentView('auth');
  };

  const handleLoginSuccess = (user: AuthState['user']) => {
    // After login, check if user needs password change first
    if (user?.needsPasswordChange) {
      setAuthState({
        isAuthenticated: true,
        user,
        needsPasswordChangeFirst: true,
      });
      setCurrentView('password-change');
    } else {
      // Otherwise, check if user needs onboarding
      setAuthState({
        isAuthenticated: true,
        user,
        needsOnboarding: true,
      });
      setCurrentView('onboarding');
    }
  };

  const handlePasswordChangeComplete = () => {
    // After password change, proceed to onboarding
    setCurrentView('onboarding');
  };

  const handleOnboardingComplete = () => {
    // After onboarding, show app
    setCurrentView('app');
  };

  const handleLogout = () => {
    // Reset auth state and show login
    setAuthState({
      isAuthenticated: false,
    });
    setCurrentView('auth');
  };

  // Show authentication screens
  if (currentView === 'auth') {
    return (
      <ErrorBoundary>
        <ThemeProvider defaultTheme="dark">
          <div className="flex">
            <Registration
              onRegistrationComplete={handleRegistrationComplete}
              onSwitchToLogin={() => setCurrentView('auth')}
            />
            {/* TODO: Add Login component toggle */}
            <Login
              onLoginSuccess={(user) => handleLoginSuccess({
                id: 1,
                email: 'user@example.com',
                fullName: 'User Name',
                role: 'operator',
              })}
              onSwitchToRegister={() => setCurrentView('auth')}
            />
          </div>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // Show mandatory password change
  if (currentView === 'password-change' && authState.user) {
    return (
      <ErrorBoundary>
        <ThemeProvider defaultTheme="dark">
          <MandatoryPasswordChange
            userEmail={authState.user.email}
            onPasswordChangeComplete={handlePasswordChangeComplete}
          />
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // Show onboarding wizard
  if (currentView === 'onboarding' && authState.user) {
    return (
      <ErrorBoundary>
        <ThemeProvider defaultTheme="dark">
          <OnboardingWizard
            userEmail={authState.user.email}
            onOnboardingComplete={handleOnboardingComplete}
          />
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // Show main app
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
