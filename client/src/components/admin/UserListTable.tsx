import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

type UserRole = 'user' | 'operator' | 'manager' | 'admin';
type UserStatus = 'active' | 'suspended' | 'inactive';

interface UserListTableProps {
  onSelectUser?: (userId: number) => void;
  onRoleChange?: (userId: number, newRole: UserRole) => void;
  onSuspendUser?: (userId: number) => void;
}

export function UserListTable({
  onSelectUser,
  onRoleChange,
  onSuspendUser,
}: UserListTableProps) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, refetch } = trpc.userManagement.listUsers.useQuery({
    search: search || undefined,
    role: (role as UserRole) || undefined,
    status: (status as UserStatus) || undefined,
    page,
    limit,
  });

  const exportMutation = trpc.userManagement.exportUsers.useMutation();

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        role: (role as UserRole) || undefined,
        status: (status as UserStatus) || undefined,
      });

      // Create blob and download
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', result.filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Users exported successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to export users');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'operator':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Поиск по имени или email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Role Filter */}
          <Select value={role} onValueChange={(value) => {
            setRole(value as UserRole | '');
            setPage(1);
          }}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Все роли" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="">Все роли</SelectItem>
              <SelectItem value="user">Пользователь</SelectItem>
              <SelectItem value="operator">Оператор</SelectItem>
              <SelectItem value="manager">Менеджер</SelectItem>
              <SelectItem value="admin">Администратор</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={status} onValueChange={(value) => {
            setStatus(value as UserStatus | '');
            setPage(1);
          }}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="">Все статусы</SelectItem>
              <SelectItem value="active">Активный</SelectItem>
              <SelectItem value="suspended">Заблокирован</SelectItem>
              <SelectItem value="inactive">Неактивный</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {exportMutation.isPending ? 'Экспорт...' : 'Экспорт CSV'}
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-700">
              <TableRow className="border-slate-600 hover:bg-slate-700">
                <TableHead className="text-slate-200">Имя</TableHead>
                <TableHead className="text-slate-200">Email</TableHead>
                <TableHead className="text-slate-200">Роль</TableHead>
                <TableHead className="text-slate-200">Статус</TableHead>
                <TableHead className="text-slate-200">Последний вход</TableHead>
                <TableHead className="text-slate-200 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-400">Загрузка...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data?.users && data.users.length > 0 ? (
                data.users.map((user: any) => (
                  <TableRow
                    key={user.id}
                    className="border-slate-700 hover:bg-slate-700/50 cursor-pointer"
                    onClick={() => onSelectUser?.(user.id)}
                  >
                    <TableCell className="text-white font-medium">
                      {user.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.email || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                          user.role
                        )}`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role === 'admin'
                          ? 'Администратор'
                          : user.role === 'manager'
                          ? 'Менеджер'
                          : user.role === 'operator'
                          ? 'Оператор'
                          : 'Пользователь'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.status)}
                        <span className="text-slate-300 text-sm">
                          {user.status === 'active'
                            ? 'Активный'
                            : user.status === 'suspended'
                            ? 'Заблокирован'
                            : 'Неактивный'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {formatDate(user.lastSignedIn)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRoleChange?.(user.id, user.role);
                          }}
                          className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Роль
                        </Button>
                        {user.status === 'active' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSuspendUser?.(user.id);
                            }}
                            className="text-xs"
                          >
                            Блокировать
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <span className="text-slate-400">Пользователи не найдены</span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">
            Страница {data.page} из {data.pages} ({data.total} пользователей)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(data.pages, page + 1))}
              disabled={page === data.pages}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
