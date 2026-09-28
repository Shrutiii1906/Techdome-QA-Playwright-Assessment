export type LoadResult = {
  user: number;
  route: string;
  status: number;
  duration: number;
};

export type PerformanceSummary = {
  totalRequests: number;
  minimumResponseTime: number;
  averageResponseTime: number;
  maximumResponseTime: number;
  p95ResponseTime: number;
  http4xx: number;
  http5xx: number;
};


/**
 * Calculate nearest-rank percentile.
 */
export function calculatePercentile(
  values: number[],
  percentile: number
): number {

  if (values.length === 0) {
    throw new Error(
      'Cannot calculate percentile from an empty array'
    );
  }

  const sorted = [...values]
    .sort((a, b) => a - b);

  const index =
    Math.ceil(
      sorted.length * percentile
    ) - 1;

  return sorted[
    Math.max(0, index)
  ];
}


export function calculatePerformanceSummary(
  results: LoadResult[]
): PerformanceSummary {

  if (results.length === 0) {
    throw new Error(
      'No load-test results available'
    );
  }

  const durations = results.map(
    (result) => result.duration
  );

  const minimumResponseTime =
    Math.min(...durations);

  const maximumResponseTime =
    Math.max(...durations);

  const averageResponseTime =
    durations.reduce(
      (sum, duration) =>
        sum + duration,
      0
    ) / durations.length;

  const p95ResponseTime =
    calculatePercentile(
      durations,
      0.95
    );

  const http4xx =
    results.filter(
      (result) =>
        result.status >= 400 &&
        result.status < 500
    ).length;

  const http5xx =
    results.filter(
      (result) =>
        result.status >= 500
    ).length;

  return {
    totalRequests:
      results.length,

    minimumResponseTime,

    averageResponseTime,

    maximumResponseTime,

    p95ResponseTime,

    http4xx,

    http5xx,
  };
}


export function logPerformanceSummary(
  concurrentUsers: number,
  summary: PerformanceSummary
): void {

  console.log(
    '\n===== LOAD TEST SUMMARY ====='
  );

  console.table({
    concurrentUsers,

    totalRequests:
      summary.totalRequests,

    minimumResponseTime:
      `${summary.minimumResponseTime} ms`,

    averageResponseTime:
      `${summary.averageResponseTime.toFixed(2)} ms`,

    maximumResponseTime:
      `${summary.maximumResponseTime} ms`,

    p95ResponseTime:
      `${summary.p95ResponseTime} ms`,

    http4xx:
      summary.http4xx,

    http5xx:
      summary.http5xx,
  });
}