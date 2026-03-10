import React from "react";

const useRenderTimes = <T extends object>(props?: T, debug?: string): number => {
  // Render times
  const timesRef = React.useRef(0);
  timesRef.current += 1;

  // Props changed
  const propsRef = React.useRef(props);
  const keys: string[] = [];
  Object.keys(props || {}).map((key) => {
    if (props?.[key] !== propsRef.current?.[key]) {
      keys.push(key);
    }
  });
  propsRef.current = props;

  // Cache keys since React rerender may cause it lost
  const keysRef = React.useRef<string[]>([]);
  if (keys.length) {
    keysRef.current = keys;
  }

  React.useDebugValue(timesRef.current);
  React.useDebugValue(keysRef.current.join(', '));

  if (debug) {
    console.warn(`${debug}:`, timesRef.current, keysRef.current);
  }

  return timesRef.current;
};

export default process.env.NODE_ENV !== 'production' ? useRenderTimes : () => null;

export const RenderBlock = React.memo(() => {
  const times = useRenderTimes();
  return <strong>RT: {times}</strong>;
});

if (process.env.NODE_ENV !== 'production') {
  RenderBlock.displayName = 'RenderBlock';
}
