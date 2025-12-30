import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring and uptime checks
 * Returns 200 OK with system status information
 *
 * This endpoint can be monitored by:
 * - Vercel's built-in cron jobs (every 5 minutes)
 * - External uptime monitors (UptimeRobot, Pingdom, etc.)
 * - CI/CD health checks
 *
 * @returns {NextResponse} JSON response with health status
 */
export async function GET() {
  try {
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || 'unknown',
      checks: {
        server: 'ok',
        // Add more checks as needed (database, external APIs, etc.)
      },
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    // Log error for monitoring
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

/**
 * HEAD request support for lightweight health checks
 * Many monitoring services prefer HEAD over GET for efficiency
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
