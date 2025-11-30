import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, Factory, Package, DollarSign, BarChart3, Users, 
  Settings, HelpCircle, Bell, Menu, X, ChevronDown, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

interface NavItem {
  id: string;
  title: string;
  path: string;
  badge?: number;
}

const navigationGroups: NavGroup[] = [
  {
    id: "operations",
    title: "Операции",
    icon: Factory,
    items: [
      { id: "machines", title: "Аппараты", path: "/machines" },
      { id: "tasks", title: "Задачи", path: "/tasks", badge: 5 },
      { id: "locations", title: "Локации", path: "/locations" },
    ],
  },
  {
    id: "inventory",
    title: "Склад и учёт",
    icon: Package,
    items: [
      { id: "inventory", title: "Остатки", path: "/inventory" },
      { id: "products", title: "Товары", path: "/products" },
      { id: "recipes", title: "Рецепты", path: "/recipes" },
    ],
  },
  {
    id: "finance",
    title: "Финансы",
    icon: DollarSign,
    items: [
      { id: "transactions", title: "Транзакции", path: "/transactions" },
      { id: "counterparties", title: "Контрагенты", path: "/counterparties" },
      { id: "contracts", title: "Договоры", path: "/contracts" },
    ],
  },
  {
    id: "analytics",
    title: "Аналитика",
    icon: BarChart3,
    items: [
      { id: "analytics", title: "Дашборд", path: "/analytics" },
      { id: "reports", title: "Отчёты", path: "/reports" },
      { id: "incidents", title: "Инциденты", path: "/incidents" },
    ],
  },
  {
    id: "team",
    title: "Команда",
    icon: Users,
    items: [
      { id: "users", title: "Пользователи", path: "/users" },
      { id: "access-requests", title: "Заявки на доступ", path: "/access-requests", badge: 2 },
    ],
  },
];

interface VendHubLayoutProps {
  children: React.ReactNode;
}

export default function VendHubLayout({ children }: VendHubLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["operations"]);
  const [location] = useLocation();

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isActive = (path: string) => location === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r bg-card transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  V
                </div>
                <span className="font-semibold">VendHub</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="mx-auto"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {/* Home */}
          <Link href="/">
            <a
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                isActive("/") && "bg-accent"
              )}
            >
              <Home className="h-5 w-5" />
              {sidebarOpen && <span>Главная</span>}
            </a>
          </Link>

          <div className="my-2 border-t" />

          {/* Navigation Groups */}
          {navigationGroups.map((group) => {
            const Icon = group.icon;
            const isExpanded = expandedGroups.includes(group.id);

            return (
              <div key={group.id} className="mb-1">
                {sidebarOpen ? (
                  <>
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span>{group.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {group.items.map((item) => (
                          <Link key={item.id} href={item.path}>
                            <a
                              className={cn(
                                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                                isActive(item.path) && "bg-accent font-medium"
                              )}
                            >
                              <span>{item.title}</span>
                              {item.badge && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                  {item.badge}
                                </span>
                              )}
                            </a>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={group.items[0].path}>
                    <a className="flex items-center justify-center rounded-lg px-3 py-2 hover:bg-accent">
                      <Icon className="h-5 w-5" />
                    </a>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t p-2">
          <Link href="/settings">
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
              <Settings className="h-5 w-5" />
              {sidebarOpen && <span>Настройки</span>}
            </a>
          </Link>
          <Link href="/help">
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
              <HelpCircle className="h-5 w-5" />
              {sidebarOpen && <span>Помощь</span>}
            </a>
          </Link>
        </div>

        {/* User Profile */}
        <div className="border-t p-2">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              J
            </div>
            {sidebarOpen && (
              <div className="flex-1 text-left">
                <div className="font-medium">Jamshid</div>
                <div className="text-xs text-muted-foreground">Owner</div>
              </div>
            )}
            {sidebarOpen && <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">VendHub Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
