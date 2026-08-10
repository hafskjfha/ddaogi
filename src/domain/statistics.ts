/**
 * Returns the requested quantile using linear interpolation between sorted values.
 * An empty collection has no quantile.
 */
export function quantile(values: readonly number[], percentile: number): number | null {
  if (!Number.isFinite(percentile) || percentile < 0 || percentile > 1) {
    throw new RangeError("Percentile must be between 0 and 1.");
  }

  if (values.length === 0) {
    return null;
  }

  const sortedValues = [...values].sort((left, right) => left - right);
  const position = (sortedValues.length - 1) * percentile;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const interpolation = position - lowerIndex;

  return sortedValues[lowerIndex] + (sortedValues[upperIndex] - sortedValues[lowerIndex]) * interpolation;
}
