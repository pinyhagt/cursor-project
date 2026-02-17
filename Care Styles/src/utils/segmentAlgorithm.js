// Fisher's Linear Discriminant Function Coefficients
const COEFFICIENTS = {
  segment1: {
    Q1C: 1.19039386181128,
    Q1D: 1.03649003888297,
    Q1E: 5.73080695087478,
    Q1G: 0.950006005564725,
    Q1H: 1.31397531723995,
    Q1I: 12.3204392841062,
    constant: -67.0071796306531
  },
  segment2: {
    Q1C: 1.78620928911771,
    Q1D: 1.59614399842169,
    Q1E: 4.43116102793981,
    Q1G: 1.36609926239298,
    Q1H: 1.73853547911897,
    Q1I: 10.342074596288,
    constant: -53.3533516286633
  },
  segment3: {
    Q1C: 2.35357338157844,
    Q1D: 2.21098553671086,
    Q1E: 5.79236522953596,
    Q1G: 2.43973793784768,
    Q1H: 3.05180646916346,
    Q1I: 12.4155836229025,
    constant: -89.094787981231
  },
  segment4: {
    Q1C: 2.50469315181857,
    Q1D: 2.45366871961806,
    Q1E: 5.72743514501501,
    Q1G: 0.833022711669993,
    Q1H: 1.1325747318316,
    Q1I: 12.2565135200598,
    constant: -78.485754726542
  }
}

const SEGMENT_NAMES = {
  1: 'Proactive Skeptic',
  2: 'Disengaged Health Risker',
  3: 'Uncertain Reliant',
  4: 'Proactive Reliant'
}

/**
 * Calculate segment scores using Fisher's linear discriminant functions
 * @param {Object} responses - Object with Q1C, Q1D, Q1E, Q1G, Q1H, Q1I values (1-7)
 * @returns {Object} - { segment: number, scores: Object }
 */
export function calculateSegment(responses) {
  const { Q1C, Q1D, Q1E, Q1G, Q1H, Q1I } = responses

  // Calculate score for each segment
  const score1 = 
    (Q1C * COEFFICIENTS.segment1.Q1C) +
    (Q1D * COEFFICIENTS.segment1.Q1D) +
    (Q1E * COEFFICIENTS.segment1.Q1E) +
    (Q1G * COEFFICIENTS.segment1.Q1G) +
    (Q1H * COEFFICIENTS.segment1.Q1H) +
    (Q1I * COEFFICIENTS.segment1.Q1I) +
    COEFFICIENTS.segment1.constant

  const score2 = 
    (Q1C * COEFFICIENTS.segment2.Q1C) +
    (Q1D * COEFFICIENTS.segment2.Q1D) +
    (Q1E * COEFFICIENTS.segment2.Q1E) +
    (Q1G * COEFFICIENTS.segment2.Q1G) +
    (Q1H * COEFFICIENTS.segment2.Q1H) +
    (Q1I * COEFFICIENTS.segment2.Q1I) +
    COEFFICIENTS.segment2.constant

  const score3 = 
    (Q1C * COEFFICIENTS.segment3.Q1C) +
    (Q1D * COEFFICIENTS.segment3.Q1D) +
    (Q1E * COEFFICIENTS.segment3.Q1E) +
    (Q1G * COEFFICIENTS.segment3.Q1G) +
    (Q1H * COEFFICIENTS.segment3.Q1H) +
    (Q1I * COEFFICIENTS.segment3.Q1I) +
    COEFFICIENTS.segment3.constant

  const score4 = 
    (Q1C * COEFFICIENTS.segment4.Q1C) +
    (Q1D * COEFFICIENTS.segment4.Q1D) +
    (Q1E * COEFFICIENTS.segment4.Q1E) +
    (Q1G * COEFFICIENTS.segment4.Q1G) +
    (Q1H * COEFFICIENTS.segment4.Q1H) +
    (Q1I * COEFFICIENTS.segment4.Q1I) +
    COEFFICIENTS.segment4.constant

  const scores = {
    1: score1,
    2: score2,
    3: score3,
    4: score4
  }

  // Find the segment with the highest score
  const maxScore = Math.max(score1, score2, score3, score4)
  let segment = 1
  if (maxScore === score2) segment = 2
  else if (maxScore === score3) segment = 3
  else if (maxScore === score4) segment = 4

  return {
    segment,
    segmentName: SEGMENT_NAMES[segment],
    scores
  }
}
