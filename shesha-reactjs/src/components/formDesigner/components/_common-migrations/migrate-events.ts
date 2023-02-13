import { IConfigurableActionConfiguration } from "../../../../interfaces/configurableAction";

export interface IHasDispatchEvent {
    eventName?: string;
    customEventNameToDispatch?: string;
    uniqueStateId?: string;
}
export const getDispatchEventReplacement = (eventCallerProps: IHasDispatchEvent): IConfigurableActionConfiguration => {
    const eventName = eventCallerProps?.eventName === 'CUSTOM_EVENT' && eventCallerProps?.customEventNameToDispatch
        ? eventCallerProps?.customEventNameToDispatch
        : eventCallerProps?.eventName;
    const target = eventCallerProps?.uniqueStateId;
    switch (eventName) {
        case SUB_FORM_EVENT_NAMES.getFormData: {
            return {
                actionName: 'Get form data',
                actionOwner: target,
                handleFail: false,
                handleSuccess: false,
            }
        }
        case SUB_FORM_EVENT_NAMES.postFormData: {
            return {
                actionName: 'Post form data',
                actionOwner: target,
                handleFail: false,
                handleSuccess: false,
            }
        }
        case SUB_FORM_EVENT_NAMES.updateFormData: {
            return {
                actionName: 'Update form data',
                actionOwner: target,
                handleFail: false,
                handleSuccess: false,
            }
        }
        case ListControlEvents.refreshListItems: {
            return {
                actionName: 'Refresh list items',
                actionOwner: target,
                handleFail: false,
                handleSuccess: false,
            }
        }
        case ListControlEvents.saveListItems: {
            return {
                actionName: 'Save list items',
                actionOwner: target,
                handleFail: false,
                handleSuccess: false,
            }
        }
        case ListControlEvents.addListItems: {
            return {
                actionName: 'Add list items',
                actionOwner: target,
                handleFail: false,
                handleSuccess: false,
            }
        }
    }

    return null;
}

const SUB_FORM_EVENT_NAMES = {
    getFormData: 'getFormData',
    postFormData: 'postFormData',
    updateFormData: 'updateFormData',
};
const ListControlEvents = {
    refreshListItems: 'refreshListItems',
    saveListItems: 'saveListItems',
    addListItems: 'addListItems',
};
