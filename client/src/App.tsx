import React from 'react';
import '@/i18n/config';
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import VendHubLayout from "./components/VendHubLayout";
import CommandPalette from "./components/CommandPalette";
import { trpc } from "@/lib/trpc";

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
  const { data: products, isLoading: productsLoading, error: productsError } = trpc.products.list.useQuery(undefined, {
    retry: 1,
    staleTime: 30000,
  });

  const isLoading = machinesLoading || tasksLoading || productsLoading;
  const hasError = machinesError || tasksError || productsError;

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

// Machines page with real data
function MachinesPage() {
  const { data: machines, isLoading } = trpc.machines.list.useQuery();

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Аппараты</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Аппараты</h2>
      <p className="text-muted-foreground mb-4">Всего: {machines?.length || 0}</p>
      <div className="space-y-4">
        {machines?.map((machine) => (
          <div key={machine.id} className="p-4 border rounded-lg">
            <div className="font-semibold">{machine.name}</div>
            <div className="text-sm text-muted-foreground">{machine.location}</div>
            <div className="text-xs mt-2">
              <span className={`px-2 py-1 rounded ${
                machine.status === 'active' ? 'bg-green-500/20 text-green-500' :
                machine.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-gray-500/20 text-gray-500'
              }`}>
                {machine.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tasks page with real data
function TasksPage() {
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery();

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Задачи</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задачи</h2>
      <p className="text-muted-foreground mb-4">Всего: {tasks?.length || 0}</p>
      <div className="space-y-4">
        {tasks?.map((task) => (
          <div key={task.id} className="p-4 border rounded-lg">
            <div className="font-semibold">{task.type}</div>
            <div className="text-sm text-muted-foreground">{task.description}</div>
            <div className="text-xs mt-2">
              <span className={`px-2 py-1 rounded ${
                task.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-500' :
                task.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Products page with real data
function ProductsPage() {
  const { data: products, isLoading } = trpc.products.list.useQuery();

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Товары</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Товары</h2>
      <p className="text-muted-foreground mb-4">Всего: {products?.length || 0}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products?.map((product) => (
          <div key={product.id} className="p-4 border rounded-lg">
            <div className="font-semibold">{product.name}</div>
            <div className="text-sm text-muted-foreground">{product.category}</div>
            <div className="text-sm mt-2">
              <div>Цена: {product.sellingPrice} ₽</div>
              <div className="text-muted-foreground">Себестоимость: {product.costPrice} ₽</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
        <Route path="/tasks" component={TasksPage} />
        <Route path="/locations" component={LocationsPage} />
        <Route path="/inventory" component={InventoryPage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/recipes" component={RecipesPage} />
        <Route path="/transactions" component={TransactionsPage} />
        <Route path="/counterparties" component={CounterpartiesPage} />
        <Route path="/contracts" component={ContractsPage} />
        <Route path="/analytics" component={AnalyticsPage} />
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
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
