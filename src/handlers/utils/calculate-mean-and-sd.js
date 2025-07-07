/**
 * Calculates statistical measures (mean and standard deviation) from a reference range
 *
 * This function takes a numeric value and its reference range to calculate
 * statistical measures for quality control analysis. It parses reference ranges
 * in the format "min-max" and calculates the mean as the midpoint and standard
 * deviation assuming a 3-sigma distribution (99.7% of values within range).
 *
 * @function calculateStatistics
 * @param {number} value - The measured numeric value
 * @param {string} referenceRange - Reference range in format "min-max" (e.g., "70-110")
 * @returns {Object} Object containing calculated statistics
 */
const calculateStatistics = (value, referenceRange) => {
  if (!referenceRange) return { mean: value, sd: value };

  const rangeParts = referenceRange.split('-');

  if (rangeParts.length === 2) {
    const min = parseFloat(rangeParts[0]);
    const max = parseFloat(rangeParts[1]);

    if (!isNaN(min) && !isNaN(max)) {
      const mean = (min + max) / 2;
      const sd = (max - min) / 6; // Assuming 3 sigma range
      return { mean, sd };
    }
  }

  return { mean: value, sd: value };
};

module.exports = {
  calculateStatistics
};
