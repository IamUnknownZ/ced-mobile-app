import type { GyroOptions } from './gyro';

export const DEFAULT_GYRO_OPTIONS: GyroOptions = { sensitivity: 1.3, invertX: false, invertY: false, horizontalAxis: 'turn' };
export const GYRO_OPTIONS_KEY = 'planet-cleaner.gyro-options.v3';
export const PREVIOUS_GYRO_OPTIONS_KEY = 'planet-cleaner.gyro-options.v2';
export const LEGACY_GYRO_OPTIONS_KEY = 'planet-cleaner.gyro-options.v1';
export function normalizeGyroOptions(value: unknown): GyroOptions {
  if (!value || typeof value !== 'object') return { ...DEFAULT_GYRO_OPTIONS };
  const settings = value as Partial<GyroOptions>;
  const calibration = settings.calibration;
  const validCalibration = calibration && ['x', 'y', 'z', 'deadZone'].every(key =>
    typeof calibration[key as keyof typeof calibration] === 'number' && Number.isFinite(calibration[key as keyof typeof calibration])) &&
    Math.hypot(calibration.x, calibration.y, calibration.z) <= 0.15 && calibration.deadZone >= 0.008 && calibration.deadZone <= 0.06;
  return {
    ...(validCalibration ? { calibration } : {}),
    sensitivity: typeof settings.sensitivity === 'number' && Number.isFinite(settings.sensitivity)
      ? Math.min(3, Math.max(0.5, settings.sensitivity)) : DEFAULT_GYRO_OPTIONS.sensitivity,
    invertX: typeof settings.invertX === 'boolean' ? settings.invertX : false,
    horizontalAxis: settings.horizontalAxis === 'roll' ? 'roll' : 'turn',
    invertY: typeof settings.invertY === 'boolean' ? settings.invertY : false,
  };
}

/** Apply the requested new baseline once, retaining axis choices from v1. */
export function migrateLegacyGyroOptions(value: unknown): GyroOptions {
  return { ...normalizeGyroOptions(value), sensitivity: DEFAULT_GYRO_OPTIONS.sensitivity };
}

/** Switch existing players to turning once, preserving their sensitivity and inversions. */
export function migratePreviousGyroOptions(value: unknown): GyroOptions {
  return { ...normalizeGyroOptions(value), horizontalAxis: 'turn' };
}
