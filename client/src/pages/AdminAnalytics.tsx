'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
	PerformanceLineChart,
	PerformanceAreaChart,
	HourlyPerformanceChart,
	PerformanceStatistics,
	PerformanceComparison,
} from '@/components/admin/PerformanceCharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { BarChart3, Calendar, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAnalytics() {
	const [selectedTab, setSelectedTab] = useState('overview');
	const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d'>('24h');
	const [refreshing, setRefreshing] = useState(false);

	// Get last 24 hours metrics
	const { data: last24h, refetch: refetch24h } = trpc.performanceAnalytics.getLast24Hours.useQuery();

	// Get trends (last 7 days hourly)
	const { data: trends, refetch: refetchTrends } = trpc.performanceAnalytics.getTrends.useQuery();

	// Get daily metrics
	const { data: dailyMetrics, refetch: refetchDaily } = trpc.performanceAnalytics.getDailyMetrics.useQuery({ days: 30 });

	// Get statistics for different periods
	const getStatisticsQuery = (days: number) => {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);
		return { startDate, endDate };
	};

	const { data: stats24h } = trpc.performanceAnalytics.getStatistics.useQuery(getStatisticsQuery(1));
	const { data: stats7d } = trpc.performanceAnalytics.getStatistics.useQuery(getStatisticsQuery(7));
	const { data: stats30d } = trpc.performanceAnalytics.getStatistics.useQuery(getStatisticsQuery(30));

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			await Promise.all([refetch24h(), refetchTrends(), refetchDaily()]);
			toast.success('Analytics refreshed');
		} catch (error) {
			toast.error('Failed to refresh analytics');
		} finally {
			setRefreshing(false);
		}
	};

	const handleExport = () => {
		// TODO: Implement CSV export
		toast.info('Export feature coming soon');
	};

	return (
		<ProtectedRoute requiredRole="admin">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
							<BarChart3 className="h-8 w-8" />
							Performance Analytics
						</h1>
						<p className="text-gray-600 mt-1">Historical CPU, memory, and disk usage data</p>
					</div>
					<div className="flex gap-2">
						<Button
							onClick={handleRefresh}
							disabled={refreshing}
							variant="outline"
							className="gap-2"
						>
							<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
							{refreshing ? 'Refreshing...' : 'Refresh'}
						</Button>
						<Button onClick={handleExport} variant="outline" className="gap-2">
							<Download className="h-4 w-4" />
							Export
						</Button>
					</div>
				</div>

				{/* Tabs */}
				<Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="trends">Trends</TabsTrigger>
						<TabsTrigger value="statistics">Statistics</TabsTrigger>
						<TabsTrigger value="comparison">Comparison</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm">Time Range</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex gap-2">
										{(['24h', '7d', '30d'] as const).map((range) => (
											<Button
												key={range}
												variant={dateRange === range ? 'default' : 'outline'}
												size="sm"
												onClick={() => setDateRange(range)}
											>
												{range === '24h' ? 'Last 24h' : range === '7d' ? 'Last 7d' : 'Last 30d'}
											</Button>
										))}
									</div>
								</CardContent>
							</Card>
						</div>

						{last24h && (
							<>
								<PerformanceLineChart
									data={last24h.metrics}
									title="Last 24 Hours"
									description="Real-time performance metrics"
								/>
								<PerformanceAreaChart
									data={last24h.metrics}
									title="Performance Distribution"
									description="Stacked area view of resource usage"
								/>
							</>
						)}
					</TabsContent>

					{/* Trends Tab */}
					<TabsContent value="trends" className="space-y-4">
						{trends && (
							<>
								<HourlyPerformanceChart
									data={trends.trends}
									title="7-Day Hourly Trends"
									description="Average and peak metrics per hour"
								/>
								<Card>
									<CardHeader>
										<CardTitle>Trend Analysis</CardTitle>
										<CardDescription>Key insights from the data</CardDescription>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
												<p className="text-sm text-gray-600">Memory Trend</p>
												<p className="text-lg font-semibold text-blue-600">
													{trends.trends.length > 0
														? (
																trends.trends[trends.trends.length - 1].memory.avg -
																trends.trends[0].memory.avg
															).toFixed(1)
														: '0'}
													%
												</p>
											</div>
											<div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
												<p className="text-sm text-gray-600">CPU Trend</p>
												<p className="text-lg font-semibold text-orange-600">
													{trends.trends.length > 0
														? (
																trends.trends[trends.trends.length - 1].cpu.avg -
																trends.trends[0].cpu.avg
															).toFixed(1)
														: '0'}
													%
												</p>
											</div>
											<div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
												<p className="text-sm text-gray-600">Disk Trend</p>
												<p className="text-lg font-semibold text-purple-600">
													{trends.trends.length > 0
														? (
																trends.trends[trends.trends.length - 1].disk.avg -
																trends.trends[0].disk.avg
															).toFixed(1)
														: '0'}
													%
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</>
						)}
					</TabsContent>

					{/* Statistics Tab */}
					<TabsContent value="statistics" className="space-y-4">
						<div className="grid grid-cols-1 gap-4">
							{stats24h && (
								<PerformanceStatistics
									data={stats24h}
									period="Last 24 Hours"
								/>
							)}
							{stats7d && (
								<PerformanceStatistics
									data={stats7d}
									period="Last 7 Days"
								/>
							)}
							{stats30d && (
								<PerformanceStatistics
									data={stats30d}
									period="Last 30 Days"
								/>
							)}
						</div>
					</TabsContent>

					{/* Comparison Tab */}
					<TabsContent value="comparison" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Period Comparison</CardTitle>
								<CardDescription>Compare performance between two time periods</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-gray-600">
									Select two periods to compare their performance metrics. This feature will show you trends and changes
									between the periods.
								</p>
							</CardContent>
						</Card>

						{stats7d && stats30d && (
							<PerformanceComparison
								data={{
									memory: {
										avgChange: {
											value: stats30d.memory.avg - stats7d.memory.avg,
											percent: ((stats30d.memory.avg - stats7d.memory.avg) / stats7d.memory.avg) * 100,
											trend: stats30d.memory.avg > stats7d.memory.avg ? 'up' : 'down',
										},
										maxChange: {
											value: stats30d.memory.max - stats7d.memory.max,
											percent: ((stats30d.memory.max - stats7d.memory.max) / stats7d.memory.max) * 100,
											trend: stats30d.memory.max > stats7d.memory.max ? 'up' : 'down',
										},
									},
									cpu: {
										avgChange: {
											value: stats30d.cpu.avg - stats7d.cpu.avg,
											percent: ((stats30d.cpu.avg - stats7d.cpu.avg) / stats7d.cpu.avg) * 100,
											trend: stats30d.cpu.avg > stats7d.cpu.avg ? 'up' : 'down',
										},
										maxChange: {
											value: stats30d.cpu.max - stats7d.cpu.max,
											percent: ((stats30d.cpu.max - stats7d.cpu.max) / stats7d.cpu.max) * 100,
											trend: stats30d.cpu.max > stats7d.cpu.max ? 'up' : 'down',
										},
									},
									disk: {
										avgChange: {
											value: stats30d.disk.avg - stats7d.disk.avg,
											percent: ((stats30d.disk.avg - stats7d.disk.avg) / stats7d.disk.avg) * 100,
											trend: stats30d.disk.avg > stats7d.disk.avg ? 'up' : 'down',
										},
										maxChange: {
											value: stats30d.disk.max - stats7d.disk.max,
											percent: ((stats30d.disk.max - stats7d.disk.max) / stats7d.disk.max) * 100,
											trend: stats30d.disk.max > stats7d.disk.max ? 'up' : 'down',
										},
									},
								}}
								period1="Last 7 Days"
								period2="Last 30 Days"
							/>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</ProtectedRoute>
	);
}
