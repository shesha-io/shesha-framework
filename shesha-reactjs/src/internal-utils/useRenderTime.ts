import { nanoid } from "@/utils/uuid";
import { useEffect, useRef } from "react";

type OnMeasurementLog = (measure: PerformanceMeasure) => void;

interface UseRenderTimeArgs {
  onLog: OnMeasurementLog;
}

export const useRenderTime = ({ onLog }: UseRenderTimeArgs): void => {
  const id = useRef<string>(nanoid());
  const isFirstRender = useRef<boolean>(true);

  if (isFirstRender.current) {
    isFirstRender.current = false;
    performance.mark(id.current + ":beginRender");
  }

  useEffect(() => {
    performance.mark(id.current + ":endRender");
    const measure = performance.measure(id.current, id.current + ":beginRender", id.current + ":endRender");
    onLog?.(measure);
  }, []);
};
