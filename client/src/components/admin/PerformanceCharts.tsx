'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricPoint {
	timestamp: string;
	memory: number;
	cpu: number;
	disk: number;
	health: string;
}

interface PerformanceChartsProps {
	data: MetricPoint[];
	title?: string;
	description?: string;
}

export function PerformanceLineChart({ data, title = 'Performance Metrics', description = 'Real-time system metrics' }: PerformanceChartsProps) {
	const chartData = useMemo(() => {
		return data.map((point) => ({
			time: new Date(point.timestamp).toLocaleTimeString(),
			timestamp: point.timestamp,
			memory: parseFloat(point.memory.toFixed(1)),
			cpu: parseFloat(point.cpu.toFixed(1)),
			disk: parseFloat(point.disk.toFixed(1)),
		}));
	}, [data]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="time" />
						<YAxis domain={[0, 100]} />
						<Tooltip
							formatter={(value) => `${value}%`}
							labelFormatter={(label) => `Time: ${label}`}
						/>
						<Legend />
						<Line
							type="monotone"
							dataKey="memory"
							stroke="#3b82f6"
							name="Memory"
							dot={false}
							strokeWidth={2}
						/>
						<Line
							type="monotone"
							dataKey="cpu"
							stroke="#f97316"
							name="CPU"
							dot={false}
							strokeWidth={2}
						/>
						<Line
							type="monotone"
							dataKey="disk"
							stroke="#a855f7"
							name="Disk"
							dot={false}
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

export function PerformanceAreaChart({ data, title = 'Performance Trends', description = 'Stacked area chart' }: PerformanceChartsProps) {
	const chartData = useMemo(() => {
		return data.map((point) => ({
			time: new Date(point.timestamp).toLocaleTimeString(),
			memory: parseFloat(point.memory.toFixed(1)),
			cpu: parseFloat(point.cpu.toFixed(1)),
			disk: parseFloat(point.disk.toFixed(1)),
		}));
	}, [data]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<AreaChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="time" />
						<YAxis domain={[0, 100]} />
						<Tooltip formatter={(value) => `${value}%`} />
						<Legend />
						<Area
							type="monotone"
							dataKey="memory"
							stackId="1"
							stroke="#3b82f6"
							fill="#3b82f6"
							name="Memory"
							fillOpacity={0.6}
						/>
						<Area
							type="monotone"
							dataKey="cpu"
							stackId="1"
							stroke="#f97316"
							fill="#f97316"
							name="CPU"
							fillOpacity={0.6}
						/>
						<Area
							type="monotone"
							dataKey="disk"
							stackId="1"
							stroke="#a855f7"
							fill="#a855f7"
							name="Disk"
							fillOpacity={0.6}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

interface HourlyMetric {
	hour: string;
	memory: { avg: number; max: number };
	cpu: { avg: number; max: number };
	disk: { avg: number; max: number };
}

interface HourlyChartsProps {
	data: HourlyMetric[];
	title?: string;
	description?: string;
}

export function HourlyPerformanceChart({ data, title = 'Hourly Performance', description = 'Average and peak metrics per hour' }: HourlyChartsProps) {
	const chartData = useMemo(() => {
		return data.map((point) => ({
			hour: new Date(point.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			memoryAvg: parseFloat(point.memory.avg.toFixed(1)),
			memoryMax: parseFloat(point.memory.max.toFixed(1)),
			cpuAvg: parseFloat(point.cpu.avg.toFixed(1)),
			cpuMax: parseFloat(point.cpu.max.toFixed(1)),
		}));
	}, [data]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="hour" />
						<YAxis domain={[0, 100]} />
						<Tooltip formatter={(value) => `${value}%`} />
						<Legend />
						<Bar dataKey="memoryAvg" fill="#3b82f6" name="Memory Avg" />
						<Bar dataKey="memoryMax" fill="#1e40af" name="Memory Max" />
						<Bar dataKey="cpuAvg" fill="#f97316" name="CPU Avg" />
						<Bar dataKey="cpuMax" fill="#c2410c" name="CPU Max" />
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

interface StatisticsData {
	memory: { avg: number; max: number; min: number };
	cpu: { avg: number; max: number; min: number };
	disk: { avg: number; max: number; min: number };
}

interface StatisticsProps {
	data: StatisticsData;
	period: string;
}

export function PerformanceStatistics({ data, period }: StatisticsProps) {
	const metrics = [
		{
			name: 'Memory',
			color: 'bg-blue-50 border-blue-200',
			icon: '💾',
			avg: data.memory.avg,
			max: data.memory.max,
			min: data.memory.min,
		},
		{
			name: 'CPU',
			color: 'bg-orange-50 border-orange-200',
			icon: '⚡',
			avg: data.cpu.avg,
			max: data.cpu.max,
			min: data.cpu.min,
		},
		{
			name: 'Disk',
			color: 'bg-purple-50 border-purple-200',
			icon: '💿',
			avg: data.disk.avg,
			max: data.disk.max,
			min: data.disk.min,
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Performance Statistics</CardTitle>
				<CardDescription>Summary for {period}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{metrics.map((metric) => (
						<div key={metric.name} className={`p-4 rounded-lg border-2 ${metric.color}`}>
							<div className="flex items-center gap-2 mb-3">
								<span className="text-2xl">{metric.icon}</span>
								<h3 className="font-semibold">{metric.name}</h3>
							</div>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Average:</span>
									<span className="font-medium">{metric.avg.toFixed(1)}%</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Maximum:</span>
									<span className="font-medium text-red-600">{metric.max.toFixed(1)}%</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Minimum:</span>
									<span className="font-medium text-green-600">{metric.min.toFixed(1)}%</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

interface ComparisonData {
	memory: { avgChange: { value: number; percent: number; trend: string }; maxChange: { value: number; percent: number; trend: string } };
	cpu: { avgChange: { value: number; percent: number; trend: string }; maxChange: { value: number; percent: number; trend: string } };
	disk: { avgChange: { value: number; percent: number; trend: string }; maxChange: { value: number; percent: number; trend: string } };
}

interface ComparisonProps {
	data: ComparisonData;
	period1: string;
	period2: string;
}

export function PerformanceComparison({ data, period1, period2 }: ComparisonProps) {
	const getTrendIcon = (trend: string) => {
		if (trend === 'up') return <TrendingUp className="h-4 w-4 text-red-500" />;
		if (trend === 'down') return <TrendingDown className="h-4 w-4 text-green-500" />;
		return <AlertCircle className="h-4 w-4 text-gray-500" />;
	};

	const getChangeColor = (trend: string) => {
		if (trend === 'up') return 'text-red-600';
		if (trend === 'down') return 'text-green-600';
		return 'text-gray-600';
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Period Comparison</CardTitle>
				<CardDescription>
					{period1} vs {period2}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{[
						{ name: 'Memory', data: data.memory },
						{ name: 'CPU', data: data.cpu },
						{ name: 'Disk', data: data.disk },
					].map((metric) => (
						<div key={metric.name} className="border-b pb-4 last:border-b-0">
							<h4 className="font-semibold mb-3">{metric.name}</h4>
							<div className="grid grid-cols-2 gap-4">
								<div className="p-3 bg-gray-50 rounded-lg">
									<p className="text-xs text-gray-600 mb-1">Average Change</p>
									<div className="flex items-center gap-2">
										{getTrendIcon(metric.data.avgChange.trend)}
										<span className={`font-medium ${getChangeColor(metric.data.avgChange.trend)}`}>
											{metric.data.avgChange.value > 0 ? '+' : ''}
											{metric.data.avgChange.value.toFixed(2)}% ({metric.data.avgChange.percent.toFixed(1)}%)
										</span>
									</div>
								</div>
								<div className="p-3 bg-gray-50 rounded-lg">
									<p className="text-xs text-gray-600 mb-1">Maximum Change</p>
									<div className="flex items-center gap-2">
										{getTrendIcon(metric.data.maxChange.trend)}
										<span className={`font-medium ${getChangeColor(metric.data.maxChange.trend)}`}>
											{metric.data.maxChange.value > 0 ? '+' : ''}
											{metric.data.maxChange.value.toFixed(2)}% ({metric.data.maxChange.percent.toFixed(1)}%)
										</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
