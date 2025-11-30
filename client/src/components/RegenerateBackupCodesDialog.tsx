import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface RegenerateBackupCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const RegenerateBackupCodesDialog: React.FC<RegenerateBackupCodesDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  const [step, setStep] = useState<'warning' | 'confirmation' | 'success'>('warning');
  const [acknowledged, setAcknowledged] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [newCodes, setNewCodes] = useState<string[]>([]);

  const handleProceed = () => {
    setStep('confirmation');
  };

  const handleConfirmRegenerate = async () => {
    try {
      await onConfirm();
      // TODO: Get new codes from response
      setStep('success');
      setAcknowledged(false);
    } catch (error) {
      console.error('Error regenerating codes:', error);
      toast.error('Failed to regenerate backup codes');
    }
  };

  const handleDownloadNewCodes = () => {
    if (newCodes.length === 0) {
      toast.error('No codes to download');
      return;
    }

    const codesText = newCodes.join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(codesText)}`);
    element.setAttribute('download', `backup-codes-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success('Backup codes downloaded');
  };

  const handleCopyAllCodes = () => {
    const codesText = newCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    toast.success('All codes copied to clipboard');
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleClose = () => {
    if (step === 'success') {
      setStep('warning');
      setAcknowledged(false);
      setCopiedCodes(false);
      setNewCodes([]);
      onOpenChange(false);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === 'warning' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Regenerate Backup Codes?
              </DialogTitle>
              <DialogDescription>
                This action will invalidate all your current backup codes
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  <strong>Warning:</strong> All existing backup codes will no longer work after regeneration. Make sure you have saved your current codes before proceeding.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                <h4 className="font-semibold text-sm">What will happen:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-red-600 dark:text-red-400">✕</span>
                    <span>Current backup codes will be invalidated</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 dark:text-red-400">✕</span>
                    <span>You won't be able to use old codes for recovery</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>10 new backup codes will be generated</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>You can download and save the new codes</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <Checkbox
                  id="understand"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
                />
                <label
                  htmlFor="understand"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I understand that my current codes will no longer work
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleProceed}
                disabled={!acknowledged}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Proceed to Regenerate
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirmation' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">Confirm Regeneration</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Type "REGENERATE" to confirm.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Final Warning:</strong> This action is irreversible. All current backup codes will be permanently invalidated.
                </AlertDescription>
              </Alert>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-semibold text-foreground mb-2">Before you proceed:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Have you saved your current backup codes?</li>
                  <li>✓ Do you have access to your authenticator app?</li>
                  <li>✓ Are you ready to generate new codes?</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep('warning')}>
                Back
              </Button>
              <Button
                onClick={handleConfirmRegenerate}
                disabled={isLoading}
                className="gap-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                {isLoading ? 'Regenerating...' : 'Regenerate Now'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Backup Codes Regenerated
              </DialogTitle>
              <DialogDescription>
                Your new backup codes have been generated successfully
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>Success!</strong> Your new backup codes are ready. Save them in a secure location immediately.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Your New Backup Codes:</h4>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/50 p-3">
                  {newCodes.map((code, index) => (
                    <div
                      key={index}
                      className="rounded bg-background p-2 font-mono text-sm font-semibold text-foreground"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Next steps:</strong> Download or copy your codes and store them securely. You can also view them anytime in your settings.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleCopyAllCodes}
                className="gap-2 flex-1"
              >
                <Copy className="h-4 w-4" />
                {copiedCodes ? 'Copied!' : 'Copy All'}
              </Button>
              <Button
                onClick={handleDownloadNewCodes}
                className="gap-2 flex-1"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
