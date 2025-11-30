import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/DateRangePicker';
import { CheckCircle2, AlertCircle, Clock, Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AlertHistoryItem {
  id: number;
  ruleId: number;
  metric: string;
  value: number;
  threshold: number;
  operator: string;
  status: 'active' | 'acknowledged' | 'resolved';
  severity: string;
  message: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

interface AlertHistoryViewerProps {
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
}

export function AlertHistoryViewer({ onDateRangeChange }: AlertHistoryViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>(
    'all'
  );
  const [startDate, setStartDate] = useState<Date>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { data: historyData, refetch } = trpc.alerts.getHistory.useQuery({
    startDate,
    endDate,
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 100,
  });

  const acknowledgeAlertMutation = trpc.alerts.acknowledgeAlert.useMutation();
  const resolveAlertMutation = trpc.alerts.resolveAlert.useMutation();

  const alerts = historyData?.alerts || [];

  // Filter by search term
  const filteredAlerts = alerts.filter((alert) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      alert.message.toLowerCase().includes(searchLower) ||
      alert.metric.toLowerCase().includes(searchLower)
    );
  });

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    onDateRangeChange?.(start, end);
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      await acknowledgeAlertMutation.mutateAsync({ alertId });
      toast.success('Alert acknowledged');
      refetch();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (alertId: number) => {
    try {
      await resolveAlertMutation.mutateAsync({ alertId });
      toast.success('Alert resolved');
      refetch();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const handleExport = () => {
    // Generate CSV
    const headers = ['Timestamp', 'Metric', 'Value', 'Threshold', 'Operator', 'Status', 'Severity'];
    const rows = filteredAlerts.map((alert) => [
      format(new Date(alert.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      alert.metric,
      alert.value.toFixed(2),
      alert.threshold.toFixed(2),
      alert.operator,
      alert.status,
      alert.severity,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alert-history-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    link.click();

    toast.success('Alert history exported');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'acknowledged':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'acknowledged':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-500/20 text-blue-300';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'high':
        return 'bg-orange-500/20 text-orange-300';
      case 'critical':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Alert History</CardTitle>
            <CardDescription>
              {alerts.length} alert{alerts.length !== 1 ? 's' : ''} in selected period
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-slate-400">Active</p>
            <p className="text-lg font-semibold text-red-300">{activeCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-slate-400">Acknowledged</p>
            <p className="text-lg font-semibold text-yellow-300">{acknowledgedCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-slate-400">Resolved</p>
            <p className="text-lg font-semibold text-green-300">{resolvedCount}</p>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Select Date Range</p>
          <DateRangePicker
            onDateRangeChange={handleDateRangeChange}
            selectedPreset="7d"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by metric or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-md border border-slate-700 bg-slate-900 text-slate-300 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Alert History List */}
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">
              {alerts.length === 0 ? 'No alerts in this period' : 'No alerts match your search'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusIcon(alert.status)}
                      <span className="font-semibold text-slate-200">{alert.message}</span>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-sm text-slate-400">
                      <span>
                        {alert.metric.toUpperCase()}: {alert.value.toFixed(2)}% {alert.operator}{' '}
                        {alert.threshold.toFixed(2)}%
                      </span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(alert.createdAt), 'dd MMM yyyy HH:mm', { locale: ru })}
                      </span>
                    </div>

                    {alert.acknowledgedAt && (
                      <p className="text-xs text-slate-500">
                        Acknowledged:{' '}
                        {format(new Date(alert.acknowledgedAt), 'dd MMM yyyy HH:mm', {
                          locale: ru,
                        })}
                      </p>
                    )}

                    {alert.resolvedAt && (
                      <p className="text-xs text-slate-500">
                        Resolved:{' '}
                        {format(new Date(alert.resolvedAt), 'dd MMM yyyy HH:mm', { locale: ru })}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {alert.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcknowledge(alert.id)}
                        className="text-yellow-400 hover:text-yellow-300 hover:border-yellow-500"
                      >
                        Acknowledge
                      </Button>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolve(alert.id)}
                        className="text-green-400 hover:text-green-300 hover:border-green-500"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
