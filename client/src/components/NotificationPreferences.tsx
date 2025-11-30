import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Mail, Send, AlertCircle, Clock } from 'lucide-react';

export function NotificationPreferences() {
  const [loading, setLoading] = useState(false);
  const [testingChannel, setTestingChannel] = useState<'email' | 'telegram' | null>(null);

  // Fetch preferences
  const { data: preferences, isLoading: preferencesLoading, refetch } = trpc.notifications.getPreferences.useQuery();

  // Mutations
  const updatePreferencesMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success('Preferences updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update preferences');
    },
  });

  const sendTestMutation = trpc.notifications.sendTest.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Test notification sent via ${testingChannel}`);
      } else {
        toast.error(data.error || 'Failed to send test notification');
      }
      setTestingChannel(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send test notification');
      setTestingChannel(null);
    },
  });

  const getStatsMutation = trpc.notifications.getStats.useQuery();

  // Form state
  const [formData, setFormData] = useState({
    emailAlerts: true,
    telegramAlerts: true,
    emailCritical: true,
    emailWarning: true,
    emailInfo: false,
    telegramCritical: true,
    telegramWarning: true,
    telegramInfo: false,
    quietHoursStart: '',
    quietHoursEnd: '',
    timezone: 'UTC',
  });

  // Initialize form with preferences
  useEffect(() => {
    if (preferences) {
      setFormData({
        emailAlerts: preferences.emailAlerts ?? true,
        telegramAlerts: preferences.telegramAlerts ?? true,
        emailCritical: preferences.emailCritical ?? true,
        emailWarning: preferences.emailWarning ?? true,
        emailInfo: preferences.emailInfo ?? false,
        telegramCritical: preferences.telegramCritical ?? true,
        telegramWarning: preferences.telegramWarning ?? true,
        telegramInfo: preferences.telegramInfo ?? false,
        quietHoursStart: preferences.quietHoursStart ?? '',
        quietHoursEnd: preferences.quietHoursEnd ?? '',
        timezone: preferences.timezone ?? 'UTC',
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePreferencesMutation.mutateAsync(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async (channel: 'email' | 'telegram') => {
    setTestingChannel(channel);
    try {
      await sendTestMutation.mutateAsync({ channel });
    } finally {
      setTestingChannel(null);
    }
  };

  if (preferencesLoading) {
    return <div className="text-center py-8">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive alerts via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailAlerts">Enable Email Alerts</Label>
            <Switch
              id="emailAlerts"
              checked={formData.emailAlerts}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, emailAlerts: checked })
              }
            />
          </div>

          {formData.emailAlerts && (
            <>
              <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailCritical">Critical Alerts</Label>
                  <Switch
                    id="emailCritical"
                    checked={formData.emailCritical}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, emailCritical: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="emailWarning">Warning Alerts</Label>
                  <Switch
                    id="emailWarning"
                    checked={formData.emailWarning}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, emailWarning: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="emailInfo">Info Alerts</Label>
                  <Switch
                    id="emailInfo"
                    checked={formData.emailInfo}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, emailInfo: checked })
                    }
                  />
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => handleSendTest('email')}
                disabled={testingChannel === 'email'}
                className="w-full"
              >
                {testingChannel === 'email' ? 'Sending...' : 'Send Test Email'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Telegram Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Telegram Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive alerts via Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="telegramAlerts">Enable Telegram Alerts</Label>
            <Switch
              id="telegramAlerts"
              checked={formData.telegramAlerts}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, telegramAlerts: checked })
              }
            />
          </div>

          {formData.telegramAlerts && (
            <>
              <div className="space-y-3 pl-4 border-l-2 border-blue-400">
                <div className="flex items-center justify-between">
                  <Label htmlFor="telegramCritical">Critical Alerts</Label>
                  <Switch
                    id="telegramCritical"
                    checked={formData.telegramCritical}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, telegramCritical: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="telegramWarning">Warning Alerts</Label>
                  <Switch
                    id="telegramWarning"
                    checked={formData.telegramWarning}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, telegramWarning: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="telegramInfo">Info Alerts</Label>
                  <Switch
                    id="telegramInfo"
                    checked={formData.telegramInfo}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, telegramInfo: checked })
                    }
                  />
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => handleSendTest('telegram')}
                disabled={testingChannel === 'telegram'}
                className="w-full"
              >
                {testingChannel === 'telegram' ? 'Sending...' : 'Send Test Message'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Set times when you don't want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quietStart">Start Time (HH:MM)</Label>
              <Input
                id="quietStart"
                type="time"
                value={formData.quietHoursStart}
                onChange={(e) =>
                  setFormData({ ...formData, quietHoursStart: e.target.value })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="quietEnd">End Time (HH:MM)</Label>
              <Input
                id="quietEnd"
                type="time"
                value={formData.quietHoursEnd}
                onChange={(e) =>
                  setFormData({ ...formData, quietHoursEnd: e.target.value })
                }
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={formData.timezone} onValueChange={(value) =>
              setFormData({ ...formData, timezone: value })
            }>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                <SelectItem value="Australia/Sydney">Sydney</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {getStatsMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Notification Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{getStatsMutation.data.total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getStatsMutation.data.sent}</div>
                <div className="text-sm text-gray-500">Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{getStatsMutation.data.failed}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{getStatsMutation.data.skipped}</div>
                <div className="text-sm text-gray-500">Skipped</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                <p>Email: {getStatsMutation.data.byChannel.email}</p>
                <p>Telegram: {getStatsMutation.data.byChannel.telegram}</p>
                <p>In-App: {getStatsMutation.data.byChannel['in-app']}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={loading || updatePreferencesMutation.isPending}
          className="flex-1"
        >
          {loading || updatePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={preferencesLoading}
          className="flex-1"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
