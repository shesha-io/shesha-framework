export const MIN_TIME = 10;
export const ONE_SECOND = 1000;
export const SIXTY = 60;

export const getPercentage = (rt: number): number => (rt / SIXTY) * 100;

export const getStatus = (rt: number): 'normal' | 'success' | 'exception' =>
  getPercentage(rt) >= 75 ? 'success' : getPercentage(rt) >= 45 ? 'normal' : 'exception';

export const getTimeFormat = (s: number): number => {
  const time = !!s && typeof s === 'number' ? s : 0;

  if (time >= ONE_SECOND * MIN_TIME) {
    return time;
  }

  return time * ONE_SECOND;
};
