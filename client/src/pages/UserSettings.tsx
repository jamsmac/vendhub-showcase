import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { TwoFactorSetup } from '@/components/TwoFactorSetup';
import { BackupCodeManager } from '@/components/BackupCodeManager';
import { RegenerateBackupCodesDialog } from '@/components/RegenerateBackupCodesDialog';
import { Bell, User, Lock, Smartphone, Shield, AlertCircle, CheckCircle2, Loader2, Key } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

  // Fetch 2FA status
  const { data: twoFactorStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = 
    trpc.auth.getTwoFactorStatus.useQuery();

  const disableTwoFactor = trpc.auth.disableTwoFactor.useMutation();

  const handleDisableTwoFactor = async () => {
    if (!window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }

    try {
      const result = await disableTwoFactor.mutateAsync();
      if (result.success) {
        toast.success('2FA disabled successfully');
        refetchStatus();
      } else {
        toast.error(result.message || 'Failed to disable 2FA');
      }
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      toast.error(error.message || 'Failed to disable 2FA');
    }
  };

  const handleTwoFactorSetupSuccess = () => {
    setShowTwoFactorSetup(false);
    refetchStatus();
    toast.success('2FA setup complete!');
  };

  const handleRegenerateBackupCodes = async () => {
    setShowRegenerateDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            User Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your preferences, notifications, and security settings
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                Notification Preferences
              </h2>
              <NotificationPreferences />
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                Profile Information
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Profile management features will be added in a future update.
              </p>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Two-Factor Authentication Card */}
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  {isLoadingStatus ? (
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                  ) : twoFactorStatus?.enabled ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Enabled</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Disabled</span>
                    </div>
                  )}
                </div>

                {twoFactorStatus?.enabled ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Your account is protected with two-factor authentication. You'll need both your password and a code from your authenticator app to log in.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowTwoFactorSetup(true)}
                        className="flex-1"
                      >
                        Regenerate Secret
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRegenerateBackupCodes}
                        className="flex-1"
                      >
                        Regenerate Codes
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDisableTwoFactor}
                        disabled={disableTwoFactor.isPending}
                        className="flex-1"
                      >
                        {disableTwoFactor.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Disabling...
                          </>
                        ) : (
                          'Disable 2FA'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Two-factor authentication is not enabled on your account. We recommend enabling it for better security.
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowTwoFactorSetup(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Enable 2FA
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Password Security Card */}
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Password Security
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Change your password regularly to keep your account secure
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Password Requirements:</strong>
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1 list-disc list-inside">
                      <li>At least 8 characters</li>
                      <li>Uppercase and lowercase letters</li>
                      <li>Numbers and special characters</li>
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </Card>

            {/* Backup Codes Card */}
            {twoFactorStatus?.enabled && (
              <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6">
                  <BackupCodeManager
                    userId={1} // TODO: Get actual user ID from context
                    onCodesRegenerated={() => setShowRegenerateDialog(false)}
                  />
                </div>
              </Card>
            )}

            {/* Session Management Card */}
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Active Sessions
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Manage your active sessions across devices
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      You have 1 active session on this device.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Sign Out All Sessions
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Two-Factor Setup Dialog */}
      <TwoFactorSetup
        open={showTwoFactorSetup}
        onOpenChange={setShowTwoFactorSetup}
        onSuccess={handleTwoFactorSetupSuccess}
      />

      {/* Regenerate Backup Codes Dialog */}
      <RegenerateBackupCodesDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
        onConfirm={async () => {
          // TODO: Call tRPC endpoint to regenerate codes
          toast.success('Backup codes regenerated');
        }}
      />
    </div>
  );
}
