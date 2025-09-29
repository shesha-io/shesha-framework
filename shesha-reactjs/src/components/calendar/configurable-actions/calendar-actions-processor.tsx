import React, { FC, PropsWithChildren } from "react";
import { useRefreshCalendarAction } from "./refresh-calendar";

export const CalendarActionsAccessor: FC<PropsWithChildren<{}>> = ({ children }:
    PropsWithChildren<{}>
) => {
    useRefreshCalendarAction();
    return (
        <>{children}</>
    );
};