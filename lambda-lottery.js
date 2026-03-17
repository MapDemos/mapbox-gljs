/**
 * Lottery Lambda Function
 *
 * This AWS Lambda function handles lottery logic for time-limited events.
 * - Tracks winner count and total plays
 * - Implements adaptive probability based on time and traffic
 * - Supports URL parameters for guaranteed wins/loses (?win=1 or ?win=0)
 * - Returns simple boolean win/lose result
 * - Configurable via query parameters or environment variables
 *
 * DynamoDB Table: lottery (default, configurable via tableName param)
 * Primary Key: id (String) - Date in format "YYYY-MM-DD"
 *
 * API Gateway: GET /play
 * Query Parameters:
 *   - win: "1" for guaranteed win, "0" for guaranteed lose
 *   - maxWinners: Maximum winners per day (default: 200)
 *   - startHour: Event start hour in JST (default: 9)
 *   - endHour: Event end hour in JST (default: 17)
 *   - tableName: DynamoDB table name (default: lottery)
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event));

  try {
    // Parse configuration from query parameters, env variables, or defaults
    // Priority: Query params > Env variables > Defaults
    const params = event.queryStringParameters || {};

    const TABLE_NAME = params.tableName || process.env.TABLE_NAME || 'lottery';
    const MAX_WINNERS = parseInt(params.maxWinners || process.env.MAX_WINNERS || '200', 10);
    const EVENT_START_HOUR = parseInt(params.startHour || process.env.EVENT_START_HOUR || '9', 10);
    const EVENT_END_HOUR = parseInt(params.endHour || process.env.EVENT_END_HOUR || '17', 10);

    console.log('Configuration:', { TABLE_NAME, MAX_WINNERS, EVENT_START_HOUR, EVENT_END_HOUR });

    // Get current time in JST (UTC+9)
    const now = Date.now();
    const jstDate = new Date(now + (9 * 60 * 60 * 1000)); // Add 9 hours for JST
    const today = jstDate.toISOString().split('T')[0]; // "2026-03-17" in JST
    const currentHour = jstDate.getUTCHours(); // Use UTC hours since we already offset
    const currentMinute = jstDate.getUTCMinutes();

    // Check for force win/lose parameters (for staff demonstrations)
    const winParam = params.win;
    const forceWin = winParam === '1';
    const forceLose = winParam === '0';

    // Get current state from DynamoDB
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: today }
    }));

    let state = result.Item || {
      id: today,
      winnerCount: 0,
      totalPlays: 0,
      recentPlays: [],
      hourlyStats: {}
    };

    console.log('Current state:', state);

    // Check if winner cap reached (unless force win for demo)
    if (state.winnerCount >= MAX_WINNERS && !forceWin) {
      return buildResponse({
        isWinner: false,
        remaining: 0,
        winnerCount: state.winnerCount,
        totalPlays: state.totalPlays,
        probability: 0,
        message: '本日の当選枠は終了しました'
      });
    }

    // Calculate probability (or use forced value)
    let probability;
    if (forceWin) {
      probability = 1.0;
    } else if (forceLose) {
      probability = 0.0;
    } else {
      probability = calculateProbability(
        state.winnerCount,
        state.totalPlays,
        state.recentPlays,
        state.hourlyStats,
        currentHour,
        currentMinute,
        EVENT_START_HOUR,
        EVENT_END_HOUR,
        MAX_WINNERS
      );
    }

    console.log('Calculated probability:', probability);

    // Determine winner
    const isWinner = forceLose ? false : (forceWin || Math.random() < probability);

    // Update state
    const newPlay = { timestamp: now, isWinner };

    // Keep only last 30 minutes of plays for traffic analysis
    const recentPlays = [...(state.recentPlays || []), newPlay]
      .filter(p => now - p.timestamp < 30 * 60 * 1000);

    // Update hourly statistics
    const hourlyStats = { ...(state.hourlyStats || {}) };
    if (!hourlyStats[currentHour]) {
      hourlyStats[currentHour] = { plays: 0, winners: 0 };
    }
    hourlyStats[currentHour].plays++;
    if (isWinner) {
      hourlyStats[currentHour].winners++;
    }

    // Write updated state to DynamoDB
    await dynamodb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        id: today,
        winnerCount: state.winnerCount + (isWinner ? 1 : 0),
        totalPlays: state.totalPlays + 1,
        recentPlays,
        hourlyStats,
        lastUpdated: now
      }
    }));

    // Calculate statistics for response
    const last15min = recentPlays.filter(p => now - p.timestamp < 15 * 60 * 1000);
    const currentRate = last15min.length / 15; // plays per minute
    const minutesRemaining = Math.max(0, ((EVENT_END_HOUR - currentHour) * 60) - currentMinute);
    const projectedTotal = state.totalPlays + 1 + (currentRate * minutesRemaining);

    // Return simple boolean result
    return buildResponse({
      isWinner,
      remaining: MAX_WINNERS - state.winnerCount - (isWinner ? 1 : 0),
      winnerCount: state.winnerCount + (isWinner ? 1 : 0),
      totalPlays: state.totalPlays + 1,
      probability: Math.round(probability * 100),
      stats: {
        currentRate: parseFloat(currentRate.toFixed(2)),
        projectedTotal: Math.round(projectedTotal),
        last15minPlays: last15min.length
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return buildErrorResponse(error);
  }
};

/**
 * Calculate adaptive probability based on multiple factors:
 * - Current time (ramps up as event progresses)
 * - Traffic patterns (recent play rate)
 * - Remaining winners vs remaining time
 * - Projected total participants
 */
function calculateProbability(winnerCount, totalPlays, recentPlays, hourlyStats, currentHour, currentMinute, EVENT_START_HOUR, EVENT_END_HOUR, MAX_WINNERS) {
  // Outside event hours
  if (currentHour < EVENT_START_HOUR) return 0.3;
  if (currentHour >= EVENT_END_HOUR) return 1.0;

  // 1. Calculate current traffic rate
  const now = Date.now();
  const last15min = (recentPlays || []).filter(p => now - p.timestamp < 15 * 60 * 1000);
  const last5min = (recentPlays || []).filter(p => now - p.timestamp < 5 * 60 * 1000);
  const last30min = (recentPlays || []).filter(p => now - p.timestamp < 30 * 60 * 1000);

  const currentRate = Math.max(last15min.length / 15, 0.1); // plays/min (minimum 0.1)
  const shortTermRate = last5min.length / 5;
  const mediumTermRate = last30min.length / 30;

  console.log('Traffic rates:', { currentRate, shortTermRate, mediumTermRate });

  // 2. Project total participants by end of day
  const minutesRemaining = ((EVENT_END_HOUR - currentHour) * 60) - currentMinute;
  const projectedFuturePlays = currentRate * minutesRemaining;
  const projectedTotal = totalPlays + projectedFuturePlays;

  console.log('Projections:', { minutesRemaining, projectedFuturePlays, projectedTotal });

  // 3. Calculate needed win rate to distribute all 200 prizes
  const remainingWins = MAX_WINNERS - winnerCount;
  const remainingPlays = Math.max(projectedFuturePlays, 1);
  let targetRate = remainingWins / remainingPlays;

  console.log('Target calculation:', { remainingWins, remainingPlays, targetRate });

  // 4. Time-based urgency (increase probability as event nears end)
  const timeProgress = ((currentHour - EVENT_START_HOUR) * 60 + currentMinute) /
                       ((EVENT_END_HOUR - EVENT_START_HOUR) * 60);

  if (timeProgress > 0.75) {
    // Last 2 hours (25% of event): ensure we distribute remaining prizes
    const urgency = (timeProgress - 0.75) / 0.25; // 0 → 1 in last quarter
    const minProb = 0.6 + (urgency * 0.4); // 60% → 100%
    targetRate = Math.max(targetRate, minProb);
    console.log('Urgency mode:', { timeProgress, urgency, minProb });
  }

  // 5. Traffic pattern adjustments
  if (shortTermRate > mediumTermRate * 1.5 && mediumTermRate > 0.5) {
    // Traffic spike detected - be conservative to avoid running out early
    targetRate *= 0.85;
    console.log('Traffic spike detected - reducing probability');
  } else if (shortTermRate < mediumTermRate * 0.5 && mediumTermRate > 0.5) {
    // Traffic dying down - be generous to ensure distribution
    targetRate *= 1.2;
    console.log('Traffic slowdown detected - increasing probability');
  }

  // 6. Low traffic emergency mode
  if (currentHour >= 15 && currentRate < 0.3 && remainingWins > 30) {
    // Very low traffic late in day with many prizes left
    targetRate = Math.max(targetRate, 0.8);
    console.log('Low traffic emergency mode activated');
  }

  // 7. Final hour guarantee
  if (currentHour >= EVENT_END_HOUR - 1) {
    const finalHourProgress = currentMinute / 60; // 0 to 1 within final hour
    const finalMinProb = 0.85 + (finalHourProgress * 0.15); // 85% → 100%
    targetRate = Math.max(targetRate, finalMinProb);
    console.log('Final hour mode:', { finalHourProgress, finalMinProb });
  }

  // 8. Apply bounds
  const boundedRate = Math.max(0.2, Math.min(1.0, targetRate));
  console.log('Final probability:', boundedRate);

  return boundedRate;
}

/**
 * Build successful response with CORS headers
 */
function buildResponse(data) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
}

/**
 * Build error response
 */
function buildErrorResponse(error) {
  return {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error: 'Internal server error',
      message: error.message
    })
  };
}
