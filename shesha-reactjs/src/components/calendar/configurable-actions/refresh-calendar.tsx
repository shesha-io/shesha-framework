import { useLayerGroupConfigurator } from "@/providers/calendar";
import { useConfigurableAction } from "../../../providers";
import { CALENDAR_ACTIONS_OWNER, CALENDAR_CONFIGURABLE_ACTIONS } from "./model";

export const useRefreshCalendarAction = () => {
    const { setRefreshTrigger } = useLayerGroupConfigurator();

    useConfigurableAction({
        owner: CALENDAR_ACTIONS_OWNER,
        ownerUid: CALENDAR_ACTIONS_OWNER,
        name: CALENDAR_CONFIGURABLE_ACTIONS.REFRESH,
        hasArguments: false,
        executer: () => {
            setRefreshTrigger((prev)=> prev+1);
            return Promise.resolve();
        }
    }, []);
};