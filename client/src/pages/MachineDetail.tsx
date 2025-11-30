import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Edit,
  MapPin,
  Wrench,
  TrendingUp,
  Clock,
  Package,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MachineDetail() {
  const [, params] = useRoute("/machines/:id");
  const [, navigate] = useLocation();
  const machineId = params?.id ? parseInt(params.id) : null;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [maintenanceFilter, setMaintenanceFilter] = useState<string>("Все");
  const [dateRangePreset, setDateRangePreset] = useState<string>("Всё время");
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [editData, setEditData] = useState<any>(null);
  const [maintenanceData, setMaintenanceData] = useState({
    description: "",
    cost: "",
    nextServiceDue: "",
  });

  // Calculate date range based on preset
  const getDateRangeFromPreset = (preset: string): { start: Date | null; end: Date | null } => {
    const now = new Date();
    const end = now;
    let start: Date | null = null;

    switch (preset) {
      case "Последний месяц":
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "3 месяца":
        start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "6 месяцев":
        start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case "Год":
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case "Всё время":
        return { start: null, end: null };
      case "Произвольный":
        if (customDateRange.start && customDateRange.end) {
          return {
            start: new Date(customDateRange.start),
            end: new Date(customDateRange.end),
          };
        }
        return { start: null, end: null };
      default:
        return { start: null, end: null };
    }

    return { start, end };
  };

  // Mock machine data (replace with real API call)
  const mockMachine = {
    id: machineId || 1,
    name: "Lobby Snack #04",
    serialNumber: "VM-001",
    model: "VendMax 3000",
    location: "Main Entrance, Building A",
    status: "active",
    totalRevenue: 124000,
    totalSales: 856,
    lastMaintenance: new Date("2024-11-15"),
    nextServiceDue: new Date("2024-12-15"),
    installationDate: new Date("2023-06-10"),
    notes: "High-traffic location, excellent performance",
    photo: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=400",
  };

  const mockMaintenanceHistory = [
    {
      id: 1,
      date: new Date("2024-11-15"),
      type: "Обслуживание",
      description: "Плановая чистка и пополнение",
      cost: 5000,
      performedBy: "Иван Иванов",
      duration: "45 мин",
    },
    {
      id: 2,
      date: new Date("2024-10-20"),
      type: "Ремонт",
      description: "Замена монетоприемника",
      cost: 15000,
      performedBy: "Михаил Смирнов",
      duration: "2 часа",
    },
    {
      id: 3,
      date: new Date("2024-09-10"),
      type: "Обслуживание",
      description: "Квартальная инспекция и чистка",
      cost: 5000,
      performedBy: "Иван Иванов",
      duration: "1 час",
    },
    {
      id: 4,
      date: new Date("2024-08-05"),
      type: "Ремонт",
      description: "Замена системы охлаждения",
      cost: 45000,
      performedBy: "Сара Джонсон",
      duration: "3 часа",
    },
    {
      id: 5,
      date: new Date("2024-07-12"),
      type: "Инспекция",
      description: "Проверка всех систем",
      cost: 0,
      performedBy: "Михаил Смирнов",
      duration: "30 мин",
    },
  ];

  const mockInventory = [
    {
      id: 1,
      name: "Кока-Кола 0.5л",
      currentStock: 12,
      capacity: 20,
      lastRefill: "2024-11-28",
      sales24h: 8,
    },
    {
      id: 2,
      name: "Snickers 50г",
      currentStock: 5,
      capacity: 15,
      lastRefill: "2024-11-28",
      sales24h: 10,
    },
    {
      id: 3,
      name: "Вода Бон Аква 0.5л",
      currentStock: 18,
      capacity: 25,
      lastRefill: "2024-11-28",
      sales24h: 7,
    },
    {
      id: 4,
      name: "Lays Сметана 90г",
      currentStock: 2,
      capacity: 12,
      lastRefill: "2024-11-28",
      sales24h: 10,
    },
    {
      id: 5,
      name: "Mars 50г",
      currentStock: 8,
      capacity: 15,
      lastRefill: "2024-11-28",
      sales24h: 7,
    },
  ];

  const mockTopProducts = [
    { name: "Snickers 50г", sales: 45, revenue: 4500 },
    { name: "Lays Сметана 90г", sales: 38, revenue: 4560 },
    { name: "Кока-Кола 0.5л", sales: 35, revenue: 5250 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "offline":
        return "bg-red-100 text-red-800 border-red-300";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "retired":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleEditSave = () => {
    toast.success("Информация об аппарате обновлена");
    setIsEditOpen(false);
  };

  const handleMaintenanceLog = () => {
    toast.success("Запись об обслуживании добавлена");
    setIsMaintenanceOpen(false);
    setMaintenanceData({ description: "", cost: "", nextServiceDue: "" });
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case "Ремонт":
        return <Wrench className="w-5 h-5 text-red-600" />;
      case "Пополнение":
        return <Package className="w-5 h-5 text-blue-600" />;
      case "Обслуживание":
        return <Activity className="w-5 h-5 text-green-600" />;
      case "Инспекция":
        return <CheckCircle2 className="w-5 h-5 text-purple-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStockPercentage = (current: number, capacity: number) => {
    return (current / capacity) * 100;
  };

  const getStockColor = (percentage: number) => {
    if (percentage > 50) return "bg-green-500";
    if (percentage > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/machines")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к аппаратам
          </Button>
        </div>

        {/* Machine Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{mockMachine.name}</h1>
              <Badge className={getStatusColor(mockMachine.status)}>
                {mockMachine.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-gray-600">Серийный номер: {mockMachine.serialNumber}</p>
          </div>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Edit className="w-4 h-4" />
                Редактировать
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Редактировать информацию</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Название аппарата</label>
                  <Input
                    defaultValue={mockMachine.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Локация</label>
                  <Input
                    defaultValue={mockMachine.location}
                    onChange={(e) =>
                      setEditData({ ...editData, location: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Статус</label>
                  <Select defaultValue={mockMachine.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активный</SelectItem>
                      <SelectItem value="offline">Офлайн</SelectItem>
                      <SelectItem value="maintenance">Обслуживание</SelectItem>
                      <SelectItem value="retired">Списан</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Примечания</label>
                  <Textarea
                    defaultValue={mockMachine.notes}
                    onChange={(e) =>
                      setEditData({ ...editData, notes: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleEditSave} className="w-full">
                  Сохранить изменения
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Общий доход
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(mockMachine.totalRevenue)}
              </div>
              <p className="text-xs text-gray-500 mt-1">За все время</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Всего продаж
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMachine.totalSales}</div>
              <p className="text-xs text-gray-500 mt-1">Транзакций</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Средний доход/месяц
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(mockMachine.totalRevenue / 12)}
              </div>
              <p className="text-xs text-gray-500 mt-1">В среднем за месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Средний чек
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(mockMachine.totalRevenue / mockMachine.totalSales)}
              </div>
              <p className="text-xs text-gray-500 mt-1">За транзакцию</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Динамика доходов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { month: 'Jan', revenue: 8500 },
                  { month: 'Feb', revenue: 9200 },
                  { month: 'Mar', revenue: 10100 },
                  { month: 'Apr', revenue: 9800 },
                  { month: 'May', revenue: 11200 },
                  { month: 'Jun', revenue: 10500 },
                  { month: 'Jul', revenue: 12000 },
                  { month: 'Aug', revenue: 11800 },
                  { month: 'Sep', revenue: 10900 },
                  { month: 'Oct', revenue: 11500 },
                  { month: 'Nov', revenue: 12400 },
                  { month: 'Dec', revenue: 10300 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Machine Information */}
        <Card>
          <CardHeader>
            <CardTitle>Информация об аппарате</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Модель
                </label>
                <p className="text-lg font-semibold mt-1">{mockMachine.model}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Серийный номер
                </label>
                <p className="text-lg font-semibold mt-1">
                  {mockMachine.serialNumber}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Локация
                  </label>
                  <p className="text-lg font-semibold mt-1">
                    {mockMachine.location}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Дата установки
                </label>
                <p className="text-lg font-semibold mt-1">
                  {mockMachine.installationDate.toLocaleDateString()}
                </p>
              </div>
            </div>

            {mockMachine.notes && (
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-600">
                  Примечания
                </label>
                <p className="text-base mt-2 text-gray-700">
                  {mockMachine.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Последнее обслуживание
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-lg font-semibold">
                  {mockMachine.lastMaintenance.toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {Math.floor(
                  (Date.now() - mockMachine.lastMaintenance.getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                дней назад
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Следующее обслуживание
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span className="text-lg font-semibold">
                  {mockMachine.nextServiceDue.toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-orange-600">
                {Math.ceil(
                  (mockMachine.nextServiceDue.getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                дней осталось
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Maintenance History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>История обслуживания</CardTitle>
              <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Wrench className="w-4 h-4" />
                    Добавить запись
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Maintenance Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe the maintenance work performed..."
                      value={maintenanceData.description}
                      onChange={(e) =>
                        setMaintenanceData({
                          ...maintenanceData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cost (UZS)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={maintenanceData.cost}
                      onChange={(e) =>
                        setMaintenanceData({
                          ...maintenanceData,
                          cost: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Следующее обслуживание
                    </label>
                    <Input
                      type="date"
                      value={maintenanceData.nextServiceDue}
                      onChange={(e) =>
                        setMaintenanceData({
                          ...maintenanceData,
                          nextServiceDue: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button onClick={handleMaintenanceLog} className="w-full">
                    Save Maintenance Record
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            </div>
            
            {/* Date Range Filters */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Период:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Всё время",
                  "Последний месяц",
                  "3 месяца",
                  "6 месяцев",
                  "Год",
                  "Произвольный",
                ].map((preset) => (
                  <Button
                    key={preset}
                    variant={dateRangePreset === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setDateRangePreset(preset);
                      if (preset !== "Произвольный") {
                        setCustomDateRange({ start: "", end: "" });
                      }
                    }}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
              
              {/* Custom Date Range Inputs */}
              {dateRangePreset === "Произвольный" && (
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600">От:</label>
                    <Input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) =>
                        setCustomDateRange({ ...customDateRange, start: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-600">До:</label>
                    <Input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) =>
                        setCustomDateRange({ ...customDateRange, end: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Operation Type Filter Buttons */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span className="font-medium">Тип операции:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(() => {
                // Calculate date-filtered history for counts
                const dateRange = getDateRangeFromPreset(dateRangePreset);
                let dateFilteredForCounts = mockMaintenanceHistory;
                
                if (dateRange.start && dateRange.end) {
                  dateFilteredForCounts = mockMaintenanceHistory.filter(record => {
                    const recordDate = record.date;
                    return recordDate >= dateRange.start! && recordDate <= dateRange.end!;
                  });
                }
                
                return [
                  { label: "Все", value: "Все", count: dateFilteredForCounts.length },
                  { 
                    label: "Ремонт", 
                    value: "Ремонт", 
                    count: dateFilteredForCounts.filter(r => r.type === "Ремонт").length 
                  },
                  { 
                    label: "Пополнение", 
                    value: "Пополнение", 
                    count: dateFilteredForCounts.filter(r => r.type === "Пополнение").length 
                  },
                  { 
                    label: "Обслуживание", 
                    value: "Обслуживание", 
                    count: dateFilteredForCounts.filter(r => r.type === "Обслуживание").length 
                  },
                  { 
                    label: "Инспекция", 
                    value: "Инспекция", 
                    count: dateFilteredForCounts.filter(r => r.type === "Инспекция").length 
                  },
                ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={maintenanceFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMaintenanceFilter(filter.value)}
                  className="gap-2"
                >
                  {filter.label}
                  <Badge 
                    variant="secondary" 
                    className={maintenanceFilter === filter.value ? "bg-white/20 text-white" : ""}
                  >
                    {filter.count}
                  </Badge>
                </Button>
                ));
              })()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                // Apply date range filter
                const dateRange = getDateRangeFromPreset(dateRangePreset);
                let dateFilteredHistory = mockMaintenanceHistory;
                
                if (dateRange.start && dateRange.end) {
                  dateFilteredHistory = mockMaintenanceHistory.filter(record => {
                    const recordDate = record.date;
                    return recordDate >= dateRange.start! && recordDate <= dateRange.end!;
                  });
                }
                
                // Apply operation type filter
                const filteredHistory = maintenanceFilter === "Все" 
                  ? dateFilteredHistory 
                  : dateFilteredHistory.filter(r => r.type === maintenanceFilter);
                
                if (filteredHistory.length === 0) {
                  return (
                    <p className="text-center text-gray-500 py-8">
                      Нет записей для выбранного фильтра
                    </p>
                  );
                }
                
                return (
                  <div className="space-y-6">
                    {filteredHistory.map((record, index) => (
                    <div key={record.id} className="flex gap-4">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getServiceTypeIcon(record.type)}
                        </div>
                        {index < filteredHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{record.type}</h4>
                            <p className="text-sm text-gray-600">
                              {record.date.toLocaleDateString("ru-RU", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          {record.cost > 0 && (
                            <Badge variant="outline" className="text-green-600">
                              {formatCurrency(record.cost)}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-700 mb-2">{record.description}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Оператор: {record.performedBy}</span>
                          {record.duration && <span>Длительность: {record.duration}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Топ товаров за месяц</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} продаж</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Inventory */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Текущий инвентарь</CardTitle>
              <Button size="sm" className="gap-2">
                <Package className="w-4 h-4" />
                Пополнить все
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInventory.map((product) => {
                const percentage = getStockPercentage(
                  product.currentStock,
                  product.capacity
                );
                const isLowStock = percentage < 30;

                return (
                  <div key={product.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{product.name}</h4>
                          {isLowStock && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Низкий остаток
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {product.currentStock} / {product.capacity} шт. • Продано за 24ч:{" "}
                          {product.sales24h}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Пополнить
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getStockColor(
                          percentage
                        )}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Последнее пополнение:{" "}
                      {new Date(product.lastRefill).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
