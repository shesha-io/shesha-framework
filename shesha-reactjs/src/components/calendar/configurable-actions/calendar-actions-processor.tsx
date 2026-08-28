import { FC, PropsWithChildren, ReactElement } from "react";
import { useRefreshCalendarAction } from "./refresh-calendar";

export const CalendarActionsAccessor: FC<PropsWithChildren> = ({ children }: PropsWithChildren): ReactElement => {
  useRefreshCalendarAction();
  return (
    <>{children}</>
  );
};
