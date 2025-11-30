import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Play, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface AlertRule {
  id: number;
  name: string;
  metric: 'memory' | 'cpu' | 'disk';
  threshold: number;
  operator: string;
  escalationLevel: 'low' | 'medium' | 'high' | 'critical';
  isEnabled: boolean;
  cooldownMinutes: number;
  notifyUser: boolean;
  notifyAdmin: boolean;
}

interface AlertRulesListProps {
  onEdit?: (rule: AlertRule) => void;
  onCreate?: () => void;
}

export function AlertRulesList({ onEdit, onCreate }: AlertRulesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'metric' | 'threshold'>('name');

  const { data: rulesData, refetch } = trpc.alerts.listRules.useQuery();
  const deleteRuleMutation = trpc.alerts.deleteRule.useMutation();
  const testRuleMutation = trpc.alerts.testRule.useMutation();

  const rules = rulesData?.rules || [];

  // Filter and sort rules
  const filteredRules = rules
    .filter((rule) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        rule.name.toLowerCase().includes(searchLower) ||
        rule.metric.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'metric':
          return a.metric.localeCompare(b.metric);
        case 'threshold':
          return a.threshold - b.threshold;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleDelete = async (ruleId: number) => {
    try {
      await deleteRuleMutation.mutateAsync({ id: ruleId });
      toast.success('Alert rule deleted successfully');
      refetch();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete alert rule');
    }
  };

  const handleTest = async (ruleId: number) => {
    try {
      await testRuleMutation.mutateAsync({ id: ruleId });
      toast.success('Test alert triggered successfully');
    } catch (error) {
      console.error('Error testing rule:', error);
      toast.error('Failed to test alert rule');
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'memory':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'cpu':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'disk':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Alert Rules</CardTitle>
            <CardDescription>
              {rules.length} rule{rules.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </div>
          <Button onClick={onCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            New Rule
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Sort */}
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or metric..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-md border border-slate-700 bg-slate-900 text-slate-300 text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="metric">Sort by Metric</option>
            <option value="threshold">Sort by Threshold</option>
          </select>
        </div>

        {/* Rules List */}
        {filteredRules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">
              {rules.length === 0 ? 'No alert rules created yet' : 'No rules match your search'}
            </p>
            {rules.length === 0 && (
              <Button onClick={onCreate} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create First Rule
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-200">{rule.name}</h4>
                      {rule.isEnabled ? (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-400">
                          Disabled
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getMetricColor(rule.metric)}>
                        {rule.metric.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-slate-400">
                        {rule.operator} {rule.threshold}%
                      </span>
                      <Badge className={getSeverityColor(rule.escalationLevel)}>
                        {rule.escalationLevel}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Cooldown: {rule.cooldownMinutes}m
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      {rule.notifyUser && <span>📧 User</span>}
                      {rule.notifyAdmin && <span>👤 Admin</span>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTest(rule.id)}
                      title="Test this alert rule"
                      className="gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span className="hidden sm:inline">Test</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit?.(rule)}
                      title="Edit this rule"
                      className="gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm(rule.id)}
                      title="Delete this rule"
                      className="gap-1 text-red-400 hover:text-red-300 hover:border-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Alert Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The alert rule will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
