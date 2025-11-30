'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, AlertTriangle, Activity, Zap, HardDrive, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface Metric {
	name: string;
	value: number;
	unit: string;
	status: 'ok' | 'warning' | 'critical';
	details: string;
}

interface SystemHealthData {
	timestamp: Date;
	metrics: Metric[];
	uptime: string;
	health: 'healthy' | 'warning' | 'critical';
	issues: string[];
}

export function SystemHealthWidget() {
	const [health, setHealth] = useState<SystemHealthData | null>(null);
	const [loading, setLoading] = useState(true);
	const [autoRefresh, setAutoRefresh] = useState(true);

	const { data: healthData } = trpc.systemHealth.getMetrics.useQuery(undefined, {
		enabled: true,
		refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
	});

	const killProcessMutation = trpc.systemHealth.killAllStaleProcesses.useMutation({
		onSuccess: (result) => {
			toast.success(`Killed ${result.killed} stale process(es)`);
			// Refetch health data
			setTimeout(() => {
				window.location.reload();
			}, 1000);
		},
		onError: (error) => {
			toast.error(`Failed to kill processes: ${error.message}`);
		},
	});

	useEffect(() => {
		if (healthData) {
			setHealth(healthData as SystemHealthData);
			setLoading(false);
		}
	}, [healthData]);

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'ok':
				return <CheckCircle2 className="h-4 w-4 text-green-500" />;
			case 'warning':
				return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
			case 'critical':
				return <AlertCircle className="h-4 w-4 text-red-500" />;
			default:
				return null;
		}
	};

	const getMetricIcon = (name: string) => {
		switch (name) {
			case 'Memory Usage':
				return <Activity className="h-5 w-5 text-blue-500" />;
			case 'CPU Usage':
				return <Zap className="h-5 w-5 text-orange-500" />;
			case 'Disk Usage':
				return <HardDrive className="h-5 w-5 text-purple-500" />;
			case 'Stale Processes':
				return <AlertCircle className="h-5 w-5 text-red-500" />;
			default:
				return null;
		}
	};

	const getHealthColor = (health: string) => {
		switch (health) {
			case 'healthy':
				return 'bg-green-50 border-green-200';
			case 'warning':
				return 'bg-yellow-50 border-yellow-200';
			case 'critical':
				return 'bg-red-50 border-red-200';
			default:
				return 'bg-gray-50 border-gray-200';
		}
	};

	const getHealthBadgeVariant = (health: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
		switch (health) {
			case 'healthy':
				return 'default';
			case 'warning':
				return 'secondary';
			case 'critical':
				return 'destructive';
			default:
				return 'outline';
		}
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>System Health</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">Loading system health...</div>
				</CardContent>
			</Card>
		);
	}

	if (!health) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>System Health</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-red-500">Failed to load system health data</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={`border-2 ${getHealthColor(health.health)}`}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<CardTitle>System Health</CardTitle>
						<Badge variant={getHealthBadgeVariant(health.health)} className="capitalize">
							{health.health}
						</Badge>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setAutoRefresh(!autoRefresh)}
							className={autoRefresh ? 'bg-blue-50' : ''}
						>
							{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
						</Button>
						{health.metrics.some((m) => m.status === 'warning' || m.status === 'critical') && (
							<Button
								variant="destructive"
								size="sm"
								onClick={() => killProcessMutation.mutate()}
								disabled={killProcessMutation.isPending}
								className="gap-2"
							>
								<Trash2 className="h-4 w-4" />
								{killProcessMutation.isPending ? 'Cleaning...' : 'Clean Processes'}
							</Button>
						)}
					</div>
				</div>
				<CardDescription>Uptime: {health.uptime}</CardDescription>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Metrics Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{health.metrics.map((metric) => (
						<div key={metric.name} className="space-y-2 p-3 rounded-lg bg-white border border-gray-200">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									{getMetricIcon(metric.name)}
									<span className="font-medium text-sm">{metric.name}</span>
								</div>
								{getStatusIcon(metric.status)}
							</div>

							<div className="flex items-center justify-between">
								<span className="text-2xl font-bold">{metric.value}</span>
								<span className="text-xs text-gray-500">{metric.unit}</span>
							</div>

							<Progress value={Math.min(metric.value, 100)} className="h-2" />

							<p className="text-xs text-gray-600">{metric.details}</p>
						</div>
					))}
				</div>

				{/* Issues Section */}
				{health.issues.length > 0 && (
					<div className="p-4 rounded-lg bg-red-50 border border-red-200">
						<h4 className="font-semibold text-sm text-red-900 mb-2 flex items-center gap-2">
							<AlertCircle className="h-4 w-4" />
							Issues Detected
						</h4>
						<ul className="space-y-1">
							{health.issues.map((issue, idx) => (
								<li key={idx} className="text-sm text-red-800 flex items-start gap-2">
									<span className="text-red-500 mt-0.5">•</span>
									<span>{issue}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Last Updated */}
				<div className="text-xs text-gray-500 text-right">
					Last updated: {new Date(health.timestamp).toLocaleTimeString()}
				</div>
			</CardContent>
		</Card>
	);
}
