import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle2, Fingerprint, Key, Lock, Search, Shield, ShieldAlert, Smartphone, UserPlus, Users as UsersIcon } from "lucide-react";

const users = [
  { id: 1, name: "Alex Admin", role: "Administrator", email: "alex@vendhub.com", status: "active", twoFactor: true, lastLogin: "Just now" },
  { id: 2, name: "Sarah Manager", role: "Manager", email: "sarah@vendhub.com", status: "active", twoFactor: true, lastLogin: "2 hours ago" },
  { id: 3, name: "Mike Operator", role: "Operator", email: "mike@vendhub.com", status: "active", twoFactor: false, lastLogin: "5 mins ago" },
  { id: 4, name: "John Tech", role: "Technician", email: "john@vendhub.com", status: "inactive", twoFactor: false, lastLogin: "2 days ago" },
  { id: 5, name: "Guest Observer", role: "Observer", email: "guest@vendhub.com", status: "active", twoFactor: false, lastLogin: "1 day ago" },
];

const auditLogs = [
  { id: 1, action: "LOGIN_SUCCESS", user: "Alex Admin", ip: "192.168.1.1", time: "10:15:23", status: "success" },
  { id: 2, action: "ROLE_UPDATE", user: "Sarah Manager", target: "John Tech", time: "09:45:12", status: "success" },
  { id: 3, action: "LOGIN_FAILED", user: "Unknown", ip: "45.22.11.90", time: "03:22:11", status: "warning" },
  { id: 4, action: "PASSWORD_RESET", user: "Mike Operator", ip: "10.0.0.5", time: "Yesterday", status: "success" },
];

export default function Users() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white tracking-tight">Users & Security</h1>
            <p className="text-muted-foreground mt-1">RBAC Management and Security Audit</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite User
          </button>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 w-full md:w-auto grid grid-cols-2 md:flex">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white px-6">
              <UsersIcon className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-white px-6">
              <Shield className="w-4 h-4 mr-2" />
              Security Center
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6 space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-white font-bold border border-white/10">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{user.name}</h3>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                      <p className="text-xs text-muted-foreground">Role</p>
                      <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                        {user.role}
                      </Badge>
                    </div>
                    
                    <div className="hidden md:block text-right">
                      <p className="text-xs text-muted-foreground">2FA</p>
                      {user.twoFactor ? (
                        <div className="flex items-center text-emerald-400 text-sm font-medium">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Enabled
                        </div>
                      ) : (
                        <div className="flex items-center text-muted-foreground text-sm">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Disabled
                        </div>
                      )}
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span className={`text-sm font-medium ${user.status === 'active' ? 'text-white' : 'text-muted-foreground'}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">JWT + Refresh</div>
                  <p className="text-xs text-muted-foreground mt-1">Secure session management active</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    2FA Enforcement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">Strict</div>
                  <p className="text-xs text-muted-foreground mt-1">Required for Admin & Manager roles</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Brute Force Protection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">Active</div>
                  <p className="text-xs text-muted-foreground mt-1">3 failed attempts = 15m lockout</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-primary" />
                  Security Audit Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <div>
                          <p className="text-sm font-bold text-white">{log.action}</p>
                          <p className="text-xs text-muted-foreground">User: {log.user} • IP: {log.ip}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white font-mono">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Password Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Minimum 12 characters
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Requires special characters
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 90-day rotation for Admins
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No reuse of last 5 passwords
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Telegram Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Securely link Telegram accounts for instant notifications and quick actions.
                  </p>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">VendHub Bot</p>
                      <p className="text-xs text-emerald-400">Connected • ID: 8839201</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
