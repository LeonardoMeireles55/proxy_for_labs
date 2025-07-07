/**
 * Remove null/undefined/empty values from object
 */
const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== null && value !== undefined && value !== ''
    )
  );
};

/**
 * Map OBX segment to lab result object
 */
const mapObxToLabResult = (segment) => {
  const fields = segment.split('|');
  const observationField = fields[3]?.split('^') || [];
  const unitField = fields[6]?.split('^') || [];

  return cleanObject({
    sequenceId: fields[1],
    observationName: observationField[1],
    value: fields[5],
    unit: unitField[0],
    referenceRange: fields[7],
    abnormalFlags: fields[8],
    observationTimestamp: fields[19]
  });
};

module.exports = {
  cleanObject,
  mapObxToLabResult
};
