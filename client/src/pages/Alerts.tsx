'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AlertRulesEditor } from '@/components/admin/AlertRulesEditor';
import { AlertRulesList } from '@/components/admin/AlertRulesList';
import { AlertHistoryViewer } from '@/components/admin/AlertHistoryViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Bell, RefreshCw, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface AlertRule {
  id?: number;
  name: string;
  description?: string;
  metric: 'memory' | 'cpu' | 'disk';
  threshold: number;
  operator: '>' | '<' | '>=' | '<=' | '==';
  escalationLevel: 'low' | 'medium' | 'high' | 'critical';
  cooldownMinutes: number;
  isEnabled: boolean;
  notifyUser: boolean;
  notifyAdmin: boolean;
  autoAction?: string;
}

export default function Alerts() {
  const [selectedTab, setSelectedTab] = useState('rules');
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: activeAlertsData } = trpc.alerts.getActive.useQuery();
  const checkAllMutation = trpc.alerts.checkAll.useMutation();

  const activeAlerts = activeAlertsData?.alerts || [];

  const handleRefreshAlerts = async () => {
    setRefreshing(true);
    try {
      await checkAllMutation.mutateAsync();
      toast.success('All alerts checked');
    } catch (error) {
      console.error('Error checking alerts:', error);
      toast.error('Failed to check alerts');
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditRule = (rule: AlertRule) => {
    setEditingRule(rule);
    setShowEditor(true);
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setShowEditor(true);
  };

  const handleSaveRule = () => {
    setShowEditor(false);
    setEditingRule(null);
  };

  const handleCancelEditor = () => {
    setShowEditor(false);
    setEditingRule(null);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Performance Alerts
            </h1>
            <p className="text-gray-600 mt-1">Create and manage alert rules for performance monitoring</p>
          </div>
          <Button
            onClick={handleRefreshAlerts}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Checking...' : 'Check Now'}
          </Button>
        </div>

        {/* Active Alerts Summary */}
        {activeAlerts.length > 0 && (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-red-400">Active Alerts</CardTitle>
                </div>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                  {activeAlerts.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="text-sm text-slate-300">
                    <span className="font-semibold">{alert.message}</span>
                    <span className="text-slate-500 ml-2">
                      ({alert.metric} {alert.value.toFixed(1)}%)
                    </span>
                  </div>
                ))}
                {activeAlerts.length > 3 && (
                  <p className="text-xs text-slate-400 mt-2">
                    +{activeAlerts.length - 3} more alerts
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {showEditor ? (
          <AlertRulesEditor
            rule={editingRule || undefined}
            onSave={handleSaveRule}
            onCancel={handleCancelEditor}
          />
        ) : (
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rules">Alert Rules</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-4">
              <AlertRulesList
                onEdit={handleEditRule}
                onCreate={handleCreateRule}
              />
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <AlertHistoryViewer />
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Alert Statistics
                  </CardTitle>
                  <CardDescription>
                    Overview of alert activity and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs text-slate-400 mb-1">Total Rules</p>
                      <p className="text-2xl font-bold text-blue-300">—</p>
                      <p className="text-xs text-slate-500 mt-1">Coming soon</p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs text-slate-400 mb-1">Active Alerts</p>
                      <p className="text-2xl font-bold text-red-300">{activeAlerts.length}</p>
                      <p className="text-xs text-slate-500 mt-1">Right now</p>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-xs text-slate-400 mb-1">This Week</p>
                      <p className="text-2xl font-bold text-yellow-300">—</p>
                      <p className="text-xs text-slate-500 mt-1">Coming soon</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-slate-400 mb-1">Resolved</p>
                      <p className="text-2xl font-bold text-green-300">—</p>
                      <p className="text-xs text-slate-500 mt-1">Coming soon</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <h4 className="font-semibold text-slate-200 mb-2">Tips for Effective Alerts</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li>• Set thresholds based on your system's normal operating range</li>
                      <li>• Use appropriate cooldown periods to avoid alert fatigue</li>
                      <li>• Configure escalation policies for critical metrics</li>
                      <li>• Test alerts before enabling them in production</li>
                      <li>• Review and adjust rules based on alert history trends</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ProtectedRoute>
  );
}
