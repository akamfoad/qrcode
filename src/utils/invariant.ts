const isProduction: boolean = process.env.NODE_ENV === 'production';
const prefix = 'Invariant failed';

export function invariant(
  condition: boolean,
  message: string,
): asserts condition {
  if (condition) return;

  if (isProduction) throw new Error(prefix);

  throw new Error(message ? `${prefix}: ${message}` : prefix);
}
