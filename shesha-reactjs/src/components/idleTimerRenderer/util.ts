export const MIN_TIME = 10;
export const ONE_SECOND = 1000;
export const SIXTY = 60;
export const WARNING_DURATION = 30;

export const getPercentage = (rt: number) => (rt / WARNING_DURATION) * 100;

export const getStatus = (rt: number): 'normal' | 'success' | 'exception' =>
  getPercentage(rt) >= 75 ? 'success' : getPercentage(rt) >= 45 ? 'normal' : 'exception';

export const secondsToMilliseconds = (seconds: number): number => {
  return seconds * ONE_SECOND;
};
