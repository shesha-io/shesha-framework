export const ONE_SECOND = 1000;
export const WARNING_DURATION = 60;

export const getPercentage = (rt: number): number => (rt / WARNING_DURATION) * 100;

export const getStatus = (rt: number): 'normal' | 'success' | 'exception' =>
  getPercentage(rt) >= 75 ? 'success' : getPercentage(rt) >= 45 ? 'normal' : 'exception';

export const secondsToMilliseconds = (seconds: number): number => {
  return seconds * ONE_SECOND;
};
