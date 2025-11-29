import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, MapPin, Signal, Battery, AlertCircle } from "lucide-react";

const machines = [
  {
    id: "VM-001",
    name: "Lobby Snack #04",
    location: "Main Entrance, Building A",
    status: "online",
    stock: 85,
    revenue: "$1,240",
    lastPing: "2 min ago",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=2070",
  },
  {
    id: "VM-002",
    name: "Gym Drink #02",
    location: "Fitness Center, 2nd Floor",
    status: "online",
    stock: 42,
    revenue: "$890",
    lastPing: "5 min ago",
    image: "https://images.unsplash.com/photo-1625650484478-113df648954d?auto=format&fit=crop&q=80&w=2069",
  },
  {
    id: "VM-003",
    name: "Office Coffee #01",
    location: "Break Room, 3rd Floor",
    status: "maintenance",
    stock: 12,
    revenue: "$2,100",
    lastPing: "1 hour ago",
    image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?auto=format&fit=crop&q=80&w=2070",
  },
  {
    id: "VM-004",
    name: "Library Snack #02",
    location: "Library Entrance",
    status: "offline",
    stock: 65,
    revenue: "$540",
    lastPing: "3 hours ago",
    image: "https://images.unsplash.com/photo-1576089235406-dbbf0963091e?auto=format&fit=crop&q=80&w=2070",
  },
  {
    id: "VM-005",
    name: "Station Drink #05",
    location: "Train Station Platform 2",
    status: "online",
    stock: 92,
    revenue: "$3,450",
    lastPing: "1 min ago",
    image: "https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?auto=format&fit=crop&q=80&w=2070",
  },
  {
    id: "VM-006",
    name: "Mall Snack #08",
    location: "Shopping Mall, East Wing",
    status: "online",
    stock: 24,
    revenue: "$1,890",
    lastPing: "10 min ago",
    image: "https://images.unsplash.com/photo-1585341840941-98553e474d84?auto=format&fit=crop&q=80&w=2070",
  },
];

export default function Machines() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white tracking-tight">Machines</h1>
            <p className="text-muted-foreground mt-1">Manage your fleet of vending machines</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
            + Add Machine
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search machines..." 
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:ring-primary/50"
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 text-white">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Machines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <Card key={machine.id} className="border-white/10 bg-white/5 backdrop-blur-md shadow-xl hover:bg-white/10 transition-all duration-300 group overflow-hidden">
              <div className="h-48 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                <img 
                  src={machine.image} 
                  alt={machine.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 z-20">
                  <Badge 
                    className={`
                      ${machine.status === 'online' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : ''}
                      ${machine.status === 'maintenance' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : ''}
                      ${machine.status === 'offline' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : ''}
                      backdrop-blur-md border
                    `}
                  >
                    {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-lg font-bold text-white">{machine.name}</h3>
                  <p className="text-xs text-gray-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {machine.location}
                  </p>
                </div>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Stock</p>
                    <p className={`text-sm font-bold ${machine.stock < 20 ? 'text-rose-400' : 'text-white'}`}>
                      {machine.stock}%
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                    <p className="text-sm font-bold text-white">{machine.revenue}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Ping</p>
                    <p className="text-sm font-bold text-white">{machine.lastPing}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer">
                      <Signal className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer">
                      <Battery className="w-4 h-4" />
                    </div>
                  </div>
                  <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                    View Details →
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
