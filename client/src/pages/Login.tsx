import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Mail, ShieldCheck, Smartphone, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PasswordRecovery from "@/components/PasswordRecovery";
import { TwoFactorVerification } from "@/components/TwoFactorVerification";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<string | null>(null);

  const loginMutation = trpc.auth.login.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginMutation.mutateAsync({
        username,
        password,
      });

      if (result.success) {
        // Check if user needs to change password
        if (result.user?.needsPasswordChange) {
          // Store user data and redirect to password change
          sessionStorage.setItem("pendingPasswordChange", JSON.stringify(result.user));
          setLocation("/change-password");
          return;
        }

        // Check if user has 2FA enabled
        if (result.user?.twoFactorEnabled) {
          setCurrentUserId(result.user.id);
          setShowTwoFactor(true);
          toast.success("Password verified. Please enter your 2FA code.");
        } else {
          // Direct login success
          toast.success("Login successful!");
          setLocation("/");
        }
      } else {
        toast.error("Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Check if account is locked
      if (error.message?.includes("locked")) {
        setAccountLocked(true);
        const match = error.message.match(/after (\d+ minutes|\d+:\d+)/);
        if (match) {
          setLockoutTime(match[1]);
        }
        toast.error(error.message || "Account locked due to too many failed attempts");
      } else {
        toast.error(error.message || "Invalid username or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSuccess = () => {
    toast.success("2FA verification successful!");
    setShowTwoFactor(false);
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg shadow-blue-500/25">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">VendHub Manager</h1>
          <p className="text-slate-400 mt-2">Secure Enterprise Access</p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Welcome back</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accountLocked && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-200">
                  <p className="font-medium">Account Locked</p>
                  <p>Too many failed login attempts. Please try again {lockoutTime || "later"}.</p>
                </div>
              </div>
            )}

            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 mb-6">
                <TabsTrigger value="password" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Password
                </TabsTrigger>
                <TabsTrigger value="help" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Help
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-300">
                      Username
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="username"
                        placeholder="your_username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20"
                        disabled={isLoading || accountLocked}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-300">
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowPasswordRecovery(true)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20"
                        disabled={isLoading || accountLocked}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                    disabled={isLoading || accountLocked}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="help">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-200 mb-4">
                      Need help accessing your account?
                    </p>
                    <Button
                      onClick={() => setShowPasswordRecovery(true)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      Reset Password
                    </Button>
                  </div>

                  <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <p className="text-sm text-slate-300">
                      <strong>Lost access to your authenticator app?</strong>
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Use one of your backup codes during login, or contact your administrator for account recovery.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <p className="text-sm text-slate-300">
                      <strong>Account locked?</strong>
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Accounts lock for 15 minutes after 5 failed login attempts. Please try again later.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/5 pt-6">
            <p className="text-xs text-slate-500">
              Protected by Enterprise Grade Security
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Password Recovery Dialog */}
      <PasswordRecovery
        open={showPasswordRecovery}
        onOpenChange={setShowPasswordRecovery}
      />

      {/* 2FA Verification Dialog */}
      {currentUserId && (
        <TwoFactorVerification
          open={showTwoFactor}
          onOpenChange={setShowTwoFactor}
          userId={currentUserId}
          onSuccess={handleTwoFactorSuccess}
        />
      )}
    </div>
  );
}
