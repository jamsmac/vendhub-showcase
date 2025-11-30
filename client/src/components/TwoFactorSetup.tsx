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
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Smartphone,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-react";

interface TwoFactorSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type SetupStep = "generate" | "scan" | "verify" | "backup" | "success";

export function TwoFactorSetup({
  open,
  onOpenChange,
  onSuccess,
}: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>("generate");
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationToken, setVerificationToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const generateSecret = trpc.auth.generateTwoFactorSecret.useMutation();
  const enableTwoFactor = trpc.auth.enableTwoFactor.useMutation();

  const handleGenerateSecret = async () => {
    setIsLoading(true);
    try {
      const result = await generateSecret.mutateAsync();
      setSecret(result.secret);
      setQrCode(result.qrCode);
      setBackupCodes(result.backupCodes);
      setStep("scan");
    } catch (error) {
      console.error("Error generating secret:", error);
      toast.error("Failed to generate 2FA secret");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationToken.trim()) {
      toast.error("Please enter the 6-digit code from your authenticator");
      return;
    }

    if (verificationToken.length !== 6 || !/^\d+$/.test(verificationToken)) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await enableTwoFactor.mutateAsync({
        secret,
        token: verificationToken,
        backupCodes,
      });

      if (result.success) {
        toast.success("2FA enabled successfully!");
        setStep("backup");
      } else {
        toast.error(result.message || "Failed to enable 2FA");
      }
    } catch (error: any) {
      console.error("Error enabling 2FA:", error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const text = backupCodes.join("\n");
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", "vendhub-backup-codes.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Backup codes downloaded");
  };

  const handleClose = () => {
    if (step === "success") {
      onOpenChange(false);
      onSuccess?.();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Secure your account with 2FA using an authenticator app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Generate */}
          {step === "generate" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  What is 2FA?
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Two-factor authentication adds an extra layer of security to your account.
                  You'll need both your password and a code from an authenticator app to log in.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Supported Authenticator Apps:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Google Authenticator</li>
                  <li>Microsoft Authenticator</li>
                  <li>Authy</li>
                  <li>1Password</li>
                  <li>Any TOTP-compatible app</li>
                </ul>
              </div>

              <Button
                onClick={handleGenerateSecret}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Get Started
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Scan QR Code */}
          {step === "scan" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  1. Scan this QR code with your authenticator app
                </p>
                {qrCode && (
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img
                      src={qrCode}
                      alt="QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  2. Or enter this key manually:
                </p>
                <div className="flex gap-2">
                  <Input
                    value={secret}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyCode(secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => setStep("verify")}
                className="w-full"
              >
                I've Scanned the Code
              </Button>
            </div>
          )}

          {/* Step 3: Verify */}
          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  Enter the 6-digit code from your authenticator app to verify the setup.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">Verification Code</Label>
                <Input
                  id="token"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationToken}
                  onChange={(e) =>
                    setVerificationToken(e.target.value.replace(/\D/g, ""))
                  }
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("scan")}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || verificationToken.length !== 6}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Enable"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 4: Backup Codes */}
          {step === "backup" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-900 dark:text-green-200">
                  2FA enabled successfully! Save your backup codes in a safe place.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Backup Codes</p>
                <p className="text-sm text-muted-foreground">
                  If you lose access to your authenticator app, use these codes to regain access to your account.
                </p>
              </div>

              <Card className="p-4 bg-muted">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-background rounded border"
                    >
                      <code className="font-mono text-sm">{code}</code>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(code)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copiedCode === code ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadBackupCodes}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button onClick={() => setStep("success")} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === "success" && (
            <div className="text-center space-y-4 py-4">
              <div className="rounded-full bg-green-100 dark:bg-green-950 p-3 w-fit mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  2FA Setup Complete!
                </p>
                <p className="text-sm text-muted-foreground">
                  Your account is now protected with two-factor authentication.
                </p>
              </div>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
