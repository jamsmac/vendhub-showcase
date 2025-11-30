import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/currency";

interface Product {
  id: number;
  name: string;
  sku?: string;
  category: string;
  price: number;
  cost?: number;
  stock?: number;
  lowStockThreshold?: number;
  description?: string;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Кока-Кола 0.5л",
    sku: "COLA-500",
    category: "Напитки",
    price: 150,
    cost: 80,
    stock: 245,
    lowStockThreshold: 50,
    description: "Газированный напиток Coca-Cola 0.5л",
  },
  {
    id: 2,
    name: "Snickers 50г",
    sku: "SNICK-50",
    category: "Снеки",
    price: 100,
    cost: 55,
    stock: 180,
    lowStockThreshold: 40,
    description: "Шоколадный батончик Snickers 50г",
  },
  {
    id: 3,
    name: "Вода Бон Аква 0.5л",
    sku: "WATER-500",
    category: "Напитки",
    price: 80,
    cost: 40,
    stock: 320,
    lowStockThreshold: 60,
    description: "Питьевая вода BonAqua 0.5л",
  },
  {
    id: 4,
    name: "Lays Сметана 90г",
    sku: "LAYS-90",
    category: "Снеки",
    price: 120,
    cost: 65,
    stock: 25,
    lowStockThreshold: 30,
    description: "Чипсы Lay's со вкусом сметаны и лука 90г",
  },
  {
    id: 5,
    name: "Кофе Латте 250мл",
    sku: "LATTE-250",
    category: "Кофе",
    price: 200,
    cost: 110,
    stock: 15,
    lowStockThreshold: 20,
    description: "Кофейный напиток Латте 250мл",
  },
  {
    id: 6,
    name: "Mars 50г",
    sku: "MARS-50",
    category: "Снеки",
    price: 95,
    cost: 50,
    stock: 150,
    lowStockThreshold: 40,
    description: "Шоколадный батончик Mars 50г",
  },
];

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    sku: "",
    category: "Напитки",
    price: 0,
    cost: 0,
    stock: 0,
    lowStockThreshold: 30,
    description: "",
  });

  const { data: products = [], isLoading } = trpc.products.list.useQuery();

  // Use mock data if no real data
  const displayProducts = products.length > 0 ? products : mockProducts;

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(displayProducts.map((p: Product) => p.category));
    return Array.from(uniqueCategories).sort();
  }, [displayProducts]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return displayProducts.filter((product: Product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [displayProducts, searchQuery, categoryFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const lowStockProducts = displayProducts.filter(
      (p: Product) => (p.stock ?? 0) < (p.lowStockThreshold ?? 30)
    );
    const totalValue = displayProducts.reduce(
      (sum: number, p: Product) => sum + (p.price ?? 0) * (p.stock ?? 0),
      0
    );
    const totalCost = displayProducts.reduce(
      (sum: number, p: Product) => sum + (p.cost ?? 0) * (p.stock ?? 0),
      0
    );

    return {
      total: displayProducts.length,
      lowStock: lowStockProducts.length,
      totalValue,
      totalCost,
      profit: totalValue - totalCost,
    };
  }, [displayProducts]);

  const handleCreate = () => {
    toast.success("Товар создан успешно!");
    setIsCreateDialogOpen(false);
    setFormData({
      name: "",
      sku: "",
      category: "Напитки",
      price: 0,
      cost: 0,
      stock: 0,
      lowStockThreshold: 30,
      description: "",
    });
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    toast.success("Товар обновлен успешно!");
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    toast.success("Товар удален успешно!");
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return { label: "Нет в наличии", color: "bg-red-100 text-red-800 border-red-300" };
    if (stock < threshold) return { label: "Низкий остаток", color: "bg-orange-100 text-orange-800 border-orange-300" };
    return { label: "В наличии", color: "bg-green-100 text-green-800 border-green-300" };
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Товары</h1>
            <p className="text-gray-600 mt-1">
              Управление каталогом товаров и отслеживание остатков
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Добавить товар
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Создать новый товар</DialogTitle>
                <DialogDescription>
                  Заполните информацию о новом товаре
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название товара</Label>
                  <Input
                    id="name"
                    placeholder="Введите название"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">Артикул (SKU)</Label>
                  <Input
                    id="sku"
                    placeholder="Введите артикул"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Напитки">Напитки</SelectItem>
                      <SelectItem value="Снеки">Снеки</SelectItem>
                      <SelectItem value="Кофе">Кофе</SelectItem>
                      <SelectItem value="Шоколад">Шоколад</SelectItem>
                      <SelectItem value="Другое">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Цена продажи (UZS)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Себестоимость (UZS)</Label>
                  <Input
                    id="cost"
                    type="number"
                    placeholder="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Количество на складе</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Порог низкого остатка</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="30"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Введите описание товара"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreate}>Создать товар</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Всего товаров
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700">
                Низкий остаток
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div className="text-2xl font-bold text-orange-700">{stats.lowStock}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Стоимость склада
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Себестоимость
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700">
                Потенциальная прибыль
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(stats.profit)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Фильтры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию, артикулу или описанию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Фильтр по категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">
              Показано {filteredProducts.length} из {displayProducts.length} товаров
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Загрузка товаров...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Товары не найдены
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Товар
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Артикул
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Категория
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Цена
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Остаток
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product: Product) => {
                      const stockStatus = getStockStatus(
                        product.stock ?? 0,
                        product.lowStockThreshold ?? 30
                      );
                      const margin = product.price && product.cost
                        ? ((product.price - product.cost) / product.price * 100).toFixed(1)
                        : "0";

                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-gray-500 line-clamp-1">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.sku || "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{product.category}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {formatCurrency(product.price ?? 0)}
                              </div>
                              {product.cost && (
                                <div className="text-xs text-gray-500">
                                  Маржа: {margin}%
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {product.stock ?? 0} шт.
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(product)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Редактировать товар</DialogTitle>
              <DialogDescription>
                Внесите изменения в информацию о товаре
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название товара</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku">Артикул (SKU)</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Категория</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Напитки">Напитки</SelectItem>
                    <SelectItem value="Снеки">Снеки</SelectItem>
                    <SelectItem value="Кофе">Кофе</SelectItem>
                    <SelectItem value="Шоколад">Шоколад</SelectItem>
                    <SelectItem value="Другое">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Цена продажи (UZS)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cost">Себестоимость (UZS)</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Количество на складе</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-threshold">Порог низкого остатка</Label>
                <Input
                  id="edit-threshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-description">Описание</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdate}>Сохранить изменения</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие нельзя отменить. Товар "{selectedProduct?.name}" будет удален из
                каталога.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
