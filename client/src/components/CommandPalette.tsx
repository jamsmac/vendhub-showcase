import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Home,
  Box,
  ListTodo,
  MapPin,
  Package,
  ShoppingCart,
  Utensils,
  DollarSign,
  Users,
  FileText,
  BarChart3,
  AlertTriangle,
  UserPlus,
  Settings,
  HelpCircle,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  group: string;
  keywords?: string[];
}

const allCommands: CommandItem[] = [
  // Главная
  {
    id: "home",
    title: "Главная панель",
    description: "Обзор системы и метрики",
    icon: Home,
    path: "/",
    group: "Навигация",
    keywords: ["dashboard", "главная", "home"],
  },
  
  // Операции
  {
    id: "machines",
    title: "Аппараты",
    description: "Список торговых автоматов",
    icon: Box,
    path: "/machines",
    group: "Операции",
    keywords: ["machines", "аппараты", "автоматы"],
  },
  {
    id: "tasks",
    title: "Задачи",
    description: "Управление задачами обслуживания",
    icon: ListTodo,
    path: "/tasks",
    group: "Операции",
    keywords: ["tasks", "задачи", "обслуживание"],
  },
  {
    id: "locations",
    title: "Локации",
    description: "Места размещения аппаратов",
    icon: MapPin,
    path: "/locations",
    group: "Операции",
    keywords: ["locations", "локации", "места"],
  },
  
  // Склад и учёт
  {
    id: "inventory",
    title: "Остатки",
    description: "Управление складскими остатками",
    icon: Package,
    path: "/inventory",
    group: "Склад и учёт",
    keywords: ["inventory", "остатки", "склад"],
  },
  {
    id: "products",
    title: "Товары",
    description: "Каталог товаров и ингредиентов",
    icon: ShoppingCart,
    path: "/products",
    group: "Склад и учёт",
    keywords: ["products", "товары", "каталог"],
  },
  {
    id: "recipes",
    title: "Рецепты",
    description: "Рецепты напитков",
    icon: Utensils,
    path: "/recipes",
    group: "Склад и учёт",
    keywords: ["recipes", "рецепты", "напитки"],
  },
  
  // Финансы
  {
    id: "transactions",
    title: "Транзакции",
    description: "Финансовые операции",
    icon: DollarSign,
    path: "/transactions",
    group: "Финансы",
    keywords: ["transactions", "транзакции", "финансы"],
  },
  {
    id: "counterparties",
    title: "Контрагенты",
    description: "Поставщики и партнёры",
    icon: Users,
    path: "/counterparties",
    group: "Финансы",
    keywords: ["counterparties", "контрагенты", "поставщики"],
  },
  {
    id: "contracts",
    title: "Договоры",
    description: "Договоры с контрагентами",
    icon: FileText,
    path: "/contracts",
    group: "Финансы",
    keywords: ["contracts", "договоры"],
  },
  
  // Аналитика
  {
    id: "analytics",
    title: "Аналитика",
    description: "Дашборд аналитики",
    icon: BarChart3,
    path: "/analytics",
    group: "Аналитика",
    keywords: ["analytics", "аналитика", "статистика"],
  },
  {
    id: "reports",
    title: "Отчёты",
    description: "Различные отчёты",
    icon: FileText,
    path: "/reports",
    group: "Аналитика",
    keywords: ["reports", "отчёты"],
  },
  {
    id: "incidents",
    title: "Инциденты",
    description: "Учёт инцидентов",
    icon: AlertTriangle,
    path: "/incidents",
    group: "Аналитика",
    keywords: ["incidents", "инциденты", "проблемы"],
  },
  
  // Команда
  {
    id: "users",
    title: "Пользователи",
    description: "Управление пользователями",
    icon: Users,
    path: "/users",
    group: "Команда",
    keywords: ["users", "пользователи", "команда"],
  },
  {
    id: "access-requests",
    title: "Заявки на доступ",
    description: "Обработка заявок на доступ",
    icon: UserPlus,
    path: "/access-requests",
    group: "Команда",
    keywords: ["access", "заявки", "доступ"],
  },
  
  // Система
  {
    id: "settings",
    title: "Настройки",
    description: "Настройки системы",
    icon: Settings,
    path: "/settings",
    group: "Система",
    keywords: ["settings", "настройки"],
  },
  {
    id: "help",
    title: "Помощь",
    description: "Справка и документация",
    icon: HelpCircle,
    path: "/help",
    group: "Система",
    keywords: ["help", "помощь", "справка"],
  },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [recentPages, setRecentPages] = useState<string[]>([]);

  // Keyboard shortcut listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Load recent pages from localStorage
  useEffect(() => {
    const recent = localStorage.getItem("recentPages");
    if (recent) {
      setRecentPages(JSON.parse(recent));
    }
  }, []);

  const handleSelect = (path: string) => {
    setLocation(path);
    setOpen(false);
    
    // Update recent pages
    const updated = [path, ...recentPages.filter(p => p !== path)].slice(0, 5);
    setRecentPages(updated);
    localStorage.setItem("recentPages", JSON.stringify(updated));
  };

  // Group commands by category
  const groupedCommands = allCommands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) {
      acc[cmd.group] = [];
    }
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Get recent commands
  const recentCommands = recentPages
    .map(path => allCommands.find(cmd => cmd.path === path))
    .filter(Boolean) as CommandItem[];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Поиск страниц и действий..." />
      <CommandList>
        <CommandEmpty>Ничего не найдено.</CommandEmpty>
        
        {recentCommands.length > 0 && (
          <CommandGroup heading="Недавние">
            {recentCommands.map((cmd) => (
              <CommandItem
                key={cmd.id}
                onSelect={() => handleSelect(cmd.path)}
                className="flex items-center gap-2"
              >
                <cmd.icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{cmd.title}</span>
                  {cmd.description && (
                    <span className="text-xs text-muted-foreground">
                      {cmd.description}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {Object.entries(groupedCommands).map(([group, commands]) => (
          <CommandGroup key={group} heading={group}>
            {commands.map((cmd) => (
              <CommandItem
                key={cmd.id}
                onSelect={() => handleSelect(cmd.path)}
                className="flex items-center gap-2"
                keywords={cmd.keywords}
              >
                <cmd.icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{cmd.title}</span>
                  {cmd.description && (
                    <span className="text-xs text-muted-foreground">
                      {cmd.description}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
