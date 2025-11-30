import { TooltipProvider } from "@/components/ui/tooltip";
import '@/i18n/config';
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import VendHubLayout from "./components/VendHubLayout";
import CommandPalette from "./components/CommandPalette";

// Placeholder pages
function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Главная панель</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-lg border bg-card">
          <div className="text-3xl font-bold">24</div>
          <div className="text-sm text-muted-foreground">Всего аппаратов</div>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <div className="text-3xl font-bold">5</div>
          <div className="text-sm text-muted-foreground">Активных задач</div>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <div className="text-3xl font-bold">12</div>
          <div className="text-sm text-muted-foreground">Товаров с низким остатком</div>
        </div>
      </div>
    </div>
  );
}

function MachinesPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Аппараты</h2>
      <p className="text-muted-foreground">Список торговых автоматов</p>
    </div>
  );
}

function TasksPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задачи</h2>
      <p className="text-muted-foreground">Управление задачами обслуживания</p>
    </div>
  );
}

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

function ProductsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Товары</h2>
      <p className="text-muted-foreground">Каталог товаров и ингредиентов</p>
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
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
