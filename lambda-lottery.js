/**
 * Multi-Tier Lottery Lambda Function
 *
 * This AWS Lambda function handles multi-tier lottery logic for time-limited events.
 * - Supports dynamic tier configuration via array parameter
 * - Tracks winners separately for AM/PM periods
 * - AM leftovers roll over to PM (one-way)
 * - Last tier is consolation prize (effectively everyone wins)
 * - Implements adaptive probability based on time and traffic
 * - Uses minute-bucket aggregation to avoid DynamoDB 400KB item size limit
 * - Uses atomic UpdateCommand with ConditionExpression to prevent race conditions
 *
 * DynamoDB Table: lottery (configurable via environment variable)
 * Primary Key: id (String) - Date in format "YYYY-MM-DD"
 * State Structure:
 *   - tierCounts: { tier1: {am, pm, total}, tier2: {...}, ... }
 *   - totalPlays: { am, pm, total }
 *   - minuteBuckets: { "12345": {plays: N, tierWins: {...}}, ... } (last 30 min only)
 *   - hourlyStats: { "9": {plays: N, tierWins: {...}}, ... }
 *
 * API Gateway: GET /play
 * Query Parameters:
 *   - tiers: JSON array of max winners per tier, e.g., "[2,4,150,9999999]"
 *            Default: [2,4,150,9999999] = [1等, 2等, 3等, 4等]
 *   - amStart: Event AM start hour in JST (default: 9)
 *   - amEnd: Event AM end / PM start hour in JST (default: 13)
 *   - pmEnd: Event PM end hour in JST (default: 17)
 *   - tier: Staff override to force specific tier (0=lose, 1-N=win that tier)
 *           Used at event booths for staff to control prize distribution
 *           Example: ?tier=1 (force 1等), ?tier=4 (force 4等)
 *
 * Staff Usage Examples:
 *   - Normal lottery: https://example.com/lottery.html
 *   - Guarantee 1等: https://example.com/lottery.html?tier=1
 *   - Guarantee 2等: https://example.com/lottery.html?tier=2
 *   - Guarantee 3等: https://example.com/lottery.html?tier=3
 *   - Guarantee 4等: https://example.com/lottery.html?tier=4
 *
 * Environment Variables:
 *   - TABLE_NAME: DynamoDB table name (default: lottery)
 *   - TIERS: Default tier configuration (default: [2,4,150,9999999])
 *   - AM_START, AM_END, PM_END: Default time boundaries
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event));

  try {
    // Parse configuration from query parameters or environment variables
    const params = event.queryStringParameters || {};

    const TABLE_NAME = process.env.TABLE_NAME || 'lottery';

    // Validate and parse tiers parameter
    let TIERS;
    try {
      TIERS = JSON.parse(params.tiers || process.env.TIERS || '[2,4,150,9999999]');
      if (!Array.isArray(TIERS) || TIERS.length === 0) {
        throw new Error('Tiers must be a non-empty array');
      }
      if (!TIERS.every(t => Number.isInteger(t) && t > 0)) {
        throw new Error('All tier values must be positive integers');
      }
    } catch (error) {
      console.error('Invalid tiers parameter:', error);
      return buildErrorResponse(new Error(`Invalid tiers parameter: ${error.message}`));
    }

    // Validate time parameters
    const AM_START = parseInt(params.amStart || process.env.AM_START || '9', 10);
    const AM_END = parseInt(params.amEnd || process.env.AM_END || '13', 10);
    const PM_END = parseInt(params.pmEnd || process.env.PM_END || '17', 10);

    if (AM_START < 0 || AM_START > 23 || AM_END < 0 || AM_END > 23 || PM_END < 0 || PM_END > 23) {
      return buildErrorResponse(new Error('Hour parameters must be between 0 and 23'));
    }
    if (AM_START >= AM_END || AM_END >= PM_END) {
      return buildErrorResponse(new Error('Invalid time range: amStart < amEnd < pmEnd required'));
    }

    // Validate force tier parameter (for staff control at event booth)
    let FORCE_TIER = null;
    if (params.tier !== undefined) {
      FORCE_TIER = parseInt(params.tier, 10);
      if (isNaN(FORCE_TIER) || FORCE_TIER < 0 || FORCE_TIER > TIERS.length) {
        return buildErrorResponse(new Error(`Invalid tier parameter: must be 0-${TIERS.length}`));
      }
      console.log(`Staff override: tier=${FORCE_TIER}`);
    }

    const NUM_TIERS = TIERS.length;
    const CONSOLATION_TIER = NUM_TIERS;

    console.log('Configuration:', { TABLE_NAME, TIERS, AM_START, AM_END, PM_END, NUM_TIERS });

    // Build tier configuration
    const TIER_CONFIG = buildTierConfig(TIERS);
    console.log('Tier config:', TIER_CONFIG);

    // Get current time in JST (UTC+9)
    const now = Date.now();
    const jstDate = new Date(now + (9 * 60 * 60 * 1000));
    const today = jstDate.toISOString().split('T')[0];
    const currentHour = jstDate.getUTCHours();
    const currentMinute = jstDate.getUTCMinutes();

    // Determine current period
    const period = getCurrentPeriod(currentHour, AM_START, AM_END, PM_END);
    if (!period) {
      return buildResponse({
        tier: 0,
        tierName: 'イベント時間外',
        period: null,
        message: 'イベント時間外です',
        remaining: {}
      });
    }

    console.log('Current time:', { hour: currentHour, minute: currentMinute, period });

    // Get current state from DynamoDB
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: today }
    }));

    let state = result.Item || {};
    if (!state.tierCounts) state.tierCounts = initializeTierCounts(NUM_TIERS);
    if (!state.totalPlays || typeof state.totalPlays !== 'object' || typeof state.totalPlays.am === 'undefined') {
      state.totalPlays = { am: 0, pm: 0, total: 0 };
    }
    if (!state.minuteBuckets) state.minuteBuckets = {};
    if (!state.hourlyStats) state.hourlyStats = {};

    console.log('Current state:', state);

    // Determine prize tier
    let wonTier;
    if (FORCE_TIER !== null) {
      wonTier = FORCE_TIER;
      // If forced tier is exhausted, cascade to the next available tier
      while (wonTier > 0 && wonTier < NUM_TIERS) {
        const available = getAvailableQuota(`tier${wonTier}`, period, state.tierCounts, TIER_CONFIG);
        if (available > 0) break;
        wonTier++;
      }
    } else {
      wonTier = determinePrize(state, period, currentHour, currentMinute, TIER_CONFIG, NUM_TIERS, AM_START, AM_END, PM_END);
    }

    console.log('Won tier:', wonTier);

    // Determine max quota for atomic condition check.
    // AM is guarded by am quota; PM is guarded by combined total quota (enables AM leftover automatically).
    let maxQuota;
    if (wonTier > 0 && wonTier <= NUM_TIERS) {
      const tierKey = `tier${wonTier}`;
      maxQuota = period === 'am' ? TIER_CONFIG[tierKey].am : TIER_CONFIG[tierKey].total;
    }

    const currentMinuteBucket = Math.floor(now / 60000).toString();

    // Ensure DynamoDB item has proper structure (idempotent — if_not_exists is safe to always run)
    try {
        await dynamodb.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id: today },
          UpdateExpression: 'SET tierCounts = if_not_exists(tierCounts, :emptyTierCounts), ' +
                          'totalPlays = if_not_exists(totalPlays, :emptyTotalPlays), ' +
                          'minuteBuckets = if_not_exists(minuteBuckets, :emptyMap), ' +
                          'hourlyStats = if_not_exists(hourlyStats, :emptyMap)',
          ExpressionAttributeValues: {
            ':emptyTierCounts': initializeTierCounts(NUM_TIERS),
            ':emptyTotalPlays': { am: 0, pm: 0, total: 0 },
            ':emptyMap': {}
          }
        }));
    } catch (error) {
      console.log('Initialization error (non-fatal):', error.message);
    }

    // Initialize bucket structures if they don't exist
    const emptyBucket = { plays: 0, tierWins: {} };
    try {
      await dynamodb.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: today },
        UpdateExpression: 'SET minuteBuckets.#bucket = if_not_exists(minuteBuckets.#bucket, :emptyBucket), ' +
                        'hourlyStats.#hour = if_not_exists(hourlyStats.#hour, :emptyBucket)',
        ExpressionAttributeNames: {
          '#bucket': currentMinuteBucket,
          '#hour': currentHour.toString()
        },
        ExpressionAttributeValues: {
          ':emptyBucket': emptyBucket
        }
      }));
    } catch (error) {
      console.log('Bucket initialization race (acceptable):', error.message);
    }

    // Build atomic update expression using SET with if_not_exists.
    // DynamoDB ADD does not support nested attribute paths.
    const expressionAttributeNames = {
      '#period': period,
      '#total': 'total',
      '#bucket': currentMinuteBucket,
      '#hour': currentHour.toString()
    };
    const expressionAttributeValues = { ':one': 1, ':zero': 0, ':now': now };

    const setExpressions = [
      'totalPlays.#period = if_not_exists(totalPlays.#period, :zero) + :one',
      'totalPlays.#total = if_not_exists(totalPlays.#total, :zero) + :one',
      'minuteBuckets.#bucket.plays = if_not_exists(minuteBuckets.#bucket.plays, :zero) + :one',
      'hourlyStats.#hour.plays = if_not_exists(hourlyStats.#hour.plays, :zero) + :one',
      'lastUpdated = :now'
    ];

    // Condition guards the total count to prevent quota overflow atomically.
    // Checking total (not period-specific count) eliminates the AM-leftover double-counting race.
    let conditionExpression = 'attribute_exists(id) OR attribute_not_exists(id)';

    if (wonTier > 0 && wonTier <= NUM_TIERS) {
      const tierKey = `tier${wonTier}`;
      expressionAttributeNames['#tierKey'] = tierKey;
      expressionAttributeNames['#tier'] = wonTier.toString();
      setExpressions.push(
        'tierCounts.#tierKey.#period = if_not_exists(tierCounts.#tierKey.#period, :zero) + :one',
        'tierCounts.#tierKey.#total = if_not_exists(tierCounts.#tierKey.#total, :zero) + :one',
        'minuteBuckets.#bucket.tierWins.#tier = if_not_exists(minuteBuckets.#bucket.tierWins.#tier, :zero) + :one',
        'hourlyStats.#hour.tierWins.#tier = if_not_exists(hourlyStats.#hour.tierWins.#tier, :zero) + :one'
      );
      expressionAttributeValues[':maxQuota'] = maxQuota;
      conditionExpression = 'attribute_not_exists(tierCounts.#tierKey.#total) OR tierCounts.#tierKey.#total < :maxQuota';
    }

    const fullUpdateExpression = 'SET ' + setExpressions.join(', ');

    // Perform atomic update
    let finalWonTier = wonTier;
    let updateSuccess = false;

    try {
      await dynamodb.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: today },
        UpdateExpression: fullUpdateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: conditionExpression
      }));

      updateSuccess = true;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        // Quota exceeded between read and update (race condition occurred)
        console.log(`Quota exceeded for tier ${wonTier} due to race condition`);

        // This is extremely rare due to adaptive probability and huge consolation quota
        // If it happens, return tier 0 (no prize)
        finalWonTier = 0;
        updateSuccess = false;

        // Still need to record the play attempt (without tier win)
        await dynamodb.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id: today },
          UpdateExpression: 'SET totalPlays.#period = if_not_exists(totalPlays.#period, :zero) + :one, ' +
                          'totalPlays.#total = if_not_exists(totalPlays.#total, :zero) + :one, ' +
                          'minuteBuckets.#bucket.plays = if_not_exists(minuteBuckets.#bucket.plays, :zero) + :one, ' +
                          'hourlyStats.#hour.plays = if_not_exists(hourlyStats.#hour.plays, :zero) + :one, ' +
                          'lastUpdated = :now',
          ExpressionAttributeNames: {
            '#period': period,
            '#total': 'total',
            '#bucket': currentMinuteBucket,
            '#hour': currentHour.toString()
          },
          ExpressionAttributeValues: {
            ':one': 1,
            ':zero': 0,
            ':now': now
          }
        }));
      } else {
        throw error; // Unexpected error, rethrow
      }
    }

    // Clean up old minute buckets (done separately to keep update expression simple)
    const thirtyMinutesAgo = Math.floor((now - 30 * 60 * 1000) / 60000);
    const bucketsToDelete = Object.keys(state.minuteBuckets || {})
      .filter(bucket => parseInt(bucket, 10) < thirtyMinutesAgo);

    if (bucketsToDelete.length > 0) {
      const removeExpression = bucketsToDelete.map((b, i) => `minuteBuckets.#oldBucket${i}`).join(', ');
      const removeNames = {};
      bucketsToDelete.forEach((b, i) => {
        removeNames[`#oldBucket${i}`] = b;
      });

      try {
        await dynamodb.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id: today },
          UpdateExpression: `REMOVE ${removeExpression}`,
          ExpressionAttributeNames: removeNames
        }));
      } catch (error) {
        console.warn('Failed to clean old buckets:', error);
        // Non-critical, continue
      }
    }

    // Read updated state for response
    const updatedResult = await dynamodb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: today }
    }));

    const updatedState = updatedResult.Item || state;

    // Calculate remaining prizes
    const remaining = calculateRemaining(updatedState.tierCounts, TIER_CONFIG, period);

    // Build response
    const tierName = finalWonTier > 0 ? TIER_CONFIG[`tier${finalWonTier}`].name : '';

    return buildResponse({
      tier: finalWonTier,
      tierName,
      period,
      message: finalWonTier > 0 ? `${tierName}に当選しました！` : '抽選結果',
      remaining,
      totalPlays: updatedState.totalPlays || {
        am: (state.totalPlays?.am || 0) + (period === 'am' ? 1 : 0),
        pm: (state.totalPlays?.pm || 0) + (period === 'pm' ? 1 : 0),
        total: (state.totalPlays?.total || 0) + 1
      },
      currentPeriod: period
    });

  } catch (error) {
    console.error('Error:', error);
    return buildErrorResponse(error, 500);
  }
};

/**
 * Build tier configuration from array
 */
function buildTierConfig(tiers) {
  const config = {};

  tiers.forEach((maxWinners, index) => {
    const tierNum = index + 1;
    config[`tier${tierNum}`] = {
      total: maxWinners,
      am: Math.floor(maxWinners / 2),
      pm: Math.ceil(maxWinners / 2),
      name: `${tierNum}等`
    };
  });

  return config;
}

/**
 * Initialize tier counts structure
 */
function initializeTierCounts(numTiers) {
  const counts = {};

  for (let i = 1; i <= numTiers; i++) {
    counts[`tier${i}`] = { am: 0, pm: 0, total: 0 };
  }

  return counts;
}

/**
 * Get current period (am, pm, or null)
 */
function getCurrentPeriod(hour, amStart, amEnd, pmEnd) {
  if (hour >= amStart && hour < amEnd) return 'am';
  if (hour >= amEnd && hour < pmEnd) return 'pm';
  return null;
}

/**
 * Determine which prize tier the user wins
 */
function determinePrize(state, period, hour, minute, tierConfig, numTiers, amStart, amEnd, pmEnd) {
  const consolationTier = numTiers;
  const premiumTierCount = numTiers - 1;

  // Calculate probabilities for premium tiers (all except last)
  const tierProbs = {};

  for (let tierNum = 1; tierNum <= premiumTierCount; tierNum++) {
    const tierKey = `tier${tierNum}`;
    const remaining = getAvailableQuota(tierKey, period, state.tierCounts, tierConfig);

    if (remaining <= 0) {
      tierProbs[tierNum] = 0;
      continue;
    }

    // Base probability: exponentially decreasing for higher tiers
    // tier1: 0.5%, tier2: 2%, tier3: 30%
    const baseProbabilities = [0.005, 0.02, 0.30];
    let baseProb = baseProbabilities[tierNum - 1] || (1 / premiumTierCount);

    // Apply adaptive adjustments
    baseProb = applyAdaptiveAdjustments(
      baseProb,
      remaining,
      hour,
      minute,
      period,
      state,
      amStart,
      amEnd,
      pmEnd
    );

    tierProbs[tierNum] = baseProb;
  }

  console.log('Tier probabilities:', tierProbs);

  // Try to win a premium tier
  const wonTier = weightedRandomSelect(tierProbs);

  if (wonTier > 0) {
    const tierKey = `tier${wonTier}`;
    const remaining = getAvailableQuota(tierKey, period, state.tierCounts, tierConfig);
    if (remaining > 0) {
      return wonTier;
    }
  }

  // Didn't win premium tier - assign consolation tier
  const consolationKey = `tier${consolationTier}`;
  const consolationRemaining = getAvailableQuota(consolationKey, period, state.tierCounts, tierConfig);

  if (consolationRemaining > 0) {
    return consolationTier;
  }

  // Extremely rare: even consolation tier exhausted
  return 0;
}

/**
 * Get available quota for a tier in current period
 * PM period gets AM leftovers added to quota
 */
function getAvailableQuota(tierKey, period, tierCounts, tierConfig) {
  const config = tierConfig[tierKey];
  const counts = tierCounts[tierKey];

  if (period === 'am') {
    return config.am - counts.am;
  }

  if (period === 'pm') {
    // PM gets its own quota + any AM leftovers
    const amLeftover = config.am - counts.am;
    const pmRemaining = config.pm - counts.pm;
    return pmRemaining + amLeftover;
  }

  return 0;
}

/**
 * Apply adaptive adjustments to probability based on time and traffic
 */
function applyAdaptiveAdjustments(baseProb, remaining, hour, minute, period, state, amStart, amEnd, pmEnd) {
  // Calculate time remaining in current period
  const periodEnd = period === 'am' ? amEnd : pmEnd;
  const periodStart = period === 'am' ? amStart : amEnd;
  const minutesLeft = ((periodEnd - hour) * 60) - minute;
  const periodDuration = (periodEnd - periodStart) * 60;
  const periodProgress = 1 - (minutesLeft / periodDuration);

  // Traffic analysis from minute buckets
  const now = Date.now();
  const minuteBuckets = state.minuteBuckets || {};

  // Count plays in last 15 minutes
  const fifteenMinutesAgo = Math.floor((now - 15 * 60 * 1000) / 60000);
  const currentMinuteBucket = Math.floor(now / 60000);

  let last15minPlays = 0;
  for (let bucket = fifteenMinutesAgo; bucket <= currentMinuteBucket; bucket++) {
    if (minuteBuckets[bucket]) {
      last15minPlays += minuteBuckets[bucket].plays;
    }
  }

  const currentRate = Math.max(last15minPlays / 15, 0.1); // plays per minute

  // Project future plays
  const projectedFuturePlays = currentRate * minutesLeft;
  const targetRate = remaining / Math.max(projectedFuturePlays, 1);

  let adjustedProb = baseProb * targetRate;

  // Urgency multiplier (last 25% of period)
  if (periodProgress > 0.75 && remaining > 0) {
    const urgency = (periodProgress - 0.75) / 0.25;
    adjustedProb *= (1 + urgency * 2); // Up to 3x boost
  }

  // Final hour guarantee
  if (minutesLeft < 60 && remaining > 0) {
    const finalProgress = 1 - (minutesLeft / 60);
    const minProb = 0.5 + (finalProgress * 0.5); // 50% → 100%
    adjustedProb = Math.max(adjustedProb, minProb);
  }

  return Math.max(0, Math.min(1, adjustedProb));
}

/**
 * Weighted random selection from probabilities
 */
function weightedRandomSelect(probabilities) {
  const rand = Math.random();
  let cumulative = 0;

  for (const [tier, prob] of Object.entries(probabilities)) {
    cumulative += prob;
    if (rand < cumulative) {
      return parseInt(tier, 10);
    }
  }

  return 0; // No tier won
}

/**
 * Calculate remaining prizes for current period
 */
function calculateRemaining(tierCounts, tierConfig, period) {
  const remaining = {};

  for (const [tierKey, config] of Object.entries(tierConfig)) {
    const counts = tierCounts[tierKey];

    if (period === 'am') {
      remaining[tierKey] = config.am - counts.am;
    } else {
      // PM: show total available (PM quota + AM leftovers)
      const amLeftover = config.am - counts.am;
      const pmRemaining = config.pm - counts.pm;
      remaining[tierKey] = pmRemaining + amLeftover;
    }
  }

  return remaining;
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
function buildErrorResponse(error, statusCode = 400) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error: statusCode === 400 ? 'Bad Request' : 'Internal server error',
      message: error.message
    })
  };
}
