import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";

export interface IHasDispatchEvent {
  eventName?: string;
  customEventNameToDispatch?: string;
  uniqueStateId?: string;
}

const makeAction = (props: Pick<IConfigurableActionConfiguration, 'actionName' | 'actionOwner'>): IConfigurableActionConfiguration => {
  return {
    _type: undefined,
    actionName: props.actionName,
    actionOwner: props.actionOwner,
    handleFail: false,
    handleSuccess: false,
  };
};

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

export const getDispatchEventReplacement = (eventCallerProps: IHasDispatchEvent): IConfigurableActionConfiguration => {
  const eventName = eventCallerProps?.eventName === 'CUSTOM_EVENT' && eventCallerProps?.customEventNameToDispatch
    ? eventCallerProps?.customEventNameToDispatch
    : eventCallerProps?.eventName;
  const target = eventCallerProps?.uniqueStateId;
  switch (eventName) {
    case SUB_FORM_EVENT_NAMES.getFormData: {
      return makeAction({ actionName: 'Get form data', actionOwner: target });
    }
    case SUB_FORM_EVENT_NAMES.postFormData: {
      return makeAction({ actionName: 'Post form data', actionOwner: target });
    }
    case SUB_FORM_EVENT_NAMES.updateFormData: {
      return makeAction({ actionName: 'Update form data', actionOwner: target });
    }
    case ListControlEvents.refreshListItems: {
      return makeAction({ actionName: 'Refresh list items', actionOwner: target });
    }
    case ListControlEvents.saveListItems: {
      return makeAction({ actionName: 'Save list items', actionOwner: target });
    }
    case ListControlEvents.addListItems: {
      return makeAction({ actionName: 'Add list items', actionOwner: target });
    }
  }

  return null;
};
