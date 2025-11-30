import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, X } from 'lucide-react';
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

interface AlertRulesEditorProps {
  rule?: AlertRule;
  onSave?: (rule: AlertRule) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function AlertRulesEditor({
  rule,
  onSave,
  onCancel,
  isLoading = false,
}: AlertRulesEditorProps) {
  const [formData, setFormData] = useState<AlertRule>(
    rule || {
      name: '',
      description: '',
      metric: 'memory',
      threshold: 80,
      operator: '>',
      escalationLevel: 'medium',
      cooldownMinutes: 5,
      isEnabled: true,
      notifyUser: true,
      notifyAdmin: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const createRuleMutation = trpc.alerts.createRule.useMutation();
  const updateRuleMutation = trpc.alerts.updateRule.useMutation();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Rule name is required';
    }

    if (formData.threshold < 0 || formData.threshold > 100) {
      newErrors.threshold = 'Threshold must be between 0 and 100';
    }

    if (formData.cooldownMinutes < 1) {
      newErrors.cooldownMinutes = 'Cooldown must be at least 1 minute';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);

    try {
      if (rule?.id) {
        // Update existing rule
        await updateRuleMutation.mutateAsync({
          id: rule.id,
          data: formData,
        });
        toast.success('Alert rule updated successfully');
      } else {
        // Create new rule
        await createRuleMutation.mutateAsync(formData);
        toast.success('Alert rule created successfully');
      }

      onSave?.(formData);
    } catch (error) {
      console.error('Error saving alert rule:', error);
      toast.error('Failed to save alert rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof AlertRule, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{rule?.id ? 'Edit Alert Rule' : 'Create New Alert Rule'}</CardTitle>
        <CardDescription>
          {rule?.id
            ? 'Update the alert rule configuration'
            : 'Configure a new performance alert rule with thresholds and escalation policies'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Rule Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., High Memory Usage Alert"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Describe when this alert should trigger..."
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Metric Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Metric Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metric" className="text-slate-300">
                  Metric *
                </Label>
                <Select value={formData.metric} onValueChange={(value) => handleChange('metric', value)}>
                  <SelectTrigger id="metric">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="memory">Memory Usage</SelectItem>
                    <SelectItem value="cpu">CPU Usage</SelectItem>
                    <SelectItem value="disk">Disk Usage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold" className="text-slate-300">
                  Threshold (%) *
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.threshold}
                  onChange={(e) => handleChange('threshold', parseFloat(e.target.value))}
                  className={errors.threshold ? 'border-red-500' : ''}
                />
                {errors.threshold && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.threshold}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="operator" className="text-slate-300">
                  Operator *
                </Label>
                <Select value={formData.operator} onValueChange={(value) => handleChange('operator', value)}>
                  <SelectTrigger id="operator">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=">">Greater than (&gt;)</SelectItem>
                    <SelectItem value="<">Less than (&lt;)</SelectItem>
                    <SelectItem value=">=">&gt;= (Greater or equal)</SelectItem>
                    <SelectItem value="<=">&lt;= (Less or equal)</SelectItem>
                    <SelectItem value="==">Equal (==)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Escalation & Notifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Escalation & Notifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="escalationLevel" className="text-slate-300">
                  Escalation Level *
                </Label>
                <Select
                  value={formData.escalationLevel}
                  onValueChange={(value) => handleChange('escalationLevel', value)}
                >
                  <SelectTrigger id="escalationLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Informational)</SelectItem>
                    <SelectItem value="medium">Medium (Warning)</SelectItem>
                    <SelectItem value="high">High (Critical)</SelectItem>
                    <SelectItem value="critical">Critical (Urgent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooldown" className="text-slate-300">
                  Cooldown (minutes) *
                </Label>
                <Input
                  id="cooldown"
                  type="number"
                  min="1"
                  value={formData.cooldownMinutes}
                  onChange={(e) => handleChange('cooldownMinutes', parseInt(e.target.value))}
                  className={errors.cooldownMinutes ? 'border-red-500' : ''}
                />
                {errors.cooldownMinutes && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.cooldownMinutes}
                  </p>
                )}
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyUser" className="text-slate-300">
                  Notify User
                </Label>
                <Switch
                  id="notifyUser"
                  checked={formData.notifyUser}
                  onCheckedChange={(checked) => handleChange('notifyUser', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="notifyAdmin" className="text-slate-300">
                  Notify Admin
                </Label>
                <Switch
                  id="notifyAdmin"
                  checked={formData.notifyAdmin}
                  onCheckedChange={(checked) => handleChange('notifyAdmin', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isEnabled" className="text-slate-300">
                  Enable Rule
                </Label>
                <Switch
                  id="isEnabled"
                  checked={formData.isEnabled}
                  onCheckedChange={(checked) => handleChange('isEnabled', checked)}
                />
              </div>
            </div>
          </div>

          {/* Auto Action (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="autoAction" className="text-slate-300">
              Auto Action (Optional)
            </Label>
            <Select
              value={formData.autoAction || ''}
              onValueChange={(value) => handleChange('autoAction', value || undefined)}
            >
              <SelectTrigger id="autoAction">
                <SelectValue placeholder="Select auto action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                <SelectItem value="cleanup">Auto Cleanup</SelectItem>
                <SelectItem value="scale_up">Scale Up</SelectItem>
                <SelectItem value="restart">Restart Service</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400">
              Automatically execute an action when this alert triggers
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-700">
            <Button
              type="submit"
              disabled={submitting || isLoading}
              className="flex-1"
            >
              {submitting || isLoading ? 'Saving...' : rule?.id ? 'Update Rule' : 'Create Rule'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting || isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
