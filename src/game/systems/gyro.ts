/** Portrait control: roll (z) aims horizontally and pitch (x) vertically. Values are rad/s. */
export interface GyroSample { x: number; y: number; z: number; timestamp: number }
export interface Orientation { yaw: number; pitch: number }
export interface GyroCalibration { x: number; y: number; z: number; deadZone: number }
export interface GyroOptions { sensitivity: number; invertX: boolean; invertY: boolean; horizontalAxis: 'roll' | 'turn'; calibration?: GyroCalibration }
export const initialOrientation: Orientation = { yaw: 0, pitch: 0 };
const PITCH_LIMIT = Math.PI / 3;
const DEAD_ZONE = 0.025;

export function integrateGyro(
  orientation: Orientation, previous: GyroSample | null, sample: GyroSample, options: GyroOptions, motionGain = 1,
): Orientation {
  if (!previous || !Number.isFinite(sample.timestamp) || !Number.isFinite(previous.timestamp) ||
      !Number.isFinite(sample.x) || !Number.isFinite(options.horizontalAxis === 'turn' ? sample.y : sample.z)) return orientation;
  const dt = sample.timestamp - previous.timestamp;
  // Discard pauses, out-of-order samples, and resumed subscriptions.
  if (dt <= 0 || dt > 0.5) return orientation;
  const deadZone = options.calibration?.deadZone ?? DEAD_ZONE;
  const axis = (n: number) => Math.abs(n) < deadZone ? 0 : n;
  const sensitivity = Number.isFinite(options.sensitivity) ? Math.max(0, Math.min(3, options.sensitivity)) : 1;
  const gain = Number.isFinite(motionGain) ? Math.max(1, Math.min(3, motionGain)) : 1;
  const horizontal = options.horizontalAxis === 'turn' ? sample.y : sample.z;
  const yaw = orientation.yaw + axis(horizontal) * dt * sensitivity * gain * (options.invertX ? -1 : 1);
  const pitch = orientation.pitch + axis(sample.x) * dt * sensitivity * gain * (options.invertY ? -1 : 1);
  return { yaw, pitch: Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch)) };
}

/** Time-based low-pass filter, reset automatically after interrupted samples. */
export function smoothGyro(previous: GyroSample | null, sample: GyroSample): GyroSample {
  if (!previous || !Number.isFinite(sample.timestamp) || !Number.isFinite(previous.timestamp) ||
      !Number.isFinite(sample.x) || !Number.isFinite(sample.y) || !Number.isFinite(sample.z) ||
      !Number.isFinite(previous.x) || !Number.isFinite(previous.y) || !Number.isFinite(previous.z)) return sample;
  const dt = sample.timestamp - previous.timestamp;
  if (dt <= 0 || dt > 0.5) return sample;
  const alpha = 1 - Math.exp(-dt / 0.025);
  return { timestamp: sample.timestamp,
    x: previous.x + alpha * (sample.x - previous.x),
    y: previous.y + alpha * (sample.y - previous.y),
    z: previous.z + alpha * (sample.z - previous.z) };
}

/** Remove the measured stationary offset before filtering and integration. */
export function correctGyro(sample: GyroSample, calibration?: GyroCalibration): GyroSample {
  if (!calibration) return sample;
  return { ...sample, x: sample.x - calibration.x, y: sample.y - calibration.y, z: sample.z - calibration.z };
}

/** Returns null when samples are too sparse, noisy, non-finite or likely moving. */
export function calibrateGyro(samples: readonly GyroSample[]): GyroCalibration | null {
  if (samples.length < 8 || samples.some((s, i) => !Number.isFinite(s.x) || !Number.isFinite(s.y) || !Number.isFinite(s.z) || !Number.isFinite(s.timestamp) || (i > 0 && s.timestamp <= samples[i - 1].timestamp))) return null;
  if (samples[samples.length - 1].timestamp - samples[0].timestamp < 1) return null;
  const mean = (axis: 'x' | 'y' | 'z') => samples.reduce((sum, s) => sum + s[axis], 0) / samples.length;
  const x = mean('x'), y = mean('y'), z = mean('z');
  const deviation = (axis: 'x' | 'y' | 'z', avg: number) => Math.sqrt(samples.reduce((sum, s) => sum + (s[axis] - avg) ** 2, 0) / samples.length);
  const noise = Math.max(deviation('x', x), deviation('y', y), deviation('z', z));
  if (noise > 0.05 || Math.hypot(x, y, z) > 0.15) return null;
  return { x, y, z, deadZone: Math.max(0.008, Math.min(0.06, noise * 2.5)) };
}
