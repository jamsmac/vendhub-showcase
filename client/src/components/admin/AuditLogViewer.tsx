import { useState } from 'react';
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
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditLogViewerProps {
  userId?: number;
}

export function AuditLogViewer({ userId }: AuditLogViewerProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, refetch } = trpc.userManagement.getRoleChangeHistory.useQuery({
    userId: userId || undefined,
    page,
    limit,
  });

  const handleExport = () => {
    if (!data?.changes) return;

    const headers = ['Date', 'User', 'Old Role', 'New Role', 'Changed By', 'Reason'];
    const rows = data.changes.map((change: any) => [
      new Date(change.changedAt).toLocaleString('ru-RU'),
      change.userId,
      change.oldRole,
      change.newRole,
      change.changedBy,
      change.reason || 'N/A',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Журнал аудита экспортирован');
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

  const getRoleBadgeColor = (role: string) => {
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'manager':
        return 'Менеджер';
      case 'operator':
        return 'Оператор';
      default:
        return 'Пользователь';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Журнал изменения ролей</h3>
          <p className="text-sm text-slate-400">
            История всех изменений ролей пользователей в системе
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={!data?.changes || data.changes.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Экспорт CSV
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-700">
              <TableRow className="border-slate-600 hover:bg-slate-700">
                <TableHead className="text-slate-200">Дата</TableHead>
                <TableHead className="text-slate-200">ID Пользователя</TableHead>
                <TableHead className="text-slate-200">Старая роль</TableHead>
                <TableHead className="text-slate-200">Новая роль</TableHead>
                <TableHead className="text-slate-200">Изменено</TableHead>
                <TableHead className="text-slate-200">Причина</TableHead>
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
              ) : data?.changes && data.changes.length > 0 ? (
                data.changes.map((change: any) => (
                  <TableRow
                    key={change.id}
                    className="border-slate-700 hover:bg-slate-700/50"
                  >
                    <TableCell className="text-slate-300 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        {formatDate(change.changedAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-mono text-sm">
                      #{change.userId}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          change.oldRole
                        )}`}
                      >
                        {getRoleLabel(change.oldRole)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          change.newRole
                        )}`}
                      >
                        {getRoleLabel(change.newRole)}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      Администратор #{change.changedBy}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm max-w-xs truncate">
                      {change.reason || '—'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <span className="text-slate-400">Записей не найдено</span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">
            Всего записей: {data.total}
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
            <span className="text-sm text-slate-400 px-2 py-1">
              Страница {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!data?.changes || data.changes.length < limit}
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
