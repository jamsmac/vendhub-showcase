import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Search, MapPin, Wrench, AlertCircle, List, Map as MapIcon } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

const mockMachines = [
  {
    id: 1,
    name: "Lobby Snack #04",
    serialNumber: "VM-001",
    location: "Main Entrance, Building A",
    status: "online",
    totalRevenue: 124000,
    model: "VendMax 3000",
    latitude: 41.3111,
    longitude: 69.2797,
  },
  {
    id: 2,
    name: "Gym Drink #02",
    serialNumber: "VM-002",
    location: "Fitness Center, 2nd Floor",
    status: "online",
    totalRevenue: 89000,
    model: "CoolDrink Pro",
    latitude: 41.3125,
    longitude: 69.2810,
  },
  {
    id: 3,
    name: "Office Coffee #01",
    serialNumber: "VM-003",
    location: "Break Room, 3rd Floor",
    status: "maintenance",
    totalRevenue: 210000,
    model: "CoffeeMax",
    latitude: 41.3095,
    longitude: 69.2780,
  },
  {
    id: 4,
    name: "Library Snack #02",
    serialNumber: "VM-004",
    location: "Library Entrance",
    status: "offline",
    totalRevenue: 54000,
    model: "VendMax 2000",
    latitude: 41.3140,
    longitude: 69.2825,
  },
  {
    id: 5,
    name: "Station Drink #05",
    serialNumber: "VM-005",
    location: "Train Station Platform 2",
    status: "online",
    totalRevenue: 345000,
    model: "VendMax 3000",
    latitude: 41.3080,
    longitude: 69.2765,
  },
  {
    id: 6,
    name: "Mall Snack #08",
    serialNumber: "VM-006",
    location: "Shopping Mall, East Wing",
    status: "online",
    totalRevenue: 189000,
    model: "VendMax 3000",
    latitude: 41.3155,
    longitude: 69.2840,
  },
];

type ViewMode = "list" | "map";

export default function Machines() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const { data: machines = [], isLoading } = trpc.machines.list.useQuery();

  // Use mock data if no real data
  const displayMachines = machines.length > 0 ? machines : mockMachinesData;

  // Get unique locations for filter
  const locations = useMemo(() => {
    const uniqueLocations = new Set(displayMachines.map((m: any) => m.location));
    return Array.from(uniqueLocations).sort();
  }, [displayMachines]);

  // Filter machines based on search and filters
  const filteredMachines = useMemo(() => {
    return displayMachines.filter((machine: any) => {
      const matchesSearch =
        machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (machine.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesStatus =
        statusFilter === "all" || machine.status === statusFilter;

      const matchesLocation =
        locationFilter === "all" || machine.location === locationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [displayMachines, searchQuery, statusFilter, locationFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: displayMachines.length,
      active: displayMachines.filter((m: any) => m.status === "active" || m.status === "online").length,
      offline: displayMachines.filter((m: any) => m.status === "offline").length,
      maintenance: displayMachines.filter((m: any) => m.status === "maintenance").length,
      totalRevenue: displayMachines.reduce((sum: number, m: any) => sum + (m.totalRevenue || 0), 0),
    };
  }, [displayMachines]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "online":
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "online":
        return "🟢";
      case "offline":
        return "🔴";
      case "maintenance":
        return "🟡";
      case "retired":
        return "⚫";
      default:
        return "⚪";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
      case "online":
        return "Онлайн";
      case "offline":
        return "Офлайн";
      case "maintenance":
        return "Обслуживание";
      case "retired":
        return "Списан";
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Аппараты</h1>
            <p className="text-gray-600 mt-1">
              Управление торговыми автоматами и мониторинг их состояния
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Добавить аппарат
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Всего аппаратов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700">
                Активных
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {stats.active}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700">
                Офлайн
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                {stats.offline}
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700">
                На обслуживании
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">
                {stats.maintenance}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Общий доход
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Фильтры</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="gap-2"
                >
                  <List className="w-4 h-4" />
                  Список
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className="gap-2"
                >
                  <MapIcon className="w-4 h-4" />
                  Карта
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию или серийному номеру..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="online">Онлайн</SelectItem>
                  <SelectItem value="offline">Офлайн</SelectItem>
                  <SelectItem value="maintenance">На обслуживании</SelectItem>
                  <SelectItem value="retired">Списанные</SelectItem>
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Фильтр по локации" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все локации</SelectItem>
                  {locations.map((location: string) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              Показано {filteredMachines.length} из {displayMachines.length} аппаратов
            </div>
          </CardContent>
        </Card>

        {/* Content - List or Map View */}
        {viewMode === "list" ? (
          <div className="space-y-3">
            {isLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  Загрузка аппаратов...
                </CardContent>
              </Card>
            ) : filteredMachines.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Не найдено аппаратов, соответствующих фильтрам
                </CardContent>
              </Card>
            ) : (
              filteredMachines.map((machine: any) => (
                <Card key={machine.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{machine.name}</h3>
                          <Badge className={getStatusColor(machine.status)}>
                            {getStatusIcon(machine.status)} {getStatusLabel(machine.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-3">
                          <div>
                            <span className="font-medium">Серийный номер:</span>
                            <p>{machine.serialNumber || "N/A"}</p>
                          </div>

                          <div>
                            <span className="font-medium">Модель:</span>
                            <p>{machine.model || "N/A"}</p>
                          </div>

                          <div className="flex items-start gap-1">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium">Локация:</span>
                              <p>{machine.location}</p>
                            </div>
                          </div>

                          <div>
                            <span className="font-medium">Общий доход:</span>
                            <p className="text-green-600 font-semibold">
                              {formatCurrency(machine.totalRevenue || 0)}
                            </p>
                          </div>
                        </div>

                        {machine.lastMaintenance && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                            <Wrench className="w-4 h-4" />
                            <span>
                              Последнее обслуживание:{" "}
                              {new Date(machine.lastMaintenance).toLocaleDateString("ru-RU")}
                            </span>
                          </div>
                        )}

                        {machine.nextServiceDue && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-orange-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>
                              Следующее обслуживание:{" "}
                              {new Date(machine.nextServiceDue).toLocaleDateString("ru-RU")}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/machines/${machine.id}`)}
                        >
                          Подробнее
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <MachinesMap machines={filteredMachines} />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

// Map Component
function MachinesMap({ machines }: { machines: any[] }) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const initMap = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = machines
      .filter(m => m.latitude && m.longitude)
      .map(machine => {
        const marker = new google.maps.Marker({
          position: { lat: machine.latitude, lng: machine.longitude },
          map: mapInstance,
          title: machine.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: getMarkerColor(machine.status),
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${machine.name}</h3>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Статус:</strong> ${getStatusLabel(machine.status)}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Серийный номер:</strong> ${machine.serialNumber || "N/A"}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Локация:</strong> ${machine.location}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Модель:</strong> ${machine.model || "N/A"}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstance, marker);
        });

        return marker;
      });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      mapInstance.fitBounds(bounds);
    }
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "active":
      case "online":
        return "#22c55e"; // green
      case "offline":
        return "#ef4444"; // red
      case "maintenance":
        return "#eab308"; // yellow
      case "retired":
        return "#6b7280"; // gray
      default:
        return "#9ca3af"; // gray
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
      case "online":
        return "Онлайн";
      case "offline":
        return "Офлайн";
      case "maintenance":
        return "Обслуживание";
      case "retired":
        return "Списан";
      default:
        return status;
    }
  };

  return (
    <div className="h-[600px] w-full relative">
      {typeof google !== "undefined" ? (
        <div
          ref={(el) => {
            if (el && !map) {
              const mapInstance = new google.maps.Map(el, {
                center: { lat: 41.3111, lng: 69.2797 }, // Tashkent coordinates
                zoom: 13,
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true,
              });
              initMap(mapInstance);
            }
          }}
          className="h-full w-full"
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center">
            <MapIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Загрузка карты...</p>
            <p className="text-sm text-gray-500 mt-2">
              Убедитесь, что Google Maps API доступен
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock data for fallback
const mockMachinesData = mockMachines;

function getStatusLabel(status: string) {
  switch (status) {
    case "active":
    case "online":
      return "Онлайн";
    case "offline":
      return "Офлайн";
    case "maintenance":
      return "Обслуживание";
    case "retired":
      return "Списан";
    default:
      return status;
  }
}
