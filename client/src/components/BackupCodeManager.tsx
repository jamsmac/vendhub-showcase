import React, { useState, useEffect } from 'react';
import { Download, RotateCcw, Eye, EyeOff, Copy, Check, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BackupCode {
  id: number;
  code: string;
  isUsed: boolean;
  usedAt?: string;
  createdAt: string;
}

interface BackupCodeStats {
  total: number;
  used: number;
  unused: number;
  lastGenerated: string | null;
}

interface BackupCodeManagerProps {
  userId: number;
  onCodesRegenerated?: () => void;
}

export const BackupCodeManager: React.FC<BackupCodeManagerProps> = ({
  userId,
  onCodesRegenerated,
}) => {
  const [codes, setCodes] = useState<BackupCode[]>([]);
  const [stats, setStats] = useState<BackupCodeStats | null>(null);
  const [showCodes, setShowCodes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Load backup codes on mount
  useEffect(() => {
    loadBackupCodes();
  }, [userId]);

  const loadBackupCodes = async () => {
    try {
      setLoading(true);
      // TODO: Call tRPC endpoint to fetch backup codes
      // const response = await trpc.user.getBackupCodes.useQuery({ userId });
      // setCodes(response.data);
      // setStats(response.stats);
    } catch (error) {
      console.error('Failed to load backup codes:', error);
      toast.error('Failed to load backup codes');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!confirm('Are you sure you want to regenerate your backup codes? Your current codes will no longer work.')) {
      return;
    }

    try {
      setRegenerating(true);
      // TODO: Call tRPC endpoint to regenerate backup codes
      // const response = await trpc.user.regenerateBackupCodes.mutate({ userId });
      // setCodes(response.codes);
      // setStats(response.stats);
      toast.success('Backup codes regenerated successfully');
      onCodesRegenerated?.();
    } catch (error) {
      console.error('Failed to regenerate backup codes:', error);
      toast.error('Failed to regenerate backup codes');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    if (codes.length === 0) {
      toast.error('No backup codes available to download');
      return;
    }

    const codesText = codes
      .filter((c) => !c.isUsed)
      .map((c) => c.code)
      .join('\n');

    if (!codesText) {
      toast.error('No unused backup codes available to download');
      return;
    }

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(codesText)}`);
    element.setAttribute('download', `backup-codes-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success('Backup codes downloaded');
  };

  const handleCopyCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <strong>Important:</strong> Backup codes are one-time use only. Store them in a secure location like a password manager. Each code can only be used once for account recovery.
        </AlertDescription>
      </Alert>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Codes</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.unused}</div>
                <div className="text-sm text-muted-foreground">Unused</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.used}</div>
                <div className="text-sm text-muted-foreground">Used</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle>Backup Codes</CardTitle>
                <CardDescription>
                  {stats?.lastGenerated
                    ? `Last generated on ${formatDate(stats.lastGenerated)}`
                    : 'No backup codes generated yet'}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Codes Display */}
          {codes.length > 0 && (
            <Tabs defaultValue="unused" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="unused">
                  Unused ({stats?.unused || 0})
                </TabsTrigger>
                <TabsTrigger value="all">
                  All Codes ({stats?.total || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unused" className="space-y-4">
                {codes.filter((c) => !c.isUsed).length > 0 ? (
                  <div className="space-y-3">
                    {codes
                      .filter((c) => !c.isUsed)
                      .map((code) => (
                        <div
                          key={code.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-accent/50"
                        >
                          <div className="flex items-center gap-3">
                            <code className="font-mono text-lg font-semibold tracking-wider text-foreground">
                              {showCodes ? code.code : '••••••••'}
                            </code>
                            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                              Unused
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(code.code, code.id)}
                            className="h-8 w-8 p-0"
                          >
                            {copiedId === code.id ? (
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center">
                    <p className="text-sm text-muted-foreground">All backup codes have been used</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                <div className="space-y-3">
                  {codes.map((code) => (
                    <div
                      key={code.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3">
                        <code className="font-mono text-lg font-semibold tracking-wider text-foreground">
                          {showCodes ? code.code : '••••••••'}
                        </code>
                        {code.isUsed ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                            Used {code.usedAt && `on ${formatDate(code.usedAt)}`}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                            Unused
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(code.code, code.id)}
                        className="h-8 w-8 p-0"
                        disabled={code.isUsed}
                      >
                        {copiedId === code.id ? (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {codes.length === 0 && !loading && (
            <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">No backup codes generated yet</p>
              <p className="mt-2 text-xs text-muted-foreground">Generate backup codes to secure your account</p>
            </div>
          )}

          {/* Toggle Visibility */}
          {codes.length > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCodes(!showCodes)}
                className="gap-2"
              >
                {showCodes ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Codes
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Codes
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                {showCodes ? 'Codes are visible' : 'Codes are hidden for security'}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-border pt-4">
            <Button
              onClick={handleDownloadBackupCodes}
              disabled={codes.filter((c) => !c.isUsed).length === 0 || loading}
              className="gap-2 flex-1"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Download Codes
            </Button>
            <Button
              onClick={handleRegenerateBackupCodes}
              disabled={regenerating || loading}
              className="gap-2 flex-1"
              variant="default"
            >
              <RotateCcw className="h-4 w-4" />
              {regenerating ? 'Regenerating...' : 'Regenerate Codes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-base text-blue-900 dark:text-blue-100">Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <div className="flex gap-2">
            <span className="font-semibold">•</span>
            <span>Store backup codes in a secure password manager like Bitwarden or 1Password</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">•</span>
            <span>Never share your backup codes with anyone</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">•</span>
            <span>Each code can only be used once for account recovery</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">•</span>
            <span>Keep codes in a separate location from your authenticator app</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">•</span>
            <span>Regenerate codes periodically or after using them</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
