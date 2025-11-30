import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, Smartphone, Key } from "lucide-react";

interface TwoFactorVerificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  onSuccess?: () => void;
}

export function TwoFactorVerification({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: TwoFactorVerificationProps) {
  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verifyTwoFactor = trpc.auth.verifyTwoFactor.useMutation();

  const handleVerifyTOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!totpCode.trim()) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    if (totpCode.length !== 6 || !/^\d+$/.test(totpCode)) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyTwoFactor.mutateAsync({
        userId,
        token: totpCode,
      });

      if (result.success) {
        toast.success("2FA verification successful!");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message || "Invalid code");
      }
    } catch (error: any) {
      console.error("2FA verification error:", error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyBackupCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!backupCode.trim()) {
      toast.error("Please enter a backup code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyTwoFactor.mutateAsync({
        userId,
        token: backupCode.replace(/\s/g, ""),
      });

      if (result.success) {
        toast.success("Backup code verified!");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message || "Invalid backup code");
      }
    } catch (error: any) {
      console.error("Backup code verification error:", error);
      toast.error(error.message || "Invalid backup code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter your verification code to complete login
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="totp" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="totp">Authenticator</TabsTrigger>
            <TabsTrigger value="backup">Backup Code</TabsTrigger>
          </TabsList>

          {/* TOTP Verification */}
          <TabsContent value="totp">
            <form onSubmit={handleVerifyTOTP} className="space-y-4">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 flex gap-3">
                <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totp-code">Verification Code</Label>
                <Input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/\D/g, ""))
                  }
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoComplete="one-time-code"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || totpCode.length !== 6}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Backup Code Verification */}
          <TabsContent value="backup">
            <form onSubmit={handleVerifyBackupCode} className="space-y-4">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 flex gap-3">
                <Key className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  Use one of your backup codes if you don't have access to your authenticator app.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-code">Backup Code</Label>
                <Input
                  id="backup-code"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  className="font-mono text-sm"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Each backup code can only be used once.
              </p>

              <Button
                type="submit"
                disabled={isLoading || !backupCode.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Backup Code"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
