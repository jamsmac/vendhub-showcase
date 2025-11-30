'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SystemHealthWidget } from '@/components/admin/SystemHealthWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import {
	Activity,
	Users,
	Shield,
	AlertCircle,
	RefreshCw,
	Download,
	Settings,
	BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
	const [refreshing, setRefreshing] = useState(false);

	const { data: stats, refetch: refetchStats } = trpc.userManagement.getStatistics.useQuery();

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			await refetchStats();
			toast.success('Dashboard refreshed');
		} catch (error) {
			toast.error('Failed to refresh dashboard');
		} finally {
			setRefreshing(false);
		}
	};

	return (
		<ProtectedRoute requiredRole="admin">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
						<p className="text-gray-600 mt-1">Monitor system health and manage users</p>
					</div>
					<Button
						onClick={handleRefresh}
						disabled={refreshing}
						variant="outline"
						className="gap-2"
					>
						<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
						{refreshing ? 'Refreshing...' : 'Refresh'}
					</Button>
				</div>

				{/* System Health Widget */}
				<SystemHealthWidget />

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
								<Users className="h-4 w-4" />
								Total Users
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
							<p className="text-xs text-gray-500 mt-1">All registered users</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
								<Activity className="h-4 w-4" />
								Active Users
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">{stats?.activeUsers || 0}</div>
							<p className="text-xs text-gray-500 mt-1">Currently active</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
								<Shield className="h-4 w-4" />
								Admins
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-blue-600">{stats?.adminCount || 0}</div>
							<p className="text-xs text-gray-500 mt-1">Admin users</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
								<AlertCircle className="h-4 w-4" />
								Suspended
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-600">{stats?.suspendedCount || 0}</div>
							<p className="text-xs text-gray-500 mt-1">Inactive accounts</p>
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5" />
							Quick Actions
						</CardTitle>
						<CardDescription>Common admin tasks</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Button
								variant="outline"
								className="justify-start h-auto py-3"
								onClick={() => window.location.href = '/admin/users'}
							>
								<Users className="h-4 w-4 mr-2" />
								<div className="text-left">
									<div className="font-medium">Manage Users</div>
									<div className="text-xs text-gray-500">View and manage user accounts</div>
								</div>
							</Button>

							<Button
								variant="outline"
								className="justify-start h-auto py-3"
								onClick={() => window.location.href = '/admin/permissions'}
							>
								<Shield className="h-4 w-4 mr-2" />
								<div className="text-left">
									<div className="font-medium">Permissions</div>
									<div className="text-xs text-gray-500">Configure role permissions</div>
								</div>
							</Button>

							<Button
								variant="outline"
								className="justify-start h-auto py-3"
								onClick={() => window.location.href = '/admin/security'}
							>
								<AlertCircle className="h-4 w-4 mr-2" />
								<div className="text-left">
									<div className="font-medium">Security</div>
									<div className="text-xs text-gray-500">View activity logs and alerts</div>
								</div>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Information Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<BarChart3 className="h-5 w-5" />
								System Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between items-center text-sm">
								<span className="text-gray-600">Node Version</span>
								<Badge variant="outline">v{process.version?.replace('v', '')}</Badge>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span className="text-gray-600">Environment</span>
								<Badge variant="outline">{process.env.NODE_ENV || 'development'}</Badge>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span className="text-gray-600">Platform</span>
								<Badge variant="outline">{process.platform}</Badge>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Help & Documentation</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<p className="text-sm text-gray-600">
								Need help? Check out the following resources:
							</p>
							<ul className="space-y-2">
								<li>
									<a href="#" className="text-blue-600 hover:underline text-sm">
										→ Admin User Guide
									</a>
								</li>
								<li>
									<a href="#" className="text-blue-600 hover:underline text-sm">
										→ Security Best Practices
									</a>
								</li>
								<li>
									<a href="#" className="text-blue-600 hover:underline text-sm">
										→ Troubleshooting Guide
									</a>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</ProtectedRoute>
	);
}
