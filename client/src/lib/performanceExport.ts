/**
 * Performance metrics export utilities
 * Supports CSV, JSON, and PDF export formats
 */

export interface MetricPoint {
	timestamp: string;
	memory: number;
	cpu: number;
	disk: number;
	health: string;
}

export interface HourlyMetric {
	hour: string;
	memory: { avg: number; max: number };
	cpu: { avg: number; max: number };
	disk: { avg: number; max: number };
	events: { critical: number; warning: number };
}

/**
 * Export metrics to CSV format
 */
export function exportToCSV(data: MetricPoint[], filename: string = 'performance-metrics.csv') {
	const headers = ['Timestamp', 'Memory (%)', 'CPU (%)', 'Disk (%)', 'Health Status'];
	const rows = data.map((point) => [
		new Date(point.timestamp).toLocaleString(),
		point.memory.toFixed(2),
		point.cpu.toFixed(2),
		point.disk.toFixed(2),
		point.health,
	]);

	const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

	downloadFile(csv, filename, 'text/csv');
}

/**
 * Export hourly metrics to CSV format
 */
export function exportHourlyToCSV(data: HourlyMetric[], filename: string = 'performance-hourly.csv') {
	const headers = [
		'Hour',
		'Memory Avg (%)',
		'Memory Max (%)',
		'CPU Avg (%)',
		'CPU Max (%)',
		'Disk Avg (%)',
		'Disk Max (%)',
		'Critical Events',
		'Warning Events',
	];

	const rows = data.map((point) => [
		new Date(point.hour).toLocaleString(),
		point.memory.avg.toFixed(2),
		point.memory.max.toFixed(2),
		point.cpu.avg.toFixed(2),
		point.cpu.max.toFixed(2),
		point.disk.avg.toFixed(2),
		point.disk.max.toFixed(2),
		point.events.critical,
		point.events.warning,
	]);

	const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

	downloadFile(csv, filename, 'text/csv');
}

/**
 * Export metrics to JSON format
 */
export function exportToJSON(data: MetricPoint[], filename: string = 'performance-metrics.json') {
	const json = JSON.stringify(
		{
			exportDate: new Date().toISOString(),
			dataPoints: data.length,
			metrics: data,
		},
		null,
		2
	);

	downloadFile(json, filename, 'application/json');
}

/**
 * Export hourly metrics to JSON format
 */
export function exportHourlyToJSON(data: HourlyMetric[], filename: string = 'performance-hourly.json') {
	const json = JSON.stringify(
		{
			exportDate: new Date().toISOString(),
			dataPoints: data.length,
			metrics: data,
		},
		null,
		2
	);

	downloadFile(json, filename, 'application/json');
}

/**
 * Generate performance report as text
 */
export function generatePerformanceReport(
	data: MetricPoint[],
	statistics: {
		memory: { avg: number; max: number; min: number };
		cpu: { avg: number; max: number; min: number };
		disk: { avg: number; max: number; min: number };
	},
	period: string
): string {
	const report = `
PERFORMANCE METRICS REPORT
==========================

Generated: ${new Date().toLocaleString()}
Period: ${period}
Data Points: ${data.length}

MEMORY USAGE
-----------
Average: ${statistics.memory.avg.toFixed(2)}%
Maximum: ${statistics.memory.max.toFixed(2)}%
Minimum: ${statistics.memory.min.toFixed(2)}%

CPU USAGE
---------
Average: ${statistics.cpu.avg.toFixed(2)}%
Maximum: ${statistics.cpu.max.toFixed(2)}%
Minimum: ${statistics.cpu.min.toFixed(2)}%

DISK USAGE
----------
Average: ${statistics.disk.avg.toFixed(2)}%
Maximum: ${statistics.disk.max.toFixed(2)}%
Minimum: ${statistics.disk.min.toFixed(2)}%

HEALTH SUMMARY
--------------
Healthy: ${data.filter((d) => d.health === 'healthy').length}
Warning: ${data.filter((d) => d.health === 'warning').length}
Critical: ${data.filter((d) => d.health === 'critical').length}

PEAK USAGE TIMES
----------------
Memory Peak: ${data.reduce((max, d) => (d.memory > max.memory ? d : max)).timestamp}
CPU Peak: ${data.reduce((max, d) => (d.cpu > max.cpu ? d : max)).timestamp}
Disk Peak: ${data.reduce((max, d) => (d.disk > max.disk ? d : max)).timestamp}
`;

	return report.trim();
}

/**
 * Export report as text file
 */
export function exportReportAsText(
	report: string,
	filename: string = 'performance-report.txt'
) {
	downloadFile(report, filename, 'text/plain');
}

/**
 * Helper function to download file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
	const blob = new Blob([content], { type: mimeType });
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
}

/**
 * Copy metrics to clipboard as formatted text
 */
export function copyToClipboard(data: MetricPoint[]): boolean {
	try {
		const text = data
			.map((d) => `${new Date(d.timestamp).toLocaleString()} - Memory: ${d.memory.toFixed(2)}%, CPU: ${d.cpu.toFixed(2)}%, Disk: ${d.disk.toFixed(2)}%`)
			.join('\n');

		navigator.clipboard.writeText(text);
		return true;
	} catch (error) {
		console.error('Failed to copy to clipboard:', error);
		return false;
	}
}

/**
 * Generate performance summary for sharing
 */
export function generateSummary(
	statistics: {
		memory: { avg: number; max: number; min: number };
		cpu: { avg: number; max: number; min: number };
		disk: { avg: number; max: number; min: number };
	},
	period: string
): string {
	return `Performance Summary (${period}):
Memory: ${statistics.memory.avg.toFixed(1)}% avg, ${statistics.memory.max.toFixed(1)}% peak
CPU: ${statistics.cpu.avg.toFixed(1)}% avg, ${statistics.cpu.max.toFixed(1)}% peak
Disk: ${statistics.disk.avg.toFixed(1)}% avg, ${statistics.disk.max.toFixed(1)}% peak`;
}
