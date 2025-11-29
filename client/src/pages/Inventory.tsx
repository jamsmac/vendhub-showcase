import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockTransferModal } from "@/components/StockTransferModal";
import { AlertTriangle, Box, Package, Search, ShoppingCart, Truck, Warehouse } from "lucide-react";

const warehouseStock = [
  { id: 1, name: "Cola Zero 330ml", category: "Drinks", quantity: 2500, minLevel: 500, status: "good" },
  { id: 2, name: "Protein Bar Choco", category: "Snacks", quantity: 1200, minLevel: 300, status: "good" },
  { id: 3, name: "Water Still 500ml", category: "Drinks", quantity: 150, minLevel: 400, status: "low" },
  { id: 4, name: "Potato Chips Salt", category: "Snacks", quantity: 800, minLevel: 200, status: "good" },
  { id: 5, name: "Energy Drink X", category: "Drinks", quantity: 45, minLevel: 100, status: "critical" },
];

const operatorStock = [
  { id: 1, operator: "Mike Operator", items: 145, vehicle: "Van #04", route: "Downtown", status: "active" },
  { id: 2, operator: "John Tech", items: 82, vehicle: "Car #02", route: "North District", status: "active" },
  { id: 3, operator: "Sarah Manager", items: 0, vehicle: "None", route: "Office", status: "idle" },
];

const machineStock = [
  { id: 1, machine: "Lobby Snack #04", fillLevel: 85, lastRefill: "2 days ago", status: "good" },
  { id: 2, machine: "Gym Drink #02", fillLevel: 42, lastRefill: "5 days ago", status: "warning" },
  { id: 3, machine: "Office Coffee #01", fillLevel: 12, lastRefill: "1 week ago", status: "critical" },
  { id: 4, machine: "Station Drink #05", fillLevel: 92, lastRefill: "Yesterday", status: "good" },
];

export default function Inventory() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white tracking-tight">Inventory</h1>
            <p className="text-muted-foreground mt-1">3-Level Stock Tracking System</p>
          </div>
          <div className="flex gap-3">
            <StockTransferModal />
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Order Supplies
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-400 flex items-center gap-2">
                <Warehouse className="w-4 h-4" />
                Warehouse Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">4,695</div>
              <p className="text-xs text-muted-foreground mt-1">Total items in central storage</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-400 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                In Transit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">227</div>
              <p className="text-xs text-muted-foreground mt-1">Items with operators</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                <Box className="w-4 h-4" />
                In Machines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">12,450</div>
              <p className="text-xs text-muted-foreground mt-1">Active inventory deployed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="warehouse" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 w-full md:w-auto grid grid-cols-3 md:flex">
            <TabsTrigger value="warehouse" className="data-[state=active]:bg-primary data-[state=active]:text-white px-6">
              Warehouse
            </TabsTrigger>
            <TabsTrigger value="operator" className="data-[state=active]:bg-primary data-[state=active]:text-white px-6">
              Operator Stock
            </TabsTrigger>
            <TabsTrigger value="machine" className="data-[state=active]:bg-primary data-[state=active]:text-white px-6">
              Machine Levels
            </TabsTrigger>
          </TabsList>

          {/* Warehouse Tab */}
          <TabsContent value="warehouse" className="mt-6 space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {warehouseStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white border border-white/10">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="text-sm font-bold text-white">{item.quantity}</p>
                    </div>
                    
                    <div className="hidden md:block w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Level</span>
                        <span className={item.status === 'critical' ? 'text-rose-400' : item.status === 'low' ? 'text-amber-400' : 'text-emerald-400'}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      <Progress 
                        value={(item.quantity / (item.minLevel * 3)) * 100} 
                        className="h-1.5 bg-white/10" 
                        indicatorClassName={item.status === 'critical' ? 'bg-rose-500' : item.status === 'low' ? 'bg-amber-500' : 'bg-emerald-500'}
                      />
                    </div>

                    <div className="text-right min-w-[80px]">
                      {item.status === 'critical' || item.status === 'low' ? (
                        <Badge variant="outline" className="border-rose-500/50 text-rose-400 bg-rose-500/10">
                          Restock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                          OK
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Operator Tab */}
          <TabsContent value="operator" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {operatorStock.map((op) => (
                <Card key={op.id} className="bg-white/5 border-white/10 backdrop-blur-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-white text-lg">{op.operator}</CardTitle>
                    <Badge variant="secondary" className="bg-white/10 text-white">
                      {op.vehicle}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Load</span>
                        <span className="text-xl font-bold text-white">{op.items} items</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Route</span>
                        <span className="text-sm text-white">{op.route}</span>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <button className="w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                          View Manifest
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Machine Tab */}
          <TabsContent value="machine" className="mt-6">
            <div className="grid gap-4">
              {machineStock.map((machine) => (
                <div key={machine.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-12 rounded-full ${
                      machine.status === 'good' ? 'bg-emerald-500' : 
                      machine.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <div>
                      <h3 className="font-bold text-white">{machine.machine}</h3>
                      <p className="text-xs text-muted-foreground">Last refill: {machine.lastRefill}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-1 justify-end max-w-md">
                    <div className="w-full">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Fill Level</span>
                        <span className="text-white font-bold">{machine.fillLevel}%</span>
                      </div>
                      <Progress 
                        value={machine.fillLevel} 
                        className="h-2 bg-white/10" 
                        indicatorClassName={
                          machine.fillLevel < 20 ? 'bg-rose-500' : 
                          machine.fillLevel < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }
                      />
                    </div>
                    
                    {machine.fillLevel < 30 && (
                      <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
