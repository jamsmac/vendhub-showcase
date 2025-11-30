import { db } from '../db';
import { performanceMetricsDaily, performanceMetricsHourly } from '../../drizzle/schema-performance';
import { gte, lte, and } from 'drizzle-orm';

/**
 * Performance Recommendations Service
 * Analyzes historical data and generates actionable recommendations
 */

interface Recommendation {
  id: string;
  type: 'peak_usage' | 'trend' | 'cost_optimization' | 'capacity_planning' | 'performance_improvement';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  metric: string;
  estimatedImpact: string;
  suggestedAction: string;
  generatedAt: Date;
}

interface MetricAnalysis {
  metric: string;
  average: number;
  max: number;
  min: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  peakHour?: number;
  peakValue?: number;
}

/**
 * Analyze metrics for the last N days
 */
export async function analyzeMetrics(days: number = 7): Promise<MetricAnalysis[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const dailyMetrics = await db.query.performanceMetricsDaily.findMany({
    where: and(
      gte(performanceMetricsDaily.date, startDate.toISOString().split('T')[0]),
      lte(performanceMetricsDaily.date, new Date().toISOString().split('T')[0])
    ),
    orderBy: (metrics) => metrics.date,
  });

  const metrics = ['memory', 'cpu', 'disk'];
  const analyses: MetricAnalysis[] = [];

  for (const metric of metrics) {
    const values = dailyMetrics
      .map((m) => {
        const field = metric as keyof typeof m;
        return Number(m[`${metric}Avg` as keyof typeof m] || 0);
      })
      .filter((v) => v > 0);

    if (values.length === 0) continue;

    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const trendPercentage = ((secondAvg - firstAvg) / firstAvg) * 100;
    const trend: 'increasing' | 'decreasing' | 'stable' =
      trendPercentage > 5 ? 'increasing' : trendPercentage < -5 ? 'decreasing' : 'stable';

    // Find peak hour (from hourly data)
    const peakHour = await findPeakHour(metric, startDate);

    analyses.push({
      metric,
      average,
      max,
      min,
      trend,
      trendPercentage,
      peakHour: peakHour?.hour,
      peakValue: peakHour?.value,
    });
  }

  return analyses;
}

/**
 * Find peak usage hour for a metric
 */
export async function findPeakHour(
  metric: string,
  startDate: Date
): Promise<{ hour: number; value: number } | null> {
  const hourlyMetrics = await db.query.performanceMetricsHourly.findMany({
    where: gte(performanceMetricsHourly.hour, startDate),
    orderBy: (metrics) => metrics.hour,
  });

  const hourlyData: { [key: number]: number[] } = {};

  for (const metric_data of hourlyMetrics) {
    const hour = new Date(metric_data.hour).getHours();
    const field = `${metric}Max` as keyof typeof metric_data;
    const value = Number(metric_data[field] || 0);

    if (!hourlyData[hour]) hourlyData[hour] = [];
    hourlyData[hour].push(value);
  }

  let peakHour = 0;
  let peakValue = 0;

  for (const [hour, values] of Object.entries(hourlyData)) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg > peakValue) {
      peakValue = avg;
      peakHour = Number(hour);
    }
  }

  return peakValue > 0 ? { hour: peakHour, value: peakValue } : null;
}

/**
 * Generate recommendations based on analysis
 */
export async function generateRecommendations(days: number = 7): Promise<Recommendation[]> {
  const analyses = await analyzeMetrics(days);
  const recommendations: Recommendation[] = [];

  for (const analysis of analyses) {
    // Peak usage detection
    if (analysis.peakHour !== undefined && analysis.peakValue !== undefined && analysis.peakValue > 75) {
      recommendations.push({
        id: `peak_${analysis.metric}`,
        type: 'peak_usage',
        severity: analysis.peakValue > 85 ? 'critical' : 'warning',
        title: `Peak ${analysis.metric.toUpperCase()} Usage Detected`,
        description: `Peak ${analysis.metric} usage occurs at ${analysis.peakHour}:00 with average ${analysis.peakValue.toFixed(1)}%. This is the busiest hour for your system.`,
        metric: analysis.metric,
        estimatedImpact: `${analysis.peakValue.toFixed(1)}% ${analysis.metric} usage`,
        suggestedAction: `Consider scaling up resources or scheduling maintenance during off-peak hours (${(analysis.peakHour + 1) % 24}:00 - ${(analysis.peakHour + 4) % 24}:00)`,
        generatedAt: new Date(),
      });
    }

    // Trend analysis
    if (analysis.trend === 'increasing' && analysis.trendPercentage > 2) {
      const daysToFull = calculateDaysToThreshold(analysis.average, analysis.trendPercentage, 90);
      recommendations.push({
        id: `trend_${analysis.metric}`,
        type: 'trend',
        severity: daysToFull < 7 ? 'critical' : daysToFull < 14 ? 'warning' : 'info',
        title: `${analysis.metric.toUpperCase()} Usage Increasing`,
        description: `${analysis.metric} usage is increasing by ${analysis.trendPercentage.toFixed(1)}% per day. At current growth rate, it will reach critical levels in ${daysToFull} days.`,
        metric: analysis.metric,
        estimatedImpact: `${analysis.trendPercentage.toFixed(1)}% daily increase`,
        suggestedAction: `Plan capacity expansion or optimize ${analysis.metric} usage to prevent performance degradation.`,
        generatedAt: new Date(),
      });
    }

    // Cost optimization
    if (analysis.average < 40 && analysis.max < 60) {
      recommendations.push({
        id: `cost_${analysis.metric}`,
        type: 'cost_optimization',
        severity: 'info',
        title: `${analysis.metric.toUpperCase()} Underutilized`,
        description: `Average ${analysis.metric} usage is only ${analysis.average.toFixed(1)}% with peak at ${analysis.max.toFixed(1)}%. Your system is overprovisioned.`,
        metric: analysis.metric,
        estimatedImpact: `Potential 20-30% cost reduction`,
        suggestedAction: `Consider downsizing your infrastructure to reduce costs while maintaining performance.`,
        generatedAt: new Date(),
      });
    }

    // Capacity planning
    if (analysis.average > 70) {
      recommendations.push({
        id: `capacity_${analysis.metric}`,
        type: 'capacity_planning',
        severity: analysis.average > 85 ? 'critical' : 'warning',
        title: `${analysis.metric.toUpperCase()} Capacity Planning Needed`,
        description: `Average ${analysis.metric} usage is ${analysis.average.toFixed(1)}%, which is approaching capacity limits. Peak usage reaches ${analysis.max.toFixed(1)}%.`,
        metric: analysis.metric,
        estimatedImpact: `Risk of performance degradation`,
        suggestedAction: `Plan infrastructure upgrade to handle future growth and maintain service quality.`,
        generatedAt: new Date(),
      });
    }
  }

  return recommendations;
}

/**
 * Calculate days until threshold is reached
 */
function calculateDaysToThreshold(
  currentValue: number,
  dailyGrowthPercent: number,
  threshold: number
): number {
  if (dailyGrowthPercent <= 0) return Infinity;

  const growthFactor = 1 + dailyGrowthPercent / 100;
  let days = 0;
  let value = currentValue;

  while (value < threshold && days < 365) {
    value *= growthFactor;
    days++;
  }

  return days;
}

/**
 * Get recommendations with caching
 */
let cachedRecommendations: Recommendation[] = [];
let lastAnalysisTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getRecommendations(forceRefresh: boolean = false): Promise<Recommendation[]> {
  const now = Date.now();

  if (!forceRefresh && cachedRecommendations.length > 0 && now - lastAnalysisTime < CACHE_DURATION) {
    return cachedRecommendations;
  }

  try {
    cachedRecommendations = await generateRecommendations(7);
    lastAnalysisTime = now;
    return cachedRecommendations;
  } catch (error) {
    console.error('[Recommendations] Error generating recommendations:', error);
    return cachedRecommendations; // Return cached if generation fails
  }
}

/**
 * Get recommendations by type
 */
export async function getRecommendationsByType(
  type: Recommendation['type']
): Promise<Recommendation[]> {
  const recommendations = await getRecommendations();
  return recommendations.filter((r) => r.type === type);
}

/**
 * Get critical recommendations
 */
export async function getCriticalRecommendations(): Promise<Recommendation[]> {
  const recommendations = await getRecommendations();
  return recommendations.filter((r) => r.severity === 'critical');
}

/**
 * Get recommendation stats
 */
export async function getRecommendationStats(): Promise<{
  total: number;
  critical: number;
  warning: number;
  info: number;
  byType: { [key: string]: number };
}> {
  const recommendations = await getRecommendations();

  const stats = {
    total: recommendations.length,
    critical: recommendations.filter((r) => r.severity === 'critical').length,
    warning: recommendations.filter((r) => r.severity === 'warning').length,
    info: recommendations.filter((r) => r.severity === 'info').length,
    byType: {} as { [key: string]: number },
  };

  for (const rec of recommendations) {
    stats.byType[rec.type] = (stats.byType[rec.type] || 0) + 1;
  }

  return stats;
}

/**
 * Format recommendation for display
 */
export function formatRecommendation(rec: Recommendation): {
  icon: string;
  color: string;
  formatted: Recommendation;
} {
  const icons: { [key: string]: string } = {
    peak_usage: '📈',
    trend: '📊',
    cost_optimization: '💰',
    capacity_planning: '🔧',
    performance_improvement: '⚡',
  };

  const colors: { [key: string]: string } = {
    critical: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  return {
    icon: icons[rec.type] || '💡',
    color: colors[rec.severity] || '#6b7280',
    formatted: rec,
  };
}
