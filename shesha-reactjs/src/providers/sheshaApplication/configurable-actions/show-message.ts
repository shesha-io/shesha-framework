import { App } from "antd";
import { SheshaActionOwners } from "../../configurableActionsDispatcher/models";
import { useConfigurableAction } from "@/providers/configurableActionsDispatcher";
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from "@/utils/uuid";

const messageTypes = ['info', 'success', 'error', 'warning', 'loading'] as const;
type MessageType = typeof messageTypes[number];

export interface IShowMessageArguments {
  message: string;
  // note: use internal MessageType instead of antd NoticeType to force manual update of the Shesha part after modification of antd type
  type: MessageType;
}

export const showMessageArgumentsForm = new DesignerToolbarSettings()
  .addTextArea({
    id: nanoid(),
    propertyName: 'message',
    label: 'Message',
    autoSize: true,
    validate: { required: true },
  })
  .addDropdown({
    id: nanoid(),
    propertyName: 'type',
    label: 'Type',
    values: messageTypes.map(v => ({
      label: v,
      value: v,
      id: v,
    })),
    dataSourceType: 'values',
  })
  .toJson();

export const useShowMessageAction = () => {
  const { message: messageApi } = App.useApp();

  useConfigurableAction<IShowMessageArguments, boolean>({
    owner: 'Common',
    ownerUid: SheshaActionOwners.Common,
    name: 'Show Message',
    hasArguments: true,
    argumentsFormMarkup: showMessageArgumentsForm,
    executer: (actionArgs, _context) => {
      const {
        message,
        type,
      } = actionArgs;

      messageApi.open({
        type: type,
        content: message
      });

      return Promise.resolve(true);
    }
  }, [messageApi]);
};  